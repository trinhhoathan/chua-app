'use client';

import Image from 'next/image';
import { useEffect, useState, type CSSProperties } from 'react';
import { LY_GIA } from '@/lib/ly-gia-phuc-an';
import type { LyGiaTeamMember } from '@/lib/ly-gia-team';

const GOLD = LY_GIA.gold;

const EASE =
  'transform 720ms cubic-bezier(0.22, 1, 0.36, 1), opacity 720ms cubic-bezier(0.22, 1, 0.36, 1), filter 720ms ease, width 720ms cubic-bezier(0.22, 1, 0.36, 1)';

/** Khoảng cách vòng tròn từ active */
function relativeOffset(index: number, active: number, len: number): number {
  let d = index - active;
  if (d > len / 2) d -= len;
  if (d < -len / 2) d += len;
  return d;
}

/**
 * Coverflow 5 slot — luôn neo left/top 50% rồi dịch theo trục X (px/vw),
 * tránh translate% theo bề rộng card (làm 2 ảnh ngoài bị đẩy mất / gần như không thấy).
 */
function slotStyle(offset: number): CSSProperties {
  const abs = Math.abs(offset);
  const sign = offset === 0 ? 0 : offset < 0 ? -1 : 1;

  // Base: căn giữa viewport carousel
  const base = 'translate(-50%, -50%)';

  if (abs > 2) {
    return {
      opacity: 0,
      width: 'clamp(5.5rem, 13vw, 7.25rem)',
      transform: `${base} translateX(${sign * 24}rem) scale(0.5) rotateY(${sign * -22}deg)`,
      zIndex: 0,
      pointerEvents: 'none',
      filter: 'blur(2px)',
    };
  }

  if (offset === 0) {
    return {
      opacity: 1,
      width: 'clamp(12.5rem, 30vw, 16.5rem)',
      transform: `${base} translateX(0) scale(1) rotateY(0deg)`,
      zIndex: 30,
      pointerEvents: 'auto',
      filter: 'blur(0px)',
    };
  }

  if (abs === 1) {
    return {
      opacity: 0.65,
      width: 'clamp(9.5rem, 22vw, 12.75rem)',
      transform: `${base} translateX(${sign * 11}rem) scale(0.88) rotateY(${sign * -8}deg)`,
      zIndex: 20,
      pointerEvents: 'auto',
      filter: 'blur(0.2px)',
    };
  }

  // abs === 2 — ngoài cùng: nhỏ + mờ hơn
  return {
    opacity: 0.4,
    width: 'clamp(7.25rem, 16vw, 9.5rem)',
    transform: `${base} translateX(${sign * 18.75}rem) scale(0.72) rotateY(${sign * -14}deg)`,
    zIndex: 10,
    pointerEvents: 'auto',
    filter: 'blur(0.55px)',
  };
}

export function LyGiaTeam({ members }: { members: LyGiaTeamMember[] }) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const len = members.length;

  useEffect(() => {
    if (paused || len <= 1) return;
    const id = window.setInterval(() => {
      setActive((i) => (i + 1) % len);
    }, 4800);
    return () => window.clearInterval(id);
  }, [paused, len]);

  if (len === 0) return null;

  const current = members[active];

  const go = (delta: number) => {
    setActive((i) => (i + delta + len) % len);
  };

  return (
    <div
      className="relative overflow-x-clip"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 80% 60% at 50% 40%, #8B2424 0%, #5C1212 45%, #2A0808 100%)',
        }}
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-70"
        style={{
          backgroundImage: [
            'radial-gradient(circle at 20% 30%, rgba(212,175,55,0.22) 0%, transparent 35%)',
            'radial-gradient(circle at 80% 70%, rgba(212,175,55,0.18) 0%, transparent 40%)',
            'radial-gradient(circle at 50% 50%, rgba(255,220,140,0.08) 0%, transparent 50%)',
          ].join(', '),
        }}
      />
      <div
        className="pointer-events-none absolute -left-1/4 top-1/4 h-40 w-[70%] -rotate-[18deg] opacity-40 blur-2xl"
        style={{
          background:
            'linear-gradient(90deg, transparent, rgba(212,175,55,0.55), transparent)',
        }}
      />
      <div
        className="pointer-events-none absolute -right-1/4 bottom-1/4 h-32 w-[60%] rotate-[14deg] opacity-35 blur-2xl"
        style={{
          background:
            'linear-gradient(90deg, transparent, rgba(255,210,120,0.45), transparent)',
        }}
      />

      <div className="relative px-2 py-6 md:px-6 md:py-8">
        <div className="mx-auto mb-4 max-w-2xl text-center px-2">
          <Image
            src={LY_GIA.logoOrb}
            alt=""
            width={160}
            height={160}
            unoptimized
            className="mx-auto size-28 rounded-full object-cover opacity-95 drop-shadow-[0_8px_24px_rgba(0,0,0,0.35)] md:size-36"
          />
          <p
            className="mt-2 text-[0.65rem] uppercase tracking-[0.3em]"
            style={{ color: GOLD }}
          >
            Đội ngũ chuyên môn
          </p>
          <h2 className="mt-1 font-display text-2xl text-white md:text-3xl">
            Nhân sự Lý Gia Phúc An
          </h2>
          <p className="mt-1 text-xs text-white/55 md:text-sm">
            Đồng hành cùng thầy — tư vấn, luận sim và chăm sóc thân chủ
          </p>
        </div>

        <div className="relative mx-auto w-full max-w-7xl">
          <div
            className="relative mx-auto h-[min(76vw,23rem)] w-full md:h-[26rem]"
            style={{ perspective: '1400px', perspectiveOrigin: '50% 50%' }}
          >
            {members.map((m, index) => {
              const offset = relativeOffset(index, active, len);
              const abs = Math.abs(offset);
              const isCenter = offset === 0;
              const style = slotStyle(offset);

              return (
                <button
                  key={m.id}
                  type="button"
                  aria-label={`${m.name} - ${m.role}`}
                  aria-current={isCenter}
                  aria-hidden={abs > 2}
                  tabIndex={abs > 2 ? -1 : 0}
                  onClick={() => {
                    if (offset !== 0 && abs <= 2) setActive(index);
                  }}
                  className="absolute left-1/2 top-1/2 will-change-transform"
                  style={{
                    ...style,
                    transformStyle: 'preserve-3d',
                    backfaceVisibility: 'hidden',
                    transition: EASE,
                  }}
                >
                  <div
                    className={
                      isCenter
                        ? 'relative p-[3px]'
                        : 'overflow-hidden border border-white/15 shadow-[0_24px_60px_-20px_rgba(0,0,0,0.7)]'
                    }
                    style={
                      isCenter
                        ? {
                            background:
                              'linear-gradient(145deg, #F0D78C 0%, #B08D42 28%, #7A5C1E 52%, #E8C96A 78%, #B08D42 100%)',
                            boxShadow:
                              '0 0 0 1px rgba(240,215,140,0.35), 0 0 28px -6px rgba(212,175,55,0.55), 0 22px 48px -18px rgba(0,0,0,0.75)',
                          }
                        : undefined
                    }
                  >
                    {isCenter ? (
                      <>
                        <span
                          className="pointer-events-none absolute inset-[5px] z-10 border"
                          style={{ borderColor: 'rgba(240,215,140,0.55)' }}
                          aria-hidden
                        />
                        <span
                          className="pointer-events-none absolute left-2 top-2 z-10 size-3 border-l-2 border-t-2"
                          style={{ borderColor: '#F5E6B8' }}
                          aria-hidden
                        />
                        <span
                          className="pointer-events-none absolute right-2 top-2 z-10 size-3 border-r-2 border-t-2"
                          style={{ borderColor: '#F5E6B8' }}
                          aria-hidden
                        />
                        <span
                          className="pointer-events-none absolute bottom-2 left-2 z-10 size-3 border-b-2 border-l-2"
                          style={{ borderColor: '#F5E6B8' }}
                          aria-hidden
                        />
                        <span
                          className="pointer-events-none absolute bottom-2 right-2 z-10 size-3 border-b-2 border-r-2"
                          style={{ borderColor: '#F5E6B8' }}
                          aria-hidden
                        />
                      </>
                    ) : null}
                    <div
                      className={`relative aspect-[3/4] bg-ink ${
                        isCenter ? 'overflow-hidden' : ''
                      }`}
                    >
                      <Image
                        src={m.image}
                        alt={`${m.name} - ${m.role}`}
                        fill
                        className="object-cover object-top"
                        sizes="(max-width:768px) 55vw, 15rem"
                        priority={abs <= 2}
                      />
                    </div>
                  </div>
                </button>
              );
            })}

            <button
              type="button"
              aria-label="Nhân sự trước"
              className="absolute left-1 top-1/2 z-40 inline-flex size-10 -translate-y-1/2 items-center justify-center rounded-full border bg-black/40 backdrop-blur-sm transition-colors hover:bg-black/60 md:left-2 md:size-11"
              style={{ borderColor: 'rgba(176,141,66,0.4)', color: GOLD }}
              onClick={() => go(-1)}
            >
              <svg viewBox="0 0 20 20" className="size-4" fill="currentColor">
                <path d="M12.7 4.3a1 1 0 0 1 0 1.4L8.4 10l4.3 4.3a1 1 0 1 1-1.4 1.4l-5-5a1 1 0 0 1 0-1.4l5-5a1 1 0 0 1 1.4 0Z" />
              </svg>
            </button>
            <button
              type="button"
              aria-label="Nhân sự sau"
              className="absolute right-1 top-1/2 z-40 inline-flex size-10 -translate-y-1/2 items-center justify-center rounded-full border bg-black/40 backdrop-blur-sm transition-colors hover:bg-black/60 md:right-2 md:size-11"
              style={{ borderColor: 'rgba(176,141,66,0.4)', color: GOLD }}
              onClick={() => go(1)}
            >
              <svg viewBox="0 0 20 20" className="size-4" fill="currentColor">
                <path d="M7.3 4.3a1 1 0 0 1 1.4 0l5 5a1 1 0 0 1 0 1.4l-5 5a1 1 0 1 1-1.4-1.4L11.6 10 7.3 5.7a1 1 0 0 1 0-1.4Z" />
              </svg>
            </button>
          </div>

          <div
            key={current.id}
            className="mt-3 text-center animate-[soft-fade_0.45s_ease]"
          >
            <p className="font-display text-lg text-white md:text-xl">
              {current.name}
            </p>
            <p className="mt-0.5 text-sm" style={{ color: GOLD }}>
              {current.role}
            </p>
            <p className="mt-0.5 text-[0.6rem] uppercase tracking-[0.18em] text-white/45">
              Ban chuyên môn · Lý Gia Phúc An
            </p>
            <p className="mt-1.5 text-sm text-white/80">
              Liên hệ:{' '}
              <a
                href={`tel:${LY_GIA.phone}`}
                className="font-medium text-white hover:opacity-80"
              >
                {current.phone}
              </a>
              <span className="mx-1.5 text-white/25">·</span>
              <span className="text-[0.7rem] text-white/40">
                {LY_GIA.addressShort}
              </span>
            </p>
          </div>
        </div>

        <div className="mt-3 flex items-center justify-center gap-2">
          {members.map((m, i) => (
            <button
              key={m.id}
              type="button"
              aria-label={m.name}
              aria-current={i === active}
              className={`h-1.5 rounded-full transition-all duration-500 ease-out ${
                i === active ? 'w-8' : 'w-2.5 bg-white/25 hover:bg-white/45'
              }`}
              style={i === active ? { backgroundColor: GOLD } : undefined}
              onClick={() => setActive(i)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
