/**
 * Sim theo ngành nghề — mỗi ngành thuộc một hành ngũ hành (theo phép
 * phân loại nghề nghiệp ngũ hành cổ truyền), kèm phương diện luận số
 * cần ưu tiên. Dùng cho bộ lọc "Sim theo ngành nghề" và luận giải.
 */

import type { SimElement, SimListing } from '@/types/database';

export interface SimCareer {
  id: string;
  label: string;
  /** Hành của ngành nghề */
  element: SimElement;
  /** Trọng số phương diện luận số cần mạnh cho nghề này */
  aspectWeights: Record<string, number>;
  /** Ví dụ nghề cụ thể */
  examples: string;
  /** Vì sao ngành này thuộc hành đó + sim thế nào là hợp */
  blurb: string;
}

export const SIM_CAREERS: SimCareer[] = [
  {
    id: 'ban-hang-online',
    label: 'Bán hàng online – livestream',
    element: 'hoa',
    aspectWeights: { tai_loc: 0.4, tinh_cam: 0.3, quy_nhan: 0.3 },
    examples: 'Chốt đơn livestream, shop TikTok/Shopee, CTV online, dropship',
    blurb:
      'Sóng mạng, màn hình, ánh đèn livestream thuộc hành Hỏa. Hợp sim hành Hỏa/Mộc; ưu tiên Sinh Khí dẫn khách vào phiên live, Họa Hại nhẹ lại thành khẩu tài chốt đơn — số dễ đọc dễ nhớ để khách gọi lại.',
  },
  {
    id: 'tai-xe-giao-van',
    label: 'Tài xế – giao vận đường bộ',
    element: 'thuy',
    aspectWeights: { bao_an: 0.4, tai_loc: 0.3, giai_han: 0.3 },
    examples: 'Xe tải, xe khách, xe công nghệ, shipper, container, cho thuê xe',
    blurb:
      'Nghề bánh xe lăn, lưu chuyển không ngừng thuộc hành Thủy. Hợp sim hành Thủy/Kim; đặt bảo an và giải hạn lên trước tài lộc — thượng lộ bình an rồi chuyến hàng mới trọn, kỵ Tuyệt Mệnh đóng đuôi số.',
  },
  {
    id: 'bat-dong-san',
    label: 'Bất động sản – xây dựng',
    element: 'tho',
    aspectWeights: { tai_loc: 0.5, quy_nhan: 0.3, su_nghiep: 0.2 },
    examples: 'Môi giới nhà đất, chủ thầu, vật liệu xây dựng, kho bãi',
    blurb:
      'Nghề gắn với đất đai thuộc hành Thổ. Nên chọn sim hành Thổ hoặc hành Hỏa (Hỏa sinh Thổ), ưu tiên dãy có Thiên Y – Diên Niên để vừa chốt được kèo lớn vừa giữ được lời.',
  },
  {
    id: 'tai-chinh',
    label: 'Tài chính – vàng bạc',
    element: 'kim',
    aspectWeights: { tai_loc: 0.6, su_nghiep: 0.4 },
    examples: 'Ngân hàng, chứng khoán, bảo hiểm, kim hoàn, cầm đồ',
    blurb:
      'Tiền tệ, kim loại quý thuộc hành Kim. Hợp sim hành Kim hoặc hành Thổ (Thổ sinh Kim); cấu trúc lý tưởng là Thiên Y (chính tài) đóng đuôi, kỵ Tuyệt Mệnh phá tài ở 3 số cuối.',
  },
  {
    id: 'kinh-doanh-thuc-pham',
    label: 'Thực phẩm – nhà hàng',
    element: 'hoa',
    aspectWeights: { tai_loc: 0.5, quy_nhan: 0.3, tinh_cam: 0.2 },
    examples: 'Kinh doanh thịt, quán ăn, bếp núc, chế biến, cà phê',
    blurb:
      'Bếp lửa, chế biến, nhiệt thuộc hành Hỏa. Nên dùng sim hành Hỏa hoặc hành Mộc (Mộc sinh Hỏa); dãy có Sinh Khí – Họa Hại nhẹ lại lợi khẩu tài, buôn bán đắt khách.',
  },
  {
    id: 'thoi-trang-vai',
    label: 'Quần áo – vải sợi',
    element: 'moc',
    aspectWeights: { tai_loc: 0.4, tinh_cam: 0.3, quy_nhan: 0.3 },
    examples: 'Shop quần áo, vải sợi, may mặc, đồ gỗ, văn phòng phẩm',
    blurb:
      'Vải sợi, cây cỏ, giấy gỗ thuộc hành Mộc. Hợp sim hành Mộc hoặc hành Thủy (Thủy sinh Mộc); nên có Sinh Khí dẫn khách, Lục Sát nhẹ lại thêm gu thẩm mỹ, khéo chiều khách.',
  },
  {
    id: 'logistics-thuy-san',
    label: 'Vận tải – thủy sản',
    element: 'thuy',
    aspectWeights: { tai_loc: 0.4, su_nghiep: 0.4, suc_khoe: 0.2 },
    examples: 'Logistics, xuất nhập khẩu, du lịch, thủy hải sản, đồ uống',
    blurb:
      'Nghề lưu chuyển, sông nước thuộc hành Thủy. Nên chọn sim hành Thủy hoặc hành Kim (Kim sinh Thủy); dãy nhiều Diên Niên giúp vận hành bền bỉ, giữ mối lâu dài.',
  },
  {
    id: 'cong-nghe',
    label: 'Công nghệ – sáng tạo',
    element: 'hoa',
    aspectWeights: { su_nghiep: 0.5, tai_loc: 0.3, quy_nhan: 0.2 },
    examples: 'Phần mềm, điện tử, truyền thông, thiết kế, quảng cáo',
    blurb:
      'Điện – tín hiệu – ánh sáng thuộc hành Hỏa. Hợp sim hành Hỏa/Mộc; cấu trúc có Ngũ Quỷ được chế hóa lại là "sao tài hoa", lợi ý tưởng đột phá và sản phẩm khác biệt.',
  },
  {
    id: 'y-duoc',
    label: 'Y dược – chăm sóc sức khỏe',
    element: 'moc',
    aspectWeights: { suc_khoe: 0.4, quy_nhan: 0.3, su_nghiep: 0.3 },
    examples: 'Phòng khám, nhà thuốc, spa trị liệu, dưỡng sinh',
    blurb:
      'Y dược cổ truyền thuộc Mộc (thảo dược, dưỡng sinh). Nên dùng sim hành Mộc/Thủy, ưu tiên dãy nhiều Thiên Y — đúng nghĩa "trời cho thầy thuốc", vừa mát tay vừa vượng chính tài.',
  },
  {
    id: 'giao-duc',
    label: 'Giáo dục – đào tạo',
    element: 'moc',
    aspectWeights: { su_nghiep: 0.4, quy_nhan: 0.4, tinh_cam: 0.2 },
    examples: 'Giáo viên, trung tâm đào tạo, xuất bản, tư vấn',
    blurb:
      'Trồng người, sách vở thuộc hành Mộc. Hợp sim hành Mộc/Thủy; Sinh Khí và Diên Niên mạnh giúp có quý nhân nâng đỡ và uy tín chuyên môn bền vững.',
  },
  {
    id: 'lam-dep',
    label: 'Làm đẹp – dịch vụ',
    element: 'hoa',
    aspectWeights: { tinh_cam: 0.4, tai_loc: 0.3, quy_nhan: 0.3 },
    examples: 'Salon tóc, nail, mỹ phẩm, tiệc cưới, giải trí',
    blurb:
      'Nghề tôn nhan sắc, ánh đèn sân khấu thuộc hành Hỏa. Nên chọn sim hành Hỏa/Mộc; Lục Sát được chế hóa lại thành lợi thế giao tế, khách nữ quý mến.',
  },
  {
    id: 'phap-ly-hanh-chinh',
    label: 'Pháp lý – hành chính',
    element: 'kim',
    aspectWeights: { su_nghiep: 0.5, quy_nhan: 0.3, tai_loc: 0.2 },
    examples: 'Luật sư, công chứng, cơ quan nhà nước, quân đội – công an',
    blurb:
      'Kỷ cương, khuôn phép, binh khí thuộc hành Kim. Hợp sim hành Kim/Thổ; Diên Niên mạnh chủ quyền uy và thăng tiến theo bậc thang rõ ràng.',
  },
  {
    id: 'nong-nghiep',
    label: 'Nông nghiệp – chăn nuôi',
    element: 'tho',
    aspectWeights: { tai_loc: 0.4, suc_khoe: 0.3, su_nghiep: 0.3 },
    examples: 'Trang trại, chăn nuôi, phân bón, thức ăn gia súc',
    blurb:
      'Đất đai mùa vụ thuộc hành Thổ. Nên dùng sim hành Thổ/Hỏa; cấu trúc cân bằng âm dương giúp mùa màng – đàn vật nuôi ổn định, tránh dãy nhiều số 0 (khí trệ).',
  },
  {
    id: 'dau-tu',
    label: 'Đầu tư – kinh doanh mạo hiểm',
    element: 'kim',
    aspectWeights: { tai_loc: 0.6, su_nghiep: 0.2, quy_nhan: 0.2 },
    examples: 'Trader, crypto, đầu tư mạo hiểm, đấu giá',
    blurb:
      'Dòng vốn lớn thuộc hành Kim. Người bản lĩnh có thể dùng dãy Tuyệt Mệnh được Thiên Y chế hóa — dám đánh lớn nhưng vẫn có sao tài giữ cửa; kỵ nhất Tuyệt Mệnh trơ trọi ở đuôi.',
  },
];

export function careerById(id?: string): SimCareer | undefined {
  return SIM_CAREERS.find((c) => c.id === id);
}

const SINH_SIM: Record<SimElement, SimElement> = {
  kim: 'thuy',
  thuy: 'moc',
  moc: 'hoa',
  hoa: 'tho',
  tho: 'kim',
};

/** Các hành sim phù hợp với một ngành (chính hành + hành sinh cho nó). */
export function careerCompatibleElements(career: SimCareer): SimElement[] {
  const sinhChoNganh = (Object.keys(SINH_SIM) as SimElement[]).find(
    (e) => SINH_SIM[e] === career.element,
  );
  return sinhChoNganh ? [career.element, sinhChoNganh] : [career.element];
}

/** Điểm hợp nghề 0–100 của một sim với một ngành. */
export function careerFitScore(
  sim: Pick<SimListing, 'element' | 'overall_score' | 'aspects'>,
  career: SimCareer,
): number {
  let elementScore = 55;
  if (sim.element === career.element) elementScore = 95;
  else if (SINH_SIM[sim.element] === career.element) elementScore = 85;
  else if (SINH_SIM[career.element] === sim.element) elementScore = 65;

  let aspectScore = 0;
  let totalW = 0;
  for (const [aspect, w] of Object.entries(career.aspectWeights)) {
    aspectScore += Number(sim.aspects?.[aspect] ?? 60) * w;
    totalW += w;
  }
  aspectScore = totalW > 0 ? aspectScore / totalW : 60;

  return Math.round(
    elementScore * 0.4 + aspectScore * 0.35 + sim.overall_score * 0.25,
  );
}
