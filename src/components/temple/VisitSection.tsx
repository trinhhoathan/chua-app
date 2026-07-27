import Image from 'next/image';
import type { Temple } from '@/types/database';

interface Props {
  temple: Temple;
}

export function VisitSection({ temple }: Props) {
  const visitImage =
    temple.gallery.at(-1)?.url ||
    temple.hero_image_url ||
    null;
  const visitAlt = temple.gallery.at(-1)?.alt || temple.name;

  return (
    <section className="relative min-h-[65vh] flex items-end">
      <div className="absolute inset-0">
        {visitImage ? (
          <Image
            src={visitImage}
            alt={visitAlt}
            fill
            className="object-cover"
            sizes="100vw"
            unoptimized={/^https?:\/\//i.test(visitImage)}
          />
        ) : (
          <div className="absolute inset-0 bg-ink" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/50 to-ink/25" />
      </div>
      <div className="relative z-10 w-full px-6 py-16 md:px-12 md:py-20 lg:px-20">
        <div className="max-w-xl">
          <div className="section-rule mb-6" />
          <h2 className="font-display text-3xl md:text-4xl text-white leading-tight">
            Đường tới chùa
          </h2>
          {temple.address ? (
            <p className="mt-4 text-white/80 leading-relaxed">
              {temple.address}
            </p>
          ) : null}
          {temple.maps_url ? (
            <a
              href={temple.maps_url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 inline-flex items-center justify-center px-6 py-3 text-sm font-medium text-ink bg-white hover:bg-mist transition-colors"
            >
              Mở Google Maps
            </a>
          ) : null}
        </div>
      </div>
    </section>
  );
}
