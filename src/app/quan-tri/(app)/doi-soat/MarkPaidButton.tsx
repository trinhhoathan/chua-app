'use client';

import { useState, useTransition } from 'react';
import { markOrderPaid } from '@/app/actions/orders';

interface Props {
  orderId: string;
  orderCode: string;
}

export function MarkPaidButton({ orderId, orderCode }: Props) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function confirm() {
    if (!window.confirm(`Đánh dấu đơn ${orderCode} đã thanh toán?`)) return;
    setError(null);
    startTransition(async () => {
      const res = await markOrderPaid({
        orderId,
        paymentRef: `manual-${new Date().toISOString()}`,
      });
      if (!res.ok) {
        setError(res.error ?? 'Lỗi');
      } else {
        window.location.reload();
      }
    });
  }

  return (
    <div className="flex flex-col">
      <button
        onClick={confirm}
        disabled={pending}
        className="px-3 py-1.5 text-xs bg-jade text-white hover:bg-jade-deep disabled:opacity-60"
      >
        {pending ? 'Đang…' : 'Đã trả'}
      </button>
      {error ? <p className="text-[10px] text-lacquer mt-1">{error}</p> : null}
    </div>
  );
}
