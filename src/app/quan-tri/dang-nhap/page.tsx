import { loginAction } from '@/app/actions/auth';

interface Props {
  searchParams: Promise<{ error?: string; next?: string }>;
}

export default async function LoginPage({ searchParams }: Props) {
  const sp = await searchParams;
  const next = sp.next ?? '/quan-tri';

  return (
    <main className="min-h-screen bg-mist flex items-center justify-center px-6">
      <div className="w-full max-w-md bg-paper border border-fog p-8">
        <p className="text-[0.7rem] tracking-[0.3em] uppercase text-lacquer mb-2">
          Quản trị chùa
        </p>
        <h1 className="font-display text-3xl text-ink">Đăng nhập</h1>
        <p className="mt-2 text-sm text-muted">
          Dùng số điện thoại và mật khẩu 6 số. Trụ trì chỉ thấy dữ liệu chùa được
          gán; quản trị viên nền tảng thấy tất cả.
        </p>

        {sp.error ? (
          <p className="mt-4 text-sm text-lacquer bg-lacquer/5 border border-lacquer/20 p-3">
            {sp.error}
          </p>
        ) : null}

        <form action={loginAction} className="mt-6 space-y-4">
          <input type="hidden" name="next" value={next} />
          <label className="block text-xs text-muted">
            Số điện thoại
            <input
              type="tel"
              name="phone"
              required
              inputMode="numeric"
              autoComplete="username"
              pattern="0[0-9]{9}"
              maxLength={14}
              className="mt-1 w-full px-3 py-2 border border-fog bg-white text-ink tracking-wide"
              placeholder="0981666568"
            />
          </label>
          <label className="block text-xs text-muted">
            Mật khẩu (6 số)
            <input
              type="password"
              name="password"
              required
              inputMode="numeric"
              autoComplete="current-password"
              pattern="[0-9]{6}"
              maxLength={6}
              className="mt-1 w-full px-3 py-2 border border-fog bg-white text-ink tracking-[0.35em]"
              placeholder="••••••"
            />
          </label>
          <button
            type="submit"
            className="w-full py-3 text-sm text-white bg-ink hover:bg-jade-deep"
          >
            Đăng nhập
          </button>
        </form>
      </div>
    </main>
  );
}
