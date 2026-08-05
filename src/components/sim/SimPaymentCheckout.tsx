'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { formatBankTransferClipboard } from '@/lib/banks';
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
 * Trang thanh toán đơn sim — QR SePay về TK tenant, poll trạng thái.
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
  const [status, setStatus] = useState(initialStatus);
  const [copied, setCopied] = useState<string | null>(null);
  const [qrShareBusy, setQrShareBusy] = useState(false);
  const [qrShareMsg, setQrShareMsg] = useState<string | null>(null);

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

  async function copyPayInfo() {
    if (!bank.accountNumber) return;
    try {
      await navigator.clipboard.writeText(
        formatBankTransferClipboard({
          accountNumber: bank.accountNumber,
          bankName: bank.bankName,
          accountHolder: bank.accountHolder,
          amount,
          transferContent,
        }),
      );
      setCopied('payinfo');
      window.setTimeout(() => setCopied(null), 4000);
    } catch {
      /* ignore */
    }
  }

  async function shareQr() {
    if (!qrUrl || qrShareBusy) return;
    setQrShareBusy(true);
    setQrShareMsg(null);
    try {
      const mode = await shareOrSaveVietQrImage(qrUrl, transferContent);
      setQrShareMsg(
        mode === 'shared'
          ? 'Đã mở chia sẻ — chọn «Lưu ảnh» vào Thư viện / Ảnh.'
          : 'Đã tải ảnh QR vào máy.',
      );
    } catch {
      setQrShareMsg(
        'Không lưu được ảnh tự động — hãy chụp màn hình mã QR phía trên.',
      );
    } finally {
      setQrShareBusy(false);
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
          <ol className="space-y-2 border border-fog bg-mist/30 px-3 py-3 text-[0.8rem] leading-relaxed text-ink">
            <li>
              <span className="font-semibold" style={{ color: primaryColor }}>
                1.
              </span>{' '}
              Lưu mã QR SePay (đủ STK · số tiền · nội dung).
            </li>
            <li>
              <span className="font-semibold" style={{ color: primaryColor }}>
                2.
              </span>{' '}
              Mở app NH → <span className="font-medium">Quét VietQR</span> →
              camera hoặc <span className="font-medium">Chọn ảnh</span> vừa lưu.
            </li>
            <li>
              <span className="font-semibold" style={{ color: primaryColor }}>
                3.
              </span>{' '}
              Xác nhận CK — {roleTitle.toLowerCase()} xác nhận là trang tự báo
              thành công.
            </li>
          </ol>
          <p className="border border-amber-700/20 bg-amber-50 px-3 py-2 text-[0.75rem] leading-relaxed text-amber-950/90">
            Thông tin thanh toán nằm trong{' '}
            <span className="font-medium">ảnh QR SePay</span>. Mở app rồi quét
            mã.
          </p>

          {qrUrl ? (
            <div className="flex flex-col items-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={qrUrl}
                alt="Mã QR VietQR SePay"
                className="h-auto w-64 border border-fog bg-white p-3"
              />
              <button
                type="button"
                disabled={qrShareBusy}
                onClick={() => void shareQr()}
                className="mt-3 w-full max-w-sm py-3.5 text-sm font-medium text-white disabled:opacity-40"
                style={{ backgroundColor: primaryColor }}
              >
                {qrShareBusy ? 'Đang lưu ảnh QR…' : 'Lưu mã QR vào máy'}
              </button>
              {qrShareMsg ? (
                <p className="mt-2 max-w-sm text-center text-xs text-[#1B6B3A]">
                  {qrShareMsg}
                </p>
              ) : null}
              <button
                type="button"
                onClick={() => void copyPayInfo()}
                className="mt-2 w-full max-w-sm border border-ink/20 bg-paper py-2.5 text-sm text-ink"
              >
                {copied === 'payinfo'
                  ? 'Đã chép STK · số tiền · nội dung'
                  : 'Chép thông tin CK (dự phòng)'}
              </button>
            </div>
          ) : null}
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
              Quét QR bằng app ngân hàng — số tiền và nội dung CK đã điền sẵn.
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
