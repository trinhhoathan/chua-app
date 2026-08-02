'use client';

import type { WaterBottleBrand } from '@/lib/water-bottle-brand';

/**
 * Trang xem nhãn chai — bản đầu: ảnh mockup sản phẩm làm trọng tâm.
 */

interface Props {
  brand: WaterBottleBrand;
  templeName: string;
}

export function WaterBottleLabelMockup({ brand, templeName }: Props) {
  return (
    <div className="space-y-10">
      <header className="max-w-2xl">
        <p
          className="text-[0.7rem] tracking-[0.28em] uppercase"
          style={{ color: brand.color }}
        >
          Bản thử nhãn · 300ml
        </p>
        <h1 className="mt-2 font-display text-3xl md:text-4xl text-ink">
          Chai nước suối — {templeName}
        </h1>
        <p className="mt-3 text-sm text-muted leading-relaxed">
          Thiết kế thử: logo thương hiệu, slogan, địa chỉ, tên & điện thoại trụ
          trì, mã QR mở website {brand.domainLabel}.
        </p>
      </header>

      <figure className="border border-fog bg-mist/40 p-4 md:p-5">
        <p className="mb-3 text-[0.7rem] tracking-[0.22em] uppercase text-muted">
          Ảnh mockup sản phẩm
        </p>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={brand.mockupSrc}
          alt={`Mockup chai nước 300ml ${templeName}`}
          className="mx-auto max-h-[40rem] w-auto max-w-full object-contain"
        />
      </figure>
    </div>
  );
}
