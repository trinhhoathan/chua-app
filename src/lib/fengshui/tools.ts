/**
 * Catalog công cụ tâm linh — sắp xếp theo việc nhà chùa (ưu tiên) → cổ học → tham khảo.
 */

export type ToolDomain = 'phong_thuy' | 'co_hoc' | 'phat_hoc';
export type ToolStatus = 'ready' | 'coming_soon';

/** Nhóm hiển thị trên mega-menu / hub. */
export type NavSection =
  | 'hang_ngay'
  | 'viec_he_trong'
  | 'tu_vi_bat_tu'
  | 'tham_khao'
  | 'lich_le'
  | 'kinh_khan'
  | 'tu_hoc'
  | 'tham_gia'
  | 'tu_lieu';

export type ToolCategory =
  | 'Lịch pháp'
  | 'Xây dựng'
  | 'Cưới hỏi'
  | 'Ma chay'
  | 'Kinh doanh'
  | 'Gia đình'
  | 'Tử vi'
  | 'Tứ trụ'
  | 'Kinh Dịch'
  | 'Thần số'
  | 'Tướng số'
  | 'Lịch lễ'
  | 'Kinh sách'
  | 'Nghi lễ Phật'
  | 'Tu học'
  | 'Tham gia'
  | 'Tư liệu';

export interface FengShuiToolMeta {
  slug: string;
  title: string;
  subtitle: string;
  category: ToolCategory;
  domain: ToolDomain;
  navSection: NavSection;
  status: ToolStatus;
  description: string;
  /** Link ngoài trang tool (vd. /so-cau, /dang-ky-phat-tu). */
  href?: string;
}

export const DOMAIN_LABELS: Record<ToolDomain, string> = {
  phong_thuy: 'Nghi lễ · Phong thủy',
  co_hoc: 'Cổ học · Mệnh lý',
  phat_hoc: 'Phật học · Tâm linh',
};

/** Nhãn đầy đủ (hub, trang chủ). */
export const NAV_SECTION_LABELS: Record<NavSection, string> = {
  hang_ngay: 'Dùng mỗi ngày',
  viec_he_trong: 'Việc hệ trọng',
  tu_vi_bat_tu: 'Tử vi · Bát tự',
  tham_khao: 'Tham khảo thêm',
  lich_le: 'Lịch lễ · Vía',
  kinh_khan: 'Kinh · Văn khấn',
  tu_hoc: 'Tu học',
  tham_gia: 'Tham gia cùng chùa',
  tu_lieu: 'Tư liệu',
};

/** Nhãn ngắn cho mega-menu — một dòng, cột thẳng hàng. */
export const NAV_SECTION_MENU_LABELS: Record<NavSection, string> = {
  hang_ngay: 'Mỗi ngày',
  viec_he_trong: 'Hệ trọng',
  tu_vi_bat_tu: 'Tử vi',
  tham_khao: 'Tham khảo',
  lich_le: 'Lịch lễ',
  kinh_khan: 'Kinh · khấn',
  tu_hoc: 'Tu học',
  tham_gia: 'Tham gia',
  tu_lieu: 'Tư liệu',
};

/** Thứ tự section trên mega-menu Phong thủy. */
export const PHONG_THUY_NAV_ORDER: NavSection[] = [
  'hang_ngay',
  'viec_he_trong',
  'tu_vi_bat_tu',
  'tham_khao',
];

/** Thứ tự section trên mega-menu Phật học (4 cột / 1 hàng). */
export const PHAT_HOC_NAV_ORDER: NavSection[] = [
  'lich_le',
  'kinh_khan',
  'tu_hoc',
  'tham_gia',
];

export const FENGSHUI_TOOLS: FengShuiToolMeta[] = [
  // —— Dùng mỗi ngày ——
  {
    slug: 'lich-van-nien',
    title: 'Lịch vạn niên',
    subtitle: 'Âm dương · nên · kiêng',
    category: 'Lịch pháp',
    domain: 'co_hoc',
    navSection: 'hang_ngay',
    status: 'ready',
    description:
      'Lịch vạn niên âm dương, Can Chi, Hoàng đạo / Hắc đạo và nhật lịch nên — kiêng chi tiết theo từng ngày.',
  },
  {
    slug: 'doi-am-duong',
    title: 'Đổi ngày âm ↔ dương',
    subtitle: 'Chuyển đổi lịch nhanh',
    category: 'Lịch pháp',
    domain: 'co_hoc',
    navSection: 'hang_ngay',
    status: 'ready',
    description:
      'Đổi nhanh giữa lịch dương và lịch âm theo thuật toán lịch Việt.',
  },
  {
    slug: 'gio-hoang-dao',
    title: 'Giờ Hoàng đạo hôm nay',
    subtitle: 'Giờ tốt trong ngày',
    category: 'Lịch pháp',
    domain: 'co_hoc',
    navSection: 'hang_ngay',
    status: 'ready',
    description:
      'Xem các giờ Hoàng đạo / Hắc đạo theo chi ngày — tham khảo chọn giờ việc lành.',
  },
  {
    slug: 'xuat-hanh',
    title: 'Hướng xuất hành',
    subtitle: 'Hướng tốt theo ngày',
    category: 'Lịch pháp',
    domain: 'phong_thuy',
    navSection: 'hang_ngay',
    status: 'ready',
    description: 'Gợi ý hướng xuất hành theo ngày — hỗ trợ Phật tử đi lễ, công việc.',
  },
  {
    slug: 'lich-dung-su',
    title: 'Lịch dụng sự · ngày tốt',
    subtitle: 'Việc nên · không nên',
    category: 'Lịch pháp',
    domain: 'co_hoc',
    navSection: 'hang_ngay',
    status: 'ready',
    description:
      'Gợi ý ngày tốt theo việc: cưới hỏi, động thổ, khai trương, ký hợp đồng…',
  },

  // —— Việc hệ trọng (ready sẵn) ——
  {
    slug: 'dong-tho',
    title: 'Xem tuổi làm nhà',
    subtitle: 'Kim Lâu · Hoang Ốc · Tam Tai',
    category: 'Xây dựng',
    domain: 'phong_thuy',
    navSection: 'viec_he_trong',
    status: 'ready',
    description:
      'Nhập năm sinh và năm dự định làm nhà để tra Kim Lâu, Hoang Ốc, Tam Tai.',
  },
  {
    slug: 'muon-tuoi-lam-nha',
    title: 'Mượn tuổi làm nhà',
    subtitle: 'Khi tuổi phạm Kim Lâu',
    category: 'Xây dựng',
    domain: 'phong_thuy',
    navSection: 'viec_he_trong',
    status: 'ready',
    description:
      'Gợi ý người mượn tuổi phù hợp khi chủ nhà phạm Kim Lâu / Hoang Ốc.',
  },
  {
    slug: 'khoi-cong',
    title: 'Khởi công động thổ',
    subtitle: 'Chọn ngày Hoàng đạo',
    category: 'Xây dựng',
    domain: 'phong_thuy',
    navSection: 'viec_he_trong',
    status: 'ready',
    description: 'Kiểm tra ngày khởi công, động thổ có thuận hay không.',
  },
  {
    slug: 'huong-nha',
    title: 'Chọn hướng nhà',
    subtitle: 'Bát trạch theo tuổi',
    category: 'Xây dựng',
    domain: 'phong_thuy',
    navSection: 'viec_he_trong',
    status: 'ready',
    description: 'Tính cung mệnh và 4 hướng nhà tốt theo Bát trạch.',
  },
  {
    slug: 'nhap-trach',
    title: 'Nhập trạch — về nhà mới',
    subtitle: 'Chọn ngày lành',
    category: 'Xây dựng',
    domain: 'phong_thuy',
    navSection: 'viec_he_trong',
    status: 'ready',
    description: 'Kiểm tra ngày về nhà mới có hợp tuổi và Hoàng đạo.',
  },
  {
    slug: 'cuoi-hoi',
    title: 'Xem tuổi cưới hỏi',
    subtitle: 'Tam hợp · Lục hợp · Lục xung',
    category: 'Cưới hỏi',
    domain: 'phong_thuy',
    navSection: 'viec_he_trong',
    status: 'ready',
    description: 'Xét hợp tuổi cô dâu – chú rể trước khi định ngày.',
  },
  {
    slug: 'ma-chay',
    title: 'Ngày giờ mai táng',
    subtitle: 'Ngày ÂL · chi ngày · giờ',
    category: 'Ma chay',
    domain: 'phong_thuy',
    navSection: 'viec_he_trong',
    status: 'ready',
    description: 'Gợi ý ngày giờ mai táng theo nếp dân gian.',
  },
  {
    slug: 'trung-tang',
    title: 'Kiểm tra Trùng tang',
    subtitle: 'Trùng tang · Nhập mộ · Thiên di',
    category: 'Ma chay',
    domain: 'phong_thuy',
    navSection: 'viec_he_trong',
    status: 'ready',
    description: 'Tra tam bàn Trùng tang / Nhập mộ / Thiên di.',
  },
  {
    slug: 'cai-tang',
    title: 'Cải táng · bốc mộ',
    subtitle: 'Chọn ngày cải táng',
    category: 'Ma chay',
    domain: 'phong_thuy',
    navSection: 'viec_he_trong',
    status: 'ready',
    description: 'Hỗ trợ chọn ngày cải táng / bốc mộ — tham vấn trụ trì.',
  },
  {
    slug: 'sinh-con',
    title: 'Năm sinh con tốt',
    subtitle: 'Dành cho mẹ',
    category: 'Gia đình',
    domain: 'phong_thuy',
    navSection: 'viec_he_trong',
    status: 'ready',
    description: 'Gợi ý năm sinh con, tránh Kim Lâu, Tam Tai, xung năm.',
  },
  {
    slug: 'khai-truong',
    title: 'Khai trương công ty',
    subtitle: 'Ngày ra mắt thuận lợi',
    category: 'Kinh doanh',
    domain: 'phong_thuy',
    navSection: 'viec_he_trong',
    status: 'ready',
    description: 'Kiểm tra ngày khai trương có hợp tuổi chủ doanh nghiệp.',
  },
  {
    slug: 'mo-cua-hang',
    title: 'Mở cửa hàng',
    subtitle: 'Ngày khởi sự buôn bán',
    category: 'Kinh doanh',
    domain: 'phong_thuy',
    navSection: 'viec_he_trong',
    status: 'ready',
    description: 'Kiểm tra ngày mở cửa hàng có thuận lợi.',
  },
  {
    slug: 'sao-chieu-menh',
    title: 'Sao chiếu mệnh · Thái Tuế',
    subtitle: 'Hạn sao theo năm',
    category: 'Gia đình',
    domain: 'phong_thuy',
    navSection: 'viec_he_trong',
    status: 'ready',
    description:
      'Xem sao chiếu mệnh / Thái Tuế năm nay — gắn với lễ dâng sao giải hạn tại chùa.',
  },

  // —— Tử vi · Bát tự ——
  {
    slug: 'lap-la-so-tu-vi',
    title: 'Lập lá số tử vi',
    subtitle: 'iztro · 12 cung · tiếng Việt',
    category: 'Tử vi',
    domain: 'co_hoc',
    navSection: 'tu_vi_bat_tu',
    status: 'ready',
    description: '',
  },
  {
    slug: 'luan-giai-tu-vi',
    title: 'Luận giải tử vi',
    subtitle: 'Hạn · cung · các phái',
    category: 'Tử vi',
    domain: 'co_hoc',
    navSection: 'tu_vi_bat_tu',
    status: 'coming_soon',
    description:
      'Luận giải vận hạn và cung Mệnh (gồm hướng Bắc phái / Nam phái / Phi tinh khi sẵn sàng).',
  },
  {
    slug: 'xem-han-nam',
    title: 'Xem hạn năm',
    subtitle: 'Lưu niên theo năm xem',
    category: 'Tử vi',
    domain: 'co_hoc',
    navSection: 'tu_vi_bat_tu',
    status: 'coming_soon',
    description: 'Xem vận hạn năm (lưu niên) theo lá số.',
  },
  {
    slug: 'dai-van-han',
    title: 'Đại vận · tiểu vận',
    subtitle: 'Chu kỳ vận hạn',
    category: 'Tử vi',
    domain: 'co_hoc',
    navSection: 'tu_vi_bat_tu',
    status: 'coming_soon',
    description: 'Theo dõi đại vận và tiểu vận trên lá số.',
  },
  {
    slug: 'lap-bat-tu',
    title: 'Lập lá số Bát tự Tứ trụ',
    subtitle: 'Tứ trụ · Tử Bình',
    category: 'Tứ trụ',
    domain: 'co_hoc',
    navSection: 'tu_vi_bat_tu',
    status: 'coming_soon',
    description: 'Lập Tứ trụ Bát tự từ ngày giờ sinh.',
  },
  {
    slug: 'nap-am-ngu-hanh',
    title: 'Nạp âm · ngũ hành',
    subtitle: 'Nạp âm bốn trụ',
    category: 'Tứ trụ',
    domain: 'co_hoc',
    navSection: 'tu_vi_bat_tu',
    status: 'coming_soon',
    description: 'Xác định nạp âm và ngũ hành của Tứ trụ.',
  },
  {
    slug: 'tim-dung-than',
    title: 'Tìm dụng thần',
    subtitle: 'Dụng thần theo Bát tự',
    category: 'Tứ trụ',
    domain: 'co_hoc',
    navSection: 'tu_vi_bat_tu',
    status: 'coming_soon',
    description: 'Gợi ý dụng thần hỗ trợ luận mệnh và chọn ngày.',
  },
  {
    slug: 'hop-tuoi-menh',
    title: 'Hợp tuổi · xung khắc',
    subtitle: 'Tam hợp · lục xung',
    category: 'Tứ trụ',
    domain: 'co_hoc',
    navSection: 'tu_vi_bat_tu',
    status: 'coming_soon',
    description: 'Xét hợp tuổi, xung khắc giữa các đương sự.',
  },
  {
    slug: 'bat-tu-ha-lac',
    title: 'Bát tự Hà Lạc',
    subtitle: 'Hà Lạc · số mệnh',
    category: 'Tứ trụ',
    domain: 'co_hoc',
    navSection: 'tu_vi_bat_tu',
    status: 'coming_soon',
    description: 'Khung Bát tự Hà Lạc.',
  },

  // —— Tham khảo (gom quẻ / thần số / tướng — không đẩy lên đầu) ——
  {
    slug: '64-que-kinh-dich',
    title: '64 quẻ Kinh Dịch',
    subtitle: 'Tra cứu · reo quẻ',
    category: 'Kinh Dịch',
    domain: 'co_hoc',
    navSection: 'tham_khao',
    status: 'ready',
    description:
      'Tra cứu 64 quẻ, reo quẻ 6 hào và luận giải AI — hỗ trợ Phật tử tham khảo cổ học.',
  },
  {
    slug: 'luc-hao',
    title: 'Lục hào · Bốc dịch',
    subtitle: 'Nạp Giáp · Thế Ứng · Lục thân',
    category: 'Kinh Dịch',
    domain: 'co_hoc',
    navSection: 'tham_khao',
    status: 'ready',
    description:
      'Lục hào Nạp Giáp — gieo 6 hào, xếp cung Thế Ứng, Can Chi, Lục thân và Dụng thần.',
  },
  {
    slug: 'khong-minh-than-toan',
    title: 'Khổng Minh thần toán',
    subtitle: '384 quẻ · ba từ động tâm',
    category: 'Kinh Dịch',
    domain: 'co_hoc',
    navSection: 'tham_khao',
    status: 'ready',
    description:
      'Khổng Minh thần toán — lập 1 trong 384 quẻ từ ba từ, số quẻ hoặc thượng·hạ·hào.',
  },
  {
    slug: 'mai-hoa-dich-so',
    title: 'Mai hoa dịch số',
    subtitle: 'Lập quẻ theo giờ · số động tâm',
    category: 'Kinh Dịch',
    domain: 'co_hoc',
    navSection: 'tham_khao',
    status: 'ready',
    description:
      'Mai Hoa Dịch Số — lập quẻ chủ, hào động, quẻ biến và hỗ quái từ năm tháng ngày giờ hoặc hai số.',
  },
  {
    slug: 'gieo-que-xin-xam',
    title: 'Xin xăm Quan Âm',
    subtitle: '100 quẻ linh xăm online',
    category: 'Nghi lễ Phật',
    domain: 'phat_hoc',
    navSection: 'tu_hoc',
    status: 'ready',
    description:
      'Xin xăm Quan Âm Linh Xăm — rút ngẫu nhiên 1 trong 100 quẻ. Cũng có icon nhanh trên cột liên hệ.',
  },
  {
    slug: 'than-so-hoc',
    title: 'Thần số học',
    subtitle: 'Số chủ đạo',
    category: 'Thần số',
    domain: 'co_hoc',
    navSection: 'tham_khao',
    status: 'ready',
    description:
      'Thần số Pythagoras — số đường đời, ngày sinh, năm cá nhân và họ tên (master 11·22·33).',
  },
  {
    slug: 'danh-gia-tinh-danh',
    title: 'Đánh giá tính danh',
    subtitle: 'Phân tích họ tên',
    category: 'Thần số',
    domain: 'co_hoc',
    navSection: 'tham_khao',
    status: 'ready',
    description:
      'Số hóa nét Quốc ngữ — Họ/Mệnh/Tên/Phụ/Tổng vận, cục số và chấm điểm tính danh.',
  },
  {
    slug: 'nhan-tuong',
    title: 'Nhân tướng',
    subtitle: 'Tướng mặt · hình',
    category: 'Tướng số',
    domain: 'co_hoc',
    navSection: 'tham_khao',
    status: 'coming_soon',
    description: 'Khung nhân tướng học sơ lược.',
  },
  {
    slug: 'chi-tuong',
    title: 'Chỉ tướng',
    subtitle: 'Tướng bàn tay',
    category: 'Tướng số',
    domain: 'co_hoc',
    navSection: 'tham_khao',
    status: 'coming_soon',
    description: 'Khung chỉ tướng (bàn tay).',
  },
  {
    slug: 'boi-sim',
    title: 'Bói SIM · số điện thoại',
    subtitle: 'Bát Cực Linh Số',
    category: 'Thần số',
    domain: 'co_hoc',
    navSection: 'tham_khao',
    status: 'ready',
    description:
      'Du Niên 8 sao (Bát Cực Linh Số) + 81 Số Lý, Âm Dương, hợp mệnh Nạp Âm.',
  },

  // —— Phật học: lịch lễ ——
  {
    slug: 'ngay-via-phat',
    title: 'Ngày vía Phật',
    subtitle: 'Vía Phật · Bồ tát · đại lễ',
    category: 'Lịch lễ',
    domain: 'phat_hoc',
    navSection: 'lich_le',
    status: 'ready',
    description:
      'Các ngày vía và đại lễ Phật giáo thường niên — hỗ trợ Phật tử và trụ trì theo dõi.',
  },
  {
    slug: 'khoa-tu-an-cu',
    title: 'Khóa tu · an cư',
    subtitle: 'Giới thiệu khóa tu',
    category: 'Lịch lễ',
    domain: 'phat_hoc',
    navSection: 'lich_le',
    status: 'ready',
    description:
      'Ý nghĩa khóa tu, an cư kiết hạ và lịch khóa tu nhà chùa đã công bố.',
  },

  // —— Kinh · khấn ——
  {
    slug: 'kinh-tung-thuong-dung',
    title: 'Kinh tụng thường dùng',
    subtitle: 'A Di Đà · Phổ Môn · Địa Tạng…',
    category: 'Kinh sách',
    domain: 'phat_hoc',
    navSection: 'kinh_khan',
    status: 'ready',
    description:
      'Kho kinh · chú · nghi thức tụng phổ biến tại chùa Việt — đọc trực tiếp, có thể mở gõ mõ tụng kèm.',
  },
  {
    slug: 'tra-cuu-kinh',
    title: 'Tra cứu kinh sách',
    subtitle: 'Mục lục kinh · sách',
    category: 'Kinh sách',
    domain: 'phat_hoc',
    navSection: 'kinh_khan',
    status: 'ready',
    description:
      'Tìm kinh theo tên hoặc việc cần làm (cầu an, cầu siêu, sám hối…) — mục lục tham khảo phổ biến tại chùa Việt.',
  },
  {
    slug: 'van-khan-nghi-le',
    title: 'Văn khấn · nghi lễ',
    subtitle: 'Rằm · mùng 1 · cầu an · cầu siêu',
    category: 'Nghi lễ Phật',
    domain: 'phat_hoc',
    navSection: 'kinh_khan',
    status: 'ready',
    description:
      'Mẫu văn khấn và hướng dẫn nghi lễ thường dùng — rằm, cầu an, cầu siêu, cúng dường, vào chùa.',
  },

  // —— Tu học ——
  {
    slug: 'giao-ly-can-ban',
    title: 'Giáo lý căn bản',
    subtitle: 'Tứ đế · Bát chánh đạo…',
    category: 'Tu học',
    domain: 'phat_hoc',
    navSection: 'tu_hoc',
    status: 'coming_soon',
    description: 'Khung giáo lý căn bản giới thiệu Phật pháp cho Phật tử.',
  },
  {
    slug: 'niem-phat',
    title: 'Niệm Phật',
    subtitle: 'Đồng bộ với gõ mõ',
    category: 'Tu học',
    domain: 'phat_hoc',
    navSection: 'tu_hoc',
    status: 'ready',
    href: '/go-mo',
    description:
      'Niệm danh hiệu theo nhịp gõ mõ / chuông / khánh trên trang Gõ mõ tụng kinh.',
  },
  {
    slug: 'go-mo',
    title: 'Gõ mõ tụng kinh',
    subtitle: 'Mõ · chuông · khánh · bảng vàng',
    category: 'Tu học',
    domain: 'phat_hoc',
    navSection: 'tu_hoc',
    status: 'ready',
    href: '/go-mo',
    description:
      'Gõ mõ online: pháp khí, tự gõ, mục tiêu 108/300/1080, niệm danh hiệu, bảng vàng & xếp hạng công đức.',
  },
  {
    slug: 'phap-thoai',
    title: 'Pháp thoại',
    subtitle: 'Nghe pháp · bài giảng',
    category: 'Tu học',
    domain: 'phat_hoc',
    navSection: 'tu_hoc',
    status: 'coming_soon',
    description: 'Khung chia sẻ pháp thoại do nhà chùa đăng.',
  },
  {
    slug: 'hoi-dap-phat-hoc',
    title: 'Hỏi đáp Phật học',
    subtitle: 'Giải đáp căn bản',
    category: 'Tu học',
    domain: 'phat_hoc',
    navSection: 'tu_hoc',
    status: 'coming_soon',
    description: 'Khung hỏi đáp Phật học cho Phật tử.',
  },

  // —— Tham gia cùng chùa (link hệ thống sẵn có) ——
  {
    slug: 'tham-gia-su-kien',
    title: 'Lịch hoạt động chùa',
    subtitle: 'Sự kiện · lễ sắp tới',
    category: 'Tham gia',
    domain: 'phat_hoc',
    navSection: 'tham_gia',
    status: 'ready',
    href: '/#hoat-dong',
    description: 'Xem các hoạt động, lễ hội sắp diễn ra tại chùa.',
  },
  {
    slug: 'quy-y-tam-bao',
    title: 'Quy y · kết duyên',
    subtitle: 'Đăng ký sổ Phật tử',
    category: 'Tham gia',
    domain: 'phat_hoc',
    navSection: 'tham_gia',
    status: 'ready',
    href: '/dang-ky-phat-tu',
    description: 'Đăng ký kết duyên / ghi danh Phật tử để nhận tin lễ từ nhà chùa.',
  },
  {
    slug: 'so-cau-an-sieu',
    title: 'Sớ cầu an · cầu siêu',
    subtitle: 'Đăng ký sớ online',
    category: 'Tham gia',
    domain: 'phat_hoc',
    navSection: 'tham_gia',
    status: 'ready',
    href: '/so-cau',
    description: 'Gửi sớ cầu an hoặc cầu siêu tới nhà chùa.',
  },
  {
    slug: 'cung-duong-nuoc',
    title: 'Cúng dường nước',
    subtitle: 'Phát tâm thỉnh nước',
    category: 'Tham gia',
    domain: 'phat_hoc',
    navSection: 'tham_gia',
    status: 'ready',
    href: '/#dong-nuoc',
    description: 'Phát tâm thỉnh nước tinh khiết — công đức hồi hướng.',
  },

  // —— Tư liệu (gom vào cột Tu học trên menu 4 cột) ——
  {
    slug: 'he-phai-tong-mon',
    title: 'Hệ phái · tông môn',
    subtitle: 'Bắc tông · Nam tông · Thiền…',
    category: 'Tư liệu',
    domain: 'phat_hoc',
    navSection: 'tu_hoc',
    status: 'coming_soon',
    description: 'Giới thiệu các hệ phái và tông môn Phật giáo Việt Nam.',
  },
  {
    slug: 'danh-tang-cao-tang',
    title: 'Danh tăng',
    subtitle: 'Tiểu sử cao tăng',
    category: 'Tư liệu',
    domain: 'phat_hoc',
    navSection: 'tu_hoc',
    status: 'coming_soon',
    description: 'Khung tư liệu danh tăng — gắn nội dung theo chùa.',
  },
];

export function toolHref(tool: FengShuiToolMeta): string {
  return tool.href ?? `/phong-thuy/${tool.slug}`;
}

export function getToolMeta(slug: string): FengShuiToolMeta | undefined {
  return FENGSHUI_TOOLS.find((t) => t.slug === slug);
}

/** Tool có trang /phong-thuy/[slug] (không phải link ngoài). */
export function toolsWithOwnPage(): FengShuiToolMeta[] {
  return FENGSHUI_TOOLS.filter((t) => !t.href);
}

export function toolsByDomain(domain: ToolDomain): FengShuiToolMeta[] {
  return FENGSHUI_TOOLS.filter((t) => t.domain === domain);
}

/** Mục nổi bật trang chủ: ưu tiên ready, rồi theo thứ tự catalog. */
export function featuredTools(
  domain: ToolDomain,
  limit = 6,
): FengShuiToolMeta[] {
  const all = toolsByDomain(domain);
  const ready = all.filter((t) => t.status === 'ready');
  const soon = all.filter((t) => t.status === 'coming_soon');
  return [...ready, ...soon].slice(0, limit);
}

/** Công cụ phong thủy + cổ học (menu Phong thủy). */
export function phongThuyMenuTools(): FengShuiToolMeta[] {
  return FENGSHUI_TOOLS.filter(
    (t) => t.domain === 'phong_thuy' || t.domain === 'co_hoc',
  );
}

export function toolsByNavSection(section: NavSection): FengShuiToolMeta[] {
  return FENGSHUI_TOOLS.filter((t) => t.navSection === section);
}

export function groupToolsByNavSection(
  sections: NavSection[],
): { section: NavSection; tools: FengShuiToolMeta[] }[] {
  return sections
    .map((section) => ({
      section,
      tools: toolsByNavSection(section),
    }))
    .filter((g) => g.tools.length > 0);
}

export function groupToolsByCategory(
  tools: FengShuiToolMeta[],
): [ToolCategory, FengShuiToolMeta[]][] {
  const map = new Map<ToolCategory, FengShuiToolMeta[]>();
  for (const t of tools) {
    const arr = map.get(t.category) ?? [];
    arr.push(t);
    map.set(t.category, arr);
  }
  return [...map.entries()];
}

export const TU_VI_PALACES = [
  'Mệnh',
  'Phụ mẫu',
  'Phúc đức',
  'Điền trạch',
  'Quan lộc',
  'Nô bộc',
  'Thiên di',
  'Tật ách',
  'Tài bạch',
  'Tử tức',
  'Phu thê',
  'Huynh đệ',
] as const;
