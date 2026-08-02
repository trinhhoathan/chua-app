/**
 * Hỏi đáp Phật học — câu hỏi thường gặp tại chùa Việt (Bắc truyền phổ thông).
 * Mang tính tham khảo; câu riêng / sâu nên hỏi trực tiếp Tăng Ni.
 */

export type HoiDapCategory =
  | 'nhap_mon'
  | 'quy_y_gioi'
  | 'thuc_hanh'
  | 'nghiep_qua'
  | 'nghi_le'
  | 'doi_song'
  | 'le_via'
  | 'me_tin';

export const HOI_DAP_CATEGORY_LABELS: Record<HoiDapCategory, string> = {
  nhap_mon: 'Nhập môn',
  quy_y_gioi: 'Quy y · giới',
  thuc_hanh: 'Thực hành',
  nghiep_qua: 'Nghiệp · quả',
  nghi_le: 'Nghi lễ',
  doi_song: 'Đời sống',
  le_via: 'Lễ · vía',
  me_tin: 'Làm rõ mê tín',
};

export interface HoiDapSection {
  title?: string;
  paragraphs: string[];
  bullets?: string[];
}

export interface HoiDapItem {
  id: string;
  question: string;
  shortQuestion: string;
  category: HoiDapCategory;
  /** Tóm tắt 1–2 câu hiện trên danh sách */
  summary: string;
  tags: string[];
  sections: HoiDapSection[];
  keyPoints?: string[];
  practiceTips?: string[];
  relatedTools?: { href: string; label: string }[];
  relatedGiaoLyIds?: string[];
}

export const HOI_DAP_INTRO =
  'Kho câu hỏi Phật học thường gặp: quy y, giữ giới, niệm Phật, nghiệp quả, vào chùa, lễ vía… Đọc để hiểu hướng giải đáp phổ thông; việc riêng (nhân quả cá nhân, nghi thức chùa mình) nên hỏi trụ trì hoặc ban hộ tự.';

export const HOI_DAP_FOOTNOTE =
  'Đây không phải lời phán của một vị thầy cụ thể, cũng không thay thế kinh điển. Mỗi hệ phái / đạo tràng có thể nhấn mạnh khác nhau. Khi nghi, hãy hỏi Tăng Ni đang hướng dẫn mình.';

export const HOI_DAP_GUIDES: { title: string; body: string }[] = [
  {
    title: 'Cách dùng trang này',
    body: 'Gõ từ khóa hoặc chọn nhóm, mở câu hỏi gần với thắc mắc của mình. Đọc hết phần trả lời rồi mới kết luận. Một câu trên mạng không thay được duyên gặp thầy.',
  },
  {
    title: 'Khi nào nên hỏi trực tiếp?',
    body: 'Việc riêng trong gia đình, bệnh nặng, tang sự, chọn ngày lớn, xung đột đạo tràng, hoặc thấy tâm bất an kéo dài — nên gặp Tăng Ni / ghi danh để được hướng dẫn sát hoàn cảnh.',
  },
  {
    title: 'Thái độ cầu học',
    body: 'Hỏi để hiểu và làm theo, không hỏi để “thắng” hay tìm lỗ hổng. Sẵn sàng nghe cả câu trả lời “cần giữ giới / sám hối trước đã”.',
  },
];

export const HOI_DAP_ITEMS: HoiDapItem[] = [
  // ─── Nhập môn ───────────────────────────────────────────
  {
    id: 'phat-giao-la-gi',
    question: 'Phật giáo là tôn giáo thờ thần hay là đường tu?',
    shortQuestion: 'Phật giáo là gì?',
    category: 'nhap_mon',
    summary:
      'Phật giáo lấy giác ngộ và giải thoát làm mục tiêu; kính Phật không đồng nghĩa thờ thần ban phước theo ý muốn thế gian.',
    tags: ['phật giáo', 'nhập môn', 'phật', 'giác ngộ'],
    keyPoints: [
      'Phật là bậc Giác Ngộ — chỉ đường, không phải thần sáng tạo vũ trụ.',
      'Trọng tâm: chuyển hóa tham · sân · si bằng giới · định · tuệ.',
      'Lễ Phật là kính nhớ ân đức và nuôi tâm hướng thiện.',
    ],
    sections: [
      {
        title: 'Trả lời ngắn',
        paragraphs: [
          'Phật giáo là con đường tu tập do Đức Phật Thích Ca chỉ dạy: thấy khổ, biết nguyên nhân, biết khổ có thể diệt, và đi trên Bát Chánh Đạo. Người Việt thường lễ Phật, tụng kinh, niệm Phật — đó là phương tiện nuôi tín tâm và định tâm, không thay cho việc giữ giới và sửa tâm.',
        ],
      },
      {
        title: 'Giải thích thêm',
        paragraphs: [
          'Khi cầu an, cầu siêu, Phật tử nương oai lực Tam Bảo và nghiệp lực của chính mình — không phải “mặc cả” với thần linh. Càng hiểu giáo lý, việc lễ bái càng thanh tịnh, ít mê tín.',
        ],
      },
    ],
    practiceTips: [
      'Đọc bài Đức Phật và Tam Bảo trong Giáo lý căn bản.',
      'Đến chùa nghe một buổi pháp thoại nhập môn nếu có.',
    ],
    relatedTools: [
      { href: '/phong-thuy/giao-ly-can-ban', label: 'Giáo lý căn bản' },
      { href: '/phong-thuy/phap-thoai', label: 'Pháp thoại' },
    ],
    relatedGiaoLyIds: ['duc-phat', 'tam-bao'],
  },
  {
    id: 'chua-quy-y-duoc-khong',
    question: 'Chưa quy y có được vào chùa lễ Phật, tụng kinh không?',
    shortQuestion: 'Chưa quy y được vào chùa?',
    category: 'nhap_mon',
    summary:
      'Được. Quy y là bước chính thức làm Phật tử; thiện tâm đến chùa vẫn được khuyến khích.',
    tags: ['quy y', 'vào chùa', 'người mới', 'lễ phật'],
    keyPoints: [
      'Ai thiện tâm đều có thể lễ Phật, nghe pháp, công quả.',
      'Quy y khi đã hiểu và sẵn sàng phát nguyện.',
      'Giữ oai nghi trang nghiêm dù chưa quy y.',
    ],
    sections: [
      {
        title: 'Trả lời',
        paragraphs: [
          'Chùa là nơi mở cửa cho chúng sinh kết duyên. Bạn có thể lễ Phật, ngồi nghe kinh, ăn cơm chay công quả mà chưa quy y. Khi đủ duyên — hiểu Tam Bảo, muốn nương tựa lâu dài — hãy ghi danh lễ quy y do nhà chùa tổ chức.',
        ],
      },
      {
        title: 'Nên tránh',
        paragraphs: [
          'Đừng nghĩ “chưa quy y thì lễ cũng vô ích”. Cũng đừng quy y theo phong trào rồi không giữ giới. Từ từ, vững vàng hơn là vội.',
        ],
      },
    ],
    relatedTools: [
      { href: '/dang-ky-phat-tu', label: 'Ghi danh Phật tử' },
      { href: '/phong-thuy/giao-ly-can-ban', label: 'Bài Quy y' },
    ],
    relatedGiaoLyIds: ['quy-y', 'vao-chua-oai-nghi'],
  },
  {
    id: 'nhieu-ton-giao',
    question: 'Đang theo đạo khác / thờ ông bà có học Phật được không?',
    shortQuestion: 'Theo đạo khác có học Phật?',
    category: 'nhap_mon',
    summary:
      'Có thể học từ bi, nhân quả, chánh niệm. Khi muốn quy y chính thức nên thành thật với thầy và gia đình.',
    tags: ['đạo khác', 'ông bà', 'quy y', 'gia đình'],
    sections: [
      {
        title: 'Trả lời',
        paragraphs: [
          'Nhiều người Việt vừa thờ ông bà vừa đến chùa — tinh thần báo hiếu và kính lẽ sống thiện không xung đột. Nếu đã thuộc một tôn giáo khác có quy định riêng, nên hỏi vị hướng dẫn bên ấy và trụ trì chùa trước khi quy y, để tránh xung đột nội tâm và gia đình.',
          'Học giáo lý (nhân quả, từ bi, buông xả) luôn hữu ích dù chưa chính thức quy y.',
        ],
      },
    ],
    relatedGiaoLyIds: ['bao-hieu', 'tam-bao'],
  },
  {
    id: 'doc-kinh-nao-truoc',
    question: 'Người mới nên đọc / tụng kinh gì trước?',
    shortQuestion: 'Kinh nào cho người mới?',
    category: 'nhap_mon',
    summary:
      'Thường bắt đầu Kinh A Di Đà, Phổ Môn, bài sám ngắn, hoặc niệm Phật — tùy duyên đạo tràng.',
    tags: ['kinh', 'người mới', 'a di đà', 'phổ môn'],
    keyPoints: [
      'Một pháp môn chính + giữ giới nền tảng.',
      'Hỏi ban hộ tự kinh nhà chùa đang trì.',
      'Đọc hiểu dần — không cần thuộc hết mới tu.',
    ],
    sections: [
      {
        title: 'Gợi ý phổ biến tại chùa Việt',
        paragraphs: [
          'Tịnh Độ: Kinh A Di Đà, niệm “A Di Đà Phật”. Cầu an / Quan Âm: Phổ Môn. Báo hiếu / cầu siêu: Địa Tạng (có thể trì dần). Giáo lý ngắn: Tứ thập nhị chương, thập thiện.',
        ],
        bullets: [
          'Dùng mục Kinh tụng thường dùng trên website để đọc theo.',
          'Nghe pháp thoại giải kinh nếu có — hiểu rồi tụng càng có lực.',
        ],
      },
    ],
    relatedTools: [
      { href: '/phong-thuy/kinh-tung-thuong-dung', label: 'Kinh tụng thường dùng' },
      { href: '/phong-thuy/tra-cuu-kinh', label: 'Tra cứu kinh sách' },
    ],
  },

  // ─── Quy y · giới ───────────────────────────────────────
  {
    id: 'quy-y-roi-phai-lam-gi',
    question: 'Quy y xong phải làm gì mỗi ngày?',
    shortQuestion: 'Quy y rồi làm gì?',
    category: 'quy_y_gioi',
    summary:
      'Ôn lời nguyện, giữ giới đã thọ, niệm Phật / ngồi thiền ngắn, gần đạo tràng, làm thiện nhỏ.',
    tags: ['quy y', 'cư sĩ', 'hàng ngày', 'ngũ giới'],
    keyPoints: [
      'Quy y sống động = thực hành mỗi ngày, không chỉ pháp danh.',
      'Giữ ít nhất tinh thần ngũ giới.',
      'Rằm · mùng 1 về chùa nếu được.',
    ],
    sections: [
      {
        title: 'Khung ngày đơn giản',
        paragraphs: [
          'Sáng: xá Phật, niệm vài chục câu hoặc thở chánh niệm. Trong ngày: ái ngữ, không cố ý hại. Tối: niệm Phật 10 phút, sám một lỗi nhỏ, hồi hướng. Tuần: nghe pháp hoặc đọc một bài giáo lý.',
        ],
      },
    ],
    practiceTips: [
      'Đặt giờ cố định để khỏi quên.',
      'Dùng Gõ mõ để giữ nhịp niệm Phật.',
    ],
    relatedTools: [
      { href: '/go-mo', label: 'Gõ mõ · niệm Phật' },
      { href: '/phong-thuy/giao-ly-can-ban', label: 'Lộ trình tu học' },
    ],
    relatedGiaoLyIds: ['quy-y', 'lo-trinh-tu-hoc'],
  },
  {
    id: 'pham-gioi-thi-sao',
    question: 'Lỡ phạm giới thì có mất quy y không? Phải làm sao?',
    shortQuestion: 'Phạm giới thì sao?',
    category: 'quy_y_gioi',
    summary:
      'Phạm giới cần sám hối và quyết không tái phạm — không tuyệt vọng, cũng không xem thường.',
    tags: ['phạm giới', 'sám hối', 'ngũ giới', 'quy y'],
    keyPoints: [
      'Che giấu và tái phạm cố ý mới nguy hiểm hơn là đã lỡ rồi biết xấu hổ.',
      'Sám trước Tam Bảo; lỗi với người thì xin lỗi / sửa sai nếu được.',
      'Giới nặng nên hỏi thầy để được hướng dẫn nghi thức phù hợp.',
    ],
    sections: [
      {
        title: 'Trả lời',
        paragraphs: [
          'Quy y không “bay” vì một lỗi nhỏ nếu còn tâm nương Tam Bảo. Nhưng phạm giới mà không sám, còn bào chữa, thì công phu yếu dần. Sám hối chân thành: nhận rõ lỗi, ăn năn, phát lộ, quyết sửa, làm thiện bù đắp.',
          'Rượu say dẫn đến phá giới khác — cần đặc biệt thận trọng với giới thứ năm.',
        ],
      },
    ],
    relatedTools: [
      { href: '/phong-thuy/van-khan-nghi-le', label: 'Văn khấn sám hối' },
      { href: '/phong-thuy/giao-ly-can-ban', label: 'Bài Sám hối · Ngũ giới' },
    ],
    relatedGiaoLyIds: ['sam-hoi', 'ngu-gioi'],
  },
  {
    id: 'an-chay-bat-buoc',
    question: 'Phật tử có bắt buộc ăn chay trường không?',
    shortQuestion: 'Bắt buộc ăn chay?',
    category: 'quy_y_gioi',
    summary:
      'Không bắt buộc trường chay với mọi cư sĩ; nhiều người ăn chay kỳ rồi tiến tới. Gốc là tâm bất sát.',
    tags: ['ăn chay', 'bất sát', 'ngũ giới', 'cư sĩ'],
    sections: [
      {
        title: 'Trả lời',
        paragraphs: [
          'Ngũ giới căn bản là không sát sinh — không đồng nghĩa mọi cư sĩ phải trường chay ngay. Nhiều đạo tràng khuyến khích chay kỳ (vía, rằm, mùng 1) và giảm dần. Ai đủ duyên trường chay là tốt; ai vì sức khỏe cần linh hoạt thì giữ tinh thần từ bi, không kiêu ngạo cũng không tự ti.',
          'Không dùng việc người khác ăn mặn để khinh thường — đó cũng là sân si đội lốt “giữ giới”.',
        ],
      },
    ],
    relatedGiaoLyIds: ['an-chay-phong-sinh', 'ngu-gioi'],
  },
  {
    id: 'bat-quan-trai',
    question: 'Bát Quan Trai là gì? Người mới có thọ được không?',
    shortQuestion: 'Bát Quan Trai?',
    category: 'quy_y_gioi',
    summary:
      'Tám giới trong một ngày một đêm — thực hành gần đời sống xuất gia. Người mới thiện tâm thường vẫn thọ được nếu nhà chùa mở.',
    tags: ['bát quan trai', 'khóa tu', 'giữ giới', 'trai giới'],
    sections: [
      {
        title: 'Trả lời',
        paragraphs: [
          'Bát Quan Trai gồm các giới nghiêm hơn ngũ giới (thêm không ăn phi thời, không trang điểm giải trí theo nghi… — chi tiết theo nghi thức từng chùa). Thọ trong khóa tu ngắn giúp nếm hương vị xuất gia một ngày. Nên đăng ký trước, mang trang phục giản dị, tuân thời khóa.',
        ],
      },
    ],
    relatedTools: [
      { href: '/phong-thuy/khoa-tu-an-cu', label: 'Khóa tu · an cư' },
    ],
  },

  // ─── Thực hành ──────────────────────────────────────────
  {
    id: 'niem-phat-tap-niem',
    question: 'Niệm Phật mà tạp niệm nhiều quá, có vô ích không?',
    shortQuestion: 'Niệm Phật bị tạp niệm?',
    category: 'thuc_hanh',
    summary:
      'Không vô ích. Biết tạp niệm rồi kéo về danh hiệu chính là công phu. Đều đặn quan trọng hơn “cảm giác đặc biệt”.',
    tags: ['niệm phật', 'tạp niệm', 'công phu', 'tịnh độ'],
    keyPoints: [
      'Tạp niệm là bình thường với người mới.',
      'Miệng niệm, tai nghe, tâm nhớ — đừng đánh trận với nghĩ.',
      'Ngắn mà đều thắng dài rồi bỏ.',
    ],
    sections: [
      {
        title: 'Trả lời',
        paragraphs: [
          'Tâm như khỉ chuyền cành — niệm Phật là cột nó vào danh hiệu. Mỗi lần kéo về được là một lần luyện. Đừng chờ “vắng niệm” mới tính là có công đức. Có thể niệm ra tiếng nhỏ, dùng chuỗi 108, hoặc gõ mõ để nhiếp tai.',
        ],
      },
      {
        title: 'Khi buồn ngủ / loạn mạnh',
        paragraphs: [
          'Đổi tư thế: đi kinh hành chậm. Rửa mặt, ngồi nơi thoáng. Giảm mục tiêu xuống 5 phút nhưng tỉnh táo. Kiểm tra giấc ngủ và việc ăn quá no trước khi ngồi.',
        ],
      },
    ],
    practiceTips: [
      'Một tuần: cùng một giờ, 10 phút, không đổi pháp môn.',
    ],
    relatedTools: [
      { href: '/go-mo', label: 'Gõ mõ · niệm Phật' },
      { href: '/phong-thuy/phap-thoai', label: 'Chủ đề niệm Phật' },
    ],
    relatedGiaoLyIds: ['niem-phat-can-ban'],
  },
  {
    id: 'niem-phat-hay-thien',
    question: 'Nên niệm Phật hay ngồi thiền? Có được làm cả hai không?',
    shortQuestion: 'Niệm Phật hay thiền?',
    category: 'thuc_hanh',
    summary:
      'Được kết hợp. Nên có một pháp chính để bám trụ; tránh đổi môn liên tục vì chán.',
    tags: ['niệm phật', 'thiền', 'pháp môn', 'chánh niệm'],
    sections: [
      {
        title: 'Trả lời',
        paragraphs: [
          'Niệm Phật là nhiếp tâm bằng danh hiệu; thiền chánh niệm nhiếp bằng hơi thở / tỉnh giác. Nhiều đạo tràng vừa tụng vừa ngồi im. Người mới: chọn một pháp chính theo duyên thầy / chùa, pháp kia làm phụ (ví dụ sáng thở 5 phút, tối niệm Phật 10 phút).',
          'Đừng tranh “bên nào cao hơn” — tranh là sân và ngã mạn.',
        ],
      },
    ],
    relatedGiaoLyIds: ['niem-phat-can-ban', 'thien-chanh-niem'],
    relatedTools: [
      { href: '/phong-thuy/giao-ly-can-ban', label: 'Giáo lý thực hành' },
    ],
  },
  {
    id: 'dem-bao-nhieu-cau',
    question: 'Mỗi ngày niệm bao nhiêu câu mới đủ?',
    shortQuestion: 'Niệm bao nhiêu câu?',
    category: 'thuc_hanh',
    summary:
      'Không có số “đủ” chung cho mọi người. Quan trọng là đều, rõ, và có tín nguyện. 108 là mức khởi đầu phổ biến.',
    tags: ['niệm phật', '108', 'công phu', 'số câu'],
    sections: [
      {
        title: 'Trả lời',
        paragraphs: [
          'Có người phát nguyện 500, 1000, 10000… tùy sức. Người bận bắt đầu 108 câu thật tỉnh thì hơn hứa 10000 rồi bỏ. Tăng dần khi đã ổn định. Chất lượng (tai nghe rõ) đi cùng số lượng.',
        ],
      },
    ],
    relatedTools: [{ href: '/go-mo', label: 'Gõ mõ đếm mục tiêu' }],
  },
  {
    id: 'hoi-huong-the-nao',
    question: 'Hồi hướng công đức như thế nào cho đúng?',
    shortQuestion: 'Hồi hướng thế nào?',
    category: 'thuc_hanh',
    summary:
      'Sau việc thiện / khóa tu, nguyện đưa công đức về Bồ đề và lợi lạc chúng sinh — có thể nhắc tên người cụ thể rồi đọc bài chung.',
    tags: ['hồi hướng', 'công đức', 'cầu an', 'cầu siêu'],
    sections: [
      {
        title: 'Trả lời',
        paragraphs: [
          'Hồi hướng chống tâm keo: không giữ phước chỉ cho mình hưởng. Có thể nói: nguyện cho ông bà / người bệnh / pháp giới chúng sinh, rồi “Nguyện đem công đức này… đều trọn thành Phật đạo.” Thành tâm rõ ràng quan trọng hơn thuộc lòng dài dòng mà miệng trống.',
        ],
      },
    ],
    relatedGiaoLyIds: ['hoi-huong'],
    relatedTools: [
      { href: '/phong-thuy/kinh-tung-thuong-dung', label: 'Kinh tụng · hồi hướng' },
    ],
  },
  {
    id: 'ngoi-thien-dau-lung',
    question: 'Ngồi thiền / niệm Phật bị đau chân, có nên cố?',
    shortQuestion: 'Ngồi bị đau?',
    category: 'thuc_hanh',
    summary:
      'Đau nhẹ do quen tư thế có thể điều chỉnh hơi; đau chấn thương thì đổi tư thế — không khổ hạnh hại thân.',
    tags: ['thiền', 'đau chân', 'tư thế', 'trung đạo'],
    sections: [
      {
        title: 'Trả lời',
        paragraphs: [
          'Trung đạo: không đắm dễ chịu cũng không hành xác. Ngồi ghế, nửa già, hoặc đi kinh hành đều được nếu tâm tỉnh. Người lớn tuổi / bệnh xương khớp nên hỏi bác sĩ khi cần và báo nhà chùa để sắp chỗ.',
        ],
      },
    ],
  },

  // ─── Nghiệp · quả ───────────────────────────────────────
  {
    id: 'nghiep-doi-truoc',
    question: 'Có phải mọi khổ hiện tại đều do nghiệp đời trước?',
    shortQuestion: 'Khổ có phải nghiệp đời trước?',
    category: 'nghiep_qua',
    summary:
      'Không phải tất cả. Có nghiệp cũ, có duyên hiện tại, có điều kiện tự nhiên và xã hội. Đừng kết án người đang khổ.',
    tags: ['nghiệp', 'đời trước', 'nhân quả', 'khổ'],
    keyPoints: [
      'Nhân quả sâu xa ≠ lời giải thích lười biếng cho mọi chuyện.',
      'Việc cần làm: giảm ác, tăng thiện, tu tuệ ở hiện tại.',
    ],
    sections: [
      {
        title: 'Trả lời',
        paragraphs: [
          'Phật pháp nói nghiệp rất kỹ, nhưng không bảo “chỉ có nghiệp đời trước”. Bệnh có thể do virus, tai nạn do bất cẩn, bất công do cấu trúc xã hội. Tin nhân quả để tự chịu trách nhiệm và phát từ bi — không để đổ lỗi cho nạn nhân (“do tội họ”).',
        ],
      },
    ],
    relatedGiaoLyIds: ['nghiep-qua', 'luan-hoi-luc-dao'],
  },
  {
    id: 'lam-sao-het-nghiep',
    question: 'Làm sao để hết nghiệp xấu / giải nghiệp?',
    shortQuestion: 'Làm sao giải nghiệp?',
    category: 'nghiep_qua',
    summary:
      'Không có phép “xóa sổ” bằng tiền. Chuyển nghiệp bằng sám hối, giữ giới, làm thiện, tu tuệ và không tái phạm.',
    tags: ['giải nghiệp', 'sám hối', 'chuyển nghiệp', 'mê tín'],
    keyPoints: [
      'Cảnh giác dịch vụ hứa “cắt nghiệp” thu phí.',
      'Sám + không tái phạm + nuôi thiện là chính.',
      'Niệm Phật · trì chú hỗ trợ nhiếp tâm, không thay thế nhân quả.',
    ],
    sections: [
      {
        title: 'Trả lời',
        paragraphs: [
          'Nghiệp đã tạo như hạt đã gieo — có thể không cho quả mạnh nếu thiếu duyên, và mình có thể gieo nhân mới lành. Lối đúng: nhận lỗi, sám, sửa cách sống, bố thí, giữ giới, gần Chánh pháp. Lối lệch: mua nghi thức đắt để được “xóa”, rồi tiếp tục tạo ác.',
        ],
      },
    ],
    relatedTools: [
      { href: '/phong-thuy/giao-ly-can-ban', label: 'Nghiệp · quả · Sám hối' },
      { href: '/phong-thuy/phap-thoai', label: 'Chủ đề nghiệp quả' },
    ],
    relatedGiaoLyIds: ['nghiep-qua', 'sam-hoi'],
  },
  {
    id: 'cau-sieu-co-linh',
    question: 'Cầu siêu có thật sự giúp người mất không?',
    shortQuestion: 'Cầu siêu có lợi ích?',
    category: 'nghiep_qua',
    summary:
      'Theo tinh thần Phật giáo: tâm thành, trì danh / trì kinh, làm thiện hồi hướng có lợi cho cả người mất và người còn. Không thay thế nghiệp của họ hoàn toàn.',
    tags: ['cầu siêu', 'hồi hướng', 'người mất', 'vu lan'],
    sections: [
      {
        title: 'Trả lời',
        paragraphs: [
          'Kinh điển và truyền thống Bắc truyền rất nhấn mạnh cầu siêu, trì Địa Tạng, Vu Lan — lấy tâm hiếu và từ bi làm gốc. Công đức hồi hướng như ánh sáng soi; người mất còn tùy nghiệp của họ mà thọ nhận. Người còn sống được chuyển hóa — bớt đau, biết làm thiện — cũng là lợi lạc lớn.',
          'Nên kết hợp: nghi lễ như pháp + sống thiện trong đời + không biến tang sự thành phô trương.',
        ],
      },
    ],
    relatedTools: [
      { href: '/so-cau', label: 'Sổ cầu an · cầu siêu' },
      { href: '/phong-thuy/van-khan-nghi-le', label: 'Văn khấn cầu siêu' },
    ],
  },
  {
    id: 'tai-sao-nguoi-xau-giau',
    question: 'Vì sao người ác vẫn giàu / người thiện vẫn khổ?',
    shortQuestion: 'Người ác sao vẫn giàu?',
    category: 'nghiep_qua',
    summary:
      'Quả không chín hết trong một sớm. Có nhân cũ chưa hết, có quả mới chưa tới. Đừng lấy thành bại thế gian làm thước đo nhân quả tức thì.',
    tags: ['nhân quả', 'giàu nghèo', 'công bằng', 'quả chín'],
    sections: [
      {
        title: 'Trả lời',
        paragraphs: [
          'Nhân quả như nông nghiệp: lúa không gặt ngay ngày gieo. Người đang hưởng phước cũ có thể đồng thời đang gieo ác mới. Người thiện đang trả quả cũ hoặc đang tích phước chưa chín. Việc của hành giả: chọn nhân đúng ở hiện tại, không đố kỵ, không bỏ thiện vì thấy “thế gian bất công”.',
        ],
      },
    ],
    relatedGiaoLyIds: ['nghiep-qua'],
  },

  // ─── Nghi lễ ────────────────────────────────────────────
  {
    id: 'vao-chua-mac-gi',
    question: 'Vào chùa nên mặc gì, kiêng gì?',
    shortQuestion: 'Oai nghi vào chùa?',
    category: 'nghi_le',
    summary:
      'Trang phục gọn, kín đáo, màu trầm; tắt điện thoại; không chỉ trỏ tượng; nói nhẹ.',
    tags: ['oai nghi', 'vào chùa', 'trang phục', 'chính điện'],
    keyPoints: [
      'Kín đáo, sạch sẽ — không cần đồ đắt tiền.',
      'Im nguồn điện thoại trong chính điện.',
      'Hỏi ban hộ tự khi chưa rõ chỗ ngồi / chỗ lạy.',
    ],
    sections: [
      {
        title: 'Trả lời',
        paragraphs: [
          'Tránh quần áo hở, dép lê ồn ào, mũ ồn. Không nằm ngồi bất chính trước bàn thờ. Không quay phim nếu chưa được phép. Trẻ em cần người lớn kèm. Công quả thì nghe phân công.',
        ],
      },
    ],
    relatedGiaoLyIds: ['vao-chua-oai-nghi'],
    relatedTools: [
      { href: '/phong-thuy/van-khan-nghi-le', label: 'Văn khấn · nghi lễ' },
    ],
  },
  {
    id: 'lay-phat-may-lay',
    question: 'Lạy Phật bao nhiêu lạy mới đúng?',
    shortQuestion: 'Lạy bao nhiêu lạy?',
    category: 'nghi_le',
    summary:
      'Thường 3 lạy kính Tam Bảo; khóa lễ theo chúng. Tâm thành quan trọng hơn số lượng phô trương.',
    tags: ['lạy phật', 'ba lạy', 'nghi thức'],
    sections: [
      {
        title: 'Trả lời',
        paragraphs: [
          'Vào điện, nhiều nơi xá / lạy ba lạy. Trong khóa tụng theo chuông mõ của thầy. Có thể phát nguyện lạy nhiều (108…) trong khóa tu — làm vừa sức, đúng nhịp, không chen lấn. Người già yếu xá kính cũng được.',
        ],
      },
    ],
  },
  {
    id: 'cung-gi-tren-ban-tho',
    question: 'Bàn thờ nhà nên cúng gì? Có cần nhiều lễ vật không?',
    shortQuestion: 'Cúng gì trên bàn thờ?',
    category: 'nghi_le',
    summary:
      'Hương, hoa, đèn/nến, nước, quả — sạch sẽ, vừa đủ. Tâm thành hơn mâm cao cỗ đầy nếu vượt sức.',
    tags: ['bàn thờ', 'cúng', 'hương hoa', 'gia đình'],
    sections: [
      {
        title: 'Trả lời',
        paragraphs: [
          'Giữ bàn thờ sạch, trang nghiêm, không đặt đồ tạp. Ăn chay kỳ có thể thêm cơm chay. Tránh đốt vàng mã quá mức gây nguy hiểm cháy và ô nhiễm — hỏi hướng dẫn nhà chùa theo truyền thống đạo tràng. Không cúng đồ bất tịnh hay rượu nếu đang giữ giới nghiêm.',
        ],
      },
    ],
    relatedTools: [
      { href: '/phong-thuy/van-khan-nghi-le', label: 'Văn khấn tại gia' },
    ],
  },
  {
    id: 'khac-he-phai',
    question: 'Chùa này Bắc tông, chùa kia Nam tông — mình theo bên nào?',
    shortQuestion: 'Bắc tông hay Nam tông?',
    category: 'nghi_le',
    summary:
      'Cùng gốc Đức Phật. Nên bám một đạo tràng / thầy để công phu ổn định; kính trọng hệ khác, không bài xích.',
    tags: ['hệ phái', 'bắc tông', 'nam tông', 'đạo tràng'],
    sections: [
      {
        title: 'Trả lời',
        paragraphs: [
          'Nghi thức, y phục, nhấn mạnh kinh điển có thể khác, nhưng giới · định · tuệ và từ bi là chung. Người mới chọn chùa gần, thầy rõ ràng, cộng đồng lành — rồi học sâu theo truyền thừa đó. Tránh nhảy chùa liên tục vì lời khen chê trên mạng.',
        ],
      },
    ],
  },

  // ─── Đời sống ───────────────────────────────────────────
  {
    id: 'nguoi-than-khong-tin',
    question: 'Người thân không tin Phật, phản đối mình đi chùa thì sao?',
    shortQuestion: 'Người thân phản đối?',
    category: 'doi_song',
    summary:
      'Tu bằng ái ngữ và gương lành trước; ít tranh luận hơn thua. Không lấy đạo để thắng người nhà.',
    tags: ['gia đình', 'người thân', 'ái ngữ', 'đi chùa'],
    keyPoints: [
      'Thể hiện bằng sự dịu dàng, trách nhiệm hơn là nói nhiều.',
      'Giữ bổn phận gia đình — đó cũng là tu.',
      'Khi cần, giảm hình thức phô bày, giữ công phu thầm.',
    ],
    sections: [
      {
        title: 'Trả lời',
        paragraphs: [
          'Nhiều xung đột đến từ sợ hãi (“con bỏ nhà theo đạo”) hoặc từ việc mình áp đặt. Hãy làm tròn việc nhà, giữ lời hòa, giải thích ngắn khi được hỏi. Mời đi chùa chỉ khi họ vui lòng. Thời gian và gương sống thuyết phục hơn tranh cãi kinh điển.',
        ],
      },
    ],
    relatedGiaoLyIds: ['luc-hoa', 'bao-hieu'],
  },
  {
    id: 'lam-viec-lien-quan-sat',
    question: 'Nghề liên quan sát sinh / rượu / hàng giả thì có giữ được giới không?',
    shortQuestion: 'Nghề khó giữ giới?',
    category: 'doi_song',
    summary:
      'Chánh mạng khuyên nuôi thân lương thiện. Không đổi nghề ngay được thì giảm hại, hướng thiện dần, và hỏi thầy sát hoàn cảnh.',
    tags: ['chánh mạng', 'nghề nghiệp', 'giữ giới', 'nuôi thân'],
    sections: [
      {
        title: 'Trả lời',
        paragraphs: [
          'Đừng tự kết án tuyệt vọng cũng đừng tự cho qua. Có thể chuyển vị trí, giảm việc hại, không gian dối trong nghề hiện tại, tích phước và tìm lối chuyển nghề khi đủ duyên. Chủ doanh nghiệp còn có trách nhiệm với nhân viên và khách hàng — đó cũng là giới mở rộng.',
        ],
      },
    ],
    relatedTools: [
      { href: '/phong-thuy/phap-thoai', label: 'Chủ đề Chánh mạng' },
    ],
    relatedGiaoLyIds: ['bat-chanh-dao', 'thap-thien'],
  },
  {
    id: 'gian-du-co-toi',
    question: 'Giận dữ trong lòng đã là tạo nghiệp chưa?',
    shortQuestion: 'Giận trong lòng có nghiệp?',
    category: 'doi_song',
    summary:
      'Ý nghiệp là gốc. Giận nổi lên rồi biết và buông thì khác giận nuôi lâu rồi phát thành lời / việc ác.',
    tags: ['sân', 'ý nghiệp', 'giận', 'chánh niệm'],
    sections: [
      {
        title: 'Trả lời',
        paragraphs: [
          'Cảm xúc sân có thể đến do thói quen cũ — quan trọng là có đồng hóa và hành động theo không. Biết “đang giận”, thở, niệm Phật, không gửi tin nhắn nóng: đó là cắt dòng nghiệp. Nuôi hận, bàn kế hại người: nghiệp nặng dần.',
        ],
      },
    ],
    relatedGiaoLyIds: ['nghiep-qua', 'tu-vo-luong-tam'],
    relatedTools: [
      { href: '/phong-thuy/phap-thoai', label: 'Chuyển hóa sân giận' },
    ],
  },
  {
    id: 'tien-cung-duong',
    question: 'Cúng dường bao nhiêu là đủ? Không có tiền có tu được không?',
    shortQuestion: 'Cúng dường bao nhiêu?',
    category: 'doi_song',
    summary:
      'Tu được không phụ thuộc tiền. Cúng vừa sức, vui lòng; công quả và giữ giới cũng là cúng dường.',
    tags: ['cúng dường', 'tiền', 'công quả', 'bố thí'],
    sections: [
      {
        title: 'Trả lời',
        paragraphs: [
          'Phật pháp không bán giải thoát. Người nghèo vẫn niệm Phật, giữ giới, ái ngữ, giúp người. Ai có điều kiện cúng dường như pháp — không khoe, không so — để duy trì đạo tràng. Cảnh giác nơi gây áp lực quyên góp hoặc hứa phước theo bảng giá.',
        ],
      },
    ],
    relatedTools: [
      { href: '/dat-nuoc', label: 'Đặt nước · công đức' },
      { href: '/dang-ky-phat-tu', label: 'Ghi danh · công quả' },
    ],
    relatedGiaoLyIds: ['luc-do'],
  },

  // ─── Lễ · vía ───────────────────────────────────────────
  {
    id: 'ram-nen-lam-gi',
    question: 'Ngày rằm · mùng 1 nên làm gì?',
    shortQuestion: 'Rằm · mùng 1?',
    category: 'le_via',
    summary:
      'Ăn chay kỳ nếu được, niệm Phật, đến chùa lễ và nghe pháp, giữ lời hòa, hồi hướng.',
    tags: ['rằm', 'mùng 1', 'trai giới', 'về chùa'],
    sections: [
      {
        title: 'Trả lời',
        paragraphs: [
          'Sóc vọng là duyên giữ trai giới và củng cố công phu tháng. Không đến chùa được: giữ bàn thờ sạch, tụng ngắn tại nhà, xem lại pháp thoại nếu chùa có video. Tránh biến rằm thành ngày chỉ lo mâm cỗ rồi tranh cãi trong bếp.',
        ],
      },
    ],
    relatedTools: [
      { href: '/phong-thuy/ngay-via-phat', label: 'Lịch vía · lễ' },
      { href: '/phong-thuy/van-khan-nghi-le', label: 'Văn khấn rằm' },
    ],
  },
  {
    id: 'vu-lan-phai-lam-gi',
    question: 'Vu Lan phải làm gì mới gọi là báo hiếu?',
    shortQuestion: 'Vu Lan báo hiếu?',
    category: 'le_via',
    summary:
      'Hiếu khi còn sống quý hơn hình thức. Mùa Vu Lan: phụng dưỡng, trì kinh hồi hướng, làm thiện, tham dự lễ như pháp.',
    tags: ['vu lan', 'báo hiếu', 'tháng bảy', 'cầu siêu'],
    sections: [
      {
        title: 'Trả lời',
        paragraphs: [
          'Nếu cha mẹ còn: thăm hỏi, chăm sóc, khuyến tấn hướng thiện dịu dàng. Nếu đã mất: cầu siêu, trì Địa Tạng / niệm Phật hồi hướng, ăn chay, phóng sinh đúng cách. Không nhất thiết phải đốt nhiều vàng mã mới là hiếu. Không dùng tháng Bảy để truyền sợ hãi mê tín.',
        ],
      },
    ],
    relatedTools: [
      { href: '/so-cau', label: 'Sổ cầu siêu' },
      { href: '/phong-thuy/tra-cuu-kinh', label: 'Kinh Vu Lan · Địa Tạng' },
    ],
    relatedGiaoLyIds: ['bao-hieu'],
  },
  {
    id: 'via-phat-co-phai-di-chua',
    question: 'Ngày vía Phật / Bồ Tát có bắt buộc phải đến chùa không?',
    shortQuestion: 'Vía có bắt buộc đến chùa?',
    category: 'le_via',
    summary:
      'Không bắt buộc theo kiểu luật đời, nhưng đến chùa là duyên lành lớn. Ở nhà vẫn trì danh, làm thiện, giữ giới được.',
    tags: ['vía', 'phật đản', 'quan âm', 'đến chùa'],
    sections: [
      {
        title: 'Trả lời',
        paragraphs: [
          'Vía là nhớ ân và học hạnh. Có mặt trong chúng giúp nhiếp tâm và kết duyên. Bệnh, xa, bận việc nuôi người thân: tu tại nhà chân thành vẫn quý. Xem lịch vía trên website để chuẩn bị trước.',
        ],
      },
    ],
    relatedTools: [
      { href: '/phong-thuy/ngay-via-phat', label: 'Ngày vía Phật' },
      { href: '/#hoat-dong', label: 'Lịch hoạt động' },
    ],
  },

  // ─── Làm rõ mê tín ──────────────────────────────────────
  {
    id: 'xem-ngay-co-trai-dao',
    question: 'Xem ngày giờ / phong thủy có trái với đạo Phật không?',
    shortQuestion: 'Xem ngày có trái đạo?',
    category: 'me_tin',
    summary:
      'Tùy thái độ. Dùng làm phương tiện chọn duyên thuận thì khác đem cả đời sống giao cho mê tín và bỏ nhân quả.',
    tags: ['xem ngày', 'phong thủy', 'mê tín', 'nhân quả'],
    keyPoints: [
      'Nhân quả và giữ giới vẫn là gốc.',
      'Không vì ngày xấu mà bỏ việc thiện / bổn phận.',
      'Không vì ngày tốt mà làm ác.',
    ],
    sections: [
      {
        title: 'Trả lời',
        paragraphs: [
          'Trong văn hóa Việt, chọn ngày lành việc lớn rất phổ biến. Với Phật tử: có thể tham khảo như điều kiện phụ, nhưng quyết định cuối dựa trên tâm thiện, khả năng thực tế và lời khuyên trí tuệ. Sợ ngày giờ đến mức không dám làm việc nghĩa, hoặc trả tiền cắt sao giải hạn rồi tiếp tục tạo ác — là lệch.',
          'Website có mục lịch · việc lớn mang tính văn hóa / tham khảo; pháp môn chính vẫn là giới · định · tuệ.',
        ],
      },
    ],
    relatedTools: [
      { href: '/phong-thuy/giao-ly-can-ban', label: 'Giáo lý căn bản' },
      { href: '/phong-thuy/lich-dung-su', label: 'Lịch dụng sự' },
    ],
  },
  {
    id: 'boc-bai-xin-xam',
    question: 'Xin xăm / gieo quẻ tại chùa có phải Chánh pháp không?',
    shortQuestion: 'Xin xăm có đúng pháp?',
    category: 'me_tin',
    summary:
      'Nhiều chùa còn tục xin xăm dân gian. Phật tử nên giữ tâm cầu chỉ giáo hướng thiện, không biến thành bói toán lệ thuộc.',
    tags: ['xin xăm', 'gieo quẻ', 'quan âm', 'mê tín'],
    sections: [
      {
        title: 'Trả lời',
        paragraphs: [
          'Nếu xem xăm như lời nhắc từ bi để tự phản tỉnh (làm lành, giữ giới, nhẫn nhục) thì có thể là duyên. Nếu mỗi việc nhỏ đều xin xăm rồi sợ hãi, bỏ Chánh niệm và nhân quả — thì đã lệch sang mê tín. Hỏi thầy trụ trì về thông lệ chùa mình.',
        ],
      },
    ],
    relatedTools: [
      { href: '/phong-thuy/gieo-que-xin-xam', label: 'Gieo quẻ · xin xăm' },
    ],
  },
  {
    id: 'thanh-toan-phuoc',
    question: 'Có mua được nhiều phước bằng cách đóng tiền lớn không?',
    shortQuestion: 'Tiền có mua được phước?',
    category: 'me_tin',
    summary:
      'Không. Phước từ tâm và hành vi thiện. Tiền chỉ là một loại tài thí — thiếu tâm thì thành hình thức.',
    tags: ['phước', 'tiền', 'cúng dường', 'mê tín'],
    sections: [
      {
        title: 'Trả lời',
        paragraphs: [
          'Người giàu bố thí lớn với tâm khiêm hạ được phước lớn; người nghèo một nắm muối với tâm trong sạch cũng quý. Ai hứa “đóng X triệu = hết nghiệp / chắc chắn giàu” đều trái tinh thần nhân quả. Cúng dường để duy trì Tam Bảo thì như pháp; mua bán giải thoát thì không.',
        ],
      },
    ],
    relatedGiaoLyIds: ['nghiep-qua', 'luc-do'],
  },
  {
    id: 'than-thong',
    question: 'Nghe nói thầy có thần thông / biết tiền kiếp — tin thế nào?',
    shortQuestion: 'Thần thông · tiền kiếp?',
    category: 'me_tin',
    summary:
      'Đức Phật cấm dùng thần thông để khoe và thu phục. Lấy giới đức và chánh kiến làm thước đo, không lấy chuyện linh thiêng.',
    tags: ['thần thông', 'tiền kiếp', 'thầy', 'chánh kiến'],
    keyPoints: [
      'Thần thông không chứng minh giải thoát.',
      'Lời dạy dẫn giảm tham sân si mới đáng nương.',
      'Hỏi đạo tràng tin cậy trước khi theo cá nhân trên mạng.',
    ],
    sections: [
      {
        title: 'Trả lời',
        paragraphs: [
          'Kinh điển kể thần thông nhưng nhấn mạnh giải thoát mới là mục tiêu. Người tự xưng biết hết tiền kiếp của bạn để đòi tiền “cắt” — dấu hiệu đỏ. Hãy xem họ có giữ giới, có hòa hợp Tăng, có dạy Tứ Đế / nhân quả rõ không. Khi nghi, dừng và hỏi trụ trì chùa mình.',
        ],
      },
    ],
    relatedTools: [
      { href: '/phong-thuy/phap-thoai', label: 'Chánh pháp · tà thuyết' },
      { href: '/phong-thuy/giao-ly-can-ban', label: 'Tam pháp ấn' },
    ],
    relatedGiaoLyIds: ['tam-phap-an'],
  },
  {
    id: 'so-thang-bay',
    question: 'Tháng Bảy có đáng sợ như lời đồn không?',
    shortQuestion: 'Tháng Bảy có đáng sợ?',
    category: 'me_tin',
    summary:
      'Tháng Bảy âm là mùa Vu Lan · báo hiếu · tăng từ bi — không phải tháng “ma” để kinh doanh nỗi sợ.',
    tags: ['tháng bảy', 'vu lan', 'mê tín', 'cô hồn'],
    sections: [
      {
        title: 'Trả lời',
        paragraphs: [
          'Phật tử dùng tháng này để nhớ ân, cầu siêu, bố thí, ăn chay, phóng sinh đúng pháp. Truyền sợ hãi khiến người ta đốt đồ / làm lễ loạn xạ rồi quên hiếu đạo mới là lệch. Sống thiện thì ngày nào cũng là ngày lành.',
        ],
      },
    ],
    relatedGiaoLyIds: ['bao-hieu'],
    relatedTools: [
      { href: '/phong-thuy/phap-thoai', label: 'Pháp thoại Vu Lan' },
    ],
  },
  {
    id: 'hoi-them-o-dau',
    question: 'Hỏi thêm thầy / nhà chùa bằng cách nào?',
    shortQuestion: 'Hỏi thêm ở đâu?',
    category: 'nhap_mon',
    summary:
      'Ghi danh Phật tử, đến giờ tiếp chúng, Zalo / hotline nhà chùa, hoặc hỏi sau buổi pháp thoại đúng oai nghi.',
    tags: ['hỏi thầy', 'liên hệ', 'ghi danh', 'đạo tràng'],
    sections: [
      {
        title: 'Trả lời',
        paragraphs: [
          'Ưu tiên gặp trực tiếp tại chùa vào thời điểm nhà chùa bố trí. Câu hỏi nên ngắn, rõ, thành thật. Việc riêng tư đừng hỏi công khai trên mạng xã hội. Có thể ghi danh sổ Phật tử để nhận lịch giảng và thông báo lễ.',
        ],
        bullets: [
          'Ghi danh trên website → mục Đăng ký Phật tử.',
          'Xem lịch hoạt động / pháp thoại trước khi đến.',
          'Khẩn cấp tang sự · bệnh nặng: gọi hotline nhà chùa nếu có.',
        ],
      },
    ],
    relatedTools: [
      { href: '/dang-ky-phat-tu', label: 'Ghi danh Phật tử' },
      { href: '/#hoat-dong', label: 'Lịch hoạt động' },
      { href: '/phong-thuy/phap-thoai', label: 'Pháp thoại' },
    ],
  },
];

export function getHoiDapItem(id: string): HoiDapItem | undefined {
  return HOI_DAP_ITEMS.find((i) => i.id === id);
}

function normalize(text: string): string {
  return text
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .trim();
}

export function searchHoiDapItems(
  query: string,
  category: HoiDapCategory | 'all' = 'all',
): HoiDapItem[] {
  const q = normalize(query);
  return HOI_DAP_ITEMS.filter((item) => {
    if (category !== 'all' && item.category !== category) return false;
    if (!q) return true;
    const haystack = normalize(
      [
        item.question,
        item.shortQuestion,
        item.summary,
        ...item.tags,
        ...(item.keyPoints ?? []),
        ...item.sections.flatMap((s) => [
          s.title ?? '',
          ...s.paragraphs,
          ...(s.bullets ?? []),
        ]),
      ].join(' '),
    );
    return haystack.includes(q);
  });
}
