/**
 * Trình gợi ý Ngày Giờ Kích Sim — quét các ngày sắp tới bằng engine chọn ngày
 * (nhật lịch Hoàng đạo thật), lấy 3 khung giờ hoàng đạo gần nhất phù hợp việc
 * "khai trương / nạp tài" và không xung tuổi chủ sim (nếu biết năm sinh).
 * Server component — tính toán khi render, không cần API.
 */

import { checkChonNgayDay, type GoodHourSlot } from '@/lib/fengshui/chon-ngay';

export interface ActivationSlot {
  dateLabel: string;
  weekLabel: string;
  lunarLabel: string;
  dayCanChi: string;
  dayScore: number;
  hour: GoodHourSlot;
}

/** Hôm nay theo giờ Việt Nam (server có thể chạy UTC). */
function vnToday(): Date {
  return new Date(Date.now() + 7 * 3600 * 1000);
}

/**
 * Quét tối đa `scanDays` ngày kể từ ngày mai, trả về tối đa `limit` khung giờ
 * hoàng đạo (mỗi ngày lấy 1 giờ đẹp nhất để khách có nhiều lựa chọn ngày).
 */
export function findActivationSlots(
  birthYear?: number,
  limit = 3,
  scanDays = 14,
): ActivationSlot[] {
  const persons =
    birthYear && birthYear >= 1900 && birthYear <= 2100
      ? [{ birthYear, label: 'chủ sim' }]
      : [];

  const slots: ActivationSlot[] = [];
  const base = vnToday();

  for (let offset = 1; offset <= scanDays && slots.length < limit; offset++) {
    const d = new Date(base.getTime() + offset * 86400 * 1000);
    const y = d.getUTCFullYear();
    const m = d.getUTCMonth() + 1;
    const day = d.getUTCDate();

    let check: ReturnType<typeof checkChonNgayDay>;
    try {
      check = checkChonNgayDay('khai_truong', y, m, day, persons);
    } catch {
      continue;
    }

    // Bỏ ngày xấu: "mọi việc đều kiêng", điểm thấp hoặc kết luận bất lợi
    if (check.allForbidden || check.verdict === 'bad' || check.score < 55) continue;

    // Ưu tiên khung giờ ban ngày (07:00–20:59) để khách tiện gọi khai sim,
    // không có mới lấy giờ hoàng đạo bất kỳ trong ngày.
    const candidates = check.goodHours.filter((h) => h.recommended);
    const daytime = candidates.find((h) => {
      const start = Number(h.range.slice(0, 2));
      return Number.isFinite(start) && start >= 7 && start <= 19;
    });
    const goodHour = daytime ?? candidates[0];
    if (!goodHour) continue;

    slots.push({
      dateLabel: `${String(day).padStart(2, '0')}/${String(m).padStart(2, '0')}/${y}`,
      weekLabel: check.weekLabel,
      lunarLabel: check.lunarLabel,
      dayCanChi: check.dayCanChi,
      dayScore: check.score,
      hour: goodHour,
    });
  }

  return slots;
}

export function SimActivationHours({
  birthYear,
  primaryColor,
  compact = false,
}: {
  birthYear?: number;
  primaryColor: string;
  compact?: boolean;
}) {
  const slots = findActivationSlots(birthYear);
  if (slots.length === 0) return null;

  return (
    <div className={compact ? '' : 'border border-fog bg-paper p-5'}>
      <p className="text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-muted">
        Giờ hoàng đạo kích sim gần nhất
      </p>
      <p className="mt-1.5 text-[0.75rem] leading-relaxed text-muted">
        Khi nhận sim, thực hiện <span className="font-medium text-ink">cuộc gọi đầu tiên (khai sim)</span>{' '}
        vào khung giờ hoàng đạo để khai mở tối đa cát khí.
        {birthYear
          ? ` Các khung giờ dưới đây đã lọc bỏ giờ xung tuổi chủ sim (sinh ${birthYear}).`
          : ' Nhập ngày sinh ở phần trên để lọc thêm giờ xung tuổi.'}
      </p>
      <div className="mt-3 grid gap-2.5 sm:grid-cols-3">
        {slots.map((s, i) => (
          <div
            key={i}
            className="border px-3 py-2.5"
            style={{
              borderColor: i === 0 ? primaryColor : undefined,
              borderWidth: i === 0 ? 1.5 : 1,
              backgroundColor: i === 0 ? `${primaryColor}08` : undefined,
            }}
          >
            {i === 0 ? (
              <span
                className="text-[0.55rem] font-bold uppercase tracking-wide"
                style={{ color: primaryColor }}
              >
                Gần nhất
              </span>
            ) : null}
            <p className="text-sm font-semibold text-ink">
              {s.weekLabel}, {s.dateLabel}
            </p>
            <p className="text-[0.68rem] text-muted">
              {s.lunarLabel} · ngày {s.dayCanChi}
            </p>
            <p className="mt-1.5 text-[0.8rem] font-medium" style={{ color: primaryColor }}>
              Giờ {s.hour.chi} ({s.hour.range})
            </p>
            <p className="text-[0.66rem] text-muted">
              {s.hour.tianShen} · {s.hour.daoType}
            </p>
          </div>
        ))}
      </div>
      {!compact ? (
        <p className="mt-2.5 text-[0.68rem] leading-relaxed text-muted">
          Cần khung giờ khớp chính xác Bát Tự (giờ sinh, dụng thần)? Nhắn Zalo — thầy chọn
          đích danh ngày giờ khai sim miễn phí khi nhận sim.
        </p>
      ) : null}
    </div>
  );
}
