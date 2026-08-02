/**
 * Config 14 chủ đề nguyên lý Âm Dương Ngũ Hành, Kinh dịch diệu luận: nhãn trang, kiểu nhập, parser,
 * phương diện nhấn mạnh, câu luận mẫu gửi AI, câu mồi chat,
 * ghi chú thỉnh nước và hàm dựng ngữ cảnh AI (đã mask dữ liệu nhạy cảm).
 */

import {
  ASPECT_LABELS,
  STARS,
  STAR_ORDER,
  analyzeBatCuc,
  analyzeShortNumber,
  elementLabel,
  type AspectId,
  type BatCucAnalysis,
  type ShortAnalysis,
} from '@/lib/fengshui/bat-cuc';
import {
  dateToDigits,
  maskDigits,
  parseAlnum,
  parseCard,
  parseIdDoc,
  parseMoney,
  parsePlate,
  parseTaxCode,
  formatMoney,
  type DateDigitsParse,
  type LetterInfo,
} from '@/lib/fengshui/bat-cuc-parsers';
import { parsePhoneDigits, formatPhone } from '@/lib/fengshui/boi-sim';

export type BatCucTopicId =
  | 'sim'
  | 'tai_khoan'
  | 'so_nha'
  | 'bien_so'
  | 'can_cuoc'
  | 'the_atm'
  | 'ma_so_thue'
  | 'ma_nhan_vien'
  | 'so_phong'
  | 'gia_ban'
  | 'ngay_sinh'
  | 'su_kien'
  | 'mat_khau'
  | 'so_ghe';

export type BatCucInputKind = 'text' | 'date' | 'datetime' | 'money';

export interface BatCucTopicConfig {
  id: BatCucTopicId;
  slug: string;
  /** tên trong menu */
  title: string;
  /** mô tả ngắn cho menu / hub */
  description: string;
  /** nhãn khối dữ liệu khi luận (VD "số tài khoản") */
  dataLabel: string;
  inputKind: BatCucInputKind;
  inputLabel: string;
  placeholder: string;
  inputHint?: string;
  /** hỏi thêm năm sinh để xem hợp mệnh Nạp Âm */
  askBirthYear: boolean;
  /** dữ liệu nhạy cảm: mask trong ngữ cảnh AI + cảnh báo bảo mật trên UI */
  secure: boolean;
  /** đại kỵ đuôi 0/05 (tắt cho dãy không đổi được: CCCD, ngày sinh, sự kiện) */
  applyTailTaboo: boolean;
  /** dãy ngắn (số nhà, phòng, ghế) — dùng chế độ luận từng chữ số khi thiếu cặp */
  shortMode: boolean;
  /** phương diện nhấn mạnh, hiển thị và luận trước */
  aspectFocus: AspectId[];
  /** câu luận mẫu khi bấm luận sâu */
  essayQuestion: string;
  /** 4 câu mồi khi mở chat */
  chatSuggestions: string[];
  /** kho câu gợi ý tiếp nối khi model thiếu */
  followUpPool: string[];
  /** ghi chú đơn thỉnh nước riêng của trang */
  donateNote: string;
  /** giới thiệu đầu khung chat */
  chatIntro: string;
}

export const BAT_CUC_TOPICS: Record<BatCucTopicId, BatCucTopicConfig> = {
  sim: {
    id: 'sim',
    slug: 'boi-sim',
    title: 'Bói SIM · số điện thoại',
    description: 'Luận vận khí, ngoại giao, sự nghiệp theo nguyên lý Âm Dương Ngũ Hành, Kinh dịch diệu luận.',
    dataLabel: 'số điện thoại',
    inputKind: 'text',
    inputLabel: 'Số điện thoại',
    placeholder: 'VD: 0912 345 678',
    askBirthYear: true,
    secure: false,
    applyTailTaboo: true,
    shortMode: false,
    aspectFocus: ['tai_loc', 'su_nghiep', 'quy_nhan'],
    essayQuestion:
      'Luận sâu số điện thoại này theo nguyên lý Âm Dương Ngũ Hành, Kinh dịch diệu luận: từ trường chủ đạo, tài lộc, sự nghiệp, quý nhân và 3 số cuối; có nên giữ dùng lâu dài không?',
    chatSuggestions: [
      'Sim này hợp làm ăn kinh doanh không?',
      '3 số cuối của sim tôi tốt hay xấu?',
      'Sim ảnh hưởng gì đến tình cảm gia đạo?',
      'Nếu đổi sim, nên chọn đuôi thế nào?',
    ],
    followUpPool: [
      'Từ trường chủ đạo của sim nói gì về tính cách tôi?',
      'Sim này có sao phá tài không?',
      'Cặp số nào trong sim cần lưu ý nhất?',
      'Số 0 và số 5 trong sim ảnh hưởng thế nào?',
      'Sim hợp với nghề của tôi không?',
      'Nên chọn đuôi sim thế nào cho hợp mệnh?',
      'Tổng nút sim có quan trọng không?',
    ],
    donateNote: 'Hỏi sâu bói sim theo nguyên lý Âm Dương Ngũ Hành, Kinh dịch diệu luận',
    chatIntro:
      'Hỏi về số điện thoại đã xem — trụ trì luận theo bảng sao theo nguyên lý Âm Dương Ngũ Hành, Kinh dịch diệu luận của dãy số (không luận lá số tử vi ở đây).',
  },
  tai_khoan: {
    id: 'tai_khoan',
    slug: 'so-tai-khoan',
    title: 'Số tài khoản ngân hàng',
    description: 'Dòng chảy tiền tệ: kiếm được và giữ được theo cấu trúc sao.',
    dataLabel: 'số tài khoản ngân hàng',
    inputKind: 'text',
    inputLabel: 'Số tài khoản',
    placeholder: 'VD: 190368686868',
    inputHint:
      'Chỉ phân tích trên máy; khi hỏi luận sâu, hệ thống tự che số, chỉ gửi cấu trúc sao và 4 số cuối.',
    askBirthYear: true,
    secure: true,
    applyTailTaboo: true,
    shortMode: false,
    aspectFocus: ['tai_loc', 'su_nghiep'],
    essayQuestion:
      'Luận sâu cấu trúc sao của số tài khoản này về dòng chảy tiền tệ: tiền vào có thuận không, có giữ được không, đuôi số nói gì về tích lũy?',
    chatSuggestions: [
      'Tài khoản này tiền vào có thuận không?',
      'Số này giữ tiền hay lọt tiền?',
      'Đuôi tài khoản của tôi tốt hay xấu?',
      'Nên chọn số tài khoản đuôi thế nào?',
    ],
    followUpPool: [
      'Tài khoản này hợp nhận lương hay kinh doanh?',
      'Có nên mở thêm tài khoản số đẹp không?',
      'Cặp sao nào trong số tài khoản cần lưu ý?',
      'Thiên Y và Diên Niên trong số tài khoản nghĩa là gì?',
      'Số 0 trong tài khoản ảnh hưởng dòng tiền không?',
      'Chọn số tài khoản mới nên ưu tiên gì?',
    ],
    donateNote: 'Hỏi sâu số tài khoản theo nguyên lý Âm Dương Ngũ Hành, Kinh dịch diệu luận',
    chatIntro:
      'Hỏi về số tài khoản đã xem — số gốc đã được che, trụ trì luận trên cấu trúc sao và 4 số cuối.',
  },
  so_nha: {
    id: 'so_nha',
    slug: 'so-nha',
    title: 'Số nhà · căn hộ',
    description: 'Năng lượng không gian sống theo quái số và Âm Dương Ngũ Hành.',
    dataLabel: 'số nhà / căn hộ',
    inputKind: 'text',
    inputLabel: 'Số nhà / căn hộ',
    placeholder: 'VD: 68, 12B, 1508',
    inputHint: 'Có thể kèm chữ (12B) — chữ được tách riêng để tham khảo quái.',
    askBirthYear: true,
    secure: false,
    applyTailTaboo: false,
    shortMode: true,
    aspectFocus: ['suc_khoe', 'tinh_cam', 'tai_loc'],
    essayQuestion:
      'Luận năng lượng số nhà này với không gian sống: quái số từng chữ số, cặp sao (nếu có), tổng nút và ảnh hưởng tới sức khỏe, hòa khí, tài lộc của gia đình.',
    chatSuggestions: [
      'Số nhà này có hợp gia đình tôi không?',
      'Số nhà ảnh hưởng gì đến hòa khí trong nhà?',
      'Dân gian kiêng số 4, số nhà tôi có sao không?',
      'Cách hóa giải nếu số nhà không đẹp?',
    ],
    followUpPool: [
      'Số căn hộ và số tầng, cái nào quan trọng hơn?',
      'Số nhà này hợp mệnh chủ nhà không?',
      'Tổng nút số nhà nói lên điều gì?',
      'Có nên treo biển số phụ để hóa giải không?',
      'Số nhà ảnh hưởng đến việc buôn bán tại nhà không?',
    ],
    donateNote: 'Hỏi sâu số nhà · căn hộ theo nguyên lý Âm Dương Ngũ Hành, Kinh dịch diệu luận',
    chatIntro:
      'Hỏi về số nhà / căn hộ đã xem — trụ trì luận quái số, cặp sao và tổng nút của số nhà với không gian sống.',
  },
  bien_so: {
    id: 'bien_so',
    slug: 'bien-so-xe',
    title: 'Biển số xe',
    description: 'An toàn di chuyển và tài lộc làm ăn theo dãy số chính.',
    dataLabel: 'biển số xe',
    inputKind: 'text',
    inputLabel: 'Biển số xe',
    placeholder: 'VD: 30K-123.45 hoặc 59-X1 234.56',
    inputHint:
      'Nhận biển 4–5 số; mã tỉnh và seri chữ được bóc riêng, dãy số chính dùng để luận.',
    askBirthYear: true,
    secure: false,
    applyTailTaboo: true,
    shortMode: false,
    aspectFocus: ['suc_khoe', 'tai_loc'],
    essayQuestion:
      'Luận biển số xe này theo nguyên lý Âm Dương Ngũ Hành, Kinh dịch diệu luận, trọng tâm AN TOÀN di chuyển và tài lộc công việc làm ăn gắn với chiếc xe; đuôi biển số nói gì?',
    chatSuggestions: [
      'Biển số này đi đường có bình an không?',
      'Xe này dùng chạy dịch vụ / làm ăn tốt không?',
      'Đuôi biển số của tôi tốt hay xấu?',
      'Nếu bấm biển mới nên mong dãy thế nào?',
    ],
    followUpPool: [
      'Cặp sao nào trên biển số cần lưu ý khi lái xe?',
      'Tổng nút biển số có ý nghĩa gì?',
      'Seri chữ trên biển có ảnh hưởng không?',
      'Biển số có hợp mệnh chủ xe không?',
      'Có cần cúng xe hay chọn ngày lấy xe không?',
    ],
    donateNote: 'Hỏi sâu biển số xe theo nguyên lý Âm Dương Ngũ Hành, Kinh dịch diệu luận',
    chatIntro:
      'Hỏi về biển số xe đã xem — trụ trì luận an toàn di chuyển và tài lộc theo dãy số chính của biển (không luận hôn nhân, gia đạo ở đây).',
  },
  can_cuoc: {
    id: 'can_cuoc',
    slug: 'so-can-cuoc',
    title: 'Số CCCD · hộ chiếu',
    description: 'Trường năng lượng gốc gắn với định danh cả đời.',
    dataLabel: 'số căn cước / hộ chiếu',
    inputKind: 'text',
    inputLabel: 'Số CCCD / CMND / hộ chiếu',
    placeholder: 'VD: 001204012345 hoặc C1234567',
    inputHint:
      'CCCD 12 số được giải mã cấu trúc (mã tỉnh, giới tính, năm sinh) theo Thông tư 07/2016/TT-BCA. Số được che khi hỏi luận sâu.',
    askBirthYear: false,
    secure: true,
    applyTailTaboo: false,
    shortMode: false,
    aspectFocus: ['su_nghiep', 'tai_loc', 'suc_khoe'],
    essayQuestion:
      'Luận "trường năng lượng gốc" của dãy số định danh này: cấu trúc sao toàn dãy và 6 số cuối nói gì về nền vận khí; đây là số không đổi được nên xin lời khuyên sống thuận theo, không khuyên đổi số.',
    chatSuggestions: [
      'Trường khí gốc của số căn cước tôi thế nào?',
      '6 số cuối CCCD của tôi nói lên điều gì?',
      'Số định danh xấu thì có đáng lo không?',
      'Làm sao bù đắp nếu số gốc nhiều hung tinh?',
    ],
    followUpPool: [
      'Số CCCD có ảnh hưởng vận trình thật không?',
      'Nên chọn SIM / tài khoản thế nào để bù số gốc?',
      'Cặp sao nào trong số định danh đáng chú ý nhất?',
      'Tổng nút của số định danh nói gì?',
      'Số hộ chiếu có cần xem như CCCD không?',
    ],
    donateNote: 'Hỏi sâu số căn cước theo nguyên lý Âm Dương Ngũ Hành, Kinh dịch diệu luận',
    chatIntro:
      'Hỏi về số định danh đã xem — số gốc đã che, trụ trì luận trường khí nền và cách bồi bổ bằng các dãy số hậu thiên (tuyệt đối không khuyên đổi giấy tờ).',
  },
  the_atm: {
    id: 'the_atm',
    slug: 'so-the-atm',
    title: 'Số thẻ ATM · tín dụng',
    description: 'Dòng chi tiêu và khả năng giữ tiền qua dãy thẻ.',
    dataLabel: 'số thẻ ATM / tín dụng',
    inputKind: 'text',
    inputLabel: 'Số thẻ (12–19 số)',
    placeholder: 'VD: 9704 3612 3456 7890',
    inputHint:
      'Hệ thống kiểm tra Luhn để xác nhận nhập đúng; 6 số đầu là mã BIN ngân hàng (không luận). Số được che khi hỏi luận sâu.',
    askBirthYear: true,
    secure: true,
    applyTailTaboo: true,
    shortMode: false,
    aspectFocus: ['tai_loc'],
    essayQuestion:
      'Luận cấu trúc sao phần số sau BIN của thẻ này về dòng chi tiêu: thẻ này giữ tiền hay lọt tiền, 4 số cuối nói gì; nên dùng thẻ vào việc chi hay việc tích lũy?',
    chatSuggestions: [
      'Thẻ này quẹt chi tiêu có dễ vung tay không?',
      '4 số cuối thẻ của tôi tốt hay xấu?',
      'Thẻ tín dụng số này có dễ nợ nần không?',
      'Nên dùng thẻ này cho việc gì thì hợp?',
    ],
    followUpPool: [
      'Cặp sao nào trong số thẻ cần lưu ý?',
      'Có nên đổi thẻ lấy số đuôi đẹp không?',
      'Số thẻ và số tài khoản, số nào quan trọng hơn?',
      'Tuyệt Mệnh trong số thẻ nghĩa là gì?',
      'Đuôi 0 trên thẻ có đáng ngại không?',
    ],
    donateNote: 'Hỏi sâu số thẻ theo nguyên lý Âm Dương Ngũ Hành, Kinh dịch diệu luận',
    chatIntro:
      'Hỏi về số thẻ đã xem — số gốc đã che, trụ trì luận trên cấu trúc sao phần số chính và 4 số cuối. Tuyệt đối không chia sẻ CVV hay ngày hết hạn.',
  },
  ma_so_thue: {
    id: 'ma_so_thue',
    slug: 'ma-so-thue',
    title: 'Mã số thuế · ĐKKD',
    description: 'Vận khí kinh doanh và pháp lý của doanh nghiệp.',
    dataLabel: 'mã số thuế / số ĐKKD',
    inputKind: 'text',
    inputLabel: 'Mã số thuế (10 hoặc 13 số)',
    placeholder: 'VD: 0101243150',
    askBirthYear: false,
    secure: false,
    applyTailTaboo: false,
    shortMode: false,
    aspectFocus: ['tai_loc', 'su_nghiep', 'quy_nhan'],
    essayQuestion:
      'Luận mã số thuế này về vận khí công ty: cấu trúc sao nói gì về đường tài lộc, quan hệ đối tác và sự ổn thỏa pháp lý; đây là mã cấp cố định nên xin lời khuyên vận hành thuận theo.',
    chatSuggestions: [
      'MST này nói gì về vận làm ăn của công ty?',
      'Công ty có dễ vướng pháp lý, thị phi không?',
      'Đuôi mã số thuế của công ty tốt hay xấu?',
      'Làm sao bồi bổ vận khí nếu MST nhiều hung tinh?',
    ],
    followUpPool: [
      'Cặp sao nào trong MST đáng chú ý nhất?',
      'MST có Tuyệt Mệnh thì kinh doanh có sao không?',
      'Nên chọn số tài khoản công ty thế nào để bù?',
      'Tổng nút MST nói gì về công ty?',
      'Ngày thành lập công ty có quan trọng hơn MST không?',
    ],
    donateNote: 'Hỏi sâu mã số thuế theo nguyên lý Âm Dương Ngũ Hành, Kinh dịch diệu luận',
    chatIntro:
      'Hỏi về mã số thuế đã xem — trụ trì luận vận khí kinh doanh và pháp lý theo cấu trúc sao (mã cấp cố định, luận để hiểu và bồi bổ, không khuyên đổi).',
  },
  ma_nhan_vien: {
    id: 'ma_nhan_vien',
    slug: 'ma-nhan-vien',
    title: 'Mã nhân viên',
    description: 'Thăng tiến và quan hệ công sở qua mã số gắn với bạn.',
    dataLabel: 'mã nhân viên',
    inputKind: 'text',
    inputLabel: 'Mã nhân viên',
    placeholder: 'VD: NV0368 hoặc 10368',
    inputHint: 'Có thể kèm chữ — chữ được tách riêng, phần số dùng để luận.',
    askBirthYear: true,
    secure: false,
    applyTailTaboo: false,
    shortMode: true,
    aspectFocus: ['su_nghiep', 'quy_nhan'],
    essayQuestion:
      'Luận mã nhân viên này về đường công việc: cấu trúc sao nói gì về thăng tiến, quan hệ đồng nghiệp – cấp trên; mã do công ty cấp nên xin lời khuyên ứng xử thuận theo.',
    chatSuggestions: [
      'Mã nhân viên này có lợi cho thăng tiến không?',
      'Quan hệ với sếp và đồng nghiệp thế nào?',
      'Mã có hung tinh thì có đáng lo không?',
      'Làm sao phát huy điểm mạnh của mã số này?',
    ],
    followUpPool: [
      'Cặp sao nào trong mã nhân viên đáng chú ý?',
      'Mã này hợp với nghề tôi đang làm không?',
      'Tổng nút mã nhân viên nói gì?',
      'Chữ cái trong mã có ý nghĩa không?',
      'Có nên xin đổi mã nhân viên không?',
    ],
    donateNote: 'Hỏi sâu mã nhân viên theo nguyên lý Âm Dương Ngũ Hành, Kinh dịch diệu luận',
    chatIntro:
      'Hỏi về mã nhân viên đã xem — trụ trì luận đường công danh, quan hệ công sở theo cấu trúc sao của phần số.',
  },
  so_phong: {
    id: 'so_phong',
    slug: 'so-phong-lam-viec',
    title: 'Số phòng · tầng làm việc',
    description: 'Năng lượng nơi làm việc theo quái số từng chữ số.',
    dataLabel: 'số phòng / tầng làm việc',
    inputKind: 'text',
    inputLabel: 'Số phòng / tầng',
    placeholder: 'VD: 806, tầng 12, P.1508',
    askBirthYear: true,
    secure: false,
    applyTailTaboo: false,
    shortMode: true,
    aspectFocus: ['su_nghiep', 'quy_nhan', 'suc_khoe'],
    essayQuestion:
      'Luận số phòng / tầng làm việc này: quái số từng chữ số, cặp sao (nếu có), tổng nút — năng lượng chỗ ngồi ảnh hưởng gì tới hiệu quả công việc và hòa khí; cách bài trí bù trừ.',
    chatSuggestions: [
      'Phòng này ngồi làm việc có thuận không?',
      'Số tầng có ảnh hưởng đến công việc không?',
      'Dân gian kiêng tầng 4, tầng 13 — có đúng không?',
      'Cách bài trí bàn làm việc để bù số phòng xấu?',
    ],
    followUpPool: [
      'Số phòng này hợp đội nhóm sáng tạo hay hành chính?',
      'Tổng nút số phòng nói gì?',
      'Nên chọn hướng ngồi thế nào trong phòng này?',
      'Số phòng họp quan trọng hay số phòng ngồi quan trọng?',
      'Chuyển sang phòng số nào thì tốt hơn?',
    ],
    donateNote: 'Hỏi sâu số phòng làm việc theo nguyên lý Âm Dương Ngũ Hành, Kinh dịch diệu luận',
    chatIntro:
      'Hỏi về số phòng / tầng đã xem — trụ trì luận năng lượng không gian làm việc theo quái số và cặp sao.',
  },
  gia_ban: {
    id: 'gia_ban',
    slug: 'gia-niem-yet',
    title: 'Giá bán · giá chốt',
    description: 'Chọn mức giá mang cát khí, kèm gợi ý giá đẹp lân cận.',
    dataLabel: 'giá bán / giá niêm yết',
    inputKind: 'money',
    inputLabel: 'Mức giá (đồng)',
    placeholder: 'VD: 1.990.000',
    inputHint: 'Hệ thống luận phần số có nghĩa và gợi ý các mức giá đẹp trong ±3%.',
    askBirthYear: false,
    secure: false,
    applyTailTaboo: true,
    shortMode: true,
    aspectFocus: ['tai_loc', 'quy_nhan'],
    essayQuestion:
      'Luận mức giá này theo nguyên lý Âm Dương Ngũ Hành, Kinh dịch diệu luận: cấu trúc sao của phần số có nghĩa, đuôi giá nói gì về sức mua và dòng tiền; trong các mức giá đẹp lân cận đã gợi ý, nên chốt mức nào và vì sao?',
    chatSuggestions: [
      'Giá này bán hàng có chạy không?',
      'Nên niêm yết giá chẵn hay giá lẻ?',
      'Trong các giá gợi ý, mức nào tốt nhất?',
      'Đuôi giá 68, 86, 99 khác nhau thế nào?',
    ],
    followUpPool: [
      'Giá chốt hợp đồng có nên chọn ngày ký không?',
      'Đuôi 0 trong giá có phạm đại kỵ không?',
      'Giá đẹp theo sách khác giá đẹp marketing thế nào?',
      'Tổng nút của giá nói gì?',
      'Bán nhà / xe nên ra giá thế nào cho cát?',
    ],
    donateNote: 'Hỏi sâu giá bán theo nguyên lý Âm Dương Ngũ Hành, Kinh dịch diệu luận',
    chatIntro:
      'Hỏi về mức giá đã xem — trụ trì luận cấu trúc sao của con số giá và cách chọn mức chốt mang cát khí.',
  },
  ngay_sinh: {
    id: 'ngay_sinh',
    slug: 'ngay-sinh-linh-so',
    title: 'Ngày sinh linh số',
    description: 'Tính cách, năng khiếu từ dãy số ngày tháng năm sinh.',
    dataLabel: 'ngày tháng năm sinh',
    inputKind: 'date',
    inputLabel: 'Ngày sinh (dương lịch)',
    placeholder: '',
    inputHint: 'Ngày được đổi thành dãy ddMMyyyy để luận, kèm âm lịch và Nạp Âm.',
    askBirthYear: false,
    secure: false,
    applyTailTaboo: false,
    shortMode: false,
    aspectFocus: ['su_nghiep', 'tinh_cam', 'suc_khoe'],
    essayQuestion:
      'Luận dãy số ngày sinh này: từ trường chủ đạo nói gì về tính cách, năng khiếu bẩm sinh; kết hợp mệnh Nạp Âm năm sinh; ngày sinh không đổi được nên xin lời khuyên phát huy sở trường.',
    chatSuggestions: [
      'Ngày sinh nói gì về tính cách của tôi?',
      'Tôi có năng khiếu bẩm sinh về lĩnh vực nào?',
      'Mệnh Nạp Âm năm sinh của tôi là gì?',
      'Nên chọn nghề gì hợp với linh số ngày sinh?',
    ],
    followUpPool: [
      'Cặp sao nào trong ngày sinh đáng chú ý nhất?',
      'Ngày sinh nhiều hung tinh thì có sao không?',
      'Nên chọn SIM thế nào để bù ngày sinh?',
      'Con số may mắn của tôi là gì?',
      'Ngày sinh âm lịch có luận khác không?',
    ],
    donateNote: 'Hỏi sâu ngày sinh linh số Âm Dương Ngũ Hành',
    chatIntro:
      'Hỏi về ngày sinh đã xem — trụ trì luận từ trường bẩm sinh của dãy số ngày sinh và mệnh Nạp Âm (không lập lá số tử vi ở đây).',
  },
  su_kien: {
    id: 'su_kien',
    slug: 'ngay-gio-su-kien',
    title: 'Ngày giờ sự kiện',
    description: 'Xem dãy số ngày giờ khai trương, cưới hỏi, ký kết.',
    dataLabel: 'ngày giờ sự kiện',
    inputKind: 'datetime',
    inputLabel: 'Ngày giờ sự kiện (dương lịch)',
    placeholder: '',
    inputHint: 'Ngày giờ được đổi thành dãy ddMMyyyyhh để luận, kèm âm lịch.',
    askBirthYear: true,
    secure: false,
    applyTailTaboo: false,
    shortMode: false,
    aspectFocus: ['tai_loc', 'quy_nhan', 'su_nghiep'],
    essayQuestion:
      'Luận dãy số ngày giờ sự kiện này: cấu trúc sao có thuận cho việc trọng đại (khai trương / cưới hỏi / ký kết) không; nếu chưa đẹp thì nên xê dịch giờ trong ngày thế nào?',
    chatSuggestions: [
      'Ngày giờ này khai trương có tốt không?',
      'Ngày này cưới hỏi có thuận không?',
      'Nên chọn giờ nào trong ngày để ký hợp đồng?',
      'Ngày giờ này có hợp tuổi tôi không?',
    ],
    followUpPool: [
      'Xê dịch sang giờ nào thì dãy số đẹp hơn?',
      'Cặp sao cuối của dãy ngày giờ nói gì?',
      'Ngày âm hay ngày dương quan trọng hơn?',
      'Có cần xem thêm giờ hoàng đạo không?',
      'Sự kiện online có cần chọn giờ không?',
    ],
    donateNote: 'Hỏi sâu ngày giờ sự kiện Âm Dương Ngũ Hành',
    chatIntro:
      'Hỏi về ngày giờ sự kiện đã xem — trụ trì luận dãy số ngày giờ theo Âm Dương Ngũ Hành; việc đại sự nên kết hợp thêm xem ngày truyền thống.',
  },
  mat_khau: {
    id: 'mat_khau',
    slug: 'mat-khau-ma-pin',
    title: 'Mật khẩu · mã PIN',
    description: 'Phản xạ năng lượng của dãy số gõ hằng ngày.',
    dataLabel: 'mật khẩu / mã PIN',
    inputKind: 'text',
    inputLabel: 'Mật khẩu / mã PIN (phần số)',
    placeholder: 'VD: 1368 hoặc abc1368',
    inputHint:
      'Phân tích hoàn toàn trên máy của quý vị. Khi hỏi luận sâu, hệ thống CHỈ gửi cấu trúc sao đã che — tuyệt đối không gửi mật khẩu gốc. Không nhập mật khẩu ngân hàng đang dùng.',
    askBirthYear: false,
    secure: true,
    applyTailTaboo: true,
    shortMode: true,
    aspectFocus: ['tai_loc', 'suc_khoe'],
    essayQuestion:
      'Luận cấu trúc sao của dãy số này (đã che) với vai trò mật khẩu / PIN gõ lặp lại hằng ngày: từ trường lặp đi lặp lại ảnh hưởng gì; nên chọn cấu trúc số thế nào vừa cát vừa an toàn bảo mật?',
    chatSuggestions: [
      'Mã PIN gõ hằng ngày có ảnh hưởng vận khí không?',
      'Cấu trúc số của tôi thuộc sao gì?',
      'Nên chọn PIN thế nào vừa đẹp vừa khó đoán?',
      'Đuôi PIN là 0 có phạm đại kỵ không?',
    ],
    followUpPool: [
      'Có nên tránh ngày sinh làm mã PIN không?',
      'Cặp Thiên Y trong PIN nghĩa là gì?',
      'PIN 4 số và 6 số luận khác nhau không?',
      'Đổi PIN có cần chọn ngày không?',
      'Mật khẩu chữ + số thì luận phần nào?',
    ],
    donateNote: 'Hỏi sâu mật khẩu · PIN Âm Dương Ngũ Hành',
    chatIntro:
      'Hỏi về dãy PIN đã xem — số gốc đã che hoàn toàn, trụ trì chỉ luận trên cấu trúc sao. Nhắc quý vị: không dùng dãy dễ đoán (ngày sinh, 1234) cho tài khoản quan trọng.',
  },
  so_ghe: {
    id: 'so_ghe',
    slug: 'so-thu-tu-ghe',
    title: 'Số thứ tự · bàn · ghế',
    description: 'Số báo danh, số ghế, số bàn — luận nhanh theo quái số.',
    dataLabel: 'số thứ tự / bàn / ghế',
    inputKind: 'text',
    inputLabel: 'Số thứ tự / ghế / bàn',
    placeholder: 'VD: 68, A12, ghế 7C',
    inputHint: 'Có thể kèm chữ (A12, 7C) — chữ tách riêng tham khảo.',
    askBirthYear: true,
    secure: false,
    applyTailTaboo: false,
    shortMode: true,
    aspectFocus: ['quy_nhan', 'su_nghiep'],
    essayQuestion:
      'Luận số thứ tự / ghế này theo quái số và cặp sao: năng lượng con số có trợ duyên cho việc sắp diễn ra (thi cử, sự kiện, chuyến đi) không; tâm thế nên giữ thế nào?',
    chatSuggestions: [
      'Số báo danh này đi thi có thuận không?',
      'Số ghế máy bay của tôi có tốt không?',
      'Số bàn tiệc này có ý nghĩa gì?',
      'Số thứ tự xấu thì có đáng lo không?',
    ],
    followUpPool: [
      'Quái số của số ghế nói gì?',
      'Tổng nút số thứ tự có quan trọng không?',
      'Chữ cái trong số ghế (7C) có ý nghĩa gì?',
      'Có nên đổi chỗ nếu số ghế xấu không?',
      'Số may mắn nên chọn khi bốc thăm là gì?',
    ],
    donateNote: 'Hỏi sâu số thứ tự · ghế Âm Dương Ngũ Hành',
    chatIntro:
      'Hỏi về số thứ tự / ghế đã xem — trụ trì luận nhanh theo quái số, cặp sao và tổng nút; con số nhỏ nên xem nhẹ nhàng, đừng quá đặt nặng.',
  },
};

export const BAT_CUC_TOPIC_ORDER: BatCucTopicId[] = [
  'sim',
  'tai_khoan',
  'so_nha',
  'bien_so',
  'can_cuoc',
  'the_atm',
  'ma_so_thue',
  'ma_nhan_vien',
  'so_phong',
  'gia_ban',
  'ngay_sinh',
  'su_kien',
  'mat_khau',
  'so_ghe',
];

export function parseBatCucTopicId(raw: unknown): BatCucTopicId | null {
  if (typeof raw !== 'string') return null;
  return (BAT_CUC_TOPIC_ORDER as string[]).includes(raw)
    ? (raw as BatCucTopicId)
    : null;
}

/* ============ Kết quả bóc tách chuẩn hóa cho UI ============ */

export interface BatCucParsedInput {
  /** dãy chữ số dùng để luận */
  digits: number[];
  /** hiển thị trên UI (không mask) */
  display: string;
  /** hiển thị trong ngữ cảnh AI (mask nếu secure) */
  aiDisplay: string;
  /** chữ cái tách riêng (nếu có) */
  letters: LetterInfo[];
  /** khối giải mã đặc thù (CCCD, biển số, Luhn, âm lịch…) */
  extras: { label: string; value: string }[];
  /** cảnh báo hiển thị trên UI */
  warnings: string[];
  /** năm sinh suy ra từ dữ liệu (CCCD, ngày sinh) */
  derivedBirthYear?: number;
  /** dữ liệu giá (để gợi ý giá đẹp) */
  moneyAmount?: number;
}

export type BatCucDateInput = { d: number; m: number; y: number; hour?: number };

/** Bóc tách input theo chủ đề. Trả error khi dữ liệu không hợp lệ. */
export function parseBatCucInput(
  topic: BatCucTopicId,
  input: string | BatCucDateInput,
): BatCucParsedInput | { error: string } {
  const cfg = BAT_CUC_TOPICS[topic];

  if (cfg.inputKind === 'date' || cfg.inputKind === 'datetime') {
    if (typeof input === 'string')
      return { error: 'Thiếu ngày tháng năm.' };
    const parsed = dateToDigits(
      input.d,
      input.m,
      input.y,
      cfg.inputKind === 'datetime' ? input.hour : undefined,
    );
    if ('error' in parsed) return parsed;
    return {
      digits: parsed.digits,
      display: parsed.display,
      aiDisplay: parsed.display,
      letters: [],
      extras: [
        { label: 'Âm lịch', value: parsed.lunarDisplay },
        { label: 'Năm can chi', value: parsed.canChiYear },
      ],
      warnings: [],
      derivedBirthYear: topic === 'ngay_sinh' ? input.y : undefined,
    };
  }

  const raw = typeof input === 'string' ? input.trim() : '';
  if (!raw) return { error: 'Vui lòng nhập dãy số cần xem.' };

  switch (topic) {
    case 'sim': {
      const digits = parsePhoneDigits(raw);
      if (!digits)
        return {
          error:
            'Số điện thoại không hợp lệ. Nhập 9–11 chữ số (VD: 0912345678).',
        };
      return {
        digits,
        display: formatPhone(digits),
        aiDisplay: formatPhone(digits),
        letters: [],
        extras: [],
        warnings: [],
      };
    }
    case 'bien_so': {
      const p = parsePlate(raw);
      if ('error' in p) return p;
      const extras: { label: string; value: string }[] = [
        {
          label: 'Mã tỉnh',
          value: `${p.provinceCode}${p.provinceName ? ` — ${p.provinceName}` : ' (chưa có trong bảng tra)'}`,
        },
      ];
      if (p.seriesRaw)
        extras.push({
          label: 'Seri',
          value: `${p.seriesRaw}${
            p.series.length
              ? ` (${p.series
                  .map((l) => `${l.letter}=${l.alphaIndex}→${l.reduced}`)
                  .join(', ')})`
              : ''
          }`,
        });
      extras.push({
        label: 'Dãy số luận chính',
        value: p.mainDigits.join(''),
      });
      return {
        digits: p.mainDigits,
        display: p.display,
        aiDisplay: p.display,
        letters: p.series,
        extras,
        warnings: [],
      };
    }
    case 'can_cuoc': {
      const p = parseIdDoc(raw);
      if ('error' in p) return p;
      if (p.kind === 'cccd') {
        return {
          digits: p.digits,
          display: p.display,
          aiDisplay: maskDigits(p.digits, 6),
          letters: [],
          extras: [
            {
              label: 'Mã tỉnh nơi ĐK khai sinh',
              value: `${p.display.slice(0, 3)}${p.provinceName ? ` — ${p.provinceName}` : ''}`,
            },
            {
              label: 'Giới tính · thế kỷ',
              value: `${p.gender} · ${p.centuryLabel}`,
            },
            { label: 'Năm sinh', value: String(p.birthYear) },
            {
              label: '6 số cuối (ngẫu nhiên — phần riêng nhất)',
              value: p.randomSix.join(''),
            },
          ],
          warnings: [],
          derivedBirthYear: p.birthYear,
        };
      }
      if (p.kind === 'cmnd') {
        return {
          digits: p.digits,
          display: p.display,
          aiDisplay: maskDigits(p.digits, 4),
          letters: [],
          extras: [{ label: 'Loại giấy tờ', value: 'CMND 9 số (mẫu cũ)' }],
          warnings: [],
        };
      }
      return {
        digits: p.digits,
        display: p.display,
        aiDisplay: maskDigits(p.digits, 4),
        letters: p.letters,
        extras: [
          {
            label: 'Ký tự chữ',
            value: p.letters
              .map((l) => `${l.letter}=${l.alphaIndex}→quy về ${l.reduced}`)
              .join(', '),
          },
          { label: 'Loại giấy tờ', value: 'Hộ chiếu' },
        ],
        warnings: [],
      };
    }
    case 'the_atm': {
      const p = parseCard(raw);
      if ('error' in p) return p;
      const warnings: string[] = [];
      if (!p.luhnOk)
        warnings.push(
          'Dãy thẻ KHÔNG qua kiểm tra Luhn — có thể nhập nhầm một chữ số. Kiểm tra lại trước khi luận.',
        );
      return {
        digits: p.coreDigits,
        display: p.display,
        aiDisplay: maskDigits(p.digits, 4),
        letters: [],
        extras: [
          {
            label: 'BIN ngân hàng (6 số đầu — không luận vận)',
            value: p.bin,
          },
          { label: 'Kiểm tra Luhn', value: p.luhnOk ? 'Hợp lệ ✓' : 'Không hợp lệ ✗' },
          { label: '4 số cuối', value: p.last4 },
        ],
        warnings,
      };
    }
    case 'gia_ban': {
      const p = parseMoney(raw);
      if ('error' in p) return p;
      return {
        digits: p.significantDigits,
        display: p.display,
        aiDisplay: p.display,
        letters: [],
        extras: [
          {
            label: 'Phần số có nghĩa (dùng để luận)',
            value: p.significantDigits.join(''),
          },
        ],
        warnings: [],
        moneyAmount: p.amount,
      };
    }
    case 'ma_so_thue': {
      const p = parseTaxCode(raw);
      if ('error' in p) return p;
      const extras: { label: string; value: string }[] = [];
      if (p.branch)
        extras.push({
          label: 'Mã chi nhánh (3 số cuối sau dấu gạch)',
          value: p.branch.join(''),
        });
      return {
        digits: p.base,
        display: p.display,
        aiDisplay: p.display,
        letters: [],
        extras,
        warnings: [],
      };
    }
    default: {
      // tai_khoan, so_nha, ma_nhan_vien, so_phong, mat_khau, so_ghe:
      // chuỗi số có thể kèm chữ — tách chữ riêng, luận phần số
      const p = parseAlnum(raw);
      if (p.digits.length === 0)
        return { error: 'Không tìm thấy chữ số nào trong dữ liệu nhập.' };
      const cfgMin = topic === 'tai_khoan' ? 6 : 1;
      if (p.digits.length < cfgMin)
        return {
          error: `Dãy số quá ngắn cho ${cfg.dataLabel} (cần tối thiểu ${cfgMin} chữ số).`,
        };
      const extras: { label: string; value: string }[] = [];
      if (p.letters.length)
        extras.push({
          label: 'Chữ cái tách riêng (tham khảo quái)',
          value: p.letters
            .map((l) => `${l.letter}=${l.alphaIndex}→quy về ${l.reduced}`)
            .join(', '),
        });
      const secure = cfg.secure;
      return {
        digits: p.digits,
        display: p.display,
        aiDisplay: secure
          ? maskDigits(p.digits, topic === 'mat_khau' ? 0 : 4)
          : p.display,
        letters: p.letters,
        extras,
        warnings: [],
      };
    }
  }
}

/* ============ Phân tích theo chủ đề ============ */

export type BatCucTopicAnalysis =
  | { mode: 'full'; full: BatCucAnalysis }
  | { mode: 'short'; short: ShortAnalysis };

export function analyzeBatCucTopic(
  topic: BatCucTopicId,
  parsed: BatCucParsedInput,
  birthYear?: number,
): BatCucTopicAnalysis | { error: string } {
  const cfg = BAT_CUC_TOPICS[topic];
  const year = parsed.derivedBirthYear ?? birthYear;
  const full = analyzeBatCuc(parsed.digits, {
    applyTailTaboo: cfg.applyTailTaboo,
    birthYear: year,
  });
  if (!('error' in full) && full.pairs.length >= 2) {
    return { mode: 'full', full };
  }
  if (cfg.shortMode || parsed.digits.length <= 5) {
    return { mode: 'short', short: analyzeShortNumber(parsed.digits, year) };
  }
  if ('error' in full) return full;
  return { mode: 'full', full };
}

/* ============ Gợi ý giá đẹp (±3%) ============ */

export interface PriceSuggestion {
  amount: number;
  display: string;
  score: number;
  tailStar?: string;
  note: string;
}

export function suggestNicePrices(
  amount: number,
  count = 5,
): PriceSuggestion[] {
  if (!Number.isFinite(amount) || amount < 100) return [];
  const len = String(Math.round(amount)).length;
  // giữ tối đa 3–4 chữ số có nghĩa để giá "tròn" bán được
  const step = Math.pow(10, Math.max(0, len - 4));
  const lo = Math.ceil((amount * 0.97) / step) * step;
  const hi = Math.floor((amount * 1.03) / step) * step;
  const out: PriceSuggestion[] = [];
  for (let v = lo; v <= hi; v += step) {
    const sig = String(v).replace(/0+$/, '') || '0';
    const digits = sig.split('').map(Number);
    let score = 0;
    let tailStar: string | undefined;
    let note = '';
    const full = analyzeBatCuc(digits, { applyTailTaboo: true });
    if (!('error' in full) && full.pairs.length >= 1) {
      score = full.duNienScore;
      const last = full.pairs[full.pairs.length - 1];
      tailStar = last.star.nameVi;
      if (last.star.id === 'thien_y' || last.star.id === 'dien_nien')
        score += 10;
      score = Math.min(100, score);
      note = `${last.star.nameVi} đóng cuối — ${last.star.tagline}`;
    } else {
      const short = analyzeShortNumber(digits);
      score = short.overallScore;
      note = short.notes[0] ?? '';
    }
    // đuôi 0 của phần có nghĩa (vd 1.990.000 → 199) không tính; xét chữ số cuối dãy đầy đủ
    out.push({
      amount: v,
      display: formatMoney(v),
      score: Math.round(score),
      tailStar,
      note,
    });
  }
  out.sort((a, b) => b.score - a.score || Math.abs(a.amount - amount) - Math.abs(b.amount - amount));
  return out.slice(0, count);
}

/* ============ Ngữ cảnh AI ============ */

function fullAnalysisLines(a: BatCucAnalysis, hideDigits = false): string[] {
  const lines: string[] = [
    '## Chuỗi cặp quái số (theo thứ tự trên dãy)',
    ...a.pairs.map(
      (p, i) =>
        `- Cặp ${i + 1}: ${hideDigits ? '(đã che)' : `${p.raw} → quái ${p.label}`} = ${p.star.nameVi} (${p.star.nameHan}, ${p.star.kind === 'cat' ? 'CÁT' : 'HUNG'}) · cường độ ${p.levelLabel} (${p.dongTinh}) · điểm hiệu dụng ${p.effectiveScore}/100${p.isTail ? ' · thuộc PHẦN ĐUÔI' : ''}${p.modifierNote ? ` · ${p.modifierNote}` : ''}`,
    ),
    '',
    '## Thống kê sao',
    ...STAR_ORDER.filter((id) => a.starCounts[id] > 0).map(
      (id) =>
        `- ${STARS[id].nameVi}: ${a.starCounts[id]} cặp — ${STARS[id].chuVe}`,
    ),
    `- Tổng: ${a.catPairs} cặp cát · ${a.hungPairs} cặp hung`,
    '',
  ];
  if (a.combos.length) {
    lines.push(
      '## Tổ hợp chế hóa / cộng hưởng',
      ...a.combos.map(
        (c) =>
          `- [${c.kind === 'cat' ? 'CÁT' : c.kind === 'che_hoa' ? 'CHẾ HÓA' : 'HUNG'}] ${c.title} (${c.pairs}): ${c.detail}`,
      ),
      '',
    );
  }
  lines.push(
    '## Phần đuôi (quyết định mạnh nhất)',
    hideDigits ? '- 3 số cuối: (đã che)' : `- 3 số cuối: ${a.tail.last3}`,
    ...(a.tail.warning ? [`- CẢNH BÁO: ${a.tail.warning}`] : []),
    ...a.tail.notes.map((n) => `- ${n}`),
    '',
    '## Điểm số',
    `- Điểm Du Niên: ${a.duNienScore}/100`,
    ...(hideDigits
      ? []
      : [
          `- Âm dương: ${a.amCount} chẵn / ${a.duongCount} lẻ (điểm cân bằng ${a.amDuongScore}/100)`,
          `- Tổng số ${a.tongSo} → tổng nút ${a.tongNut}`,
        ]),
    '',
    '## Năm phương diện (0–100)',
    ...a.aspects.map((x) => `- ${x.label}: ${x.score}`),
    '',
    `## Dạng hình thức: ${a.patterns.join('; ')}`,
  );
  if (a.napAm && a.elementRelation) {
    lines.push(
      '',
      '## Hợp mệnh Nạp Âm',
      `- Năm sinh ${a.birthYear}: mệnh ${a.napAm.name} (hành ${elementLabel(a.napAm.element)})`,
      `- Hành đại diện dãy số: ${elementLabel(a.elementRelation.sim)} → ${a.elementRelation.relation} (điểm ${a.elementRelation.score}/100)`,
    );
  }
  return lines;
}

function shortAnalysisLines(a: ShortAnalysis, hideDigits = false): string[] {
  const lines: string[] = [
    '## Luận từng chữ số (chế độ dãy ngắn)',
    ...a.digitMeanings.map(
      (m, i) =>
        `- ${hideDigits ? `Vị trí ${i + 1} (đã che)` : `Số ${m.digit}`}: ${m.quai} · hành ${m.elementLabel} — ${m.nature} (dân gian: ${m.folk})`,
    ),
    '',
  ];
  if (a.pairs.length) {
    lines.push(
      '## Cặp quái tách được',
      ...a.pairs.map(
        (p) =>
          `- ${hideDigits ? '(đã che)' : `${p.raw} → ${p.label}`} = ${p.star.nameVi} (${p.star.kind === 'cat' ? 'CÁT' : 'HUNG'}) · ${p.star.tagline}${p.modifierNote ? ` · ${p.modifierNote}` : ''}`,
      ),
      '',
    );
  }
  if (a.combos.length) {
    lines.push(
      '## Tổ hợp',
      ...a.combos.map((c) => `- ${c.title}: ${c.detail}`),
      '',
    );
  }
  lines.push(
    '## Tổng hợp',
    ...(hideDigits
      ? []
      : [
          `- Tổng số ${a.tongSo} → tổng nút ${a.tongNut}`,
          `- Âm dương: ${a.amCount} chẵn / ${a.duongCount} lẻ`,
        ]),
    ...a.notes.map((n) => `- ${n}`),
  );
  if (a.napAm && a.elementRelation) {
    lines.push(
      '',
      '## Hợp mệnh Nạp Âm',
      `- Năm sinh ${a.birthYear}: mệnh ${a.napAm.name} (hành ${elementLabel(a.napAm.element)})`,
      `- ${a.elementRelation.relation} (điểm ${a.elementRelation.score}/100)`,
    );
  }
  return lines;
}

/**
 * Dựng khối ngữ cảnh gửi AI. Với chủ đề secure, dãy gốc đã được mask
 * (aiDisplay) — tuyệt đối không đưa digits thô vào đây.
 */
export function buildBatCucPromptContext(
  topic: BatCucTopicId,
  parsed: BatCucParsedInput,
  analysis: BatCucTopicAnalysis,
  priceSuggestions?: PriceSuggestion[],
): string {
  const cfg = BAT_CUC_TOPICS[topic];
  const lines: string[] = [
    `# DỮ LIỆU ÂM DƯƠNG NGŨ HÀNH · KINH DỊCH DIỆU LUẬN — ${cfg.title.toUpperCase()}`,
    '',
    `- Loại dãy số: ${cfg.dataLabel}`,
    `- Dãy số${cfg.secure ? ' (đã che bảo mật)' : ''}: ${parsed.aiDisplay}`,
  ];
  if (parsed.letters.length) {
    lines.push(
      `- Chữ cái tách riêng (không thuộc chuỗi cặp quái số, chỉ tham khảo): ${parsed.letters
        .map((l) => `${l.letter}=${l.alphaIndex}→quy về ${l.reduced}`)
        .join(', ')}`,
    );
  }
  for (const e of parsed.extras) {
    if (cfg.secure && /số cuối|BIN|Luhn/i.test(e.label) === false && /\d{6,}/.test(e.value))
      continue; // không lộ dãy dài trong chủ đề bảo mật
    lines.push(`- ${e.label}: ${e.value}`);
  }
  for (const w of parsed.warnings) lines.push(`- LƯU Ý NHẬP LIỆU: ${w}`);
  lines.push('');
  // Mật khẩu / PIN: che cả các cặp số trong bảng phân tích, chỉ giữ tên sao
  const hideDigits = topic === 'mat_khau';
  if (analysis.mode === 'full') {
    lines.push(...fullAnalysisLines(analysis.full, hideDigits));
    lines.push(
      '',
      `## Kết luận máy tính sẵn: ${analysis.full.overallScore}/100 (${verdictLabel(analysis.full.verdict)})`,
    );
  } else {
    lines.push(...shortAnalysisLines(analysis.short, hideDigits));
    lines.push(
      '',
      `## Kết luận máy tính sẵn: ${analysis.short.overallScore}/100 (${verdictLabel(analysis.short.verdict)})`,
    );
  }
  if (priceSuggestions?.length) {
    lines.push(
      '',
      '## Các mức giá đẹp lân cận (±3%, máy đã xếp hạng)',
      ...priceSuggestions.map(
        (s) =>
          `- ${s.display} — điểm ${s.score}${s.tailStar ? ` · sao cuối ${s.tailStar}` : ''}${s.note ? ` · ${s.note}` : ''}`,
      ),
    );
  }
  lines.push(
    '',
    `## Phương diện cần nhấn mạnh khi luận: ${cfg.aspectFocus.map((a) => ASPECT_LABELS[a]).join(' · ')}`,
  );
  return lines.filter((l) => l !== undefined).join('\n');
}

export function verdictLabel(
  v: 'tot' | 'kha' | 'trung_binh' | 'yeu',
): string {
  return v === 'tot'
    ? 'Tốt'
    : v === 'kha'
      ? 'Khá'
      : v === 'trung_binh'
        ? 'Trung bình'
        : 'Yếu';
}
