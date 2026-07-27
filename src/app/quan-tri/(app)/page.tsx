import Link from 'next/link';
import { requireAdmin } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { formatVnd } from '@/lib/tenant';

function currentMonth(): string {
  const d = new Date();
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
}

export default async function AdminHomePage() {
  const ctx = await requireAdmin();
  const templeId = ctx.temples[0]?.id;
  const supabase = await createClient();
  const month = currentMonth();

  let pendingCount = 0;
  let paidQty = 0;
  let templeShare = 0;
  let prayerPending = 0;
  let devoteeCount = 0;
  let lowStock = 0;

  if (templeId) {
    const monthStart = `${month}-01T00:00:00Z`;
    const [y, m] = month.split('-').map(Number);
    const nextMonth =
      m === 12
        ? `${y + 1}-01-01T00:00:00Z`
        : `${y}-${String(m + 1).padStart(2, '0')}-01T00:00:00Z`;

    const [pending, paid, ledger, prayers, devotees, inventory] =
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
      ]);

    pendingCount = pending.count ?? 0;
    paidQty = (paid.data ?? []).reduce(
      (s, o) => s + Number(o.quantity),
      0,
    );
    templeShare = (ledger.data ?? []).reduce(
      (s, e) => s + Number(e.amount),
      0,
    );
    prayerPending = prayers.count ?? 0;
    devoteeCount = devotees.count ?? 0;
    lowStock = (inventory.data ?? []).filter(
      (i) => i.quantity_on_hand <= i.reorder_level,
    ).length;
  }

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
      value: `${formatVnd(templeShare)}đ`,
      href: '/quan-tri/doi-soat',
    },
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

  let waterPrice = 0;
  let hotline = '';
  if (templeId) {
    const { data: templeRow } = await supabase
      .from('temples')
      .select('water_price_vnd, hotline, contact_links')
      .eq('id', templeId)
      .maybeSingle();
    waterPrice = Number(templeRow?.water_price_vnd ?? 0);
    const links = templeRow?.contact_links as { phone?: string } | null;
    hotline =
      (templeRow?.hotline as string)?.trim() ||
      links?.phone?.trim() ||
      '';
  }

  return (
    <div>
      <h1 className="font-display text-3xl text-ink">Tổng quan</h1>
      <p className="mt-2 text-muted text-sm">
        Tháng {month} · {ctx.temples.map((t) => t.name).join(', ')}
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
          href="/quan-tri/don-gia"
          className="border border-fog bg-paper p-5 hover:border-ink/20 transition-colors"
        >
          <p className="text-[10px] uppercase tracking-widest text-muted">
            Đơn giá nước / thùng
          </p>
          <p className="font-display text-2xl text-ink mt-2">
            {waterPrice ? `${formatVnd(waterPrice)}đ` : '—'}
          </p>
        </Link>
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
