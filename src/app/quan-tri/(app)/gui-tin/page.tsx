import Link from 'next/link';
import { redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { getNotifyProviderStatus } from '@/lib/notifications';
import type { BroadcastCampaign, TempleEvent } from '@/types/database';
import { resolveTempleScope } from '@/lib/temple-scope';
import { TempleRequiredNotice } from '@/components/admin/TempleRequiredNotice';
import { BroadcastPanel } from './BroadcastPanel';
import { setWorkingTempleAction } from '@/app/actions/temple-scope';

export const dynamic = 'force-dynamic';

const PAGE_SIZE = 30;

interface Props {
  searchParams: Promise<{ temple?: string; page?: string }>;
}

export default async function GuiTinPage({ searchParams }: Props) {
  const ctx = await requireAdmin();
  const sp = await searchParams;
  const scope = await resolveTempleScope(ctx, sp.temple);
  const supabase = await createClient();

  if (ctx.isSuperAdmin && scope.mode === 'all') {
    const page = Math.max(1, Number(sp.page ?? '1') || 1);
    const from = (page - 1) * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    const { data, count } = await supabase
      .from('broadcast_campaigns')
      .select('*, temples(name)', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to);

    const totalPages = Math.max(1, Math.ceil((count ?? 0) / PAGE_SIZE));

    return (
      <div>
        <h1 className="font-display text-3xl text-ink">
          Quản trị tin nhắn quảng bá
        </h1>
        <p className="mt-2 text-sm text-muted max-w-2xl leading-relaxed">
          Theo dõi chiến dịch gửi tin của các Phật tự. Chọn một chùa để tạo /
          gửi chiến dịch mới.
        </p>

        <div className="mt-8 overflow-x-auto border border-fog bg-paper">
          <table className="w-full text-sm">
            <thead className="text-left text-muted bg-mist">
              <tr>
                <th className="p-3">Tiêu đề</th>
                <th className="p-3">Phật tự</th>
                <th className="p-3">Kênh</th>
                <th className="p-3">Trạng thái</th>
                <th className="p-3 text-right">Đã gửi</th>
                <th className="p-3" />
              </tr>
            </thead>
            <tbody>
              {(data ?? []).length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-muted">
                    Chưa có chiến dịch.
                  </td>
                </tr>
              ) : (
                (data ?? []).map((c) => {
                  const templeName =
                    (c.temples as { name?: string } | null)?.name ?? '—';
                  return (
                    <tr key={c.id} className="border-t border-fog">
                      <td className="p-3 font-medium">{c.title}</td>
                      <td className="p-3 text-muted">{templeName}</td>
                      <td className="p-3">{c.channel}</td>
                      <td className="p-3">{c.status}</td>
                      <td className="p-3 text-right tabular-nums">
                        {c.sent_count}/{c.total_recipients}
                      </td>
                      <td className="p-3 text-right">
                        <form action={openTempleTin.bind(null, c.temple_id)}>
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
                href={`/quan-tri/gui-tin?page=${page - 1}`}
                className="px-3 py-1.5 border border-fog bg-paper"
              >
                Trước
              </Link>
            ) : null}
            {page < totalPages ? (
              <Link
                href={`/quan-tri/gui-tin?page=${page + 1}`}
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
    return <TempleRequiredNotice feature="Gửi tin nhắn" />;
  }

  const [{ data: campaigns }, { data: events }, { count: consentCount }] =
    await Promise.all([
      supabase
        .from('broadcast_campaigns')
        .select('*')
        .eq('temple_id', templeId)
        .order('created_at', { ascending: false })
        .limit(20),
      supabase
        .from('temple_events')
        .select(
          'id, title, starts_at, ends_at, location, event_type, is_published',
        )
        .eq('temple_id', templeId)
        .gt('ends_at', new Date().toISOString())
        .order('starts_at', { ascending: true })
        .limit(30),
      supabase
        .from('devotees')
        .select('id', { count: 'exact', head: true })
        .eq('temple_id', templeId)
        .eq('consent_contact', true)
        .not('phone', 'is', null),
    ]);

  const providers = getNotifyProviderStatus();

  return (
    <div>
      <h1 className="font-display text-3xl text-ink">Gửi tin Phật tử</h1>
      <p className="mt-2 text-sm text-muted max-w-2xl leading-relaxed">
        {scope.temple.name} — gửi nhắc lễ / thông báo tới Phật tử đã đồng ý nhận
        tin.
      </p>

      <div className="mt-8">
        <BroadcastPanel
          templeId={templeId}
          templeName={scope.temple.name}
          audienceCount={consentCount ?? 0}
          providers={providers}
          events={
            (events ?? []) as Pick<
              TempleEvent,
              | 'id'
              | 'title'
              | 'starts_at'
              | 'ends_at'
              | 'location'
              | 'event_type'
              | 'is_published'
            >[]
          }
          campaigns={(campaigns ?? []) as BroadcastCampaign[]}
        />
      </div>
    </div>
  );
}

async function openTempleTin(templeId: string) {
  'use server';
  await setWorkingTempleAction(templeId);
  redirect('/quan-tri/gui-tin');
}
