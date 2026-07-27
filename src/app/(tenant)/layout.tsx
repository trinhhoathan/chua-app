import type { Metadata } from 'next';
import { getCurrentTemple } from '@/lib/tenant';
import { getCompanyBankAccount } from '@/lib/payment';
import { TopNav } from '@/components/temple/TopNav';
import { TempleFooter } from '@/components/temple/TempleFooter';
import { WaterStickyBar } from '@/components/water/WaterStickyBar';

export async function generateMetadata(): Promise<Metadata> {
  const temple = await getCurrentTemple();
  if (!temple) {
    return {
      title: 'Chưa kết nối website',
    };
  }
  const alt = temple.temple_alt_name ? ` | ${temple.temple_alt_name}` : '';
  return {
    title: `${temple.name}${alt}`,
    description: temple.slogan ?? temple.history_summary ?? undefined,
    openGraph: temple.hero_image_url
      ? {
          title: temple.name,
          description: temple.slogan ?? undefined,
          images: [{ url: temple.hero_image_url }],
        }
      : undefined,
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

  const primary = temple.primary_color || '#7A1F1F';

  return (
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
      <div className="flex-1 pb-24">{children}</div>
      <TempleFooter temple={temple} />
      <WaterStickyBar
        primaryColor={primary}
        unitPrice={temple.water_price_vnd}
        templeName={temple.name}
        paymentCode={temple.payment_code ?? 'XX'}
        bank={getCompanyBankAccount()}
        profitSharePct={temple.water_profit_share_pct}
      />
    </div>
  );
}
