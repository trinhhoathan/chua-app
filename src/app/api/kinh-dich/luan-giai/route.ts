import { getOrderByCode } from '@/app/actions/orders';
import {
  buildKinhDichQueUserBlock,
  buildKinhDichSystemPrompt,
} from '@/lib/fengshui/kinh-dich-prompt';
import { assertAiRateLimit } from '@/lib/rate-limit';

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
const FREE_USER_QUESTIONS = 1;

function isPaidStatus(status: string | null | undefined): boolean {
  return (
    status === 'paid' || status === 'shipping' || status === 'delivered'
  );
}

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
  const isInitialReading = Boolean(body.isInitialReading);
  const questionIndex = Number(body.questionIndex ?? 0);

  if (!question) {
    return Response.json({ error: 'Thiếu câu hỏi.' }, { status: 400 });
  }
  if (!queContext) {
    return Response.json(
      { error: 'Thiếu dữ liệu quẻ để luận giải.' },
      { status: 400 },
    );
  }

  // Gate: từ câu hỏi thêm thứ 2 trở đi cần mã đơn thỉnh nước đã thanh toán.
  // questionIndex: số câu user đã gửi TRƯỚC câu này (0 = câu hỏi thêm đầu tiên).
  // Free: isInitialReading HOẶC questionIndex < 1
  const needsPaid =
    !isInitialReading && questionIndex >= FREE_USER_QUESTIONS;

  if (needsPaid) {
    if (!orderCode) {
      return Response.json(
        {
          error:
            'Quý vị đã dùng hết 1 câu hỏi thêm miễn phí. Thỉnh nước ủng hộ chùa rồi nhập mã đơn để hỏi tiếp.',
          code: 'order_required',
        },
        { status: 402 },
      );
    }
    const order = await getOrderByCode(orderCode);
    if (!order || !isPaidStatus(order.status)) {
      return Response.json(
        {
          error:
            'Mã đơn chưa thanh toán hoặc không hợp lệ. Vui lòng thỉnh nước ủng hộ chùa rồi thử lại.',
          code: 'order_unpaid',
        },
        { status: 402 },
      );
    }
  }

  const history = Array.isArray(body.history) ? body.history.slice(-12) : [];

  const messages: Array<{ role: string; content: string }> = [
    { role: 'system', content: buildKinhDichSystemPrompt(templeName) },
    {
      role: 'user',
      content: buildKinhDichQueUserBlock(queContext),
    },
    {
      role: 'assistant',
      content: `A Di Đà Phật. Trụ trì ${templeName} đã xem quẻ của quý vị. Quý vị muốn hỏi điều gì, cứ nói thẳng để tôi luận rõ.`,
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

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      'X-Accel-Buffering': 'no',
      Connection: 'keep-alive',
    },
  });
}
