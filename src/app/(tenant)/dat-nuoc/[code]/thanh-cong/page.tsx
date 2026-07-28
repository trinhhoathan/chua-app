import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { getOrderByCode } from '@/app/actions/orders';
import { getCurrentTemple, formatVnd } from '@/lib/tenant';
import { SavePaidOrderCode } from '@/components/water/SavePaidOrderCode';

interface Props {
  params: Promise<{ code: string }>;
}

export default async function OrderPaidSuccessPage({ params }: Props) {
  const { code } = await params;
  const [order, temple] = await Promise.all([
    getOrderByCode(code),
    getCurrentTemple(),
  ]);
  if (!order || !temple || order.temple_id !== temple.id) {
    notFound();
  }

  const paid =
    order.status === 'paid' ||
    order.status === 'shipping' ||
    order.status === 'delivered';

  if (!paid) {
    redirect(`/dat-nuoc/${encodeURIComponent(order.order_code)}/thanh-toan`);
  }

  const primary = temple.primary_color || '#7A1F1F';

  return (
    <main className="pt-24 pb-28 px-6 md:px-12">
      <SavePaidOrderCode
        orderCode={order.order_code}
        templeId={temple.id}
      />
      <div className="mx-auto max-w-xl text-center">
        <div
          className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full text-white text-2xl"
          style={{ backgroundColor: primary }}
          aria-hidden
        >
          ✓
        </div>
        <p
          className="text-[0.72rem] tracking-[0.3em] uppercase mb-2"
          style={{ color: primary }}
        >
          Thanh toán thành công
        </p>
        <h1 className="font-display text-3xl md:text-4xl text-ink">
          Cảm niệm công đức
        </h1>
        <p className="mt-4 text-muted leading-relaxed">
          Hệ thống đã nhận chuyển khoản cho mã{' '}
          <span className="font-mono text-ink">{order.order_code}</span>. Quý
          Phật tử đã phát tâm cúng dường {order.quantity} thùng Nước Thanh Tịnh
          (mức phát tâm tùy hỷ: {formatVnd(order.total_amount)}đ). Số nước này
          sẽ được đặt dâng lễ Tam Bảo và gieo duyên phát cho khách hành hương tại{' '}
          {temple.name}.
        </p>
        <p className="mt-3 text-sm text-muted">
          Mã đơn đã được lưu — quý vị có thể quay lại mục Lập lá số tử vi để mở
          khóa luận giải chi tiết 12 cung.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/phong-thuy/lap-la-so-tu-vi"
            className="inline-flex items-center justify-center px-6 py-3 text-sm font-medium text-white"
            style={{ backgroundColor: primary }}
          >
            Mở khóa luận giải 12 cung
          </Link>
          <Link
            href="/#minh-bach"
            className="inline-flex items-center justify-center px-6 py-3 text-sm font-medium border border-fog text-ink hover:bg-mist"
          >
            Xem Sổ Vàng Công Đức
          </Link>
          <Link
            href="/"
            className="inline-flex items-center justify-center px-6 py-3 text-sm font-medium border border-fog text-ink hover:bg-mist"
          >
            Về trang chủ
          </Link>
        </div>
      </div>
    </main>
  );
}
