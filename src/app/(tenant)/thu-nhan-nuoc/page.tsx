import Link from 'next/link';
import { getCurrentTemple } from '@/lib/tenant';
import { getWaterBottleBrand } from '@/lib/water-bottle-brand';
import { WaterBottleLabelMockup } from '@/components/water/WaterBottleLabelMockup';
import { OpenWaterDonateButton } from '@/components/water/OpenWaterDonateButton';

/** Trang xem thử nhãn chai 300ml — mockup + ý nghĩa (bản đầu). */
export default async function ThuNhanNuocPage() {
  const temple = await getCurrentTemple();
  if (!temple) return null;

  const brand = getWaterBottleBrand(temple);
  const primary = temple.primary_color || brand?.color || '#7A1F1F';

  if (!brand) {
    return (
      <main className="pt-14 pb-28">
        <div className="mx-auto max-w-xl px-5 py-16 text-center">
          <h1 className="font-display text-3xl text-ink">Nhãn nước tinh khiết</h1>
          <p className="mt-4 text-muted leading-relaxed">
            {temple.name} chưa có bản thiết kế chai nước công bố trên website.
          </p>
          <Link
            href="/dat-nuoc"
            className="mt-8 inline-flex px-6 py-3 text-sm font-medium text-white"
            style={{ backgroundColor: primary }}
          >
            Phát tâm thỉnh nước
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="pt-14 pb-28">
      <div className="mx-auto max-w-5xl px-5 py-10 md:px-8 md:py-14">
        <WaterBottleLabelMockup brand={brand} templeName={temple.name} />

        <div className="mt-12 max-w-2xl border-t border-fog pt-8">
          <h2 className="font-display text-2xl text-ink">
            Ý nghĩa khi thỉnh nước mang nhãn chùa
          </h2>
          <ul className="mt-4 space-y-3 text-sm text-muted leading-relaxed">
            <li>
              · <span className="text-ink font-medium">Ủng hộ chùa</span> — trợ
              duyên Phật sự, đèn nước và hoạt động thường nhật.
            </li>
            <li>
              · <span className="text-ink font-medium">Từ thiện & lan tỏa</span>{' '}
              — nước mang thương hiệu {temple.name}, phát cho Phật tử về lễ.
            </li>
            <li>
              · <span className="text-ink font-medium">Bùa chú nguyện lành</span>{' '}
              — {brand.abbottHonorific} trì chú, gửi tâm nguyện thiện lành vào
              nước.
            </li>
          </ul>
          <div className="mt-6 flex flex-wrap gap-3">
            <OpenWaterDonateButton
              className="inline-flex px-5 py-2.5 text-sm font-medium text-white"
              style={{ backgroundColor: primary }}
            >
              Phát tâm thỉnh nước
            </OpenWaterDonateButton>
            <Link
              href="/dat-nuoc"
              className="inline-flex px-5 py-2.5 text-sm font-medium border border-fog text-ink hover:bg-mist"
            >
              Tìm hiểu công đức nước
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
