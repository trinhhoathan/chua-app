/**
 * Điểm mục đích sâu cho sim — nhóm Bình An/Giải Hạn và Gia Đạo/Tình Duyên.
 * Tính từ cấu trúc sao Âm Dương Ngũ Hành (starCounts, combos, âm dương, aspects gốc).
 */

import type { BoiSimResult } from '@/lib/fengshui/boi-sim';
import type { StarId } from '@/lib/fengshui/bat-cuc';

export type DeepPurposeId =
  | 'giai_han'
  | 'bao_an'
  | 'can_bang'
  | 'tinh_duyen'
  | 'gia_dao'
  | 'con_cai';

function clamp(n: number): number {
  return Math.max(0, Math.min(100, Math.round(n)));
}

function count(stars: Record<string, number>, id: StarId): number {
  return Number(stars[id] ?? 0);
}

function aspectOf(r: BoiSimResult, id: string): number {
  return Number(r.aspects.find((a) => a.id === id)?.score ?? 55);
}

/**
 * Chấm 6 mục đích sâu từ kết quả Bói Sim / Âm Dương Ngũ Hành.
 */
export function computeDeepPurposeScores(
  r: BoiSimResult,
): Record<DeepPurposeId, number> {
  const s = r.starCounts;
  const sinh = count(s, 'sinh_khi');
  const thien = count(s, 'thien_y');
  const dien = count(s, 'dien_nien');
  const phuc = count(s, 'phuc_vi');
  const hoa = count(s, 'hoa_hai');
  const luc = count(s, 'luc_sat');
  const quy = count(s, 'ngu_quy');
  const tuyet = count(s, 'tuyet_menh');

  const cheHoa = r.combos.filter((c) => c.kind === 'che_hoa').length;
  const catRatio =
    r.catPairs + r.hungPairs > 0
      ? r.catPairs / (r.catPairs + r.hungPairs)
      : 0.5;
  const nutBonus = r.tongNut === 1 || r.tongNut === 6 || r.tongNut === 8 ? 10 : 0;
  const tailStar = r.tail.star?.id;
  const tailCat =
    tailStar === 'sinh_khi' ||
    tailStar === 'thien_y' ||
    tailStar === 'dien_nien' ||
    tailStar === 'phuc_vi'
      ? 8
      : 0;
  const tailHung =
    tailStar === 'tuyet_menh' ? -14 : tailStar === 'ngu_quy' ? -8 : 0;

  const taiLoc = aspectOf(r, 'tai_loc');
  const suNghiep = aspectOf(r, 'su_nghiep');
  const tinhCam = aspectOf(r, 'tinh_cam');
  const sucKhoe = aspectOf(r, 'suc_khoe');
  const quyNhan = aspectOf(r, 'quy_nhan');

  // 1) Giải Hạn – Trừ Tà – Tăng Vượng Khí
  //    Cát át hung, nhiều Sinh Khí/Thiên Y, có chế hóa, đuôi không tuyệt
  const giai_han = clamp(
    catRatio * 38 +
      sinh * 9 +
      thien * 7 +
      dien * 4 +
      cheHoa * 11 +
      quyNhan * 0.12 +
      sucKhoe * 0.1 +
      nutBonus * 0.5 +
      tailCat +
      tailHung -
      tuyet * 11 -
      (quy > 2 ? (quy - 2) * 4 : 0) +
      18,
  );

  // 2) Bảo An Sức Khỏe – Bách Bệnh Tiêu Tan
  //    Sức khỏe cao, Phục Vị/Diên Niên ổn định, âm dương cân, tránh Tuyệt/Ngũ Quỷ
  const bao_an = clamp(
    sucKhoe * 0.42 +
      r.amDuongScore * 0.18 +
      phuc * 8 +
      dien * 6 +
      sinh * 5 +
      thien * 3 +
      nutBonus * 0.4 +
      tailCat * 0.6 -
      tuyet * 12 -
      quy * 5 -
      hoa * 3 +
      16,
  );

  // 3) Hóa Giải Tứ Hành Xung / Cân Bằng Âm Dương
  //    Âm dương cân là trục; Phục Vị ổn định; không lệch cát/hung quá cực
  const balanceSpread = Math.abs(r.catPairs - r.hungPairs);
  const can_bang = clamp(
    r.amDuongScore * 0.52 +
      phuc * 9 +
      dien * 4 +
      sinh * 3 +
      Math.max(0, 18 - balanceSpread * 3) +
      (r.amCount > 0 && r.duongCount > 0 ? 8 : 0) +
      cheHoa * 4 -
      tuyet * 8 -
      Math.abs(r.amCount - r.duongCount) * 2 +
      10,
  );

  // 4) Kích Tình Duyên – Vượng Trắc Trở
  //    Thiên Y (chính đào hoa) + tình cảm + Sinh Khí; Lục Sát vừa phải (duyên)
  const lucBonus = Math.min(luc, 2) * 6 - Math.max(0, luc - 2) * 4;
  const tinh_duyen = clamp(
    tinhCam * 0.38 +
      thien * 11 +
      sinh * 7 +
      lucBonus +
      quyNhan * 0.12 +
      (tailStar === 'thien_y' || tailStar === 'sinh_khi' ? 10 : 0) +
      nutBonus * 0.3 -
      tuyet * 9 -
      hoa * 4 +
      14,
  );

  // 5) Gia Đạo Hòa Thuận – An Yên
  //    Tình cảm + quý nhân + Diên Niên/Phục Vị (giữ gìn); kỵ Họa Hại khẩu thiệt & Tuyệt
  const gia_dao = clamp(
    tinhCam * 0.28 +
      quyNhan * 0.22 +
      dien * 8 +
      phuc * 8 +
      sinh * 5 +
      thien * 4 +
      r.amDuongScore * 0.08 +
      cheHoa * 5 -
      hoa * 9 -
      tuyet * 11 -
      quy * 3 +
      16,
  );

  // 6) Vượng Con Cái (Cầu Tự)
  //    Sinh Khí = sinh khí / sinh nở; Thiên Y phù trợ; kỵ Tuyệt Mệnh (tuyệt = đoạn)
  const con_cai = clamp(
    sinh * 15 +
      thien * 7 +
      tinhCam * 0.18 +
      sucKhoe * 0.14 +
      quyNhan * 0.1 +
      nutBonus +
      (tailStar === 'sinh_khi' ? 12 : tailStar === 'thien_y' ? 6 : 0) -
      tuyet * 16 -
      (r.tail.warning ? 8 : 0) +
      12,
  );

  // Giữ tham chiếu nhẹ tới tài/sự để điểm không lệch quá xa tổng thể
  void taiLoc;
  void suNghiep;

  return { giai_han, bao_an, can_bang, tinh_duyen, gia_dao, con_cai };
}

/** Gộp điểm sâu vào object aspects (cùng jsonb với 5 phương diện gốc). */
export function mergeDeepPurposeIntoAspects(
  baseAspects: Record<string, number>,
  r: BoiSimResult,
): Record<string, number> {
  return { ...baseAspects, ...computeDeepPurposeScores(r) };
}
