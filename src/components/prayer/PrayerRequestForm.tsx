'use client';

import { useState, useTransition } from 'react';
import { createPrayerRequest } from '@/app/actions/admin';
import type { PrayerRequestType } from '@/types/database';

export function PrayerRequestForm({
  primaryColor,
  templeName,
}: {
  primaryColor: string;
  templeName: string;
}) {
  const [type, setType] = useState<PrayerRequestType>('cau_an');
  const [pending, start] = useTransition();
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (done) {
    return (
      <div className="border border-fog bg-paper p-8 text-center">
        <p className="font-display text-2xl text-ink">Đã ghi nhận sớ</p>
        <p className="mt-3 text-sm text-muted">
          {templeName} đã nhận đăng ký. Ban hộ niệm sẽ chuẩn bị cho đại lễ.
        </p>
        <button
          className="mt-6 text-sm underline"
          onClick={() => setDone(false)}
        >
          Đăng ký thêm
        </button>
      </div>
    );
  }

  return (
    <form
      className="border border-fog bg-paper p-6 space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        setError(null);
        start(async () => {
          const res = await createPrayerRequest({
            requestType: type,
            requesterName: String(fd.get('requesterName') ?? ''),
            requesterPhone: String(fd.get('requesterPhone') ?? ''),
            devoteeNames: String(fd.get('devoteeNames') ?? ''),
            birthYears: String(fd.get('birthYears') ?? ''),
            address: String(fd.get('address') ?? ''),
            ceremonyDate: String(fd.get('ceremonyDate') ?? '') || undefined,
            note: String(fd.get('note') ?? ''),
          });
          if (!res.ok) setError(res.error ?? 'Lỗi');
          else setDone(true);
        });
      }}
    >
      <div className="flex gap-2">
        {(
          [
            ['cau_an', 'Cầu an'],
            ['cau_sieu', 'Cầu siêu'],
          ] as const
        ).map(([v, label]) => (
          <button
            key={v}
            type="button"
            onClick={() => setType(v)}
            className={`px-4 py-2 text-sm border ${
              type === v ? 'text-white border-transparent' : 'border-fog text-ink'
            }`}
            style={type === v ? { backgroundColor: primaryColor } : undefined}
          >
            {label}
          </button>
        ))}
      </div>

      <label className="block text-xs text-muted">
        Họ tên người đăng ký *
        <input
          name="requesterName"
          required
          className="mt-1 w-full border border-fog px-3 py-2"
        />
      </label>
      <label className="block text-xs text-muted">
        Số điện thoại
        <input
          name="requesterPhone"
          className="mt-1 w-full border border-fog px-3 py-2"
        />
      </label>
      <label className="block text-xs text-muted">
        {type === 'cau_sieu'
          ? 'Họ tên hương linh (mỗi người một dòng) *'
          : 'Họ tên người được cầu an (mỗi người một dòng) *'}
        <textarea
          name="devoteeNames"
          required
          rows={4}
          className="mt-1 w-full border border-fog px-3 py-2 resize-none"
        />
      </label>
      <label className="block text-xs text-muted">
        Năm sinh (tuỳ chọn)
        <input
          name="birthYears"
          className="mt-1 w-full border border-fog px-3 py-2"
          placeholder="1950, 1962…"
        />
      </label>
      <label className="block text-xs text-muted">
        Địa chỉ
        <input name="address" className="mt-1 w-full border border-fog px-3 py-2" />
      </label>
      <label className="block text-xs text-muted">
        Ngày lễ dự kiến
        <input
          name="ceremonyDate"
          type="date"
          className="mt-1 w-full border border-fog px-3 py-2"
        />
      </label>
      <label className="block text-xs text-muted">
        Ghi chú
        <textarea
          name="note"
          rows={2}
          className="mt-1 w-full border border-fog px-3 py-2 resize-none"
        />
      </label>

      {error ? <p className="text-xs text-lacquer">{error}</p> : null}

      <button
        type="submit"
        disabled={pending}
        className="w-full py-3 text-sm text-white disabled:opacity-60"
        style={{ backgroundColor: primaryColor }}
      >
        {pending ? 'Đang gửi…' : 'Gửi đăng ký sớ'}
      </button>
    </form>
  );
}
