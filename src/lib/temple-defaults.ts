import type {
  FeatureEntry,
  TempleContactLinks,
} from '@/types/database';
import { normalizeContactLinks } from '@/lib/contact-links';

/** Palette ~100 màu tông chùa / kiến trúc / thiên nhiên — random khi tạo Phật tự. */
export const TEMPLE_COLOR_PALETTE = [
  '#7A1F1F', '#5C1A1A', '#8B2E2E', '#9C3B2A', '#A12A2A', '#B33A2C', '#C44B3A',
  '#6E1515', '#4A0F0F', '#9B2226', '#A0522D', '#B45309', '#C2410C', '#9A3412',
  '#7C2D12', '#D97706', '#B4532A', '#92400E', '#78350F', '#EA580C', '#8B6914',
  '#6B5A1F', '#A16207', '#854D0E', '#CA8A04', '#B8860B', '#996515', '#7A5C12',
  '#C9A227', '#8B7355', '#3D2B1F', '#4A3728', '#5A4632', '#5C3A1A', '#6B4423',
  '#7C5A3C', '#8B6B4A', '#4B3621', '#3B2F2F', '#2C1810', '#6F4E37', '#5D4037',
  '#4E342E', '#3E2723', '#795548', '#2F4A3C', '#1F3D2F', '#245C45', '#166534',
  '#15803D', '#14532D', '#064E3B', '#047857', '#0F766E', '#115E59', '#134E4A',
  '#1A4A4A', '#1B4332', '#2D6A4F', '#40916C', '#52796F', '#0E7490', '#155E75',
  '#164E63', '#0C4A6E', '#0369A1', '#0284C7', '#075985', '#1D4E6F', '#1A2A4A',
  '#1E3A5F', '#2C3E6B', '#1E3A8A', '#1E40AF', '#312E81', '#3730A3', '#4338CA',
  '#1E293B', '#0F172A', '#334155', '#1F2937', '#4A1F3D', '#6B2D5B', '#701A75',
  '#86198F', '#9D174D', '#9F1239', '#831843', '#5B2140', '#7E2250', '#4C1D3D',
  '#7A3B2E', '#9C4221', '#874F3A', '#A1624A', '#8C4A2F', '#6D3B2A', '#B5651D',
  '#CD853F', '#3F4A3A', '#4A5568', '#64748B', '#475569', '#57534E', '#44403C',
  '#292524', '#78716C', '#6B7280', '#52525B', '#3F6212', '#4D7C0F', '#365314',
  '#556B2F', '#6B7C3A', '#5A6B3A', '#4A5D23', '#3D4F21',
] as const;

export function pickRandomTempleColor(
  exclude?: string | null,
): (typeof TEMPLE_COLOR_PALETTE)[number] {
  const pool = exclude
    ? TEMPLE_COLOR_PALETTE.filter(
        (c) => c.toLowerCase() !== exclude.toLowerCase(),
      )
    : [...TEMPLE_COLOR_PALETTE];
  const list = pool.length > 0 ? pool : TEMPLE_COLOR_PALETTE;
  return list[Math.floor(Math.random() * list.length)];
}

/** Bỏ dấu tiếng Việt → slug ASCII. */
export function slugifyTempleName(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48);
}

/** Chuẩn hóa domain: bỏ protocol/path/www, lowercase. */
export function normalizeTempleDomain(raw: string): string | null {
  let d = raw.trim().toLowerCase();
  if (!d) return null;
  d = d.replace(/^https?:\/\//, '');
  d = d.split('/')[0] ?? '';
  d = d.replace(/:\d+$/, '');
  d = d.replace(/^www\./, '');
  if (!d || d.includes(' ') || !d.includes('.')) {
    // cho phép *.localhost
    if (!d.endsWith('.localhost') && d !== 'localhost') return null;
  }
  if (!/^[a-z0-9.-]+$/.test(d)) return null;
  if (d.startsWith('.') || d.endsWith('.') || d.includes('..')) return null;
  return d;
}

export function suggestDomainFromName(name: string): string {
  const slug = slugifyTempleName(name) || 'chua-moi';
  return `${slug}.localhost`;
}

export function suggestPaymentCode(name: string): string {
  const slug = slugifyTempleName(name).replace(/-/g, '');
  const letters = slug.replace(/[^a-z]/g, '').toUpperCase();
  if (letters.length >= 2) return letters.slice(0, 2);
  return 'PT';
}

export function buildTempleDomainAliases(primary: string): string[] {
  const domains = new Set<string>([primary]);
  if (!primary.endsWith('.localhost') && primary !== 'localhost') {
    domains.add(`www.${primary}`);
    const slug = primary.split('.')[0];
    if (slug) domains.add(`${slug}.localhost`);
  }
  return [...domains];
}

export function buildDefaultFeatures(templeName: string): FeatureEntry[] {
  return [
    {
      title: 'Lịch sử & truyền thừa',
      body: `${templeName} lưu giữ dấu ấn tâm linh và văn hóa địa phương. Nội dung chi tiết sẽ được bổ sung sau.`,
    },
    {
      title: 'Sinh hoạt Phật tử',
      body: 'Các buổi lễ, khóa tu và hoạt động cộng đồng được cập nhật trên trang Hoạt động.',
    },
    {
      title: 'Thỉnh nước tinh khiết',
      body: 'Phật tử có thể phát tâm thỉnh nước online — phần đóng góp được đối soát minh bạch.',
    },
    {
      title: 'Liên hệ chùa',
      body: 'Gọi điện, nhắn Zalo hoặc đến tận nơi. Thông tin liên hệ cập nhật trên trang web.',
    },
  ];
}

export function buildTempleCreateRow(input: {
  name: string;
  domain: string;
  templeAltName?: string | null;
  paymentCode?: string | null;
  address?: string | null;
  abbottName?: string | null;
  abbottTitle?: string | null;
  hotline?: string | null;
  slogan?: string | null;
  tagline?: string | null;
  primaryColor?: string | null;
  contactLinks?: Partial<TempleContactLinks> | null;
}) {
  const name = input.name.trim();
  const slogan =
    input.slogan?.trim() ||
    `${name} — nơi gửi gắm tâm thành`;
  const tagline =
    input.tagline?.trim() ||
    'Trang thông tin chính thức của chùa';
  const color =
    input.primaryColor?.trim() || pickRandomTempleColor();
  const hotline = input.hotline?.trim() || null;
  const links = normalizeContactLinks(
    {
      ...(input.contactLinks ?? {}),
      phone: input.contactLinks?.phone ?? hotline,
    },
    hotline,
  );

  return {
    name,
    domain: input.domain,
    temple_alt_name: input.templeAltName?.trim() || null,
    payment_code:
      input.paymentCode?.trim().toUpperCase().slice(0, 4) ||
      suggestPaymentCode(name),
    address: input.address?.trim() || null,
    abbott_name: input.abbottName?.trim() || null,
    abbott_title: input.abbottTitle?.trim() || 'Trụ trì',
    abbott_bio: null,
    abbott_image_url: null,
    hotline,
    contact_links: links,
    slogan,
    tagline,
    primary_color: color,
    history_summary: `${name} vừa được khởi tạo trên hệ thống. Trụ trì và quản trị viên sẽ bổ sung lịch sử, hình ảnh và nội dung chi tiết trong thời gian tới.`,
    features: buildDefaultFeatures(name),
    timeline: [],
    gallery: [],
    videos: [],
    extra_sections: [],
    reviews: [],
    logo_url: null,
    hero_image_url: null,
    maps_url: null,
    maps_embed_url: null,
    google_rating: null,
    google_review_count: null,
    qr_donate: null,
    bank_name: null,
    bank_account_number: null,
    bank_account_holder: null,
    water_price_vnd: 80000,
    water_profit_share_pct: 50,
    is_active: true,
    updated_at: new Date().toISOString(),
  };
}
