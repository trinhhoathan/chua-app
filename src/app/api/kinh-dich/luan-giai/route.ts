import {
  buildKinhDichQueUserBlock,
  buildKinhDichSystemPrompt,
} from '@/lib/fengshui/kinh-dich-prompt';
import { assertAiRateLimit } from '@/lib/rate-limit';
import { getCurrentTemple } from '@/lib/tenant';
import { getSitePersona } from '@/lib/site-persona';
import {
  aiDeviceSetCookie,
  consumeAiCredit,
  isPaidOrderCode,
  refundAiCredit,
  type ConsumeResult,
} from '@/lib/ai-quota';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 120;

type ChatTurn = { role: 'user' | 'assistant'; content: string };

type Body = {
  question?: string;
  queContext?: string;
  history?: ChatTurn[];
  templeName?: string;
  orderCode?: string;
  /** 0 = luận đầu (free); 1 = câu hỏi thêm free; >=1 (câu 2+) cần thỉnh nước */
  questionIndex?: number;
  /** true = luận tự động lần đầu, không tính quota */
  isInitialReading?: boolean;
};

const DEEPSEEK_URL = 'https://api.deepseek.com/chat/completions';

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

  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return Response.json({ error: 'Yêu cầu không hợp lệ.' }, { status: 400 });
  }

  const question = (body.question || '').trim();
  const queContext = (body.queContext || '').trim();
  const templeName = (body.templeName || 'chùa').trim() || 'chùa';
  const orderCode = (body.orderCode || '').trim().toUpperCase();

  if (!question) {
    return Response.json({ error: 'Thiếu câu hỏi.' }, { status: 400 });
  }
  if (!queContext) {
    return Response.json(
      { error: 'Thiếu dữ liệu quẻ để luận giải.' },
      { status: 400 },
    );
  }

  // Persona theo tenant: site Lý Gia dùng giọng "Thầy Phong Thủy Phúc An"
  const temple = await getCurrentTemple().catch(() => null);
  const sitePersona = temple ? getSitePersona(temple) : null;
  const isSimSite = Boolean(sitePersona && sitePersona.upsell === 'sim');

  // Ví lượt AI toàn hệ thống: mã đơn paid hợp lệ → không trừ ví.
  const orderPaid = orderCode ? await isPaidOrderCode(orderCode) : false;
  let quota: ConsumeResult | null = null;
  if (!orderPaid) {
    quota = await consumeAiCredit(req);
    if (!quota.allowed) {
      const res = Response.json(
        {
          code: 'quota_exhausted',
          remaining: 0,
          error: isSimSite
            ? 'Quý vị đã dùng hết lượt luận giải miễn phí. Gọi thầy tư vấn trực tiếp hoặc chọn sim hợp mệnh trong kho.'
            : 'Quý vị đã dùng hết lượt luận giải miễn phí. Thỉnh nước ủng hộ chùa rồi nhập mã đơn để hỏi tiếp.',
        },
        { status: 402 },
      );
      res.headers.append('Set-Cookie', aiDeviceSetCookie(quota.identity));
      return res;
    }
  }

  const history = Array.isArray(body.history) ? body.history.slice(-12) : [];
  const advisor = isSimSite
    ? sitePersona!.displayName
    : `Trụ trì ${templeName}`;
  const greeting = isSimSite
    ? `Chào quý vị. ${advisor} đã xem quẻ của quý vị. Quý vị muốn hỏi điều gì, cứ nói thẳng để tôi luận rõ.`
    : `A Di Đà Phật. Trụ trì ${templeName} đã xem quẻ của quý vị. Quý vị muốn hỏi điều gì, cứ nói thẳng để tôi luận rõ.`;

  const messages: Array<{ role: string; content: string }> = [
    {
      role: 'system',
      content: buildKinhDichSystemPrompt(
        templeName,
        isSimSite
          ? {
              displayName: sitePersona!.displayName,
              aiOutro: sitePersona!.aiOutro,
            }
          : null,
      ),
    },
    {
      role: 'user',
      content: buildKinhDichQueUserBlock(
        queContext,
        isSimSite ? advisor : 'trụ trì',
      ),
    },
    {
      role: 'assistant',
      content: greeting,
    },
    ...history
      .filter(
        (h) =>
          (h.role === 'user' || h.role === 'assistant') &&
          typeof h.content === 'string' &&
          h.content.trim(),
      )
      .map((h) => ({ role: h.role, content: h.content.trim() })),
    {
      role: 'user',
      content: `${question}

(Nhắc: sau khi luận xong, BẮT BUỘC kết thúc bằng khối <<<goi-y>>> ... <<<het-goi-y>>> gồm đúng 3 câu hỏi tiếp nối, khác câu hỏi hiện tại.)`,
    },
  ];

  const upstream = await fetch(DEEPSEEK_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      Accept: 'text/event-stream',
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      stream: true,
      messages,
    }),
  });

  if (!upstream.ok || !upstream.body) {
    if (quota) await refundAiCredit(quota.identity);
    return Response.json(
      {
        error: 'Không luận giải được lúc này. Quý vị thử lại sau giây lát.',
      },
      { status: 502 },
    );
  }

  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

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

          for (const raw of parts) {
            const line = raw.trim();
            if (!line || line.startsWith(':')) continue;
            if (!line.startsWith('data:')) continue;
            const data = line.slice(5).trim();
            if (!data || data === '[DONE]') continue;
            try {
              const json = JSON.parse(data) as {
                choices?: Array<{
                  delta?: { content?: string | null };
                }>;
              };
              const piece = json.choices?.[0]?.delta?.content;
              if (piece) {
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
            '\n\n(Xin lỗi, phần trả lời bị gián đoạn. Quý vị hỏi lại giúp.)',
          ),
        );
      } finally {
        try {
          controller.close();
        } catch {
          /* already closed */
        }
      }
    },
  });

  const res = new Response(stream, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      'X-Accel-Buffering': 'no',
      Connection: 'keep-alive',
      'X-Ai-Remaining': String(quota ? quota.remaining : -1),
    },
  });
  if (quota) res.headers.append('Set-Cookie', aiDeviceSetCookie(quota.identity));
  return res;
}
