import { NextResponse } from 'next/server';
import { confirmWaterOrderPayment } from '@/lib/confirm-payment';

/**
 * Webhook SePay — cấu hình tại https://my.sepay.vn
 * URL: https://<domain>/api/payments/sepay
 *
 * Auth: Authorization: Apikey <SEPAY_WEBHOOK_API_KEY>
 * (hoặc bỏ trống SEPAY_WEBHOOK_API_KEY khi đang test local).
 *
 * Response bắt buộc: { "success": true }
 */
export async function POST(request: Request) {
  const configuredKey = process.env.SEPAY_WEBHOOK_API_KEY?.trim();
  if (configuredKey) {
    const auth = request.headers.get('authorization') || '';
    const ok =
      auth === `Apikey ${configuredKey}` ||
      auth === `Bearer ${configuredKey}` ||
      auth === configuredKey;
    if (!ok) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 },
      );
    }
  }

  let body: {
    id?: number | string;
    gateway?: string;
    accountNumber?: string;
    /** Số VA / tài khoản phụ (MSB bắt buộc qua VA) */
    subAccount?: string | null;
    va?: string | null;
    content?: string;
    code?: string | null;
    transferType?: string;
    transferAmount?: number;
    referenceCode?: string;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, error: 'Invalid JSON' },
      { status: 400 },
    );
  }

  if (body.transferType && body.transferType !== 'in') {
    return NextResponse.json({
      success: true,
      ignored: true,
      reason: 'not_incoming',
    });
  }

  const contentOrCode = body.code || body.content || '';
  // Ưu tiên VA (MSB) — fallback STK chính.
  const accountNumber =
    body.subAccount || body.va || body.accountNumber || undefined;
  const result = await confirmWaterOrderPayment({
    contentOrCode,
    amount:
      typeof body.transferAmount === 'number'
        ? body.transferAmount
        : undefined,
    paymentRef: `sepay-${body.id ?? body.referenceCode ?? Date.now()}`,
    accountNumber,
  });

  if (!result.ok) {
    return NextResponse.json(
      { success: false, error: result.error, order_code: result.orderCode },
      { status: result.status ?? 400 },
    );
  }

  return NextResponse.json({
    success: true,
    already_paid: result.alreadyPaid ?? false,
    order_code: result.orderCode,
  });
}
