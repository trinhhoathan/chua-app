import Link from 'next/link';
import { requireAdmin } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { formatVnd } from '@/lib/tenant';
import { PLATFORM_HQ } from '@/lib/platform-hq';
import { resolveTempleScope } from '@/lib/temple-scope';
import { TempleRequiredNotice } from '@/components/admin/TempleRequiredNotice';
import { isLyGiaDomain } from '@/lib/ly-gia-phuc-an';

function currentMonth(): string {
  const d = new Date();
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
}

interface Props {
  searchParams: Promise<{ temple?: string }>;
}

export default async function AdminHomePage({ searchParams }: Props) {
  const ctx = await requireAdmin();
  const sp = await searchParams;
  const scope = await resolveTempleScope(ctx, sp.temple);

  if (ctx.isSuperAdmin && scope.mode === 'all') {
    return <SuperAdminDashboard templeCount={ctx.templeCount} />;
  }

  const templeId = scope.templeId;
  if (!templeId) {
    return <TempleRequiredNotice feature="Tổng quan theo chùa" />;
  }

  if (isLyGiaDomain(scope.temple?.domain)) {
    return (
      <SimSiteDashboard
        templeId={templeId}
        templeName={scope.temple?.name ?? ''}
        isSuperAdmin={ctx.isSuperAdmin}
      />
    );
  }

  return (
    <TempleDashboard
      templeId={templeId}
      templeName={scope.temple?.name ?? ''}
      isSuperAdmin={ctx.isSuperAdmin}
      simStoreEnabled={Boolean(scope.temple?.sim_store_enabled)}
    />
  );
}

/** Tổng quan cho site sim (Lý Gia Phúc An) — không có mảng thỉnh nước. */
async function SimSiteDashboard({
  templeId,
  templeName,
  isSuperAdmin,
}: {
  templeId: string;
  templeName: string;
  isSuperAdmin: boolean;
}) {
  const supabase = await createClient();
  const month = currentMonth();
  const monthStart = `${month}-01T00:00:00Z`;
  const [y, m] = month.split('-').map(Number);
  const nextMonth =
    m === 12
      ? `${y + 1}-01-01T00:00:00Z`
      : `${y}-${String(m + 1).padStart(2, '0')}-01T00:00:00Z`;

  const [pendingOrders, paidOrders, available, sold, templeRowRes] =
    await Promise.all([
      supabase
        .from('sim_orders')
        .select('id', { count: 'exact', head: true })
        .eq('temple_id', templeId)
        .eq('status', 'pending_payment'),
      supabase
        .from('sim_orders')
        .select('price_vnd')
        .eq('temple_id', templeId)
        .in('status', ['paid', 'delivering', 'completed'])
        .gte('paid_at', monthStart)
        .lt('paid_at', nextMonth),
      supabase
        .from('sim_listings')
        .select('id', { count: 'exact', head: true })
        .eq('temple_id', templeId)
        .eq('status', 'available'),
      supabase
        .from('sim_listings')
        .select('id', { count: 'exact', head: true })
        .eq('temple_id', templeId)
        .eq('status', 'sold'),
      supabase
        .from('temples')
        .select('hotline, contact_links')
        .eq('id', templeId)
        .maybeSingle(),
    ]);

  const paidCount = (paidOrders.data ?? []).length;
  const revenue = (paidOrders.data ?? []).reduce(
    (s, o) => s + Number(o.price_vnd),
    0,
  );
  const links = templeRowRes.data?.contact_links as { phone?: string } | null;
  const hotline =
    (templeRowRes.data?.hotline as string)?.trim() ||
    links?.phone?.trim() ||
    '';

  const cards = [
    {
      label: 'Đơn sim chờ duyệt / thanh toán',
      value: String(pendingOrders.count ?? 0),
      href: '/quan-tri/sim/don-hang',
    },
    {
      label: 'Sim bán được tháng này',
      value: String(paidCount),
      href: '/quan-tri/sim/don-hang',
    },
    {
      label: 'Doanh thu sim tháng này',
      value: formatVnd(revenue),
      href: '/quan-tri/sim/don-hang',
    },
    ...(isSuperAdmin
      ? [
          {
            label: 'Sim đang bán (kho trung tâm)',
            value: String(available.count ?? 0),
            href: '/quan-tri/sim',
          },
          {
            label: 'Sim đã bán (tổng kho)',
            value: String(sold.count ?? 0),
            href: '/quan-tri/sim',
          },
        ]
      : []),
  ];

  return (
    <div>
      <h1 className="font-display text-3xl text-ink">Tổng quan</h1>
      <p className="mt-2 text-muted text-sm">
        Tháng {month} · {templeName}
        {isSuperAdmin
          ? ' · SuperAdmin'
          : ' · đại lý (thống kê đơn)'}
      </p>

      <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {cards.map((c) => (
          <Link
            key={c.label}
            href={c.href}
            className="border border-fog bg-paper p-5 hover:border-ink/20 transition-colors"
          >
            <p className="text-[10px] uppercase tracking-widest text-muted">
              {c.label}
            </p>
            <p className="font-display text-2xl text-ink mt-2">{c.value}</p>
          </Link>
        ))}
        <Link
          href="/quan-tri/lien-he"
          className="border border-fog bg-paper p-5 hover:border-ink/20 transition-colors"
        >
          <p className="text-[10px] uppercase tracking-widest text-muted">
            Điện thoại liên hệ
          </p>
          <p className="font-display text-2xl text-ink mt-2 tabular-nums">
            {hotline || 'Chưa có'}
          </p>
        </Link>
      </div>

      <div className="mt-10 flex flex-wrap gap-3 text-sm">
        <Link href="/quan-tri/sim" className="px-4 py-2 bg-ink text-white">
          Kho Sim Phong Thủy
        </Link>
        <Link
          href="/quan-tri/sim/don-hang"
          className="px-4 py-2 border border-ink/20 hover:bg-paper"
        >
          Đơn hàng sim
        </Link>
        <Link
          href="/quan-tri/hinh-anh"
          className="px-4 py-2 border border-ink/20 hover:bg-paper"
        >
          Hình ảnh
        </Link>
        <Link
          href="/quan-tri/lien-he"
          className="px-4 py-2 border border-ink/20 hover:bg-paper"
        >
          Liên hệ
        </Link>
      </div>
    </div>
  );
}

async function SuperAdminDashboard({ templeCount }: { templeCount: number }) {
  const supabase = await createClient();
  const now = new Date().toISOString();

  const [
    abbots,
    devotees,
    campaigns,
    upcomingEvents,
    lowStockSample,
  ] = await Promise.all([
    supabase
      .from('temple_admins')
      .select('id', { count: 'exact', head: true })
      .eq('is_active', true)
      .eq('is_super_admin', false),
    supabase.from('devotees').select('id', { count: 'exact', head: true }),
    supabase
      .from('broadcast_campaigns')
      .select('id', { count: 'exact', head: true })
      .gte(
        'created_at',
        new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      ),
    supabase
      .from('temple_events')
      .select('id', { count: 'exact', head: true })
      .eq('is_published', true)
      .gt('ends_at', now),
    supabase
      .from('inventory_items')
      .select('id, name, quantity_on_hand, reorder_level, temples(name)')
      .eq('is_active', true)
      .limit(200),
  ]);

  const lowStock = (lowStockSample.data ?? []).filter(
    (i) => Number(i.quantity_on_hand) <= Number(i.reorder_level),
  );

  const cards = [
    {
      label: 'Phật tự đang hoạt động',
      value: templeCount.toLocaleString('vi-VN'),
      href: '/quan-tri/chua',
    },
    {
      label: 'Trụ trì / nhân sự',
      value: (abbots.count ?? 0).toLocaleString('vi-VN'),
      href: '/quan-tri/thanh-vien',
    },
    {
      label: 'Phật tử toàn hệ',
      value: (devotees.count ?? 0).toLocaleString('vi-VN'),
      href: '/quan-tri/phat-tu',
    },
    {
      label: 'Tin nhắn 30 ngày',
      value: (campaigns.count ?? 0).toLocaleString('vi-VN'),
      href: '/quan-tri/gui-tin',
    },
    {
      label: 'Sự kiện sắp / đang diễn ra',
      value: (upcomingEvents.count ?? 0).toLocaleString('vi-VN'),
      href: '/quan-tri/hoat-dong',
    },
    {
      label: 'Cảnh báo kho (mẫu)',
      value: String(lowStock.length),
      href: '/quan-tri/kho',
    },
  ];

  return (
    <div>
      <h1 className="font-display text-3xl text-ink">{PLATFORM_HQ.title}</h1>
      <p className="mt-2 text-muted text-sm">
        {PLATFORM_HQ.monastery} · {PLATFORM_HQ.author} · {PLATFORM_HQ.role}
      </p>
      <p className="mt-1 text-sm text-muted">
        Chỉ huy tổng các Phật tự — chọn một Phật tự trên header khi cần thao tác
        sâu vào từng nơi.
      </p>

      <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {cards.map((c) => (
          <Link
            key={c.label}
            href={c.href}
            className="border border-fog bg-paper p-5 hover:border-ink/20 transition-colors"
          >
            <p className="text-[10px] uppercase tracking-widest text-muted">
              {c.label}
            </p>
            <p className="font-display text-2xl text-ink mt-2">{c.value}</p>
          </Link>
        ))}
      </div>

      {lowStock.length > 0 ? (
        <div className="mt-10">
          <h2 className="font-display text-xl text-ink">Kho sắp hết (mẫu)</h2>
          <ul className="mt-4 border border-fog bg-paper divide-y divide-fog">
            {lowStock.slice(0, 8).map((i) => {
              const templeName =
                (i.temples as { name?: string } | null)?.name ?? '—';
              return (
                <li
                  key={i.id}
                  className="px-4 py-3 text-sm flex justify-between gap-3"
                >
                  <span>
                    <span className="text-muted">{templeName}</span>
                    <span className="mx-2 text-fog">·</span>
                    {i.name}
                  </span>
                  <span className="tabular-nums text-lacquer">
                    {i.quantity_on_hand}/{i.reorder_level}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}

      <div className="mt-10 flex flex-wrap gap-3 text-sm">
        <Link href="/quan-tri/chua" className="px-4 py-2 bg-ink text-white">
          Quản lý Phật tự
        </Link>
        <Link
          href="/quan-tri/phat-tu"
          className="px-4 py-2 border border-ink/20 hover:bg-paper"
        >
          Phật tử
        </Link>
        <Link
          href="/quan-tri/kho"
          className="px-4 py-2 border border-ink/20 hover:bg-paper"
        >
          Kho vận
        </Link>
        <Link
          href="/quan-tri/gui-tin"
          className="px-4 py-2 border border-ink/20 hover:bg-paper"
        >
          Tin nhắn
        </Link>
        <Link
          href="/quan-tri/hoat-dong"
          className="px-4 py-2 border border-ink/20 hover:bg-paper"
        >
          Hoạt động
        </Link>
      </div>
    </div>
  );
}

async function TempleDashboard({
  templeId,
  templeName,
  isSuperAdmin,
  simStoreEnabled = false,
}: {
  templeId: string;
  templeName: string;
  isSuperAdmin: boolean;
  simStoreEnabled?: boolean;
}) {
  const supabase = await createClient();
  const month = currentMonth();

  let pendingCount = 0;
  let paidQty = 0;
  let templeShare = 0;
  let prayerPending = 0;
  let devoteeCount = 0;
  let lowStock = 0;

  const monthStart = `${month}-01T00:00:00Z`;
  const [y, m] = month.split('-').map(Number);
  const nextMonth =
    m === 12
      ? `${y + 1}-01-01T00:00:00Z`
      : `${y}-${String(m + 1).padStart(2, '0')}-01T00:00:00Z`;

  const [pending, paid, ledger, prayers, devotees, inventory, simPaid] =
    await Promise.all([
      supabase
        .from('water_orders')
        .select('id', { count: 'exact', head: true })
        .eq('temple_id', templeId)
        .eq('status', 'pending_payment'),
      supabase
        .from('water_orders')
        .select('quantity')
        .eq('temple_id', templeId)
        .eq('status', 'paid')
        .gte('paid_at', monthStart)
        .lt('paid_at', nextMonth),
      supabase
        .from('settlement_ledger')
        .select('amount')
        .eq('temple_id', templeId)
        .eq('period_month', month),
      supabase
        .from('prayer_requests')
        .select('id', { count: 'exact', head: true })
        .eq('temple_id', templeId)
        .eq('status', 'pending'),
      supabase
        .from('devotees')
        .select('id', { count: 'exact', head: true })
        .eq('temple_id', templeId),
      supabase
        .from('inventory_items')
        .select('id, quantity_on_hand, reorder_level')
        .eq('temple_id', templeId)
        .eq('is_active', true),
      simStoreEnabled
        ? supabase
            .from('sim_orders')
            .select('price_vnd, agent_commission_percent')
            .eq('temple_id', templeId)
            .in('status', ['paid', 'delivering', 'completed'])
            .gte('paid_at', monthStart)
            .lt('paid_at', nextMonth)
        : Promise.resolve({ data: [] as { price_vnd: number; agent_commission_percent: number | null }[] }),
    ]);

  pendingCount = pending.count ?? 0;
  paidQty = (paid.data ?? []).reduce((s, o) => s + Number(o.quantity), 0);
  templeShare = (ledger.data ?? []).reduce(
    (s, e) => s + Number(e.amount),
    0,
  );
  prayerPending = prayers.count ?? 0;
  devoteeCount = devotees.count ?? 0;
  lowStock = (inventory.data ?? []).filter(
    (i) => i.quantity_on_hand <= i.reorder_level,
  ).length;

  const simRows = simPaid.data ?? [];
  const simSoldCount = simRows.length;
  const simAgentHh = simRows.reduce((s, o) => {
    const pct = Number(o.agent_commission_percent ?? 0);
    return s + Math.round((Number(o.price_vnd) * pct) / 100);
  }, 0);

  const cards = [
    {
      label: 'Đơn chờ thanh toán',
      value: String(pendingCount),
      href: '/quan-tri/don-hang',
    },
    {
      label: 'Thùng đã thỉnh tháng này',
      value: String(paidQty),
      href: '/quan-tri/doi-soat',
    },
    {
      label: 'Phần chùa nhận tháng này',
      value: formatVnd(templeShare),
      href: '/quan-tri/doi-soat',
    },
    ...(simStoreEnabled
      ? [
          {
            label: 'Đơn sim tháng này',
            value: String(simSoldCount),
            href: '/quan-tri/sim/don-hang',
          },
          {
            label: 'HH sim ước tính tháng này',
            value: formatVnd(simAgentHh),
            href: '/quan-tri/sim/don-hang',
          },
        ]
      : []),
    {
      label: 'Sớ chờ duyệt',
      value: String(prayerPending),
      href: '/quan-tri/so-cau',
    },
    {
      label: 'Phật tử',
      value: String(devoteeCount),
      href: '/quan-tri/phat-tu',
    },
    {
      label: 'Vật phẩm sắp hết',
      value: String(lowStock),
      href: '/quan-tri/kho',
    },
  ];

  const { data: templeRow } = await supabase
    .from('temples')
    .select('water_price_vnd, hotline, contact_links')
    .eq('id', templeId)
    .maybeSingle();
  const waterPrice = Number(templeRow?.water_price_vnd ?? 0);
  const links = templeRow?.contact_links as { phone?: string } | null;
  const hotline =
    (templeRow?.hotline as string)?.trim() ||
    links?.phone?.trim() ||
    '';

  return (
    <div>
      <h1 className="font-display text-3xl text-ink">Tổng quan</h1>
      <p className="mt-2 text-muted text-sm">
        Tháng {month} · {templeName}
        {isSuperAdmin ? ' · ngữ cảnh SuperAdmin' : ''}
      </p>

      <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {cards.map((c) => (
          <Link
            key={c.label}
            href={c.href}
            className="border border-fog bg-paper p-5 hover:border-ink/20 transition-colors"
          >
            <p className="text-[10px] uppercase tracking-widest text-muted">
              {c.label}
            </p>
            <p className="font-display text-2xl text-ink mt-2">{c.value}</p>
          </Link>
        ))}
        {isSuperAdmin ? (
          <Link
            href="/quan-tri/don-gia"
            className="border border-fog bg-paper p-5 hover:border-ink/20 transition-colors"
          >
            <p className="text-[10px] uppercase tracking-widest text-muted">
              Đơn giá nước / thùng
            </p>
            <p className="font-display text-2xl text-ink mt-2">
              {waterPrice ? formatVnd(waterPrice) : '—'}
            </p>
          </Link>
        ) : (
          <div className="border border-fog bg-paper p-5">
            <p className="text-[10px] uppercase tracking-widest text-muted">
              Đơn giá nước / thùng
            </p>
            <p className="font-display text-2xl text-ink mt-2">
              {waterPrice ? formatVnd(waterPrice) : '—'}
            </p>
            <p className="mt-2 text-[11px] text-muted">
              Do quản trị viên nền tảng đặt — trụ trì chỉ xem.
            </p>
          </div>
        )}
        <Link
          href="/quan-tri/lien-he"
          className="border border-fog bg-paper p-5 hover:border-ink/20 transition-colors"
        >
          <p className="text-[10px] uppercase tracking-widest text-muted">
            Điện thoại liên hệ
          </p>
          <p className="font-display text-2xl text-ink mt-2 tabular-nums">
            {hotline || 'Chưa có'}
          </p>
        </Link>
      </div>
    </div>
  );
}
