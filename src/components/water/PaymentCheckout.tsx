'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  POPULAR_BANK_APPS,
  buildBankPayDeeplink,
  type BankApp,
} from '@/lib/banks';
import {
  buildVietQrUrl,
  type CompanyBankAccount,
} from '@/lib/payment';

interface Props {
  orderCode: string;
  amount: number;
  quantity: number;
  unitPrice: number;
  templeName: string;
  primaryColor: string;
  bank: CompanyBankAccount;
  initialStatus?: string;
}

function formatVnd(n: number): string {
  return new Intl.NumberFormat('vi-VN').format(n);
}

function useIsMobile(): boolean {
  const [mobile, setMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 768px)');
    const apply = () => setMobile(mq.matches);
    apply();
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, []);
  return mobile;
}

export function PaymentCheckout({
  orderCode,
  amount,
  quantity,
  unitPrice,
  templeName,
  primaryColor,
  bank,
  initialStatus = 'pending_payment',
}: Props) {
  const router = useRouter();
  const isMobile = useIsMobile();
  const [selected, setSelected] = useState<BankApp | null>(null);
  const [status, setStatus] = useState(initialStatus);
  const [copied, setCopied] = useState<string | null>(null);
  const [waitingHint, setWaitingHint] = useState(false);

  const paid = useMemo(
    () =>
      status === 'paid' || status === 'shipping' || status === 'delivered',
    [status],
  );

  const qrUrl = useMemo(
    () =>
      buildVietQrUrl(bank, {
        amount,
        addInfo: orderCode,
      }),
    [bank, amount, orderCode],
  );

  const poll = useCallback(async () => {
    try {
      const res = await fetch(
        `/api/orders/${encodeURIComponent(orderCode)}/status`,
        { cache: 'no-store' },
      );
      if (!res.ok) return;
      const data = (await res.json()) as { paid?: boolean; status?: string };
      if (data.status) setStatus(data.status);
      if (data.paid) {
        router.replace(`/dat-nuoc/${encodeURIComponent(orderCode)}/thanh-cong`);
      }
    } catch {
      // ignore transient network errors
    }
  }, [orderCode, router]);

  useEffect(() => {
    if (paid) {
      router.replace(`/dat-nuoc/${encodeURIComponent(orderCode)}/thanh-cong`);
      return;
    }
    const id = window.setInterval(poll, 2500);
    const onVis = () => {
      if (document.visibilityState === 'visible') void poll();
    };
    document.addEventListener('visibilitychange', onVis);
    void poll();
    return () => {
      window.clearInterval(id);
      document.removeEventListener('visibilitychange', onVis);
    };
  }, [paid, poll, orderCode, router]);

  async function copyText(label: string, value: string) {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(label);
      window.setTimeout(() => setCopied(null), 1800);
    } catch {
      // ignore
    }
  }

  function openBankApp() {
    if (!selected || !bank.accountNumber) return;
    setWaitingHint(true);
    const url = buildBankPayDeeplink(
      selected,
      bank.accountNumber,
      bank.bankBin,
    );
    window.location.href = url;
  }

  return (
    <div className="space-y-6">
      <div className="border border-fog bg-paper p-5 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs text-muted">Nội dung chuyển khoản</p>
            <p className="font-mono text-xl tracking-widest text-ink">
              {orderCode}
            </p>
          </div>
          <button
            type="button"
            onClick={() => copyText('code', orderCode)}
            className="text-xs px-3 py-1.5 border border-fog hover:bg-mist"
          >
            {copied === 'code' ? 'Đã chép' : 'Chép mã'}
          </button>
        </div>
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs text-muted">Mức phát tâm</p>
            <p className="text-xl font-semibold text-ink">
              {formatVnd(amount)}&nbsp;đ
            </p>
            <p className="text-xs text-muted mt-0.5">
              {quantity} thùng × {formatVnd(unitPrice)}đ — {templeName}
            </p>
          </div>
          <button
            type="button"
            onClick={() => copyText('amount', String(amount))}
            className="text-xs px-3 py-1.5 border border-fog hover:bg-mist"
          >
            {copied === 'amount' ? 'Đã chép' : 'Chép mức phát tâm'}
          </button>
        </div>
        <div className="text-xs text-muted pt-1 space-y-0.5 border-t border-fog">
          <p>
            <span className="text-ink font-medium">Ngân hàng nhận: </span>
            {bank.bankName}
          </p>
          <p>
            <span className="text-ink font-medium">STK: </span>
            {bank.accountNumber}
          </p>
          <p>
            <span className="text-ink font-medium">Chủ TK: </span>
            {bank.accountHolder}
          </p>
        </div>
      </div>

      {isMobile ? (
        <div className="space-y-4">
          <div>
            <h2 className="font-display text-2xl text-ink">
              Chọn ngân hàng thanh toán
            </h2>
            <p className="mt-1 text-sm text-muted">
              Sau khi mở app, chuyển khoản đúng số tiền và nội dung{' '}
              <span className="font-mono text-ink">{orderCode}</span>. Hệ thống
              tự nhận khi tiền vào (SePay).
            </p>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-[42vh] overflow-y-auto pr-1">
            {POPULAR_BANK_APPS.map((b) => {
              const active = selected?.code === b.code;
              return (
                <button
                  key={b.code}
                  type="button"
                  onClick={() => setSelected(b)}
                  className={`flex flex-col items-center gap-1.5 p-2.5 border text-center transition-colors ${
                    active
                      ? 'border-ink bg-mist'
                      : 'border-fog bg-paper hover:border-ink/40'
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={b.logo}
                    alt={b.name}
                    className="w-9 h-9 object-contain"
                  />
                  <span className="text-[11px] text-ink leading-tight">
                    {b.name}
                  </span>
                </button>
              );
            })}
          </div>
          <button
            type="button"
            disabled={!selected}
            onClick={openBankApp}
            className="w-full py-3.5 text-sm font-medium text-white disabled:opacity-40"
            style={{ backgroundColor: primaryColor }}
          >
            {selected
              ? `Thanh toán bằng ${selected.name}`
              : 'Chọn ngân hàng để thanh toán'}
          </button>
          {waitingHint ? (
            <WaitingSpinner
              primaryColor={primaryColor}
              label="Đã mở app ngân hàng — đang chờ giao dịch thành công…"
            />
          ) : (
            <WaitingSpinner
              primaryColor={primaryColor}
              label="Đang chờ xác nhận thanh toán…"
            />
          )}
        </div>
      ) : (
        <div className="grid md:grid-cols-[1fr_1.1fr] gap-8 items-start">
          <div className="flex flex-col items-center">
            {qrUrl ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={qrUrl}
                alt="Mã QR VietQR"
                className="w-64 h-auto bg-white p-3 border border-fog"
              />
            ) : null}
            <p className="mt-3 text-xs text-muted text-center max-w-xs">
              Quét QR bằng app ngân hàng. Giữ đúng nội dung CK để hệ thống tự
              khớp đơn.
            </p>
          </div>
          <div className="flex flex-col items-center justify-center min-h-[240px] border border-fog bg-mist/50 px-6 py-10">
            <WaitingSpinner
              primaryColor={primaryColor}
              label="Đang nhận diện giao dịch…"
              large
            />
            <p className="mt-4 text-sm text-muted text-center max-w-sm leading-relaxed">
              Sau khi chuyển khoản thành công, trang sẽ tự chuyển sang xác nhận
              công đức. Không cần bấm thêm nút.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function WaitingSpinner({
  primaryColor,
  label,
  large,
}: {
  primaryColor: string;
  label: string;
  large?: boolean;
}) {
  const size = large ? 'h-14 w-14 border-[3px]' : 'h-8 w-8 border-2';
  return (
    <div className="flex flex-col items-center gap-3">
      <div
        className={`${size} rounded-full border-fog animate-spin`}
        style={{ borderTopColor: primaryColor }}
        aria-hidden
      />
      <p className="text-sm text-muted text-center">{label}</p>
    </div>
  );
}
