import type { ChantingSchedule } from '@/types/database';

const VN_TZ = 'Asia/Ho_Chi_Minh';

/** Phút trong ngày theo Asia/Ho_Chi_Minh */
export function vnParts(date = new Date()): {
  year: number;
  month: number;
  day: number;
  weekday: number;
  hour: number;
  minute: number;
  second: number;
} {
  const fmt = new Intl.DateTimeFormat('en-US', {
    timeZone: VN_TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
  const map: Record<string, string> = {};
  for (const p of fmt.formatToParts(date)) {
    if (p.type !== 'literal') map[p.type] = p.value;
  }
  const weekdayMap: Record<string, number> = {
    Sun: 0,
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
  };
  return {
    year: Number(map.year),
    month: Number(map.month),
    day: Number(map.day),
    weekday: weekdayMap[map.weekday] ?? 0,
    hour: Number(map.hour === '24' ? '0' : map.hour),
    minute: Number(map.minute),
    second: Number(map.second),
  };
}

function parseTimeToMinutes(time: string): number {
  const m = time.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?/);
  if (!m) return 0;
  return Number(m[1]) * 60 + Number(m[2]);
}

/** Instant UTC tương ứng một ngày+giờ VN (không DST) */
export function vnLocalToUtcMs(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
  second = 0,
): number {
  const pad = (n: number) => String(n).padStart(2, '0');
  const iso = `${year}-${pad(month)}-${pad(day)}T${pad(hour)}:${pad(minute)}:${pad(second)}+07:00`;
  return new Date(iso).getTime();
}

function ymdAddDays(y: number, m: number, d: number, add: number) {
  const ms = vnLocalToUtcMs(y, m, d, 12, 0, 0) + add * 86400000;
  const p = vnParts(new Date(ms));
  return { year: p.year, month: p.month, day: p.day, weekday: p.weekday };
}

export type ChantingWindow = {
  startsAt: string;
  endsAt: string;
  isWithinWindow: boolean;
};

/**
 * Cửa sổ buổi tụng kinh gần nhất (đang diễn ra hoặc sắp tới trong ~7 ngày).
 * Không phụ thuộc is_live — chỉ dựa lịch.
 */
export function getChantingWindow(
  schedule: Pick<
    ChantingSchedule,
    | 'recurrence'
    | 'days_of_week'
    | 'start_date'
    | 'start_time'
    | 'duration_minutes'
  >,
  now = new Date(),
): ChantingWindow | null {
  const startMin = parseTimeToMinutes(schedule.start_time);
  const dur = Math.max(1, schedule.duration_minutes);
  const nowParts = vnParts(now);
  const nowMin = nowParts.hour * 60 + nowParts.minute;

  if (schedule.recurrence === 'once') {
    if (!schedule.start_date) return null;
    const [y, m, d] = schedule.start_date.split('-').map(Number);
    const startMs = vnLocalToUtcMs(
      y,
      m,
      d,
      Math.floor(startMin / 60),
      startMin % 60,
    );
    const endMs = startMs + dur * 60_000;
    return {
      startsAt: new Date(startMs).toISOString(),
      endsAt: new Date(endMs).toISOString(),
      isWithinWindow: now.getTime() >= startMs && now.getTime() < endMs,
    };
  }

  for (let offset = 0; offset < 8; offset++) {
    const day = ymdAddDays(
      nowParts.year,
      nowParts.month,
      nowParts.day,
      offset,
    );
    if (schedule.recurrence === 'weekly') {
      const days = schedule.days_of_week ?? [];
      if (!days.includes(day.weekday)) continue;
    }
    if (offset === 0 && nowMin >= startMin + dur) continue;

    const startMs = vnLocalToUtcMs(
      day.year,
      day.month,
      day.day,
      Math.floor(startMin / 60),
      startMin % 60,
    );
    const endMs = startMs + dur * 60_000;
    if (now.getTime() >= endMs) continue;
    return {
      startsAt: new Date(startMs).toISOString(),
      endsAt: new Date(endMs).toISOString(),
      isWithinWindow: now.getTime() >= startMs && now.getTime() < endMs,
    };
  }
  return null;
}

export function formatStartTimeShort(time: string): string {
  const m = time.match(/^(\d{1,2}):(\d{2})/);
  if (!m) return time;
  return `${String(m[1]).padStart(2, '0')}:${m[2]}`;
}
