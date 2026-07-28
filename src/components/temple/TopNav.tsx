'use client';

import { useEffect, useId, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import type { Temple } from '@/types/database';
import {
  NAV_SECTION_LABELS,
  NAV_SECTION_MENU_LABELS,
  PHAT_HOC_NAV_ORDER,
  PHONG_THUY_NAV_ORDER,
  groupToolsByNavSection,
  phongThuyMenuTools,
  toolHref,
  toolsByDomain,
  type FengShuiToolMeta,
  type NavSection,
} from '@/lib/fengshui/tools';

interface Props {
  temple: Temple;
}

const PRIMARY = [
  { href: '/#gioi-thieu', label: 'Giới thiệu' },
  { href: '/#hoat-dong', label: 'Hoạt động' },
  { href: '/#tru-tri', label: 'Trụ trì' },
  { href: '/#dong-nuoc', label: 'Cúng dường' },
  { href: '/#dang-ky-phat-tu', label: 'Kết duyên' },
] as const;

const MORE = [
  { href: '/#lich-su', label: 'Lịch sử' },
  { href: '/#di-tich', label: 'Di tích' },
  { href: '/#thu-vien-anh', label: 'Hình ảnh' },
  { href: '/#danh-gia', label: 'Đánh giá' },
] as const;

const ALL_SIMPLE = [...PRIMARY, ...MORE] as const;

type OpenMenu = 'more' | 'phongthuy' | 'phathoc' | null;
type MobileSection = 'phongthuy' | 'phathoc' | null;

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="currentColor"
      className={`size-3.5 opacity-70 transition-transform ${
        open ? 'rotate-180' : ''
      }`}
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

function hotlineHref(phone: string): string {
  return `tel:${phone.replace(/\s+/g, '')}`;
}

function HotlineLink({
  phone,
  primary,
  compact,
}: {
  phone: string;
  primary: string;
  compact?: boolean;
}) {
  return (
    <a
      href={hotlineHref(phone)}
      className={`shrink-0 inline-flex items-center gap-1.5 h-8 rounded-full text-[0.8rem] leading-none text-white ring-1 ring-white/35 hover:brightness-110 transition-[filter] ${
        compact ? 'pl-2 pr-2.5' : 'pl-2.5 pr-3'
      }`}
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
      {!compact ? (
        <span className="font-medium tracking-wide tabular-nums">{phone}</span>
      ) : null}
    </a>
  );
}

function ToolLink({
  tool,
  onNavigate,
  muted,
  nowrap,
}: {
  tool: FengShuiToolMeta;
  onNavigate: () => void;
  muted?: boolean;
  nowrap?: boolean;
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
      <span className={`min-w-0 ${nowrap ? 'whitespace-nowrap' : ''}`}>
        {tool.title}
      </span>
      <span
        className={`justify-self-end text-[0.55rem] uppercase tracking-wide ${
          soon
            ? 'text-white/30 group-hover:text-white/45'
            : 'invisible'
        }`}
        aria-hidden={!soon}
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
  nowrap,
}: {
  section: NavSection;
  tools: FengShuiToolMeta[];
  accent: string;
  onNavigate: () => void;
  muted?: boolean;
  nowrap?: boolean;
}) {
  return (
    <div className={`min-w-0 flex flex-col ${muted ? 'opacity-90' : ''}`}>
      <p
        className="h-7 flex items-end text-[0.65rem] uppercase tracking-[0.16em] whitespace-nowrap truncate pb-1.5 mb-2 border-b border-white/10"
        style={{ color: muted ? 'rgba(255,255,255,0.45)' : accent }}
        title={NAV_SECTION_LABELS[section]}
      >
        {NAV_SECTION_MENU_LABELS[section]}
      </p>
      <ul className="space-y-0.5 flex-1">
        {tools.map((tool) => (
          <li key={tool.slug}>
            <ToolLink
              tool={tool}
              onNavigate={onNavigate}
              muted={muted}
              nowrap={nowrap}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}

export function TopNav({ temple }: Props) {
  const primary = temple.primary_color || '#7A1F1F';
  const hotline =
    temple.hotline?.trim() || temple.contact_links?.phone?.trim() || null;

  const [openMenu, setOpenMenu] = useState<OpenMenu>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileSection, setMobileSection] = useState<MobileSection>(null);
  const desktopMenusRef = useRef<HTMLDivElement>(null);
  const moreId = useId();
  const phongThuyId = useId();
  const phatHocId = useId();

  const phongThuyCount = useMemo(() => phongThuyMenuTools().length, []);
  const phatHocCount = useMemo(() => toolsByDomain('phat_hoc').length, []);
  const phongThuyGrouped = useMemo(
    () => groupToolsByNavSection(PHONG_THUY_NAV_ORDER),
    [],
  );
  const phatHocGrouped = useMemo(
    () => groupToolsByNavSection(PHAT_HOC_NAV_ORDER),
    [],
  );

  useEffect(() => {
    if (!openMenu) return;
    function onDoc(e: MouseEvent) {
      if (!desktopMenusRef.current?.contains(e.target as Node)) {
        setOpenMenu(null);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpenMenu(null);
    }
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, [openMenu]);

  useEffect(() => {
    if (!mobileOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setMobileOpen(false);
    }
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener('keydown', onKey);
    };
  }, [mobileOpen]);

  function closeAll() {
    setOpenMenu(null);
    setMobileOpen(false);
  }

  function toggleMenu(menu: OpenMenu) {
    setOpenMenu((cur) => (cur === menu ? null : menu));
  }

  return (
    <>
      <nav className="fixed top-0 inset-x-0 z-40 bg-ink/30 backdrop-blur-md border-b border-white/10">
        <div className="mx-auto max-w-6xl px-4 md:px-8 h-14 flex items-center justify-between gap-4">
          <Link
            href="/"
            onClick={closeAll}
            className="flex items-center gap-2 text-white shrink-0 min-w-0 max-w-[42%] sm:max-w-[280px]"
          >
            <span className="font-display text-[0.95rem] md:text-base tracking-tight truncate">
              {temple.name}
            </span>
          </Link>

          <div className="hidden lg:flex flex-1 items-center justify-end gap-1 min-w-0">
            <div
              ref={desktopMenusRef}
              className="flex items-center gap-0.5 text-[0.8125rem] text-white/80"
            >
              {PRIMARY.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className="px-2.5 py-1.5 hover:text-white transition-colors whitespace-nowrap"
                >
                  {l.label}
                </Link>
              ))}

              <div className="relative">
                <button
                  type="button"
                  aria-expanded={openMenu === 'phongthuy'}
                  aria-controls={phongThuyId}
                  onClick={() => toggleMenu('phongthuy')}
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
                        <p className="font-display text-lg text-white">
                          Công cụ Phong thủy
                        </p>
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

                    <div className="px-6 py-5 grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-6 items-start auto-cols-fr">
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

              <div className="relative">
                <button
                  type="button"
                  aria-expanded={openMenu === 'phathoc'}
                  aria-controls={phatHocId}
                  onClick={() => toggleMenu('phathoc')}
                  className={`inline-flex items-center gap-1 px-2.5 py-1.5 transition-colors whitespace-nowrap ${
                    openMenu === 'phathoc' ? 'text-white' : 'hover:text-white'
                  }`}
                >
                  Phật học
                  <Chevron open={openMenu === 'phathoc'} />
                </button>

                {openMenu === 'phathoc' ? (
                  <div
                    id={phatHocId}
                    role="menu"
                    className="fixed left-1/2 -translate-x-1/2 top-14 z-50 w-[min(58rem,calc(100vw-1.5rem))] max-h-[min(70vh,32rem)] overflow-y-auto bg-ink/98 backdrop-blur-xl border border-white/12 shadow-[0_28px_80px_-20px_rgba(0,0,0,0.85)]"
                  >
                    <div className="px-6 py-4 border-b border-white/10 flex flex-wrap items-end justify-between gap-3 sticky top-0 bg-ink/95 backdrop-blur-md z-10">
                      <div>
                        <p className="font-display text-lg text-white">
                          Phật học · Tâm linh
                        </p>
                        <p className="mt-0.5 text-xs text-white/45">
                          {phatHocCount} mục · Lễ · Kinh · Tham gia chùa
                        </p>
                      </div>
                      <Link
                        href="/phat-hoc"
                        onClick={() => setOpenMenu(null)}
                        className="text-xs text-white/70 hover:text-white underline underline-offset-4"
                      >
                        Mở trang đầy đủ →
                      </Link>
                    </div>

                    <div className="px-6 py-5 grid grid-cols-4 gap-x-8 gap-y-5 items-start">
                      {phatHocGrouped.map(({ section, tools }) => (
                        <NavSectionBlock
                          key={section}
                          section={section}
                          tools={tools}
                          accent={primary}
                          onNavigate={() => setOpenMenu(null)}
                          nowrap
                        />
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>

              <div className="relative">
                <button
                  type="button"
                  aria-expanded={openMenu === 'more'}
                  aria-controls={moreId}
                  onClick={() => toggleMenu('more')}
                  className={`inline-flex items-center gap-1 px-2.5 py-1.5 transition-colors whitespace-nowrap ${
                    openMenu === 'more' ? 'text-white' : 'hover:text-white'
                  }`}
                >
                  Thêm
                  <Chevron open={openMenu === 'more'} />
                </button>

                {openMenu === 'more' ? (
                  <div
                    id={moreId}
                    role="menu"
                    className="absolute right-0 top-full mt-2 min-w-[11.5rem] py-1.5 bg-ink/95 backdrop-blur-md border border-white/15 shadow-[0_16px_40px_-20px_rgba(0,0,0,0.7)]"
                  >
                    {MORE.map((l) => (
                      <Link
                        key={l.href}
                        href={l.href}
                        role="menuitem"
                        onClick={() => setOpenMenu(null)}
                        className="block px-4 py-2 text-sm text-white/80 hover:text-white hover:bg-white/8"
                      >
                        {l.label}
                      </Link>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>

            {hotline ? (
              <div className="ml-3">
                <HotlineLink phone={hotline} primary={primary} />
              </div>
            ) : null}
          </div>

          <div className="flex lg:hidden items-center gap-2 shrink-0">
            {hotline ? (
              <HotlineLink phone={hotline} primary={primary} compact />
            ) : null}
            <button
              type="button"
              aria-label={mobileOpen ? 'Đóng menu' : 'Mở menu'}
              aria-expanded={mobileOpen}
              onClick={() => setMobileOpen((v) => !v)}
              className="inline-flex size-9 items-center justify-center text-white ring-1 ring-white/25 hover:bg-white/10"
            >
              {mobileOpen ? (
                <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
                  <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
                  <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </nav>

      {openMenu === 'phongthuy' || openMenu === 'phathoc' ? (
        <button
          type="button"
          aria-label="Đóng menu"
          className="hidden lg:block fixed inset-0 z-30 bg-ink/40 backdrop-blur-[1px]"
          onClick={() => setOpenMenu(null)}
        />
      ) : null}

      {mobileOpen ? (
        <div className="fixed inset-0 z-30 lg:hidden">
          <button
            type="button"
            aria-label="Đóng menu"
            className="absolute inset-0 bg-ink/55 backdrop-blur-[2px]"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute top-14 inset-x-0 max-h-[calc(100vh-3.5rem)] overflow-y-auto border-b border-white/10 bg-ink/96 backdrop-blur-md shadow-xl">
            <div className="mx-auto max-w-6xl px-4 py-4">
              {ALL_SIMPLE.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setMobileOpen(false)}
                  className="block px-3 py-3 text-base text-white/85 hover:text-white hover:bg-white/8 border-b border-white/8"
                >
                  {l.label}
                </Link>
              ))}

              <div className="border-b border-white/8">
                <button
                  type="button"
                  onClick={() =>
                    setMobileSection((s) =>
                      s === 'phongthuy' ? null : 'phongthuy',
                    )
                  }
                  className="w-full flex items-center justify-between px-3 py-3 text-base text-white/85"
                >
                  <span>
                    Phong thủy
                    <span className="ml-2 text-xs text-white/35">
                      {phongThuyCount}
                    </span>
                  </span>
                  <Chevron open={mobileSection === 'phongthuy'} />
                </button>
                {mobileSection === 'phongthuy' ? (
                  <div className="pb-4 space-y-5">
                    <Link
                      href="/phong-thuy"
                      onClick={() => setMobileOpen(false)}
                      className="block px-3 py-1.5 text-sm text-white/50 hover:text-white"
                    >
                      Mở trang đầy đủ →
                    </Link>
                    {phongThuyGrouped.map(({ section, tools }) => (
                      <div key={section} className="px-3">
                        <p
                          className="text-[0.68rem] uppercase tracking-[0.16em] mb-1"
                          style={{ color: primary }}
                        >
                          {NAV_SECTION_MENU_LABELS[section]}
                        </p>
                        {tools.map((tool) => (
                          <Link
                            key={tool.slug}
                            href={toolHref(tool)}
                            onClick={() => setMobileOpen(false)}
                            className="flex items-center justify-between py-2 text-sm text-white/80 hover:text-white border-b border-white/[0.06]"
                          >
                            <span>{tool.title}</span>
                            {tool.status === 'coming_soon' ? (
                              <span className="text-[0.55rem] uppercase text-white/30">
                                Sắp
                              </span>
                            ) : null}
                          </Link>
                        ))}
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>

              <div className="border-b border-white/8">
                <button
                  type="button"
                  onClick={() =>
                    setMobileSection((s) =>
                      s === 'phathoc' ? null : 'phathoc',
                    )
                  }
                  className="w-full flex items-center justify-between px-3 py-3 text-base text-white/85"
                >
                  <span>
                    Phật học
                    <span className="ml-2 text-xs text-white/35">
                      {phatHocCount}
                    </span>
                  </span>
                  <Chevron open={mobileSection === 'phathoc'} />
                </button>
                {mobileSection === 'phathoc' ? (
                  <div className="pb-4 space-y-4">
                    <Link
                      href="/phat-hoc"
                      onClick={() => setMobileOpen(false)}
                      className="block px-3 py-1.5 text-sm text-white/50 hover:text-white"
                    >
                      Mở trang đầy đủ →
                    </Link>
                    {phatHocGrouped.map(({ section, tools }) => (
                      <div key={section} className="px-3">
                        <p
                          className="text-[0.68rem] uppercase tracking-[0.16em] mb-1"
                          style={{ color: primary }}
                        >
                          {NAV_SECTION_MENU_LABELS[section]}
                        </p>
                        {tools.map((tool) => (
                          <Link
                            key={tool.slug}
                            href={toolHref(tool)}
                            onClick={() => setMobileOpen(false)}
                            className="flex items-center justify-between py-2 text-sm text-white/80 hover:text-white border-b border-white/[0.06]"
                          >
                            <span>{tool.title}</span>
                            {tool.status === 'coming_soon' ? (
                              <span className="text-[0.55rem] uppercase text-white/30">
                                Sắp
                              </span>
                            ) : null}
                          </Link>
                        ))}
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>

              <Link
                href="/#dong-nuoc"
                onClick={() => setMobileOpen(false)}
                className="mt-3 flex items-center justify-center px-4 py-3 text-sm text-white tracking-wide"
                style={{ backgroundColor: primary }}
              >
                Thỉnh nước
              </Link>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
