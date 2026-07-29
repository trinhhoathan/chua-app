/**
 * Hướng xuất hành theo ngày — dựa trên nhật lịch lunar-typescript
 * (Hỷ / Phúc / Tài / Quý nhân · Sát · Thái Tuế · nên/kiêng xuất hành).
 */

import {
  getAlmanacDay,
  todayParts,
  type AlmanacDay,
  type AlmanacHour,
  type DayLuck,
} from './lunar-almanac';
import type { Verdict } from './rules';

export type TravelPurpose = 'le_chua' | 'cong_viec' | 'chung';

export interface DirectionTip {
  key: string;
  label: string;
  direction: string;
  tone: 'good' | 'caution' | 'avoid';
  hint: string;
}

export interface TravelHour {
  chi: string;
  ganZhi: string;
  range: string;
  luck: DayLuck;
  luckLabel: string;
  daoType: string;
  recommendsTravel: boolean;
}

export interface XuatHanhResult {
  solarLabel: string;
  lunarLabel: string;
  weekLabel: string;
  dayCanChi: string;
  daoType: string;
  luck: DayLuck;
  luckLabel: string;
  /** Xuất hành có trong nhật lịch nên / kiêng */
  travelInYi: boolean;
  travelInJi: boolean;
  verdict: Verdict;
  verdictLabel: string;
  verdictDetail: string;
  /** Hướng nên đi (ưu tiên theo mục đích) */
  prefer: DirectionTip[];
  /** Hướng nên tránh */
  avoid: DirectionTip[];
  /** Tất cả phương vị tham khảo */
  positions: DirectionTip[];
  goodHours: TravelHour[];
  purposeHint: string;
}

const TRAVEL_RE = /xuất\s*hành/i;

function hasTravel(items: string[]): boolean {
  return items.some((t) => TRAVEL_RE.test(t));
}

function hourRecommendsTravel(h: AlmanacHour): boolean {
  return h.yi.some((t) => TRAVEL_RE.test(t)) && !h.ji.some((t) => TRAVEL_RE.test(t));
}

function verdictForDay(day: AlmanacDay): {
  verdict: Verdict;
  verdictLabel: string;
  verdictDetail: string;
} {
  const inYi = hasTravel(day.yi);
  const inJi = hasTravel(day.ji);

  if (inYi && !inJi) {
    return {
      verdict: 'good',
      verdictLabel: 'Nên xuất hành',
      verdictDetail:
        'Nhật lịch hôm nay có “Xuất hành” trong mục nên làm. Chọn hướng Hỷ / Phúc / Tài và giờ Hoàng đạo bên dưới.',
    };
  }
  if (inJi && !inYi) {
    return {
      verdict: 'bad',
      verdictLabel: 'Kiêng xuất hành',
      verdictDetail:
        'Nhật lịch kiêng xuất hành. Việc hệ trọng nên dời ngày; đi lễ gần hoặc việc bắt buộc thì tránh hướng Sát / Thái Tuế và chọn giờ Hoàng đạo.',
    };
  }
  if (day.luck === 'good') {
    return {
      verdict: 'caution',
      verdictLabel: 'Có thể đi — chọn hướng',
      verdictDetail:
        'Ngày Hoàng đạo / tốt, nhưng nhật lịch không nhấn mạnh xuất hành. Nên đi theo Hỷ thần hoặc Phúc thần, tránh hướng Sát.',
    };
  }
  if (day.luck === 'bad') {
    return {
      verdict: 'caution',
      verdictLabel: 'Cân nhắc xuất hành',
      verdictDetail:
        'Ngày Hắc đạo / xấu. Chỉ đi khi cần; ưu tiên hướng Quý nhân / Hỷ thần, tránh Sát và Thái Tuế ngày.',
    };
  }
  return {
    verdict: 'caution',
    verdictLabel: 'Trung bình',
    verdictDetail:
      'Ngày trung bình. Chọn hướng cát và giờ Hoàng đạo; việc lớn nên hỏi thêm trụ trì.',
  };
}

function purposeHint(purpose: TravelPurpose): string {
  if (purpose === 'le_chua') {
    return 'Đi lễ / vào chùa: ưu tiên hướng Phúc thần và Hỷ thần; tránh hướng Sát khi bước ra khỏi nhà.';
  }
  if (purpose === 'cong_viec') {
    return 'Công việc / cầu tài: ưu tiên hướng Tài thần và Dương quý (quý nhân); tránh hướng Sát.';
  }
  return 'Xuất hành chung: ưu tiên Hỷ thần; việc lành thêm Phúc thần, việc làm thêm Tài thần.';
}

function buildPositions(day: AlmanacDay): DirectionTip[] {
  return [
    {
      key: 'xi',
      label: 'Hỷ thần',
      direction: day.positionXi,
      tone: 'good',
      hint: 'Hướng vui vẻ — tốt cho đi lễ, thăm hỏi, việc lành.',
    },
    {
      key: 'fu',
      label: 'Phúc thần',
      direction: day.positionFu,
      tone: 'good',
      hint: 'Hướng phúc thọ — hợp Phật tử đi chùa, cầu an.',
    },
    {
      key: 'cai',
      label: 'Tài thần',
      direction: day.positionCai,
      tone: 'good',
      hint: 'Hướng tài lộc — hợp công việc, giao dịch, cầu tài.',
    },
    {
      key: 'yang_gui',
      label: 'Dương quý',
      direction: day.positionYangGui,
      tone: 'good',
      hint: 'Quý nhân ban ngày — gặp người giúp đỡ, việc công.',
    },
    {
      key: 'yin_gui',
      label: 'Âm quý',
      direction: day.positionYinGui,
      tone: 'good',
      hint: 'Quý nhân ban đêm / việc âm — hỗ trợ kín đáo.',
    },
    {
      key: 'sha',
      label: 'Hướng sát',
      direction: day.sha,
      tone: 'avoid',
      hint: 'Nên tránh xuất phát hoặc đi lâu về hướng này.',
    },
    {
      key: 'tai_sui_day',
      label: 'Thái Tuế ngày',
      direction: day.positionTaiSuiDay,
      tone: 'caution',
      hint: 'Tránh xung đối Thái Tuế ngày khi xuất hành.',
    },
  ];
}

function preferForPurpose(
  positions: DirectionTip[],
  purpose: TravelPurpose,
): DirectionTip[] {
  const byKey = (k: string) => positions.find((p) => p.key === k)!;
  if (purpose === 'le_chua') {
    return [byKey('fu'), byKey('xi'), byKey('yang_gui')];
  }
  if (purpose === 'cong_viec') {
    return [byKey('cai'), byKey('yang_gui'), byKey('xi')];
  }
  return [byKey('xi'), byKey('fu'), byKey('cai')];
}

export function getXuatHanh(
  year: number,
  month: number,
  day: number,
  purpose: TravelPurpose = 'chung',
): XuatHanhResult {
  const almanac = getAlmanacDay(year, month, day);
  const { verdict, verdictLabel, verdictDetail } = verdictForDay(almanac);
  const positions = buildPositions(almanac);
  const prefer = preferForPurpose(positions, purpose);
  const avoid = positions.filter((p) => p.tone !== 'good');

  const goodHours: TravelHour[] = almanac.hours
    .filter((h) => h.luck === 'good' || hourRecommendsTravel(h))
    .map((h) => ({
      chi: h.chi,
      ganZhi: h.ganZhi,
      range: h.range,
      luck: h.luck,
      luckLabel: h.luckLabel,
      daoType: h.daoType,
      recommendsTravel: hourRecommendsTravel(h),
    }));

  return {
    solarLabel: `${almanac.solarDay}/${almanac.solarMonth}/${almanac.solarYear}`,
    lunarLabel: almanac.lunarLabel,
    weekLabel: almanac.weekLabel,
    dayCanChi: almanac.dayCanChi,
    daoType: almanac.daoType,
    luck: almanac.luck,
    luckLabel: almanac.luckLabel,
    travelInYi: hasTravel(almanac.yi),
    travelInJi: hasTravel(almanac.ji),
    verdict,
    verdictLabel,
    verdictDetail,
    prefer,
    avoid,
    positions,
    goodHours,
    purposeHint: purposeHint(purpose),
  };
}

export { todayParts };
