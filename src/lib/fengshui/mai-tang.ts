/**
 * Ngày giờ mai táng — dựa engine chọn ngày (an táng: yi/ji nhật lịch,
 * Sát chủ âm, Trùng tang / Trùng phục nhật, Dương công kỵ…) + thông tin
 * ngày mất (đổi âm lịch, cảnh báo mất vào ngày trùng tang liên táng).
 */

import {
  checkChonNgayDay,
  folkBadDaysFor,
  scanChonNgayMonth,
  todayParts,
  type ChonNgayDayCheck,
  type ChonNgayMonthCell,
  type ChonNgayPerson,
  type FolkBadDay,
} from './chon-ngay';
import { getAlmanacDay } from './lunar-almanac';
import type { Verdict } from './rules';

/** Người liên quan để xét xung tuổi ngày an táng. */
export function maiTangPersons(input: {
  deceasedBirthYear?: number | null;
  eldestSonBirthYear?: number | null;
}): ChonNgayPerson[] {
  const persons: ChonNgayPerson[] = [];
  if (input.deceasedBirthYear) {
    persons.push({ birthYear: input.deceasedBirthYear, label: 'người mất' });
  }
  if (input.eldestSonBirthYear) {
    persons.push({ birthYear: input.eldestSonBirthYear, label: 'trưởng nam' });
  }
  return persons;
}

export interface DeathDayInfo {
  lunarLabel: string;
  weekLabel: string;
  dayCanChi: string;
  daoType: string;
  truc: string;
  /** Ngày mất phạm các kỵ tang lễ (Trùng tang nhật, Sát chủ âm…) */
  folkWarnings: FolkBadDay[];
  /** Mất nhằm ngày Trùng tang / Trùng phục — nguy cơ "trùng tang liên táng" */
  trungTangNhat: boolean;
  verdict: Verdict;
  note: string;
}

/** Phân tích ngày mất (dương lịch) theo góc nhìn tang lễ. */
export function deathDayInfo(
  year: number,
  month: number,
  day: number,
): DeathDayInfo {
  const almanac = getAlmanacDay(year, month, day);
  const folkWarnings = folkBadDaysFor(almanac, true);
  const trungTangNhat = folkWarnings.some(
    (f) => f.key === 'trung_tang_nhat' || f.key === 'trung_phuc_nhat',
  );

  let verdict: Verdict = 'good';
  let note =
    'Ngày mất không nhằm ngày Trùng tang / Trùng phục theo Ngọc Hạp Thông Thư.';
  if (trungTangNhat) {
    verdict = 'bad';
    note =
      'Người mất nhằm ngày Trùng tang / Trùng phục — dân gian gọi là nguy cơ "trùng tang liên táng". Nên kiểm tra thêm bằng công cụ Kiểm tra Trùng tang (4 bàn) và nhờ chùa làm lễ trấn trước khi an táng.';
  } else if (folkWarnings.length > 0) {
    verdict = 'caution';
    note = `Ngày mất phạm ${folkWarnings.map((f) => f.label).join(', ')} — nên làm lễ cầu siêu chu đáo và chọn ngày giờ an táng kỹ bên dưới.`;
  }

  return {
    lunarLabel: almanac.lunarLabel,
    weekLabel: almanac.weekLabel,
    dayCanChi: almanac.dayCanChi,
    daoType: almanac.daoType,
    truc: almanac.zhiXing,
    folkWarnings,
    trungTangNhat,
    verdict,
    note,
  };
}

/** Chấm một ngày an táng cụ thể. */
export function checkMaiTangDay(
  year: number,
  month: number,
  day: number,
  persons: ChonNgayPerson[],
): ChonNgayDayCheck {
  return checkChonNgayDay('an_tang', year, month, day, persons);
}

/** Quét tháng tìm ngày an táng thuận. */
export function scanMaiTangMonth(
  year: number,
  month: number,
  persons: ChonNgayPerson[],
): {
  cells: ChonNgayMonthCell[];
  goodDays: ChonNgayDayCheck[];
  badDays: ChonNgayDayCheck[];
} {
  return scanChonNgayMonth('an_tang', year, month, persons);
}

export { todayParts };
