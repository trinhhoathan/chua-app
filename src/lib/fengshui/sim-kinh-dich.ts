/**
 * Sim Kinh Dịch — lập quẻ cho số điện thoại theo Mai Hoa Dịch Số:
 * cộng nửa đầu chia 8 → Thượng quái, cộng nửa cuối chia 8 → Hạ quái
 * (dư 0 tính là 8, tra Tiên thiên bát quái), tổng chia 6 → hào động.
 * Kèm bộ luận giải 64 quẻ viết riêng cho ngữ cảnh chọn sim.
 */

import { formatPhone, parsePhoneDigits } from './boi-sim';
import {
  binaryFromTrigrams,
  changeLineBinary,
  mutualBinary,
  trigramFromMaiHoaNum,
} from './mai-hoa-dich-so';
import {
  getHexagram,
  getHexagramByBinary,
  type Hexagram,
  type Trigram,
  type TrigramId,
} from './kinh-dich-64';

/** Ký hiệu Unicode ☰–☷ của 8 quẻ đơn */
export const TRIGRAM_UNICODE: Record<TrigramId, string> = {
  can: '☰',
  doai: '☱',
  ly: '☲',
  chan: '☳',
  ton: '☴',
  kham: '☵',
  gen: '☶',
  khon: '☷',
};

/* ------------------------------------------------------------------ */
/* Mức cát / hung của quẻ trong ngữ cảnh sim                           */
/* ------------------------------------------------------------------ */

export type QueRank = 'dai_cat' | 'cat' | 'binh' | 'can_nhac';

export const QUE_RANK_META: Record<
  QueRank,
  { label: string; color: string; bg: string }
> = {
  dai_cat: { label: 'Đại cát', color: '#0E7A5F', bg: '#0E7A5F14' },
  cat: { label: 'Cát', color: '#1B6B3A', bg: '#1B6B3A12' },
  binh: { label: 'Bình hòa', color: '#B08D42', bg: '#B08D4214' },
  can_nhac: { label: 'Cần cân nhắc', color: '#C2701E', bg: '#C2701E14' },
};

export interface SimQueInterpretation {
  rank: QueRank;
  /** Quẻ này nghĩa là gì — diễn giải bình dân */
  yNghia: string;
  /** Hợp cho ai / việc gì */
  phuHop: string;
  /** Dùng sim mang quẻ này được trợ lực gì */
  mangLai: string;
  /** Tác động tới người dùng sim */
  tacDong: string;
  /** Điểm cần lưu ý (nếu quẻ có mặt hạn chế) */
  luuY?: string;
}

/** Luận giải 64 quẻ dành riêng cho người dùng sim (khóa = số quẻ Văn Vương). */
export const SIM_QUE_INTERPRETATIONS: Record<number, SimQueInterpretation> = {
  1: {
    rank: 'dai_cat',
    yNghia: 'Thuần Càn là quẻ Trời — sức sáng tạo mạnh mẽ, tự cường không nghỉ, đứng đầu 64 quẻ.',
    phuHop: 'Người lãnh đạo, chủ doanh nghiệp, người khởi nghiệp cần khí thế tiên phong.',
    mangLai: 'Uy quyền, sự quyết đoán và vận trình hanh thông khi giữ chính đạo.',
    tacDong: 'Thúc đẩy chủ sim chủ động vươn lên, nói có người nghe, dễ được nể trọng.',
    luuY: 'Khí dương quá thịnh — tránh cứng nhắc, độc đoán kẻo "kháng long hữu hối".',
  },
  2: {
    rank: 'cat',
    yNghia: 'Thuần Khôn là quẻ Đất — bao dung, tiếp nhận và nuôi dưỡng vạn vật.',
    phuHop: 'Người làm hậu cần, giáo dục, chăm sóc, bất động sản, nông nghiệp.',
    mangLai: 'Sự bền bỉ, khả năng tích lũy và quý nhân âm thầm nâng đỡ.',
    tacDong: 'Giúp chủ sim nhẫn nại, làm việc có nền tảng, đi sau mà về đích chắc.',
    luuY: 'Thiên về thủ — khi cần cạnh tranh gấp phải chủ động hơn.',
  },
  3: {
    rank: 'can_nhac',
    yNghia: 'Thủy Lôi Truân — khởi đầu gian nan như mầm cây đội đất mà lên.',
    phuHop: 'Người mới lập nghiệp chấp nhận đường dài, không ngại vất vả buổi đầu.',
    mangLai: 'Bài học kiên trì; thành quả đến muộn nhưng chắc chắn.',
    tacDong: 'Giai đoạn đầu dùng sim dễ vất vả, nên tìm người dẫn dắt.',
    luuY: 'Không hợp người cần tài lộc nhanh, muốn "vào là trúng".',
  },
  4: {
    rank: 'binh',
    yNghia: 'Sơn Thủy Mông — khai sáng trí tuệ, như trẻ nhỏ cầu thầy học đạo.',
    phuHop: 'Học sinh sinh viên, người theo nghiệp học thuật, người mới vào nghề.',
    mangLai: 'Duyên gặp thầy gặp bạn, trí tuệ ngày một mở mang.',
    tacDong: 'Nhắc chủ sim khiêm tốn học hỏi thì đường đi mới sáng.',
    luuY: 'Chưa hợp việc đầu tư lớn, quyết định trọng đại một mình.',
  },
  5: {
    rank: 'binh',
    yNghia: 'Thủy Thiên Nhu — chờ đợi đúng thời, mây trên trời tất có mưa.',
    phuHop: 'Người làm việc dài hạn, đầu tư giá trị, không chạy theo sóng ngắn.',
    mangLai: 'Sự điềm tĩnh chờ đúng cơ hội; có ăn có lộc khi thời đến.',
    tacDong: 'Vận đến chậm mà chắc, càng vững tâm càng hưởng trọn.',
    luuY: 'Kỵ nóng vội — hành động trước thời dễ hỏng việc.',
  },
  6: {
    rank: 'can_nhac',
    yNghia: 'Thiên Thủy Tụng — tranh chấp, kiện tụng, trời với nước ngược đường nhau.',
    phuHop: 'Người làm pháp lý, trọng tài — nghề sống giữa các tranh chấp.',
    mangLai: 'Sự cảnh giác trước thị phi, biết dừng tranh cãi đúng lúc.',
    tacDong: 'Dễ vướng khẩu thiệt, giấy tờ, hợp đồng — mọi thứ phải rõ ràng.',
    luuY: 'Người làm ăn buôn bán nên cân nhắc; tránh theo đuổi kiện tụng.',
  },
  7: {
    rank: 'binh',
    yNghia: 'Địa Thủy Sư — quân đội có kỷ luật, xuất quân phải chính danh.',
    phuHop: 'Quản lý đội nhóm, quân đội, công an, người điều hành tổ chức.',
    mangLai: 'Uy lãnh đạo, khả năng tổ chức kỷ cương, thắng nhờ chiến lược.',
    tacDong: 'Giúp chủ sim làm việc bài bản, dẫn dắt được người dưới.',
    luuY: 'Phải chính danh, thưởng phạt phân minh — lạm quyền tất bại.',
  },
  8: {
    rank: 'cat',
    yNghia: 'Thủy Địa Tỷ — nước thấm vào đất, thân hỗ đoàn kết, người theo về.',
    phuHop: 'Người làm cộng đồng, xây dựng đối tác, kinh doanh hệ thống — chuỗi.',
    mangLai: 'Quý nhân và đồng minh; đi đâu cũng có người nâng đỡ.',
    tacDong: 'Quan hệ ngày càng rộng, được tin cậy và ủng hộ.',
  },
  9: {
    rank: 'binh',
    yNghia: 'Phong Thiên Tiểu Súc — tích lũy nhỏ, mây dày chưa mưa.',
    phuHop: 'Người làm công ăn lương, tiết kiệm dài hạn, gây dựng từng chút.',
    mangLai: 'Của ăn của để tăng dần, nền nếp chi tiêu chừng mực.',
    tacDong: 'Chưa bung lớn được ngay nhưng tích tiểu thành đại rất bền.',
    luuY: 'Chưa đến thời làm việc lớn — đừng vay lớn, đánh lớn.',
  },
  10: {
    rank: 'binh',
    yNghia: 'Thiên Trạch Lý — đi sau đuôi hổ mà không bị cắn, nhờ giữ lễ và cẩn trọng.',
    phuHop: 'Người làm việc với đối tác lớn, môi trường quyền lực hoặc rủi ro cao.',
    mangLai: 'Sự an toàn nhờ đúng mực; càng lễ độ càng được việc.',
    tacDong: 'Rèn cho chủ sim sự chỉn chu, biết tiến lui đúng phép.',
    luuY: 'Mạo hiểm khi chưa chuẩn bị kỹ rất dễ gặp họa.',
  },
  11: {
    rank: 'dai_cat',
    yNghia: 'Địa Thiên Thái — trời đất giao hòa, "nhỏ đi lớn đến", quẻ thông thái bậc nhất.',
    phuHop: 'Hầu hết mọi người, đặc biệt người cầu kinh doanh thuận lợi, gia đạo êm ấm.',
    mangLai: 'Hanh thông toàn diện: trên dưới thuận hòa, tài lộc tự tìm đến.',
    tacDong: 'Vận trình êm ả, việc khó hóa dễ, người khó hóa dễ chịu.',
    luuY: 'Thịnh cực phòng suy — đang thuận vẫn phải giữ khiêm.',
  },
  12: {
    rank: 'can_nhac',
    yNghia: 'Thiên Địa Bĩ — bế tắc, trời đất không giao nhau, đường đi tạm nghẽn.',
    phuHop: 'Người đang giai đoạn tu dưỡng, thu mình chờ thời.',
    mangLai: 'Sự cảnh tỉnh: biết giữ tiết tháo, không xu phụ theo cái xấu.',
    tacDong: 'Công việc dễ trì trệ, cần kiên nhẫn đợi vận mở.',
    luuY: 'Cầu tài lộc, cầu tiến nhanh nên chọn số mang quẻ khác.',
  },
  13: {
    rank: 'cat',
    yNghia: 'Thiên Hỏa Đồng Nhân — đồng tâm hiệp lực, lửa bốc lên hợp với trời.',
    phuHop: 'Người làm việc nhóm, hợp tác liên kết, xây cộng đồng, xây thương hiệu.',
    mangLai: 'Bạn bè đối tác cùng chí hướng, việc chung dễ thành.',
    tacDong: 'Mở rộng mạng lưới, được lòng người, đi xa nhờ đi cùng nhau.',
  },
  14: {
    rank: 'dai_cat',
    yNghia: 'Hỏa Thiên Đại Hữu — sở hữu lớn, mặt trời giữa trời soi khắp, thịnh vượng.',
    phuHop: 'Doanh nhân, người cầu tài lộc lớn và công danh rạng rỡ.',
    mangLai: 'Tài sản sung túc, danh tiếng, khí độ của người "có lớn".',
    tacDong: 'Hút cơ hội lớn, dễ gặt thành công rực rỡ khi hành xử quang minh.',
    luuY: 'Giàu mà kiêu thì tổn phúc — càng có càng phải khiêm hậu.',
  },
  15: {
    rank: 'cat',
    yNghia: 'Địa Sơn Khiêm — núi cao nép mình trong đất, khiêm nhường mà hanh thông.',
    phuHop: 'Người làm nghề trọng uy tín, dịch vụ, lãnh đạo kiểu mềm mỏng.',
    mangLai: 'Được quý mến rộng khắp; đường dài bền vững, ít kẻ ganh ghét.',
    tacDong: 'Càng nhún nhường càng được người nâng lên — quẻ hiếm hoi cả 6 hào đều tốt.',
  },
  16: {
    rank: 'cat',
    yNghia: 'Lôi Địa Dự — niềm vui có chuẩn bị, sấm ra khỏi đất vang lừng.',
    phuHop: 'Người làm nghệ thuật, giải trí, truyền thông, tổ chức sự kiện.',
    mangLai: 'Hứng khởi, cảm hứng sáng tạo và người hưởng ứng đông đảo.',
    tacDong: 'Tinh thần lạc quan kéo vận may; làm gì cũng có người cổ vũ.',
    luuY: 'Tránh vui quá đà mà lơi là công việc chính.',
  },
  17: {
    rank: 'cat',
    yNghia: 'Trạch Lôi Tùy — thuận theo thời thế, sấm nấp trong đầm nghỉ đông dưỡng sức.',
    phuHop: 'Người kinh doanh linh hoạt, làm sales, người thích ứng nhanh.',
    mangLai: 'Gặp thời gặp người, thuận nước đẩy thuyền.',
    tacDong: 'Biết nương theo xu hướng mà tiến, ít khi lỡ nhịp thị trường.',
  },
  18: {
    rank: 'can_nhac',
    yNghia: 'Sơn Phong Cổ — sửa chữa việc đổ nát, chấn hưng lại từ gốc.',
    phuHop: 'Người chuyên tái cấu trúc, sửa chữa, cải tổ cơ nghiệp cũ.',
    mangLai: 'Cơ hội gây dựng lại từ nền tảng có sẵn.',
    tacDong: 'Phải xử lý tồn đọng trước rồi mới phát triển được.',
    luuY: 'Giai đoạn đầu khá vất vả — cần quyết tâm sửa tận gốc.',
  },
  19: {
    rank: 'cat',
    yNghia: 'Địa Trạch Lâm — đức lớn đang tới gần, khí dương đang lớn dần.',
    phuHop: 'Người quản lý, giáo viên, người đang trên đà thăng tiến.',
    mangLai: 'Vận thịnh đang lên, uy tín ngày một tăng.',
    tacDong: 'Dễ được cấp trên chú ý, thời cơ liên tục mở ra.',
  },
  20: {
    rank: 'binh',
    yNghia: 'Phong Địa Quan — quan sát và chiêm nghiệm, gió thổi trên đất xem khắp muôn phương.',
    phuHop: 'Người làm nghiên cứu, tư vấn, phân tích, công việc tâm linh.',
    mangLai: 'Tầm nhìn xa và sự tôn kính từ người xung quanh.',
    tacDong: 'Nhìn xa thấy rộng, cân nhắc kỹ rồi mới hành động.',
  },
  21: {
    rank: 'binh',
    yNghia: 'Hỏa Lôi Phệ Hạp — cắn vỡ vật cản, phân minh phải trái.',
    phuHop: 'Người làm pháp lý, kiểm định, thu hồi công nợ, đàm phán khó.',
    mangLai: 'Sức quyết đoán để vượt trở ngại, gỡ nút thắt.',
    tacDong: 'Xử lý được việc khó nhưng phải dứt khoát, không nửa vời.',
    luuY: 'Dễ va chạm — cứng rắn đủ dùng, còn lại nên mềm mỏng.',
  },
  22: {
    rank: 'binh',
    yNghia: 'Sơn Hỏa Bí — vẻ đẹp trang sức, lửa chiếu chân núi lung linh.',
    phuHop: 'Người làm thẩm mỹ, thiết kế, thời trang, xây dựng hình ảnh cá nhân.',
    mangLai: 'Hình ảnh đẹp, dễ chiếm thiện cảm ngay lần đầu.',
    tacDong: 'Chú trọng cả hình thức lẫn nội dung, việc nhỏ hanh thông.',
    luuY: 'Đẹp ngoài phải có thực chất — văn sức chỉ nên vừa mức.',
  },
  23: {
    rank: 'can_nhac',
    yNghia: 'Sơn Địa Bác — bóc tách, suy tàn; âm thịnh dương suy, núi lở dần.',
    phuHop: 'Giai đoạn cần thu hẹp, thanh lọc, cắt bỏ cái đã hỏng.',
    mangLai: 'Sự tỉnh táo biết dừng đúng lúc để bảo toàn lực lượng.',
    tacDong: 'Nên thủ không nên công; giữ được là thắng.',
    luuY: 'Cầu tài, cầu tiến nên chọn số mang quẻ khác.',
  },
  24: {
    rank: 'cat',
    yNghia: 'Địa Lôi Phục — một hào dương trở lại, mặt trời mọc sau đêm dài.',
    phuHop: 'Người làm lại từ đầu, phục hồi sau giai đoạn khó khăn.',
    mangLai: 'Sức sống mới, cơ hội tái khởi động đầy hy vọng.',
    tacDong: 'Vận trình đi lên từ đáy, mỗi ngày một sáng hơn.',
  },
  25: {
    rank: 'binh',
    yNghia: 'Thiên Lôi Vô Vọng — chân thật không vọng cầu, thuận theo lẽ trời.',
    phuHop: 'Người trọng chữ tín, làm ăn chính đạo, ghét mánh khóe.',
    mangLai: 'Bình an và phúc lành nhờ sự ngay thẳng.',
    tacDong: 'Thuận tự nhiên thì mọi việc tốt; cưỡng cầu ắt hỏng.',
    luuY: 'Tránh đầu cơ, việc trái lương tâm — quẻ này phạt rất nặng sự gian dối.',
  },
  26: {
    rank: 'dai_cat',
    yNghia: 'Sơn Thiên Đại Súc — tích chứa lớn, trời nằm trong núi, kho đức kho tài dày.',
    phuHop: 'Người đầu tư dài hạn, tích lũy tài sản, theo đuổi học vấn cao.',
    mangLai: 'Nền tảng tài chính và tri thức vững chắc, càng để lâu càng quý.',
    tacDong: 'Càng tích càng mạnh; phát về sau rất lớn và bền.',
  },
  27: {
    rank: 'binh',
    yNghia: 'Sơn Lôi Di — nuôi dưỡng thân tâm, cái miệng nuôi người mà cũng hại người.',
    phuHop: 'Người làm y tế, ẩm thực, giáo dục, chăm sóc sức khỏe.',
    mangLai: 'Nguồn nuôi thân ổn định, phúc từ việc nuôi người khác.',
    tacDong: 'Nhắc chủ sim giữ lời ăn tiếng nói và ăn uống điều độ.',
  },
  28: {
    rank: 'can_nhac',
    yNghia: 'Trạch Phong Đại Quá — gánh nặng quá mức, xà nhà cong vì quá tải.',
    phuHop: 'Người bản lĩnh phi thường, dám gánh việc lớn ít ai dám nhận.',
    mangLai: 'Cơ hội lớn khác thường — đi kèm áp lực lớn tương xứng.',
    tacDong: 'Dễ ôm việc quá sức mình; thành thì rực rỡ, bại thì nặng nề.',
    luuY: 'Cần chỗ dựa thật vững; không hợp người ưa an toàn, cầu bình ổn.',
  },
  29: {
    rank: 'can_nhac',
    yNghia: 'Thuần Khảm — hiểm nguy trùng điệp, nước sâu lớp lớp.',
    phuHop: 'Nghề mạo hiểm đòi hỏi chuyên môn cao, người quen "sống trong hiểm".',
    mangLai: 'Bản lĩnh vượt hiểm và lòng thành tín làm chỗ dựa.',
    tacDong: 'Thử thách nối tiếp tôi luyện ý chí — vượt được thì rất cứng cáp.',
    luuY: 'Người cầu bình an, sức khỏe nên chọn số mang quẻ khác.',
  },
  30: {
    rank: 'cat',
    yNghia: 'Thuần Ly — lửa sáng liên tục, văn minh rực rỡ, sáng và bám vào chính đạo.',
    phuHop: 'Người làm truyền thông, nghệ thuật, giáo dục, công nghệ, cần danh tiếng.',
    mangLai: 'Trí tuệ sáng suốt, danh tiếng lan xa.',
    tacDong: 'Chủ sim dễ nổi bật, được chú ý giữa đám đông.',
    luuY: 'Lửa cần giữ điềm đạm — tránh bốc đồng, sớm nắng chiều mưa.',
  },
  31: {
    rank: 'cat',
    yNghia: 'Trạch Sơn Hàm — cảm ứng giao hòa, hồ nước trên núi thấm xuống, trai gái cảm nhau.',
    phuHop: 'Người cầu tình duyên, làm ngoại giao, dịch vụ khách hàng.',
    mangLai: 'Duyên lành, thiện cảm và những kết nối chân thành.',
    tacDong: 'Dễ gần người và người cũng dễ mến mình — quẻ đẹp cho nhân duyên.',
  },
  32: {
    rank: 'cat',
    yNghia: 'Lôi Phong Hằng — bền lâu không đổi, sấm gió song hành mà thành nếp.',
    phuHop: 'Người cầu hôn nhân bền vững, nghề nghiệp ổn định, thương hiệu lâu năm.',
    mangLai: 'Sự bền bỉ, thủy chung, thành quả giữ được lâu dài.',
    tacDong: 'Cuộc sống ít biến động, đường dài càng đi càng vững.',
  },
  33: {
    rank: 'can_nhac',
    yNghia: 'Thiên Sơn Độn — lui về ẩn dật đúng lúc để bảo toàn.',
    phuHop: 'Người muốn sống kín tiếng, nghỉ ngơi, tu dưỡng một giai đoạn.',
    mangLai: 'Sự an toàn nhờ biết lui, tránh được thị phi.',
    tacDong: 'Thiên về rút lui giữ mình — không hợp giai đoạn cần bung sức.',
    luuY: 'Người đang cầu công danh, tài lộc nên cân nhắc.',
  },
  34: {
    rank: 'cat',
    yNghia: 'Lôi Thiên Đại Tráng — sức mạnh lớn, sấm vang trên trời khí thế bừng bừng.',
    phuHop: 'Người làm thể thao, xây dựng, kinh doanh cần khí thế tấn công.',
    mangLai: 'Sức bật, dũng khí, dám nghĩ dám làm.',
    tacDong: 'Tiến công mạnh mẽ, tạo đà bứt phá trong sự nghiệp.',
    luuY: 'Mạnh phải đúng lễ — tránh hữu dũng vô mưu, húc bừa như dê húc giậu.',
  },
  35: {
    rank: 'dai_cat',
    yNghia: 'Hỏa Địa Tấn — tiến lên như mặt trời mọc trên mặt đất, càng lúc càng sáng.',
    phuHop: 'Người cầu thăng chức, thăng tiến, mở rộng sự nghiệp.',
    mangLai: 'Bước tiến rõ rệt, được cấp trên trọng dụng.',
    tacDong: 'Vận trình đi lên liên tục, công danh rộng mở.',
  },
  36: {
    rank: 'can_nhac',
    yNghia: 'Địa Hỏa Minh Di — ánh sáng bị che khuất, mặt trời lặn vào lòng đất.',
    phuHop: 'Người làm việc thầm lặng, hậu trường, cần ẩn mình giữ chính.',
    mangLai: 'Khả năng nhẫn nhịn, giấu tài chờ thời trong nghịch cảnh.',
    tacDong: 'Tài năng khó bộc lộ ngay, dễ bị hiểu lầm — cần thời gian chứng minh.',
    luuY: 'Cần môi trường phù hợp mới phát huy; cầu danh tiếng nên cân nhắc.',
  },
  37: {
    rank: 'cat',
    yNghia: 'Phong Hỏa Gia Nhân — người trong nhà, gió từ lửa ấm mà ra, tề gia rồi mới trị quốc.',
    phuHop: 'Người coi trọng gia đạo, kinh doanh hộ gia đình, xây tổ ấm.',
    mangLai: 'Nhà cửa êm ấm, trong thuận ngoài hòa, hậu phương vững chắc.',
    tacDong: 'Gia đạo yên là gốc — từ đó sự nghiệp và tài lộc nở theo.',
  },
  38: {
    rank: 'can_nhac',
    yNghia: 'Hỏa Trạch Khuê — chia lìa dị biệt, lửa bốc lên còn đầm lắng xuống.',
    phuHop: 'Công việc nhỏ làm độc lập, người quen tự thân vận động.',
    mangLai: 'Khả năng tự lập giữa những khác biệt quan điểm.',
    tacDong: 'Dễ bất đồng với người xung quanh — việc nhỏ còn hợp, việc lớn khó đồng.',
    luuY: 'Cần hợp tác lớn, hùn hạp làm ăn nên cân nhắc.',
  },
  39: {
    rank: 'can_nhac',
    yNghia: 'Thủy Sơn Kiển — gian nan trắc trở, trước mặt là nước sau lưng là núi.',
    phuHop: 'Người đang giai đoạn tu đức, rèn chí, chấp nhận đi đường vòng.',
    mangLai: 'Bài học biết dừng, quay về tu dưỡng khi gặp hiểm.',
    tacDong: 'Đường tiến hay gặp cản trở — nên cậy quý nhân, đi về hướng thuận.',
    luuY: 'Không hợp người cầu tài nhanh, việc gấp.',
  },
  40: {
    rank: 'cat',
    yNghia: 'Lôi Thủy Giải — cởi bỏ hoạn nạn, sấm động mưa rơi, băng tan khí thông.',
    phuHop: 'Người vừa qua giai đoạn khó, muốn giải hạn, gỡ vướng mắc.',
    mangLai: 'Sự tháo gỡ: nợ nần, hiểu lầm, bế tắc dần được cởi.',
    tacDong: 'Vận khí lưu thông trở lại, người nhẹ gánh, việc chạy đều.',
  },
  41: {
    rank: 'binh',
    yNghia: 'Sơn Trạch Tổn — giảm bớt cái dưới để nuôi cái trên, bỏ nhỏ được lớn.',
    phuHop: 'Người biết tiết chế, tinh giản để đầu tư cho mục tiêu xa.',
    mangLai: 'Thành quả về sau nhờ dám hy sinh cái lợi trước mắt.',
    tacDong: 'Trước giảm sau tăng — chịu thiệt ban đầu để hưởng về cuối.',
    luuY: 'Giai đoạn đầu phải chấp nhận thiệt thòi, cần thành tâm.',
  },
  42: {
    rank: 'dai_cat',
    yNghia: 'Phong Lôi Ích — tăng ích, gió sấm nương nhau càng thêm mạnh, trên giảm cho dưới được lợi.',
    phuHop: 'Người kinh doanh, làm thiện nguyện, mọi việc cầu tăng trưởng.',
    mangLai: 'Lợi ích gia tăng liên tục; làm lợi cho người rồi lợi quay về mình.',
    tacDong: 'Vận may cộng dồn — càng cho đi càng nhận lại.',
  },
  43: {
    rank: 'binh',
    yNghia: 'Trạch Thiên Quải — quyết đoán loại bỏ cái xấu cuối cùng, nước đầm dâng lên trời.',
    phuHop: 'Người cần ra quyết định dứt khoát, làm cải cách, dọn dẹp tồn đọng.',
    mangLai: 'Sức mạnh dứt điểm vấn đề day dứt đã lâu.',
    tacDong: 'Dám cắt bỏ thói quen xấu, mối quan hệ độc hại.',
    luuY: 'Phải công khai minh bạch, không đơn độc dùng vũ lực — cương quá dễ gãy.',
  },
  44: {
    rank: 'can_nhac',
    yNghia: 'Thiên Phong Cấu — cuộc gặp gỡ bất ngờ, một hào âm len vào giữa năm hào dương.',
    phuHop: 'Nghề giao tiếp rộng, nhiều mối quan hệ mới — với điều kiện tỉnh táo.',
    mangLai: 'Cơ duyên bất ngờ, song tốt xấu lẫn lộn.',
    tacDong: 'Nhiều người, nhiều việc xen vào cuộc sống — cần biết chọn lọc.',
    luuY: 'Đề phòng tiểu nhân và cám dỗ ngọt ngào; chớ trao niềm tin vội.',
  },
  45: {
    rank: 'cat',
    yNghia: 'Trạch Địa Tụy — tụ hội, nước tụ trên đất thành đầm, người và của kéo về.',
    phuHop: 'Người tổ chức sự kiện, xây cộng đồng, huy động vốn, kinh doanh đám đông.',
    mangLai: 'Nhân khí và tài khí cùng tụ; kêu gọi là có người theo.',
    tacDong: 'Sức hút với đám đông tăng, dễ được ủng hộ cả người lẫn của.',
  },
  46: {
    rank: 'dai_cat',
    yNghia: 'Địa Phong Thăng — thăng tiến từng bước, cây mọc từ lòng đất lớn dần thành cổ thụ.',
    phuHop: 'Người cầu công danh sự nghiệp, thi cử, phát triển dài hạn.',
    mangLai: 'Con đường đi lên vững chắc, không ngừng nghỉ.',
    tacDong: 'Tiến đều từng bậc, tích tiểu thành cao — quẻ rất đẹp cho sự nghiệp.',
  },
  47: {
    rank: 'can_nhac',
    yNghia: 'Trạch Thủy Khốn — cùng quẫn, đầm cạn nước, người quân tử bị vây khốn.',
    phuHop: 'Người đang rèn chí trong nghịch cảnh, chấp nhận khổ trước sướng sau.',
    mangLai: 'Nghị lực giữ vững chí hướng giữa lúc khó khăn.',
    tacDong: 'Giai đoạn dễ hao tài, lời nói khó được tin — nên làm nhiều nói ít.',
    luuY: 'Người cầu tài lộc nên chọn số mang quẻ khác.',
  },
  48: {
    rank: 'binh',
    yNghia: 'Thủy Phong Tỉnh — giếng nước nuôi người, đổi ấp chứ không đổi giếng.',
    phuHop: 'Nghề phục vụ cộng đồng bền bỉ: giáo dục, y tế, tiện ích.',
    mangLai: 'Nguồn thu ổn định như giếng không bao giờ cạn.',
    tacDong: 'Giá trị của chủ sim càng dùng càng trong, càng lâu càng quý.',
    luuY: 'Phải chăm "nạo vét giếng" — liên tục trau dồi bản thân.',
  },
  49: {
    rank: 'cat',
    yNghia: 'Trạch Hỏa Cách — đổi mới đúng thời, lửa trong đầm buộc phải biến cách.',
    phuHop: 'Người chuyển nghề, chuyển đổi mô hình, khởi nghiệp cải cách.',
    mangLai: 'Cuộc lột xác thành công khi chọn đúng thời điểm.',
    tacDong: 'Thay cũ đổi mới suôn sẻ, sau đổi mới được tin phục.',
    luuY: 'Đổi mới cần chờ đủ độ tin cậy — chớ nóng vội ngày một ngày hai.',
  },
  50: {
    rank: 'dai_cat',
    yNghia: 'Hỏa Phong Đỉnh — vạc quý nấu ăn nuôi hiền tài, tượng của phú quý và danh vọng.',
    phuHop: 'Người lãnh đạo, làm ẩm thực, gây dựng cơ nghiệp danh giá.',
    mangLai: 'Địa vị, danh vọng và lộc ăn dồi dào.',
    tacDong: 'Sự nghiệp lên tầm mới, có người tài tìm đến phò trợ.',
  },
  51: {
    rank: 'binh',
    yNghia: 'Thuần Chấn — sấm động liên hồi, kinh sợ trăm dặm mà không rơi thìa rượu.',
    phuHop: 'Người cần cú hích đánh thức bản thân, nghề tạo tiếng vang.',
    mangLai: 'Sức bật mạnh sau mỗi biến động.',
    tacDong: 'Thi thoảng có việc giật mình nhưng qua rồi bình an và trưởng thành hơn.',
    luuY: 'Rèn sự bình tĩnh — trong biến cố càng tĩnh càng thắng.',
  },
  52: {
    rank: 'binh',
    yNghia: 'Thuần Cấn — núi chồng núi, tĩnh tại, dừng đúng chỗ cần dừng.',
    phuHop: 'Người theo thiền định, nghiên cứu sâu, bất động sản.',
    mangLai: 'Định lực vững vàng, biết đủ biết dừng.',
    tacDong: 'Sống chậm mà chắc, ít phạm sai lầm lớn.',
    luuY: 'Quá thận trọng đôi khi bỏ lỡ cơ hội — nên linh động khi thời đến.',
  },
  53: {
    rank: 'cat',
    yNghia: 'Phong Sơn Tiệm — tiến dần theo thứ tự, như chim hồng từ bến nước lên mây.',
    phuHop: 'Công chức, người thăng tiến tuần tự, hôn nhân danh chính ngôn thuận.',
    mangLai: 'Sự tiến bộ vững chắc từng bước, không lùi.',
    tacDong: 'Không nhảy vọt nhưng mỗi năm mỗi vị thế cao hơn.',
  },
  54: {
    rank: 'can_nhac',
    yNghia: 'Lôi Trạch Quy Muội — về không đúng vị, em gái theo chị về nhà chồng.',
    phuHop: 'Người chấp nhận vai phụ một giai đoạn để học hỏi, chờ thời.',
    mangLai: 'Bài học biết phận, biết chờ đúng danh phận.',
    tacDong: 'Dễ ở thế bị động trong quan hệ và hợp tác.',
    luuY: 'Hôn nhân, hùn hạp lớn nên cân nhắc — danh không chính thì lời khó thuận.',
  },
  55: {
    rank: 'dai_cat',
    yNghia: 'Lôi Hỏa Phong — thịnh vượng phong túc, sấm sét và ánh sáng cùng đến, mặt trời giữa trưa.',
    phuHop: 'Người kinh doanh, người đang ở đỉnh phong độ muốn giữ đà.',
    mangLai: 'Sung túc, thành tựu rực rỡ, tiếng lành vang xa.',
    tacDong: 'Hút tài lộc và danh tiếng mạnh mẽ, làm việc lớn được việc lớn.',
    luuY: 'Mặt trời giữa trưa rồi sẽ xế — lúc thịnh phải lo giữ, chớ xa hoa.',
  },
  56: {
    rank: 'can_nhac',
    yNghia: 'Hỏa Sơn Lữ — lữ khách nơi đất lạ, lửa cháy trên núi không ở lâu một chỗ.',
    phuHop: 'Người làm du lịch, làm ăn xa quê, công việc hay dịch chuyển.',
    mangLai: 'Duyên đi xa và khả năng thích nghi nơi đất khách.',
    tacDong: 'Cuộc sống nhiều chuyến đi, linh hoạt nhưng ít cố định.',
    luuY: 'Người cầu an cư ổn định nên chọn số mang quẻ khác.',
  },
  57: {
    rank: 'binh',
    yNghia: 'Thuần Tốn — gió thổi liên tục, thấm vào mọi ngóc ngách, mềm mà vào sâu.',
    phuHop: 'Người làm truyền thông, giáo dục, thuyết phục bằng sự mềm mỏng.',
    mangLai: 'Sức ảnh hưởng lan tỏa từ từ mà bền.',
    tacDong: 'Mưa dầm thấm lâu — việc thành nhờ kiên trì khéo léo.',
    luuY: 'Quá nhu dễ thiếu quyết đoán — việc cần vẫn phải dứt khoát.',
  },
  58: {
    rank: 'cat',
    yNghia: 'Thuần Đoài — đầm nước reo vui, hoan duyệt, niềm vui nhân đôi.',
    phuHop: 'Người làm dịch vụ, giải trí, MC, bán hàng — nghề dùng lời nói.',
    mangLai: 'Khẩu tài, niềm vui và nhân duyên rộng rãi.',
    tacDong: 'Nói năng có duyên, người nghe thuận tai, việc thương lượng dễ thành.',
    luuY: 'Vui phải có chừng mực, lời hứa phải giữ trọn chữ tín.',
  },
  59: {
    rank: 'binh',
    yNghia: 'Phong Thủy Hoán — gió thổi trên nước làm tan điều tù đọng, khai thông bế tắc.',
    phuHop: 'Người cần hóa giải hiểu lầm, mở rộng hoạt động ra bên ngoài.',
    mangLai: 'Sự khai thông: điều ứ đọng, u uất dần tan.',
    tacDong: 'Tâm trí khoáng đạt hơn, quan hệ căng thẳng được làm dịu.',
    luuY: 'Đề phòng phân tán tiền của và sự thiếu tập trung.',
  },
  60: {
    rank: 'binh',
    yNghia: 'Thủy Trạch Tiết — tiết chế chừng mực, đầm chứa nước có giới hạn mới không tràn.',
    phuHop: 'Người làm tài chính, kế toán, người cần kỷ luật chi tiêu.',
    mangLai: 'Sự cân đối thu chi, nếp sống điều độ.',
    tacDong: 'Biết đủ nên ít rủi ro, tiền bạc có vào có giữ.',
    luuY: 'Tiết chế quá khắc khổ lại hóa cực — giữ mức "cam tiết" (tiết chế vui vẻ).',
  },
  61: {
    rank: 'cat',
    yNghia: 'Phong Trạch Trung Phù — thành tín từ trong tâm, lòng tin cảm hóa được cả heo và cá.',
    phuHop: 'Nghề đòi hỏi uy tín tuyệt đối: y dược, luật, tài chính, tâm linh.',
    mangLai: 'Sự tin tưởng sâu sắc từ khách hàng, đối tác.',
    tacDong: 'Chữ tín của chủ sim cảm hóa được cả những người khó tính nhất.',
  },
  62: {
    rank: 'binh',
    yNghia: 'Lôi Sơn Tiểu Quá — hơi quá về việc nhỏ, chim bay không nên lên cao.',
    phuHop: 'Người làm việc tỉ mỉ, chi tiết, kỹ thuật chính xác.',
    mangLai: 'Thành công chắc chắn trong những việc vừa tầm.',
    tacDong: 'Giữ ổn định tốt, việc nhỏ hanh thông trôi chảy.',
    luuY: 'Chưa hợp mưu sự đại nghiệp — xuống thấp thì lành, lên cao thì gặp gió.',
  },
  63: {
    rank: 'cat',
    yNghia: 'Thủy Hỏa Ký Tế — đã qua sông, việc đã hoàn thành, âm dương đều đúng vị.',
    phuHop: 'Người đã có nền tảng, muốn giữ vững và hoàn thiện thành quả.',
    mangLai: 'Sự viên mãn, mọi thứ đâu vào đấy.',
    tacDong: 'Công việc vào guồng trật tự, ít trục trặc.',
    luuY: 'Đầu tốt phòng cuối loạn — thành rồi càng phải chu đáo đề phòng.',
  },
  64: {
    rank: 'binh',
    yNghia: 'Hỏa Thủy Vị Tế — chưa qua sông, việc chưa hoàn thành nhưng đầy hứa hẹn.',
    phuHop: 'Người trẻ, dự án đang dang dở còn nhiều dư địa phát triển.',
    mangLai: 'Hy vọng và không gian tiến bộ còn rất dài.',
    tacDong: 'Mọi thứ tốt đẹp còn ở phía trước — cẩn thận phân định thì nên việc.',
    luuY: 'Cáo con ướt đuôi vì vội — chưa xong chớ đắc ý sớm.',
  },
};

/* ------------------------------------------------------------------ */
/* Lập quẻ từ số điện thoại                                            */
/* ------------------------------------------------------------------ */

export interface SimKinhDichResult {
  digits: number[];
  display: string;
  /** Nhóm số tính Thượng quái (nửa đầu) */
  upperDigits: number[];
  /** Nhóm số tính Hạ quái (nửa cuối) */
  lowerDigits: number[];
  upperSum: number;
  lowerSum: number;
  /** Số dư 1–8 (dư 0 = 8) */
  upperNum: number;
  lowerNum: number;
  upper: Trigram;
  lower: Trigram;
  totalSum: number;
  /** Hào động 1–6 từ dưới lên (tổng chia 6, dư 0 = 6) */
  movingLine: number;
  /** Quẻ chủ — hiện trạng */
  primary: Hexagram;
  /** Quẻ biến — kết cục / vận về sau (đổi hào động) */
  secondary: Hexagram;
  /** Hỗ quái — diễn biến ở giữa (hào 2·3·4 / 3·4·5) */
  mutual: Hexagram;
  /** Lời giải hào động của quẻ chủ */
  movingLineText: string;
  /** Luận giải quẻ chủ cho ngữ cảnh sim */
  interpretation: SimQueInterpretation;
  /** Luận giải quẻ biến (rút gọn — dùng cho phần "kết cục") */
  secondaryInterpretation: SimQueInterpretation;
}

function modOr(n: number, m: number): number {
  const r = n % m;
  return r === 0 ? m : r;
}

/**
 * Lập quẻ Kinh Dịch cho số điện thoại (9–11 chữ số).
 * 10 số: 5 đầu / 5 cuối. Số lẻ chữ số: nửa đầu nhiều hơn.
 */
export function analyzeSimKinhDich(rawPhone: string): SimKinhDichResult | null {
  const digits = parsePhoneDigits(rawPhone);
  if (!digits) return null;

  const upperLen = Math.ceil(digits.length / 2);
  const upperDigits = digits.slice(0, upperLen);
  const lowerDigits = digits.slice(upperLen);

  const upperSum = upperDigits.reduce((a, b) => a + b, 0);
  const lowerSum = lowerDigits.reduce((a, b) => a + b, 0);
  const totalSum = upperSum + lowerSum;

  const upperNum = modOr(upperSum, 8);
  const lowerNum = modOr(lowerSum, 8);
  const movingLine = modOr(totalSum, 6);

  const upper = trigramFromMaiHoaNum(upperNum);
  const lower = trigramFromMaiHoaNum(lowerNum);

  const primaryBin = binaryFromTrigrams(upper.id, lower.id);
  const primary = getHexagramByBinary(primaryBin);
  const secondary = getHexagramByBinary(changeLineBinary(primaryBin, movingLine));
  const mutual = getHexagramByBinary(mutualBinary(primaryBin));
  if (!primary || !secondary || !mutual) return null;

  return {
    digits,
    display: formatPhone(digits),
    upperDigits,
    lowerDigits,
    upperSum,
    lowerSum,
    upperNum,
    lowerNum,
    upper,
    lower,
    totalSum,
    movingLine,
    primary,
    secondary,
    mutual,
    movingLineText: primary.lines[movingLine - 1],
    interpretation: SIM_QUE_INTERPRETATIONS[primary.number],
    secondaryInterpretation: SIM_QUE_INTERPRETATIONS[secondary.number],
  };
}

/** Số quẻ chủ (1–64) của một số điện thoại — dùng precompute cột DB. */
export function simQueNumber(rawPhone: string): number | null {
  return analyzeSimKinhDich(rawPhone)?.primary.number ?? null;
}

/**
 * Thông tin gọn để hiển thị badge quẻ trên card sim
 * (tính trực tiếp từ số — không phụ thuộc cột DB).
 */
export function simQueBadge(
  phone: string,
): { hex: Hexagram; rank: QueRank; rankMeta: (typeof QUE_RANK_META)[QueRank] } | null {
  const r = analyzeSimKinhDich(phone);
  if (!r) return null;
  const rank = r.interpretation.rank;
  return { hex: r.primary, rank, rankMeta: QUE_RANK_META[rank] };
}

/** Danh sách 64 quẻ cho bộ lọc (số + tên + unicode + mức cát hung). */
export function queFilterOptions(): Array<{
  number: number;
  label: string;
  unicode: string;
  rank: QueRank;
}> {
  const out: Array<{ number: number; label: string; unicode: string; rank: QueRank }> = [];
  for (let n = 1; n <= 64; n++) {
    const h = getHexagram(n);
    if (!h) continue;
    out.push({
      number: n,
      label: h.nameFull,
      unicode: h.unicode,
      rank: SIM_QUE_INTERPRETATIONS[n].rank,
    });
  }
  return out;
}
