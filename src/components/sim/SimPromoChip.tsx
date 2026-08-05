'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { useSitePersona } from '@/components/SitePersonaContext';
import {
  SIM_ONLY_DELAY_MS,
  canOfferSimOnlySite,
  dismissSimPromo,
  trackPromoPath,
} from '@/lib/promo-chips';

/**
 * Chip sim cho site Lý Gia (không có chip nước cạnh tranh).
 * Hiện dần sau vài trang / quan tâm — không nhảy ngay khi load.
 */
export function SimPromoChip({
  primaryColor,
  side = 'left',
}: {
  primaryColor: string;
  side?: 'left' | 'right';
  /** @deprecated orchestrator tự tính delay */
  delayMs?: number;
}) {
  const { role } = useSitePersona();
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    trackPromoPath(pathname);
  }, [pathname]);

  useEffect(() => {
    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setVisible(false);

    if (!canOfferSimOnlySite(pathname)) return;

    timerRef.current = window.setTimeout(() => {
      if (canOfferSimOnlySite(pathname)) setVisible(true);
    }, SIM_ONLY_DELAY_MS);

    return () => {
      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [pathname]);

  if (!visible) return null;

  function dismiss() {
    setVisible(false);
    dismissSimPromo();
  }

  const pos =
    side === 'right'
      ? 'right-2 md:right-3.5 bottom-[max(5.5rem,calc(4rem+env(safe-area-inset-bottom,0px)))] md:bottom-28'
      : 'left-4 bottom-4';

  return (
    <div className={`fixed z-40 max-w-[15rem] animate-[fadeIn_.45s_ease] ${pos}`}>
      <div className="relative border border-white/20 bg-ink/95 p-3.5 text-white shadow-[0_16px_40px_-12px_rgba(0,0,0,0.6)] backdrop-blur">
        <button
          type="button"
          onClick={dismiss}
          aria-label="Đóng"
          className="absolute right-1.5 top-1.5 grid size-5 place-items-center text-white/50 hover:text-white"
        >
          ✕
        </button>
        <p className="text-[0.6rem] uppercase tracking-[0.2em] text-gilt">
          Sim phong thủy
        </p>
        <p className="mt-1 text-[0.8rem] leading-snug text-white/85">
          Tìm số hợp mệnh theo ngày giờ sinh — {role} tuyển từng số.
        </p>
        <Link
          href="/sim"
          onClick={dismiss}
          className="mt-2.5 inline-flex px-3.5 py-1.5 text-xs font-semibold text-white"
          style={{ backgroundColor: primaryColor }}
        >
          Xem kho sim →
        </Link>
      </div>
    </div>
  );
}
