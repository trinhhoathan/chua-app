'use client';

import { useDeferredValue, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  KINH_CATEGORIES,
  KINH_FOOTNOTE,
  KINH_INTRO,
  searchKinhCatalog,
  type KinhCategory,
} from '@/lib/fengshui/tra-cuu-kinh';
import { inputCls, labelCls } from '../FieldStyles';

interface Props {
  primaryColor: string;
}

type FilterCategory = KinhCategory | 'all';

export function TraCuuKinh({ primaryColor }: Props) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<FilterCategory>('all');
  const deferredQuery = useDeferredValue(query);

  const results = useMemo(
    () => searchKinhCatalog(deferredQuery, category),
    [deferredQuery, category],
  );

  return (
    <div className="space-y-8">
      <p className="text-sm text-muted leading-relaxed">{KINH_INTRO}</p>

      <div className="space-y-4">
        <label className={labelCls()}>
          Tìm theo tên kinh, chủ đề hoặc việc cần làm
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ví dụ: cầu siêu, Quan Âm, Di Đà…"
            className={`mt-1 ${inputCls}`}
            autoComplete="off"
          />
        </label>

        <div>
          <p className={`${labelCls()} mb-2`}>Nhóm kinh</p>
          <div className="flex flex-wrap gap-2">
            <FilterChip
              active={category === 'all'}
              label="Tất cả"
              primaryColor={primaryColor}
              onClick={() => setCategory('all')}
            />
            {KINH_CATEGORIES.map((cat) => (
              <FilterChip
                key={cat}
                active={category === cat}
                label={cat}
                primaryColor={primaryColor}
                onClick={() => setCategory(cat)}
              />
            ))}
          </div>
        </div>
      </div>

      <p className="text-xs text-muted tabular-nums">
        {results.length} mục
        {deferredQuery.trim() ? ` · khớp “${deferredQuery.trim()}”` : ''}
      </p>

      {results.length === 0 ? (
        <div className="border border-fog bg-paper px-4 py-5">
          <p className="text-sm text-muted leading-relaxed">
            Không tìm thấy kinh phù hợp. Thử từ khóa ngắn hơn (ví dụ: “cầu
            an”, “Vu Lan”) hoặc chọn lại nhóm kinh.
          </p>
        </div>
      ) : (
        <ul className="divide-y divide-fog border border-fog bg-white">
          {results.map((entry) => (
            <li key={entry.id} className="px-4 py-4 space-y-2">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h2 className="font-display text-lg text-ink">{entry.title}</h2>
                <span
                  className="text-[0.7rem] uppercase tracking-[0.18em]"
                  style={{ color: primaryColor }}
                >
                  {entry.category}
                </span>
              </div>
              {entry.aliases?.length ? (
                <p className="text-xs text-muted">
                  Còn gọi: {entry.aliases.join(' · ')}
                </p>
              ) : null}
              <p className="text-sm text-muted leading-relaxed">
                {entry.summary}
              </p>
              {entry.whenToUse ? (
                <p className="text-sm text-ink leading-relaxed">
                  <span className="text-muted">Nên dùng khi: </span>
                  {entry.whenToUse}
                </p>
              ) : null}
            </li>
          ))}
        </ul>
      )}

      <div className="flex flex-wrap gap-3">
        <Link
          href="/phong-thuy/kinh-tung-thuong-dung"
          className="px-4 py-2.5 text-sm text-white"
          style={{ background: primaryColor }}
        >
          Kinh tụng thường dùng
        </Link>
        <Link
          href="/go-mo"
          className="px-4 py-2.5 text-sm border border-fog text-ink hover:bg-mist"
        >
          Gõ mõ tụng kinh
        </Link>
      </div>

      <p className="text-xs text-muted leading-relaxed">{KINH_FOOTNOTE}</p>
    </div>
  );
}

function FilterChip({
  active,
  label,
  primaryColor,
  onClick,
}: {
  active: boolean;
  label: string;
  primaryColor: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3 py-1.5 text-sm border transition-colors ${
        active ? '' : 'border-fog text-ink hover:bg-mist'
      }`}
      style={
        active
          ? {
              background: primaryColor,
              borderColor: primaryColor,
              color: '#fff',
            }
          : undefined
      }
      aria-pressed={active}
    >
      {label}
    </button>
  );
}
