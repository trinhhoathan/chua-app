'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

const DISMISS_KEY = 'lgpa-sim-chip-dismissed';

/**
 * Chip nổi quảng bá kho sim — chỉ hiện trên site Lý Gia (được gate ở LyGiaShell),
 * ẩn trong khu /sim và sau khi khách đóng (nhớ theo phiên).
 */
export function SimPromoChip({ primaryColor }: { primaryColor: string }) {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (sessionStorage.getItem(DISMISS_KEY) === '1') return;
    } catch {
      // sessionStorage bị chặn — vẫn hiện
    }
    const t = window.setTimeout(() => setVisible(true), 2500);
    return () => window.clearTimeout(t);
  }, []);

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

  return (
    <div className="fixed bottom-4 left-4 z-40 max-w-[15rem] animate-[fadeIn_.4s_ease]">
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
          Tìm số hợp mệnh theo ngày giờ sinh — thầy tuyển từng số.
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
