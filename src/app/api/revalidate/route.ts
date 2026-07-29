import { revalidatePath, revalidateTag } from 'next/cache';
import { NextResponse } from 'next/server';

/**
 * On-demand cache purge for production.
 * POST /api/revalidate?key=<ADMIN_KEY>
 * Header: x-admin-key: <ADMIN_KEY>
 */
export async function POST(request: Request) {
  const url = new URL(request.url);
  const key =
    request.headers.get('x-admin-key') ||
    url.searchParams.get('key') ||
    '';
  const configured = process.env.ADMIN_KEY;

  if (!configured || key !== configured) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  // Temple CMS data (unstable_cache tag)
  revalidateTag('temples', { expire: 0 });

  const paths = [
    '/',
    '/layout',
    '/phong-thuy',
    '/dat-nuoc',
    '/go-mo',
    '/cau-an',
    '/cau-sieu',
    '/quan-tri',
    '/quan-tri/hinh-anh',
    '/quan-tri/hoat-dong',
    '/quan-tri/phat-tu',
    '/quan-tri/lien-he',
  ];

  for (const path of paths) {
    revalidatePath(path);
  }
  // Layout-level so tenant shell refreshes
  revalidatePath('/', 'layout');

  return NextResponse.json({
    ok: true,
    revalidated: { tag: 'temples', paths },
    at: new Date().toISOString(),
  });
}

export async function GET(request: Request) {
  return POST(request);
}
