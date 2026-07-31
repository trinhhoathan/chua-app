'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import type { ChantingSchedule } from '@/types/database';
import { WEEKDAY_LABELS } from '@/types/database';
import { createClient } from '@/lib/supabase/client';
import {
  formatStartTimeShort,
  getChantingWindow,
} from '@/lib/chanting';
import {
  youtubeEmbedSrc,
  youtubeThumbnailUrl,
} from '@/lib/youtube';
import { EventCountdown } from './EventCountdown';
import { useLivePresence } from '@/hooks/useLivePresence';

interface Props {
  templeId: string;
  templeName: string;
  primaryColor?: string | null;
  schedules: ChantingSchedule[];
  /** Gọn hơn trên trang gõ mõ */
  compact?: boolean;
  /** Phạm vi trang hiện tại — lọc realtime */
  scope: 'home' | 'go_mo';
}

function scheduleLabel(s: ChantingSchedule): string {
  const time = formatStartTimeShort(s.start_time);
  if (s.recurrence === 'daily') return `Hằng ngày · ${time}`;
  if (s.recurrence === 'once' && s.start_date) {
    return `${s.start_date} · ${time}`;
  }
  if (s.recurrence === 'weekly' && s.days_of_week?.length) {
    return `${s.days_of_week.map((d) => WEEKDAY_LABELS[d]).join(', ')} · ${time}`;
  }
  return time;
}

function LiveCard({
  schedule: initial,
  primary,
  compact,
}: {
  schedule: ChantingSchedule;
  primary: string;
  compact?: boolean;
}) {
  const [schedule, setSchedule] = useState(initial);
  const [joined, setJoined] = useState(false);
  const viewerCount = useLivePresence(
    joined && schedule.is_live ? schedule.temple_id : null,
    joined && schedule.is_live ? schedule.id : null,
    true,
  );

  useEffect(() => {
    setSchedule(initial);
  }, [initial]);

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`chanting-row:${initial.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'chanting_schedules',
          filter: `id=eq.${initial.id}`,
        },
        (payload) => {
          setSchedule((prev) => ({
            ...prev,
            ...(payload.new as ChantingSchedule),
          }));
        },
      )
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [initial.id]);

  const windowInfo = useMemo(
    () => getChantingWindow(schedule),
    [schedule],
  );

  const embedSrc = youtubeEmbedSrc({
    liveVideoUrl: schedule.live_video_url,
    channelId: schedule.youtube_channel_id,
  });

  const thumb =
    youtubeThumbnailUrl(schedule.live_video_url) ||
    (schedule.youtube_channel_id
      ? null
      : null);

  const showLiveUi = schedule.is_live;

  return (
    <article
      className={`border border-fog bg-paper overflow-hidden ${
        compact ? '' : ''
      }`}
    >
      <div className="relative aspect-video bg-ink/5">
        {showLiveUi && joined && embedSrc ? (
          <iframe
            src={embedSrc}
            title={schedule.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            className="absolute inset-0 h-full w-full"
          />
        ) : (
          <button
            type="button"
            onClick={() => {
              if (showLiveUi && embedSrc) setJoined(true);
            }}
            disabled={!showLiveUi || !embedSrc}
            className="absolute inset-0 group text-left"
          >
            {thumb ? (
              <Image
                src={thumb}
                alt=""
                fill
                className="object-cover opacity-90"
                sizes="(max-width: 768px) 100vw, 640px"
                unoptimized
              />
            ) : (
              <div
                className="absolute inset-0"
                style={{
                  background: `linear-gradient(135deg, ${primary}22, ${primary}55)`,
                }}
              />
            )}
            <div className="absolute inset-0 bg-ink/35 group-hover:bg-ink/45 transition-colors" />
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-4 text-center text-white">
              {showLiveUi ? (
                <>
                  <span className="inline-flex items-center gap-2 px-3 py-1 text-[0.7rem] tracking-[0.2em] uppercase bg-red-700">
                    <span className="size-1.5 rounded-full bg-white animate-pulse" />
                    Đang tụng kinh
                  </span>
                  <span className="font-display text-xl md:text-2xl">
                    Tham dự cùng sư phụ
                  </span>
                  {!embedSrc ? (
                    <span className="text-xs text-white/80">
                      Thiếu Channel ID YouTube — vui lòng cập nhật trong quản trị.
                    </span>
                  ) : null}
                </>
              ) : (
                <>
                  <span className="text-[0.7rem] tracking-[0.25em] uppercase text-white/80">
                    Sắp tới
                  </span>
                  <span className="font-display text-xl md:text-2xl">
                    {schedule.title}
                  </span>
                  <span className="text-sm text-white/85">
                    {scheduleLabel(schedule)}
                  </span>
                </>
              )}
            </div>
          </button>
        )}
      </div>

      <div className="p-4 md:p-5 space-y-3">
        <div>
          <h3 className="font-display text-xl text-ink">{schedule.title}</h3>
          {schedule.description ? (
            <p className="mt-1.5 text-sm text-muted leading-relaxed">
              {schedule.description}
            </p>
          ) : null}
          <p className="mt-1 text-xs text-muted">{scheduleLabel(schedule)}</p>
        </div>

        {showLiveUi && joined ? (
          <p className="text-sm" style={{ color: primary }}>
            {viewerCount > 0
              ? `${viewerCount} Phật tử đang tụng kinh cùng sư phụ`
              : 'Bạn đang tham dự buổi tụng kinh'}
          </p>
        ) : null}

        {!showLiveUi && windowInfo ? (
          <EventCountdown
            startsAt={windowInfo.startsAt}
            endsAt={windowInfo.endsAt}
            color={primary}
          />
        ) : null}

        {!showLiveUi && schedule.youtube_channel_url ? (
          <a
            href={schedule.youtube_channel_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block text-xs font-medium underline-offset-2 hover:underline"
            style={{ color: primary }}
          >
            Xem kênh YouTube →
          </a>
        ) : null}
      </div>
    </article>
  );
}

export function LiveChantingSection({
  templeId,
  templeName,
  primaryColor,
  schedules,
  compact = false,
  scope,
}: Props) {
  const [rows, setRows] = useState(schedules);
  const primary = primaryColor || '#7A1F1F';

  useEffect(() => {
    setRows(schedules);
  }, [schedules]);

  useEffect(() => {
    if (!templeId) return;
    const supabase = createClient();
    const channel = supabase
      .channel(`chanting-temple:${templeId}:${scope}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'chanting_schedules',
          filter: `temple_id=eq.${templeId}`,
        },
        (payload) => {
          if (payload.eventType === 'DELETE') {
            const old = payload.old as { id?: string };
            if (old.id) setRows((prev) => prev.filter((r) => r.id !== old.id));
            return;
          }
          const next = payload.new as ChantingSchedule;
          if (!next?.id) return;
          const visible =
            next.is_active &&
            next.display_scope !== 'hidden' &&
            (next.display_scope === 'both' || next.display_scope === scope);
          if (!visible) {
            setRows((prev) => prev.filter((r) => r.id !== next.id));
            return;
          }
          setRows((prev) => {
            const idx = prev.findIndex((r) => r.id === next.id);
            if (idx >= 0) {
              const copy = [...prev];
              copy[idx] = next;
              return copy;
            }
            return [...prev, next];
          });
        },
      )
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [templeId, scope]);

  if (!rows.length) return null;

  const liveFirst = [...rows].sort((a, b) => {
    if (a.is_live === b.is_live) return 0;
    return a.is_live ? -1 : 1;
  });

  return (
    <section
      id="tung-kinh"
      className={`scroll-mt-16 ${compact ? 'mb-8' : 'bg-paper'}`}
    >
      <div
        className={
          compact
            ? ''
            : 'mx-auto max-w-6xl px-6 py-16 md:px-12 md:py-20'
        }
      >
        <div className={compact ? 'mb-4' : 'max-w-2xl mb-8'}>
          {!compact ? (
            <p
              className="text-[0.72rem] tracking-[0.3em] uppercase"
              style={{ color: primary }}
            >
              Tụng kinh trực tuyến
            </p>
          ) : null}
          <h2
            className={`font-display text-ink leading-tight ${
              compact ? 'text-2xl' : 'mt-3 text-3xl md:text-4xl'
            }`}
          >
            {compact
              ? 'Tụng kinh cùng sư phụ'
              : `Tụng kinh cùng sư phụ tại ${templeName}`}
          </h2>
          <p className="mt-2 text-sm text-muted leading-relaxed">
            Đến giờ, sư phụ livestream trên YouTube. Bấm tham dự để cùng tụng —
            không cần cài app.
          </p>
        </div>

        <div
          className={
            compact
              ? 'space-y-4'
              : 'grid gap-6 md:grid-cols-2'
          }
        >
          {liveFirst.map((s) => (
            <LiveCard
              key={s.id}
              schedule={s}
              primary={primary}
              compact={compact}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
