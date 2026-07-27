import { NextResponse } from 'next/server';
import { getOrderByCode } from '@/app/actions/orders';

interface Props {
  params: Promise<{ code: string }>;
}

/** Poll trạng thái đơn — dùng cho vòng chờ thanh toán trên UI. */
export async function GET(_request: Request, { params }: Props) {
  const { code } = await params;
  const order = await getOrderByCode(code);
  if (!order) {
    return NextResponse.json({ ok: false, error: 'not_found' }, { status: 404 });
  }

  const paid =
    order.status === 'paid' ||
    order.status === 'shipping' ||
    order.status === 'delivered';

  return NextResponse.json({
    ok: true,
    order_code: order.order_code,
    status: order.status,
    paid,
    total_amount: order.total_amount,
    quantity: order.quantity,
    paid_at: order.paid_at,
  });
}
