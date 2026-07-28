import data from './quan-am-xam-data.json';

export type XamRank = 'thượng' | 'trung' | 'hạ';

export interface QuanAmOracle {
  id: number;
  rank: XamRank;
  story: string;
  poem: string;
  advice: string;
  omen: string;
  detail: string;
}

export const QUAN_AM_ORACLES = data as QuanAmOracle[];

export const RANK_LABELS: Record<XamRank, string> = {
  thượng: 'Thượng xăm',
  trung: 'Trung xăm',
  hạ: 'Hạ xăm',
};

export function getOracleById(id: number): QuanAmOracle | undefined {
  return QUAN_AM_ORACLES.find((o) => o.id === id);
}

/** Rút ngẫu nhiên 1 trong 100 quẻ Quan Âm Linh Xăm. */
export function drawRandomOracle(): QuanAmOracle {
  const idx = Math.floor(Math.random() * QUAN_AM_ORACLES.length);
  return QUAN_AM_ORACLES[idx] ?? QUAN_AM_ORACLES[0];
}
