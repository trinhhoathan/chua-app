/**
 * Chọn hướng nhà theo Bát Trạch: cung phi chuẩn (kua số 5 nam ký Khôn,
 * nữ ký Cấn) + đủ 8 hướng với du niên (Sinh Khí, Thiên Y, Diên Niên,
 * Phục Vị, Họa Hại, Lục Sát, Ngũ Quỷ, Tuyệt Mệnh).
 */

import {
  BAT_TRACH,
  DU_NIEN_MEANING,
  cungPhiOfYear,
  type CungPhi,
  type DuNien,
} from './hop-tuoi';
import { formatCanChi, yearCanChi } from './lunar';

export interface HuongInfo {
  huong: string;
  /** Quái ứng với hướng */
  quai: CungPhi;
  duNien: DuNien;
  level: 'tot' | 'xau';
  meaning: string;
  /** Xếp hạng 1 (tốt nhất) → 8 (xấu nhất) */
  rank: number;
}

export interface HuongNhaResult {
  birthYear: number;
  gender: 'nam' | 'nu';
  canChi: string;
  cungPhi: CungPhi;
  nhomTrach: 'Đông tứ mệnh' | 'Tây tứ mệnh';
  /** 8 hướng, xếp từ tốt nhất đến xấu nhất */
  huongs: HuongInfo[];
  goodHuongs: HuongInfo[];
  badHuongs: HuongInfo[];
  summary: string;
}

/** Hướng ↔ quái (hậu thiên bát quái). */
export const HUONG_QUAI: Array<{ huong: string; quai: CungPhi }> = [
  { huong: 'Bắc', quai: 'Khảm' },
  { huong: 'Đông Bắc', quai: 'Cấn' },
  { huong: 'Đông', quai: 'Chấn' },
  { huong: 'Đông Nam', quai: 'Tốn' },
  { huong: 'Nam', quai: 'Ly' },
  { huong: 'Tây Nam', quai: 'Khôn' },
  { huong: 'Tây', quai: 'Đoài' },
  { huong: 'Tây Bắc', quai: 'Càn' },
];

const DONG_TU: CungPhi[] = ['Khảm', 'Ly', 'Chấn', 'Tốn'];

/** Thứ tự tốt dần → xấu dần của 8 du niên. */
const DU_NIEN_RANK: DuNien[] = [
  'Sinh khí',
  'Thiên y',
  'Diên niên',
  'Phục vị',
  'Họa hại',
  'Lục sát',
  'Ngũ quỷ',
  'Tuyệt mệnh',
];

export function buildHuongNha(
  birthYear: number,
  gender: 'nam' | 'nu',
): HuongNhaResult {
  const cungPhi = cungPhiOfYear(birthYear, gender);
  const nhomTrach = DONG_TU.includes(cungPhi)
    ? 'Đông tứ mệnh'
    : 'Tây tứ mệnh';

  const huongs: HuongInfo[] = HUONG_QUAI.map(({ huong, quai }) => {
    const duNien = BAT_TRACH[cungPhi][quai];
    const meaning = DU_NIEN_MEANING[duNien];
    return {
      huong,
      quai,
      duNien,
      level: meaning.level === 'tot' ? ('tot' as const) : ('xau' as const),
      meaning: meaning.text,
      rank: DU_NIEN_RANK.indexOf(duNien) + 1,
    };
  }).sort((a, b) => a.rank - b.rank);

  const goodHuongs = huongs.filter((h) => h.level === 'tot');
  const badHuongs = huongs.filter((h) => h.level === 'xau');

  return {
    birthYear,
    gender,
    canChi: formatCanChi(yearCanChi(birthYear)),
    cungPhi,
    nhomTrach,
    huongs,
    goodHuongs,
    badHuongs,
    summary: `Cung phi ${cungPhi} (${nhomTrach}). Bốn hướng tốt: ${goodHuongs
      .map((h) => `${h.huong} (${h.duNien})`)
      .join(', ')}. Tránh bốn hướng: ${badHuongs
      .map((h) => `${h.huong} (${h.duNien})`)
      .join(', ')}.`,
  };
}
