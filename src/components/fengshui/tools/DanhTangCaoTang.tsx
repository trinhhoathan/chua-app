'use client';

import { useDeferredValue, useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  DANH_TANG_CATEGORY_LABELS,
  DANH_TANG_ENTRIES,
  DANH_TANG_FOOTNOTE,
  DANH_TANG_GUIDES,
  DANH_TANG_INTRO,
  getDanhTangEntry,
  searchDanhTangEntries,
  type DanhTangCategory,
  type DanhTangEntry,
} from '@/lib/fengshui/danh-tang-cao-tang';

interface Props {
  primaryColor: string;
  templeName: string;
  abbottName?: string | null;
  abbottTitle?: string | null;
  abbottBio?: string | null;
  abbottImageUrl?: string | null;
}

type FilterCat = DanhTangCategory | 'all';

const FILTERS: { id: FilterCat; label: string }[] = [
  { id: 'all', label: 'Tất cả' },
  { id: 'to_su', label: 'Tổ sư Thiền' },
  { id: 'truc_lam', label: 'Trúc Lâm' },
  { id: 'co_can_dai', label: 'Cổ · cận đại' },
  { id: 'can_dai', label: 'Hiện đại' },
  { id: 'tinh_do_thien', label: 'Tịnh · Thiền VN' },
  { id: 'thuc_hanh', label: 'Học gương' },
];

export function DanhTangCaoTang({
  primaryColor,
  templeName,
  abbottName,
  abbottTitle,
  abbottBio,
  abbottImageUrl,
}: Props) {
  const [filter, setFilter] = useState<FilterCat>('all');
  const [query, setQuery] = useState('');
  const [activeId, setActiveId] = useState<string | null>(null);
  const deferredQuery = useDeferredValue(query);

  useEffect(() => {
    if (activeId) window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeId]);

  const list = useMemo(
    () => searchDanhTangEntries(deferredQuery, filter),
    [deferredQuery, filter],
  );

  const hasAbbott = Boolean(abbottName?.trim());

  const active = activeId ? getDanhTangEntry(activeId) : null;

  if (active) {
    return (
      <EntryReader
        entry={active}
        primaryColor={primaryColor}
        onBack={() => setActiveId(null)}
        onOpenRelated={(id) => setActiveId(id)}
      />
    );
  }

  return (
    <div className="space-y-10">
      <p className="text-sm text-muted leading-relaxed">{DANH_TANG_INTRO}</p>

      <div className="flex flex-wrap gap-2 text-xs">
        <StatChip
          label="Tiểu sử"
          value={String(DANH_TANG_ENTRIES.length)}
          primaryColor={primaryColor}
        />
        <StatChip
          label="Nhóm"
          value={String(Object.keys(DANH_TANG_CATEGORY_LABELS).length)}
          primaryColor={primaryColor}
        />
      </div>

      {/* Trụ trì / thầy của chùa */}
      <section>
        <h2 className="font-display text-xl text-ink">
          Gương gần nhất tại {templeName}
        </h2>
        <p className="mt-2 text-sm text-muted leading-relaxed">
          Trước khi đọc sử xa, hãy kính nhớ vị đang hướng dẫn đạo tràng.
        </p>

        {hasAbbott ? (
          <div className="mt-5 border border-fog bg-white px-4 py-5 md:px-6 md:py-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:gap-6">
              {abbottImageUrl ? (
                <div className="relative mx-auto h-36 w-36 shrink-0 overflow-hidden border border-fog bg-mist sm:mx-0">
                  <Image
                    src={abbottImageUrl}
                    alt={abbottName ?? ''}
                    fill
                    className="object-cover"
                    sizes="144px"
                    unoptimized={/^https?:\/\//i.test(abbottImageUrl)}
                  />
                </div>
              ) : null}
              <div className="min-w-0 flex-1">
                {abbottTitle ? (
                  <p
                    className="text-[0.65rem] uppercase tracking-[0.22em]"
                    style={{ color: primaryColor }}
                  >
                    {abbottTitle}
                  </p>
                ) : null}
                <p className="mt-1 font-display text-2xl text-ink">
                  {abbottName}
                </p>
                {abbottBio ? (
                  <p className="mt-3 text-sm text-muted leading-relaxed whitespace-pre-line">
                    {abbottBio}
                  </p>
                ) : (
                  <p className="mt-3 text-sm text-muted leading-relaxed">
                    Tiểu sử chi tiết sẽ được nhà chùa bổ sung. Quý Phật tử có thể
                    hỏi ban hộ tự khi về chùa.
                  </p>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-4 border border-fog bg-paper px-4 py-5 space-y-3">
            <p className="text-sm text-muted leading-relaxed">
              Website chưa đăng tiểu sử trụ trì. Quý vị xem phần giới thiệu nhà
              chùa hoặc ghi danh để gần gũi đạo tràng.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/#gioi-thieu"
                className="px-4 py-2.5 text-sm text-white"
                style={{ background: primaryColor }}
              >
                Giới thiệu nhà chùa
              </Link>
              <Link
                href="/dang-ky-phat-tu"
                className="px-4 py-2.5 text-sm border border-fog text-ink hover:bg-mist"
              >
                Ghi danh Phật tử
              </Link>
            </div>
          </div>
        )}
      </section>

      <section className="space-y-4">
        <h2 className="font-display text-xl text-ink">Cách đọc tư liệu</h2>
        <div className="space-y-4">
          {DANH_TANG_GUIDES.map((g) => (
            <div key={g.title}>
              <h3
                className="font-display text-lg text-ink border-l-[3px] pl-3 leading-snug"
                style={{ borderColor: primaryColor }}
              >
                {g.title}
              </h3>
              <p className="mt-2 text-sm text-muted leading-relaxed pl-3">
                {g.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="font-display text-xl text-ink">Kho danh tăng</h2>
        <p className="mt-2 text-sm text-muted leading-relaxed mb-5">
          Tổ sư, Trúc Lâm, danh tăng Việt Nam — mở từng mục để đọc tiểu sử và
          hạnh học.
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
            <span className="sr-only">Tìm danh tăng</span>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Tìm: Trần Nhân Tông…"
              className="w-full border border-fog bg-white px-3 py-2 text-sm text-ink placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-ink/20"
            />
          </label>
        </div>

        <p className="mt-4 text-xs text-muted tabular-nums">
          {list.length} mục
          {deferredQuery.trim() ? ` · khớp “${deferredQuery.trim()}”` : ''}
        </p>

        <ul className="mt-3 divide-y divide-fog border border-fog bg-white">
          {list.length === 0 ? (
            <li className="px-4 py-8 text-sm text-muted text-center">
              Không có mục khớp. Thử từ khóa ngắn hơn hoặc chọn lại nhóm.
            </li>
          ) : (
            list.map((entry) => (
              <li key={entry.id}>
                <button
                  type="button"
                  onClick={() => setActiveId(entry.id)}
                  className="w-full text-left px-4 py-4 hover:bg-mist/60 transition-colors"
                >
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <p className="font-display text-lg text-ink">
                      {entry.shortName}
                    </p>
                    <span
                      className="text-[0.65rem] uppercase tracking-[0.2em] shrink-0"
                      style={{ color: primaryColor }}
                    >
                      {DANH_TANG_CATEGORY_LABELS[entry.category]}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-muted tabular-nums">
                    {entry.era}
                  </p>
                  <p className="mt-2 text-sm text-muted leading-relaxed line-clamp-2">
                    {entry.summary}
                  </p>
                  <p className="mt-2 text-[0.7rem] text-muted tabular-nums">
                    Khoảng {entry.readingMinutes} phút đọc
                  </p>
                </button>
              </li>
            ))
          )}
        </ul>
      </section>

      <div className="flex flex-wrap gap-3">
        <Link
          href="/phong-thuy/he-phai-tong-mon"
          className="px-4 py-2.5 text-sm text-white"
          style={{ background: primaryColor }}
        >
          Hệ phái · tông môn
        </Link>
        <Link
          href="/phong-thuy/giao-ly-can-ban"
          className="px-4 py-2.5 text-sm border border-fog text-ink hover:bg-mist"
        >
          Giáo lý căn bản
        </Link>
        <Link
          href="/phong-thuy/phap-thoai"
          className="px-4 py-2.5 text-sm border border-fog text-ink hover:bg-mist"
        >
          Pháp thoại
        </Link>
      </div>

      <p className="text-xs text-muted leading-relaxed">{DANH_TANG_FOOTNOTE}</p>
    </div>
  );
}

function StatChip({
  label,
  value,
  primaryColor,
}: {
  label: string;
  value: string;
  primaryColor: string;
}) {
  return (
    <span className="border border-fog bg-paper px-3 py-1.5 text-muted">
      <span className="mr-1.5" style={{ color: primaryColor }}>
        {label}
      </span>
      {value}
    </span>
  );
}

function EntryReader({
  entry,
  primaryColor,
  onBack,
  onOpenRelated,
}: {
  entry: DanhTangEntry;
  primaryColor: string;
  onBack: () => void;
  onOpenRelated: (id: string) => void;
}) {
  const sameCategory = DANH_TANG_ENTRIES.filter(
    (e) => e.category === entry.category && e.id !== entry.id,
  ).slice(0, 4);

  return (
    <div>
      <button
        type="button"
        onClick={onBack}
        className="text-xs text-muted hover:text-ink"
      >
        ← Danh mục danh tăng
      </button>

      <div className="mt-4 flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <span
          className="text-[0.65rem] uppercase tracking-[0.22em]"
          style={{ color: primaryColor }}
        >
          {DANH_TANG_CATEGORY_LABELS[entry.category]}
        </span>
        <p className="text-xs text-muted tabular-nums">{entry.era}</p>
      </div>

      <h2 className="mt-2 font-display text-2xl md:text-3xl text-ink leading-tight">
        {entry.name}
      </h2>
      {entry.aliases?.length ? (
        <p className="mt-2 text-xs text-muted">
          Còn gọi: {entry.aliases.join(' · ')}
        </p>
      ) : null}
      <p className="mt-3 text-sm text-muted leading-relaxed">{entry.summary}</p>

      {entry.keyPoints && entry.keyPoints.length > 0 ? (
        <div className="mt-5 border border-fog bg-paper/70 px-4 py-3">
          <p className="text-[10px] uppercase tracking-wide text-muted">
            Điểm cần nhớ
          </p>
          <ul className="mt-2 space-y-1.5 text-sm text-ink leading-relaxed">
            {entry.keyPoints.map((point) => (
              <li key={point} className="flex gap-2">
                <span style={{ color: primaryColor }}>·</span>
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex px-4 py-2 text-sm border border-fog text-ink hover:bg-mist"
        >
          Chọn mục khác
        </button>
        {entry.relatedTools?.slice(0, 2).map((t) => (
          <Link
            key={t.href + t.label}
            href={t.href}
            className="inline-flex px-4 py-2 text-sm text-white"
            style={{ background: primaryColor }}
          >
            {t.label}
          </Link>
        ))}
      </div>

      <article className="mt-8 border border-fog bg-white px-4 py-6 md:px-8 md:py-8 space-y-8">
        {entry.sections.map((sec, i) => (
          <section key={i}>
            {sec.title ? (
              <h3
                className="mb-3 font-display text-xl text-ink border-l-[3px] pl-3 leading-snug"
                style={{ borderColor: primaryColor }}
              >
                {sec.title}
              </h3>
            ) : null}
            <div className="space-y-3">
              {sec.paragraphs.map((p, j) => (
                <p
                  key={j}
                  className="text-[1.02rem] text-ink leading-[1.85] text-pretty"
                >
                  {p}
                </p>
              ))}
            </div>
            {sec.bullets && sec.bullets.length > 0 ? (
              <ul className="mt-3 space-y-2 text-[1.02rem] text-ink leading-relaxed">
                {sec.bullets.map((b) => (
                  <li key={b} className="flex gap-2">
                    <span
                      className="shrink-0 mt-2"
                      style={{ color: primaryColor }}
                    >
                      ▸
                    </span>
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            ) : null}
          </section>
        ))}
      </article>

      {entry.legacy && entry.legacy.length > 0 ? (
        <div className="mt-6 border border-fog bg-paper px-4 py-4">
          <p
            className="text-[0.7rem] uppercase tracking-[0.2em]"
            style={{ color: primaryColor }}
          >
            Di sản · ảnh hưởng
          </p>
          <ul className="mt-3 space-y-2 text-sm text-ink leading-relaxed">
            {entry.legacy.map((item) => (
              <li key={item} className="flex gap-2">
                <span style={{ color: primaryColor }}>·</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {entry.relatedTools && entry.relatedTools.length > 0 ? (
        <div className="mt-6">
          <p className="text-xs text-muted mb-2">Liên kết tu học</p>
          <div className="flex flex-wrap gap-2">
            {entry.relatedTools.map((t) => (
              <Link
                key={t.href + t.label}
                href={t.href}
                className="px-3 py-2 text-sm border border-fog text-ink hover:bg-mist"
              >
                {t.label} →
              </Link>
            ))}
          </div>
        </div>
      ) : null}

      {entry.relatedHePhaiIds && entry.relatedHePhaiIds.length > 0 ? (
        <div className="mt-6">
          <p className="text-xs text-muted mb-2">Xem hệ phái liên quan</p>
          <Link
            href="/phong-thuy/he-phai-tong-mon"
            className="inline-flex px-3 py-2 text-sm border border-fog text-ink hover:bg-mist"
          >
            Mở Hệ phái · tông môn →
          </Link>
        </div>
      ) : null}

      {sameCategory.length > 0 ? (
        <div className="mt-8">
          <p className="text-xs text-muted mb-2">
            Cùng nhóm {DANH_TANG_CATEGORY_LABELS[entry.category]}
          </p>
          <ul className="divide-y divide-fog border border-fog bg-white">
            {sameCategory.map((e) => (
              <li key={e.id}>
                <button
                  type="button"
                  onClick={() => onOpenRelated(e.id)}
                  className="w-full text-left px-4 py-3 hover:bg-mist/60 transition-colors"
                >
                  <p className="font-display text-base text-ink">{e.shortName}</p>
                  <p className="mt-1 text-xs text-muted line-clamp-1">
                    {e.summary}
                  </p>
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <p className="mt-5 text-xs text-muted leading-relaxed">{DANH_TANG_FOOTNOTE}</p>
    </div>
  );
}
