import 'server-only';
import { createHash, randomUUID } from 'node:crypto';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { getClientIp, isRateLimitBypassed } from '@/lib/rate-limit';

/**
 * Ví lượt luận giải AI — toàn hệ thống, mọi route AI dùng chung.
 *
 * Nhận diện khách ẩn danh:
 * - Khóa chính: cookie thiết bị (uuid, httpOnly, 1 năm). CGNAT ở VN khiến
 *   1 IP di động = hàng trăm người thật, nên KHÔNG khóa cứng theo IP.
 * - IP chỉ là trần an toàn theo ngày (chống farm bằng cách xóa cookie).
 * - Cả hai đều lưu dạng hash có salt — không lưu định danh thô.
 *
 * Reset chu kỳ: xử lý "lười" ngay trong RPC (hết chu kỳ → free_used về 0),
 * không cần cron. Bonus từ đơn hàng có hạn dùng riêng (bonus_expires_at).
 */

export const AI_DEVICE_COOKIE = 'ai_device';

const DAY_SECONDS = 24 * 60 * 60;

function envInt(name: string, def: number): number {
  const n = Number(process.env[name]);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : def;
}

export function getAiQuotaConfig() {
  return {
    /** Số lượt miễn phí / thiết bị / chu kỳ */
    freeUses: envInt('AI_FREE_USES', 3),
    /** Chu kỳ reset lượt miễn phí (ngày) */
    windowDays: envInt('AI_FREE_WINDOW_DAYS', 30),
    /** Trần lượt / IP / ngày (lưới an toàn) */
    ipDailyCeiling: envInt('AI_IP_DAILY_CEILING', 30),
    /** Lượt cộng thêm cho mỗi đơn hàng đã thanh toán */
    bonusPerOrder: envInt('AI_BONUS_PER_ORDER', 5),
    /** Hạn dùng lượt bonus (ngày) */
    bonusTtlDays: envInt('AI_BONUS_TTL_DAYS', 30),
  };
}

function hashWithSalt(value: string): string {
  const salt = process.env.AI_QUOTA_SALT ?? 'chua-app-ai-quota';
  return createHash('sha256').update(`${salt}:${value}`).digest('hex');
}

// ---------------------------------------------------------------------------
// Nhận diện thiết bị
// ---------------------------------------------------------------------------

export interface AiIdentity {
  /** uuid thô của thiết bị (chỉ để set lại cookie, không lưu DB) */
  deviceId: string;
  deviceHash: string;
  ipHash: string;
  /** true nếu request chưa có cookie thiết bị → cần Set-Cookie */
  isNewDevice: boolean;
}

function parseCookie(header: string | null, name: string): string | null {
  if (!header) return null;
  for (const part of header.split(';')) {
    const eq = part.indexOf('=');
    if (eq < 0) continue;
    if (part.slice(0, eq).trim() === name) {
      return part.slice(eq + 1).trim() || null;
    }
  }
  return null;
}

const DEVICE_ID_RE = /^[0-9a-f-]{20,64}$/i;

export function getAiIdentity(req: Request): AiIdentity {
  const raw = parseCookie(req.headers.get('cookie'), AI_DEVICE_COOKIE);
  const valid = raw && DEVICE_ID_RE.test(raw) ? raw : null;
  const deviceId = valid ?? randomUUID();
  const ip = getClientIp(req);
  return {
    deviceId,
    deviceHash: hashWithSalt(`device:${deviceId}`),
    ipHash: hashWithSalt(`ip:${ip}`),
    isNewDevice: !valid,
  };
}

/** Giá trị header Set-Cookie cho cookie thiết bị (gắn vào response stream). */
export function aiDeviceSetCookie(identity: AiIdentity): string {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  return `${AI_DEVICE_COOKIE}=${identity.deviceId}; Path=/; Max-Age=31536000; HttpOnly; SameSite=Lax${secure}`;
}

// ---------------------------------------------------------------------------
// Trừ / cộng / xem ví
// ---------------------------------------------------------------------------

export type ConsumeReason =
  | 'ok'
  | 'quota_exhausted'
  | 'ip_ceiling'
  | 'bad_device'
  | 'bypassed'
  | 'error';

export interface ConsumeResult {
  allowed: boolean;
  reason: ConsumeReason;
  /** -1 = không giới hạn (bypass dev/local) */
  remaining: number;
  remainingFree: number;
  remainingBonus: number;
  identity: AiIdentity;
}

function isQuotaBypassed(req: Request): boolean {
  if (process.env.AI_QUOTA_FORCE === '1') return false;
  if (process.env.AI_QUOTA_DISABLED === '1') return true;
  return isRateLimitBypassed(req, getClientIp(req));
}

/**
 * Trừ 1 lượt luận giải cho thiết bị gửi request.
 * Fail-open khi DB lỗi (sự cố hạ tầng không được làm sập tính năng),
 * rate limit in-memory phía trước vẫn giữ trần chống lạm dụng.
 */
export async function consumeAiCredit(req: Request): Promise<ConsumeResult> {
  const identity = getAiIdentity(req);
  if (isQuotaBypassed(req)) {
    return {
      allowed: true,
      reason: 'bypassed',
      remaining: -1,
      remainingFree: -1,
      remainingBonus: 0,
      identity,
    };
  }

  const cfg = getAiQuotaConfig();
  try {
    const { data, error } = await getSupabaseAdmin().rpc('consume_ai_credit', {
      p_device_hash: identity.deviceHash,
      p_ip_hash: identity.ipHash,
      p_free_limit: cfg.freeUses,
      p_window_seconds: cfg.windowDays * DAY_SECONDS,
      p_ip_daily_limit: cfg.ipDailyCeiling,
    });
    if (error) throw error;
    const r = data as {
      allowed: boolean;
      reason: string;
      remaining_free?: number;
      remaining_bonus?: number;
    };
    const remainingFree = r.remaining_free ?? 0;
    const remainingBonus = r.remaining_bonus ?? 0;
    return {
      allowed: !!r.allowed,
      reason: (r.reason as ConsumeReason) ?? 'error',
      remaining: remainingFree + remainingBonus,
      remainingFree,
      remainingBonus,
      identity,
    };
  } catch (e) {
    console.error('[ai-quota] consume_ai_credit failed:', e);
    return {
      allowed: true,
      reason: 'error',
      remaining: -1,
      remainingFree: -1,
      remainingBonus: 0,
      identity,
    };
  }
}

/** Hoàn 1 lượt khi upstream AI lỗi sau lúc đã trừ ví. */
export async function refundAiCredit(identity: AiIdentity): Promise<void> {
  try {
    const admin = getSupabaseAdmin();
    const { data } = await admin
      .from('ai_wallets')
      .select('free_used, bonus_remaining, total_used')
      .eq('device_hash', identity.deviceHash)
      .maybeSingle();
    if (!data) return;
    const patch =
      data.free_used > 0
        ? { free_used: data.free_used - 1 }
        : { bonus_remaining: data.bonus_remaining + 1 };
    await admin
      .from('ai_wallets')
      .update({
        ...patch,
        total_used: Math.max(data.total_used - 1, 0),
        updated_at: new Date().toISOString(),
      })
      .eq('device_hash', identity.deviceHash);
  } catch (e) {
    console.error('[ai-quota] refund failed:', e);
  }
}

/** Mã đơn nước/sim đã thanh toán? (mở khóa chat không trừ ví) */
export async function isPaidOrderCode(orderCode: string): Promise<boolean> {
  const code = orderCode.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
  if (code.length < 4) return false;
  try {
    const admin = getSupabaseAdmin();
    // RPC đã so khớp không phụ thuộc dấu '-'
    const [w, s] = await Promise.all([
      admin.rpc('get_water_order_by_code', { p_code: code }),
      admin.rpc('get_sim_order_by_code', { p_code: code }),
    ]);
    const water = Array.isArray(w.data) ? w.data[0] : w.data;
    const sim = Array.isArray(s.data) ? s.data[0] : s.data;
    const waterPaid =
      water &&
      ['paid', 'shipping', 'delivered'].includes(
        (water as { status?: string }).status ?? '',
      );
    const simPaid =
      sim &&
      ['paid', 'delivering', 'completed'].includes(
        (sim as { status?: string }).status ?? '',
      );
    return Boolean(waterPaid || simPaid);
  } catch (e) {
    console.error('[ai-quota] isPaidOrderCode failed:', e);
    return false;
  }
}

export interface GrantResult {
  ok: boolean;
  error?: string;
  bonusRemaining?: number;
}

/** Đổi mã đơn nước/sim đã thanh toán lấy lượt bonus (mỗi đơn 1 lần). */
export async function grantAiCreditsByOrder(
  req: Request,
  orderCode: string,
): Promise<GrantResult & { identity: AiIdentity }> {
  const identity = getAiIdentity(req);
  const cfg = getAiQuotaConfig();
  const normalized = orderCode.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
  try {
    const { data, error } = await getSupabaseAdmin().rpc('grant_ai_credits', {
      p_device_hash: identity.deviceHash,
      p_order_code: normalized,
      p_credits: cfg.bonusPerOrder,
      p_ttl_seconds: cfg.bonusTtlDays * DAY_SECONDS,
    });
    if (error) throw error;
    const r = data as {
      ok: boolean;
      error?: string;
      bonus_remaining?: number;
    };
    return {
      ok: !!r.ok,
      error: r.error,
      bonusRemaining: r.bonus_remaining,
      identity,
    };
  } catch (e) {
    console.error('[ai-quota] grant_ai_credits failed:', e);
    return { ok: false, error: 'server_error', identity };
  }
}

export interface WalletPeek {
  remaining: number;
  remainingFree: number;
  remainingBonus: number;
}

/** Xem số lượt còn lại (không trừ). */
export async function peekAiWallet(req: Request): Promise<WalletPeek> {
  const cfg = getAiQuotaConfig();
  const identity = getAiIdentity(req);
  if (isQuotaBypassed(req)) {
    return { remaining: -1, remainingFree: -1, remainingBonus: 0 };
  }
  try {
    const { data } = await getSupabaseAdmin()
      .from('ai_wallets')
      .select('free_used, window_started_at, bonus_remaining, bonus_expires_at')
      .eq('device_hash', identity.deviceHash)
      .maybeSingle();
    if (!data) {
      return {
        remaining: cfg.freeUses,
        remainingFree: cfg.freeUses,
        remainingBonus: 0,
      };
    }
    const windowExpired =
      Date.now() - new Date(data.window_started_at).getTime() >
      cfg.windowDays * DAY_SECONDS * 1000;
    const remainingFree = windowExpired
      ? cfg.freeUses
      : Math.max(cfg.freeUses - data.free_used, 0);
    const bonusExpired =
      data.bonus_expires_at != null &&
      new Date(data.bonus_expires_at).getTime() <= Date.now();
    const remainingBonus = bonusExpired ? 0 : data.bonus_remaining;
    return {
      remaining: remainingFree + remainingBonus,
      remainingFree,
      remainingBonus,
    };
  } catch (e) {
    console.error('[ai-quota] peek failed:', e);
    return { remaining: -1, remainingFree: -1, remainingBonus: 0 };
  }
}

// ---------------------------------------------------------------------------
// Cache bài luận (input tất định → dùng chung giữa các user)
// ---------------------------------------------------------------------------

export function makeAiCacheKey(parts: unknown): string {
  return createHash('sha256').update(JSON.stringify(parts)).digest('hex');
}

export async function getCachedAiAnswer(
  cacheKey: string,
): Promise<string | null> {
  try {
    const admin = getSupabaseAdmin();
    const { data } = await admin
      .from('ai_answers')
      .select('content')
      .eq('cache_key', cacheKey)
      .maybeSingle();
    if (!data) return null;
    // fire-and-forget đếm hit
    void admin.rpc('bump_ai_answer_hit', { p_cache_key: cacheKey });
    return data.content;
  } catch (e) {
    console.error('[ai-quota] cache read failed:', e);
    return null;
  }
}

export async function saveCachedAiAnswer(input: {
  cacheKey: string;
  topic: string;
  content: string;
  model?: string;
  promptVersion: number;
}): Promise<void> {
  if (!input.content.trim()) return;
  try {
    await getSupabaseAdmin()
      .from('ai_answers')
      .upsert(
        {
          cache_key: input.cacheKey,
          topic: input.topic,
          content: input.content,
          model: input.model ?? null,
          prompt_version: input.promptVersion,
        },
        { onConflict: 'cache_key' },
      );
  } catch (e) {
    console.error('[ai-quota] cache write failed:', e);
  }
}
