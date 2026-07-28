'use client';

import { useEffect, useState } from 'react';

interface Props {
  startsAt: string;
  endsAt: string;
  color: string;
}

interface Remaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function diff(target: number, now: number): Remaining {
  const ms = Math.max(0, target - now);
  const totalSeconds = Math.floor(ms / 1000);
  return {
    days: Math.floor(totalSeconds / 86400),
    hours: Math.floor((totalSeconds % 86400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
  };
}

export function EventCountdown({ startsAt, endsAt, color }: Props) {
  const startTs = new Date(startsAt).getTime();
  const endTs = new Date(endsAt).getTime();

  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  if (now === null) {
    return (
      <div className="h-[68px] bg-mist/50 border border-fog animate-pulse" />
    );
  }

  if (now >= endTs) return null;

  if (now >= startTs && now < endTs) {
    return (
      <div
        className="flex items-center gap-2 px-4 py-3 text-sm font-medium"
        style={{ background: `${color}12`, color }}
      >
        <span
          className="inline-block size-2 rounded-full animate-pulse"
          style={{ background: color }}
        />
        Đang diễn ra
      </div>
    );
  }

  const r = diff(startTs, now);

  return (
    <div className="grid grid-cols-4 gap-1.5">
      <Cell value={r.days} label="Ngày" color={color} />
      <Cell value={r.hours} label="Giờ" color={color} />
      <Cell value={r.minutes} label="Phút" color={color} />
      <Cell value={r.seconds} label="Giây" color={color} />
    </div>
  );
}

function Cell({
  value,
  label,
  color,
}: {
  value: number;
  label: string;
  color: string;
}) {
  return (
    <div
      className="flex flex-col items-center py-2 border"
      style={{ background: `${color}0d`, borderColor: `${color}33` }}
    >
      <span
        className="text-lg md:text-xl font-semibold tabular-nums leading-none"
        style={{ color }}
      >
        {String(value).padStart(2, '0')}
      </span>
      <span className="mt-1 text-[0.6rem] uppercase tracking-[0.2em] text-muted">
        {label}
      </span>
    </div>
  );
}
