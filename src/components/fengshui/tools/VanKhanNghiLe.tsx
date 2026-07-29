'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  VAN_KHAN_CATEGORY_LABELS,
  VAN_KHAN_ITEMS,
  fillVanKhanPlaceholders,
  getVanKhan,
  type VanKhanCategory,
  type VanKhanItem,
} from '@/lib/fengshui/van-khan-nghi-le';
import { inputCls, labelCls } from '../FieldStyles';

interface Props {
  primaryColor: string;
  templeName: string;
}

type FilterCat = VanKhanCategory | 'all';

const FILTERS: { id: FilterCat; label: string }[] = [
  { id: 'all', label: 'Tất cả' },
  { id: 'ram_mung1', label: 'Rằm · mùng 1' },
  { id: 'cau_an', label: 'Cầu an' },
  { id: 'cau_sieu', label: 'Cầu siêu' },
  { id: 'cung_duong', label: 'Cúng dường' },
  { id: 'le_phat', label: 'Lễ · vía' },
  { id: 'gia_duong', label: 'Gia đình' },
  { id: 'nghi_le', label: 'Nghi lễ' },
];

export function VanKhanNghiLe({ primaryColor, templeName }: Props) {
  const [filter, setFilter] = useState<FilterCat>('all');
  const [query, setQuery] = useState('');
  const [activeId, setActiveId] = useState<string | null>(null);
  const [devoteeName, setDevoteeName] = useState('');

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    return VAN_KHAN_ITEMS.filter((item) => {
      if (filter !== 'all' && item.category !== filter) return false;
      if (!q) return true;
      return (
        item.title.toLowerCase().includes(q) ||
        item.shortTitle.toLowerCase().includes(q) ||
        item.occasion.toLowerCase().includes(q) ||
        item.summary.toLowerCase().includes(q)
      );
    });
  }, [filter, query]);

  const active = activeId ? getVanKhan(activeId) : null;

  if (active) {
    return (
      <VanKhanReader
        item={active}
        primaryColor={primaryColor}
        templeName={templeName}
        devoteeName={devoteeName}
        onDevoteeName={setDevoteeName}
        onBack={() => setActiveId(null)}
      />
    );
  }

  return (
    <div>
      <p className="text-sm text-muted leading-relaxed mb-5">
        Mẫu văn khấn và hướng dẫn nghi lễ thường dùng tại chùa Việt — rằm, mùng
        1, cầu an, cầu siêu, cúng dường… Điền tên rồi mở bài để đọc. Kết hợp{' '}
        <Link
          href="/phong-thuy/kinh-tung-thuong-dung"
          className="underline underline-offset-2 hover:text-ink"
        >
          kinh tụng
        </Link>{' '}
        hoặc sổ cầu an / cầu siêu của nhà chùa khi có.
      </p>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
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
          <span className="sr-only">Tìm văn khấn</span>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Tìm theo tên, dịp…"
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
          list.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => setActiveId(item.id)}
                className="w-full text-left px-4 py-4 hover:bg-mist/60 transition-colors"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="font-display text-lg text-ink">
                    {item.shortTitle}
                  </p>
                  <span
                    className="text-[0.65rem] uppercase tracking-[0.2em] shrink-0"
                    style={{ color: primaryColor }}
                  >
                    {VAN_KHAN_CATEGORY_LABELS[item.category]}
                  </span>
                </div>
                <p className="mt-1 text-xs text-muted">{item.occasion}</p>
                <p className="mt-2 text-sm text-muted leading-relaxed line-clamp-2">
                  {item.summary}
                </p>
              </button>
            </li>
          ))
        )}
      </ul>

      <p className="mt-5 text-xs text-muted leading-relaxed">
        Bản mẫu phổ thông Bắc truyền. Mỗi chùa / hệ phái có thể khác câu chữ —
        nên theo thầy trụ trì khi dự lễ.
        <span className="block mt-1" style={{ color: primaryColor }}>
          Nhà chùa có thể bổ sung bản riêng sau.
        </span>
      </p>
    </div>
  );
}

function VanKhanReader({
  item,
  primaryColor,
  templeName,
  devoteeName,
  onDevoteeName,
  onBack,
}: {
  item: VanKhanItem;
  primaryColor: string;
  templeName: string;
  devoteeName: string;
  onDevoteeName: (v: string) => void;
  onBack: () => void;
}) {
  const fill = (line: string) =>
    fillVanKhanPlaceholders(line, { templeName, devoteeName });

  async function copyAll() {
    const parts: string[] = [item.title, ''];
    for (const sec of item.sections) {
      if (sec.title) parts.push(`【${sec.title}】`);
      for (const line of sec.lines) parts.push(fill(line));
      parts.push('');
    }
    try {
      await navigator.clipboard.writeText(parts.join('\n'));
    } catch {
      /* ignore */
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={onBack}
        className="text-xs text-muted hover:text-ink"
      >
        ← Danh mục văn khấn
      </button>

      <div className="mt-4 flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <span
          className="text-[0.65rem] uppercase tracking-[0.22em]"
          style={{ color: primaryColor }}
        >
          {VAN_KHAN_CATEGORY_LABELS[item.category]}
        </span>
        <p className="text-xs text-muted">{item.occasion}</p>
      </div>

      <h2 className="mt-2 font-display text-2xl md:text-3xl text-ink leading-tight">
        {item.title}
      </h2>
      <p className="mt-3 text-sm text-muted leading-relaxed">{item.summary}</p>

      <div className="mt-4 max-w-sm">
        <label className={labelCls()} htmlFor="vk-name">
          Họ tên đệ tử (điền vào chỗ trống)
        </label>
        <input
          id="vk-name"
          className={inputCls}
          value={devoteeName}
          onChange={(e) => onDevoteeName(e.target.value)}
          placeholder="VD: Nguyễn Văn A"
        />
      </div>

      {item.ritualTips && item.ritualTips.length > 0 ? (
        <div className="mt-5 border border-fog bg-paper/70 px-4 py-3">
          <p className="text-[10px] uppercase tracking-wide text-muted">
            Gợi ý nghi
          </p>
          <ul className="mt-2 space-y-1.5 text-sm text-ink leading-relaxed">
            {item.ritualTips.map((tip) => (
              <li key={tip} className="flex gap-2">
                <span style={{ color: primaryColor }}>·</span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={copyAll}
          className="inline-flex px-4 py-2 text-sm text-white"
          style={{ background: primaryColor }}
        >
          Sao chép bài khấn
        </button>
        <Link
          href="/phong-thuy/kinh-tung-thuong-dung"
          className="inline-flex px-4 py-2 text-sm border border-fog text-ink hover:bg-mist"
        >
          Mở kinh tụng
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
        <p className="text-xs text-muted">
          Tại {templeName}
          {devoteeName.trim() ? ` · Đệ tử ${devoteeName.trim()}` : null}
        </p>
        {item.sections.map((sec, i) => (
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
                  {fill(line)}
                </p>
              ))}
            </div>
          </section>
        ))}
      </article>

      <p className="mt-5 text-xs text-muted leading-relaxed">
        Khấn với tâm thành, rõ ràng, không vội. Xong nên hồi hướng công đức và
        giữ giới trong đời sống hằng ngày.
      </p>
    </div>
  );
}
