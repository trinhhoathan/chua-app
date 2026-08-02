/**
 * Dịch vụ chuyên sâu — Lý Gia Phúc An (menu + trang chủ).
 * Mỗi dịch vụ dùng ảnh riêng — không trùng trên cùng một trang.
 */

export interface LyGiaService {
  slug: string;
  /** Tên đầy đủ trên card / trang */
  title: string;
  /** Nhãn gọn trong menu */
  menuLabel: string;
  body: string;
  image: string;
  /** Liên kết nội bộ ưu tiên (vd. /sim); mặc định anchor trang chủ */
  href?: string;
}

export const LY_GIA_SERVICES: LyGiaService[] = [
  {
    slug: 'xem-nha-huong',
    title: 'Xem nhà · hướng hợp – không hợp',
    menuLabel: 'Xem nhà · hướng hợp – không hợp',
    body: 'Khảo sát hiện trạng, luận hướng cửa – bếp – phòng ngủ, chỉ rõ nên mua / không nên mua, cách hóa giải khí xấu và khai thông sinh khí.',
    image: '/images/ly-gia-phuc-an/thiet-ke.png',
    href: '/#xem-nha',
  },
  {
    slug: 'thiet-ke-chia-khoa',
    title: 'Thiết kế – chìa khóa trao tay',
    menuLabel: 'Thiết kế – chìa khóa trao tay',
    body: 'Đồng hành từ bản vẽ đến hoàn thiện: bố cục công năng, ngũ hành nội thất, điểm đặt bàn thờ – két – giường theo mệnh chủ.',
    image: '/images/ly-gia-phuc-an/xem-nha.png',
  },
  {
    slug: 'cai-van-phong-thuy',
    title: 'Cải vận qua phong thủy',
    menuLabel: 'Cải vận qua phong thủy',
    body: 'Điều chỉnh không gian sống – làm việc theo đại vận, tiểu hạn; kích hoạt tài vị, quan vị, quan hệ nhân duyên.',
    image: '/images/ly-gia-phuc-an/cai-van.png',
  },
  {
    slug: 'sim-bat-tu',
    title: 'Sim Bát Tự phong thủy',
    menuLabel: 'Sim Bát Tự phong thủy',
    body: 'Tuyển chọn dãy số hợp mệnh, hợp cục, hợp ngành nghề — công cụ chiêu tài và định vị năng lượng cá nhân mỗi ngày.',
    image: '/images/ly-gia-phuc-an/sim-bat-tu.png',
    href: '/sim',
  },
  {
    slug: 'dat-ten-thuong-hieu',
    title: 'Đặt tên thương hiệu',
    menuLabel: 'Đặt tên thương hiệu',
    body: 'Đặt tên công ty, cửa hàng, sản phẩm theo âm số – ngũ hành – ý nghĩa chữ, tạo ấn tượng thị trường và lực vận hành.',
    image: '/images/ly-gia-phuc-an/ten-thuong-hieu.png',
  },
  {
    slug: 'da-phong-thuy',
    title: 'Đánh thức năng lượng đá phong thủy',
    menuLabel: 'Đá phong thủy',
    body: 'Chọn đá – bố trí – khai quang theo mệnh; thức tỉnh linh khí đá để hộ thân, trấn trạch và mở vận.',
    image: '/images/ly-gia-phuc-an/da-phong-thuy.png',
  },
  {
    slug: 'xem-tuoi-lam-nha',
    title: 'Xem tuổi làm nhà · động thổ · nhập trạch',
    menuLabel: 'Xem tuổi làm nhà · nhập trạch',
    body: 'Chọn năm – tháng – ngày – giờ đại sự nhà cửa theo tuổi mệnh chủ, tránh phạm Thái Tuế, sát chủ, không vong.',
    image: '/images/ly-gia-phuc-an/xem-tuoi-lam-nha.png',
  },
  {
    slug: 'van-phong-cua-hang',
    title: 'Phong thủy văn phòng · cửa hàng',
    menuLabel: 'Văn phòng · cửa hàng',
    body: 'Bố trí quầy thu ngân, bàn lãnh đạo, lối khách vào – khí lưu thông, kích hoạt tài lộ và nhân duyên kinh doanh.',
    image: '/images/ly-gia-phuc-an/van-phong.png',
  },
  {
    slug: 'mo-phan-long-mach',
    title: 'Luận mộ phần · long mạch tổ tiên',
    menuLabel: 'Mộ phần · long mạch',
    body: 'Khảo sát hình thế đất mộ, hướng huyệt, ảnh hưởng tới hậu vận con cháu; đề xuất cải tạo hoặc dời táng khi cần.',
    image: '/images/ly-gia-phuc-an/mo-phan.png',
  },
  {
    slug: 'chon-ngay-gio',
    title: 'Chọn ngày giờ đại sự',
    menuLabel: 'Chọn ngày giờ đại sự',
    body: 'Cưới hỏi, ký kết, khai trương, xuất hành, phẫu thuật — chọn giờ cát hợp mệnh, hợp việc, hợp phương hướng.',
    image: '/images/ly-gia-phuc-an/chon-ngay.png',
  },
  {
    slug: 'khao-sat-dat-nen',
    title: 'Khảo sát đất nền trước khi mua',
    menuLabel: 'Khảo sát đất nền',
    body: 'Đánh giá long – hổ – án – thủy, đường đâm, góc nhọn, nhà máy – nghĩa trang lân cận trước khi đặt cọc.',
    image: '/images/ly-gia-phuc-an/dat-nen.png',
  },
  {
    slug: 'hoa-giai-sat-khi',
    title: 'Hóa giải sát khí nhà cửa',
    menuLabel: 'Hóa giải sát khí nhà cửa',
    body: 'Đường đâm, nhà đối cửa, nhà méo, xà đè, bếp đối cửa vệ sinh — biện pháp hóa giải tối thiểu, hiệu quả tối đa.',
    image: '/images/ly-gia-phuc-an/hoa-giai.png',
  },
];

export function lyGiaServiceHref(service: LyGiaService): string {
  return service.href ?? `/#dich-vu-${service.slug}`;
}
