import Link from 'next/link';
import type { Temple } from '@/types/database';
import { formatVnd } from '@/lib/tenant';
import { getCompanyBankAccount } from '@/lib/payment';

interface Props {
  temple: Temple;
}

export function WaterDonateSection({ temple }: Props) {
  const primary = temple.primary_color || '#7A1F1F';
  const bank = getCompanyBankAccount();
  const code = temple.payment_code ?? 'XX';

  return (
    <section id="cong-duc" className="bg-paper scroll-mt-8">
      <div className="mx-auto max-w-4xl px-6 py-20 md:px-12 md:py-28 text-center">
        <div className="section-rule mx-auto mb-6" />
        <h2 className="font-display text-3xl md:text-4xl text-ink">
          Cúng dường nước thanh tịnh
        </h2>
        <p className="mt-4 text-muted max-w-xl mx-auto leading-relaxed">
          Mỗi thùng Nước Thanh Tịnh mang nhãn riêng của {temple.name}. Mức phát
          tâm tùy hỷ {formatVnd(temple.water_price_vnd)}/thùng — một giọt nước
          thanh tịnh, một duyên lành gieo vào chốn Già-lam.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-8">
          {bank.qrImageUrl ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={bank.qrImageUrl}
              alt="Mã QR VietQR công ty"
              className="w-52 h-auto bg-white p-3 shadow-sm border border-fog"
            />
          ) : (
            <div className="w-48 h-48 bg-mist border border-fog flex items-center justify-center text-xs text-muted px-4 text-center">
              Chưa cấu hình STK công ty (COMPANY_BANK_ACCOUNT_NUMBER)
            </div>
          )}
          <div className="text-left text-sm text-muted space-y-2.5 max-w-xs">
            <p className="text-ink font-medium text-xs uppercase tracking-wider">
              Tài khoản công ty (chung)
            </p>
            {bank.bankName ? (
              <p>
                <span className="text-ink font-medium">Ngân hàng: </span>
                {bank.bankName}
              </p>
            ) : null}
            {bank.accountNumber ? (
              <p>
                <span className="text-ink font-medium">STK: </span>
                {bank.accountNumber}
              </p>
            ) : null}
            {bank.accountHolder ? (
              <p>
                <span className="text-ink font-medium">Chủ TK: </span>
                {bank.accountHolder}
              </p>
            ) : null}
            <p>
              <span className="text-ink font-medium">Mã chùa: </span>
              <span className="font-mono">{code}</span>
            </p>
            <ul className="mt-3 space-y-1.5 text-xs">
              <li>
                · Nội dung CK dạng <span className="font-mono">{code}-XXXXXX</span>{' '}
                để nhận diện đúng chùa
              </li>
              <li>· Vận chuyển nước tận sân chùa, dán nhãn Quý Phật tử cúng dường</li>
              <li>· Mỗi phát tâm được ghi nhận vào Sổ Vàng Công Đức của chùa</li>
            </ul>
          </div>
        </div>

        <div className="mt-10">
          <Link
            href="/dat-nuoc"
            className="inline-flex items-center justify-center px-6 py-3 text-sm font-medium text-white"
            style={{ backgroundColor: primary }}
          >
            Phát tâm thỉnh nước →
          </Link>
        </div>
      </div>
    </section>
  );
}
