'use client';

import { useDeferredValue, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  HOI_DAP_CATEGORY_LABELS,
  HOI_DAP_FOOTNOTE,
  HOI_DAP_GUIDES,
  HOI_DAP_INTRO,
  HOI_DAP_ITEMS,
  getHoiDapItem,
  searchHoiDapItems,
  type HoiDapCategory,
  type HoiDapItem,
} from '@/lib/fengshui/hoi-dap-phat-hoc';

interface Props {
  primaryColor: string;
  templeName: string;
  hotline?: string | null;
  zaloUrl?: string | null;
}

type FilterCat = HoiDapCategory | 'all';

const FILTERS: { id: FilterCat; label: string }[] = [
  { id: 'all', label: 'Tất cả' },
  { id: 'nhap_mon', label: 'Nhập môn' },
  { id: 'quy_y_gioi', label: 'Quy y · giới' },
  { id: 'thuc_hanh', label: 'Thực hành' },
  { id: 'nghiep_qua', label: 'Nghiệp · quả' },
  { id: 'nghi_le', label: 'Nghi lễ' },
  { id: 'doi_song', label: 'Đời sống' },
  { id: 'le_via', label: 'Lễ · vía' },
  { id: 'me_tin', label: 'Làm rõ mê tín' },
];

export function HoiDapPhatHoc({
  primaryColor,
  templeName,
  hotline,
  zaloUrl,
}: Props) {
  const [filter, setFilter] = useState<FilterCat>('all');
  const [query, setQuery] = useState('');
  const [activeId, setActiveId] = useState<string | null>(null);
  const deferredQuery = useDeferredValue(query);

  useEffect(() => {
    if (activeId) window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeId]);

  const list = useMemo(
    () => searchHoiDapItems(deferredQuery, filter),
    [deferredQuery, filter],
  );

  const active = activeId ? getHoiDapItem(activeId) : null;

  if (active) {
    return (
      <AnswerReader
        item={active}
        primaryColor={primaryColor}
        onBack={() => setActiveId(null)}
        onOpenRelated={(id) => setActiveId(id)}
      />
    );
  }

  return (
    <div className="space-y-10">
      <p className="text-sm text-muted leading-relaxed">{HOI_DAP_INTRO}</p>

      <div className="flex flex-wrap gap-2 text-xs">
        <StatChip
          label="Câu hỏi"
          value={String(HOI_DAP_ITEMS.length)}
          primaryColor={primaryColor}
        />
        <StatChip
          label="Nhóm"
          value={String(Object.keys(HOI_DAP_CATEGORY_LABELS).length)}
          primaryColor={primaryColor}
        />
        <StatChip
          label="Gợi ý"
          value="Tìm từ khóa ngắn"
          primaryColor={primaryColor}
        />
      </div>

      <section className="space-y-4">
        <h2 className="font-display text-xl text-ink">Trước khi hỏi</h2>
        <div className="space-y-4">
          {HOI_DAP_GUIDES.map((g) => (
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
        <h2 className="font-display text-xl text-ink">Kho hỏi đáp</h2>
        <p className="mt-2 text-sm text-muted leading-relaxed mb-5">
          Chọn nhóm hoặc tìm theo từ khóa — mở câu để đọc giải đáp chi tiết.
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
            <span className="sr-only">Tìm hỏi đáp</span>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Tìm: quy y, niệm Phật…"
              className="w-full border border-fog bg-white px-3 py-2 text-sm text-ink placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-ink/20"
            />
          </label>
        </div>

        <p className="mt-4 text-xs text-muted tabular-nums">
          {list.length} câu
          {deferredQuery.trim() ? ` · khớp “${deferredQuery.trim()}”` : ''}
        </p>

        <ul className="mt-3 divide-y divide-fog border border-fog bg-white">
          {list.length === 0 ? (
            <li className="px-4 py-8 text-sm text-muted text-center">
              Không có câu khớp. Thử từ khóa ngắn hơn hoặc chọn lại nhóm.
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
                    <p className="font-display text-lg text-ink leading-snug">
                      {item.shortQuestion}
                    </p>
                    <span
                      className="text-[0.65rem] uppercase tracking-[0.2em] shrink-0"
                      style={{ color: primaryColor }}
                    >
                      {HOI_DAP_CATEGORY_LABELS[item.category]}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-ink/80 leading-relaxed line-clamp-2">
                    {item.question}
                  </p>
                  <p className="mt-2 text-sm text-muted leading-relaxed line-clamp-2">
                    {item.summary}
                  </p>
                </button>
              </li>
            ))
          )}
        </ul>
      </section>

      <section className="border border-fog bg-paper px-4 py-5 space-y-3">
        <h2 className="font-display text-xl text-ink">
          Chưa thấy câu trả lời?
        </h2>
        <p className="text-sm text-muted leading-relaxed">
          Việc riêng hoặc câu sâu hơn, hãy hỏi trực tiếp {templeName}. Ghi danh
          để nhận lịch giảng, hoặc liên hệ khi nhà chùa đang tiếp Phật tử.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/dang-ky-phat-tu"
            className="px-4 py-2.5 text-sm text-white"
            style={{ background: primaryColor }}
          >
            Ghi danh Phật tử
          </Link>
          {hotline ? (
            <a
              href={`tel:${hotline.replace(/\s/g, '')}`}
              className="px-4 py-2.5 text-sm border border-fog text-ink hover:bg-mist"
            >
              Gọi {hotline}
            </a>
          ) : null}
          {zaloUrl ? (
            <a
              href={zaloUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2.5 text-sm border border-fog text-ink hover:bg-mist"
            >
              Zalo nhà chùa
            </a>
          ) : null}
          <Link
            href="/phong-thuy/phap-thoai"
            className="px-4 py-2.5 text-sm border border-fog text-ink hover:bg-mist"
          >
            Pháp thoại
          </Link>
        </div>
      </section>

      <div className="flex flex-wrap gap-3">
        <Link
          href="/phong-thuy/giao-ly-can-ban"
          className="px-4 py-2.5 text-sm text-white"
          style={{ background: primaryColor }}
        >
          Giáo lý căn bản
        </Link>
        <Link
          href="/phong-thuy/kinh-tung-thuong-dung"
          className="px-4 py-2.5 text-sm border border-fog text-ink hover:bg-mist"
        >
          Kinh tụng
        </Link>
        <Link
          href="/go-mo"
          className="px-4 py-2.5 text-sm border border-fog text-ink hover:bg-mist"
        >
          Gõ mõ · niệm Phật
        </Link>
      </div>

      <p className="text-xs text-muted leading-relaxed">{HOI_DAP_FOOTNOTE}</p>
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

function AnswerReader({
  item,
  primaryColor,
  onBack,
  onOpenRelated,
}: {
  item: HoiDapItem;
  primaryColor: string;
  onBack: () => void;
  onOpenRelated: (id: string) => void;
}) {
  const sameCategory = HOI_DAP_ITEMS.filter(
    (i) => i.category === item.category && i.id !== item.id,
  ).slice(0, 5);

  return (
    <div>
      <button
        type="button"
        onClick={onBack}
        className="text-xs text-muted hover:text-ink"
      >
        ← Danh mục hỏi đáp
      </button>

      <div className="mt-4 flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <span
          className="text-[0.65rem] uppercase tracking-[0.22em]"
          style={{ color: primaryColor }}
        >
          {HOI_DAP_CATEGORY_LABELS[item.category]}
        </span>
      </div>

      <h2 className="mt-2 font-display text-2xl md:text-3xl text-ink leading-tight">
        {item.question}
      </h2>
      <p className="mt-3 text-sm text-muted leading-relaxed">{item.summary}</p>

      {item.keyPoints && item.keyPoints.length > 0 ? (
        <div className="mt-5 border border-fog bg-paper/70 px-4 py-3">
          <p className="text-[10px] uppercase tracking-wide text-muted">
            Điểm cần nhớ
          </p>
          <ul className="mt-2 space-y-1.5 text-sm text-ink leading-relaxed">
            {item.keyPoints.map((point) => (
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
          Chọn câu khác
        </button>
        {item.relatedTools?.slice(0, 2).map((t) => (
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
        {item.sections.map((sec, i) => (
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

      {item.practiceTips && item.practiceTips.length > 0 ? (
        <div className="mt-6 border border-fog bg-paper px-4 py-4">
          <p
            className="text-[0.7rem] uppercase tracking-[0.2em]"
            style={{ color: primaryColor }}
          >
            Gợi ý thực hành
          </p>
          <ul className="mt-3 space-y-2 text-sm text-ink leading-relaxed">
            {item.practiceTips.map((tip) => (
              <li key={tip} className="flex gap-2">
                <span style={{ color: primaryColor }}>·</span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {item.relatedTools && item.relatedTools.length > 0 ? (
        <div className="mt-6">
          <p className="text-xs text-muted mb-2">Liên kết tu học</p>
          <div className="flex flex-wrap gap-2">
            {item.relatedTools.map((t) => (
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

      {item.relatedGiaoLyIds && item.relatedGiaoLyIds.length > 0 ? (
        <div className="mt-6">
          <p className="text-xs text-muted mb-2">Đọc thêm Giáo lý căn bản</p>
          <Link
            href="/phong-thuy/giao-ly-can-ban"
            className="inline-flex px-3 py-2 text-sm border border-fog text-ink hover:bg-mist"
          >
            Mở Giáo lý căn bản →
          </Link>
        </div>
      ) : null}

      {sameCategory.length > 0 ? (
        <div className="mt-8">
          <p className="text-xs text-muted mb-2">
            Cùng nhóm {HOI_DAP_CATEGORY_LABELS[item.category]}
          </p>
          <ul className="divide-y divide-fog border border-fog bg-white">
            {sameCategory.map((i) => (
              <li key={i.id}>
                <button
                  type="button"
                  onClick={() => onOpenRelated(i.id)}
                  className="w-full text-left px-4 py-3 hover:bg-mist/60 transition-colors"
                >
                  <p className="font-display text-base text-ink">
                    {i.shortQuestion}
                  </p>
                  <p className="mt-1 text-xs text-muted line-clamp-1">
                    {i.summary}
                  </p>
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <p className="mt-5 text-xs text-muted leading-relaxed">{HOI_DAP_FOOTNOTE}</p>
    </div>
  );
}
