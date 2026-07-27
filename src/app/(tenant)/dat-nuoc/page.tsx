import { getCurrentTemple, formatVnd } from '@/lib/tenant';
import { getCompanyBankAccount } from '@/lib/payment';

export default async function DatNuocPage() {
  const temple = await getCurrentTemple();
  if (!temple) return null;

  const primary = temple.primary_color || '#7A1F1F';
  const bank = getCompanyBankAccount();
  const code = temple.payment_code ?? 'XX';

  return (
    <main className="pt-24 pb-16 px-6 md:px-12">
      <div className="mx-auto max-w-3xl">
        <p
          className="text-[0.72rem] tracking-[0.3em] uppercase mb-2"
          style={{ color: primary }}
        >
          Đặt nước công đức
        </p>
        <h1 className="font-display text-3xl md:text-4xl text-ink">
          Cúng dâng nước tinh khiết — {temple.name}
        </h1>
        <p className="mt-4 text-muted leading-relaxed">
          Hệ thống hỗ trợ Phật tử công đức nước tinh khiết gửi thẳng về{' '}
          {temple.name}. Giá niêm yết{' '}
          <b className="text-ink">{formatVnd(temple.water_price_vnd)}/thùng</b>.
          Chùa nhận {temple.water_profit_share_pct.toFixed(0)}% giá trị đơn —
          được ghi sổ và quyết toán hàng tháng minh bạch.
        </p>

        <div className="mt-8 grid sm:grid-cols-3 gap-3">
          {[10, 100, 1000, 5000].map((q) => (
            <div
              key={q}
              className="border border-fog p-4 flex items-baseline justify-between"
            >
              <span className="text-ink">{q} thùng</span>
              <span className="text-muted text-sm">
                {formatVnd(q * temple.water_price_vnd)}đ
              </span>
            </div>
          ))}
        </div>

        <div className="mt-10 border border-fog bg-mist/40 p-5 text-sm space-y-2">
          <p className="text-ink font-medium">
            Thanh toán về 1 tài khoản công ty
          </p>
          <p className="text-muted">
            Ngân hàng: {bank.bankName || '—'} · STK:{' '}
            {bank.accountNumber || '—'} · {bank.accountHolder || '—'}
          </p>
          <p className="text-muted">
            Nội dung CK sẽ có dạng{' '}
            <span className="font-mono text-ink">{code}-XXXXXX</span> — mã{' '}
            <span className="font-mono text-ink">{code}</span> định danh{' '}
            {temple.name} trên sao kê.
          </p>
        </div>

        <p className="mt-8 text-sm text-muted">
          Dùng thanh Cúng nước ở đáy màn hình để chọn số thùng và nhận mã đơn +
          QR.
        </p>
      </div>
    </main>
  );
}
