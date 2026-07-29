'use client';

const DAYS = Array.from({ length: 31 }, (_, i) => i + 1);
const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1);
const HOURS = Array.from({ length: 24 }, (_, i) => i);
const MINUTES = Array.from({ length: 60 }, (_, i) => i);

function pad2(n: number): string {
  return String(n).padStart(2, '0');
}

function daysInMonth(year: number, month: number): number {
  if (!year || !month) return 31;
  return new Date(year, month, 0).getDate();
}

export function yearOptions(from: number, to: number): number[] {
  const years: number[] = [];
  for (let y = to; y >= from; y -= 1) years.push(y);
  return years;
}

export type DateParts = { day: string; month: string; year: string };
export type TimeParts = { hour: string; minute: string };

const selectCls =
  'w-full border border-fog bg-white px-2 py-2.5 text-sm text-ink';

export function VnDateDropdowns({
  label,
  value,
  years,
  onChange,
  labelClassName = 'text-xs text-muted',
}: {
  label: string;
  value: DateParts;
  years: number[];
  onChange: (next: DateParts) => void;
  labelClassName?: string;
}) {
  const { day, month, year } = value;
  const maxDay = daysInMonth(Number(year) || 0, Number(month) || 0);
  const dayList = DAYS.filter((d) => d <= maxDay);

  return (
    <div>
      <p className={labelClassName}>{label}</p>
      <div className="mt-1.5 grid grid-cols-3 gap-2">
        <select
          aria-label={`${label} — ngày`}
          value={day}
          onChange={(e) => onChange({ day: e.target.value, month, year })}
          className={selectCls}
        >
          <option value="">Ngày</option>
          {dayList.map((d) => (
            <option key={d} value={String(d)}>
              {pad2(d)}
            </option>
          ))}
        </select>
        <select
          aria-label={`${label} — tháng`}
          value={month}
          onChange={(e) => {
            const nextMonth = e.target.value;
            const max = daysInMonth(Number(year) || 0, Number(nextMonth) || 0);
            const nextDay = day && Number(day) > max ? String(max) : day;
            onChange({ day: nextDay, month: nextMonth, year });
          }}
          className={selectCls}
        >
          <option value="">Tháng</option>
          {MONTHS.map((m) => (
            <option key={m} value={String(m)}>
              {pad2(m)}
            </option>
          ))}
        </select>
        <select
          aria-label={`${label} — năm`}
          value={year}
          onChange={(e) => {
            const nextYear = e.target.value;
            const max = daysInMonth(Number(nextYear) || 0, Number(month) || 0);
            const nextDay = day && Number(day) > max ? String(max) : day;
            onChange({ day: nextDay, month, year: nextYear });
          }}
          className={selectCls}
        >
          <option value="">Năm</option>
          {years.map((y) => (
            <option key={y} value={String(y)}>
              {y}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

export function VnTimeDropdowns({
  label = 'Thời gian sinh',
  value,
  onChange,
  labelClassName = 'text-xs text-muted',
}: {
  label?: string;
  value: TimeParts;
  onChange: (next: TimeParts) => void;
  labelClassName?: string;
}) {
  const { hour, minute } = value;
  return (
    <div>
      <p className={labelClassName}>{label}</p>
      <div className="mt-1.5 grid grid-cols-2 gap-2">
        <select
          aria-label="Giờ sinh"
          value={hour}
          onChange={(e) => onChange({ hour: e.target.value, minute })}
          className={selectCls}
        >
          <option value="">Giờ</option>
          {HOURS.map((h) => (
            <option key={h} value={String(h)}>
              {pad2(h)} giờ
            </option>
          ))}
        </select>
        <select
          aria-label="Phút sinh"
          value={minute}
          onChange={(e) => onChange({ hour, minute: e.target.value })}
          className={selectCls}
        >
          <option value="">Phút</option>
          {MINUTES.map((m) => (
            <option key={m} value={String(m)}>
              {pad2(m)} phút
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

export function composeVnDate(parts: DateParts): string {
  const { day, month, year } = parts;
  if (!day && !month && !year) return '';
  if (!day || !month || !year) return '__incomplete__';
  return `${pad2(Number(day))}/${pad2(Number(month))}/${year}`;
}

export function composeVnTime(parts: TimeParts): string {
  const { hour, minute } = parts;
  if (!hour && !minute) return '';
  if (hour === '' || minute === '') return '__incomplete__';
  return `${pad2(Number(hour))}:${pad2(Number(minute))}`;
}
