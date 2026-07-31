/**
 * Rate limit in-memory theo IP (Node runtime, 1 process).
 * Phù hợp VPS/self-host; multi-instance cần store dùng chung (Redis/Supabase).
 *
 * Localhost / *.localhost / 127.* được bỏ qua để test.
 * Tắt hoàn toàn: RATE_LIMIT_DISABLED=1
 */

export type RateLimitRule = {
  limit: number;
  windowMs: number;
};

export type RateLimitResult =
  | { ok: true }
  | { ok: false; retryAfterSec: number; message: string };

type HitLog = number[];

const store = new Map<string, HitLog>();

/**
 * Chat / luận stream.
 * Ưu tiên: user vẫn dùng đủ quota free (vd. 3 câu) — chỉ chặn spam / phá.
 * - 3s: chống double-click
 * - 5 / 2 phút: đủ 3 free + nút luận mẫu + dư
 * - 20 / 10 phút, 80 / ngày: trần chống lạm dụng
 */
export const AI_STREAM_RULES: RateLimitRule[] = [
  { limit: 1, windowMs: 3_000 },
  { limit: 5, windowMs: 2 * 60_000 },
  { limit: 20, windowMs: 10 * 60_000 },
  { limit: 80, windowMs: 24 * 60 * 60_000 },
];

/** Luận từng cung (có thể chạy song song ~12 cung). */
export const AI_PALACE_RULES: RateLimitRule[] = [
  { limit: 20, windowMs: 60_000 },
  { limit: 80, windowMs: 60 * 60_000 },
];

function prune(hits: HitLog, now: number, windowMs: number): HitLog {
  const from = now - windowMs;
  return hits.filter((t) => t > from);
}

export function getClientIp(req: Request): string {
  const xf = req.headers.get('x-forwarded-for');
  if (xf) {
    const first = xf.split(',')[0]?.trim();
    if (first) return first;
  }
  const real = req.headers.get('x-real-ip')?.trim();
  if (real) return real;
  return 'unknown';
}

export function getRequestHost(req: Request): string {
  const xfHost = req.headers.get('x-forwarded-host')?.split(',')[0]?.trim();
  const hostHeader = xfHost || req.headers.get('host') || '';
  return hostHeader.split(':')[0].toLowerCase().trim();
}

/** Dev / test local — không khóa. */
export function isRateLimitBypassed(req: Request, ip: string): boolean {
  if (process.env.RATE_LIMIT_DISABLED === '1') return true;
  if (process.env.NODE_ENV === 'development') return true;

  const host = getRequestHost(req);
  if (
    host === 'localhost' ||
    host.endsWith('.localhost') ||
    host.startsWith('127.')
  ) {
    return true;
  }

  const normalized = ip.replace(/^::ffff:/i, '').toLowerCase();
  if (
    normalized === '127.0.0.1' ||
    normalized === '::1' ||
    normalized === 'localhost' ||
    normalized === 'unknown'
  ) {
    return true;
  }

  return false;
}

export function checkRateLimit(
  bucketKey: string,
  rules: RateLimitRule[],
): RateLimitResult {
  const now = Date.now();
  let hits = store.get(bucketKey) ?? [];

  const maxWindow = Math.max(...rules.map((r) => r.windowMs));
  hits = prune(hits, now, maxWindow);

  for (const rule of rules) {
    const inWindow = hits.filter((t) => t > now - rule.windowMs);
    if (inWindow.length >= rule.limit) {
      const oldest = inWindow[0] ?? now;
      const retryAfterSec = Math.max(
        1,
        Math.ceil((oldest + rule.windowMs - now) / 1000),
      );
      return {
        ok: false,
        retryAfterSec,
        message:
          retryAfterSec < 60
            ? `Quý vị thao tác hơi nhanh. Vui lòng đợi khoảng ${retryAfterSec} giây rồi thử lại.`
            : `Quý vị đã dùng quá nhiều lần luận giải. Vui lòng thử lại sau khoảng ${Math.ceil(retryAfterSec / 60)} phút.`,
      };
    }
  }

  hits.push(now);
  store.set(bucketKey, prune(hits, now, maxWindow));
  return { ok: true };
}

/**
 * Kiểm tra rate limit AI. Trả về Response 429 nếu bị khóa; null nếu cho qua.
 */
export function assertAiRateLimit(
  req: Request,
  profile: 'stream' | 'palace' = 'stream',
): Response | null {
  const ip = getClientIp(req);
  if (isRateLimitBypassed(req, ip)) return null;

  const rules = profile === 'palace' ? AI_PALACE_RULES : AI_STREAM_RULES;
  const result = checkRateLimit(`ai:${profile}:${ip}`, rules);
  if (result.ok) return null;

  return Response.json(
    {
      error: result.message,
      code: 'rate_limited',
      retryAfterSec: result.retryAfterSec,
    },
    {
      status: 429,
      headers: {
        'Retry-After': String(result.retryAfterSec),
        'Cache-Control': 'no-store',
      },
    },
  );
}
