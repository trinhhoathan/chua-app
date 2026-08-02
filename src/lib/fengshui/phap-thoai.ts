/**
 * Pháp thoại — khung nghe pháp & chủ đề giảng phổ biến tại chùa Việt.
 * Nội dung mang tính chuẩn bị / ôn tập; lời giảng cụ thể theo trụ trì.
 */

export type PhapThoaiCategory =
  | 'nghe_phap'
  | 'giao_ly'
  | 'thuc_hanh'
  | 'doi_song'
  | 'le_via'
  | 'bo_tat';

export const PHAP_THOAI_CATEGORY_LABELS: Record<PhapThoaiCategory, string> = {
  nghe_phap: 'Nghe pháp',
  giao_ly: 'Giáo lý',
  thuc_hanh: 'Thực hành',
  doi_song: 'Đời sống',
  le_via: 'Lễ · vía',
  bo_tat: 'Bồ Tát đạo',
};

export interface PhapThoaiSection {
  title?: string;
  paragraphs: string[];
  bullets?: string[];
}

/** Bài / chủ đề pháp thoại để đọc trước hoặc ôn sau khi nghe. */
export interface PhapThoaiTalk {
  id: string;
  title: string;
  shortTitle: string;
  category: PhapThoaiCategory;
  summary: string;
  /** Thời lượng nghe / đọc gợi ý (phút) */
  durationMinutes: number;
  tags: string[];
  /** Ai nên nghe trước */
  audience?: string;
  sections: PhapThoaiSection[];
  keyPoints?: string[];
  /** Việc làm sau khi nghe */
  afterListening?: string[];
  relatedTools?: { href: string; label: string }[];
  relatedGiaoLyIds?: string[];
}

export const PHAP_THOAI_INTRO =
  'Pháp thoại là thời gian Tăng Ni giảng giải Chánh pháp — giúp Phật tử nghe, hiểu và đem vào đời sống. Trang này gồm cách nghe pháp, oai nghi, và các chủ đề thường gặp để quý vị chuẩn bị trước hoặc ôn lại sau buổi giảng. Lịch và video cụ thể do nhà chùa đăng.';

export const PHAP_THOAI_FOOTNOTE =
  'Nội dung mang tính gợi ý phổ thông Bắc truyền. Lời giảng của thầy trụ trì / pháp sư mới là chuẩn theo đạo tràng. Khi nghi, nên hỏi trực tiếp Tăng Ni.';

/** Hướng dẫn ngắn ở đầu trang (không cần mở từng bài). */
export const PHAP_THOAI_GUIDES: {
  title: string;
  body: string;
}[] = [
  {
    title: 'Nghe pháp để làm gì?',
    body: 'Nghe pháp nuôi chánh kiến, làm mềm phiền não và chỉ rõ việc cần làm tiếp theo — không phải để “sưu tầm kiến thức” hay phê bình thầy. Một câu đúng duyên có thể đổi cách sống cả năm.',
  },
  {
    title: 'Ba bước: Nghe · Suy · Tu',
    body: 'Nghe cho rõ (văn); suy cho thấm (tư); làm cho thành (tu). Thiếu một trong ba, pháp thoại dễ thành giải trí tâm linh. Sau buổi giảng, chọn một ý nhỏ để thực hành trong tuần.',
  },
  {
    title: 'Oai nghi khi dự giảng',
    body: 'Đến sớm, điện thoại im, ngồi ngay ngắn, không nói chuyện riêng. Có thể ghi chú ngắn. Không ghi hình nếu nhà chùa chưa cho phép. Hỏi đáp đúng lúc, ngắn gọn, với tâm cầu học.',
  },
  {
    title: 'Nghe online / xem lại video',
    body: 'Chọn chỗ yên, tai nghe nếu cần, tránh vừa xem vừa lướt mạng. Xem xong hồi hướng công đức. Video nhà chùa đăng (nếu có) nằm ở mục bên dưới; kênh YouTube / Facebook của chùa cũng là nơi theo dõi buổi mới.',
  },
];

export const PHAP_THOAI_TALKS: PhapThoaiTalk[] = [
  // ─── Nghe pháp ──────────────────────────────────────────
  {
    id: 'cach-nghe-phap',
    title: 'Cách nghe pháp có lợi ích',
    shortTitle: 'Cách nghe pháp',
    category: 'nghe_phap',
    summary:
      'Thái độ, chuẩn bị và giữ tâm khi nghe — để một buổi giảng thật sự chuyển hóa, không trôi qua như tiếng gió.',
    durationMinutes: 12,
    tags: ['nghe pháp', 'văn tư tu', 'oai nghi', 'chánh kiến'],
    audience: 'Mọi Phật tử, đặc biệt người mới lần đầu dự giảng.',
    keyPoints: [
      'Nghe với tâm khiêm hạ, không nghe để bắt lỗi.',
      'Một buổi chỉ cần “mang về” một việc làm cụ thể.',
      'Hồi hướng và ôn lại trong tuần mới giữ được pháp.',
    ],
    sections: [
      {
        title: 'Trước khi nghe',
        paragraphs: [
          'Ngủ đủ, ăn uống điều độ, đến chùa (hoặc mở video) với tâm mong được lợi lạc — không phải để “cho có mặt”. Nếu biết chủ đề trước, đọc nhanh vài dòng giáo lý liên quan sẽ giúp nghe dễ khớp hơn.',
          'Phát nguyện ngắn: “Con xin lắng nghe để hiểu đúng và làm theo.” Nguyện nhỏ giúp tâm bớt tán loạn.',
        ],
        bullets: [
          'Tắt thông báo điện thoại.',
          'Mang sổ nhỏ hoặc dùng ghi chú trên điện thoại (im lặng).',
          'Ngồi chỗ nghe rõ, không chắn lối đi.',
        ],
      },
      {
        title: 'Trong lúc nghe',
        paragraphs: [
          'Tai lắng, mắt nhìn thầy (hoặc màn hình) vừa phải — không cần ghi từng chữ. Khi tâm chạy đi, biết rồi kéo về câu đang giảng. Gặp chỗ chưa hiểu: đánh dấu hỏi sau, đừng vội kết luận thầy sai.',
          'Phân biệt lời pháp và chuyện minh họa. Ví dụ đời thường chỉ là cầu nối; tinh túy nằm ở chánh kiến, giới, từ bi mà thầy muốn chỉ.',
        ],
      },
      {
        title: 'Sau khi nghe',
        paragraphs: [
          'Trong năm phút cuối hoặc lúc về nhà: viết 1–3 ý chính + một hành động trong tuần (ví dụ: mỗi tối niệm Phật 10 phút; hoặc nói lời ái ngữ với người nhà). Hồi hướng công đức nghe pháp cho ông bà và pháp giới chúng sinh.',
          'Nếu có duyên, thảo luận ngắn với đạo hữu — không biến thành tranh luận hơn thua.',
        ],
      },
    ],
    afterListening: [
      'Chọn đúng một ý để thực hành bảy ngày.',
      'Ôn lại bằng cách đọc bài Giáo lý căn bản liên quan.',
      'Chia sẻ nhẹ với người thân nếu họ vui lòng nghe — không áp đặt.',
    ],
    relatedTools: [
      { href: '/phong-thuy/giao-ly-can-ban', label: 'Giáo lý căn bản' },
      { href: '/dang-ky-phat-tu', label: 'Ghi danh nhận tin giảng' },
    ],
  },
  {
    id: 'phan-biet-chanh-ta',
    title: 'Nhận ra lời dạy đúng hướng Chánh pháp',
    shortTitle: 'Chánh pháp · tà thuyết',
    category: 'nghe_phap',
    summary:
      'Tiêu chí đơn giản để Phật tử tự bảo vệ: lời dạy có dẫn về giới · định · tuệ và giảm tham sân si hay không.',
    durationMinutes: 10,
    tags: ['chánh pháp', 'tà kiến', 'pháp ấn', 'cảnh giác'],
    audience: 'Ai thường nghe nhiều nguồn trên mạng.',
    keyPoints: [
      'Chánh pháp hướng giảm tham · sân · si, tăng từ bi và trí tuệ.',
      'Đề cao thần thông, tiền bạc “mua giải thoát”, chia rẽ Tăng già — cần thận trọng.',
      'Đối chiếu Tam pháp ấn: vô thường · khổ · vô ngã.',
    ],
    sections: [
      {
        title: 'Dấu hiệu lành',
        paragraphs: [
          'Lời dạy khuyến khích giữ giới, làm thiện, sám hối, kính Tam Bảo, hòa hợp đạo tràng. Thầy không tự đề cao bản thân hơn Phật pháp. Có chỗ dẫn về kinh điển hoặc truyền thống rõ ràng.',
        ],
      },
      {
        title: 'Dấu hiệu cần dừng lại',
        paragraphs: [
          'Hứa bảo đảm giàu sang / khỏi bệnh chỉ nhờ “bí quyết” trả phí; khuyên phạm giới vì mục đích thế gian; kích động thù hận nhóm khác; yêu cầu tuyệt đối phục tùng cá nhân. Gặp vậy nên hỏi trụ trì đạo tràng mình đang nương tựa.',
        ],
      },
    ],
    afterListening: [
      'Khi nghe nguồn lạ: ghi câu gây nghi và hỏi Tăng Ni trước khi tin sâu.',
    ],
    relatedTools: [
      { href: '/phong-thuy/giao-ly-can-ban', label: 'Tam pháp ấn · Tứ Đế' },
    ],
    relatedGiaoLyIds: ['tam-phap-an', 'tu-dieu-de'],
  },
  {
    id: 'hoi-dap-sau-giang',
    title: 'Hỏi đáp sau buổi giảng',
    shortTitle: 'Hỏi đáp đúng cách',
    category: 'nghe_phap',
    summary:
      'Cách đặt câu hỏi ngắn, rõ, với tâm cầu học — để buổi hỏi đáp lợi mình và không làm rối chúng.',
    durationMinutes: 8,
    tags: ['hỏi đáp', 'oai nghi', 'cầu học'],
    keyPoints: [
      'Một câu hỏi = một ý; nêu hoàn cảnh vừa đủ.',
      'Không biến hỏi đáp thành kể chuyện dài hoặc tranh luận.',
      'Câu riêng tư / nhân quả cá nhân nên hỏi riêng thầy sau.',
    ],
    sections: [
      {
        title: 'Câu hỏi tốt trông như thế nào?',
        paragraphs: [
          'Ví dụ: “Thưa thầy, khi niệm Phật mà tạp niệm nhiều, con nên giữ số câu hay chú trọng chất lượng từng câu?” — rõ ràng, liên quan pháp đang giảng, không chỉ trích người khác.',
          'Tránh: hỏi để thể hiện mình biết nhiều; hỏi chuyện chính trị / thị phi đạo tràng; hỏi “thầy đoán giúp con năm nay có giàu không?” nếu đang trong giờ pháp thoại.',
        ],
      },
      {
        title: 'Khi không kịp hỏi',
        paragraphs: [
          'Ghi lại và gửi qua kênh nhà chùa cho phép (Zalo ban hộ tự, giờ tiếp Phật tử…). Hoặc đem câu hỏi vào mục Hỏi đáp Phật học khi trang đó mở, kèm tâm sẵn sàng nghe cả câu “cần giữ giới trước đã”.',
        ],
      },
    ],
    relatedTools: [
      { href: '/phong-thuy/hoi-dap-phat-hoc', label: 'Hỏi đáp Phật học' },
    ],
  },

  // ─── Giáo lý ────────────────────────────────────────────
  {
    id: 'tu-de-trong-doi',
    title: 'Tứ Diệu Đế trong đời thường',
    shortTitle: 'Tứ Đế đời thường',
    category: 'giao_ly',
    summary:
      'Khổ · Tập · Diệt · Đạo không nằm trên sách — hiện mỗi khi ta lo âu, bám víu và tìm lối ra.',
    durationMinutes: 18,
    tags: ['tứ đế', 'khổ', 'tham ái', 'niết bàn', 'bát chánh đạo'],
    audience: 'Người mới và ai muốn ôn nền tảng trước khóa tu.',
    keyPoints: [
      'Khổ: nhìn thẳng bất toại nguyện, không phủ nhận cũng không phóng đại.',
      'Tập: thấy tham ái và vô minh đang nuôi khổ.',
      'Diệt & Đạo: khổ hết được nhờ Bát Chánh Đạo — bắt đầu từ việc nhỏ.',
    ],
    sections: [
      {
        title: 'Mạch giảng gợi ý',
        paragraphs: [
          'Mở đầu bằng một tình huống quen: mất việc, giận người nhà, sợ bệnh. Chỉ ra đây là Khổ Đế đang hiện. Hỏi tiếp: mình đang muốn điều gì đến mức tâm cháy? — đó là dấu vết Tập Đế.',
          'Chuyển sang tin tức lành: khổ không phải bản án vĩnh viễn. Diệt Đế là khả năng mát mẻ khi buông ái. Đạo Đế: chọn một chi Bát Chánh Đạo trong tuần (ví dụ Chánh ngữ).',
        ],
      },
      {
        title: 'Hình ảnh thầy thuốc',
        paragraphs: [
          'Đức Phật như lương y: biết bệnh, biết nguyên nhân, biết lành được, kê thuốc. Phật tử đến nghe pháp như bệnh nhân hợp tác — uống thuốc (thực hành), không chỉ khen đơn thuốc đẹp.',
        ],
      },
      {
        title: 'Liên hệ kinh · sách',
        paragraphs: [
          'Có thể ôn bài Tứ Diệu Đế và Bát Chánh Đạo trong Giáo lý căn bản trước khi nghe. Sau giảng, đọc lại phần Đạo Đế và chọn việc làm.',
        ],
      },
    ],
    afterListening: [
      'Viết một khổ đang gặp và nguyên nhân bám chấp của chính mình.',
      'Chọn một chi Bát Chánh Đạo để theo dõi bảy ngày.',
    ],
    relatedTools: [
      { href: '/phong-thuy/giao-ly-can-ban', label: 'Giáo lý: Tứ Đế · Bát Chánh' },
    ],
    relatedGiaoLyIds: ['tu-dieu-de', 'bat-chanh-dao'],
  },
  {
    id: 'nghiep-qua-hieu-dung',
    title: 'Nghiệp quả hiểu đúng — không sợ hãi mù quáng',
    shortTitle: 'Nghiệp quả',
    category: 'giao_ly',
    summary:
      'Nhân quả là động lực sống thiện, không phải lời đe dọa. Chủ ý (ý nghiệp) quyết định chất nghiệp.',
    durationMinutes: 16,
    tags: ['nghiệp', 'nhân quả', 'ý nghiệp', 'sám hối'],
    keyPoints: [
      'Nghiệp là hành động có chủ ý — có thể chuyển bằng sám và thiện hạnh.',
      'Không phải mọi sự đều “tại nghiệp đời trước”.',
      'Sợ nhân quả đúng mức giúp giữ giới; sợ quá hóa mê tín.',
    ],
    sections: [
      {
        title: 'Điểm cần giảng rõ',
        paragraphs: [
          'Phân biệt nghiệp cá nhân và duyên hoàn cảnh. Tránh kết án người đang khổ (“do tội họ”). Khuyến khích: biết lỗi → sám → không tái phạm → làm thiện → tu tuệ.',
          'Nói về quả chín có sớm có muộn để người nghe không chủ quan cũng không tuyệt vọng.',
        ],
      },
      {
        title: 'Ví dụ đời sống',
        paragraphs: [
          'Lời nói dối một lần có thể mất niềm tin lâu năm — nhân nhỏ duyên mạnh. Ngược lại, một chuỗi ngày ái ngữ có thể chữa mối quan hệ — thiện cũng cần nuôi liên tục.',
        ],
      },
    ],
    afterListening: [
      'Mỗi tối sám một lỗi nhỏ cụ thể trong ngày.',
      'Làm một thiện không khoe (bố thí thầm, giúp việc nhà…).',
    ],
    relatedTools: [
      { href: '/phong-thuy/giao-ly-can-ban', label: 'Bài Nghiệp · quả' },
      { href: '/phong-thuy/van-khan-nghi-le', label: 'Văn khấn sám hối' },
    ],
    relatedGiaoLyIds: ['nghiep-qua', 'sam-hoi'],
  },
  {
    id: 'vo-thuong-vo-nga',
    title: 'Vô thường và vô ngã — sống nhẹ hơn',
    shortTitle: 'Vô thường · vô ngã',
    category: 'giao_ly',
    summary:
      'Thấy mọi thứ đổi thay và “cái tôi” chỉ là duyên hợp — giảm bám, tăng trân trọng phút giây hiện tại.',
    durationMinutes: 15,
    tags: ['vô thường', 'vô ngã', 'ngũ uẩn', 'buông xả'],
    keyPoints: [
      'Vô thường không bi quan — giúp trân quý và bớt tuyệt vọng.',
      'Vô ngã không phủ nhận trách nhiệm — giúp bớt phòng thủ cái tôi.',
    ],
    sections: [
      {
        title: 'Mạch giảng',
        paragraphs: [
          'Từ chuyện mất mát, già bệnh, đổi nghề — chỉ vô thường. Từ khen chê trên mạng — chỉ ngũ uẩn đang bị kích. Hướng về thực hành: thở chánh niệm khi cảm xúc mạnh; niệm Phật khi tâm loạn.',
        ],
      },
    ],
    afterListening: [
      'Mỗi tối nhớ một việc “đã đổi” trong ngày — luyện nhìn vô thường nhẹ nhàng.',
    ],
    relatedGiaoLyIds: ['tam-phap-an', 'ngu-uan'],
    relatedTools: [
      { href: '/phong-thuy/giao-ly-can-ban', label: 'Tam pháp ấn · Ngũ uẩn' },
    ],
  },

  // ─── Thực hành ──────────────────────────────────────────
  {
    id: 'niem-phat-hang-ngay',
    title: 'Niệm Phật trong đời sống bận rộn',
    shortTitle: 'Niệm Phật đời thường',
    category: 'thuc_hanh',
    summary:
      'Tín · Nguyện · Hạnh gọn nhẹ cho cư sĩ: biến phút chờ, lúc lo âu thành hạt giống tỉnh thức.',
    durationMinutes: 14,
    tags: ['niệm phật', 'tịnh độ', 'trì danh', 'cư sĩ'],
    audience: 'Phật tử Tịnh Độ và ai cần pháp môn dễ cầm.',
    keyPoints: [
      'Đều đặn ngắn tốt hơn ngồi dài rồi bỏ.',
      'Tai nghe tiếng niệm của mình — nhiếp tâm.',
      'Hồi hướng mỗi cuối buổi.',
    ],
    sections: [
      {
        title: 'Nội dung thường giảng',
        paragraphs: [
          'Giải thích ngắn Cực Lạc và bản nguyện A Di Đà — đủ để sinh tín, không sa vào tranh luận trường phái. Hướng dẫn tư thế, chuỗi 108, xử lý tạp niệm. Khuyến khích kết hợp giữ ngũ giới.',
          'Có thể hướng dẫn niệm theo nhịp mõ tại nhà hoặc trên trang Gõ mõ của website.',
        ],
      },
      {
        title: 'Chướng ngại thường gặp',
        paragraphs: [
          '“Niệm mãi không thấy gì” — nhắc rằng công phu như tiết kiệm từng đồng. “Bận quá” — chỉ ra các khoảng chết: xếp hàng, kẹt xe, trước ngủ. “Tạp niệm” — không đánh nhau với nghĩ, chỉ trở về danh hiệu.',
        ],
      },
    ],
    afterListening: [
      'Đặt giờ cố định 10 phút/ngày trong một tuần.',
      'Rằm · mùng 1 tăng số câu hoặc đến chùa tụng.',
    ],
    relatedTools: [
      { href: '/go-mo', label: 'Gõ mõ · niệm Phật' },
      { href: '/phong-thuy/kinh-tung-thuong-dung', label: 'Kinh A Di Đà' },
    ],
    relatedGiaoLyIds: ['niem-phat-can-ban'],
  },
  {
    id: 'giu-gioi-cu-si',
    title: 'Giữ giới cư sĩ — hàng rào bảo vệ tâm',
    shortTitle: 'Ngũ giới thực tế',
    category: 'thuc_hanh',
    summary:
      'Ngũ giới không phải nhà tù: từng giới gắn việc làm thay thế tích cực trong gia đình và nghề nghiệp.',
    durationMinutes: 14,
    tags: ['ngũ giới', 'cư sĩ', 'đạo đức', 'thập thiện'],
    keyPoints: [
      'Giữ giới vì hiểu nhân quả và từ bi, không chỉ vì sợ.',
      'Phạm rồi: sám, sửa, không tuyệt vọng.',
    ],
    sections: [
      {
        title: 'Gợi ý triển khai từng giới',
        paragraphs: ['Thầy có thể lấy ví dụ gần:'],
        bullets: [
          'Không sát — ăn chay kỳ, không ngược đãi thú nuôi.',
          'Không đạo — minh bạch tiền bạc công ty / gia đình.',
          'Không tà dâm — thủy chung, không nội dung độc hại.',
          'Không vọng ngữ — đặc biệt trong chat và mạng xã hội.',
          'Không say — giữ tỉnh để khỏi phá các giới khác.',
        ],
      },
    ],
    afterListening: [
      'Chọn một giới yếu nhất của mình để theo dõi hai tuần.',
    ],
    relatedGiaoLyIds: ['ngu-gioi', 'thap-thien'],
    relatedTools: [
      { href: '/phong-thuy/giao-ly-can-ban', label: 'Ngũ giới · Thập thiện' },
      { href: '/phong-thuy/khoa-tu-an-cu', label: 'Khóa tu · Bát Quan Trai' },
    ],
  },
  {
    id: 'thien-chanh-niem-ngan',
    title: 'Chánh niệm mười phút cho người mới',
    shortTitle: 'Chánh niệm 10 phút',
    category: 'thuc_hanh',
    summary:
      'Hướng dẫn ngồi / thở / biết tạp niệm — pháp thoại thực hành, nghe xong làm được ngay.',
    durationMinutes: 12,
    tags: ['thiền', 'chánh niệm', 'hơi thở', 'người mới'],
    keyPoints: [
      'Thiền không phải đầu trống hoàn toàn.',
      'Biết đang nghĩ cũng là niệm.',
      'Ngắn và đều thắng dài rồi bỏ.',
    ],
    sections: [
      {
        title: 'Khung hướng dẫn',
        paragraphs: [
          'Ngồi vững, lưng thoải mái. Theo dõi hơi thở vào–ra. Khi nghĩ lang thang: nhận “đang nghĩ”, mỉm cười nhẹ, về hơi thở. Kết thúc bằng hồi hướng. Có thể kết hợp với niệm Phật như đề mục thay hơi thở.',
        ],
      },
    ],
    afterListening: [
      'Thực hành ngay 5–10 phút sau khi nghe / xem lại.',
    ],
    relatedGiaoLyIds: ['thien-chanh-niem', 'ba-hoc'],
    relatedTools: [
      { href: '/phong-thuy/khoa-tu-an-cu', label: 'Khóa tu tại chùa' },
    ],
  },
  {
    id: 'sam-hoi-hoi-huong',
    title: 'Sám hối và hồi hướng — hai cánh của buổi tu',
    shortTitle: 'Sám hối · hồi hướng',
    category: 'thuc_hanh',
    summary:
      'Rửa lỗi và san sẻ phước: nghi thức cuối khóa thường có — hiểu để làm bằng tâm, không chỉ đọc thuộc.',
    durationMinutes: 11,
    tags: ['sám hối', 'hồi hướng', 'công đức'],
    keyPoints: [
      'Sám đủ: nhận · ăn năn · lộ · quyết sửa.',
      'Hồi hướng chống keo giữ phước chỉ cho mình.',
    ],
    sections: [
      {
        title: 'Sau pháp thoại',
        paragraphs: [
          'Nhiều buổi giảng kết bằng sám ngắn và hồi hướng. Phật tử nên hiểu mình đang làm gì: không “xí xóa” để cố ý tái phạm; không hồi hướng lấy lệ. Có thể học thuộc một bài hồi hướng ngắn để dùng mỗi ngày.',
        ],
      },
    ],
    relatedGiaoLyIds: ['sam-hoi', 'hoi-huong'],
    relatedTools: [
      { href: '/phong-thuy/kinh-tung-thuong-dung', label: 'Kinh tụng · hồi hướng' },
    ],
  },

  // ─── Đời sống ───────────────────────────────────────────
  {
    id: 'gia-dinh-hoa-hop',
    title: 'Đạo Phật trong gia đình',
    shortTitle: 'Gia đình hòa hợp',
    category: 'doi_song',
    summary:
      'Ái ngữ, lắng nghe, phân công việc nhà và cùng hướng thiện — đạo không tách khỏi cửa nhà.',
    durationMinutes: 15,
    tags: ['gia đình', 'ái ngữ', 'hòa hợp', 'cư sĩ'],
    keyPoints: [
      'Tu ở nhà khó hơn ở chùa — cũng công đức lớn hơn nếu làm được.',
      'Không dùng “đạo” để thắng người thân trong tranh cãi.',
    ],
    sections: [
      {
        title: 'Chủ đề thường chạm tới',
        paragraphs: [
          'Chồng vợ khác mức độ tin Phật; dạy con không áp đặt; chăm ông bà; tiền bạc minh bạch. Mỗi tình huống gắn một hạnh: nhẫn, ái ngữ, bố thí thời gian.',
          'Nhắc lục hòa áp dụng cho nhóm nhỏ trong nhà: cùng vui mục đích sống thiện, không nói xấu sau lưng.',
        ],
      },
    ],
    afterListening: [
      'Một tuần: mỗi ngày nói ít nhất một câu khích lệ thật với người nhà.',
    ],
    relatedGiaoLyIds: ['luc-hoa', 'bao-hieu'],
  },
  {
    id: 'nghe-nghiep-chanh-mang',
    title: 'Chánh mạng — nghề nghiệp và nuôi thân',
    shortTitle: 'Chánh mạng',
    category: 'doi_song',
    summary:
      'Nuôi thân bằng nghề lương thiện, giảm nghề hại người — chi Bát Chánh Đạo sát đời sống nhất.',
    durationMinutes: 13,
    tags: ['chánh mạng', 'nghề nghiệp', 'nuôi thân', 'bát chánh đạo'],
    keyPoints: [
      'Không phải ai cũng đổi nghề ngay — nhưng có thể giảm hại và hướng thiện dần.',
      'Cách làm việc (lừa đảo, ép khách) cũng là chánh/tà mạng.',
    ],
    sections: [
      {
        title: 'Góc nhìn thực tế',
        paragraphs: [
          'Thầy thường tránh kết án nghề nhạy cảm một chiều; khuyến khích hỏi lương tâm và tham vấn Tăng Ni. Với chủ doanh nghiệp: minh bạch hợp đồng, không hàng giả, đối xử công nhân tử tế cũng là giữ giới mở rộng.',
        ],
      },
    ],
    relatedGiaoLyIds: ['bat-chanh-dao', 'thap-thien'],
  },
  {
    id: 'xu-ly-san-gian',
    title: 'Chuyển hóa sân giận',
    shortTitle: 'Chuyển sân giận',
    category: 'doi_song',
    summary:
      'Nhận diện lửa sân, dừng phản ứng, dùng hơi thở · niệm Phật · quán từ bi — chủ đề rất được hỏi.',
    durationMinutes: 14,
    tags: ['sân', 'giận', 'từ bi', 'chánh niệm'],
    keyPoints: [
      'Sân đến như khách — không phải mời ở lại.',
      'Nói khi nguội hơn nói khi nóng.',
    ],
    sections: [
      {
        title: 'Các bước thực hành',
        paragraphs: [
          '1) Biết “đang giận”. 2) Không gửi tin nhắn / không quyết định lớn. 3) Thở hoặc niệm Phật 21 câu. 4) Hỏi: mình muốn đúng hay muốn hòa? 5) Nếu cần góp ý — nói sự việc, không tấn công nhân phẩm.',
        ],
      },
    ],
    afterListening: [
      'Lần giận tới: chỉ làm đủ bước 1–3 trước đã.',
    ],
    relatedGiaoLyIds: ['tu-vo-luong-tam', 'thien-chanh-niem'],
  },
  {
    id: 'bao-hieu-vu-lan',
    title: 'Báo hiếu — tinh thần Vu Lan quanh năm',
    shortTitle: 'Báo hiếu',
    category: 'doi_song',
    summary:
      'Hiếu khi còn sống và khi đã mất; dẫn thân bằng pháp mới là đại hiếu theo tinh thần Mục Liên.',
    durationMinutes: 14,
    tags: ['báo hiếu', 'vu lan', 'địa tạng', 'cha mẹ'],
    keyPoints: [
      'Phụng dưỡng và khuyến tấn hướng thiện khi còn sống.',
      'Cầu siêu · làm thiện hồi hướng khi đã mất.',
    ],
    sections: [
      {
        title: 'Nội dung lễ và quanh năm',
        paragraphs: [
          'Kể ngắn nhân duyên Vu Lan; nhấn mạnh không chờ rằm tháng Bảy mới nhớ ân. Gợi ý việc cụ thể: thăm hỏi, chăm sóc, mời đi chùa nếu vui lòng, trì kinh Địa Tạng hồi hướng.',
        ],
      },
    ],
    relatedTools: [
      { href: '/phong-thuy/tra-cuu-kinh', label: 'Kinh Vu Lan · Địa Tạng' },
      { href: '/phong-thuy/van-khan-nghi-le', label: 'Văn khấn báo hiếu' },
    ],
    relatedGiaoLyIds: ['bao-hieu'],
  },

  // ─── Lễ · vía ───────────────────────────────────────────
  {
    id: 'phat-dan',
    title: 'Phật Đản — nhớ ân đản sinh và hạnh xuất gia',
    shortTitle: 'Phật Đản',
    category: 'le_via',
    summary:
      'Chủ đề đại lễ: ý nghĩa đản sinh, tắm Phật, phát nguyện sống theo Trung đạo.',
    durationMinutes: 12,
    tags: ['phật đản', 'vía', 'đản sinh', 'tắm phật'],
    keyPoints: [
      'Đản sinh nhắc khả năng giác ngộ của mỗi người.',
      'Lễ không chỉ hình thức — kèm giữ giới và làm thiện mùa Phật Đản.',
    ],
    sections: [
      {
        title: 'Gợi ý mạch giảng',
        paragraphs: [
          'Tiểu sử ngắn Thái tử → xuất gia → thành đạo (điểm chính). Ý nghĩa nước thơm tắm Phật: rửa bụi tham sân. Kêu gọi mùa Phật Đản: ăn chay kỳ, phóng sinh đúng cách, hòa hợp gia đình.',
        ],
      },
    ],
    relatedTools: [
      { href: '/phong-thuy/ngay-via-phat', label: 'Ngày vía Phật' },
      { href: '/#hoat-dong', label: 'Lịch lễ chùa' },
    ],
    relatedGiaoLyIds: ['duc-phat'],
  },
  {
    id: 'via-quan-am',
    title: 'Vía Quan Âm — từ bi ứng hiện trong đời',
    shortTitle: 'Vía Quan Âm',
    category: 'le_via',
    summary:
      'Quán Thế Âm lắng nghe tiếng khóc cuộc đời — học hạnh nhìn, nghe và giúp đúng cách.',
    durationMinutes: 13,
    tags: ['quan âm', 'từ bi', 'phổ môn', 'vía'],
    keyPoints: [
      'Từ bi có tay chân: lắng nghe + hành động phù hợp.',
      'Trì Phổ Môn / niệm Quan Âm kèm giữ giới.',
    ],
    sections: [
      {
        title: 'Trọng tâm',
        paragraphs: [
          'Giải thích danh hiệu “Quán Thế Âm”. Liên hệ phẩm Phổ Môn. Thực hành: mỗi ngày lắng nghe một người không xen vào ngay; làm một việc giúp đỡ cụ thể trong tuần vía.',
        ],
      },
    ],
    relatedTools: [
      { href: '/phong-thuy/kinh-tung-thuong-dung', label: 'Kinh Phổ Môn' },
      { href: '/phong-thuy/ngay-via-phat', label: 'Lịch vía' },
    ],
    relatedGiaoLyIds: ['tu-vo-luong-tam'],
  },
  {
    id: 'vu-lan-phap-thoai',
    title: 'Vu Lan — mùa báo hiếu và cầu siêu',
    shortTitle: 'Vu Lan',
    category: 'le_via',
    summary:
      'Pháp thoại mùa Vu Lan: ân cha mẹ, Mục Liên, cách cầu siêu và làm da-la đúng tinh thần.',
    durationMinutes: 15,
    tags: ['vu lan', 'báo hiếu', 'cầu siêu', 'tháng bảy'],
    keyPoints: [
      'Hiếu đạo là nền — không thay bằng hình thức đắt tiền.',
      'Cúng dường · làm thiện · trì kinh hồi hướng đi cùng nhau.',
    ],
    sections: [
      {
        title: 'Tránh hiểu lệch',
        paragraphs: [
          'Tháng Bảy không phải “tháng ma” để sợ hãi mê tín. Là mùa nhớ ân và tăng trưởng từ bi với chúng sinh cô độc. Khuyến khích ăn chay, phóng sinh đúng pháp, tham gia lễ chùa.',
        ],
      },
    ],
    relatedTools: [
      { href: '/so-cau', label: 'Sổ cầu an · cầu siêu' },
      { href: '/phong-thuy/van-khan-nghi-le', label: 'Văn khấn Vu Lan' },
    ],
    relatedGiaoLyIds: ['bao-hieu'],
  },
  {
    id: 'ram-mung-1',
    title: 'Rằm · mùng 1 — ngày về chùa nghe pháp',
    shortTitle: 'Rằm · mùng 1',
    category: 'le_via',
    summary:
      'Vì sao nên dự giảng ngày sóc vọng: củng cố công phu tháng, gặp đạo tràng, nghe pháp ngắn.',
    durationMinutes: 10,
    tags: ['rằm', 'mùng 1', 'trai giới', 'về chùa'],
    keyPoints: [
      'Ngày sóc vọng thuận duyên giữ trai giới và nghe pháp.',
      'Đến chùa đều đặn tốt hơn đến một lần rất đông rồi quên.',
    ],
    sections: [
      {
        title: 'Gợi ý cho Phật tử',
        paragraphs: [
          'Sáng: ăn chay, niệm Phật. Trưa / chiều: đến chùa lễ Phật, nghe pháp nếu có. Tối: hồi hướng. Nếu không đến được — xem lại video giảng của chùa (nếu có) và giữ oai nghi như đang trong chính điện.',
        ],
      },
    ],
    relatedTools: [
      { href: '/phong-thuy/ngay-via-phat', label: 'Lịch vía · lễ' },
      { href: '/phong-thuy/van-khan-nghi-le', label: 'Văn khấn rằm' },
    ],
  },

  // ─── Bồ Tát đạo ─────────────────────────────────────────
  {
    id: 'tu-bi-trong-doi',
    title: 'Từ bi không yếu đuối',
    shortTitle: 'Từ bi hành động',
    category: 'bo_tat',
    summary:
      'Từ · Bi · Hỷ · Xả đi với trí tuệ: giúp đúng cách, biết nói không, không nuôi thù.',
    durationMinutes: 14,
    tags: ['từ bi', 'tứ vô lượng', 'bồ tát', 'trí tuệ'],
    keyPoints: [
      'Từ bi không phải chiều chuộng mọi đòi hỏi.',
      'Hỷ chữa ganh; Xả giữ tâm không thiên lệch.',
    ],
    sections: [
      {
        title: 'Thực hành bốn vô lượng',
        paragraphs: [
          'Từ: mong người được vui chân chính. Bi: muốn giảm khổ — có khi là khuyên dừng nghiệp xấu. Hỷ: chúc mừng thành công lành của người. Xả: không thiên vị người thân đến mức bất công.',
        ],
      },
    ],
    relatedGiaoLyIds: ['tu-vo-luong-tam', 'luc-do'],
  },
  {
    id: 'bo-thi-ba-la-mat',
    title: 'Bố thí — tài · pháp · vô úy',
    shortTitle: 'Bố thí',
    category: 'bo_tat',
    summary:
      'Cho của, cho lời dạy đúng, cho sự không sợ hãi — ba lớp bố thí của người học hạnh Bồ Tát.',
    durationMinutes: 12,
    tags: ['bố thí', 'lục độ', 'cúng dường', 'vô úy'],
    keyPoints: [
      'Cho với tâm tôn trọng người nhận.',
      'Pháp thí: chia sẻ lời lành đúng lúc, không khoe.',
      'Vô úy thí: bảo vệ, an ủi, không đe dọa.',
    ],
    sections: [
      {
        title: 'Tránh bố thí lệch',
        paragraphs: [
          'Khoe công đức; cho để mua ảnh hưởng; cho vật hại người (rượu cho người nghiện…). Cúng dường Tam Bảo nên như pháp, hỏi nhà chùa khi chưa rõ.',
        ],
      },
    ],
    relatedGiaoLyIds: ['luc-do'],
    relatedTools: [
      { href: '/dat-nuoc', label: 'Đặt nước · công đức' },
      { href: '/dang-ky-phat-tu', label: 'Ghi danh Phật tử' },
    ],
  },
  {
    id: 'tinh-tan-ben-chi',
    title: 'Tinh tấn — đều và bền hơn hùng hục',
    shortTitle: 'Tinh tấn',
    category: 'bo_tat',
    summary:
      'Bốn chánh cần: ngăn ác, diệt ác, sinh thiện, nuôi thiện — áp dụng cho công phu và việc đời.',
    durationMinutes: 11,
    tags: ['tinh tấn', 'chánh cần', 'bền chí', 'lười biếng'],
    keyPoints: [
      'Tinh tấn đúng hướng — không phải bận rộn tối đa.',
      'Biết nghỉ ngơi lành mạnh cũng là nuôi thiện.',
    ],
    sections: [
      {
        title: 'Chẩn bệnh lười và bệnh gồng',
        paragraphs: [
          'Lười: bắt đầu siêu nhỏ (3 phút niệm Phật). Gồng: giảm mục tiêu, giữ nhịp. Mất động lực: nhớ lại khổ đã từng muốn thoát và duyên lành đã gặp (thầy, đạo tràng, kinh sách).',
        ],
      },
    ],
    relatedGiaoLyIds: ['bat-chanh-dao', 'luc-do'],
    relatedTools: [
      { href: '/go-mo', label: 'Gõ mõ giữ nhịp công phu' },
    ],
  },
  {
    id: 'lo-trinh-nghe-phap',
    title: 'Lộ trình nghe pháp một năm',
    shortTitle: 'Lộ trình một năm',
    category: 'nghe_phap',
    summary:
      'Gợi ý thứ tự chủ đề nghe / đọc trong năm — từ nền tảng đến lễ lớn và hạnh Bồ Tát.',
    durationMinutes: 10,
    tags: ['lộ trình', 'kế hoạch', 'người mới', 'tu học'],
    audience: 'Phật tử muốn học có hệ thống.',
    keyPoints: [
      'Quý 1: nghe pháp + Tứ Đế + ngũ giới.',
      'Quý 2–3: pháp môn chính (niệm Phật / thiền) + đời sống.',
      'Quý 4: lễ vía, báo hiếu, hồi hướng năm cũ.',
    ],
    sections: [
      {
        title: 'Gợi ý theo quý',
        paragraphs: ['Có thể bám các bài trong mục này:'],
        bullets: [
          'Tháng 1–3: Cách nghe pháp · Tứ Đế · Nghiệp quả · Ngũ giới.',
          'Tháng 4–6: Niệm Phật / Chánh niệm · Chánh mạng · Gia đình.',
          'Tháng 7–9: Vu Lan · Báo hiếu · Từ bi · Bố thí.',
          'Tháng 10–12: Vô thường · Sám hối · Hồi hướng · ôn lại.',
        ],
      },
      {
        title: 'Đồng hành với nhà chùa',
        paragraphs: [
          'Ghi danh Phật tử để nhận lịch giảng. Dự rằm mỗi tháng. Mỗi quý tham gia một khóa tu ngắn nếu có. Đọc Giáo lý căn bản song song — nghe pháp sẽ “vào” hơn.',
        ],
      },
    ],
    afterListening: [
      'Đánh dấu các chủ đề đã nghe / đã đọc trong trang này.',
      'Mỗi quý chọn một pháp thoại để nghe lại lần hai.',
    ],
    relatedTools: [
      { href: '/phong-thuy/giao-ly-can-ban', label: 'Giáo lý căn bản' },
      { href: '/phong-thuy/khoa-tu-an-cu', label: 'Khóa tu · an cư' },
      { href: '/dang-ky-phat-tu', label: 'Ghi danh Phật tử' },
    ],
  },
];

export function getPhapThoaiTalk(id: string): PhapThoaiTalk | undefined {
  return PHAP_THOAI_TALKS.find((t) => t.id === id);
}

function normalize(text: string): string {
  return text
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .trim();
}

export function searchPhapThoaiTalks(
  query: string,
  category: PhapThoaiCategory | 'all' = 'all',
): PhapThoaiTalk[] {
  const q = normalize(query);
  return PHAP_THOAI_TALKS.filter((talk) => {
    if (category !== 'all' && talk.category !== category) return false;
    if (!q) return true;
    const haystack = normalize(
      [
        talk.title,
        talk.shortTitle,
        talk.summary,
        talk.audience ?? '',
        ...talk.tags,
        ...(talk.keyPoints ?? []),
        ...talk.sections.flatMap((s) => [
          s.title ?? '',
          ...s.paragraphs,
          ...(s.bullets ?? []),
        ]),
      ].join(' '),
    );
    return haystack.includes(q);
  });
}

/** Sự kiện có thể gắn với nghe pháp / khóa giảng. */
export function isPhapThoaiRelatedEvent(eventType: string, title: string): boolean {
  if (eventType === 'khoa_tu' || eventType === 'via') return true;
  const t = normalize(title);
  return (
    t.includes('phap thoai') ||
    t.includes('giang phap') ||
    t.includes('thuyet phap') ||
    t.includes('nghe phap') ||
    t.includes('phap am') ||
    t.includes('dao trai')
  );
}
