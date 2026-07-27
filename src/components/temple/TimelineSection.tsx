import type { Temple } from '@/types/database';

interface Props {
  temple: Temple;
}

export function TimelineSection({ temple }: Props) {
  if (!temple.timeline?.length) return null;

  return (
    <section id="lich-su" className="bg-jade-deep text-mist scroll-mt-8">
      <div className="mx-auto max-w-6xl px-6 py-20 md:px-12 md:py-28">
        <div className="max-w-2xl">
          <div className="section-rule mb-6" />
          <h2 className="font-display text-3xl md:text-4xl text-white leading-tight">
            Dòng chảy lịch sử
          </h2>
          <p className="mt-5 text-mist/75 leading-relaxed text-[1.05rem]">
            Những mốc quan trọng gắn với {temple.name}.
          </p>
        </div>

        <div className="mt-14 grid md:grid-cols-3 gap-10 md:gap-8">
          {temple.timeline.map((item, idx) => (
            <article
              key={`${item.year}-${idx}`}
              className="border-t border-white/15 pt-6"
            >
              <p className="text-gilt text-sm tracking-widest font-medium">
                {item.year}
              </p>
              <h3 className="mt-3 font-display text-xl text-white">
                {item.title}
              </h3>
              <p className="mt-3 text-sm text-mist/70 leading-relaxed">
                {item.body}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
