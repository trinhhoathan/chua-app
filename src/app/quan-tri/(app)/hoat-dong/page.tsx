import { requireAdmin } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import type { TempleEvent } from '@/types/database';
import { TEMPLE_EVENT_TYPE_LABELS } from '@/types/database';
import { EventsAdminBoard } from './EventsAdminBoard';

export const dynamic = 'force-dynamic';

export default async function HoatDongAdminPage() {
  const ctx = await requireAdmin();
  const templeId = ctx.temples[0]?.id;
  if (!templeId) return null;

  const supabase = await createClient();
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
        Trụ trì đăng các lễ, khóa tu, hoạt động của chùa. Card sẽ tự đếm ngược
        trên trang chủ và ẩn khi qua ngày kết thúc.
      </p>

      <div className="mt-8">
        <EventsAdminBoard
          templeId={templeId}
          templeName={ctx.temples[0]?.name ?? ''}
          events={events}
          typeLabels={TEMPLE_EVENT_TYPE_LABELS}
        />
      </div>
    </div>
  );
}
