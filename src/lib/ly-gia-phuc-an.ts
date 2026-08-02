import type { Temple } from '@/types/database';

const DOMAIN_MARKERS = [
  'lygiaphucan.com',
  'phong-thuy-ly-gia-phuc-an',
  'ly-gia-phuc-an',
];

export const LY_GIA = {
  name: 'Lý Gia Phúc An',
  title: 'Thầy Phong Thủy Lý Gia Phúc An',
  phone: '0941391386',
  phoneDisplay: '0941.391.386',
  email: 'info@lygiaphucan.com',
  website: 'www.lygiaphucan.com',
  address: '52⁷ Nguyễn Văn Cừ, phường Bồ Đề, Hà Nội',
  addressShort: '52⁷ Nguyễn Văn Cừ, Bồ Đề, Hà Nội',
  zaloUrl: 'https://zalo.me/0941391386',
  primary: '#7A1F1F',
  gold: '#B08D42',
  mapsUrl:
    'https://www.google.com/maps/search/?api=1&query=52+Nguy%E1%BB%85n+V%C4%83n+C%E1%BB%AB%2C+B%E1%BB%93+%C4%90%E1%BB%81%2C+H%C3%A0+N%E1%BB%99i',
  mapsEmbedUrl:
    'https://www.google.com/maps?q=52+Nguy%E1%BB%85n+V%C4%83n+C%E1%BB%AB,+B%E1%BB%93+%C4%90%E1%BB%81,+H%C3%A0+N%E1%BB%99i&z=16&hl=vi&output=embed',
  /** Logo tròn (nav / footer) — quả cầu, không chữ */
  logo: '/images/ly-gia-phuc-an/brand-mark.png',
  /** Orb banner — quả cầu lớn, không chữ */
  logoOrb: '/images/ly-gia-phuc-an/brand-orb.png',
  /** Logo đầy đủ có chữ */
  logoFull: '/images/ly-gia-phuc-an/logo-full.png',
  hero: '/images/ly-gia-phuc-an/hero.png',
  master: '/images/ly-gia-phuc-an/master-portrait.png',
} as const;

export function isLyGiaPhucAnSite(
  temple: Pick<Temple, 'domain' | 'payment_code' | 'name'>,
): boolean {
  if (temple.payment_code === 'LGPA') return true;
  const domain = temple.domain.toLowerCase();
  if (DOMAIN_MARKERS.some((m) => domain.includes(m))) return true;
  return temple.name.toLowerCase().includes('lý gia phúc an');
}

/** Check nhẹ chỉ cần domain (dùng cho TempleBrief trong admin). */
export function isLyGiaDomain(domain: string | null | undefined): boolean {
  if (!domain) return false;
  const d = domain.toLowerCase();
  return DOMAIN_MARKERS.some((m) => d.includes(m));
}
