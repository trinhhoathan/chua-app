import type { Metadata } from 'next';
import { getCurrentTemple } from '@/lib/tenant';
import {
  getRequestOrigin,
  getTemplePublicOrigin,
  toAbsoluteMediaUrl,
} from '@/lib/site-url';
import { isLyGiaPhucAnSite } from '@/lib/ly-gia-phuc-an';
import { isSimStoreEnabled } from '@/lib/sim/warehouse';
import { getSitePersona } from '@/lib/site-persona';
import { SitePersonaProvider } from '@/components/SitePersonaContext';
import { LyGiaShell } from '@/components/ly-gia/LyGiaShell';
import { TopNav } from '@/components/temple/TopNav';
import { TempleFooter } from '@/components/temple/TempleFooter';
import { ContactDock } from '@/components/temple/ContactDock';
import { WaterStickyBar } from '@/components/water/WaterStickyBar';
import { WaterMeritFloatingNudge } from '@/components/water/WaterMeritFloatingNudge';
import { TemplePromoChips } from '@/components/promo/TemplePromoChips';

export async function generateMetadata(): Promise<Metadata> {
  const temple = await getCurrentTemple();
  if (!temple) {
    return {
      title: 'Chưa kết nối website',
    };
  }

  const requestOrigin = await getRequestOrigin();
  const origin = getTemplePublicOrigin(temple, requestOrigin);
  const description =
    temple.slogan ?? temple.history_summary ?? undefined;
  const alt = temple.temple_alt_name ? ` | ${temple.temple_alt_name}` : '';
  const title = `${temple.name}${alt}`;

  // Ảnh OG tối ưu (nhẹ, 1200×630) — Zalo hay bỏ banner nếu file gốc quá nặng
  // hoặc URL bị resolve nhầm sang domain Vercel mặc định.
  const ogImage = temple.hero_image_url
    ? {
        url: `${origin}/api/social-image?t=${temple.id}`,
        width: 1200,
        height: 630,
        alt: temple.name,
      }
    : null;
  const fallbackImage = toAbsoluteMediaUrl(temple.hero_image_url, origin);

  return {
    metadataBase: new URL(origin),
    title,
    description,
    alternates: {
      canonical: origin,
    },
    openGraph: {
      type: 'website',
      locale: 'vi_VN',
      url: origin,
      siteName: temple.name,
      title: temple.name,
      description,
      images: ogImage
        ? [ogImage]
        : fallbackImage
          ? [{ url: fallbackImage, alt: temple.name }]
          : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: temple.name,
      description,
      images: ogImage
        ? [ogImage.url]
        : fallbackImage
          ? [fallbackImage]
          : undefined,
    },
  };
}

export default async function TenantLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const temple = await getCurrentTemple();

  if (!temple) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-mist px-6">
        <div className="text-center max-w-md">
          <p className="font-display text-3xl text-lacquer mb-3">
            Chưa kết nối website
          </p>
          <p className="text-muted">
            Tên miền hiện tại chưa được đăng ký trong hệ thống. Vui lòng liên
            hệ ban quản trị để kết nối.
          </p>
        </div>
      </div>
    );
  }

  const persona = getSitePersona(temple);

  if (isLyGiaPhucAnSite(temple)) {
    return (
      <SitePersonaProvider persona={persona}>
        <LyGiaShell temple={temple}>{children}</LyGiaShell>
      </SitePersonaProvider>
    );
  }

  const primary = temple.primary_color || '#7A1F1F';
  const simStore = isSimStoreEnabled(temple);

  return (
    <SitePersonaProvider persona={persona}>
      <div
        className="min-h-screen flex flex-col"
        style={
          {
            '--primary-color': primary,
            '--lacquer': primary,
          } as React.CSSProperties
        }
      >
        <TopNav temple={temple} />
        <div className="flex flex-1 flex-col pb-[calc(5.5rem+env(safe-area-inset-bottom,0px))] md:pb-[calc(7.25rem+env(safe-area-inset-bottom,0px))]">
          <div className="flex-1">{children}</div>
          <TempleFooter temple={temple} />
        </div>
        <ContactDock
          links={temple.contact_links}
          mapsUrl={temple.maps_url}
          primaryColor={primary}
          templeName={temple.name}
          templeId={temple.id}
        />
        <WaterMeritFloatingNudge
          primaryColor={primary}
          templeName={temple.name}
          templeId={temple.id}
        />
        <TemplePromoChips
          primaryColor={primary}
          templeName={temple.name}
          enableSim={simStore}
        />
        <WaterStickyBar
          primaryColor={primary}
          unitPrice={temple.water_price_vnd}
          templeName={temple.name}
        />
      </div>
    </SitePersonaProvider>
  );
}
