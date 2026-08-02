/**
 * Sao chiếu mệnh (Cửu Diệu) · Thái Tuế theo năm —
 * bảng dân gian dùng cho lễ dâng sao giải hạn tại chùa.
 */

import { formatCanChi, tuoiMu, yearCanChi, type Chi } from './lunar';
import { getAlmanacDay } from './lunar-almanac';
import {
  checkTamTai,
  type Verdict,
} from './rules';

export type StarTone = 'cat' | 'trung' | 'hung';

export interface CuuDieuStar {
  name: string;
  tone: StarTone;
  element: string;
  summary: string;
  advice: string;
  /** Gợi ý lễ / hướng tham khảo dân gian */
  ritualHint: string;
}

/** Thứ tự nam: dư 1 → 9 */
const MALE_ORDER = [
  'La Hầu',
  'Thổ Tú',
  'Thủy Diệu',
  'Thái Bạch',
  'Thái Dương',
  'Vân Hớn',
  'Kế Đô',
  'Thái Âm',
  'Mộc Đức',
] as const;

/** Thứ tự nữ: dư 1 → 9 */
const FEMALE_ORDER = [
  'Kế Đô',
  'Vân Hớn',
  'Mộc Đức',
  'Thái Âm',
  'Thổ Tú',
  'La Hầu',
  'Thái Dương',
  'Thái Bạch',
  'Thủy Diệu',
] as const;

const STAR_INFO: Record<string, Omit<CuuDieuStar, 'name'>> = {
  'La Hầu': {
    tone: 'hung',
    element: 'Hỏa (thần)',
    summary:
      'Hung tinh — dễ khẩu thiệt, thị phi, bệnh về mắt / máu huyết; nam càng nên thận trọng.',
    advice:
      'Giữ lời nói, tránh kiện tụng và đại sự đầu năm. Nên dâng sao giải hạn tại chùa.',
    ritualHint: 'Thường cúng hướng Tây / Tây Bắc — theo hướng dẫn trụ trì.',
  },
  'Thổ Tú': {
    tone: 'hung',
    element: 'Thổ',
    summary:
      'Ách tinh — tiểu nhân, xuất hành kém lợi, gia đạo dễ xáo động.',
    advice:
      'Hạn chế đi xa lớn, cẩn thận tranh chấp. Nên làm lễ dâng sao / cầu an.',
    ritualHint: 'Thường gắn hướng Tây Nam — hỏi trụ trì khoa lễ.',
  },
  'Thủy Diệu': {
    tone: 'trung',
    element: 'Thủy',
    summary:
      'Trung tinh — tài lộc có thể tới nhưng kỵ thủy nạn, tình cảm dễ xao động.',
    advice: 'Cẩn thận sông nước, giữ chừng mực chi tiêu và giao tiếp.',
    ritualHint: 'Có thể cầu an nhẹ; việc lớn vẫn nên hỏi trụ trì.',
  },
  'Thái Bạch': {
    tone: 'hung',
    element: 'Kim',
    summary:
      'Hung tinh — hao tài, dễ đụng chạm kim khí / phẫu thuật, thị phi tiền bạc.',
    advice: 'Tránh đầu tư mạo hiểm, cẩn thận dao kéo. Nên dâng sao giải hạn.',
    ritualHint: 'Thường cúng hướng Tây — theo lịch nhà chùa.',
  },
  'Thái Dương': {
    tone: 'cat',
    element: 'Hỏa',
    summary: 'Cát tinh — sáng sủa, quý nhân, thuận danh lợi và công việc.',
    advice: 'Năm thuận để khởi sự lành; vẫn giữ tâm thành và bố thí.',
    ritualHint: 'Có thể tạ ơn / cầu an; không bắt buộc giải hạn nặng.',
  },
  'Vân Hớn': {
    tone: 'trung',
    element: 'Hỏa',
    summary: 'Trung tinh — dễ khẩu thiệt, cần giữ lời; công việc bình thường.',
    advice: 'Ít nói thị phi, tránh nóng giận. Cầu an nếu tâm bất an.',
    ritualHint: 'Tham dự lễ cầu an định kỳ tại chùa nếu tiện.',
  },
  'Kế Đô': {
    tone: 'hung',
    element: 'Hỏa (thần)',
    summary:
      'Hung tinh — trở ngại, bệnh tật hoặc chuyện bất ngờ; nữ cũng cần thận trọng.',
    advice: 'Trì hoãn đại sự nếu có thể. Nên dâng sao / cầu an giải hạn.',
    ritualHint: 'Thường cúng hướng Tây Bắc — theo trụ trì.',
  },
  'Thái Âm': {
    tone: 'cat',
    element: 'Thủy',
    summary: 'Cát tinh — êm ấm, duyên lành, nội trợ và tình cảm thuận.',
    advice: 'Năm tốt cho việc nhà, tu học, kết duyên lành.',
    ritualHint: 'Có thể cúng tạ / niệm Phật hồi hướng.',
  },
  'Mộc Đức': {
    tone: 'cat',
    element: 'Mộc',
    summary: 'Cát tinh — an khang, quý nhân phù trợ, dễ gặp việc lành.',
    advice: 'Nên làm phúc, bố thí, khởi sự từ thiện hoặc tu học.',
    ritualHint: 'Năm thuận — có thể phát tâm cúng dường tại chùa.',
  },
};

/**
 * Năm dạng phạm Thái Tuế: trị (đồng chi), xung (lục xung),
 * hình (tương hình / tự hình), hại (lục hại), phá (lục phá).
 */
export type TaiSuiKind = 'tri' | 'xung' | 'hinh' | 'hai' | 'pha' | 'binh';

export interface TaiSuiStatus {
  /** Dạng phạm nặng nhất (trị > xung > hình > hại > phá) */
  kind: TaiSuiKind;
  /** Tất cả dạng phạm trong năm (có thể trùng nhau, vd vừa hình vừa hại) */
  kinds: TaiSuiKind[];
  verdict: Verdict;
  label: string;
  detail: string;
  yearCanChi: string;
  birthCanChi: string;
  /** Phương vị Thái Tuế của năm — kiêng động thổ, đào bới hướng này */
  position: string | null;
}

export interface SaoChieuMenhResult {
  birthYear: number;
  viewYear: number;
  gender: 'nam' | 'nu';
  ageMu: number;
  remainder: number;
  birthCanChi: string;
  yearCanChi: string;
  star: CuuDieuStar;
  starVerdict: Verdict;
  taiSui: TaiSuiStatus;
  tamTai: { verdict: Verdict; detail: string };
  overall: Verdict;
  overallLabel: string;
  overallDetail: string;
  /** Sao các năm kế tiếp */
  upcoming: Array<{
    year: number;
    ageMu: number;
    starName: string;
    tone: StarTone;
    verdict: Verdict;
  }>;
}

function remainderOfAge(ageMu: number): number {
  const r = ageMu % 9;
  return r === 0 ? 9 : r;
}

function starNameFor(
  ageMu: number,
  gender: 'nam' | 'nu',
): string {
  const rem = remainderOfAge(ageMu);
  const order = gender === 'nam' ? MALE_ORDER : FEMALE_ORDER;
  return order[rem - 1];
}

function toneToVerdict(tone: StarTone): Verdict {
  if (tone === 'cat') return 'good';
  if (tone === 'hung') return 'bad';
  return 'caution';
}

function getStar(name: string): CuuDieuStar {
  const info = STAR_INFO[name];
  return { name, ...info };
}

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
const TU_HINH: Chi[] = ['Thìn', 'Ngọ', 'Dậu', 'Hợi'];
const LUC_PHA: Array<[Chi, Chi]> = [
  ['Tý', 'Dậu'],
  ['Mão', 'Ngọ'],
  ['Tỵ', 'Thân'],
  ['Dần', 'Hợi'],
  ['Thìn', 'Sửu'],
  ['Tuất', 'Mùi'],
];

function inPairs(pairs: Array<[Chi, Chi]>, a: Chi, b: Chi): boolean {
  return pairs.some(([x, y]) => (x === a && y === b) || (x === b && y === a));
}

const TAI_SUI_KIND_INFO: Record<
  Exclude<TaiSuiKind, 'binh'>,
  { label: string; note: string }
> = {
  tri: {
    label: 'Trị Thái Tuế (đồng chi)',
    note: 'tuổi trùng chi năm — Thái Tuế "ngồi" ngay bản mệnh, năm tuổi nên giữ mình, kiêng đại sự đầu năm',
  },
  xung: {
    label: 'Xung Thái Tuế',
    note: 'chi tuổi lục xung chi năm — biến động mạnh nhất trong các dạng phạm, đại sự nên thận trọng',
  },
  hinh: {
    label: 'Hình Thái Tuế',
    note: 'chi tuổi tương hình chi năm — dễ thị phi, kiện tụng, va chạm',
  },
  hai: {
    label: 'Hại Thái Tuế',
    note: 'chi tuổi lục hại chi năm — dễ bị cản trở, tiểu nhân, hao tổn ngầm',
  },
  pha: {
    label: 'Phá Thái Tuế',
    note: 'chi tuổi lục phá chi năm — dễ đổ vỡ kế hoạch, hao tài lặt vặt',
  },
};

/** Phương vị Thái Tuế của năm (lấy theo nhật lịch giữa năm). */
function taiSuiPosition(viewYear: number): string | null {
  try {
    return getAlmanacDay(viewYear, 6, 1).positionTaiSuiYear || null;
  } catch {
    return null;
  }
}

function taiSuiStatus(
  birthYear: number,
  viewYear: number,
): TaiSuiStatus {
  const birth = yearCanChi(birthYear);
  const year = yearCanChi(viewYear);
  const birthCanChi = formatCanChi(birth);
  const yearCanChiStr = formatCanChi(year);
  const position = taiSuiPosition(viewYear);

  const kinds: Exclude<TaiSuiKind, 'binh'>[] = [];
  if (birth.chi === year.chi) {
    kinds.push('tri');
    if (TU_HINH.includes(birth.chi)) kinds.push('hinh');
  }
  if (inPairs(LUC_XUNG, birth.chi, year.chi)) kinds.push('xung');
  if (birth.chi !== year.chi && inPairs(TUONG_HINH, birth.chi, year.chi)) {
    kinds.push('hinh');
  }
  if (inPairs(LUC_HAI, birth.chi, year.chi)) kinds.push('hai');
  if (inPairs(LUC_PHA, birth.chi, year.chi)) kinds.push('pha');

  const positionNote = position
    ? ` Phương Thái Tuế năm nay: ${position} — kiêng động thổ, đào bới phía này.`
    : '';

  if (kinds.length === 0) {
    return {
      kind: 'binh',
      kinds: ['binh'],
      verdict: 'good',
      label: 'Không phạm Thái Tuế',
      detail: `Chi năm ${viewYear} (${year.chi}) không trị, không xung / hình / hại / phá tuổi ${birth.chi}.${positionNote}`,
      yearCanChi: yearCanChiStr,
      birthCanChi,
      position,
    };
  }

  const order: Exclude<TaiSuiKind, 'binh'>[] = ['tri', 'xung', 'hinh', 'hai', 'pha'];
  const sorted = order.filter((k) => kinds.includes(k));
  const main = sorted[0];
  const verdict: Verdict = main === 'tri' || main === 'xung' ? 'bad' : 'caution';

  const label =
    sorted.length > 1
      ? `${TAI_SUI_KIND_INFO[main].label} (kèm ${sorted
          .slice(1)
          .map((k) => TAI_SUI_KIND_INFO[k].label.split(' ')[0].toLowerCase())
          .join(', ')})`
      : TAI_SUI_KIND_INFO[main].label;

  const detail = `Tuổi ${birth.chi} với năm ${viewYear} (${year.chi}): ${sorted
    .map((k) => TAI_SUI_KIND_INFO[k].note)
    .join('; ')}. Nên đăng ký cầu an / dâng sao tại chùa.${positionNote}`;

  return {
    kind: main,
    kinds: sorted,
    verdict,
    label,
    detail,
    yearCanChi: yearCanChiStr,
    birthCanChi,
    position,
  };
}

function combineOverall(
  star: Verdict,
  taiSui: Verdict,
  tamTai: Verdict,
): { overall: Verdict; overallLabel: string; overallDetail: string } {
  if (star === 'bad' || taiSui === 'bad') {
    return {
      overall: 'bad',
      overallLabel: 'Năm cần giải hạn',
      overallDetail:
        'Có hung tinh chiếu mệnh và/hoặc phạm · xung Thái Tuế. Nên đăng ký lễ dâng sao / cầu an tại chùa.',
    };
  }
  if (star === 'caution' || tamTai === 'caution' || taiSui === 'caution') {
    return {
      overall: 'caution',
      overallLabel: 'Năm cần thận trọng',
      overallDetail:
        'Sao trung hoặc có Tam Tai. Giữ tâm thành, có thể cầu an định kỳ; việc lớn hỏi trụ trì.',
    };
  }
  return {
    overall: 'good',
    overallLabel: 'Năm thuận',
    overallDetail:
      'Cát tinh chiếu mệnh, không phạm Thái Tuế nặng. Vẫn nên tu phúc và niệm Phật thường ngày.',
  };
}

export function getSaoChieuMenh(
  birthYear: number,
  viewYear: number,
  gender: 'nam' | 'nu',
): SaoChieuMenhResult {
  const ageMu = tuoiMu(birthYear, viewYear);
  const rem = remainderOfAge(ageMu);
  const name = starNameFor(ageMu, gender);
  const star = getStar(name);
  const starVerdict = toneToVerdict(star.tone);
  const taiSui = taiSuiStatus(birthYear, viewYear);
  const tamTaiRaw = checkTamTai(birthYear, viewYear);
  const tamTai = {
    verdict: tamTaiRaw.verdict,
    detail: tamTaiRaw.detail,
  };
  const { overall, overallLabel, overallDetail } = combineOverall(
    starVerdict,
    taiSui.verdict,
    tamTai.verdict,
  );

  const upcoming = [];
  for (let i = 0; i < 9; i++) {
    const y = viewYear + i;
    const age = tuoiMu(birthYear, y);
    const sn = starNameFor(age, gender);
    const info = STAR_INFO[sn];
    upcoming.push({
      year: y,
      ageMu: age,
      starName: sn,
      tone: info.tone,
      verdict: toneToVerdict(info.tone),
    });
  }

  return {
    birthYear,
    viewYear,
    gender,
    ageMu,
    remainder: rem,
    birthCanChi: formatCanChi(yearCanChi(birthYear)),
    yearCanChi: formatCanChi(yearCanChi(viewYear)),
    star,
    starVerdict,
    taiSui,
    tamTai,
    overall,
    overallLabel,
    overallDetail,
    upcoming,
  };
}

export function toneLabel(tone: StarTone): string {
  if (tone === 'cat') return 'Cát tinh';
  if (tone === 'hung') return 'Hung tinh';
  return 'Trung tinh';
}

/** Xuất bảng đủ 9 sao (tham khảo) */
export function allCuuDieuStars(): CuuDieuStar[] {
  return MALE_ORDER.map((name) => getStar(name));
}
