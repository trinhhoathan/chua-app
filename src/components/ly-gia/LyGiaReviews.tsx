'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';

export type LyGiaReview = {
  name: string;
  role: string;
  text: string;
  avatar: string;
};

export function LyGiaReviews({ reviews }: { reviews: LyGiaReview[] }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const perPage = 3;
  const pages = Math.max(1, Math.ceil(reviews.length / perPage));

  useEffect(() => {
    if (paused || pages <= 1) return;
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % pages);
    }, 5200);
    return () => window.clearInterval(id);
  }, [paused, pages]);

  const visible = Array.from({ length: perPage }, (_, i) => {
    return reviews[(index * perPage + i) % reviews.length];
  });

  return (
    <div
      className="relative"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="pointer-events-none absolute -left-8 top-8 size-40 rounded-full bg-lacquer/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-6 bottom-0 size-48 rounded-full bg-gilt/20 blur-3xl" />

      <div className="relative grid gap-4 md:grid-cols-3">
        {visible.map((r, i) => (
          <figure
            key={`${r.name}-${index}-${i}`}
            className="group relative flex flex-col overflow-hidden border border-fog bg-white p-6 shadow-[0_12px_40px_-28px_rgba(26,23,20,0.45)] transition-transform duration-500 animate-[rise-in_0.55s_ease-out]"
            style={{ animationDelay: `${i * 80}ms` }}
          >
            <div
              className="absolute inset-x-0 top-0 h-1"
              style={{
                background: 'linear-gradient(90deg, var(--lacquer), var(--gilt), var(--lacquer))',
              }}
            />
            <svg
              viewBox="0 0 48 48"
              className="absolute right-4 top-5 size-10 text-lacquer/10"
              fill="currentColor"
              aria-hidden
            >
              <path d="M14 10c-6 0-10 4.5-10 11v17h14V22H8c0-4 2.2-6.5 6-6.5V10zm24 0c-6 0-10 4.5-10 11v17h14V22h-10c0-4 2.2-6.5 6-6.5V10z" />
            </svg>

            <div className="flex items-center gap-3">
              <Image
                src={r.avatar}
                alt={r.name}
                width={52}
                height={52}
                className="size-12 rounded-full object-cover ring-2 ring-mist"
              />
              <div>
                <figcaption className="font-medium text-ink">{r.name}</figcaption>
                <p className="text-xs text-muted">{r.role}</p>
              </div>
            </div>
            <div className="mt-3 flex gap-0.5 text-gilt" aria-label="5 sao">
              {Array.from({ length: 5 }).map((_, s) => (
                <svg key={s} viewBox="0 0 20 20" className="size-3.5 fill-current">
                  <path d="M10 1.5 12.7 7l6 .9-4.3 4.2 1 5.9L10 15.2 4.6 18l1-5.9L1.3 7.9l6-.9L10 1.5Z" />
                </svg>
              ))}
            </div>
            <blockquote className="mt-3 flex-1 text-sm leading-relaxed text-muted">
              “{r.text}”
            </blockquote>
          </figure>
        ))}
      </div>

      <div className="mt-8 flex items-center justify-center gap-3">
        <button
          type="button"
          aria-label="Đánh giá trước"
          className="inline-flex size-10 items-center justify-center border border-fog bg-white text-ink hover:border-ink/30 transition-colors"
          onClick={() => setIndex((i) => (i - 1 + pages) % pages)}
        >
          <svg viewBox="0 0 20 20" className="size-4" fill="currentColor">
            <path d="M12.7 4.3a1 1 0 0 1 0 1.4L8.4 10l4.3 4.3a1 1 0 1 1-1.4 1.4l-5-5a1 1 0 0 1 0-1.4l5-5a1 1 0 0 1 1.4 0Z" />
          </svg>
        </button>
        <div className="flex items-center gap-1.5">
          {Array.from({ length: pages }).map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Trang ${i + 1}`}
              aria-current={i === index}
              className={`h-1.5 rounded-full transition-all ${
                i === index ? 'w-7 bg-lacquer' : 'w-2.5 bg-fog hover:bg-ink/25'
              }`}
              onClick={() => setIndex(i)}
            />
          ))}
        </div>
        <button
          type="button"
          aria-label="Đánh giá sau"
          className="inline-flex size-10 items-center justify-center border border-fog bg-white text-ink hover:border-ink/30 transition-colors"
          onClick={() => setIndex((i) => (i + 1) % pages)}
        >
          <svg viewBox="0 0 20 20" className="size-4" fill="currentColor">
            <path d="M7.3 4.3a1 1 0 0 1 1.4 0l5 5a1 1 0 0 1 0 1.4l-5 5a1 1 0 1 1-1.4-1.4L11.6 10 7.3 5.7a1 1 0 0 1 0-1.4Z" />
          </svg>
        </button>
      </div>
    </div>
  );
}
