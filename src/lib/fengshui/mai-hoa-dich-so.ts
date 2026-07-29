/**
 * Mai Hoa Dịch Số — lập quẻ theo thời gian hoặc hai số động tâm.
 * Thứ tự quẻ đơn Hà Đồ: 1 Càn · 2 Đoài · 3 Ly · 4 Chấn · 5 Tốn · 6 Khảm · 7 Cấn · 8 Khôn.
 */

import {
  getHexagramByBinary,
  TRIGRAMS,
  type Hexagram,
  type Trigram,
  type TrigramId,
} from './kinh-dich-64';
import {
  CHI,
  formatCanChi,
  formatLunarDate,
  hourBranchLabel,
  solarToLunar,
  yearCanChi,
  type Chi,
} from './lunar';

function hourChiFromClock(hour: number): Chi {
  const h = ((hour % 24) + 24) % 24;
  return CHI[Math.floor(((h + 1) % 24) / 2)];
}

/** 1→8 theo Hà Đồ / Mai Hoa */
export const MAI_HOA_TRIGRAM_BY_NUM: Record<number, TrigramId> = {
  1: 'can',
  2: 'doai',
  3: 'ly',
  4: 'chan',
  5: 'ton',
  6: 'kham',
  7: 'gen',
  8: 'khon',
};

export type MaiHoaMode = 'thoi_gian' | 'hai_so';

export interface MaiHoaStep {
  label: string;
  detail: string;
}

export interface MaiHoaResult {
  mode: MaiHoaMode;
  question: string;
  yearNum: number;
  monthNum: number;
  dayNum: number;
  hourNum: number;
  upperNum: number;
  lowerNum: number;
  movingLine: number; // 1–6 từ dưới lên
  upper: Trigram;
  lower: Trigram;
  primary: Hexagram;
  secondary: Hexagram;
  mutual: Hexagram;
  changingLineText: string;
  steps: MaiHoaStep[];
  timeLabel: string;
  lunarLabel: string;
  yearCanChi: string;
  hourLabel: string;
  advice: string;
}

function modPositive(n: number, m: number): number {
  const r = ((n % m) + m) % m;
  return r === 0 ? m : r;
}

export function chiNumber(chi: Chi): number {
  return CHI.indexOf(chi) + 1;
}

export function trigramFromMaiHoaNum(n: number): Trigram {
  const id = MAI_HOA_TRIGRAM_BY_NUM[modPositive(n, 8)];
  return TRIGRAMS[id];
}

export function binaryFromTrigrams(
  upper: TrigramId,
  lower: TrigramId,
): string {
  return [...TRIGRAMS[lower].bits, ...TRIGRAMS[upper].bits].join('');
}

/** Đổi hào động (1–6 từ dưới) → quẻ biến */
export function changeLineBinary(binary: string, movingLine: number): string {
  const bits = binary.split('').map(Number);
  const idx = movingLine - 1;
  bits[idx] = bits[idx] === 1 ? 0 : 1;
  return bits.join('');
}

/**
 * Hỗ quái: hạ = hào 2·3·4; thượng = hào 3·4·5 (đếm từ dưới).
 */
export function mutualBinary(binary: string): string {
  const b = binary.split('').map(Number);
  const lower = [b[1], b[2], b[3]];
  const upper = [b[2], b[3], b[4]];
  return [...lower, ...upper].join('');
}

function requireHex(binary: string): Hexagram {
  const h = getHexagramByBinary(binary);
  if (!h) throw new Error(`Không tìm thấy quẻ cho binary ${binary}`);
  return h;
}

function buildFromParts(input: {
  mode: MaiHoaMode;
  question: string;
  yearNum: number;
  monthNum: number;
  dayNum: number;
  hourNum: number;
  upperSum: number;
  lowerSum: number;
  movingSum: number;
  steps: MaiHoaStep[];
  timeLabel: string;
  lunarLabel: string;
  yearCanChi: string;
  hourLabel: string;
}): MaiHoaResult {
  const upperNum = modPositive(input.upperSum, 8);
  const lowerNum = modPositive(input.lowerSum, 8);
  const movingLine = modPositive(input.movingSum, 6);

  const upper = trigramFromMaiHoaNum(upperNum);
  const lower = trigramFromMaiHoaNum(lowerNum);
  const primaryBin = binaryFromTrigrams(upper.id, lower.id);
  const primary = requireHex(primaryBin);
  const secondary = requireHex(changeLineBinary(primaryBin, movingLine));
  const mutual = requireHex(mutualBinary(primaryBin));
  const changingLineText = primary.lines[movingLine - 1];

  const steps: MaiHoaStep[] = [
    ...input.steps,
    {
      label: 'Thượng quái',
      detail: `${input.upperSum} ÷ 8 → dư ${upperNum} → ${upper.nameVi} (${upper.element})`,
    },
    {
      label: 'Hạ quái',
      detail: `${input.lowerSum} ÷ 8 → dư ${lowerNum} → ${lower.nameVi} (${lower.element})`,
    },
    {
      label: 'Hào động',
      detail: `${input.movingSum} ÷ 6 → dư ${movingLine} → hào ${movingLine} (từ dưới lên)`,
    },
    {
      label: 'Quẻ chủ',
      detail: `${primary.unicode} ${primary.nameFull} (#${primary.number})`,
    },
    {
      label: 'Quẻ biến',
      detail: `${secondary.unicode} ${secondary.nameFull} (#${secondary.number}) — đổi hào ${movingLine}`,
    },
    {
      label: 'Hỗ quái',
      detail: `${mutual.unicode} ${mutual.nameFull} (#${mutual.number}) — hào 2·3·4 / 3·4·5`,
    },
  ];

  return {
    mode: input.mode,
    question: input.question.trim(),
    yearNum: input.yearNum,
    monthNum: input.monthNum,
    dayNum: input.dayNum,
    hourNum: input.hourNum,
    upperNum,
    lowerNum,
    movingLine,
    upper,
    lower,
    primary,
    secondary,
    mutual,
    changingLineText,
    steps,
    timeLabel: input.timeLabel,
    lunarLabel: input.lunarLabel,
    yearCanChi: input.yearCanChi,
    hourLabel: input.hourLabel,
    advice: buildAdvice(primary, secondary, mutual, movingLine),
  };
}

function buildAdvice(
  primary: Hexagram,
  secondary: Hexagram,
  mutual: Hexagram,
  movingLine: number,
): string {
  return (
    `Quẻ chủ ${primary.nameFull} nói lên cục diện hiện tại. ` +
    `Hào ${movingLine} động dẫn sang ${secondary.nameFull} — hướng biến đổi sắp tới. ` +
    `Hỗ quái ${mutual.nameFull} gợi ý phần ẩn / trung gian. ` +
    `Tham khảo thoán–tượng và hào động; việc hệ trọng nên thỉnh ý trực tiếp tại chùa.`
  );
}

/**
 * Lập quẻ theo năm (chi) + tháng + ngày ÂL + giờ (chi).
 */
export function castByTime(input: {
  solarDay: number;
  solarMonth: number;
  solarYear: number;
  hour: number;
  question?: string;
}): MaiHoaResult {
  const lunar = solarToLunar(
    input.solarDay,
    input.solarMonth,
    input.solarYear,
  );
  const yCc = yearCanChi(lunar.year);
  const yearNum = chiNumber(yCc.chi);
  const monthNum = lunar.month;
  const dayNum = lunar.day;
  const hourChi = hourChiFromClock(input.hour);
  const hourNum = chiNumber(hourChi);

  const upperSum = yearNum + monthNum + dayNum;
  const lowerSum = yearNum + monthNum + dayNum + hourNum;
  const movingSum = lowerSum;

  const pad = (n: number) => String(n).padStart(2, '0');
  const timeLabel = `${pad(input.solarDay)}/${pad(input.solarMonth)}/${input.solarYear} · ${hourBranchLabel(input.hour)}`;

  return buildFromParts({
    mode: 'thoi_gian',
    question: input.question ?? '',
    yearNum,
    monthNum,
    dayNum,
    hourNum,
    upperSum,
    lowerSum,
    movingSum,
    timeLabel,
    lunarLabel: formatLunarDate(lunar),
    yearCanChi: formatCanChi(yCc),
    hourLabel: `${hourChi} (${hourNum})`,
    steps: [
      {
        label: 'Số năm (chi)',
        detail: `${formatCanChi(yCc)} → ${yCc.chi} = ${yearNum}`,
      },
      {
        label: 'Tháng · ngày ÂL',
        detail: `Tháng ${monthNum} · ngày ${dayNum} (${formatLunarDate(lunar)})`,
      },
      {
        label: 'Số giờ (chi)',
        detail: `${hourBranchLabel(input.hour)} → ${hourNum}`,
      },
      {
        label: 'Công thức',
        detail: `Thượng = năm+tháng+ngày · Hạ & hào động = năm+tháng+ngày+giờ`,
      },
    ],
  });
}

/**
 * Lập quẻ theo hai số động tâm + giờ (chi).
 */
export function castByTwoNumbers(input: {
  upperRaw: number;
  lowerRaw: number;
  hour: number;
  solarDay?: number;
  solarMonth?: number;
  solarYear?: number;
  question?: string;
}): MaiHoaResult {
  const now = new Date();
  const d = input.solarDay ?? now.getDate();
  const m = input.solarMonth ?? now.getMonth() + 1;
  const y = input.solarYear ?? now.getFullYear();
  const lunar = solarToLunar(d, m, y);
  const yCc = yearCanChi(lunar.year);
  const hourChi = hourChiFromClock(input.hour);
  const hourNum = chiNumber(hourChi);

  const upperRaw = Math.abs(Math.floor(input.upperRaw));
  const lowerRaw = Math.abs(Math.floor(input.lowerRaw));
  if (upperRaw < 1 || lowerRaw < 1) {
    throw new Error('Hai số phải là số nguyên dương.');
  }

  const upperSum = upperRaw;
  const lowerSum = lowerRaw;
  const movingSum = upperRaw + lowerRaw + hourNum;

  return buildFromParts({
    mode: 'hai_so',
    question: input.question ?? '',
    yearNum: chiNumber(yCc.chi),
    monthNum: lunar.month,
    dayNum: lunar.day,
    hourNum,
    upperSum,
    lowerSum,
    movingSum,
    timeLabel: `Số ${upperRaw} · ${lowerRaw} · ${hourBranchLabel(input.hour)}`,
    lunarLabel: formatLunarDate(lunar),
    yearCanChi: formatCanChi(yCc),
    hourLabel: `${hourChi} (${hourNum})`,
    steps: [
      {
        label: 'Số thượng',
        detail: `Nhập ${upperRaw}`,
      },
      {
        label: 'Số hạ',
        detail: `Nhập ${lowerRaw}`,
      },
      {
        label: 'Số giờ (chi)',
        detail: `${hourBranchLabel(input.hour)} → ${hourNum}`,
      },
      {
        label: 'Công thức',
        detail: `Thượng = số 1 · Hạ = số 2 · Hào động = số1 + số2 + giờ`,
      },
    ],
  });
}

/** Kiểm tra nhanh ví dụ sách: Ất Dậu 16/7 ÂL giờ Tỵ → Độn → Bĩ. */
export function verifyClassicExample(): boolean {
  const upperSum = 10 + 7 + 16;
  const lowerSum = 10 + 7 + 16 + 6;
  const moving = modPositive(lowerSum, 6);
  const upper = trigramFromMaiHoaNum(modPositive(upperSum, 8));
  const lower = trigramFromMaiHoaNum(modPositive(lowerSum, 8));
  const primary = requireHex(binaryFromTrigrams(upper.id, lower.id));
  const secondary = requireHex(changeLineBinary(primary.binary, moving));
  const mutual = requireHex(mutualBinary(primary.binary));
  return (
    primary.number === 33 &&
    secondary.number === 12 &&
    mutual.number === 44 &&
    moving === 3
  );
}
