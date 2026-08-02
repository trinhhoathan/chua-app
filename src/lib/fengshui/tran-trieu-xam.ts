import data from './tran-trieu-xam-data.json';

/** Hạng quẻ theo bản Linh Xăm Đức Thánh Trần (7 bậc). */
export type TranTrieuRank =
  | 'thượng_quái'
  | 'thượng_thượng'
  | 'đại_cát'
  | 'trung_bình'
  | 'trung_hạ'
  | 'hạ_hạ'
  | 'hạ_quái';

export interface TranTrieuAspect {
  phrase: string;
  meaning: string;
}

export interface TranTrieuOracle {
  id: number;
  rank: TranTrieuRank;
  titleHan: string;
  titleVi: string;
  poemHan: string;
  poemVi: string;
  aspects: Record<string, TranTrieuAspect>;
  judgment: string;
  needsVerify: boolean;
  verifyNotes: string[];
  sourceNote: string;
}

export const TRAN_TRIEU_ORACLES = data as unknown as TranTrieuOracle[];

export const TRAN_TRIEU_RANK_LABELS: Record<TranTrieuRank, string> = {
  thượng_quái: 'Thượng quái',
  thượng_thượng: 'Thượng thượng',
  đại_cát: 'Đại cát',
  trung_bình: 'Trung bình',
  trung_hạ: 'Trung hạ',
  hạ_hạ: 'Hạ hạ',
  hạ_quái: 'Hạ quái',
};

/** Nhóm hiển thị: tốt / trung / kém */
export function tranTrieuRankGroup(
  rank: TranTrieuRank,
): 'tot' | 'trung' | 'kem' {
  if (
    rank === 'thượng_quái' ||
    rank === 'thượng_thượng' ||
    rank === 'đại_cát'
  ) {
    return 'tot';
  }
  if (rank === 'trung_bình') return 'trung';
  return 'kem';
}

export function tranTrieuRankTone(rank: TranTrieuRank): string {
  const g = tranTrieuRankGroup(rank);
  if (g === 'tot') return '#1a6b3c';
  if (g === 'kem') return '#8b1e1e';
  return '#6b5a1e';
}

export function getTranTrieuOracle(id: number): TranTrieuOracle | undefined {
  return TRAN_TRIEU_ORACLES.find((o) => o.id === id);
}

/** Rút ngẫu nhiên 1 trong 50 quẻ Linh Xăm Đức Thánh Trần. */
export function drawTranTrieuOracle(): TranTrieuOracle {
  const idx = Math.floor(Math.random() * TRAN_TRIEU_ORACLES.length);
  return TRAN_TRIEU_ORACLES[idx] ?? TRAN_TRIEU_ORACLES[0];
}

export const TRAN_TRIEU_INTRO = {
  title: 'Trần Triều Thần Ứng',
  aka: 'Linh Xăm Đức Thánh Trần Hưng Đạo · Cửu Thiên Vũ Đế',
  countNote:
    'Tên sách / truyền miệng hay gọi «Trần Triều 100 Quẻ Thần Ứng», nhưng bản linh xăm phụng tự phổ biến (Hội Bắc Việt Tương Tế) lưu hành là 50 quẻ, chia 7 hạng.',
  groups:
    'Nhóm tốt 20 quẻ (thượng quái · thượng thượng · đại cát); trung bình 14; nhóm kém 16 (trung hạ · hạ hạ · hạ quái).',
};
