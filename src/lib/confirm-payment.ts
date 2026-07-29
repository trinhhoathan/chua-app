import { supabase } from '@/lib/supabase';
import { sendDevoteeNotification } from '@/lib/notifications';
import { extractOrderCodeFromContent } from '@/lib/payment';

export interface ConfirmPaymentInput {
  /** Mã đơn hoặc nội dung CK chứa mã (CV-XXXXXX) */
  contentOrCode: string;
  amount?: number;
  paymentRef: string;
  /** STK nhận từ webhook — nếu có sẽ so khớp env */
  accountNumber?: string;
}

export interface ConfirmPaymentResult {
  ok: boolean;
  alreadyPaid?: boolean;
  orderCode?: string;
  error?: string;
  status?: number;
}

type WaterOrderRow = {
  id: string;
  temple_id: string;
  order_code: string;
  status: string;
  total_amount: number;
  customer_name: string;
  customer_phone: string;
};

/**
 * Xác nhận thanh toán theo mã đơn (dùng bởi SePay / webhook nội bộ).
 * Dùng anon + RPC SECURITY DEFINER (không bắt buộc service role).
 */
export async function confirmWaterOrderPayment(
  input: ConfirmPaymentInput,
): Promise<ConfirmPaymentResult> {
  const orderCode = extractOrderCodeFromContent(input.contentOrCode);
  if (!orderCode) {
    return {
      ok: false,
      error: 'Không tìm thấy mã đơn trong nội dung CK',
      status: 400,
    };
  }

  const expectedAccount = (
    process.env.COMPANY_BANK_ACCOUNT_NUMBER ?? ''
  ).replace(/\s+/g, '');
  if (
    expectedAccount &&
    input.accountNumber &&
    input.accountNumber.replace(/\s+/g, '') !== expectedAccount
  ) {
    return {
      ok: false,
      error: 'STK nhận không khớp tài khoản công ty',
      status: 400,
    };
  }

  const { data: orderRows, error: lookupErr } = await supabase.rpc(
    'get_water_order_by_code',
    { p_code: orderCode },
  );
  if (lookupErr) {
    return { ok: false, error: lookupErr.message, status: 500, orderCode };
  }

  const order = (Array.isArray(orderRows) ? orderRows[0] : orderRows) as
    | WaterOrderRow
    | undefined;

  if (!order) {
    return { ok: false, error: 'Không tìm thấy đơn', status: 404 };
  }

  if (
    order.status === 'paid' ||
    order.status === 'shipping' ||
    order.status === 'delivered'
  ) {
    return { ok: true, alreadyPaid: true, orderCode };
  }

  if (
    typeof input.amount === 'number' &&
    Number(input.amount) !== Number(order.total_amount)
  ) {
    return {
      ok: false,
      error: 'Số tiền không khớp đơn',
      status: 400,
      orderCode,
    };
  }

  const { data, error } = await supabase.rpc('mark_water_order_paid', {
    p_order_id: order.id,
    p_payment_ref: input.paymentRef,
  });

  if (error) {
    return { ok: false, error: error.message, status: 500, orderCode };
  }

  const result = data as { ok?: boolean; error?: string };
  if (!result?.ok) {
    return {
      ok: false,
      error: result?.error ?? 'Không đánh dấu được đơn',
      status: 400,
      orderCode,
    };
  }

  try {
    const { data: temple } = await supabase
      .from('temples')
      .select('name')
      .eq('id', order.temple_id)
      .maybeSingle();

    await sendDevoteeNotification({
      templeId: order.temple_id,
      recipient: order.customer_phone,
      templateKey: 'water_order_paid',
      payload: {
        customerName: order.customer_name,
        templeName: temple?.name ?? 'Chùa',
        orderCode: order.order_code,
      },
      relatedOrderId: order.id,
    });
  } catch {
    // ignore
  }

  return { ok: true, orderCode };
}
