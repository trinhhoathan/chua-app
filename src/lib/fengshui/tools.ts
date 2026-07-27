export interface FengShuiToolMeta {
  slug: string;
  title: string;
  subtitle: string;
  category: 'Xây dựng' | 'Cưới hỏi' | 'Ma chay' | 'Kinh doanh' | 'Gia đình';
  description: string;
}

export const FENGSHUI_TOOLS: FengShuiToolMeta[] = [
  {
    slug: 'dong-tho',
    title: 'Xem tuổi làm nhà',
    subtitle: 'Kiểm tra Kim Lâu, Hoang Ốc, Tam Tai',
    category: 'Xây dựng',
    description:
      'Nhập năm sinh và năm dự định làm nhà để tra Kim Lâu, Hoang Ốc, Tam Tai — biết năm nào nên và năm nào cần mượn tuổi.',
  },
  {
    slug: 'khoi-cong',
    title: 'Khởi công động thổ',
    subtitle: 'Chọn ngày Hoàng đạo phù hợp',
    category: 'Xây dựng',
    description:
      'Kiểm tra một ngày cụ thể có thuận cho việc khởi công, động thổ hay không.',
  },
  {
    slug: 'huong-nha',
    title: 'Chọn hướng nhà',
    subtitle: 'Bát trạch theo tuổi',
    category: 'Xây dựng',
    description:
      'Tính cung mệnh, xác định Đông Tứ Mệnh / Tây Tứ Mệnh và 4 hướng nhà tốt.',
  },
  {
    slug: 'nhap-trach',
    title: 'Nhập trạch — về nhà mới',
    subtitle: 'Chọn ngày lành',
    category: 'Xây dựng',
    description:
      'Kiểm tra ngày dự định về nhà mới có hợp tuổi và có phải Hoàng đạo hay không.',
  },
  {
    slug: 'cuoi-hoi',
    title: 'Xem tuổi cưới hỏi',
    subtitle: 'Kiểm tra Tam hợp, Lục hợp, Lục xung',
    category: 'Cưới hỏi',
    description:
      'Nhập tuổi cô dâu và chú rể để xét hợp tuổi trước khi định ngày.',
  },
  {
    slug: 'ma-chay',
    title: 'Ngày giờ mai táng',
    subtitle: 'Xem ngày ÂL, chi ngày, gợi ý giờ',
    category: 'Ma chay',
    description:
      'Nhập ngày giờ mất để xem ngày âm, chi ngày, và gợi ý ngày mai táng phù hợp theo nếp dân gian.',
  },
  {
    slug: 'trung-tang',
    title: 'Kiểm tra Trùng tang',
    subtitle: 'Trùng tang · Nhập mộ · Thiên di',
    category: 'Ma chay',
    description:
      'Nhập năm sinh + ngày giờ mất để tra tam bàn Trùng tang / Nhập mộ / Thiên di — có Nhập mộ hóa giải hay cần lễ trấn Trùng tang.',
  },
  {
    slug: 'sinh-con',
    title: 'Năm sinh con tốt',
    subtitle: 'Dành cho mẹ',
    category: 'Gia đình',
    description:
      'Gợi ý các năm sắp tới phù hợp để sinh con, tránh Kim Lâu, Tam Tai, xung năm.',
  },
  {
    slug: 'khai-truong',
    title: 'Khai trương công ty',
    subtitle: 'Chọn ngày ra mắt thuận lợi',
    category: 'Kinh doanh',
    description:
      'Kiểm tra ngày dự định khai trương công ty có hợp tuổi chủ doanh nghiệp.',
  },
  {
    slug: 'mo-cua-hang',
    title: 'Mở cửa hàng',
    subtitle: 'Chọn ngày khởi sự buôn bán',
    category: 'Kinh doanh',
    description:
      'Kiểm tra ngày dự định mở cửa hàng có thuận lợi hay không.',
  },
];

export function getToolMeta(slug: string): FengShuiToolMeta | undefined {
  return FENGSHUI_TOOLS.find((t) => t.slug === slug);
}
