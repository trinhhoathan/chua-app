import { NextResponse } from 'next/server';
import { getSimOrderByCode } from '@/app/actions/sims';

interface Props {
  params: Promise<{ code: string }>;
}

/** Poll trạng thái đơn sim — dùng cho vòng chờ thanh toán trên UI. */
export async function GET(_request: Request, { params }: Props) {
  const { code } = await params;
  const order = await getSimOrderByCode(code);
  if (!order) {
    return NextResponse.json({ ok: false, error: 'not_found' }, { status: 404 });
  }

  const paid =
    order.status === 'paid' ||
    order.status === 'delivering' ||
    order.status === 'completed';

  return NextResponse.json({
    ok: true,
    order_code: order.order_code,
    status: order.status,
    paid,
    price_vnd: order.price_vnd,
    paid_at: order.paid_at,
  });
}
