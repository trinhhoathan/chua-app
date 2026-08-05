/**
 * Branding / liên hệ kho sim theo temple đang bán (đại lý),
 * không hardcode Lý Gia trên site chùa.
 *
 * Danh xưng: thầy (Lý Gia) · trụ trì (chùa).
 */

import { isLyGiaPhucAnSite, LY_GIA } from '@/lib/ly-gia-phuc-an';
import type { Temple } from '@/types/database';

export function simStoreTitle(templeName: string): string {
  return `Kho Sim Phong Thủy ${templeName.trim() || ''}`.trim();
}

export function simStoreContact(
  temple: Pick<
    Temple,
    'domain' | 'payment_code' | 'name' | 'hotline' | 'contact_links' | 'abbott_name'
  >,
) {
  const isLyGia = isLyGiaPhucAnSite(temple);
  /** Viết thường giữa câu: "nhắn Zalo để thầy/trụ trì …" */
  const role = isLyGia ? 'thầy' : 'trụ trì';
  /** Viết hoa đầu câu / nhãn nút: "Thầy sẽ liên hệ" / "Trụ trì sẽ liên hệ" */
  const roleTitle = isLyGia ? 'Thầy' : 'Trụ trì';

  const hotlineRaw =
    temple.hotline?.trim() ||
    temple.contact_links?.phone?.trim() ||
    (isLyGia ? LY_GIA.phone : '');
  const phoneDisplay = isLyGia
    ? LY_GIA.phoneDisplay
    : hotlineRaw || '';
  const zaloUrl = isLyGia
    ? LY_GIA.zaloUrl
    : temple.contact_links?.zalo?.trim() ||
      (hotlineRaw
        ? `https://zalo.me/${hotlineRaw.replace(/\s+/g, '')}`
        : LY_GIA.zaloUrl);

  const advisor =
    temple.abbott_name?.trim() ||
    (isLyGia ? 'Thầy Lý Gia Phúc An' : `trụ trì ${temple.name}`);

  return {
    isLyGia,
    role,
    roleTitle,
    phoneDisplay,
    hotlineRaw,
    zaloUrl,
    advisor,
    eyebrow: isLyGia
      ? 'Sim phong thủy · Thầy tuyển chọn'
      : 'Sim phong thủy · Trụ trì tuyển chọn',
  };
}
