/**
 * Gamification → chuyển đổi thỉnh nước.
 * Dùng CustomEvent để mở form WaterStickyBar từ mọi module.
 */

export const OPEN_WATER_DONATE_EVENT = 'chua:open-water-donate';
export const WATER_NUDGE_EVENT = 'chua:water-merit-nudge';
export const WATER_BAR_PULSE_EVENT = 'chua:water-bar-pulse';

export type WaterNudgeSource = 'go_mo' | 'xin_xam' | 'milestone_108';

export function openWaterDonateForm(opts?: {
  note?: string;
  qty?: number;
}) {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(
    new CustomEvent(OPEN_WATER_DONATE_EVENT, {
      detail: opts ?? {},
    }),
  );
}

export function pulseWaterBar() {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(WATER_BAR_PULSE_EVENT));
}

export function emitWaterNudge(source: WaterNudgeSource) {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(
    new CustomEvent(WATER_NUDGE_EVENT, { detail: { source } }),
  );
}

function todayKey() {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Ho_Chi_Minh',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
}

/** Đã hiện popup 108 hôm nay chưa? */
export function hasShown108Modal(templeId: string): boolean {
  try {
    return (
      localStorage.getItem(`water-prompt:108:${templeId}:${todayKey()}`) === '1'
    );
  } catch {
    return false;
  }
}

export function markShown108Modal(templeId: string) {
  try {
    localStorage.setItem(`water-prompt:108:${templeId}:${todayKey()}`, '1');
  } catch {
    /* ignore */
  }
}

/** Nudge mềm — ẩn tối đa đến hết ngày nếu user đóng. */
export function isNudgeDismissed(templeId: string, source: WaterNudgeSource) {
  try {
    return (
      localStorage.getItem(
        `water-nudge:dismiss:${source}:${templeId}:${todayKey()}`,
      ) === '1'
    );
  } catch {
    return false;
  }
}

export function dismissNudge(templeId: string, source: WaterNudgeSource) {
  try {
    localStorage.setItem(
      `water-nudge:dismiss:${source}:${templeId}:${todayKey()}`,
      '1',
    );
  } catch {
    /* ignore */
  }
}
