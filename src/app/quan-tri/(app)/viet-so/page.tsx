import Link from 'next/link';
import { requireAdmin } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import type { SoHousehold } from '@/types/database';
import { resolveTempleScope } from '@/lib/temple-scope';
import { TempleRequiredNotice } from '@/components/admin/TempleRequiredNotice';

export const dynamic = 'force-dynamic';

const PAGE_SIZE = 40;

interface Props {
  searchParams: Promise<{ temple?: string; page?: string; q?: string }>;
}

export default async function VietSoPage({ searchParams }: Props) {
  const ctx = await requireAdmin();
  const sp = await searchParams;
  const scope = await resolveTempleScope(ctx, sp.temple);
  const supabase = await createClient();

  const templeId = scope.templeId;
  if (!templeId || !scope.temple) {
    return <TempleRequiredNotice feature="Viết sớ" />;
  }

  const q = (sp.q ?? '').trim();
  const page = Math.max(1, Number(sp.page ?? '1') || 1);
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  let query = supabase
    .from('so_households')
    .select('*', { count: 'exact' })
    .eq('temple_id', templeId)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
    .range(from, to);

  if (q) query = query.ilike('chu_ho', `%${q}%`);

  const { data, count } = await query;
  const households = (data ?? []) as SoHousehold[];
  const totalPages = Math.max(1, Math.ceil((count ?? 0) / PAGE_SIZE));

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-ink">Viết sớ</h1>
          <p className="mt-2 text-sm text-muted max-w-2xl leading-relaxed">
            {scope.temple.name} — quản lý hộ tín chủ, gia tiên và in sớ.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/quan-tri/viet-so/moi"
            className="px-4 py-2 bg-ink text-white text-sm"
          >
            Thêm hộ
          </Link>
          <Link
            href="/quan-tri/viet-so/import"
            className="px-4 py-2 border border-fog bg-paper text-sm hover:bg-mist"
          >
            Import Excel
          </Link>
          <Link
            href="/quan-tri/viet-so/in"
            className="px-4 py-2 border border-fog bg-paper text-sm hover:bg-mist"
          >
            In sớ
          </Link>
        </div>
      </div>

      <form className="mt-6 flex gap-2" action="/quan-tri/viet-so" method="get">
        <input
          name="q"
          defaultValue={q}
          placeholder="Tìm theo tên chủ hộ…"
          className="flex-1 max-w-md px-3 py-2 text-sm border border-fog bg-paper"
        />
        <button type="submit" className="px-4 py-2 bg-ink text-white text-sm">
          Tìm
        </button>
      </form>

      <div className="mt-4 overflow-x-auto border border-fog bg-paper">
        <table className="w-full text-sm">
          <thead className="text-left text-muted bg-mist">
            <tr>
              <th className="p-3">Chủ hộ</th>
              <th className="p-3">Điện thoại</th>
              <th className="p-3">Địa chỉ</th>
              <th className="p-3">Nơi cúng</th>
              <th className="p-3" />
            </tr>
          </thead>
          <tbody>
            {households.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-6 text-center text-muted">
                  Chưa có hộ nào. Thêm hộ mới hoặc import Excel.
                </td>
              </tr>
            ) : (
              households.map((h) => {
                const addr = [
                  h.dia_chi_chi_tiet,
                  h.dia_chi_xa,
                  h.dia_chi_huyen,
                  h.dia_chi_tinh,
                ]
                  .filter(Boolean)
                  .join(', ');
                return (
                  <tr key={h.id} className="border-t border-fog">
                    <td className="p-3 font-medium">{h.chu_ho}</td>
                    <td className="p-3 text-muted">{h.phone ?? '—'}</td>
                    <td className="p-3 text-muted text-xs max-w-xs truncate">
                      {addr || '—'}
                    </td>
                    <td className="p-3 text-muted">{h.noi_cung ?? '—'}</td>
                    <td className="p-3 text-right whitespace-nowrap">
                      <Link
                        href={`/quan-tri/viet-so/${h.id}`}
                        className="text-xs px-2 py-1 border border-ink/20 hover:bg-mist mr-1"
                      >
                        Sửa
                      </Link>
                      <Link
                        href={`/quan-tri/viet-so/in?household=${h.id}`}
                        className="text-xs px-2 py-1 border border-ink/20 hover:bg-mist"
                      >
                        In sớ
                      </Link>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 ? (
        <div className="mt-4 flex gap-2 text-sm">
          {page > 1 ? (
            <Link
              href={`/quan-tri/viet-so?q=${encodeURIComponent(q)}&page=${page - 1}`}
              className="px-3 py-1.5 border border-fog bg-paper"
            >
              Trước
            </Link>
          ) : null}
          <span className="px-2 py-1.5 text-muted">
            Trang {page}/{totalPages}
          </span>
          {page < totalPages ? (
            <Link
              href={`/quan-tri/viet-so?q=${encodeURIComponent(q)}&page=${page + 1}`}
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
