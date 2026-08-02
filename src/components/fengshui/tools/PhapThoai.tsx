'use client';

import { useDeferredValue, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import type { TempleEvent, TempleVideo } from '@/types/database';
import { EventCountdown } from '@/components/temple/EventCountdown';
import {
  PHAP_THOAI_CATEGORY_LABELS,
  PHAP_THOAI_FOOTNOTE,
  PHAP_THOAI_GUIDES,
  PHAP_THOAI_INTRO,
  PHAP_THOAI_TALKS,
  getPhapThoaiTalk,
  searchPhapThoaiTalks,
  type PhapThoaiCategory,
  type PhapThoaiTalk,
} from '@/lib/fengshui/phap-thoai';

interface Props {
  primaryColor: string;
  templeName: string;
  events: TempleEvent[];
  videos: TempleVideo[];
  youtubeUrl?: string | null;
  facebookUrl?: string | null;
}

type FilterCat = PhapThoaiCategory | 'all';

const FILTERS: { id: FilterCat; label: string }[] = [
  { id: 'all', label: 'Tất cả' },
  { id: 'nghe_phap', label: 'Nghe pháp' },
  { id: 'giao_ly', label: 'Giáo lý' },
  { id: 'thuc_hanh', label: 'Thực hành' },
  { id: 'doi_song', label: 'Đời sống' },
  { id: 'le_via', label: 'Lễ · vía' },
  { id: 'bo_tat', label: 'Bồ Tát đạo' },
];

function formatVN(iso: string): string {
  return new Intl.DateTimeFormat('vi-VN', {
    weekday: 'long',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso));
}

function youtubeEmbedId(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.hostname.includes('youtu.be')) {
      return u.pathname.replace(/^\//, '').split('/')[0] || null;
    }
    if (u.hostname.includes('youtube.com')) {
      const v = u.searchParams.get('v');
      if (v) return v;
      const parts = u.pathname.split('/').filter(Boolean);
      const embedIdx = parts.indexOf('embed');
      if (embedIdx >= 0 && parts[embedIdx + 1]) return parts[embedIdx + 1];
      const shortsIdx = parts.indexOf('shorts');
      if (shortsIdx >= 0 && parts[shortsIdx + 1]) return parts[shortsIdx + 1];
    }
  } catch {
    return null;
  }
  return null;
}

export function PhapThoai({
  primaryColor,
  templeName,
  events,
  videos,
  youtubeUrl,
  facebookUrl,
}: Props) {
  const [filter, setFilter] = useState<FilterCat>('all');
  const [query, setQuery] = useState('');
  const [activeId, setActiveId] = useState<string | null>(null);
  const deferredQuery = useDeferredValue(query);

  useEffect(() => {
    if (activeId) window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeId]);

  const list = useMemo(
    () => searchPhapThoaiTalks(deferredQuery, filter),
    [deferredQuery, filter],
  );

  const playableVideos = useMemo(
    () => videos.filter((v) => youtubeEmbedId(v.url)),
    [videos],
  );

  const active = activeId ? getPhapThoaiTalk(activeId) : null;

  if (active) {
    return (
      <TalkReader
        talk={active}
        primaryColor={primaryColor}
        onBack={() => setActiveId(null)}
        onOpenRelated={(id) => setActiveId(id)}
      />
    );
  }

  return (
    <div className="space-y-10">
      <p className="text-sm text-muted leading-relaxed">{PHAP_THOAI_INTRO}</p>

      <div className="flex flex-wrap gap-2 text-xs">
        <StatChip
          label="Chủ đề"
          value={String(PHAP_THOAI_TALKS.length)}
          primaryColor={primaryColor}
        />
        <StatChip
          label="Hướng dẫn"
          value={String(PHAP_THOAI_GUIDES.length)}
          primaryColor={primaryColor}
        />
        {playableVideos.length > 0 ? (
          <StatChip
            label="Video chùa"
            value={String(playableVideos.length)}
            primaryColor={primaryColor}
          />
        ) : null}
        {events.length > 0 ? (
          <StatChip
            label="Lịch gần"
            value={String(events.length)}
            primaryColor={primaryColor}
          />
        ) : null}
      </div>

      {/* Hướng dẫn nhanh */}
      <section className="space-y-4">
        <h2 className="font-display text-xl text-ink">Trước khi nghe</h2>
        <div className="space-y-4">
          {PHAP_THOAI_GUIDES.map((g) => (
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

      {/* Video nhà chùa */}
      <section>
        <h2 className="font-display text-xl text-ink">
          Video pháp thoại · tư liệu tại {templeName}
        </h2>
        <p className="mt-2 text-sm text-muted leading-relaxed">
          Các video nhà chùa đã đăng trên trang. Có thể nghe lại tại nhà với tâm
          trang nghiêm như đang trong chính điện.
        </p>

        {playableVideos.length === 0 ? (
          <div className="mt-4 border border-fog bg-paper px-4 py-5 space-y-3">
            <p className="text-sm text-muted leading-relaxed">
              Hiện chưa có video pháp thoại trên website. Quý vị theo dõi kênh
              của nhà chùa hoặc ghi danh để nhận tin khi có buổi giảng mới.
            </p>
            <div className="flex flex-wrap gap-3">
              {youtubeUrl ? (
                <a
                  href={youtubeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2.5 text-sm text-white"
                  style={{ background: primaryColor }}
                >
                  Kênh YouTube
                </a>
              ) : null}
              {facebookUrl ? (
                <a
                  href={facebookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2.5 text-sm border border-fog text-ink hover:bg-mist"
                >
                  Facebook chùa
                </a>
              ) : null}
              <Link
                href="/dang-ky-phat-tu"
                className="px-4 py-2.5 text-sm border border-fog text-ink hover:bg-mist"
              >
                Ghi danh nhận tin
              </Link>
            </div>
          </div>
        ) : (
          <ul className="mt-5 space-y-8">
            {playableVideos.map((video) => {
              const id = youtubeEmbedId(video.url)!;
              return (
                <li key={video.url} className="space-y-3">
                  <div className="relative aspect-video overflow-hidden border border-fog bg-ink/5">
                    <iframe
                      src={`https://www.youtube.com/embed/${id}`}
                      title={video.title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                      loading="lazy"
                      className="absolute inset-0 h-full w-full"
                    />
                  </div>
                  <div>
                    <p className="font-display text-lg text-ink">{video.title}</p>
                    {video.description ? (
                      <p className="mt-1 text-sm text-muted leading-relaxed">
                        {video.description}
                      </p>
                    ) : null}
                    <a
                      href={video.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 inline-block text-xs font-medium underline-offset-2 hover:underline"
                      style={{ color: primaryColor }}
                    >
                      Mở trên YouTube →
                    </a>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* Lịch sắp tới */}
      <section>
        <h2 className="font-display text-xl text-ink">
          Lịch nghe pháp · khóa tu · vía sắp tới
        </h2>
        <p className="mt-2 text-sm text-muted leading-relaxed">
          Các hoạt động nhà chùa đã công bố — thuận duyên đến nghe trực tiếp.
        </p>

        {events.length === 0 ? (
          <div className="mt-4 border border-fog bg-paper px-4 py-5 space-y-3">
            <p className="text-sm text-muted leading-relaxed">
              Chưa có lịch giảng / khóa tu / vía được gắn trên trang. Xem toàn bộ
              hoạt động hoặc ghi danh để nhận thông báo.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/#hoat-dong"
                className="px-4 py-2.5 text-sm text-white"
                style={{ background: primaryColor }}
              >
                Lịch hoạt động
              </Link>
              <Link
                href="/dang-ky-phat-tu"
                className="px-4 py-2.5 text-sm border border-fog text-ink hover:bg-mist"
              >
                Ghi danh Phật tử
              </Link>
            </div>
          </div>
        ) : (
          <ul className="mt-5 divide-y divide-fog border border-fog bg-white">
            {events.map((ev) => (
              <li key={ev.id} className="px-4 py-4 space-y-3">
                <div>
                  <p className="font-display text-base text-ink">{ev.title}</p>
                  {ev.summary ? (
                    <p className="mt-1 text-sm text-muted leading-relaxed">
                      {ev.summary}
                    </p>
                  ) : null}
                  <p className="mt-2 text-sm tabular-nums text-ink">
                    {formatVN(ev.starts_at)}
                    {ev.ends_at && ev.ends_at !== ev.starts_at ? (
                      <span className="text-muted">
                        {' '}
                        → {formatVN(ev.ends_at)}
                      </span>
                    ) : null}
                  </p>
                  {ev.location ? (
                    <p className="mt-0.5 text-xs text-muted">{ev.location}</p>
                  ) : null}
                </div>
                <EventCountdown
                  startsAt={ev.starts_at}
                  endsAt={ev.ends_at}
                  color={primaryColor}
                />
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Danh mục chủ đề */}
      <section>
        <h2 className="font-display text-xl text-ink">
          Kho chủ đề pháp thoại
        </h2>
        <p className="mt-2 text-sm text-muted leading-relaxed mb-5">
          Đọc trước để chuẩn bị duyên, hoặc ôn sau khi nghe giảng. Mỗi bài có
          điểm cần nhớ và việc làm tiếp theo.
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
            <span className="sr-only">Tìm chủ đề</span>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Tìm: Tứ Đế, niệm Phật…"
              className="w-full border border-fog bg-white px-3 py-2 text-sm text-ink placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-ink/20"
            />
          </label>
        </div>

        <p className="mt-4 text-xs text-muted tabular-nums">
          {list.length} chủ đề
          {deferredQuery.trim() ? ` · khớp “${deferredQuery.trim()}”` : ''}
        </p>

        <ul className="mt-3 divide-y divide-fog border border-fog bg-white">
          {list.length === 0 ? (
            <li className="px-4 py-8 text-sm text-muted text-center">
              Không có chủ đề khớp. Thử từ khóa ngắn hơn hoặc chọn lại nhóm.
            </li>
          ) : (
            list.map((talk) => (
              <li key={talk.id}>
                <button
                  type="button"
                  onClick={() => setActiveId(talk.id)}
                  className="w-full text-left px-4 py-4 hover:bg-mist/60 transition-colors"
                >
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <p className="font-display text-lg text-ink">
                      {talk.shortTitle}
                    </p>
                    <span
                      className="text-[0.65rem] uppercase tracking-[0.2em] shrink-0"
                      style={{ color: primaryColor }}
                    >
                      {PHAP_THOAI_CATEGORY_LABELS[talk.category]}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-muted leading-relaxed line-clamp-2">
                    {talk.summary}
                  </p>
                  <p className="mt-2 text-[0.7rem] text-muted tabular-nums">
                    Khoảng {talk.durationMinutes} phút
                    {talk.audience ? ` · ${talk.audience}` : ''}
                  </p>
                </button>
              </li>
            ))
          )}
        </ul>
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
          href="/phong-thuy/khoa-tu-an-cu"
          className="px-4 py-2.5 text-sm border border-fog text-ink hover:bg-mist"
        >
          Khóa tu · an cư
        </Link>
        <Link
          href="/go-mo"
          className="px-4 py-2.5 text-sm border border-fog text-ink hover:bg-mist"
        >
          Gõ mõ · niệm Phật
        </Link>
      </div>

      <p className="text-xs text-muted leading-relaxed">{PHAP_THOAI_FOOTNOTE}</p>
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

function TalkReader({
  talk,
  primaryColor,
  onBack,
  onOpenRelated,
}: {
  talk: PhapThoaiTalk;
  primaryColor: string;
  onBack: () => void;
  onOpenRelated: (id: string) => void;
}) {
  const sameCategory = PHAP_THOAI_TALKS.filter(
    (t) => t.category === talk.category && t.id !== talk.id,
  ).slice(0, 4);

  return (
    <div>
      <button
        type="button"
        onClick={onBack}
        className="text-xs text-muted hover:text-ink"
      >
        ← Danh mục pháp thoại
      </button>

      <div className="mt-4 flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <span
          className="text-[0.65rem] uppercase tracking-[0.22em]"
          style={{ color: primaryColor }}
        >
          {PHAP_THOAI_CATEGORY_LABELS[talk.category]}
        </span>
        <p className="text-xs text-muted tabular-nums">
          Khoảng {talk.durationMinutes} phút
        </p>
      </div>

      <h2 className="mt-2 font-display text-2xl md:text-3xl text-ink leading-tight">
        {talk.title}
      </h2>
      <p className="mt-3 text-sm text-muted leading-relaxed">{talk.summary}</p>
      {talk.audience ? (
        <p className="mt-2 text-xs text-muted">
          Phù hợp: <span className="text-ink">{talk.audience}</span>
        </p>
      ) : null}

      {talk.keyPoints && talk.keyPoints.length > 0 ? (
        <div className="mt-5 border border-fog bg-paper/70 px-4 py-3">
          <p className="text-[10px] uppercase tracking-wide text-muted">
            Điểm cần nhớ
          </p>
          <ul className="mt-2 space-y-1.5 text-sm text-ink leading-relaxed">
            {talk.keyPoints.map((point) => (
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
          Chọn chủ đề khác
        </button>
        {talk.relatedTools?.slice(0, 2).map((t) => (
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
        {talk.sections.map((sec, i) => (
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

      {talk.afterListening && talk.afterListening.length > 0 ? (
        <div className="mt-6 border border-fog bg-paper px-4 py-4">
          <p
            className="text-[0.7rem] uppercase tracking-[0.2em]"
            style={{ color: primaryColor }}
          >
            Sau khi nghe / đọc
          </p>
          <ul className="mt-3 space-y-2 text-sm text-ink leading-relaxed">
            {talk.afterListening.map((tip) => (
              <li key={tip} className="flex gap-2">
                <span style={{ color: primaryColor }}>·</span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {talk.relatedTools && talk.relatedTools.length > 0 ? (
        <div className="mt-6">
          <p className="text-xs text-muted mb-2">Liên kết tu học</p>
          <div className="flex flex-wrap gap-2">
            {talk.relatedTools.map((t) => (
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

      {talk.relatedGiaoLyIds && talk.relatedGiaoLyIds.length > 0 ? (
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
            Cùng nhóm {PHAP_THOAI_CATEGORY_LABELS[talk.category]}
          </p>
          <ul className="divide-y divide-fog border border-fog bg-white">
            {sameCategory.map((t) => (
              <li key={t.id}>
                <button
                  type="button"
                  onClick={() => onOpenRelated(t.id)}
                  className="w-full text-left px-4 py-3 hover:bg-mist/60 transition-colors"
                >
                  <p className="font-display text-base text-ink">{t.shortTitle}</p>
                  <p className="mt-1 text-xs text-muted line-clamp-1">
                    {t.summary}
                  </p>
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <p className="mt-5 text-xs text-muted leading-relaxed">{PHAP_THOAI_FOOTNOTE}</p>
    </div>
  );
}
