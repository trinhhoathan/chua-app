'use client';

import { openWaterDonateForm } from '@/lib/water-merit-prompt';

/**
 * Banner ngang kiểu CTA (cùng form với banner Sim) — ưu tiên thỉnh nước trên site chùa.
 */
export function WaterPromoBanner({
  primaryColor,
  templeName,
  className = 'mt-10',
}: {
  primaryColor: string;
  templeName?: string;
  className?: string;
}) {
  const chua = templeName?.trim() || 'chùa';

  return (
    <button
      type="button"
      onClick={() =>
        openWaterDonateForm({
          note: `Phát tâm thỉnh nước dâng ${chua}`,
          qty: 10,
        })
      }
      className={`flex w-full flex-wrap items-center justify-between gap-2 border px-4 py-3 text-left text-sm transition-colors hover:bg-mist ${className}`}
      style={{ borderColor: `${primaryColor}55` }}
    >
      <span className="text-ink">
        <span className="font-semibold" style={{ color: primaryColor }}>
          Thỉnh nước:
        </span>{' '}
        gieo duyên công đức dâng {chua} — mở khóa luận giải sâu hơn, hồi hướng
        cho gia đình.
      </span>
      <span className="shrink-0 text-xs font-semibold" style={{ color: primaryColor }}>
        Phát tâm thỉnh nước →
      </span>
    </button>
  );
}
