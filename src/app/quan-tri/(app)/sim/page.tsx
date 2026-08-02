import Link from 'next/link';
import { requireAdmin } from '@/lib/auth';
import { resolveTempleScope } from '@/lib/temple-scope';
import { TempleRequiredNotice } from '@/components/admin/TempleRequiredNotice';
import { getAdminDb } from '@/lib/auth';
import type { SimListing, SimSource } from '@/types/database';
import { SimAdminPanel } from './SimAdminPanel';

interface Props {
  searchParams: Promise<{ temple?: string }>;
}

export default async function SimAdminPage({ searchParams }: Props) {
  const ctx = await requireAdmin();
  const sp = await searchParams;
  const scope = await resolveTempleScope(ctx, sp.temple);

  if (!scope.templeId || !scope.temple) {
    return <TempleRequiredNotice feature="Kho Sim Phong Thủy" />;
  }

  const db = await getAdminDb();
  const [{ data, count }, { count: pendingOrders }, { data: sources }] =
    await Promise.all([
      db
        .from('sim_listings')
        .select('*', { count: 'exact' })
        .eq('temple_id', scope.templeId)
        .order('created_at', { ascending: false })
        .range(0, 49),
      db
        .from('sim_orders')
        .select('id', { count: 'exact', head: true })
        .eq('temple_id', scope.templeId)
        .eq('status', 'pending_payment'),
      db
        .from('sim_sources')
        .select('*')
        .eq('temple_id', scope.templeId)
        .order('name', { ascending: true }),
    ]);

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl text-ink">Kho Sim Phong Thủy</h1>
          <p className="mt-2 text-sm text-muted">
            {scope.temple.name} — mỗi số được tự động chấm điểm theo nguyên lý Âm Dương Ngũ Hành, Kinh dịch diệu luận khi
            thêm vào kho. Gán kho sim (VD: simkinhdich.com) để lọc và biết đường liên hệ mua hàng.
          </p>
        </div>
        <Link
          href="/quan-tri/sim/don-hang"
          className="border border-fog bg-paper px-4 py-2 text-sm text-ink hover:bg-mist"
        >
          Đơn sim
          {pendingOrders ? (
            <span className="ml-2 rounded-full bg-lacquer px-2 py-0.5 text-[0.65rem] font-semibold text-white">
              {pendingOrders} chờ TT
            </span>
          ) : null}
        </Link>
      </div>

      <div className="mt-6">
        <SimAdminPanel
          templeId={scope.templeId}
          initialSims={(data ?? []) as SimListing[]}
          initialTotal={count ?? 0}
          initialSources={(sources ?? []) as SimSource[]}
        />
      </div>
    </div>
  );
}
