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
          <p className="text-[0.72rem] tracking-[0.3em] uppercase text-gilt mb-3">
            Dòng thời gian
          </p>
          <h2 className="font-display text-3xl md:text-4xl text-white leading-tight">
            Dòng chảy lịch sử
          </h2>
          <p className="mt-5 text-mist/75 leading-relaxed text-[1.05rem]">
            Những mốc gắn với {temple.name} — từ truyền thuyết thời Lý đến di
            tích quốc gia và địa chỉ đỏ cách mạng.
          </p>
        </div>

        <ol className="mt-14 grid sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-10">
          {temple.timeline.map((item, idx) => (
            <li
              key={`${item.year}-${idx}`}
              className="border-t border-white/15 pt-6 relative"
            >
              <span className="absolute -top-px left-0 h-px w-10 bg-gilt" />
              <p className="text-gilt text-sm tracking-widest font-medium">
                {item.year}
              </p>
              <h3 className="mt-3 font-display text-xl text-white leading-snug">
                {item.title}
              </h3>
              <p className="mt-3 text-sm text-mist/70 leading-relaxed">
                {item.body}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
