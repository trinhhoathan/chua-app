import type { Temple } from '@/types/database';

/**
 * Nhãn chai nước 300ml theo từng chùa (mockup + QR + copy).
 * Chỉ các chùa có trong registry mới hiện showcase / trang /thu-nhan-nuoc đầy đủ.
 */

export interface WaterBottleBrand {
  templeId: string;
  /** Domain chính + alias để khớp khi resolve. */
  domains: string[];
  nameCaps: string;
  altNameCaps: string;
  slogan: string;
  addressShort: string;
  abbott: string;
  phoneDisplay: string;
  phoneRaw: string;
  siteUrl: string;
  domainLabel: string;
  color: string;
  gold: string;
  cream: string;
  mockupSrc: string;
  qrSvgSrc: string;
  /** Danh xưng ngắn cho copy bùa chú (Đại đức / Thượng tọa…). */
  abbottHonorific: string;
  /**
   * Scale hiển thị mockup (1 = mặc định).
   * Dùng khi khung ảnh có nhiều khoảng trống quanh chai.
   */
  mockupScale?: number;
}

const BRANDS: WaterBottleBrand[] = [
  {
    templeId: 'a084105a-d028-4f31-81e0-67d2628200f7',
    domains: [
      'thichminhthanh.com',
      'www.thichminhthanh.com',
      'covien.localhost',
    ],
    nameCaps: 'CHÙA CỔ VIỄN',
    altNameCaps: 'LINH QUANG TỰ',
    slogan: 'Ngôi chùa làng cổ kính bên sông Châu',
    addressShort: 'Bình An, Ninh Bình',
    abbott: 'Đại đức Thích Minh Thành',
    phoneDisplay: '0942 674 953',
    phoneRaw: '0942674953',
    siteUrl: 'https://thichminhthanh.com',
    domainLabel: 'thichminhthanh.com',
    color: '#6B1A1A',
    gold: '#D4AF37',
    cream: '#F3EBD8',
    mockupSrc: '/images/co-vien/nuoc-300ml-mockup.png',
    qrSvgSrc: '/images/co-vien/qr-thichminhthanh.svg',
    abbottHonorific: 'Đại đức Thích Minh Thành',
    // Ảnh Cổ Viễn có nhiều padding quanh chai hơn Quan Âm
    mockupScale: 1.12,
  },
  {
    templeId: 'a146d06d-8a26-45e4-863d-c90cb26c9ecd',
    domains: [
      'thichquangtrang.info',
      'www.thichquangtrang.info',
      'bachong.localhost',
      'quanam.localhost',
    ],
    nameCaps: 'CHÙA QUAN ÂM',
    altNameCaps: 'QUAN ÂM TỰ',
    slogan: 'Ngôi chùa của làng Quan Âm — Bắc Hồng, Đông Anh',
    addressShort: 'Đông Anh, Hà Nội',
    abbott: 'Thượng tọa Thích Quảng Trang',
    phoneDisplay: '0981 666 568',
    phoneRaw: '0981666568',
    siteUrl: 'https://thichquangtrang.info',
    domainLabel: 'thichquangtrang.info',
    color: '#2F5D3A',
    gold: '#D4AF37',
    cream: '#F3EBD8',
    mockupSrc: '/images/quan-am/nuoc-300ml-mockup.png',
    qrSvgSrc: '/images/quan-am/qr-thichquangtrang.svg',
    abbottHonorific: 'Thượng tọa Thích Quảng Trang',
  },
];

export function getWaterBottleBrand(
  temple: Pick<Temple, 'id' | 'domain'> | null | undefined,
): WaterBottleBrand | null {
  if (!temple) return null;
  const byId = BRANDS.find((b) => b.templeId === temple.id);
  if (byId) return byId;
  const domain = (temple.domain || '').toLowerCase();
  return BRANDS.find((b) => b.domains.includes(domain)) ?? null;
}

export function hasWaterBottleBrand(temple: Pick<Temple, 'id' | 'domain'>): boolean {
  return getWaterBottleBrand(temple) != null;
}
