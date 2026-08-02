import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getCurrentTemple } from '@/lib/tenant';
import { isLyGiaPhucAnSite, LY_GIA } from '@/lib/ly-gia-phuc-an';
import {
  LY_GIA_PRODUCTS,
  lyGiaProductBySlug,
} from '@/lib/ly-gia-products';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = lyGiaProductBySlug(slug);
  if (!product) return { title: 'Sản phẩm | Lý Gia Phúc An' };
  return {
    title: `${product.title} | Lý Gia Phúc An`,
    description: product.summary.slice(0, 160),
  };
}

export default async function SanPhamDetailPage({ params }: Props) {
  const temple = await getCurrentTemple();
  if (!temple || !isLyGiaPhucAnSite(temple)) notFound();

  const { slug } = await params;
  const product = lyGiaProductBySlug(slug);
  if (!product) notFound();

  const primary = temple.primary_color || LY_GIA.primary;
  const others = LY_GIA_PRODUCTS.filter((p) => p.slug !== product.slug);

  return (
    <main className="pt-20 pb-24 md:pt-24">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <nav className="py-4 text-xs text-muted">
          <Link href="/" className="hover:text-ink">Trang chủ</Link>
          <span className="mx-1.5">/</span>
          <Link href="/san-pham" className="hover:text-ink">Sản phẩm</Link>
          <span className="mx-1.5">/</span>
          <span className="text-ink">{product.shortTitle}</span>
        </nav>

        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
          <div>
            <p
              className="text-[0.68rem] uppercase tracking-[0.25em]"
              style={{ color: primary }}
            >
              {product.shortTitle}
            </p>
            <h1 className="mt-2 font-display text-3xl leading-tight text-ink md:text-4xl">
              {product.title}
            </h1>
            <p className="mt-3 text-base text-ink/80">{product.tagline}</p>
            <p className="mt-4 text-sm leading-relaxed text-muted">
              {product.summary}
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              {product.relatedHref === '/sim' ? (
                <Link
                  href="/sim"
                  className="px-5 py-3 text-sm font-semibold text-white hover:opacity-90"
                  style={{ backgroundColor: primary }}
                >
                  {product.ctaLabel}
                </Link>
              ) : (
                <a
                  href={LY_GIA.zaloUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-3 text-sm font-semibold text-white hover:opacity-90"
                  style={{ backgroundColor: primary }}
                >
                  {product.ctaLabel}
                </a>
              )}
              <a
                href={`tel:${LY_GIA.phone}`}
                className="border border-fog px-5 py-3 text-sm font-medium text-ink hover:border-ink/40"
              >
                Gọi {LY_GIA.phoneDisplay}
              </a>
            </div>
            {product.relatedHref && product.relatedLabel ? (
              <p className="mt-4">
                <Link
                  href={product.relatedHref}
                  className="text-sm underline underline-offset-2 hover:text-ink"
                  style={{ color: primary }}
                >
                  {product.relatedLabel} →
                </Link>
              </p>
            ) : null}
          </div>

          <div className="relative aspect-[4/3] overflow-hidden border border-fog">
            <Image
              src={product.image}
              alt={product.title}
              fill
              className="object-cover"
              sizes="(max-width:1024px) 100vw, 45vw"
              priority
            />
          </div>
        </div>

        <section className="mt-12 grid gap-8 md:grid-cols-2">
          <div>
            <h2 className="font-display text-2xl text-ink">Lợi ích</h2>
            <ul className="mt-4 space-y-2.5">
              {product.benefits.map((b) => (
                <li key={b} className="flex gap-2.5 text-sm leading-relaxed text-ink/85">
                  <span
                    className="mt-1.5 size-1.5 shrink-0 rounded-full"
                    style={{ backgroundColor: primary }}
                  />
                  {b}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="font-display text-2xl text-ink">Quy trình</h2>
            <ol className="mt-4 space-y-4">
              {product.process.map((step, i) => (
                <li key={step.step} className="border-l-2 border-fog pl-4">
                  <p className="text-xs font-medium" style={{ color: primary }}>
                    Bước {i + 1}
                  </p>
                  <p className="mt-0.5 font-medium text-ink">{step.step}</p>
                  <p className="mt-1 text-sm leading-relaxed text-muted">
                    {step.detail}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="mt-10 border border-fog bg-mist/40 px-5 py-6">
          <h2 className="font-display text-xl text-ink">Vì sao nên làm với thầy?</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted">{product.why}</p>
        </section>

        {others.length > 0 ? (
          <section className="mt-14">
            <h2 className="font-display text-2xl text-ink">Sản phẩm liên quan</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {others.map((p) => (
                <Link
                  key={p.slug}
                  href={`/san-pham/${p.slug}`}
                  className="border border-fog bg-paper px-4 py-3 transition-colors hover:border-ink/30"
                >
                  <p className="text-sm font-medium text-ink">{p.shortTitle}</p>
                  <p className="mt-1 truncate text-[0.7rem] text-muted">
                    {p.tagline}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </main>
  );
}
