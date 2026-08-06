import type { FengShuiToolMeta, NavSection } from '@/lib/fengshui/tools';

export type ToolGuideCopy = {
  howTo: string[];
  benefit: string;
};

const SECTION_DEFAULTS: Record<
  NavSection,
  { howPrefix: string; benefit: string }
> = {
  hang_ngay: {
    howPrefix: 'Mở công cụ → chọn ngày cần xem → đọc kết quả nên / kiêng',
    benefit:
      'Phật tử tự xem ngày giờ tốt trước khi hỏi thầy — giảm tin nhắn lặt vặt, thầy tập trung việc hệ trọng.',
  },
  viec_he_trong: {
    howPrefix: 'Nhập năm sinh / ngày dự định → xem kết quả → ghi chú mang hỏi thầy',
    benefit:
      'Việc lớn (làm nhà, cưới, tang lễ, sao hạn…) tự kéo Phật tử về đàn lễ, sớ cầu và công đức tại chùa.',
  },
  tu_vi_bat_tu: {
    howPrefix: 'Nhập giờ sinh chính xác → lập lá số / bảng sao → hỏi luận giải AI nếu cần',
    benefit:
      'Lõi tử vi Quan Âm Trang Viện gắn tên trụ trì vào mọi phiên luận — thầy hiện diện 24/7, tạo phễu kết duyên mạnh.',
  },
  bat_cuc: {
    howPrefix: 'Nhập dãy số cần xem → đọc điểm / luận ngắn → hỏi AI sâu nếu còn lượt',
    benefit:
      'Phật tử quan tâm sim, biển số, STK… dễ chuyển sang kho sim hoặc gọi thầy tư vấn trực tiếp.',
  },
  tham_khao: {
    howPrefix: 'Chọn phương pháp → nhập từ khóa / gieo quẻ theo hướng dẫn trên màn hình',
    benefit:
      'Khách ở lại website lâu hơn, nhớ thương hiệu trụ trì, dễ quay lại khi cần việc hệ trọng.',
  },
  lich_le: {
    howPrefix: 'Xem lịch vía / khóa tu → đối chiếu sự kiện chùa đang đăng trên trang chủ',
    benefit: 'Đồng bộ lịch Phật sự số với nhu cầu tu học — Phật tử chủ động sắp xếp đi lễ.',
  },
  kinh_khan: {
    howPrefix: 'Chọn bài kinh / văn khấn phù hợp → đọc hoặc mang theo khi về lễ',
    benefit: 'Hỗ trợ Phật tử chuẩn bị nghi lễ đúng cách; giảm tải hướng dẫn lặp lại cho ban hộ tự.',
  },
  tu_hoc: {
    howPrefix: 'Mở công cụ → thực hành (xin xăm, gõ mõ, niệm Phật…) theo hướng dẫn',
    benefit:
      'Tăng duyên lành mỗi ngày; mốc công đức / xin xăm gợi ý thỉnh nước — nuôi quỹ Phật sự minh bạch.',
  },
  tham_gia: {
    howPrefix: 'Bấm vào liên kết → điền form hoặc phát tâm theo hướng dẫn trên trang',
    benefit:
      'Biến người xem thành Phật tử gắn bó: sổ đăng ký, sớ cầu, công đức nước — dữ liệu về tay trụ trì.',
  },
  tu_lieu: {
    howPrefix: 'Đọc tư liệu → chia sẻ cho người thân nếu hữu ích',
    benefit: 'Xây dựng uy tín học thuật–tâm linh cho trang chùa dưới tên trụ trì.',
  },
};

/** Override chi tiết theo slug — không nhắc tên engine bên thứ ba. */
const BY_SLUG: Partial<Record<string, ToolGuideCopy>> = {
  'lap-la-so-tu-vi': {
    howTo: [
      'Vào Phong thủy → Lập lá số tử vi.',
      'Nhập ngày giờ sinh (càng chính xác càng tốt).',
      'Xem đủ 12 cung, chính tinh – phụ tinh, tứ hóa.',
      'Chuyển sang Luận giải / Hạn năm / Đại vận để hỏi AI theo lá số thật.',
    ],
    benefit:
      'Lõi Đẩu Số do Quan Âm Trang Viện phát triển — cửa ngõ mạnh nhất kéo Phật tử hỏi sâu, hết lượt AI rồi gọi thầy hoặc thỉnh nước.',
  },
  'luan-giai-tu-vi': {
    howTo: [
      'Lập lá số trước, rồi mở Luận giải tử vi.',
      'Chọn phái luận (Bắc phái / Nam phái / Phi tinh) nếu được hỏi.',
      'Đặt câu hỏi cụ thể về cung mệnh, quan lộc, hạn đang đi.',
      'Hết 3 lượt miễn phí → thỉnh nước (nhập mã đơn) hoặc gọi trụ trì.',
    ],
    benefit:
      'AI nói bằng giọng trụ trì trên ngữ cảnh lá số thật — tiết kiệm giờ vàng của thầy, tăng uy tín ban trị sự.',
  },
  'sao-chieu-menh': {
    howTo: [
      'Nhập năm sinh → xem sao chiếu / Thái Tuế năm xem.',
      'Đối chiếu với lịch đàn Dâng sao giải hạn trên trang chủ.',
      'Đăng ký sớ cầu an online trước ngày đàn.',
    ],
    benefit: 'Tự động “kéo” nhu cầu giải hạn về đúng lễ đàn trụ trì đang tổ chức.',
  },
  'gieo-que-xin-xam': {
    howTo: [
      'Mở Xin xăm Quan Âm → thành tâm nguyện → gieo quẻ.',
      'Đọc lời xăm và hướng thiện.',
      'Có thể phát tâm thỉnh nước kết duyên sau khi xin xăm.',
    ],
    benefit: 'Trải nghiệm linh ứng online gắn thương hiệu chùa — dễ chia sẻ, dễ nhớ SĐT trụ trì.',
  },
  'boi-sim': {
    howTo: [
      'Nhập số điện thoại cần xem.',
      'Đọc vận khí / sự nghiệp theo linh số.',
      'Nếu kho sim đang bật: sang /sim chọn số hợp mệnh.',
    ],
    benefit: 'Cầu nối tự nhiên sang kho Sim phong thủy và tư vấn trực tiếp từ thầy.',
  },
  'cung-duong-nuoc': {
    howTo: [
      'Chọn số thùng → điền tên SĐT → thanh toán VietQR.',
      'Nhận nước mang nhãn chùa / trụ trì / QR website.',
    ],
    benefit: 'Mỗi chai là kênh quảng bá chân–thiện–mỹ và mở khóa thêm lượt luận giải AI.',
  },
  'so-cau-an-sieu': {
    howTo: [
      'Chọn cầu an hoặc cầu siêu → điền danh sách tên tuổi.',
      'Gửi đăng ký; chờ ban thư ký duyệt và đưa vào đàn.',
    ],
    benefit: 'Đàn đông không sót tên; trụ trì kiểm soát quy trình từ xa.',
  },
  'quy-y-tam-bao': {
    howTo: [
      'Điền form kết duyên / quy y trên web.',
      'Trụ trì bổ sung pháp danh trong sổ quản trị.',
    ],
    benefit: 'Số hóa sổ Phật tử — nền tảng gửi tin Zalo/SMS đúng người.',
  },
  'go-mo': {
    howTo: [
      'Vào Gõ mõ → chọn mõ / chuông / khánh.',
      'Đặt mục tiêu 108 / 300 / 1080; hồi hướng trên bảng vàng.',
    ],
    benefit: 'Đồng tu từ xa; mốc công đức gợi ý thỉnh nước không spam.',
  },
};

export function publicToolSubtitle(tool: FengShuiToolMeta): string {
  if (tool.slug === 'lap-la-so-tu-vi') {
    return '12 cung · tiếng Việt · lõi Quan Âm Trang Viện';
  }
  const cleaned = tool.subtitle
    .replace(/\biztro\b/gi, '')
    .replace(/\s*·\s*·\s*/g, ' · ')
    .replace(/^\s*·\s*|\s*·\s*$/g, '')
    .trim();
  return cleaned || tool.subtitle;
}

export function getToolGuideCopy(tool: FengShuiToolMeta): ToolGuideCopy {
  const override = BY_SLUG[tool.slug];
  if (override) return override;

  const def = SECTION_DEFAULTS[tool.navSection];
  return {
    howTo: [
      `Mở «${tool.title}» từ menu Phong thủy / Phật học hoặc hub tương ứng.`,
      `${def.howPrefix}.`,
      'Việc hệ trọng: lưu kết quả và thỉnh ý trực tiếp trụ trì trước khi quyết định.',
    ],
    benefit: def.benefit,
  };
}
