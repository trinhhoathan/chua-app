/**
 * Nạp âm · Ngũ hành tứ trụ — kết hợp lunar-typescript (bát tự, nạp âm)
 * và iztro (ngũ hành cục, chủ mệnh / chủ thân).
 */

import { Lunar, LunarUtil, Solar } from 'lunar-typescript';
import { viGanZhi, viTerm } from './lunar-zh-vi';
import {
  YEAR_DIVIDE_OPTIONS,
  buildIztroChart,
  type IztroChartInput,
  type YearDivideMethod,
} from './iztro-chart';

export type NguHanh = 'Kim' | 'Mộc' | 'Thủy' | 'Hỏa' | 'Thổ';

export const NGU_HANH_ORDER: NguHanh[] = ['Kim', 'Mộc', 'Thủy', 'Hỏa', 'Thổ'];

export const NGU_HANH_COLOR: Record<NguHanh, string> = {
  Kim: '#8a8f98',
  Mộc: '#1B6B3A',
  Thủy: '#2F6FE0',
  Hỏa: '#C44A1F',
  Thổ: '#9a6b2f',
};

/** Kim sinh Thủy … */
export const SINH: Record<NguHanh, NguHanh> = {
  Kim: 'Thủy',
  Thủy: 'Mộc',
  Mộc: 'Hỏa',
  Hỏa: 'Thổ',
  Thổ: 'Kim',
};

/** Kim khắc Mộc … */
export const KHAC: Record<NguHanh, NguHanh> = {
  Kim: 'Mộc',
  Mộc: 'Thổ',
  Thổ: 'Thủy',
  Thủy: 'Hỏa',
  Hỏa: 'Kim',
};

/** Quan hệ ngũ hành a → b. */
export function nguHanhRelation(a: NguHanh, b: NguHanh): string {
  if (a === b) return 'tỵ hòa (cùng hành)';
  if (SINH[a] === b) return `${a} sinh ${b}`;
  if (SINH[b] === a) return `${b} sinh ${a}`;
  if (KHAC[a] === b) return `${a} khắc ${b}`;
  return `${b} khắc ${a}`;
}

/** Ý nghĩa dân gian 30 nạp âm. */
export const NAP_AM_MEANING: Record<string, string> = {
  'Hải Trung Kim': 'Vàng trong đáy biển — quý khí ẩn tàng, cần thời cơ để lộ sáng.',
  'Lô Trung Hỏa': 'Lửa trong lò — sức nóng hun đúc, hợp rèn giũa nên nghiệp.',
  'Đại Lâm Mộc': 'Cây rừng lớn — tán rộng che người, càng vững khi có đất dày.',
  'Lộ Bàng Thổ': 'Đất ven đường — nuôi vạn vật đi qua, bền bỉ chịu nắng mưa.',
  'Kiếm Phong Kim': 'Vàng mũi kiếm — sắc bén cứng cỏi, gặp lửa tôi luyện càng quý.',
  'Sơn Đầu Hỏa': 'Lửa đầu núi — sáng rực từ xa, cần củi gió thuận để bền ngọn.',
  'Giản Hạ Thủy': 'Nước khe suối — len lỏi bền bỉ, tụ dần thành dòng lớn.',
  'Thành Đầu Thổ': 'Đất đầu thành — nền móng thành quách, chắc chắn đáng nương tựa.',
  'Bạch Lạp Kim': 'Vàng chân đèn — mềm sáng thanh nhã, cần khéo giữ mới bền.',
  'Dương Liễu Mộc': 'Gỗ cây dương liễu — mềm dẻo thuận gió, sống nhờ nước tưới.',
  'Tuyền Trung Thủy': 'Nước giữa suối nguồn — trong lành tươi mới, chảy mãi không cạn.',
  'Ốc Thượng Thổ': 'Đất trên mái nhà — che chở gia trạch, an ổn hướng nội.',
  'Tích Lịch Hỏa': 'Lửa sấm sét — bùng phát mạnh mẽ, biến hóa khó lường.',
  'Tùng Bách Mộc': 'Gỗ tùng bách — chịu rét ngạo sương, tiết tháo kiên cường.',
  'Trường Lưu Thủy': 'Nước sông dài — chảy xa không dứt, bao dung mà thâm trầm.',
  'Sa Trung Kim': 'Vàng trong cát — phải đãi lọc công phu mới thấy giá trị.',
  'Sơn Hạ Hỏa': 'Lửa chân núi — ấm áp gần người, giữ được lâu nhờ khiêm hòa.',
  'Bình Địa Mộc': 'Cây đồng bằng — mọc nơi bằng phẳng, cần che chắn lúc gió lớn.',
  'Bích Thượng Thổ': 'Đất trên vách — tô điểm che chắn, hợp việc tề gia giữ nếp.',
  'Kim Bạc Kim': 'Vàng dát mỏng — hào quang trang sức, đẹp ở sự tinh xảo.',
  'Phúc Đăng Hỏa': 'Lửa đèn dầu — soi sáng trong đêm, quý ở chỗ bền lâu ấm áp.',
  'Thiên Hà Thủy': 'Nước sông Ngân — mưa móc từ trời, ân trạch rộng khắp.',
  'Đại Dịch Thổ': 'Đất trạm lớn — đất dày chở vật, giao thông tụ hội.',
  'Thoa Xuyến Kim': 'Vàng trâm xuyến — quý khí tinh tế, gắn với duyên và lộc.',
  'Tang Chá Mộc': 'Gỗ dâu tằm — nuôi tằm dệt lụa, cần mẫn sinh lợi.',
  'Đại Khê Thủy': 'Nước khe lớn — dòng xiết mạnh mẽ, thuận thế thì thành sông.',
  'Sa Trung Thổ': 'Đất trong cát — tơi xốp dễ chuyển, cần bồi đắp mới vững.',
  'Thiên Thượng Hỏa': 'Lửa trên trời (mặt trời) — quang minh chính đại, soi khắp muôn nơi.',
  'Thạch Lựu Mộc': 'Gỗ cây thạch lựu — hoa đỏ trái ngọt, càng cuối mùa càng quý.',
  'Đại Hải Thủy': 'Nước biển lớn — mênh mông thâm hậu, dung nạp trăm sông.',
};

export type TruName = 'Năm' | 'Tháng' | 'Ngày' | 'Giờ';

export type TruView = {
  tru: TruName;
  canChi: string;
  /** Ngũ hành của can và chi, vd "Mộc · Hỏa". */
  nguHanhCan: NguHanh;
  nguHanhChi: NguHanh;
  napAm: string;
  napAmHanh: NguHanh;
  napAmMeaning: string;
};

export type NapAmNguHanhView = {
  fullName: string;
  gender: string;
  solarDate: string;
  lunarDate: string;
  timeLabel: string;
  yearDivideMethod: YearDivideMethod;
  yearDivideLabel: string;
  trus: TruView[];
  /** Mệnh nạp âm (trụ năm). */
  menhNapAm: string;
  menhNapAmHanh: NguHanh;
  menhNapAmMeaning: string;
  /** Nhật chủ = can ngày. */
  nhatChu: string;
  nhatChuHanh: NguHanh;
  /** Đếm ngũ hành trên 8 chữ (4 can + 4 chi). */
  counts: Record<NguHanh, number>;
  vuong: NguHanh[];
  khuyet: NguHanh[];
  /** Quan hệ nạp âm giữa các trụ liền kề + năm–ngày. */
  napAmRelations: { label: string; relation: string }[];
  /** Từ iztro. */
  fiveElementsClass: string;
  soul: string;
  body: string;
};

export const CAN_HANH: Record<string, NguHanh> = {
  Giáp: 'Mộc',
  Ất: 'Mộc',
  Bính: 'Hỏa',
  Đinh: 'Hỏa',
  Mậu: 'Thổ',
  Kỷ: 'Thổ',
  Canh: 'Kim',
  Tân: 'Kim',
  Nhâm: 'Thủy',
  Quý: 'Thủy',
};

export const CHI_HANH: Record<string, NguHanh> = {
  Tý: 'Thủy',
  Sửu: 'Thổ',
  Dần: 'Mộc',
  Mão: 'Mộc',
  Thìn: 'Thổ',
  Tỵ: 'Hỏa',
  Ngọ: 'Hỏa',
  Mùi: 'Thổ',
  Thân: 'Kim',
  Dậu: 'Kim',
  Tuất: 'Thổ',
  Hợi: 'Thủy',
};

function napAmHanhOf(name: string): NguHanh {
  const last = name.trim().split(/\s+/).pop() || '';
  return (NGU_HANH_ORDER.find((h) => h === last) ?? 'Thổ') as NguHanh;
}

/** Giờ đại diện của timeIndex iztro (0 = Tý sớm … 12 = Tý muộn). */
function hourOfTimeIndex(timeIndex: number): number {
  if (timeIndex <= 0) return 0;
  if (timeIndex >= 12) return 23;
  return timeIndex * 2;
}

const TRU_NAMES: TruName[] = ['Năm', 'Tháng', 'Ngày', 'Giờ'];

function naYinOfZhGanZhi(zh: string): string {
  const raw = (LunarUtil.NAYIN as Record<string, string>)[zh] ?? '';
  return viTerm(raw);
}

/** Dựng Lunar từ input chung (dùng lại cho Hà Lạc, dụng thần…). */
export function lunarFromChartInput(input: IztroChartInput): Lunar {
  const hour = hourOfTimeIndex(input.timeIndex);
  return input.calendar === 'lunar'
    ? Lunar.fromYmdHms(
        input.year,
        input.isLeapMonth ? -input.month : input.month,
        input.day,
        hour,
        30,
        0,
      )
    : Solar.fromYmdHms(input.year, input.month, input.day, hour, 30, 0)
        .getLunar();
}

/**
 * Lấy 4 can chi Hán theo cách chia năm:
 * - tiết khí: năm/tháng Exact (Lập Xuân + tiết, có giờ) — chuẩn EightChar
 * - nông lịch: năm theo Tết âm; tháng theo tiết (không xét giờ Exact)
 */
export function baZiZhByDivide(
  lunar: Lunar,
  yearDivide: YearDivideMethod,
): string[] {
  const day = lunar.getDayInGanZhiExact2();
  const time = lunar.getTimeInGanZhi();
  if (yearDivide === 'tiet_khi') {
    return [
      lunar.getYearInGanZhiExact(),
      lunar.getMonthInGanZhiExact(),
      day,
      time,
    ];
  }
  return [
    lunar.getYearInGanZhi(),
    lunar.getMonthInGanZhi(),
    day,
    time,
  ];
}

export function buildNapAmNguHanh(input: IztroChartInput): NapAmNguHanhView {
  const yearDivide = input.yearDivide ?? 'nong_lich';
  const divideOpt =
    YEAR_DIVIDE_OPTIONS.find((o) => o.id === yearDivide) ??
    YEAR_DIVIDE_OPTIONS[0];

  const lunar = lunarFromChartInput(input);
  const baZiZh = baZiZhByDivide(lunar, yearDivide);
  const baZi = baZiZh.map(viGanZhi);
  const napAms = baZiZh.map(naYinOfZhGanZhi);

  const trus: TruView[] = TRU_NAMES.map((tru, i) => {
    const canChi = baZi[i] ?? '';
    const [can = '', chi = ''] = canChi.split(/\s+/);
    const napAm = napAms[i] ?? '';
    return {
      tru,
      canChi,
      nguHanhCan: CAN_HANH[can] ?? 'Thổ',
      nguHanhChi: CHI_HANH[chi] ?? 'Thổ',
      napAm,
      napAmHanh: napAmHanhOf(napAm),
      napAmMeaning: NAP_AM_MEANING[napAm] ?? '',
    };
  });

  const counts: Record<NguHanh, number> = {
    Kim: 0,
    Mộc: 0,
    Thủy: 0,
    Hỏa: 0,
    Thổ: 0,
  };
  for (const t of trus) {
    counts[t.nguHanhCan] += 1;
    counts[t.nguHanhChi] += 1;
  }
  const max = Math.max(...NGU_HANH_ORDER.map((h) => counts[h]));
  const vuong = NGU_HANH_ORDER.filter((h) => counts[h] === max && max >= 3);
  const khuyet = NGU_HANH_ORDER.filter((h) => counts[h] === 0);

  const [nam, thang, ngay, gio] = trus;
  const napAmRelations = [
    {
      label: `Năm (${nam.napAm}) ↔ Tháng (${thang.napAm})`,
      relation: nguHanhRelation(nam.napAmHanh, thang.napAmHanh),
    },
    {
      label: `Tháng (${thang.napAm}) ↔ Ngày (${ngay.napAm})`,
      relation: nguHanhRelation(thang.napAmHanh, ngay.napAmHanh),
    },
    {
      label: `Ngày (${ngay.napAm}) ↔ Giờ (${gio.napAm})`,
      relation: nguHanhRelation(ngay.napAmHanh, gio.napAmHanh),
    },
    {
      label: `Năm (${nam.napAm}) ↔ Ngày (${ngay.napAm})`,
      relation: nguHanhRelation(nam.napAmHanh, ngay.napAmHanh),
    },
  ];

  const chart = buildIztroChart(input);
  const nhatChu = ngay.canChi.split(/\s+/)[0] ?? '';

  return {
    fullName: chart.fullName,
    gender: chart.gender,
    solarDate: chart.solarDate,
    lunarDate: chart.lunarDate,
    timeLabel: chart.time,
    yearDivideMethod: divideOpt.id,
    yearDivideLabel: divideOpt.label,
    trus,
    menhNapAm: nam.napAm,
    menhNapAmHanh: nam.napAmHanh,
    menhNapAmMeaning: nam.napAmMeaning,
    nhatChu,
    nhatChuHanh: CAN_HANH[nhatChu] ?? 'Thổ',
    counts,
    vuong,
    khuyet,
    napAmRelations,
    fiveElementsClass: chart.fiveElementsClass,
    soul: chart.soul,
    body: chart.body,
  };
}

/** Ngữ cảnh gọn cho AI — chỉ nạp âm & ngũ hành, không dump lá số. */
export function buildNapAmPromptContext(v: NapAmNguHanhView): string {
  const parts: string[] = [
    '# DỮ LIỆU NẠP ÂM · NGŨ HÀNH TỨ TRỤ',
    '',
    '## Người xem',
    `- Họ tên: ${v.fullName}`,
    `- Giới tính: ${v.gender}`,
    `- Sinh: dương ${v.solarDate} · âm ${v.lunarDate} · ${v.timeLabel}`,
    `- Cách chia năm: ${v.yearDivideLabel}${
      v.yearDivideMethod === 'tiet_khi'
        ? ' (năm theo Lập Xuân, tháng theo tiết khí — có giờ)'
        : ' (năm theo Tết âm, tháng theo tiết — không xét giờ Exact)'
    }`,
    '',
    '## Tứ trụ (can chi · ngũ hành can/chi · nạp âm)',
    ...v.trus.map(
      (t) =>
        `- Trụ ${t.tru}: ${t.canChi} · can ${t.nguHanhCan}, chi ${t.nguHanhChi} · nạp âm ${t.napAm} (hành ${t.napAmHanh})${
          t.napAmMeaning ? ` — ${t.napAmMeaning}` : ''
        }`,
    ),
    '',
    '## Mệnh nạp âm (trụ năm)',
    `- ${v.menhNapAm} — hành ${v.menhNapAmHanh}`,
    v.menhNapAmMeaning ? `- Ý nghĩa: ${v.menhNapAmMeaning}` : '',
    '',
    '## Nhật chủ (can ngày)',
    `- ${v.nhatChu} — hành ${v.nhatChuHanh}`,
    '',
    '## Thống kê ngũ hành trên 8 chữ (4 can + 4 chi)',
    ...NGU_HANH_ORDER.map((h) => `- ${h}: ${v.counts[h]}`),
    v.vuong.length ? `- Vượng: ${v.vuong.join(', ')}` : '',
    v.khuyet.length
      ? `- Khuyết (thiếu hẳn): ${v.khuyet.join(', ')}`
      : '- Không khuyết hành nào.',
    '',
    '## Quan hệ nạp âm giữa các trụ',
    ...v.napAmRelations.map((r) => `- ${r.label}: ${r.relation}`),
    '',
    '## Tham chiếu Tử Vi (iztro)',
    `- Ngũ hành cục: ${v.fiveElementsClass}`,
    `- Chủ mệnh: ${v.soul} · Chủ thân: ${v.body}`,
  ];

  return parts.filter(Boolean).join('\n');
}
