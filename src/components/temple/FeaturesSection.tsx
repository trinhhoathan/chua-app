import type { Temple } from '@/types/database';

interface Props {
  temple: Temple;
}

export function FeaturesSection({ temple }: Props) {
  if (!temple.features?.length) return null;
  const primary = temple.primary_color || '#7A1F1F';

  return (
    <section className="bg-paper">
      <div className="mx-auto max-w-6xl px-6 py-20 md:px-12 md:py-28">
        <div className="max-w-2xl">
          <div className="section-rule mb-6" />
          <h2 className="font-display text-3xl md:text-4xl text-ink leading-tight">
            Kiến trúc & thờ tự
          </h2>
        </div>

        <div className="mt-12 grid md:grid-cols-3 gap-8">
          {temple.features.map((f, idx) => (
            <div key={idx} className="relative pl-6">
              <span
                className="absolute left-0 top-2 h-2 w-2 rounded-full"
                style={{ backgroundColor: primary }}
              />
              <h3 className="font-display text-xl text-ink">{f.title}</h3>
              <p className="mt-3 text-muted leading-relaxed text-sm">{f.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
