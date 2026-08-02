/**
 * Cải táng · bốc mộ — chọn ngày theo nhật lịch nên / kiêng
 * (Phá thổ, Khởi khoan, An táng, Di quan, Sửa mộ…).
 */

import {
  getAlmanacDay,
  todayParts,
  type AlmanacDay,
  type DayLuck,
} from './lunar-almanac';
import { formatCanChi, yearCanChi } from './lunar';
import { checkXungNam, type Verdict } from './rules';
import {
  folkBadDaysFor,
  goodHoursForAlmanac,
  xungTuoiNgay,
  type ChonNgayPerson,
  type FolkBadDay,
  type GoodHourSlot,
  type XungTuoiCheck,
} from './chon-ngay';

export type CaiTangStepId =
  | 'tong_quat'
  | 'pha_tho'
  | 'khoi_khoan'
  | 'an_tang'
  | 'di_quan'
  | 'sua_mo';

export interface CaiTangStep {
  id: CaiTangStepId;
  label: string;
  /** Nhãn khớp nhật lịch yi/ji */
  matchLabels: string[];
  hint: string;
}

export const CAI_TANG_STEPS: CaiTangStep[] = [
  {
    id: 'tong_quat',
    label: 'Cải táng (tổng)',
    matchLabels: ['An táng', 'Phá thổ', 'Khởi khoan', 'Di quan'],
    hint: 'Ngày thuận nếu có An táng / Phá thổ / Khởi khoan trong nên làm, và không bị kiêng các việc này.',
  },
  {
    id: 'pha_tho',
    label: 'Phá thổ',
    matchLabels: ['Phá thổ'],
    hint: 'Mở đất, phá huyệt cũ — bước đầu bốc mộ.',
  },
  {
    id: 'khoi_khoan',
    label: 'Khởi khoan · bốc',
    matchLabels: ['Khởi khoan'],
    hint: 'Khởi khoan / bốc hài cốt theo tục dân gian.',
  },
  {
    id: 'an_tang',
    label: 'An táng · cải táng',
    matchLabels: ['An táng'],
    hint: 'An táng lại (cát táng) sau khi bốc.',
  },
  {
    id: 'di_quan',
    label: 'Di quan',
    matchLabels: ['Di quan'],
    hint: 'Di dời quan / hài cốt.',
  },
  {
    id: 'sua_mo',
    label: 'Sửa mộ',
    matchLabels: ['Sửa mộ'],
    hint: 'Sửa sang, xây lại mộ phần.',
  },
];

export function getCaiTangStep(id: CaiTangStepId): CaiTangStep {
  return CAI_TANG_STEPS.find((s) => s.id === id) ?? CAI_TANG_STEPS[0];
}

function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFC')
    .replace(/\s*\/\s*/g, '/')
    .replace(/\s+/g, ' ')
    .trim();
}

function listHits(items: string[], labels: string[]): string[] {
  const norms = labels.map(normalize);
  return items.filter((t) => {
    const n = normalize(t);
    return norms.some((l) => n === l || n.includes(l) || l.includes(n));
  });
}

export interface CaiTangDayCheck {
  solarYear: number;
  solarMonth: number;
  solarDay: number;
  lunarLabel: string;
  weekLabel: string;
  dayCanChi: string;
  daoType: string;
  luck: DayLuck;
  luckLabel: string;
  yiHits: string[];
  jiHits: string[];
  inYi: boolean;
  inJi: boolean;
  allForbidden: boolean;
  /** Bách kỵ tang lễ dân gian (Trùng tang / Trùng phục / Sát chủ âm / Thọ tử…) */
  folkWarnings: FolkBadDay[];
  /** Xung tuổi theo NGÀY (chi ngày với tuổi người mất / trưởng nam) */
  xungDay: XungTuoiCheck[];
  /** Giờ hoàng đạo trong ngày, đã lọc giờ xung tuổi */
  goodHours: GoodHourSlot[];
  verdict: Verdict;
  verdictLabel: string;
  detail: string;
  yi: string[];
  ji: string[];
  xungDeceased: boolean | null;
  xungNote: string | null;
}

function verdictFor(
  step: CaiTangStep,
  almanac: AlmanacDay,
  yiHits: string[],
  jiHits: string[],
): { verdict: Verdict; verdictLabel: string; detail: string } {
  const allForbidden = almanac.ji.some((t) =>
    /mọi việc đều kiêng/i.test(t),
  );

  if (allForbidden) {
    return {
      verdict: 'bad',
      verdictLabel: 'Kiêng mọi việc',
      detail: 'Nhật lịch ghi “Mọi việc đều kiêng” — không nên cải táng / bốc mộ.',
    };
  }

  if (jiHits.length > 0 && yiHits.length === 0) {
    return {
      verdict: 'bad',
      verdictLabel: `Kiêng · ${step.label}`,
      detail: `Nhật lịch kiêng: ${jiHits.join(', ')}. Nên chọn ngày khác.`,
    };
  }

  if (yiHits.length > 0 && jiHits.length === 0) {
    const luckNote =
      almanac.luck === 'good'
        ? ' Kết hợp Hoàng đạo / ngày tốt.'
        : almanac.luck === 'bad'
          ? ' Dù nhật lịch nên, ngày đang Hắc đạo — cân nhắc thêm.'
          : '';
    return {
      verdict: almanac.luck === 'bad' ? 'caution' : 'good',
      verdictLabel: `Nên · ${step.label}`,
      detail: `Nhật lịch nên: ${yiHits.join(', ')}.${luckNote}`,
    };
  }

  if (yiHits.length > 0 && jiHits.length > 0) {
    return {
      verdict: 'caution',
      verdictLabel: 'Nên và kiêng lẫn',
      detail: `Có ${yiHits.join(', ')} trong nên nhưng cũng kiêng ${jiHits.join(', ')}. Nên hỏi trụ trì.`,
    };
  }

  if (almanac.luck === 'good') {
    return {
      verdict: 'caution',
      verdictLabel: 'Không nêu rõ — Hoàng đạo',
      detail: `Ngày tốt nhưng nhật lịch không nhắc ${step.matchLabels.join(' / ')}. Việc hệ trọng nên chọn ngày có trong mục nên làm.`,
    };
  }

  if (almanac.luck === 'bad') {
    return {
      verdict: 'bad',
      verdictLabel: 'Không nêu rõ — Hắc đạo',
      detail: 'Ngày xấu và không có việc cải táng trong nên làm — nên tránh.',
    };
  }

  return {
    verdict: 'caution',
    verdictLabel: 'Trung bình',
    detail: `Nhật lịch không nêu rõ cho ${step.label}. Nên chọn ngày có An táng / Phá thổ trong nên làm.`,
  };
}

export function checkCaiTangDay(
  year: number,
  month: number,
  day: number,
  stepId: CaiTangStepId,
  deceasedBirthYear?: number | null,
  eldestSonBirthYear?: number | null,
): CaiTangDayCheck {
  const step = getCaiTangStep(stepId);
  const almanac = getAlmanacDay(year, month, day);
  return checkFromAlmanac(almanac, step, deceasedBirthYear, eldestSonBirthYear);
}

function checkFromAlmanac(
  almanac: AlmanacDay,
  step: CaiTangStep,
  deceasedBirthYear?: number | null,
  eldestSonBirthYear?: number | null,
): CaiTangDayCheck {
  const yiHits = listHits(almanac.yi, step.matchLabels);
  const jiHits = listHits(almanac.ji, step.matchLabels);
  const allForbidden = almanac.ji.some((t) =>
    /mọi việc đều kiêng/i.test(t),
  );
  let { verdict, verdictLabel, detail } = verdictFor(
    step,
    almanac,
    yiHits,
    jiHits,
  );

  // Bách kỵ tang lễ dân gian (engine chọn ngày, chế độ tang lễ)
  const folkWarnings = folkBadDaysFor(almanac, true);
  const severeFolk = folkWarnings.filter((f) => f.severity === 'bad');
  if (severeFolk.length > 0 && verdict !== 'bad') {
    verdict = 'bad';
    verdictLabel = `Phạm ${severeFolk.map((f) => f.label).join(', ')}`;
    detail = `${detail} Ngày phạm ${severeFolk
      .map((f) => f.label)
      .join(', ')} — đại kỵ việc mồ mả, nên chọn ngày khác.`;
  } else if (folkWarnings.length > 0 && verdict === 'good') {
    verdict = 'caution';
    detail = `${detail} Lưu ý ngày phạm ${folkWarnings
      .map((f) => f.label)
      .join(', ')} (kiêng vừa) — cân nhắc thêm.`;
  }

  // Xung tuổi theo chi ngày với người mất / trưởng nam
  const persons: ChonNgayPerson[] = [];
  if (deceasedBirthYear && deceasedBirthYear >= 1900) {
    persons.push({ birthYear: deceasedBirthYear, label: 'người mất' });
  }
  if (eldestSonBirthYear && eldestSonBirthYear >= 1900) {
    persons.push({ birthYear: eldestSonBirthYear, label: 'trưởng nam' });
  }
  const xungDay = xungTuoiNgay(almanac, persons);
  const xungDayBad = xungDay.filter((x) => x.verdict === 'bad');
  if (xungDayBad.length > 0 && verdict !== 'bad') {
    verdict = 'bad';
    verdictLabel = `Ngày xung tuổi ${xungDayBad
      .map((x) => x.person.label)
      .join(', ')}`;
    detail = `${detail} ${xungDayBad.map((x) => x.detail).join(' ')}`;
  }

  const goodHours = goodHoursForAlmanac(almanac, persons).filter(
    (h) => h.recommended,
  );

  let xungDeceased: boolean | null = null;
  let xungNote: string | null = null;
  if (deceasedBirthYear && deceasedBirthYear >= 1900) {
    const xung = checkXungNam(deceasedBirthYear, almanac.solarYear);
    // Xung năm tiến hành cải táng với tuổi người mất (chi năm vs chi tuổi)
    xungDeceased = xung.verdict === 'caution';
    xungNote = xungDeceased
      ? `Năm ${almanac.solarYear} (${formatCanChi(yearCanChi(almanac.solarYear))}) xung tuổi người mất (${formatCanChi(yearCanChi(deceasedBirthYear))}).`
      : `Năm ${almanac.solarYear} không xung tuổi người mất (${formatCanChi(yearCanChi(deceasedBirthYear))}).`;
  }

  return {
    solarYear: almanac.solarYear,
    solarMonth: almanac.solarMonth,
    solarDay: almanac.solarDay,
    lunarLabel: almanac.lunarLabel,
    weekLabel: almanac.weekLabel,
    dayCanChi: almanac.dayCanChi,
    daoType: almanac.daoType,
    luck: almanac.luck,
    luckLabel: almanac.luckLabel,
    yiHits,
    jiHits,
    inYi: yiHits.length > 0,
    inJi: jiHits.length > 0,
    allForbidden,
    folkWarnings,
    xungDay,
    goodHours,
    verdict,
    verdictLabel,
    detail,
    yi: almanac.yi,
    ji: almanac.ji,
    xungDeceased,
    xungNote,
  };
}

export interface CaiTangMonthCell {
  solarYear: number;
  solarMonth: number;
  solarDay: number;
  inMonth: boolean;
  lunarDay: number;
  check: CaiTangDayCheck | null;
}

export function scanCaiTangMonth(
  year: number,
  month: number,
  stepId: CaiTangStepId,
  deceasedBirthYear?: number | null,
  eldestSonBirthYear?: number | null,
): {
  cells: CaiTangMonthCell[];
  goodDays: CaiTangDayCheck[];
  badDays: CaiTangDayCheck[];
} {
  const step = getCaiTangStep(stepId);
  const daysInMonth = new Date(year, month, 0).getDate();
  const firstWeek = new Date(year, month - 1, 1).getDay();
  const lead = (firstWeek + 6) % 7;

  const cells: CaiTangMonthCell[] = [];
  const goodDays: CaiTangDayCheck[] = [];
  const badDays: CaiTangDayCheck[] = [];

  const pushDay = (y: number, m: number, d: number, inMonth: boolean) => {
    const almanac = getAlmanacDay(y, m, d);
    const check = inMonth
      ? checkFromAlmanac(almanac, step, deceasedBirthYear, eldestSonBirthYear)
      : null;
    if (check?.verdict === 'good') goodDays.push(check);
    if (check?.verdict === 'bad') badDays.push(check);
    cells.push({
      solarYear: y,
      solarMonth: m,
      solarDay: d,
      inMonth,
      lunarDay: almanac.lunarDay,
      check,
    });
  };

  for (let i = lead; i > 0; i--) {
    const dt = new Date(year, month - 1, 1 - i);
    pushDay(dt.getFullYear(), dt.getMonth() + 1, dt.getDate(), false);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    pushDay(year, month, d, true);
  }
  while (cells.length % 7 !== 0) {
    const last = cells[cells.length - 1];
    const dt = new Date(last.solarYear, last.solarMonth - 1, last.solarDay + 1);
    pushDay(dt.getFullYear(), dt.getMonth() + 1, dt.getDate(), false);
  }

  return { cells, goodDays, badDays };
}

export { todayParts };
