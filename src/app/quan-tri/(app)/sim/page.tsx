import Link from 'next/link';
import { redirect } from 'next/navigation';
import { requireAdmin, getAdminDb } from '@/lib/auth';
import { getSimWarehouseTempleId } from '@/lib/sim/warehouse';
import type { SimListing, SimSource } from '@/types/database';
import { SimAdminPanel } from './SimAdminPanel';

interface Props {
  searchParams: Promise<{ temple?: string }>;
}

export default async function SimAdminPage({ searchParams }: Props) {
  const ctx = await requireAdmin();
  if (!ctx.isSuperAdmin) {
    redirect('/quan-tri/sim/don-hang');
  }
  await searchParams;

  const warehouseId = await getSimWarehouseTempleId();
  if (!warehouseId) {
    return (
      <div className="rounded-sm border border-fog bg-paper p-8 text-sm text-muted">
        Chưa tìm thấy temple kho trung tâm (payment_code = LGPA).
      </div>
    );
  }

  const db = await getAdminDb();
  const [{ data, count }, { count: pendingOrders }, { data: sources }] =
    await Promise.all([
      db
        .from('sim_listings')
        .select('*', { count: 'exact' })
        .eq('temple_id', warehouseId)
        .order('created_at', { ascending: false })
        .range(0, 49),
      db
        .from('sim_orders')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'pending_payment'),
      db
        .from('sim_sources')
        .select('*')
        .eq('temple_id', warehouseId)
        .order('name', { ascending: true }),
    ]);

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl text-ink">Kho Sim Phong Thủy</h1>
          <p className="mt-2 text-sm text-muted">
            Kho trung tâm (Lý Gia Phúc An) — chỉ SuperAdmin quản lý. Đại lý xem
            thống kê đơn tại trang Đơn sim.
          </p>
        </div>
        <Link
          href="/quan-tri/sim/don-hang"
          className="border border-fog bg-paper px-4 py-2 text-sm text-ink hover:bg-mist"
        >
          Thống kê đơn sim
          {pendingOrders ? (
            <span className="ml-2 rounded-full bg-lacquer px-2 py-0.5 text-[0.65rem] font-semibold text-white">
              {pendingOrders} chờ TT
            </span>
          ) : null}
        </Link>
      </div>

      <div className="mt-6">
        <SimAdminPanel
          templeId={warehouseId}
          initialSims={(data ?? []) as SimListing[]}
          initialTotal={count ?? 0}
          initialSources={(sources ?? []) as SimSource[]}
        />
      </div>
    </div>
  );
}
