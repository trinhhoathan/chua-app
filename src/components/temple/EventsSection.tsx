import Image from 'next/image';
import type { Temple, TempleEvent } from '@/types/database';
import { TEMPLE_EVENT_TYPE_LABELS } from '@/types/database';
import { EventCountdown } from './EventCountdown';

interface Props {
  temple: Temple;
  events: TempleEvent[];
}

function isRemote(url: string) {
  return /^https?:\/\//i.test(url);
}

function formatVN(iso: string): string {
  const d = new Date(iso);
  return new Intl.DateTimeFormat('vi-VN', {
    weekday: 'long',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d);
}

export function EventsSection({ temple, events }: Props) {
  if (!events || events.length === 0) return null;
  const primary = temple.primary_color || '#7A1F1F';

  return (
    <section id="hoat-dong" className="scroll-mt-16 bg-paper">
      <div className="mx-auto max-w-6xl px-6 py-20 md:px-12 md:py-24">
        <div className="max-w-2xl">
          <p
            className="text-[0.72rem] tracking-[0.3em] uppercase"
            style={{ color: primary }}
          >
            Hoạt động sắp diễn ra
          </p>
          <h2 className="mt-3 font-display text-3xl md:text-4xl text-ink leading-tight">
            Lễ hội & sinh hoạt tại {temple.name}
          </h2>
          <p className="mt-4 text-muted leading-relaxed text-[1.02rem]">
            Kính mời quý phật tử theo dõi các buổi lễ, khóa tu và hoạt động sắp
            tới. Thời gian đếm ngược cập nhật theo thời gian thực.
          </p>
        </div>

        <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {events.map((ev) => (
            <li
              key={ev.id}
              className="group flex flex-col bg-white border border-fog transition-shadow hover:shadow-[0_10px_30px_-18px_rgba(0,0,0,0.4)]"
            >
              {ev.image_url ? (
                <div className="relative aspect-[16/10] overflow-hidden bg-fog">
                  <Image
                    src={ev.image_url}
                    alt={ev.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    unoptimized={isRemote(ev.image_url)}
                  />
                </div>
              ) : (
                <div
                  className="aspect-[16/10] flex items-center justify-center bg-mist"
                  style={{
                    background: `linear-gradient(160deg, ${primary}18 0%, ${primary}05 100%)`,
                  }}
                >
                  <span
                    className="font-display text-xl px-6 text-center"
                    style={{ color: primary }}
                  >
                    {TEMPLE_EVENT_TYPE_LABELS[ev.event_type]}
                  </span>
                </div>
              )}

              <div className="flex-1 p-5 md:p-6 flex flex-col">
                <p
                  className="text-[0.7rem] uppercase tracking-[0.25em]"
                  style={{ color: primary }}
                >
                  {TEMPLE_EVENT_TYPE_LABELS[ev.event_type]}
                </p>

                <h3
                  className="mt-2 font-display text-xl md:text-[1.35rem] text-ink leading-snug border-l-[3px] pl-3"
                  style={{ borderColor: primary }}
                >
                  {ev.title}
                </h3>

                {ev.summary ? (
                  <p className="mt-3 text-sm text-muted leading-relaxed line-clamp-4">
                    {ev.summary}
                  </p>
                ) : null}

                <div className="mt-auto pt-5 space-y-3">
                  <div className="text-sm text-ink">
                    <p className="tabular-nums">{formatVN(ev.starts_at)}</p>
                    {ev.location ? (
                      <p className="mt-0.5 text-xs text-muted">
                        {ev.location}
                      </p>
                    ) : null}
                  </div>
                  <EventCountdown
                    startsAt={ev.starts_at}
                    endsAt={ev.ends_at}
                    color={primary}
                  />
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
