import Link from 'next/link';
import { requireAdmin, getAdminDb } from '@/lib/auth';
import { resolveTempleScope } from '@/lib/temple-scope';
import { TempleRequiredNotice } from '@/components/admin/TempleRequiredNotice';
import type { SimOrder } from '@/types/database';
import { SimOrdersPanel } from './SimOrdersPanel';

interface Props {
  searchParams: Promise<{ temple?: string }>;
}

export default async function SimOrdersAdminPage({ searchParams }: Props) {
  const ctx = await requireAdmin();
  const sp = await searchParams;
  const scope = await resolveTempleScope(ctx, sp.temple);

  if (!scope.templeId || !scope.temple) {
    return <TempleRequiredNotice feature="Đơn sim" />;
  }

  const db = await getAdminDb();
  const { data } = await db
    .from('sim_orders')
    .select('*')
    .eq('temple_id', scope.templeId)
    .order('created_at', { ascending: false })
    .limit(200);

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl text-ink">Đơn sim</h1>
          <p className="mt-2 text-sm text-muted">
            {scope.temple.name} — xác nhận thanh toán tại đây: khách đang mở trang QR sẽ
            tự thấy màn &ldquo;thành công&rdquo;.
          </p>
        </div>
        <Link
          href="/quan-tri/sim"
          className="border border-fog bg-paper px-4 py-2 text-sm text-ink hover:bg-mist"
        >
          ← Kho sim
        </Link>
      </div>

      <div className="mt-6">
        <SimOrdersPanel
          templeId={scope.templeId}
          initialOrders={(data ?? []) as SimOrder[]}
        />
      </div>
    </div>
  );
}
