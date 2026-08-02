/**
 * Năm sinh con tốt — xét con hợp CẢ cha lẫn mẹ:
 * địa chi (tam hợp / lục hợp / lục xung / lục hại / tương hình),
 * nạp âm tương sinh – tương khắc, thiên can ngũ hợp – tương xung,
 * kết hợp Kim Lâu (Kim Lâu Tử) và Tam Tai của mẹ theo năm sinh con.
 */

import { napAmOfYear } from './hop-tuoi';
import { formatCanChi, yearCanChi, type Chi } from './lunar';
import { KHAC, SINH, type NguHanh } from './nap-am-ngu-hanh';
import { checkKimLau, checkTamTai, type Verdict } from './rules';

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
const TUONG_HINH: Array<[Chi, Chi]> = [
  ['Tý', 'Mão'],
  ['Dần', 'Tỵ'],
  ['Tỵ', 'Thân'],
  ['Dần', 'Thân'],
  ['Sửu', 'Tuất'],
  ['Tuất', 'Mùi'],
  ['Sửu', 'Mùi'],
];

const CAN_NGU_HOP: Array<[string, string]> = [
  ['Giáp', 'Kỷ'],
  ['Ất', 'Canh'],
  ['Bính', 'Tân'],
  ['Đinh', 'Nhâm'],
  ['Mậu', 'Quý'],
];
const CAN_XUNG: Array<[string, string]> = [
  ['Giáp', 'Canh'],
  ['Ất', 'Tân'],
  ['Bính', 'Nhâm'],
  ['Đinh', 'Quý'],
];

function inPairs<T extends string>(pairs: Array<[T, T]>, a: T, b: T): boolean {
  return pairs.some(([x, y]) => (x === a && y === b) || (x === b && y === a));
}

export interface ParentMatch {
  parentLabel: string;
  parentCanChi: string;
  parentNapAm: string;
  /** Đối chiếu địa chi, nạp âm, thiên can — mỗi mục kèm điểm */
  chiRelation: { text: string; level: 'tot' | 'binh' | 'xau'; score: number };
  napAmRelation: { text: string; level: 'tot' | 'binh' | 'xau'; score: number };
  canRelation: { text: string; level: 'tot' | 'binh' | 'xau'; score: number };
  score: number;
}

export interface ChildYearCheck {
  year: number;
  canChi: string;
  napAm: string;
  napAmHanh: NguHanh;
  matches: ParentMatch[];
  /** Kim Lâu / Tam Tai của mẹ trong năm sinh */
  motherNotes: Array<{ label: string; verdict: Verdict; detail: string }>;
  score: number;
  maxScore: number;
  verdict: Verdict;
  note: string;
}

function chiRelationOf(
  childChi: Chi,
  parentChi: Chi,
  parentLabel: string,
): ParentMatch['chiRelation'] {
  const goods: string[] = [];
  const bads: string[] = [];
  if (
    TAM_HOP.some(
      (g) => g.includes(childChi) && g.includes(parentChi) && childChi !== parentChi,
    )
  ) {
    goods.push('tam hợp');
  }
  if (inPairs(LUC_HOP, childChi, parentChi)) goods.push('lục hợp');
  if (inPairs(LUC_XUNG, childChi, parentChi)) bads.push('lục xung');
  if (inPairs(LUC_HAI, childChi, parentChi)) bads.push('lục hại');
  if (inPairs(TUONG_HINH, childChi, parentChi)) bads.push('tương hình');

  if (goods.length && !bads.length) {
    return {
      text: `Chi ${childChi} ${goods.join(', ')} với chi ${parentChi} (${parentLabel}) — rất thuận.`,
      level: 'tot',
      score: 2,
    };
  }
  if (bads.length && !goods.length) {
    return {
      text: `Chi ${childChi} ${bads.join(', ')} với chi ${parentChi} (${parentLabel}) — kém thuận.`,
      level: 'xau',
      score: 0,
    };
  }
  if (goods.length && bads.length) {
    return {
      text: `Chi ${childChi} – ${parentChi}: vừa ${goods.join(', ')} vừa ${bads.join(', ')} — đan xen.`,
      level: 'binh',
      score: 1,
    };
  }
  return {
    text: `Chi ${childChi} – ${parentChi} (${parentLabel}): không hợp không xung — bình hòa.`,
    level: 'binh',
    score: 1,
  };
}

function napAmRelationOf(
  childHanh: NguHanh,
  childNapAm: string,
  parentHanh: NguHanh,
  parentNapAm: string,
  parentLabel: string,
): ParentMatch['napAmRelation'] {
  if (childHanh === parentHanh) {
    return {
      text: `${childNapAm} (${childHanh}) cùng hành với ${parentNapAm} (${parentLabel}) — tỵ hòa.`,
      level: 'binh',
      score: 1,
    };
  }
  if (SINH[parentHanh] === childHanh) {
    return {
      text: `Mệnh ${parentLabel} (${parentHanh}) sinh mệnh con (${childHanh}) — con được trợ lực, rất tốt.`,
      level: 'tot',
      score: 2,
    };
  }
  if (SINH[childHanh] === parentHanh) {
    return {
      text: `Mệnh con (${childHanh}) sinh mệnh ${parentLabel} (${parentHanh}) — con đem lộc cho ${parentLabel}, tốt.`,
      level: 'tot',
      score: 2,
    };
  }
  if (KHAC[childHanh] === parentHanh) {
    return {
      text: `Mệnh con (${childHanh}) khắc mệnh ${parentLabel} (${parentHanh}) — kém thuận, cần hành thông quan.`,
      level: 'xau',
      score: 0,
    };
  }
  return {
    text: `Mệnh ${parentLabel} (${parentHanh}) khắc mệnh con (${childHanh}) — kém thuận, cần hóa giải.`,
    level: 'xau',
    score: 0,
  };
}

function canRelationOf(
  childCan: string,
  parentCan: string,
  parentLabel: string,
): ParentMatch['canRelation'] {
  if (inPairs(CAN_NGU_HOP, childCan, parentCan)) {
    return {
      text: `Can ${childCan} ngũ hợp can ${parentCan} (${parentLabel}) — quý mến, thuận hòa.`,
      level: 'tot',
      score: 1,
    };
  }
  if (inPairs(CAN_XUNG, childCan, parentCan)) {
    return {
      text: `Can ${childCan} tương xung can ${parentCan} (${parentLabel}) — dễ trái ý, mức nhẹ.`,
      level: 'xau',
      score: 0,
    };
  }
  return {
    text: `Can ${childCan} – ${parentCan} (${parentLabel}): bình thường.`,
    level: 'binh',
    score: 0.5,
  };
}

function matchParent(
  childYear: number,
  parentYear: number,
  parentLabel: string,
): ParentMatch {
  const child = yearCanChi(childYear);
  const parent = yearCanChi(parentYear);
  const childNapAm = napAmOfYear(childYear);
  const parentNapAm = napAmOfYear(parentYear);

  const chiRelation = chiRelationOf(child.chi, parent.chi, parentLabel);
  const napAmRelation = napAmRelationOf(
    childNapAm.hanh,
    childNapAm.name,
    parentNapAm.hanh,
    parentNapAm.name,
    parentLabel,
  );
  const canRelation = canRelationOf(child.can, parent.can, parentLabel);

  return {
    parentLabel,
    parentCanChi: formatCanChi(parent),
    parentNapAm: parentNapAm.name,
    chiRelation,
    napAmRelation,
    canRelation,
    score: chiRelation.score + napAmRelation.score + canRelation.score,
  };
}

/**
 * Quét các năm sinh con từ fromYear, chấm điểm hợp cha mẹ.
 * fatherYear để trống nếu chỉ xét mẹ.
 */
export function goodYearsForChild(
  motherYear: number,
  fatherYear: number | null,
  fromYear: number,
  count = 6,
): ChildYearCheck[] {
  const out: ChildYearCheck[] = [];
  for (let i = 0; i < count; i++) {
    const year = fromYear + i;
    const child = yearCanChi(year);
    const childNapAm = napAmOfYear(year);

    const matches: ParentMatch[] = [matchParent(year, motherYear, 'mẹ')];
    if (fatherYear) matches.push(matchParent(year, fatherYear, 'cha'));

    const kimLau = checkKimLau(motherYear, year);
    const tamTai = checkTamTai(motherYear, year);
    const motherNotes = [
      {
        label: 'Kim Lâu của mẹ',
        verdict: kimLau.verdict,
        detail: kimLau.detail,
      },
      {
        label: 'Tam Tai của mẹ',
        verdict: tamTai.verdict,
        detail: tamTai.detail,
      },
    ];

    // Điểm: mỗi cha/mẹ tối đa 5 (chi 2 + nạp âm 2 + can 1); trừ Kim Lâu / Tam Tai mẹ.
    const maxScore = matches.length * 5;
    let score = matches.reduce((s, m) => s + m.score, 0);
    if (kimLau.verdict === 'bad') score -= 2;
    if (tamTai.verdict === 'caution') score -= 1;
    score = Math.max(0, Math.round(score * 10) / 10);

    const hasChiXung = matches.some((m) => m.chiRelation.level === 'xau');
    const ratio = score / maxScore;

    let verdict: Verdict;
    let note: string;
    if (hasChiXung || kimLau.verdict === 'bad') {
      verdict = 'bad';
      const reasons = [
        hasChiXung ? 'con xung / hại tuổi cha mẹ' : '',
        kimLau.verdict === 'bad' ? 'mẹ phạm Kim Lâu (Kim Lâu Tử hại con)' : '',
      ].filter(Boolean);
      note = `Không thuận: ${reasons.join('; ')}. Nên cân nhắc năm khác.`;
    } else if (ratio >= 0.65 && tamTai.verdict === 'good') {
      verdict = 'good';
      note = `Năm thuận sinh con — con tuổi ${formatCanChi(child)}, mệnh ${childNapAm.name}, hợp tuổi ${matches.map((m) => m.parentLabel).join(' và ')}.`;
    } else {
      verdict = 'caution';
      note = `Mức trung bình (${score}/${maxScore} điểm) — không xung nhưng chưa thật hợp, hoặc mẹ đang Tam Tai. Có thể tham vấn thêm.`;
    }

    out.push({
      year,
      canChi: formatCanChi(child),
      napAm: childNapAm.name,
      napAmHanh: childNapAm.hanh,
      matches,
      motherNotes,
      score,
      maxScore,
      verdict,
      note,
    });
  }
  return out;
}
