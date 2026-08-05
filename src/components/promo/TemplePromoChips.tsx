'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { useSitePersona } from '@/components/SitePersonaContext';
import {
  SIM_DELAY_MS,
  canOfferSimOnTemple,
  canOfferWater,
  dismissSimPromo,
  dismissWaterPromo,
  trackPromoPath,
  waterOfferDelayMs,
  type PromoSlot,
} from '@/lib/promo-chips';
import {
  WATER_NUDGE_EVENT,
  openWaterDonateForm,
} from '@/lib/water-merit-prompt';

/**
 * Site chùa: điều phối chip Thỉnh nước (trái) rồi mới Sim (phải).
 * Không hiện cả hai; không spam ngay khi load trang đầu.
 */
export function TemplePromoChips({
  primaryColor,
  templeName,
  enableSim,
}: {
  primaryColor: string;
  templeName: string;
  enableSim: boolean;
}) {
  const pathname = usePathname();
  const { role } = useSitePersona();
  const [slot, setSlot] = useState<PromoSlot>('none');
  const [meritBusy, setMeritBusy] = useState(false);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    trackPromoPath(pathname);
  }, [pathname]);

  // Merit nudge (xin xăm / gõ mõ) chiếm góc trái — tạm nhường
  useEffect(() => {
    function onNudge() {
      setMeritBusy(true);
      setSlot((s) => (s === 'water' ? 'none' : s));
    }
    window.addEventListener(WATER_NUDGE_EVENT, onNudge);
    return () => window.removeEventListener(WATER_NUDGE_EVENT, onNudge);
  }, []);

  // Hết “bận” merit khi đổi trang hoặc sau 2 phút
  useEffect(() => {
    if (!meritBusy) return;
    const t = window.setTimeout(() => setMeritBusy(false), 120_000);
    return () => window.clearTimeout(t);
  }, [meritBusy]);

  useEffect(() => {
    setMeritBusy(false);
  }, [pathname]);

  useEffect(() => {
    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setSlot('none');

    if (meritBusy) return;

    if (canOfferWater(pathname)) {
      timerRef.current = window.setTimeout(() => {
        if (canOfferWater(pathname)) setSlot('water');
      }, waterOfferDelayMs());
      return () => {
        if (timerRef.current) window.clearTimeout(timerRef.current);
      };
    }

    if (enableSim && canOfferSimOnTemple(pathname)) {
      timerRef.current = window.setTimeout(() => {
        if (enableSim && canOfferSimOnTemple(pathname)) setSlot('sim');
      }, SIM_DELAY_MS);
    }

    return () => {
      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [pathname, enableSim, meritBusy]);

  // Sau khi đóng nước: chờ cooldown rồi mới xếp lịch sim (không nhảy ngay)
  useEffect(() => {
    if (!enableSim || slot !== 'none' || meritBusy) return;
    if (canOfferWater(pathname)) return;
    if (canOfferSimOnTemple(pathname)) return;

    const id = window.setInterval(() => {
      if (
        enableSim &&
        !canOfferWater(pathname) &&
        canOfferSimOnTemple(pathname)
      ) {
        window.clearInterval(id);
        timerRef.current = window.setTimeout(() => {
          if (canOfferSimOnTemple(pathname)) setSlot('sim');
        }, SIM_DELAY_MS);
      }
    }, 10_000);

    return () => window.clearInterval(id);
  }, [pathname, enableSim, slot, meritBusy]);

  function onDismissWater() {
    dismissWaterPromo();
    setSlot('none');
  }

  function onDismissSim() {
    dismissSimPromo();
    setSlot('none');
  }

  if (slot === 'water') {
    return (
      <div className="pointer-events-none fixed left-2 z-[47] bottom-[max(5.5rem,calc(4rem+env(safe-area-inset-bottom,0px)))] md:left-3.5 md:bottom-28">
        <div className="pointer-events-auto max-w-[15rem] animate-[fadeIn_.45s_ease] shadow-[0_12px_32px_-12px_rgba(0,0,0,0.45)]">
          <div
            className="relative rounded-md px-3 py-2.5 text-white ring-1 ring-white/20"
            style={{
              background: `linear-gradient(145deg, ${primaryColor}ee, #1a1714f0)`,
            }}
          >
            <button
              type="button"
              onClick={onDismissWater}
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
                onDismissWater();
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

  if (slot === 'sim') {
    return (
      <div className="pointer-events-none fixed right-2 z-[40] bottom-[max(5.5rem,calc(4rem+env(safe-area-inset-bottom,0px)))] md:right-3.5 md:bottom-28">
        <div className="pointer-events-auto max-w-[15rem] animate-[fadeIn_.45s_ease]">
          <div className="relative border border-white/20 bg-ink/95 p-3.5 text-white shadow-[0_16px_40px_-12px_rgba(0,0,0,0.6)] backdrop-blur">
            <button
              type="button"
              onClick={onDismissSim}
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
              onClick={onDismissSim}
              className="mt-2.5 inline-flex px-3.5 py-1.5 text-xs font-semibold text-white"
              style={{ backgroundColor: primaryColor }}
            >
              Xem kho sim →
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
