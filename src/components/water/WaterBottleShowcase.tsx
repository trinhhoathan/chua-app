import Link from 'next/link';
import type { Temple } from '@/types/database';
import { getWaterBottleBrand } from '@/lib/water-bottle-brand';
import { OpenWaterDonateButton } from '@/components/water/OpenWaterDonateButton';

interface Props {
  temple: Temple;
  /** homepage = kèm chuyện công đức; purchase = nhấn thỉnh nước ngay */
  variant?: 'home' | 'purchase';
}

/**
 * Khối giới thiệu chai nước mang nhãn chùa — mockup + ý nghĩa công đức.
 * Chỉ hiện khi chùa có brand trong registry.
 */
export function WaterBottleShowcase({
  temple,
  variant = 'home',
}: Props) {
  const brand = getWaterBottleBrand(temple);
  if (!brand) return null;

  const primary = temple.primary_color || brand.color;

  return (
    <div className={variant === 'purchase' ? 'mt-4 mb-12' : 'mt-14 mb-12'}>
      <div className="grid gap-8 md:grid-cols-[minmax(0,15rem)_1fr] md:items-center">
        <figure className="mx-auto flex h-[22rem] w-full max-w-[14.5rem] items-center justify-center overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={brand.mockupSrc}
            alt={`Chai nước tinh khiết 300ml — ${temple.name}`}
            className="h-full w-auto max-w-full object-contain"
            style={
              brand.mockupScale && brand.mockupScale !== 1
                ? { transform: `scale(${brand.mockupScale})` }
                : undefined
            }
          />
        </figure>

        <div>
          <p
            className="text-[0.7rem] tracking-[0.28em] uppercase"
            style={{ color: primary }}
          >
            Nước mang nhãn {temple.temple_alt_name || temple.name}
          </p>
          <h3 className="mt-2 font-display text-2xl md:text-3xl text-ink leading-tight">
            Thỉnh nước — ủng hộ chùa, gieo duyên lành
          </h3>
          <p className="mt-3 text-sm md:text-[0.95rem] text-muted leading-relaxed">
            Mỗi thùng nước mang thương hiệu {temple.name} là công đức tùy hỷ:
            trợ duyên Phật sự, tiếp đãi thập phương, và được{' '}
            {brand.abbottHonorific} trì chú, phát tâm nguyện thiện lành vào nước
            trước khi dâng lên / phát cho Phật tử.
          </p>

          <ul className="mt-5 space-y-3 text-sm text-muted">
            <Pillar
              primary={primary}
              title="Ủng hộ chốn Già-lam"
              body="Phần phát tâm giúp duy trì đèn nước, Phật sự và hoạt động thường nhật của chùa."
            />
            <Pillar
              primary={primary}
              title="Từ thiện & lan tỏa"
              body="Nước mang nhãn chùa — quảng bá hình ảnh ngôi chùa, đồng thời phát miễn phí cho người về lễ."
            />
            <Pillar
              primary={primary}
              title="Bùa chú · nguyện lành"
              body={`Sư phụ tại chùa trì chú, gửi tâm nguyện bình an, cát tường vào từng chai nước tinh khiết.`}
            />
          </ul>

          <div className="mt-6 flex flex-wrap gap-3">
            <OpenWaterDonateButton
              className="inline-flex items-center justify-center px-5 py-2.5 text-sm font-medium text-white"
              style={{ backgroundColor: primary }}
            >
              Chọn số thùng · phát tâm
            </OpenWaterDonateButton>
            <Link
              href="/thu-nhan-nuoc"
              className="inline-flex items-center justify-center px-5 py-2.5 text-sm font-medium border border-fog text-ink hover:bg-mist"
            >
              Xem thiết kế chai nước
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function Pillar({
  primary,
  title,
  body,
}: {
  primary: string;
  title: string;
  body: string;
}) {
  return (
    <li className="flex gap-3">
      <span
        className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full"
        style={{ backgroundColor: primary }}
        aria-hidden
      />
      <p>
        <span className="text-ink font-medium">{title}. </span>
        {body}
      </p>
    </li>
  );
}
