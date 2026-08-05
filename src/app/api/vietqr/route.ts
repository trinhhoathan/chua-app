import { NextRequest, NextResponse } from 'next/server';

/**
 * Proxy ảnh QR SePay (vietqr.app) — same-origin để mobile lưu/chia sẻ không bị CORS.
 * Chỉ forward các tham số an toàn theo docs SePay.
 */
const ALLOWED = new Set([
  'acc',
  'bank',
  'amount',
  'des',
  'template',
  'showinfo',
  'fullacc',
  'holder',
  'store',
  'download',
]);

export async function GET(req: NextRequest) {
  const src = req.nextUrl.searchParams;
  const acc = (src.get('acc') || '').replace(/\s+/g, '');
  const bank = (src.get('bank') || '').trim();
  if (!acc || !bank) {
    return NextResponse.json(
      { error: 'Thiếu acc hoặc bank' },
      { status: 400 },
    );
  }
  if (!/^[A-Za-z0-9]{4,19}$/.test(acc)) {
    return NextResponse.json({ error: 'acc không hợp lệ' }, { status: 400 });
  }

  const out = new URLSearchParams();
  for (const [k, v] of src.entries()) {
    const key = k.toLowerCase();
    if (!ALLOWED.has(key) || !v) continue;
    out.set(key, v);
  }
  out.set('acc', acc);
  out.set('bank', bank);

  const upstream = `https://vietqr.app/img?${out.toString()}`;
  const res = await fetch(upstream, {
    headers: { Accept: 'image/*' },
    cache: 'no-store',
  });
  if (!res.ok) {
    return NextResponse.json(
      { error: `SePay QR lỗi ${res.status}` },
      { status: 502 },
    );
  }

  const contentType = res.headers.get('content-type') || 'image/png';
  const buf = await res.arrayBuffer();
  return new NextResponse(buf, {
    status: 200,
    headers: {
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=60',
    },
  });
}
