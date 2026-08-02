/**
 * Engine chọn ngày dùng chung cho nhóm "Hệ trọng".
 *
 * Nguồn dữ liệu: nhật lịch lunar-typescript (qua lunar-almanac.ts) —
 * Hoàng/Hắc đạo thật theo thần sát, 12 Trực, Nhị thập bát tú, nên/kiêng.
 * Bổ sung bảng bách kỵ dân gian Việt (Tam nương, Nguyệt kỵ, Sát chủ,
 * Thọ tử, Vãng vong, Dương công kỵ nhật, Trùng tang/Trùng phục nhật)
 * và kiểm tra xung tuổi người xem theo can chi ngày.
 */

import {
  getAlmanacDay,
  todayParts,
  type AlmanacDay,
  type DayLuck,
} from './lunar-almanac';
import { CAN, CHI, yearCanChi, type Can, type Chi } from './lunar';
import { CAN_HANH, KHAC } from './nap-am-ngu-hanh';
import type { Verdict } from './rules';

// ---------------------------------------------------------------------------
// Việc cần chọn ngày
// ---------------------------------------------------------------------------

export type ChonNgayActivityId =
  | 'khoi_cong'
  | 'nhap_trach'
  | 'khai_truong'
  | 'mo_cua_hang'
  | 'an_tang'
  | 'cuoi_hoi';

export interface ChonNgayActivity {
  id: ChonNgayActivityId;
  label: string;
  /** Nhãn (đã Việt hóa) khớp mục nên / kiêng của nhật lịch */
  matchLabels: string[];
  /** Việc tang lễ → dùng bảng Sát chủ âm + kiêng Trùng tang / Trùng phục */
  burial: boolean;
  hint: string;
}

export const CHON_NGAY_ACTIVITIES: Record<ChonNgayActivityId, ChonNgayActivity> =
  {
    khoi_cong: {
      id: 'khoi_cong',
      label: 'Khởi công · động thổ',
      matchLabels: ['Động thổ', 'Phá thổ', 'Khởi nền', 'Tu tạo'],
      burial: false,
      hint: 'Ngày thuận khi nhật lịch nên Động thổ / Phá thổ / Khởi nền, tránh ngày kiêng và ngày xung tuổi gia chủ.',
    },
    nhap_trach: {
      id: 'nhap_trach',
      label: 'Nhập trạch — về nhà mới',
      matchLabels: ['Nhập trạch', 'Di chuyển nhà'],
      burial: false,
      hint: 'Ngày thuận khi nhật lịch nên Nhập trạch / Di chuyển nhà, tránh ngày xung tuổi vợ chồng gia chủ.',
    },
    khai_truong: {
      id: 'khai_truong',
      label: 'Khai trương công ty',
      matchLabels: ['Khai trương', 'Lập khế', 'Giao dịch', 'Nạp tài'],
      burial: false,
      hint: 'Ngày thuận khi nhật lịch nên Khai trương / Giao dịch / Lập khế, kết hợp Hoàng đạo và tránh xung tuổi người đứng đầu.',
    },
    mo_cua_hang: {
      id: 'mo_cua_hang',
      label: 'Mở cửa hàng',
      matchLabels: ['Khai trương', 'Giao dịch', 'Nạp tài', 'Treo biển'],
      burial: false,
      hint: 'Ngày thuận khi nhật lịch nên Khai trương / Giao dịch / Nạp tài, tránh xung tuổi chủ cửa hàng.',
    },
    an_tang: {
      id: 'an_tang',
      label: 'An táng · mai táng',
      matchLabels: ['An táng', 'Nhập liệm', 'Di quan'],
      burial: true,
      hint: 'Ngày thuận khi nhật lịch nên An táng / Nhập liệm / Di quan; kiêng nghiêm ngày Trùng tang, Trùng phục, Sát chủ âm.',
    },
    cuoi_hoi: {
      id: 'cuoi_hoi',
      label: 'Cưới hỏi',
      matchLabels: ['Cưới hỏi', 'Đính ước', 'Nạp thái'],
      burial: false,
      hint: 'Ngày thuận khi nhật lịch nên Cưới hỏi / Nạp thái, tránh Tam nương và ngày xung tuổi hai họ.',
    },
  };

export function getChonNgayActivity(id: ChonNgayActivityId): ChonNgayActivity {
  return CHON_NGAY_ACTIVITIES[id];
}

// ---------------------------------------------------------------------------
// Bảng bách kỵ dân gian (đã đối chiếu Ngọc Hạp Thông Thư / lịch vạn niên VN)
// ---------------------------------------------------------------------------

/** Tam nương: ngày 3, 7, 13, 18, 22, 27 âm lịch. */
const TAM_NUONG_DAYS = new Set([3, 7, 13, 18, 22, 27]);

/** Nguyệt kỵ: ngày 5, 14, 23 âm lịch. */
const NGUYET_KY_DAYS = new Set([5, 14, 23]);

/**
 * Sát chủ dương theo tháng âm (kỵ xây cất, cưới gả, đại sự dương trạch):
 * tháng 1: Tý; 2, 3, 7, 9: Sửu; 4: Tuất; 11: Mùi; 5, 6, 8, 10, 12: Thìn.
 */
const SAT_CHU_DUONG: Record<number, Chi> = {
  1: 'Tý',
  2: 'Sửu',
  3: 'Sửu',
  4: 'Tuất',
  5: 'Thìn',
  6: 'Thìn',
  7: 'Sửu',
  8: 'Thìn',
  9: 'Sửu',
  10: 'Thìn',
  11: 'Mùi',
  12: 'Thìn',
};

/**
 * Sát chủ âm theo tháng âm (kỵ mai táng, cải táng):
 * "Nhứt Tỵ, nhị Tý, tam Dương (Mùi), tứ Mão, ngũ Hầu (Thân), lục Khuyển (Tuất),
 *  thất Ngưu? — bản phổ biến: 7 Hợi, 8 Sửu, 9 Ngọ, 10 Dậu, 11 Dần, 12 Thìn."
 */
const SAT_CHU_AM: Record<number, Chi> = {
  1: 'Tỵ',
  2: 'Tý',
  3: 'Mùi',
  4: 'Mão',
  5: 'Thân',
  6: 'Tuất',
  7: 'Hợi',
  8: 'Sửu',
  9: 'Ngọ',
  10: 'Dậu',
  11: 'Dần',
  12: 'Thìn',
};

/** Thọ tử (trăm sự đều kỵ) — can chi ngày theo tháng âm. */
const THO_TU: Record<number, { can: Can; chi: Chi }> = {
  1: { can: 'Bính', chi: 'Tuất' },
  2: { can: 'Nhâm', chi: 'Thìn' },
  3: { can: 'Tân', chi: 'Hợi' },
  4: { can: 'Đinh', chi: 'Tỵ' },
  5: { can: 'Mậu', chi: 'Tý' },
  6: { can: 'Bính', chi: 'Ngọ' },
  7: { can: 'Ất', chi: 'Sửu' },
  8: { can: 'Quý', chi: 'Mùi' },
  9: { can: 'Giáp', chi: 'Dần' },
  10: { can: 'Mậu', chi: 'Thân' },
  11: { can: 'Tân', chi: 'Mão' },
  12: { can: 'Tân', chi: 'Dậu' },
};

/** Vãng vong (kỵ xuất hành, cưới hỏi, an táng, nhậm chức) — chi ngày theo tháng âm. */
const VANG_VONG: Record<number, Chi> = {
  1: 'Dần',
  2: 'Tỵ',
  3: 'Thân',
  4: 'Hợi',
  5: 'Mão',
  6: 'Ngọ',
  7: 'Dậu',
  8: 'Tý',
  9: 'Thìn',
  10: 'Mùi',
  11: 'Tuất',
  12: 'Sửu',
};

/** Dương công kỵ nhật — 13 ngày âm lịch trong năm, trăm sự đều kỵ. */
const DUONG_CONG_KY: Record<number, number[]> = {
  1: [13],
  2: [11],
  3: [9],
  4: [7],
  5: [5],
  6: [3],
  7: [1, 29],
  8: [27],
  9: [25],
  10: [23],
  11: [21],
  12: [19],
};

/** Sao Trùng tang — can ngày theo tháng âm (Ngọc Hạp Thông Thư). */
const TRUNG_TANG_CAN: Record<number, Can> = {
  1: 'Giáp',
  2: 'Ất',
  3: 'Kỷ',
  4: 'Bính',
  5: 'Đinh',
  6: 'Kỷ',
  7: 'Canh',
  8: 'Tân',
  9: 'Kỷ',
  10: 'Nhâm',
  11: 'Quý',
  12: 'Kỷ',
};

/** Sao Trùng phục — can ngày theo tháng âm (Ngọc Hạp Thông Thư). */
const TRUNG_PHUC_CAN: Record<number, Can> = {
  1: 'Canh',
  2: 'Tân',
  3: 'Kỷ',
  4: 'Nhâm',
  5: 'Quý',
  6: 'Mậu',
  7: 'Giáp',
  8: 'Ất',
  9: 'Kỷ',
  10: 'Nhâm',
  11: 'Quý',
  12: 'Kỷ',
};

// ---------------------------------------------------------------------------
// Quan hệ can chi
// ---------------------------------------------------------------------------

const LUC_XUNG_PAIRS: Array<[Chi, Chi]> = [
  ['Tý', 'Ngọ'],
  ['Sửu', 'Mùi'],
  ['Dần', 'Thân'],
  ['Mão', 'Dậu'],
  ['Thìn', 'Tuất'],
  ['Tỵ', 'Hợi'],
];

const LUC_HAI_PAIRS: Array<[Chi, Chi]> = [
  ['Tý', 'Mùi'],
  ['Sửu', 'Ngọ'],
  ['Dần', 'Tỵ'],
  ['Mão', 'Thìn'],
  ['Thân', 'Hợi'],
  ['Dậu', 'Tuất'],
];

function inPairs(pairs: Array<[Chi, Chi]>, a: Chi, b: Chi): boolean {
  return pairs.some(([x, y]) => (x === a && y === b) || (x === b && y === a));
}

export function isLucXung(a: Chi, b: Chi): boolean {
  return inPairs(LUC_XUNG_PAIRS, a, b);
}

export function isLucHai(a: Chi, b: Chi): boolean {
  return inPairs(LUC_HAI_PAIRS, a, b);
}

/** Chi xung với chi cho trước (đối cung, +6). */
export function xungChiOf(c: Chi): Chi {
  return CHI[(CHI.indexOf(c) + 6) % 12];
}

/** Tách "Giáp Tý" (chuỗi Việt hóa từ nhật lịch) → { can, chi }. */
export function parseCanChi(s: string): { can: Can; chi: Chi } | null {
  const [c1, c2] = s.trim().split(/\s+/);
  const can = CAN.find((c) => c === c1);
  const chi = CHI.find((c) => c === c2);
  return can && chi ? { can, chi } : null;
}

// ---------------------------------------------------------------------------
// Kết quả kiểm tra
// ---------------------------------------------------------------------------

/** Người liên quan (gia chủ, vợ/chồng, người mất…) để xét xung tuổi. */
export interface ChonNgayPerson {
  /** Năm sinh ÂM LỊCH (sinh trước Tết tính năm trước). */
  birthYear: number;
  label: string;
}

export interface DayCriterion {
  key: string;
  label: string;
  verdict: Verdict;
  detail: string;
}

export interface GoodHourSlot {
  chi: string;
  ganZhi: string;
  range: string;
  tianShen: string;
  daoType: string;
  luck: DayLuck;
  /** Người bị giờ này xung tuổi (chi giờ lục xung chi tuổi) */
  xungPersons: string[];
  /** Giờ hoàng đạo và không xung tuổi ai */
  recommended: boolean;
}

export interface ChonNgayDayCheck {
  solarYear: number;
  solarMonth: number;
  solarDay: number;
  lunarDay: number;
  lunarMonth: number;
  lunarLabel: string;
  weekLabel: string;
  dayCanChi: string;
  daoType: string;
  luck: DayLuck;
  luckLabel: string;
  truc: string;
  xiu: string;
  xiuLuck: string;
  inYi: boolean;
  inJi: boolean;
  yiHits: string[];
  jiHits: string[];
  allForbidden: boolean;
  criteria: DayCriterion[];
  /** 0–100, càng cao càng thuận */
  score: number;
  verdict: Verdict;
  verdictLabel: string;
  detail: string;
  yi: string[];
  ji: string[];
  hours: GoodHourSlot[];
  goodHours: GoodHourSlot[];
}

// ---------------------------------------------------------------------------
// Khớp nên / kiêng
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// 12 Trực: Trừ · Nguy · Định · Chấp · Thành · Khai = cát;
// Kiến · Mãn · Bình · Thu = tùy việc; Phá · Bế = hung.
// ---------------------------------------------------------------------------

const TRUC_GOOD = new Set(['Trừ', 'Nguy', 'Định', 'Chấp', 'Thành', 'Khai']);
const TRUC_BAD = new Set(['Phá', 'Bế']);

function trucVerdict(truc: string): Verdict {
  if (TRUC_GOOD.has(truc)) return 'good';
  if (TRUC_BAD.has(truc)) return 'bad';
  return 'caution';
}

// ---------------------------------------------------------------------------
// Bách kỵ dân gian cho một ngày
// ---------------------------------------------------------------------------

export interface FolkBadDay {
  key: string;
  label: string;
  /** 'bad' = đại kỵ; 'caution' = kiêng vừa */
  severity: Extract<Verdict, 'bad' | 'caution'>;
  detail: string;
}

/**
 * Liệt kê các ngày kỵ dân gian rơi vào ngày này.
 * @param burial việc tang lễ → thêm Sát chủ âm, Trùng tang, Trùng phục.
 */
export function folkBadDaysFor(
  almanac: AlmanacDay,
  burial: boolean,
): FolkBadDay[] {
  const out: FolkBadDay[] = [];
  const lm = almanac.lunarMonth;
  const ld = almanac.lunarDay;
  const cc = parseCanChi(almanac.dayCanChi);
  if (!cc) return out;

  if (TAM_NUONG_DAYS.has(ld)) {
    out.push({
      key: 'tam_nuong',
      label: 'Tam nương',
      severity: 'caution',
      detail: `Ngày ${ld} âm là ngày Tam nương (3, 7, 13, 18, 22, 27 âm) — dân gian kiêng khởi sự lớn.`,
    });
  }
  if (NGUYET_KY_DAYS.has(ld)) {
    out.push({
      key: 'nguyet_ky',
      label: 'Nguyệt kỵ',
      severity: 'caution',
      detail: `Ngày ${ld} âm là ngày Nguyệt kỵ (5, 14, 23 âm) — "mùng năm, mười bốn, hăm ba; đi chơi cũng lỗ nữa là đi buôn".`,
    });
  }
  if ((DUONG_CONG_KY[lm] ?? []).includes(ld)) {
    out.push({
      key: 'duong_cong',
      label: 'Dương công kỵ nhật',
      severity: 'bad',
      detail: `Ngày ${ld}/${lm} âm là một trong 13 ngày Dương công kỵ nhật — trăm sự đều kỵ.`,
    });
  }

  const satChuDuong = SAT_CHU_DUONG[lm];
  if (!burial && satChuDuong === cc.chi) {
    out.push({
      key: 'sat_chu',
      label: 'Sát chủ',
      severity: 'bad',
      detail: `Tháng ${lm} âm, ngày chi ${cc.chi} phạm Sát chủ (dương) — đại kỵ xây cất, cưới gả, khai trương.`,
    });
  }
  const satChuAm = SAT_CHU_AM[lm];
  if (burial && satChuAm === cc.chi) {
    out.push({
      key: 'sat_chu_am',
      label: 'Sát chủ âm',
      severity: 'bad',
      detail: `Tháng ${lm} âm, ngày chi ${cc.chi} phạm Sát chủ âm — đại kỵ mai táng, cải táng.`,
    });
  }

  const thoTu = THO_TU[lm];
  if (thoTu && thoTu.can === cc.can && thoTu.chi === cc.chi) {
    out.push({
      key: 'tho_tu',
      label: 'Thọ tử',
      severity: 'bad',
      detail: `Tháng ${lm} âm, ngày ${cc.can} ${cc.chi} là ngày Thọ tử — trăm sự đều kỵ.`,
    });
  }

  if (VANG_VONG[lm] === cc.chi) {
    out.push({
      key: 'vang_vong',
      label: 'Vãng vong',
      severity: 'caution',
      detail: `Tháng ${lm} âm, ngày chi ${cc.chi} là ngày Vãng vong — kiêng xuất hành, cưới hỏi, an táng, nhậm chức.`,
    });
  }

  if (burial) {
    if (TRUNG_TANG_CAN[lm] === cc.can) {
      out.push({
        key: 'trung_tang_nhat',
        label: 'Ngày Trùng tang',
        severity: 'bad',
        detail: `Tháng ${lm} âm, ngày can ${cc.can} phạm sao Trùng tang — đại kỵ an táng, cải táng (sợ tang liên tiếp).`,
      });
    }
    if (TRUNG_PHUC_CAN[lm] === cc.can) {
      out.push({
        key: 'trung_phuc_nhat',
        label: 'Ngày Trùng phục',
        severity: 'bad',
        detail: `Tháng ${lm} âm, ngày can ${cc.can} phạm sao Trùng phục — kiêng an táng, kiêng cưới gả.`,
      });
    }
  }

  return out;
}

// ---------------------------------------------------------------------------
// Xung tuổi người xem theo ngày
// ---------------------------------------------------------------------------

export interface XungTuoiCheck {
  person: ChonNgayPerson;
  personCanChi: string;
  /** 'bad' = lục xung (nặng hơn nếu thiên khắc địa xung); 'caution' = lục hại; 'good' = không phạm */
  verdict: Verdict;
  detail: string;
}

export function xungTuoiNgay(
  almanac: AlmanacDay,
  persons: ChonNgayPerson[],
): XungTuoiCheck[] {
  const cc = parseCanChi(almanac.dayCanChi);
  if (!cc) return [];
  return persons
    .filter((p) => p.birthYear >= 1900 && p.birthYear <= 2100)
    .map((p) => {
      const birth = yearCanChi(p.birthYear);
      const personCanChi = `${birth.can} ${birth.chi}`;
      if (isLucXung(cc.chi, birth.chi)) {
        const canClash =
          KHAC[CAN_HANH[cc.can]] === CAN_HANH[birth.can] ||
          KHAC[CAN_HANH[birth.can]] === CAN_HANH[cc.can];
        return {
          person: p,
          personCanChi,
          verdict: 'bad' as Verdict,
          detail: canClash
            ? `Ngày ${cc.can} ${cc.chi} thiên khắc địa xung với tuổi ${personCanChi} (${p.label}) — xung nặng, nên tránh hẳn.`
            : `Chi ngày ${cc.chi} lục xung chi tuổi ${birth.chi} (${p.label}) — ngày xung tuổi, nên tránh.`,
        };
      }
      if (isLucHai(cc.chi, birth.chi)) {
        return {
          person: p,
          personCanChi,
          verdict: 'caution' as Verdict,
          detail: `Chi ngày ${cc.chi} lục hại chi tuổi ${birth.chi} (${p.label}) — kém thuận, cân nhắc.`,
        };
      }
      return {
        person: p,
        personCanChi,
        verdict: 'good' as Verdict,
        detail: `Ngày không xung tuổi ${personCanChi} (${p.label}).`,
      };
    });
}

// ---------------------------------------------------------------------------
// Giờ tốt trong ngày
// ---------------------------------------------------------------------------

export function goodHoursForAlmanac(
  almanac: AlmanacDay,
  persons: ChonNgayPerson[] = [],
): GoodHourSlot[] {
  const birthChis = persons
    .filter((p) => p.birthYear >= 1900 && p.birthYear <= 2100)
    .map((p) => ({ chi: yearCanChi(p.birthYear).chi, label: p.label }));

  // 13 canh giờ của lunar-typescript (Tý sớm + 11 giờ + Tý muộn) — gộp theo chi
  const seen = new Set<string>();
  const slots: GoodHourSlot[] = [];
  for (const h of almanac.hours) {
    const chi = h.chi;
    if (seen.has(`${chi}-${h.range}`)) continue;
    seen.add(`${chi}-${h.range}`);
    const chiTyped = CHI.find((c) => c === chi);
    const xungPersons = chiTyped
      ? birthChis
          .filter((b) => isLucXung(chiTyped, b.chi))
          .map((b) => b.label)
      : [];
    slots.push({
      chi,
      ganZhi: h.ganZhi,
      range: h.range,
      tianShen: h.tianShen,
      daoType: h.daoType,
      luck: h.luck,
      xungPersons,
      recommended: h.luck === 'good' && xungPersons.length === 0,
    });
  }
  return slots;
}

// ---------------------------------------------------------------------------
// Chấm điểm một ngày
// ---------------------------------------------------------------------------

function clamp(n: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, n));
}

export function checkChonNgayDay(
  activityId: ChonNgayActivityId,
  year: number,
  month: number,
  day: number,
  persons: ChonNgayPerson[] = [],
): ChonNgayDayCheck {
  const almanac = getAlmanacDay(year, month, day);
  return checkFromAlmanac(almanac, activityId, persons);
}

export function checkFromAlmanac(
  almanac: AlmanacDay,
  activityId: ChonNgayActivityId,
  persons: ChonNgayPerson[] = [],
): ChonNgayDayCheck {
  const activity = getChonNgayActivity(activityId);
  const yiHits = listHits(almanac.yi, activity.matchLabels);
  const jiHits = listHits(almanac.ji, activity.matchLabels);
  const inYi = yiHits.length > 0;
  const inJi = jiHits.length > 0;
  const allForbidden = almanac.ji.some((t) => /mọi việc đều kiêng/i.test(t));

  const criteria: DayCriterion[] = [];
  let score = 50;

  // 1. Nên / kiêng theo nhật lịch — tín hiệu chính
  if (allForbidden) {
    score -= 45;
    criteria.push({
      key: 'nhat_lich',
      label: 'Nhật lịch nên · kiêng',
      verdict: 'bad',
      detail: 'Nhật lịch ghi "Mọi việc đều kiêng" — không nên chọn ngày này.',
    });
  } else if (inYi && !inJi) {
    score += 22;
    criteria.push({
      key: 'nhat_lich',
      label: 'Nhật lịch nên · kiêng',
      verdict: 'good',
      detail: `Nhật lịch có ${yiHits.join(', ')} trong mục nên làm.`,
    });
  } else if (inJi && !inYi) {
    score -= 28;
    criteria.push({
      key: 'nhat_lich',
      label: 'Nhật lịch nên · kiêng',
      verdict: 'bad',
      detail: `Nhật lịch kiêng ${jiHits.join(', ')} — nên chọn ngày khác.`,
    });
  } else if (inYi && inJi) {
    criteria.push({
      key: 'nhat_lich',
      label: 'Nhật lịch nên · kiêng',
      verdict: 'caution',
      detail: `Nên (${yiHits.join(', ')}) và kiêng (${jiHits.join(', ')}) lẫn nhau — nên hỏi thêm thầy / trụ trì.`,
    });
  } else {
    score -= 5;
    criteria.push({
      key: 'nhat_lich',
      label: 'Nhật lịch nên · kiêng',
      verdict: 'caution',
      detail: `Nhật lịch không nhắc ${activity.matchLabels.join(' / ')} trong ngày này — việc hệ trọng nên ưu tiên ngày được ghi rõ.`,
    });
  }

  // 2. Hoàng đạo / Hắc đạo (thần sát thật theo tháng âm + chi ngày)
  if (almanac.luck === 'good') {
    score += 10;
    criteria.push({
      key: 'hoang_dao',
      label: 'Hoàng đạo · Hắc đạo',
      verdict: 'good',
      detail: `Ngày ${almanac.tianShen} — ${almanac.daoType}.`,
    });
  } else if (almanac.luck === 'bad') {
    score -= 10;
    criteria.push({
      key: 'hoang_dao',
      label: 'Hoàng đạo · Hắc đạo',
      verdict: 'caution',
      detail: `Ngày ${almanac.tianShen} — ${almanac.daoType}. Nên cân nhắc hoặc chọn giờ hoàng đạo kỹ.`,
    });
  } else {
    criteria.push({
      key: 'hoang_dao',
      label: 'Hoàng đạo · Hắc đạo',
      verdict: 'caution',
      detail: `Ngày ${almanac.tianShen} — trung bình.`,
    });
  }

  // 3. Mười hai Trực
  const tVerdict = trucVerdict(almanac.zhiXing);
  if (tVerdict === 'good') score += 6;
  if (tVerdict === 'bad') score -= 12;
  criteria.push({
    key: 'truc',
    label: 'Mười hai Trực',
    verdict: tVerdict,
    detail:
      tVerdict === 'good'
        ? `Trực ${almanac.zhiXing} — thuộc nhóm trực tốt (Trừ, Nguy, Định, Chấp, Thành, Khai).`
        : tVerdict === 'bad'
          ? `Trực ${almanac.zhiXing} — Phá / Bế là trực xấu, kiêng khởi sự.`
          : `Trực ${almanac.zhiXing} — trực trung bình, tốt xấu tùy việc.`,
  });

  // 4. Nhị thập bát tú
  const xiuGood = almanac.xiuLuck === 'Tốt';
  score += xiuGood ? 5 : -5;
  criteria.push({
    key: 'xiu',
    label: 'Nhị thập bát tú',
    verdict: xiuGood ? 'good' : 'caution',
    detail: `Sao ${almanac.xiu} — ${almanac.xiuLuck.toLowerCase()}.`,
  });

  // 5. Bách kỵ dân gian
  const folks = folkBadDaysFor(almanac, activity.burial);
  for (const f of folks) {
    score -= f.severity === 'bad' ? 20 : 12;
    criteria.push({
      key: f.key,
      label: f.label,
      verdict: f.severity,
      detail: f.detail,
    });
  }

  // 6. Xung tuổi người xem
  const xungChecks = xungTuoiNgay(almanac, persons);
  for (const x of xungChecks) {
    if (x.verdict === 'bad') score -= 20;
    else if (x.verdict === 'caution') score -= 8;
    criteria.push({
      key: `xung_tuoi_${x.person.label}`,
      label: `Xung tuổi — ${x.person.label}`,
      verdict: x.verdict,
      detail: x.detail,
    });
  }

  score = clamp(Math.round(score), 0, 100);

  // Kết luận
  const hasBad = criteria.some((c) => c.verdict === 'bad');
  const hasFolkCaution = folks.some((f) => f.severity === 'caution');
  const hasXungCaution = xungChecks.some((x) => x.verdict === 'caution');

  let verdict: Verdict;
  let verdictLabel: string;
  let detail: string;

  if (hasBad) {
    verdict = 'bad';
    const badLabels = criteria
      .filter((c) => c.verdict === 'bad')
      .map((c) => c.label);
    verdictLabel = `Nên tránh — ${badLabels.join(', ')}`;
    detail = `Ngày phạm: ${badLabels.join(', ')}. Việc "${activity.label}" nên chọn ngày khác.`;
  } else if (
    inYi &&
    almanac.luck !== 'bad' &&
    !hasFolkCaution &&
    !hasXungCaution
  ) {
    verdict = 'good';
    verdictLabel = `Ngày tốt · nên ${activity.label}`;
    detail = `Nhật lịch nên ${yiHits.join(', ')}, ${almanac.daoType.toLowerCase()}, không phạm bách kỵ, không xung tuổi. Chọn thêm giờ hoàng đạo bên dưới.`;
  } else if (inYi) {
    verdict = 'caution';
    verdictLabel = 'Dùng được — có điểm cần lưu ý';
    const notes = [
      almanac.luck === 'bad' ? 'ngày Hắc đạo' : '',
      hasFolkCaution
        ? folks
            .filter((f) => f.severity === 'caution')
            .map((f) => f.label)
            .join(', ')
        : '',
      hasXungCaution ? 'lục hại tuổi người xem' : '',
    ].filter(Boolean);
    detail = `Nhật lịch nên ${yiHits.join(', ')} nhưng ${notes.join('; ')} — cân nhắc hoặc hỏi thêm.`;
  } else {
    verdict = 'caution';
    verdictLabel = 'Trung bình — không nêu rõ';
    detail = `Ngày không phạm kỵ lớn nhưng nhật lịch không ghi rõ nên "${activity.label}". Việc hệ trọng nên ưu tiên ngày có trong mục nên làm.`;
  }

  const hours = goodHoursForAlmanac(almanac, persons);

  return {
    solarYear: almanac.solarYear,
    solarMonth: almanac.solarMonth,
    solarDay: almanac.solarDay,
    lunarDay: almanac.lunarDay,
    lunarMonth: almanac.lunarMonth,
    lunarLabel: almanac.lunarLabel,
    weekLabel: almanac.weekLabel,
    dayCanChi: almanac.dayCanChi,
    daoType: almanac.daoType,
    luck: almanac.luck,
    luckLabel: almanac.luckLabel,
    truc: almanac.zhiXing,
    xiu: almanac.xiu,
    xiuLuck: almanac.xiuLuck,
    inYi,
    inJi,
    yiHits,
    jiHits,
    allForbidden,
    criteria,
    score,
    verdict,
    verdictLabel,
    detail,
    yi: almanac.yi,
    ji: almanac.ji,
    hours,
    goodHours: hours.filter((h) => h.recommended),
  };
}

// ---------------------------------------------------------------------------
// Quét cả tháng
// ---------------------------------------------------------------------------

export interface ChonNgayMonthCell {
  solarYear: number;
  solarMonth: number;
  solarDay: number;
  inMonth: boolean;
  lunarDay: number;
  check: ChonNgayDayCheck | null;
}

export function scanChonNgayMonth(
  activityId: ChonNgayActivityId,
  year: number,
  month: number,
  persons: ChonNgayPerson[] = [],
): {
  cells: ChonNgayMonthCell[];
  goodDays: ChonNgayDayCheck[];
  badDays: ChonNgayDayCheck[];
} {
  const daysInMonth = new Date(year, month, 0).getDate();
  const firstWeek = new Date(year, month - 1, 1).getDay();
  const lead = (firstWeek + 6) % 7;

  const cells: ChonNgayMonthCell[] = [];
  const goodDays: ChonNgayDayCheck[] = [];
  const badDays: ChonNgayDayCheck[] = [];

  const pushDay = (y: number, m: number, d: number, inMonth: boolean) => {
    const almanac = getAlmanacDay(y, m, d);
    const check = inMonth
      ? checkFromAlmanac(almanac, activityId, persons)
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

  goodDays.sort((a, b) => b.score - a.score);

  return { cells, goodDays, badDays };
}

export { todayParts };
