import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import { logoutAction } from '@/app/actions/auth';
import { AdminNav } from '@/components/admin/AdminNav';
import { TempleScopePicker } from '@/components/admin/TempleScopePicker';
import { requireAdmin, getTempleById, type TempleBrief } from '@/lib/auth';
import { ADMIN_TEMPLE_COOKIE, PLATFORM_HQ } from '@/lib/platform-hq';

export async function generateMetadata(): Promise<Metadata> {
  try {
    const ctx = await requireAdmin();
    if (ctx.isSuperAdmin) {
      return {
        title: PLATFORM_HQ.title,
        description: `${PLATFORM_HQ.monastery} — ${PLATFORM_HQ.author}`,
      };
    }
    const name = ctx.temples[0]?.name ?? 'Quản trị chùa';
    return { title: `Quản trị · ${name}` };
  } catch {
    return { title: 'Quản trị' };
  }
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let ctx;
  try {
    ctx = await requireAdmin();
  } catch (e) {
    const msg = e instanceof Error ? e.message : '';
    if (msg === 'UNAUTHENTICATED') {
      redirect('/quan-tri/dang-nhap');
    }
    if (msg === 'FORBIDDEN') {
      return (
        <main className="min-h-screen flex items-center justify-center p-8">
          <div className="text-center max-w-md">
            <h1 className="font-display text-2xl text-lacquer">
              Chưa được gắn với chùa nào
            </h1>
            <p className="mt-3 text-muted text-sm">
              Tài khoản đã đăng nhập nhưng chưa có trong bảng{' '}
              <code className="bg-fog px-1">temple_admins</code>. Liên hệ
              quản trị viên nền tảng để được cấp quyền.
            </p>
            <form action={logoutAction} className="mt-6">
              <button className="px-4 py-2 bg-ink text-white text-sm">
                Đăng xuất
              </button>
            </form>
          </div>
        </main>
      );
    }
    throw e;
  }

  const cookieStore = await cookies();
  const cookieTempleId = cookieStore.get(ADMIN_TEMPLE_COOKIE)?.value ?? null;
  let selected: TempleBrief | null = null;
  if (cookieTempleId) {
    if (
      ctx.isSuperAdmin ||
      ctx.temples.some((t) => t.id === cookieTempleId)
    ) {
      selected =
        ctx.temples.find((t) => t.id === cookieTempleId) ??
        (await getTempleById(cookieTempleId));
    }
  }
  if (!ctx.isSuperAdmin && !selected && ctx.temples[0]) {
    selected = ctx.temples[0];
  }

  return (
    <div className="min-h-screen bg-mist">
      <header className="bg-ink text-white">
        <div className="mx-auto max-w-6xl px-4 md:px-6 py-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            {ctx.isSuperAdmin ? (
              <>
                <p className="text-[0.65rem] tracking-[0.3em] uppercase text-white/50">
                  {PLATFORM_HQ.eyebrow}
                </p>
                <p className="font-display text-lg">{PLATFORM_HQ.title}</p>
                <p className="text-xs text-gilt mt-0.5">
                  {PLATFORM_HQ.author} · {PLATFORM_HQ.role}
                </p>
              </>
            ) : (
              <>
                <p className="text-[0.65rem] tracking-[0.3em] uppercase text-white/50">
                  Quản trị chùa
                </p>
                <p className="font-display text-lg">
                  {selected?.name ?? ctx.temples[0]?.name ?? 'Dashboard'}
                </p>
              </>
            )}
          </div>
          <div className="flex items-center gap-3 text-sm flex-wrap justify-end">
            <Suspense fallback={null}>
              <TempleScopePicker
                isSuperAdmin={ctx.isSuperAdmin}
                temples={ctx.temples}
                selected={selected}
                templeCount={ctx.templeCount}
              />
            </Suspense>
            <span className="text-white/60 hidden sm:inline">
              {ctx.displayName
                ? `${ctx.displayName}${ctx.phone ? ` · ${ctx.phone}` : ''}`
                : (ctx.phone ?? ctx.email)}
            </span>
            <form action={logoutAction}>
              <button className="px-3 py-1.5 border border-white/25 hover:bg-white/10 text-xs">
                Đăng xuất
              </button>
            </form>
          </div>
        </div>
        <AdminNav isSuperAdmin={ctx.isSuperAdmin} />
      </header>
      <div className="mx-auto max-w-6xl px-4 md:px-6 py-8">{children}</div>
    </div>
  );
}
