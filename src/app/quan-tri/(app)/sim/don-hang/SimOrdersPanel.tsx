'use client';

import { useCallback, useState } from 'react';
import {
  listSimOrdersAdminAction,
  updateSimOrderStatusAction,
} from '@/app/actions/sim-admin';
import {
  SIM_ORDER_STATUS_LABELS,
  type SimOrder,
  type SimOrderStatus,
} from '@/types/database';

const STATUS_COLORS: Record<SimOrderStatus, string> = {
  pending_payment: '#B08D42',
  paid: '#1B6B3A',
  delivering: '#2563eb',
  completed: '#374151',
  cancelled: '#9b3535',
};

function formatVnd(n: number): string {
  return new Intl.NumberFormat('vi-VN').format(n);
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function SimOrdersPanel({
  templeId,
  initialOrders,
}: {
  templeId: string;
  initialOrders: SimOrder[];
}) {
  const [orders, setOrders] = useState<SimOrder[]>(initialOrders);
  const [statusFilter, setStatusFilter] = useState('');
  const [busyId, setBusyId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null);

  const notify = useCallback((kind: 'ok' | 'err', text: string) => {
    setMessage({ kind, text });
    window.setTimeout(() => setMessage(null), 5000);
  }, []);

  const reload = useCallback(
    async (status?: string) => {
      const res = await listSimOrdersAdminAction({
        templeId,
        status: status ?? statusFilter,
      });
      if (res.ok && res.orders) setOrders(res.orders);
      else if (res.error) notify('err', res.error);
    },
    [templeId, statusFilter, notify],
  );

  async function changeStatus(order: SimOrder, status: SimOrderStatus) {
    if (status === 'cancelled' && !window.confirm(`Hủy đơn ${order.order_code} và nhả sim về kho?`)) {
      return;
    }
    setBusyId(order.id);
    const res = await updateSimOrderStatusAction({
      orderId: order.id,
      templeId,
      status,
    });
    setBusyId(null);
    if (res.ok) {
      notify('ok', `Đơn ${order.order_code} → ${SIM_ORDER_STATUS_LABELS[status]}.`);
      await reload();
    } else {
      notify('err', res.error);
    }
  }

  return (
    <div>
      {message ? (
        <div
          className={`mb-4 border px-4 py-2.5 text-sm ${
            message.kind === 'ok'
              ? 'border-green-300 bg-green-50 text-green-800'
              : 'border-red-300 bg-red-50 text-red-700'
          }`}
        >
          {message.text}
        </div>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            void reload(e.target.value);
          }}
          className="h-9 border border-fog bg-white px-2.5 text-sm text-ink outline-none focus:border-lacquer"
        >
          <option value="">Tất cả trạng thái</option>
          {Object.entries(SIM_ORDER_STATUS_LABELS).map(([id, label]) => (
            <option key={id} value={id}>
              {label}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={() => void reload()}
          className="h-9 border border-fog px-4 text-sm text-ink hover:bg-mist"
        >
          Làm mới
        </button>
      </div>

      <div className="mt-3 overflow-x-auto border border-fog bg-paper">
        <table className="w-full text-sm">
          <thead className="bg-mist text-left text-muted">
            <tr>
              <th className="p-2.5">Mã đơn</th>
              <th className="p-2.5">Sim</th>
              <th className="p-2.5">Kho / HH</th>
              <th className="p-2.5 text-right">Giá</th>
              <th className="p-2.5">Khách</th>
              <th className="p-2.5">Ngày sinh / giờ</th>
              <th className="p-2.5">Trạng thái</th>
              <th className="p-2.5">Tạo lúc</th>
              <th className="p-2.5" />
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <tr>
                <td colSpan={9} className="p-8 text-center text-muted">
                  Chưa có đơn sim nào.
                </td>
              </tr>
            ) : (
              orders.map((o) => {
                const hh =
                  o.commission_percent != null
                    ? Math.round((Number(o.price_vnd) * Number(o.commission_percent)) / 100)
                    : null;
                return (
                <tr
                  key={o.id}
                  className={`border-t border-fog align-top ${busyId === o.id ? 'opacity-50' : ''}`}
                >
                  <td className="p-2.5 font-mono text-xs text-ink">{o.order_code}</td>
                  <td className="p-2.5 font-mono font-semibold text-ink">
                    {o.phone_display}
                  </td>
                  <td className="p-2.5 text-xs text-muted">
                    {o.source_name ? (
                      <>
                        <p className="font-medium text-ink">{o.source_name}</p>
                        <p>
                          HH {Number(o.commission_percent)}%
                          {hh != null ? ` ≈ ${formatVnd(hh)}đ` : ''}
                        </p>
                      </>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td className="p-2.5 text-right text-ink">{formatVnd(o.price_vnd)}đ</td>
                  <td className="p-2.5">
                    <p className="text-ink">{o.customer_name}</p>
                    <a href={`tel:${o.customer_phone}`} className="text-xs text-lacquer">
                      {o.customer_phone}
                    </a>
                    {o.note ? (
                      <p className="mt-0.5 max-w-48 text-xs text-muted">{o.note}</p>
                    ) : null}
                  </td>
                  <td className="p-2.5 text-xs text-muted">
                    {o.birth_date ?? '—'}
                    {o.birth_time ? ` · ${o.birth_time.slice(0, 5)}` : ''}
                    {o.gender ? ` · ${o.gender === 'nam' ? 'Nam' : 'Nữ'}` : ''}
                  </td>
                  <td className="p-2.5">
                    <span
                      className="inline-block px-2 py-0.5 text-xs font-medium text-white"
                      style={{ backgroundColor: STATUS_COLORS[o.status] }}
                    >
                      {SIM_ORDER_STATUS_LABELS[o.status]}
                    </span>
                    {o.paid_at ? (
                      <p className="mt-0.5 text-[0.65rem] text-muted">
                        TT lúc {formatTime(o.paid_at)}
                      </p>
                    ) : null}
                  </td>
                  <td className="p-2.5 text-xs text-muted">{formatTime(o.created_at)}</td>
                  <td className="p-2.5">
                    <div className="flex flex-col gap-1">
                      {o.status === 'pending_payment' ? (
                        <ActionBtn
                          color="#1B6B3A"
                          onClick={() => void changeStatus(o, 'paid')}
                        >
                          ✓ Đã nhận tiền
                        </ActionBtn>
                      ) : null}
                      {o.status === 'paid' ? (
                        <ActionBtn
                          color="#2563eb"
                          onClick={() => void changeStatus(o, 'delivering')}
                        >
                          Giao sim
                        </ActionBtn>
                      ) : null}
                      {o.status === 'paid' || o.status === 'delivering' ? (
                        <ActionBtn
                          color="#374151"
                          onClick={() => void changeStatus(o, 'completed')}
                        >
                          Hoàn tất (sim đã bán)
                        </ActionBtn>
                      ) : null}
                      {o.status !== 'completed' && o.status !== 'cancelled' ? (
                        <button
                          type="button"
                          onClick={() => void changeStatus(o, 'cancelled')}
                          className="text-left text-xs text-red-700 underline underline-offset-2"
                        >
                          Hủy đơn + nhả sim
                        </button>
                      ) : null}
                    </div>
                  </td>
                </tr>
              );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ActionBtn({
  color,
  onClick,
  children,
}: {
  color: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="px-2.5 py-1 text-left text-xs font-medium text-white hover:opacity-90"
      style={{ backgroundColor: color }}
    >
      {children}
    </button>
  );
}
