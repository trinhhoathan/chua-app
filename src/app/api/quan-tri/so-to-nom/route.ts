import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { hasLatinResidue, toHanName } from '@/lib/so-render/han-names';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const DEEPSEEK_URL = 'https://api.deepseek.com/chat/completions';

type Kind = 'name' | 'address' | 'phrase';

type Body = {
  text?: string;
  kind?: Kind;
};

function systemPrompt(kind: Kind): string {
  const role =
    kind === 'address'
      ? 'địa chỉ Việt Nam trên sớ điệp'
      : kind === 'name'
        ? 'họ tên người Việt / xung hô trên sớ điệp'
        : 'cụm từ Quốc ngữ trên sớ điệp';
  return [
    'Bạn là chuyên gia Hán Nôm Việt Nam.',
    `Chuyển ${role} từ Quốc ngữ sang chữ Hán/Nôm phồn thể dùng khi viết sớ.`,
    'Chỉ trả về chuỗi chữ Hán/Nôm (và chữ số Hán nếu có số), không giải thích, không dấu câu Latin, không khoảng trắng thừa.',
    'Số Ả Rập chuyển thành chữ số Hán (ví dụ 1999 → 一九九九, 52 → 五二).',
    'Ưu tiên chữ Hán Việt thông dụng trong tên người và địa danh (阮陳黎范黃武…, 河內, 胡志明…).',
    'Nếu là xung hô (con, vợ, chồng…) dùng chữ Hán tương ứng phổ biến trên sớ (子、妻、夫…).',
  ].join(' ');
}

export async function POST(req: Request) {
  try {
    await requireAdmin();
  } catch (err) {
    const msg = err instanceof Error ? err.message : '';
    if (msg === 'UNAUTHENTICATED') {
      return NextResponse.json({ error: 'Chưa đăng nhập.' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Không có quyền.' }, { status: 403 });
  }

  const apiKey = process.env.DEEPSEEK_API_KEY;
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: 'Yêu cầu không hợp lệ.' }, { status: 400 });
  }

  const text = (body.text ?? '').trim();
  const kind: Kind =
    body.kind === 'address' || body.kind === 'phrase' ? body.kind : 'name';

  if (!text) {
    return NextResponse.json({ error: 'Thiếu văn bản.' }, { status: 400 });
  }
  if (text.length > 500) {
    return NextResponse.json({ error: 'Văn bản quá dài.' }, { status: 400 });
  }

  const local = toHanName(text);
  if (!hasLatinResidue(local)) {
    return NextResponse.json({ nom: local, source: 'dict' });
  }

  if (!apiKey) {
    return NextResponse.json({
      nom: local,
      source: 'dict',
      warning: 'Chưa cấu hình DEEPSEEK_API_KEY — dùng từ điển local.',
    });
  }

  const upstream = await fetch(DEEPSEEK_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      stream: false,
      temperature: 0.2,
      messages: [
        { role: 'system', content: systemPrompt(kind) },
        {
          role: 'user',
          content: `Quốc ngữ: ${text}\nGợi ý từ điển (có thể còn Latin): ${local}\nChữ Nôm:`,
        },
      ],
    }),
  });

  if (!upstream.ok) {
    return NextResponse.json({ nom: local, source: 'dict', warning: 'AI tạm lỗi.' });
  }

  const json = (await upstream.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  let nom = (json.choices?.[0]?.message?.content ?? '').trim();
  nom = nom
    .replace(/^["'「『]|["'」』]$/g, '')
    .replace(/\s+/g, '')
    .replace(/^ChữNôm:|^Nom:|^漢:|^Nôm:/i, '');

  if (!nom || hasLatinResidue(nom)) {
    // Ghép: giữ phần Hán từ AI nếu có, còn không thì local
    const merged = nom && !hasLatinResidue(nom) ? nom : local;
    return NextResponse.json({ nom: merged, source: 'dict' });
  }

  return NextResponse.json({ nom, source: 'ai' });
}
