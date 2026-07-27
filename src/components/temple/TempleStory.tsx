import Image from 'next/image';
import type { Temple } from '@/types/database';

interface Props {
  temple: Temple;
}

export function TempleStory({ temple }: Props) {
  if (!temple.history_summary) return null;

  const storyImage =
    temple.gallery[0]?.url || temple.hero_image_url || null;
  const storyAlt = temple.gallery[0]?.alt || temple.name;

  return (
    <section id="lich-su" className="relative bg-paper scroll-mt-8">
      <div className="absolute inset-0 opacity-[0.035] pointer-events-none bg-[url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22n%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.85%22 numOctaves=%224%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23n)%22/%3E%3C/svg%3E')]" />
      <div className="relative mx-auto max-w-6xl px-6 py-20 md:px-12 md:py-28 grid md:grid-cols-2 gap-12 md:gap-16 items-center">
        <div>
          <div className="section-rule mb-6" />
          <h2 className="font-display text-3xl md:text-4xl text-ink leading-tight">
            {temple.tagline ?? 'Ngôi chùa của cộng đồng'}
          </h2>
          <p className="mt-6 text-muted leading-relaxed text-[1.05rem] whitespace-pre-line">
            {temple.history_summary}
          </p>
          {temple.address ? (
            <p className="mt-6 text-sm text-muted">
              <span className="text-ink font-medium">Địa chỉ: </span>
              {temple.address}
            </p>
          ) : null}
        </div>
        <div className="relative aspect-[4/5] overflow-hidden bg-mist">
          {storyImage ? (
            <Image
              src={storyImage}
              alt={storyAlt}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          ) : null}
        </div>
      </div>
    </section>
  );
}
