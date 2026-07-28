'use client';

import type { BirthHourCandidate } from '@/lib/fengshui/iztro-chart';

interface Props {
  primaryColor: string;
  candidates: BirthHourCandidate[];
  selectedTimeIndex: number | null;
  onSelect: (timeIndex: number) => void;
  loading?: boolean;
}

export function TimGioSinhPanel({
  primaryColor,
  candidates,
  selectedTimeIndex,
  onSelect,
  loading,
}: Props) {
  return (
    <div className="border border-fog bg-white p-5 md:p-6 space-y-3">
      <div>
        <p
          className="text-[0.72rem] uppercase tracking-[0.25em]"
          style={{ color: primaryColor }}
        >
          Tìm giờ sinh
        </p>
        <p className="mt-1 text-sm text-muted leading-relaxed">
          So sánh 13 khung giờ theo iztro (tiếng Việt): chủ tinh cung Mệnh, cục
          số và vị trí Mệnh/Thân. Chọn dòng khớp thực tế nhất — đây là công cụ
          tham khảo, không thay thế định đĩa chuyên môn.
        </p>
      </div>

      {loading ? (
        <p className="text-sm text-muted">Đang đối chiếu các giờ…</p>
      ) : (
        <div className="overflow-x-auto border border-fog">
          <table className="w-full text-left text-sm min-w-[40rem]">
            <thead className="bg-mist/50 text-xs text-muted uppercase tracking-wide">
              <tr>
                <th className="px-3 py-2 font-medium">Giờ</th>
                <th className="px-3 py-2 font-medium">Chủ tinh</th>
                <th className="px-3 py-2 font-medium">Cục</th>
                <th className="px-3 py-2 font-medium">Mệnh / Thân</th>
                <th className="px-3 py-2 font-medium">Chủ / Thân tinh</th>
              </tr>
            </thead>
            <tbody>
              {candidates.map((c) => {
                const active = selectedTimeIndex === c.timeIndex;
                return (
                  <tr
                    key={c.timeIndex}
                    className="border-t border-fog cursor-pointer hover:bg-mist/40"
                    style={
                      active
                        ? { background: `${primaryColor}12` }
                        : undefined
                    }
                    onClick={() => onSelect(c.timeIndex)}
                  >
                    <td className="px-3 py-2.5 align-top">
                      <span className="font-medium text-ink">{c.timeLabel}</span>
                      <span className="block text-[0.7rem] text-muted">
                        {c.timeRange}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-ink">{c.majorStars || '—'}</td>
                    <td className="px-3 py-2.5 text-ink">
                      {c.fiveElementsClass}
                    </td>
                    <td className="px-3 py-2.5 text-ink">
                      <span className="block">{c.soulPalace}</span>
                      {c.bodyPalace ? (
                        <span className="block text-[0.7rem] text-muted">
                          Thân: {c.bodyPalace}
                        </span>
                      ) : null}
                    </td>
                    <td className="px-3 py-2.5 text-ink">
                      {c.soul}
                      {c.body ? ` · ${c.body}` : ''}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
