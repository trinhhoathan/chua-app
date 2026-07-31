import { requireAdmin } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import type { Devotee } from '@/types/database';
import { resolveTempleScope } from '@/lib/temple-scope';
import { PhatTuBoard } from './PhatTuBoard';
import { PhatTuSystemList } from './PhatTuSystemList';

export const dynamic = 'force-dynamic';

const PAGE_SIZE = 50;

interface Props {
  searchParams: Promise<{ temple?: string; q?: string; page?: string }>;
}

export default async function PhatTuPage({ searchParams }: Props) {
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
      .from('devotees')
      .select('*, temples(name)', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to);

    if (q) {
      query = query.or(
        `full_name.ilike.%${q}%,phone.ilike.%${q}%,dharma_name.ilike.%${q}%`,
      );
    }

    const { data, count } = await query;
    const [{ count: allCount }, { count: webCount }, { count: consentCount }] =
      await Promise.all([
        supabase.from('devotees').select('id', { count: 'exact', head: true }),
        supabase
          .from('devotees')
          .select('id', { count: 'exact', head: true })
          .eq('source', 'web'),
        supabase
          .from('devotees')
          .select('id', { count: 'exact', head: true })
          .eq('consent_contact', true),
      ]);

    return (
      <div>
        <h1 className="font-display text-3xl text-ink">
          Quản trị Phật tử các Phật tự
        </h1>
        <p className="mt-2 text-sm text-muted max-w-2xl">
          Xem / lọc Phật tử toàn hệ thống. Chọn một Phật tự trên header để tạo
          mới hoặc sửa chi tiết trong ngữ cảnh chùa đó.
        </p>

        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard label="Tổng số" value={allCount ?? 0} />
          <StatCard label="Tự đăng ký" value={webCount ?? 0} />
          <StatCard label="Đồng ý nhận tin" value={consentCount ?? 0} />
          <StatCard label="Trang này" value={data?.length ?? 0} />
        </div>

        <PhatTuSystemList
          rows={(data ?? []) as (Devotee & { temples: { name: string } | null })[]}
          q={q}
          page={page}
          total={count ?? 0}
          pageSize={PAGE_SIZE}
        />
      </div>
    );
  }

  const templeId = scope.templeId;
  if (!templeId || !scope.temple) return null;

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
        Sổ Phật tử của {scope.temple.name}. Người tự đăng ký qua website sẽ được
        đánh dấu «Website».
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
