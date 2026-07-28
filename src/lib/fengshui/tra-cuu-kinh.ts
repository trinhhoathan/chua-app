/**
 * Mục lục tra cứu kinh sách phổ biến tại chùa Việt.
 * Đây là khung tham khảo — nhà chùa có thể bổ sung / chỉnh theo hệ phái.
 */

export type KinhCategory =
  | 'Kinh tụng'
  | 'Chú · đà-la-ni'
  | 'Kinh nguyện'
  | 'Luận · sách';

export interface KinhEntry {
  id: string;
  title: string;
  /** Tên gọi khác / Hán Việt thường gặp */
  aliases?: string[];
  category: KinhCategory;
  summary: string;
  /** Gợi ý khi nào nên đọc / trì */
  whenToUse?: string;
  tags: string[];
}

export const KINH_CATEGORIES: KinhCategory[] = [
  'Kinh tụng',
  'Chú · đà-la-ni',
  'Kinh nguyện',
  'Luận · sách',
];

export const KINH_INTRO =
  'Mục lục kinh sách thường dùng tại chùa Việt — giúp Phật tử tìm đúng kinh theo nhu cầu (cầu an, cầu siêu, sám hối, niệm Phật…). Nội dung mang tính tham khảo; nghi thức cụ thể theo hướng dẫn trụ trì.';

export const KINH_FOOTNOTE =
  'Bản chữ để tụng nằm ở mục Kinh tụng thường dùng. Quý vị nên hỏi Tăng Ni khi chọn kinh cho lễ lớn.';

export const KINH_CATALOG: KinhEntry[] = [
  {
    id: 'a-di-da',
    title: 'Kinh A Di Đà',
    aliases: ['Phật thuyết A Di Đà kinh', 'Kinh Di Đà'],
    category: 'Kinh tụng',
    summary:
      'Kinh căn bản Tịnh Độ: tả cảnh Tây Phương Cực Lạc và khuyên niệm danh hiệu A Di Đà Phật để vãng sinh.',
    whenToUse: 'Khóa tụng hàng ngày, cầu an, trợ niệm người lâm chung.',
    tags: ['tịnh độ', 'niệm phật', 'cầu an', 'vãng sinh', 'a di đà'],
  },
  {
    id: 'pho-mon',
    title: 'Kinh Phổ Môn',
    aliases: ['Phẩm Phổ Môn', 'Quán Thế Âm Bồ Tát Phổ Môn phẩm'],
    category: 'Kinh tụng',
    summary:
      'Phẩm trong Kinh Pháp Hoa ca ngợi công đức Quán Thế Âm cứu khổ cứu nạn, ứng hiện theo chỗ cầu.',
    whenToUse: 'Cầu an, giải nạn, trì tụng ngày vía Quan Âm.',
    tags: ['quan âm', 'cầu an', 'cứu khổ', 'pháp hoa'],
  },
  {
    id: 'dia-tang',
    title: 'Kinh Địa Tạng',
    aliases: ['Địa Tạng Bồ Tát Bổn Nguyện Kinh'],
    category: 'Kinh tụng',
    summary:
      'Nói về đại nguyện Địa Tạng Vương Bồ Tát cứu độ chúng sinh trong các đường khổ, nhấn mạnh báo hiếu và cầu siêu.',
    whenToUse: 'Vu Lan, cầu siêu, báo hiếu ông bà cha mẹ.',
    tags: ['địa tạng', 'cầu siêu', 'báo hiếu', 'vu lan'],
  },
  {
    id: 'duoc-su',
    title: 'Kinh Dược Sư',
    aliases: ['Dược Sư Lưu Ly Quang Như Lai Bản Nguyện Công Đức Kinh'],
    category: 'Kinh tụng',
    summary:
      'Tưởng niệm Đức Dược Sư và mười hai đại nguyện chữa lành thân bệnh, tâm bệnh, kéo dài tuổi thọ.',
    whenToUse: 'Cầu an bệnh, lễ vía Dược Sư, trì tụng khi người thân ốm đau.',
    tags: ['dược sư', 'cầu an', 'bệnh', 'tiêu tai'],
  },
  {
    id: 'vu-lan',
    title: 'Kinh Vu Lan',
    aliases: ['Kinh Báo Hiếu', 'Phật thuyết Vu Lan Bồn Kinh'],
    category: 'Kinh tụng',
    summary:
      'Nhân duyên Tôn giả Mục Kiền Liên cứu mẹ, khởi nguồn lễ Vu Lan và tinh thần báo hiếu trong đạo Phật.',
    whenToUse: 'Rằm tháng Bảy, lễ Vu Lan, ngày giỗ ông bà.',
    tags: ['vu lan', 'báo hiếu', 'tháng bảy', 'cầu siêu'],
  },
  {
    id: 'phap-hoa',
    title: 'Kinh Pháp Hoa',
    aliases: ['Diệu Pháp Liên Hoa Kinh'],
    category: 'Kinh tụng',
    summary:
      'Kinh lớn chỉ rõ Phật thừa duy nhất, khai thị tri kiến Phật; nhiều chùa tụng trích phẩm hoặc toàn bộ theo khóa tu.',
    whenToUse: 'Khóa tu, lễ lớn, tu học giáo lý sâu.',
    tags: ['pháp hoa', 'giáo lý', 'khóa tu'],
  },
  {
    id: 'kim-cang',
    title: 'Kinh Kim Cang',
    aliases: ['Kim Cương Bát-nhã Ba-la-mật-đa Kinh'],
    category: 'Kinh tụng',
    summary:
      'Kinh Bát-nhã dạy phá chấp ngã, chấp pháp; “Ưng vô sở trụ nhi sinh kỳ tâm”.',
    whenToUse: 'Tu học tuệ quán, sám hối, trì tụng hàng ngày.',
    tags: ['bát nhã', 'tuệ', 'kim cang', 'sám hối'],
  },
  {
    id: 'tam-bao',
    title: 'Kinh Thủy Sám / Lương Hoàng Sám',
    aliases: ['Từ Bi Thủy Sám', 'Lương Hoàng Bảo Sám'],
    category: 'Kinh nguyện',
    summary:
      'Nghi thức sám hối dài, thường dùng trong các đàn tràng cầu an, cầu siêu quy mô lớn tại chùa.',
    whenToUse: 'Đàn tràng, khóa sám hối, lễ cầu siêu lớn.',
    tags: ['sám hối', 'cầu siêu', 'cầu an', 'đàn tràng'],
  },
  {
    id: 'hong-danh',
    title: 'Kinh Hồng Danh',
    aliases: ['Hồng Danh Bảo Sám'],
    category: 'Kinh nguyện',
    summary:
      'Lễ lạy danh hiệu chư Phật để sám hối nghiệp chướng, thường kết hợp trong khóa lễ chùa Việt.',
    whenToUse: 'Sám hối, lễ lạy, tu tập định kỳ.',
    tags: ['sám hối', 'lễ Phật', 'hồng danh'],
  },
  {
    id: 'dai-bi',
    title: 'Chú Đại Bi',
    aliases: ['Thiên Thủ Thiên Nhãn Vô Ngại Đại Bi Tâm Đà-la-ni'],
    category: 'Chú · đà-la-ni',
    summary:
      'Đà-la-ni của Quán Thế Âm, trì tụng để tiêu tai, cầu an, hộ trì thân tâm.',
    whenToUse: 'Hàng ngày, cầu an bệnh, hộ trì trước việc lớn.',
    tags: ['đại bi', 'quan âm', 'cầu an', 'chú'],
  },
  {
    id: 'chu-van',
    title: 'Chú Vãng Sinh',
    aliases: ['Vãng Sinh Tịnh Độ Thần Chú'],
    category: 'Chú · đà-la-ni',
    summary:
      'Chú ngắn thuộc pháp môn Tịnh Độ, thường trì cùng niệm Phật để cầu vãng sinh Cực Lạc.',
    whenToUse: 'Trợ niệm, cầu siêu, khóa niệm Phật.',
    tags: ['vãng sinh', 'tịnh độ', 'cầu siêu', 'niệm phật'],
  },
  {
    id: 'tam-cu',
    title: 'Chú Tiêu Tai Kiết Tường',
    aliases: ['Chú Tiêu Tai', 'Tiêu Tai Kiết Tường Thần Chú'],
    category: 'Chú · đà-la-ni',
    summary:
      'Chú trì để tiêu trừ tai nạn, cầu bình an — thường đọc trong khóa cầu an.',
    whenToUse: 'Cầu an, khi gặp việc bất ổn, hộ trì gia đình.',
    tags: ['tiêu tai', 'cầu an', 'chú'],
  },
  {
    id: 'chuan-de',
    title: 'Chú Chuẩn Đề',
    aliases: ['Chuẩn Đề Thần Chú', 'Thất Câu Chi Phật Mẫu'],
    category: 'Chú · đà-la-ni',
    summary:
      'Chú của Phật Mẫu Chuẩn Đề, trì để tăng trưởng trí tuệ, tiêu nghiệp và cầu sở nguyện lành.',
    whenToUse: 'Tu trì hàng ngày, cầu trí tuệ, tiêu nghiệp.',
    tags: ['chuẩn đề', 'trí tuệ', 'chú'],
  },
  {
    id: 'bat-nha-tam',
    title: 'Bát Nhã Tâm Kinh',
    aliases: ['Tâm Kinh', 'Ma-ha Bát-nhã Ba-la-mật-đa Tâm Kinh'],
    category: 'Kinh tụng',
    summary:
      'Tóm lược tinh yếu Bát-nhã: chiếu kiến ngũ uẩn giai không, độ nhất thiết khổ ách.',
    whenToUse: 'Mở đầu / kết thúc nhiều khóa tụng, tu học ngắn.',
    tags: ['bát nhã', 'tâm kinh', 'tuệ', 'tụng hàng ngày'],
  },
  {
    id: 'thap-thien',
    title: 'Kinh Thập Thiện',
    aliases: ['Phật thuyết Thập Thiện Nghiệp Đạo Kinh'],
    category: 'Luận · sách',
    summary:
      'Giảng mười nghiệp thiện — nền tảng giữ giới và sống đạo đức cho cư sĩ.',
    whenToUse: 'Giáo lý căn bản, lớp Phật học gia đình.',
    tags: ['thập thiện', 'giới', 'giáo lý', 'cư sĩ'],
  },
  {
    id: 'tu-thap-nhi',
    title: 'Kinh Tứ Thập Nhị Chương',
    aliases: ['Tứ Thập Nhị Chương Kinh'],
    category: 'Luận · sách',
    summary:
      'Tuyển tập ngắn những lời dạy căn bản của Đức Phật, dễ đọc cho người mới học đạo.',
    whenToUse: 'Nhập môn Phật pháp, đọc sớm tối.',
    tags: ['nhập môn', 'giáo lý', 'căn bản'],
  },
  {
    id: 'bat-quan-trai',
    title: 'Nghi thức Bát Quan Trai',
    aliases: ['Bát Quan Trai giới'],
    category: 'Kinh nguyện',
    summary:
      'Nghi thức thọ trì tám giới trong một ngày một đêm — thực hành gần với đời sống xuất gia.',
    whenToUse: 'Ngày trai giới, khóa tu ngắn tại chùa.',
    tags: ['bát quan trai', 'giữ giới', 'khóa tu'],
  },
  {
    id: 'quy-y',
    title: 'Nghi thức Quy y',
    aliases: ['Tam quy ngũ giới'],
    category: 'Kinh nguyện',
    summary:
      'Nghi thức quy y Tam Bảo và thọ ngũ giới — bước chính thức trở thành Phật tử.',
    whenToUse: 'Lễ quy y do nhà chùa tổ chức.',
    tags: ['quy y', 'ngũ giới', 'phật tử'],
  },
];

function normalize(text: string): string {
  return text
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .trim();
}

export function searchKinhCatalog(
  query: string,
  category: KinhCategory | 'all' = 'all',
  list: KinhEntry[] = KINH_CATALOG,
): KinhEntry[] {
  const q = normalize(query);
  return list.filter((entry) => {
    if (category !== 'all' && entry.category !== category) return false;
    if (!q) return true;
    const haystack = normalize(
      [
        entry.title,
        ...(entry.aliases ?? []),
        entry.summary,
        entry.whenToUse ?? '',
        ...entry.tags,
      ].join(' '),
    );
    return haystack.includes(q);
  });
}
