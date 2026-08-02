'use client';

import { useState, useTransition, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createWaterOrder } from '@/app/actions/orders';
import {
  OPEN_WATER_DONATE_EVENT,
  WATER_BAR_PULSE_EVENT,
} from '@/lib/water-merit-prompt';

interface Props {
  primaryColor: string;
  unitPrice: number;
  templeName: string;
}

const QUICK_QTY = [1, 5, 10, 50, 100];
const MIN_QTY = 1;
const MAX_QTY = 100000;

function formatVnd(n: number): string {
  return new Intl.NumberFormat('vi-VN').format(n);
}

export function WaterStickyBar({
  primaryColor,
  unitPrice,
  templeName,
}: Props) {
  const router = useRouter();
  const [qty, setQty] = useState(MIN_QTY);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [pulse, setPulse] = useState(false);

  const total = useMemo(() => qty * unitPrice, [qty, unitPrice]);

  useEffect(() => {
    function onOpen(e: Event) {
      const detail = (e as CustomEvent<{ note?: string; qty?: number }>).detail;
      if (detail?.qty && detail.qty >= MIN_QTY) {
        setQty(Math.min(MAX_QTY, detail.qty));
      }
      if (detail?.note) setNote(detail.note);
      setOpen(true);
      setPulse(true);
      window.setTimeout(() => setPulse(false), 2200);
    }
    function onPulse() {
      setPulse(true);
      window.setTimeout(() => setPulse(false), 2200);
    }
    window.addEventListener(OPEN_WATER_DONATE_EVENT, onOpen);
    window.addEventListener(WATER_BAR_PULSE_EVENT, onPulse);
    return () => {
      window.removeEventListener(OPEN_WATER_DONATE_EVENT, onOpen);
      window.removeEventListener(WATER_BAR_PULSE_EVENT, onPulse);
    };
  }, []);

  function submit() {
    setError(null);
    startTransition(async () => {
      const res = await createWaterOrder({
        quantity: qty,
        customerName: name,
        customerPhone: phone,
        note,
      });
      if (!res.ok || !res.orderCode) {
        setError(res.error ?? 'Có lỗi xảy ra.');
        return;
      }
      setOpen(false);
      setName('');
      setPhone('');
      setNote('');
      router.push(
        `/dat-nuoc/${encodeURIComponent(res.orderCode)}/thanh-toan`,
      );
    });
  }

  return (
    <>
      {/* Desktop / tablet sticky bar — ẩn trên mobile */}
      <div
        className={`hidden md:block fixed bottom-0 inset-x-0 z-50 border-t border-white/10 bg-ink/95 backdrop-blur-md shadow-[0_-12px_40px_rgba(0,0,0,0.35)] transition-shadow ${
          pulse ? 'water-bar-pulse' : ''
        }`}
      >
        <div className="mx-auto max-w-[52rem] px-5 py-3">
          <div className="flex flex-row items-stretch gap-3">
            <div className="min-w-0 flex-1 rounded-md bg-white/[0.06] ring-1 ring-white/10 px-3 py-2">
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
                <span className="shrink-0 text-[10px] tracking-[0.2em] uppercase text-white/45">
                  Thỉnh nước
                </span>
                {QUICK_QTY.map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => setQty(q)}
                    className={`shrink-0 text-xs px-2.5 py-1.5 rounded-sm border transition-colors ${
                      qty === q
                        ? 'text-ink bg-white border-white shadow-sm'
                        : 'text-white/80 border-white/20 hover:border-white/50 hover:bg-white/5'
                    }`}
                  >
                    {q}
                  </button>
                ))}
                <input
                  type="number"
                  min={MIN_QTY}
                  max={MAX_QTY}
                  value={qty}
                  onChange={(e) =>
                    setQty(
                      Math.max(
                        MIN_QTY,
                        Math.min(MAX_QTY, Number(e.target.value) || MIN_QTY),
                      ),
                    )
                  }
                  className="shrink-0 w-14 text-xs px-2 py-1.5 rounded-sm bg-white/5 border border-white/20 text-white text-center"
                  aria-label="Số thùng"
                />
                <span className="shrink-0 text-[11px] text-white/45">thùng</span>
              </div>
            </div>

            <div className="flex items-stretch gap-2.5 shrink-0">
              <div className="flex w-[9.5rem] flex-col justify-center rounded-md bg-white/[0.06] ring-1 ring-white/10 px-3 py-2">
                <p className="text-[10px] uppercase tracking-wider text-white/45 leading-none">
                  Mức phát tâm
                </p>
                <p className="mt-1 font-semibold text-white text-base leading-none tabular-nums">
                  {formatVnd(total)}&nbsp;đ
                </p>
                <p className="mt-1 text-[10px] text-white/40 leading-none">
                  {formatVnd(unitPrice)}đ/thùng
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(true)}
                className="min-w-[11.5rem] rounded-md px-4 py-2.5 text-sm font-semibold text-white shadow-[0_6px_20px_rgba(0,0,0,0.28)] transition-[filter,transform] hover:brightness-110 active:scale-[0.98]"
                style={{ backgroundColor: primaryColor }}
              >
                <span className="block leading-tight">Phát tâm thỉnh nước</span>
                <span className="mt-0.5 block text-[10px] font-medium text-white/80">
                  {qty} thùng · tiếp tục
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {open ? (
        <div className="fixed inset-0 z-[60] bg-ink/60 backdrop-blur-sm flex items-end sm:items-center justify-center">
          <div className="bg-paper text-ink w-full sm:max-w-md sm:rounded-md max-h-[92vh] overflow-y-auto">
            <div className="p-6">
              <p
                className="text-[0.7rem] tracking-[0.3em] uppercase mb-2"
                style={{ color: primaryColor }}
              >
                Cúng dường nước thanh tịnh
              </p>
              <h3 className="font-display text-2xl">
                {qty} thùng — mức phát tâm {formatVnd(total)}&nbsp;đ
              </h3>
              <p className="mt-1 text-xs text-muted">
                Quý Phật tử phát tâm thỉnh nước tinh khiết dâng {templeName} —
                ghi nhận vào Sổ Vàng Công Đức.
              </p>
              <div className="mt-5 space-y-3">
                <label className="block text-xs text-muted">
                  Số thùng
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {QUICK_QTY.map((q) => (
                      <button
                        key={q}
                        type="button"
                        onClick={() => setQty(q)}
                        className={`min-w-[3.25rem] text-xs px-2.5 py-1.5 border transition-colors ${
                          qty === q
                            ? 'border-ink text-ink bg-mist'
                            : 'border-fog text-muted hover:border-ink/40 hover:text-ink'
                        }`}
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                  <input
                    type="number"
                    min={MIN_QTY}
                    max={MAX_QTY}
                    value={qty}
                    onChange={(e) =>
                      setQty(
                        Math.max(
                          MIN_QTY,
                          Math.min(MAX_QTY, Number(e.target.value) || MIN_QTY),
                        ),
                      )
                    }
                    className="mt-1 w-full px-3 py-2 bg-white border border-fog text-ink"
                  />
                  <span className="text-[10px] text-muted">
                    Tối thiểu {MIN_QTY} thùng (24 chai nước)
                  </span>
                </label>
                <label className="block text-xs text-muted">
                  Họ tên Phật tử
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="mt-1 w-full px-3 py-2 bg-white border border-fog text-ink"
                    placeholder="Nguyễn Văn A"
                  />
                </label>
                <label className="block text-xs text-muted">
                  Số điện thoại
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="mt-1 w-full px-3 py-2 bg-white border border-fog text-ink"
                    placeholder="09xxxxxxxx"
                  />
                </label>
              </div>
              {error ? (
                <p className="mt-3 text-xs text-lacquer">{error}</p>
              ) : null}
              <div className="mt-5 flex gap-3">
                <button
                  onClick={() => setOpen(false)}
                  className="flex-1 py-3 text-sm border border-fog text-muted hover:bg-mist"
                  disabled={pending}
                >
                  Hủy
                </button>
                <button
                  onClick={submit}
                  disabled={pending}
                  className="flex-[2] py-3 text-sm text-white disabled:opacity-60"
                  style={{ backgroundColor: primaryColor }}
                >
                  {pending ? 'Đang ghi nhận…' : 'Hoàn tất phát tâm'}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
