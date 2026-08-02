/**
 * Sản phẩm & dịch vụ số phong thủy — Lý Gia Phúc An.
 * Nội dung gốc theo hướng dịch vụ trấn số (xe · nhà · TKNH · sim linh số).
 */

export interface LyGiaProduct {
  slug: string;
  title: string;
  shortTitle: string;
  tagline: string;
  summary: string;
  image: string;
  benefits: string[];
  process: Array<{ step: string; detail: string }>;
  why: string;
  ctaLabel: string;
  /** Liên kết nội bộ bổ sung (vd. kho sim) */
  relatedHref?: string;
  relatedLabel?: string;
}

export const LY_GIA_PRODUCTS: LyGiaProduct[] = [
  {
    slug: 'tran-bien-so-xe',
    title: 'Dịch vụ Trấn biển số xe',
    shortTitle: 'Trấn biển số xe',
    tagline: 'Bình an mỗi chuyến đi · thu hút tài lộ trên đường',
    summary:
      'Biển số xe không chỉ là ký hiệu hành chính — theo nguyên lý Âm Dương Ngũ Hành, Kinh dịch diệu luận, từng cặp số tạo trường khí ảnh hưởng tới an toàn giao thông, tài lộc và sự thuận lợi khi xuất hành. Thầy Lý Gia Phúc An luận biển số theo mệnh chủ, chọn hoặc hóa giải dãy số đang dùng.',
    image: '/images/ly-gia-phuc-an/bien-so-xe.png',
    benefits: [
      'Chọn / luận biển số hợp mệnh, hợp mục tiêu (bình an, tài lộ, công danh)',
      'Phân tích cặp quái số trên dãy số — cát hung, đuôi số, tổng nút',
      'Hướng dẫn cách dùng và lưu ý khi đổi biển hoặc xe mới',
      'Kết hợp ngày giờ xuất hành tốt nếu quý vị cần',
    ],
    process: [
      {
        step: 'Tư vấn cá nhân',
        detail:
          'Gửi biển số hiện tại (hoặc các số đang cân nhắc) kèm ngày giờ sinh — thầy nắm mục tiêu: an toàn, tài lộc hay uy tín.',
      },
      {
        step: 'Luận giải & đề xuất',
        detail:
          'Chấm điểm theo nguyên lý Âm Dương Ngũ Hành, Kinh dịch diệu luận, đối chiếu Bát Tự; đề xuất giữ / đổi / hóa giải và giải thích rõ vì sao.',
      },
      {
        step: 'Đồng hành sau chọn số',
        detail:
          'Hướng dẫn kích hoạt theo ngày tốt (nếu cần) và lưu ý khi lái xe, gửi xe, xuất hành xa.',
      },
    ],
    why: 'Mỗi chuyến đi là một lần “ra khí”. Biển số hợp giúp chủ xe an tâm hơn, giảm sát khí đường đâm – giao cắt xấu khi đã chọn số đúng trường.',
    ctaLabel: 'Nhắn Zalo — luận biển số xe',
  },
  {
    slug: 'tran-so-nha',
    title: 'Dịch vụ Trấn số nhà',
    shortTitle: 'Trấn số nhà',
    tagline: 'Số nhà hợp mệnh · mở sinh khí cho không gian sống',
    summary:
      'Số nhà là “cửa khẩu” năng lượng của căn nhà. Dịch vụ trấn số nhà giúp chọn hoặc luận số phù hợp cung mệnh gia chủ, hướng nhà và mục tiêu (an cư, tài lộc, gia đạo), tránh dãy số xung khắc kéo dài năm này qua năm khác.',
    image: '/images/ly-gia-phuc-an/so-nha.png',
    benefits: [
      'Luận số nhà hiện tại: hợp – xung – cần hóa giải gì',
      'Gợi ý số nhà khi xây mới, tách sổ, mua nhà / căn hộ',
      'Kết hợp hướng cửa – bếp – phòng ngủ nếu đã khảo sát nhà',
      'Biện pháp hóa giải tối thiểu khi chưa đổi được số',
    ],
    process: [
      {
        step: 'Thu thập thông tin',
        detail:
          'Số nhà (hoặc các phương án số), địa chỉ, hướng cửa chính, ngày giờ sinh gia chủ.',
      },
      {
        step: 'Phân tích cung mệnh & số',
        detail:
          'Đối chiếu ngũ hành – Bát Tự với cấu trúc số; đánh giá ảnh hưởng tới sức khỏe, tài vận, gia đạo.',
      },
      {
        step: 'Tư vấn & theo dõi',
        detail:
          'Đề xuất số tối ưu hoặc cách hóa; hướng dẫn áp dụng và kiểm tra lại sau khi đổi số / gắn biển.',
      },
    ],
    why: 'Nhà là chỗ “nạp khí” mỗi ngày. Số nhà đúng giúp vượng khí vào nhà ổn định hơn — đặc biệt khi kết hợp xem hướng và bố cục nội thất.',
    ctaLabel: 'Nhắn Zalo — tư vấn số nhà',
    relatedHref: '/#xem-nha',
    relatedLabel: 'Xem thêm dịch vụ khảo sát nhà',
  },
  {
    slug: 'so-tai-khoan-thu-tai',
    title: 'Dịch vụ Số tài khoản thủ tài',
    shortTitle: 'Số TK thủ tài',
    tagline: 'Tối ưu dãy số ngân hàng · giữ – chiêu tài lộ',
    summary:
      'Số tài khoản ngân hàng là kênh “tiền vào – tiền ra” hàng ngày. Theo phong thủy số, việc chọn dãy số hợp mệnh và mạnh về tài lộc / Diên Niên (giữ của) giúp ổn định dòng tiền, hỗ trợ kinh doanh và tích lũy.',
    image: '/images/ly-gia-phuc-an/tai-khoan.png',
    benefits: [
      'Luận số TK đang dùng hoặc các số ngân hàng đề xuất mở mới',
      'Ưu tiên cấu trúc mạnh Thiên Y (chiêu tài) + Diên Niên (giữ tài)',
      'Phân biệt tài khoản cá nhân / doanh nghiệp theo mục tiêu',
      'Tư vấn ngày giờ kích hoạt hoặc chuyển tiền lớn (nếu cần)',
    ],
    process: [
      {
        step: 'Nắm nhu cầu tài chính',
        detail:
          'Mục tiêu: tích lũy, kinh doanh, nhận lương, công ty — kèm ngày giờ sinh người đứng tên.',
      },
      {
        step: 'Chấm & chọn số',
        detail:
          'Phân tích các đuôi số / dãy số khả dụng theo Âm Dương Ngũ Hành; xếp hạng phương án rõ ràng.',
      },
      {
        step: 'Hướng dẫn sử dụng',
        detail:
          'Cách dùng TK chính – TK phụ, lưu ý khi mở thêm thẻ hoặc đổi ngân hàng.',
      },
    ],
    why: 'Tiền thích “đường thông”. Số TK hợp là một lớp hỗ trợ tâm lý và trường khí cho việc giữ – xoay vốn, không thay thế quản trị tài chính thực tế.',
    ctaLabel: 'Nhắn Zalo — chọn số TK thủ tài',
  },
  {
    slug: 'sim-linh-so-thuong-luu',
    title: 'Sim Linh Số Thượng Lưu',
    shortTitle: 'Sim Linh Số Thượng Lưu',
    tagline: 'Cải vận bằng trường số · cát tinh vượng · hung tinh được chế',
    summary:
      'Khác sim “số đẹp” chỉ nhìn hình thức (tứ quý, taxi…), Sim Linh Số Thượng Lưu sắp xếp theo nguyên lý Âm Dương Ngũ Hành, Kinh dịch diệu luận: tối ưu cát tinh (Sinh Khí, Thiên Y, Diên Niên, Phục Vị), chuyển hóa hung tinh bằng tổ hợp chế hóa — đúng người, đúng mệnh, đúng mục tiêu cải vận.',
    image: '/images/ly-gia-phuc-an/sim-linh-so.png',
    benefits: [
      'Mỗi sim trong kho đã được engine Âm Dương Ngũ Hành chấm điểm sẵn',
      'Đối chiếu Bát Tự (ngày giờ sinh) để ra % hợp mệnh',
      'Lọc theo mục đích: tài lộc, giải hạn, tình duyên, gia đạo…',
      'Đặt mua online, thanh toán QR; thầy chọn ngày kích sim',
    ],
    process: [
      {
        step: 'Nhập ngày giờ sinh',
        detail:
          'Tại kho sim hoặc nhắn Zalo — hệ thống / thầy lập Bát Tự, tìm dụng thần.',
      },
      {
        step: 'Chọn số trong kho hoặc tuyển riêng',
        detail:
          'Lọc sim điểm cao đúng mục tiêu; hoặc thầy tuyển số ngoài kho theo yêu cầu trong 24h.',
      },
      {
        step: 'Đặt mua & kích sim',
        detail:
          'Thanh toán VietQR, kiểm tra chính chủ, nhận sim và chọn ngày giờ tốt để kích hoạt.',
      },
    ],
    why: 'Sim là vật “đeo” bên mình cả ngày — trường số liên tục tương tác với chủ. Linh Số Thượng Lưu đặt trọng tâm vào cấu trúc năng lượng, không chỉ vẻ ngoài dãy số.',
    ctaLabel: 'Vào kho Sim Linh Số',
    relatedHref: '/sim',
    relatedLabel: 'Xem kho sim phong thủy',
  },
];

export function lyGiaProductBySlug(slug: string): LyGiaProduct | undefined {
  return LY_GIA_PRODUCTS.find((p) => p.slug === slug);
}
