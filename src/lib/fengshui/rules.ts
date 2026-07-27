import {
  CHI,
  type Chi,
  dayCanChi,
  solarToLunar,
  tuoiMu,
  yearCanChi,
} from './lunar';

export type Verdict = 'good' | 'caution' | 'bad';

export interface RuleResult {
  key: string;
  label: string;
  verdict: Verdict;
  detail: string;
}

// ----- Kim Lâu (làm nhà) -----
// Tuổi mụ mod 9 = 1, 3, 6, 8 → phạm Kim Lâu.
export function checkKimLau(birthYear: number, referenceYear?: number): RuleResult {
  const age = tuoiMu(birthYear, referenceYear);
  const r = age % 9;
  const kinds: Record<number, string> = {
    1: 'Kim Lâu Thân (hại bản thân)',
    3: 'Kim Lâu Thê (hại vợ/chồng)',
    6: 'Kim Lâu Tử (hại con cái)',
    8: 'Kim Lâu Súc (hại vật nuôi, tài sản)',
  };
  const bad = kinds[r];
  return {
    key: 'kim_lau',
    label: 'Kim Lâu',
    verdict: bad ? 'bad' : 'good',
    detail: bad
      ? `Tuổi mụ ${age} phạm ${bad}. Nên hoãn hoặc mượn tuổi.`
      : `Tuổi mụ ${age} không phạm Kim Lâu.`,
  };
}

// ----- Hoang Ốc -----
// Tuổi mụ mod 6: 1=Nhất Kiết, 2=Nhì Nghi, 3=Tam Địa Sát, 4=Tứ Tấn Tài,
// 5=Ngũ Thọ Tử, 6/0=Lục Hoang Ốc.
export function checkHoangOc(birthYear: number, referenceYear?: number): RuleResult {
  const age = tuoiMu(birthYear, referenceYear);
  const r = age % 6 === 0 ? 6 : age % 6;
  const map: Record<number, { name: string; verdict: Verdict; note: string }> = {
    1: { name: 'Nhất Kiết', verdict: 'good', note: 'Tốt cho làm nhà' },
    2: { name: 'Nhì Nghi', verdict: 'good', note: 'Tốt cho làm nhà' },
    3: { name: 'Tam Địa Sát', verdict: 'bad', note: 'Phạm, tránh làm nhà' },
    4: { name: 'Tứ Tấn Tài', verdict: 'good', note: 'Tốt cho làm nhà, được tài lộc' },
    5: { name: 'Ngũ Thọ Tử', verdict: 'bad', note: 'Phạm, tránh làm nhà' },
    6: { name: 'Lục Hoang Ốc', verdict: 'bad', note: 'Phạm, tránh làm nhà' },
  };
  const it = map[r];
  return {
    key: 'hoang_oc',
    label: 'Hoang Ốc',
    verdict: it.verdict,
    detail: `Tuổi mụ ${age} — ${it.name}. ${it.note}.`,
  };
}

// ----- Tam Tai -----
// Ba năm tam tai theo chi năm sinh:
// Thân Tý Thìn → Dần Mão Thìn
// Dần Ngọ Tuất → Thân Dậu Tuất
// Tỵ Dậu Sửu → Hợi Tý Sửu
// Hợi Mão Mùi → Tỵ Ngọ Mùi
const TAM_TAI_GROUPS: Array<{ triad: Chi[]; tam_tai_years: Chi[] }> = [
  { triad: ['Thân', 'Tý', 'Thìn'], tam_tai_years: ['Dần', 'Mão', 'Thìn'] },
  { triad: ['Dần', 'Ngọ', 'Tuất'], tam_tai_years: ['Thân', 'Dậu', 'Tuất'] },
  { triad: ['Tỵ', 'Dậu', 'Sửu'], tam_tai_years: ['Hợi', 'Tý', 'Sửu'] },
  { triad: ['Hợi', 'Mão', 'Mùi'], tam_tai_years: ['Tỵ', 'Ngọ', 'Mùi'] },
];

export function checkTamTai(
  birthYear: number,
  referenceYear: number = new Date().getFullYear(),
): RuleResult {
  const birthChi = yearCanChi(birthYear).chi;
  const nowChi = yearCanChi(referenceYear).chi;
  const group = TAM_TAI_GROUPS.find((g) => g.triad.includes(birthChi));
  const inTamTai = group?.tam_tai_years.includes(nowChi) ?? false;
  return {
    key: 'tam_tai',
    label: 'Tam Tai',
    verdict: inTamTai ? 'caution' : 'good',
    detail: inTamTai
      ? `Năm ${referenceYear} (${nowChi}) là năm Tam Tai của tuổi ${birthChi}. Nên cẩn trọng đại sự.`
      : `Năm ${referenceYear} không phải Tam Tai của tuổi ${birthChi}.`,
  };
}

// ----- Xung tuổi (theo chi) -----
const XUNG_PAIRS: Array<[Chi, Chi]> = [
  ['Tý', 'Ngọ'],
  ['Sửu', 'Mùi'],
  ['Dần', 'Thân'],
  ['Mão', 'Dậu'],
  ['Thìn', 'Tuất'],
  ['Tỵ', 'Hợi'],
];

function isXungChi(a: Chi, b: Chi): boolean {
  return XUNG_PAIRS.some(
    ([x, y]) => (x === a && y === b) || (x === b && y === a),
  );
}

export function checkXungNam(
  birthYear: number,
  targetYear: number,
): RuleResult {
  const birthChi = yearCanChi(birthYear).chi;
  const targetChi = yearCanChi(targetYear).chi;
  const xung = isXungChi(birthChi, targetChi);
  return {
    key: 'xung_nam',
    label: 'Xung năm',
    verdict: xung ? 'caution' : 'good',
    detail: xung
      ? `Chi năm ${targetYear} (${targetChi}) xung với chi tuổi ${birthChi}.`
      : `Chi năm ${targetYear} (${targetChi}) không xung tuổi ${birthChi}.`,
  };
}

// ----- Hoàng đạo / Hắc đạo (đơn giản theo chi ngày) -----
// Simplified: 6 hoàng đạo + 6 hắc đạo cyclic per month.
// This is a rule-of-thumb approximation; full calculation depends on lunar
// month + chi day mapping. For Phase 1 we mark Tý/Sửu/Thìn/Tỵ/Mùi/Tuất as
// hoàng đạo (rough).
const HOANG_DAO_CHI: Chi[] = ['Tý', 'Sửu', 'Thìn', 'Tỵ', 'Mùi', 'Tuất'];

export function checkHoangDaoDay(
  dd: number,
  mm: number,
  yy: number,
): RuleResult {
  const lunar = solarToLunar(dd, mm, yy);
  const dcc = dayCanChi(lunar.jd);
  const isHoangDao = HOANG_DAO_CHI.includes(dcc.chi);
  return {
    key: 'hoang_dao',
    label: 'Ngày Hoàng đạo',
    verdict: isHoangDao ? 'good' : 'caution',
    detail: isHoangDao
      ? `Ngày ${dd}/${mm}/${yy} (${dcc.can} ${dcc.chi}) là ngày Hoàng đạo.`
      : `Ngày ${dd}/${mm}/${yy} (${dcc.can} ${dcc.chi}) không thuộc Hoàng đạo — nên xem xét.`,
  };
}

// ----- Bát trạch: cung mệnh + hướng nhà -----
// Nam: cung mệnh = (10 - (year_sum)) mod 9  (custom rule per luận giải)
// Nữ: cung mệnh = (5 + year_sum) mod 9
// Sử dụng bảng giản lược: tính cung mệnh theo năm sinh dương lịch.
export const CUNG_MENH = [
  'Khảm',
  'Ly',
  'Cấn',
  'Đoài',
  'Càn',
  'Khôn',
  'Tốn',
  'Chấn',
] as const;
export type CungMenh = (typeof CUNG_MENH)[number];

const DONG_TU = new Set<CungMenh>(['Khảm', 'Ly', 'Chấn', 'Tốn']);
const TAY_TU = new Set<CungMenh>(['Càn', 'Khôn', 'Cấn', 'Đoài']);

const HUONG_DONG_TU = ['Bắc', 'Nam', 'Đông', 'Đông Nam'];
const HUONG_TAY_TU = ['Tây', 'Tây Nam', 'Đông Bắc', 'Tây Bắc'];

function sumDigits(n: number): number {
  let s = 0;
  let x = Math.abs(n);
  while (x > 0) {
    s += x % 10;
    x = Math.floor(x / 10);
  }
  return s > 9 ? sumDigits(s) : s;
}

export function calcCungMenh(
  birthYear: number,
  gender: 'nam' | 'nu',
): CungMenh {
  // Simplified: based on the sum-of-digits rule commonly used in Bát trạch.
  const s = sumDigits(birthYear);
  const idxMap: Record<'nam' | 'nu', CungMenh[]> = {
    nam: ['Khảm', 'Ly', 'Cấn', 'Đoài', 'Càn', 'Khôn', 'Tốn', 'Chấn', 'Cấn'],
    nu: ['Cấn', 'Càn', 'Đoài', 'Cấn', 'Ly', 'Khảm', 'Khôn', 'Chấn', 'Tốn'],
  };
  return idxMap[gender][s % 9];
}

export function goodDirections(
  cung: CungMenh,
): { group: 'Đông Tứ Mệnh' | 'Tây Tứ Mệnh'; directions: string[] } {
  if (DONG_TU.has(cung)) {
    return { group: 'Đông Tứ Mệnh', directions: HUONG_DONG_TU };
  }
  return { group: 'Tây Tứ Mệnh', directions: HUONG_TAY_TU };
}

export function checkHuongNha(
  birthYear: number,
  gender: 'nam' | 'nu',
): RuleResult {
  const cung = calcCungMenh(birthYear, gender);
  const g = goodDirections(cung);
  return {
    key: 'huong_nha',
    label: `Cung mệnh: ${cung} (${g.group})`,
    verdict: 'good',
    detail: `Nên chọn nhà hướng: ${g.directions.join(', ')}. Tránh 4 hướng còn lại.`,
  };
}

// ----- Trùng tang / Nhập mộ / Thiên di -----
// Bảng tra 12 địa chi theo chi ngày mất và tuổi thọ (tính theo chi).
// Rule chuẩn dân gian:
// - Nam bắt đầu từ Dần, Nữ bắt đầu từ Thân, đếm thuận theo tuổi mụ đến ngày mất.
// - Vị trí ngày, tháng, năm mất rơi vào các cung:
//   Tý=Trùng Tang, Sửu=Thiên Di, Dần=Nhập Mộ, Mão=Trùng Tang,
//   Thìn=Thiên Di, Tỵ=Nhập Mộ, Ngọ=Trùng Tang, Mùi=Thiên Di,
//   Thân=Nhập Mộ, Dậu=Trùng Tang, Tuất=Thiên Di, Hợi=Nhập Mộ
export type TrungTangKind = 'Trùng Tang' | 'Nhập Mộ' | 'Thiên Di';

const CHI_TO_KIND: Record<Chi, TrungTangKind> = {
  Tý: 'Trùng Tang',
  Sửu: 'Thiên Di',
  Dần: 'Nhập Mộ',
  Mão: 'Trùng Tang',
  Thìn: 'Thiên Di',
  Tỵ: 'Nhập Mộ',
  Ngọ: 'Trùng Tang',
  Mùi: 'Thiên Di',
  Thân: 'Nhập Mộ',
  Dậu: 'Trùng Tang',
  Tuất: 'Thiên Di',
  Hợi: 'Nhập Mộ',
};

function chiIndex(c: Chi): number {
  return CHI.indexOf(c);
}

export interface TrungTangReport {
  ageAtDeath: number;
  dayLunar: string;
  dayChi: Chi;
  monthCung: TrungTangKind;
  dayCung: TrungTangKind;
  yearCung: TrungTangKind;
  overall: TrungTangKind | 'Cần cẩn trọng';
  suggestion: string;
}

/**
 * Bảng trùng tang / nhập mộ / thiên di.
 * Đầu vào là năm sinh + ngày giờ mất (dương lịch) + giới tính.
 */
export function checkTrungTang(input: {
  birthYear: number;
  deathDay: number;
  deathMonth: number;
  deathYear: number;
  gender: 'nam' | 'nu';
}): TrungTangReport {
  const age = tuoiMu(input.birthYear, input.deathYear);
  const lunar = solarToLunar(input.deathDay, input.deathMonth, input.deathYear);
  const dChi = dayCanChi(lunar.jd).chi;
  const yChi = yearCanChi(lunar.year).chi;
  const mChi = CHI[(lunar.month + 1) % 12] as Chi;

  const startChi: Chi = input.gender === 'nam' ? 'Dần' : 'Thân';
  const startIdx = chiIndex(startChi);
  const cungMonthIdx = (startIdx + (age - 1)) % 12;
  const cungMonthChi = CHI[cungMonthIdx] as Chi;

  const kindsCount: Record<TrungTangKind, number> = {
    'Trùng Tang': 0,
    'Nhập Mộ': 0,
    'Thiên Di': 0,
  };
  const monthKind = CHI_TO_KIND[cungMonthChi];
  const dayKind = CHI_TO_KIND[dChi];
  const yearKind = CHI_TO_KIND[yChi];
  kindsCount[monthKind]++;
  kindsCount[dayKind]++;
  kindsCount[yearKind]++;

  let overall: TrungTangReport['overall'];
  if (kindsCount['Nhập Mộ'] >= 1) {
    overall = 'Nhập Mộ';
  } else if (kindsCount['Trùng Tang'] >= 2) {
    overall = 'Trùng Tang';
  } else if (kindsCount['Trùng Tang'] === 1) {
    overall = 'Cần cẩn trọng';
  } else {
    overall = 'Thiên Di';
  }

  const suggestion =
    overall === 'Nhập Mộ'
      ? 'Có Nhập Mộ hóa giải, gia đình yên ổn. Có thể tiến hành mai táng theo lễ nghi.'
      : overall === 'Trùng Tang'
        ? 'Cảnh báo Trùng Tang. Nên nhờ chùa làm lễ trấn Trùng Tang, dùng bùa, mời sư đọc kinh Đại Bi 49 ngày.'
        : overall === 'Thiên Di'
          ? 'Có Thiên Di — gia đạo có thể phải di chuyển, thay đổi. Nên làm lễ cầu siêu.'
          : 'Cần cẩn trọng — nên tham vấn sư trụ trì trước khi định ngày.';

  return {
    ageAtDeath: age,
    dayLunar: `${lunar.day}/${lunar.month}/${lunar.year} ÂL`,
    dayChi: dChi,
    monthCung: monthKind,
    dayCung: dayKind,
    yearCung: yearKind,
    overall,
    suggestion,
  };
}

// ----- Tuổi hợp cưới hỏi -----
const TAM_HOP_GROUPS: Chi[][] = [
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

export function checkTuoiCuoi(
  brideYear: number,
  groomYear: number,
): RuleResult {
  const b = yearCanChi(brideYear).chi;
  const g = yearCanChi(groomYear).chi;

  if (isXungChi(b, g)) {
    return {
      key: 'tuoi_cuoi',
      label: 'Tuổi cô dâu chú rể',
      verdict: 'bad',
      detail: `Chi ${b} (cô dâu) xung với chi ${g} (chú rể) — Lục xung. Nên tham vấn kỹ trước khi định ngày cưới.`,
    };
  }
  const tamHop = TAM_HOP_GROUPS.some(
    (grp) => grp.includes(b) && grp.includes(g),
  );
  const lucHop = LUC_HOP.some(
    ([x, y]) => (x === b && y === g) || (x === g && y === b),
  );
  if (tamHop) {
    return {
      key: 'tuoi_cuoi',
      label: 'Tuổi cô dâu chú rể',
      verdict: 'good',
      detail: `Chi ${b} và ${g} thuộc Tam hợp — rất hợp cưới hỏi.`,
    };
  }
  if (lucHop) {
    return {
      key: 'tuoi_cuoi',
      label: 'Tuổi cô dâu chú rể',
      verdict: 'good',
      detail: `Chi ${b} và ${g} thuộc Lục hợp — hợp cưới hỏi.`,
    };
  }
  return {
    key: 'tuoi_cuoi',
    label: 'Tuổi cô dâu chú rể',
    verdict: 'caution',
    detail: `Chi ${b} và ${g} bình thường — không xung, chưa được Tam/Lục hợp.`,
  };
}

// ----- Nữ sinh con năm nào tốt -----
export function goodYearsForChild(
  motherYear: number,
  fromYear: number,
  count: number = 5,
): Array<{ year: number; verdict: Verdict; note: string }> {
  const results: Array<{ year: number; verdict: Verdict; note: string }> = [];
  for (let i = 0; i < count; i++) {
    const y = fromYear + i;
    const kimLau = checkKimLau(motherYear, y);
    const tamTai = checkTamTai(motherYear, y);
    const xung = checkXungNam(motherYear, y);
    let verdict: Verdict = 'good';
    if (kimLau.verdict === 'bad') verdict = 'bad';
    else if (tamTai.verdict === 'caution' || xung.verdict === 'caution')
      verdict = 'caution';
    results.push({
      year: y,
      verdict,
      note:
        verdict === 'good'
          ? 'Năm thuận sinh con'
          : verdict === 'caution'
            ? 'Cần cẩn trọng, nên tham vấn sư/thầy'
            : 'Không thuận — nên tránh',
    });
  }
  return results;
}

// ----- Verdict tổng hợp -----
export function combineVerdicts(rs: RuleResult[]): Verdict {
  if (rs.some((r) => r.verdict === 'bad')) return 'bad';
  if (rs.some((r) => r.verdict === 'caution')) return 'caution';
  return 'good';
}
