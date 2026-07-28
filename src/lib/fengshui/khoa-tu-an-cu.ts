/**
 * Nội dung giới thiệu khóa tu · an cư — khung chung cho mọi chùa.
 * Lịch cụ thể lấy từ temple_events (event_type = khoa_tu).
 */

export interface KhoaTuSection {
  title: string;
  body: string;
}

export const KHOA_TU_INTRO =
  'Khóa tu và an cư là thời gian Phật tử cùng Tăng Ni sống chậm lại: nghe pháp, tụng kinh, thiền tập và làm công quả — nuôi dưỡng tâm từ bi giữa đời sống thường nhật.';

export const KHOA_TU_SECTIONS: KhoaTuSection[] = [
  {
    title: 'An cư kiết hạ',
    body: 'Theo truyền thống Phật giáo, chư Tăng Ni an cư ba tháng mùa mưa (thường từ 16 tháng 4 đến 15 tháng 7 âm lịch). Trong thời gian này, các vị hạn chế đi xa, chuyên tâm tu học và hướng dẫn Phật tử. Nhiều chùa mở cửa cho cư sĩ tham dự một phần khóa tu hoặc các buổi pháp thoại trong mùa an cư.',
  },
  {
    title: 'Khóa tu ngắn hạn',
    body: 'Ngoài an cư dài ngày, nhà chùa thường tổ chức khóa tu một ngày, cuối tuần hoặc vài ngày liên tiếp — phù hợp Phật tử bận việc. Nội dung thường gồm: lễ Phật, trì chú / niệm Phật, nghe pháp thoại, thực hành chánh niệm và chia sẻ công quả tại chùa.',
  },
  {
    title: 'Ai có thể tham dự?',
    body: 'Mọi người thiện tâm đều có thể ghi danh khi nhà chùa mở khóa. Không cần đã quy y; chỉ cần giữ oai nghi trang nghiêm, tuân theo thời khóa và hướng dẫn của Tăng Ni. Trẻ em hoặc người lớn tuổi nên báo trước để nhà chùa sắp xếp chỗ nghỉ và hỗ trợ phù hợp.',
  },
  {
    title: 'Chuẩn bị khi đi tu',
    body: 'Mang theo trang phục giản dị, tối màu; đồ vệ sinh cá nhân; kinh sách nếu đã quen dùng. Nên đến đúng giờ khai khóa, tắt chuông điện thoại trong chính điện, và hỏi trụ trì nếu có nguyện vọng đặc biệt (ăn chay trường, nghỉ qua đêm, công quả…).',
  },
];

export const KHOA_TU_FOOTNOTE =
  'Lịch khóa tu cụ thể do từng chùa công bố. Quý vị theo dõi mục hoạt động hoặc ghi danh Phật tử để nhận tin sớm nhất.';
