/**
 * Mượn tuổi làm nhà — khi chủ nhà phạm Kim Lâu / Hoang Ốc,
 * gợi ý người có tuổi thuận để đứng tên / chủ trì lễ động thổ.
 */

import { formatCanChi, tuoiMu, yearCanChi } from './lunar';
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
  kimLau: RuleResult;
  hoangOc: RuleResult;
  tamTai: RuleResult;
  xungNam: RuleResult;
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

function scoreCandidate(
  kimLau: RuleResult,
  hoangOc: RuleResult,
  tamTai: RuleResult,
  xungNam: RuleResult,
): { score: number; overall: Verdict; badge: string; note: string } {
  if (kimLau.verdict === 'bad' || hoangOc.verdict === 'bad') {
    return {
      score: 0,
      overall: 'bad',
      badge: 'Không phù hợp',
      note: 'Vẫn phạm Kim Lâu hoặc Hoang Ốc — không nên mượn.',
    };
  }

  let score = 60;
  const notes: string[] = [];

  // Hoang Ốc tốt đã có
  score += 20;
  notes.push(hoangOc.detail.split('—')[1]?.trim() || 'Hoang Ốc tốt');

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

  if (tamTai.verdict === 'caution' || xungNam.verdict === 'caution') {
    return {
      score,
      overall: 'caution',
      badge: 'Tạm được',
      note: `Không phạm Kim Lâu / Hoang Ốc nhưng ${notes.filter((n) => n.includes('Tam Tai') || n.includes('xung')).join(', ')}. Nên ưu tiên ứng viên khác nếu có.`,
    };
  }

  return {
    score,
    overall: 'good',
    badge: 'Nên mượn',
    note: `Tuổi thuận: ${notes[0]}. Không Kim Lâu, không Tam Tai, không xung năm.`,
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
 */
export function findBorrowCandidates(
  targetYear: number,
  limit = 12,
): BorrowCandidate[] {
  const list: BorrowCandidate[] = [];

  for (let age = MIN_AGE; age <= MAX_AGE; age++) {
    const birthYear = targetYear - age + 1;
    if (!isKimLauClear(birthYear, targetYear)) continue;
    if (!isHoangOcGood(birthYear, targetYear)) continue;

    const kimLau = checkKimLau(birthYear, targetYear);
    const hoangOc = checkHoangOc(birthYear, targetYear);
    const tamTai = checkTamTai(birthYear, targetYear);
    const xungNam = checkXungNam(birthYear, targetYear);
    const scored = scoreCandidate(kimLau, hoangOc, tamTai, xungNam);

    list.push({
      birthYear,
      ageMu: age,
      canChi: formatCanChi(yearCanChi(birthYear)),
      kimLau,
      hoangOc,
      tamTai,
      xungNam,
      overall: scored.overall,
      score: scored.score,
      badge: scored.badge,
      note: scored.note,
    });
  }

  list.sort((a, b) => b.score - a.score || a.ageMu - b.ageMu);
  return list.slice(0, limit);
}

export function getMuonTuoiLamNha(
  ownerBirthYear: number,
  targetYear: number,
): MuonTuoiResult {
  const owner = getOwnerStatus(ownerBirthYear, targetYear);
  const candidates = findBorrowCandidates(targetYear, 16);
  const best = candidates.filter((c) => c.overall === 'good').slice(0, 8);
  return { owner, candidates, best };
}

/** Kiểm tra nhanh một người cụ thể có mượn được không */
export function checkBorrowPerson(
  personBirthYear: number,
  targetYear: number,
): BorrowCandidate {
  const kimLau = checkKimLau(personBirthYear, targetYear);
  const hoangOc = checkHoangOc(personBirthYear, targetYear);
  const tamTai = checkTamTai(personBirthYear, targetYear);
  const xungNam = checkXungNam(personBirthYear, targetYear);
  const scored = scoreCandidate(kimLau, hoangOc, tamTai, xungNam);
  return {
    birthYear: personBirthYear,
    ageMu: tuoiMu(personBirthYear, targetYear),
    canChi: formatCanChi(yearCanChi(personBirthYear)),
    kimLau,
    hoangOc,
    tamTai,
    xungNam,
    overall: scored.overall,
    score: scored.score,
    badge: scored.badge,
    note: scored.note,
  };
}
