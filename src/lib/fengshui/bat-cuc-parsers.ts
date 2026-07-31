/**
 * Bóc tách các loại dãy số cho bộ công cụ Bát Cực Linh Số.
 *
 * Nguyên tắc chung:
 * - Chữ cái KHÔNG ép vào chuỗi cặp Bát Cực (sách chỉ luận số).
 *   Tách riêng, quy đổi vị trí alphabet (A=1…Z=26 → cộng dồn về 1–9)
 *   để tham khảo quái số và đưa vào ngữ cảnh AI.
 * - Dữ liệu nhạy cảm (mật khẩu, PIN, tài khoản, thẻ) chỉ phân tích cục bộ;
 *   khi gửi AI dùng maskDigits — không bao giờ gửi dãy gốc.
 *
 * Nguồn dữ liệu tra cứu:
 * - Mã tỉnh CCCD: Thông tư 07/2016/TT-BCA (phụ lục bảng 63 tỉnh/thành).
 * - Ký hiệu giới tính/thế kỷ CCCD: Điều 4 Thông tư 07/2016/TT-BCA.
 * - Mã tỉnh biển số xe: Thông tư 79/2024/TT-BCA (kế thừa bảng 10–99).
 * - Kiểm tra thẻ: thuật toán Luhn (ISO/IEC 7812).
 */

import { solarToLunar, formatLunarDate, yearCanChi, formatCanChi } from '@/lib/fengshui/lunar';

/* ============ Chữ cái ============ */

export interface LetterInfo {
  letter: string;
  /** A=1 … Z=26 */
  alphaIndex: number;
  /** rút gọn về 1–9 */
  reduced: number;
}

export function letterToNumber(ch: string): LetterInfo | null {
  const c = ch.toUpperCase();
  if (c < 'A' || c > 'Z') return null;
  const idx = c.charCodeAt(0) - 64;
  let r = idx;
  while (r > 9) {
    r = String(r)
      .split('')
      .reduce((a, b) => a + Number(b), 0);
  }
  return { letter: c, alphaIndex: idx, reduced: r };
}

export interface AlnumParse {
  /** dãy chữ số theo đúng thứ tự xuất hiện */
  digits: number[];
  /** các chữ cái tách riêng kèm quy đổi */
  letters: LetterInfo[];
  /** chuỗi hiển thị đã làm sạch */
  display: string;
}

/** Tách một chuỗi bất kỳ thành phần số (để luận Bát Cực) + phần chữ (tham khảo). */
export function parseAlnum(raw: string): AlnumParse {
  const cleaned = raw.trim();
  const digits: number[] = [];
  const letters: LetterInfo[] = [];
  for (const ch of cleaned) {
    if (/\d/.test(ch)) digits.push(Number(ch));
    else {
      const li = letterToNumber(ch);
      if (li) letters.push(li);
    }
  }
  return { digits, letters, display: cleaned };
}

/* ============ Biển số xe ============ */

/** Mã tỉnh biển số xe cơ giới (bảng 10–99 chính thức, các mã đang cấp). */
export const PLATE_PROVINCES: Record<string, string> = {
  '11': 'Cao Bằng',
  '12': 'Lạng Sơn',
  '14': 'Quảng Ninh',
  '15': 'Hải Phòng',
  '16': 'Hải Phòng',
  '17': 'Thái Bình',
  '18': 'Nam Định',
  '19': 'Phú Thọ',
  '20': 'Thái Nguyên',
  '21': 'Yên Bái',
  '22': 'Tuyên Quang',
  '23': 'Hà Giang',
  '24': 'Lào Cai',
  '25': 'Lai Châu',
  '26': 'Sơn La',
  '27': 'Điện Biên',
  '28': 'Hòa Bình',
  '29': 'Hà Nội',
  '30': 'Hà Nội',
  '31': 'Hà Nội',
  '32': 'Hà Nội',
  '33': 'Hà Nội',
  '34': 'Hải Dương',
  '35': 'Ninh Bình',
  '36': 'Thanh Hóa',
  '37': 'Nghệ An',
  '38': 'Hà Tĩnh',
  '39': 'Đồng Nai',
  '40': 'Hà Nội',
  '41': 'TP. Hồ Chí Minh',
  '43': 'Đà Nẵng',
  '47': 'Đắk Lắk',
  '48': 'Đắk Nông',
  '49': 'Lâm Đồng',
  '50': 'TP. Hồ Chí Minh',
  '51': 'TP. Hồ Chí Minh',
  '52': 'TP. Hồ Chí Minh',
  '53': 'TP. Hồ Chí Minh',
  '54': 'TP. Hồ Chí Minh',
  '55': 'TP. Hồ Chí Minh',
  '56': 'TP. Hồ Chí Minh',
  '57': 'TP. Hồ Chí Minh',
  '58': 'TP. Hồ Chí Minh',
  '59': 'TP. Hồ Chí Minh',
  '60': 'Đồng Nai',
  '61': 'Bình Dương',
  '62': 'Long An',
  '63': 'Tiền Giang',
  '64': 'Vĩnh Long',
  '65': 'Cần Thơ',
  '66': 'Đồng Tháp',
  '67': 'An Giang',
  '68': 'Kiên Giang',
  '69': 'Cà Mau',
  '70': 'Tây Ninh',
  '71': 'Bến Tre',
  '72': 'Bà Rịa – Vũng Tàu',
  '73': 'Quảng Bình',
  '74': 'Quảng Trị',
  '75': 'Thừa Thiên Huế',
  '76': 'Quảng Ngãi',
  '77': 'Bình Định',
  '78': 'Phú Yên',
  '79': 'Khánh Hòa',
  '81': 'Gia Lai',
  '82': 'Kon Tum',
  '83': 'Sóc Trăng',
  '84': 'Trà Vinh',
  '85': 'Ninh Thuận',
  '86': 'Bình Thuận',
  '88': 'Vĩnh Phúc',
  '89': 'Hưng Yên',
  '90': 'Hà Nam',
  '92': 'Quảng Nam',
  '93': 'Bình Phước',
  '94': 'Bạc Liêu',
  '95': 'Hậu Giang',
  '97': 'Bắc Kạn',
  '98': 'Bắc Giang',
  '99': 'Bắc Ninh',
};

export interface PlateParse {
  /** biển đã chuẩn hóa, vd "30K-123.45" */
  display: string;
  provinceCode: string;
  provinceName?: string;
  /** seri chữ (1–2 ký tự) kèm quy đổi */
  series: LetterInfo[];
  seriesRaw: string;
  /** dãy số chính (4–5 số) — phần luận Bát Cực */
  mainDigits: number[];
  /** toàn bộ chữ số trên biển (mã tỉnh + số chính) */
  allDigits: number[];
}

/**
 * Parse biển số VN: `30K-123.45`, `59-X1 234.56`, `30K12345`, `29A 12345`…
 * Cấu trúc: 2 số mã tỉnh + seri (1–2 ký tự chữ/số) + dãy 4–5 số.
 */
export function parsePlate(raw: string): PlateParse | { error: string } {
  const cleaned = raw.toUpperCase().replace(/[\s.\-–]/g, '');
  // 2 số mã tỉnh + khối seri chữ (0–2 ký tự) + phần còn lại toàn số
  const m = cleaned.match(/^(\d{2})([A-Z]{0,2})(\d{4,6})$/);
  if (!m) {
    return {
      error:
        'Biển số không đúng định dạng. Ví dụ hợp lệ: 30K-123.45, 59-X1 234.56, 29A 12345.',
    };
  }
  const provinceCode = m[1];
  const seriesLetters = m[2] ?? '';
  const digitsAfter = m[3];
  // Dãy chính là 5 số cuối (biển mới) hoặc 4 số (biển cũ);
  // nếu dư 1 số sau seri chữ (vd 59-X1 234.56) thì số đó thuộc seri.
  let seriesDigitStr = '';
  let mainStr = digitsAfter;
  if (digitsAfter.length === 6) {
    seriesDigitStr = digitsAfter.slice(0, 1);
    mainStr = digitsAfter.slice(1);
  }
  if (mainStr.length < 4 || mainStr.length > 5) {
    return {
      error:
        'Biển số không đúng định dạng. Ví dụ hợp lệ: 30K-123.45, 59-X1 234.56, 29A 12345.',
    };
  }
  const seriesRaw = seriesLetters + seriesDigitStr;
  const provinceName = PLATE_PROVINCES[provinceCode];

  const series: LetterInfo[] = [];
  const seriesDigits: number[] = [];
  for (const ch of seriesRaw) {
    if (/\d/.test(ch)) seriesDigits.push(Number(ch));
    else {
      const li = letterToNumber(ch);
      if (li) series.push(li);
    }
  }
  const mainDigits = mainStr.split('').map(Number);
  const allDigits = [
    ...provinceCode.split('').map(Number),
    ...seriesDigits,
    ...mainDigits,
  ];

  const displayMain =
    mainStr.length === 5
      ? `${mainStr.slice(0, 3)}.${mainStr.slice(3)}`
      : mainStr;
  return {
    display: `${provinceCode}${seriesRaw ? seriesRaw : ''}-${displayMain}`,
    provinceCode,
    provinceName,
    series,
    seriesRaw,
    mainDigits,
    allDigits,
  };
}

/* ============ CCCD / CMND / Hộ chiếu ============ */

/** Bảng mã tỉnh/thành CCCD theo Thông tư 07/2016/TT-BCA (63 đơn vị). */
export const CCCD_PROVINCES: Record<string, string> = {
  '001': 'Hà Nội',
  '002': 'Hà Giang',
  '004': 'Cao Bằng',
  '006': 'Bắc Kạn',
  '008': 'Tuyên Quang',
  '010': 'Lào Cai',
  '011': 'Điện Biên',
  '012': 'Lai Châu',
  '014': 'Sơn La',
  '015': 'Yên Bái',
  '017': 'Hòa Bình',
  '019': 'Thái Nguyên',
  '020': 'Lạng Sơn',
  '022': 'Quảng Ninh',
  '024': 'Bắc Giang',
  '025': 'Phú Thọ',
  '026': 'Vĩnh Phúc',
  '027': 'Bắc Ninh',
  '030': 'Hải Dương',
  '031': 'Hải Phòng',
  '033': 'Hưng Yên',
  '034': 'Thái Bình',
  '035': 'Hà Nam',
  '036': 'Nam Định',
  '037': 'Ninh Bình',
  '038': 'Thanh Hóa',
  '040': 'Nghệ An',
  '042': 'Hà Tĩnh',
  '044': 'Quảng Bình',
  '045': 'Quảng Trị',
  '046': 'Thừa Thiên Huế',
  '048': 'Đà Nẵng',
  '049': 'Quảng Nam',
  '051': 'Quảng Ngãi',
  '052': 'Bình Định',
  '054': 'Phú Yên',
  '056': 'Khánh Hòa',
  '058': 'Ninh Thuận',
  '060': 'Bình Thuận',
  '062': 'Kon Tum',
  '064': 'Gia Lai',
  '066': 'Đắk Lắk',
  '067': 'Đắk Nông',
  '068': 'Lâm Đồng',
  '070': 'Bình Phước',
  '072': 'Tây Ninh',
  '074': 'Bình Dương',
  '075': 'Đồng Nai',
  '077': 'Bà Rịa – Vũng Tàu',
  '079': 'TP. Hồ Chí Minh',
  '080': 'Long An',
  '082': 'Tiền Giang',
  '083': 'Bến Tre',
  '084': 'Trà Vinh',
  '086': 'Vĩnh Long',
  '087': 'Đồng Tháp',
  '089': 'An Giang',
  '091': 'Kiên Giang',
  '092': 'Cần Thơ',
  '093': 'Hậu Giang',
  '094': 'Sóc Trăng',
  '095': 'Bạc Liêu',
  '096': 'Cà Mau',
};

const GENDER_CENTURY: Record<
  number,
  { gender: 'Nam' | 'Nữ'; centuryLabel: string; centuryBase: number }
> = {
  0: { gender: 'Nam', centuryLabel: 'thế kỷ 20 (1900–1999)', centuryBase: 1900 },
  1: { gender: 'Nữ', centuryLabel: 'thế kỷ 20 (1900–1999)', centuryBase: 1900 },
  2: { gender: 'Nam', centuryLabel: 'thế kỷ 21 (2000–2099)', centuryBase: 2000 },
  3: { gender: 'Nữ', centuryLabel: 'thế kỷ 21 (2000–2099)', centuryBase: 2000 },
  4: { gender: 'Nam', centuryLabel: 'thế kỷ 22 (2100–2199)', centuryBase: 2100 },
  5: { gender: 'Nữ', centuryLabel: 'thế kỷ 22 (2100–2199)', centuryBase: 2100 },
  6: { gender: 'Nam', centuryLabel: 'thế kỷ 23 (2200–2299)', centuryBase: 2200 },
  7: { gender: 'Nữ', centuryLabel: 'thế kỷ 23 (2200–2299)', centuryBase: 2200 },
  8: { gender: 'Nam', centuryLabel: 'thế kỷ 24 (2300–2399)', centuryBase: 2300 },
  9: { gender: 'Nữ', centuryLabel: 'thế kỷ 24 (2300–2399)', centuryBase: 2300 },
};

export type IdDocParse =
  | {
      kind: 'cccd';
      digits: number[];
      provinceCode: string;
      provinceName?: string;
      gender: 'Nam' | 'Nữ';
      centuryLabel: string;
      birthYear: number;
      /** 6 số cuối ngẫu nhiên — phần "riêng nhất" để luận trọng tâm */
      randomSix: number[];
      display: string;
    }
  | { kind: 'cmnd'; digits: number[]; display: string }
  | {
      kind: 'passport';
      digits: number[];
      letters: LetterInfo[];
      display: string;
    };

/** Parse CCCD 12 số / CMND 9 số / hộ chiếu (1–2 chữ + 7 số). */
export function parseIdDoc(raw: string): IdDocParse | { error: string } {
  const cleaned = raw.toUpperCase().replace(/[\s.\-]/g, '');
  if (/^\d{12}$/.test(cleaned)) {
    const digits = cleaned.split('').map(Number);
    const provinceCode = cleaned.slice(0, 3);
    const gc = GENDER_CENTURY[digits[3]];
    const yy = Number(cleaned.slice(4, 6));
    return {
      kind: 'cccd',
      digits,
      provinceCode,
      provinceName: CCCD_PROVINCES[provinceCode],
      gender: gc.gender,
      centuryLabel: gc.centuryLabel,
      birthYear: gc.centuryBase + yy,
      randomSix: digits.slice(6),
      display: cleaned,
    };
  }
  if (/^\d{9}$/.test(cleaned)) {
    return {
      kind: 'cmnd',
      digits: cleaned.split('').map(Number),
      display: cleaned,
    };
  }
  const pm = cleaned.match(/^([A-Z]{1,2})(\d{7,8})$/);
  if (pm) {
    const letters = pm[1]
      .split('')
      .map(letterToNumber)
      .filter(Boolean) as LetterInfo[];
    return {
      kind: 'passport',
      digits: pm[2].split('').map(Number),
      letters,
      display: cleaned,
    };
  }
  return {
    error:
      'Không nhận dạng được. Nhập CCCD 12 số, CMND 9 số hoặc hộ chiếu (chữ + 7 số, VD: C1234567).',
  };
}

/* ============ Thẻ ATM / tín dụng ============ */

/** Thuật toán Luhn (ISO/IEC 7812) — xác thực dãy thẻ nhập đúng. */
export function luhnValid(digits: number[]): boolean {
  if (digits.length < 12) return false;
  let sum = 0;
  const rev = [...digits].reverse();
  for (let i = 0; i < rev.length; i++) {
    let d = rev[i];
    if (i % 2 === 1) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
  }
  return sum % 10 === 0;
}

export interface CardParse {
  digits: number[];
  /** 6 số đầu — BIN ngân hàng (kỹ thuật, không luận vận) */
  bin: string;
  /** phần sau BIN — dãy luận trọng tâm */
  coreDigits: number[];
  last4: string;
  luhnOk: boolean;
  display: string;
}

export function parseCard(raw: string): CardParse | { error: string } {
  const cleaned = raw.replace(/[\s.\-]/g, '');
  if (!/^\d{12,19}$/.test(cleaned)) {
    return {
      error: 'Số thẻ không hợp lệ. Nhập 12–19 chữ số in trên mặt thẻ.',
    };
  }
  const digits = cleaned.split('').map(Number);
  return {
    digits,
    bin: cleaned.slice(0, 6),
    coreDigits: digits.slice(6),
    last4: cleaned.slice(-4),
    luhnOk: luhnValid(digits),
    display: cleaned.replace(/(\d{4})(?=\d)/g, '$1 '),
  };
}

/* ============ Giá bán / giá niêm yết ============ */

export interface MoneyParse {
  amount: number;
  /** toàn bộ chữ số, vd 1990000 → [1,9,9,0,0,0,0] */
  digits: number[];
  /** phần số có nghĩa (bỏ các số 0 cuối), vd 199 → [1,9,9] */
  significantDigits: number[];
  display: string;
}

export function parseMoney(raw: string): MoneyParse | { error: string } {
  const cleaned = raw.replace(/[.,\s]/g, '').replace(/[đdĐD]$/g, '');
  if (!/^\d{2,15}$/.test(cleaned)) {
    return {
      error: 'Giá không hợp lệ. Nhập số tiền, VD: 1.990.000 hoặc 1990000.',
    };
  }
  const amount = Number(cleaned);
  const digits = cleaned.split('').map(Number);
  const sig = cleaned.replace(/0+$/, '');
  return {
    amount,
    digits,
    significantDigits: (sig || '0').split('').map(Number),
    display: amount.toLocaleString('vi-VN') + ' đ',
  };
}

export function formatMoney(amount: number): string {
  return amount.toLocaleString('vi-VN') + ' đ';
}

/* ============ Ngày giờ ============ */

export interface DateDigitsParse {
  digits: number[];
  display: string;
  lunarDisplay: string;
  canChiYear: string;
  solar: { d: number; m: number; y: number; hour?: number };
}

/** Đổi ngày (giờ) thành dãy số ddMMyyyy(+hh) để luận Bát Cực + kèm âm lịch. */
export function dateToDigits(
  d: number,
  m: number,
  y: number,
  hour?: number,
): DateDigitsParse | { error: string } {
  if (
    !Number.isInteger(d) ||
    !Number.isInteger(m) ||
    !Number.isInteger(y) ||
    d < 1 ||
    d > 31 ||
    m < 1 ||
    m > 12 ||
    y < 1900 ||
    y > 2100
  ) {
    return { error: 'Ngày tháng năm không hợp lệ (1900–2100).' };
  }
  const dt = new Date(y, m - 1, d);
  if (dt.getDate() !== d || dt.getMonth() !== m - 1) {
    return { error: `Tháng ${m} không có ngày ${d}.` };
  }
  const dd = String(d).padStart(2, '0');
  const mm = String(m).padStart(2, '0');
  const yyyy = String(y);
  let s = `${dd}${mm}${yyyy}`;
  let display = `${dd}/${mm}/${yyyy}`;
  if (typeof hour === 'number' && hour >= 0 && hour <= 23) {
    s += String(hour).padStart(2, '0');
    display += ` · ${String(hour).padStart(2, '0')}h`;
  }
  const lunar = solarToLunar(d, m, y);
  return {
    digits: s.split('').map(Number),
    display,
    lunarDisplay: formatLunarDate(lunar),
    canChiYear: formatCanChi(yearCanChi(lunar.year)),
    solar: { d, m, y, hour },
  };
}

/* ============ Mask bảo mật ============ */

/**
 * Che dãy số nhạy cảm trước khi đưa vào ngữ cảnh AI:
 * giữ lại `keepLast` số cuối, phần trước thay bằng •.
 */
export function maskDigits(digits: number[], keepLast = 4): string {
  const s = digits.join('');
  if (keepLast <= 0 || s.length <= keepLast) return '•'.repeat(s.length);
  return '•'.repeat(s.length - keepLast) + s.slice(-keepLast);
}

/* ============ Mã số thuế / mã nhân viên ============ */

export interface TaxCodeParse {
  digits: number[];
  /** 10 số gốc */
  base: number[];
  /** 3 số chi nhánh (nếu MST 13 số) */
  branch?: number[];
  display: string;
}

export function parseTaxCode(raw: string): TaxCodeParse | { error: string } {
  const cleaned = raw.replace(/[\s.\-]/g, '');
  if (/^\d{10}$/.test(cleaned)) {
    const digits = cleaned.split('').map(Number);
    return { digits, base: digits, display: cleaned };
  }
  if (/^\d{13}$/.test(cleaned)) {
    const digits = cleaned.split('').map(Number);
    return {
      digits,
      base: digits.slice(0, 10),
      branch: digits.slice(10),
      display: `${cleaned.slice(0, 10)}-${cleaned.slice(10)}`,
    };
  }
  return {
    error: 'Mã số thuế không hợp lệ. MST doanh nghiệp có 10 hoặc 13 chữ số.',
  };
}
