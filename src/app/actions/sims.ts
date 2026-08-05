'use server';

import { revalidatePath, revalidateTag } from 'next/cache';
import { supabase } from '@/lib/supabase';
import { createClient } from '@/lib/supabase/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { getCurrentDomain, getTempleByDomain } from '@/lib/tenant';
import {
  getSimWarehouseTempleId,
  isSimStoreEnabled,
} from '@/lib/sim/warehouse';
import { generateOrderCode } from '@/lib/payment';
import type { SimListing, SimOrder } from '@/types/database';

export interface CreateSimOrderInput {
  simId: string;
  customerName: string;
  customerPhone: string;
  note?: string;
  /** yyyy-mm-dd */
  birthDate?: string;
  /** HH:mm */
  birthTime?: string;
  gender?: 'nam' | 'nu';
}

export interface CreateSimOrderResult {
  ok: boolean;
  orderCode?: string;
  error?: string;
}

export async function createSimOrder(
  input: CreateSimOrderInput,
): Promise<CreateSimOrderResult> {
  const domain = await getCurrentDomain();
  const agentTemple = await getTempleByDomain(domain);
  if (!agentTemple || !isSimStoreEnabled(agentTemple)) {
    return { ok: false, error: 'Kho sim chưa mở trên website này.' };
  }

  const warehouseId = await getSimWarehouseTempleId();
  if (!warehouseId) {
    return { ok: false, error: 'Kho sim trung tâm chưa sẵn sàng.' };
  }

  const name = (input.customerName ?? '').trim();
  const phone = (input.customerPhone ?? '').trim();
  const note = (input.note ?? '').trim() || null;

  if (name.length < 2) {
    return { ok: false, error: 'Vui lòng nhập họ tên của bạn.' };
  }
  if (!/^[0-9+()\-\s]{8,15}$/.test(phone)) {
    return { ok: false, error: 'Số điện thoại liên hệ không hợp lệ.' };
  }

  const birthDate =
    input.birthDate && /^\d{4}-\d{2}-\d{2}$/.test(input.birthDate)
      ? input.birthDate
      : null;
  const birthTime =
    input.birthTime && /^\d{2}:\d{2}$/.test(input.birthTime)
      ? `${input.birthTime}:00`
      : null;
  const gender =
    input.gender === 'nam' || input.gender === 'nu' ? input.gender : null;

  const { data: simRow } = await supabase
    .from('sim_listings')
    .select('*')
    .eq('id', input.simId)
    .eq('temple_id', warehouseId)
    .maybeSingle();

  const sim = simRow as SimListing | null;
  if (!sim || sim.status === 'hidden') {
    return { ok: false, error: 'Không tìm thấy sim này trong kho.' };
  }
  if (sim.status === 'sold') {
    return {
      ok: false,
      error: 'Sim này vừa có người mua. Mời bạn chọn số khác — kho luôn có số đẹp tương đương.',
    };
  }

  const orderCode = generateOrderCode(agentTemple.payment_code);
  const hasServiceRole = Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY);
  const writer = hasServiceRole ? getSupabaseAdmin() : supabase;

  // Nguồn kho (supplier) — snapshot HH nguồn; HH đại lý tách riêng
  let sourceName: string | null = null;
  let commissionPercent: number | null = null;
  if (sim.source_id && hasServiceRole) {
    const { data: src } = await getSupabaseAdmin()
      .from('sim_sources')
      .select('name, commission_percent')
      .eq('id', sim.source_id)
      .eq('temple_id', warehouseId)
      .maybeSingle();
    if (src) {
      sourceName = String(src.name);
      commissionPercent = Number(src.commission_percent);
    }
  }

  const agentCommission = Number(agentTemple.sim_agent_commission_pct ?? 10);

  const { error: insertErr } = await writer.from('sim_orders').insert({
    order_code: orderCode,
    temple_id: agentTemple.id,
    sim_id: sim.id,
    phone: sim.phone,
    phone_display: sim.phone_display,
    price_vnd: sim.price_vnd,
    customer_name: name,
    customer_phone: phone,
    note,
    birth_date: birthDate,
    birth_time: birthTime,
    gender,
    status: 'pending_payment',
    source_id: sim.source_id ?? null,
    source_name: sourceName,
    commission_percent: commissionPercent,
    agent_commission_percent: agentCommission,
  });

  if (insertErr) {
    return { ok: false, error: `Không tạo được đơn: ${insertErr.message}` };
  }

  if (hasServiceRole && sim.status === 'available') {
    await getSupabaseAdmin()
      .from('sim_listings')
      .update({ status: 'reserved', updated_at: new Date().toISOString() })
      .eq('id', sim.id)
      .eq('status', 'available');
  }

  revalidatePath('/sim');
  revalidatePath('/quan-tri/sim');
  revalidateTag('sims', 'max');
  return { ok: true, orderCode };
}

export interface BetterSimBrief {
  phone: string;
  phoneDisplay: string;
  network: string;
  priceVnd: number;
  overallScore: number;
  element: string;
  tags: string[];
}

/**
 * Tìm các sim trong kho trung tâm có điểm cao hơn (upsell sau Bói Sim).
 */
export async function findBetterSims(
  minScore: number,
  limit = 6,
): Promise<{ sims: BetterSimBrief[]; total: number }> {
  const domain = await getCurrentDomain();
  const temple = await getTempleByDomain(domain);
  if (!temple || !isSimStoreEnabled(temple)) {
    return { sims: [], total: 0 };
  }

  const warehouseId = await getSimWarehouseTempleId();
  if (!warehouseId) return { sims: [], total: 0 };

  const threshold = Math.min(99, Math.max(0, Math.floor(minScore)));
  const { data, count } = await supabase
    .from('sim_listings')
    .select(
      'phone, phone_display, network, price_vnd, overall_score, element, tags',
      { count: 'exact' },
    )
    .eq('temple_id', warehouseId)
    .eq('status', 'available')
    .gt('overall_score', threshold)
    .order('overall_score', { ascending: false })
    .order('price_vnd', { ascending: true })
    .limit(Math.min(12, Math.max(1, limit)));

  const sims = (data ?? []).map((r) => ({
    phone: String(r.phone),
    phoneDisplay: String(r.phone_display),
    network: String(r.network),
    priceVnd: Number(r.price_vnd),
    overallScore: Number(r.overall_score),
    element: String(r.element),
    tags: Array.isArray(r.tags) ? (r.tags as string[]) : [],
  }));

  return { sims, total: count ?? sims.length };
}

export async function getSimOrderByCode(
  orderCode: string,
): Promise<SimOrder | null> {
  const code = (orderCode ?? '').trim();
  if (!code) return null;

  const client = await createClient();
  const { data, error } = await client.rpc('get_sim_order_by_code', {
    p_code: code,
  });

  if (!error && data) {
    const rows = Array.isArray(data) ? data : [data];
    if (rows.length > 0) return rows[0] as SimOrder;
    return null;
  }

  if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
    const admin = getSupabaseAdmin();
    const { data: row } = await admin
      .from('sim_orders')
      .select('*')
      .ilike('order_code', code)
      .maybeSingle();
    return (row as SimOrder) ?? null;
  }
  return null;
}
