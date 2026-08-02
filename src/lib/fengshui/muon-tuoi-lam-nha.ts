/**
 * Mượn tuổi làm nhà — khi chủ nhà phạm Kim Lâu / Hoang Ốc,
 * gợi ý người có tuổi thuận để đứng tên / chủ trì lễ động thổ.
 *
 * Điều kiện người được mượn: không phạm Kim Lâu / Hoang Ốc năm làm nhà,
 * không Tam Tai, không xung năm; và so với CHỦ NHÀ: không lục xung /
 * lục hại, ưu tiên tam hợp / lục hợp chi, nạp âm tương sinh,
 * nhiều tuổi hơn gia chủ (dân gian ưu tiên bậc trên).
 */

import { napAmOfYear } from './hop-tuoi';
import { formatCanChi, tuoiMu, yearCanChi, type Chi } from './lunar';
import { KHAC, SINH } from './nap-am-ngu-hanh';
import {
  checkHoangOc,
  checkKimLau,
  checkTamTai,
  checkXungNam,
  combineVerdicts,
  type RuleResult,
  type Verdict,
} from './rules';

export interface OwnerStatus {
  birthYear: number;
  targetYear: number;
  ageMu: number;
  canChi: string;
  results: RuleResult[];
  overall: Verdict;
  needsBorrow: boolean;
  summary: string;
}

export interface BorrowCandidate {
  birthYear: number;
  ageMu: number;
  canChi: string;
  napAm: string;
  kimLau: RuleResult;
  hoangOc: RuleResult;
  tamTai: RuleResult;
  xungNam: RuleResult;
  /** Đối chiếu với chủ nhà (nếu có năm sinh chủ nhà) */
  ownerRelation: RuleResult | null;
  overall: Verdict;
  score: number;
  badge: string;
  note: string;
}

export interface MuonTuoiResult {
  owner: OwnerStatus;
  candidates: BorrowCandidate[];
  /** Ứng viên tốt nhất (overall good) */
  best: BorrowCandidate[];
}

const MIN_AGE = 28;
const MAX_AGE = 72;

const TAM_HOP: Chi[][] = [
  ['Thân', 'Tý', 'Thìn'],
  ['Dần', 'Ngọ', 'Tuất'],
  ['Tỵ', 'Dậu', 'Sửu'],
  ['Hợi', 'Mão', 'Mùi'],
];
const LUC_HOP: Array<[Chi, Chi]> = [
  ['Tý', 'Sửu'],
  ['Dần', 'Hợi'],
  ['Mão', 'Tuất'],
  ['Thìn', 'Dậu'],
  ['Tỵ', 'Thân'],
  ['Ngọ', 'Mùi'],
];
const LUC_XUNG: Array<[Chi, Chi]> = [
  ['Tý', 'Ngọ'],
  ['Sửu', 'Mùi'],
  ['Dần', 'Thân'],
  ['Mão', 'Dậu'],
  ['Thìn', 'Tuất'],
  ['Tỵ', 'Hợi'],
];
const LUC_HAI: Array<[Chi, Chi]> = [
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

/**
 * Đối chiếu người được mượn với chủ nhà:
 * lục xung / lục hại → bad; tam hợp / lục hợp hoặc nạp âm tương sinh → good.
 */
function ownerRelationOf(
  personYear: number,
  ownerYear: number,
): { rule: RuleResult; bonus: number } {
  const p = yearCanChi(personYear);
  const o = yearCanChi(ownerYear);
  const pNapAm = napAmOfYear(personYear);
  const oNapAm = napAmOfYear(ownerYear);

  const goods: string[] = [];
  const bads: string[] = [];

  if (inPairs(LUC_XUNG, p.chi, o.chi)) bads.push('lục xung chi');
  if (inPairs(LUC_HAI, p.chi, o.chi)) bads.push('lục hại chi');
  if (
    TAM_HOP.some((g) => g.includes(p.chi) && g.includes(o.chi) && p.chi !== o.chi)
  ) {
    goods.push('tam hợp chi');
  }
  if (inPairs(LUC_HOP, p.chi, o.chi)) goods.push('lục hợp chi');

  let napAmNote = '';
  let napAmBonus = 0;
  if (SINH[pNapAm.hanh] === oNapAm.hanh || SINH[oNapAm.hanh] === pNapAm.hanh) {
    napAmNote = `mệnh ${pNapAm.name} tương sinh mệnh chủ nhà (${oNapAm.name})`;
    napAmBonus = 8;
  } else if (
    KHAC[pNapAm.hanh] === oNapAm.hanh ||
    KHAC[oNapAm.hanh] === pNapAm.hanh
  ) {
    napAmNote = `mệnh ${pNapAm.name} tương khắc mệnh chủ nhà (${oNapAm.name})`;
    napAmBonus = -6;
  }

  if (bads.length > 0) {
    return {
      rule: {
        key: 'hop_chu_nha',
        label: 'Đối chiếu chủ nhà',
        verdict: 'bad',
        detail: `Tuổi ${formatCanChi(p)} ${bads.join(', ')} với tuổi chủ nhà ${formatCanChi(o)} — không nên mượn.`,
      },
      bonus: -100,
    };
  }

  if (goods.length > 0 || napAmBonus > 0) {
    const parts = [...goods, napAmNote].filter(Boolean);
    return {
      rule: {
        key: 'hop_chu_nha',
        label: 'Đối chiếu chủ nhà',
        verdict: 'good',
        detail: `Tuổi ${formatCanChi(p)} ${parts.join('; ')} với chủ nhà ${formatCanChi(o)} — càng thuận.`,
      },
      bonus: (goods.length > 0 ? 10 : 0) + Math.max(napAmBonus, 0),
    };
  }

  return {
    rule: {
      key: 'hop_chu_nha',
      label: 'Đối chiếu chủ nhà',
      verdict: napAmBonus < 0 ? 'caution' : 'good',
      detail:
        napAmBonus < 0
          ? `Không xung chi nhưng ${napAmNote} — chấp nhận được, nên ưu tiên người khác nếu có.`
          : `Tuổi ${formatCanChi(p)} không xung, không hại tuổi chủ nhà ${formatCanChi(o)}.`,
    },
    bonus: napAmBonus,
  };
}

function isKimLauClear(birthYear: number, targetYear: number): boolean {
  return checkKimLau(birthYear, targetYear).verdict === 'good';
}

function isHoangOcGood(birthYear: number, targetYear: number): boolean {
  return checkHoangOc(birthYear, targetYear).verdict === 'good';
}

function ownerNeedsBorrow(results: RuleResult[]): boolean {
  return results.some(
    (r) =>
      (r.key === 'kim_lau' || r.key === 'hoang_oc') && r.verdict === 'bad',
  );
}

function buildCandidate(
  birthYear: number,
  targetYear: number,
  ownerBirthYear: number | null,
): BorrowCandidate {
  const kimLau = checkKimLau(birthYear, targetYear);
  const hoangOc = checkHoangOc(birthYear, targetYear);
  const tamTai = checkTamTai(birthYear, targetYear);
  const xungNam = checkXungNam(birthYear, targetYear);
  const relation =
    ownerBirthYear && ownerBirthYear >= 1900
      ? ownerRelationOf(birthYear, ownerBirthYear)
      : null;

  let overall: Verdict;
  let score = 0;
  let badge: string;
  const notes: string[] = [];

  if (kimLau.verdict === 'bad' || hoangOc.verdict === 'bad') {
    overall = 'bad';
    badge = 'Không phù hợp';
    notes.push('vẫn phạm Kim Lâu hoặc Hoang Ốc năm làm nhà');
  } else if (relation && relation.rule.verdict === 'bad') {
    overall = 'bad';
    badge = 'Xung tuổi chủ nhà';
    notes.push('lục xung / lục hại với tuổi chủ nhà');
  } else {
    score = 60;
    if (tamTai.verdict === 'good') {
      score += 10;
    } else {
      score -= 15;
      notes.push('đang năm Tam Tai');
    }
    if (xungNam.verdict === 'good') {
      score += 10;
    } else {
      score -= 10;
      notes.push('xung năm làm nhà');
    }
    if (relation) {
      score += relation.bonus;
      if (relation.rule.verdict === 'good' && relation.bonus > 0) {
        notes.push('hợp tuổi chủ nhà');
      }
    }
    // Ưu tiên bậc trên: nhiều tuổi hơn gia chủ
    if (ownerBirthYear && birthYear < ownerBirthYear) {
      score += 5;
    }

    if (
      tamTai.verdict === 'caution' ||
      xungNam.verdict === 'caution' ||
      relation?.rule.verdict === 'caution'
    ) {
      overall = 'caution';
      badge = 'Tạm được';
    } else {
      overall = 'good';
      badge = 'Nên mượn';
    }
  }

  const note =
    overall === 'bad'
      ? `Không nên mượn: ${notes.join('; ')}.`
      : overall === 'caution'
        ? `Không phạm Kim Lâu / Hoang Ốc nhưng ${notes.filter((n) => !n.includes('hợp tuổi')).join(', ')}. Ưu tiên ứng viên khác nếu có.`
        : `Tuổi thuận: không Kim Lâu, không Hoang Ốc, không Tam Tai, không xung năm${
            relation?.rule.verdict === 'good' && relation.bonus > 0
              ? ', lại hợp tuổi chủ nhà'
              : ''
          }.`;

  return {
    birthYear,
    ageMu: tuoiMu(birthYear, targetYear),
    canChi: formatCanChi(yearCanChi(birthYear)),
    napAm: napAmOfYear(birthYear).name,
    kimLau,
    hoangOc,
    tamTai,
    xungNam,
    ownerRelation: relation?.rule ?? null,
    overall,
    score,
    badge,
    note,
  };
}

export function getOwnerStatus(
  birthYear: number,
  targetYear: number,
): OwnerStatus {
  const results = [
    checkKimLau(birthYear, targetYear),
    checkHoangOc(birthYear, targetYear),
    checkTamTai(birthYear, targetYear),
    checkXungNam(birthYear, targetYear),
  ];
  const overall = combineVerdicts(results);
  const needsBorrow = ownerNeedsBorrow(results);
  const ageMu = tuoiMu(birthYear, targetYear);
  const canChi = formatCanChi(yearCanChi(birthYear));

  let summary: string;
  if (!needsBorrow && overall === 'good') {
    summary =
      'Tuổi chủ nhà thuận — không bắt buộc mượn tuổi. Có thể tự đứng tên làm nhà.';
  } else if (!needsBorrow) {
    summary =
      'Không phạm Kim Lâu / Hoang Ốc nặng, nhưng có Tam Tai hoặc xung năm — cân nhắc thận trọng hoặc tham vấn thêm.';
  } else {
    summary =
      'Chủ nhà phạm Kim Lâu và/hoặc Hoang Ốc. Nên mượn tuổi người thân thuận để chủ trì động thổ / đứng tên lễ.';
  }

  return {
    birthYear,
    targetYear,
    ageMu,
    canChi,
    results,
    overall,
    needsBorrow,
    summary,
  };
}

/**
 * Quét các năm sinh trong khoảng tuổi hợp lý → ứng viên mượn tuổi.
 * Ứng viên lục xung / lục hại tuổi chủ nhà bị loại.
 */
export function findBorrowCandidates(
  targetYear: number,
  ownerBirthYear: number | null = null,
  limit = 16,
): BorrowCandidate[] {
  const list: BorrowCandidate[] = [];

  for (let age = MIN_AGE; age <= MAX_AGE; age++) {
    const birthYear = targetYear - age + 1;
    if (!isKimLauClear(birthYear, targetYear)) continue;
    if (!isHoangOcGood(birthYear, targetYear)) continue;
    if (ownerBirthYear && birthYear === ownerBirthYear) continue;

    const candidate = buildCandidate(birthYear, targetYear, ownerBirthYear);
    if (candidate.overall === 'bad') continue;
    list.push(candidate);
  }

  list.sort((a, b) => b.score - a.score || a.ageMu - b.ageMu);
  return list.slice(0, limit);
}

export function getMuonTuoiLamNha(
  ownerBirthYear: number,
  targetYear: number,
): MuonTuoiResult {
  const owner = getOwnerStatus(ownerBirthYear, targetYear);
  const candidates = findBorrowCandidates(targetYear, ownerBirthYear, 16);
  const best = candidates.filter((c) => c.overall === 'good').slice(0, 8);
  return { owner, candidates, best };
}

/** Kiểm tra nhanh một người cụ thể có mượn được không */
export function checkBorrowPerson(
  personBirthYear: number,
  targetYear: number,
  ownerBirthYear: number | null = null,
): BorrowCandidate {
  return buildCandidate(personBirthYear, targetYear, ownerBirthYear);
}
