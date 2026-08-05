import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getSimOrderByCode } from '@/app/actions/sims';
import { getCurrentTemple, formatVnd } from '@/lib/tenant';
import { isLyGiaPhucAnSite, LY_GIA } from '@/lib/ly-gia-phuc-an';
import {
  getSimWarehouseTemple,
  isSimStoreEnabled,
} from '@/lib/sim/warehouse';
import { POPULAR_BANK_APPS } from '@/lib/banks';
import { SIM_ORDER_STATUS_LABELS } from '@/types/database';
import { SimPaymentCheckout } from '@/components/sim/SimPaymentCheckout';

export const metadata: Metadata = {
  title: 'Thanh toán đơn sim',
};

interface Props {
  params: Promise<{ code: string }>;
}

/** Tài khoản nhận tiền — ưu tiên kho trung tâm. */
function resolveBank(opts: {
  bank_name: string | null;
  bank_account_number: string | null;
  bank_account_holder: string | null;
  bank_bin: string | null;
}) {
  const accountNumber = (opts.bank_account_number ?? '').replace(/\s+/g, '');
  if (!accountNumber) return null;

  const bankName = opts.bank_name ?? '';
  let bin = (opts.bank_bin ?? '').trim();
  if (!bin) {
    const found = POPULAR_BANK_APPS.find(
      (b) =>
        bankName.toLowerCase().includes(b.name.toLowerCase()) ||
        bankName.toUpperCase().includes(b.code),
    );
    bin = found?.bin ?? '';
  }
  if (!bin) return null;

  return {
    bankName: bankName || 'Ngân hàng',
    bankBin: bin,
    accountNumber,
    accountHolder: opts.bank_account_holder ?? '',
  };
}

export default async function SimOrderPaymentPage({ params }: Props) {
  const { code } = await params;
  const [temple, order, warehouse] = await Promise.all([
    getCurrentTemple(),
    getSimOrderByCode(code),
    getSimWarehouseTemple(),
  ]);

  if (!temple || !isSimStoreEnabled(temple)) notFound();
  if (!order || order.temple_id !== temple.id) notFound();

  const primary = temple.primary_color || LY_GIA.primary;
  const payFrom = warehouse ?? temple;
  const bank = resolveBank(payFrom);
  const isLyGia = isLyGiaPhucAnSite(temple);
  const hotline = temple.hotline || warehouse?.hotline || LY_GIA.phone;
  const hotlineDisplay = isLyGia
    ? LY_GIA.phoneDisplay
    : hotline;
  const zaloUrl = isLyGia
    ? LY_GIA.zaloUrl
    : temple.contact_links?.zalo ||
      (hotline ? `https://zalo.me/${hotline.replace(/\s+/g, '')}` : LY_GIA.zaloUrl);

  return (
    <main className="pt-24 pb-28 px-4 md:px-6">
      <div className="mx-auto max-w-3xl">
        <nav className="pb-4 text-xs text-muted">
          <Link href="/sim" className="hover:text-ink">
            Kho sim
          </Link>
          <span className="mx-1.5">/</span>
          <span className="text-ink">Đơn {order.order_code}</span>
        </nav>

        <p
          className="text-[0.72rem] uppercase tracking-[0.3em]"
          style={{ color: primary }}
        >
          Hoàn tất đặt sim
        </p>
        <h1 className="mt-1 font-display text-3xl text-ink md:text-4xl">
          Sim {order.phone_display} — {formatVnd(order.price_vnd)}
        </h1>
        <p className="mt-2 text-sm text-muted">
          Mã đơn <span className="font-mono text-ink">{order.order_code}</span> ·
          Trạng thái:{' '}
          <span className="font-medium text-ink">
            {SIM_ORDER_STATUS_LABELS[order.status]}
          </span>{' '}
          · Khách: {order.customer_name}
        </p>

        <div className="mt-8">
          {bank ? (
            <SimPaymentCheckout
              orderCode={order.order_code}
              amount={order.price_vnd}
              phoneDisplay={order.phone_display}
              primaryColor={primary}
              bank={bank}
              initialStatus={order.status}
              zaloUrl={zaloUrl}
              hotlineDisplay={hotlineDisplay}
            />
          ) : (
            <div className="border border-fog bg-paper px-6 py-10 text-center">
              <p className="font-display text-2xl text-ink">
                Đơn đã ghi nhận — {order.order_code}
              </p>
              <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-muted">
                Kênh thanh toán QR đang được cập nhật. Vui lòng nhắn Zalo hoặc gọi{' '}
                <a
                  href={`tel:${hotline.replace(/\s+/g, '')}`}
                  className="font-medium text-ink underline"
                >
                  {hotlineDisplay}
                </a>{' '}
                kèm mã đơn{' '}
                <span className="font-mono text-ink">{order.order_code}</span> để
                được hướng dẫn chuyển khoản và giữ số.
              </p>
              <a
                href={zaloUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 inline-flex px-6 py-3 text-sm font-medium text-white"
                style={{ backgroundColor: primary }}
              >
                Nhắn Zalo giữ số ngay
              </a>
            </div>
          )}
        </div>

        <div className="mt-8 grid gap-3 text-[0.78rem] text-ink/70 sm:grid-cols-3">
          <div className="border border-fog bg-paper p-4">
            <p className="font-medium text-ink">1. Chuyển khoản giữ số</p>
            <p className="mt-1">
              Quét VietQR hoặc chuyển đúng số tiền + nội dung mã đơn.
            </p>
          </div>
          <div className="border border-fog bg-paper p-4">
            <p className="font-medium text-ink">2. Xác nhận trong vài giờ</p>
            <p className="mt-1">
              Sau khi nhận tiền, bên bán xác nhận và giữ sim cho bạn.
            </p>
          </div>
          <div className="border border-fog bg-paper p-4">
            <p className="font-medium text-ink">3. Nhận sim / kích hoạt</p>
            <p className="mt-1">
              Liên hệ hướng dẫn ngày giờ kích sim hợp mệnh.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
