'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { openWaterDonateForm } from '@/lib/water-merit-prompt';

const DISMISS_KEY = 'temple-water-chip-dismissed';

/**
 * Chip nổi thỉnh nước — hiện khắp site chùa (ẩn /dat-nuoc và khi đóng trong phiên).
 * Ưu tiên hơn chip Sim: hiện sớm hơn, góc trái trên thanh sticky.
 */
export function WaterPromoChip({
  primaryColor,
  templeName,
}: {
  primaryColor: string;
  templeName: string;
}) {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (sessionStorage.getItem(DISMISS_KEY) === '1') return;
    } catch {
      /* vẫn hiện */
    }
    const t = window.setTimeout(() => setVisible(true), 1200);
    return () => window.clearTimeout(t);
  }, []);

  if (
    !visible ||
    pathname.startsWith('/dat-nuoc') ||
    pathname.startsWith('/quan-tri')
  ) {
    return null;
  }

  function dismiss() {
    setVisible(false);
    try {
      sessionStorage.setItem(DISMISS_KEY, '1');
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="pointer-events-none fixed left-2 z-[47] bottom-[max(5.5rem,calc(4rem+env(safe-area-inset-bottom,0px)))] md:left-3.5 md:bottom-28">
      <div className="pointer-events-auto max-w-[15rem] animate-[fadeIn_.4s_ease] shadow-[0_12px_32px_-12px_rgba(0,0,0,0.45)]">
        <div
          className="relative rounded-md px-3 py-2.5 text-white ring-1 ring-white/20"
          style={{
            background: `linear-gradient(145deg, ${primaryColor}ee, #1a1714f0)`,
          }}
        >
          <button
            type="button"
            onClick={dismiss}
            aria-label="Đóng"
            className="absolute right-1.5 top-1 grid size-5 place-items-center text-white/50 hover:text-white"
          >
            ✕
          </button>
          <p className="mb-1 pr-4 text-[0.6rem] uppercase tracking-[0.18em] text-white/55">
            {templeName}
          </p>
          <p className="pr-3 text-[0.8rem] leading-snug text-white/90">
            Thỉnh nước tinh khiết — công đức hồi hướng, mở luận giải sâu hơn.
          </p>
          <button
            type="button"
            onClick={() => {
              dismiss();
              openWaterDonateForm({
                note: `Phát tâm thỉnh nước dâng ${templeName}`,
                qty: 10,
              });
            }}
            className="mt-2.5 w-full bg-white/95 py-1.5 text-[0.7rem] font-medium text-ink hover:bg-white"
          >
            Thỉnh nước ngay →
          </button>
        </div>
      </div>
    </div>
  );
}
