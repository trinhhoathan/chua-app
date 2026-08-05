/**
 * Persona theo site (tenant):
 * - Chùa thường: người luận giải là "trụ trì", upsell = thỉnh nước.
 * - Site Lý Gia Phúc An: người luận giải là "Thầy Phong Thủy Phúc An",
 *   upsell = mua sim phong thủy / gọi thầy trực tiếp (KHÔNG thỉnh nước).
 *
 * Object này được truyền từ server component xuống client component
 * (chỉ chứa string thuần — serializable).
 */

import { isLyGiaPhucAnSite, LY_GIA, isLyGiaDomain } from '@/lib/ly-gia-phuc-an';
import { isSimStoreEnabled } from '@/lib/sim/warehouse';
import type { Temple } from '@/types/database';

export type SiteUpsell = 'water' | 'sim';

export interface SitePersona {
  /** 'water' → thỉnh nước mở khóa; 'sim' → mời mua sim / gọi thầy */
  upsell: SiteUpsell;
  /** Kho sim công khai (độc lập upsell water — chùa vẫn thỉnh nước). */
  simStoreEnabled: boolean;
  /** Danh xưng ngắn, viết thường giữa câu: "trụ trì" / "thầy" */
  role: string;
  /** Danh xưng viết hoa đầu mục: "Trụ trì" / "Thầy Phong Thủy" */
  roleTitle: string;
  /** Tên gọi đầy đủ: "trụ trì chùa X" / "Thầy Phong Thủy Phúc An" */
  displayName: string;
  /** Nhãn nút gọi điện */
  callLabel: string;
  /** Nhãn "đang luận…" khi chờ AI */
  thinkingLabel: string;
  /** Câu mở đầu system prompt cho AI */
  aiRoleIntro: string;
  /** Hướng dẫn kết bài cho AI (mời thỉnh nước / mời xem sim) */
  aiOutro: string;
}

export function getSitePersona(
  temple: Pick<
    Temple,
    'domain' | 'payment_code' | 'name' | 'sim_store_enabled'
  >,
): SitePersona {
  if (isLyGiaPhucAnSite(temple)) return LY_GIA_PERSONA;
  return waterPersona(temple.name, isSimStoreEnabled(temple));
}

/** Bản dùng cho TempleBrief (admin) — chỉ có domain + name. */
export function getSitePersonaByDomain(
  domain: string | null | undefined,
  templeName: string,
  simStoreEnabled = false,
): SitePersona {
  if (isLyGiaDomain(domain)) return LY_GIA_PERSONA;
  return waterPersona(templeName, simStoreEnabled);
}

const LY_GIA_PERSONA: SitePersona = {
  upsell: 'sim',
  simStoreEnabled: true,
  role: 'thầy',
  roleTitle: 'Thầy Phong Thủy',
  displayName: 'Thầy Phong Thủy Phúc An',
  callLabel: 'Gọi Thầy Phong Thủy',
  thinkingLabel: 'Thầy Phong Thủy Phúc An đang xem',
  aiRoleIntro: `với vai trò Thầy Phong Thủy Phúc An (${LY_GIA.name}), thầy phong thủy trực tiếp luận giải theo học thuật và kinh nghiệm cá nhân`,
  aiOutro:
    'Cuối bài, nếu phù hợp ngữ cảnh, mời người hỏi ghé Kho Sim Phong Thủy của thầy (trang /sim) để chọn dãy số hợp mệnh đã được chấm điểm sẵn, hoặc gọi thầy tư vấn trực tiếp. TUYỆT ĐỐI không nhắc đến "thỉnh nước", "công đức", "nhà chùa".',
};

function waterPersona(
  templeName: string,
  simStoreEnabled = false,
): SitePersona {
  const name = templeName.trim() || 'chùa';
  const simHint = simStoreEnabled
    ? ' Nếu phù hợp, có thể nhắc nhẹ Kho Sim Phong Thủy (/sim) để Phật tử chọn số hợp mệnh — công đức hỗ trợ Phật sự chùa.'
    : '';
  return {
    upsell: 'water',
    simStoreEnabled,
    role: 'trụ trì',
    roleTitle: 'Trụ trì',
    displayName: `trụ trì ${name}`,
    callLabel: 'Gọi trụ trì',
    thinkingLabel: 'Trụ trì đang xem',
    aiRoleIntro: `với vai trò trụ trì ${name}, người trực tiếp luận giải theo phương pháp và kinh nghiệm cá nhân gắn với ngôi chùa`,
    aiOutro:
      'Cuối bài có thể nhắc nhẹ: muốn luận sâu hơn có thể thỉnh nước ủng hộ chùa hoặc liên hệ trụ trì.' +
      simHint,
  };
}
