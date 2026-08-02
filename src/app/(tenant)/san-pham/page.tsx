import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getCurrentTemple } from '@/lib/tenant';
import { isLyGiaPhucAnSite, LY_GIA } from '@/lib/ly-gia-phuc-an';
import { LY_GIA_PRODUCTS } from '@/lib/ly-gia-products';

export const metadata: Metadata = {
  title: 'Sản phẩm & dịch vụ số phong thủy | Lý Gia Phúc An',
  description:
    'Trấn biển số xe, trấn số nhà, số tài khoản thủ tài và Sim Linh Số Thượng Lưu — thầy Lý Gia Phúc An luận theo nguyên lý Âm Dương Ngũ Hành, Kinh dịch diệu luận.',
};

export default async function SanPhamIndexPage() {
  const temple = await getCurrentTemple();
  if (!temple || !isLyGiaPhucAnSite(temple)) notFound();

  const primary = temple.primary_color || LY_GIA.primary;

  return (
    <main className="pt-20 pb-24 md:pt-24">
      <section className="bg-ink text-white">
        <div className="mx-auto max-w-6xl px-4 py-10 md:px-6 md:py-14">
          <p className="text-[0.72rem] uppercase tracking-[0.3em] text-gilt">
            Sản phẩm · Dịch vụ số
          </p>
          <h1 className="mt-2 font-display text-3xl leading-tight md:text-4xl">
            Trấn số · Sim Linh Số Thượng Lưu
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/65">
            Biển xe, số nhà, tài khoản ngân hàng và sim điện thoại — thầy luận theo
            nguyên lý Âm Dương Ngũ Hành, Kinh dịch diệu luận và Bát Tự, không chọn số đẹp đại trà.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <ul className="mt-8 grid gap-4 sm:grid-cols-2">
          {LY_GIA_PRODUCTS.map((p) => (
            <li key={p.slug}>
              <Link
                href={`/san-pham/${p.slug}`}
                className="group flex h-full flex-col overflow-hidden border border-fog bg-paper transition-shadow hover:shadow-[0_14px_40px_-18px_rgba(0,0,0,0.3)]"
              >
                <div className="relative aspect-[16/9] overflow-hidden bg-mist">
                  <Image
                    src={p.image}
                    alt={p.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                    sizes="(max-width:768px) 100vw, 50vw"
                  />
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <p
                    className="text-[0.65rem] uppercase tracking-[0.2em]"
                    style={{ color: primary }}
                  >
                    {p.shortTitle}
                  </p>
                  <h2 className="mt-1 font-display text-xl text-ink group-hover:text-lacquer">
                    {p.title}
                  </h2>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">
                    {p.tagline}
                  </p>
                  <span
                    className="mt-4 inline-block text-xs font-semibold"
                    style={{ color: primary }}
                  >
                    Xem chi tiết →
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>

        <div
          className="mt-12 flex flex-col items-center gap-4 px-6 py-10 text-center text-white md:flex-row md:justify-between md:text-left"
          style={{ backgroundColor: primary }}
        >
          <div>
            <p className="font-display text-2xl">Cần thầy tư vấn trực tiếp?</p>
            <p className="mt-1 text-sm text-white/80">
              Nhắn Zalo ngày giờ sinh và loại số cần luận — phản hồi trong ngày.
            </p>
          </div>
          <a
            href={LY_GIA.zaloUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 bg-white px-6 py-3 text-sm font-semibold"
            style={{ color: primary }}
          >
            Nhắn Zalo {LY_GIA.phoneDisplay}
          </a>
        </div>
      </div>
    </main>
  );
}
