'use client';

import {
  pickRandomTempleColor,
  TEMPLE_COLOR_PALETTE,
} from '@/lib/temple-defaults';

export function TempleColorPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (color: string) => void;
}) {
  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        <span
          className="inline-block h-8 w-8 border border-fog shrink-0"
          style={{ backgroundColor: value }}
          title={value}
        />
        <code className="text-xs text-muted tabular-nums">{value}</code>
        <button
          type="button"
          className="text-xs px-2 py-1.5 border border-ink/20 hover:bg-mist"
          onClick={() => onChange(pickRandomTempleColor(value))}
        >
          Đổi màu ngẫu nhiên
        </button>
      </div>
      <div className="mt-3 max-h-40 overflow-y-auto border border-fog p-2 bg-mist/40">
        <div className="grid grid-cols-10 sm:grid-cols-12 gap-1">
          {TEMPLE_COLOR_PALETTE.map((c) => {
            const selected = value.toLowerCase() === c.toLowerCase();
            return (
              <button
                key={c}
                type="button"
                title={c}
                aria-label={`Chọn màu ${c}`}
                aria-pressed={selected}
                onClick={() => onChange(c)}
                className={`aspect-square w-full border ${
                  selected
                    ? 'border-ink ring-1 ring-ink scale-110 z-[1]'
                    : 'border-fog hover:border-ink/40'
                }`}
                style={{ backgroundColor: c }}
              />
            );
          })}
        </div>
      </div>
      <p className="mt-1.5 text-[11px] text-muted">
        {TEMPLE_COLOR_PALETTE.length} màu — bấm ô để chọn hoặc đổi ngẫu nhiên.
      </p>
    </div>
  );
}
