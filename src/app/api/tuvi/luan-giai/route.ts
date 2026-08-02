import {
  applyPromptPersona,
  buildTuViSystemPrompt,
  parseTuViSchool,
} from '@/lib/fengshui/tuvi-prompt';
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
  chartContext?: string;
  history?: ChatTurn[];
  templeName?: string;
  /** Mã đơn nước/sim đã thanh toán — có thì không trừ ví lượt AI */
  orderCode?: string;
  school?: string;
  noVanHan?: boolean;
  vanHanFocus?: boolean;
  daiVanFocus?: boolean;
  napAmFocus?: boolean;
  hopTuoiFocus?: boolean;
  haLacFocus?: boolean;
  dungThanFocus?: boolean;
  batTuFocus?: boolean;
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
  const chartContext = (body.chartContext || '').trim();
  const templeName = (body.templeName || 'chùa').trim() || 'chùa';
  const school = parseTuViSchool(body.school);
  const noVanHan = Boolean(body.noVanHan);
  const vanHanFocus = Boolean(body.vanHanFocus);
  const daiVanFocus = Boolean(body.daiVanFocus);
  const napAmFocus = Boolean(body.napAmFocus);
  const hopTuoiFocus = Boolean(body.hopTuoiFocus);
  const haLacFocus = Boolean(body.haLacFocus);
  const dungThanFocus = Boolean(body.dungThanFocus);
  const batTuFocus = Boolean(body.batTuFocus);
  if (!question) {
    return Response.json({ error: 'Thiếu câu hỏi.' }, { status: 400 });
  }
  if (!chartContext) {
    return Response.json(
      { error: 'Thiếu dữ liệu lá số để luận giải.' },
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
  const focusedVan =
    vanHanFocus || daiVanFocus || napAmFocus || hopTuoiFocus || haLacFocus ||
    dungThanFocus || batTuFocus;

  const dataLabel = napAmFocus
    ? 'tứ trụ nạp âm · ngũ hành'
    : hopTuoiFocus
      ? 'dữ liệu hợp tuổi hai người'
      : haLacFocus
        ? 'Bát tự Hà Lạc (tứ trụ, thiên–địa số, quẻ tiên thiên / hậu thiên)'
        : dungThanFocus
          ? 'Bát tự và bảng cân dụng thần'
          : batTuFocus
            ? 'lá số Bát tự Tứ trụ (tứ trụ, thập thần, thần sát, đại vận, lưu niên)'
            : 'lá số';
  const seenLabel = napAmFocus
    ? 'đã bấm độn tứ trụ của quý vị (can chi, ngũ hành và nạp âm bốn trụ)'
    : hopTuoiFocus
      ? 'đã đối chiếu hai tuổi của quý vị (nạp âm, thiên can, địa chi, cung phi bát trạch)'
      : haLacFocus
        ? 'đã lập xong quẻ Hà Lạc của quý vị (thiên số – địa số, quẻ tiên thiên, nguyên đường, quẻ hậu thiên)'
        : dungThanFocus
          ? 'đã cân xong bát tự của quý vị (nhật chủ, lệnh tháng, thập thần, dụng – hỷ – kỵ thần)'
          : batTuFocus
            ? 'đã lập xong lá số Bát tự của quý vị (tứ trụ, thập thần, tàng can, thần sát và vận trình đại vận – lưu niên)'
            : 'đã xem qua lá số của quý vị (mười hai cung, sao, đối cung–tam hợp và vận hạn theo thời gian xem)';

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
    : `Trụ trì ${templeName}`;
  const greeting = promptPersona
    ? `Chào quý vị. ${advisor} ${seenLabel}. Quý vị muốn hỏi điều gì, cứ nói thẳng để tôi luận rõ.`
    : `A Di Đà Phật. Trụ trì ${templeName} ${seenLabel}. Quý vị muốn hỏi điều gì, cứ nói thẳng để tôi luận rõ.`;

  const messages: Array<{ role: string; content: string }> = [
    {
      role: 'system',
      content: applyPromptPersona(
        buildTuViSystemPrompt(templeName, school, {
          noVanHan: focusedVan ? false : noVanHan,
          vanHanFocus: vanHanFocus || undefined,
          daiVanFocus: daiVanFocus || undefined,
          napAmFocus: napAmFocus || undefined,
          hopTuoiFocus: hopTuoiFocus || undefined,
          haLacFocus: haLacFocus || undefined,
          dungThanFocus: dungThanFocus || undefined,
          batTuFocus: batTuFocus || undefined,
        }),
        templeName,
        promptPersona,
      ),
    },
    {
      role: 'user',
      content: `Đây là ${dataLabel} cần ${advisor} xem và luận giải (nguồn duy nhất, không bịa thêm):\n\n${chartContext}`,
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
      // Giảm nhiệt để luận bám ngữ cảnh, ít "sáng tác"; vẫn đủ tự nhiên.
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
