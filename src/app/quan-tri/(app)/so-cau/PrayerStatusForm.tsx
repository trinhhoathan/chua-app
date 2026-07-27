'use client';

import { useTransition } from 'react';
import { updatePrayerStatus } from '@/app/actions/admin';

export function PrayerStatusForm({
  id,
  templeId,
  status,
}: {
  id: string;
  templeId: string;
  status: string;
}) {
  const [pending, start] = useTransition();

  return (
    <select
      defaultValue={status}
      disabled={pending}
      className="text-xs border border-fog px-2 py-1.5 bg-white"
      onChange={(e) => {
        const next = e.target.value;
        start(async () => {
          await updatePrayerStatus({ id, templeId, status: next });
        });
      }}
    >
      <option value="pending">Chờ duyệt</option>
      <option value="approved">Đã duyệt</option>
      <option value="printed">Đã in</option>
      <option value="completed">Hoàn tất</option>
      <option value="cancelled">Huỷ</option>
    </select>
  );
}
