'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useId, useMemo, useRef, useState } from 'react';
import type { Temple } from '@/types/database';
import { LY_GIA } from '@/lib/ly-gia-phuc-an';
import { LY_GIA_PRODUCTS } from '@/lib/ly-gia-products';
import {
  LY_GIA_SERVICES,
  lyGiaServiceHref,
} from '@/lib/ly-gia-services';
import { ContactDock } from '@/components/temple/ContactDock';
import { SimPromoChip } from '@/components/sim/SimPromoChip';
import {
  NAV_SECTION_LABELS,
  NAV_SECTION_MENU_LABELS,
  PHONG_THUY_NAV_ORDER,
  groupToolsByNavSection,
  phongThuyMenuTools,
  toolHref,
  type FengShuiToolMeta,
  type NavSection,
} from '@/lib/fengshui/tools';

const NAV_GIOI_THIEU = [
  { href: '/#gioi-thieu', label: 'Giới thiệu thầy' },
  { href: '/#nhan-su', label: 'Nhân sự' },
  { href: '/#danh-gia', label: 'Đánh giá' },
  { href: '/#lien-he', label: 'Liên hệ' },
] as const;

const NAV_TAIL = [
  { href: '#khoa-hoc', label: 'Khóa học' },
  { href: '/sim', label: 'Sim phong thủy' },
  { href: '#xem-nha', label: 'Xem nhà' },
] as const;

const FOOTER_COLS = [
  {
    title: 'Khám phá',
    links: [
      { href: '/#gioi-thieu', label: 'Giới thiệu thầy' },
      { href: '/#nhan-su', label: 'Nhân sự' },
      { href: '/#danh-gia', label: 'Đánh giá' },
      { href: '/#lien-he', label: 'Liên hệ' },
      { href: '#dich-vu', label: 'Dịch vụ phong thủy' },
      ...LY_GIA_PRODUCTS.map((p) => ({
        href: `/san-pham/${p.slug}`,
        label: p.shortTitle,
      })),
      { href: '#khoa-hoc', label: 'Khóa học' },
      { href: '/sim', label: 'Kho sim phong thủy' },
      { href: '#xem-nha', label: 'Xem nhà cửa' },
    ],
  },
  {
    title: 'Công cụ',
    links: [
      { href: '/phong-thuy', label: 'Phong thủy' },
      { href: '/phong-thuy/boi-sim', label: 'Bói sim theo Âm Dương Ngũ Hành' },
      { href: '/phong-thuy/lap-la-so-tu-vi', label: 'Lập lá số tử vi' },
      { href: '/phong-thuy/gieo-que-xin-xam', label: 'Gieo quẻ xin xăm' },
      { href: '/go-mo', label: 'Gõ mõ tụng kinh' },
    ],
  },
] as const;

type OpenMenu = 'gioithieu' | 'dichvu' | 'phongthuy' | null;
type MobileSection = 'gioithieu' | 'dichvu' | 'phongthuy' | null;

function NavLink({
  href,
  label,
  onClick,
  className,
}: {
  href: string;
  label: string;
  onClick?: () => void;
  className: string;
}) {
  if (href.startsWith('/')) {
    return (
      <Link href={href} className={className} onClick={onClick}>
        {label}
      </Link>
    );
  }
  return (
    <a href={href} className={className} onClick={onClick}>
      {label}
    </a>
  );
}

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="currentColor"
      className={`size-3.5 opacity-70 transition-transform ${open ? 'rotate-180' : ''}`}
      aria-hidden
    >
      <path
        fillRule="evenodd"
        d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.17l3.71-3.94a.75.75 0 1 1 1.08 1.04l-4.25 4.5a.75.75 0 0 1-1.08 0l-4.25-4.5a.75.75 0 0 1 .02-1.06Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function ToolLink({
  tool,
  onNavigate,
  muted,
}: {
  tool: FengShuiToolMeta;
  onNavigate: () => void;
  muted?: boolean;
}) {
  const soon = tool.status === 'coming_soon';
  return (
    <Link
      href={toolHref(tool)}
      role="menuitem"
      onClick={onNavigate}
      className={`group grid grid-cols-[minmax(0,1fr)_2rem] items-baseline gap-x-1 px-2 py-1.5 -mx-2 rounded-sm text-[0.8125rem] leading-snug ${
        muted
          ? 'text-white/55 hover:text-white/85 hover:bg-white/[0.05]'
          : 'text-white/78 hover:text-white hover:bg-white/[0.07]'
      }`}
    >
      <span className="min-w-0">{tool.title}</span>
      <span
        className={`justify-self-end text-[0.55rem] uppercase tracking-wide ${
          soon ? 'text-white/30' : 'invisible'
        }`}
      >
        Sắp
      </span>
    </Link>
  );
}

function NavSectionBlock({
  section,
  tools,
  accent,
  onNavigate,
  muted,
}: {
  section: NavSection;
  tools: FengShuiToolMeta[];
  accent: string;
  onNavigate: () => void;
  muted?: boolean;
}) {
  return (
    <div className={`min-w-0 flex flex-col ${muted ? 'opacity-90' : ''}`}>
      <p
        className="h-7 flex items-end text-[0.65rem] uppercase tracking-[0.16em] whitespace-nowrap truncate pb-1.5 mb-2 border-b border-white/10"
        style={{ color: muted ? 'rgba(255,255,255,0.45)' : accent }}
      >
        {NAV_SECTION_MENU_LABELS[section] ?? NAV_SECTION_LABELS[section]}
      </p>
      <ul className="space-y-0.5 flex-1">
        {tools.map((tool) => (
          <li key={tool.slug}>
            <ToolLink tool={tool} onNavigate={onNavigate} muted={muted} />
          </li>
        ))}
      </ul>
    </div>
  );
}

function IconPhone({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M6.62 10.79a15.15 15.15 0 0 0 6.59 6.59l2.2-2.2a1 1 0 0 1 1.01-.24c1.12.37 2.33.57 3.58.57a1 1 0 0 1 1 1V20a1 1 0 0 1-1 1C10.4 21 3 13.6 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.46.57 3.58a1 1 0 0 1-.25 1.02l-2.2 2.19Z" />
    </svg>
  );
}

function IconMail({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className} aria-hidden>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m4 7 8 6 8-6" />
    </svg>
  );
}

function IconPin({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M12 2a7 7 0 0 0-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 0 0-7-7Zm0 9.5A2.5 2.5 0 1 1 12 6a2.5 2.5 0 0 1 0 5.5Z" />
    </svg>
  );
}

function IconGlobe({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className={className} aria-hidden>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3c2.5 2.8 3.8 5.8 3.8 9S14.5 18.2 12 21c-2.5-2.8-3.8-5.8-3.8-9S9.5 5.8 12 3Z" />
    </svg>
  );
}

export function LyGiaShell({
  temple,
  children,
}: {
  temple: Temple;
  children: React.ReactNode;
}) {
  const primary = temple.primary_color || LY_GIA.primary;
  const phone = temple.hotline || LY_GIA.phone;
  const [scrolled, setScrolled] = useState(false);
  const [openMenu, setOpenMenu] = useState<OpenMenu>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileSection, setMobileSection] = useState<MobileSection>(null);
  const desktopMenusRef = useRef<HTMLDivElement>(null);
  const gioiThieuId = useId();
  const dichVuId = useId();
  const phongThuyId = useId();

  const phongThuyCount = useMemo(() => phongThuyMenuTools().length, []);
  const phongThuyGrouped = useMemo(
    () => groupToolsByNavSection(PHONG_THUY_NAV_ORDER),
    [],
  );

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!openMenu) return;
    function onDoc(e: MouseEvent) {
      if (!desktopMenusRef.current?.contains(e.target as Node)) {
        setOpenMenu(null);
      }
    }
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [openMenu]);

  const closeAll = () => {
    setOpenMenu(null);
    setMobileOpen(false);
    setMobileSection(null);
  };

  return (
    <div
      className="min-h-screen flex flex-col bg-paper text-ink"
      style={
        {
          '--primary-color': primary,
          '--lacquer': primary,
        } as React.CSSProperties
      }
    >
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-[background,box-shadow] duration-300 print:hidden ${
          scrolled
            ? 'bg-ink/95 backdrop-blur-md shadow-[0_8px_30px_-12px_rgba(0,0,0,0.45)]'
            : 'bg-ink/80 backdrop-blur-sm'
        }`}
      >
        <nav className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 px-4 md:h-16 md:px-6">
          <div className="flex items-center gap-2 min-w-0">
            <button
              type="button"
              className="lg:hidden inline-flex size-9 items-center justify-center text-white/90"
              aria-label={mobileOpen ? 'Đóng menu' : 'Mở menu'}
              aria-expanded={mobileOpen}
              onClick={() => {
                setOpenMenu(null);
                setMobileOpen((v) => !v);
              }}
            >
              <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.8">
                {mobileOpen ? <path d="M6 6l12 12M18 6 6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />}
              </svg>
            </button>
            <Link href="/" onClick={closeAll} className="flex items-center gap-2.5 min-w-0">
              <span className="relative size-9 md:size-10 shrink-0 overflow-hidden rounded-full ring-1 ring-white/25">
                <Image
                  src={LY_GIA.logo}
                  alt=""
                  width={40}
                  height={40}
                  className="size-full scale-[1.35] object-cover object-center"
                  priority
                  unoptimized
                />
              </span>
              <span className="font-display text-[0.95rem] md:text-base tracking-tight text-white truncate">
                {LY_GIA.name}
              </span>
            </Link>
          </div>

          <div ref={desktopMenusRef} className="hidden lg:flex flex-1 items-center justify-end gap-0.5 text-[0.8125rem] text-white/80">
            <div className="relative">
              <button
                type="button"
                aria-expanded={openMenu === 'gioithieu'}
                aria-controls={gioiThieuId}
                onClick={() =>
                  setOpenMenu((m) => (m === 'gioithieu' ? null : 'gioithieu'))
                }
                className={`inline-flex items-center gap-1 px-2.5 py-1.5 transition-colors whitespace-nowrap ${
                  openMenu === 'gioithieu' ? 'text-white' : 'hover:text-white'
                }`}
              >
                Giới thiệu
                <Chevron open={openMenu === 'gioithieu'} />
              </button>
              {openMenu === 'gioithieu' ? (
                <div
                  id={gioiThieuId}
                  role="menu"
                  className="absolute left-0 top-full z-50 mt-1 w-52 bg-ink/98 backdrop-blur-xl border border-white/12 shadow-[0_20px_50px_-16px_rgba(0,0,0,0.85)]"
                >
                  <ul className="py-2">
                    {NAV_GIOI_THIEU.map((item) => (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          role="menuitem"
                          onClick={() => setOpenMenu(null)}
                          className="block px-4 py-2.5 text-sm text-white/85 hover:bg-white/[0.07] hover:text-white"
                        >
                          {item.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>

            <div className="relative">
              <button
                type="button"
                aria-expanded={openMenu === 'dichvu'}
                aria-controls={dichVuId}
                onClick={() =>
                  setOpenMenu((m) => (m === 'dichvu' ? null : 'dichvu'))
                }
                className={`inline-flex items-center gap-1 px-2.5 py-1.5 transition-colors whitespace-nowrap ${
                  openMenu === 'dichvu' ? 'text-white' : 'hover:text-white'
                }`}
              >
                Dịch vụ
                <Chevron open={openMenu === 'dichvu'} />
              </button>
              {openMenu === 'dichvu' ? (
                <div
                  id={dichVuId}
                  role="menu"
                  className="fixed left-1/2 -translate-x-1/2 top-14 z-50 w-[min(52rem,calc(100vw-1.5rem))] max-h-[min(78vh,40rem)] overflow-y-auto bg-ink/98 backdrop-blur-xl border border-white/12 shadow-[0_28px_80px_-20px_rgba(0,0,0,0.85)]"
                >
                  <div className="px-6 py-4 border-b border-white/10 flex flex-wrap items-end justify-between gap-3 sticky top-0 bg-ink/95 backdrop-blur-md z-10">
                    <div>
                      <p className="font-display text-lg text-white">Dịch vụ chuyên sâu</p>
                      <p className="mt-0.5 text-xs text-white/45">
                        {LY_GIA_SERVICES.length} dịch vụ · {LY_GIA_PRODUCTS.length} dịch vụ số
                      </p>
                    </div>
                    <Link
                      href="/#dich-vu"
                      onClick={() => setOpenMenu(null)}
                      className="text-xs text-white/70 hover:text-white underline underline-offset-4"
                    >
                      Xem toàn bộ trên trang chủ →
                    </Link>
                  </div>
                  <div className="px-6 py-5 grid gap-8 md:grid-cols-[1.4fr_1fr]">
                    <div>
                      <p
                        className="text-[0.65rem] uppercase tracking-[0.16em] pb-1.5 mb-2 border-b border-white/10"
                        style={{ color: primary }}
                      >
                        Phong thủy · nhà cửa · vận mệnh
                      </p>
                      <ul className="grid gap-y-0.5 gap-x-10 sm:grid-cols-2">
                        {LY_GIA_SERVICES.map((s) => (
                          <li key={s.slug}>
                            <Link
                              href={lyGiaServiceHref(s)}
                              role="menuitem"
                              onClick={() => setOpenMenu(null)}
                              className="block px-2 py-1.5 -mx-2 rounded-sm text-[0.8125rem] leading-snug text-white/78 hover:text-white hover:bg-white/[0.07]"
                            >
                              {s.title}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p
                        className="text-[0.65rem] uppercase tracking-[0.16em] pb-1.5 mb-2 border-b border-white/10"
                        style={{ color: primary }}
                      >
                        Dịch vụ số · Trấn số
                      </p>
                      <ul className="space-y-0.5">
                        {LY_GIA_PRODUCTS.map((p) => (
                          <li key={p.slug}>
                            <Link
                              href={`/san-pham/${p.slug}`}
                              role="menuitem"
                              onClick={() => setOpenMenu(null)}
                              className="block px-2 py-2 -mx-2 rounded-sm hover:bg-white/[0.07]"
                            >
                              <span className="block text-[0.8125rem] text-white/90">
                                {p.title}
                              </span>
                              <span className="mt-0.5 block text-[0.7rem] text-white/40 line-clamp-1">
                                {p.tagline}
                              </span>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>

            {NAV_TAIL.map((item) => (
              <NavLink
                key={item.href}
                href={item.href}
                label={item.label}
                className="px-2.5 py-1.5 hover:text-white transition-colors whitespace-nowrap"
              />
            ))}

            <div className="relative">
              <button
                type="button"
                aria-expanded={openMenu === 'phongthuy'}
                aria-controls={phongThuyId}
                onClick={() =>
                  setOpenMenu((m) => (m === 'phongthuy' ? null : 'phongthuy'))
                }
                className={`inline-flex items-center gap-1 px-2.5 py-1.5 transition-colors whitespace-nowrap ${
                  openMenu === 'phongthuy' ? 'text-white' : 'hover:text-white'
                }`}
              >
                Phong thủy
                <Chevron open={openMenu === 'phongthuy'} />
              </button>
              {openMenu === 'phongthuy' ? (
                <div
                  id={phongThuyId}
                  role="menu"
                  className="fixed left-1/2 -translate-x-1/2 top-14 z-50 w-[min(64rem,calc(100vw-1.5rem))] max-h-[min(78vh,40rem)] overflow-y-auto bg-ink/98 backdrop-blur-xl border border-white/12 shadow-[0_28px_80px_-20px_rgba(0,0,0,0.85)]"
                >
                  <div className="px-6 py-4 border-b border-white/10 flex flex-wrap items-end justify-between gap-3 sticky top-0 bg-ink/95 backdrop-blur-md z-10">
                    <div>
                      <p className="font-display text-lg text-white">Công cụ Phong thủy</p>
                      <p className="mt-0.5 text-xs text-white/45">
                        {phongThuyCount} mục · Mỗi ngày · Hệ trọng · Tử vi
                      </p>
                    </div>
                    <Link
                      href="/phong-thuy"
                      onClick={() => setOpenMenu(null)}
                      className="text-xs text-white/70 hover:text-white underline underline-offset-4"
                    >
                      Mở trang đầy đủ →
                    </Link>
                  </div>
                  <div className="px-6 py-5 grid grid-cols-2 lg:grid-cols-5 gap-x-6 gap-y-6">
                    {phongThuyGrouped.map(({ section, tools }) => (
                      <NavSectionBlock
                        key={section}
                        section={section}
                        tools={tools}
                        accent={primary}
                        onNavigate={() => setOpenMenu(null)}
                        muted={section === 'tham_khao'}
                      />
                    ))}
                  </div>
                </div>
              ) : null}
            </div>

            <a
              href={`tel:${phone}`}
              className="ml-2 inline-flex items-center gap-1.5 h-8 rounded-full pl-2.5 pr-3 text-[0.78rem] font-medium text-white"
              style={{ backgroundColor: primary }}
            >
              <IconPhone className="size-3.5" />
              {LY_GIA.phoneDisplay}
            </a>
          </div>
        </nav>

        {openMenu ? (
          <button
            type="button"
            aria-label="Đóng menu"
            className="hidden lg:block fixed inset-0 z-30 bg-ink/40"
            onClick={() => setOpenMenu(null)}
          />
        ) : null}

        {mobileOpen ? (
          <div className="lg:hidden border-t border-white/10 bg-ink/98 max-h-[min(80vh,36rem)] overflow-y-auto px-4 py-3">
            <div className="flex flex-col gap-0.5">
              <button
                type="button"
                className="flex items-center justify-between rounded-lg px-3 py-2.5 text-sm text-white/85 hover:bg-white/5"
                onClick={() =>
                  setMobileSection((s) =>
                    s === 'gioithieu' ? null : 'gioithieu',
                  )
                }
              >
                Giới thiệu
                <Chevron open={mobileSection === 'gioithieu'} />
              </button>
              {mobileSection === 'gioithieu' ? (
                <div className="ml-2 mb-2 space-y-1 border-l border-white/10 pl-3">
                  {NAV_GIOI_THIEU.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={closeAll}
                      className="block py-1.5 text-sm text-white/70"
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              ) : null}
              <button
                type="button"
                className="flex items-center justify-between rounded-lg px-3 py-2.5 text-sm text-white/85 hover:bg-white/5"
                onClick={() =>
                  setMobileSection((s) => (s === 'dichvu' ? null : 'dichvu'))
                }
              >
                Dịch vụ
                <Chevron open={mobileSection === 'dichvu'} />
              </button>
              {mobileSection === 'dichvu' ? (
                <div className="ml-2 mb-2 space-y-1 border-l border-white/10 pl-3">
                  <Link
                    href="/#dich-vu"
                    onClick={closeAll}
                    className="block py-1.5 text-xs text-gilt"
                  >
                    Tất cả dịch vụ →
                  </Link>
                  <p className="pt-1 text-[0.65rem] uppercase tracking-[0.14em] text-white/35">
                    Chuyên sâu
                  </p>
                  {LY_GIA_SERVICES.map((s) => (
                    <Link
                      key={s.slug}
                      href={lyGiaServiceHref(s)}
                      onClick={closeAll}
                      className="block py-1.5 text-sm text-white/70"
                    >
                      {s.title}
                    </Link>
                  ))}
                  <p className="pt-2 text-[0.65rem] uppercase tracking-[0.14em] text-white/35">
                    Dịch vụ số
                  </p>
                  {LY_GIA_PRODUCTS.map((p) => (
                    <Link
                      key={p.slug}
                      href={`/san-pham/${p.slug}`}
                      onClick={closeAll}
                      className="block py-1.5 text-sm text-white/70"
                    >
                      {p.shortTitle}
                    </Link>
                  ))}
                </div>
              ) : null}
              {NAV_TAIL.map((item) => (
                <NavLink
                  key={item.href}
                  href={item.href}
                  label={item.label}
                  onClick={closeAll}
                  className="rounded-lg px-3 py-2.5 text-sm text-white/85 hover:bg-white/5"
                />
              ))}
              <button
                type="button"
                className="flex items-center justify-between rounded-lg px-3 py-2.5 text-sm text-white/85 hover:bg-white/5"
                onClick={() =>
                  setMobileSection((s) => (s === 'phongthuy' ? null : 'phongthuy'))
                }
              >
                Phong thủy
                <Chevron open={mobileSection === 'phongthuy'} />
              </button>
              {mobileSection === 'phongthuy' ? (
                <div className="ml-2 mb-2 space-y-1 border-l border-white/10 pl-3">
                  <Link href="/phong-thuy" onClick={closeAll} className="block py-1.5 text-xs text-gilt">
                    Tất cả công cụ ({phongThuyCount}) →
                  </Link>
                  {phongThuyGrouped.map(({ section, tools }) => (
                    <div key={section} className="pt-1">
                      <p className="pt-1 text-[0.65rem] uppercase tracking-[0.14em] text-white/35">
                        {NAV_SECTION_MENU_LABELS[section] ?? NAV_SECTION_LABELS[section]}
                      </p>
                      {tools.map((t) => (
                        <Link
                          key={t.slug}
                          href={toolHref(t)}
                          onClick={closeAll}
                          className={`block py-1.5 text-sm ${
                            section === 'tham_khao' ? 'text-white/50' : 'text-white/70'
                          }`}
                        >
                          {t.title}
                          {t.status === 'coming_soon' ? (
                            <span className="ml-1.5 text-[0.55rem] uppercase tracking-wide text-white/30">
                              Sắp
                            </span>
                          ) : null}
                        </Link>
                      ))}
                    </div>
                  ))}
                </div>
              ) : null}
              <a
                href={LY_GIA.zaloUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-flex items-center justify-center rounded-full px-4 py-2.5 text-sm font-medium text-white"
                style={{ backgroundColor: primary }}
                onClick={closeAll}
              >
                Nhắn Zalo tư vấn
              </a>
            </div>
          </div>
        ) : null}
      </header>

      <div className="flex-1">{children}</div>

      <footer id="lien-he" className="bg-ink text-white scroll-mt-20 print:hidden">
        <div className="mx-auto max-w-6xl px-4 py-14 md:px-6 md:py-16">
          <div className="grid gap-10 lg:grid-cols-[1.3fr_1fr_1fr_1.1fr]">
            <div>
              <div className="flex items-center gap-3">
                <span className="relative size-12 shrink-0 overflow-hidden rounded-full ring-1 ring-white/20">
                  <Image
                    src={LY_GIA.logo}
                    alt={LY_GIA.name}
                    width={52}
                    height={52}
                    className="size-full scale-[1.35] object-cover object-center"
                    unoptimized
                  />
                </span>
                <div>
                  <p className="font-display text-xl text-white">{LY_GIA.name}</p>
                </div>
              </div>
              <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/55">
                Kiến tạo vận mệnh & không gian. Văn phòng tư vấn phong thủy tại Hà Nội —
                đón tiếp theo lịch hẹn.
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                <a
                  href={LY_GIA.zaloUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-9 items-center rounded-full bg-[#0068FF] px-4 text-xs font-medium text-white"
                >
                  Zalo
                </a>
                <a
                  href={`tel:${phone}`}
                  className="inline-flex h-9 items-center rounded-full px-4 text-xs font-medium text-white"
                  style={{ backgroundColor: primary }}
                >
                  Gọi {LY_GIA.phoneDisplay}
                </a>
              </div>
            </div>

            {FOOTER_COLS.map((col) => (
              <div key={col.title}>
                <p className="text-[0.68rem] uppercase tracking-[0.2em] text-gilt">
                  {col.title}
                </p>
                <ul className="mt-4 space-y-2.5">
                  {col.links.map((l) => (
                    <li key={l.href}>
                      <a
                        href={l.href}
                        className="text-sm text-white/60 hover:text-white transition-colors"
                      >
                        {l.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            <div>
              <p className="text-[0.68rem] uppercase tracking-[0.2em] text-gilt">
                Liên hệ
              </p>
              <ul className="mt-4 space-y-3.5 text-sm">
                <li>
                  <a
                    href={LY_GIA.mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex gap-3 text-white/65 hover:text-white"
                  >
                    <IconPin className="mt-0.5 size-4 shrink-0 text-gilt" />
                    <span>{temple.address || LY_GIA.address}</span>
                  </a>
                </li>
                <li>
                  <a href={`tel:${phone}`} className="flex gap-3 text-white/65 hover:text-white">
                    <IconPhone className="mt-0.5 size-4 shrink-0 text-gilt" />
                    <span>{LY_GIA.phoneDisplay}</span>
                  </a>
                </li>
                <li>
                  <a href={`mailto:${LY_GIA.email}`} className="flex gap-3 text-white/65 hover:text-white">
                    <IconMail className="mt-0.5 size-4 shrink-0 text-gilt" />
                    <span>{LY_GIA.email}</span>
                  </a>
                </li>
                <li>
                  <a
                    href={`https://${LY_GIA.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex gap-3 text-white/65 hover:text-white"
                  >
                    <IconGlobe className="mt-0.5 size-4 shrink-0 text-gilt" />
                    <span>{LY_GIA.website}</span>
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-12 flex flex-col gap-3 border-t border-white/10 pt-6 text-xs text-white/40 md:flex-row md:items-center md:justify-between">
            <p>© {new Date().getFullYear()} {LY_GIA.name}. Bảo lưu mọi quyền.</p>
            <div className="flex flex-wrap gap-4">
              <a href="/quan-tri" className="hover:text-white/70">Quản trị</a>
              <a href="/phong-thuy" className="hover:text-white/70">Phong thủy</a>
            </div>
          </div>
        </div>
      </footer>

      <div className="print:hidden">
        <SimPromoChip primaryColor={primary} />

        <ContactDock
          links={{
            ...temple.contact_links,
            phone: temple.contact_links?.phone || phone,
            zalo: temple.contact_links?.zalo || LY_GIA.zaloUrl,
          }}
          mapsUrl={temple.maps_url || LY_GIA.mapsUrl}
          primaryColor={primary}
          templeName={temple.name}
          templeId={temple.id}
        />
      </div>
    </div>
  );
}
