'use client';

import { openWaterDonateForm } from '@/lib/water-merit-prompt';

/**
 * ~5 câu hỏi gợi tò mò sau phần luận mẫu.
 * Bấm câu hỏi → mở form thỉnh nước để hỏi tiếp.
 */
export function TuViTeaserFollowUps({
  suggestions,
  primaryColor,
  notePrefix = 'Hỏi sâu luận giải',
}: {
  suggestions: string[];
  primaryColor: string;
  notePrefix?: string;
}) {
  if (!suggestions.length) return null;

  return (
    <div className="mt-4 pt-4 border-t border-fog space-y-2">
      <p className="text-[0.7rem] uppercase tracking-[0.2em]" style={{ color: primaryColor }}>
        Hỏi sâu thêm
      </p>
      <p className="text-sm text-muted leading-relaxed">
        Chọn một câu dưới đây — thỉnh nước ủng hộ chùa để trụ trì luận tiếp cho
        quý vị.
      </p>
      <div className="flex flex-col gap-1.5">
        {suggestions.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() =>
              openWaterDonateForm({
                note: `${notePrefix}: ${s}`.slice(0, 180),
                qty: 10,
              })
            }
            className="text-left text-sm border border-fog bg-paper/80 px-3 py-2.5 text-ink hover:border-ink/30 transition-colors"
          >
            <span className="text-muted mr-1.5" aria-hidden>
              →
            </span>
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}
