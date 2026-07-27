'use client';

import { useMemo, useState, useTransition } from 'react';
import { updateWaterPrice } from '@/app/actions/admin';

interface TemplePriceRow {
  id: string;
  name: string;
  water_price_vnd: number;
}

const PREVIEW_QTY = [10, 50, 100, 1000] as const;

function formatVnd(n: number): string {
  return new Intl.NumberFormat('vi-VN').format(n);
}

export function WaterPriceForm({ temples }: { temples: TemplePriceRow[] }) {
  const [templeId, setTempleId] = useState(temples[0]?.id ?? '');
  const current = temples.find((t) => t.id === templeId) ?? temples[0];
  const [priceInput, setPriceInput] = useState(
    String(current?.water_price_vnd ?? 80000),
  );
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const price = useMemo(() => {
    const n = Number(String(priceInput).replace(/\D/g, ''));
    return Number.isFinite(n) ? n : 0;
  }, [priceInput]);

  function onSelectTemple(id: string) {
    setTempleId(id);
    const t = temples.find((x) => x.id === id);
    setPriceInput(String(t?.water_price_vnd ?? 80000));
    setMsg(null);
    setErr(null);
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!templeId) return;
    setMsg(null);
    setErr(null);
    start(async () => {
      const res = await updateWaterPrice({
        templeId,
        waterPriceVnd: price,
      });
      if (!res.ok) {
        setErr(res.error ?? 'Không lưu được.');
        return;
      }
      setMsg(
        `Đã cập nhật đơn giá ${formatVnd(res.price ?? price)}đ / thùng cho ${current?.name ?? 'chùa'}.`,
      );
      setPriceInput(String(res.price ?? price));
    });
  }

  if (!current) {
    return <p className="text-muted text-sm">Chưa có chùa để cấu hình.</p>;
  }

  return (
    <div className="grid lg:grid-cols-[1fr_1fr] gap-8">
      <form
        onSubmit={submit}
        className="border border-fog bg-paper p-5 md:p-6 space-y-4"
      >
        <h2 className="font-display text-xl text-ink">Cập nhật đơn giá</h2>
        <p className="text-sm text-muted leading-relaxed">
          Đơn giá / mức phát tâm trên website khi Quý Phật tử thỉnh nước. Phát
          tâm đã ghi nhận giữ nguyên mức cũ; chỉ áp dụng cho phát tâm mới.
        </p>

        {temples.length > 1 ? (
          <label className="block text-xs text-muted">
            Chùa
            <select
              value={templeId}
              onChange={(e) => onSelectTemple(e.target.value)}
              className="mt-1 w-full border border-fog px-3 py-2 bg-white text-ink text-sm"
            >
              {temples.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} — {formatVnd(t.water_price_vnd)}đ
                </option>
              ))}
            </select>
          </label>
        ) : (
          <p className="text-sm text-ink font-medium">{current.name}</p>
        )}

        <label className="block text-xs text-muted">
          Đơn giá / thùng (VND) — mức phát tâm
          <input
            type="text"
            inputMode="numeric"
            value={priceInput}
            onChange={(e) => setPriceInput(e.target.value)}
            className="mt-1 w-full border border-fog px-3 py-2.5 bg-white text-ink text-lg font-medium"
            required
          />
          <span className="mt-1 block text-[11px] text-muted">
            Hiện tại: {formatVnd(current.water_price_vnd)}đ · làm tròn hàng nghìn
          </span>
        </label>

        <div className="flex flex-wrap gap-2">
          {[50000, 80000, 100000, 120000].map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPriceInput(String(p))}
              className="text-xs px-3 py-1.5 border border-fog hover:bg-mist"
            >
              {formatVnd(p)}đ
            </button>
          ))}
        </div>

        {err ? <p className="text-sm text-lacquer">{err}</p> : null}
        {msg ? <p className="text-sm text-ink">{msg}</p> : null}

        <button
          type="submit"
          disabled={pending}
          className="px-5 py-2.5 bg-ink text-white text-sm disabled:opacity-60"
        >
          {pending ? 'Đang lưu…' : 'Lưu đơn giá'}
        </button>
      </form>

      <div className="border border-fog bg-paper p-5 md:p-6">
        <h2 className="font-display text-xl text-ink">Xem trước mức phát tâm</h2>
        <p className="mt-2 text-sm text-muted">
          Theo mức đang nhập: <b className="text-ink">{formatVnd(price)}đ</b>
          /thùng · tối thiểu 10 thùng mỗi lần thỉnh.
        </p>
        <ul className="mt-6 divide-y divide-fog border border-fog">
          {PREVIEW_QTY.map((q) => (
            <li
              key={q}
              className="flex items-baseline justify-between gap-3 px-4 py-3 text-sm"
            >
              <span className="text-muted">{q.toLocaleString('vi-VN')} thùng</span>
              <span className="font-medium text-ink">
                {formatVnd(q * price)}đ
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
