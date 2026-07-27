import Image from 'next/image';
import type { Temple } from '@/types/database';

interface Props {
  temple: Temple;
}

function isRemote(url: string) {
  return /^https?:\/\//i.test(url);
}

export function GallerySection({ temple }: Props) {
  const images = (temple.gallery ?? []).filter((g) => g?.url);
  if (images.length === 0) return null;

  return (
    <section id="thu-vien-anh" className="bg-paper scroll-mt-8">
      <div className="mx-auto max-w-6xl px-6 py-20 md:px-12 md:py-28">
        <div className="section-rule mb-6" />
        <p className="text-[0.72rem] tracking-[0.3em] uppercase text-lacquer mb-3">
          Hình ảnh
        </p>
        <h2 className="font-display text-3xl md:text-4xl text-ink leading-tight">
          Thư viện ảnh
        </h2>
        <p className="mt-3 text-muted max-w-xl leading-relaxed">
          Không gian chùa và cảm nhận từ cộng đồng trên Google Maps.
        </p>

        <ul className="mt-12 columns-1 sm:columns-2 lg:columns-3 gap-4 [column-fill:_balance]">
          {images.map((img, idx) => (
            <li key={`${img.url}-${idx}`} className="mb-4 break-inside-avoid">
              <figure className="relative overflow-hidden bg-mist aspect-[4/3]">
                <Image
                  src={img.url}
                  alt={img.alt || `${temple.name} — ảnh ${idx + 1}`}
                  fill
                  className="object-cover transition-transform duration-700 hover:scale-[1.03]"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  unoptimized={isRemote(img.url)}
                />
              </figure>
            </li>
          ))}
        </ul>

        {temple.maps_url ? (
          <p className="mt-8 text-sm text-muted">
            <a
              href={temple.maps_url}
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-4 hover:text-ink"
            >
              Xem thêm ảnh trên Google Maps
            </a>
          </p>
        ) : null}
      </div>
    </section>
  );
}
