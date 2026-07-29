/**
 * Thần số học Pythagoras — số đường đời, ngày sinh, năm cá nhân, tên.
 * Master: 11 · 22 · 33. Tham khảo cổ học hiện đại, không định mệnh tuyệt đối.
 */

export type MasterOrDigit = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 11 | 22 | 33;

export interface NumberProfile {
  number: MasterOrDigit;
  title: string;
  keywords: string[];
  summary: string;
  strength: string;
  challenge: string;
  advice: string;
}

export interface NameBreakdown {
  expression: MasterOrDigit;
  soul: MasterOrDigit;
  personality: MasterOrDigit;
  letterSum: number;
  vowelSum: number;
  consonantSum: number;
}

export interface ThanSoResult {
  fullName: string;
  birthDay: number;
  birthMonth: number;
  birthYear: number;
  lifePath: MasterOrDigit;
  birthday: MasterOrDigit;
  personalYear: MasterOrDigit;
  viewYear: number;
  name: NameBreakdown | null;
  steps: {
    lifePath: string;
    birthday: string;
    personalYear: string;
    name?: string;
  };
}

const PROFILES: Record<MasterOrDigit, NumberProfile> = {
  1: {
    number: 1,
    title: 'Người khởi đầu',
    keywords: ['độc lập', 'lãnh đạo', 'sáng tạo'],
    summary:
      'Số 1 mang khí tiên phong — thích tự chủ, mở đường, chịu trách nhiệm. Khi quân bình sẽ truyền cảm hứng; khi lệch dễ độc đoán.',
    strength: 'Quyết đoán, dám chịu trách nhiệm, ý chí mạnh.',
    challenge: 'Cô độc, cứng nhắc, khó lắng nghe người khác.',
    advice: 'Giữ chí lớn nhưng học khiêm — lãnh đạo bằng gương chứ không bằng áp đặt.',
  },
  2: {
    number: 2,
    title: 'Người hòa hợp',
    keywords: ['hợp tác', 'nhạy cảm', 'cân bằng'],
    summary:
      'Số 2 thiên về đối nhân xử thế, trung gian và cảm nhận tinh tế. Sức mạnh nằm ở sự nhẹ nhàng và kiên nhẫn.',
    strength: 'Đồng cảm, khéo kết nối, biết lắng nghe.',
    challenge: 'Dễ phụ thuộc ý kiến người khác, thiếu quyết đoán.',
    advice: 'Nuôi sự mềm mỏng nhưng vẫn giữ ranh giới và tiếng nói riêng.',
  },
  3: {
    number: 3,
    title: 'Người biểu đạt',
    keywords: ['sáng tạo', 'giao tiếp', 'vui sống'],
    summary:
      'Số 3 sống bằng lời nói, hình ảnh, nghệ thuật và sự lạc quan. Khi tập trung thì tỏa sáng; khi phân tán thì bỏ dở.',
    strength: 'Dễ gần, giàu ý tưởng, truyền năng lượng tích cực.',
    challenge: 'Nông nổi, nói nhiều làm ít, sợ ràng buộc.',
    advice: 'Biến cảm hứng thành kỷ luật nhỏ hàng ngày — một việc hoàn tất hơn mười ý tưởng.',
  },
  4: {
    number: 4,
    title: 'Người xây dựng',
    keywords: ['ổn định', 'kỷ luật', 'nền tảng'],
    summary:
      'Số 4 coi trọng trật tự, thực tế và xây dựng lâu dài. Là trụ cột tin cậy của gia đình và tổ chức.',
    strength: 'Chăm chỉ, đáng tin, biết lập kế hoạch.',
    challenge: 'Cứng nhắc, sợ thay đổi, dễ kiệt sức vì ôm việc.',
    advice: 'Giữ nền vững nhưng để chỗ cho nghỉ ngơi và linh hoạt nhỏ.',
  },
  5: {
    number: 5,
    title: 'Người tự do',
    keywords: ['thay đổi', 'trải nghiệm', 'linh hoạt'],
    summary:
      'Số 5 khao khát tự do, đi lại và học qua trải nghiệm. Nhịp sống nhanh; bài học là biết chọn lọc.',
    strength: 'Thích nghi, can đảm thử mới, duyên giao tiếp.',
    challenge: 'Bồn chồn, khó cam kết, dễ phóng túng.',
    advice: 'Tự do có trách nhiệm — chọn một hướng rồi đi sâu thay vì chạy mãi.',
  },
  6: {
    number: 6,
    title: 'Người trách nhiệm',
    keywords: ['gia đình', 'chăm sóc', 'hài hòa'],
    summary:
      'Số 6 gắn với nhà cửa, tình cảm và nghĩa vụ. Có trái tim phụng sự; cần học buông khi đã làm hết phần mình.',
    strength: 'Biết yêu thương, bảo vệ người thân, thẩm mỹ và sự chỉn chu.',
    challenge: 'Ôm đồm, kiểm soát vì “tốt cho người khác”.',
    advice: 'Chăm người bằng lòng từ bi, không bằng lo âu hay ép buộc.',
  },
  7: {
    number: 7,
    title: 'Người tìm hiểu',
    keywords: ['nội tâm', 'trí tuệ', 'tâm linh'],
    summary:
      'Số 7 thích suy ngẫm, học sâu và không gian riêng. Hướng về chân lý hơn bề nổi.',
    strength: 'Phân tích sắc, trực giác tốt, trung thực với mình.',
    challenge: 'Cô lập, hoài nghi quá mức, khó tin người.',
    advice: 'Tu học và chiêm nghiệm là thế mạnh — đừng quên mở lòng với nhân duyên đời thường.',
  },
  8: {
    number: 8,
    title: 'Người thành tựu',
    keywords: ['quyền lực', 'vật chất', 'quản trị'],
    summary:
      'Số 8 gắn với thành quả hữu hình, tổ chức và uy tín. Khi chính trực thì tạo phúc lớn; khi tham thì tự trói.',
    strength: 'Tầm nhìn lớn, bản lĩnh, biết vận hành nguồn lực.',
    challenge: 'Công việc nuốt đời sống, đo giá trị bằng địa vị.',
    advice: 'Dùng quyền lực để nuôi người và nuôi đạo — công đức đi cùng thành tựu.',
  },
  9: {
    number: 9,
    title: 'Người hoàn tất',
    keywords: ['nhân ái', 'bao dung', 'buông xả'],
    summary:
      'Số 9 mang khí kết thúc chu kỳ — rộng lòng, muốn giúp đời, dễ cảm nhận khổ đau của người khác.',
    strength: 'Từ bi, lý tưởng cao, biết chia sẻ.',
    challenge: 'Hy sinh quá mức, lý tưởng hóa, khó khép lại chuyện cũ.',
    advice: 'Yêu thương có biên giới lành mạnh; hoàn tất rồi mới mở chương mới.',
  },
  11: {
    number: 11,
    title: 'Bậc thầy trực giác (Master 11)',
    keywords: ['trực giác', 'cảm hứng', 'soi sáng'],
    summary:
      '11 là master của số 2 — nhạy cảm cao, có khả năng truyền cảm hứng và “thấy” điều người khác chưa nói. Áp lực nội tâm lớn hơn số thường.',
    strength: 'Trực giác mạnh, truyền cảm, lý tưởng cao.',
    challenge: 'Căng thẳng thần kinh, dao động cảm xúc, tự nghi.',
    advice: 'Giữ thân–tâm ổn định (ngủ đủ, thiền/niệm) để trực giác thành trí tuệ chứ không thành rối loạn.',
  },
  22: {
    number: 22,
    title: 'Bậc thầy xây dựng lớn (Master 22)',
    keywords: ['tầm vóc', 'hiện thực hóa', 'di sản'],
    summary:
      '22 là master của số 4 — biến ước mơ lớn thành công trình thực tế phục vụ nhiều người. Cần kỷ luật và đồng đội.',
    strength: 'Tầm nhìn lớn + khả năng tổ chức thực tế.',
    challenge: 'Áp lực thành công, dễ kiệt sức hoặc hoãn mãi vì sợ chưa hoàn hảo.',
    advice: 'Chia việc lớn thành bước nhỏ; xây vì lợi ích chung hơn vì danh.',
  },
  33: {
    number: 33,
    title: 'Bậc thầy phụng sự (Master 33)',
    keywords: ['chữa lành', 'dạy dỗ', 'từ bi'],
    summary:
      '33 là master của số 6 — phụng sự, chữa lành, dạy bằng tấm gương. Rất hiếm; đòi hỏi trưởng thành cảm xúc sâu.',
    strength: 'Lòng từ rộng, khả năng nâng đỡ người khác.',
    challenge: 'Hy sinh đến kiệt, mang gánh khổ của cả tập thể.',
    advice: 'Phụng sự bắt đầu từ tự chăm mình; từ bi có trí tuệ mới bền.',
  },
};

const VOWELS = new Set(['a', 'e', 'i', 'o', 'u', 'y']);

/** Bỏ dấu tiếng Việt để map Pythagoras */
export function stripVietnamese(input: string): string {
  return input
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D');
}

export function letterValue(ch: string): number | null {
  const c = stripVietnamese(ch).toLowerCase();
  if (c.length !== 1 || c < 'a' || c > 'z') return null;
  return ((c.charCodeAt(0) - 97) % 9) + 1;
}

/** Rút gọn; giữ 11 · 22 · 33 */
export function reduceNumber(n: number, keepMaster = true): MasterOrDigit {
  let x = Math.abs(Math.trunc(n));
  if (x === 0) return 9;
  while (x > 9) {
    if (keepMaster && (x === 11 || x === 22 || x === 33)) {
      return x as MasterOrDigit;
    }
    let s = 0;
    while (x > 0) {
      s += x % 10;
      x = Math.floor(x / 10);
    }
    x = s;
  }
  return x as MasterOrDigit;
}

function sumDigits(n: number): number {
  let x = Math.abs(Math.trunc(n));
  let s = 0;
  while (x > 0) {
    s += x % 10;
    x = Math.floor(x / 10);
  }
  return s;
}

export function getProfile(n: MasterOrDigit): NumberProfile {
  return PROFILES[n];
}

export function allProfiles(): NumberProfile[] {
  return ([1, 2, 3, 4, 5, 6, 7, 8, 9, 11, 22, 33] as MasterOrDigit[]).map(
    (n) => PROFILES[n],
  );
}

export function calcLifePath(
  day: number,
  month: number,
  year: number,
): { value: MasterOrDigit; detail: string } {
  const d = reduceNumber(day);
  const m = reduceNumber(month);
  const y = reduceNumber(year);
  const raw = d + m + y;
  const value = reduceNumber(raw);
  return {
    value,
    detail: `Ngày ${day}→${d} + Tháng ${month}→${m} + Năm ${year}→${y} = ${raw} → ${value}`,
  };
}

export function calcBirthday(day: number): {
  value: MasterOrDigit;
  detail: string;
} {
  const value = reduceNumber(day);
  if (day === value) {
    return { value, detail: `Ngày ${day}` };
  }
  const mid = sumDigits(day);
  return {
    value,
    detail:
      mid === value
        ? `Ngày ${day} → ${value}`
        : `Ngày ${day} → ${mid} → ${value}`,
  };
}

/** Năm cá nhân: tháng + ngày + năm xem (rút gọn từng phần) */
export function calcPersonalYear(
  day: number,
  month: number,
  viewYear: number,
): { value: MasterOrDigit; detail: string } {
  const d = reduceNumber(day);
  const m = reduceNumber(month);
  const y = reduceNumber(viewYear);
  const raw = d + m + y;
  const value = reduceNumber(raw);
  return {
    value,
    detail: `Ngày→${d} + Tháng→${m} + Năm ${viewYear}→${y} = ${raw} → ${value}`,
  };
}

export function calcFromName(fullName: string): NameBreakdown | null {
  const cleaned = stripVietnamese(fullName).toLowerCase();
  let letterSum = 0;
  let vowelSum = 0;
  let consonantSum = 0;
  let letters = 0;

  for (const ch of cleaned) {
    const v = letterValue(ch);
    if (v == null) continue;
    letters += 1;
    letterSum += v;
    if (VOWELS.has(stripVietnamese(ch).toLowerCase())) vowelSum += v;
    else consonantSum += v;
  }

  if (letters === 0) return null;

  return {
    expression: reduceNumber(letterSum),
    soul: reduceNumber(vowelSum || letterSum),
    personality: reduceNumber(consonantSum || letterSum),
    letterSum,
    vowelSum,
    consonantSum,
  };
}

export function analyzeThanSo(input: {
  fullName?: string;
  day: number;
  month: number;
  year: number;
  viewYear?: number;
}): ThanSoResult {
  const { day, month, year } = input;
  const viewYear = input.viewYear ?? new Date().getFullYear();
  const life = calcLifePath(day, month, year);
  const bday = calcBirthday(day);
  const py = calcPersonalYear(day, month, viewYear);
  const nameRaw = (input.fullName || '').trim();
  const name = nameRaw ? calcFromName(nameRaw) : null;

  return {
    fullName: nameRaw,
    birthDay: day,
    birthMonth: month,
    birthYear: year,
    lifePath: life.value,
    birthday: bday.value,
    personalYear: py.value,
    viewYear,
    name,
    steps: {
      lifePath: life.detail,
      birthday: bday.detail,
      personalYear: py.detail,
      name: name
        ? `Tổng chữ cái ${name.letterSum}→${name.expression} · Nguyên âm ${name.vowelSum}→${name.soul} · Phụ âm ${name.consonantSum}→${name.personality}`
        : undefined,
    },
  };
}

export function isValidBirthDate(day: number, month: number, year: number) {
  if (year < 1900 || year > 2100) return false;
  if (month < 1 || month > 12) return false;
  if (day < 1 || day > 31) return false;
  const dt = new Date(year, month - 1, day);
  return (
    dt.getFullYear() === year &&
    dt.getMonth() === month - 1 &&
    dt.getDate() === day
  );
}
