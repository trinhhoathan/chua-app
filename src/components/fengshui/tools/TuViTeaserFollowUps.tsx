'use client';

import { openWaterDonateForm } from '@/lib/water-merit-prompt';
import { useSitePersona } from '@/components/SitePersonaContext';

/**
 * ~5 câu hỏi gợi tò mò sau phần luận mẫu.
 * - Site chùa: bấm câu hỏi → mở form thỉnh nước để hỏi tiếp.
 * - Site Lý Gia (upsell sim): bấm câu hỏi → gọi thầy trực tiếp;
 *   kèm CTA xem kho sim.
 */
export function TuViTeaserFollowUps({
  suggestions,
  primaryColor,
  notePrefix = 'Hỏi sâu luận giải',
  contactPhone,
}: {
  suggestions: string[];
  primaryColor: string;
  notePrefix?: string;
  contactPhone?: string | null;
}) {
  const persona = useSitePersona();
  if (!suggestions.length) return null;

  const phoneHref = contactPhone
    ? `tel:${contactPhone.replace(/\s+/g, '')}`
    : null;
  const isSim = persona.upsell === 'sim';

  return (
    <div className="mt-4 pt-4 border-t border-fog space-y-2">
      <p className="text-[0.7rem] uppercase tracking-[0.2em]" style={{ color: primaryColor }}>
        Hỏi sâu thêm
      </p>
      <p className="text-sm text-muted leading-relaxed">
        {isSim
          ? `Muốn ${persona.displayName} luận tiếp những ý dưới đây? Gọi thầy trực tiếp — hoặc vào kho sim chọn ngay dãy số hợp mệnh đã chấm điểm sẵn.`
          : 'Chọn một câu dưới đây — thỉnh nước ủng hộ chùa để trụ trì luận tiếp cho quý vị.'}
      </p>
      <div className="flex flex-col gap-1.5">
        {suggestions.map((s) =>
          isSim ? (
            phoneHref ? (
              <a
                key={s}
                href={phoneHref}
                className="text-left text-sm border border-fog bg-paper/80 px-3 py-2.5 text-ink hover:border-ink/30 transition-colors"
              >
                <span className="text-muted mr-1.5" aria-hidden>
                  →
                </span>
                {s}
              </a>
            ) : (
              <p
                key={s}
                className="text-left text-sm border border-fog bg-paper/80 px-3 py-2.5 text-ink"
              >
                <span className="text-muted mr-1.5" aria-hidden>
                  →
                </span>
                {s}
              </p>
            )
          ) : (
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
          ),
        )}
      </div>
      {isSim ? (
        <div className="flex flex-wrap gap-2 pt-1">
          <a
            href="/sim"
            className="px-3 py-2 text-xs font-semibold text-white"
            style={{ background: primaryColor }}
          >
            Xem kho sim hợp mệnh
          </a>
          {phoneHref ? (
            <a
              href={phoneHref}
              className="px-3 py-2 text-xs border border-fog text-ink"
            >
              {persona.callLabel}
              {contactPhone ? ` · ${contactPhone}` : ''}
            </a>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
