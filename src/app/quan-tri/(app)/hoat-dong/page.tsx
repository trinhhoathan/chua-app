import Link from 'next/link';
import { redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import type { TempleEvent } from '@/types/database';
import { TEMPLE_EVENT_TYPE_LABELS } from '@/types/database';
import { resolveTempleScope } from '@/lib/temple-scope';
import { TempleRequiredNotice } from '@/components/admin/TempleRequiredNotice';
import { EventsAdminBoard } from './EventsAdminBoard';
import { setWorkingTempleAction } from '@/app/actions/temple-scope';

export const dynamic = 'force-dynamic';

const PAGE_SIZE = 40;

interface Props {
  searchParams: Promise<{ temple?: string; page?: string; q?: string }>;
}

export default async function HoatDongAdminPage({ searchParams }: Props) {
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
      .from('temple_events')
      .select('*, temples(name)', { count: 'exact' })
      .order('starts_at', { ascending: false })
      .range(from, to);

    if (q) query = query.ilike('title', `%${q}%`);

    const { data, count } = await query;
    const totalPages = Math.max(1, Math.ceil((count ?? 0) / PAGE_SIZE));

    return (
      <div>
        <h1 className="font-display text-3xl text-ink">
          Quản trị hoạt động các Phật tự
        </h1>
        <p className="mt-2 text-sm text-muted max-w-2xl leading-relaxed">
          Theo dõi lễ / khóa tu / sự kiện toàn hệ. Chọn một Phật tự để tạo hoặc
          sửa hoạt động.
        </p>

        <form className="mt-6 flex gap-2" action="/quan-tri/hoat-dong" method="get">
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
                <th className="p-3">Loại</th>
                <th className="p-3">Bắt đầu</th>
                <th className="p-3">Công bố</th>
                <th className="p-3" />
              </tr>
            </thead>
            <tbody>
              {(data ?? []).length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-muted">
                    Không có hoạt động.
                  </td>
                </tr>
              ) : (
                (data ?? []).map((e) => {
                  const templeName =
                    (e.temples as { name?: string } | null)?.name ?? '—';
                  const type = e.event_type as keyof typeof TEMPLE_EVENT_TYPE_LABELS;
                  return (
                    <tr key={e.id} className="border-t border-fog">
                      <td className="p-3 font-medium">{e.title}</td>
                      <td className="p-3 text-muted">{templeName}</td>
                      <td className="p-3 text-xs">
                        {TEMPLE_EVENT_TYPE_LABELS[type] ?? e.event_type}
                      </td>
                      <td className="p-3 text-xs tabular-nums">
                        {new Intl.DateTimeFormat('vi-VN', {
                          dateStyle: 'short',
                          timeStyle: 'short',
                        }).format(new Date(e.starts_at))}
                      </td>
                      <td className="p-3 text-xs">
                        {e.is_published ? 'Có' : 'Ẩn'}
                      </td>
                      <td className="p-3 text-right">
                        <form action={openTempleEvent.bind(null, e.temple_id)}>
                          <button
                            type="submit"
                            className="text-xs px-2 py-1 border border-ink/20 hover:bg-mist"
                          >
                            Mở chùa
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
                href={`/quan-tri/hoat-dong?q=${encodeURIComponent(q)}&page=${page - 1}`}
                className="px-3 py-1.5 border border-fog bg-paper"
              >
                Trước
              </Link>
            ) : null}
            {page < totalPages ? (
              <Link
                href={`/quan-tri/hoat-dong?q=${encodeURIComponent(q)}&page=${page + 1}`}
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
    return <TempleRequiredNotice feature="Hoạt động" />;
  }

  const { data } = await supabase
    .from('temple_events')
    .select('*')
    .eq('temple_id', templeId)
    .order('starts_at', { ascending: false });

  const events = (data ?? []) as TempleEvent[];

  return (
    <div>
      <h1 className="font-display text-3xl text-ink">Hoạt động & Sự kiện</h1>
      <p className="mt-2 text-sm text-muted max-w-2xl leading-relaxed">
        {scope.temple.name} — đăng các lễ, khóa tu, hoạt động. Card tự đếm ngược
        trên trang chủ và ẩn khi qua ngày kết thúc.
      </p>

      <div className="mt-8">
        <EventsAdminBoard
          templeId={templeId}
          templeName={scope.temple.name}
          events={events}
          typeLabels={TEMPLE_EVENT_TYPE_LABELS}
        />
      </div>
    </div>
  );
}

async function openTempleEvent(templeId: string) {
  'use server';
  await setWorkingTempleAction(templeId);
  redirect('/quan-tri/hoat-dong');
}
