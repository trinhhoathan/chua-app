import Link from 'next/link';
import { redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/auth';
import { logoutAction } from '@/app/actions/auth';

const NAV = [
  { href: '/quan-tri', label: 'Tổng quan' },
  { href: '/quan-tri/hoat-dong', label: 'Hoạt động' },
  { href: '/quan-tri/gui-tin', label: 'Gửi tin' },
  { href: '/quan-tri/don-hang', label: 'Thỉnh nước' },
  { href: '/quan-tri/don-gia', label: 'Đơn giá' },
  { href: '/quan-tri/lien-he', label: 'Liên hệ' },
  { href: '/quan-tri/doi-soat', label: 'Đối soát' },
  { href: '/quan-tri/so-cau', label: 'Sớ cầu an/siêu' },
  { href: '/quan-tri/phat-tu', label: 'Phật tử' },
  { href: '/quan-tri/kho', label: 'Kho vận' },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Login page has its own layout branch via route group — this layout
  // wraps authenticated pages. dang-nhap is outside this folder structure
  // wait - dang-nhap is under quan-tri so it would use this layout.
  // We'll detect UNAUTHENTICATED and not force here for dang-nhap —
  // actually dang-nhap should NOT use this layout. Use a route group.

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

  return (
    <div className="min-h-screen bg-mist">
      <header className="bg-ink text-white">
        <div className="mx-auto max-w-6xl px-4 md:px-6 py-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[0.65rem] tracking-[0.3em] uppercase text-white/50">
              Quản trị chùa
            </p>
            <p className="font-display text-lg">
              {ctx.temples[0]?.name ?? 'Dashboard'}
              {ctx.isSuperAdmin ? (
                <span className="ml-2 text-xs text-gilt">Super admin</span>
              ) : null}
            </p>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span className="text-white/60 hidden sm:inline">{ctx.email}</span>
            <form action={logoutAction}>
              <button className="px-3 py-1.5 border border-white/25 hover:bg-white/10 text-xs">
                Đăng xuất
              </button>
            </form>
          </div>
        </div>
        <nav className="border-t border-white/10">
          <div className="mx-auto max-w-6xl px-4 md:px-6 flex gap-1 overflow-x-auto no-scrollbar">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="shrink-0 px-3 py-2.5 text-sm text-white/70 hover:text-white border-b-2 border-transparent hover:border-gilt"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </nav>
      </header>
      <div className="mx-auto max-w-6xl px-4 md:px-6 py-8">{children}</div>
    </div>
  );
}
