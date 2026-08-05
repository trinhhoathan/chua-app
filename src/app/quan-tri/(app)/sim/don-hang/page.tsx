import Link from 'next/link';
import { requireAdmin, getAdminDb } from '@/lib/auth';
import { resolveTempleScope } from '@/lib/temple-scope';
import { TempleRequiredNotice } from '@/components/admin/TempleRequiredNotice';
import { formatVnd } from '@/lib/tenant';
import type { SimOrder } from '@/types/database';
import { SimOrdersPanel } from './SimOrdersPanel';

interface Props {
  searchParams: Promise<{ temple?: string }>;
}

function agentHh(o: SimOrder): number {
  const pct = Number(o.agent_commission_percent ?? 0);
  return Math.round((Number(o.price_vnd) * pct) / 100);
}

export default async function SimOrdersAdminPage({ searchParams }: Props) {
  const ctx = await requireAdmin();
  const sp = await searchParams;
  const scope = await resolveTempleScope(ctx, sp.temple);

  if (!scope.templeId || !scope.temple) {
    return <TempleRequiredNotice feature="Thống kê đơn sim" />;
  }

  const canManage = ctx.isSuperAdmin;
  const db = await getAdminDb();
  const { data } = await db
    .from('sim_orders')
    .select('*')
    .eq('temple_id', scope.templeId)
    .order('created_at', { ascending: false })
    .limit(200);

  const orders = (data ?? []) as SimOrder[];
  const paidLike = orders.filter((o) =>
    ['paid', 'delivering', 'completed'].includes(o.status),
  );
  const revenue = paidLike.reduce((s, o) => s + Number(o.price_vnd), 0);
  const agentCommission = paidLike.reduce((s, o) => s + agentHh(o), 0);
  const pending = orders.filter((o) => o.status === 'pending_payment').length;

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl text-ink">Thống kê đơn sim</h1>
          <p className="mt-2 text-sm text-muted">
            {scope.temple.name} — đơn phát sinh trên website đại lý (hoa hồng
            ước tính để quyết toán).
            {!canManage
              ? ' Bạn chỉ xem thống kê; SuperAdmin cập nhật trạng thái đơn.'
              : ' SuperAdmin có thể xác nhận thanh toán / giao sim.'}
          </p>
        </div>
        {canManage ? (
          <Link
            href="/quan-tri/sim"
            className="border border-fog bg-paper px-4 py-2 text-sm text-ink hover:bg-mist"
          >
            ← Kho sim
          </Link>
        ) : null}
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Đơn (200 gần nhất)" value={String(orders.length)} />
        <StatCard label="Chờ thanh toán" value={String(pending)} />
        <StatCard
          label="Doanh thu đã TT+"
          value={`${formatVnd(revenue)}`}
        />
        <StatCard
          label="HH đại lý ước tính"
          value={`${formatVnd(agentCommission)}`}
        />
      </div>

      <div className="mt-6">
        <SimOrdersPanel
          templeId={scope.templeId}
          initialOrders={orders}
          canManage={canManage}
        />
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-fog bg-paper px-4 py-3">
      <p className="text-[0.68rem] uppercase tracking-[0.16em] text-muted">
        {label}
      </p>
      <p className="mt-1 font-display text-2xl text-ink">{value}</p>
    </div>
  );
}
