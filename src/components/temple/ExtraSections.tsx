import Image from 'next/image';
import type { Temple } from '@/types/database';

interface Props {
  temple: Temple;
}

function isRemote(url: string) {
  return /^https?:\/\//i.test(url);
}

export function ExtraSections({ temple }: Props) {
  const sections = temple.extra_sections ?? [];
  if (sections.length === 0) return null;

  return (
    <div id="di-tich" className="scroll-mt-8">
      {sections.map((section, idx) => {
        const reverse = idx % 2 === 1;
        const hasImage = Boolean(section.image_url);
        const bg = idx % 2 === 0 ? 'bg-paper' : 'bg-mist';

        return (
          <section key={`${section.title}-${idx}`} className={bg}>
            <div
              className={`mx-auto max-w-6xl px-6 py-20 md:px-12 md:py-28 ${
                hasImage
                  ? 'grid md:grid-cols-2 gap-12 md:gap-16 items-center'
                  : ''
              }`}
            >
              {hasImage ? (
                <div
                  className={`relative aspect-[4/3] overflow-hidden bg-fog ${
                    reverse ? 'md:order-2' : ''
                  }`}
                >
                  <Image
                    src={section.image_url!}
                    alt={section.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 50vw"
                    unoptimized={isRemote(section.image_url!)}
                  />
                </div>
              ) : null}

              <div className={hasImage && reverse ? 'md:order-1' : undefined}>
                <div className="section-rule mb-6" />
                <p className="text-[0.72rem] tracking-[0.3em] uppercase text-lacquer mb-3">
                  Di tích & truyền thuyết
                </p>
                <h2 className="font-display text-3xl md:text-4xl text-ink leading-tight">
                  {section.title}
                </h2>
                <p className="mt-6 text-muted leading-relaxed whitespace-pre-line text-[1.05rem]">
                  {section.body}
                </p>
              </div>
            </div>
          </section>
        );
      })}
    </div>
  );
}
