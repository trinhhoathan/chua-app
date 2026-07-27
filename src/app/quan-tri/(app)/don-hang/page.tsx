import { requireAdmin } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import type { WaterOrder } from '@/types/database';
import { MarkPaidButton } from '../doi-soat/MarkPaidButton';

function formatVnd(n: number): string {
  return new Intl.NumberFormat('vi-VN').format(n);
}

const STATUS: Record<string, string> = {
  pending_payment: 'Chờ TT',
  paid: 'Đã TT',
  shipping: 'Đang giao',
  delivered: 'Đã giao',
  cancelled: 'Huỷ',
};

export default async function DonHangPage() {
  const ctx = await requireAdmin();
  const templeId = ctx.temples[0]?.id;
  const supabase = await createClient();

  const { data } = templeId
    ? await supabase
        .from('water_orders')
        .select('*')
        .eq('temple_id', templeId)
        .order('created_at', { ascending: false })
        .limit(100)
    : { data: [] };

  const orders = (data ?? []) as WaterOrder[];

  return (
    <div>
      <h1 className="font-display text-3xl text-ink">Đơn nước công đức</h1>
      <p className="mt-2 text-sm text-muted">
        100 đơn gần nhất của {ctx.temples[0]?.name}
      </p>

      <div className="mt-8 overflow-x-auto border border-fog bg-paper">
        <table className="w-full text-sm">
          <thead className="text-left text-muted bg-mist">
            <tr>
              <th className="p-3">Mã</th>
              <th className="p-3">Phật tử</th>
              <th className="p-3">SĐT</th>
              <th className="p-3 text-right">Thùng</th>
              <th className="p-3 text-right">Tổng</th>
              <th className="p-3">Trạng thái</th>
              <th className="p-3">Ngày</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id} className="border-t border-fog">
                <td className="p-3 font-mono text-xs">{o.order_code}</td>
                <td className="p-3">{o.customer_name}</td>
                <td className="p-3">{o.customer_phone}</td>
                <td className="p-3 text-right">{o.quantity}</td>
                <td className="p-3 text-right">
                  {formatVnd(Number(o.total_amount))}đ
                </td>
                <td className="p-3">{STATUS[o.status] ?? o.status}</td>
                <td className="p-3 text-xs text-muted">
                  {new Date(o.created_at).toLocaleString('vi-VN')}
                </td>
                <td className="p-3">
                  {o.status === 'pending_payment' ? (
                    <MarkPaidButton
                      orderId={o.id}
                      orderCode={o.order_code}
                    />
                  ) : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
