import Link from 'next/link';
import { HuongDanToc } from './HuongDanToc';
import { HuongDanBody } from './HuongDanBody';

export type HuongDanPageProps = {
  templeName: string;
  abbottName: string;
  phone: string | null;
  primaryColor: string;
  simEnabled: boolean;
};

export function HuongDanPage({
  templeName,
  abbottName,
  phone,
  primaryColor,
  simEnabled,
}: HuongDanPageProps) {
  return (
    <main className="relative pt-14 pb-16 md:pb-24">
      {/* Atmosphere — không flat đơn sắc */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[min(70vh,36rem)] opacity-90"
        style={{
          background: `
            radial-gradient(ellipse 80% 60% at 15% 0%, ${primaryColor}18, transparent 55%),
            radial-gradient(ellipse 60% 50% at 90% 10%, #b08d4222, transparent 50%),
            linear-gradient(180deg, #e7ece8 0%, var(--paper) 70%)
          `,
        }}
      />

      <div className="relative mx-auto max-w-6xl px-5 md:px-8">
        <header className="max-w-3xl pt-10 pb-10 md:pt-14 md:pb-14">
          <p className="text-[0.7rem] uppercase tracking-[0.18em] text-gilt">
            Công ty CP Tập đoàn Quan Âm Trang Viện
          </p>
          <h1 className="mt-3 font-display text-3xl md:text-5xl text-ink tracking-tight leading-[1.15]">
            Hệ thống công cụ tâm linh cho trụ trì
          </h1>
          <p className="mt-4 max-w-xl text-base md:text-lg text-muted leading-relaxed">
            Đơn vị tiên phong kiến tạo hệ sinh thái công cụ tâm linh số — giúp
            thầy hành thiện nhanh hơn, kết duyên Phật tử sâu hơn, lan tỏa đạo
            pháp xa hơn.
          </p>
          <p className="mt-3 text-sm text-muted">
            Đang xem trên <span className="text-ink font-medium">{templeName}</span>
            {abbottName ? (
              <>
                {' '}
                · {abbottName}
              </>
            ) : null}
            . Trang hướng dẫn nội bộ — không hiện trên menu trang chủ.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href="#tap-doan"
              className="inline-flex px-5 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
              style={{ backgroundColor: primaryColor }}
            >
              Khám phá hệ thống
            </a>
            <Link
              href="/quan-tri"
              className="inline-flex px-5 py-2.5 text-sm font-medium border border-fog text-ink hover:bg-mist/80"
            >
              Vào quản trị
            </Link>
          </div>
        </header>

        <div className="grid gap-10 lg:grid-cols-[14rem_minmax(0,1fr)] lg:gap-14">
          <HuongDanToc />
          <HuongDanBody
            templeName={templeName}
            abbottName={abbottName}
            phone={phone}
            simEnabled={simEnabled}
          />
        </div>
      </div>
    </main>
  );
}
