'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  POPULAR_BANK_APPS_MOBILE,
  openBankApp,
  type BankApp,
} from '@/lib/banks';
import {
  buildVietQrUrl,
  shareOrSaveVietQrImage,
  toVietQrTransferContent,
} from '@/lib/payment';
import {
  useAdvisorRoleTitle,
  useSitePersona,
} from '@/components/SitePersonaContext';

interface TenantBank {
  bankName: string;
  bankBin: string;
  accountNumber: string;
  accountHolder: string;
}

interface Props {
  orderCode: string;
  amount: number;
  phoneDisplay: string;
  primaryColor: string;
  bank: TenantBank;
  initialStatus: string;
  zaloUrl: string;
  hotlineDisplay: string;
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

const PAID_STATUSES = new Set(['paid', 'delivering', 'completed']);

/**
 * Thanh toán sim — QR SePay (vietqr.app); không dùng dl.vietqr.io.
 */
export function SimPaymentCheckout({
  orderCode,
  amount,
  phoneDisplay,
  primaryColor,
  bank,
  initialStatus,
  zaloUrl,
  hotlineDisplay,
}: Props) {
  const { role } = useSitePersona();
  const roleTitle = useAdvisorRoleTitle();
  const isMobile = useIsMobile();
  const [selected, setSelected] = useState<BankApp | null>(null);
  const [status, setStatus] = useState(initialStatus);
  const [copied, setCopied] = useState<string | null>(null);
  const [payBusy, setPayBusy] = useState(false);
  const [payMsg, setPayMsg] = useState<string | null>(null);
  const [readyOpenApp, setReadyOpenApp] = useState(false);

  const paid = PAID_STATUSES.has(status);
  const cancelled = status === 'cancelled';

  const transferContent = useMemo(
    () => toVietQrTransferContent(orderCode),
    [orderCode],
  );

  const qrUrl = useMemo(
    () =>
      buildVietQrUrl(
        {
          bankName: bank.bankName,
          bankBin: bank.bankBin,
          accountNumber: bank.accountNumber,
          accountHolder: bank.accountHolder,
        },
        {
          amount,
          addInfo: transferContent,
          template: 'compact',
          showInfo: true,
        },
      ),
    [bank, amount, transferContent],
  );

  const poll = useCallback(async () => {
    try {
      const res = await fetch(
        `/api/sim-orders/${encodeURIComponent(orderCode)}/status`,
        { cache: 'no-store' },
      );
      if (!res.ok) return;
      const data = (await res.json()) as { status?: string };
      if (data.status) setStatus(data.status);
    } catch {
      // bỏ qua lỗi mạng tạm thời
    }
  }, [orderCode]);

  useEffect(() => {
    if (paid || cancelled) return;
    const id = window.setInterval(poll, 4000);
    const onVis = () => {
      if (document.visibilityState === 'visible') void poll();
    };
    document.addEventListener('visibilitychange', onVis);
    void poll();
    return () => {
      window.clearInterval(id);
      document.removeEventListener('visibilitychange', onVis);
    };
  }, [paid, cancelled, poll]);

  async function copyText(label: string, value: string) {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(label);
      window.setTimeout(() => setCopied(null), 1800);
    } catch {
      // ignore
    }
  }

  async function startQuickPay() {
    if (!selected || !qrUrl || payBusy) return;
    setPayBusy(true);
    setPayMsg(null);
    setReadyOpenApp(false);
    try {
      const mode = await shareOrSaveVietQrImage(qrUrl, transferContent);
      setPayMsg(
        mode === 'shared'
          ? `Đã lưu mã QR SePay. Mở ${selected.name} → Quét VietQR → Chọn ảnh vừa lưu.`
          : `Đã tải mã QR SePay. Mở ${selected.name} → Quét VietQR → Chọn ảnh vừa lưu.`,
      );
      setReadyOpenApp(true);
    } catch {
      setPayMsg(
        'Không lưu được ảnh — hãy chụp màn hình mã QR, rồi mở app → Quét → Chọn ảnh.',
      );
      setReadyOpenApp(true);
    } finally {
      setPayBusy(false);
    }
  }

  function confirmOpenBank() {
    if (!selected) return;
    const opened = openBankApp(selected);
    if (!opened) {
      setPayMsg(
        `Hãy mở app ${selected.name} thủ công → Quét VietQR → Chọn ảnh QR vừa lưu.`,
      );
    }
  }

  if (paid) {
    return (
      <div className="border border-[#1B6B3A]/30 bg-[#1B6B3A]/5 px-6 py-10 text-center">
        <div className="mx-auto grid size-14 place-items-center rounded-full bg-[#1B6B3A] text-2xl text-white">
          ✓
        </div>
        <p className="mt-4 font-display text-2xl text-ink">
          Đã nhận thanh toán — cảm ơn bạn!
        </p>
        <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted">
          Đơn <span className="font-mono text-ink">{orderCode}</span> cho sim{' '}
          <span className="font-medium text-ink">{phoneDisplay}</span> đã được xác nhận.
          {roleTitle} sẽ liên hệ trong hôm nay để hẹn giao sim, đăng ký chính chủ và
          chọn ngày tốt kích sim.
        </p>
        <a
          href={zaloUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-5 inline-flex px-6 py-3 text-sm font-medium text-white"
          style={{ backgroundColor: primaryColor }}
        >
          Nhắn Zalo hẹn giờ nhận sim
        </a>
      </div>
    );
  }

  if (cancelled) {
    return (
      <div className="border border-fog bg-mist/50 px-6 py-10 text-center">
        <p className="font-display text-2xl text-ink">Đơn đã hủy</p>
        <p className="mx-auto mt-2 max-w-md text-sm text-muted">
          Đơn <span className="font-mono">{orderCode}</span> không còn hiệu lực. Bạn có
          thể chọn lại sim trong kho hoặc gọi {hotlineDisplay} để được hỗ trợ.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-3 border border-fog bg-paper p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs text-muted">Mã giao dịch / nội dung CK (bắt buộc)</p>
            <p className="font-mono text-xl tracking-widest text-ink">
              {transferContent}
            </p>
          </div>
          <button
            type="button"
            onClick={() => copyText('code', transferContent)}
            className="border border-fog px-3 py-1.5 text-xs hover:bg-mist"
          >
            {copied === 'code' ? 'Đã chép' : 'Chép mã'}
          </button>
        </div>
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs text-muted">Số tiền</p>
            <p className="text-xl font-semibold text-ink">{formatVnd(amount)}&nbsp;đ</p>
            <p className="mt-0.5 text-xs text-muted">Sim {phoneDisplay}</p>
          </div>
          <button
            type="button"
            onClick={() => copyText('amount', String(amount))}
            className="border border-fog px-3 py-1.5 text-xs hover:bg-mist"
          >
            {copied === 'amount' ? 'Đã chép' : 'Chép số tiền'}
          </button>
        </div>
        <div className="space-y-1.5 border-t border-fog pt-2 text-xs text-muted">
          <p>
            <span className="font-medium text-ink">Ngân hàng nhận: </span>
            {bank.bankName}
          </p>
          <div className="flex items-center justify-between gap-3">
            <p className="min-w-0">
              <span className="font-medium text-ink">STK: </span>
              {bank.accountNumber}
            </p>
            <button
              type="button"
              onClick={() => copyText('stk', bank.accountNumber)}
              className="shrink-0 whitespace-nowrap border border-fog px-3 py-1.5 text-xs text-ink hover:bg-mist"
            >
              {copied === 'stk' ? 'Đã chép' : 'Chép số tài khoản'}
            </button>
          </div>
          <p className="overflow-x-auto whitespace-nowrap">
            <span className="font-medium text-ink">Chủ TK: </span>
            {bank.accountHolder}
          </p>
        </div>
      </div>

      {isMobile ? (
        <div className="space-y-4">
          {qrUrl ? (
            <div className="flex flex-col items-center border border-fog bg-paper px-3 py-4">
              <p className="mb-2 text-center text-xs font-medium text-ink">
                Mã QR SePay (vietqr.app) — đủ STK · số tiền · nội dung
              </p>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={qrUrl}
                alt="Mã QR VietQR SePay"
                className="h-auto w-64 border border-fog bg-white p-3"
              />
            </div>
          ) : null}

          <div className="border border-fog bg-mist/40 px-3 py-3">
            <h2 className="font-display text-xl text-ink">Thanh toán nhanh</h2>
            <p className="mt-1 text-sm text-muted">
              Chọn app → lưu QR SePay → mở app →{' '}
              <span className="font-medium text-ink">Quét → Chọn ảnh</span>.{' '}
              {roleTitle} xác nhận là trang tự báo thành công.
            </p>
            <div className="mt-3 grid max-h-[36vh] grid-cols-3 gap-2 overflow-y-auto pr-1 sm:grid-cols-4">
              {POPULAR_BANK_APPS_MOBILE.map((b) => {
                const active = selected?.code === b.code;
                return (
                  <button
                    key={b.code}
                    type="button"
                    onClick={() => {
                      setSelected(b);
                      setReadyOpenApp(false);
                      setPayMsg(null);
                    }}
                    aria-label={b.name}
                    title={b.name}
                    className={`flex aspect-square items-center justify-center border p-1 transition-colors ${
                      active
                        ? 'border-ink bg-paper'
                        : 'border-ink/15 bg-paper hover:border-ink/35'
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={b.logo}
                      alt={b.name}
                      className="h-full w-full object-contain"
                    />
                  </button>
                );
              })}
            </div>

            {!readyOpenApp ? (
              <button
                type="button"
                disabled={!selected || !qrUrl || payBusy}
                onClick={() => void startQuickPay()}
                className="mt-3 w-full py-3.5 text-sm font-medium text-white disabled:opacity-40"
                style={{ backgroundColor: primaryColor }}
              >
                {!selected
                  ? 'Chọn ngân hàng để thanh toán'
                  : payBusy
                    ? 'Đang lưu mã QR SePay…'
                    : `Thanh toán bằng ${selected.name}`}
              </button>
            ) : (
              <div className="mt-3 space-y-2 border border-[#1B6B3A]/30 bg-[#1B6B3A]/5 px-3 py-3">
                {payMsg ? (
                  <p className="text-sm leading-relaxed text-ink">{payMsg}</p>
                ) : null}
                <button
                  type="button"
                  onClick={confirmOpenBank}
                  className="w-full py-3.5 text-sm font-medium text-white"
                  style={{ backgroundColor: primaryColor }}
                >
                  Mở app {selected?.name}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setReadyOpenApp(false);
                    setPayMsg(null);
                  }}
                  className="w-full py-2 text-xs text-muted underline underline-offset-2"
                >
                  Chọn lại ngân hàng
                </button>
              </div>
            )}
          </div>
          <Waiting primaryColor={primaryColor} />
        </div>
      ) : (
        <div className="grid items-start gap-8 md:grid-cols-[1fr_1.1fr]">
          <div className="flex flex-col items-center">
            {qrUrl ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={qrUrl}
                alt="Mã QR VietQR SePay"
                className="h-auto w-64 border border-fog bg-white p-3"
              />
            ) : null}
            <p className="mt-3 max-w-xs text-center text-xs text-muted">
              Quét QR SePay bằng app ngân hàng — số tiền và nội dung CK đã điền sẵn.
            </p>
          </div>
          <div className="flex min-h-[240px] flex-col items-center justify-center border border-fog bg-mist/50 px-6 py-10">
            <Waiting primaryColor={primaryColor} large />
            <p className="mt-4 max-w-sm text-center text-sm leading-relaxed text-muted">
              Sau khi bạn chuyển khoản, {role} đối chiếu và xác nhận đơn — trang sẽ tự
              chuyển sang màn thành công. Cần gấp? Nhắn Zalo kèm mã{' '}
              <span className="font-mono text-ink">{orderCode}</span>.
            </p>
            <a
              href={zaloUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 text-xs underline underline-offset-2"
              style={{ color: primaryColor }}
            >
              Gửi biên lai qua Zalo →
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

function Waiting({ primaryColor, large }: { primaryColor: string; large?: boolean }) {
  const size = large ? 'h-14 w-14 border-[3px]' : 'h-8 w-8 border-2';
  return (
    <div className="flex flex-col items-center gap-3">
      <div
        className={`${size} animate-spin rounded-full border-fog`}
        style={{ borderTopColor: primaryColor }}
        aria-hidden
      />
      <p className="text-center text-sm text-muted">Đang chờ xác nhận thanh toán…</p>
    </div>
  );
}
