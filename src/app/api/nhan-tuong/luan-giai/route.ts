import { assertAiRateLimit } from '@/lib/rate-limit';
import { getCurrentTemple } from '@/lib/tenant';
import { getSitePersona } from '@/lib/site-persona';
import {
  NHAN_TUONG_PROMPT_VERSION,
  buildNhanTuongContext,
  buildNhanTuongSystemPrompt,
  buildNhanTuongUserBlock,
  parseNhanTuongPayload,
} from '@/lib/fengshui/nhan-tuong-prompt';
import {
  aiDeviceSetCookie,
  consumeAiCredit,
  getAiIdentity,
  getCachedAiAnswer,
  makeAiCacheKey,
  peekAiWallet,
  refundAiCredit,
  saveCachedAiAnswer,
} from '@/lib/ai-quota';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 120;

const DEEPSEEK_URL = 'https://api.deepseek.com/chat/completions';
const MODEL = 'deepseek-chat';
/** Bài luận 1 phát, không chat — chặn trần token để khống chế chi phí. */
const MAX_TOKENS = 1600;
/** Chỉ cache bài luận đủ dài (tránh cache mẩu lỗi/gián đoạn). */
const MIN_CACHEABLE_CHARS = 400;

export async function POST(req: Request) {
  const limited = assertAiRateLimit(req, 'stream');
  if (limited) return limited;

  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    return Response.json(
      { error: 'Dịch vụ luận giải chưa sẵn sàng. Vui lòng thử lại sau.' },
      { status: 500 },
    );
  }

  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return Response.json({ error: 'Yêu cầu không hợp lệ.' }, { status: 400 });
  }

  // Server tự tính lại từ input thô — client không gửi context, không giả mạo được
  const payload = parseNhanTuongPayload(raw);
  if (!payload) {
    return Response.json(
      { error: 'Dữ liệu quan sát chưa hợp lệ. Vui lòng chọn lại các bộ vị.' },
      { status: 400 },
    );
  }

  const temple = await getCurrentTemple().catch(() => null);
  const sitePersona = temple ? getSitePersona(temple) : null;
  const isSimSite = Boolean(sitePersona && sitePersona.upsell === 'sim');
  const templeName = temple?.name?.trim() || 'chùa';

  // Cache dùng chung: cùng input + cùng persona → cùng bài luận
  const cacheKey = makeAiCacheKey({
    v: NHAN_TUONG_PROMPT_VERSION,
    payload,
    persona: isSimSite ? `sim:${sitePersona!.displayName}` : `water:${templeName}`,
  });

  const cookieHeaders = (extra: Record<string, string> = {}) => {
    const h: Record<string, string> = {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      'X-Accel-Buffering': 'no',
      Connection: 'keep-alive',
      ...extra,
    };
    return h;
  };

  const cached = await getCachedAiAnswer(cacheKey);
  if (cached) {
    const peek = await peekAiWallet(req);
    const headers = cookieHeaders({
      'X-Ai-Cache': 'hit',
      'X-Ai-Remaining': String(peek.remaining),
    });
    const res = new Response(cached, { headers });
    res.headers.append('Set-Cookie', aiDeviceSetCookie(getAiIdentity(req)));
    return res;
  }

  // Trừ ví (cache miss mới tốn tiền API)
  const consume = await consumeAiCredit(req);
  if (!consume.allowed) {
    const res = Response.json(
      {
        code: consume.reason === 'ip_ceiling' ? 'ip_ceiling' : 'quota_exhausted',
        error:
          consume.reason === 'ip_ceiling'
            ? 'Hệ thống nhận quá nhiều lượt luận giải từ mạng của quý vị hôm nay. Vui lòng quay lại vào ngày mai.'
            : 'Quý vị đã dùng hết lượt luận giải miễn phí.',
        remaining: 0,
      },
      { status: 402 },
    );
    res.headers.append('Set-Cookie', aiDeviceSetCookie(consume.identity));
    return res;
  }

  const ctx = buildNhanTuongContext(payload);
  const advisor = isSimSite ? sitePersona!.displayName : 'trụ trì';
  const messages = [
    {
      role: 'system',
      content: buildNhanTuongSystemPrompt(
        templeName,
        isSimSite
          ? {
              displayName: sitePersona!.displayName,
              aiOutro: sitePersona!.aiOutro,
            }
          : null,
      ),
    },
    { role: 'user', content: buildNhanTuongUserBlock(ctx, advisor) },
  ];

  const upstream = await fetch(DEEPSEEK_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      Accept: 'text/event-stream',
    },
    body: JSON.stringify({
      model: MODEL,
      stream: true,
      temperature: 0.6,
      max_tokens: MAX_TOKENS,
      messages,
    }),
  }).catch(() => null);

  if (!upstream || !upstream.ok || !upstream.body) {
    // Chưa nhận được gì từ AI — hoàn lượt cho người xem
    await refundAiCredit(consume.identity);
    return Response.json(
      { error: 'Không luận giải được lúc này. Quý vị thử lại sau giây lát.' },
      { status: 502 },
    );
  }

  const encoder = new TextEncoder();
  const decoder = new TextDecoder();
  let full = '';

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const reader = upstream.body!.getReader();
      let buffer = '';
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const parts = buffer.split('\n');
          buffer = parts.pop() ?? '';

          for (const rawLine of parts) {
            const line = rawLine.trim();
            if (!line || line.startsWith(':')) continue;
            if (!line.startsWith('data:')) continue;
            const data = line.slice(5).trim();
            if (!data || data === '[DONE]') continue;
            try {
              const json = JSON.parse(data) as {
                choices?: Array<{ delta?: { content?: string | null } }>;
              };
              const piece = json.choices?.[0]?.delta?.content;
              if (piece) {
                full += piece;
                controller.enqueue(encoder.encode(piece));
              }
            } catch {
              /* bỏ chunk lỗi */
            }
          }
        }
      } catch {
        controller.enqueue(
          encoder.encode(
            '\n\n(Xin lỗi, phần luận giải bị gián đoạn. Quý vị thử lại giúp.)',
          ),
        );
      } finally {
        if (full.trim().length >= MIN_CACHEABLE_CHARS) {
          await saveCachedAiAnswer({
            cacheKey,
            topic: payload.topic,
            content: full.trim(),
            model: MODEL,
            promptVersion: NHAN_TUONG_PROMPT_VERSION,
          });
        }
        try {
          controller.close();
        } catch {
          /* already closed */
        }
      }
    },
  });

  const res = new Response(stream, {
    headers: cookieHeaders({
      'X-Ai-Cache': 'miss',
      'X-Ai-Remaining': String(consume.remaining),
    }),
  });
  res.headers.append('Set-Cookie', aiDeviceSetCookie(consume.identity));
  return res;
}
