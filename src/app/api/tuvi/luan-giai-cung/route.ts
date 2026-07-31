import { NextResponse } from 'next/server';
import { getOrderByCode } from '@/app/actions/orders';
import {
  buildPalaceSystemPrompt,
  parseTuViSchool,
} from '@/lib/fengshui/tuvi-prompt';
import { assertAiRateLimit } from '@/lib/rate-limit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 120;

type Body = {
  palaceName?: string;
  palaceIndex?: number;
  chartContext?: string;
  templeName?: string;
  orderCode?: string;
  /** Teaser miễn phí cung Mệnh — bỏ qua gate mã đơn. */
  freeTeaser?: boolean;
  school?: string;
  noVanHan?: boolean;
  /** true = stream text/plain (luận mẫu Mệnh trên UI). */
  stream?: boolean;
};

const DEEPSEEK_URL = 'https://api.deepseek.com/chat/completions';

function isPaidStatus(status: string | null | undefined): boolean {
  return (
    status === 'paid' || status === 'shipping' || status === 'delivered'
  );
}

function sseTextStream(upstream: Response): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  return new ReadableStream<Uint8Array>({
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
              if (piece) controller.enqueue(encoder.encode(piece));
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
}

export async function POST(req: Request) {
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: 'Yêu cầu không hợp lệ.' }, { status: 400 });
  }

  const wantStream = Boolean(body.stream);
  // Teaser stream dùng profile stream (đủ quota free); 12 cung giữ palace.
  const limited = assertAiRateLimit(
    req,
    wantStream && body.freeTeaser ? 'stream' : 'palace',
  );
  if (limited) return limited;

  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: 'Dịch vụ luận giải chưa sẵn sàng. Vui lòng thử lại sau.' },
      { status: 500 },
    );
  }

  const palaceName = (body.palaceName || '').trim();
  const chartContext = (body.chartContext || '').trim();
  const templeName = (body.templeName || 'chùa').trim() || 'chùa';
  const orderCode = (body.orderCode || '').trim().toUpperCase();
  const freeTeaser = Boolean(body.freeTeaser);
  const school = parseTuViSchool(body.school);
  const noVanHan = Boolean(body.noVanHan);
  const isMenh = /^mệnh$/i.test(palaceName);

  if (!palaceName) {
    return NextResponse.json({ error: 'Thiếu tên cung.' }, { status: 400 });
  }
  if (!chartContext) {
    return NextResponse.json(
      { error: 'Thiếu dữ liệu lá số để luận giải.' },
      { status: 400 },
    );
  }

  // Gate: teaser miễn phí chỉ cho cung Mệnh; còn lại cần mã đơn paid.
  if (!(freeTeaser && isMenh)) {
    if (!orderCode) {
      return NextResponse.json(
        {
          error: 'Cần mã đơn thỉnh nước đã thanh toán để mở khóa luận giải cung.',
          code: 'order_required',
        },
        { status: 402 },
      );
    }
    const order = await getOrderByCode(orderCode);
    if (!order || !isPaidStatus(order.status)) {
      return NextResponse.json(
        {
          error:
            'Mã đơn chưa thanh toán hoặc không hợp lệ. Vui lòng thỉnh nước ủng hộ chùa rồi thử lại.',
          code: 'order_unpaid',
        },
        { status: 402 },
      );
    }
  }

  const system = buildPalaceSystemPrompt(templeName, palaceName, school, {
    noVanHan,
  });
  const userContent = [
    chartContext,
    '',
    `Hãy luận giải chuyên sâu CUNG ${palaceName}${
      body.palaceIndex != null ? ` (index ${body.palaceIndex})` : ''
    }.`,
    freeTeaser && isMenh
      ? 'Đây là phần xem thử miễn phí cung Mệnh — luận đầy đủ, chất lượng cao để Phật tử cảm nhận.'
      : '',
  ]
    .filter(Boolean)
    .join('\n');

  const messages = [
    { role: 'system', content: system },
    { role: 'user', content: userContent },
  ];

  try {
    if (wantStream) {
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
          temperature: 0.7,
          messages,
        }),
      });

      if (!upstream.ok || !upstream.body) {
        const errText = await upstream.text().catch(() => '');
        console.error('[luan-giai-cung] deepseek stream error', upstream.status, errText);
        return NextResponse.json(
          { error: 'Không luận giải được cung này. Vui lòng thử lại.' },
          { status: 502 },
        );
      }

      return new Response(sseTextStream(upstream), {
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          'Cache-Control': 'no-cache, no-transform',
          'X-Accel-Buffering': 'no',
          Connection: 'keep-alive',
        },
      });
    }

    const res = await fetch(DEEPSEEK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        stream: false,
        temperature: 0.7,
        messages,
      }),
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => '');
      console.error('[luan-giai-cung] deepseek error', res.status, errText);
      return NextResponse.json(
        { error: 'Không luận giải được cung này. Vui lòng thử lại.' },
        { status: 502 },
      );
    }

    const data = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const content = data.choices?.[0]?.message?.content?.trim() || '';
    if (!content) {
      return NextResponse.json(
        { error: 'Phản hồi luận giải trống.' },
        { status: 502 },
      );
    }

    return NextResponse.json({
      ok: true,
      palaceName,
      palaceIndex: body.palaceIndex ?? null,
      content,
    });
  } catch (e) {
    console.error('[luan-giai-cung]', e);
    return NextResponse.json(
      { error: 'Lỗi kết nối dịch vụ luận giải.' },
      { status: 502 },
    );
  }
}
