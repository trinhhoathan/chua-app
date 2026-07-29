import { requireAdmin } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import type { Devotee } from '@/types/database';
import { PhatTuBoard } from './PhatTuBoard';

export const dynamic = 'force-dynamic';

export default async function PhatTuPage() {
  const ctx = await requireAdmin();
  const templeId = ctx.temples[0]?.id;
  if (!templeId) return null;

  const supabase = await createClient();
  const { data } = await supabase
    .from('devotees')
    .select('*')
    .eq('temple_id', templeId)
    .order('created_at', { ascending: false });

  const rows = (data ?? []) as Devotee[];
  const totals = {
    all: rows.length,
    web: rows.filter((r) => r.source === 'web').length,
    admin: rows.filter((r) => r.source === 'admin').length,
    consent: rows.filter((r) => r.consent_contact).length,
  };

  return (
    <div>
      <h1 className="font-display text-3xl text-ink">Danh sách Phật tử</h1>
      <p className="mt-2 text-sm text-muted max-w-2xl">
        Sổ Phật tử của {ctx.temples[0]?.name}. Người tự đăng ký qua website
        sẽ được đánh dấu «Website».
      </p>

      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Tổng số" value={totals.all} />
        <StatCard label="Tự đăng ký" value={totals.web} />
        <StatCard label="Nhập tay" value={totals.admin} />
        <StatCard label="Đồng ý nhận tin" value={totals.consent} />
      </div>

      <PhatTuBoard templeId={templeId} devotees={rows} />
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="border border-fog bg-paper px-4 py-3">
      <p className="text-[0.7rem] uppercase tracking-wide text-muted">
        {label}
      </p>
      <p className="mt-1 font-display text-2xl text-ink tabular-nums">
        {value.toLocaleString('vi-VN')}
      </p>
    </div>
  );
}
