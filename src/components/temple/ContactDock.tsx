'use client';

import { useEffect, useState, type ReactNode } from 'react';
import type { TempleContactLinks } from '@/types/database';
import { phoneHref } from '@/lib/contact-links';

interface Props {
  links: TempleContactLinks;
  mapsUrl?: string | null;
  primaryColor?: string;
}

type DockItem = {
  key: string;
  label: string;
  href: string;
  external?: boolean;
  bg: string;
  icon: ReactNode;
};

function IconWrap({
  bg,
  label,
  children,
}: {
  bg: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className="relative flex size-10 items-center justify-center rounded-full text-white shadow-[2px_3px_0_rgba(0,0,0,0.14)] ring-1 ring-black/5 transition-transform hover:-translate-y-0.5 hover:shadow-[3px_5px_0_rgba(0,0,0,0.16)] md:size-11"
      style={{ background: bg }}
      title={label}
    >
      {children}
    </span>
  );
}

const svgCls = 'size-[1.05rem] md:size-[1.15rem]';

export function ContactDock({
  links,
  mapsUrl,
  primaryColor = '#7A1F1F',
}: Props) {
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 420);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const items: DockItem[] = [];

  if (links.zalo) {
    items.push({
      key: 'zalo',
      label: 'Zalo',
      href: links.zalo,
      external: true,
      bg: 'linear-gradient(160deg,#5ADBFF 0%,#0068FF 100%)',
      icon: (
        <span className="text-[0.58rem] font-bold tracking-tight leading-none">
          Zalo
        </span>
      ),
    });
  }

  if (links.messenger) {
    items.push({
      key: 'messenger',
      label: 'Messenger',
      href: links.messenger,
      external: true,
      bg: 'linear-gradient(160deg,#00C6FF 0%,#A033FF 55%,#FF3B8D 100%)',
      icon: (
        <svg viewBox="0 0 24 24" className={svgCls} fill="currentColor" aria-hidden>
          <path d="M12 2C6.5 2 2 6.1 2 11.2c0 2.9 1.4 5.5 3.7 7.2V22l3.4-1.9c.9.2 1.9.4 2.9.4 5.5 0 10-4.1 10-9.3S17.5 2 12 2zm1 12.5-2.5-2.7-4.9 2.7L11 9l2.6 2.7L18.4 9 13 14.5z" />
        </svg>
      ),
    });
  }

  if (links.phone) {
    items.push({
      key: 'phone',
      label: 'Gọi điện',
      href: phoneHref(links.phone),
      bg: `linear-gradient(160deg, ${primaryColor}cc 0%, ${primaryColor} 100%)`,
      icon: (
        <svg viewBox="0 0 24 24" className={svgCls} fill="currentColor" aria-hidden>
          <path d="M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.24c1.12.37 2.33.57 3.58.57a1 1 0 0 1 1 1V20a1 1 0 0 1-1 1C10.4 21 3 13.6 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.46.57 3.58a1 1 0 0 1-.25 1.02l-2.2 2.2z" />
        </svg>
      ),
    });
  }

  if (mapsUrl) {
    items.push({
      key: 'maps',
      label: 'Bản đồ',
      href: mapsUrl,
      external: true,
      bg: 'linear-gradient(160deg,#FFE566 0%,#F0B429 100%)',
      icon: (
        <svg viewBox="0 0 24 24" className={svgCls} fill="currentColor" aria-hidden>
          <path d="M12 2C8.1 2 5 5.1 5 9c0 5.2 7 13 7 13s7-7.8 7-13c0-3.9-3.1-7-7-7zm0 9.5A2.5 2.5 0 1 1 12 6a2.5 2.5 0 0 1 0 5.5z" />
        </svg>
      ),
    });
  }

  if (links.facebook) {
    items.push({
      key: 'facebook',
      label: 'Facebook',
      href: links.facebook,
      external: true,
      bg: 'linear-gradient(160deg,#6AA8FF 0%,#1877F2 100%)',
      icon: (
        <svg viewBox="0 0 24 24" className={svgCls} fill="currentColor" aria-hidden>
          <path d="M14 9h3V6h-3c-2.2 0-4 1.8-4 4v2H7v3h3v7h3v-7h2.6l.4-3H13v-2c0-.6.4-1 1-1z" />
        </svg>
      ),
    });
  }

  if (links.youtube) {
    items.push({
      key: 'youtube',
      label: 'YouTube',
      href: links.youtube,
      external: true,
      bg: 'linear-gradient(160deg,#FF7A7A 0%,#E60000 100%)',
      icon: (
        <svg viewBox="0 0 24 24" className={svgCls} fill="currentColor" aria-hidden>
          <path d="M23 12.2s0-3.2-.4-4.7c-.2-.9-.9-1.6-1.8-1.8C19.4 5.2 12 5.2 12 5.2s-7.4 0-8.8.5c-.9.2-1.6.9-1.8 1.8C1 9 1 12.2 1 12.2s0 3.2.4 4.7c.2.9.9 1.6 1.8 1.8 1.4.4 8.8.4 8.8.4s7.4 0 8.8-.4c.9-.2 1.6-.9 1.8-1.8.4-1.5.4-4.7.4-4.7zM9.8 15.3V9.1l6 3.1-6 3.1z" />
        </svg>
      ),
    });
  }

  if (links.tiktok) {
    items.push({
      key: 'tiktok',
      label: 'TikTok',
      href: links.tiktok,
      external: true,
      bg: 'linear-gradient(160deg,#25F4EE 0%,#111111 50%,#FE2C55 100%)',
      icon: (
        <svg viewBox="0 0 24 24" className={svgCls} fill="currentColor" aria-hidden>
          <path d="M16.6 5.8A4.8 4.8 0 0 1 14 2h-3.1v13.2a2.4 2.4 0 1 1-1.6-2.2V9.7a5.5 5.5 0 1 0 4.7 5.4V9a7.7 7.7 0 0 0 4.5 1.4V7.3a4.8 4.8 0 0 1-1.9-1.5z" />
        </svg>
      ),
    });
  }

  if (links.zalo_community) {
    items.push({
      key: 'zalo_community',
      label: 'Cộng đồng Zalo',
      href: links.zalo_community,
      external: true,
      bg: 'linear-gradient(160deg,#B8A9FF 0%,#6C5CE7 100%)',
      icon: (
        <svg viewBox="0 0 24 24" className={svgCls} fill="currentColor" aria-hidden>
          <path d="M8 10a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm8 0a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM3.5 18.2c0-2.3 2.5-4.2 4.5-4.2h0c.6 0 1.2.1 1.7.3A5.5 5.5 0 0 0 8 16.8v1.7H3.5v-.3zm8 0V16.8c0-1.4.8-2.6 2-3.2.5-.2 1.1-.3 1.7-.3 2 0 4.5 1.9 4.5 4.2v.3H11.5z" />
        </svg>
      ),
    });
  }

  if (items.length === 0 && !showTop) return null;

  return (
    <div className="pointer-events-none fixed right-2 z-[45] bottom-[7.25rem] md:right-3.5 md:bottom-auto md:top-1/2 md:-translate-y-1/2">
      <div className="pointer-events-auto flex flex-col items-center gap-2 md:gap-2.5">
        {items.map((item) => (
          <a
            key={item.key}
            href={item.href}
            target={item.external ? '_blank' : undefined}
            rel={item.external ? 'noopener noreferrer' : undefined}
            aria-label={item.label}
            className="block"
          >
            <IconWrap bg={item.bg} label={item.label}>
              {item.icon}
            </IconWrap>
          </a>
        ))}

        <button
          type="button"
          aria-label="Lên đầu trang"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className={`block transition-all duration-300 ${
            showTop
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 translate-y-2 pointer-events-none'
          }`}
        >
          <IconWrap
            bg="linear-gradient(160deg,#F6E7B2 0%,#D4A84B 100%)"
            label="Lên đầu trang"
          >
            <svg
              viewBox="0 0 24 24"
              className={svgCls}
              fill="none"
              stroke="#5c4a1a"
              strokeWidth="2.4"
              aria-hidden
            >
              <path
                d="M12 19V5M5 12l7-7 7 7"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </IconWrap>
        </button>
      </div>
    </div>
  );
}
