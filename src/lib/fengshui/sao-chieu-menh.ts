/**
 * Sao chiếu mệnh (Cửu Diệu) · Thái Tuế theo năm —
 * bảng dân gian dùng cho lễ dâng sao giải hạn tại chùa.
 */

import { formatCanChi, tuoiMu, yearCanChi } from './lunar';
import {
  checkTamTai,
  checkXungNam,
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

export type TaiSuiKind = 'dong' | 'xung' | 'binh';

export interface TaiSuiStatus {
  kind: TaiSuiKind;
  verdict: Verdict;
  label: string;
  detail: string;
  yearCanChi: string;
  birthCanChi: string;
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

function taiSuiStatus(
  birthYear: number,
  viewYear: number,
): TaiSuiStatus {
  const birth = yearCanChi(birthYear);
  const year = yearCanChi(viewYear);
  const birthCanChi = formatCanChi(birth);
  const yearCanChiStr = formatCanChi(year);

  if (birth.chi === year.chi) {
    return {
      kind: 'dong',
      verdict: 'bad',
      label: 'Phạm Thái Tuế (đồng)',
      detail: `Chi tuổi ${birth.chi} trùng chi năm ${viewYear} (${year.chi}) — phạm Thái Tuế bản mệnh. Nên cầu an / dâng sao tại chùa.`,
      yearCanChi: yearCanChiStr,
      birthCanChi,
    };
  }

  const xung = checkXungNam(birthYear, viewYear);
  if (xung.verdict === 'caution') {
    return {
      kind: 'xung',
      verdict: 'bad',
      label: 'Xung Thái Tuế',
      detail: `Chi năm ${viewYear} (${year.chi}) xung tuổi ${birth.chi}. Đại sự nên thận trọng; nên lễ cầu an.`,
      yearCanChi: yearCanChiStr,
      birthCanChi,
    };
  }

  return {
    kind: 'binh',
    verdict: 'good',
    label: 'Không phạm Thái Tuế',
    detail: `Chi năm ${viewYear} (${year.chi}) không đồng / không xung tuổi ${birth.chi}.`,
    yearCanChi: yearCanChiStr,
    birthCanChi,
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
