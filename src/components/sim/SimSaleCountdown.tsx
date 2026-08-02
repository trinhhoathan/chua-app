'use client';

import { useEffect, useState } from 'react';

function remaining(endsAt: string): number {
  return new Date(endsAt).getTime() - Date.now();
}

function fmt(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const d = Math.floor(total / 86400);
  const h = Math.floor((total % 86400) / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const pad = (n: number) => String(n).padStart(2, '0');
  if (d > 0) return `${d} ngày ${pad(h)}:${pad(m)}:${pad(s)}`;
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
}

/**
 * Đếm ngược flash sale. Tự ẩn khi hết giờ hoặc không có sale.
 */
export function SimSaleCountdown({
  endsAt,
  size = 'sm',
}: {
  endsAt: string | null | undefined;
  size?: 'sm' | 'lg';
}) {
  const [ms, setMs] = useState<number | null>(null);

  useEffect(() => {
    if (!endsAt) return;
    const tick = () => setMs(remaining(endsAt));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [endsAt]);

  if (!endsAt || ms == null || ms <= 0) return null;

  if (size === 'lg') {
    return (
      <div className="inline-flex items-center gap-2 border border-[#C44A1F]/40 bg-[#C44A1F]/8 px-3 py-1.5">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#C44A1F] opacity-60" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-[#C44A1F]" />
        </span>
        <span className="text-xs font-medium text-[#C44A1F]">
          Giá ưu đãi kết thúc sau{' '}
          <span className="font-semibold tabular-nums">{fmt(ms)}</span>
        </span>
      </div>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 text-[0.65rem] font-semibold text-[#C44A1F]">
      <svg viewBox="0 0 16 16" className="h-3 w-3" fill="currentColor" aria-hidden>
        <path d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1Zm.75 3.5v3.19l2.28 2.28-1.06 1.06L7.25 8.31V4.5h1.5Z" />
      </svg>
      <span className="tabular-nums">{fmt(ms)}</span>
    </span>
  );
}
