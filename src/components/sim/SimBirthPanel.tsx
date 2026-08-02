'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useTransition } from 'react';
import { SIM_GOALS } from '@/lib/sim/bat-tu';

/**
 * Panel "Tìm sim hợp mệnh": nhập ngày sinh, giờ sinh, giới tính, mục tiêu.
 * Đẩy lên URL (ns/gio/gt/lich/mt) — server tính dụng thần và % hợp từng sim.
 */
export function SimBirthPanel({
  primaryColor,
  compact,
  dungThanSummary,
}: {
  primaryColor: string;
  compact?: boolean;
  /** Chuỗi tóm tắt dụng thần server đã tính (hiện khi có ngày sinh) */
  dungThanSummary?: string | null;
}) {
  const router = useRouter();
  const sp = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [date, setDate] = useState(sp.get('ns') ?? '');
  const [hour, setHour] = useState(sp.get('gio') ?? '');
  const [gender, setGender] = useState(sp.get('gt') === 'nu' ? 'nu' : 'nam');
  const [calendar, setCalendar] = useState(sp.get('lich') === 'am' ? 'am' : 'duong');
  const [goal, setGoal] = useState(sp.get('mt') ?? 'tai_van');

  const active = Boolean(sp.get('ns'));

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!date) return;
    const params = new URLSearchParams(sp.toString());
    params.set('ns', date);
    if (hour !== '') params.set('gio', hour);
    else params.delete('gio');
    params.set('gt', gender);
    if (calendar === 'am') params.set('lich', 'am');
    else params.delete('lich');
    params.set('mt', goal);
    params.delete('trang');
    startTransition(() => {
      router.push(`?${params.toString()}`, { scroll: false });
    });
  }

  function clear() {
    const params = new URLSearchParams(sp.toString());
    for (const k of ['ns', 'gio', 'gt', 'lich', 'mt']) params.delete(k);
    startTransition(() => {
      router.push(`?${params.toString()}`, { scroll: false });
    });
  }

  // min-w-0 max-w-full: iOS Safari date có min-width native, dễ tràn khỏi form
  const inputCls =
    'box-border h-9 w-full min-w-0 max-w-full border border-fog bg-white px-2 text-xs text-ink outline-none focus:border-lacquer';

  return (
    <div
      className="min-w-0 border bg-paper"
      style={{ borderColor: `${primaryColor}55` }}
    >
      <div
        className="flex items-center justify-between px-4 py-2.5"
        style={{ backgroundColor: `${primaryColor}0d` }}
      >
        <p className="text-[0.72rem] font-medium uppercase tracking-[0.2em]" style={{ color: primaryColor }}>
          Tìm sim hợp mệnh theo Bát Tự
        </p>
        {active ? (
          <button
            type="button"
            onClick={clear}
            className="text-[0.65rem] text-muted underline underline-offset-2 hover:text-ink"
          >
            Bỏ cá nhân hóa
          </button>
        ) : null}
      </div>

      <form
        onSubmit={submit}
        className="grid min-w-0 gap-2.5 p-4 md:grid-cols-[1.2fr_1fr_0.9fr_0.9fr_1.1fr_auto]"
      >
        <label className="block min-w-0">
          <span className="mb-1 block text-[0.65rem] text-muted">Ngày sinh</span>
          <input
            type="date"
            required
            value={date}
            min="1920-01-01"
            max="2026-12-31"
            onChange={(e) => setDate(e.target.value)}
            className={inputCls}
          />
        </label>
        <label className="block min-w-0">
          <span className="mb-1 block text-[0.65rem] text-muted">Giờ sinh</span>
          <select value={hour} onChange={(e) => setHour(e.target.value)} className={inputCls}>
            <option value="">Không rõ giờ</option>
            {Array.from({ length: 24 }, (_, h) => (
              <option key={h} value={h}>
                {String(h).padStart(2, '0')}:00 – {String(h).padStart(2, '0')}:59
              </option>
            ))}
          </select>
        </label>
        <label className="block min-w-0">
          <span className="mb-1 block text-[0.65rem] text-muted">Giới tính</span>
          <select value={gender} onChange={(e) => setGender(e.target.value)} className={inputCls}>
            <option value="nam">Nam</option>
            <option value="nu">Nữ</option>
          </select>
        </label>
        <label className="block min-w-0">
          <span className="mb-1 block text-[0.65rem] text-muted">Loại lịch</span>
          <select value={calendar} onChange={(e) => setCalendar(e.target.value)} className={inputCls}>
            <option value="duong">Dương lịch</option>
            <option value="am">Âm lịch</option>
          </select>
        </label>
        <label className="block min-w-0">
          <span className="mb-1 block text-[0.65rem] text-muted">Ưu tiên</span>
          <select value={goal} onChange={(e) => setGoal(e.target.value)} className={inputCls}>
            {SIM_GOALS.map((g) => (
              <option key={g.id} value={g.id}>
                {g.label} — {g.hint}
              </option>
            ))}
          </select>
        </label>
        <div className="flex items-end">
          <button
            type="submit"
            disabled={isPending}
            className="h-9 w-full whitespace-nowrap px-4 text-xs font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-60 md:w-auto"
            style={{ backgroundColor: primaryColor }}
          >
            {isPending ? 'Đang luận…' : 'Xem độ hợp'}
          </button>
        </div>
      </form>

      {active && dungThanSummary ? (
        <div className="border-t border-fog px-4 py-2.5 text-[0.72rem] leading-relaxed text-ink/80">
          {dungThanSummary}
        </div>
      ) : !compact ? (
        <div className="border-t border-fog px-4 py-2.5 text-[0.68rem] text-muted">
          Nhập ngày giờ sinh — hệ thống lập tứ trụ Bát Tự, tìm dụng thần ngũ hành rồi
          chấm % hợp mệnh cho từng sim trong kho.
        </div>
      ) : null}
    </div>
  );
}
