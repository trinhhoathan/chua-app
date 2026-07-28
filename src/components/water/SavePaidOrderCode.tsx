'use client';

import { useEffect } from 'react';
import { savePaidOrderCode } from '@/lib/fengshui/tuvi-html';

/** Lưu mã đơn đã thanh toán để mở khóa luận giải 12 cung. */
export function SavePaidOrderCode({
  orderCode,
  templeId,
}: {
  orderCode: string;
  templeId: string;
}) {
  useEffect(() => {
    savePaidOrderCode(orderCode, templeId);
  }, [orderCode, templeId]);
  return null;
}
