/**
 * Khổng Minh thần toán — hệ 384 quẻ (64 quẻ × 6 hào).
 * Lập số theo 3 từ (chữ cái Latin/Việt), số trực tiếp, hoặc thượng·hạ·hào.
 * Nội dung luận gắn hào từ / thoán / tượng Kinh Dịch (Văn Vương).
 */

import {
  binaryFromTrigrams,
  changeLineBinary,
  MAI_HOA_TRIGRAM_BY_NUM,
} from './mai-hoa-dich-so';
import {
  getHexagram,
  getHexagramByBinary,
  TRIGRAMS,
  type Hexagram,
  type TrigramId,
} from './kinh-dich-64';

export type KhongMinhRank =
  | 'thuong_thuong'
  | 'thuong'
  | 'trung_thuong'
  | 'trung'
  | 'trung_ha'
  | 'ha'
  | 'ha_ha';

export type KhongMinhMode = 'ba_tu' | 'ngau_nhien' | 'so_que' | 'quai_hao';

export interface KhongMinhOracle {
  /** 1–384 */
  id: number;
  hexNumber: number;
  line: number;
  lineName: string;
  rank: KhongMinhRank;
  rankLabel: string;
  hex: Hexagram;
  secondary: Hexagram;
  poem: string;
  judgment: string;
  image: string;
  summary: string;
  advice: string;
  omen: string;
}

export interface KhongMinhResult extends KhongMinhOracle {
  mode: KhongMinhMode;
  question: string;
  steps: { label: string; detail: string }[];
  words?: [string, string, string];
  rawNumber?: number;
}

export const RANK_META: Record<
  KhongMinhRank,
  { label: string; tone: 'tot' | 'kha' | 'trung' | 'yeu' | 'xau' }
> = {
  thuong_thuong: { label: 'Thượng Thượng', tone: 'tot' },
  thuong: { label: 'Thượng', tone: 'tot' },
  trung_thuong: { label: 'Trung Thượng', tone: 'kha' },
  trung: { label: 'Trung Bình', tone: 'trung' },
  trung_ha: { label: 'Trung Hạ', tone: 'yeu' },
  ha: { label: 'Hạ', tone: 'yeu' },
  ha_ha: { label: 'Hạ Hạ', tone: 'xau' },
};

const LINE_NAMES = [
  'Sơ (hào 1)',
  'Nhị (hào 2)',
  'Tam (hào 3)',
  'Tứ (hào 4)',
  'Ngũ (hào 5)',
  'Thượng (hào 6)',
] as const;

const GOOD_RE =
  /cát|lợi|hanh|đại nhân|vô cữu|hữu khánh|cát lợi|đại cát|thắng|được|thông|vinh|phúc/i;
const BAD_RE =
  /hung|lệ|nguy|hối|tai|bại|táng|khốn|không lợi|bất lợi|hung hiểm|thất/i;

function scoreLineText(text: string): number {
  let s = 0;
  if (GOOD_RE.test(text)) s += 2;
  if (BAD_RE.test(text)) s -= 2;
  if (/vô hối|hối vong/i.test(text)) s += 1;
  if (/trinh/i.test(text)) s += 1;
  return s;
}

function rankFromScore(score: number, line: number): KhongMinhRank {
  let s = score;
  if (line === 5) s += 1;
  if (line === 3 || line === 6) s -= 0.5;
  if (s >= 3) return 'thuong_thuong';
  if (s >= 2) return 'thuong';
  if (s >= 1) return 'trung_thuong';
  if (s >= 0) return 'trung';
  if (s >= -1) return 'trung_ha';
  if (s >= -2) return 'ha';
  return 'ha_ha';
}

function omenFromRank(rank: KhongMinhRank): string {
  switch (rank) {
    case 'thuong_thuong':
      return 'Điềm rất lành — việc hỏi có đà hanh thông nếu giữ chính tâm.';
    case 'thuong':
      return 'Điềm lành — thuận hơn nghịch; nên tiến từng bước chắc.';
    case 'trung_thuong':
      return 'Khá thuận — còn chỗ phải giữ lễ và chờ thời vừa đủ.';
    case 'trung':
      return 'Trung bình — không nên nóng vội cũng đừng bỏ cuộc.';
    case 'trung_ha':
      return 'Hơi nghịch — thận trọng, giảm tham vọng trước mắt.';
    case 'ha':
      return 'Chưa thuận — nên giữ, tránh quyết định lớn.';
    default:
      return 'Nghịch cảnh — lui để bảo toàn; thành tâm điều chỉnh hướng đi.';
  }
}

function adviceFrom(
  hex: Hexagram,
  line: number,
  rank: KhongMinhRank,
): string {
  return (
    `${omenFromRank(rank)} ` +
    `Đặt trọng tâm vào hào ${line} của ${hex.nameFull}: ${hex.summary} ` +
    `Tham khảo cổ học; việc hệ trọng nên thỉnh ý trực tiếp tại chùa.`
  );
}

export function normalizeLot(n: number): number {
  let x = Math.floor(Math.abs(n));
  if (x === 0) return 384;
  while (x > 384) x -= 384;
  return x === 0 ? 384 : x;
}

export function lotToHexLine(lot: number): { hexNumber: number; line: number } {
  const id = normalizeLot(lot);
  return {
    hexNumber: Math.ceil(id / 6),
    line: ((id - 1) % 6) + 1,
  };
}

export function hexLineToLot(hexNumber: number, line: number): number {
  const h = Math.min(64, Math.max(1, Math.floor(hexNumber)));
  const l = Math.min(6, Math.max(1, Math.floor(line)));
  return (h - 1) * 6 + l;
}

export function countWordLetters(word: string): number {
  const cleaned = word.normalize('NFC').replace(/[\s\p{P}\p{S}]+/gu, '');
  return [...cleaned].length;
}

export function unitsDigit(n: number): number {
  return ((Math.abs(Math.floor(n)) % 10) + 10) % 10;
}

export function wordsToLot(
  w1: string,
  w2: string,
  w3: string,
): {
  lot: number;
  raw: number;
  digits: [number, number, number];
  counts: [number, number, number];
} {
  const counts: [number, number, number] = [
    countWordLetters(w1),
    countWordLetters(w2),
    countWordLetters(w3),
  ];
  if (counts.some((c) => c < 1)) {
    throw new Error('Mỗi từ cần có ít nhất một chữ cái.');
  }
  const digits: [number, number, number] = [
    unitsDigit(counts[0]),
    unitsDigit(counts[1]),
    unitsDigit(counts[2]),
  ];
  const raw = digits[0] * 100 + digits[1] * 10 + digits[2];
  return {
    lot: normalizeLot(raw === 0 ? 384 : raw),
    raw,
    digits,
    counts,
  };
}

export function getOracle(lot: number): KhongMinhOracle {
  const id = normalizeLot(lot);
  const { hexNumber, line } = lotToHexLine(id);
  const hex = getHexagram(hexNumber);
  if (!hex) throw new Error(`Không tìm thấy quẻ #${hexNumber}`);

  const secondary =
    getHexagramByBinary(changeLineBinary(hex.binary, line)) ?? hex;
  const poem = hex.lines[line - 1];
  const rank = rankFromScore(scoreLineText(poem), line);

  return {
    id,
    hexNumber,
    line,
    lineName: LINE_NAMES[line - 1],
    rank,
    rankLabel: RANK_META[rank].label,
    hex,
    secondary,
    poem,
    judgment: hex.judgment,
    image: hex.image,
    summary: hex.summary,
    advice: adviceFrom(hex, line, rank),
    omen: omenFromRank(rank),
  };
}

export function castByWords(input: {
  w1: string;
  w2: string;
  w3: string;
  question?: string;
}): KhongMinhResult {
  const { lot, raw, digits, counts } = wordsToLot(input.w1, input.w2, input.w3);
  const oracle = getOracle(lot);
  return {
    ...oracle,
    mode: 'ba_tu',
    question: (input.question ?? '').trim(),
    words: [input.w1.trim(), input.w2.trim(), input.w3.trim()],
    rawNumber: raw,
    steps: [
      {
        label: 'Ba từ động tâm',
        detail: `«${input.w1.trim()}» · «${input.w2.trim()}» · «${input.w3.trim()}»`,
      },
      {
        label: 'Đếm chữ cái',
        detail: `${counts[0]} · ${counts[1]} · ${counts[2]} chữ → hàng đơn vị ${digits[0]}${digits[1]}${digits[2]} (số ${raw})`,
      },
      {
        label: 'Số quẻ',
        detail:
          raw > 384 ? `${raw} − 384×… → quẻ số ${lot}` : `Quẻ số ${lot}`,
      },
      {
        label: 'Ánh xạ Kinh Dịch',
        detail: `Quẻ #${oracle.hexNumber} ${oracle.hex.nameFull} · ${oracle.lineName} động → biến ${oracle.secondary.nameFull}`,
      },
    ],
  };
}

export function castByNumber(input: {
  lot: number;
  question?: string;
}): KhongMinhResult {
  const lot = normalizeLot(input.lot);
  const oracle = getOracle(lot);
  return {
    ...oracle,
    mode: 'so_que',
    question: (input.question ?? '').trim(),
    rawNumber: input.lot,
    steps: [
      { label: 'Số nhập', detail: `Quẻ số ${lot}` },
      {
        label: 'Ánh xạ Kinh Dịch',
        detail: `Quẻ #${oracle.hexNumber} ${oracle.hex.nameFull} · ${oracle.lineName}`,
      },
    ],
  };
}

export function castRandom(question?: string): KhongMinhResult {
  const lot = Math.floor(Math.random() * 384) + 1;
  const oracle = getOracle(lot);
  return {
    ...oracle,
    mode: 'ngau_nhien',
    question: (question ?? '').trim(),
    rawNumber: lot,
    steps: [
      {
        label: 'Gieo ngẫu nhiên',
        detail: `Hệ thống chọn quẻ số ${lot} (thành tâm hỏi một lần)`,
      },
      {
        label: 'Ánh xạ Kinh Dịch',
        detail: `Quẻ #${oracle.hexNumber} ${oracle.hex.nameFull} · ${oracle.lineName}`,
      },
    ],
  };
}

export function castByTrigrams(input: {
  upperNum: number;
  lowerNum: number;
  line: number;
  question?: string;
}): KhongMinhResult {
  const u = Math.min(8, Math.max(1, Math.floor(input.upperNum)));
  const l = Math.min(8, Math.max(1, Math.floor(input.lowerNum)));
  const line = Math.min(6, Math.max(1, Math.floor(input.line)));
  const upperId = MAI_HOA_TRIGRAM_BY_NUM[u] as TrigramId;
  const lowerId = MAI_HOA_TRIGRAM_BY_NUM[l] as TrigramId;
  const hex = getHexagramByBinary(binaryFromTrigrams(upperId, lowerId));
  if (!hex) throw new Error('Không lập được quẻ từ thượng / hạ.');
  const lot = hexLineToLot(hex.number, line);
  const oracle = getOracle(lot);
  return {
    ...oracle,
    mode: 'quai_hao',
    question: (input.question ?? '').trim(),
    rawNumber: lot,
    steps: [
      {
        label: 'Thượng · hạ · hào',
        detail: `Thượng ${u} ${TRIGRAMS[upperId].nameVi} · Hạ ${l} ${TRIGRAMS[lowerId].nameVi} · Hào ${line}`,
      },
      {
        label: 'Quẻ kép',
        detail: `${hex.unicode} ${hex.nameFull} (#${hex.number}) → số thẻ ${lot}`,
      },
    ],
  };
}

export const TRIGRAM_OPTIONS = (
  Object.entries(MAI_HOA_TRIGRAM_BY_NUM) as [string, TrigramId][]
)
  .map(([num, id]) => ({
    num: Number(num),
    id,
    name: TRIGRAMS[id].nameVi,
    element: TRIGRAMS[id].element,
  }))
  .sort((a, b) => a.num - b.num);
