import type { Temple } from '@/types/database';

interface Props {
  temple: Temple;
}

/** Force Google Maps embed to satellite imagery (`t=k`). */
function toSatelliteEmbed(url: string): string {
  try {
    const u = new URL(url);
    u.searchParams.set('t', 'k');
    if (!u.searchParams.has('output')) {
      u.searchParams.set('output', 'embed');
    }
    return u.toString();
  } catch {
    if (/[?&]t=/.test(url)) {
      return url.replace(/([?&])t=[^&]*/i, '$1t=k');
    }
    const join = url.includes('?') ? '&' : '?';
    return `${url}${join}t=k`;
  }
}

function Stars({ rating }: { rating: number }) {
  const full = Math.round(rating);
  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`${rating} sao`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <span
          key={i}
          className={i < full ? 'text-gilt' : 'text-fog'}
          aria-hidden
        >
          ★
        </span>
      ))}
    </span>
  );
}

export function MapsReviewsSection({ temple }: Props) {
  const hasMap = Boolean(temple.maps_embed_url || temple.maps_url);
  const reviews = temple.reviews ?? [];
  const count = temple.google_review_count;
  const rating = temple.google_rating;
  if (!hasMap && reviews.length === 0 && !count) return null;

  const primary = temple.primary_color || '#7A1F1F';

  return (
    <section id="danh-gia" className="bg-mist scroll-mt-8">
      <div className="mx-auto max-w-6xl px-6 py-20 md:px-12 md:py-28">
        <div className="section-rule mb-6" />
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[0.72rem] tracking-[0.3em] uppercase text-lacquer mb-3">
              Bản đồ & cảm nhận
            </p>
            <h2 className="font-display text-3xl md:text-4xl text-ink leading-tight">
              Vị trí & đánh giá
            </h2>
            <p className="mt-3 text-muted max-w-xl leading-relaxed">
              {temple.address ??
                'Xem vị trí chùa trên Google Maps và cảm nhận từ Phật tử đã đến.'}
            </p>
          </div>
          {(rating || count) && (
            <div className="bg-paper border border-fog px-5 py-4 text-right">
              {rating ? (
                <p className="font-display text-3xl text-ink leading-none">
                  {Number(rating).toFixed(1)}
                </p>
              ) : null}
              {rating ? (
                <p className="mt-1">
                  <Stars rating={Number(rating)} />
                </p>
              ) : null}
              {count ? (
                <p className="mt-1 text-xs text-muted">
                  {count.toLocaleString('vi-VN')} đánh giá trên Google
                </p>
              ) : null}
            </div>
          )}
        </div>

        {temple.maps_embed_url ? (
          <div className="mt-10 overflow-hidden border border-fog bg-paper aspect-[16/10] md:aspect-[21/9]">
            <iframe
              title={`Bản đồ vệ tinh ${temple.name}`}
              src={toSatelliteEmbed(temple.maps_embed_url)}
              className="h-full w-full border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
          </div>
        ) : null}

        <div className="mt-6 flex flex-wrap gap-3">
          {temple.maps_url ? (
            <a
              href={temple.maps_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center px-5 py-2.5 text-sm font-medium text-white"
              style={{ backgroundColor: primary }}
            >
              Mở Google Maps
            </a>
          ) : null}
          {temple.maps_url ? (
            <a
              href={temple.maps_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center px-5 py-2.5 text-sm font-medium border border-fog text-ink hover:bg-paper"
            >
              Xem / viết đánh giá trên Google
            </a>
          ) : null}
        </div>

        {reviews.length > 0 ? (
          <ul className="mt-12 grid md:grid-cols-2 gap-5">
            {reviews.map((r, idx) => (
              <li
                key={`${r.author}-${idx}`}
                className="bg-paper border border-fog px-5 py-5"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="font-medium text-ink">{r.author}</p>
                  {typeof r.rating === 'number' ? (
                    <Stars rating={r.rating} />
                  ) : null}
                </div>
                {r.relative_time ? (
                  <p className="mt-1 text-xs text-muted">{r.relative_time}</p>
                ) : null}
                {r.text ? (
                  <p className="mt-3 text-sm text-muted leading-relaxed whitespace-pre-line">
                    {r.text}
                  </p>
                ) : (
                  <p className="mt-3 text-sm text-muted/70 italic">
                    Đánh giá bằng sao (không có nội dung chữ).
                  </p>
                )}
              </li>
            ))}
          </ul>
        ) : count ? (
          <p className="mt-10 text-sm text-muted border border-fog bg-paper px-5 py-6 leading-relaxed">
            Hiện có{' '}
            <b className="text-ink">{count.toLocaleString('vi-VN')} đánh giá</b>{' '}
            trên Google Maps. Nội dung chi tiết từng đánh giá sẽ được đồng bộ
            khi có link địa điểm Google Maps chính xác (Google không cho lấy
            tự động). Bạn có thể xem đầy đủ bằng nút phía trên.
          </p>
        ) : null}
      </div>
    </section>
  );
}
