import Link from 'next/link';
import type { Temple } from '@/types/database';

interface Props {
  temple: Temple;
}

const LINKS = [
  { href: '/#gioi-thieu', label: 'Giới thiệu' },
  { href: '/#lich-su', label: 'Lịch sử' },
  { href: '/#di-tich', label: 'Di tích' },
  { href: '/#tru-tri', label: 'Trụ trì' },
  { href: '/#thu-vien-anh', label: 'Hình ảnh' },
  { href: '/#danh-gia', label: 'Đánh giá' },
  { href: '/#dong-nuoc', label: 'Cúng dường' },
  { href: '/phong-thuy', label: 'Phong thủy' },
] as const;

function hotlineHref(phone: string): string {
  return `tel:${phone.replace(/\s+/g, '')}`;
}

function HotlineLink({
  phone,
  primary,
}: {
  phone: string;
  primary: string;
}) {
  return (
    <a
      href={hotlineHref(phone)}
      className="shrink-0 inline-flex items-center gap-1.5 h-8 pl-2.5 pr-3 rounded-full text-[0.8rem] leading-none text-white ring-1 ring-white/35 hover:brightness-110 transition-[filter]"
      style={{ backgroundColor: primary }}
      aria-label={`Gọi hotline ${phone}`}
    >
      <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        className="size-3.5 opacity-90"
        aria-hidden
      >
        <path d="M6.62 10.79a15.15 15.15 0 0 0 6.59 6.59l2.2-2.2a1 1 0 0 1 1.01-.24c1.12.37 2.33.57 3.58.57a1 1 0 0 1 1 1V20a1 1 0 0 1-1 1C10.4 21 3 13.6 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.46.57 3.58a1 1 0 0 1-.25 1.02l-2.2 2.19Z" />
      </svg>
      <span className="font-medium tracking-wide tabular-nums">{phone}</span>
    </a>
  );
}

export function TopNav({ temple }: Props) {
  const primary = temple.primary_color || '#7A1F1F';
  const hotline =
    temple.hotline?.trim() || temple.contact_links?.phone?.trim() || null;

  return (
    <nav className="fixed top-0 inset-x-0 z-40 bg-ink/25 backdrop-blur-md border-b border-white/10">
      <div className="mx-auto max-w-6xl px-4 md:px-8 h-14 flex items-center justify-between gap-3">
        <Link href="/" className="flex items-center gap-2 text-white shrink-0 min-w-0">
          <span className="font-display text-base tracking-tight truncate">
            {temple.name}
          </span>
        </Link>

        <div className="hidden lg:flex flex-1 items-center justify-end gap-5 min-w-0">
          <div className="flex items-center gap-5 text-sm text-white/80 overflow-x-auto no-scrollbar">
            {LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="hover:text-white transition-colors whitespace-nowrap"
              >
                {l.label}
              </Link>
            ))}
          </div>
          {hotline ? <HotlineLink phone={hotline} primary={primary} /> : null}
        </div>

        <div className="flex lg:hidden items-center gap-2 shrink-0">
          <Link
            href="/#dong-nuoc"
            className="text-sm text-white px-3 py-1.5 ring-1 ring-white/30"
            style={{ backgroundColor: primary }}
          >
            Thỉnh nước
          </Link>
          {hotline ? <HotlineLink phone={hotline} primary={primary} /> : null}
        </div>
      </div>
    </nav>
  );
}
