/**
 * Danh tăng · cao tăng — tư liệu tiểu sử phổ thông (VN & tổ liên quan).
 * Mang tính giới thiệu; niên đại / chi tiết có thể khác giữa các nguồn sử.
 */

export type DanhTangCategory =
  | 'to_su'
  | 'truc_lam'
  | 'co_can_dai'
  | 'can_dai'
  | 'tinh_do_thien'
  | 'thuc_hanh';

export const DANH_TANG_CATEGORY_LABELS: Record<DanhTangCategory, string> = {
  to_su: 'Tổ sư Thiền',
  truc_lam: 'Trúc Lâm',
  co_can_dai: 'Cổ · cận đại VN',
  can_dai: 'Hiện đại',
  tinh_do_thien: 'Tịnh · Thiền VN',
  thuc_hanh: 'Học gương',
};

export interface DanhTangSection {
  title?: string;
  paragraphs: string[];
  bullets?: string[];
}

export interface DanhTangEntry {
  id: string;
  name: string;
  /** Tôn hiệu / cách gọi khác */
  aliases?: string[];
  shortName: string;
  category: DanhTangCategory;
  /** Khoảng thời gian gợi ý, VD: "thế kỷ XIII" */
  era: string;
  summary: string;
  readingMinutes: number;
  tags: string[];
  sections: DanhTangSection[];
  keyPoints?: string[];
  legacy?: string[];
  relatedTools?: { href: string; label: string }[];
  relatedHePhaiIds?: string[];
}

export const DANH_TANG_INTRO =
  'Gương danh tăng giúp Phật tử thấy đạo sống trong lịch sử: xuất gia, giữ giới, hành đạo và lợi lạc dân tộc. Đây là khung tư liệu phổ thông — không phải đầy đủ mọi vị; mỗi chùa còn có tổ đình và trụ trì riêng để kính nhớ.';

export const DANH_TANG_FOOTNOTE =
  'Tiểu sử tóm lược theo truyền thống lưu hành phổ biến. Chi tiết niên đại, pháp tự có thể khác giữa sử liệu. Khi nghi, đối chiếu sách sử Phật giáo Việt Nam hoặc hỏi thầy.';

export const DANH_TANG_GUIDES: { title: string; body: string }[] = [
  {
    title: 'Học gương chứ không thần tượng hóa mù quáng',
    body: 'Kính ngưỡng công hạnh: giới đức, trí tuệ, từ bi, phụng sự. Không biến danh tăng thành “thần hộ mệnh” để cầu lợi thế gian mà quên tự tu.',
  },
  {
    title: 'Trụ trì / thầy bổn sư của mình',
    body: 'Gần nhất vẫn là vị đang hướng dẫn đạo tràng. Nếu nhà chùa đã đăng tiểu sử trụ trì trên website, hãy đọc trước khi tìm gương lịch sử.',
  },
  {
    title: 'Đọc sử để nuôi chí',
    body: 'Mỗi vị một hoàn cảnh — vua xuất gia, vị cháy thân vì đạo, vị dịch kinh, vị mở thiền đường. Hãy chọn một hạnh gần mình mà học (nhẫn, tinh tấn, nhập thế tỉnh thức…).',
  },
];

export const DANH_TANG_ENTRIES: DanhTangEntry[] = [
  // ─── Tổ sư Thiền ────────────────────────────────────────
  {
    id: 'dat-ma',
    name: 'Bồ Đề Đạt Ma',
    shortName: 'Đạt Ma',
    category: 'to_su',
    era: 'thế kỷ V–VI',
    aliases: ['Bodhidharma', 'Đạt-ma Tổ sư'],
    summary:
      'Sơ tổ Thiền Trung Hoa trong truyền thuyết tông môn — biểu tượng “trực chỉ nhân tâm”, ngồi diện bích.',
    readingMinutes: 9,
    tags: ['đạt ma', 'thiền', 'sơ tổ', 'diện bích'],
    keyPoints: [
      'Biểu tượng tinh thần Thiền hơn là tiểu sử đầy đủ từng ngày.',
      'Nhắc người học nhìn vào tâm, không chỉ chạy theo văn tự.',
    ],
    sections: [
      {
        title: 'Trong truyền thống Thiền',
        paragraphs: [
          'Tổ Đạt Ma được kể là vị đưa yếu chỉ Thiền từ Ấn sang Trung Hoa, gặp Lương Vũ Đế, rồi diện bích tại Thiếu Lâm. Dù sử liệu học thuật còn bàn luận, hình tượng Tổ đã nuôi bao thế hệ hành giả: ngồi vững, chỉ thẳng tâm, không dựa hình thức suông.',
        ],
      },
      {
        title: 'Học gì hôm nay?',
        paragraphs: [
          'Đừng lấy “bất lập văn tự” làm cớ bỏ nghe pháp và giữ giới. Hãy lấy tinh thần: quay về tỉnh thức trong hơi thở và việc đang làm.',
        ],
      },
    ],
    legacy: [
      'Biểu tượng sơ tổ Thiền Đông Á.',
      'Truyền cảm hứng cho tranh tượng, pháp thoại về kiên định.',
    ],
    relatedHePhaiIds: ['thien-tong'],
    relatedTools: [
      { href: '/phong-thuy/he-phai-tong-mon', label: 'Thiền tông' },
    ],
  },
  {
    id: 'hue-nang',
    name: 'Lục tổ Huệ Năng',
    shortName: 'Huệ Năng',
    category: 'to_su',
    era: 'thế kỷ VII–VIII',
    aliases: ['Huineng', 'Lục Tổ'],
    summary:
      'Nhân vật trung tâm Pháp Bảo Đàn Kinh — “bản lai vô nhất vật”, thiền cho cả người không chữ nghĩa bác học.',
    readingMinutes: 10,
    tags: ['huệ năng', 'lục tổ', 'pháp bảo đàn', 'kiến tánh'],
    keyPoints: [
      'Nhấn Phật tánh sẵn có — không chờ điều kiện ngoại cảnh hoàn hảo.',
      'Ảnh hưởng sâu đến Thiền Trung Hoa và các dòng truyền sang Việt.',
    ],
    sections: [
      {
        title: 'Gương hạnh',
        paragraphs: [
          'Truyền thuyết: người đốn củi, nghe kinh Kim Cang phát tâm, được Ngũ tổ truyền y bát. Pháp Bảo Đàn ghi lời dạy về định tuệ nhất như, không chấp hình tướng. Với cư sĩ: đạo nằm trong đời sống tỉnh thức, không chỉ trong am cao.',
        ],
      },
    ],
    legacy: [
      'Kinh Pháp Bảo Đàn trở thành “kinh của người Thiền”.',
      'Mở lối thiền nhập thế gần gũi.',
    ],
    relatedHePhaiIds: ['thien-tong'],
  },
  {
    id: 'ty-ni-da-luu-chi',
    name: 'Tỳ-ni-đa-lưu-chi',
    shortName: 'Tỳ-ni-đa-lưu-chi',
    category: 'to_su',
    era: 'thế kỷ VI',
    aliases: ['Vinitaruci'],
    summary:
      'Một trong những vị tổ Thiền sớm trên đất Việt — dòng Thiền gắn với chùa Pháp Vân (Dâu) theo sử liệu truyền thống.',
    readingMinutes: 8,
    tags: ['tỳ ni đa lưu chi', 'thiền việt', 'pháp vân', 'cổ đại'],
    sections: [
      {
        title: 'Vị trí lịch sử',
        paragraphs: [
          'Theo truyền thống Phật giáo Việt, Ngài là sơ tổ một dòng Thiền sớm, truyền pháp cho Pháp Hiền. Dù chi tiết sử còn được nghiên cứu, hình ảnh các vị tổ Ấn–Việt này nhắc rằng đạo đã bén rễ sớm và có mạch riêng trên đất này.',
        ],
      },
    ],
    relatedHePhaiIds: ['phat-giao-viet-nam', 'thien-tong'],
  },
  {
    id: 'vo-ngon-thong',
    name: 'Vô Ngôn Thông',
    shortName: 'Vô Ngôn Thông',
    category: 'to_su',
    era: 'thế kỷ IX',
    summary:
      'Tổ thiền truyền từ Trung Hoa vào Việt — dòng Vô Ngôn Thông, nhấn yếu chỉ vượt ngôn ngữ.',
    readingMinutes: 7,
    tags: ['vô ngôn thông', 'thiền', 'cổ đại'],
    sections: [
      {
        title: 'Tinh thần',
        paragraphs: [
          'Tên pháp đã là lời nhắc: đạo không nằm hết trong lời nói. Truyền thừa của Ngài góp phần làm dày bản đồ thiền Việt trước khi Trúc Lâm ra đời.',
        ],
      },
    ],
    relatedHePhaiIds: ['thien-tong'],
  },

  // ─── Trúc Lâm ───────────────────────────────────────────
  {
    id: 'tran-nhan-tong',
    name: 'Điều Ngự Giác Hoàng Trần Nhân Tông',
    shortName: 'Trần Nhân Tông',
    category: 'truc_lam',
    era: '1258–1308',
    aliases: ['Trúc Lâm Đầu Đà', 'Sơ tổ Trúc Lâm'],
    summary:
      'Vua Trần xuất gia, sơ tổ thiền phái Trúc Lâm Yên Tử — biểu tượng đạo và đời hòa quyện.',
    readingMinutes: 14,
    tags: ['trần nhân tông', 'trúc lâm', 'yên tử', 'vua tăng'],
    keyPoints: [
      'Chống Nguyên–Mông rồi xuất gia — trách nhiệm dân tộc và đạo không tách rời.',
      'Sáng lập Trúc Lâm, thống nhất các dòng thiền.',
      'Để lại tinh thần cư trần lạc đạo.',
    ],
    sections: [
      {
        title: 'Cuộc đời tóm lược',
        paragraphs: [
          'Trần Nhân Tông là vua nhà Trần, lãnh đạo đất nước qua các cuộc kháng chiến. Sau khi truyền ngôi, Ngài xuất gia, lấy hiệu Trúc Lâm Đầu Đà, lấy Yên Tử làm căn cứ thiền học, đi giáo hóa nhiều nơi.',
          'Ngài không tách đạo khỏi vận nước: lấy từ bi và tỉnh thức làm nền cho thái độ nhập thế của thiền Việt.',
        ],
      },
      {
        title: 'Lời dạy gần người hôm nay',
        paragraphs: [
          '“Cư trần lạc đạo” — sống giữa đời mà vui với đạo: làm tròn bổn phận, không để tâm bị cuốn theo danh lợi đến mức mất tỉnh thức. Phật tử tại gia học được rằng xuất gia hình thức không phải điều kiện duy nhất để tu.',
        ],
      },
    ],
    legacy: [
      'Sơ tổ Trúc Lâm — bản sắc thiền Việt.',
      'Gương vua–tăng hiếm có trong sử Đông Á.',
    ],
    relatedHePhaiIds: ['truc-lam'],
    relatedTools: [
      { href: '/phong-thuy/he-phai-tong-mon', label: 'Thiền phái Trúc Lâm' },
    ],
  },
  {
    id: 'phap-loa',
    name: 'Tổ Pháp Loa',
    shortName: 'Pháp Loa',
    category: 'truc_lam',
    era: '1284–1330',
    aliases: ['Đệ nhị tổ Trúc Lâm'],
    summary:
      'Đệ nhị tổ Trúc Lâm — tổ chức giáo đoàn, khắc kinh, mở rộng ảnh hưởng thiền phái sau sơ tổ.',
    readingMinutes: 9,
    tags: ['pháp loa', 'trúc lâm', 'tam tổ'],
    sections: [
      {
        title: 'Công hạnh',
        paragraphs: [
          'Pháp Loa kế thừa Trần Nhân Tông, có công lớn trong việc hệ thống hóa sinh hoạt Tăng già, khắc in kinh điển và duy trì mạch Trúc Lâm. Gương về tinh tấn tổ chức — đạo cần cả chứng nghiệm lẫn khung duy trì chúng.',
        ],
      },
    ],
    relatedHePhaiIds: ['truc-lam'],
  },
  {
    id: 'huyen-quang',
    name: 'Tổ Huyền Quang',
    shortName: 'Huyền Quang',
    category: 'truc_lam',
    era: '1254–1334',
    aliases: ['Đệ tam tổ Trúc Lâm'],
    summary:
      'Đệ tam tổ Trúc Lâm — vốn là nhà Nho xuất chúng, vào đạo rồi trở thành cột trụ văn–thiền.',
    readingMinutes: 9,
    tags: ['huyền quang', 'trúc lâm', 'tam tổ'],
    sections: [
      {
        title: 'Công hạnh',
        paragraphs: [
          'Huyền Quang từng đỗ đạt, sau xuất gia, trở thành đệ tam tổ. Ngài tiêu biểu cho sự kết hợp học vấn và thiền vị — nhắc rằng trí thế gian nếu xoay đúng hướng sẽ thành trợ duyên lớn cho đạo.',
        ],
      },
    ],
    relatedHePhaiIds: ['truc-lam'],
  },

  // ─── Cổ · cận đại VN ────────────────────────────────────
  {
    id: 'khuong-tang-hoi',
    name: 'Khương Tăng Hội',
    shortName: 'Khương Tăng Hội',
    category: 'co_can_dai',
    era: 'thế kỷ III',
    summary:
      'Danh tăng sớm gắn với Giao Châu — dịch kinh, truyền đạo, cầu nối Ấn · Việt · Giang Đông.',
    readingMinutes: 8,
    tags: ['khương tăng hội', 'giao châu', 'dịch kinh', 'cổ đại'],
    sections: [
      {
        title: 'Vị trí',
        paragraphs: [
          'Ngài được sử Phật giáo nhắc như nhân vật quan trọng thời kỳ đạo mới lan tỏa. Gương về dịch thuật và truyền bá — “đưa pháp đến người” bằng ngôn ngữ họ hiểu.',
        ],
      },
    ],
    relatedHePhaiIds: ['phat-giao-viet-nam'],
  },
  {
    id: 'tu-dao-hanh',
    name: 'Từ Đạo Hạnh',
    shortName: 'Từ Đạo Hạnh',
    category: 'co_can_dai',
    era: 'thế kỷ XI–XII',
    summary:
      'Thiền sư – danh sĩ đời Lý, gắn với nhiều truyền thuyết dân gian và chùa Láng (Thiên Phúc) tại Hà Nội.',
    readingMinutes: 8,
    tags: ['từ đạo hạnh', 'nhà lý', 'chùa láng', 'truyền thuyết'],
    sections: [
      {
        title: 'Giữa sử và huyền thoại',
        paragraphs: [
          'Cuộc đời Ngài hòa quyện sử ký và truyền thuyết (bao gồm chuyện tái sinh liên hệ vua Lý Thần Tông trong dân gian). Với người học đạo: hãy kính ngưỡng tinh thần tu hành và gắn bó cộng đồng, đồng thời phân biệt lớp huyền thoại với phần lịch sử có thể kiểm chứng.',
        ],
      },
    ],
  },
  {
    id: 'chan-nguyen',
    name: 'Thiền sư Chân Nguyên',
    shortName: 'Chân Nguyên',
    category: 'co_can_dai',
    era: '1647–1726',
    summary:
      'Danh tăng thời Lê trung hưng — có công chấn hưng thiền học, trước tác và đào tạo môn đồ.',
    readingMinutes: 8,
    tags: ['chân nguyên', 'thiền', 'thời lê', 'chấn hưng'],
    sections: [
      {
        title: 'Công hạnh',
        paragraphs: [
          'Trong bối cảnh đạo pháp thăng trầm, Chân Nguyên góp phần làm sống lại sinh hoạt thiền và văn hệ. Gương về trước tác và dạy chúng — đạo cần được viết lại, nói lại cho từng thời.',
        ],
      },
    ],
    relatedHePhaiIds: ['lam-te-tao-dong', 'thien-tong'],
  },
  {
    id: 'lieu-quan',
    name: 'Thiền sư Liễu Quán',
    shortName: 'Liễu Quán',
    category: 'co_can_dai',
    era: '1667–1742',
    summary:
      'Tổ thiền Đàng Trong — pháp mạch ảnh hưởng sâu ở Thuận Hóa và nhiều tổ đình miền Trung.',
    readingMinutes: 8,
    tags: ['liễu quán', 'đàng trong', 'thiền', 'huế'],
    sections: [
      {
        title: 'Công hạnh',
        paragraphs: [
          'Liễu Quán được kính như tổ có công mở mang thiền học phương Nam. Nhiều chùa miền Trung vẫn kể pháp mạch từ Ngài — nhắc người học tôn trọng tổ đình địa phương.',
        ],
      },
    ],
    relatedHePhaiIds: ['lam-te-tao-dong'],
  },
  {
    id: 'minh-dang-quang',
    name: 'Tổ sư Minh Đăng Quang',
    shortName: 'Minh Đăng Quang',
    category: 'co_can_dai',
    era: '1923–1954?',
    aliases: ['Đức Tổ sư hệ phái Khất sĩ'],
    summary:
      'Khai sáng hệ phái Khất sĩ Việt Nam — hạnh giản dị, trì bình, giáo hóa gần dân.',
    readingMinutes: 9,
    tags: ['minh đăng quang', 'khất sĩ', 'tịnh xá'],
    keyPoints: [
      'Mở đường cho một hệ xuất gia bản sắc Việt thế kỷ XX.',
      'Tịnh xá Khất sĩ lan nhiều tỉnh thành.',
    ],
    sections: [
      {
        title: 'Công hạnh',
        paragraphs: [
          'Tổ sư đề xướng lối sống khất sĩ hiện đại: y vàng, giản dị, lấy giải thoát và giáo hóa làm trọng. Cuối đời Ngài để lại nhiều dấu hỏi lịch sử, nhưng pháp mạch và chúng đệ tử tiếp tục hành đạo rõ nét đến hôm nay.',
        ],
      },
    ],
    relatedHePhaiIds: ['khat-si'],
    relatedTools: [
      { href: '/phong-thuy/he-phai-tong-mon', label: 'Hệ phái Khất sĩ' },
    ],
  },

  // ─── Hiện đại ───────────────────────────────────────────
  {
    id: 'thich-quang-duc',
    name: 'Bồ tát Thích Quảng Đức',
    shortName: 'Thích Quảng Đức',
    category: 'can_dai',
    era: '1897–1963',
    summary:
      'Vị Tăng sĩ tự thiêu năm 1963 tại Sài Gòn — biểu tượng lòng dũng cảm vì đạo pháp và hòa bình, được thế giới nhớ đến.',
    readingMinutes: 11,
    tags: ['thích quảng đức', '1963', 'bồ tát', 'sài gòn'],
    keyPoints: [
      'Hành động vì nguyện vọng bảo vệ đạo pháp — không phải kích động bạo lực với người khác.',
      'Để lại thông điệp từ bi và bất bạo động sâu sắc.',
    ],
    sections: [
      {
        title: 'Bối cảnh',
        paragraphs: [
          'Trong giai đoạn Phật giáo bị đàn áp, Hòa thượng Thích Quảng Đức đã thực hiện cuộc tự thiêu sau khi để lại thất vọng thư. Ngọn lửa ấy trở thành biểu tượng quốc tế về tinh thần bất khuất và lời kêu gọi tôn giáo bình đẳng.',
        ],
      },
      {
        title: 'Học gì hôm nay?',
        paragraphs: [
          'Không bắt chước hình thức cực đoan. Học tâm nguyện: sẵn sàng hy sinh cái tôi vì Chánh pháp và chúng sinh; sống bất bạo động; giữ giới và từ bi ngay cả khi bị đối xử bất công.',
        ],
      },
    ],
    legacy: [
      'Tượng và nơi tưởng niệm tại TP. Hồ Chí Minh.',
      'Biểu tượng Phật giáo Việt trên trường quốc tế.',
    ],
  },
  {
    id: 'thich-nhat-hanh',
    name: 'Thiền sư Thích Nhất Hạnh',
    shortName: 'Thích Nhất Hạnh',
    category: 'can_dai',
    era: '1926–2022',
    aliases: ['Thầy Nhất Hạnh', 'Làng Mai'],
    summary:
      'Người đưa chánh niệm (mindfulness) Việt ra thế giới — thiền tập trong hơi thở, bước chân, và hòa bình.',
    readingMinutes: 12,
    tags: ['nhất hạnh', 'chánh niệm', 'làng mai', 'thiền'],
    keyPoints: [
      'Pháp môn gần đời: thở, đi, ăn trong chánh niệm.',
      'Dấn thân hòa bình, đối thoại, trị liệu khổ đau.',
      'Làng Mai và nhiều trung tâm thực hành trên thế giới.',
    ],
    sections: [
      {
        title: 'Công hạnh',
        paragraphs: [
          'Thầy xuất gia từ trẻ, hoạt động văn hóa–xã hội và thiền tập, viết nhiều sách giúp người hiện đại tiếp cận đạo. Dù có tranh luận về cách diễn đạt giữa các truyền thống, ảnh hưởng của Thầy trong việc đưa hơi thở tỉnh thức vào đời sống toàn cầu là rõ ràng.',
        ],
      },
      {
        title: 'Thực hành mang về',
        paragraphs: [
          'Một hơi thở ý thức khi sắp nổi giận. Một bước chân khi đi. Một nụ cười khi rửa chén. Đó là “thiền” không cần am cao — rất gần tinh thần cư sĩ bận rộn.',
        ],
      },
    ],
    relatedHePhaiIds: ['thien-tong', 'thien-tinh-song-tu'],
    relatedTools: [
      { href: '/phong-thuy/giao-ly-can-ban', label: 'Thiền · chánh niệm' },
    ],
  },
  {
    id: 'thich-thanh-tu',
    name: 'Hòa thượng Thích Thanh Từ',
    shortName: 'Thích Thanh Từ',
    category: 'can_dai',
    era: '1924–',
    summary:
      'Có công lớn chấn hưng thiền Trúc Lâm hiện đại — mở nhiều thiền viện, hướng dẫn thời khóa rõ ràng cho Tăng Ni và cư sĩ.',
    readingMinutes: 10,
    tags: ['thanh từ', 'trúc lâm', 'thiền viện', 'chấn hưng'],
    keyPoints: [
      'Làm sống lại sinh hoạt thiền đường Trúc Lâm trên quy mô rộng.',
      'Ngôn ngữ giảng giản dị, sát thực hành.',
    ],
    sections: [
      {
        title: 'Công hạnh',
        paragraphs: [
          'Hòa thượng dành đời mình cho việc phục hưng pháp mạch Trúc Lâm: xây dựng thiền viện, in sách, hướng dẫn chỉ quán / nhìn lại mình. Nhiều Phật tử Việt biết đến “thiền viện Trúc Lâm” qua duyên này.',
        ],
      },
    ],
    relatedHePhaiIds: ['truc-lam'],
    relatedTools: [
      { href: '/phong-thuy/he-phai-tong-mon', label: 'Trúc Lâm Yên Tử' },
    ],
  },
  {
    id: 'thich-minh-chau',
    name: 'Hòa thượng Thích Minh Châu',
    shortName: 'Thích Minh Châu',
    category: 'can_dai',
    era: '1918–2012',
    summary:
      'Học giả–cao tăng: dịch và nghiên cứu Kinh điển Pāli, góp phần đối thoại Nam–Bắc truyền và đào tạo Tăng tài.',
    readingMinutes: 9,
    tags: ['minh châu', 'pali', 'học giả', 'dịch kinh'],
    sections: [
      {
        title: 'Công hạnh',
        paragraphs: [
          'Ngài được kính trọng vì công trình dịch thuật và học thuật, giúp Phật tử Việt tiếp cận gần hơn nguồn Pāli. Gương về trí tuệ và cần mẫn trên bàn viết — cũng là hạnh Bồ Tát trong thời đại học đường.',
        ],
      },
    ],
    relatedHePhaiIds: ['nam-truyen', 'dai-thua-tieu-thua'],
  },
  {
    id: 'thich-tri-quang',
    name: 'Hòa thượng Thích Trí Quang',
    shortName: 'Thích Trí Quang',
    category: 'can_dai',
    era: '1924–2019',
    summary:
      'Nhân vật quan trọng của Phật giáo miền Trung thế kỷ XX — lãnh đạo tinh thần trong giai đoạn biến động.',
    readingMinutes: 8,
    tags: ['trí quang', 'huế', 'thế kỷ xx'],
    sections: [
      {
        title: 'Ghi nhớ',
        paragraphs: [
          'Ngài gắn liền với phong trào bảo vệ đạo pháp và sinh hoạt Giáo hội giai đoạn khó khăn. Người học đạo hôm nay có thể nghiên cứu sử để hiểu bối cảnh — lấy tinh thần bất khuất và trách nhiệm cộng đồng, không đem sử vào tranh chấp phe phái hiện tại.',
        ],
      },
    ],
  },

  // ─── Tịnh · Thiền VN ────────────────────────────────────
  {
    id: 'thich-tri-tinh',
    name: 'Hòa thượng Thích Trí Tịnh',
    shortName: 'Thích Trí Tịnh',
    category: 'tinh_do_thien',
    era: '1917–2014',
    summary:
      'Bậc tôn túc Tịnh Độ — dịch kinh, giảng dạy, để lại ảnh hưởng sâu trong việc trì danh và nghi thức Việt.',
    readingMinutes: 9,
    tags: ['trí tịnh', 'tịnh độ', 'dịch kinh', 'niệm phật'],
    keyPoints: [
      'Gắn với sự nghiệp phiên dịch và truyền trì Tịnh tông.',
      'Gương về tuổi cao vẫn tinh tấn phụng sự.',
    ],
    sections: [
      {
        title: 'Công hạnh',
        paragraphs: [
          'Hòa thượng được hàng triệu Phật tử kính ngưỡng qua các bản dịch kinh và pháp ngữ Tịnh Độ. Nhắc người niệm Phật: lấy tín nguyện hạnh làm gốc, sống lâu trên đời vẫn không rời danh hiệu.',
        ],
      },
    ],
    relatedHePhaiIds: ['tinh-do'],
    relatedTools: [
      { href: '/go-mo', label: 'Niệm Phật' },
      { href: '/phong-thuy/he-phai-tong-mon', label: 'Tịnh Độ tông' },
    ],
  },
  {
    id: 'thich-thien-hoa',
    name: 'Hòa thượng Thích Thiện Hoa',
    shortName: 'Thích Thiện Hoa',
    category: 'tinh_do_thien',
    era: '1918–1973',
    summary:
      'Danh tăng giáo dục — trước tác Phật học phổ thông, góp phần đào tạo thế hệ Tăng Ni và cư sĩ hiểu đạo.',
    readingMinutes: 8,
    tags: ['thiện hoa', 'giáo dục', 'phật học', 'trước tác'],
    sections: [
      {
        title: 'Công hạnh',
        paragraphs: [
          'Ngài để lại nhiều sách nhập môn dễ đọc — cầu nối giữa giáo lý và người mới. Gương về “pháp thí”: viết và dạy cho số đông hiểu đúng Chánh pháp.',
        ],
      },
    ],
    relatedTools: [
      { href: '/phong-thuy/giao-ly-can-ban', label: 'Giáo lý căn bản' },
    ],
  },
  {
    id: 'thich-don-hau',
    name: 'Hòa thượng Thích Đôn Hậu',
    shortName: 'Thích Đôn Hậu',
    category: 'tinh_do_thien',
    era: '1905–1992',
    summary:
      'Cao tăng miền Trung — trụ trì các tổ đình, gương giới hạnh và lãnh đạo tinh thần qua thời kỳ khó.',
    readingMinutes: 7,
    tags: ['đôn hậu', 'huế', 'tổ đình'],
    sections: [
      {
        title: 'Ghi nhớ',
        paragraphs: [
          'Ngài được kính vì giới đức và vai trò ổn định đạo pháp tại cố đô. Với Phật tử: học sự điềm đạm, giữ chùa và giữ chúng trong hoàn cảnh biến động.',
        ],
      },
    ],
  },

  // ─── Học gương ──────────────────────────────────────────
  {
    id: 'hoc-guong-danh-tang',
    name: 'Cách học gương danh tăng',
    shortName: 'Cách học gương',
    category: 'thuc_hanh',
    era: 'thực hành',
    summary:
      'Không chỉ đọc tiểu sử — chọn một hạnh, thực hành một tuần, rồi mới đọc vị kế.',
    readingMinutes: 7,
    tags: ['học gương', 'thực hành', 'tinh tấn', 'kính ngưỡng'],
    keyPoints: [
      'Một hạnh / một tuần.',
      'Kính ngưỡng + tự tu, không sùng bái mù.',
      'Gần nhất: học theo thầy bổn sư / trụ trì đang hướng dẫn.',
    ],
    sections: [
      {
        title: 'Bốn bước',
        paragraphs: ['Gợi ý đơn giản:'],
        bullets: [
          'Đọc một tiểu sử đến hết.',
          'Viết một câu: “Hạnh mình học là…”.',
          'Thực hành bảy ngày (ví dụ: ái ngữ như tinh thần từ bi của vị ấy).',
          'Hồi hướng công đức và chuyển sang bài khác.',
        ],
      },
    ],
    relatedTools: [
      { href: '/phong-thuy/giao-ly-can-ban', label: 'Giáo lý căn bản' },
      { href: '/phong-thuy/phap-thoai', label: 'Pháp thoại' },
      { href: '/dang-ky-phat-tu', label: 'Ghi danh gần đạo tràng' },
    ],
  },
  {
    id: 'to-dinh-va-su-chua',
    name: 'Tổ đình · sử chùa · bài vị tổ',
    shortName: 'Tổ đình · sử chùa',
    category: 'thuc_hanh',
    era: 'thực hành',
    summary:
      'Mỗi chùa có mạch tổ riêng. Đọc biển tên, nhà tổ, sách sử chùa — bổ sung cho danh sách chung trên website.',
    readingMinutes: 6,
    tags: ['tổ đình', 'sử chùa', 'bài vị', 'pháp mạch'],
    sections: [
      {
        title: 'Việc nên làm khi về chùa',
        paragraphs: [
          'Xin phép thăm nhà tổ. Đọc bảng sơ lược lịch sử. Hỏi ban hộ tự pháp mạch nếu chưa rõ. Không tự ý di chuyển đồ thờ. Chụp ảnh chỉ khi được cho phép.',
        ],
      },
    ],
    relatedTools: [
      { href: '/#gioi-thieu', label: 'Giới thiệu nhà chùa' },
    ],
  },
];

export function getDanhTangEntry(id: string): DanhTangEntry | undefined {
  return DANH_TANG_ENTRIES.find((e) => e.id === id);
}

function normalize(text: string): string {
  return text
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .trim();
}

export function searchDanhTangEntries(
  query: string,
  category: DanhTangCategory | 'all' = 'all',
): DanhTangEntry[] {
  const q = normalize(query);
  return DANH_TANG_ENTRIES.filter((entry) => {
    if (category !== 'all' && entry.category !== category) return false;
    if (!q) return true;
    const haystack = normalize(
      [
        entry.name,
        entry.shortName,
        entry.era,
        entry.summary,
        ...(entry.aliases ?? []),
        ...entry.tags,
        ...(entry.keyPoints ?? []),
        ...(entry.legacy ?? []),
        ...entry.sections.flatMap((s) => [
          s.title ?? '',
          ...s.paragraphs,
          ...(s.bullets ?? []),
        ]),
      ].join(' '),
    );
    return haystack.includes(q);
  });
}
