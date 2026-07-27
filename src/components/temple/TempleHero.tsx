import Image from 'next/image';
import type { Temple } from '@/types/database';
import { TempleLogo } from '@/components/temple/TempleLogo';

interface Props {
  temple: Temple;
}

export function TempleHero({ temple }: Props) {
  const primary = temple.primary_color || '#7A1F1F';
  const hero = temple.hero_image_url;

  return (
    <section className="relative min-h-[100svh] flex items-end">
      <div className="absolute inset-0 overflow-hidden">
        {hero ? (
          <Image
            src={hero}
            alt={`${temple.name} — ${temple.tagline ?? ''}`}
            fill
            priority
            className="object-cover animate-drift"
            sizes="100vw"
            unoptimized={/^https?:\/\//i.test(hero)}
          />
        ) : (
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(160deg, ${primary} 0%, #1a1714 70%)`,
            }}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#1a1714]/92 via-[#1a1714]/45 to-[#1a1714]/20" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,rgba(26,23,20,0.35)_100%)]" />
      </div>

      <div className="relative z-10 w-full px-6 pb-28 pt-28 md:px-12 md:pb-32 lg:px-20">
        <div className="max-w-3xl animate-rise">
          <TempleLogo
            logoUrl={temple.logo_url}
            name={temple.name}
            className="h-14 w-14 mb-6 shrink-0 rounded-full ring-1 ring-white/30"
          />
          {temple.temple_alt_name ? (
            <p className="text-[0.7rem] tracking-[0.35em] uppercase text-gilt mb-4 animate-fade">
              {temple.temple_alt_name}
            </p>
          ) : null}
          <h1 className="font-display text-[clamp(2.75rem,8vw,5.5rem)] leading-[0.95] text-white font-medium tracking-tight">
            {temple.name}
          </h1>
          {temple.slogan ? (
            <p className="mt-5 max-w-xl text-base md:text-lg text-white/80 font-light leading-relaxed animate-rise-delay">
              {temple.slogan}
            </p>
          ) : null}
          <div className="mt-8 flex flex-wrap gap-3 animate-rise-delay-2">
            <a
              href="#gioi-thieu"
              className="inline-flex items-center justify-center px-6 py-3 text-sm font-medium text-white transition-colors"
              style={{ backgroundColor: primary }}
            >
              Tìm hiểu lịch sử
            </a>
            <a
              href="#dong-nuoc"
              className="inline-flex items-center justify-center px-6 py-3 text-sm font-medium text-white/90 border border-white/35 hover:bg-white/10 transition-colors"
            >
              Công đức nước tinh khiết
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
