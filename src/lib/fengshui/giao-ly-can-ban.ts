/**
 * Giáo lý căn bản — khung tu học phổ thông Bắc truyền tại chùa Việt.
 * Nội dung mang tính giới thiệu; chi tiết nghi thức theo trụ trì / hệ phái.
 */

export type GiaoLyCategory =
  | 'nhap_mon'
  | 'cot_loi'
  | 'thuc_hanh'
  | 'nghiep_qua'
  | 'bo_tat'
  | 'cu_si';

export const GIAO_LY_CATEGORY_LABELS: Record<GiaoLyCategory, string> = {
  nhap_mon: 'Nhập môn',
  cot_loi: 'Cốt lõi',
  thuc_hanh: 'Thực hành',
  nghiep_qua: 'Nghiệp · quả',
  bo_tat: 'Bồ Tát đạo',
  cu_si: 'Đời sống cư sĩ',
};

export interface GiaoLySection {
  title?: string;
  paragraphs: string[];
  bullets?: string[];
}

export interface GiaoLyLesson {
  id: string;
  title: string;
  shortTitle: string;
  category: GiaoLyCategory;
  summary: string;
  readingMinutes: number;
  tags: string[];
  sections: GiaoLySection[];
  keyPoints?: string[];
  practiceTips?: string[];
  relatedTools?: { href: string; label: string }[];
}

export const GIAO_LY_INTRO =
  'Khung giáo lý căn bản giúp Phật tử mới và người muốn ôn lại nền tảng: Tam Bảo, Tứ Đế, Bát Chánh Đạo, giới luật, nghiệp quả… Nội dung theo tinh thần phổ thông Bắc truyền tại chùa Việt — đọc chậm, đối chiếu với lời dạy của Tăng Ni khi dự lớp hoặc khóa tu.';

export const GIAO_LY_FOOTNOTE =
  'Đây là tài liệu giới thiệu, không thay thế kinh điển hay lời giảng của thầy. Mỗi hệ phái có thể nhấn mạnh khác nhau; khi nghi, nên hỏi trụ trì.';

export const GIAO_LY_LESSONS: GiaoLyLesson[] = [
  // ─── Nhập môn ───────────────────────────────────────────
  {
    id: 'duc-phat',
    title: 'Đức Phật Thích Ca Mâu Ni',
    shortTitle: 'Đức Phật',
    category: 'nhap_mon',
    summary:
      'Tiểu sử ngắn và ý nghĩa “Phật” — bậc đã giác ngộ, chỉ đường thoát khổ cho chúng sinh.',
    readingMinutes: 8,
    tags: ['phật', 'thích ca', 'lịch sử', 'nhập môn'],
    keyPoints: [
      'Phật không phải thần sáng tạo vũ trụ, mà là bậc đã tỉnh thức hoàn toàn.',
      'Ngài dạy con đường có thể thực chứng bằng giới, định, tuệ.',
      'Cuộc đời Ngài là tấm gương: từ cung vàng đến xuất gia, thành đạo, chuyển pháp luân.',
    ],
    sections: [
      {
        title: 'Phật là gì?',
        paragraphs: [
          'Chữ “Phật” (Buddha) nghĩa là bậc Giác Ngộ — người đã thấy rõ chân tướng khổ, nguyên nhân khổ, sự chấm dứt khổ và con đường dẫn đến giải thoát. Không phải danh hiệu riêng của một vị thần, mà là quả vị tuệ giác mà mọi chúng sinh đều có khả năng hướng tới.',
          'Trong truyền thống Việt Nam, khi nói “Đức Phật” thường chỉ Đức Thích Ca Mâu Ni — vị Phật lịch sử của thời kỳ này, người đã thị hiện xuất gia, thành đạo dưới gốc cây Bồ Đề và thuyết pháp hơn bốn mươi năm.',
        ],
      },
      {
        title: 'Cuộc đời tóm lược',
        paragraphs: [
          'Thái tử Tất Đạt Đa (Siddhārtha) sinh trong dòng họ Thích Ca tại vùng Lâm Tỳ Ni (nay thuộc Nepal). Lớn lên trong cung điện, Ngài chứng kiến sinh · lão · bệnh · tử và nhận ra rằng giàu sang không ngăn được khổ. Ngài xuất gia tìm đạo, trải nghiệm khổ hạnh cực đoan rồi từ bỏ lối ấy, chọn Trung đạo.',
          'Đêm thành đạo tại Bồ Đề Đạo Tràng, Ngài chứng ngộ Tứ Diệu Đế. Sau đó Ngài chuyển pháp luân lần đầu tại Vườn Nai (Lộc Uyển), dạy năm anh em Kiều Trần Như về Tứ Đế và Bát Chánh Đạo. Suốt đời, Ngài đi khắp nơi giáo hóa, thành lập Tăng đoàn, rồi nhập Niết-bàn tại Câu Thi Na.',
        ],
        bullets: [
          'Đản sinh — ngày vía Phật Đản (âm lịch 8/4 theo nhiều chùa Việt).',
          'Thành đạo — đêm rằm tháng Chạp (vía Đức Phật Thành đạo).',
          'Nhập Niết-bàn — rằm tháng Hai (vía Đức Phật nhập Niết-bàn).',
        ],
      },
      {
        title: 'Ý nghĩa với người học đạo hôm nay',
        paragraphs: [
          'Học về Đức Phật không chỉ để nhớ niên đại, mà để thấy: giác ngộ có thể đạt được bằng nỗ lực chân chính. Lòng tin nơi Phật là tin vào khả năng chuyển hóa tâm mình — không phải cầu xin may rủi.',
          'Khi lễ Phật, Phật tử kính nhớ ân đức chỉ đường; khi niệm danh hiệu, nuôi dưỡng tâm thanh tịnh; khi đọc kinh, tiếp xúc trực tiếp với lời dạy còn lưu lại.',
        ],
      },
    ],
    practiceTips: [
      'Ngày vía Phật: đến chùa lễ Phật, nghe pháp, hoặc tụng kinh ngắn tại nhà.',
      'Mỗi sáng có thể xá Phật ba lạy, nguyện học theo hạnh từ bi và trí tuệ của Ngài.',
    ],
    relatedTools: [
      { href: '/phong-thuy/ngay-via-phat', label: 'Ngày vía Phật' },
      { href: '/phong-thuy/kinh-tung-thuong-dung', label: 'Kinh tụng thường dùng' },
    ],
  },
  {
    id: 'tam-bao',
    title: 'Tam Bảo — Phật · Pháp · Tăng',
    shortTitle: 'Tam Bảo',
    category: 'nhap_mon',
    summary:
      'Ba ngôi quý nhất của người học đạo: Đức Phật chỉ đường, Giáo pháp là đường đi, Tăng già là bạn đồng hành.',
    readingMinutes: 7,
    tags: ['tam bảo', 'phật', 'pháp', 'tăng', 'quy y'],
    keyPoints: [
      'Phật Bảo: bậc giác ngộ và lý tưởng giác ngộ trong mỗi người.',
      'Pháp Bảo: lời dạy và con đường thực hành (kinh · luật · luận).',
      'Tăng Bảo: đoàn thể xuất gia thanh tịnh, giữ gìn và truyền thừa Chánh pháp.',
    ],
    sections: [
      {
        title: 'Vì sao gọi là “Bảo”?',
        paragraphs: [
          '“Bảo” nghĩa là quý hiếm, đáng nương tựa. Trong đời có nhiều chỗ dựa tạm thời — tiền bạc, địa vị, cảm xúc — nhưng đều biến đổi. Tam Bảo là chỗ nương bền vững vì hướng người ta thoát khổ từ gốc rễ: tham · sân · si.',
        ],
      },
      {
        title: 'Phật Bảo',
        paragraphs: [
          'Là Đức Phật lịch sử và tất cả chư Phật đã thành. Với người tu, Phật Bảo còn là Phật tánh sẵn có — khả năng tỉnh thức chưa được khai mở. Kính Phật là kính bậc đã đi trước và tin mình cũng có thể đi trên con đường ấy.',
        ],
      },
      {
        title: 'Pháp Bảo',
        paragraphs: [
          'Gồm kinh điển, giới luật, và các pháp môn thực hành (niệm Phật, thiền, trì chú, bố thí…). Pháp không phải để tranh luận suông, mà để áp dụng: nghe — suy nghĩ — thực hành. Không có Pháp, lòng kính Phật dễ trở thành hình thức.',
        ],
      },
      {
        title: 'Tăng Bảo',
        paragraphs: [
          'Tăng già là đoàn thể ít nhất bốn vị Tỳ-kheo sống theo giới luật, hòa hợp. Trong đời sống thường nhật, Phật tử kính Tăng Ni vì các vị đại diện cho lối sống xuất thế, giữ đèn pháp cho cộng đồng. Kính Tăng không có nghĩa thần tượng hóa cá nhân, mà kính pháp vị và hạnh nguyện.',
        ],
      },
      {
        title: 'Tam Bảo thế gian và xuất thế gian',
        paragraphs: [
          'Nhiều bài giảng phân biệt: hình tượng, kinh sách, Tăng chúng là Tam Bảo thế gian (hữu hình); chân như, giải thoát, Thánh chúng chứng đạo là Tam Bảo xuất thế gian. Người mới nên bắt đầu từ kính trọng và nương tựa Tam Bảo hữu hình — lễ Phật, nghe pháp, gần gũi đạo tràng thanh tịnh.',
        ],
      },
    ],
    practiceTips: [
      'Mỗi ngày niệm: “Con xin quy y Phật, quy y Pháp, quy y Tăng.”',
      'Hỗ trợ chùa bằng công quả, cúng dường hoặc giữ oai nghi khi vào chính điện.',
    ],
    relatedTools: [
      { href: '/phong-thuy/van-khan-nghi-le', label: 'Văn khấn · nghi lễ' },
      { href: '/dang-ky-phat-tu', label: 'Ghi danh Phật tử' },
    ],
  },
  {
    id: 'quy-y',
    title: 'Quy y Tam Bảo',
    shortTitle: 'Quy y',
    category: 'nhap_mon',
    summary:
      'Bước chính thức trở thành Phật tử: nguyện nương tựa Phật · Pháp · Tăng và hướng đời theo Chánh pháp.',
    readingMinutes: 8,
    tags: ['quy y', 'phật tử', 'tam bảo', 'ngũ giới'],
    keyPoints: [
      'Quy y là phát nguyện, không phải “gia nhập giáo hội” theo kiểu thế tục.',
      'Sau quy y thường thọ ngũ giới — nền tảng đạo đức cư sĩ.',
      'Quy y một lần với tâm thành; giữ tâm quy y mỗi ngày mới là thực chất.',
    ],
    sections: [
      {
        title: 'Quy y nghĩa là gì?',
        paragraphs: [
          '“Quy” là trở về; “Y” là nương dựa. Quy y Tam Bảo là quay lưng với chỗ nương sai (tham dục, mê tín, tự cao) để nương vào giác ngộ, Chánh pháp và đoàn thể thanh tịnh. Ai đã quy y được gọi là Phật tử tại gia (ưu-bà-tắc / ưu-bà-di).',
        ],
      },
      {
        title: 'Nghi thức thường gặp tại chùa Việt',
        paragraphs: [
          'Nhà chùa tổ chức lễ quy y vào ngày vía, rằm, hoặc khóa tu. Phật tử đến với tâm thành, nghe khai thị, quỳ trước Tam Bảo phát nguyện theo lời truyền giới sư. Nhiều nơi kết hợp thọ ngũ giới ngay trong lễ.',
          'Sau lễ, Phật tử nhận pháp danh (tùy chùa). Pháp danh là nhắc nhớ mình đã có chỗ nương — không phải thay thế tên khai sinh trong giấy tờ đời thường.',
        ],
        bullets: [
          'Ăn mặc giản dị, trang nghiêm.',
          'Đến đúng giờ, tắt điện thoại trong chính điện.',
          'Chuẩn bị tâm: hiểu vì sao mình quy y, không theo phong trào.',
        ],
      },
      {
        title: 'Sau khi quy y',
        paragraphs: [
          'Quy y không “xong một lần”. Mỗi ngày nên ôn lại lời nguyện, giữ giới đã thọ, gần gũi đạo tràng, học thêm giáo lý. Khi phạm giới, biết sám hối và đứng dậy — đó mới là tinh thần quy y sống động.',
        ],
      },
    ],
    practiceTips: [
      'Hỏi nhà chùa lịch lễ quy y sắp tới; ghi danh trước nếu cần.',
      'Ôn lại ý nghĩa Tam Bảo trước ngày lễ để phát nguyện rõ ràng.',
    ],
    relatedTools: [
      { href: '/phong-thuy/tra-cuu-kinh', label: 'Tra cứu kinh sách' },
      { href: '/phong-thuy/khoa-tu-an-cu', label: 'Khóa tu · an cư' },
    ],
  },

  // ─── Cốt lõi ────────────────────────────────────────────
  {
    id: 'tu-dieu-de',
    title: 'Tứ Diệu Đế',
    shortTitle: 'Tứ Đế',
    category: 'cot_loi',
    summary:
      'Bốn chân lý cao quý Đức Phật tuyên thuyết đầu tiên: Khổ · Tập · Diệt · Đạo — khung xương sống của toàn bộ Phật pháp.',
    readingMinutes: 14,
    tags: ['tứ đế', 'tứ diệu đế', 'khổ', 'tập', 'diệt', 'đạo'],
    keyPoints: [
      'Khổ Đế: nhìn nhận thực trạng bất toại nguyện của đời sống.',
      'Tập Đế: nguyên nhân khổ — tham ái, chấp thủ, vô minh.',
      'Diệt Đế: khổ có thể chấm dứt — Niết-bàn, tịch diệt.',
      'Đạo Đế: con đường thực hành — Bát Chánh Đạo.',
    ],
    sections: [
      {
        title: 'Vì sao gọi là “Diệu Đế”?',
        paragraphs: [
          '“Đế” là chân lý chắc thật; “Diệu” là sâu xa, nhiệm mầu. Tứ Diệu Đế không bi quan hóa cuộc đời, mà chẩn đoán đúng bệnh để chữa. Giống thầy thuốc: biết bệnh (Khổ), biết nguyên nhân (Tập), biết bệnh hết được (Diệt), kê thuốc (Đạo).',
        ],
      },
      {
        title: '1. Khổ Đế (Dukkha)',
        paragraphs: [
          'Khổ không chỉ là đau đớn thể xác. Trong kinh điển, khổ gồm: khổ khổ (đau rõ ràng), hoại khổ (vui rồi tan), hành khổ (mọi thứ do duyên hợp đều bất ổn). Sinh, già, bệnh, chết, xa người thương, gần người ghét, cầu không được — đều là biểu hiện của dukkha.',
          'Nhận ra khổ không phải để chán đời, mà để thôi tự lừa mình rằng “chỉ cần thêm một chút nữa là đủ”. Từ đó mới có động lực tìm lối ra.',
        ],
      },
      {
        title: '2. Tập Đế (Samudaya)',
        paragraphs: [
          'Nguyên nhân sâu của khổ là ái (tanha) — khao khát khoái lạc, khao khát tồn tại theo ý mình, và cả sự chán ghét dẫn đến muốn “không có”. Đằng sau ái là vô minh: không thấy các pháp vô thường, vô ngã.',
          'Tập Đế cũng gắn với nghiệp: hành động tạo tác từ tham · sân · si sẽ chín thành quả khổ trong tương lai. Muốn hết khổ phải chặt gốc ái và vô minh, không chỉ xử lý triệu chứng bên ngoài.',
        ],
      },
      {
        title: '3. Diệt Đế (Nirodha)',
        paragraphs: [
          'Khổ có thể diệt — đó là tin tức giải thoát. Khi ái diệt, chấp thủ buông, tâm không còn bị kéo theo sóng duyên, đó là Niết-bàn: tịch tĩnh, mát mẻ, không còn lửa tham sân si.',
          'Diệt Đế khẳng định mục tiêu tu học không phải “sống khổ cho xong”, mà chuyển hóa đến tự do nội tâm. Niết-bàn không phải nơi chốn địa lý; là trạng thái tâm đã hết nhiễm ô.',
        ],
      },
      {
        title: '4. Đạo Đế (Magga)',
        paragraphs: [
          'Con đường dẫn đến Diệt là Bát Chánh Đạo — tám chi phần Chánh kiến, Chánh tư duy, Chánh ngữ, Chánh nghiệp, Chánh mạng, Chánh tinh tấn, Chánh niệm, Chánh định. Đạo Đế là “thuốc”; các bài khác trong mục này triển khai chi tiết từng phần.',
        ],
      },
      {
        title: 'Cách học Tứ Đế trong đời thường',
        paragraphs: [
          'Khi gặp chuyện buồn: nhận diện “đây là khổ” (không phủ nhận, không phóng đại). Hỏi tiếp: mình đang bám vào dục vọng hay cái tôi nào? Rồi chọn một hành động theo Đạo — nói lời ái ngữ, buông một thói quen, ngồi lại thở chánh niệm. Lặp lại đủ lâu, Tứ Đế trở thành tuệ sống, không còn là lý thuyết.',
        ],
      },
    ],
    practiceTips: [
      'Mỗi tuần dành một buổi chỉ đọc về một Đế, ghi nhật ký một ví dụ đời thực.',
      'Nghe pháp thoại về Tứ Đế tại chùa hoặc khóa tu để được khai thị đúng mạch.',
    ],
    relatedTools: [
      { href: '/phong-thuy/khoa-tu-an-cu', label: 'Khóa tu · an cư' },
      { href: '/phong-thuy/tra-cuu-kinh', label: 'Tra cứu kinh sách' },
    ],
  },
  {
    id: 'bat-chanh-dao',
    title: 'Bát Chánh Đạo',
    shortTitle: 'Bát Chánh Đạo',
    category: 'cot_loi',
    summary:
      'Tám chi phần của Đạo Đế — khung thực hành hoàn chỉnh từ thấy đúng đến định tâm, dẫn đến giải thoát.',
    readingMinutes: 16,
    tags: ['bát chánh đạo', 'đạo đế', 'tu tập', 'trung đạo'],
    keyPoints: [
      'Ba nhóm: Giới (ngữ · nghiệp · mạng), Định (tinh tấn · niệm · định), Tuệ (kiến · tư duy).',
      'Các chi hỗ trợ lẫn nhau — không thể chỉ “thiền” mà bỏ giới và chánh kiến.',
      'Trung đạo: không đắm dục, không khổ hạnh cực đoan.',
    ],
    sections: [
      {
        title: 'Tổng quan tám chi',
        paragraphs: [
          'Bát Chánh Đạo là con đường Trung đạo Đức Phật chỉ ra sau khi từ bỏ cả hưởng thụ và khổ hạnh. Tám chi không phải tám bậc tuần tự cứng nhắc; chúng đan xen. Người mới thường bắt đầu từ giữ giới và chánh niệm trong việc nhỏ hàng ngày.',
        ],
        bullets: [
          'Chánh kiến — thấy đúng Tứ Đế, nghiệp quả, vô thường.',
          'Chánh tư duy — hướng tâm ly dục, vô sân, bất hại.',
          'Chánh ngữ — nói thật, ái ngữ, không hai lưỡi, không lời vô ích.',
          'Chánh nghiệp — không sát sinh, trộm cắp, tà dâm.',
          'Chánh mạng — nuôi thân bằng nghề lương thiện, không hại người.',
          'Chánh tinh tấn — nỗ lực ngăn ác, sinh thiện, giữ thiện.',
          'Chánh niệm — tỉnh giác với thân, cảm thọ, tâm, pháp.',
          'Chánh định — tâm chuyên nhất, các tầng thiền định.',
        ],
      },
      {
        title: 'Tuệ học: Chánh kiến · Chánh tư duy',
        paragraphs: [
          'Chánh kiến là gốc. Không có thấy đúng, mọi nỗ lực dễ lệch sang mê tín hoặc cực đoan. Chánh kiến căn bản: tin nghiệp quả, thấy khổ có nguyên nhân và có lối ra, thấy các pháp vô thường · vô ngã.',
          'Chánh tư duy là hướng suy nghĩ: buông dục vọng thái quá, không nuôi hận, không muốn hại. Trước khi nói hay làm, dừng lại một nhịp hỏi: ý nghĩ này đang nuôi từ bi hay nuôi ngã chấp?',
        ],
      },
      {
        title: 'Giới học: Chánh ngữ · Chánh nghiệp · Chánh mạng',
        paragraphs: [
          'Ba chi này giữ đời sống khỏi tạo nghiệp nặng. Chánh ngữ không chỉ “không nói dối” — còn tránh lời chia rẽ, lời độc ác, lời phù phiếm. Chánh nghiệp giữ thân khỏi sát · đạo · dâm. Chánh mạng nhắc nghề nghiệp: tránh việc sống nhờ lừa đảo, buôn bán độc hại, sát sinh chuyên nghiệp nếu đã phát nguyện sâu.',
          'Với cư sĩ, thực hành theo khả năng: chọn nghề lương thiện, sửa dần thói quen lời nói, giữ ngũ giới là đã đi đúng hướng Giới học.',
        ],
      },
      {
        title: 'Định học: Chánh tinh tấn · Chánh niệm · Chánh định',
        paragraphs: [
          'Chánh tinh tấn là nỗ lực đúng chỗ — không phải hùng hục làm nhiều việc phước rồi kiệt sức, cũng không lười biếng. Bốn chánh cần: ngăn ác chưa sinh, diệt ác đã sinh, sinh thiện chưa có, nuôi thiện đã có.',
          'Chánh niệm là trái tim thực hành hàng ngày: biết mình đang làm gì, cảm gì, nghĩ gì — không bị cuốn. Có thể luyện bằng hơi thở, niệm Phật, hoặc tỉnh giác khi đi · đứng · nằm · ngồi.',
          'Chánh định là tâm an trú, không tán loạn. Với người tại gia, định không nhất thiết phải chứng thiền sâu ngay; giữ được một khoảng lặng mỗi ngày đã là hạt giống định.',
        ],
      },
      {
        title: 'Áp dụng một ngày',
        paragraphs: [
          'Sáng: phát nguyện theo Chánh kiến (nhớ Tứ Đế / niệm Phật). Trong ngày: giữ Chánh ngữ khi nói chuyện, Chánh nghiệp khi làm việc. Chiều tối: vài phút Chánh niệm với hơi thở hoặc danh hiệu. Cuối ngày: xét lại — ác nào cần sám, thiện nào cần nuôi. Đó là Bát Chánh Đạo thu nhỏ.',
        ],
      },
    ],
    practiceTips: [
      'Chọn một chi “yếu” của mình (ví dụ lời nói) để theo dõi trong một tuần.',
      'Kết hợp gõ mõ / niệm Phật để nuôi Chánh niệm và Chánh tinh tấn.',
    ],
    relatedTools: [
      { href: '/go-mo', label: 'Gõ mõ tụng kinh' },
      { href: '/phong-thuy/niem-phat', label: 'Niệm Phật' },
    ],
  },
  {
    id: 'thap-nhi-nhan-duyen',
    title: 'Thập nhị nhân duyên',
    shortTitle: '12 nhân duyên',
    category: 'cot_loi',
    summary:
      'Mười hai mắt xích giải thích vòng sinh tử: từ vô minh đến già chết — và chỗ có thể cắt đứt.',
    readingMinutes: 12,
    tags: ['nhân duyên', 'duyên khởi', 'luân hồi', 'vô minh'],
    keyPoints: [
      'Các pháp do duyên sinh, không có tự ngã cố định.',
      'Vô minh → hành → thức → danh sắc → lục nhập → xúc → thọ → ái → thủ → hữu → sinh → lão tử.',
      'Cắt ái và vô minh là cắt vòng sinh tử.',
    ],
    sections: [
      {
        title: 'Duyên khởi — trái tim tuệ giác',
        paragraphs: [
          'Đức Phật dạy: “Cái này có nên cái kia có; cái này sinh nên cái kia sinh…”. Không có vật nào tự có, tách rời. Thập nhị nhân duyên là bản đồ chi tiết của dòng chảy sinh tử do vô minh và ái thúc đẩy.',
        ],
      },
      {
        title: 'Mười hai mắt xích (tóm tắt)',
        paragraphs: [
          'Vô minh: không thấy chân lý. Hành: tạo tác nghiệp. Thức: dòng nhận thức tái tục. Danh sắc: tinh thần và thân. Lục nhập: sáu căn. Xúc: căn–trần–thức gặp nhau. Thọ: cảm giác vui · buồn · trung tính. Ái: dính mắc. Thủ: bám giữ. Hữu: nghiệp hữu dẫn đến tái sinh. Sinh: ra đời. Lão tử: già chết và sầu bi khổ ưu.',
        ],
        bullets: [
          'Quá khứ: vô minh · hành.',
          'Hiện tại: thức → … → hữu.',
          'Vị lai: sinh · lão tử.',
        ],
      },
      {
        title: 'Chỗ thực hành',
        paragraphs: [
          'Người tu không cần thuộc lòng danh xưng Hán Việt ngay. Quan trọng là thấy: mỗi lần mình phản ứng bằng tham sân trước một cảm thọ, vòng xích đang chạy. Chánh niệm tại thọ và ái — “đang thích / đang ghét” — là chỗ có thể dừng. Giữ giới giảm hành nghiệp mới; tu tuệ phá vô minh.',
        ],
      },
    ],
    practiceTips: [
      'Khi nổi giận hoặc thèm muốn mạnh: dừng lại, nhận tên cảm thọ trước khi hành động.',
      'Đọc thêm bài Nghiệp · quả và Ngũ uẩn để thấy cùng một dòng chảy.',
    ],
  },
  {
    id: 'ngu-uan',
    title: 'Ngũ uẩn',
    shortTitle: 'Ngũ uẩn',
    category: 'cot_loi',
    summary:
      'Năm nhóm tạo nên “con người”: sắc · thọ · tưởng · hành · thức — nền tảng để hiểu vô ngã.',
    readingMinutes: 10,
    tags: ['ngũ uẩn', 'vô ngã', 'sắc thọ tưởng hành thức'],
    keyPoints: [
      'Cái gọi là “tôi” chỉ là sự hòa hợp tạm thời của năm uẩn.',
      'Bám năm uẩn là nguồn khổ; quán chiếu năm uẩn dẫn tới buông xả.',
    ],
    sections: [
      {
        title: 'Năm nhóm',
        paragraphs: [
          'Sắc: thân và vật chất. Thọ: cảm giác dễ chịu · khó chịu · trung tính. Tưởng: nhận diện, đặt tên. Hành: các tâm sở tạo tác (ý muốn, quyết định…). Thức: nhận biết.',
          'Không có uẩn nào là “linh hồn bất biến”. Chúng sinh diệt liên tục theo duyên. Khi vui ta nghĩ “tôi vui”; khi bệnh ta nghĩ “tôi khổ” — nhưng nhìn kỹ chỉ là thọ và sắc đang biến.',
        ],
      },
      {
        title: 'Quán ngũ uẩn trong tu tập',
        paragraphs: [
          'Trong thiền hoặc niệm Phật, khi tạp niệm nổi lên, có thể nhận: “đây là tưởng / hành”. Khi đau lưng khi ngồi: “đây là sắc và thọ”. Không đồng hóa với chúng, cũng không đàn áp — chỉ thấy rõ. Lâu dần, chấp ngã mỏng đi.',
        ],
      },
    ],
    practiceTips: [
      'Một ngày chọn một hoạt động (ăn cơm, đi bộ) và chỉ quan sát thọ — dễ chịu hay khó chịu.',
    ],
  },
  {
    id: 'tam-phap-an',
    title: 'Tam pháp ấn',
    shortTitle: 'Tam pháp ấn',
    category: 'cot_loi',
    summary:
      'Ba dấu ấn kiểm tra giáo pháp có phải Chánh pháp: vô thường · khổ · vô ngã (và Niết-bàn tịch tĩnh).',
    readingMinutes: 8,
    tags: ['pháp ấn', 'vô thường', 'khổ', 'vô ngã', 'niết bàn'],
    keyPoints: [
      'Vô thường: mọi pháp hữu vi đều biến đổi.',
      'Khổ: pháp hữu vi bị bức bách, không đáng bám.',
      'Vô ngã: không có tự thể cố định.',
    ],
    sections: [
      {
        title: 'Dùng pháp ấn để soi giáo lý',
        paragraphs: [
          'Khi nghe một lời dạy, sách vở, hay lời “thần thông”, hãy hỏi: có thừa nhận vô thường không? Có dẫn tới giảm tham sân không? Có phá ngã chấp không? Nếu khuyến khích bám chấp, thù hận, hoặc hứa “bất tử theo ý muốn thế gian”, cần thận trọng.',
        ],
      },
      {
        title: 'Vô thường · Khổ · Vô ngã trong đời sống',
        paragraphs: [
          'Vô thường giúp ta trân trọng hiện tại và bớt tuyệt vọng khi mất mát. Khổ (theo nghĩa sâu) nhắc ta đừng tưởng khoái lạc giác quan là chỗ trú cuối. Vô ngã giúp khi bị khen chê — biết đó là duyên hợp, không cần phòng thủ cái tôi đến mức tạo nghiệp.',
          'Nhiều kinh Bắc truyền nêu Tứ pháp ấn, thêm “Niết-bàn tịch tĩnh” — mục tiêu mát mẻ sau khi buông nhiễm ô.',
        ],
      },
    ],
    practiceTips: [
      'Mỗi tối nhớ một việc “đã đổi” trong ngày — luyện nhìn vô thường nhẹ nhàng, không bi quan.',
    ],
  },
  {
    id: 'ba-hoc',
    title: 'Ba học: Giới · Định · Tuệ',
    shortTitle: 'Giới · Định · Tuệ',
    category: 'cot_loi',
    summary:
      'Khung tu học cô đọng nhất: giữ giới sạch → tâm dễ định → tuệ phát sinh.',
    readingMinutes: 7,
    tags: ['giới', 'định', 'tuệ', 'tam học'],
    keyPoints: [
      'Giới là nền — không giới thì định tuệ khó vững.',
      'Định là tâm an — không định thì tuệ dễ thành suy luận.',
      'Tuệ là thấy đúng — không tuệ thì giới định dễ thành hình thức.',
    ],
    sections: [
      {
        title: 'Thứ tự hỗ tương',
        paragraphs: [
          'Người mới thường nghe “tuệ giải thoát”, nhưng tuệ chân thật cần giới và định nâng đỡ. Giữ giới giảm hối hận, ngủ ngon, người khác tin — tâm nhẹ. Tâm nhẹ dễ ngồi, dễ niệm. Ngồi và niệm lâu, thấy rõ tâm và pháp — tuệ lớn dần. Tuệ lớn lại khiến giữ giới tự nhiên hơn, không còn gồng.',
        ],
      },
      {
        title: 'Áp dụng cho cư sĩ',
        paragraphs: [
          'Giới: ngũ giới hoặc ít nhất không sát · không nói dối nặng. Định: 10–20 phút niệm Phật / thở mỗi ngày. Tuệ: đọc giáo lý căn bản, nghe pháp, quán vô thường trong việc nhỏ. Không cần đợi “đủ điều kiện” mới tu — bắt đầu từ mức đang có.',
        ],
      },
    ],
    relatedTools: [
      { href: '/go-mo', label: 'Gõ mõ · niệm Phật' },
      { href: '/phong-thuy/kinh-tung-thuong-dung', label: 'Kinh tụng' },
    ],
  },

  // ─── Nghiệp · quả ───────────────────────────────────────
  {
    id: 'nghiep-qua',
    title: 'Nghiệp và quả báo',
    shortTitle: 'Nghiệp · quả',
    category: 'nghiep_qua',
    summary:
      'Nghiệp là hành động có chủ ý; quả là chín muồi của hành động ấy — nền tảng đạo đức và niềm tin nhân quả.',
    readingMinutes: 11,
    tags: ['nghiệp', 'nhân quả', 'quả báo', 'tư nghiệp'],
    keyPoints: [
      'Nghiệp quan trọng nhất là ý nghiệp (tư) — chủ ý dẫn thân và khẩu.',
      'Nhân quả không phải trả đũa tức thì theo kiểu tính sổ từng ngày.',
      'Có thể chuyển nghiệp bằng sám hối, giữ giới, làm thiện, tu tuệ.',
    ],
    sections: [
      {
        title: 'Nghiệp là gì?',
        paragraphs: [
          'Nghiệp (karma) là hành động tạo tác có chủ ý qua thân · miệng · ý. Không phải “số phận đã định sẵn không đổi”. Cũng không phải mọi sự trên đời đều do nghiệp đời trước — còn có duyên hiện tại, điều kiện tự nhiên, nghiệp chung của cộng đồng.',
          'Ý nghiệp là gốc: cùng một việc, ý thiện hay ác quyết định chất nghiệp khác nhau. Vì thế tu tập luôn nhấn mạnh chuyển tâm.',
        ],
      },
      {
        title: 'Quả chín như thế nào?',
        paragraphs: [
          'Có nghiệp cho quả ngay, có nghiệp cho quả đời này, có nghiệp cho quả đời sau. Nhân nhỏ có thể quả lớn nếu gặp duyên mạnh — như hạt giống gặp mưa. Hiểu vậy để không chủ quan (“làm ác một chút không sao”) cũng không tuyệt vọng (“đã xấu thì hết cách”).',
        ],
      },
      {
        title: 'Chuyển nghiệp',
        paragraphs: [
          'Phật pháp không kết án vĩnh viễn. Sám hối chân thành, không che giấu, không tái phạm; tăng cường thiện nghiệp (bố thí, giữ giới, nhẫn nhục, tinh tấn…); tu tập trí tuệ để làm mỏng vô minh — đó là chuyển nghiệp. Không phải “mua” quả tốt bằng hình thức, mà thay đổi gốc tâm và hành vi.',
        ],
      },
    ],
    practiceTips: [
      'Trước việc lớn: hỏi “ý mình đang thiện hay bất thiện?”',
      'Cuối ngày: sám một lỗi nhỏ cụ thể, không chỉ nói chung chung.',
    ],
    relatedTools: [
      { href: '/phong-thuy/van-khan-nghi-le', label: 'Văn khấn sám hối · cầu an' },
    ],
  },
  {
    id: 'luan-hoi-luc-dao',
    title: 'Luân hồi và lục đạo',
    shortTitle: 'Luân hồi · lục đạo',
    category: 'nghiep_qua',
    summary:
      'Dòng tái sinh theo nghiệp trong sáu nẻo: trời · người · a-tu-la · súc sinh · ngạ quỷ · địa ngục.',
    readingMinutes: 9,
    tags: ['luân hồi', 'lục đạo', 'tái sinh', 'cõi'],
    keyPoints: [
      'Luân hồi là tiếp nối của thức theo nghiệp, không phải linh hồn bất biến dời nhà.',
      'Cõi người quý vì đủ khổ vui để phát tâm tu.',
      'Mục tiêu tối hậu là giải thoát, không phải chỉ cầu sinh thiên.',
    ],
    sections: [
      {
        title: 'Sáu nẻo (lục đạo)',
        paragraphs: [
          'Trời: vui nhiều, dễ quên tu. Người: khổ vui xen, dễ phát Bồ đề tâm. A-tu-la: mạnh nhưng nhiều sân cạnh tranh. Súc sinh: si mê, bị sai sử. Ngạ quỷ: đói khát, tham không đáy. Địa ngục: khổ nặng do nghiệp nặng.',
          'Mô tả lục đạo vừa là cảnh giới tái sinh theo kinh điển, vừa là trạng thái tâm ngay đời này — khi tâm đầy sân ta đang “ở” a-tu-la; khi tham không thỏa ta đang nếm ngạ quỷ.',
        ],
      },
      {
        title: 'Thái độ đúng',
        paragraphs: [
          'Không dùng lục đạo để đe dọa trẻ em hay phán xét người khác. Dùng để tự nhắc: nghiệp đang dẫn mình đi đâu? Đồng thời phát tâm từ bi với chúng sinh trong mọi nẻo — đó là tinh thần Bồ Tát.',
        ],
      },
    ],
    practiceTips: [
      'Phóng sinh, ăn chay kỳ, bố thí: nuôi tâm không muốn đẩy chúng sinh vào khổ.',
      'Niệm Phật cầu vãng sinh Tịnh Độ: hướng ra khỏi lục đạo theo pháp môn Tịnh tông.',
    ],
    relatedTools: [
      { href: '/phong-thuy/niem-phat', label: 'Niệm Phật' },
    ],
  },

  // ─── Thực hành ──────────────────────────────────────────
  {
    id: 'ngu-gioi',
    title: 'Ngũ giới',
    shortTitle: 'Ngũ giới',
    category: 'thuc_hanh',
    summary:
      'Năm điều căn bản của cư sĩ: không sát sinh, trộm cắp, tà dâm, nói dối, uống rượu (chất say).',
    readingMinutes: 10,
    tags: ['ngũ giới', 'giữ giới', 'cư sĩ', 'đạo đức'],
    keyPoints: [
      'Giới bảo vệ mình và người — nền tảng mọi pháp môn.',
      'Thọ giới là nguyện; giữ giới là thực hành mỗi ngày.',
      'Phạm giới: sám hối, không tái phạm, không tuyệt vọng.',
    ],
    sections: [
      {
        title: 'Năm giới',
        paragraphs: ['Chi tiết từng giới:'],
        bullets: [
          'Không sát sinh — tôn trọng sự sống; mở rộng thành ăn chay, không ngược đãi.',
          'Không trộm cắp — không lấy gì không được cho; gồm cả gian lận.',
          'Không tà dâm — trung thực trong quan hệ tình cảm / hôn nhân.',
          'Không nói dối — đặc biệt dối để hại người; hướng tới ái ngữ.',
          'Không uống rượu / chất say — giữ tỉnh táo, tránh cửa ngõ phá các giới khác.',
        ],
      },
      {
        title: 'Tinh thần giữ giới',
        paragraphs: [
          'Giới không phải nhà tù. Giới là hàng rào bảo vệ khu vườn tâm. Giữ giới vì hiểu nhân quả và vì từ bi, không chỉ vì sợ tội. Khi hoàn cảnh khó (ví dụ thuốc men có cồn), nên hỏi thầy và giữ tinh thần giới — không tìm lỗ hổng để buông lung.',
        ],
      },
    ],
    practiceTips: [
      'Thọ ngũ giới tại chùa khi đã hiểu rõ; trước mắt có thể tự nguyện giữ từng phần.',
      'Mỗi giới gắn với một hành động thay thế tích cực (ví dụ: không nói dối → chủ động nói lời khích lệ thật).',
    ],
    relatedTools: [
      { href: '/phong-thuy/khoa-tu-an-cu', label: 'Khóa tu · Bát Quan Trai' },
    ],
  },
  {
    id: 'thap-thien',
    title: 'Thập thiện nghiệp',
    shortTitle: 'Thập thiện',
    category: 'thuc_hanh',
    summary:
      'Mười nghiệp thiện của thân · miệng · ý — mở rộng ngũ giới thành lối sống tích cực.',
    readingMinutes: 9,
    tags: ['thập thiện', 'thân khẩu ý', 'nghiệp thiện'],
    keyPoints: [
      'Thân: không sát · không đạo · không tà dâm.',
      'Miệng: không dối · không hai lưỡi · không ác khẩu · không phù phiếm.',
      'Ý: không tham · không sân · không si (tà kiến).',
    ],
    sections: [
      {
        title: 'Từ “không làm ác” đến “làm thiện”',
        paragraphs: [
          'Ngũ giới nghiêng về ngăn ác. Thập thiện vừa ngăn vừa xây: không chỉ không nói dối mà còn nói lời hòa hợp; không chỉ không sân mà còn tu từ bi. Kinh Thập Thiện Nghiệp Đạo là tài liệu kinh điển nên đọc kèm.',
        ],
      },
      {
        title: 'Tu ý nghiệp',
        paragraphs: [
          'Ba nghiệp ý — tham, sân, si — là khó nhất vì người khác không thấy. Thực hành: khi tham nổi, quán vô thường của đối tượng; khi sân nổi, quán khổ của đối phương và mình; khi si (hiểu sai), học lại Chánh kiến. Ý sạch thì thân khẩu dễ sạch.',
        ],
      },
    ],
    relatedTools: [
      { href: '/phong-thuy/tra-cuu-kinh', label: 'Tra cứu Kinh Thập Thiện' },
    ],
  },
  {
    id: 'niem-phat-can-ban',
    title: 'Niệm Phật căn bản',
    shortTitle: 'Niệm Phật',
    category: 'thuc_hanh',
    summary:
      'Pháp môn phổ biến tại chùa Việt: trì danh A Di Đà Phật — nhiếp tâm, tích phước, cầu vãng sinh Tịnh Độ.',
    readingMinutes: 11,
    tags: ['niệm phật', 'tịnh độ', 'a di đà', 'trì danh'],
    keyPoints: [
      'Niệm Phật là vừa tín · nguyện · hạnh.',
      'Miệng niệm, tai nghe, tâm nhớ — ba nghiệp tương ưng.',
      'Có thể niệm lúc ngồi, đi, làm việc nhẹ, hoặc theo nhịp mõ.',
    ],
    sections: [
      {
        title: 'Tín · Nguyện · Hạnh',
        paragraphs: [
          'Tín: tin có cõi Cực Lạc và bản nguyện Đức A Di Đà. Nguyện: muốn vãng sinh, muốn giác ngộ để độ chúng sinh — không chỉ cầu an tạm. Hạnh: trì danh hiệu thật sự, kèm giữ giới và làm thiện.',
          'Thiếu tín thì dễ bỏ cuộc; thiếu nguyện thì niệm thành thói quen khô; thiếu hạnh thì nguyện trở thành nói suông.',
        ],
      },
      {
        title: 'Cách niệm cho người mới',
        paragraphs: [
          'Ngồi ngay ngắn hoặc đi kinh hành chậm. Niệm “A Di Đà Phật” hoặc “Nam mô A Di Đà Phật” — rõ ràng, không cần gằn giọng. Tai lắng nghe tiếng niệm của mình. Tạp niệm đến thì biết, rồi đưa tâm về danh hiệu — không đánh trận với tạp niệm.',
          'Có thể đặt mục tiêu 108 biến (một chuỗi tràng), rồi tăng dần. Dùng trang Gõ mõ để giữ nhịp nếu hữu ích.',
        ],
      },
      {
        title: 'Niệm Phật và đời sống',
        paragraphs: [
          'Niệm lúc rảnh, lúc chờ, lúc lo âu — biến thời gian vụn thành hạt giống tỉnh thức. Gặp việc khó, niệm trước khi phản ứng. Cuối ngày hồi hướng công đức cho ông bà, pháp giới chúng sinh.',
        ],
      },
    ],
    practiceTips: [
      'Chọn một khung giờ cố định (ví dụ sau khi đánh răng tối) để niệm không bị quên.',
      'Rằm, mùng 1: tăng số câu hoặc đến chùa dự khóa tụng.',
    ],
    relatedTools: [
      { href: '/go-mo', label: 'Gõ mõ tụng kinh' },
      { href: '/phong-thuy/kinh-tung-thuong-dung', label: 'Kinh A Di Đà · chú' },
    ],
  },
  {
    id: 'thien-chanh-niem',
    title: 'Thiền và chánh niệm',
    shortTitle: 'Thiền · chánh niệm',
    category: 'thuc_hanh',
    summary:
      'Tuệ giác bắt đầu từ sự tỉnh thức với thân và tâm ngay hiện tại — không chờ hoàn cảnh lý tưởng.',
    readingMinutes: 10,
    tags: ['thiền', 'chánh niệm', 'hơi thở', 'tứ niệm xứ'],
    keyPoints: [
      'Chánh niệm là biết rõ đang xảy ra gì — không lang thang, không đè nén.',
      'Thiền chỉ và thiền quán bổ trợ nhau.',
      'Người tại gia có thể thiền ngắn, đều, thật hơn là ngồi dài rồi bỏ.',
    ],
    sections: [
      {
        title: 'Chánh niệm không phải “đầu trống”',
        paragraphs: [
          'Nhiều người tưởng thiền là không còn suy nghĩ. Thực ra suy nghĩ vẫn có thể đến; việc của hành giả là nhận biết và không bị kéo dài theo câu chuyện. Hơi thở vào — biết vào; ra — biết ra. Khi nghĩ lung tung — biết “đang nghĩ”, rồi trở về.',
        ],
      },
      {
        title: 'Tứ niệm xứ (khung kinh điển)',
        paragraphs: [
          'Quán thân trên thân, quán thọ trên thọ, quán tâm trên tâm, quán pháp trên pháp. Đây là con đường Đức Phật nhấn mạnh để đoạn phiền não. Người mới thường bắt đầu từ thân (hơi thở, bước chân) vì dễ nhận.',
        ],
      },
      {
        title: 'Kết hợp với niệm Phật',
        paragraphs: [
          'Niệm Phật cũng là một dạng nhiếp tâm — danh hiệu làm đề mục. Không cần phân biệt “bên thiền hay bên tịnh” một cách đối kháng. Nhiều đạo tràng vừa tụng kinh, vừa ngồi im lặng, vừa đi kinh hành.',
        ],
      },
    ],
    practiceTips: [
      'Bắt đầu 5–10 phút/ngày, cùng một chỗ ngồi nếu được.',
      'Mang chánh niệm vào việc rửa chén, xếp xe — vài hơi thở tỉnh táo.',
    ],
    relatedTools: [
      { href: '/phong-thuy/khoa-tu-an-cu', label: 'Khóa tu tại chùa' },
    ],
  },
  {
    id: 'sam-hoi',
    title: 'Sám hối',
    shortTitle: 'Sám hối',
    category: 'thuc_hanh',
    summary:
      'Nhìn nhận lỗi lầm, phát lộ trước Tam Bảo, quyết không tái phạm — rửa sạch tâm hối và mở đường thiện.',
    readingMinutes: 8,
    tags: ['sám hối', 'phát lộ', 'ăn năn', 'thanh tịnh'],
    keyPoints: [
      'Sám hối có đủ: nhận lỗi · ăn năn · lộ bày · quyết sửa.',
      'Không sám hối hình thức để “xí xóa” rồi cố ý tái phạm.',
      'Kết hợp giữ giới và làm thiện để sám hối có lực.',
    ],
    sections: [
      {
        title: 'Vì sao cần sám hối?',
        paragraphs: [
          'Che giấu lỗi làm tâm nặng, dễ tiếp tục sai. Sám hối chân thành làm mỏng nghiệp chướng, phục hồi lòng tự trọng lành mạnh và quan hệ với người bị hại. Trong đạo tràng, nghi thức sám hối (lễ hồng danh, sám Pháp Hoa…) giúp cộng đồng cùng thanh tịnh.',
        ],
      },
      {
        title: 'Cách sám đơn giản tại nhà',
        paragraphs: [
          'Thắp hương hoặc chỉ chắp tay trước bàn Phật. Nói rõ lỗi (không vòng vo). Nguyện không làm lại. Có thể tụng bài sám hoặc niệm Phật hồi hướng. Nếu lỗi liên quan người khác, tìm cách sửa sai hoặc xin lỗi phù hợp — không chỉ khấn suông.',
        ],
      },
    ],
    relatedTools: [
      { href: '/phong-thuy/van-khan-nghi-le', label: 'Văn khấn' },
      { href: '/phong-thuy/kinh-tung-thuong-dung', label: 'Kinh tụng' },
    ],
  },
  {
    id: 'hoi-huong',
    title: 'Hồi hướng công đức',
    shortTitle: 'Hồi hướng',
    category: 'thuc_hanh',
    summary:
      'Sau mỗi việc thiện hay khóa tu, nguyện đưa công đức về vô thượng Bồ đề và lợi lạc chúng sinh.',
    readingMinutes: 6,
    tags: ['hồi hướng', 'công đức', 'bố thí pháp'],
    keyPoints: [
      'Hồi hướng chống tâm keo: không giữ phước chỉ cho mình.',
      'Có thể hồi hướng cho ông bà, người bệnh, pháp giới chúng sinh.',
      'Hồi hướng kèm trí tuệ: nguyện thành Phật đạo để cứu khổ.',
    ],
    sections: [
      {
        title: 'Vì sao hồi hướng?',
        paragraphs: [
          'Công đức như giọt nước; đổ vào biển pháp giới thì không khô. Hồi hướng còn chuyển tâm bố thí — thấy mình và người cùng một dòng khổ vui. Nhiều nghi thức kết thúc bằng bài hồi hướng ngắn; nên học thuộc một bài để dùng sau khi niệm Phật, làm từ thiện, công quả.',
        ],
      },
      {
        title: 'Mẫu nguyện ngắn',
        paragraphs: [
          '“Nguyện đem công đức này, hướng về khắp tất cả, đệ tử và chúng sinh, đều trọn thành Phật đạo.” Có thể thêm tên người cụ thể cần cầu an · cầu siêu trước khi đọc câu chung.',
        ],
      },
    ],
    relatedTools: [
      { href: '/phong-thuy/kinh-tung-thuong-dung', label: 'Kinh tụng · hồi hướng' },
    ],
  },

  // ─── Bồ Tát đạo ─────────────────────────────────────────
  {
    id: 'tu-vo-luong-tam',
    title: 'Tứ vô lượng tâm',
    shortTitle: 'Tứ vô lượng',
    category: 'bo_tat',
    summary:
      'Từ · Bi · Hỷ · Xả — bốn tâm lượng lớn của người học hạnh Bồ Tát.',
    readingMinutes: 9,
    tags: ['từ bi', 'hỷ', 'xả', 'bồ tát', 'vô lượng'],
    keyPoints: [
      'Từ: muốn người được vui. Bi: muốn người hết khổ.',
      'Hỷ: vui với niềm vui chính đáng của người. Xả: tâm bình, không thiên vị.',
    ],
    sections: [
      {
        title: 'Bốn tâm',
        paragraphs: [
          'Từ (mettā) không phải chiều chuộng mù quáng — là mong phúc lạc chân chính. Bi (karuṇā) không phải thương hại cao giọng — là cảm nhận khổ và muốn giúp đúng cách. Hỷ (muditā) chữa bệnh ganh tị. Xả (upekkhā) giữ tâm không bị cuốn theo thương ghét thái quá, vẫn có trách nhiệm.',
        ],
      },
      {
        title: 'Tu tập hàng ngày',
        paragraphs: [
          'Bắt đầu với người mình thương, rồi người trung tính, rồi người khó chịu — từng bước. Khi không làm được với “kẻ thù”, trở lại hơi thở và tự nhắc: họ cũng đang bị tham sân si sai sử. Kết hợp bố thí, ái ngữ, lợi hành, đồng sự (tứ nhiếp pháp) để từ bi có tay chân.',
        ],
      },
    ],
    practiceTips: [
      'Mỗi sáng nguyện một câu: “Mong mọi người được an vui, hết khổ.”',
      'Khi thấy người khác thành công: chủ động chúc mừng trong lòng — luyện hỷ.',
    ],
  },
  {
    id: 'luc-do',
    title: 'Lục độ ba-la-mật',
    shortTitle: 'Lục độ',
    category: 'bo_tat',
    summary:
      'Sáu hạnh vượt bờ: bố thí · trì giới · nhẫn nhục · tinh tấn · thiền định · trí tuệ.',
    readingMinutes: 12,
    tags: ['lục độ', 'ba la mật', 'bồ tát hạnh'],
    keyPoints: [
      'Bố thí có tài thí · pháp thí · vô úy thí.',
      'Nhẫn không phải nhu nhược — là không để sân điều khiển.',
      'Tuệ là mắt; năm độ trước là chân tay.',
    ],
    sections: [
      {
        title: 'Sáu độ',
        paragraphs: ['Tóm lược từng hạnh:'],
        bullets: [
          'Bố thí — cho của, cho pháp, cho sự không sợ hãi.',
          'Trì giới — giữ ngăn ác, sống không hại.',
          'Nhẫn nhục — chịu nghịch cảnh và lời xấu mà không mất từ bi.',
          'Tinh tấn — nỗ lực bền trên đường thiện.',
          'Thiền định — tâm ổn định, không tán loạn.',
          'Trí tuệ — thấy duyên khởi, vô ngã, dẫn năm hạnh kia đúng hướng.',
        ],
      },
      {
        title: 'Ba-la-mật nghĩa là gì?',
        paragraphs: [
          'Ba-la-mật (pāramitā) là “đến bờ kia” — làm các hạnh không còn chấp ngã, chấp quả. Cùng một việc bố thí: nếu khoe và mong trả ơn thì là thiện hữu lậu; nếu buông tướng thì hướng tới ba-la-mật. Người mới đừng sợ chưa “đủ vô tướng” — cứ làm thiện và lần lần bớt chấp.',
        ],
      },
    ],
    practiceTips: [
      'Mỗi tháng chọn một độ để nhấn mạnh (ví dụ tháng này luyện ái ngữ = bố thí pháp nhỏ).',
    ],
  },
  {
    id: 'luc-hoa',
    title: 'Lục hòa',
    shortTitle: 'Lục hòa',
    category: 'bo_tat',
    summary:
      'Sáu nguyên tắc sống hòa hợp trong chúng: từ thân đến kiến giải — nền tảng đạo tràng mạnh.',
    readingMinutes: 7,
    tags: ['lục hòa', 'đạo tràng', 'hòa hợp', 'tăng già'],
    keyPoints: [
      'Thân hòa đồng trụ · Khẩu hòa vô tranh · Ý hòa đồng duyệt.',
      'Giới hòa đồng tu · Kiến hòa đồng giải · Lợi hòa đồng quân.',
    ],
    sections: [
      {
        title: 'Sáu hòa',
        paragraphs: [
          'Thân hòa: sống chung không gây gỗ, tôn trọng không gian chung. Khẩu hòa: không tranh cãi độc địa, không nói xấu sau lưng. Ý hòa: vui vẻ cùng mục đích tu. Giới hòa: cùng giữ quy ước đạo tràng. Kiến hòa: bàn pháp với tinh thần học hỏi, không kết bè. Lợi hòa: phân phối lợi dưỡng công bằng, không chiếm.',
        ],
      },
      {
        title: 'Áp dụng nhóm Phật tử',
        paragraphs: [
          'Trong ban hộ tự, nhóm công quả, lớp học Phật pháp — lục hòa là thước đo. Khi có bất đồng, đặt câu hỏi: mình đang bảo vệ pháp hay bảo vệ cái tôi? Hòa không có nghĩa giả tạo đồng ý mọi thứ; hòa là cách tranh luận và quyết định không hủy diệt nhau.',
        ],
      },
    ],
  },

  // ─── Đời sống cư sĩ ─────────────────────────────────────
  {
    id: 'bao-hieu',
    title: 'Báo hiếu trong đạo Phật',
    shortTitle: 'Báo hiếu',
    category: 'cu_si',
    summary:
      'Hiếu không chỉ phụng dưỡng vật chất — còn dẫn thân bằng pháp, cứu khổ lâu dài theo tinh thần Vu Lan · Địa Tạng.',
    readingMinutes: 9,
    tags: ['báo hiếu', 'vu lan', 'địa tạng', 'cha mẹ'],
    keyPoints: [
      'Phụng dưỡng khi còn sống quý hơn chỉ cúng khi đã mất.',
      'Khuyến tấn cha mẹ hướng thiện / niệm Phật là đại hiếu.',
      'Vu Lan và trì Địa Tạng là duyên lớn để nhớ ân.',
    ],
    sections: [
      {
        title: 'Hiếu theo tinh thần Phật pháp',
        paragraphs: [
          'Kinh điển kể nhân duyên Mục Kiền Liên cứu mẹ — nguồn lễ Vu Lan. Báo hiếu gồm: nuôi dưỡng, kính trọng, không để cha mẹ tạo nghiệp nặng vì mình, và giúp họ gieo duyên Chánh pháp. Nếu cha mẹ đã mất, làm thiện hồi hướng, trì kinh cầu siêu — tiếp nối ân nghĩa.',
        ],
      },
      {
        title: 'Việc có thể làm',
        paragraphs: [
          'Thăm hỏi thường xuyên, chăm sóc sức khỏe, lắng nghe. Mời đi chùa khi họ vui lòng — không cưỡng. Ăn chay kỳ, phóng sinh, cúng dường nhân ngày giỗ hoặc rằm tháng Bảy. Tự giữ giới để cha mẹ khỏi lo và khỏi mang tiếng.',
        ],
      },
    ],
    relatedTools: [
      { href: '/phong-thuy/tra-cuu-kinh', label: 'Kinh Vu Lan · Địa Tạng' },
      { href: '/phong-thuy/van-khan-nghi-le', label: 'Văn khấn cầu siêu · báo hiếu' },
    ],
  },
  {
    id: 'an-chay-phong-sinh',
    title: 'Ăn chay và phóng sinh',
    shortTitle: 'Ăn chay · phóng sinh',
    category: 'cu_si',
    summary:
      'Hai hạnh phổ biến nuôi tâm từ bi: giảm sát hại và trả tự do cho chúng sinh bị nhốt.',
    readingMinutes: 8,
    tags: ['ăn chay', 'phóng sinh', 'từ bi', 'bất sát'],
    keyPoints: [
      'Ăn chay là phương tiện — gốc là tâm không muốn hại.',
      'Phóng sinh cần đúng cách: đúng loài, đúng môi trường, không tạo nghiệp khác.',
    ],
    sections: [
      {
        title: 'Ăn chay',
        paragraphs: [
          'Nhiều Phật tử ăn chay kỳ (ngày vía, rằm, mùng 1) rồi tiến tới trường chay. Không nên biến ăn chay thành kiêu ngạo hay chỉ trích người khác. Nếu sức khỏe cần linh hoạt, giữ tinh thần bất sát và giảm dần — hỏi bác sĩ khi cần.',
        ],
      },
      {
        title: 'Phóng sinh đúng pháp',
        paragraphs: [
          'Chọn loài phù hợp môi trường địa phương; tránh mua rồi vô tình khuyến khích săn bắt thêm nếu không khéo. Nên tham gia phóng sinh do chùa tổ chức có hướng dẫn. Trước khi thả, niệm Phật / chú, phát nguyện chúng sinh được sống và kết duyên Chánh pháp. Có thể “phóng sinh” theo nghĩa rộng: bảo vệ môi trường, không hành hạ thú nuôi, hỗ trợ cứu hộ.',
        ],
      },
    ],
  },
  {
    id: 'vao-chua-oai-nghi',
    title: 'Oai nghi khi vào chùa',
    shortTitle: 'Oai nghi vào chùa',
    category: 'cu_si',
    summary:
      'Cách đi đứng, ăn mặc, lễ lạy và ứng xử giúp giữ trang nghiêm đạo tràng — tu tập ngay từ cửa chùa.',
    readingMinutes: 7,
    tags: ['oai nghi', 'vào chùa', 'lễ Phật', 'đạo tràng'],
    keyPoints: [
      'Trang phục gọn gàng, màu trầm; tắt chuông điện thoại.',
      'Không chỉ trỏ tượng Phật, không nằm ngồi bất chính trong chính điện.',
      'Hỏi ban hộ tự khi chưa rõ nghi thức.',
    ],
    sections: [
      {
        title: 'Trước khi vào chính điện',
        paragraphs: [
          'Ăn mặc kín đáo. Để giày dép đúng nơi. Tắt hoặc im nguồn điện thoại. Giữ tiếng nói nhỏ. Không mang đồ ăn tạp vào điện thờ trừ khi nhà chùa cho phép trong lễ.',
        ],
      },
      {
        title: 'Lễ Phật',
        paragraphs: [
          'Chắp tay ngang ngực, tâm thành kính. Lạy theo nhịp chung nếu đang có khóa lễ. Không chen lấn chỗ lạy. Sau khi lễ, có thể ngồi bên nghe kinh hoặc ra sân công quả — tránh đứng chụp ảnh ồn ào trước bàn thờ.',
        ],
      },
      {
        title: 'Với Tăng Ni và Phật tử khác',
        paragraphs: [
          'Xá chào cung kính. Không kéo ghế nói chuyện thế tục ồn trong khu vực thanh tịnh. Trẻ em cần người lớn hướng dẫn. Công quả thì nghe phân công, làm hết việc rồi mới nghỉ.',
        ],
      },
    ],
    relatedTools: [
      { href: '/phong-thuy/van-khan-nghi-le', label: 'Văn khấn · nghi lễ' },
      { href: '/dang-ky-phat-tu', label: 'Ghi danh Phật tử' },
    ],
  },
  {
    id: 'lo-trinh-tu-hoc',
    title: 'Lộ trình tu học gợi ý',
    shortTitle: 'Lộ trình tu học',
    category: 'cu_si',
    summary:
      'Gợi ý thứ tự học và thực hành cho người mới — từ quy y, giữ giới đến nghe pháp và pháp môn chính.',
    readingMinutes: 8,
    tags: ['lộ trình', 'người mới', 'tu học', 'phật tử'],
    keyPoints: [
      'Nền: hiểu Tam Bảo · Tứ Đế · ngũ giới.',
      'Ngày: một pháp môn chính (niệm Phật hoặc thiền) + thiện nhỏ.',
      'Tuần / tháng: đến chùa, nghe pháp, đọc thêm một bài giáo lý.',
    ],
    sections: [
      {
        title: 'Ba tháng đầu',
        paragraphs: [
          'Đọc các bài Nhập môn và Cốt lõi trong mục này. Tập niệm Phật hoặc thở chánh niệm 10 phút/ngày. Giữ ít nhất không nói dối hại người và giảm sát hại. Đến chùa một lần vào rằm hoặc ngày vía.',
        ],
      },
      {
        title: 'Sáu tháng đến một năm',
        paragraphs: [
          'Quy y nếu chưa. Thọ ngũ giới khi sẵn sàng. Chọn pháp môn chính và bám trụ — đừng đổi môn liên tục. Đọc thêm Kinh A Di Đà / Phổ Môn / bài sám ngắn. Tham gia một khóa tu ngắn hoặc lớp Phật học gia đình nếu chùa có.',
        ],
      },
      {
        title: 'Lâu dài',
        paragraphs: [
          'Mở rộng lục độ trong đời sống (gia đình, nghề nghiệp). Học thêm nhân duyên, ngũ uẩn khi đã quen nền. Gieo duyên cho người thân bằng thái độ dịu dàng hơn là áp đặt. Nhớ: tiến bộ đo bằng tâm tham sân có mỏng hơn không — không đo bằng số khóa đã dự.',
        ],
      },
    ],
    practiceTips: [
      'Đánh dấu các bài đã đọc trong mục Giáo lý căn bản và ôn lại sau 30 ngày.',
      'Kết hợp sổ cầu an / ghi danh Phật tử để nhà chùa đồng hành.',
    ],
    relatedTools: [
      { href: '/phong-thuy/tra-cuu-kinh', label: 'Tra cứu kinh sách' },
      { href: '/phong-thuy/khoa-tu-an-cu', label: 'Khóa tu · an cư' },
      { href: '/go-mo', label: 'Gõ mõ · niệm Phật' },
    ],
  },
];

export function getGiaoLyLesson(id: string): GiaoLyLesson | undefined {
  return GIAO_LY_LESSONS.find((l) => l.id === id);
}

function normalize(text: string): string {
  return text
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .trim();
}

export function searchGiaoLyLessons(
  query: string,
  category: GiaoLyCategory | 'all' = 'all',
): GiaoLyLesson[] {
  const q = normalize(query);
  return GIAO_LY_LESSONS.filter((lesson) => {
    if (category !== 'all' && lesson.category !== category) return false;
    if (!q) return true;
    const haystack = normalize(
      [
        lesson.title,
        lesson.shortTitle,
        lesson.summary,
        ...lesson.tags,
        ...(lesson.keyPoints ?? []),
        ...lesson.sections.flatMap((s) => [
          s.title ?? '',
          ...s.paragraphs,
          ...(s.bullets ?? []),
        ]),
      ].join(' '),
    );
    return haystack.includes(q);
  });
}
