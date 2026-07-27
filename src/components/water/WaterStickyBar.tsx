'use client';

import { useState, useTransition, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { createWaterOrder } from '@/app/actions/orders';
import type { CompanyBankAccount } from '@/lib/payment';

interface Props {
  primaryColor: string;
  unitPrice: number;
  templeName: string;
  paymentCode: string;
  bank: CompanyBankAccount;
  profitSharePct: number;
}

const QUICK_QTY = [10, 100, 1000, 5000];
const MIN_QTY = 10;
const MAX_QTY = 100000;

function formatVnd(n: number): string {
  return new Intl.NumberFormat('vi-VN').format(n);
}

export function WaterStickyBar({
  primaryColor,
  unitPrice,
  templeName,
  profitSharePct,
}: Props) {
  const router = useRouter();
  const [qty, setQty] = useState(MIN_QTY);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const total = useMemo(() => qty * unitPrice, [qty, unitPrice]);

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
      <div className="fixed bottom-0 inset-x-0 z-50 bg-ink text-white border-t border-white/10 shadow-[0_-8px_30px_rgba(0,0,0,0.25)]">
        <div className="mx-auto max-w-4xl px-3 md:px-6 py-2.5">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
            <span className="text-[10px] tracking-[0.25em] uppercase text-white/50 shrink-0 mr-1">
              Cúng nước
            </span>
            {QUICK_QTY.map((q) => (
              <button
                key={q}
                onClick={() => setQty(q)}
                className={`shrink-0 text-xs px-3 py-1.5 border transition-colors ${
                  qty === q
                    ? 'text-ink bg-white border-white'
                    : 'text-white/80 border-white/25 hover:border-white/60'
                }`}
              >
                {q} thùng
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
              className="shrink-0 w-16 text-xs px-2 py-1.5 bg-white/5 border border-white/20 text-white text-center"
              aria-label="Số thùng"
            />
          </div>
          <div className="mt-1.5 flex items-center justify-between gap-3">
            <div className="text-sm">
              <span className="text-white/60 text-xs">Tổng: </span>
              <span className="font-semibold text-white">
                {formatVnd(total)}&nbsp;đ
              </span>
              <span className="text-white/50 text-xs ml-1">
                ({formatVnd(unitPrice)}đ/thùng)
              </span>
            </div>
            <button
              onClick={() => setOpen(true)}
              className="text-sm font-medium text-white px-5 py-2 shrink-0"
              style={{ backgroundColor: primaryColor }}
            >
              Công đức ngay
            </button>
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
                Cúng dâng nước
              </p>
              <h3 className="font-display text-2xl">
                {qty} thùng — {formatVnd(total)}&nbsp;đ
              </h3>
              <p className="mt-1 text-xs text-muted">
                {templeName} nhận {profitSharePct.toFixed(0)}% giá trị đơn để
                phục vụ Phật sự.
              </p>
              <div className="mt-5 space-y-3">
                <label className="block text-xs text-muted">
                  Số thùng
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
                    Tối thiểu {MIN_QTY} thùng
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
                <label className="block text-xs text-muted">
                  Ghi chú (không bắt buộc)
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    rows={2}
                    className="mt-1 w-full px-3 py-2 bg-white border border-fog text-ink resize-none"
                    placeholder="Cúng dâng cho ..."
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
                  {pending ? 'Đang tạo đơn…' : 'Tiếp tục thanh toán'}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
