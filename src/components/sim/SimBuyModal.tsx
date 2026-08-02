'use client';

import { useEffect, useId, useState } from 'react';
import Link from 'next/link';
import { SimOrderForm } from '@/components/sim/SimOrderForm';
import { LY_GIA } from '@/lib/ly-gia-phuc-an';

function formatVnd(amount: number): string {
  return new Intl.NumberFormat('vi-VN').format(amount) + '\u00a0đ';
}

/**
 * Nút "Đặt mua" trên card sim — mở popup nhập thông tin,
 * vẫn có lối sang trang chi tiết đầy đủ.
 */
export function SimBuyModal({
  simId,
  phone,
  phoneDisplay,
  priceVnd,
  birthQuery,
  primaryColor = LY_GIA.primary,
}: {
  simId: string;
  phone: string;
  phoneDisplay: string;
  priceVnd: number;
  /** query mang ngày sinh (không gồm dấu ?) */
  birthQuery?: string;
  primaryColor?: string;
}) {
  const [open, setOpen] = useState(false);
  const titleId = useId();

  const detailHref = birthQuery
    ? `/sim/${phone}?${birthQuery}&dat=1`
    : `/sim/${phone}?dat=1`;

  const birthParams = birthQuery ? new URLSearchParams(birthQuery) : null;
  const defaultBirthDate = birthParams?.get('ns') || undefined;
  const defaultGender =
    birthParams?.get('gt') === 'nu' || birthParams?.get('gt') === 'nam'
      ? (birthParams.get('gt') as 'nam' | 'nu')
      : undefined;

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex-1 bg-lacquer px-3 py-2 text-center text-xs font-medium text-white transition-opacity hover:opacity-90"
      >
        Đặt mua
      </button>

      {open ? (
        <div
          className="fixed inset-0 z-[80] flex items-end justify-center sm:items-center sm:p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
        >
          <button
            type="button"
            aria-label="Đóng"
            className="absolute inset-0 bg-ink/50"
            onClick={() => setOpen(false)}
          />
          <div className="relative z-[1] flex max-h-[92vh] w-full max-w-lg flex-col overflow-hidden bg-paper shadow-xl sm:max-h-[90vh]">
            <div className="flex items-start justify-between gap-3 border-b border-fog px-4 py-3 sm:px-5">
              <div className="min-w-0">
                <p className="text-[0.65rem] uppercase tracking-[0.2em] text-muted">
                  Đặt mua sim
                </p>
                <p
                  id={titleId}
                  className="mt-0.5 font-display text-xl text-ink tabular-nums"
                >
                  {phoneDisplay}
                </p>
                <p className="mt-0.5 text-sm font-semibold text-lacquer">
                  {formatVnd(priceVnd)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="shrink-0 px-2 py-1 text-lg leading-none text-muted hover:text-ink"
                aria-label="Đóng"
              >
                ×
              </button>
            </div>

            <div className="min-w-0 overflow-y-auto px-4 py-4 sm:px-5">
              <Link
                href={detailHref}
                className="mb-4 flex items-center justify-between gap-2 border border-fog bg-mist/40 px-3 py-2.5 text-xs text-ink transition-colors hover:border-ink/30"
              >
                <span>
                  Xem trang đầy đủ luận giải phong thủy &amp; đặt mua
                </span>
                <span className="shrink-0 font-medium" style={{ color: primaryColor }}>
                  Mở →
                </span>
              </Link>

              <SimOrderForm
                simId={simId}
                phoneDisplay={phoneDisplay}
                priceVnd={priceVnd}
                primaryColor={primaryColor}
                zaloUrl={LY_GIA.zaloUrl}
                defaultBirthDate={defaultBirthDate}
                defaultGender={defaultGender}
                alwaysOpen
                onCancel={() => setOpen(false)}
              />
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
