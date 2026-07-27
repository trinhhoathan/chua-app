'use client';

import { useState, useTransition } from 'react';
import { upsertDevotee } from '@/app/actions/admin';

export function DevoteeForm({ templeId }: { templeId: string }) {
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);

  return (
    <form
      className="border border-fog bg-paper p-5 space-y-3"
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        setMsg(null);
        start(async () => {
          const res = await upsertDevotee({
            templeId,
            fullName: String(fd.get('fullName') ?? ''),
            dharmaName: String(fd.get('dharmaName') ?? ''),
            birthYear: Number(fd.get('birthYear') || 0) || undefined,
            phone: String(fd.get('phone') ?? ''),
            address: String(fd.get('address') ?? ''),
            note: String(fd.get('note') ?? ''),
            quyYDate: String(fd.get('quyYDate') ?? '') || undefined,
          });
          if (!res.ok) setMsg(res.error ?? 'Lỗi');
          else {
            setMsg('Đã lưu.');
            e.currentTarget.reset();
            window.location.reload();
          }
        });
      }}
    >
      <h2 className="font-display text-xl text-ink">Thêm Phật tử</h2>
      <label className="block text-xs text-muted">
        Họ tên *
        <input name="fullName" required className="mt-1 w-full border border-fog px-3 py-2" />
      </label>
      <label className="block text-xs text-muted">
        Pháp danh
        <input name="dharmaName" className="mt-1 w-full border border-fog px-3 py-2" />
      </label>
      <div className="grid grid-cols-2 gap-3">
        <label className="block text-xs text-muted">
          Năm sinh
          <input name="birthYear" type="number" className="mt-1 w-full border border-fog px-3 py-2" />
        </label>
        <label className="block text-xs text-muted">
          Ngày quy y
          <input name="quyYDate" type="date" className="mt-1 w-full border border-fog px-3 py-2" />
        </label>
      </div>
      <label className="block text-xs text-muted">
        SĐT
        <input name="phone" className="mt-1 w-full border border-fog px-3 py-2" />
      </label>
      <label className="block text-xs text-muted">
        Địa chỉ
        <input name="address" className="mt-1 w-full border border-fog px-3 py-2" />
      </label>
      <label className="block text-xs text-muted">
        Ghi chú
        <textarea name="note" rows={2} className="mt-1 w-full border border-fog px-3 py-2 resize-none" />
      </label>
      {msg ? <p className="text-xs text-muted">{msg}</p> : null}
      <button
        type="submit"
        disabled={pending}
        className="w-full py-2.5 text-sm text-white bg-ink disabled:opacity-60"
      >
        {pending ? 'Đang lưu…' : 'Lưu Phật tử'}
      </button>
    </form>
  );
}
