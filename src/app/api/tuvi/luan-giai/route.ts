import { buildTuViSystemPrompt } from '@/lib/fengshui/tuvi-prompt';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 120;

type ChatTurn = { role: 'user' | 'assistant'; content: string };

type Body = {
  question?: string;
  chartContext?: string;
  history?: ChatTurn[];
  templeName?: string;
};

const DEEPSEEK_URL = 'https://api.deepseek.com/chat/completions';

export async function POST(req: Request) {
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
  const chartContext = (body.chartContext || '').trim();
  const templeName = (body.templeName || 'chùa').trim() || 'chùa';
  if (!question) {
    return Response.json({ error: 'Thiếu câu hỏi.' }, { status: 400 });
  }
  if (!chartContext) {
    return Response.json(
      { error: 'Thiếu dữ liệu lá số để luận giải.' },
      { status: 400 },
    );
  }

  const history = Array.isArray(body.history) ? body.history.slice(-12) : [];

  const messages: Array<{ role: string; content: string }> = [
    { role: 'system', content: buildTuViSystemPrompt(templeName) },
    {
      role: 'user',
      content: `Đây là lá số cần trụ trì ${templeName} xem và luận giải (nguồn duy nhất, không bịa thêm):\n\n${chartContext}`,
    },
    {
      role: 'assistant',
      content: `A Di Đà Phật. Trụ trì ${templeName} đã xem qua lá số của quý vị (mười hai cung, sao, đối cung–tam hợp và vận hạn theo thời gian xem). Quý vị muốn hỏi điều gì, cứ nói thẳng để tôi luận rõ.`,
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
      messages,
    }),
  });

  if (!upstream.ok || !upstream.body) {
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

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      'X-Accel-Buffering': 'no',
      Connection: 'keep-alive',
    },
  });
}
