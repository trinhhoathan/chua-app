'use client';

import {
  IZTRO_TIME_SLOTS,
  nowContextValue,
  shiftDateInput,
  shiftTimeIndex,
  todayDateInputValue,
} from '@/lib/fengshui/iztro-chart';

interface Props {
  primaryColor: string;
  date: string;
  timeIndex: number;
  onChange: (next: { date: string; timeIndex: number }) => void;
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
  onOpenChat?: () => void;
  onShare?: () => void;
}

const SELECT =
  'min-w-0 flex-1 border border-fog bg-white px-2 py-1.5 text-xs text-ink cursor-pointer hover:border-ink/30';

type StepKey =
  | 'hour'
  | 'day'
  | 'month'
  | 'year'
  | 'year10';

const MINUS_STEPS: { key: StepKey; label: string }[] = [
  { key: 'hour', label: '−1 giờ' },
  { key: 'day', label: '−1 ngày' },
  { key: 'month', label: '−1 tháng' },
  { key: 'year', label: '−1 năm' },
  { key: 'year10', label: '−10 năm' },
];

const PLUS_STEPS: { key: StepKey; label: string }[] = [
  { key: 'hour', label: '+1 giờ' },
  { key: 'day', label: '+1 ngày' },
  { key: 'month', label: '+1 tháng' },
  { key: 'year', label: '+1 năm' },
  { key: 'year10', label: '+10 năm' },
];

export function HoroscopeContextBar({
  primaryColor,
  date,
  timeIndex,
  onChange,
  isFullscreen = false,
  onToggleFullscreen,
  onOpenChat,
  onShare,
}: Props) {
  const slot =
    IZTRO_TIME_SLOTS.find((s) => s.index === timeIndex) ?? IZTRO_TIME_SLOTS[0];

  function setDate(next: string) {
    onChange({ date: next, timeIndex });
  }

  function setTime(next: number) {
    onChange({ date, timeIndex: next });
  }

  function applyStep(key: StepKey, sign: 1 | -1) {
    if (key === 'hour') {
      setTime(shiftTimeIndex(timeIndex, sign));
      return;
    }
    if (key === 'day') {
      setDate(shiftDateInput(date, { days: sign }));
      return;
    }
    if (key === 'month') {
      setDate(shiftDateInput(date, { months: sign }));
      return;
    }
    if (key === 'year') {
      setDate(shiftDateInput(date, { years: sign }));
      return;
    }
    setDate(shiftDateInput(date, { years: sign * 10 }));
  }

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[0.65rem] text-muted leading-none">
          Thời gian luận giải hiện tại
        </p>
        <div className="flex items-center gap-0.5 shrink-0">
          {onShare ? (
            <button
              type="button"
              onClick={onShare}
              className="shrink-0 p-1 text-muted hover:text-ink border border-transparent hover:border-fog"
              title="Chia sẻ lá số HTML"
              aria-label="Chia sẻ lá số HTML"
            >
              <svg
                viewBox="0 0 24 24"
                className="size-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <circle cx="18" cy="5" r="3" />
                <circle cx="6" cy="12" r="3" />
                <circle cx="18" cy="19" r="3" />
                <path d="M8.59 13.51l6.83 3.98M15.41 6.51l-6.82 3.98" />
              </svg>
            </button>
          ) : null}
          {onOpenChat ? (
            <button
              type="button"
              onClick={onOpenChat}
              className="shrink-0 p-1 text-muted hover:text-ink border border-transparent hover:border-fog"
              title="Luận giải với trụ trì"
              aria-label="Luận giải với trụ trì"
            >
              <svg
                viewBox="0 0 24 24"
                className="size-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </button>
          ) : null}
          {onToggleFullscreen ? (
            <button
              type="button"
              onClick={onToggleFullscreen}
              className="shrink-0 p-1 text-muted hover:text-ink border border-transparent hover:border-fog"
              title={isFullscreen ? 'Thu nhỏ' : 'Xem toàn màn hình'}
              aria-label={isFullscreen ? 'Thu nhỏ' : 'Xem toàn màn hình'}
            >
              {isFullscreen ? (
                <svg
                  viewBox="0 0 24 24"
                  className="size-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="square"
                  aria-hidden
                >
                  <path d="M9 3v6H3M15 3v6h6M9 21v-6H3M15 21v-6h6" />
                </svg>
              ) : (
                <svg
                  viewBox="0 0 24 24"
                  className="size-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="square"
                  aria-hidden
                >
                  <path d="M9 3H3v6M15 3h6v6M9 21H3v-6M15 21h6v-6" />
                </svg>
              )}
            </button>
          ) : null}
        </div>
      </div>
      <div className="border border-fog bg-white px-2.5 py-2">
        <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3 md:grid-cols-5 md:gap-2">
          <select
            className={SELECT}
            defaultValue=""
            aria-label="Lùi thời gian"
            onChange={(e) => {
              const key = e.target.value as StepKey;
              if (!key) return;
              applyStep(key, -1);
              e.target.value = '';
            }}
          >
            <option value="" disabled>
              − Lùi…
            </option>
            {MINUS_STEPS.map((s) => (
              <option key={s.key} value={s.key}>
                {s.label}
              </option>
            ))}
          </select>

          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value || todayDateInputValue())}
            className="min-w-0 w-full border border-fog px-2 py-1.5 text-xs bg-white text-ink"
          />

          <label className="min-w-0 flex items-center justify-center border border-fog px-2 py-1.5 text-xs">
            <span className="sr-only">Giờ địa chi</span>
            <select
              value={timeIndex}
              onChange={(e) => setTime(Number(e.target.value))}
              className="w-full min-w-0 border-0 bg-transparent text-xs font-medium underline underline-offset-2 cursor-pointer text-center"
              style={{ color: primaryColor }}
              title={`${slot.label} · ${slot.range}`}
            >
              {IZTRO_TIME_SLOTS.map((s) => (
                <option key={s.index} value={s.index}>
                  {s.label.replace(/^Giờ\s+/i, 'giờ ')}
                </option>
              ))}
            </select>
          </label>

          <select
            className={SELECT}
            defaultValue=""
            aria-label="Tiến thời gian"
            onChange={(e) => {
              const key = e.target.value as StepKey;
              if (!key) return;
              applyStep(key, 1);
              e.target.value = '';
            }}
          >
            <option value="" disabled>
              + Tiến…
            </option>
            {PLUS_STEPS.map((s) => (
              <option key={s.key} value={s.key}>
                {s.label}
              </option>
            ))}
          </select>

          <button
            type="button"
            className="min-w-0 w-full col-span-2 sm:col-span-1 md:col-span-1 px-2 py-1.5 text-xs border whitespace-nowrap text-white hover:opacity-90"
            style={{
              backgroundColor: primaryColor,
              borderColor: primaryColor,
            }}
            onClick={() => onChange(nowContextValue())}
          >
            Hôm nay
          </button>
        </div>
      </div>
    </div>
  );
}
