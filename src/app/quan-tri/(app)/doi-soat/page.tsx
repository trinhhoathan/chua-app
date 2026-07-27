import { requireAdmin } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import type { WaterOrder, SettlementEntry } from '@/types/database';
import { MarkPaidButton } from './MarkPaidButton';

interface Props {
  searchParams: Promise<{ temple?: string; month?: string }>;
}

function formatVnd(n: number): string {
  return new Intl.NumberFormat('vi-VN').format(n);
}

function currentMonth(): string {
  const d = new Date();
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
}

export default async function DoiSoatPage({ searchParams }: Props) {
  const ctx = await requireAdmin();
  const sp = await searchParams;
  const month = sp.month ?? currentMonth();
  const templeId = sp.temple || ctx.temples[0]?.id;
  const templeObj = ctx.temples.find((t) => t.id === templeId);
  const supabase = await createClient();

  const monthStart = `${month}-01T00:00:00Z`;
  const [y, m] = month.split('-').map(Number);
  const nextMonth =
    m === 12
      ? `${y + 1}-01-01T00:00:00Z`
      : `${y}-${String(m + 1).padStart(2, '0')}-01T00:00:00Z`;

  const [ordersRes, ledgerRes, pendingRes] = await Promise.all([
    templeId
      ? supabase
          .from('water_orders')
          .select('*')
          .eq('temple_id', templeId)
          .eq('status', 'paid')
          .gte('paid_at', monthStart)
          .lt('paid_at', nextMonth)
          .order('paid_at', { ascending: false })
      : Promise.resolve({ data: [] as WaterOrder[] }),
    templeId
      ? supabase
          .from('settlement_ledger')
          .select('*')
          .eq('temple_id', templeId)
          .eq('period_month', month)
          .order('created_at', { ascending: false })
      : Promise.resolve({ data: [] as SettlementEntry[] }),
    templeId
      ? supabase
          .from('water_orders')
          .select('*')
          .eq('temple_id', templeId)
          .eq('status', 'pending_payment')
          .order('created_at', { ascending: false })
          .limit(50)
      : Promise.resolve({ data: [] as WaterOrder[] }),
  ]);

  const orders = (ordersRes.data ?? []) as WaterOrder[];
  const ledger = (ledgerRes.data ?? []) as SettlementEntry[];
  const pending = (pendingRes.data ?? []) as WaterOrder[];

  const totalQty = orders.reduce((s, o) => s + o.quantity, 0);
  const totalRevenue = orders.reduce((s, o) => s + Number(o.total_amount), 0);
  const totalTempleShare = ledger.reduce((s, e) => s + Number(e.amount), 0);

  return (
    <div>
      <div className="flex flex-wrap items-baseline justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-ink">Sổ quyết toán nước</h1>
          <p className="mt-1 text-sm text-muted">
            {templeObj?.name ?? '—'} · Tháng {month}
          </p>
        </div>
        <form className="flex items-center gap-3 text-sm">
          {ctx.temples.length > 1 ? (
            <select
              name="temple"
              defaultValue={templeId}
              className="px-3 py-2 border border-fog bg-white text-ink"
            >
              {ctx.temples.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          ) : (
            <input type="hidden" name="temple" value={templeId} />
          )}
          <input
            type="month"
            name="month"
            defaultValue={month}
            className="px-3 py-2 border border-fog bg-white text-ink"
          />
          <button type="submit" className="px-4 py-2 bg-ink text-white text-sm">
            Xem
          </button>
        </form>
      </div>

      <div className="mt-8 grid sm:grid-cols-3 gap-3">
        <div className="border border-fog bg-paper p-5">
          <p className="text-[10px] uppercase tracking-widest text-muted">
            Số thùng đã thỉnh
          </p>
          <p className="font-display text-3xl text-ink mt-2">{totalQty}</p>
        </div>
        <div className="border border-fog bg-paper p-5">
          <p className="text-[10px] uppercase tracking-widest text-muted">
            Doanh thu tháng
          </p>
          <p className="font-display text-3xl text-ink mt-2">
            {formatVnd(totalRevenue)}đ
          </p>
        </div>
        <div className="border border-jade bg-jade text-white p-5">
          <p className="text-[10px] uppercase tracking-widest text-white/70">
            Phần chùa nhận
          </p>
          <p className="font-display text-3xl mt-2">
            {formatVnd(totalTempleShare)}đ
          </p>
        </div>
      </div>

      <section className="mt-10">
        <h2 className="font-display text-xl text-ink mb-3">
          Đơn chờ thanh toán
        </h2>
        <div className="overflow-x-auto border border-fog bg-paper">
          <table className="w-full text-sm">
            <thead className="text-left text-muted bg-mist">
              <tr>
                <th className="p-3">Mã đơn</th>
                <th className="p-3">Phật tử</th>
                <th className="p-3">SĐT</th>
                <th className="p-3 text-right">Thùng</th>
                <th className="p-3 text-right">Tổng</th>
                <th className="p-3">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {pending.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-muted">
                    Không có đơn chờ.
                  </td>
                </tr>
              ) : (
                pending.map((o) => (
                  <tr key={o.id} className="border-t border-fog">
                    <td className="p-3 font-mono text-xs">{o.order_code}</td>
                    <td className="p-3">{o.customer_name}</td>
                    <td className="p-3">{o.customer_phone}</td>
                    <td className="p-3 text-right">{o.quantity}</td>
                    <td className="p-3 text-right">
                      {formatVnd(Number(o.total_amount))}đ
                    </td>
                    <td className="p-3">
                      <MarkPaidButton
                        orderId={o.id}
                        orderCode={o.order_code}
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
