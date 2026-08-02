import {
  aiDeviceSetCookie,
  getAiIdentity,
  grantAiCreditsByOrder,
  peekAiWallet,
} from '@/lib/ai-quota';
import {
  checkRateLimit,
  getClientIp,
  isRateLimitBypassed,
} from '@/lib/rate-limit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** Xem số lượt luận giải còn lại (không trừ). */
export async function GET(req: Request) {
  const peek = await peekAiWallet(req);
  const res = Response.json(peek, {
    headers: { 'Cache-Control': 'no-store' },
  });
  res.headers.append('Set-Cookie', aiDeviceSetCookie(getAiIdentity(req)));
  return res;
}

const GRANT_ERRORS: Record<string, string> = {
  order_not_paid_or_not_found:
    'Mã đơn chưa thanh toán hoặc không tồn tại. Quý vị kiểm tra lại mã trên trang đơn hàng.',
  order_already_redeemed:
    'Mã đơn này đã được dùng để cộng lượt luận giải trước đó.',
  bad_device: 'Trình duyệt chưa nhận diện được. Quý vị tải lại trang rồi thử lại.',
  server_error: 'Hệ thống đang bận. Quý vị thử lại sau giây lát.',
};

/** Đổi mã đơn nước/sim đã thanh toán lấy lượt luận giải. */
export async function POST(req: Request) {
  const ip = getClientIp(req);
  if (!isRateLimitBypassed(req, ip)) {
    const rl = checkRateLimit(`ai:grant:${ip}`, [
      { limit: 5, windowMs: 60_000 },
      { limit: 30, windowMs: 24 * 60 * 60_000 },
    ]);
    if (!rl.ok) {
      return Response.json(
        { ok: false, error: rl.message },
        { status: 429, headers: { 'Retry-After': String(rl.retryAfterSec) } },
      );
    }
  }

  let body: { orderCode?: string };
  try {
    body = (await req.json()) as { orderCode?: string };
  } catch {
    return Response.json(
      { ok: false, error: 'Yêu cầu không hợp lệ.' },
      { status: 400 },
    );
  }

  const orderCode = (body.orderCode || '').trim().toUpperCase();
  if (!orderCode) {
    return Response.json(
      { ok: false, error: 'Quý vị nhập mã đơn hàng trước đã.' },
      { status: 400 },
    );
  }

  const result = await grantAiCreditsByOrder(req, orderCode);
  if (!result.ok) {
    const res = Response.json(
      {
        ok: false,
        error: GRANT_ERRORS[result.error ?? ''] ?? GRANT_ERRORS.server_error,
        code: result.error,
      },
      { status: 400 },
    );
    res.headers.append('Set-Cookie', aiDeviceSetCookie(result.identity));
    return res;
  }

  const peek = await peekAiWallet(req);
  const res = Response.json({
    ok: true,
    bonusAdded: result.bonusRemaining,
    ...peek,
  });
  res.headers.append('Set-Cookie', aiDeviceSetCookie(result.identity));
  return res;
}
