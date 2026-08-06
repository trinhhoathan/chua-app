'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import {
  WATER_NUDGE_EVENT,
  dismissNudge,
  isNudgeDismissed,
  openWaterDonateForm,
  pulseWaterBar,
  type WaterNudgeSource,
} from '@/lib/water-merit-prompt';

interface Props {
  primaryColor: string;
  templeName: string;
  templeId: string;
}

/**
 * Chip nổi góc trái dưới (trên thanh thỉnh nước) —
 * chỉ hiện khi module tâm linh phát sự kiện, không spam.
 */
export function WaterMeritFloatingNudge({
  primaryColor,
  templeName,
  templeId,
}: Props) {
  const pathname = usePathname();
  const [source, setSource] = useState<WaterNudgeSource | null>(null);

  useEffect(() => {
    function onNudge(e: Event) {
      const detail = (e as CustomEvent<{ source: WaterNudgeSource }>).detail;
      const src = detail?.source;
      if (!src || src === 'milestone_108') return;
      if (isNudgeDismissed(templeId, src)) return;
      setSource(src);
      pulseWaterBar();
    }
    window.addEventListener(WATER_NUDGE_EVENT, onNudge);
    return () => window.removeEventListener(WATER_NUDGE_EVENT, onNudge);
  }, [templeId]);

  if (pathname?.startsWith('/huong-dan')) return null;
  if (!source) return null;

  const label =
    source === 'xin_xam'
      ? 'Gieo duyên thỉnh nước sau xin xăm'
      : 'Tiếp nối công đức — thỉnh nước';

  return (
    <div className="pointer-events-none fixed left-2 z-[46] bottom-[max(5.5rem,calc(4rem+env(safe-area-inset-bottom,0px)))] md:left-3.5 md:bottom-28">
      <div className="pointer-events-auto max-w-[14.5rem] animate-rise shadow-[0_12px_32px_-12px_rgba(0,0,0,0.45)]">
        <div
          className="relative rounded-md text-white px-3 py-2.5 ring-1 ring-white/20"
          style={{
            background: `linear-gradient(145deg, ${primaryColor}ee, #1a1714f0)`,
          }}
        >
          <button
            type="button"
            className="absolute top-1 right-1.5 text-white/50 hover:text-white text-sm leading-none px-1"
            aria-label="Đóng"
            onClick={() => {
              dismissNudge(templeId, source);
              setSource(null);
            }}
          >
            ×
          </button>
          <p className="text-[0.65rem] uppercase tracking-[0.14em] text-white/55 mb-1 pr-4">
            {templeName}
          </p>
          <p className="text-xs leading-snug pr-3">{label}</p>
          <button
            type="button"
            onClick={() => {
              dismissNudge(templeId, source);
              setSource(null);
              openWaterDonateForm({
                note:
                  source === 'xin_xam'
                    ? `Hồi hướng sau xin xăm Quan Âm tại ${templeName}`
                    : `Hồi hướng công đức gõ mõ tại ${templeName}`,
              });
            }}
            className="mt-2 w-full text-[0.7rem] font-medium py-1.5 bg-white/95 text-ink hover:bg-white"
          >
            Thỉnh nước ngay
          </button>
        </div>
      </div>
    </div>
  );
}
