'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useSitePersona } from '@/components/SitePersonaContext';

const DISMISS_KEY = 'lgpa-sim-chip-dismissed';

/**
 * Chip nổi quảng bá kho sim — ẩn trong khu /sim và sau khi khách đóng (nhớ theo phiên).
 * Trên site chùa: đặt góc phải (để chip Thỉnh nước ưu tiên góc trái).
 */
export function SimPromoChip({
  primaryColor,
  side = 'left',
  delayMs = 2500,
}: {
  primaryColor: string;
  side?: 'left' | 'right';
  delayMs?: number;
}) {
  const { role } = useSitePersona();
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (sessionStorage.getItem(DISMISS_KEY) === '1') return;
    } catch {
      // sessionStorage bị chặn — vẫn hiện
    }
    const t = window.setTimeout(() => setVisible(true), delayMs);
    return () => window.clearTimeout(t);
  }, [delayMs]);

  if (!visible || pathname.startsWith('/sim') || pathname.startsWith('/quan-tri')) {
    return null;
  }

  function dismiss() {
    setVisible(false);
    try {
      sessionStorage.setItem(DISMISS_KEY, '1');
    } catch {
      // ignore
    }
  }

  const pos =
    side === 'right'
      ? 'right-2 md:right-3.5 bottom-[max(5.5rem,calc(4rem+env(safe-area-inset-bottom,0px)))] md:bottom-28'
      : 'left-4 bottom-4';

  return (
    <div className={`fixed z-40 max-w-[15rem] animate-[fadeIn_.4s_ease] ${pos}`}>
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
