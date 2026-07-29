/**
 * Lục hào Nạp Giáp (Kinh Phòng / Hỏa Châu Lâm) — xếp quẻ cơ bản.
 * Gieo 6 hào → cung · Thế Ứng · Nạp Giáp · Lục thân · Lục thú · Dụng thần.
 */

import {
  buildFromLines,
  castLine,
  changeLines,
  getHexagram,
  getHexagramByBinary,
  linesToBinary,
  TRIGRAMS,
  type CastResult,
  type Hexagram,
  type LineValue,
  type TrigramId,
} from './kinh-dich-64';
import {
  CAN,
  CHI,
  dayCanChi,
  formatCanChi,
  formatLunarDate,
  monthCanChiFromYear,
  solarToLunar,
  type Can,
  type Chi,
} from './lunar';

export type NguHanh = 'kim' | 'moc' | 'thuy' | 'hoa' | 'tho';

export type PalaceId =
  | 'can'
  | 'kham'
  | 'gen'
  | 'chan'
  | 'ton'
  | 'ly'
  | 'khon'
  | 'doai';

export type Generation =
  | 'ban_cung'
  | 'nhat_the'
  | 'nhi_the'
  | 'tam_the'
  | 'tu_the'
  | 'ngu_the'
  | 'du_hon'
  | 'quy_hon';

export type LucThanId =
  | 'phu_mau'
  | 'huynh_de'
  | 'quan_quy'
  | 'the_tai'
  | 'tu_ton';

export type LucThuId =
  | 'thanh_long'
  | 'chu_tuoc'
  | 'cau_tran'
  | 'dang_xa'
  | 'bach_ho'
  | 'huyen_vu';

export type VuongSuy = 'vuong' | 'tuong' | 'huu' | 'tu' | 'tu_chet';

export type QuestionKind =
  | 'ban_than'
  | 'cau_tai'
  | 'cong_danh'
  | 'hon_nhan'
  | 'benh_tat'
  | 'xuat_hanh'
  | 'tim_nguoi'
  | 'mat_vat'
  | 'kien_tung'
  | 'hoc_hanh'
  | 'gia_trach'
  | 'khac';

export const NGU_HANH_LABEL: Record<NguHanh, string> = {
  kim: 'Kim',
  moc: 'Mộc',
  thuy: 'Thủy',
  hoa: 'Hỏa',
  tho: 'Thổ',
};

export const LUC_THAN_LABEL: Record<LucThanId, string> = {
  phu_mau: 'Phụ Mẫu',
  huynh_de: 'Huynh Đệ',
  quan_quy: 'Quan Quỷ',
  the_tai: 'Thê Tài',
  tu_ton: 'Tử Tôn',
};

export const LUC_THU_LABEL: Record<LucThuId, string> = {
  thanh_long: 'Thanh Long',
  chu_tuoc: 'Chu Tước',
  cau_tran: 'Câu Trần',
  dang_xa: 'Đằng Xà',
  bach_ho: 'Bạch Hổ',
  huyen_vu: 'Huyền Vũ',
};

export const GENERATION_LABEL: Record<Generation, string> = {
  ban_cung: 'Bản cung (bát thuần)',
  nhat_the: 'Nhất thế',
  nhi_the: 'Nhị thế',
  tam_the: 'Tam thế',
  tu_the: 'Tứ thế',
  ngu_the: 'Ngũ thế',
  du_hon: 'Du hồn',
  quy_hon: 'Quy hồn',
};

export const VUONG_SUY_LABEL: Record<VuongSuy, string> = {
  vuong: 'Vượng',
  tuong: 'Tướng',
  huu: 'Hưu',
  tu: 'Tù',
  tu_chet: 'Tử',
};

export const QUESTION_OPTIONS: {
  id: QuestionKind;
  label: string;
  dungThan: LucThanId;
  note: string;
}[] = [
  { id: 'ban_than', label: 'Bản thân / việc chung', dungThan: 'the_tai', note: 'Thường lấy Thế làm chủ; Tài tham khảo.' },
  { id: 'cau_tai', label: 'Cầu tài · tiền bạc', dungThan: 'the_tai', note: 'Dụng thần: Thê Tài' },
  { id: 'cong_danh', label: 'Công danh · xin việc', dungThan: 'quan_quy', note: 'Dụng thần: Quan Quỷ' },
  { id: 'hoc_hanh', label: 'Học hành · thi cử', dungThan: 'quan_quy', note: 'Dụng thần: Quan Quỷ (văn tinh)' },
  { id: 'hon_nhan', label: 'Hôn nhân · tình cảm', dungThan: 'the_tai', note: 'Nam hỏi vợ/Tài; nữ hỏi chồng/Quan — tham khảo Tài' },
  { id: 'benh_tat', label: 'Bệnh tật', dungThan: 'quan_quy', note: 'Dụng thần bệnh: Quan Quỷ; Thế là bệnh nhân' },
  { id: 'xuat_hanh', label: 'Xuất hành · đi xa', dungThan: 'tu_ton', note: 'Dụng thần: Tử Tôn (động)' },
  { id: 'tim_nguoi', label: 'Tìm người', dungThan: 'huynh_de', note: 'Dụng thần: Huynh Đệ (hoặc Quan nếu quan viên)' },
  { id: 'mat_vat', label: 'Mất vật', dungThan: 'the_tai', note: 'Dụng thần: Thê Tài (vật)' },
  { id: 'kien_tung', label: 'Kiện tụng · tranh chấp', dungThan: 'quan_quy', note: 'Dụng thần: Quan Quỷ' },
  { id: 'gia_trach', label: 'Gia trạch · nhà cửa', dungThan: 'phu_mau', note: 'Dụng thần: Phụ Mẫu' },
  { id: 'khac', label: 'Khác / chưa rõ', dungThan: 'the_tai', note: 'Lấy Thế làm chủ để tham khảo' },
];

const SHENG: Record<NguHanh, NguHanh> = {
  kim: 'thuy',
  thuy: 'moc',
  moc: 'hoa',
  hoa: 'tho',
  tho: 'kim',
};

const KE: Record<NguHanh, NguHanh> = {
  kim: 'moc',
  moc: 'tho',
  tho: 'thuy',
  thuy: 'hoa',
  hoa: 'kim',
};

export const CHI_ELEMENT: Record<Chi, NguHanh> = {
  Tý: 'thuy',
  Sửu: 'tho',
  Dần: 'moc',
  Mão: 'moc',
  Thìn: 'tho',
  Tỵ: 'hoa',
  Ngọ: 'hoa',
  Mùi: 'tho',
  Thân: 'kim',
  Dậu: 'kim',
  Tuất: 'tho',
  Hợi: 'thuy',
};

const PALACE_ELEMENT: Record<PalaceId, NguHanh> = {
  can: 'kim',
  doai: 'kim',
  kham: 'thuy',
  gen: 'tho',
  khon: 'tho',
  chan: 'moc',
  ton: 'moc',
  ly: 'hoa',
};

const PALACE_NAME: Record<PalaceId, string> = {
  can: 'Càn',
  kham: 'Khảm',
  gen: 'Cấn',
  chan: 'Chấn',
  ton: 'Tốn',
  ly: 'Ly',
  khon: 'Khôn',
  doai: 'Đoài',
};

const GENERATIONS: Generation[] = [
  'ban_cung',
  'nhat_the',
  'nhi_the',
  'tam_the',
  'tu_the',
  'ngu_the',
  'du_hon',
  'quy_hon',
];

/** Mỗi cung: 8 quẻ Văn Vương theo thứ tự biến. */
const PALACE_HEX: Record<PalaceId, readonly number[]> = {
  can: [1, 44, 33, 12, 20, 23, 35, 14],
  kham: [29, 60, 3, 63, 49, 55, 36, 7],
  gen: [52, 22, 26, 41, 38, 10, 61, 53],
  chan: [51, 16, 40, 32, 46, 48, 28, 17],
  ton: [57, 9, 37, 42, 25, 21, 27, 18],
  ly: [30, 56, 50, 64, 4, 59, 6, 13],
  khon: [2, 24, 19, 11, 34, 43, 5, 8],
  doai: [58, 47, 45, 31, 39, 15, 62, 54],
};

const THE_LINE: Record<Generation, number> = {
  ban_cung: 6,
  nhat_the: 1,
  nhi_the: 2,
  tam_the: 3,
  tu_the: 4,
  ngu_the: 5,
  du_hon: 4,
  quy_hon: 3,
};

type StemBranch = { can: Can; chi: Chi };

/** Nạp giáp: [nội 3 hào, ngoại 3 hào] từ dưới lên trong mỗi khối. */
const NAP_GIAP: Record<TrigramId, { inner: StemBranch[]; outer: StemBranch[] }> = {
  can: {
    inner: [
      { can: 'Giáp', chi: 'Tý' },
      { can: 'Giáp', chi: 'Dần' },
      { can: 'Giáp', chi: 'Thìn' },
    ],
    outer: [
      { can: 'Nhâm', chi: 'Ngọ' },
      { can: 'Nhâm', chi: 'Thân' },
      { can: 'Nhâm', chi: 'Tuất' },
    ],
  },
  khon: {
    inner: [
      { can: 'Ất', chi: 'Mùi' },
      { can: 'Ất', chi: 'Tỵ' },
      { can: 'Ất', chi: 'Mão' },
    ],
    outer: [
      { can: 'Quý', chi: 'Sửu' },
      { can: 'Quý', chi: 'Hợi' },
      { can: 'Quý', chi: 'Dậu' },
    ],
  },
  kham: {
    inner: [
      { can: 'Mậu', chi: 'Dần' },
      { can: 'Mậu', chi: 'Thìn' },
      { can: 'Mậu', chi: 'Ngọ' },
    ],
    outer: [
      { can: 'Mậu', chi: 'Thân' },
      { can: 'Mậu', chi: 'Tuất' },
      { can: 'Mậu', chi: 'Tý' },
    ],
  },
  gen: {
    inner: [
      { can: 'Bính', chi: 'Thìn' },
      { can: 'Bính', chi: 'Ngọ' },
      { can: 'Bính', chi: 'Thân' },
    ],
    outer: [
      { can: 'Bính', chi: 'Tuất' },
      { can: 'Bính', chi: 'Tý' },
      { can: 'Bính', chi: 'Dần' },
    ],
  },
  chan: {
    inner: [
      { can: 'Canh', chi: 'Tý' },
      { can: 'Canh', chi: 'Dần' },
      { can: 'Canh', chi: 'Thìn' },
    ],
    outer: [
      { can: 'Canh', chi: 'Ngọ' },
      { can: 'Canh', chi: 'Thân' },
      { can: 'Canh', chi: 'Tuất' },
    ],
  },
  ton: {
    inner: [
      { can: 'Tân', chi: 'Sửu' },
      { can: 'Tân', chi: 'Hợi' },
      { can: 'Tân', chi: 'Dậu' },
    ],
    outer: [
      { can: 'Tân', chi: 'Mùi' },
      { can: 'Tân', chi: 'Tỵ' },
      { can: 'Tân', chi: 'Mão' },
    ],
  },
  ly: {
    inner: [
      { can: 'Kỷ', chi: 'Mão' },
      { can: 'Kỷ', chi: 'Sửu' },
      { can: 'Kỷ', chi: 'Hợi' },
    ],
    outer: [
      { can: 'Kỷ', chi: 'Dậu' },
      { can: 'Kỷ', chi: 'Mùi' },
      { can: 'Kỷ', chi: 'Tỵ' },
    ],
  },
  doai: {
    inner: [
      { can: 'Đinh', chi: 'Tỵ' },
      { can: 'Đinh', chi: 'Mão' },
      { can: 'Đinh', chi: 'Sửu' },
    ],
    outer: [
      { can: 'Đinh', chi: 'Hợi' },
      { can: 'Đinh', chi: 'Dậu' },
      { can: 'Đinh', chi: 'Mùi' },
    ],
  },
};

const LUC_THU_ORDER: LucThuId[] = [
  'thanh_long',
  'chu_tuoc',
  'cau_tran',
  'dang_xa',
  'bach_ho',
  'huyen_vu',
];

function palaceLookup(): Map<
  number,
  { palace: PalaceId; generation: Generation; index: number }
> {
  const map = new Map<
    number,
    { palace: PalaceId; generation: Generation; index: number }
  >();
  for (const palace of Object.keys(PALACE_HEX) as PalaceId[]) {
    PALACE_HEX[palace].forEach((hex, i) => {
      map.set(hex, { palace, generation: GENERATIONS[i], index: i });
    });
  }
  return map;
}

const HEX_PALACE = palaceLookup();

export function findPalace(hexNumber: number) {
  const info = HEX_PALACE.get(hexNumber);
  if (!info) throw new Error(`Không tìm thấy cung cho quẻ #${hexNumber}`);
  return info;
}

export function ungLine(theLine: number): number {
  return ((theLine - 1 + 3) % 6) + 1;
}

export function lucThanOf(
  palaceElement: NguHanh,
  lineElement: NguHanh,
): LucThanId {
  if (lineElement === palaceElement) return 'huynh_de';
  if (SHENG[lineElement] === palaceElement) return 'phu_mau'; // sinh ta
  if (SHENG[palaceElement] === lineElement) return 'tu_ton'; // ta sinh
  if (KE[lineElement] === palaceElement) return 'quan_quy'; // khắc ta
  return 'the_tai'; // ta khắc
}

export function vuongSuyOf(
  lineElement: NguHanh,
  monthElement: NguHanh,
): VuongSuy {
  if (lineElement === monthElement) return 'vuong';
  if (SHENG[monthElement] === lineElement) return 'tuong';
  if (SHENG[lineElement] === monthElement) return 'huu';
  if (KE[monthElement] === lineElement) return 'tu';
  return 'tu_chet';
}

export function kongWang(dayCan: Can, dayChi: Chi): [Chi, Chi] {
  const canIdx = CAN.indexOf(dayCan);
  const chiIdx = CHI.indexOf(dayChi);
  const start = (chiIdx - canIdx + 12) % 12;
  return [CHI[(start + 10) % 12], CHI[(start + 11) % 12]];
}

export function lucThuStart(dayCan: Can): number {
  if (dayCan === 'Giáp' || dayCan === 'Ất') return 0;
  if (dayCan === 'Bính' || dayCan === 'Đinh') return 1;
  if (dayCan === 'Mậu') return 2;
  if (dayCan === 'Kỷ') return 3;
  if (dayCan === 'Canh' || dayCan === 'Tân') return 4;
  return 5;
}

export function napGiapForHex(hex: Hexagram): StemBranch[] {
  const inner = NAP_GIAP[hex.lower].inner;
  const outer = NAP_GIAP[hex.upper].outer;
  return [...inner, ...outer];
}

export interface LucHaoLine {
  index: number; // 0–5 bottom-up
  line: number; // 1–6
  value: LineValue;
  isYang: boolean;
  isChanging: boolean;
  label: string;
  can: Can;
  chi: Chi;
  canChi: string;
  element: NguHanh;
  elementLabel: string;
  lucThan: LucThanId;
  lucThanLabel: string;
  lucThu: LucThuId;
  lucThuLabel: string;
  isThe: boolean;
  isUng: boolean;
  isKong: boolean;
  vuongSuy: VuongSuy;
  vuongSuyLabel: string;
  /** Chi + hành của hào biến (nếu động) */
  changed?: {
    can: Can;
    chi: Chi;
    canChi: string;
    element: NguHanh;
    lucThan: LucThanId;
    lucThanLabel: string;
  };
}

export interface LucHaoResult {
  cast: CastResult;
  primary: Hexagram;
  secondary: Hexagram | null;
  palace: PalaceId;
  palaceName: string;
  palaceElement: NguHanh;
  palaceElementLabel: string;
  generation: Generation;
  generationLabel: string;
  theLine: number;
  ungLine: number;
  lines: LucHaoLine[];
  dayCanChi: string;
  monthCanChi: string;
  lunarLabel: string;
  solarLabel: string;
  kongWang: [Chi, Chi];
  questionKind: QuestionKind;
  dungThan: LucThanId;
  dungThanLabel: string;
  dungThanNote: string;
  dungThanLines: number[];
  phucThan: {
    line: number;
    chi: Chi;
    element: NguHanh;
    lucThan: LucThanId;
  } | null;
  summary: string;
  question: string;
}

function buildLineDetails(input: {
  cast: CastResult;
  palaceElement: NguHanh;
  theLine: number;
  ung: number;
  dayCan: Can;
  monthElement: NguHanh;
  kong: [Chi, Chi];
  secondary: Hexagram | null;
}): LucHaoLine[] {
  const nap = napGiapForHex(input.cast.primary);
  const thu0 = lucThuStart(input.dayCan);
  const secNap = input.secondary ? napGiapForHex(input.secondary) : null;

  return input.cast.lines.map((cl, i) => {
    const sb = nap[i];
    const el = CHI_ELEMENT[sb.chi];
    const than = lucThanOf(input.palaceElement, el);
    const thu = LUC_THU_ORDER[(thu0 + i) % 6];
    const vs = vuongSuyOf(el, input.monthElement);
    const lineNo = i + 1;

    let changed: LucHaoLine['changed'];
    if (cl.isChanging && secNap) {
      const csb = secNap[i];
      const cel = CHI_ELEMENT[csb.chi];
      const cthan = lucThanOf(input.palaceElement, cel);
      changed = {
        can: csb.can,
        chi: csb.chi,
        canChi: formatCanChi(csb),
        element: cel,
        lucThan: cthan,
        lucThanLabel: LUC_THAN_LABEL[cthan],
      };
    }

    return {
      index: i,
      line: lineNo,
      value: cl.value,
      isYang: cl.isYang,
      isChanging: cl.isChanging,
      label: cl.label,
      can: sb.can,
      chi: sb.chi,
      canChi: formatCanChi(sb),
      element: el,
      elementLabel: NGU_HANH_LABEL[el],
      lucThan: than,
      lucThanLabel: LUC_THAN_LABEL[than],
      lucThu: thu,
      lucThuLabel: LUC_THU_LABEL[thu],
      isThe: lineNo === input.theLine,
      isUng: lineNo === input.ung,
      isKong: input.kong.includes(sb.chi),
      vuongSuy: vs,
      vuongSuyLabel: VUONG_SUY_LABEL[vs],
      changed,
    };
  });
}

function findPhucThan(
  palace: PalaceId,
  palaceElement: NguHanh,
  present: Set<LucThanId>,
  missing: LucThanId,
): LucHaoResult['phucThan'] {
  if (present.has(missing)) return null;
  const rootNum = PALACE_HEX[palace][0];
  const root = getHexagram(rootNum);
  if (!root) return null;
  const nap = napGiapForHex(root);
  for (let i = 0; i < 6; i++) {
    const el = CHI_ELEMENT[nap[i].chi];
    const than = lucThanOf(palaceElement, el);
    if (than === missing) {
      return {
        line: i + 1,
        chi: nap[i].chi,
        element: el,
        lucThan: than,
      };
    }
  }
  return null;
}

function buildSummary(r: {
  primary: Hexagram;
  secondary: Hexagram | null;
  theLine: number;
  ungLine: number;
  lines: LucHaoLine[];
  dungThan: LucThanId;
  dungThanLines: number[];
  palaceName: string;
  generationLabel: string;
}): string {
  const the = r.lines[r.theLine - 1];
  const ung = r.lines[r.ungLine - 1];
  const moving = r.lines.filter((l) => l.isChanging);
  const dt =
    r.dungThanLines.length > 0
      ? `Dụng thần ${LUC_THAN_LABEL[r.dungThan]} ở hào ${r.dungThanLines.join(', ')} (${r.dungThanLines
          .map((n) => {
            const L = r.lines[n - 1];
            return `${L.chi}${L.elementLabel} · ${L.vuongSuyLabel}${L.isKong ? ' · không vong' : ''}`;
          })
          .join('; ')}).`
      : `Quẻ thiếu lộ ${LUC_THAN_LABEL[r.dungThan]} — xem Phục thần.`;

  return (
    `Quẻ ${r.primary.nameFull} thuộc cung ${r.palaceName} (${r.generationLabel}). ` +
    `Thế hào ${r.theLine} (${the.lucThanLabel} ${the.chi}${the.elementLabel}, ${the.vuongSuyLabel}) · ` +
    `Ứng hào ${r.ungLine} (${ung.lucThanLabel} ${ung.chi}${ung.elementLabel}). ` +
    (moving.length
      ? `Hào động: ${moving.map((m) => `${m.line}${m.changed ? `→${m.changed.chi}` : ''}`).join(', ')}. `
      : 'Không có hào động. ') +
    dt +
    (r.secondary ? ` Quẻ biến: ${r.secondary.nameFull}.` : '') +
    ' Tham khảo cổ học; việc hệ trọng nên thỉnh ý trực tiếp tại chùa.'
  );
}

export function analyzeLucHao(input: {
  lines: LineValue[];
  solarDay: number;
  solarMonth: number;
  solarYear: number;
  questionKind?: QuestionKind;
  question?: string;
}): LucHaoResult {
  const cast = buildFromLines(input.lines);
  const primary = cast.primary;
  const secondary = cast.secondary;
  const { palace, generation } = findPalace(primary.number);
  const palaceElement = PALACE_ELEMENT[palace];
  const the = THE_LINE[generation];
  const ung = ungLine(the);

  const lunar = solarToLunar(
    input.solarDay,
    input.solarMonth,
    input.solarYear,
  );
  const dCc = dayCanChi(lunar.jd);
  const mCc = monthCanChiFromYear(lunar.year, lunar.month);
  const monthElement = CHI_ELEMENT[mCc.chi];
  const kong = kongWang(dCc.can, dCc.chi);

  const qKind = input.questionKind ?? 'khac';
  const qOpt =
    QUESTION_OPTIONS.find((q) => q.id === qKind) ?? QUESTION_OPTIONS[11];

  const lines = buildLineDetails({
    cast,
    palaceElement,
    theLine: the,
    ung,
    dayCan: dCc.can,
    monthElement,
    kong,
    secondary,
  });

  const present = new Set(lines.map((l) => l.lucThan));
  const dungThanLines = lines
    .filter((l) => l.lucThan === qOpt.dungThan)
    .map((l) => l.line);
  const phucThan =
    dungThanLines.length === 0
      ? findPhucThan(palace, palaceElement, present, qOpt.dungThan)
      : null;

  const pad = (n: number) => String(n).padStart(2, '0');
  const base = {
    primary,
    secondary,
    theLine: the,
    ungLine: ung,
    lines,
    dungThan: qOpt.dungThan,
    dungThanLines,
    palaceName: PALACE_NAME[palace],
    generationLabel: GENERATION_LABEL[generation],
  };

  return {
    cast,
    primary,
    secondary,
    palace,
    palaceName: PALACE_NAME[palace],
    palaceElement,
    palaceElementLabel: NGU_HANH_LABEL[palaceElement],
    generation,
    generationLabel: GENERATION_LABEL[generation],
    theLine: the,
    ungLine: ung,
    lines,
    dayCanChi: formatCanChi(dCc),
    monthCanChi: formatCanChi(mCc),
    lunarLabel: formatLunarDate(lunar),
    solarLabel: `${pad(input.solarDay)}/${pad(input.solarMonth)}/${input.solarYear}`,
    kongWang: kong,
    questionKind: qKind,
    dungThan: qOpt.dungThan,
    dungThanLabel: LUC_THAN_LABEL[qOpt.dungThan],
    dungThanNote: qOpt.note,
    dungThanLines,
    phucThan,
    summary: buildSummary(base),
    question: (input.question ?? '').trim(),
  };
}

export function castLucHaoRandom(input: {
  solarDay: number;
  solarMonth: number;
  solarYear: number;
  questionKind?: QuestionKind;
  question?: string;
  random?: () => number;
}): LucHaoResult {
  const rnd = input.random ?? Math.random;
  const lines: LineValue[] = [];
  for (let i = 0; i < 6; i++) lines.push(castLine(rnd).value);
  return analyzeLucHao({ ...input, lines });
}

/** Kiểm tra xếp quẻ Địa Thủy Sư (thuần tĩnh). */
export function verifySuHexagram(): boolean {
  // Sư #7: lower kham 010, upper khon 000 → binary 010000
  const hex = getHexagram(7);
  if (!hex || hex.nameVi !== 'Sư') return false;
  const { palace, generation } = findPalace(7);
  if (palace !== 'kham' || generation !== 'quy_hon') return false;
  const the = THE_LINE[generation];
  if (the !== 3 || ungLine(the) !== 6) return false;
  const nap = napGiapForHex(hex);
  const expected: Chi[] = ['Dần', 'Thìn', 'Ngọ', 'Sửu', 'Hợi', 'Dậu'];
  if (!nap.every((n, i) => n.chi === expected[i])) return false;
  const palaceEl = PALACE_ELEMENT.kham;
  const thans = nap.map((n) => lucThanOf(palaceEl, CHI_ELEMENT[n.chi]));
  const want: LucThanId[] = [
    'tu_ton',
    'quan_quy',
    'the_tai',
    'quan_quy',
    'huynh_de',
    'phu_mau',
  ];
  return thans.every((t, i) => t === want[i]);
}
