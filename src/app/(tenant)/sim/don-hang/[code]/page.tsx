import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getSimOrderByCode } from '@/app/actions/sims';
import { getCurrentTemple, formatVnd } from '@/lib/tenant';
import { isLyGiaPhucAnSite, LY_GIA } from '@/lib/ly-gia-phuc-an';
import { POPULAR_BANK_APPS } from '@/lib/banks';
import { SIM_ORDER_STATUS_LABELS } from '@/types/database';
import { SimPaymentCheckout } from '@/components/sim/SimPaymentCheckout';
import type { Temple } from '@/types/database';

export const metadata: Metadata = {
  title: 'Thanh toán đơn sim | Lý Gia Phúc An',
};

interface Props {
  params: Promise<{ code: string }>;
}

/** Tài khoản nhận tiền của tenant; suy BIN từ tên ngân hàng nếu thiếu. */
function resolveTenantBank(temple: Temple) {
  const accountNumber = (temple.bank_account_number ?? '').replace(/\s+/g, '');
  if (!accountNumber) return null;

  const bankName = temple.bank_name ?? '';
  let bin = (temple.bank_bin ?? '').trim();
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
    accountHolder: temple.bank_account_holder ?? '',
  };
}

export default async function SimOrderPaymentPage({ params }: Props) {
  const { code } = await params;
  const [temple, order] = await Promise.all([
    getCurrentTemple(),
    getSimOrderByCode(code),
  ]);

  if (!temple || !isLyGiaPhucAnSite(temple)) notFound();
  if (!order || order.temple_id !== temple.id) notFound();

  const primary = temple.primary_color || LY_GIA.primary;
  const bank = resolveTenantBank(temple);
  const hotline = temple.hotline || LY_GIA.phone;

  return (
    <main className="pt-24 pb-28 px-4 md:px-6">
      <div className="mx-auto max-w-3xl">
        <nav className="pb-4 text-xs text-muted">
          <Link href="/sim" className="hover:text-ink">Kho sim</Link>
          <span className="mx-1.5">/</span>
          <span className="text-ink">Đơn {order.order_code}</span>
        </nav>

        <p className="text-[0.72rem] uppercase tracking-[0.3em]" style={{ color: primary }}>
          Hoàn tất đặt sim
        </p>
        <h1 className="mt-1 font-display text-3xl text-ink md:text-4xl">
          Sim {order.phone_display} — {formatVnd(order.price_vnd)}
        </h1>
        <p className="mt-2 text-sm text-muted">
          Mã đơn <span className="font-mono text-ink">{order.order_code}</span> · Trạng
          thái: <span className="font-medium text-ink">{SIM_ORDER_STATUS_LABELS[order.status]}</span>
          {' '}· Khách: {order.customer_name}
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
              zaloUrl={LY_GIA.zaloUrl}
              hotlineDisplay={LY_GIA.phoneDisplay}
            />
          ) : (
            <div className="border border-fog bg-paper px-6 py-10 text-center">
              <p className="font-display text-2xl text-ink">
                Đơn đã ghi nhận — {order.order_code}
              </p>
              <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-muted">
                Kênh thanh toán QR đang được cập nhật. Vui lòng nhắn Zalo hoặc gọi{' '}
                <a href={`tel:${hotline}`} className="font-medium text-ink underline">
                  {LY_GIA.phoneDisplay}
                </a>{' '}
                kèm mã đơn <span className="font-mono text-ink">{order.order_code}</span>{' '}
                để thầy hướng dẫn chuyển khoản và giữ số cho bạn.
              </p>
              <a
                href={LY_GIA.zaloUrl}
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
            <p className="mt-1 leading-relaxed">
              Chuyển đúng nội dung để hệ thống khớp đơn — sim được khóa cho riêng bạn.
            </p>
          </div>
          <div className="border border-fog bg-paper p-4">
            <p className="font-medium text-ink">2. Giao sim & sang tên</p>
            <p className="mt-1 leading-relaxed">
              Giao tận nơi hoặc gửi chuyển phát; hỗ trợ đăng ký chính chủ ngay khi nhận.
            </p>
          </div>
          <div className="border border-fog bg-paper p-4">
            <p className="font-medium text-ink">3. Kích sim ngày tốt</p>
            <p className="mt-1 leading-relaxed">
              Thầy chọn ngày giờ hoàng đạo hợp tuổi để kích hoạt, khai mở cát khí dãy số.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
