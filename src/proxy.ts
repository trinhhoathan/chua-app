import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

/**
 * Chỉ xác thực Supabase trên khu vực /quan-tri.
 * Trang public không gọi auth.getUser() — tránh +300–400ms mỗi request
 * (Vercel US ↔ Supabase).
 */
export async function proxy(request: NextRequest) {
  const host = request.headers.get('host') || '';
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-current-domain', host);

  const path = request.nextUrl.pathname;
  const isAdminArea = path.startsWith('/quan-tri');

  if (!isAdminArea) {
    return NextResponse.next({
      request: { headers: requestHeaders },
    });
  }

  let supabaseResponse = NextResponse.next({
    request: { headers: requestHeaders },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({
            request: { headers: requestHeaders },
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isLoginPage = path.startsWith('/quan-tri/dang-nhap');

  if (!isLoginPage && !user) {
    // Allow legacy ADMIN_KEY query for doi-soat during transition.
    const key = request.nextUrl.searchParams.get('key');
    const adminKey = process.env.ADMIN_KEY;
    if (!(key && adminKey && key === adminKey)) {
      const url = request.nextUrl.clone();
      url.pathname = '/quan-tri/dang-nhap';
      url.searchParams.set('next', path);
      return NextResponse.redirect(url);
    }
  }

  if (isLoginPage && user) {
    const url = request.nextUrl.clone();
    url.pathname = '/quan-tri';
    url.search = '';
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Bỏ qua static assets — không chạy proxy (kể cả font viết sớ).
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|map|txt|xml|woff2?|ttf|otf|mp3|wav|webm|mp4)$).*)',
  ],
};
