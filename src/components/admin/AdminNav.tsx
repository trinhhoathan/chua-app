'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

type NavLink = {
  href: string;
  label: string;
  superOnly?: boolean;
  /** Chỉ hiện với site bán nước (ẩn trên Lý Gia Phúc An). */
  waterOnly?: boolean;
  /** Chỉ hiện khi đại lý / superAdmin theo dõi đơn sim. */
  simAgent?: boolean;
};

type NavGroup = {
  id: string;
  label: string;
  superOnly?: boolean;
  items: NavLink[];
};

const TOP_LINKS: NavLink[] = [{ href: '/quan-tri', label: 'Tổng quan' }];

const GROUPS: NavGroup[] = [
  {
    id: 'he-thong',
    label: 'Hệ thống',
    superOnly: true,
    items: [
      { href: '/quan-tri/chua', label: 'Phật tự' },
      { href: '/quan-tri/thanh-vien', label: 'Thành viên' },
      { href: '/quan-tri/don-gia', label: 'Đơn giá' },
    ],
  },
  {
    id: 'cong-dong',
    label: 'Cộng đồng',
    items: [
      { href: '/quan-tri/phat-tu', label: 'Phật tử' },
      { href: '/quan-tri/hoat-dong', label: 'Hoạt động' },
      { href: '/quan-tri/tung-kinh', label: 'Tụng kinh trực tuyến' },
      { href: '/quan-tri/gui-tin', label: 'Tin nhắn' },
    ],
  },
  {
    id: 'van-hanh',
    label: 'Vận hành',
    items: [
      { href: '/quan-tri/don-hang', label: 'Thỉnh nước', waterOnly: true },
      {
        href: '/quan-tri/sim',
        label: 'Kho Sim Phong Thủy',
        superOnly: true,
      },
      {
        href: '/quan-tri/sim/don-hang',
        label: 'Thống kê đơn sim',
        simAgent: true,
      },
      { href: '/quan-tri/doi-soat', label: 'Đối soát' },
      { href: '/quan-tri/so-cau', label: 'Sớ cầu an/siêu', waterOnly: true },
      { href: '/quan-tri/viet-so', label: 'Viết sớ', waterOnly: true },
      { href: '/quan-tri/kho', label: 'Kho vận', waterOnly: true },
    ],
  },
  {
    id: 'noi-dung',
    label: 'Nội dung',
    items: [
      { href: '/quan-tri/hinh-anh', label: 'Hình ảnh' },
      { href: '/quan-tri/lien-he', label: 'Liên hệ' },
    ],
  },
  {
    id: 'cai-dat',
    label: 'Cài đặt',
    items: [{ href: '/quan-tri/doi-mat-khau', label: 'Đổi mật khẩu' }],
  },
];

function linkActive(pathname: string, href: string) {
  if (href === '/quan-tri') return pathname === '/quan-tri';
  return pathname === href || pathname.startsWith(`${href}/`);
}

function groupActive(pathname: string, items: NavLink[]) {
  return items.some((i) => linkActive(pathname, i.href));
}

export function AdminNav({
  isSuperAdmin,
  siteUpsell = null,
  simStoreEnabled = false,
}: {
  isSuperAdmin: boolean;
  /** 'sim' = Lý Gia (ẩn mục nước) · 'water' = chùa · null = hiện hết. */
  siteUpsell?: 'sim' | 'water' | null;
  /** Đại lý (hoặc superAdmin) được xem thống kê đơn sim. */
  simStoreEnabled?: boolean;
}) {
  const pathname = usePathname();
  const [openId, setOpenId] = useState<string | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setOpenId(null);
  }, [pathname]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpenId(null);
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  function clearCloseTimer() {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  }

  function openGroup(id: string) {
    clearCloseTimer();
    setOpenId(id);
  }

  function scheduleClose() {
    clearCloseTimer();
    closeTimer.current = setTimeout(() => setOpenId(null), 120);
  }

  const groups = GROUPS.filter((g) => !g.superOnly || isSuperAdmin)
    .map((g) => ({
      ...g,
      items: g.items.filter((i) => {
        if (i.superOnly && !isSuperAdmin) return false;
        if (i.waterOnly && siteUpsell === 'sim') return false;
        if (i.simAgent && !isSuperAdmin && !simStoreEnabled) return false;
        return true;
      }),
    }))
    .filter((g) => g.items.length > 0);

  return (
    <nav className="border-t border-white/10 relative z-40">
      <div className="mx-auto max-w-6xl px-4 md:px-6 flex flex-wrap gap-0.5">
        {TOP_LINKS.map((item) => {
          const active = linkActive(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`shrink-0 px-3 py-2.5 text-sm border-b-2 ${
                active
                  ? 'text-white border-gilt'
                  : 'text-white/70 hover:text-white border-transparent hover:border-gilt/50'
              }`}
            >
              {item.label}
            </Link>
          );
        })}

        {groups.map((group) => {
          const active = groupActive(pathname, group.items);
          const open = openId === group.id;
          return (
            <div
              key={group.id}
              className="relative shrink-0"
              onMouseEnter={() => openGroup(group.id)}
              onMouseLeave={scheduleClose}
            >
              <button
                type="button"
                aria-expanded={open}
                aria-haspopup="menu"
                onClick={() =>
                  setOpenId((cur) => (cur === group.id ? null : group.id))
                }
                className={`px-3 py-2.5 text-sm border-b-2 inline-flex items-center gap-1 ${
                  active || open
                    ? 'text-white border-gilt'
                    : 'text-white/70 hover:text-white border-transparent hover:border-gilt/50'
                }`}
              >
                {group.label}
                <span
                  className={`text-[0.65rem] opacity-70 transition-transform ${
                    open ? 'rotate-180' : ''
                  }`}
                  aria-hidden
                >
                  ▾
                </span>
              </button>
              {open ? (
                <div
                  role="menu"
                  className="absolute left-0 top-full z-50 min-w-[12rem] border border-fog bg-paper text-ink shadow-lg"
                  onMouseEnter={() => openGroup(group.id)}
                  onMouseLeave={scheduleClose}
                >
                  {group.items.map((item) => {
                    const itemActive = linkActive(pathname, item.href);
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        role="menuitem"
                        className={`block px-3 py-2.5 text-sm hover:bg-mist ${
                          itemActive ? 'bg-mist font-medium' : ''
                        }`}
                      >
                        {item.label}
                      </Link>
                    );
                  })}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </nav>
  );
}
