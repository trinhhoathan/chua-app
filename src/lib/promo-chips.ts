/**
 * Điều phối chip nổi Thỉnh nước / Sim — không spam khi vừa load.
 *
 * Quy tắc (site chùa):
 * 1. Không hiện ngay trang đầu; ưu tiên chip nước (trái) sau khi khách đã xem vài trang
 *    hoặc dùng dịch vụ (phong thủy, gõ mõ…).
 * 2. Chỉ một chip promo tại một thời điểm.
 * 3. Chip Sim (phải) chỉ sau khi nước đã đóng + (quan tâm /sim hoặc đủ pageview)
 *    và có khoảng nghỉ — không nhảy liên tục.
 */

export type PromoSlot = 'none' | 'water' | 'sim';

const KEYS = {
  pageViews: 'promo-page-views',
  paths: 'promo-paths-seen',
  waterDismissed: 'promo-water-dismissed',
  simDismissed: 'promo-sim-dismissed',
  engaged: 'promo-engaged',
  simInterest: 'promo-sim-interest',
  waterClosedAt: 'promo-water-closed-at',
  lastShown: 'promo-last-slot',
} as const;

/** Số trang tối thiểu trước khi gợi ý thỉnh nước (không tính trang đầu). */
export const WATER_MIN_PAGE_VIEWS = 2;
/** Delay sau khi đủ điều kiện nước (ms). */
export const WATER_DELAY_MS = 10_000;
/** Delay ngắn hơn nếu đã dùng dịch vụ / tư vấn. */
export const WATER_ENGAGED_DELAY_MS = 5_000;

/** Sim: sau khi đóng nước, chờ ít nhất X ms. */
export const SIM_COOLDOWN_AFTER_WATER_MS = 75_000;
/** Sim: cần đủ page view nếu chưa vào /sim. */
export const SIM_MIN_PAGE_VIEWS = 4;
/** Delay hiện sim sau khi đủ điều kiện. */
export const SIM_DELAY_MS = 8_000;
/** Site Lý Gia (chỉ sim): tối thiểu page view. */
export const SIM_ONLY_MIN_PAGE_VIEWS = 2;
export const SIM_ONLY_DELAY_MS = 12_000;

const SERVICE_PREFIXES = [
  '/phong-thuy',
  '/go-mo',
  '/so-cau',
  '/phat-hoc',
  '/thu-nhan-nuoc',
];

function ssGet(key: string): string | null {
  try {
    return sessionStorage.getItem(key);
  } catch {
    return null;
  }
}

function ssSet(key: string, value: string): void {
  try {
    sessionStorage.setItem(key, value);
  } catch {
    /* ignore */
  }
}

export function isWaterPromoDismissed(): boolean {
  return ssGet(KEYS.waterDismissed) === '1';
}

export function isSimPromoDismissed(): boolean {
  return ssGet(KEYS.simDismissed) === '1';
}

export function dismissWaterPromo(): void {
  ssSet(KEYS.waterDismissed, '1');
  ssSet(KEYS.waterClosedAt, String(Date.now()));
}

export function dismissSimPromo(): void {
  ssSet(KEYS.simDismissed, '1');
}

export function markPromoEngaged(): void {
  ssSet(KEYS.engaged, '1');
}

export function markSimInterest(): void {
  ssSet(KEYS.simInterest, '1');
}

export function isPromoEngaged(): boolean {
  return ssGet(KEYS.engaged) === '1';
}

export function hasSimInterest(): boolean {
  return ssGet(KEYS.simInterest) === '1';
}

export function getPromoPageViews(): number {
  const n = Number(ssGet(KEYS.pageViews) || '0');
  return Number.isFinite(n) ? n : 0;
}

/** Gọi mỗi lần đổi pathname — đếm page view + gắn cờ quan tâm. */
export function trackPromoPath(pathname: string): {
  pageViews: number;
  engaged: boolean;
  simInterest: boolean;
} {
  const pathsRaw = ssGet(KEYS.paths);
  let paths: string[] = [];
  try {
    paths = pathsRaw ? (JSON.parse(pathsRaw) as string[]) : [];
  } catch {
    paths = [];
  }
  if (!paths.includes(pathname)) {
    paths.push(pathname);
    ssSet(KEYS.paths, JSON.stringify(paths.slice(-40)));
    ssSet(KEYS.pageViews, String(paths.length));
  }

  if (SERVICE_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
    markPromoEngaged();
  }
  if (pathname === '/sim' || pathname.startsWith('/sim/')) {
    markSimInterest();
  }
  if (pathname.startsWith('/dat-nuoc')) {
    markPromoEngaged();
  }

  return {
    pageViews: paths.length,
    engaged: isPromoEngaged(),
    simInterest: hasSimInterest(),
  };
}

export function waterPromoBlockedPath(pathname: string): boolean {
  return (
    pathname.startsWith('/dat-nuoc') ||
    pathname.startsWith('/quan-tri') ||
    pathname.startsWith('/sim') ||
    pathname.startsWith('/huong-dan')
  );
}

export function simPromoBlockedPath(pathname: string): boolean {
  return (
    pathname.startsWith('/sim') ||
    pathname.startsWith('/quan-tri') ||
    pathname.startsWith('/huong-dan')
  );
}

/** Nước đủ điều kiện hiện (chưa tính delay timer). */
export function canOfferWater(pathname: string): boolean {
  if (isWaterPromoDismissed()) return false;
  if (waterPromoBlockedPath(pathname)) return false;
  const views = getPromoPageViews();
  const engaged = isPromoEngaged();
  return engaged || views >= WATER_MIN_PAGE_VIEWS;
}

/**
 * Sim trên site chùa: chỉ sau khi khách đã đóng chip nước,
 * có interest /sim hoặc đủ page view, và đã qua cooldown.
 */
export function canOfferSimOnTemple(pathname: string): boolean {
  if (isSimPromoDismissed()) return false;
  if (simPromoBlockedPath(pathname)) return false;
  if (!isWaterPromoDismissed()) return false;

  const closedAt = Number(ssGet(KEYS.waterClosedAt) || '0');
  if (closedAt && Date.now() - closedAt < SIM_COOLDOWN_AFTER_WATER_MS) {
    return false;
  }

  const views = getPromoPageViews();
  return hasSimInterest() || views >= SIM_MIN_PAGE_VIEWS;
}

export function canOfferSimOnlySite(pathname: string): boolean {
  if (isSimPromoDismissed()) return false;
  if (simPromoBlockedPath(pathname)) return false;
  return getPromoPageViews() >= SIM_ONLY_MIN_PAGE_VIEWS || hasSimInterest();
}

export function waterOfferDelayMs(): number {
  return isPromoEngaged() ? WATER_ENGAGED_DELAY_MS : WATER_DELAY_MS;
}
