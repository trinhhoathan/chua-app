'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import {
  RANK_LABELS,
  drawRandomOracle,
  type QuanAmOracle,
  type XamRank,
} from '@/lib/fengshui/quan-am-xam';
import { playXamBoom, playXamRattle, stopXamRattle } from '@/lib/fengshui/xam-sfx';
import {
  emitWaterNudge,
  openWaterDonateForm,
} from '@/lib/water-merit-prompt';
import { WaterMeritInlineCta } from '@/components/water/WaterMeritInlineCta';

interface Props {
  primaryColor: string;
  templeName?: string;
  templeId?: string;
  /** Nút đóng phụ (modal). */
  extraActions?: ReactNode;
}

function rankTone(rank: XamRank): string {
  if (rank === 'thượng') return '#1a6b3c';
  if (rank === 'hạ') return '#8b1e1e';
  return '#6b5a1e';
}

const SHAKE_MS = 2600;

export function XinXamDrawPanel({
  primaryColor,
  templeName,
  extraActions,
}: Props) {
  const [phase, setPhase] = useState<'idle' | 'shaking' | 'boom' | 'result'>(
    'idle',
  );
  const [oracle, setOracle] = useState<QuanAmOracle | null>(null);
  const [shakeLevel, setShakeLevel] = useState(0);
  const [showWaterCta, setShowWaterCta] = useState(true);
  const timers = useRef<number[]>([]);
  const nudgedResultRef = useRef(false);

  useEffect(() => {
    return () => {
      timers.current.forEach((id) => window.clearTimeout(id));
      stopXamRattle();
    };
  }, []);

  useEffect(() => {
    if (phase !== 'result' || !templeName) return;
    if (nudgedResultRef.current) return;
    nudgedResultRef.current = true;
    emitWaterNudge('xin_xam');
  }, [phase, templeName]);

  function clearTimers() {
    timers.current.forEach((id) => window.clearTimeout(id));
    timers.current = [];
  }

  function draw() {
    clearTimers();
    stopXamRattle();
    setOracle(null);
    setPhase('shaking');
    setShakeLevel(1);
    setShowWaterCta(true);
    nudgedResultRef.current = false;
    void playXamRattle(SHAKE_MS);

    // Mạnh dần: 1 → 2 → 3
    timers.current.push(
      window.setTimeout(() => setShakeLevel(2), 700),
      window.setTimeout(() => setShakeLevel(3), 1400),
      window.setTimeout(() => {
        setPhase('boom');
        setShakeLevel(0);
        void playXamBoom();
        const next = drawRandomOracle();
        setOracle(next);
      }, SHAKE_MS),
      window.setTimeout(() => {
        setPhase('result');
      }, SHAKE_MS + 420),
    );
  }

  if (phase === 'result' && oracle) {
    return (
      <div className="xam-result-pop">
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <span
            className="inline-flex items-center px-2.5 py-1 text-[0.7rem] uppercase tracking-wide text-white"
            style={{ backgroundColor: rankTone(oracle.rank) }}
          >
            Quẻ số {oracle.id} · {RANK_LABELS[oracle.rank]}
          </span>
        </div>
        <p className="font-display text-2xl text-ink">{oracle.story}</p>
        {oracle.poem ? (
          <blockquote
            className="mt-4 border-l-2 pl-4 text-sm text-ink/90 leading-relaxed whitespace-pre-line"
            style={{ borderColor: primaryColor }}
          >
            {oracle.poem}
          </blockquote>
        ) : null}
        {oracle.advice ? (
          <p className="mt-4 text-sm text-ink leading-relaxed">
            <span className="text-muted">Lời bàn: </span>
            {oracle.advice}
          </p>
        ) : null}
        {oracle.omen ? (
          <p className="mt-2 text-sm text-muted leading-relaxed">
            Điềm ứng: {oracle.omen}
          </p>
        ) : null}
        {oracle.detail ? (
          <p className="mt-4 text-xs text-muted leading-relaxed border-t border-fog pt-4">
            {oracle.detail}
          </p>
        ) : null}
        <p className="mt-5 text-[0.7rem] text-muted leading-relaxed">
          Kết quả mang tính tham khảo tâm linh. Việc hệ trọng nên thưa hỏi trụ
          trì tại chùa.
        </p>

        {templeName && showWaterCta ? (
          <WaterMeritInlineCta
            compact
            primaryColor={primaryColor}
            templeName={templeName}
            source="xin_xam"
            onThinhNuoc={() =>
              openWaterDonateForm({
                note: `Hồi hướng sau xin xăm Quan Âm tại ${templeName}`,
              })
            }
            onDismiss={() => setShowWaterCta(false)}
          />
        ) : null}

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={draw}
            className="px-5 py-2.5 text-sm text-white"
            style={{ backgroundColor: primaryColor }}
          >
            Xin lại quẻ khác
          </button>
          {extraActions}
        </div>
      </div>
    );
  }

  const tubeClass =
    phase === 'idle'
      ? 'xam-tube-idle'
      : phase === 'shaking'
        ? `xam-tube-shake xam-tube-shake-${shakeLevel}`
        : phase === 'boom'
          ? 'xam-tube-boom'
          : '';

  return (
    <div className="flex flex-col items-center text-center">
      <div className="relative">
        {phase === 'boom' ? <span className="xam-boom-burst" aria-hidden /> : null}
        <div
          className={`relative size-24 rounded-full flex items-center justify-center text-white shadow-md ${tubeClass}`}
          style={{
            background: `linear-gradient(160deg, #c9a227 0%, ${primaryColor} 100%)`,
          }}
          aria-hidden
        >
          <span className="xam-tube-glyph inline-flex">
            <ShakeIcon className="size-11" />
          </span>
        </div>
      </div>

      <p className="mt-5 text-sm text-muted max-w-sm leading-relaxed">
        {phase === 'shaking'
          ? shakeLevel >= 3
            ? 'Ống xăm đang lắc mạnh… sắp ra quẻ!'
            : shakeLevel >= 2
              ? 'Lắc mạnh hơn…'
              : 'Đang lắc ống xăm…'
          : phase === 'boom'
            ? 'Bùm! Quẻ đã ra…'
            : 'Hít thở nhẹ, thành tâm niệm Quán Thế Âm Bồ Tát, rồi nhấn lắc xăm.'}
      </p>

      <button
        type="button"
        disabled={phase === 'shaking' || phase === 'boom'}
        onClick={draw}
        className="mt-6 px-6 py-2.5 text-sm text-white disabled:opacity-60"
        style={{ backgroundColor: primaryColor }}
      >
        {phase === 'shaking' || phase === 'boom' ? 'Đang rút…' : 'Lắc xin xăm'}
      </button>
    </div>
  );
}

function ShakeIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      className={className}
      fill="currentColor"
      aria-hidden
    >
      <path
        d="M18 8c-1.2 0-2.2.8-2.5 2L10 38.2A3 3 0 0 0 13 42h10a3 3 0 0 0 3-3.8L20.5 10A2.6 2.6 0 0 0 18 8zm.2 3.2 5.3 27.6H13.5L18.2 11.2z"
        opacity=".95"
      />
      <path
        d="M28.5 11.5 32 36.8a2.4 2.4 0 0 0 2.4 2.1h.2a2.4 2.4 0 0 0 2.3-2.7L33.2 11.2a2.2 2.2 0 0 0-2.2-1.8h-.2a2.2 2.2 0 0 0-2.3 2.1z"
        opacity=".88"
      />
      <rect
        x="21"
        y="4"
        width="2.2"
        height="10"
        rx="1"
        transform="rotate(12 22 9)"
      />
      <rect
        x="24.5"
        y="3"
        width="2.2"
        height="11"
        rx="1"
        transform="rotate(-8 25.5 8.5)"
      />
      <rect
        x="27.5"
        y="5"
        width="2"
        height="9"
        rx="1"
        transform="rotate(18 28.5 9.5)"
      />
    </svg>
  );
}
