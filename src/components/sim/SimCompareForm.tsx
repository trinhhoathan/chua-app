'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

/**
 * Form nhập 2–4 số điện thoại để so sánh — đẩy lên URL ?so=...
 */
export function SimCompareForm({
  initial,
  primaryColor,
}: {
  initial: string[];
  primaryColor: string;
}) {
  const router = useRouter();
  const [phones, setPhones] = useState<string[]>(() => {
    const list = [...initial];
    while (list.length < 2) list.push('');
    return list.slice(0, 4);
  });

  function setAt(i: number, v: string) {
    setPhones((prev) => prev.map((p, idx) => (idx === i ? v.replace(/\D/g, '').slice(0, 10) : p)));
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const valid = phones.map((p) => p.trim()).filter((p) => p.length === 10);
    if (valid.length < 2) return;
    router.push(`/sim/so-sanh?so=${valid.join(',')}`);
  }

  return (
    <form onSubmit={submit} className="border border-fog bg-paper p-4">
      <p className="text-sm font-medium text-ink">Nhập các số cần so sánh</p>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        {phones.map((p, i) => (
          <input
            key={i}
            value={p}
            onChange={(e) => setAt(i, e.target.value)}
            inputMode="tel"
            placeholder={`Số ${i + 1} (10 chữ số)`}
            className="h-10 w-44 border border-fog bg-white px-3 text-sm text-ink outline-none placeholder:text-muted/70 focus:border-lacquer"
          />
        ))}
        {phones.length < 4 ? (
          <button
            type="button"
            onClick={() => setPhones((prev) => [...prev, ''])}
            className="h-10 border border-dashed border-fog px-3 text-sm text-muted hover:text-ink"
          >
            + Thêm số
          </button>
        ) : null}
        <button
          type="submit"
          className="h-10 px-5 text-sm font-medium text-white hover:opacity-90"
          style={{ backgroundColor: primaryColor }}
        >
          So sánh
        </button>
      </div>
      <p className="mt-2 text-[0.68rem] text-muted">
        Có thể so sánh cả số ngoài kho — hệ thống sẽ tự chấm điểm theo nguyên lý Âm Dương Ngũ Hành, Kinh dịch diệu luận.
      </p>
    </form>
  );
}
