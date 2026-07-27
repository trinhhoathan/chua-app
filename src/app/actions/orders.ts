'use server';

import { revalidatePath } from 'next/cache';
import { supabase } from '@/lib/supabase';
import { createClient } from '@/lib/supabase/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { getTempleByDomain, getCurrentDomain, formatVnd } from '@/lib/tenant';
import { getSessionUser, assertTempleAccess } from '@/lib/auth';
import { sendDevoteeNotification } from '@/lib/notifications';
import { generateOrderCode } from '@/lib/payment';
import type { WaterOrder } from '@/types/database';

export interface CreateOrderInput {
  quantity: number;
  customerName: string;
  customerPhone: string;
  note?: string;
}

export interface CreateOrderResult {
  ok: boolean;
  orderCode?: string;
  error?: string;
}

export async function createWaterOrder(
  input: CreateOrderInput,
): Promise<CreateOrderResult> {
  const domain = await getCurrentDomain();
  const temple = await getTempleByDomain(domain);
  if (!temple) {
    return { ok: false, error: 'Không tìm thấy chùa cho tên miền hiện tại.' };
  }

  const quantity = Math.floor(Number(input.quantity));
  const name = (input.customerName ?? '').trim();
  const phone = (input.customerPhone ?? '').trim();
  const note = (input.note ?? '').trim() || null;

  if (!quantity || quantity < 10 || quantity > 100000) {
    return { ok: false, error: 'Số lượng tối thiểu là 10 thùng (để thuận tiện vận chuyển về chùa).' };
  }
  if (name.length < 2) {
    return { ok: false, error: 'Vui lòng nhập họ tên Phật tử.' };
  }
  if (!/^[0-9+()\-\s]{8,15}$/.test(phone)) {
    return { ok: false, error: 'Số điện thoại không hợp lệ.' };
  }

  const unitPrice = temple.water_price_vnd;
  const totalAmount = quantity * unitPrice;
  const pct = temple.water_profit_share_pct;
  const templeShare = Math.round((totalAmount * pct) / 100);
  const platformShare = totalAmount - templeShare;
  const orderCode = generateOrderCode(temple.payment_code);

  const { error } = await supabase.from('water_orders').insert({
    order_code: orderCode,
    temple_id: temple.id,
    customer_name: name,
    customer_phone: phone,
    note,
    quantity,
    unit_price: unitPrice,
    total_amount: totalAmount,
    temple_share_amount: templeShare,
    platform_share_amount: platformShare,
    profit_share_pct: pct,
    status: 'pending_payment',
  });

  if (error) {
    return { ok: false, error: `Không tạo được đơn: ${error.message}` };
  }

  // Fire-and-forget thank-you (log / Zalo / SMS).
  try {
    if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
      await sendDevoteeNotification({
        templeId: temple.id,
        recipient: phone,
        templateKey: 'water_order_created',
        payload: {
          customerName: name,
          templeName: temple.name,
          orderCode,
          quantity,
          totalAmount: formatVnd(totalAmount),
        },
        preferredChannel: process.env.ZALO_OA_ACCESS_TOKEN ? 'zalo' : 'log',
      });
    }
  } catch {
    // Never block order creation on notification failure.
  }

  revalidatePath('/quan-tri');
  revalidatePath('/quan-tri/doi-soat');
  return { ok: true, orderCode };
}

export async function getOrderByCode(
  orderCode: string,
): Promise<WaterOrder | null> {
  const client = await createClient();
  const { data, error } = await client.rpc('get_water_order_by_code', {
    p_code: orderCode,
  });
  if (error) {
    // Fallback: service role if RPC unavailable.
    if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const admin = getSupabaseAdmin();
      const { data: row } = await admin
        .from('water_orders')
        .select('*')
        .eq('order_code', orderCode.toUpperCase())
        .maybeSingle();
      return (row as WaterOrder) ?? null;
    }
    return null;
  }
  const row = Array.isArray(data) ? data[0] : data;
  return (row as WaterOrder) ?? null;
}

export interface MarkPaidInput {
  orderId: string;
  paymentRef?: string;
  /** Legacy ADMIN_KEY — optional when caller is authenticated temple admin. */
  adminKey?: string;
}

export async function markOrderPaid(
  input: MarkPaidInput,
): Promise<{ ok: boolean; error?: string }> {
  const user = await getSessionUser();
  const configuredKey = process.env.ADMIN_KEY;
  const keyOk =
    !!configuredKey && !!input.adminKey && input.adminKey === configuredKey;

  if (!user && !keyOk) {
    return { ok: false, error: 'Chưa đăng nhập hoặc sai khóa quản trị.' };
  }

  // Prefer atomic RPC.
  const client = user ? await createClient() : null;
  if (client) {
    // Need temple access — fetch order temple_id first via RPC/select
    const { data: orderPeek } = await client
      .from('water_orders')
      .select('temple_id')
      .eq('id', input.orderId)
      .maybeSingle();
    if (orderPeek?.temple_id) {
      try {
        await assertTempleAccess(orderPeek.temple_id);
      } catch {
        return { ok: false, error: 'Không có quyền với chùa này.' };
      }
    }

    const { data, error } = await client.rpc('mark_water_order_paid', {
      p_order_id: input.orderId,
      p_payment_ref: input.paymentRef ?? null,
    });
    if (error) {
      return { ok: false, error: error.message };
    }
    const result = data as { ok?: boolean; error?: string };
    if (!result?.ok) {
      return { ok: false, error: result?.error ?? 'Không cập nhật được đơn.' };
    }
  } else if (keyOk && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    const admin = getSupabaseAdmin();
    const { data, error } = await admin.rpc('mark_water_order_paid', {
      p_order_id: input.orderId,
      p_payment_ref: input.paymentRef ?? null,
    });
    if (error) return { ok: false, error: error.message };
    const result = data as { ok?: boolean; error?: string };
    if (!result?.ok) {
      return { ok: false, error: result?.error ?? 'Không cập nhật được đơn.' };
    }
  } else {
    return {
      ok: false,
      error: 'Thiếu SUPABASE_SERVICE_ROLE_KEY hoặc phiên đăng nhập.',
    };
  }

  // Thank-you on paid.
  try {
    if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const admin = getSupabaseAdmin();
      const { data: order } = await admin
        .from('water_orders')
        .select('*, temples(name)')
        .eq('id', input.orderId)
        .maybeSingle();
      if (order) {
        await sendDevoteeNotification({
          templeId: order.temple_id,
          recipient: order.customer_phone,
          templateKey: 'water_order_paid',
          payload: {
            customerName: order.customer_name,
            templeName:
              (order as { temples?: { name?: string } }).temples?.name ?? 'Chùa',
            orderCode: order.order_code,
          },
          relatedOrderId: order.id,
        });
      }
    }
  } catch {
    // ignore
  }

  revalidatePath('/quan-tri');
  revalidatePath('/quan-tri/doi-soat');
  revalidatePath('/quan-tri/don-hang');
  return { ok: true };
}
