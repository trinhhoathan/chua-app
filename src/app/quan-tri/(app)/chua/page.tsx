import Link from 'next/link';
import { redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { setWorkingTempleAction } from '@/app/actions/temple-scope';

export const dynamic = 'force-dynamic';

const PAGE_SIZE = 30;

interface Props {
  searchParams: Promise<{ q?: string; page?: string }>;
}

export default async function ChuaListPage({ searchParams }: Props) {
  const ctx = await requireAdmin();
  if (!ctx.isSuperAdmin) redirect('/quan-tri');

  const sp = await searchParams;
  const q = (sp.q ?? '').trim();
  const page = Math.max(1, Number(sp.page ?? '1') || 1);
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const supabase = await createClient();
  let query = supabase
    .from('temples')
    .select('id, name, domain, address, is_active, abbott_name, primary_color', {
      count: 'exact',
    })
    .order('name')
    .range(from, to);

  if (q) {
    query = query.or(`name.ilike.%${q}%,domain.ilike.%${q}%`);
  }

  const { data, count } = await query;
  const total = count ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-ink">Danh sách Phật tự</h1>
          <p className="mt-2 text-sm text-muted max-w-2xl">
            Quản trị danh mục Phật tự. Thêm mới để tạo template trang chùa; chọn
            «Làm việc tại đây» để chỉnh nội dung sâu.
          </p>
        </div>
        <Link
          href="/quan-tri/chua/moi"
          className="shrink-0 px-4 py-2.5 bg-ink text-white text-sm"
        >
          Thêm Phật tự
        </Link>
      </div>

      <form className="mt-6 flex gap-2" action="/quan-tri/chua" method="get">
        <input
          name="q"
          defaultValue={q}
          placeholder="Tìm tên hoặc domain…"
          className="flex-1 max-w-md px-3 py-2 text-sm border border-fog bg-paper"
        />
        <button type="submit" className="px-4 py-2 bg-ink text-white text-sm">
          Tìm
        </button>
      </form>

      <p className="mt-4 text-xs text-muted">
        {total.toLocaleString('vi-VN')} kết quả
        {totalPages > 1 ? ` · trang ${page}/${totalPages}` : ''}
      </p>

      <div className="mt-4 overflow-x-auto border border-fog bg-paper">
        <table className="w-full text-sm">
          <thead className="text-left text-muted bg-mist">
            <tr>
              <th className="p-3">Tên</th>
              <th className="p-3">Domain</th>
              <th className="p-3">Trụ trì</th>
              <th className="p-3">Trạng thái</th>
              <th className="p-3" />
            </tr>
          </thead>
          <tbody>
            {(data ?? []).length === 0 ? (
              <tr>
                <td colSpan={5} className="p-6 text-center text-muted">
                  Không có Phật tự phù hợp.
                </td>
              </tr>
            ) : (
              (data ?? []).map((t) => (
                <tr key={t.id} className="border-t border-fog">
                  <td className="p-3">
                    <span className="inline-flex items-center gap-2 font-medium">
                      {t.primary_color ? (
                        <span
                          className="inline-block h-3 w-3 shrink-0 border border-fog"
                          style={{ backgroundColor: String(t.primary_color) }}
                        />
                      ) : null}
                      {t.name}
                    </span>
                  </td>
                  <td className="p-3 text-muted">{t.domain}</td>
                  <td className="p-3">{t.abbott_name ?? '—'}</td>
                  <td className="p-3">
                    {t.is_active ? (
                      <span className="text-xs text-gilt">Active</span>
                    ) : (
                      <span className="text-xs text-muted">Tắt</span>
                    )}
                  </td>
                  <td className="p-3 text-right whitespace-nowrap">
                    <Link
                      href={`/quan-tri/chua/${t.id}/sua`}
                      className="text-xs px-2 py-1 border border-ink/20 hover:bg-mist mr-1"
                    >
                      Sửa
                    </Link>
                    <form
                      className="inline"
                      action={selectTemple.bind(null, t.id)}
                    >
                      <button
                        type="submit"
                        className="text-xs px-2 py-1 border border-ink/20 hover:bg-mist"
                      >
                        Làm việc tại đây
                      </button>
                    </form>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 ? (
        <div className="mt-4 flex gap-2 text-sm">
          {page > 1 ? (
            <Link
              href={`/quan-tri/chua?q=${encodeURIComponent(q)}&page=${page - 1}`}
              className="px-3 py-1.5 border border-fog bg-paper"
            >
              Trước
            </Link>
          ) : null}
          {page < totalPages ? (
            <Link
              href={`/quan-tri/chua?q=${encodeURIComponent(q)}&page=${page + 1}`}
              className="px-3 py-1.5 border border-fog bg-paper"
            >
              Sau
            </Link>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

async function selectTemple(templeId: string) {
  'use server';
  await setWorkingTempleAction(templeId);
  redirect('/quan-tri');
}
