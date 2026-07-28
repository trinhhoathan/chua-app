import { requireAdmin } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { getNotifyProviderStatus } from '@/lib/notifications';
import type { BroadcastCampaign, TempleEvent } from '@/types/database';
import { BroadcastPanel } from './BroadcastPanel';

export const dynamic = 'force-dynamic';

export default async function GuiTinPage() {
  const ctx = await requireAdmin();
  const templeId = ctx.temples[0]?.id;
  if (!templeId) return null;

  const supabase = await createClient();
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
        .select('id, title, starts_at, ends_at, location, event_type, is_published')
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
        Gửi nhắc lễ / thông báo tới tối đa 5.000 Phật tử đã đồng ý nhận tin.
        Hệ thống chia nhỏ từng đợt để ổn định khi danh sách lớn.
      </p>

      <div className="mt-8">
        <BroadcastPanel
          templeId={templeId}
          templeName={ctx.temples[0]?.name ?? ''}
          audienceCount={consentCount ?? 0}
          providers={providers}
          events={(events ?? []) as Pick<
            TempleEvent,
            'id' | 'title' | 'starts_at' | 'ends_at' | 'location' | 'event_type' | 'is_published'
          >[]}
          campaigns={(campaigns ?? []) as BroadcastCampaign[]}
        />
      </div>
    </div>
  );
}
