import Link from 'next/link';
import { requireAdmin } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import type { PrayerRequest } from '@/types/database';
import { PrayerStatusForm } from './PrayerStatusForm';

const TYPE_LABEL = { cau_an: 'Cầu an', cau_sieu: 'Cầu siêu' };
const STATUS_LABEL: Record<string, string> = {
  pending: 'Chờ duyệt',
  approved: 'Đã duyệt',
  printed: 'Đã in',
  completed: 'Hoàn tất',
  cancelled: 'Huỷ',
};

export default async function SoCauAdminPage() {
  const ctx = await requireAdmin();
  const templeId = ctx.temples[0]?.id;
  const supabase = await createClient();

  const { data } = templeId
    ? await supabase
        .from('prayer_requests')
        .select('*')
        .eq('temple_id', templeId)
        .order('created_at', { ascending: false })
        .limit(100)
    : { data: [] };

  const rows = (data ?? []) as PrayerRequest[];

  return (
    <div>
      <h1 className="font-display text-3xl text-ink">Sổ cầu an / cầu siêu</h1>
      <p className="mt-2 text-sm text-muted">
        Phật tử đăng ký tại{' '}
        <Link href="/so-cau" className="underline">
          /so-cau
        </Link>
      </p>

      <div className="mt-8 space-y-3">
        {rows.length === 0 ? (
          <p className="text-muted text-sm">Chưa có sớ nào.</p>
        ) : (
          rows.map((r) => (
            <article
              key={r.id}
              className="border border-fog bg-paper p-4 flex flex-col md:flex-row md:items-start gap-4 justify-between"
            >
              <div>
                <p className="text-[10px] uppercase tracking-widest text-muted">
                  {TYPE_LABEL[r.request_type]} · {STATUS_LABEL[r.status]}
                </p>
                <p className="font-display text-lg text-ink mt-1">
                  {r.devotee_names}
                </p>
                <p className="text-xs text-muted mt-1">
                  Người đăng ký: {r.requester_name}
                  {r.requester_phone ? ` · ${r.requester_phone}` : ''}
                </p>
                {r.note ? (
                  <p className="text-xs text-muted mt-2">{r.note}</p>
                ) : null}
              </div>
              <div className="flex flex-wrap gap-2 items-center">
                <Link
                  href={`/quan-tri/so-cau/${r.id}/in`}
                  className="px-3 py-1.5 text-xs border border-fog hover:bg-mist"
                >
                  In sớ
                </Link>
                <PrayerStatusForm
                  id={r.id}
                  templeId={r.temple_id}
                  status={r.status}
                />
              </div>
            </article>
          ))
        )}
      </div>
    </div>
  );
}
