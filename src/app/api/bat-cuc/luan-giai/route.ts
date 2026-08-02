import {
  batCucTopicLabels,
  buildBatCucSystemPrompt,
} from '@/lib/fengshui/bat-cuc-prompt';
import { parseBatCucTopicId } from '@/lib/fengshui/bat-cuc-contexts';
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
  analysisContext?: string;
  history?: ChatTurn[];
  templeName?: string;
  topic?: string;
  /** Mã đơn nước/sim đã thanh toán — có thì không trừ ví lượt AI */
  orderCode?: string;
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
  const analysisContext = (body.analysisContext || '').trim();
  const templeName = (body.templeName || 'chùa').trim() || 'chùa';
  const topic = parseBatCucTopicId(body.topic);
  if (!topic) {
    return Response.json({ error: 'Thiếu chủ đề luận số.' }, { status: 400 });
  }
  if (!question) {
    return Response.json({ error: 'Thiếu câu hỏi.' }, { status: 400 });
  }
  if (!analysisContext) {
    return Response.json(
      { error: 'Thiếu dữ liệu phân tích dãy số để luận giải.' },
      { status: 400 },
    );
  }

  // Ví lượt AI toàn hệ thống: mã đơn paid hợp lệ → không trừ ví
  const orderCode = (body.orderCode || '').trim().toUpperCase();
  let quota: ConsumeResult | null = null;
  if (!(orderCode && (await isPaidOrderCode(orderCode)))) {
    quota = await consumeAiCredit(req);
    if (!quota.allowed) {
      const res = Response.json(
        {
          code: 'quota_exhausted',
          remaining: 0,
          error: 'Quý vị đã dùng hết lượt luận giải miễn phí.',
        },
        { status: 402 },
      );
      res.headers.append('Set-Cookie', aiDeviceSetCookie(quota.identity));
      return res;
    }
  }

  const history = Array.isArray(body.history) ? body.history.slice(-12) : [];
  const { dataLabel, seenLabel } = batCucTopicLabels(topic);

  // Persona theo tenant: site Lý Gia dùng giọng "Thầy Phong Thủy Phúc An"
  const temple = await getCurrentTemple().catch(() => null);
  const sitePersona = temple ? getSitePersona(temple) : null;
  const promptPersona =
    sitePersona && sitePersona.upsell === 'sim'
      ? {
          aiRoleIntro: sitePersona.aiRoleIntro,
          role: sitePersona.role,
          aiOutro: sitePersona.aiOutro,
        }
      : null;
  const advisor = promptPersona
    ? sitePersona!.displayName
    : `trụ trì ${templeName}`;
  const greeting = promptPersona
    ? `Chào quý vị. ${sitePersona!.displayName} ${seenLabel}. Quý vị muốn hỏi điều gì, cứ nói thẳng để tôi luận rõ.`
    : `A Di Đà Phật. Trụ trì ${templeName} ${seenLabel}. Quý vị muốn hỏi điều gì, cứ nói thẳng để tôi luận rõ.`;

  const messages: Array<{ role: string; content: string }> = [
    {
      role: 'system',
      content: buildBatCucSystemPrompt(templeName, topic, promptPersona),
    },
    {
      role: 'user',
      content: `Đây là ${dataLabel} cần ${advisor} xem và luận giải (nguồn duy nhất, không bịa thêm):\n\n${analysisContext}`,
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

(Nhắc: sau khi luận xong, BẮT BUỘC kết thúc bằng khối <<<goi-y>>> ... <<<het-goi-y>>> gồm đúng 5 câu hỏi tiếp nối, ngắn gọn, gợi tò mò, khác câu hỏi hiện tại.)`,
    },
  ];

  // deepseek-chat: stream nội dung luận giải ngay (reasoner suy nghĩ lâu mới ra chữ).
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
      // Giảm nhiệt để luận bám dữ liệu đã tính sẵn, ít "sáng tác".
      temperature: 0.6,
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
              // bỏ chunk lỗi
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
