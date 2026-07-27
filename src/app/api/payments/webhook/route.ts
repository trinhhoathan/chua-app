import { NextResponse } from 'next/server';
import { confirmWaterOrderPayment } from '@/lib/confirm-payment';

/**
 * Webhook nội bộ / tương thích cũ.
 * Body: { order_code|content, amount?, payment_ref?, secret }
 */
export async function POST(request: Request) {
  const secret = process.env.PAYMENT_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json(
      { ok: false, error: 'PAYMENT_WEBHOOK_SECRET not set' },
      { status: 503 },
    );
  }

  let body: {
    order_code?: string;
    content?: string;
    amount?: number;
    payment_ref?: string;
    secret?: string;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid JSON' }, { status: 400 });
  }

  if (body.secret !== secret) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  const raw = (body.order_code ?? body.content ?? '').trim();
  const result = await confirmWaterOrderPayment({
    contentOrCode: raw,
    amount: typeof body.amount === 'number' ? body.amount : undefined,
    paymentRef: body.payment_ref ?? `webhook-${Date.now()}`,
  });

  if (!result.ok) {
    return NextResponse.json(
      { ok: false, error: result.error },
      { status: result.status ?? 400 },
    );
  }

  return NextResponse.json({
    ok: true,
    already_paid: result.alreadyPaid ?? false,
    order_code: result.orderCode,
  });
}
