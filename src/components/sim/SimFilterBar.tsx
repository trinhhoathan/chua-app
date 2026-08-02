'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useTransition } from 'react';
import {
  NETWORK_LABELS,
  PRICE_RANGES,
  SIM_PURPOSE_GROUPS,
  SIM_PURPOSES,
  SIM_TAG_LABELS,
} from '@/lib/sim/catalog';
import { SIM_CAREERS } from '@/lib/sim/careers';

const ELEMENTS = [
  { id: 'kim', label: 'Mệnh Kim' },
  { id: 'moc', label: 'Mệnh Mộc' },
  { id: 'thuy', label: 'Mệnh Thủy' },
  { id: 'hoa', label: 'Mệnh Hỏa' },
  { id: 'tho', label: 'Mệnh Thổ' },
];

const SORTS = [
  { id: 'score', label: 'Điểm phong thủy cao' },
  { id: 'price_asc', label: 'Giá thấp → cao' },
  { id: 'price_desc', label: 'Giá cao → thấp' },
  { id: 'newest', label: 'Mới về kho' },
];

const NUT_OPTIONS = [
  { id: '8', label: '8 nút (phát)' },
  { id: '6', label: '6 nút (lộc)' },
  { id: '9', label: '9 nút' },
  { id: '10', label: '10 nút' },
  { id: '1', label: '1 nút (sinh khí)' },
];

export interface QueFilterOption {
  number: number;
  label: string;
  unicode: string;
  /** Mức cát hung để hiển thị kèm tên quẻ */
  rankLabel: string;
}

/**
 * Thanh tìm kiếm + bộ lọc kho sim — đẩy lên URL query (server render kết quả).
 */
export function SimFilterBar({
  primaryColor,
  queOptions,
}: {
  primaryColor: string;
  /** 64 quẻ Kinh Dịch (truyền từ server để không kéo data vào bundle) */
  queOptions?: QueFilterOption[];
}) {
  const router = useRouter();
  const sp = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [q, setQ] = useState(sp.get('q') ?? '');
  const [tailYear, setTailYear] = useState(sp.get('namsinh') ?? '');

  function apply(patch: Record<string, string | null>) {
    const params = new URLSearchParams(sp.toString());
    for (const [k, v] of Object.entries(patch)) {
      if (v == null || v === '') params.delete(k);
      else params.set(k, v);
    }
    params.delete('trang');
    startTransition(() => {
      router.push(`/sim?${params.toString()}`, { scroll: false });
    });
  }

  const selectCls =
    'h-9 border border-fog bg-paper px-2 text-xs text-ink outline-none focus:border-lacquer';

  return (
    <div className="border border-fog bg-paper p-3 md:p-4">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          apply({ q });
        }}
        className="flex gap-2"
      >
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          inputMode="tel"
          placeholder="Tìm sim: 6789 · 090*8888 · *6868*"
          className="h-10 flex-1 border border-fog bg-white px-3 text-sm text-ink outline-none placeholder:text-muted/70 focus:border-lacquer"
        />
        <button
          type="submit"
          disabled={isPending}
          className="h-10 px-5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-60"
          style={{ backgroundColor: primaryColor }}
        >
          {isPending ? 'Đang tìm…' : 'Tìm sim'}
        </button>
      </form>
      <p className="mt-1.5 text-[0.65rem] text-muted">
        Mẹo: gõ <span className="font-mono">090*8888</span> tìm đầu 090 đuôi 8888 ·{' '}
        <span className="font-mono">*6868*</span> tìm sim chứa 6868
      </p>

      {/* Kiểu sim theo mục đích — 3 nhóm */}
      <div className="mt-3 space-y-3">
        <p className="text-[0.65rem] uppercase tracking-[0.2em] text-muted">
          Tìm theo mục đích
        </p>
        {SIM_PURPOSE_GROUPS.map((g) => (
          <div key={g.id}>
            <p className="mb-1 text-[0.68rem] font-medium text-ink/80">{g.label}</p>
            <div className="flex flex-wrap gap-1.5">
              {SIM_PURPOSES.filter((p) => p.group === g.id).map((p) => {
                const active = sp.get('mucdich') === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    title={p.blurb}
                    onClick={() => apply({ mucdich: active ? null : p.id })}
                    className={`border px-2.5 py-1.5 text-xs transition-colors ${
                      active
                        ? 'border-transparent font-semibold text-white'
                        : 'border-fog bg-white text-ink hover:border-ink/30'
                    }`}
                    style={active ? { backgroundColor: primaryColor } : undefined}
                  >
                    {p.label}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-6">
        <select
          className={selectCls}
          value={sp.get('mang') ?? ''}
          onChange={(e) => apply({ mang: e.target.value || null })}
        >
          <option value="">Tất cả nhà mạng</option>
          {Object.entries(NETWORK_LABELS)
            .filter(([id]) => id !== 'khac')
            .map(([id, label]) => (
              <option key={id} value={id}>
                {label}
              </option>
            ))}
        </select>

        <select
          className={selectCls}
          value={sp.get('gia') ?? ''}
          onChange={(e) => apply({ gia: e.target.value || null })}
        >
          <option value="">Mọi khoảng giá</option>
          {PRICE_RANGES.map((r) => (
            <option key={r.id} value={r.id}>
              {r.label}
            </option>
          ))}
        </select>

        <select
          className={selectCls}
          value={sp.get('loai') ?? ''}
          onChange={(e) => apply({ loai: e.target.value || null })}
        >
          <option value="">Mọi kiểu số</option>
          {Object.entries(SIM_TAG_LABELS).map(([id, label]) => (
            <option key={id} value={id}>
              {label}
            </option>
          ))}
        </select>

        <select
          className={selectCls}
          value={sp.get('menh') ?? ''}
          onChange={(e) => apply({ menh: e.target.value || null, nghe: null })}
        >
          <option value="">Mọi mệnh ngũ hành</option>
          {ELEMENTS.map((el) => (
            <option key={el.id} value={el.id}>
              {el.label}
            </option>
          ))}
        </select>

        <select
          className={selectCls}
          value={sp.get('nghe') ?? ''}
          onChange={(e) => apply({ nghe: e.target.value || null, menh: null })}
        >
          <option value="">Mọi ngành nghề</option>
          {SIM_CAREERS.map((c) => (
            <option key={c.id} value={c.id}>
              {c.label}
            </option>
          ))}
        </select>

        <select
          className={selectCls}
          value={sp.get('sap') ?? 'score'}
          onChange={(e) => apply({ sap: e.target.value })}
        >
          {SORTS.map((s) => (
            <option key={s.id} value={s.id}>
              {s.label}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-2">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            apply({ namsinh: /^\d{4}$/.test(tailYear) ? tailYear : null });
          }}
          className="flex items-center gap-1.5"
        >
          <input
            value={tailYear}
            onChange={(e) => setTailYear(e.target.value.replace(/\D/g, '').slice(0, 4))}
            inputMode="numeric"
            placeholder="Đuôi năm sinh, VD 1990"
            className={`${selectCls} w-40`}
          />
          <button
            type="submit"
            className="h-9 border border-fog px-2.5 text-xs text-ink hover:border-lacquer"
          >
            Lọc đuôi
          </button>
        </form>

        <select
          className={selectCls}
          value={sp.get('nut') ?? ''}
          onChange={(e) => apply({ nut: e.target.value || null })}
        >
          <option value="">Mọi tổng nút</option>
          {NUT_OPTIONS.map((n) => (
            <option key={n.id} value={n.id}>
              {n.label}
            </option>
          ))}
        </select>

        {queOptions && queOptions.length > 0 ? (
          <select
            className={selectCls}
            value={sp.get('que') ?? ''}
            onChange={(e) => apply({ que: e.target.value || null })}
            title="Chọn sim theo quẻ Kinh Dịch (Mai Hoa Dịch Số)"
          >
            <option value="">Mọi quẻ Kinh Dịch</option>
            {queOptions.map((q) => (
              <option key={q.number} value={q.number}>
                {q.unicode} {q.label} · {q.rankLabel}
              </option>
            ))}
          </select>
        ) : null}

        <label className="flex cursor-pointer items-center gap-1.5 text-xs text-ink">
          <input
            type="checkbox"
            checked={sp.get('tranh47') === '1'}
            onChange={(e) => apply({ tranh47: e.target.checked ? '1' : null })}
            className="h-4 w-4 accent-current"
          />
          Tránh số 4 và 7 (tứ – thất)
        </label>
      </div>

      {hasActiveFilters(sp) ? (
        <button
          type="button"
          onClick={() => {
            setQ('');
            setTailYear('');
            apply({
              q: null,
              mang: null,
              gia: null,
              loai: null,
              menh: null,
              nghe: null,
              sap: null,
              diem: null,
              namsinh: null,
              nut: null,
              que: null,
              tranh47: null,
              mucdich: null,
            });
          }}
          className="mt-2 text-[0.7rem] text-muted underline underline-offset-2 hover:text-ink"
        >
          Xóa bộ lọc
        </button>
      ) : null}
    </div>
  );
}

function hasActiveFilters(sp: URLSearchParams): boolean {
  return [
    'q',
    'mang',
    'gia',
    'loai',
    'menh',
    'nghe',
    'diem',
    'namsinh',
    'nut',
    'que',
    'tranh47',
    'mucdich',
  ].some((k) => sp.get(k));
}
