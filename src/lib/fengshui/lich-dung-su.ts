/**
 * Lịch dụng sự — gợi ý ngày tốt / xấu theo việc (yi · ji từ lunar-typescript).
 */

import {
  getAlmanacDay,
  todayParts,
  type AlmanacDay,
  type DayLuck,
} from './lunar-almanac';
import type { Verdict } from './rules';

export type DungSuCategory =
  | 'cuoi_hoi'
  | 'xay_dung'
  | 'nha_cua'
  | 'kinh_doanh'
  | 'le_phat'
  | 'gia_dinh'
  | 'tang_le';

export interface DungSuActivity {
  id: string;
  /** Nhãn khớp (hoặc gần) mục nên / kiêng trong nhật lịch */
  label: string;
  /** Các biến thể khớp thêm (nếu có) */
  aliases?: string[];
  category: DungSuCategory;
  hint: string;
}

export const DUNG_SU_CATEGORY_LABELS: Record<DungSuCategory, string> = {
  cuoi_hoi: 'Cưới hỏi',
  xay_dung: 'Xây dựng',
  nha_cua: 'Nhà cửa',
  kinh_doanh: 'Kinh doanh',
  le_phat: 'Lễ · Phật sự',
  gia_dinh: 'Gia đình',
  tang_le: 'Tang lễ',
};

/** Việc thường dùng tại chùa / đời sống — khớp nhãn Việt hóa nhật lịch */
export const DUNG_SU_ACTIVITIES: DungSuActivity[] = [
  {
    id: 'cuoi-hoi',
    label: 'Cưới hỏi',
    category: 'cuoi_hoi',
    hint: 'Lễ cưới, thành hôn.',
  },
  {
    id: 'dinh-uoc',
    label: 'Đính ước',
    category: 'cuoi_hoi',
    hint: 'Đính hôn, hỏi cưới.',
  },
  {
    id: 'nap-thai',
    label: 'Nạp thái',
    category: 'cuoi_hoi',
    hint: 'Lễ nạp thái / dẫn lễ.',
  },
  {
    id: 'dong-tho',
    label: 'Động thổ',
    category: 'xay_dung',
    hint: 'Khởi công, động thổ.',
  },
  {
    id: 'pha-tho',
    label: 'Phá thổ',
    category: 'xay_dung',
    hint: 'Đào đất, phá nền.',
  },
  {
    id: 'khoi-nen',
    label: 'Khởi nền',
    category: 'xay_dung',
    hint: 'Đổ móng, khởi nền.',
  },
  {
    id: 'dung-cot',
    label: 'Dựng cột',
    category: 'xay_dung',
    hint: 'Dựng cột nhà.',
  },
  {
    id: 'thuong-luong',
    label: 'Thượng lương',
    category: 'xay_dung',
    hint: 'Lễ thượng lương.',
  },
  {
    id: 'lop-nha',
    label: 'Lợp nhà',
    category: 'xay_dung',
    hint: 'Lợp mái.',
  },
  {
    id: 'tu-tao',
    label: 'Tu tạo',
    category: 'xay_dung',
    hint: 'Sửa chữa, tu tạo nhà cửa.',
  },
  {
    id: 'thao-do',
    label: 'Tháo dỡ',
    category: 'xay_dung',
    hint: 'Tháo dỡ công trình.',
  },
  {
    id: 'nhap-trach',
    label: 'Nhập trạch',
    category: 'nha_cua',
    hint: 'Về nhà mới.',
  },
  {
    id: 'di-chuyen-nha',
    label: 'Di chuyển nhà',
    category: 'nha_cua',
    hint: 'Chuyển nhà, dọn đi.',
  },
  {
    id: 'an-giuong',
    label: 'An giường',
    category: 'nha_cua',
    hint: 'Kê giường, an giường.',
  },
  {
    id: 'lam-bep',
    label: 'Làm bếp',
    category: 'nha_cua',
    hint: 'Làm / sửa bếp.',
  },
  {
    id: 'an-cua',
    label: 'An cửa',
    category: 'nha_cua',
    hint: 'Lắp cửa chính.',
  },
  {
    id: 'khai-truong',
    label: 'Khai trương',
    category: 'kinh_doanh',
    hint: 'Khai trương cửa hàng / công ty.',
  },
  {
    id: 'giao-dich',
    label: 'Giao dịch',
    category: 'kinh_doanh',
    hint: 'Giao dịch, mua bán.',
  },
  {
    id: 'lap-khe',
    label: 'Lập khế',
    category: 'kinh_doanh',
    hint: 'Ký hợp đồng, lập khế.',
  },
  {
    id: 'nap-tai',
    label: 'Nạp tài',
    category: 'kinh_doanh',
    hint: 'Nhận tài, nhập của.',
  },
  {
    id: 'treo-bien',
    label: 'Treo biển',
    category: 'kinh_doanh',
    hint: 'Treo biển hiệu.',
  },
  {
    id: 'xuat-hang',
    label: 'Xuất hàng / tiền',
    aliases: ['Xuất hàng/ tiền'],
    category: 'kinh_doanh',
    hint: 'Xuất hàng, chi tiền lớn.',
  },
  {
    id: 'te-tu',
    label: 'Tế tự',
    category: 'le_phat',
    hint: 'Cúng tế, lễ tại gia / chùa.',
  },
  {
    id: 'cau-phuc',
    label: 'Cầu phúc',
    category: 'le_phat',
    hint: 'Cầu an, cầu phúc.',
  },
  {
    id: 'trai-giao',
    label: 'Trai giáo',
    category: 'le_phat',
    hint: 'Lễ trai giáo / khoa nghi.',
  },
  {
    id: 'khai-quang',
    label: 'Khai quang',
    category: 'le_phat',
    hint: 'Khai quang tượng Phật.',
  },
  {
    id: 'an-huong',
    label: 'An hương',
    category: 'le_phat',
    hint: 'An hương bàn thờ.',
  },
  {
    id: 'xuat-hoa',
    label: 'Xuất hỏa',
    category: 'le_phat',
    hint: 'Xuất hỏa / rước lửa bàn thờ.',
  },
  {
    id: 'pho-do',
    label: 'Phổ độ',
    category: 'le_phat',
    hint: 'Lễ phổ độ, cầu siêu.',
  },
  {
    id: 'xuat-hanh',
    label: 'Xuất hành',
    category: 'gia_dinh',
    hint: 'Đi xa, khởi hành.',
  },
  {
    id: 'nhap-hoc',
    label: 'Nhập học',
    category: 'gia_dinh',
    hint: 'Nhập học, khai bút.',
  },
  {
    id: 'hop-mat',
    label: 'Họp mặt thân hữu',
    category: 'gia_dinh',
    hint: 'Họp mặt, đãi khách.',
  },
  {
    id: 'cau-tu',
    label: 'Cầu tự',
    category: 'gia_dinh',
    hint: 'Cầu con.',
  },
  {
    id: 'chua-benh',
    label: 'Chữa bệnh',
    category: 'gia_dinh',
    hint: 'Khám / chữa bệnh.',
  },
  {
    id: 'an-tang',
    label: 'An táng',
    category: 'tang_le',
    hint: 'An táng, mai táng.',
  },
  {
    id: 'nhap-liem',
    label: 'Nhập liệm',
    category: 'tang_le',
    hint: 'Nhập liệm.',
  },
  {
    id: 'sua-mo',
    label: 'Sửa mộ',
    category: 'tang_le',
    hint: 'Sửa sang mộ phần.',
  },
  {
    id: 'dung-bia',
    label: 'Dựng bia',
    category: 'tang_le',
    hint: 'Dựng bia mộ.',
  },
];

export interface DayActivityCheck {
  solarYear: number;
  solarMonth: number;
  solarDay: number;
  lunarLabel: string;
  weekLabel: string;
  dayCanChi: string;
  daoType: string;
  luck: DayLuck;
  luckLabel: string;
  inYi: boolean;
  inJi: boolean;
  verdict: Verdict;
  verdictLabel: string;
  detail: string;
  yi: string[];
  ji: string[];
}

function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFC')
    .replace(/\s*\/\s*/g, '/')
    .replace(/\s+/g, ' ')
    .trim();
}

function matchesActivity(text: string, activity: DungSuActivity): boolean {
  const n = normalize(text);
  const candidates = [activity.label, ...(activity.aliases ?? [])].map(normalize);
  return candidates.some((c) => n === c || n.includes(c) || c.includes(n));
}

function listHas(items: string[], activity: DungSuActivity): boolean {
  return items.some((t) => matchesActivity(t, activity));
}

function verdictFrom(
  inYi: boolean,
  inJi: boolean,
  luck: DayLuck,
  activityLabel: string,
): { verdict: Verdict; verdictLabel: string; detail: string } {
  if (inYi && !inJi) {
    return {
      verdict: 'good',
      verdictLabel: `Nên · ${activityLabel}`,
      detail: `Nhật lịch có “${activityLabel}” trong mục nên làm. Phù hợp chọn ngày này (kết hợp Hoàng đạo càng tốt).`,
    };
  }
  if (inJi && !inYi) {
    return {
      verdict: 'bad',
      verdictLabel: `Kiêng · ${activityLabel}`,
      detail: `Nhật lịch kiêng “${activityLabel}”. Nên chọn ngày khác.`,
    };
  }
  if (inYi && inJi) {
    return {
      verdict: 'caution',
      verdictLabel: 'Mâu thuẫn nhật lịch',
      detail: `Cùng lúc xuất hiện trong nên và kiêng — hiếm gặp; nên hỏi thêm trụ trì / thầy.`,
    };
  }
  if (luck === 'good') {
    return {
      verdict: 'caution',
      verdictLabel: 'Không nêu rõ — ngày tốt',
      detail: `Ngày Hoàng đạo / tốt nhưng nhật lịch không nhắc “${activityLabel}”. Có thể cân nhắc nếu việc không hệ trọng.`,
    };
  }
  if (luck === 'bad') {
    return {
      verdict: 'bad',
      verdictLabel: 'Không nêu rõ — ngày xấu',
      detail: `Ngày Hắc đạo / xấu và không có “${activityLabel}” trong nên làm. Nên tránh.`,
    };
  }
  return {
    verdict: 'caution',
    verdictLabel: 'Trung bình',
    detail: `Nhật lịch không nêu “${activityLabel}”. Việc lớn nên chọn ngày có trong mục nên làm.`,
  };
}

export function getActivity(id: string): DungSuActivity | undefined {
  return DUNG_SU_ACTIVITIES.find((a) => a.id === id);
}

export function checkDungSuDay(
  year: number,
  month: number,
  day: number,
  activity: DungSuActivity,
): DayActivityCheck {
  const almanac = getAlmanacDay(year, month, day);
  return checkFromAlmanac(almanac, activity);
}

function checkFromAlmanac(
  almanac: AlmanacDay,
  activity: DungSuActivity,
): DayActivityCheck {
  const inYi = listHas(almanac.yi, activity);
  const inJi = listHas(almanac.ji, activity);
  const { verdict, verdictLabel, detail } = verdictFrom(
    inYi,
    inJi,
    almanac.luck,
    activity.label,
  );

  return {
    solarYear: almanac.solarYear,
    solarMonth: almanac.solarMonth,
    solarDay: almanac.solarDay,
    lunarLabel: almanac.lunarLabel,
    weekLabel: almanac.weekLabel,
    dayCanChi: almanac.dayCanChi,
    daoType: almanac.daoType,
    luck: almanac.luck,
    luckLabel: almanac.luckLabel,
    inYi,
    inJi,
    verdict,
    verdictLabel,
    detail,
    yi: almanac.yi,
    ji: almanac.ji,
  };
}

export interface MonthDayCell {
  solarYear: number;
  solarMonth: number;
  solarDay: number;
  inMonth: boolean;
  lunarDay: number;
  check: DayActivityCheck | null;
}

/** Quét cả tháng dương lịch cho một việc */
export function scanDungSuMonth(
  year: number,
  month: number,
  activity: DungSuActivity,
): {
  cells: MonthDayCell[];
  goodDays: DayActivityCheck[];
  badDays: DayActivityCheck[];
} {
  const daysInMonth = new Date(year, month, 0).getDate();
  const firstWeek = new Date(year, month - 1, 1).getDay(); // 0=CN
  const lead = (firstWeek + 6) % 7; // Monday-first

  const cells: MonthDayCell[] = [];
  const goodDays: DayActivityCheck[] = [];
  const badDays: DayActivityCheck[] = [];

  const pushDay = (y: number, m: number, d: number, inMonth: boolean) => {
    const almanac = getAlmanacDay(y, m, d);
    const check = inMonth ? checkFromAlmanac(almanac, activity) : null;
    if (check?.verdict === 'good') goodDays.push(check);
    if (check?.verdict === 'bad' && check.inJi) badDays.push(check);
    cells.push({
      solarYear: y,
      solarMonth: m,
      solarDay: d,
      inMonth,
      lunarDay: almanac.lunarDay,
      check,
    });
  };

  // Leading days from previous month
  for (let i = lead; i > 0; i--) {
    const dt = new Date(year, month - 1, 1 - i);
    pushDay(dt.getFullYear(), dt.getMonth() + 1, dt.getDate(), false);
  }

  for (let d = 1; d <= daysInMonth; d++) {
    pushDay(year, month, d, true);
  }

  while (cells.length % 7 !== 0) {
    const last = cells[cells.length - 1];
    const dt = new Date(last.solarYear, last.solarMonth - 1, last.solarDay + 1);
    pushDay(dt.getFullYear(), dt.getMonth() + 1, dt.getDate(), false);
  }

  return { cells, goodDays, badDays };
}

export function activitiesByCategory(): {
  category: DungSuCategory;
  label: string;
  activities: DungSuActivity[];
}[] {
  const order: DungSuCategory[] = [
    'le_phat',
    'cuoi_hoi',
    'xay_dung',
    'nha_cua',
    'kinh_doanh',
    'gia_dinh',
    'tang_le',
  ];
  return order.map((category) => ({
    category,
    label: DUNG_SU_CATEGORY_LABELS[category],
    activities: DUNG_SU_ACTIVITIES.filter((a) => a.category === category),
  }));
}

export { todayParts };
