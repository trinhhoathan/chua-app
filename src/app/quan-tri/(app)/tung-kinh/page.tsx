import Link from 'next/link';
import { redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import type { ChantingSchedule } from '@/types/database';
import { resolveTempleScope } from '@/lib/temple-scope';
import { TempleRequiredNotice } from '@/components/admin/TempleRequiredNotice';
import { ChantingAdminBoard } from './ChantingAdminBoard';
import { setWorkingTempleAction } from '@/app/actions/temple-scope';
import {
  CHANTING_RECURRENCE_LABELS,
  CHANTING_SCOPE_LABELS,
} from '@/types/database';
import { formatStartTimeShort } from '@/lib/chanting';

export const dynamic = 'force-dynamic';

const PAGE_SIZE = 40;

interface Props {
  searchParams: Promise<{ temple?: string; page?: string; q?: string }>;
}

export default async function TungKinhAdminPage({ searchParams }: Props) {
  const ctx = await requireAdmin();
  const sp = await searchParams;
  const scope = await resolveTempleScope(ctx, sp.temple);
  const supabase = await createClient();

  if (ctx.isSuperAdmin && scope.mode === 'all') {
    const q = (sp.q ?? '').trim();
    const page = Math.max(1, Number(sp.page ?? '1') || 1);
    const from = (page - 1) * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    let query = supabase
      .from('chanting_schedules')
      .select('*, temples(name)', { count: 'exact' })
      .order('updated_at', { ascending: false })
      .range(from, to);

    if (q) query = query.ilike('title', `%${q}%`);

    const { data, count } = await query;
    const totalPages = Math.max(1, Math.ceil((count ?? 0) / PAGE_SIZE));

    return (
      <div>
        <h1 className="font-display text-3xl text-ink">
          Tụng kinh trực tuyến — toàn hệ
        </h1>
        <p className="mt-2 text-sm text-muted max-w-2xl leading-relaxed">
          Theo dõi lịch livestream YouTube của các Phật tự. Chọn một chùa để tạo
          hoặc sửa lịch.
        </p>

        <form
          className="mt-6 flex gap-2"
          action="/quan-tri/tung-kinh"
          method="get"
        >
          <input
            name="q"
            defaultValue={q}
            placeholder="Tìm tiêu đề…"
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
                <th className="p-3">Tiêu đề</th>
                <th className="p-3">Phật tự</th>
                <th className="p-3">Lịch</th>
                <th className="p-3">Hiển thị</th>
                <th className="p-3">Live</th>
                <th className="p-3" />
              </tr>
            </thead>
            <tbody>
              {(data ?? []).length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-muted">
                    Chưa có lịch tụng kinh.
                  </td>
                </tr>
              ) : (
                (data ?? []).map((row) => {
                  const r = row as ChantingSchedule & {
                    temples?: { name: string } | null;
                  };
                  return (
                    <tr key={r.id} className="border-t border-fog">
                      <td className="p-3 font-medium">{r.title}</td>
                      <td className="p-3">{r.temples?.name ?? '—'}</td>
                      <td className="p-3">
                        {CHANTING_RECURRENCE_LABELS[r.recurrence]} ·{' '}
                        {formatStartTimeShort(r.start_time)}
                      </td>
                      <td className="p-3">
                        {CHANTING_SCOPE_LABELS[r.display_scope]}
                      </td>
                      <td className="p-3">
                        {r.is_live ? (
                          <span className="text-red-700 font-medium">LIVE</span>
                        ) : (
                          '—'
                        )}
                      </td>
                      <td className="p-3 text-right">
                        <form action={openTempleChanting.bind(null, r.temple_id)}>
                          <button
                            type="submit"
                            className="text-xs underline text-ink"
                          >
                            Mở
                          </button>
                        </form>
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
                href={`/quan-tri/tung-kinh?q=${encodeURIComponent(q)}&page=${page - 1}`}
                className="px-3 py-1.5 border border-fog bg-paper"
              >
                Trước
              </Link>
            ) : null}
            {page < totalPages ? (
              <Link
                href={`/quan-tri/tung-kinh?q=${encodeURIComponent(q)}&page=${page + 1}`}
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

  const templeId = scope.templeId;
  if (!templeId || !scope.temple) {
    return <TempleRequiredNotice feature="Tụng kinh trực tuyến" />;
  }

  const { data } = await supabase
    .from('chanting_schedules')
    .select('*')
    .eq('temple_id', templeId)
    .order('sort_order', { ascending: false })
    .order('start_time', { ascending: true });

  const schedules = (data ?? []) as ChantingSchedule[];

  return (
    <div>
      <h1 className="font-display text-3xl text-ink">Tụng kinh trực tuyến</h1>
      <p className="mt-2 text-sm text-muted max-w-2xl leading-relaxed">
        {scope.temple.name} — đặt lịch tụng kinh livestream YouTube. Đến giờ,
        Phật tử vào trang gõ mõ / trang chủ để tụng cùng sư phụ. Video đi qua
        CDN YouTube, không tốn băng thông server.
      </p>

      <div className="mt-8">
        <ChantingAdminBoard templeId={templeId} schedules={schedules} />
      </div>
    </div>
  );
}

async function openTempleChanting(templeId: string) {
  'use server';
  await setWorkingTempleAction(templeId);
  redirect('/quan-tri/tung-kinh');
}
