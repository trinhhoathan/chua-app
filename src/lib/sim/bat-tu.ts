/**
 * Cá nhân hóa điểm sim theo Bát Tự: từ ngày–giờ sinh tính dụng thần ngũ hành
 * (engine sẵn có src/lib/fengshui/dung-than.ts, chạy trên lunar-typescript +
 * iztro), rồi đối chiếu với hành của sim và mục tiêu người mua
 * (tài vận / sự nghiệp / sức khỏe / may mắn / phúc lộc).
 */

import { buildDungThan, type DungThanView } from '@/lib/fengshui/dung-than';
import type { NguHanh } from '@/lib/fengshui/nap-am-ngu-hanh';
import { SINH } from '@/lib/fengshui/nap-am-ngu-hanh';
import type { SimElement, SimListing } from '@/types/database';

/* ------------------------------------------------------------------ */
/* Hồ sơ sinh (URL param ⇄ object)                                     */
/* ------------------------------------------------------------------ */

export interface SimBirthProfile {
  /** yyyy-mm-dd */
  date: string;
  /** 0–23, undefined nếu không rõ giờ */
  hour?: number;
  gender: 'nam' | 'nu';
  calendar: 'solar' | 'lunar';
}

export type SimGoal =
  | 'tai_van'
  | 'su_nghiep'
  | 'suc_khoe'
  | 'may_man'
  | 'phuc_loc';

export const SIM_GOALS: Array<{ id: SimGoal; label: string; hint: string }> = [
  { id: 'tai_van', label: 'Tài vận', hint: 'Chiêu tài – giữ tiền' },
  { id: 'su_nghiep', label: 'Sự nghiệp', hint: 'Công danh – thăng tiến' },
  { id: 'suc_khoe', label: 'Sức khỏe', hint: 'Bình an – khang kiện' },
  { id: 'may_man', label: 'May mắn', hint: 'Quý nhân – cát khí' },
  { id: 'phuc_loc', label: 'Phúc lộc', hint: 'Gia đạo – hưởng phúc' },
];

const GOAL_ASPECT_WEIGHTS: Record<SimGoal, Record<string, number>> = {
  tai_van: { tai_loc: 0.7, su_nghiep: 0.3 },
  su_nghiep: { su_nghiep: 0.7, quy_nhan: 0.3 },
  suc_khoe: { suc_khoe: 0.8, tinh_cam: 0.2 },
  may_man: { quy_nhan: 0.7, tai_loc: 0.3 },
  phuc_loc: { tinh_cam: 0.4, suc_khoe: 0.3, tai_loc: 0.3 },
};

export function parseBirthParams(sp: {
  ns?: string;
  gio?: string;
  gt?: string;
  lich?: string;
}): SimBirthProfile | null {
  const date = (sp.ns ?? '').trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return null;
  const year = Number(date.slice(0, 4));
  if (year < 1920 || year > 2026) return null;
  const hourRaw = Number(sp.gio);
  const hour =
    sp.gio != null && sp.gio !== '' && Number.isInteger(hourRaw) && hourRaw >= 0 && hourRaw <= 23
      ? hourRaw
      : undefined;
  return {
    date,
    hour,
    gender: sp.gt === 'nu' ? 'nu' : 'nam',
    calendar: sp.lich === 'am' ? 'lunar' : 'solar',
  };
}

export function birthParamsToQuery(profile: SimBirthProfile): URLSearchParams {
  const params = new URLSearchParams();
  params.set('ns', profile.date);
  if (profile.hour != null) params.set('gio', String(profile.hour));
  params.set('gt', profile.gender);
  if (profile.calendar === 'lunar') params.set('lich', 'am');
  return params;
}

/* ------------------------------------------------------------------ */
/* Dụng thần từ hồ sơ sinh                                             */
/* ------------------------------------------------------------------ */

/** Giờ 0–23 → timeIndex iztro (0 Tý sớm … 12 Tý muộn). */
function hourToTimeIndex(hour?: number): number {
  if (hour == null) return 6; // không rõ giờ — mặc định Ngọ, ít lệch dụng thần
  if (hour === 0) return 0;
  if (hour === 23) return 12;
  return Math.floor((hour + 1) / 2);
}

export function buildSimDungThan(
  profile: SimBirthProfile,
): DungThanView | null {
  const [y, m, d] = profile.date.split('-').map(Number);
  if (!y || !m || !d) return null;
  try {
    return buildDungThan({
      fullName: 'Quý khách',
      calendar: profile.calendar,
      year: y,
      month: m,
      day: d,
      timeIndex: hourToTimeIndex(profile.hour),
      gender: profile.gender,
    });
  } catch {
    return null;
  }
}

/* ------------------------------------------------------------------ */
/* Đối chiếu hành sim ↔ dụng thần                                      */
/* ------------------------------------------------------------------ */

const SIM_ELEMENT_TO_NGU_HANH: Record<SimElement, NguHanh> = {
  kim: 'Kim',
  moc: 'Mộc',
  thuy: 'Thủy',
  hoa: 'Hỏa',
  tho: 'Thổ',
};

export const NGU_HANH_TO_SIM_ELEMENT: Record<NguHanh, SimElement> = {
  Kim: 'kim',
  Mộc: 'moc',
  Thủy: 'thuy',
  Hỏa: 'hoa',
  Thổ: 'tho',
};

export interface MenhFit {
  score: number;
  label: string;
  detail: string;
}

/** Mức hợp giữa hành sim và dụng thần / hỷ thần / kỵ thần của mệnh chủ. */
export function menhFitOfSim(
  simElement: SimElement,
  v: DungThanView,
): MenhFit {
  const simHanh = SIM_ELEMENT_TO_NGU_HANH[simElement];

  if (simHanh === v.dungThan) {
    return {
      score: 100,
      label: 'Đại cát — trúng dụng thần',
      detail: `Sim mang hành ${simHanh}, trùng dụng thần ${v.dungThan} của mệnh chủ — bổ đúng chỗ khuyết, kích vận mạnh nhất.`,
    };
  }
  if (v.hyThan.includes(simHanh)) {
    return {
      score: 86,
      label: 'Cát — trúng hỷ thần',
      detail: `Sim mang hành ${simHanh}, thuộc hỷ thần của mệnh chủ — trợ lực tốt cho dụng thần ${v.dungThan}.`,
    };
  }
  if (SINH[simHanh] === v.dungThan) {
    return {
      score: 78,
      label: 'Khá — sinh trợ dụng thần',
      detail: `Hành ${simHanh} của sim tương sinh cho dụng thần ${v.dungThan} — gián tiếp nâng đỡ bản mệnh.`,
    };
  }
  if (v.kyThan.includes(simHanh)) {
    return {
      score: 40,
      label: 'Kỵ — phạm kỵ thần',
      detail: `Sim mang hành ${simHanh}, thuộc kỵ thần của mệnh chủ — nên cân nhắc chọn sim hành ${v.dungThan} hoặc ${v.hyThan.join(', ')}.`,
    };
  }
  return {
    score: 62,
    label: 'Bình hòa',
    detail: `Hành ${simHanh} của sim không xung không trợ rõ rệt với dụng thần ${v.dungThan} — dùng được, không kích không phá.`,
  };
}

export interface PersonalSimScore {
  matchPercent: number;
  menhFit: MenhFit;
  goalScore: number;
  goal: SimGoal;
}

/**
 * Điểm hợp cá nhân của một sim (0–99%):
 * 45% điểm phong thủy gốc + 35% hợp dụng thần + 20% phương diện mục tiêu.
 */
export function personalizeSimScore(
  sim: Pick<SimListing, 'element' | 'overall_score' | 'aspects'>,
  v: DungThanView,
  goal: SimGoal = 'tai_van',
): PersonalSimScore {
  const fit = menhFitOfSim(sim.element, v);

  const weights = GOAL_ASPECT_WEIGHTS[goal];
  let goalScore = 0;
  let totalW = 0;
  for (const [aspect, w] of Object.entries(weights)) {
    const s = Number(sim.aspects?.[aspect] ?? 60);
    goalScore += s * w;
    totalW += w;
  }
  goalScore = totalW > 0 ? Math.round(goalScore / totalW) : 60;

  const raw =
    sim.overall_score * 0.45 + fit.score * 0.35 + goalScore * 0.2;
  const matchPercent = Math.max(5, Math.min(99, Math.round(raw)));

  return { matchPercent, menhFit: fit, goalScore, goal };
}

export function goalLabel(goal: SimGoal): string {
  return SIM_GOALS.find((g) => g.id === goal)?.label ?? 'Tài vận';
}

export function parseGoal(raw?: string): SimGoal {
  const found = SIM_GOALS.find((g) => g.id === raw);
  return found ? found.id : 'tai_van';
}
