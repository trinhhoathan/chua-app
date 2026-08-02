'use client';

import { useDeferredValue, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  GIAO_LY_CATEGORY_LABELS,
  GIAO_LY_FOOTNOTE,
  GIAO_LY_INTRO,
  GIAO_LY_LESSONS,
  getGiaoLyLesson,
  searchGiaoLyLessons,
  type GiaoLyCategory,
  type GiaoLyLesson,
} from '@/lib/fengshui/giao-ly-can-ban';

interface Props {
  primaryColor: string;
}

type FilterCat = GiaoLyCategory | 'all';

const FILTERS: { id: FilterCat; label: string }[] = [
  { id: 'all', label: 'Tất cả' },
  { id: 'nhap_mon', label: 'Nhập môn' },
  { id: 'cot_loi', label: 'Cốt lõi' },
  { id: 'thuc_hanh', label: 'Thực hành' },
  { id: 'nghiep_qua', label: 'Nghiệp · quả' },
  { id: 'bo_tat', label: 'Bồ Tát đạo' },
  { id: 'cu_si', label: 'Cư sĩ' },
];

export function GiaoLyCanBan({ primaryColor }: Props) {
  const [filter, setFilter] = useState<FilterCat>('all');
  const [query, setQuery] = useState('');
  const [activeId, setActiveId] = useState<string | null>(null);
  const deferredQuery = useDeferredValue(query);

  useEffect(() => {
    if (activeId) window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeId]);

  const list = useMemo(
    () => searchGiaoLyLessons(deferredQuery, filter),
    [deferredQuery, filter],
  );

  const active = activeId ? getGiaoLyLesson(activeId) : null;

  if (active) {
    return (
      <LessonReader
        lesson={active}
        primaryColor={primaryColor}
        onBack={() => setActiveId(null)}
        onOpenRelated={(id) => setActiveId(id)}
      />
    );
  }

  return (
    <div>
      <p className="text-sm text-muted leading-relaxed mb-5">{GIAO_LY_INTRO}</p>

      <div className="mb-5 flex flex-wrap gap-2 text-xs">
        <StatChip
          label="Bài học"
          value={String(GIAO_LY_LESSONS.length)}
          primaryColor={primaryColor}
        />
        <StatChip
          label="Nhóm"
          value={String(Object.keys(GIAO_LY_CATEGORY_LABELS).length)}
          primaryColor={primaryColor}
        />
        <StatChip
          label="Gợi ý đọc"
          value="Từ Nhập môn → Cốt lõi"
          primaryColor={primaryColor}
        />
      </div>

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
          <span className="sr-only">Tìm giáo lý</span>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Tìm: Tứ Đế, ngũ giới…"
            className="w-full border border-fog bg-white px-3 py-2 text-sm text-ink placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-ink/20"
          />
        </label>
      </div>

      <p className="mt-4 text-xs text-muted tabular-nums">
        {list.length} bài
        {deferredQuery.trim() ? ` · khớp “${deferredQuery.trim()}”` : ''}
      </p>

      <ul className="mt-3 divide-y divide-fog border border-fog bg-white">
        {list.length === 0 ? (
          <li className="px-4 py-8 text-sm text-muted text-center">
            Không có bài khớp. Thử từ khóa ngắn hơn hoặc chọn lại nhóm.
          </li>
        ) : (
          list.map((lesson) => (
            <li key={lesson.id}>
              <button
                type="button"
                onClick={() => setActiveId(lesson.id)}
                className="w-full text-left px-4 py-4 hover:bg-mist/60 transition-colors"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="font-display text-lg text-ink">
                    {lesson.shortTitle}
                  </p>
                  <span
                    className="text-[0.65rem] uppercase tracking-[0.2em] shrink-0"
                    style={{ color: primaryColor }}
                  >
                    {GIAO_LY_CATEGORY_LABELS[lesson.category]}
                  </span>
                </div>
                <p className="mt-2 text-sm text-muted leading-relaxed line-clamp-2">
                  {lesson.summary}
                </p>
                <p className="mt-2 text-[0.7rem] text-muted tabular-nums">
                  Khoảng {lesson.readingMinutes} phút đọc
                </p>
              </button>
            </li>
          ))
        )}
      </ul>

      <div className="mt-6 flex flex-wrap gap-3">
        <Link
          href="/phong-thuy/kinh-tung-thuong-dung"
          className="px-4 py-2.5 text-sm text-white"
          style={{ background: primaryColor }}
        >
          Kinh tụng thường dùng
        </Link>
        <Link
          href="/phong-thuy/tra-cuu-kinh"
          className="px-4 py-2.5 text-sm border border-fog text-ink hover:bg-mist"
        >
          Tra cứu kinh sách
        </Link>
        <Link
          href="/go-mo"
          className="px-4 py-2.5 text-sm border border-fog text-ink hover:bg-mist"
        >
          Gõ mõ · niệm Phật
        </Link>
      </div>

      <p className="mt-5 text-xs text-muted leading-relaxed">{GIAO_LY_FOOTNOTE}</p>
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

function LessonReader({
  lesson,
  primaryColor,
  onBack,
  onOpenRelated,
}: {
  lesson: GiaoLyLesson;
  primaryColor: string;
  onBack: () => void;
  onOpenRelated: (id: string) => void;
}) {
  const sameCategory = GIAO_LY_LESSONS.filter(
    (l) => l.category === lesson.category && l.id !== lesson.id,
  ).slice(0, 4);

  return (
    <div>
      <button
        type="button"
        onClick={onBack}
        className="text-xs text-muted hover:text-ink"
      >
        ← Danh mục giáo lý
      </button>

      <div className="mt-4 flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <span
          className="text-[0.65rem] uppercase tracking-[0.22em]"
          style={{ color: primaryColor }}
        >
          {GIAO_LY_CATEGORY_LABELS[lesson.category]}
        </span>
        <p className="text-xs text-muted tabular-nums">
          Khoảng {lesson.readingMinutes} phút đọc
        </p>
      </div>

      <h2 className="mt-2 font-display text-2xl md:text-3xl text-ink leading-tight">
        {lesson.title}
      </h2>
      <p className="mt-3 text-sm text-muted leading-relaxed">{lesson.summary}</p>

      {lesson.keyPoints && lesson.keyPoints.length > 0 ? (
        <div className="mt-5 border border-fog bg-paper/70 px-4 py-3">
          <p className="text-[10px] uppercase tracking-wide text-muted">
            Điểm cần nhớ
          </p>
          <ul className="mt-2 space-y-1.5 text-sm text-ink leading-relaxed">
            {lesson.keyPoints.map((point) => (
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
          Chọn bài khác
        </button>
        {lesson.relatedTools?.slice(0, 2).map((t) => (
          <Link
            key={t.href}
            href={t.href}
            className="inline-flex px-4 py-2 text-sm text-white"
            style={{ background: primaryColor }}
          >
            {t.label}
          </Link>
        ))}
      </div>

      <article className="mt-8 border border-fog bg-white px-4 py-6 md:px-8 md:py-8 space-y-8">
        {lesson.sections.map((sec, i) => (
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
                    <span className="shrink-0 mt-2" style={{ color: primaryColor }}>
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

      {lesson.practiceTips && lesson.practiceTips.length > 0 ? (
        <div className="mt-6 border border-fog bg-paper px-4 py-4">
          <p
            className="text-[0.7rem] uppercase tracking-[0.2em]"
            style={{ color: primaryColor }}
          >
            Gợi ý thực hành
          </p>
          <ul className="mt-3 space-y-2 text-sm text-ink leading-relaxed">
            {lesson.practiceTips.map((tip) => (
              <li key={tip} className="flex gap-2">
                <span style={{ color: primaryColor }}>·</span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {lesson.relatedTools && lesson.relatedTools.length > 0 ? (
        <div className="mt-6">
          <p className="text-xs text-muted mb-2">Liên kết tu học</p>
          <div className="flex flex-wrap gap-2">
            {lesson.relatedTools.map((t) => (
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

      {sameCategory.length > 0 ? (
        <div className="mt-8">
          <p className="text-xs text-muted mb-2">
            Cùng nhóm {GIAO_LY_CATEGORY_LABELS[lesson.category]}
          </p>
          <ul className="divide-y divide-fog border border-fog bg-white">
            {sameCategory.map((l) => (
              <li key={l.id}>
                <button
                  type="button"
                  onClick={() => onOpenRelated(l.id)}
                  className="w-full text-left px-4 py-3 hover:bg-mist/60 transition-colors"
                >
                  <p className="font-display text-base text-ink">{l.shortTitle}</p>
                  <p className="mt-1 text-xs text-muted line-clamp-1">
                    {l.summary}
                  </p>
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <p className="mt-5 text-xs text-muted leading-relaxed">{GIAO_LY_FOOTNOTE}</p>
    </div>
  );
}
