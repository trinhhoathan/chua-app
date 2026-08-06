import type { Metadata } from 'next';
import { getCurrentTemple } from '@/lib/tenant';
import { isSimStoreEnabled } from '@/lib/sim/warehouse';
import { HuongDanPage } from '@/components/huong-dan/HuongDanPage';

export const metadata: Metadata = {
  title: 'Hướng dẫn hệ thống cho trụ trì',
  robots: { index: false, follow: false },
};

export default async function HuongDanRoutePage() {
  const temple = await getCurrentTemple();
  if (!temple) return null;

  const abbott =
    [temple.abbott_title, temple.abbott_name].filter(Boolean).join(' ') ||
    'Trụ trì';
  const phone =
    temple.hotline?.trim() || temple.contact_links?.phone?.trim() || null;

  return (
    <HuongDanPage
      templeName={temple.name}
      abbottName={abbott}
      phone={phone}
      primaryColor={temple.primary_color || '#7A1F1F'}
      simEnabled={isSimStoreEnabled(temple)}
    />
  );
}
