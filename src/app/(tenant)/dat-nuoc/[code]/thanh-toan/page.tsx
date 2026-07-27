import { notFound, redirect } from 'next/navigation';
import { getOrderByCode } from '@/app/actions/orders';
import { getCurrentTemple, formatVnd } from '@/lib/tenant';
import { getCompanyBankAccount } from '@/lib/payment';
import { PaymentCheckout } from '@/components/water/PaymentCheckout';

interface Props {
  params: Promise<{ code: string }>;
}

export default async function OrderPaymentPage({ params }: Props) {
  const { code } = await params;
  const [order, temple] = await Promise.all([
    getOrderByCode(code),
    getCurrentTemple(),
  ]);
  if (!order || !temple || order.temple_id !== temple.id) {
    notFound();
  }

  if (
    order.status === 'paid' ||
    order.status === 'shipping' ||
    order.status === 'delivered'
  ) {
    redirect(`/dat-nuoc/${encodeURIComponent(order.order_code)}/thanh-cong`);
  }

  if (order.status === 'cancelled') {
    redirect(`/dat-nuoc/${encodeURIComponent(order.order_code)}`);
  }

  const primary = temple.primary_color || '#7A1F1F';
  const bank = getCompanyBankAccount();

  return (
    <main className="pt-24 pb-28 px-6 md:px-12">
      <div className="mx-auto max-w-3xl">
        <p
          className="text-[0.72rem] tracking-[0.3em] uppercase mb-2"
          style={{ color: primary }}
        >
          Hoàn tất công đức
        </p>
        <h1 className="font-display text-3xl md:text-4xl text-ink">
          Mức phát tâm {formatVnd(order.total_amount)}đ
        </h1>
        <p className="mt-2 text-sm text-muted">
          Mã <span className="font-mono text-ink">{order.order_code}</span> —
          kính mong Quý Phật tử chuyển khoản để hoàn tất phát tâm thỉnh nước.
        </p>

        <div className="mt-8">
          <PaymentCheckout
            orderCode={order.order_code}
            amount={order.total_amount}
            quantity={order.quantity}
            unitPrice={order.unit_price}
            templeName={temple.name}
            primaryColor={primary}
            bank={bank}
            initialStatus={order.status}
          />
        </div>
      </div>
    </main>
  );
}
