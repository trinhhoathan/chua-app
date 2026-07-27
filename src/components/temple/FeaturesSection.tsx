import type { Temple } from '@/types/database';

interface Props {
  temple: Temple;
}

export function FeaturesSection({ temple }: Props) {
  if (!temple.features?.length) return null;
  const primary = temple.primary_color || '#7A1F1F';

  return (
    <section id="kien-truc" className="bg-paper scroll-mt-8">
      <div className="mx-auto max-w-6xl px-6 py-20 md:px-12 md:py-28">
        <div className="max-w-2xl">
          <div className="section-rule mb-6" />
          <p className="text-[0.72rem] tracking-[0.3em] uppercase text-lacquer mb-3">
            Kiến trúc & thờ tự
          </p>
          <h2 className="font-display text-3xl md:text-4xl text-ink leading-tight">
            Quần thể đình — chùa
          </h2>
          <p className="mt-4 text-muted leading-relaxed">
            Không chỉ là nơi thờ Phật, {temple.name} gắn liền với đình làng,
            phủ thờ và giá trị lịch sử — văn hóa của vùng sông Châu.
          </p>
        </div>

        <div className="mt-14 grid sm:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-12">
          {temple.features.map((f, idx) => (
            <div key={idx} className="relative pl-5 border-l border-fog">
              <span
                className="absolute -left-[3px] top-1.5 h-1.5 w-1.5 rounded-full"
                style={{ backgroundColor: primary }}
              />
              <h3 className="font-display text-xl text-ink leading-snug">
                {f.title}
              </h3>
              <p className="mt-3 text-muted leading-relaxed text-sm">{f.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
