import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { getOrderByCode } from '@/app/actions/orders';
import { getCurrentTemple, formatVnd } from '@/lib/tenant';
import { getWaterBottleBrand } from '@/lib/water-bottle-brand';
import { SavePaidOrderCode } from '@/components/water/SavePaidOrderCode';
import { PostPaymentInfoModal } from '@/components/water/PostPaymentInfoModal';

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

  const brand = getWaterBottleBrand(temple);
  const primary = temple.primary_color || brand?.color || '#7A1F1F';
  const alreadyFilled = Boolean(
    order.customer_address?.trim() || order.customer_ward?.trim(),
  );

  return (
    <main className="pt-24 pb-28 px-6 md:px-12">
      <SavePaidOrderCode
        orderCode={order.order_code}
        templeId={temple.id}
      />
      <PostPaymentInfoModal
        orderCode={order.order_code}
        primaryColor={primary}
        templeName={temple.name}
        alreadyFilled={alreadyFilled}
      />
      <div className="mx-auto max-w-xl text-center">
        {brand ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={brand.mockupSrc}
            alt=""
            className="mx-auto mb-6 h-40 w-auto object-contain"
          />
        ) : (
          <div
            className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full text-white text-2xl"
            style={{ backgroundColor: primary }}
            aria-hidden
          >
            ✓
          </div>
        )}
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
          <span className="font-mono text-ink">
            {order.order_code.replace(/-/g, '')}
          </span>
          . Quý Phật tử đã phát tâm cúng dường {order.quantity} thùng Nước Thanh
          Tịnh (mức phát tâm tùy hỷ: {formatVnd(order.total_amount)}). Số nước
          này sẽ được đặt dâng lễ Tam Bảo và gieo duyên phát cho khách hành
          hương tại {temple.name}.
          {brand ? (
            <>
              {' '}
              Nhà chùa sẽ nhờ {brand.abbottHonorific} trì chú, phát tâm nguyện
              thiện lành vào nước trước khi dâng / phát.
            </>
          ) : null}
        </p>
        <p className="mt-3 text-sm text-muted">
          Mã giao dịch{' '}
          <span className="font-mono text-ink">
            {order.order_code.replace(/-/g, '')}
          </span>{' '}
          đã được lưu — dùng mã này để mở khóa luận giải 12 cung / công cụ luận giải.
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
