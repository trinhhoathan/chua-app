/**
 * Hệ phái · tông môn — khung giới thiệu phổ thông tại Việt Nam.
 * Mang tính tư liệu nhập môn; chi tiết truyền thừa theo từng đạo tràng.
 */

export type HePhaiCategory =
  | 'tong_quat'
  | 'nam_truyen'
  | 'bac_truyen'
  | 'thien'
  | 'tinh_do'
  | 'khac'
  | 'thuc_hanh';

export const HE_PHAI_CATEGORY_LABELS: Record<HePhaiCategory, string> = {
  tong_quat: 'Tổng quan',
  nam_truyen: 'Nam truyền',
  bac_truyen: 'Bắc truyền',
  thien: 'Thiền',
  tinh_do: 'Tịnh Độ',
  khac: 'Dòng khác',
  thuc_hanh: 'Thực hành',
};

export interface HePhaiSection {
  title?: string;
  paragraphs: string[];
  bullets?: string[];
}

export interface HePhaiEntry {
  id: string;
  title: string;
  shortTitle: string;
  category: HePhaiCategory;
  summary: string;
  readingMinutes: number;
  tags: string[];
  /** Tên gọi khác / Hán Việt */
  aliases?: string[];
  sections: HePhaiSection[];
  keyPoints?: string[];
  practiceTips?: string[];
  relatedTools?: { href: string; label: string }[];
  relatedDanhTangIds?: string[];
}

export const HE_PHAI_INTRO =
  'Phật giáo Việt Nam đa dạng: Nam truyền và Bắc truyền cùng hiện diện; trong Bắc truyền lại có Thiền, Tịnh Độ, và nhiều đạo tràng “Thiền–Tịnh song tu”. Trang này giúp Phật tử hiểu khung hệ phái · tông môn phổ thông — để kính trọng sự khác biệt và chọn đạo tràng phù hợp, không để tranh luận trường phái làm loạn tâm.';

export const HE_PHAI_FOOTNOTE =
  'Tư liệu mang tính giới thiệu. Tên tông, pháp mạch, nghi thức cụ thể do từng chùa / tổ đình quy định. Khi muốn quy y sâu vào một truyền thừa, hãy hỏi trụ trì đạo tràng mình đang nương tựa.';

export const HE_PHAI_GUIDES: { title: string; body: string }[] = [
  {
    title: 'Hệ phái khác nhau — gốc vẫn là Phật',
    body: 'Giới · định · tuệ, Tứ Đế, nhân quả, từ bi là mẫu số chung. Khác nhau chủ yếu ở kinh điển nhấn mạnh, nghi thức, y phục và pháp môn thực hành hàng ngày.',
  },
  {
    title: 'Một đạo tràng vững hơn “nhảy chùa”',
    body: 'Người mới nên chọn một chùa gần, thầy rõ ràng, cộng đồng lành — học sâu theo đó. Kính trọng hệ khác; tránh bài xích trên mạng.',
  },
  {
    title: 'Thiền–Tịnh song tu tại Việt Nam',
    body: 'Rất nhiều chùa Bắc truyền vừa tụng kinh niệm Phật vừa có thời ngồi thiền / chỉ quán. Không cần tự chia phe “bên thiền hay bên tịnh” một cách cứng nhắc.',
  },
];

export const HE_PHAI_ENTRIES: HePhaiEntry[] = [
  // ─── Tổng quan ──────────────────────────────────────────
  {
    id: 'phat-giao-viet-nam',
    title: 'Phật giáo Việt Nam — bức tranh tổng quan',
    shortTitle: 'PG Việt Nam',
    category: 'tong_quat',
    summary:
      'Lịch sử tiếp nhận từ Ấn · Trung · khu vực, hình thành sắc thái dân tộc: gắn làng xã, báo hiếu, và nhiều pháp môn song hành.',
    readingMinutes: 12,
    tags: ['việt nam', 'lịch sử', 'tổng quan', 'đạo tràng'],
    keyPoints: [
      'Có cả Nam truyền và Bắc truyền; Bắc truyền chiếm số đông cơ sở thờ tự ở nhiều vùng.',
      'Văn hóa Việt nhấn mạnh Vu Lan, Quan Âm, Tịnh Độ, Thiền Trúc Lâm.',
      'Hiểu hệ phái để hòa hợp, không để phân biệt.',
    ],
    sections: [
      {
        title: 'Duyên khởi ngắn',
        paragraphs: [
          'Phật pháp vào Việt Nam sớm qua đường biển và giao lưu văn hóa với Ấn Độ, Chăm-pa, Trung Hoa… Qua các thời kỳ độc lập, chùa chiền gắn với làng xã, giáo dục chữ Hán–Nôm, và đời sống đạo đức cộng đồng.',
          'Thế kỷ XX–XXI: chấn hưng Phật giáo, hệ thống tổ chức Giáo hội, chùa đô thị, khóa tu cư sĩ, và truyền bá quốc tế (đặc biệt Thiền và chánh niệm mang dấu ấn Việt).',
        ],
      },
      {
        title: 'Người mới nên nắm gì?',
        paragraphs: [
          'Biết chùa mình thuộc Nam hay Bắc truyền (nhìn nghi thức, y phục, kinh tụng). Biết pháp môn chính đạo tràng đang trì (niệm Phật, thiền, trì chú…). Tôn trọng quy củ nơi mình đến — đó là bước đầu của “biết hệ phái”.',
        ],
      },
    ],
    practiceTips: [
      'Hỏi ban hộ tự: “Chùa mình nghiêng pháp môn nào?” — một câu đủ mở duyên học.',
    ],
    relatedTools: [
      { href: '/phong-thuy/giao-ly-can-ban', label: 'Giáo lý căn bản' },
      { href: '/phong-thuy/danh-tang-cao-tang', label: 'Danh tăng' },
    ],
  },
  {
    id: 'dai-thua-tieu-thua',
    title: 'Đại thừa và Theravāda — hiểu đúng, không kỳ thị',
    shortTitle: 'Đại thừa · Theravāda',
    category: 'tong_quat',
    summary:
      'Hai dòng lớn của Phật giáo thế giới. Việt Nam quen gọi Bắc truyền / Nam truyền. Cùng hướng giải thoát; khác lộ trình và kinh điển nhấn mạnh.',
    readingMinutes: 11,
    tags: ['đại thừa', 'theravada', 'tiểu thừa', 'bắc truyền', 'nam truyền'],
    aliases: ['Mahāyāna', 'Theravāda'],
    keyPoints: [
      'Tránh dùng “Tiểu thừa” với nghĩa khinh miệt.',
      'Theravāda giữ Pāli tạng và lý tưởng A-la-hán rõ nét.',
      'Đại thừa mở rộng hạnh Bồ Tát và nhiều kinh điển Sanskrit / Hán dịch.',
    ],
    sections: [
      {
        title: 'Cách nhìn hòa hợp',
        paragraphs: [
          'Cả hai đều từ Đức Phật Thích Ca. Theravāda (thường gọi Nam truyền tại Việt Nam) chú trọng Giới luật và thiền theo kinh điển Pāli. Đại thừa (Bắc truyền) nhấn Bồ Tát đạo, Tịnh Độ, Thiền, và nhiều nghi lễ phổ biến tại chùa Việt.',
          'Tranh cãi “bên nào cao hơn” ít ích cho người tu. Hãy hỏi: pháp môn nào mình đang thực hành đều đặn dưới sự hướng dẫn thanh tịnh?',
        ],
      },
    ],
    relatedTools: [
      { href: '/phong-thuy/hoi-dap-phat-hoc', label: 'Hỏi đáp: hệ phái' },
    ],
  },

  // ─── Nam truyền ─────────────────────────────────────────
  {
    id: 'nam-truyen',
    title: 'Phật giáo Nam truyền (Theravāda)',
    shortTitle: 'Nam truyền',
    category: 'nam_truyen',
    summary:
      'Truyền thừa mạnh ở Campuchia, Lào, Thái, Myanmar và một số chùa Việt — y vàng, kinh Pāli, nhấn thiền và giới.',
    readingMinutes: 12,
    tags: ['nam truyền', 'theravada', 'pali', 'thiền'],
    aliases: ['Theravāda', 'Phật giáo Nguyên thủy (cách gọi phổ thông)'],
    keyPoints: [
      'Kinh điển nền: Tam tạng Pāli.',
      'Thực hành quen thuộc: thiền hơi thở, tứ niệm xứ, giữ giới nghiêm.',
      'Tại Việt Nam có các chùa / thiền viện Nam truyền ở nhiều tỉnh thành.',
    ],
    sections: [
      {
        title: 'Đặc điểm dễ nhận',
        paragraphs: [
          'Chư Tăng thường mặc y màu vàng / nâu theo truyền thống Theravāda; nghi lễ và ngôn ngữ kinh có thể khác rõ so với chùa Bắc truyền. Thời khóa nhấn tụng kinh Pāli (hoặc dịch), thiền tập, bố-tát (Uposatha).',
        ],
      },
      {
        title: 'Người cư sĩ nên biết',
        paragraphs: [
          'Ngũ giới và Bát quan trai vẫn là nền. Cúng dường, nghe pháp, hành thiền là các hạnh phổ biến. Khi đến chùa Nam truyền lần đầu, hỏi oai nghi (cách xá, chỗ ngồi của nữ cư sĩ…) để tránh vô ý phạm quy củ.',
        ],
      },
    ],
    practiceTips: [
      'Đọc thêm bài Thiền · chánh niệm và Ngũ giới trong Giáo lý căn bản.',
    ],
    relatedTools: [
      { href: '/phong-thuy/giao-ly-can-ban', label: 'Giới · Định · Tuệ' },
      { href: '/phong-thuy/khoa-tu-an-cu', label: 'Khóa tu' },
    ],
  },

  // ─── Bắc truyền ─────────────────────────────────────────
  {
    id: 'bac-truyen',
    title: 'Phật giáo Bắc truyền (Đại thừa) tại Việt Nam',
    shortTitle: 'Bắc truyền',
    category: 'bac_truyen',
    summary:
      'Dòng phổ biến ở nhiều chùa Việt: kinh Hán dịch, tượng thờ phong phú, tụng niệm, và pháp môn Thiền · Tịnh · Mật đan xen.',
    readingMinutes: 12,
    tags: ['bắc truyền', 'đại thừa', 'chùa việt', 'kinh hán'],
    keyPoints: [
      'Kinh điển quen: A Di Đà, Phổ Môn, Địa Tạng, Pháp Hoa, Dược Sư…',
      'Nghi lễ rằm, vía, cầu an · cầu siêu rất phát triển.',
      'Trong một ngôi chùa có thể có nhiều pháp môn song hành.',
    ],
    sections: [
      {
        title: 'Bức tranh thực tế',
        paragraphs: [
          'Phật tử đến chùa Bắc truyền thường gặp bàn thờ Phật · Bồ Tát, chuông mõ, khóa tụng sáng tối, và các đại lễ Phật Đản, Vu Lan, vía Quan Âm. Giáo lý nhấn Bồ Tát hạnh: từ bi, hồi hướng, độ mình và người.',
        ],
      },
      {
        title: 'Các tông ảnh hưởng lớn',
        paragraphs: [
          'Thiền (nhất là dấu ấn Trúc Lâm và các dòng Lâm Tế / Tào Động đã vào Việt), Tịnh Độ (trì danh A Di Đà), và một phần hành trì mật chú (Đại Bi, Chuẩn Đề…). Không phải mọi chùa đều “thuần” một tông — nhiều nơi dung hợp.',
        ],
        bullets: [
          'Muốn niệm Phật sâu → tìm đạo tràng Tịnh Độ rõ tông chỉ.',
          'Muốn thiền đường → tìm thiền viện / thời khóa ngồi thiền.',
          'Muốn khóa tụng lễ → hầu hết chùa làng / chùa đô thị Bắc truyền đều có.',
        ],
      },
    ],
    relatedTools: [
      { href: '/phong-thuy/kinh-tung-thuong-dung', label: 'Kinh tụng thường dùng' },
      { href: '/phong-thuy/tra-cuu-kinh', label: 'Tra cứu kinh sách' },
    ],
  },
  {
    id: 'luat-tong',
    title: 'Luật học — nền tảng chung mọi tông',
    shortTitle: 'Luật · giới',
    category: 'bac_truyen',
    summary:
      'Không phải “tông sôi nổi” với cư sĩ, nhưng Giới luật là xương sống Tăng già và chuẩn mực đạo đức cư sĩ.',
    readingMinutes: 8,
    tags: ['luật', 'giới', 'tỳ kheo', 'ngũ giới'],
    keyPoints: [
      'Xuất gia: Cụ túc giới / Bồ Tát giới tùy truyền thừa.',
      'Cư sĩ: ngũ giới, Bát quan trai, thập thiện.',
      'Không giới thì định tuệ khó vững.',
    ],
    sections: [
      {
        title: 'Vì sao cần biết?',
        paragraphs: [
          'Khi chọn đạo tràng, nhìn Tăng chúng có oai nghi, hòa hợp, giữ giới hay không — quan trọng hơn nhìn cơ sở vật chất. Người tại gia học Luật ở mức ứng dụng: ngũ giới, oai nghi vào chùa, không phá hòa hợp Tăng.',
        ],
      },
    ],
    relatedTools: [
      { href: '/phong-thuy/giao-ly-can-ban', label: 'Ngũ giới · Thập thiện' },
    ],
  },
  {
    id: 'phap-hoa-hoa-nghiem',
    title: 'Ảnh hưởng Pháp Hoa · Hoa Nghiêm',
    shortTitle: 'Pháp Hoa · Hoa Nghiêm',
    category: 'bac_truyen',
    summary:
      'Hai dòng kinh lớn Đại thừa đã thấm vào nghi lễ, kiến trúc và pháp thoại chùa Việt — dù ít khi lập “tông” riêng như Nhật Bản.',
    readingMinutes: 9,
    tags: ['pháp hoa', 'hoa nghiêm', 'đại thừa', 'kinh'],
    sections: [
      {
        title: 'Dấu ấn thường thấy',
        paragraphs: [
          'Phẩm Phổ Môn (trong Pháp Hoa) được tụng rộng. Tư tưởng “khai thị tri kiến Phật”, nhất thừa, và tinh thần nhập thế của Bồ Tát lan vào pháp thoại. Hoa Nghiêm góp cái nhìn pháp giới trùng trùng duyên khởi — thường gặp trong giảng giải cao hơn cho hành giả lâu năm.',
        ],
      },
    ],
    relatedTools: [
      { href: '/phong-thuy/tra-cuu-kinh', label: 'Tra cứu Kinh Pháp Hoa' },
    ],
  },

  // ─── Thiền ──────────────────────────────────────────────
  {
    id: 'thien-tong',
    title: 'Thiền tông — trực chỉ và thực hành',
    shortTitle: 'Thiền tông',
    category: 'thien',
    summary:
      'Nhấn kiến tánh / chánh niệm trong đời sống. Tại Việt Nam: vừa có dấu ấn sử thiền Trung Hoa, vừa có bản sắc Trúc Lâm.',
    readingMinutes: 11,
    tags: ['thiền', 'kiến tánh', 'tổ sư', 'công án'],
    aliases: ['Zen', 'Chan', 'Thiền'],
    keyPoints: [
      'Thiền không đối lập với kinh giáo — nhiều tổ vẫn thông kinh.',
      'Người mới bắt đầu từ hơi thở / chánh niệm hơn là công án khó.',
      'Cần thầy và chúng đồng tu để tránh “thiền tưởng”.',
    ],
    sections: [
      {
        title: 'Tinh thần',
        paragraphs: [
          'Câu nói quen thuộc “bất lập văn tự, giáo ngoại biệt truyền” dễ bị hiểu sai thành bỏ kinh. Thực ra tổ sư cảnh giác chấp chữ, không phủ nhận lời Phật. Thực hành cốt lõi: tỉnh thức với tâm đang hiện.',
        ],
      },
      {
        title: 'Tại chùa Việt hôm nay',
        paragraphs: [
          'Có thiền viện chuyên thời khóa ngồi · đi · làm việc trong chánh niệm. Có chùa làng chỉ xen vài phút tọa thiền sau khóa tụng. Cả hai đều hữu ích nếu thầy hướng dẫn đúng mức người học.',
        ],
      },
    ],
    relatedDanhTangIds: ['dat-ma', 'hue-nang', 'tran-nhan-tong'],
    relatedTools: [
      { href: '/phong-thuy/giao-ly-can-ban', label: 'Thiền · chánh niệm' },
      { href: '/phong-thuy/phap-thoai', label: 'Pháp thoại thực hành' },
    ],
  },
  {
    id: 'truc-lam',
    title: 'Thiền phái Trúc Lâm Yên Tử',
    shortTitle: 'Trúc Lâm',
    category: 'thien',
    summary:
      'Dòng thiền mang bản sắc Việt do Điều Ngự Giác Hoàng Trần Nhân Tông sáng lập — nhập thế, dân tộc, và thống nhất các dòng thiền đương thời.',
    readingMinutes: 13,
    tags: ['trúc lâm', 'yên tử', 'trần nhân tông', 'thiền việt'],
    aliases: ['Trúc Lâm Yên Tử'],
    keyPoints: [
      'Sơ tổ: Trần Nhân Tông; kế: Pháp Loa, Huyền Quang (Tam tổ).',
      'Tinh thần: cư trần lạc đạo — sống đời mà vẫn tỉnh thức.',
      'Được chấn hưng mạnh ở thế kỷ XX–XXI tại nhiều thiền viện.',
    ],
    sections: [
      {
        title: 'Bối cảnh lịch sử',
        paragraphs: [
          'Cuối thế kỷ XIII, sau kháng chiến chống Nguyên–Mông, vua Trần Nhân Tông xuất gia, lập thiền phái Trúc Lâm tại Yên Tử. Ngài dung hợp các dòng thiền đã có trên đất Việt và gắn đạo với trách nhiệm dân tộc — không tách rời hoàn cảnh đất nước.',
        ],
      },
      {
        title: 'Ý nghĩa với Phật tử hôm nay',
        paragraphs: [
          'Trúc Lâm gợi một lối thiền không trốn đời: làm tròn bổn phận, giữ tâm không nhiễm. Nhiều khóa tu hiện đại lấy cảm hứng từ tinh thần này — ngồi thiền, làm việc, sống chung trong quy củ.',
        ],
      },
    ],
    relatedDanhTangIds: ['tran-nhan-tong', 'phap-loa', 'huyen-quang', 'thich-thanh-tu'],
    relatedTools: [
      { href: '/phong-thuy/danh-tang-cao-tang', label: 'Tam tổ Trúc Lâm' },
    ],
  },
  {
    id: 'lam-te-tao-dong',
    title: 'Lâm Tế · Tào Động — dấu ấn vào Việt Nam',
    shortTitle: 'Lâm Tế · Tào Động',
    category: 'thien',
    summary:
      'Hai dòng thiền lớn từ Trung Hoa từng truyền vào Đàng Trong · Đàng Ngoài, ảnh hưởng tổ đình và cách tiếp chúng.',
    readingMinutes: 9,
    tags: ['lâm tế', 'tào động', 'thiền', 'tổ đình'],
    sections: [
      {
        title: 'Gợi ý nhận diện',
        paragraphs: [
          'Lâm Tế gắn với thoại đầu / cơ phong mạnh; Tào Động nghiêng “mặc chiếu”, lặng chiếu. Trên thực tế Việt Nam, nhiều dòng đã bản địa hóa và hòa với niệm Phật. Muốn biết chùa thuộc pháp mạch nào, xem bài vị tổ / sử chùa hoặc hỏi trụ trì.',
        ],
      },
    ],
    relatedDanhTangIds: ['lieu-quan', 'chan-nguyen'],
  },

  // ─── Tịnh Độ ────────────────────────────────────────────
  {
    id: 'tinh-do',
    title: 'Tịnh Độ tông — tín · nguyện · hạnh',
    shortTitle: 'Tịnh Độ',
    category: 'tinh_do',
    summary:
      'Pháp môn phổ cập cư sĩ: trì danh A Di Đà, cầu sinh Cực Lạc. Dễ cầm, sâu vô cùng nếu đủ ba tư lương.',
    readingMinutes: 12,
    tags: ['tịnh độ', 'a di đà', 'niệm phật', 'vãng sinh'],
    aliases: ['Tịnh土', 'Pure Land'],
    keyPoints: [
      'Ba tư lương: Tín · Nguyện · Hạnh.',
      'Kinh nền: A Di Đà, Vô Lượng Thọ, Quán Vô Lượng Thọ (tùy đạo tràng).',
      'Giữ giới và làm thiện đi cùng trì danh.',
    ],
    sections: [
      {
        title: 'Vì sao phổ biến?',
        paragraphs: [
          'Người bận việc đời vẫn có thể niệm khi đi đứng nằm ngồi. Pháp môn nương bản nguyện Đức A Di Đà — vừa tự lực vừa tha lực theo cách hiểu Tịnh tông. Tại Việt Nam, khóa tụng Di Đà / nhật tụng rất phổ thông.',
        ],
      },
      {
        title: 'Dễ lệch chỗ nào?',
        paragraphs: [
          'Chỉ cầu “linh” mà không giữ giới; chỉ đếm số câu mà miệng trống tâm; tranh với bên thiền. Tịnh Độ chân chính vẫn là chuyển tâm: ít tham sân, nhiều từ bi, niệm cho đến nhất tâm.',
        ],
      },
    ],
    practiceTips: [
      'Bắt đầu 108 câu/ngày, tai nghe rõ tiếng niệm.',
      'Dùng trang Gõ mõ để giữ nhịp nếu hữu ích.',
    ],
    relatedTools: [
      { href: '/go-mo', label: 'Gõ mõ · niệm Phật' },
      { href: '/phong-thuy/kinh-tung-thuong-dung', label: 'Kinh A Di Đà' },
    ],
    relatedDanhTangIds: ['thich-tri-tinh'],
  },
  {
    id: 'thien-tinh-song-tu',
    title: 'Thiền–Tịnh song tu',
    shortTitle: 'Thiền–Tịnh song tu',
    category: 'tinh_do',
    summary:
      'Lối dung hợp phổ biến ở chùa Việt: vừa niệm Phật nhiếp tâm, vừa thiền quán / tỉnh thức trong ngày.',
    readingMinutes: 9,
    tags: ['thiền', 'tịnh độ', 'song tu', 'cư sĩ'],
    keyPoints: [
      'Không bắt buộc “chọn phe”.',
      'Nên có pháp chính để bám; pháp kia làm trợ.',
      'Hỏi thầy đạo tràng cách phối hợp đúng quy củ nơi mình.',
    ],
    sections: [
      {
        title: 'Gợi ý thực tế',
        paragraphs: [
          'Sáng: vài phút thở chánh niệm. Tối: niệm Phật / tụng ngắn. Rằm: về chùa khóa lễ. Nhiều tổ sư Việt và Trung Hoa từng khuyên niệm Phật để dễ đắc lực trong đời mạt pháp — vừa không bỏ tỉnh giác.',
        ],
      },
    ],
    relatedTools: [
      { href: '/phong-thuy/giao-ly-can-ban', label: 'Niệm Phật · Thiền' },
      { href: '/phong-thuy/hoi-dap-phat-hoc', label: 'Hỏi: niệm hay thiền?' },
    ],
  },

  // ─── Dòng khác ──────────────────────────────────────────
  {
    id: 'mat-tong',
    title: 'Mật thừa · trì chú — nhận diện đúng mức',
    shortTitle: 'Mật · trì chú',
    category: 'khac',
    summary:
      'Trì chú (Đại Bi, Chuẩn Đề…) phổ biến trong Bắc truyền Việt. Mật thừa Kim Cương đầy đủ cần quán đỉnh và thầy truyền — không tự ý “học lỏm” nghi quỹ sâu.',
    readingMinutes: 10,
    tags: ['mật tông', 'trì chú', 'đại bi', 'kim cương thừa'],
    keyPoints: [
      'Chú ngắn trong khóa tụng Bắc truyền rất phổ thông và lành mạnh khi đúng nghi.',
      'Pháp Mật sâu cần truyền thừa rõ — tránh thầy tự xưng trên mạng.',
      'Giữ giới vẫn là cửa đầu.',
    ],
    sections: [
      {
        title: 'Phân biệt nhẹ',
        paragraphs: [
          'Một là trì chú / đà-la-ni trong nghi Nhật tụng Việt (thường thấy). Hai là hệ thống Mật giáo Tây Tạng hay Đông mật với quán đỉnh, bổn tôn, giai đoạn — cần đạo sư và điều kiện. Người mới đừng trả phí lớn cho “bí pháp” mơ hồ.',
        ],
      },
    ],
    relatedTools: [
      { href: '/phong-thuy/tra-cuu-kinh', label: 'Chú · đà-la-ni' },
      { href: '/phong-thuy/phap-thoai', label: 'Chánh pháp · tà thuyết' },
    ],
  },
  {
    id: 'khat-si',
    title: 'Hệ phái Khất sĩ',
    shortTitle: 'Khất sĩ',
    category: 'khac',
    summary:
      'Dòng xuất gia Việt Nam do Tổ sư Minh Đăng Quang khởi xướng thế kỷ XX — y vàng, trì bình, tinh thần giải thoát và giáo hóa gần dân.',
    readingMinutes: 9,
    tags: ['khất sĩ', 'minh đăng quang', 'y vàng', 'việt nam'],
    keyPoints: [
      'Bản sắc Việt rõ trong cách sống và truyền đạo.',
      'Có hệ thống tịnh xá trên nhiều tỉnh thành.',
      'Nên tìm hiểu quy củ khi đến tịnh xá lần đầu.',
    ],
    sections: [
      {
        title: 'Đặc điểm',
        paragraphs: [
          'Khất sĩ nhấn hạnh đầu-đà hiện đại hóa: giản dị, khất thực theo duyên, giảng pháp gần đời sống. Là một hệ trong bức tranh đa dạng Phật giáo Việt — kính trọng ngang với các truyền thừa khác.',
        ],
      },
    ],
    relatedDanhTangIds: ['minh-dang-quang'],
  },
  {
    id: 'pgvn-to-chuc',
    title: 'Giáo hội và sinh hoạt cộng đồng',
    shortTitle: 'Giáo hội · cộng đồng',
    category: 'khac',
    summary:
      'Ngoài tông môn, Phật giáo Việt Nam còn có tổ chức Giáo hội, ban hộ tự, khuôn hội — chỗ cư sĩ đóng góp và nghe thông báo lễ.',
    readingMinutes: 7,
    tags: ['giáo hội', 'ban hộ tự', 'cư sĩ', 'đạo tràng'],
    sections: [
      {
        title: 'Với Phật tử',
        paragraphs: [
          'Ghi danh Phật tử, tham gia ban hộ tự, công quả xây chùa, hộ trì khóa tu — đều là cách sống trong chúng. Hệ phái là pháp mạch; Giáo hội / ban hộ tự là khung tổ chức giúp sinh hoạt có trật tự theo pháp luật và quy định địa phương.',
        ],
      },
    ],
    relatedTools: [
      { href: '/dang-ky-phat-tu', label: 'Ghi danh Phật tử' },
      { href: '/#hoat-dong', label: 'Lịch hoạt động' },
    ],
  },

  // ─── Thực hành chọn đạo tràng ───────────────────────────
  {
    id: 'chon-dao-trang',
    title: 'Cách chọn đạo tràng · thầy hướng dẫn',
    shortTitle: 'Chọn đạo tràng',
    category: 'thuc_hanh',
    summary:
      'Thước đo lành: giới đức, hòa hợp, lời dạy giảm tham sân si — không phải cơ sở đẹp hay lời hứa thần thông.',
    readingMinutes: 10,
    tags: ['đạo tràng', 'chọn chùa', 'thầy', 'chánh kiến'],
    keyPoints: [
      'Gần nhà + quy củ rõ + tâm mình sinh lòng tin lành.',
      'Tránh nơi gây chia rẽ, ép quyên góp, khoe thần thông.',
      'Bám trụ một chỗ đủ lâu mới thấy sức chuyển hóa.',
    ],
    sections: [
      {
        title: 'Checklist ngắn',
        paragraphs: ['Khi thăm chùa / nghe giảng, tự hỏi:'],
        bullets: [
          'Tăng chúng có oai nghi, hòa hợp không?',
          'Pháp thoại có dẫn về giới · định · tuệ không?',
          'Mình có bị áp lực tiền bạc bất thường không?',
          'Sau vài tháng đến, tâm mình có dịu và trách nhiệm hơn không?',
        ],
      },
      {
        title: 'Khi đã chọn',
        paragraphs: [
          'Quy y / thọ giới tại đó nếu đủ duyên. Tham gia thời khóa đều. Đọc Giáo lý căn bản song song. Không “sưu tầm” thầy trên mạng rồi loạn pháp môn.',
        ],
      },
    ],
    practiceTips: [
      'Thăm 2–3 chùa gần nhà trong một tháng, rồi chọn một nơi bám trụ 6 tháng.',
    ],
    relatedTools: [
      { href: '/phong-thuy/hoi-dap-phat-hoc', label: 'Hỏi đáp Phật học' },
      { href: '/phong-thuy/phap-thoai', label: 'Cách nghe pháp' },
      { href: '/dang-ky-phat-tu', label: 'Ghi danh tại chùa' },
    ],
  },
  {
    id: 'kinh-theo-he-phai',
    title: 'Kinh điển và pháp môn theo hướng hệ phái',
    shortTitle: 'Kinh theo hệ phái',
    category: 'thuc_hanh',
    summary:
      'Gợi ý đọc / trì cho người theo Nam truyền, Tịnh Độ, Thiền hoặc khóa lễ Bắc truyền phổ thông.',
    readingMinutes: 8,
    tags: ['kinh', 'pháp môn', 'đọc gì', 'người mới'],
    sections: [
      {
        title: 'Gợi ý nhanh',
        paragraphs: ['Không cứng nhắc — hỏi thầy trước:'],
        bullets: [
          'Nam truyền: học giới, thiền hơi thở, kinh ngắn Nikāya (bản dịch Việt).',
          'Tịnh Độ: A Di Đà, nhật tụng, niệm danh hiệu.',
          'Thiền: kinh Kim Cang / Pháp Bảo Đàn (khi đã có thầy), thực hành hàng ngày.',
          'Bắc truyền phổ thông: A Di Đà, Phổ Môn, Địa Tạng, Dược Sư tùy mùa lễ.',
        ],
      },
    ],
    relatedTools: [
      { href: '/phong-thuy/tra-cuu-kinh', label: 'Tra cứu kinh sách' },
      { href: '/phong-thuy/kinh-tung-thuong-dung', label: 'Kinh tụng thường dùng' },
    ],
  },
  {
    id: 'hoa-hop-he-phai',
    title: 'Sống hòa hợp giữa các hệ phái',
    shortTitle: 'Hòa hợp hệ phái',
    category: 'thuc_hanh',
    summary:
      'Lục hòa áp dụng xuyên tông: không nói xấu đạo tràng khác, không cưỡng người thân đổi pháp môn.',
    readingMinutes: 7,
    tags: ['hòa hợp', 'lục hòa', 'tôn trọng', 'đạo tràng'],
    sections: [
      {
        title: 'Thái độ lành',
        paragraphs: [
          'Có thể tự hào truyền thừa mình đang theo — nhưng không cần hạ thấp bên khác. Khi dự lễ chùa bạn bè thuộc hệ khác: giữ oai nghi nơi đó. Khi bàn pháp: cầu học, không khoe.',
        ],
      },
    ],
    relatedTools: [
      { href: '/phong-thuy/giao-ly-can-ban', label: 'Lục hòa' },
    ],
  },
];

export function getHePhaiEntry(id: string): HePhaiEntry | undefined {
  return HE_PHAI_ENTRIES.find((e) => e.id === id);
}

function normalize(text: string): string {
  return text
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .trim();
}

export function searchHePhaiEntries(
  query: string,
  category: HePhaiCategory | 'all' = 'all',
): HePhaiEntry[] {
  const q = normalize(query);
  return HE_PHAI_ENTRIES.filter((entry) => {
    if (category !== 'all' && entry.category !== category) return false;
    if (!q) return true;
    const haystack = normalize(
      [
        entry.title,
        entry.shortTitle,
        entry.summary,
        ...(entry.aliases ?? []),
        ...entry.tags,
        ...(entry.keyPoints ?? []),
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
