'use client';

import { useEffect, useId, useState, useTransition } from 'react';
import { updateWaterOrderDevoteeInfo } from '@/app/actions/orders';

const SKIP_KEY = (code: string) => `water_devotee_info_skip:${code}`;

interface Props {
  orderCode: string;
  primaryColor: string;
  templeName: string;
  /** Đã có địa chỉ / phường / ghi chú → không hỏi lại. */
  alreadyFilled: boolean;
}

export function PostPaymentInfoModal({
  orderCode,
  primaryColor,
  templeName,
  alreadyFilled,
}: Props) {
  const titleId = useId();
  const [open, setOpen] = useState(false);
  const [address, setAddress] = useState('');
  const [ward, setWard] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    if (alreadyFilled) return;
    try {
      if (localStorage.getItem(SKIP_KEY(orderCode))) return;
    } catch {
      // ignore
    }
    setOpen(true);
  }, [alreadyFilled, orderCode]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  function skip() {
    try {
      localStorage.setItem(SKIP_KEY(orderCode), '1');
    } catch {
      // ignore
    }
    setOpen(false);
  }

  function submit() {
    setError(null);
    startTransition(async () => {
      const res = await updateWaterOrderDevoteeInfo({
        orderCode,
        address,
        ward,
        note,
      });
      if (!res.ok) {
        setError(res.error ?? 'Không lưu được.');
        return;
      }
      try {
        localStorage.setItem(SKIP_KEY(orderCode), '1');
      } catch {
        // ignore
      }
      setSaved(true);
      window.setTimeout(() => setOpen(false), 900);
    });
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center p-0 sm:p-6">
      <button
        type="button"
        className="absolute inset-0 bg-ink/55 backdrop-blur-[2px]"
        aria-label="Đóng"
        onClick={skip}
      />
      <div
        role="dialog"
        aria-modal
        aria-labelledby={titleId}
        className="relative z-10 w-full sm:max-w-md max-h-[min(92vh,36rem)] overflow-y-auto bg-paper border border-fog shadow-[0_28px_80px_-24px_rgba(0,0,0,0.55)]"
      >
        <div
          className="px-6 pt-6 pb-4 border-b border-fog"
          style={{
            background: `linear-gradient(165deg, ${primaryColor}18, transparent 70%)`,
          }}
        >
          <p
            className="text-[0.65rem] uppercase tracking-[0.22em] mb-2"
            style={{ color: primaryColor }}
          >
            Ghi nhận danh sách
          </p>
          <h2 id={titleId} className="font-display text-2xl text-ink leading-snug">
            Thêm thông tin cho nhà chùa?
          </h2>
          <p className="mt-2 text-sm text-muted leading-relaxed">
            Không giao hàng tận nhà — nước dâng tại {templeName}. Thông tin giúp
            nhà chùa ghi sổ Phật tử (có thể bỏ qua).
          </p>
        </div>

        {saved ? (
          <div className="px-6 py-10 text-center">
            <p className="font-display text-xl text-ink">Đã ghi nhận</p>
            <p className="mt-1 text-sm text-muted">Cảm niệm công đức của quý vị.</p>
          </div>
        ) : (
          <div className="px-6 py-5 space-y-3">
            <label className="block text-xs text-muted">
              Địa chỉ / khu vực đang ở
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="mt-1 w-full px-3 py-2 bg-white border border-fog text-ink text-sm"
                placeholder="Số nhà, đường…"
                maxLength={300}
                autoComplete="street-address"
              />
            </label>
            <label className="block text-xs text-muted">
              Phường · xã
              <input
                type="text"
                value={ward}
                onChange={(e) => setWard(e.target.value)}
                className="mt-1 w-full px-3 py-2 bg-white border border-fog text-ink text-sm"
                placeholder="Phường / xã / thị trấn"
                maxLength={120}
                autoComplete="address-level2"
              />
            </label>
            <label className="block text-xs text-muted">
              Ghi chú thêm
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={2}
                className="mt-1 w-full px-3 py-2 bg-white border border-fog text-ink text-sm resize-none"
                placeholder="Hồi hướng / nguyện cầu…"
                maxLength={500}
              />
            </label>
            {error ? <p className="text-xs text-lacquer">{error}</p> : null}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={skip}
                disabled={pending}
                className="flex-1 py-3 text-sm border border-fog text-muted hover:bg-mist disabled:opacity-60"
              >
                Để sau
              </button>
              <button
                type="button"
                onClick={submit}
                disabled={pending}
                className="flex-[2] py-3 text-sm text-white disabled:opacity-60"
                style={{ backgroundColor: primaryColor }}
              >
                {pending ? 'Đang lưu…' : 'Lưu thông tin'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
