import { astro } from 'iztro';
import { solar2lunar } from 'lunar-lite';

export const IZTRO_LANG = 'vi-VN' as const;

/**
 * Cách chia năm khi lập lá số (iztro yearDivide / horoscopeDivide):
 * - nông lịch (`normal`): mốc mùng 1 Tết âm
 * - tiết khí (`exact`): mốc Lập Xuân
 */
export type YearDivideMethod = 'nong_lich' | 'tiet_khi';

export const YEAR_DIVIDE_OPTIONS: {
  id: YearDivideMethod;
  label: string;
  hint: string;
  iztro: 'normal' | 'exact';
}[] = [
  {
    id: 'nong_lich',
    label: 'Nông lịch',
    hint: 'Chia năm theo mùng 1 Tết âm lịch',
    iztro: 'normal',
  },
  {
    id: 'tiet_khi',
    label: 'Tiết khí',
    hint: 'Chia năm theo tiết Lập Xuân',
    iztro: 'exact',
  },
];

/** 12 giờ địa chi + Tý sớm / Tý muộn (theo iztro). */
export const IZTRO_TIME_SLOTS: { index: number; label: string; range: string }[] =
  [
    { index: 0, label: 'Giờ Tý sớm', range: '00:00–01:00' },
    { index: 1, label: 'Giờ Sửu', range: '01:00–03:00' },
    { index: 2, label: 'Giờ Dần', range: '03:00–05:00' },
    { index: 3, label: 'Giờ Mão', range: '05:00–07:00' },
    { index: 4, label: 'Giờ Thìn', range: '07:00–09:00' },
    { index: 5, label: 'Giờ Tỵ', range: '09:00–11:00' },
    { index: 6, label: 'Giờ Ngọ', range: '11:00–13:00' },
    { index: 7, label: 'Giờ Mùi', range: '13:00–15:00' },
    { index: 8, label: 'Giờ Thân', range: '15:00–17:00' },
    { index: 9, label: 'Giờ Dậu', range: '17:00–19:00' },
    { index: 10, label: 'Giờ Tuất', range: '19:00–21:00' },
    { index: 11, label: 'Giờ Hợi', range: '21:00–23:00' },
    { index: 12, label: 'Giờ Tý muộn', range: '23:00–00:00' },
  ];

/** Thứ tự hiển thị danh sách (không phải vị trí bảng 4×4). */
export const IZTRO_PALACE_ORDER = [
  'Mệnh',
  'Phụ Mẫu',
  'Phúc Đức',
  'Điền Trạch',
  'Quan Lộc',
  'Nô Bộc',
  'Thiên Di',
  'Tật Ách',
  'Tài Bạch',
  'Tử Nữ',
  'Phu Thê',
  'Huynh Đệ',
] as const;

/** Vị trí bảng 4×4 classic theo địa chi (hàng × cột). Ô giữa = null. */
export const BRANCH_BOARD_LAYOUT: (string | null)[][] = [
  ['Tỵ', 'Ngọ', 'Mùi', 'Thân'],
  ['Thìn', null, null, 'Dậu'],
  ['Mão', null, null, 'Tuất'],
  ['Dần', 'Sửu', 'Tý', 'Hợi'],
];

export type HoroscopeScopeKey =
  | 'decadal'
  | 'age'
  | 'yearly'
  | 'monthly'
  | 'daily'
  | 'hourly';

export const HOROSCOPE_SCOPE_LABELS: Record<HoroscopeScopeKey, string> = {
  decadal: 'Đại hạn',
  age: 'Tiểu hạn',
  yearly: 'Lưu niên',
  monthly: 'Lưu nguyệt',
  daily: 'Lưu nhật',
  hourly: 'Lưu thì',
};

export type IztroChartInput = {
  fullName: string;
  calendar: 'solar' | 'lunar';
  year: number;
  month: number;
  day: number;
  timeIndex: number;
  gender: 'nam' | 'nu';
  isLeapMonth?: boolean;
  yearDivide?: YearDivideMethod;
};

export type IztroStarView = {
  name: string;
  mutagen?: string;
  brightness?: string;
  type?: string;
  scope?: string;
};

export type IztroPalaceView = {
  index: number;
  name: string;
  heavenlyStem: string;
  earthlyBranch: string;
  isSoulPalace: boolean;
  isBodyPalace: boolean;
  majorStars: IztroStarView[];
  minorStars: IztroStarView[];
  adjectiveStars: IztroStarView[];
  changsheng12: string;
  boshi12: string;
  jiangqian12: string;
  suiqian12: string;
  decadal: {
    range: [number, number];
    heavenlyStem: string;
    earthlyBranch: string;
  };
  ages: number[];
};

export type IztroChartView = {
  fullName: string;
  gender: string;
  calendar: 'solar' | 'lunar';
  calendarLabel: string;
  yearDivideMethod: YearDivideMethod;
  yearDivideLabel: string;
  solarDate: string;
  lunarDate: string;
  chineseDate: string;
  time: string;
  timeRange: string;
  sign: string;
  zodiac: string;
  fiveElementsClass: string;
  soul: string;
  body: string;
  copyright: string;
  palaces: IztroPalaceView[];
};

export type HoroscopeScopeView = {
  key: HoroscopeScopeKey;
  label: string;
  index: number;
  name: string;
  heavenlyStem: string;
  earthlyBranch: string;
  palaceNames: string[];
  mutagen: string[];
  /** Sao theo index cung bản mệnh (0–11). */
  starsByPalaceIndex: IztroStarView[][];
  focusPalaceName: string;
};

export type IztroHoroscopeView = {
  solarDate: string;
  lunarDate: string;
  timeIndex: number;
  timeLabel: string;
  nominalAge?: number;
  scopes: Record<HoroscopeScopeKey, HoroscopeScopeView>;
};

export type BirthHourCandidate = {
  timeIndex: number;
  timeLabel: string;
  timeRange: string;
  majorStars: string;
  soulPalace: string;
  bodyPalace: string;
  fiveElementsClass: string;
  soul: string;
  body: string;
};

export function formatCanChi(stem: string, branch: string): string {
  const s = (stem || '').trim();
  const b = (branch || '').trim();
  if (!s && !b) return '';
  if (!s) return b;
  if (!b) return s;
  return `${s} ${b}`;
}

export function formatStarLabel(star: IztroStarView): string {
  const bits = [star.name];
  if (star.mutagen) bits.push(`(${star.mutagen})`);
  if (star.brightness) bits.push(star.brightness);
  return bits.join(' ');
}

/** Cung đối + tam hợp theo index vòng iztro (0–11). */
export function relatedPalaceIndexes(index: number): {
  focus: number;
  opposite: number;
  trio: [number, number];
  all: number[];
} {
  const focus = ((index % 12) + 12) % 12;
  const opposite = (focus + 6) % 12;
  const trio: [number, number] = [(focus + 4) % 12, (focus + 8) % 12];
  return {
    focus,
    opposite,
    trio,
    all: [focus, opposite, ...trio],
  };
}

function applyYearDivide(method: YearDivideMethod) {
  const divideOpt =
    YEAR_DIVIDE_OPTIONS.find((o) => o.id === method) ?? YEAR_DIVIDE_OPTIONS[0];
  astro.config({
    yearDivide: divideOpt.iztro,
    horoscopeDivide: divideOpt.iztro,
  });
  return divideOpt;
}

function genderLabel(gender: 'nam' | 'nu') {
  return gender === 'nam' ? 'Nam' : 'Nữ';
}

function dateStrOf(input: Pick<IztroChartInput, 'year' | 'month' | 'day'>) {
  return `${input.year}-${input.month}-${input.day}`;
}

function pad2(n: number) {
  return String(n).padStart(2, '0');
}

/** YYYY-M-D / YYYY-MM-DD → DD/MM/YYYY */
export function formatDateDmy(dateStr: string): string {
  const m = String(dateStr || '')
    .trim()
    .match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (!m) return dateStr;
  return `${pad2(Number(m[3]))}/${pad2(Number(m[2]))}/${m[1]}`;
}

function formatLunarDmy(raw: {
  lunarYear: number;
  lunarMonth: number;
  lunarDay: number;
  isLeap?: boolean;
}): string {
  const leap = raw.isLeap ? ' (nhuận)' : '';
  return `${pad2(raw.lunarDay)}/${pad2(raw.lunarMonth)}/${raw.lunarYear}${leap}`;
}

function mapStar(s: {
  name: string;
  mutagen?: string;
  brightness?: string;
  type?: string;
  scope?: string;
}): IztroStarView {
  return {
    name: s.name,
    mutagen: s.mutagen || undefined,
    brightness: s.brightness || undefined,
    type: s.type,
    scope: s.scope,
  };
}

function createAstrolabe(input: IztroChartInput) {
  const yearDivide = input.yearDivide ?? 'nong_lich';
  const divideOpt = applyYearDivide(yearDivide);
  const dateStr = dateStrOf(input);
  const g = genderLabel(input.gender);

  const astrolabe =
    input.calendar === 'lunar'
      ? astro.byLunar(
          dateStr,
          input.timeIndex,
          g,
          Boolean(input.isLeapMonth),
          true,
          IZTRO_LANG,
        )
      : astro.bySolar(dateStr, input.timeIndex, g, true, IZTRO_LANG);

  return { astrolabe, divideOpt };
}

export function buildIztroChart(input: IztroChartInput): IztroChartView {
  const { astrolabe, divideOpt } = createAstrolabe(input);
  const byName = new Map(astrolabe.palaces.map((p) => [p.name, p]));

  const palaces: IztroPalaceView[] = IZTRO_PALACE_ORDER.map((name) => {
    const p = byName.get(name);
    if (!p) {
      return {
        index: -1,
        name,
        heavenlyStem: '',
        earthlyBranch: '',
        isSoulPalace: name === 'Mệnh',
        isBodyPalace: false,
        majorStars: [],
        minorStars: [],
        adjectiveStars: [],
        changsheng12: '',
        boshi12: '',
        jiangqian12: '',
        suiqian12: '',
        decadal: { range: [0, 0], heavenlyStem: '', earthlyBranch: '' },
        ages: [],
      };
    }
    const range = p.decadal?.range ?? [0, 0];
    return {
      index: p.index,
      name: p.name,
      heavenlyStem: p.heavenlyStem,
      earthlyBranch: p.earthlyBranch,
      isSoulPalace: p.name === 'Mệnh',
      isBodyPalace: Boolean(p.isBodyPalace),
      majorStars: p.majorStars.map(mapStar),
      minorStars: p.minorStars.map(mapStar),
      adjectiveStars: p.adjectiveStars.map(mapStar),
      changsheng12: p.changsheng12 ?? '',
      boshi12: p.boshi12 ?? '',
      jiangqian12: p.jiangqian12 ?? '',
      suiqian12: p.suiqian12 ?? '',
      decadal: {
        range: [range[0] ?? 0, range[1] ?? 0],
        heavenlyStem: p.decadal?.heavenlyStem ?? '',
        earthlyBranch: p.decadal?.earthlyBranch ?? '',
      },
      ages: Array.isArray(p.ages) ? [...p.ages] : [],
    };
  });

  return {
    fullName: input.fullName.trim(),
    gender: astrolabe.gender,
    calendar: input.calendar,
    calendarLabel: input.calendar === 'lunar' ? 'Âm lịch' : 'Dương lịch',
    yearDivideMethod: divideOpt.id,
    yearDivideLabel: divideOpt.label,
    solarDate: formatDateDmy(astrolabe.solarDate),
    lunarDate: formatLunarDmy(astrolabe.rawDates.lunarDate),
    chineseDate: astrolabe.chineseDate,
    time: astrolabe.time,
    timeRange: astrolabe.timeRange,
    sign: astrolabe.sign,
    zodiac: astrolabe.zodiac,
    fiveElementsClass: astrolabe.fiveElementsClass,
    soul: astrolabe.soul,
    body: astrolabe.body,
    copyright: astrolabe.copyright,
    palaces,
  };
}

function mapScope(
  key: HoroscopeScopeKey,
  raw: {
    index: number;
    name: string;
    heavenlyStem: string;
    earthlyBranch: string;
    palaceNames: string[];
    mutagen?: string[];
    stars?: Array<Array<{ name: string; type?: string; scope?: string }>>;
  },
  focusFallbackName = 'Mệnh',
): HoroscopeScopeView {
  const starsByPalaceIndex: IztroStarView[][] = Array.from(
    { length: 12 },
    (_, i) => (raw.stars?.[i] ?? []).map(mapStar),
  );
  const focusPalaceName =
    raw.palaceNames?.[raw.index] ??
    raw.palaceNames?.find((n) => n === focusFallbackName) ??
    raw.palaceNames?.[0] ??
    '';

  return {
    key,
    label: HOROSCOPE_SCOPE_LABELS[key],
    index: raw.index,
    name: raw.name,
    heavenlyStem: raw.heavenlyStem,
    earthlyBranch: raw.earthlyBranch,
    palaceNames: [...(raw.palaceNames ?? [])],
    mutagen: [...(raw.mutagen ?? [])],
    starsByPalaceIndex,
    focusPalaceName,
  };
}

export function buildIztroHoroscope(
  input: IztroChartInput,
  contextDate: string,
  contextTimeIndex: number,
): IztroHoroscopeView {
  const { astrolabe } = createAstrolabe(input);
  const h = astrolabe.horoscope(contextDate, contextTimeIndex);
  const slot =
    IZTRO_TIME_SLOTS.find((s) => s.index === contextTimeIndex) ??
    IZTRO_TIME_SLOTS[0];

  return {
    solarDate: formatDateDmy(h.solarDate),
    lunarDate: formatLunarDmy(solar2lunar(h.solarDate)),
    timeIndex: contextTimeIndex,
    timeLabel: slot.label.replace(/^Giờ\s+/i, 'giờ '),
    nominalAge: h.age?.nominalAge,
    scopes: {
      decadal: mapScope('decadal', h.decadal),
      age: mapScope('age', {
        index: h.age.index,
        name: h.age.name,
        heavenlyStem: h.age.heavenlyStem,
        earthlyBranch: h.age.earthlyBranch,
        palaceNames: h.age.palaceNames,
        mutagen: h.age.mutagen,
        stars: undefined,
      }),
      yearly: mapScope('yearly', h.yearly),
      monthly: mapScope('monthly', h.monthly),
      daily: mapScope('daily', h.daily),
      hourly: mapScope('hourly', h.hourly),
    },
  };
}

export function listBirthHourCandidates(
  input: Omit<IztroChartInput, 'timeIndex' | 'fullName'> & {
    fullName?: string;
  },
): BirthHourCandidate[] {
  const yearDivide = input.yearDivide ?? 'nong_lich';
  applyYearDivide(yearDivide);
  const dateStr = dateStrOf(input);
  const g = genderLabel(input.gender);

  return IZTRO_TIME_SLOTS.map((slot) => {
    const majorRaw =
      input.calendar === 'lunar'
        ? astro.getMajorStarByLunarDate(
            dateStr,
            slot.index,
            Boolean(input.isLeapMonth),
            true,
            IZTRO_LANG,
          )
        : astro.getMajorStarBySolarDate(
            dateStr,
            slot.index,
            true,
            IZTRO_LANG,
          );

    const majorStars = Array.isArray(majorRaw)
      ? majorRaw.join(', ')
      : String(majorRaw ?? '');

    const chart = createAstrolabe({
      ...input,
      fullName: input.fullName ?? '',
      timeIndex: slot.index,
    }).astrolabe;

    const soulPalace = chart.palaces.find((p) => p.name === 'Mệnh');
    const bodyPalace = chart.palaces.find((p) => p.isBodyPalace);

    return {
      timeIndex: slot.index,
      timeLabel: slot.label,
      timeRange: slot.range,
      majorStars,
      soulPalace: soulPalace
        ? `${soulPalace.name} · ${formatCanChi(soulPalace.heavenlyStem, soulPalace.earthlyBranch)}`
        : 'Mệnh',
      bodyPalace: bodyPalace
        ? `${bodyPalace.name} · ${formatCanChi(bodyPalace.heavenlyStem, bodyPalace.earthlyBranch)}`
        : '',
      fiveElementsClass: chart.fiveElementsClass,
      soul: chart.soul,
      body: chart.body,
    };
  });
}

export function todayDateInputValue(d = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** Map giờ đồng hồ → timeIndex iztro (0 Tý sớm … 12 Tý muộn). */
export function timeIndexFromClock(d = new Date()): number {
  const h = d.getHours();
  if (h < 1) return 0;
  if (h < 3) return 1;
  if (h < 5) return 2;
  if (h < 7) return 3;
  if (h < 9) return 4;
  if (h < 11) return 5;
  if (h < 13) return 6;
  if (h < 15) return 7;
  if (h < 17) return 8;
  if (h < 19) return 9;
  if (h < 21) return 10;
  if (h < 23) return 11;
  return 12;
}

/** Ngày hôm nay + khung giờ địa chi theo giờ hiện tại. */
export function nowContextValue(d = new Date()): {
  date: string;
  timeIndex: number;
} {
  return {
    date: todayDateInputValue(d),
    timeIndex: timeIndexFromClock(d),
  };
}

export function shiftDateInput(
  value: string,
  delta: { years?: number; months?: number; days?: number },
): string {
  const [y, m, d] = value.split('-').map(Number);
  const dt = new Date(y, (m || 1) - 1, d || 1);
  if (delta.years) dt.setFullYear(dt.getFullYear() + delta.years);
  if (delta.months) dt.setMonth(dt.getMonth() + delta.months);
  if (delta.days) dt.setDate(dt.getDate() + delta.days);
  return todayDateInputValue(dt);
}

export function shiftTimeIndex(index: number, delta: number): number {
  // 0..12 vòng (13 khung)
  return (((index + delta) % 13) + 13) % 13;
}
