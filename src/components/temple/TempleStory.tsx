import Image from 'next/image';
import type { Temple } from '@/types/database';

interface Props {
  temple: Temple;
}

function pickStoryImage(temple: Temple) {
  const fromExtra = temple.extra_sections?.find((s) => s.image_url)?.image_url;
  if (fromExtra) {
    return {
      url: fromExtra,
      alt: temple.extra_sections.find((s) => s.image_url)?.title || temple.name,
    };
  }
  const local = temple.gallery?.find((g) => g.url?.startsWith('/images/'));
  if (local?.url) return { url: local.url, alt: local.alt || temple.name };
  if (temple.hero_image_url) {
    return { url: temple.hero_image_url, alt: temple.name };
  }
  const first = temple.gallery?.[0];
  if (first?.url) return { url: first.url, alt: first.alt || temple.name };
  return null;
}

export function TempleStory({ temple }: Props) {
  if (!temple.history_summary) return null;

  const img = pickStoryImage(temple);

  return (
    <section id="gioi-thieu" className="relative bg-paper scroll-mt-8">
      <div className="absolute inset-0 opacity-[0.035] pointer-events-none bg-[url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22n%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.85%22 numOctaves=%224%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23n)%22/%3E%3C/svg%3E')]" />
      <div className="relative mx-auto max-w-6xl px-6 py-20 md:px-12 md:py-28 grid md:grid-cols-2 gap-12 md:gap-16 items-start">
        <div>
          <div className="section-rule mb-6" />
          <p className="text-[0.72rem] tracking-[0.3em] uppercase text-lacquer mb-3">
            Giới thiệu
          </p>
          <h2 className="font-display text-3xl md:text-4xl text-ink leading-tight">
            {temple.tagline ?? 'Ngôi chùa của cộng đồng'}
          </h2>
          <p className="mt-6 text-muted leading-relaxed text-[1.05rem] whitespace-pre-line">
            {temple.history_summary}
          </p>
          {temple.address ? (
            <p className="mt-8 text-sm text-muted border-t border-fog pt-6">
              <span className="text-ink font-medium">Địa chỉ: </span>
              {temple.address}
            </p>
          ) : null}
        </div>
        <div className="relative aspect-[4/5] overflow-hidden bg-mist md:sticky md:top-24">
          {img ? (
            <Image
              src={img.url}
              alt={img.alt}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
              unoptimized={/^https?:\/\//i.test(img.url)}
            />
          ) : null}
        </div>
      </div>
    </section>
  );
}
