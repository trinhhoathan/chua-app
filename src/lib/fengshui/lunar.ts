/**
 * Vietnamese lunar calendar utilities.
 * Port of Ho Ngoc Duc's algorithm (public domain) —
 * https://www.informatik.uni-leipzig.de/~duc/amlich/
 *
 * Timezone offset for Vietnam = +7.
 */

const TIMEZONE = 7;

function INT(d: number): number {
  return Math.floor(d);
}

function jdFromDate(dd: number, mm: number, yy: number): number {
  const a = INT((14 - mm) / 12);
  const y = yy + 4800 - a;
  const m = mm + 12 * a - 3;
  let jd =
    dd +
    INT((153 * m + 2) / 5) +
    365 * y +
    INT(y / 4) -
    INT(y / 100) +
    INT(y / 400) -
    32045;
  if (jd < 2299161) {
    jd = dd + INT((153 * m + 2) / 5) + 365 * y + INT(y / 4) - 32083;
  }
  return jd;
}

function jdToDate(jd: number): [number, number, number] {
  let a: number, b: number, c: number;
  if (jd > 2299160) {
    a = jd + 32044;
    b = INT((4 * a + 3) / 146097);
    c = a - INT((146097 * b) / 4);
  } else {
    b = 0;
    c = jd + 32082;
  }
  const d = INT((4 * c + 3) / 1461);
  const e = c - INT((1461 * d) / 4);
  const m = INT((5 * e + 2) / 153);
  const day = e - INT((153 * m + 2) / 5) + 1;
  const month = m + 3 - 12 * INT(m / 10);
  const year = b * 100 + d - 4800 + INT(m / 10);
  return [day, month, year];
}

function getNewMoonDay(k: number, timeZone: number): number {
  const T = k / 1236.85;
  const T2 = T * T;
  const T3 = T2 * T;
  const dr = Math.PI / 180;
  let Jd1 =
    2415020.75933 +
    29.53058868 * k +
    0.0001178 * T2 -
    0.000000155 * T3;
  Jd1 =
    Jd1 +
    0.00033 *
      Math.sin((166.56 + 132.87 * T - 0.009173 * T2) * dr);
  const M = 359.2242 + 29.10535608 * k - 0.0000333 * T2 - 0.00000347 * T3;
  const Mpr = 306.0253 + 385.81691806 * k + 0.0107306 * T2 + 0.00001236 * T3;
  const F = 21.2964 + 390.67050646 * k - 0.0016528 * T2 - 0.00000239 * T3;
  let C1 =
    (0.1734 - 0.000393 * T) * Math.sin(M * dr) +
    0.0021 * Math.sin(2 * dr * M);
  C1 = C1 - 0.4068 * Math.sin(Mpr * dr) + 0.0161 * Math.sin(dr * 2 * Mpr);
  C1 = C1 - 0.0004 * Math.sin(dr * 3 * Mpr);
  C1 =
    C1 +
    0.0104 * Math.sin(dr * 2 * F) -
    0.0051 * Math.sin(dr * (M + Mpr));
  C1 =
    C1 -
    0.0074 * Math.sin(dr * (M - Mpr)) +
    0.0004 * Math.sin(dr * (2 * F + M));
  C1 =
    C1 -
    0.0004 * Math.sin(dr * (2 * F - M)) -
    0.0006 * Math.sin(dr * (2 * F + Mpr));
  C1 =
    C1 +
    0.001 * Math.sin(dr * (2 * F - Mpr)) +
    0.0005 * Math.sin(dr * (2 * Mpr + M));
  let deltat: number;
  if (T < -11) {
    deltat = 0.001 + 0.000839 * T + 0.0002261 * T2 - 0.00000845 * T3 - 0.000000081 * T * T3;
  } else {
    deltat = -0.000278 + 0.000265 * T + 0.000262 * T2;
  }
  const JdNew = Jd1 + C1 - deltat;
  return INT(JdNew + 0.5 + timeZone / 24);
}

function getSunLongitude(jdn: number, timeZone: number): number {
  const T = (jdn - 2451545.5 - timeZone / 24) / 36525;
  const T2 = T * T;
  const dr = Math.PI / 180;
  const M = 357.5291 + 35999.0503 * T - 0.0001559 * T2 - 0.00000048 * T * T2;
  const L0 = 280.46645 + 36000.76983 * T + 0.0003032 * T2;
  let DL =
    (1.9146 - 0.004817 * T - 0.000014 * T2) * Math.sin(dr * M);
  DL =
    DL +
    (0.019993 - 0.000101 * T) * Math.sin(dr * 2 * M) +
    0.00029 * Math.sin(dr * 3 * M);
  let L = L0 + DL;
  L = L * dr;
  L = L - Math.PI * 2 * INT(L / (Math.PI * 2));
  return INT((L / Math.PI) * 6);
}

function getLunarMonth11(yy: number, timeZone: number): number {
  const off = jdFromDate(31, 12, yy) - 2415021;
  const k = INT(off / 29.530588853);
  let nm = getNewMoonDay(k, timeZone);
  const sunLong = getSunLongitude(nm, timeZone);
  if (sunLong >= 9) {
    nm = getNewMoonDay(k - 1, timeZone);
  }
  return nm;
}

function getLeapMonthOffset(a11: number, timeZone: number): number {
  const k = INT((a11 - 2415021.076998695) / 29.530588853 + 0.5);
  let last = 0;
  let i = 1;
  let arc = getSunLongitude(getNewMoonDay(k + i, timeZone), timeZone);
  do {
    last = arc;
    i++;
    arc = getSunLongitude(getNewMoonDay(k + i, timeZone), timeZone);
  } while (arc !== last && i < 14);
  return i - 1;
}

export interface LunarDate {
  day: number;
  month: number;
  year: number;
  leap: boolean;
  jd: number;
}

export function solarToLunar(
  dd: number,
  mm: number,
  yy: number,
): LunarDate {
  const dayNumber = jdFromDate(dd, mm, yy);
  const k = INT((dayNumber - 2415021.076998695) / 29.530588853);
  let monthStart = getNewMoonDay(k + 1, TIMEZONE);
  if (monthStart > dayNumber) {
    monthStart = getNewMoonDay(k, TIMEZONE);
  }
  let a11 = getLunarMonth11(yy, TIMEZONE);
  let b11 = a11;
  let lunarYear: number;
  if (a11 >= monthStart) {
    lunarYear = yy;
    a11 = getLunarMonth11(yy - 1, TIMEZONE);
  } else {
    lunarYear = yy + 1;
    b11 = getLunarMonth11(yy + 1, TIMEZONE);
  }
  const lunarDay = dayNumber - monthStart + 1;
  const diff = INT((monthStart - a11) / 29);
  let lunarLeap = false;
  let lunarMonth = diff + 11;
  if (b11 - a11 > 365) {
    const leapMonthDiff = getLeapMonthOffset(a11, TIMEZONE);
    if (diff >= leapMonthDiff) {
      lunarMonth = diff + 10;
      if (diff === leapMonthDiff) {
        lunarLeap = true;
      }
    }
  }
  if (lunarMonth > 12) {
    lunarMonth = lunarMonth - 12;
  }
  if (lunarMonth >= 11 && diff < 4) {
    lunarYear = lunarYear - 1;
  }
  return {
    day: lunarDay,
    month: lunarMonth,
    year: lunarYear,
    leap: lunarLeap,
    jd: dayNumber,
  };
}

export const CAN = [
  'Giáp',
  'Ất',
  'Bính',
  'Đinh',
  'Mậu',
  'Kỷ',
  'Canh',
  'Tân',
  'Nhâm',
  'Quý',
] as const;
export const CHI = [
  'Tý',
  'Sửu',
  'Dần',
  'Mão',
  'Thìn',
  'Tỵ',
  'Ngọ',
  'Mùi',
  'Thân',
  'Dậu',
  'Tuất',
  'Hợi',
] as const;

export type Can = (typeof CAN)[number];
export type Chi = (typeof CHI)[number];

export function yearCanChi(lunarYear: number): { can: Can; chi: Chi } {
  const canIdx = ((lunarYear + 6) % 10 + 10) % 10;
  const chiIdx = ((lunarYear + 8) % 12 + 12) % 12;
  return { can: CAN[canIdx], chi: CHI[chiIdx] };
}

export function dayCanChi(jd: number): { can: Can; chi: Chi } {
  const canIdx = ((jd + 9) % 10 + 10) % 10;
  const chiIdx = ((jd + 1) % 12 + 12) % 12;
  return { can: CAN[canIdx], chi: CHI[chiIdx] };
}

/**
 * Giờ địa chi (canh giờ VN): 23h–1h Tý, 1–3 Sửu, …
 */
export function hourCanChi(
  hour: number,
  dayCan: Can,
): { can: Can; chi: Chi } {
  const h = ((hour % 24) + 24) % 24;
  const chiIdx = Math.floor(((h + 1) % 24) / 2);
  const dayCanIdx = CAN.indexOf(dayCan);
  // Giờ Tý can = (dayCanIdx % 5) * 2
  const firstHourCan = (dayCanIdx % 5) * 2;
  const canIdx = (firstHourCan + chiIdx) % 10;
  return { can: CAN[canIdx], chi: CHI[chiIdx] };
}

export function hourBranchLabel(hour: number): string {
  const h = ((hour % 24) + 24) % 24;
  const chiIdx = Math.floor(((h + 1) % 24) / 2);
  const ranges = [
    '23–1h',
    '1–3h',
    '3–5h',
    '5–7h',
    '7–9h',
    '9–11h',
    '11–13h',
    '13–15h',
    '15–17h',
    '17–19h',
    '19–21h',
    '21–23h',
  ];
  return `${CHI[chiIdx]} (${ranges[chiIdx]})`;
}

export function monthCanChiFromYear(
  lunarYear: number,
  lunarMonth: number,
): { can: Can; chi: Chi } {
  const yearCanIdx = ((lunarYear + 6) % 10 + 10) % 10;
  const firstMonthCanIdx = (yearCanIdx * 2 + 2) % 10;
  const canIdx = (firstMonthCanIdx + (lunarMonth - 1)) % 10;
  const chiIdx = (lunarMonth + 1) % 12;
  return { can: CAN[canIdx], chi: CHI[chiIdx] };
}

export function formatLunarDate(l: LunarDate): string {
  const suffix = l.leap ? ' nhuận' : '';
  return `${l.day}/${l.month}${suffix}/${l.year} (ÂL)`;
}

export function formatCanChi(cc: { can: Can; chi: Chi }): string {
  return `${cc.can} ${cc.chi}`;
}

/**
 * Vietnamese "tuổi mụ" (nominal age) = current lunar year - birth lunar year + 1.
 */
export function tuoiMu(
  birthYear: number,
  referenceYear: number = new Date().getFullYear(),
): number {
  return referenceYear - birthYear + 1;
}

/**
 * Âm → dương (Ho Ngọc Đức). Trả null nếu ngày ÂL không hợp lệ.
 */
export function lunarToSolar(
  lunarDay: number,
  lunarMonth: number,
  lunarYear: number,
  lunarLeap = false,
): { day: number; month: number; year: number } | null {
  let a11: number;
  let b11: number;
  if (lunarMonth < 11) {
    a11 = getLunarMonth11(lunarYear - 1, TIMEZONE);
    b11 = getLunarMonth11(lunarYear, TIMEZONE);
  } else {
    a11 = getLunarMonth11(lunarYear, TIMEZONE);
    b11 = getLunarMonth11(lunarYear + 1, TIMEZONE);
  }
  const k = INT(0.5 + (a11 - 2415021.076998695) / 29.530588853);
  let off = lunarMonth - 11;
  if (off < 0) off += 12;
  if (b11 - a11 > 365) {
    const leapOff = getLeapMonthOffset(a11, TIMEZONE);
    let leapMonth = leapOff - 2;
    if (leapMonth < 0) leapMonth += 12;
    if (lunarLeap && lunarMonth !== leapMonth) {
      return null;
    }
    if (lunarLeap || off >= leapOff) {
      off += 1;
    }
  }
  const monthStart = getNewMoonDay(k + off, TIMEZONE);
  const [day, month, year] = jdToDate(monthStart + lunarDay - 1);
  if (day < 1 || month < 1) return null;
  return { day, month, year };
}

const HOUR_RANGES = [
  '23–1h',
  '1–3h',
  '3–5h',
  '5–7h',
  '7–9h',
  '9–11h',
  '11–13h',
  '13–15h',
  '15–17h',
  '17–19h',
  '19–21h',
  '21–23h',
] as const;

/** Giờ Hoàng đạo theo chi ngày (bảng dân gian phổ biến VN). */
const HOANG_DAO_BY_DAY_CHI: Record<Chi, readonly Chi[]> = {
  Tý: ['Dần', 'Mão', 'Thìn', 'Tỵ', 'Thân', 'Dậu'],
  Ngọ: ['Dần', 'Mão', 'Thìn', 'Tỵ', 'Thân', 'Dậu'],
  Sửu: ['Tý', 'Dần', 'Mão', 'Ngọ', 'Thân', 'Tuất'],
  Mùi: ['Tý', 'Dần', 'Mão', 'Ngọ', 'Thân', 'Tuất'],
  Dần: ['Tý', 'Sửu', 'Thìn', 'Tỵ', 'Mùi', 'Tuất'],
  Thân: ['Tý', 'Sửu', 'Thìn', 'Tỵ', 'Mùi', 'Tuất'],
  Mão: ['Tý', 'Dần', 'Mão', 'Ngọ', 'Mùi', 'Dậu'],
  Dậu: ['Tý', 'Dần', 'Mão', 'Ngọ', 'Mùi', 'Dậu'],
  Thìn: ['Sửu', 'Dần', 'Thìn', 'Ngọ', 'Thân', 'Dậu'],
  Tuất: ['Sửu', 'Dần', 'Thìn', 'Ngọ', 'Thân', 'Dậu'],
  Tỵ: ['Dần', 'Thìn', 'Tỵ', 'Thân', 'Dậu', 'Hợi'],
  Hợi: ['Dần', 'Thìn', 'Tỵ', 'Thân', 'Dậu', 'Hợi'],
};

export interface HourSlot {
  chi: Chi;
  range: string;
  hoangDao: boolean;
}

export function hoursForDayChi(dayChi: Chi): HourSlot[] {
  const good = new Set(HOANG_DAO_BY_DAY_CHI[dayChi]);
  return CHI.map((chi, i) => ({
    chi,
    range: HOUR_RANGES[i],
    hoangDao: good.has(chi),
  }));
}

export function hoangDaoHours(dayChi: Chi): HourSlot[] {
  return hoursForDayChi(dayChi).filter((h) => h.hoangDao);
}
