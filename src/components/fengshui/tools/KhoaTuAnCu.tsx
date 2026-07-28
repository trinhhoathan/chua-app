import Link from 'next/link';
import type { TempleEvent } from '@/types/database';
import {
  KHOA_TU_FOOTNOTE,
  KHOA_TU_INTRO,
  KHOA_TU_SECTIONS,
} from '@/lib/fengshui/khoa-tu-an-cu';
import { EventCountdown } from '@/components/temple/EventCountdown';

interface Props {
  primaryColor: string;
  templeName: string;
  events: TempleEvent[];
}

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

export function KhoaTuAnCu({ primaryColor, templeName, events }: Props) {
  return (
    <div className="space-y-10">
      <p className="text-sm text-muted leading-relaxed">{KHOA_TU_INTRO}</p>

      <div className="space-y-6">
        {KHOA_TU_SECTIONS.map((section) => (
          <section key={section.title}>
            <h2
              className="font-display text-xl text-ink border-l-[3px] pl-3 leading-snug"
              style={{ borderColor: primaryColor }}
            >
              {section.title}
            </h2>
            <p className="mt-2 text-sm text-muted leading-relaxed">
              {section.body}
            </p>
          </section>
        ))}
      </div>

      <section>
        <h2 className="font-display text-xl text-ink">
          Khóa tu sắp tới tại {templeName}
        </h2>
        <p className="mt-2 text-sm text-muted leading-relaxed">
          Các khóa tu nhà chùa đã công bố. Thời gian đếm ngược cập nhật theo
          thời gian thực.
        </p>

        {events.length === 0 ? (
          <div className="mt-5 border border-fog bg-paper px-4 py-5 space-y-3">
            <p className="text-sm text-muted leading-relaxed">
              Hiện chưa có khóa tu được công bố. Quý Phật tử có thể ghi danh để
              nhận tin khi nhà chùa mở khóa mới, hoặc xem toàn bộ lịch hoạt
              động trên trang chủ.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/dang-ky-phat-tu"
                className="px-4 py-2.5 text-sm text-white"
                style={{ background: primaryColor }}
              >
                Ghi danh nhận tin
              </Link>
              <Link
                href="/#hoat-dong"
                className="px-4 py-2.5 text-sm border border-fog text-ink hover:bg-mist"
              >
                Xem lịch hoạt động
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

      <div className="flex flex-wrap gap-3">
        <Link
          href="/dang-ky-phat-tu"
          className="px-4 py-2.5 text-sm text-white"
          style={{ background: primaryColor }}
        >
          Ghi danh Phật tử
        </Link>
        <Link
          href="/#hoat-dong"
          className="px-4 py-2.5 text-sm border border-fog text-ink hover:bg-mist"
        >
          Lịch hoạt động chùa
        </Link>
      </div>

      <p className="text-xs text-muted leading-relaxed">{KHOA_TU_FOOTNOTE}</p>
    </div>
  );
}
