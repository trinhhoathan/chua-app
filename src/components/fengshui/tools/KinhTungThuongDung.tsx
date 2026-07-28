'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  COMMON_SUTRAS,
  SUTRA_KIND_LABELS,
  type Sutra,
  type SutraKind,
  getSutra,
} from '@/lib/fengshui/sutras';

interface Props {
  primaryColor: string;
}

type FilterKind = SutraKind | 'all';

const FILTERS: { id: FilterKind; label: string }[] = [
  { id: 'all', label: 'Tất cả' },
  { id: 'kinh', label: 'Kinh' },
  { id: 'chu', label: 'Chú' },
  { id: 'nghi_thuc', label: 'Nghi thức' },
];

export function KinhTungThuongDung({ primaryColor }: Props) {
  const [filter, setFilter] = useState<FilterKind>('all');
  const [query, setQuery] = useState('');
  const [activeId, setActiveId] = useState<string | null>(null);

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    return COMMON_SUTRAS.filter((s) => {
      if (filter !== 'all' && s.kind !== filter) return false;
      if (!q) return true;
      return (
        s.title.toLowerCase().includes(q) ||
        s.shortTitle.toLowerCase().includes(q) ||
        s.occasion.toLowerCase().includes(q) ||
        s.summary.toLowerCase().includes(q)
      );
    });
  }, [filter, query]);

  const active = activeId ? getSutra(activeId) : null;

  if (active) {
    return (
      <SutraReader
        sutra={active}
        primaryColor={primaryColor}
        onBack={() => setActiveId(null)}
      />
    );
  }

  return (
    <div>
      <p className="text-sm text-muted leading-relaxed mb-5">
        Kho kinh · chú · nghi thức tụng phổ biến tại chùa Việt. Chọn bài để đọc;
        tìm theo nhu cầu ở{' '}
        <Link
          href="/phong-thuy/tra-cuu-kinh"
          className="underline underline-offset-2 hover:text-ink"
        >
          Tra cứu kinh sách
        </Link>
        , hoặc mở{' '}
        <Link href="/go-mo" className="underline underline-offset-2 hover:text-ink">
          Gõ mõ tụng kinh
        </Link>{' '}
        để trì niệm kèm pháp khí.
      </p>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-1.5">
          {FILTERS.map((f) => {
            const on = filter === f.id;
            return (
              <button
                key={f.id}
                type="button"
                onClick={() => setFilter(f.id)}
                className="px-3 py-1.5 text-xs border transition-colors"
                style={
                  on
                    ? {
                        background: primaryColor,
                        borderColor: primaryColor,
                        color: '#fff',
                      }
                    : undefined
                }
              >
                {f.label}
              </button>
            );
          })}
        </div>
        <label className="block sm:w-56">
          <span className="sr-only">Tìm kinh</span>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Tìm theo tên, dịp tụng…"
            className="w-full border border-fog bg-white px-3 py-2 text-sm text-ink placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-ink/20"
          />
        </label>
      </div>

      <ul className="mt-6 divide-y divide-fog border border-fog bg-white">
        {list.length === 0 ? (
          <li className="px-4 py-8 text-sm text-muted text-center">
            Không có bài khớp bộ lọc.
          </li>
        ) : (
          list.map((s) => (
            <li key={s.id}>
              <button
                type="button"
                onClick={() => setActiveId(s.id)}
                className="w-full text-left px-4 py-4 hover:bg-mist/60 transition-colors"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="font-display text-lg text-ink">{s.shortTitle}</p>
                  <span
                    className="text-[0.65rem] uppercase tracking-[0.2em] shrink-0"
                    style={{ color: primaryColor }}
                  >
                    {SUTRA_KIND_LABELS[s.kind]}
                  </span>
                </div>
                <p className="mt-1 text-xs text-muted">{s.occasion}</p>
                <p className="mt-2 text-sm text-muted leading-relaxed line-clamp-2">
                  {s.summary}
                </p>
              </button>
            </li>
          ))
        )}
      </ul>

      <p className="mt-5 text-xs text-muted leading-relaxed">
        Bản chữ theo nghi thức Bắc truyền phổ thông. Một số chùa / hệ phái có thể
        khác phiên âm hoặc thêm đoạn nghi.
        <span className="block mt-1" style={{ color: primaryColor }}>
          Nhà chùa có thể bổ sung bản riêng sau.
        </span>
      </p>
    </div>
  );
}

function SutraReader({
  sutra,
  primaryColor,
  onBack,
}: {
  sutra: Sutra;
  primaryColor: string;
  onBack: () => void;
}) {
  return (
    <div>
      <button
        type="button"
        onClick={onBack}
        className="text-xs text-muted hover:text-ink"
      >
        ← Danh mục kinh tụng
      </button>

      <div className="mt-4 flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <span
          className="text-[0.65rem] uppercase tracking-[0.2em]"
          style={{ color: primaryColor }}
        >
          {SUTRA_KIND_LABELS[sutra.kind]}
        </span>
        <p className="text-xs text-muted">{sutra.occasion}</p>
      </div>

      <h2 className="mt-2 font-display text-2xl md:text-3xl text-ink leading-tight">
        {sutra.title}
      </h2>
      <p className="mt-3 text-sm text-muted leading-relaxed">{sutra.summary}</p>

      <div className="mt-4 flex flex-wrap gap-2">
        <Link
          href="/go-mo"
          className="inline-flex px-4 py-2 text-sm text-white"
          style={{ background: primaryColor }}
        >
          Mở gõ mõ tụng kèm
        </Link>
        <button
          type="button"
          onClick={onBack}
          className="inline-flex px-4 py-2 text-sm border border-fog text-ink hover:bg-mist"
        >
          Chọn bài khác
        </button>
      </div>

      <article className="mt-8 border border-fog bg-white px-4 py-6 md:px-8 md:py-8 space-y-8">
        {sutra.sections.map((sec, i) => (
          <section key={i}>
            {sec.title ? (
              <h3
                className="mb-3 text-[0.7rem] uppercase tracking-[0.22em]"
                style={{ color: primaryColor }}
              >
                {sec.title}
              </h3>
            ) : null}
            <div className="space-y-4">
              {sec.lines.map((line, j) => (
                <p
                  key={j}
                  className="font-display text-[1.05rem] md:text-lg text-ink leading-[1.85] text-pretty"
                >
                  {line}
                </p>
              ))}
            </div>
          </section>
        ))}
      </article>

      <p className="mt-5 text-xs text-muted leading-relaxed">
        Tụng với tâm thanh tịnh, rõ ràng, không vội. Kết thúc thời khóa nên sám
        hối và hồi hướng công đức.
      </p>
    </div>
  );
}
