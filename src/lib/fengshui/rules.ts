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

// ----- Trùng tang / Nhập mộ / Thiên di — phương pháp 4 bàn đầy đủ -----
// Khởi cung: nam từ Dần đếm THUẬN, nữ từ Thân đếm NGHỊCH.
// Bàn tuổi: 10 tuổi tại cung khởi, mỗi cung tiếp 10 tuổi; hết chục đếm lẻ
// mỗi cung 1 tuổi đến tuổi mụ. Bàn tháng: tháng 1 tại cung KẾ cung tuổi,
// đếm tiếp đến tháng mất (âm). Bàn ngày: ngày 1 tại cung kế cung tháng.
// Bàn giờ: giờ Tý tại cung kế cung ngày.
// Cung rơi: Dần–Thân–Tỵ–Hợi = Trùng Tang; Tý–Ngọ–Mão–Dậu = Thiên Di;
// Thìn–Tuất–Sửu–Mùi = Nhập Mộ. Một Nhập Mộ hóa giải được Trùng Tang
// ("nhất mộ sát tam trùng").
export type TrungTangKind = 'Trùng Tang' | 'Nhập Mộ' | 'Thiên Di';

const CHI_TO_KIND: Record<Chi, TrungTangKind> = {
  Dần: 'Trùng Tang',
  Thân: 'Trùng Tang',
  Tỵ: 'Trùng Tang',
  Hợi: 'Trùng Tang',
  Tý: 'Thiên Di',
  Ngọ: 'Thiên Di',
  Mão: 'Thiên Di',
  Dậu: 'Thiên Di',
  Thìn: 'Nhập Mộ',
  Tuất: 'Nhập Mộ',
  Sửu: 'Nhập Mộ',
  Mùi: 'Nhập Mộ',
};

function chiIndex(c: Chi): number {
  return CHI.indexOf(c);
}

function chiAt(idx: number): Chi {
  return CHI[((idx % 12) + 12) % 12];
}

export interface TrungTangBan {
  key: 'tuoi' | 'thang' | 'ngay' | 'gio';
  label: string;
  /** VD "65 tuổi", "tháng 3 âm", "ngày 14 âm", "giờ Dần" */
  value: string;
  cungChi: Chi;
  kind: TrungTangKind;
}

export interface TrungTangReport {
  gender: 'nam' | 'nu';
  /** Tuổi mụ tính theo năm ÂM LỊCH mất */
  ageAtDeath: number;
  dayLunar: string;
  deathDayCanChi: string;
  bans: TrungTangBan[];
  counts: Record<TrungTangKind, number>;
  overall: 'Trùng Tang' | 'Nhập Mộ' | 'Thiên Di';
  overallLabel: string;
  suggestion: string;
  hourProvided: boolean;
}

/**
 * Bảng trùng tang / nhập mộ / thiên di (4 bàn: tuổi → tháng → ngày → giờ).
 * Đầu vào: năm sinh (âm lịch) + ngày mất dương lịch + giờ mất (0–23, tùy chọn).
 */
export function checkTrungTang(input: {
  birthYear: number;
  deathDay: number;
  deathMonth: number;
  deathYear: number;
  deathHour?: number | null;
  gender: 'nam' | 'nu';
}): TrungTangReport {
  const lunar = solarToLunar(input.deathDay, input.deathMonth, input.deathYear);
  const age = tuoiMu(input.birthYear, lunar.year);
  const dcc = dayCanChi(lunar.jd);

  const dir = input.gender === 'nam' ? 1 : -1;
  const startIdx = chiIndex(input.gender === 'nam' ? 'Dần' : 'Thân');

  // Bàn tuổi
  const decades = Math.floor(age / 10);
  const rem = age % 10;
  let agePos: number;
  if (decades > 0) {
    agePos = startIdx + dir * (decades - 1);
    if (rem > 0) agePos += dir * rem;
  } else {
    agePos = startIdx + dir * (Math.max(rem, 1) - 1);
  }

  // Bàn tháng: tháng 1 tại cung kế tiếp cung tuổi
  const monthPos = agePos + dir * lunar.month;
  // Bàn ngày: ngày 1 tại cung kế tiếp cung tháng
  const dayPos = monthPos + dir * lunar.day;
  // Bàn giờ: giờ Tý tại cung kế tiếp cung ngày
  const hourProvided =
    input.deathHour !== undefined && input.deathHour !== null;
  const hourIdx = hourProvided
    ? Math.floor((((input.deathHour as number) % 24) + 1) / 2) % 12
    : 0;
  const hourPos = dayPos + dir * (hourIdx + 1);

  const bans: TrungTangBan[] = [
    {
      key: 'tuoi',
      label: 'Bàn tuổi (năm)',
      value: `${age} tuổi mụ`,
      cungChi: chiAt(agePos),
      kind: CHI_TO_KIND[chiAt(agePos)],
    },
    {
      key: 'thang',
      label: 'Bàn tháng',
      value: `tháng ${lunar.month} âm`,
      cungChi: chiAt(monthPos),
      kind: CHI_TO_KIND[chiAt(monthPos)],
    },
    {
      key: 'ngay',
      label: 'Bàn ngày',
      value: `ngày ${lunar.day} âm`,
      cungChi: chiAt(dayPos),
      kind: CHI_TO_KIND[chiAt(dayPos)],
    },
  ];
  if (hourProvided) {
    bans.push({
      key: 'gio',
      label: 'Bàn giờ',
      value: `giờ ${CHI[hourIdx]}`,
      cungChi: chiAt(hourPos),
      kind: CHI_TO_KIND[chiAt(hourPos)],
    });
  }

  const counts: Record<TrungTangKind, number> = {
    'Trùng Tang': 0,
    'Nhập Mộ': 0,
    'Thiên Di': 0,
  };
  for (const b of bans) counts[b.kind]++;

  let overall: TrungTangReport['overall'];
  let overallLabel: string;
  let suggestion: string;

  if (counts['Trùng Tang'] === 0) {
    if (counts['Nhập Mộ'] > 0) {
      overall = 'Nhập Mộ';
      overallLabel = 'Nhập Mộ — yên ổn';
      suggestion =
        'Không bàn nào rơi Trùng Tang, có cung Nhập Mộ — người mất được "yên mồ yên mả". Có thể tiến hành tang lễ theo nghi thức bình thường.';
    } else {
      overall = 'Thiên Di';
      overallLabel = 'Thiên Di — bình hòa';
      suggestion =
        'Các bàn rơi cung Thiên Di — dân gian hiểu là sự ra đi do "trời định", con cháu có thể có thay đổi, di chuyển. Nên làm lễ cầu siêu chu đáo, không phạm Trùng Tang.';
    }
  } else if (counts['Nhập Mộ'] >= 1) {
    overall = 'Nhập Mộ';
    overallLabel = 'Có Trùng Tang nhưng được Nhập Mộ hóa giải';
    const ttBans = bans.filter((b) => b.kind === 'Trùng Tang');
    suggestion = `Phạm Trùng Tang ở ${ttBans.map((b) => b.label.toLowerCase()).join(', ')} nhưng có ${counts['Nhập Mộ']} cung Nhập Mộ — theo lệ "nhất mộ sát tam trùng", một Nhập Mộ hóa giải được Trùng Tang. Gia đình vẫn nên làm lễ cầu siêu chu đáo cho an tâm.`;
  } else {
    overall = 'Trùng Tang';
    const ttBans = bans.filter((b) => b.kind === 'Trùng Tang');
    overallLabel = `Phạm Trùng Tang (${ttBans.map((b) => b.label.toLowerCase()).join(', ')})`;
    const heavy =
      ttBans.some((b) => b.key === 'gio') || ttBans.some((b) => b.key === 'ngay')
        ? ' Trùng tang ở bàn giờ / bàn ngày theo quan niệm dân gian là nặng hơn bàn tháng, bàn năm.'
        : '';
    suggestion = `Phạm Trùng Tang, không có Nhập Mộ hóa giải.${heavy} Nên nhờ chùa làm lễ trấn Trùng Tang, tụng kinh cầu siêu 49 ngày, và tham vấn trụ trì trước khi định ngày an táng.`;
  }

  if (!hourProvided) {
    suggestion +=
      ' (Chưa nhập giờ mất — nếu biết giờ, nhập thêm để tính đủ bàn giờ, kết luận chính xác hơn.)';
  }

  return {
    gender: input.gender,
    ageAtDeath: age,
    dayLunar: `${lunar.day}/${lunar.month}${lunar.leap ? ' nhuận' : ''}/${lunar.year} ÂL`,
    deathDayCanChi: `${dcc.can} ${dcc.chi}`,
    bans,
    counts,
    overall,
    overallLabel,
    suggestion,
    hourProvided,
  };
}

// ----- Verdict tổng hợp -----
export function combineVerdicts(rs: RuleResult[]): Verdict {
  if (rs.some((r) => r.verdict === 'bad')) return 'bad';
  if (rs.some((r) => r.verdict === 'caution')) return 'caution';
  return 'good';
}
