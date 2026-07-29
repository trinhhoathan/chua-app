/**
 * Bói SIM · số điện thoại — trọng tâm Bát Cực Linh Số (Du Niên 8 sao).
 * Bảng cặp số tham khảo phổ biến trong phong thủy số VN (Bát Trạch Du Niên).
 * Bổ sung: 81 Số Lý (4 số cuối), Âm Dương, Tổng nút, đuôi sim, cách cục.
 */

import { getBieuLy, normalizeBieuLy } from '@/lib/fengshui/tinh-danh';

export type StarId =
  | 'sinh_khi'
  | 'thien_y'
  | 'dien_nien'
  | 'phuc_vi'
  | 'luc_sat'
  | 'ngu_quy'
  | 'hoa_hai'
  | 'tuyet_menh';

export type StarKind = 'cat' | 'hung';

export interface StarInfo {
  id: StarId;
  nameVi: string;
  nameHan: string;
  kind: StarKind;
  rank: 'dai_cat' | 'cat' | 'hung' | 'dai_hung';
  score: number; // đóng góp 0–100 khi là 1 cặp
  summary: string;
}

export interface PairAnalysis {
  a: number;
  b: number;
  label: string;
  star: StarInfo;
  isTail: boolean;
}

export type Element = 'kim' | 'moc' | 'thuy' | 'hoa' | 'tho';

export interface BoiSimResult {
  digits: number[];
  display: string;
  pairs: PairAnalysis[];
  starCounts: Record<StarId, number>;
  catPairs: number;
  hungPairs: number;
  duNienScore: number;
  soLy81: number;
  soLyMeta: ReturnType<typeof getBieuLy>;
  soLyElement: Element;
  amCount: number;
  duongCount: number;
  amDuongScore: number;
  tongNut: number;
  tail2: string;
  tailFolk: string;
  patterns: string[];
  patternScore: number;
  overallScore: number;
  verdict: 'tot' | 'kha' | 'trung_binh' | 'yeu';
  advice: string;
  birthYear?: number;
  napAm?: { name: string; element: Element };
  elementRelation?: {
    sim: Element;
    menh: Element;
    relation: string;
    score: number;
  };
}

export const STARS: Record<StarId, StarInfo> = {
  sinh_khi: {
    id: 'sinh_khi',
    nameVi: 'Sinh Khí',
    nameHan: '生氣',
    kind: 'cat',
    rank: 'dai_cat',
    score: 100,
    summary: 'Đại cát — chiêu tài, vượng khí, sức sống dồi dào.',
  },
  thien_y: {
    id: 'thien_y',
    nameVi: 'Thiên Y',
    nameHan: '天醫',
    kind: 'cat',
    rank: 'dai_cat',
    score: 90,
    summary: 'Đại cát — bảo hộ sức khỏe, quý nhân, tài lộc ổn.',
  },
  dien_nien: {
    id: 'dien_nien',
    nameVi: 'Diên Niên',
    nameHan: '延年',
    kind: 'cat',
    rank: 'cat',
    score: 80,
    summary: 'Cát — nhân hòa, tình duyên, kéo dài phúc thọ quan hệ.',
  },
  phuc_vi: {
    id: 'phuc_vi',
    nameVi: 'Phục Vị',
    nameHan: '伏位',
    kind: 'cat',
    rank: 'cat',
    score: 70,
    summary: 'Cát — an định, nội tâm ổn, giữ thành quả.',
  },
  hoa_hai: {
    id: 'hoa_hai',
    nameVi: 'Họa Hại',
    nameHan: '禍害',
    kind: 'hung',
    rank: 'hung',
    score: 35,
    summary: 'Hung — thị phi, mất lộc nhẹ, dễ rủi ro nhỏ.',
  },
  luc_sat: {
    id: 'luc_sat',
    nameVi: 'Lục Sát',
    nameHan: '六煞',
    kind: 'hung',
    rank: 'hung',
    score: 25,
    summary: 'Hung — thị phi, quan hệ bất ổn, việc bất ngờ.',
  },
  ngu_quy: {
    id: 'ngu_quy',
    nameVi: 'Ngũ Quỷ',
    nameHan: '五鬼',
    kind: 'hung',
    rank: 'hung',
    score: 15,
    summary: 'Hung — kiện tụng, hao tán, tâm bất an.',
  },
  tuyet_menh: {
    id: 'tuyet_menh',
    nameVi: 'Tuyệt Mệnh',
    nameHan: '絕命',
    kind: 'hung',
    rank: 'dai_hung',
    score: 5,
    summary: 'Đại hung — suy khí mạnh; nên tránh ở đuôi sim.',
  },
};

/** Bảng Du Niên phổ biến (đối xứng ab = ba) */
const PAIR_STAR: Record<string, StarId> = {
  // Phục Vị
  '00': 'phuc_vi',
  '11': 'phuc_vi',
  '22': 'phuc_vi',
  '33': 'phuc_vi',
  '44': 'phuc_vi',
  '55': 'phuc_vi',
  '66': 'phuc_vi',
  '77': 'phuc_vi',
  '88': 'phuc_vi',
  '99': 'phuc_vi',
  // Sinh Khí
  '28': 'sinh_khi',
  '82': 'sinh_khi',
  '14': 'sinh_khi',
  '41': 'sinh_khi',
  '39': 'sinh_khi',
  '93': 'sinh_khi',
  '67': 'sinh_khi',
  '76': 'sinh_khi',
  // Thiên Y
  '27': 'thien_y',
  '72': 'thien_y',
  '68': 'thien_y',
  '86': 'thien_y',
  '49': 'thien_y',
  '94': 'thien_y',
  '13': 'thien_y',
  '31': 'thien_y',
  // Diên Niên
  '19': 'dien_nien',
  '91': 'dien_nien',
  '34': 'dien_nien',
  '43': 'dien_nien',
  '26': 'dien_nien',
  '62': 'dien_nien',
  '78': 'dien_nien',
  '87': 'dien_nien',
  // Lục Sát
  '36': 'luc_sat',
  '63': 'luc_sat',
  '79': 'luc_sat',
  '97': 'luc_sat',
  '24': 'luc_sat',
  '42': 'luc_sat',
  '18': 'luc_sat',
  '81': 'luc_sat',
  // Họa Hại
  '89': 'hoa_hai',
  '98': 'hoa_hai',
  '23': 'hoa_hai',
  '32': 'hoa_hai',
  '17': 'hoa_hai',
  '71': 'hoa_hai',
  '46': 'hoa_hai',
  '64': 'hoa_hai',
  // Tuyệt Mệnh
  '69': 'tuyet_menh',
  '96': 'tuyet_menh',
  '12': 'tuyet_menh',
  '21': 'tuyet_menh',
  '37': 'tuyet_menh',
  '73': 'tuyet_menh',
  '48': 'tuyet_menh',
  '84': 'tuyet_menh',
};

const DIGIT_ELEMENT: Record<number, Element> = {
  0: 'thuy',
  1: 'thuy',
  2: 'tho',
  3: 'moc',
  4: 'moc',
  5: 'tho',
  6: 'kim',
  7: 'kim',
  8: 'tho',
  9: 'hoa',
};

const ELEMENT_LABEL: Record<Element, string> = {
  kim: 'Kim',
  moc: 'Mộc',
  thuy: 'Thủy',
  hoa: 'Hỏa',
  tho: 'Thổ',
};

/** Nạp Âm theo (year-4)%60 — mỗi 2 năm một mệnh */
const NAP_AM: { name: string; element: Element }[] = [
  { name: 'Hải Trung Kim', element: 'kim' },
  { name: 'Lư Trung Hỏa', element: 'hoa' },
  { name: 'Đại Lâm Mộc', element: 'moc' },
  { name: 'Lộ Bàng Thổ', element: 'tho' },
  { name: 'Kiếm Phong Kim', element: 'kim' },
  { name: 'Sơn Đầu Hỏa', element: 'hoa' },
  { name: 'Giản Hạ Thủy', element: 'thuy' },
  { name: 'Thành Đầu Thổ', element: 'tho' },
  { name: 'Bạch Lạp Kim', element: 'kim' },
  { name: 'Dương Liễu Mộc', element: 'moc' },
  { name: 'Tuyền Trung Thủy', element: 'thuy' },
  { name: 'Ốc Thượng Thổ', element: 'tho' },
  { name: 'Lôi Hỏa Hỏa', element: 'hoa' },
  { name: 'Tùng Bách Mộc', element: 'moc' },
  { name: 'Trường Lưu Thủy', element: 'thuy' },
  { name: 'Sa Trung Kim', element: 'kim' },
  { name: 'Sơn Hạ Hỏa', element: 'hoa' },
  { name: 'Bình Địa Mộc', element: 'moc' },
  { name: 'Bích Thượng Thổ', element: 'tho' },
  { name: 'Kim Bạc Kim', element: 'kim' },
  { name: 'Phú Đăng Hỏa', element: 'hoa' },
  { name: 'Thiên Hà Thủy', element: 'thuy' },
  { name: 'Đại Trạch Thổ', element: 'tho' },
  { name: 'Thoa Xuyến Kim', element: 'kim' },
  { name: 'Tang Đố Mộc', element: 'moc' },
  { name: 'Đại Khê Thủy', element: 'thuy' },
  { name: 'Sa Trung Thổ', element: 'tho' },
  { name: 'Thiên Thượng Hỏa', element: 'hoa' },
  { name: 'Thạch Lựu Mộc', element: 'moc' },
  { name: 'Đại Hải Thủy', element: 'thuy' },
];

const TAIL_FOLK: Record<string, string> = {
  '39': 'Thăng tiến · mở mang',
  '93': 'Vượng khí · Sinh Khí',
  '68': 'Lộc phát · Thiên Y',
  '86': 'Phát lộc bền',
  '79': 'Phát tài (dân gian) — cần xem cả cặp hung/cát',
  '97': 'Tài lộc biến động',
  '38': 'Tài–lộc dân gian',
  '28': 'Sinh Khí — tốt',
  '88': 'Phát phát · Phục Vị',
  '66': 'Lộc lộc · Phục Vị',
  '78': 'Diên Niên — quan hệ',
  '56': 'Sinh lộc (dân gian)',
  '00': 'Tròn đầy / trung tính',
  '24': 'Lục Sát — thận trọng',
  '42': 'Lục Sát — thận trọng',
  '69': 'Tuyệt Mệnh — nên tránh đuôi',
  '96': 'Tuyệt Mệnh — nên tránh đuôi',
};

function pairKey(a: number, b: number): string {
  return `${a}${b}`;
}

export function lookupStar(a: number, b: number): StarInfo {
  const key = pairKey(a, b);
  if (PAIR_STAR[key]) return STARS[PAIR_STAR[key]];

  // 0 hoặc 5 lệch cặp: coi trung tính Phục Vị (trung cung / khí trung hòa)
  if (a === 0 || b === 0 || a === 5 || b === 5) {
    return STARS.phuc_vi;
  }
  return STARS.phuc_vi;
}

export function parsePhoneDigits(raw: string): number[] | null {
  const digits = raw.replace(/\D/g, '');
  // VN: 9–11 số (bỏ 84 đầu nếu có)
  let d = digits;
  if (d.startsWith('84') && d.length >= 11) d = '0' + d.slice(2);
  if (d.length < 9 || d.length > 11) return null;
  return d.split('').map((c) => Number(c));
}

export function formatPhone(digits: number[]): string {
  const s = digits.join('');
  if (s.length === 10) return `${s.slice(0, 4)} ${s.slice(4, 7)} ${s.slice(7)}`;
  if (s.length === 11) return `${s.slice(0, 4)} ${s.slice(4, 7)} ${s.slice(7)}`;
  return s.replace(/(\d{3,4})(?=\d)/g, '$1 ').trim();
}

export function getNapAm(year: number): { name: string; element: Element } {
  const idx = Math.floor((((year - 4) % 60) + 60) % 60 / 2);
  return NAP_AM[idx] ?? NAP_AM[0];
}

function soLyElement(n: number): Element {
  const d = n % 10;
  if (d === 1 || d === 2) return 'moc';
  if (d === 3 || d === 4) return 'hoa';
  if (d === 5 || d === 6) return 'tho';
  if (d === 7 || d === 8) return 'kim';
  return 'thuy';
}

function elementRelation(
  sim: Element,
  menh: Element,
): { relation: string; score: number } {
  const sinh: Record<Element, Element> = {
    moc: 'hoa',
    hoa: 'tho',
    tho: 'kim',
    kim: 'thuy',
    thuy: 'moc',
  };
  if (sim === menh) return { relation: 'Đồng hành — hòa', score: 80 };
  if (sinh[sim] === menh) return { relation: 'Sim sinh Mệnh — rất tốt', score: 95 };
  if (sinh[menh] === sim) return { relation: 'Mệnh sinh Sim — chấp nhận', score: 65 };
  if (sinh[sinh[sim]] === menh || sinh[sim] === sinh[menh]) {
    /* not used */
  }
  // khắc: A khắc B nếu sinh[sinh[A]]===B? Kim khắc Mộc: kim→thuy→moc so kim sinh thuy, thuy sinh moc - khắc is opposite
  const khac: Record<Element, Element> = {
    moc: 'tho',
    tho: 'thuy',
    thuy: 'hoa',
    hoa: 'kim',
    kim: 'moc',
  };
  if (khac[sim] === menh) return { relation: 'Sim khắc Mệnh — bất lợi', score: 30 };
  if (khac[menh] === sim) return { relation: 'Mệnh khắc Sim — tiêu hao', score: 45 };
  return { relation: 'Trung tính', score: 55 };
}

function detectPatterns(digits: number[]): { patterns: string[]; score: number } {
  const s = digits.join('');
  const patterns: string[] = [];
  let bonus = 50;

  // Tứ quý
  if (/(\d)\1{3}/.test(s)) {
    patterns.push('Tứ quý (4 số giống liên tiếp)');
    bonus += 15;
  }
  // Tam hoa
  if (/(\d)\1{2}/.test(s)) {
    patterns.push('Tam hoa (3 số giống)');
    bonus += 8;
  }
  // Lặp đôi
  if (/(\d{2})\1/.test(s)) {
    patterns.push('Lặp cặp (ABAB…)');
    bonus += 10;
  }
  // Tiến số
  for (let i = 0; i < digits.length - 2; i++) {
    if (
      digits[i + 1] === (digits[i] + 1) % 10 &&
      digits[i + 2] === (digits[i] + 2) % 10
    ) {
      patterns.push('Tiến số (chuỗi tăng)');
      bonus += 8;
      break;
    }
  }
  // Gánh (A x A)
  for (let i = 0; i < digits.length - 2; i++) {
    if (digits[i] === digits[i + 2] && digits[i] !== digits[i + 1]) {
      patterns.push('Số gánh (A·x·A)');
      bonus += 6;
      break;
    }
  }

  if (patterns.length === 0) patterns.push('Không dạng đặc biệt nổi bật');
  return { patterns, score: Math.min(100, bonus) };
}

export function analyzeBoiSim(
  rawPhone: string,
  birthYear?: number,
): BoiSimResult | { error: string } {
  const digits = parsePhoneDigits(rawPhone);
  if (!digits) {
    return {
      error: 'Số điện thoại không hợp lệ. Nhập 9–11 chữ số (VD: 0912345678).',
    };
  }

  const pairs: PairAnalysis[] = [];
  for (let i = 0; i < digits.length - 1; i++) {
    const a = digits[i];
    const b = digits[i + 1];
    const star = lookupStar(a, b);
    pairs.push({
      a,
      b,
      label: `${a}${b}`,
      star,
      isTail: i >= digits.length - 3,
    });
  }

  const starCounts = Object.fromEntries(
    (Object.keys(STARS) as StarId[]).map((id) => [id, 0]),
  ) as Record<StarId, number>;
  for (const p of pairs) starCounts[p.star.id] += 1;

  const catPairs = pairs.filter((p) => p.star.kind === 'cat').length;
  const hungPairs = pairs.length - catPairs;

  // Du Niên: trung bình điểm cặp, đuôi nặng hơn
  let duSum = 0;
  let duWeight = 0;
  for (const p of pairs) {
    const w = p.isTail ? 1.6 : 1;
    duSum += p.star.score * w;
    duWeight += w;
  }
  const duNienScore = Math.round(duSum / duWeight);

  const last4 = Number(digits.slice(-4).join(''));
  const soLy81 = normalizeBieuLy(last4 % 80 === 0 ? 80 : last4 % 80);
  const soLyMeta = getBieuLy(soLy81);
  const soLyEl = soLyElement(soLy81);

  const amCount = digits.filter((d) => d % 2 === 0).length;
  const duongCount = digits.length - amCount;
  const balance = Math.abs(amCount - duongCount);
  const amDuongScore = Math.max(20, 100 - balance * 18);

  const tong = digits.reduce((a, b) => a + b, 0);
  const tongNut = tong % 10;

  const tail2 = digits.slice(-2).join('');
  const tailFolk = TAIL_FOLK[tail2] ?? 'Xem theo cặp Du Niên đuôi sim';

  const { patterns, score: patternScore } = detectPatterns(digits);

  let elementRelationResult: BoiSimResult['elementRelation'];
  let napAm: BoiSimResult['napAm'];
  let nguHanhScore = 70;

  if (birthYear && birthYear >= 1900 && birthYear <= 2100) {
    napAm = getNapAm(birthYear);
    const rel = elementRelation(soLyEl, napAm.element);
    nguHanhScore = rel.score;
    elementRelationResult = {
      sim: soLyEl,
      menh: napAm.element,
      relation: rel.relation,
      score: rel.score,
    };
  }

  // Trọng số: Du Niên 40%, 81 Số Lý 20%, Ngũ hành 15%, Âm Dương 10%, Pattern 10%, Nút 5%
  const soLyScore = soLyMeta.score * 10;
  const nutScore = tongNut === 1 || tongNut === 6 || tongNut === 8 ? 75 : 55;

  const overallScore = Math.round(
    duNienScore * 0.4 +
      soLyScore * 0.2 +
      nguHanhScore * 0.15 +
      amDuongScore * 0.1 +
      patternScore * 0.1 +
      nutScore * 0.05,
  );

  let verdict: BoiSimResult['verdict'] = 'trung_binh';
  if (overallScore >= 80) verdict = 'tot';
  else if (overallScore >= 65) verdict = 'kha';
  else if (overallScore >= 45) verdict = 'trung_binh';
  else verdict = 'yeu';

  const tailStars = pairs.filter((p) => p.isTail).map((p) => p.star);
  const tailHung = tailStars.filter((s) => s.kind === 'hung');

  let advice =
    'Số điện thoại là vật mang theo hằng ngày — dùng để tham khảo trường khí, không thay cho nỗ lực và phúc đức.';
  if (verdict === 'tot') {
    advice =
      'Du Niên nghiêng cát. Có thể giữ dùng; vẫn nên hợp đạo làm ăn và giữ tâm an.';
  } else if (verdict === 'kha') {
    advice =
      'Khá ổn. Ưu tiên giữ cặp đuôi cát; nếu đổi sim, chọn đuôi Sinh Khí / Thiên Y / Diên Niên.';
  } else if (verdict === 'yeu') {
    advice =
      'Hung khí khá nhiều' +
      (tailHung.length
        ? ` (đuôi có ${tailHung.map((s) => s.nameVi).join(', ')})`
        : '') +
      '. Có thể hóa giải bằng tâm thái, màu ốp theo hành sinh mệnh, hoặc đổi đuôi số khi thuận tiện — không cần hoảng.';
  }

  return {
    digits,
    display: formatPhone(digits),
    pairs,
    starCounts,
    catPairs,
    hungPairs,
    duNienScore,
    soLy81,
    soLyMeta,
    soLyElement: soLyEl,
    amCount,
    duongCount,
    amDuongScore,
    tongNut,
    tail2,
    tailFolk,
    patterns,
    patternScore,
    overallScore,
    verdict,
    advice,
    birthYear,
    napAm,
    elementRelation: elementRelationResult,
  };
}

export function elementLabel(e: Element): string {
  return ELEMENT_LABEL[e];
}

export const STAR_ORDER: StarId[] = [
  'sinh_khi',
  'thien_y',
  'dien_nien',
  'phuc_vi',
  'hoa_hai',
  'luc_sat',
  'ngu_quy',
  'tuyet_menh',
];
