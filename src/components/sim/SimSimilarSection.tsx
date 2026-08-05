import Link from 'next/link';
import { getSimilarSims } from '@/lib/sim/catalog';
import { SimCard } from '@/components/sim/sim-ui';
import type { SimListing } from '@/types/database';

/** Khối "Số tương đương" — stream riêng để không chặn TTFB trang chi tiết. */
export async function SimSimilarSection({
  sim,
  primaryColor,
  zaloUrl,
}: {
  sim: SimListing;
  primaryColor?: string;
  zaloUrl?: string;
}) {
  const similar = await getSimilarSims(sim);
  if (similar.length === 0) return null;

  return (
    <section className="mt-12">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="font-display text-2xl text-ink">Số tương đương trong kho</h2>
        <div className="flex items-baseline gap-4">
          <Link
            href={`/sim/so-sanh?so=${[sim.phone, ...similar.slice(0, 2).map((s) => s.phone)].join(',')}`}
            className="text-xs text-lacquer underline underline-offset-2"
          >
            So sánh các số này →
          </Link>
          <Link href="/sim" className="text-xs text-lacquer underline underline-offset-2">
            Xem cả kho →
          </Link>
        </div>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {similar.map((s) => (
          <SimCard
            key={s.id}
            sim={s}
            primaryColor={primaryColor}
            zaloUrl={zaloUrl}
          />
        ))}
      </div>
    </section>
  );
}

export function SimSimilarSkeleton() {
  return (
    <section className="mt-12 animate-pulse" aria-hidden>
      <div className="h-7 w-56 bg-fog/70" />
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="h-44 border border-fog bg-mist/40" />
        ))}
      </div>
    </section>
  );
}
