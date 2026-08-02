/**
 * Chấm điểm phong thủy cho sim khi tạo/sửa/import — precompute các cột
 * điểm của sim_listings từ engine Âm Dương Ngũ Hành (analyzeBoiSim).
 */

import { analyzeBoiSim, type BoiSimResult } from '@/lib/fengshui/boi-sim';
import { simQueNumber } from '@/lib/fengshui/sim-kinh-dich';
import {
  detectNetwork,
  detectSimTags,
  formatSimDisplay,
  normalizeSimPhone,
} from '@/lib/sim/catalog';
import { mergeDeepPurposeIntoAspects } from '@/lib/sim/purpose-scores';
import type { SimElement, SimVerdict } from '@/types/database';

export interface SimScorePayload {
  phone: string;
  phone_display: string;
  network: string;
  tags: string[];
  overall_score: number;
  du_nien_score: number;
  verdict: SimVerdict;
  nut: number;
  element: SimElement;
  so_ly_81: number;
  aspects: Record<string, number>;
  star_summary: Record<string, unknown>;
  careers: string[];
  /** Quẻ Kinh Dịch chủ (1–64, Mai Hoa Dịch Số) — null nếu không lập được */
  que_number: number | null;
}

/**
 * Chấm điểm 1 số sim. Trả null nếu số không hợp lệ hoặc engine không
 * luận được (quá nhiều 0/5 liên tiếp).
 */
export function buildSimScorePayload(rawPhone: string): SimScorePayload | null {
  const phone = normalizeSimPhone(rawPhone);
  if (!phone) return null;

  const result = analyzeBoiSim(phone);
  if ('error' in result) return null;

  return payloadFromResult(phone, result);
}

function payloadFromResult(
  phone: string,
  r: BoiSimResult,
): SimScorePayload {
  const baseAspects: Record<string, number> = {};
  for (const a of r.aspects) baseAspects[a.id] = a.score;
  const aspects = mergeDeepPurposeIntoAspects(baseAspects, r);

  return {
    phone,
    phone_display: formatSimDisplay(phone),
    network: detectNetwork(phone),
    tags: detectSimTags(phone),
    overall_score: r.overallScore,
    du_nien_score: r.duNienScore,
    verdict: r.verdict,
    nut: r.tongNut,
    element: r.soLyElement,
    so_ly_81: r.soLy81,
    aspects,
    star_summary: {
      catPairs: r.catPairs,
      hungPairs: r.hungPairs,
      starCounts: r.starCounts,
      patterns: r.patterns,
      tailLast3: r.tail.last3,
    },
    careers: r.careers,
    que_number: simQueNumber(phone),
  };
}

/* ------------------------------------------------------------------ */
/* Sinh sim mẫu ngẫu nhiên (seed 100 số trước khi có kho thật)         */
/* ------------------------------------------------------------------ */

const SEED_PREFIXES = [
  '096', '097', '098', '086', '033', '035', '036', '038', '039',
  '090', '093', '089', '070', '076', '077', '078', '079',
  '091', '094', '088', '081', '082', '083', '085',
];

const NICE_TAILS = [
  '6868', '8686', '6886', '8668', '3979', '7939', '3939', '7979',
  '3838', '7878', '1368', '1986', '1990', '1995', '2000', '6789',
  '2345', '5678', '1234', '8888', '9999', '6666', '1111', '2222',
  '1668', '1979', '1689', '2686', '5868', '8386', '6688', '8899',
  '6699', '3399', '1199', '9779', '9339', '6996', '8998', '1221',
];

function randInt(max: number): number {
  return Math.floor(Math.random() * max);
}

function randomDigits(n: number): string {
  let s = '';
  for (let i = 0; i < n; i++) s += String(randInt(10));
  return s;
}

/** Giá đề xuất theo điểm + kiểu số (VND, làm tròn đẹp). */
export function suggestSimPrice(payload: SimScorePayload): number {
  let base = 500_000;
  const tags = new Set(payload.tags);
  if (tags.has('luc-quy')) base = 250_000_000;
  else if (tags.has('ngu-quy')) base = 80_000_000;
  else if (tags.has('tu-quy')) base = 25_000_000;
  else if (tags.has('tam-hoa-kep')) base = 12_000_000;
  else if (tags.has('taxi')) base = 6_000_000;
  else if (tags.has('loc-phat') || tags.has('than-tai')) base = 3_500_000;
  else if (tags.has('tam-hoa') || tags.has('so-tien')) base = 2_500_000;
  else if (tags.has('ganh-dao') || tags.has('lap-kep')) base = 1_500_000;
  else if (tags.has('nam-sinh') || tags.has('ong-dia')) base = 1_200_000;

  // Điểm phong thủy cao đẩy giá lên tối đa ~2.2x, điểm thấp hạ còn ~0.6x
  const factor = 0.6 + (Math.max(30, Math.min(95, payload.overall_score)) - 30) / 40;
  const raw = base * factor;

  // Làm tròn về bậc đẹp
  const step =
    raw >= 50_000_000 ? 5_000_000 : raw >= 10_000_000 ? 1_000_000 : raw >= 2_000_000 ? 100_000 : 50_000;
  const price = Math.max(399_000, Math.round(raw / step) * step);
  return price;
}

export interface GeneratedSim {
  payload: SimScorePayload;
  price_vnd: number;
  original_price_vnd: number | null;
  featured: boolean;
}

/**
 * Sinh `count` sim mẫu (số ngẫu nhiên thiên về đuôi đẹp), đã chấm điểm
 * và định giá. Bỏ qua số trùng và số engine không luận được.
 */
export function generateDemoSims(
  count: number,
  existingPhones: Set<string>,
): GeneratedSim[] {
  const out: GeneratedSim[] = [];
  const seen = new Set(existingPhones);
  let attempts = 0;

  while (out.length < count && attempts < count * 40) {
    attempts++;
    const prefix = SEED_PREFIXES[randInt(SEED_PREFIXES.length)];
    // 70% dùng đuôi đẹp, 30% ngẫu nhiên hoàn toàn
    const useNiceTail = Math.random() < 0.7;
    const tail = useNiceTail
      ? NICE_TAILS[randInt(NICE_TAILS.length)]
      : randomDigits(4);
    const middle = randomDigits(10 - prefix.length - tail.length);
    const phone = `${prefix}${middle}${tail}`;

    if (seen.has(phone)) continue;
    const payload = buildSimScorePayload(phone);
    if (!payload) continue;

    seen.add(phone);
    const price = suggestSimPrice(payload);
    // 60% sim có "giá gạch" cao hơn 15–40% để kích cầu
    const hasOriginal = Math.random() < 0.6;
    const original = hasOriginal
      ? Math.round((price * (1.15 + Math.random() * 0.25)) / 50_000) * 50_000
      : null;

    out.push({
      payload,
      price_vnd: price,
      original_price_vnd: original,
      featured: payload.overall_score >= 82 && Math.random() < 0.5,
    });
  }

  return out;
}
