import Image from 'next/image';
import type { Temple } from '@/types/database';

interface Props {
  temple: Temple;
}

export function AbbottSection({ temple }: Props) {
  if (!temple.abbott_name) return null;

  return (
    <section id="tru-tri" className="bg-mist scroll-mt-8">
      <div className="mx-auto max-w-6xl px-6 py-20 md:px-12 md:py-28 grid lg:grid-cols-[0.9fr_1.1fr] gap-12 items-center">
        <div className="relative aspect-[3/4] overflow-hidden max-w-md mx-auto lg:mx-0 w-full">
          {temple.abbott_image_url ? (
            <Image
              src={temple.abbott_image_url}
              alt={temple.abbott_name}
              fill
              className="object-cover object-top"
              sizes="(max-width: 1024px) 100vw, 40vw"
            />
          ) : (
            <div className="w-full h-full bg-fog flex items-center justify-center text-muted">
              (chưa có ảnh)
            </div>
          )}
        </div>
        <div>
          <div className="section-rule mb-6" />
          <p className="text-[0.72rem] tracking-[0.3em] uppercase text-lacquer mb-3">
            Trụ trì
          </p>
          <h2 className="font-display text-3xl md:text-4xl text-ink leading-tight">
            {temple.abbott_name}
          </h2>
          {temple.abbott_title ? (
            <p className="mt-2 text-muted italic">{temple.abbott_title}</p>
          ) : null}
          {temple.abbott_bio ? (
            <p className="mt-6 text-muted leading-relaxed whitespace-pre-line">
              {temple.abbott_bio}
            </p>
          ) : null}
        </div>
      </div>
    </section>
  );
}
