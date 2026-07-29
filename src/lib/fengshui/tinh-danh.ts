/**
 * Đánh giá tính danh — số hóa nét chữ Quốc ngữ (Lý số).
 * Tham khảo: Vũ Đức Huynh · Việt danh học · cấu trúc luận như cohoc.net.
 *
 * Số hóa từng tiếng (họ / đệm / tên) theo nét viết Latin + dấu.
 * Với 3 phần A,B,C:
 *   Họ vận = A+B · Mệnh vận = B+1 · Tên vận = C
 *   Tổng vận = A+B+C · Phụ vận = Tổng − Mệnh
 * Thiếu đệm: B = 1 (số giả).
 */

export type Gender = 'nam' | 'nu';
export type Tone = 'cat' | 'hung' | 'ban';

export interface BieuLyMeta {
  number: number;
  tone: Tone;
  title: string;
  summary: string;
  score: number; // 0–10
}

export interface SyllableStroke {
  text: string;
  strokes: number;
  detail: string;
}

export interface TinhDanhResult {
  ho: string;
  dem: string;
  ten: string;
  gender: Gender;
  syllables: {
    ho: SyllableStroke;
    dem: SyllableStroke | null;
    ten: SyllableStroke;
  };
  /** A,B,C sau số hóa (B=1 nếu không đệm) */
  A: number;
  B: number;
  C: number;
  hoVan: number;
  menhVan: number;
  tenVan: number;
  tongVan: number;
  phuVan: number;
  menhCucTinh: number;
  menhCucDong: number;
  tienVanCuc: number;
  hauVanCuc: number;
  phucDucTinh: number;
  phucDucDong: number;
  tuTucTinh: number;
  tuTucDong: number;
  /** Pythagoras bổ sung */
  linhHon: number;
  bieuDat: number;
  suMenh: number;
  /** Ngũ hành đơn vị của mệnh / phụ */
  menhNguHanh: { digit: number; label: string; summary: string };
  phuHop: { score: number; summary: string };
  tamTai: { score: number; summary: string };
  overallScore: number;
  overallLabel: string;
}

/** Nét cơ bản + dấu thanh (+1) — theo quy ước lý số Quốc ngữ */
const CHAR_STROKES: Record<string, number> = {
  a: 3,
  à: 4,
  á: 4,
  ả: 4,
  ã: 4,
  ạ: 4,
  ă: 5,
  ằ: 6,
  ắ: 6,
  ẳ: 6,
  ẵ: 6,
  ặ: 6,
  â: 5,
  ầ: 6,
  ấ: 6,
  ẩ: 6,
  ẫ: 6,
  ậ: 6,
  b: 3,
  c: 1,
  d: 2,
  đ: 3,
  e: 4,
  è: 5,
  é: 5,
  ẻ: 5,
  ẽ: 5,
  ẹ: 5,
  ê: 6,
  ề: 7,
  ế: 7,
  ể: 7,
  ễ: 7,
  ệ: 7,
  g: 3,
  h: 3,
  i: 2,
  ì: 3,
  í: 3,
  ỉ: 3,
  ĩ: 3,
  ị: 3,
  k: 3,
  l: 2,
  m: 4,
  n: 3,
  o: 1,
  ò: 2,
  ó: 2,
  ỏ: 2,
  õ: 2,
  ọ: 2,
  ô: 3,
  ồ: 4,
  ố: 4,
  ổ: 4,
  ỗ: 4,
  ộ: 4,
  ơ: 2,
  ờ: 3,
  ớ: 3,
  ở: 3,
  ỡ: 3,
  ợ: 3,
  p: 2,
  q: 2,
  r: 3,
  s: 1,
  t: 2,
  u: 2,
  ù: 3,
  ú: 3,
  ủ: 3,
  ũ: 3,
  ụ: 3,
  ư: 3,
  ừ: 4,
  ứ: 4,
  ử: 4,
  ữ: 4,
  ự: 4,
  v: 2,
  x: 2,
  y: 2,
  ỳ: 3,
  ý: 3,
  ỷ: 3,
  ỹ: 3,
  ỵ: 3,
  f: 3,
  j: 2,
  w: 3,
  z: 2,
};

/** 81 số biểu lý — rút gọn ý nghĩa + điểm (tham khảo dân gian) */
const BIEU_LY: Record<number, Omit<BieuLyMeta, 'number'>> = {
  1: { tone: 'cat', title: 'Thái cực', summary: 'Chủ khí khai mở, quyết đoán, đứng mũi chịu sào.', score: 8 },
  2: { tone: 'ban', title: 'Lưỡng nghi', summary: 'Cần người hỗ trợ; mềm mỏng nhưng dễ phân tâm.', score: 5 },
  3: { tone: 'cat', title: 'Tam tài', summary: 'Sáng tạo, hoạt bát, có duyên quần chúng.', score: 8 },
  4: { tone: 'hung', title: 'Tứ tượng trệ', summary: 'Dễ bế tắc, lao lực; cần kiên nhẫn vượt khó.', score: 3 },
  5: { tone: 'ban', title: 'Trung cung', summary: 'Thấu đáo nhưng hay cố chấp; trọng chữ tín.', score: 6 },
  6: { tone: 'cat', title: 'An ổn', summary: 'Thiên đức địa tường, tài lộc phúc thọ dồi dào nếu biết giữ đức.', score: 10 },
  7: { tone: 'cat', title: 'Thất tinh', summary: 'Tinh anh, độc lập; dễ thành nếu không cô độc quá.', score: 7 },
  8: { tone: 'cat', title: 'Kiên cường', summary: 'Ý chí mạnh, giải nạn được; tránh quá lo được–mất.', score: 10 },
  9: { tone: 'hung', title: 'Khốn cùng', summary: 'Lao đao, dễ hao tổn; cần tích đức và chọn bạn.', score: 2 },
  10: { tone: 'ban', title: 'Không–thực', summary: 'Biến hóa thất thường; có duyên tâm linh nếu dùng đúng.', score: 5 },
  11: { tone: 'cat', title: 'Phục hưng', summary: 'Vãn hồi, gia nghiệp có cơ hưng; khỏe, thọ nếu giữ chính.', score: 7 },
  12: { tone: 'hung', title: 'Bạc nhược', summary: 'Dễ nản, khốn khó lúc đầu; tránh mù quáng sức mình.', score: 3 },
  13: { tone: 'cat', title: 'Nhân duyên', summary: 'Được người giúp, có quý nhân.', score: 8 },
  14: { tone: 'ban', title: 'Phân ly', summary: 'Trắc trở tình cảm / hợp tác; cần thành thật.', score: 4 },
  15: { tone: 'cat', title: 'Phúc tinh', summary: 'Thuận lợi, được che chở.', score: 9 },
  16: { tone: 'hung', title: 'Ám sát', summary: 'Dễ thị phi, hao tài; thận trọng khẩu lưỡi.', score: 2 },
  17: { tone: 'cat', title: 'Nghê thường', summary: 'Có chí lớn, dễ nổi bật.', score: 8 },
  18: { tone: 'cat', title: 'Thiết kính', summary: 'Mưu trí, quyền lực; cứng quá dễ gãy — nên mềm.', score: 10 },
  19: { tone: 'ban', title: 'Đa sự', summary: 'Nhiều việc, nhiều lo; chọn một đường mà đi.', score: 5 },
  20: { tone: 'hung', title: 'Hư không', summary: 'Dễ trống rỗng mục tiêu; lập kỷ luật.', score: 3 },
  21: { tone: 'cat', title: 'Lộc mã', summary: 'Tiến tới, có danh có lợi.', score: 9 },
  22: { tone: 'ban', title: 'Lưỡng cực', summary: 'Thăng trầm rõ; giữ trung đạo.', score: 5 },
  23: { tone: 'cat', title: 'Uy vũ', summary: 'Mạnh mẽ, được kính nể.', score: 8 },
  24: { tone: 'cat', title: 'Giàu sang', summary: 'Tay trắng nên nghiệp, gia đình hòa nếu biết đủ.', score: 10 },
  25: { tone: 'cat', title: 'Thông tuệ', summary: 'Thông minh, nghị lực; tránh tự cao.', score: 7 },
  26: { tone: 'hung', title: 'Biến động', summary: 'Đổi thay nhiều, dễ mất ổn định.', score: 3 },
  27: { tone: 'ban', title: 'Độc hành', summary: 'Tự lực cánh sinh; bạn hiếm nhưng chí bền.', score: 5 },
  28: { tone: 'hung', title: 'Lao đồ', summary: 'Khó nhọc trước đã; về sau mới ngả.', score: 3 },
  29: { tone: 'cat', title: 'Trí dũng', summary: 'Có mưu có dũng, vượt chướng ngại.', score: 8 },
  30: { tone: 'ban', title: 'Phù trầm', summary: 'Lúc nổi lúc chìm; giữ đạo trung dung.', score: 5 },
  31: { tone: 'cat', title: 'Tụ khí', summary: 'Hội tụ nhân duyên tốt.', score: 8 },
  32: { tone: 'hung', title: 'Ly tán', summary: 'Dễ chia lìa; trân trọng người quanh.', score: 3 },
  33: { tone: 'cat', title: 'Thăng tiến', summary: 'Tiến lên nhờ đức và tài.', score: 9 },
  34: { tone: 'hung', title: 'Tổn thất', summary: 'Hao tài / sức; phòng bị trước.', score: 2 },
  35: { tone: 'ban', title: 'Trắc trở', summary: 'Có thành có bại; kiên tâm.', score: 5 },
  36: { tone: 'hung', title: 'Lênh đênh', summary: 'Chìm nổi, lao khổ; cần chỗ dựa đạo đức.', score: 5 },
  37: { tone: 'cat', title: 'Uy quyền', summary: 'Có vị thế, biết dùng quyền vì nghĩa.', score: 8 },
  38: { tone: 'hung', title: 'Cô quả', summary: 'Dễ cô độc; mở lòng chân thành.', score: 3 },
  39: { tone: 'ban', title: 'Công danh', summary: 'Có danh nhưng cực nhọc.', score: 6 },
  40: { tone: 'hung', title: 'Bế tắc', summary: 'Khó thông; chờ thời và tu dưỡng.', score: 2 },
  41: { tone: 'cat', title: 'Đắc lộc', summary: 'Được của, được người.', score: 8 },
  42: { tone: 'ban', title: 'Thất thường', summary: 'Biến động kế hoạch; linh hoạt có mực.', score: 5 },
  43: { tone: 'hung', title: 'Tai ách', summary: 'Dễ gặp chuyện thị phi; tránh nóng vội.', score: 2 },
  44: { tone: 'hung', title: 'Trùng khổ', summary: 'Khó chồng khó; lấy đức hóa nạn.', score: 1 },
  45: { tone: 'cat', title: 'Hanh thông', summary: 'Thuận bề trên, tiến được.', score: 9 },
  46: { tone: 'ban', title: 'Bán cát', summary: 'Nửa được nửa mất; biết đủ là phúc.', score: 5 },
  47: { tone: 'cat', title: 'Khai phương', summary: 'Mở mang, có đất dụng võ.', score: 8 },
  48: { tone: 'ban', title: 'Lao tâm', summary: 'Lo nhiều; san sẻ trách nhiệm.', score: 5 },
  49: { tone: 'hung', title: 'Đại nạn', summary: 'Cẩn trọng sức khỏe và giao dịch lớn.', score: 2 },
  50: { tone: 'ban', title: 'Tiểu chu nhập hải', summary: 'Nửa thành nửa bại; lúc thịnh nhớ rút lui đúng lúc.', score: 6 },
  51: { tone: 'cat', title: 'Thịnh vượng', summary: 'Khí thịnh, dễ tụ phúc.', score: 9 },
  52: { tone: 'hung', title: 'Suy giảm', summary: 'Dễ hao; giữ gốc.', score: 3 },
  53: { tone: 'cat', title: 'Đắc thế', summary: 'Được thời, được thế.', score: 8 },
  54: { tone: 'ban', title: 'Trùng điệp', summary: 'Việc lặp, dễ mệt; tinh giản.', score: 5 },
  55: { tone: 'cat', title: 'Trung hòa', summary: 'Cân bằng, bền.', score: 8 },
  56: { tone: 'hung', title: 'Lãng lý', summary: 'Ý nguyện trái việc làm; dễ không yên lúc già nếu thiếu chí.', score: 0 },
  57: { tone: 'cat', title: 'Quý nhân', summary: 'Có người nâng đỡ.', score: 9 },
  58: { tone: 'hung', title: 'Bất ổn', summary: 'Dễ sóng gió; bình tâm.', score: 3 },
  59: { tone: 'ban', title: 'Di dịch', summary: 'Đổi chỗ, đổi việc nhiều.', score: 5 },
  60: { tone: 'cat', title: 'Viên mãn', summary: 'Khí đủ, dễ hoàn tất.', score: 9 },
  61: { tone: 'cat', title: 'Phát đạt', summary: 'Tiến nhanh nếu giữ chính.', score: 8 },
  62: { tone: 'hung', title: 'Tổn đức', summary: 'Dễ mất phúc do nóng; tích thiện.', score: 2 },
  63: { tone: 'cat', title: 'Hưởng phúc', summary: 'Được hưởng thành quả.', score: 8 },
  64: { tone: 'ban', title: 'Chờ thời', summary: 'Chưa tới lúc; nuôi chí.', score: 5 },
  65: { tone: 'cat', title: 'Đại cát', summary: 'Thuận lớn.', score: 10 },
  66: { tone: 'ban', title: 'Trùng lặp', summary: 'Hai mặt vui–buồn; trung dung.', score: 5 },
  67: { tone: 'cat', title: 'Thành tựu', summary: 'Có quả ngọt sau gian nan.', score: 8 },
  68: { tone: 'hung', title: 'Suy vi', summary: 'Dễ xuống dốc nếu chủ quan.', score: 3 },
  69: { tone: 'cat', title: 'Hưng long', summary: 'Khí lên, mở mang.', score: 8 },
  70: { tone: 'hung', title: 'Nguyệt tận', summary: 'Cạn khí; tái tạo bằng đức hạnh.', score: 2 },
  71: { tone: 'cat', title: 'Tinh anh', summary: 'Trí tuệ mở.', score: 8 },
  72: { tone: 'ban', title: 'Phức tạp', summary: 'Nhiều mối; sắp xếp lại.', score: 5 },
  73: { tone: 'cat', title: 'Đắc nhân tâm', summary: 'Được lòng người.', score: 9 },
  74: { tone: 'hung', title: 'Ly tâm', summary: 'Dễ mất đoàn kết.', score: 3 },
  75: { tone: 'ban', title: 'Trung bình', summary: 'Không quá tốt xấu; do người.', score: 5 },
  76: { tone: 'hung', title: 'Khốn đốn', summary: 'Gặp khó kéo dài; bền chí.', score: 2 },
  77: { tone: 'cat', title: 'Song hỷ', summary: 'Được việc đôi đường.', score: 9 },
  78: { tone: 'ban', title: 'Bán hung', summary: 'Nửa đầu may, nửa sau cần đề phòng suy.', score: 6 },
  79: { tone: 'cat', title: 'Thành danh', summary: 'Có tiếng, có vị.', score: 8 },
  80: { tone: 'hung', title: 'Bế nguyên', summary: 'Dễ tắc (số 0 quy về 80); mở bằng thiện nguyện.', score: 2 },
  81: { tone: 'cat', title: 'Viên giác', summary: 'Tròn đầy lý tưởng; hiếm và quý.', score: 10 },
};

const NGU_HANH_DIGIT: Record<
  number,
  { label: string; summary: string }
> = {
  1: {
    label: 'Dương Mộc',
    summary:
      'Thuộc Mộc chủ “nhân”. Hòa nhã, ý chí mạnh, thích nghi nhanh; hành động thận trọng nên đôi khi chậm.',
  },
  2: {
    label: 'Âm Mộc',
    summary: 'Mềm mỏng, biết nhường; dễ thành nếu không nhu nhược.',
  },
  3: {
    label: 'Dương Hỏa',
    summary: 'Nóng nhiệt, sáng tạo, lan tỏa; tránh nóng vội.',
  },
  4: {
    label: 'Âm Hỏa',
    summary: 'Ấm áp bên trong; duy trì lửa đều hơn bùng nổ.',
  },
  5: {
    label: 'Dương Thổ',
    summary: 'Trọng tín, ưa yên; dễ cố chấp và tự cao nếu không tỉnh.',
  },
  6: {
    label: 'Âm Thổ',
    summary: 'Bao dung, nuôi dưỡng; tránh ôm đồm.',
  },
  7: {
    label: 'Dương Kim',
    summary: 'Quyết đoán, sắc bén; dùng nghĩa hơn dùng khí.',
  },
  8: {
    label: 'Âm Kim',
    summary: 'Tinh tế, kỷ luật; tránh quá cứng.',
  },
  9: {
    label: 'Dương Thủy',
    summary: 'Trí tuệ, linh hoạt; tránh phân tán.',
  },
  0: {
    label: 'Âm Thủy',
    summary: 'Sâu lắng, chứa đựng; tránh bị cuốn trôi.',
  },
};

function padTone(n: number): Omit<BieuLyMeta, 'number'> {
  return (
    BIEU_LY[n] ?? {
      tone: 'ban' as Tone,
      title: 'Số đặc biệt',
      summary: 'Ít gặp trong bảng 81; luận thận trọng, lấy đức làm gốc.',
      score: 5,
    }
  );
}

/** 0 → 80 theo chú thích lý số */
export function normalizeBieuLy(n: number): number {
  let x = Math.abs(Math.trunc(n));
  if (x === 0) return 80;
  x = ((x - 1) % 80) + 1;
  if (x === 0) return 80;
  return x > 81 ? ((x - 1) % 81) + 1 : x;
}

export function getBieuLy(n: number): BieuLyMeta {
  const number = normalizeBieuLy(n);
  return { number, ...padTone(number) };
}

export function strokeChar(ch: string): number {
  const c = ch.toLowerCase();
  if (CHAR_STROKES[c] != null) return CHAR_STROKES[c];
  // Fallback: thử NFD
  const d = c.normalize('NFD');
  const base = d[0];
  const marks = d.length - 1;
  const baseStroke =
    CHAR_STROKES[base] ??
    ({ a: 3, e: 4, i: 2, o: 1, u: 2, y: 2, d: 2 }[base] ?? 2);
  return baseStroke + marks;
}

export function strokeSyllable(text: string): SyllableStroke {
  const cleaned = text.trim().replace(/\s+/g, '');
  const parts: string[] = [];
  let total = 0;
  for (const ch of cleaned) {
    if (!/\p{L}/u.test(ch)) continue;
    const s = strokeChar(ch);
    total += s;
    parts.push(`${ch}=${s}`);
  }
  return {
    text: cleaned,
    strokes: total,
    detail: parts.join(' + ') || '0',
  };
}

function lastDigit(n: number): number {
  return Math.abs(n) % 10;
}

function pythagorasLetter(ch: string): number | null {
  const c = ch
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/gi, 'd')
    .toLowerCase();
  if (c.length !== 1 || c < 'a' || c > 'z') return null;
  return ((c.charCodeAt(0) - 97) % 9) + 1;
}

function reducePy(n: number): number {
  let x = Math.abs(Math.trunc(n));
  // Giữ 10 · 11 · 22 · 33 (cohoc dùng linh hồn = 10)
  while (x > 10 && x !== 11 && x !== 22 && x !== 33) {
    let s = 0;
    while (x > 0) {
      s += x % 10;
      x = Math.floor(x / 10);
    }
    x = s;
  }
  return x === 0 ? 9 : x;
}

function analyzePythagoras(full: string): {
  linhHon: number;
  bieuDat: number;
  suMenh: number;
} {
  const vowels = new Set(['a', 'e', 'i', 'o', 'u', 'y']);
  let all = 0;
  let vow = 0;
  let cons = 0;
  for (const ch of full) {
    const v = pythagorasLetter(ch);
    if (v == null) continue;
    all += v;
    const base = ch
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/gi, 'd')
      .toLowerCase();
    if (vowels.has(base)) vow += v;
    else cons += v;
  }
  return {
    linhHon: reducePy(vow || all),
    bieuDat: reducePy(cons || all),
    suMenh: reducePy(all),
  };
}

function tamTaiScore(hoDigit: number, menhDigit: number, tenDigit: number): {
  score: number;
  summary: string;
} {
  // Đơn giản hóa ngũ hành sinh khắc theo đơn vị 1-2 Mộc, 3-4 Hỏa, 5-6 Thổ, 7-8 Kim, 9-0 Thủy
  const elem = (d: number) => {
    if (d === 1 || d === 2) return 'moc';
    if (d === 3 || d === 4) return 'hoa';
    if (d === 5 || d === 6) return 'tho';
    if (d === 7 || d === 8) return 'kim';
    return 'thuy';
  };
  const sinh: Record<string, string> = {
    moc: 'hoa',
    hoa: 'tho',
    tho: 'kim',
    kim: 'thuy',
    thuy: 'moc',
  };
  const eH = elem(hoDigit);
  const eM = elem(menhDigit);
  const eT = elem(tenDigit);
  let score = 6;
  const notes: string[] = [];
  if (sinh[eH] === eM || sinh[eM] === eH) {
    score += 2;
    notes.push('Họ–Mệnh tương sinh');
  }
  if (sinh[eM] === eT || sinh[eT] === eM) {
    score += 2;
    notes.push('Mệnh–Tên tương sinh');
  }
  if (sinh[eH] === eT) {
    score += 1;
    notes.push('Họ–Tên thuận');
  }
  score = Math.min(10, score);
  return {
    score,
    summary:
      notes.length > 0
        ? `${notes.join('; ')}. Cơ sở càng thuận càng dễ hanh.`
        : 'Tam tài trung bình — lấy đức và hành vi bù cho số.',
  };
}

export function analyzeTinhDanh(input: {
  ho: string;
  dem?: string;
  ten: string;
  gender?: Gender;
}): TinhDanhResult {
  const ho = input.ho.trim();
  const dem = (input.dem || '').trim();
  const ten = input.ten.trim();
  const gender = input.gender ?? 'nam';

  const sylHo = strokeSyllable(ho);
  const sylDem = dem ? strokeSyllable(dem) : null;
  const sylTen = strokeSyllable(ten);

  const A = sylHo.strokes;
  const B = sylDem ? sylDem.strokes : 1; // số giả
  const C = sylTen.strokes;

  const tongVan = normalizeBieuLy(A + B + C);
  const hoVan = normalizeBieuLy(A + B);
  const menhVan = normalizeBieuLy(B + 1);
  const tenVan = normalizeBieuLy(C);
  const phuVan = normalizeBieuLy(A + B + C - (B + 1));

  const tienVanCuc = lastDigit(A + B + C) || 10;
  const hauVanCuc = normalizeBieuLy(80 - hoVan);
  const menhCucTinh = normalizeBieuLy(2 * (A + B + C) + tienVanCuc);
  const menhCucDong = menhCucTinh;
  const phucDucTinh = normalizeBieuLy(2 * phuVan);
  const phucDucDong = lastDigit(phuVan) || 10;
  const tuTucTinh = normalizeBieuLy(tenVan + tienVanCuc);
  const tuTucDong = lastDigit(tuTucTinh) || 10;

  const full = [ho, dem, ten].filter(Boolean).join(' ');
  const py = analyzePythagoras(full);

  const menhDigit = lastDigit(menhVan);
  const phuDigit = lastDigit(phuVan);
  const menhNguHanh = {
    digit: menhDigit,
    ...(NGU_HANH_DIGIT[menhDigit] ?? NGU_HANH_DIGIT[1]),
  };

  const phuMeta = NGU_HANH_DIGIT[phuDigit] ?? NGU_HANH_DIGIT[0];
  const phuHop = {
    score: Math.round(
      (getBieuLy(menhVan).score + getBieuLy(phuVan).score) / 2,
    ),
    summary: `Mệnh ${menhNguHanh.label} phối Phụ ${phuMeta.label}: ${phuMeta.summary}`,
  };

  const tamTai = tamTaiScore(
    lastDigit(hoVan) || 10,
    menhDigit || 10,
    lastDigit(tenVan) || 10,
  );

  const scoreParts = [
    getBieuLy(hoVan).score,
    getBieuLy(menhVan).score,
    getBieuLy(tenVan).score,
    getBieuLy(phuVan).score,
    getBieuLy(tongVan).score,
    getBieuLy(menhCucTinh).score,
    getBieuLy(tienVanCuc).score,
    getBieuLy(hauVanCuc).score,
    tamTai.score,
  ];
  const overallScore =
    Math.round(
      (scoreParts.reduce((a, b) => a + b, 0) / scoreParts.length) * 10,
    ) / 10;

  let overallLabel = 'tính danh trung bình';
  if (overallScore >= 8) overallLabel = 'tính danh đẹp';
  else if (overallScore >= 6.5) overallLabel = 'tính danh đẹp trung bình';
  else if (overallScore >= 5) overallLabel = 'tính danh trung bình';
  else if (overallScore >= 3.5) overallLabel = 'tính danh yếu';
  else overallLabel = 'tính danh cần hóa giải bằng đức hạnh';

  return {
    ho,
    dem,
    ten,
    gender,
    syllables: { ho: sylHo, dem: sylDem, ten: sylTen },
    A,
    B,
    C,
    hoVan,
    menhVan,
    tenVan,
    tongVan,
    phuVan,
    menhCucTinh,
    menhCucDong,
    tienVanCuc: normalizeBieuLy(tienVanCuc),
    hauVanCuc,
    phucDucTinh,
    phucDucDong: normalizeBieuLy(phucDucDong),
    tuTucTinh,
    tuTucDong: normalizeBieuLy(tuTucDong),
    linhHon: py.linhHon,
    bieuDat: py.bieuDat,
    suMenh: py.suMenh,
    menhNguHanh,
    phuHop,
    tamTai,
    overallScore,
    overallLabel,
  };
}
