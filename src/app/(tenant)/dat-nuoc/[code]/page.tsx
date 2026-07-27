import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { getOrderByCode } from '@/app/actions/orders';
import { getCurrentTemple, formatVnd } from '@/lib/tenant';

interface Props {
  params: Promise<{ code: string }>;
}

const STATUS_LABEL: Record<string, string> = {
  pending_payment: 'Chờ thanh toán',
  paid: 'Đã thanh toán',
  shipping: 'Đang giao',
  delivered: 'Đã giao',
  cancelled: 'Đã hủy',
};

export default async function OrderDetailPage({ params }: Props) {
  const { code } = await params;
  const [order, temple] = await Promise.all([
    getOrderByCode(code),
    getCurrentTemple(),
  ]);
  if (!order || !temple || order.temple_id !== temple.id) {
    notFound();
  }

  if (order.status === 'pending_payment') {
    redirect(`/dat-nuoc/${encodeURIComponent(order.order_code)}/thanh-toan`);
  }

  if (
    order.status === 'paid' ||
    order.status === 'shipping' ||
    order.status === 'delivered'
  ) {
    redirect(`/dat-nuoc/${encodeURIComponent(order.order_code)}/thanh-cong`);
  }

  const primary = temple.primary_color || '#7A1F1F';

  return (
    <main className="pt-24 pb-16 px-6 md:px-12">
      <div className="mx-auto max-w-xl">
        <p
          className="text-[0.72rem] tracking-[0.3em] uppercase mb-2"
          style={{ color: primary }}
        >
          Đơn thỉnh nước
        </p>
        <h1 className="font-display text-3xl text-ink">
          Mã đơn{' '}
          <span className="font-mono tracking-widest">{order.order_code}</span>
        </h1>
        <p className="mt-2 text-sm text-muted">
          Trạng thái:{' '}
          <b className="text-ink">{STATUS_LABEL[order.status] ?? order.status}</b>
        </p>

        <div className="mt-6 border border-fog p-5 text-sm space-y-2">
          <p>
            <span className="text-muted">Số lượng: </span>
            <span className="text-ink font-medium">{order.quantity} thùng</span>
          </p>
          <p>
            <span className="text-muted">Mức phát tâm: </span>
            <span className="text-ink font-semibold">
              {formatVnd(order.total_amount)}đ
            </span>
          </p>
          <p>
            <span className="text-muted">Quý Phật tử: </span>
            <span className="text-ink">{order.customer_name}</span>
          </p>
        </div>

        <Link
          href="/"
          className="mt-8 inline-flex text-sm underline text-muted hover:text-ink"
        >
          Về trang chủ
        </Link>
      </div>
    </main>
  );
}
