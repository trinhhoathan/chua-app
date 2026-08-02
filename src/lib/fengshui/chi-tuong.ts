/**
 * Chỉ tướng (tướng bàn tay) — engine luận giải tất định.
 *
 * Khung thủ tướng theo mạch Đông – Tây đã Việt hóa lâu đời:
 * - Thủ hình ngũ hành: xếp bàn tay vào 5 hình Kim · Mộc · Thủy · Hỏa · Thổ.
 * - Ba đường chính: Tâm đạo (tình cảm) · Trí đạo (trí tuệ) · Sinh đạo
 *   (sinh lực) — trục xương sống của mọi phép xem tay.
 * - Đường phụ trọng yếu: Định Mệnh (sự nghiệp), Hôn Nhân.
 * - Bát gò (mounts): Kim Tinh, Mộc Tinh, Thổ Tinh, Thái Dương, Thủy Tinh,
 *   Thái Âm… — kho "vốn trời cho" của từng mặt đời sống.
 * - Ngón cái: chủ ý chí và lý trí — cổ nhân xem trước tiên.
 *
 * Phép xem tay: cổ truyền dùng "nam tả nữ hữu" (nam tay trái, nữ tay phải);
 * lối xem phổ biến hiện nay: tay KHÔNG thuận là tiên thiên (vốn bẩm sinh),
 * tay THUẬN là hậu thiên (hiện tại và tự mình gây dựng) — nên quan sát tay
 * thuận làm chính, đối chiếu tay kia.
 *
 * Người xem tự quan sát và chọn mô tả gần nhất; engine tổng hợp thành điểm
 * 5 phương diện và bài luận từng bộ vị. Mọi tính toán chạy trên máy.
 */

import {
  ASPECT_LABELS,
  ASPECT_ORDER,
  type NhanTuongAspectId,
  type NhanTuongGender,
} from './nhan-tuong';

export type ChiTuongAspectId = NhanTuongAspectId;
export type ChiTuongGender = NhanTuongGender;
export { ASPECT_LABELS, ASPECT_ORDER };

export interface ChiTuongEffect {
  aspect: ChiTuongAspectId;
  /** -2 (rất bất lợi) … +2 (rất đắc cách) */
  delta: -2 | -1 | 1 | 2;
  /** Câu giải thích ngắn, tự đứng được. */
  note: string;
}

export interface ChiTuongOption {
  id: string;
  label: string;
  /** Mô tả nhận biết — người xem đối chiếu trên chính bàn tay mình. */
  hint: string;
  /** Bài luận chi tiết theo lựa chọn này. */
  luan: string;
  effects: ChiTuongEffect[];
  advice?: string;
}

export type ChiTuongFeatureId =
  | 'banTay'
  | 'ngonCai'
  | 'tamDao'
  | 'triDao'
  | 'sinhDao'
  | 'dinhMenh'
  | 'honNhan'
  | 'goNoiBat';

export interface ChiTuongFeatureDef {
  id: ChiTuongFeatureId;
  title: string;
  /** Tên gọi cổ truyền / vị trí. */
  viTri?: string;
  intro: string;
  options: ChiTuongOption[];
}

// ---------------------------------------------------------------------------
// 1. Thủ hình ngũ hành
// ---------------------------------------------------------------------------

const BAN_TAY: ChiTuongFeatureDef = {
  id: 'banTay',
  title: 'Hình bàn tay (Thủ hình ngũ hành)',
  intro:
    'Trước khi xem đường chỉ, tướng pháp xem "thủ hình" — dáng tổng thể của bàn tay, xếp vào 5 hình Kim · Mộc · Thủy · Hỏa · Thổ. Thủ hình là cái nền: cùng một đường chỉ, mỗi thủ hình lại phát huy một kiểu.',
  options: [
    {
      id: 'kim',
      label: 'Kim hình — tay vuông, ngón vuông',
      hint: 'Lòng bàn tay gần vuông, ngón tay đầu vuông, da chắc, gân xương gọn — nhìn tổng thể vuông vức.',
      luan: 'Tay Kim hình là tay của người thực tế, kỷ luật và đáng tin: nói ít làm nhiều, việc giao là xong, ghét sự mập mờ. Hợp quản trị, kỹ thuật, tài chính, pháp lý — những nghề cần chuẩn xác và nguyên tắc. Tiền bạc quản lý chặt, ít khi để thất thoát. Điểm cần bù: khô khan cứng nhắc, ngại thay đổi — trong nhà nên tập nói lời mềm, trong việc nên chừa chỗ cho cái mới.',
      effects: [
        { aspect: 'quan_loc', delta: 2, note: 'Tay Kim vuông vức — làm việc chuẩn xác, chữ tín cao, được giao trọng trách.' },
        { aspect: 'tai_bach', delta: 1, note: 'Quản tiền chặt chẽ, chi tiêu có kỷ luật — của tích được.' },
        { aspect: 'tinh_duyen', delta: -1, note: 'Thiên lý trí, ít lời ngọt — tình cảm cần chủ động vun bằng hành động ấm.' },
      ],
      advice: 'Kim quý ở biết mềm đúng lúc: mỗi tuần một việc "phá lệ" nho nhỏ cho người thân — nguyên tắc trong việc, khoan hòa trong nhà.',
    },
    {
      id: 'moc',
      label: 'Mộc hình — tay dài gầy, đốt rõ',
      hint: 'Lòng bàn tay dài, ngón dài, các đốt ngón nổi rõ, gân hiện — nhìn thanh gầy như cành cây.',
      luan: 'Tay Mộc hình là tay của người ưa suy nghĩ, phân tích và tìm hiểu tận gốc: đọc sâu, hỏi kỹ, không tin điều chưa kiểm chứng. Hợp nghiên cứu, giáo dục, kỹ thuật chuyên sâu, viết lách, triết lý. Tiền tài đến từ tri thức, chậm mà bền. Điểm cần bù: nghĩ nhiều hơn làm, cầu toàn dễ bỏ lỡ thời cơ; sức khỏe hao ở thần kinh — ngủ đủ là thuốc bổ số một.',
      effects: [
        { aspect: 'quan_loc', delta: 1, note: 'Tư duy sâu, tiến thân bằng chuyên môn — danh đến trước lợi.' },
        { aspect: 'tai_bach', delta: 1, note: 'Lộc tri thức — thu nhập bền theo độ sâu nghề nghiệp.' },
        { aspect: 'suc_khoe', delta: -1, note: 'Hao thần kinh vì nghĩ nhiều — cần ngủ đủ, vận động cho thoát khí.' },
      ],
      advice: 'Đặt hạn chót cho mọi cân nhắc: nghĩ chín rồi phải quyết — cây tốt là cây vừa có rễ sâu vừa dám vươn cành.',
    },
    {
      id: 'thuy',
      label: 'Thủy hình — tay mềm, thịt nhuận',
      hint: 'Bàn tay mềm mại, thịt đầy nhuận, ngón thon tròn, da mịn ẩm — bắt tay thấy êm.',
      luan: 'Tay Thủy hình là tay giao thiệp: nhạy cảm với người, khéo ăn nói, biết chiều lòng — đi buôn, làm dịch vụ, ngoại giao, chăm sóc khách hàng như cá gặp nước. Tình cảm phong phú, sống thiên về cảm xúc. Tiền vào từ nhiều nguồn quan hệ, nhưng cũng dễ vì cả nể mà hao: cho vay, bao chi, mua theo cảm hứng. Cần "đắp đê" cho dòng nước: kỷ luật tích lũy và biết từ chối.',
      effects: [
        { aspect: 'tai_bach', delta: 2, note: 'Tài khí lưu thông theo quan hệ — nguồn thu đa dạng, kiếm tiền nhạy.' },
        { aspect: 'tinh_duyen', delta: 1, note: 'Tinh tế biết chiều lòng — có duyên, được người thương mến.' },
        { aspect: 'phuc_duc', delta: -1, note: 'Cả nể khó từ chối — dễ hao tâm hao của vì chuyện người ngoài.' },
      ],
      advice: 'Học một câu từ chối tử tế và trích quỹ tích lũy tự động — nước có hồ chứa mới thành của.',
    },
    {
      id: 'hoa',
      label: 'Hỏa hình — ngón thon nhọn, da hồng ấm',
      hint: 'Ngón tay thon dần và nhọn ở đầu, da hồng, tay ấm nóng, cử động nhanh linh hoạt.',
      luan: 'Tay Hỏa hình là tay của cảm hứng: nhiệt huyết, thẩm mỹ tốt, bắt nhịp xu hướng nhanh — hợp nghệ thuật, truyền thông, sáng tạo, kinh doanh theo trend. Nói chuyện có lửa, dễ truyền cảm hứng cho người khác. Nhược ở chỗ nhiệt lên nhanh nguội nhanh: dự án hay bỏ dở giữa chừng, chi tiêu bốc đồng, tình cảm dễ nồng dễ nhạt. Đắc cách khi có đối tác trầm ổn giữ nhịp cùng.',
      effects: [
        { aspect: 'quan_loc', delta: 1, note: 'Có lửa truyền cảm hứng — dễ bật lên trong nghề sáng tạo, đám đông.' },
        { aspect: 'tai_bach', delta: -1, note: 'Chi tiêu bốc đồng theo cảm hứng — cần người/quy tắc giữ két.' },
        { aspect: 'tinh_duyen', delta: -1, note: 'Nồng nhanh nhạt nhanh — tình cảm cần rèn sự bền bỉ.' },
      ],
      advice: 'Quy tắc "3 ngày": thích gì lớn hơn một khoản định sẵn, đợi 3 ngày còn thích hãy mua; dự án nào khởi thì viết cam kết ngày hoàn thành.',
    },
    {
      id: 'tho',
      label: 'Thổ hình — tay dày ngắn, chắc nịch',
      hint: 'Bàn tay dày, ngón hơi ngắn, thịt chắc, da hơi thô — bắt tay thấy đầm và ấm sức.',
      luan: 'Tay Thổ hình là tay của người bền gan: chịu khó, thật thà, đã hứa là làm đến nơi. Hợp sản xuất, nông nghiệp, xây dựng, bất động sản, nghề tay nghề — càng làm lâu càng lên tay, của cải tích như đất bồi. Người tay Thổ được quý ở chữ tín và sự ổn định; hôn nhân thiên bền. Điểm cần bù: chậm thích nghi, ngại nói — quyền lợi của mình đôi khi phải biết mở miệng giữ lấy.',
      effects: [
        { aspect: 'tai_bach', delta: 2, note: 'Đất bồi từng lớp — của cải tích lũy chắc, có duyên với tài sản hữu hình.' },
        { aspect: 'tinh_duyen', delta: 1, note: 'Thật thà chung thủy — gia đạo êm, hôn nhân bền.' },
        { aspect: 'quan_loc', delta: -1, note: 'Ít nói, ngại thể hiện — dễ bị bỏ sót khi cất nhắc, cần học cách trình bày công sức.' },
      ],
      advice: 'Mỗi quý một lần chủ động báo cáo thành quả với cấp trên / đối tác — đất tốt cũng cần người biết đến.',
    },
  ],
};

// ---------------------------------------------------------------------------
// 2. Ngón cái
// ---------------------------------------------------------------------------

const NGON_CAI: ChiTuongFeatureDef = {
  id: 'ngonCai',
  title: 'Ngón cái',
  viTri: 'Đốt ngoài chủ ý chí, đốt trong chủ lý trí',
  intro:
    'Cổ nhân xem tay thường nhìn ngón cái trước tiên: ngón cái là "cột cờ" của ý chí và lý trí. Đốt ngoài (có móng) chủ ý chí, đốt trong chủ suy xét — hai đốt cân nhau là quý.',
  options: [
    {
      id: 'dai_cung',
      label: 'Dài, cứng cáp, hai đốt cân',
      hint: 'Ngón cái dài (khép vào chạm quá nửa đốt dưới ngón trỏ), cứng, khó bẻ ngửa, hai đốt cân nhau.',
      luan: 'Ngón cái dài cứng là tướng tự chủ: có chính kiến, chịu trách nhiệm về quyết định của mình, không dễ bị lung lạc bởi lời bàn ra tán vào. Ý chí và lý trí cân nhau nên nghĩ được là làm được — nền tảng của mọi thành tựu dài hạn. Người ngón cái tốt thường tự đứng ra gây dựng và giữ vững được cơ nghiệp.',
      effects: [
        { aspect: 'quan_loc', delta: 2, note: 'Ý chí vững, tự chủ cao — dám quyết dám chịu, cầm được việc lớn.' },
        { aspect: 'tai_bach', delta: 1, note: 'Không bị lung lạc theo đám đông — giữ được tiền trước lời mời gọi.' },
      ],
    },
    {
      id: 'can_doi',
      label: 'Vừa phải, dẻo vừa',
      hint: 'Ngón cái độ dài trung bình, độ cứng vừa — bẻ nhẹ có nhún nhưng không ngửa hẳn.',
      luan: 'Ngón cái cân đối là cách trung hòa đáng quý: có lập trường nhưng biết nghe, cứng đúng lúc mềm đúng chỗ. Làm việc nhóm thuận, làm chủ cũng được — thiếu cái bốc của người ngón cứng nhưng cũng tránh được cái gãy của người cố chấp. Vận nghiệp tiến đều theo tích lũy.',
      effects: [
        { aspect: 'quan_loc', delta: 1, note: 'Cứng mềm đúng nhịp — hợp cả vai trò dẫn dắt lẫn phối hợp.' },
      ],
    },
    {
      id: 'ngan_mem',
      label: 'Ngắn hoặc mềm, dễ bẻ ngửa',
      hint: 'Ngón cái ngắn, hoặc mềm dễ uốn cong ngửa ra sau.',
      luan: 'Ngón cái ngắn mềm chủ người dễ tính, rộng rãi, sống thuận theo hoàn cảnh — người xung quanh thấy dễ chịu, ít va chạm. Mặt trái là thiếu quyết: hay theo ý người khác rồi tiếc, tiền bạc dễ vì nể nang mà cho vay, bao chi. Không phải tướng xấu — là tướng "thuận nước đẩy thuyền", chỉ cần dựng cho mình vài nguyên tắc bất di bất dịch là vận vững hẳn lên.',
      effects: [
        { aspect: 'quan_loc', delta: -1, note: 'Dễ xuôi theo ý người — quyết định lớn nên tự cho mình một đêm suy nghĩ.' },
        { aspect: 'tai_bach', delta: -1, note: 'Nể nang khó từ chối — tiền cho vay vì tình dễ thành tiền mất.' },
      ],
      advice: 'Đặt 3 nguyên tắc "không bao giờ" (ví dụ: không cho vay quá X, không quyết trong ngày, không ký thay ai) — ngón cái mềm thì nguyên tắc phải cứng.',
    },
  ],
};

// ---------------------------------------------------------------------------
// 3. Ba đường chính
// ---------------------------------------------------------------------------

const TAM_DAO: ChiTuongFeatureDef = {
  id: 'tamDao',
  title: 'Đường Tâm đạo (đường tình cảm)',
  viTri: 'Đường nằm trên cùng, chạy từ mé bàn tay (dưới ngón út) về phía ngón trỏ',
  intro:
    'Tâm đạo chủ đời sống tình cảm, cách yêu thương và cả nhịp tim mạch. Xem ba điểm: độ dài (kết thúc ở đâu), độ sâu rõ, và dạng đường (liền mạch hay chuỗi xích, chẻ nhánh).',
  options: [
    {
      id: 'dai_cong_len',
      label: 'Dài, cong lên, kết thúc khoảng giữa ngón trỏ và giữa',
      hint: 'Đường sâu rõ, liền mạch, cong dần lên và dừng ở khoảng dưới kẽ ngón trỏ – ngón giữa.',
      luan: 'Đây là chính cách của Tâm đạo: tình cảm ấm áp, chân thành và cân bằng — yêu hết lòng nhưng không mù quáng, biết bày tỏ và biết giữ. Hôn nhân thiên về êm ấm bền lâu; trong giao tiếp là người được tin cậy tâm sự. Tâm đạo tốt còn chủ khí huyết thuận, tinh thần lạc quan — nền của phúc thọ.',
      effects: [
        { aspect: 'tinh_duyen', delta: 2, note: 'Tâm đạo đắc cách — yêu thương cân bằng, hôn nhân thiên bền ấm.' },
        { aspect: 'phuc_duc', delta: 1, note: 'Sống có tình có nghĩa — nhân duyên lành tụ quanh mình.' },
        { aspect: 'suc_khoe', delta: 1, note: 'Khí huyết thuận, tinh thần lạc quan — nền tim mạch tốt.' },
      ],
    },
    {
      id: 'thang_dai',
      label: 'Thẳng và dài về phía ngón trỏ',
      hint: 'Đường khá thẳng, ít cong, chạy dài về phía gò dưới ngón trỏ.',
      luan: 'Tâm đạo thẳng dài chủ người yêu bằng lý trí và trách nhiệm: đã nhận lời là gánh vác đến cùng, chung thủy kiểu bổn phận. Trong hôn nhân là chỗ dựa chắc, nhưng ít lãng mạn, ít nói lời ngọt — người bạn đời giàu cảm xúc dễ thấy thiếu. Tình cảm kiểu này bền, chỉ cần thêm chút "gia vị" chủ động: món quà nhỏ, lời khen thật lòng.',
      effects: [
        { aspect: 'tinh_duyen', delta: 1, note: 'Chung thủy trách nhiệm — hôn nhân có chỗ dựa chắc chắn.' },
        { aspect: 'quan_loc', delta: 1, note: 'Lý trí điềm đạm cả trong quan hệ — làm việc với ai cũng giữ được mực.' },
      ],
      advice: 'Lãng mạn cũng là một bổn phận: định kỳ tạo một niềm vui nhỏ cho người thương — tình bền cần cả lửa nhỏ liu riu.',
    },
    {
      id: 'ngan_mo',
      label: 'Ngắn hoặc mờ, dừng dưới ngón giữa',
      hint: 'Đường ngắn, dừng sớm ở khoảng dưới ngón giữa, hoặc mảnh mờ khó thấy.',
      luan: 'Tâm đạo ngắn chủ người khép cửa cảm xúc: không phải vô tình, mà là ngại bày tỏ, đặt việc trên tình, yêu ai cũng giữ một khoảng an toàn. Người ngoài dễ đọc nhầm thành lạnh lùng thực dụng. Tình duyên vì thế chậm và kén — nhưng khi đã mở lòng thì rất thật. Bài tập của Tâm đạo ngắn là "nói ra": cảm xúc không nói ra thì người thương không thể đoán mãi được.',
      effects: [
        { aspect: 'tinh_duyen', delta: -1, note: 'Khép cửa cảm xúc — duyên đến chậm, cần chủ động bày tỏ.' },
      ],
      advice: 'Mỗi ngày nói một câu cảm xúc thật (cảm ơn, xin lỗi, thương) với người gần nhất — Tâm đạo "vẽ thêm" bằng chính lời nói.',
    },
    {
      id: 'chuoi_xich',
      label: 'Dạng chuỗi xích, nhiều mắt nhỏ',
      hint: 'Đường không liền nét mà kết bởi nhiều mắt nhỏ như dây xích, chỗ đậm chỗ nhạt.',
      luan: 'Tâm đạo chuỗi xích chủ người đa cảm, nhạy bén với thái độ của người khác — một ánh mắt, một câu nói cũng đủ nghĩ cả buổi. Tình cảm phong phú nhưng lên xuống theo tâm trạng, dễ tự làm khổ mình vì suy diễn. Về sức khỏe, dạng này nhắc giữ nhịp tim mạch và giấc ngủ — cảm xúc căng kéo lâu hại khí huyết. Tin lành: người Tâm đạo xích thường trực giác tốt và giàu lòng trắc ẩn — biết hướng năng lượng ấy vào nghệ thuật, chăm sóc người khác thì thành tài sản.',
      effects: [
        { aspect: 'tinh_duyen', delta: -1, note: 'Cảm xúc lên xuống theo tâm trạng — dễ tự suy diễn làm khổ mình.' },
        { aspect: 'suc_khoe', delta: -1, note: 'Cảm xúc căng kéo hại khí huyết — giữ giấc ngủ, tập thở đều.' },
      ],
      advice: 'Khi thấy mình suy diễn, hỏi thẳng người trong cuộc một câu — mười lần suy diễn thì chín lần sai, một câu hỏi thật gỡ được cả chuỗi xích.',
    },
    {
      id: 'nhanh_xuong',
      label: 'Đuôi chẻ nhánh cắm xuống',
      hint: 'Cuối đường (phía ngón trỏ) tách nhánh, có nhánh quặp xuống phía Trí đạo.',
      luan: 'Tâm đạo chẻ nhánh xuống theo cổ pháp chủ đường tình nhiều trắc trở phải vượt: dễ đặt lòng tin nhầm chỗ, hoặc trong hôn nhân có giai đoạn nguội lạnh, thất vọng về người mình thương. Điều cần hiểu đúng: đây là lời NHẮC chứ không phải án — nhắc chọn người bằng cả lý trí (nhánh cắm xuống Trí đạo cũng hàm ý: để lý trí tham gia vào chuyện tình cảm), và khi hôn nhân nguội thì chủ động hâm chứ đừng buông.',
      effects: [
        { aspect: 'tinh_duyen', delta: -2, note: 'Đường tình có khúc phải vượt — chọn người bằng cả con tim lẫn lý trí.' },
        { aspect: 'phuc_duc', delta: -1, note: 'Dễ đặt lòng tin nhầm chỗ — việc hệ trọng nên tham khảo người từng trải.' },
      ],
      advice: 'Trước khi trao gửi lớn (kết hôn, chung vốn với người thương), lắng nghe góp ý của 2–3 người thân sáng suốt — nhánh rẽ chỉ thành ngã rẽ khi mình đi một mình.',
    },
  ],
};

const TRI_DAO: ChiTuongFeatureDef = {
  id: 'triDao',
  title: 'Đường Trí đạo (đường trí tuệ)',
  viTri: 'Đường giữa lòng bàn tay, thường khởi cùng gốc với Sinh đạo phía trên ngón cái',
  intro:
    'Trí đạo chủ cách tư duy, năng lực trí óc và lối quyết định — không đo "thông minh nhiều ít" mà cho biết trí lực THIÊN VỀ kiểu gì: thực tế, phân tích hay tưởng tượng.',
  options: [
    {
      id: 'ro_dai_hoi_cong',
      label: 'Rõ, sâu, dài quá giữa lòng tay, hơi cong',
      hint: 'Đường liền mạch sâu rõ, chạy quá nửa lòng bàn tay, cuối hơi cong xuống nhẹ.',
      luan: 'Đây là chính cách của Trí đạo: tư duy vừa có nền thực tế vừa có độ mở sáng tạo — nhìn việc thấy cả rừng lẫn cây. Học gì cũng vào, làm gì cũng có phương pháp; đặc biệt giỏi biến ý tưởng thành kế hoạch làm được. Người Trí đạo đắc cách thường là "bộ não" của tập thể, càng gặp việc khó càng tỉnh.',
      effects: [
        { aspect: 'quan_loc', delta: 2, note: 'Trí đạo đắc cách — tư duy có phương pháp, càng việc khó càng tỉnh.' },
        { aspect: 'tai_bach', delta: 1, note: 'Biết biến ý tưởng thành kế hoạch ra tiền — ít quyết định hớ.' },
      ],
    },
    {
      id: 'thang_dai',
      label: 'Thẳng băng, chạy ngang lòng tay',
      hint: 'Đường thẳng, ít cong, chạy ngang sang phía mé bàn tay đối diện.',
      luan: 'Trí đạo thẳng dài chủ đầu óc phân tích, logic, trọng số liệu: tính toán giỏi, nhìn hợp đồng ra ngay chỗ hớ, hợp tài chính, kế toán – kiểm toán, kỹ thuật, lập trình, pháp lý. Quyết định dựa trên chứng cứ nên ít sai, nhưng thiếu bay bổng và đôi khi cứng — với người thân, đúng sai không quan trọng bằng ấm lạnh, điều này người Trí đạo thẳng hay quên.',
      effects: [
        { aspect: 'tai_bach', delta: 2, note: 'Đầu óc con số — tính toán chặt, nhìn ra chỗ hớ trước khi ký.' },
        { aspect: 'quan_loc', delta: 1, note: 'Quyết định dựa chứng cứ — được tin ở các vị trí cần chuẩn xác.' },
        { aspect: 'tinh_duyen', delta: -1, note: 'Trọng đúng sai hơn ấm lạnh — người thân cần được "thắng kiện" đôi lần.' },
      ],
    },
    {
      id: 'doc_thai_am',
      label: 'Cong dốc xuống phía gò Thái Âm',
      hint: 'Đường cong rõ, đổ dốc xuống góc dưới lòng bàn tay phía mé ngoài (gò Thái Âm).',
      luan: 'Trí đạo dốc về Thái Âm — gò của tưởng tượng — chủ đầu óc hình ảnh, trực giác và sáng tạo: hợp nghệ thuật, viết lách, thiết kế, âm nhạc, các nghề cần "thấy" cái người khác chưa thấy. Nhược là dễ mơ xa rời thực tế, tính tiền kém, cảm hứng lên thì quên cả giờ giấc. Cặp bài trùng lý tưởng của người này là một cộng sự Trí đạo thẳng.',
      effects: [
        { aspect: 'quan_loc', delta: 1, note: 'Trực giác và óc tưởng tượng mạnh — vốn quý của nghề sáng tạo.' },
        { aspect: 'tai_bach', delta: -1, note: 'Mơ nhiều tính ít — chuyện tiền nên có người/công cụ đỡ phần con số.' },
        { aspect: 'suc_khoe', delta: -1, note: 'Cảm hứng cuốn quên giờ giấc — dễ rối loạn giấc ngủ, cần khung sinh hoạt.' },
      ],
      advice: 'Đóng khung giờ sáng tạo và giờ nghỉ; giao phần sổ sách cho người tin cẩn hoặc app quản lý — để giấc mơ có đường ray.',
    },
    {
      id: 'ngan',
      label: 'Ngắn, dừng khoảng giữa lòng tay',
      hint: 'Đường rõ nhưng ngắn, dừng ở khoảng dưới ngón giữa.',
      luan: 'Trí đạo ngắn chủ lối nghĩ thực dụng, quyết nhanh: không thích vòng vo lý thuyết, học qua tay làm, ra quyết định gọn. Trong môi trường cần tốc độ (buôn bán, vận hành, hiện trường) đây là điểm mạnh thật sự. Rủi ro nằm ở những việc cần nhìn xa: đầu tư dài hạn, hợp đồng phức tạp — dễ quyết vội theo cái lợi trước mắt. Bù bằng thói quen tham khảo người nhìn xa trước việc lớn.',
      effects: [
        { aspect: 'quan_loc', delta: -1, note: 'Quyết nhanh theo cái trước mắt — việc dài hạn cần người tham mưu.' },
        { aspect: 'tai_bach', delta: 1, note: 'Nhạy việc thực tế, ra tiền nhanh trong nghề cần tốc độ.' },
      ],
      advice: 'Việc ảnh hưởng quá 1 năm (vay, đầu tư, chuyển nghề) bắt buộc hỏi ý 2 người nhìn xa trước khi quyết.',
    },
    {
      id: 'dut_dao',
      label: 'Đứt đoạn hoặc nhiều đảo (ô nhỏ)',
      hint: 'Đường bị ngắt quãng, hoặc có những vòng nhỏ như hòn đảo nằm trên đường.',
      luan: 'Trí đạo đứt đoạn / có đảo theo cổ pháp chủ trí lực có giai đoạn phân tán: từng (hoặc đang) qua những đoạn căng thẳng trí óc, mất tập trung, hay đổi ý giữa chừng. Đảo trên Trí đạo là lời nhắc chăm sóc "phần cứng": đau đầu, mất ngủ, suy nghĩ quá tải cần được xử lý tận gốc chứ đừng gồng. Vận nghiệp không hỏng vì kém trí — chỉ chậm vì trí chưa được nghỉ đúng cách.',
      effects: [
        { aspect: 'quan_loc', delta: -1, note: 'Giai đoạn phân tán, hay đổi ý — nên làm việc theo danh sách, một lúc một việc.' },
        { aspect: 'suc_khoe', delta: -1, note: 'Đảo trên Trí đạo — nhắc giữ đầu óc: ngủ đủ, bớt đa nhiệm, khám khi đau đầu kéo dài.' },
      ],
      advice: 'Ba tháng "dọn trí": mỗi ngày chốt 3 việc quan trọng nhất, tắt thông báo ngoài giờ, ngủ trước 23h — đường chỉ tay cũng nhạt đậm theo nếp sống.',
    },
  ],
};

const SINH_DAO: ChiTuongFeatureDef = {
  id: 'sinhDao',
  title: 'Đường Sinh đạo (đường sinh lực)',
  viTri: 'Đường vòng cung ôm quanh gò Kim Tinh (gốc ngón cái), chạy về phía cổ tay',
  intro:
    'Sinh đạo chủ sinh lực, sức bền và nếp sống — KHÔNG đo tuổi thọ dài ngắn như lời đồn. Sinh đạo ngắn hay đứt không có nghĩa đoản mệnh; nó nói về chất lượng năng lượng sống và những đoạn cần giữ gìn.',
  options: [
    {
      id: 'vong_rong_sau',
      label: 'Vòng cung rộng, sâu rõ, ôm gò Kim Tinh nở',
      hint: 'Đường đậm, liền mạch, vẽ vòng rộng — phần thịt gò ngón cái được ôm trọn, đầy đặn.',
      luan: 'Sinh đạo vòng rộng sâu rõ là "bình ắc-quy lớn": sinh lực dồi dào, sức bền tốt, ốm mau hồi, làm việc cường độ cao vẫn trụ được. Người sinh đạo tốt thường ham sống, nhiệt tình, truyền năng lượng cho người quanh mình — đây là vốn quý nhất để gánh sự nghiệp và gia đình. Chỉ dặn một điều: bình lớn cũng cần sạc — đừng ỷ khỏe mà tiêu xài sức vô độ.',
      effects: [
        { aspect: 'suc_khoe', delta: 2, note: 'Sinh đạo đắc cách — sinh lực dồi dào, sức bền tốt, ốm mau hồi.' },
        { aspect: 'phuc_duc', delta: 1, note: 'Năng lượng sống lan tỏa — người quanh mình được nhờ hơi ấm ấy.' },
      ],
    },
    {
      id: 'trung_binh',
      label: 'Rõ vừa, vòng cung vừa phải',
      hint: 'Đường thấy rõ nhưng không quá đậm, vòng cung không rộng không hẹp.',
      luan: 'Sinh đạo trung bình chủ sức khỏe đi theo nếp sống: giữ nếp thì khỏe, phá nếp thì xuống — cơ thể phản hồi trung thực. Đây thực ra là cách dễ sống nhất: không ỷ được vào trời cho, nên thường biết điều độ sớm và nhờ vậy bền hơn nhiều người "khỏe trời cho" mà phung phí.',
      effects: [
        { aspect: 'suc_khoe', delta: 1, note: 'Sức khỏe trung thực theo nếp sống — giữ điều độ là giữ được vốn.' },
      ],
    },
    {
      id: 'sat_ngon_cai',
      label: 'Vòng hẹp, ép sát gò ngón cái',
      hint: 'Đường vẽ vòng hẹp, ôm sát chân ngón cái — gò Kim Tinh bị thu nhỏ.',
      luan: 'Sinh đạo hẹp chủ "bình ắc-quy nhỏ": thể lực mỏng, dễ mệt khi gắng kéo dài, sức đề kháng phải chăm mới có. Người sinh đạo hẹp thường sống thiên về trí và thần hơn là sức — làm việc đầu óc tốt, nhưng kỵ nhất là thức khuya triền miên và ôm việc quá tải. Biết "liệu cơm gắp mắm" về sức lực, chia việc thành chặng ngắn, thì vẫn đi đường dài được — chậm mà không đứt.',
      effects: [
        { aspect: 'suc_khoe', delta: -1, note: 'Thể lực mỏng — chia việc thành chặng, nghỉ trước khi kiệt chứ đừng đợi kiệt mới nghỉ.' },
      ],
      advice: 'Xây "lễ nghi sạc pin": ngủ đúng giờ, vận động nhẹ đều đặn (đi bộ, khí công, yoga), ăn ấm ăn đủ — sinh đạo hẹp thì nếp sống phải rộng.',
    },
    {
      id: 'dut_mo',
      label: 'Đứt quãng hoặc mờ từng đoạn',
      hint: 'Đường có chỗ ngắt, chỗ mờ hẳn đi rồi lại hiện — không liền một mạch.',
      luan: 'Sinh đạo đứt quãng theo cổ pháp chủ những GIAI ĐOẠN sức khỏe hoặc đời sống biến động: một trận ốm phải dưỡng lâu, một lần đổi chỗ ở, đổi môi trường sống lớn. Xin nói rõ điều nhiều người hiểu lầm: sinh đạo đứt hay ngắn KHÔNG phải điềm đoản thọ — thủ tướng học đứng đắn không ai luận vậy. Chỗ đứt là lời nhắc: giai đoạn chuyển tiếp cần đi khám định kỳ, giữ nếp, đừng gồng qua loa; qua đoạn đứt, đường lại liền — vận cũng vậy.',
      effects: [
        { aspect: 'suc_khoe', delta: -1, note: 'Có giai đoạn trồi sụt — khám định kỳ và giữ nếp qua các đoạn chuyển tiếp lớn.' },
        { aspect: 'phuc_duc', delta: -1, note: 'Đời sống có lần đổi môi trường lớn — chuẩn bị trước thì biến thành cơ hội.' },
      ],
      advice: 'Đặt lịch khám tổng quát mỗi năm và một quỹ dự phòng 3–6 tháng sinh hoạt — người có "phao" thì đoạn đứt nào cũng bơi qua.',
    },
  ],
};

// ---------------------------------------------------------------------------
// 4. Đường Định Mệnh & Hôn Nhân
// ---------------------------------------------------------------------------

const DINH_MENH: ChiTuongFeatureDef = {
  id: 'dinhMenh',
  title: 'Đường Định Mệnh (đường sự nghiệp)',
  viTri: 'Đường dọc từ phía cổ tay chạy lên gò Thổ Tinh (dưới ngón giữa)',
  intro:
    'Định Mệnh đạo chủ đường nghiệp: có định hướng sớm hay muộn, ổn định hay nhiều khúc rẽ. Nhiều bàn tay không có đường này — hoàn toàn bình thường, không phải "vô định mệnh".',
  options: [
    {
      id: 'ro_thang',
      label: 'Rõ, liền mạch, chạy thẳng lên gò Thổ Tinh',
      hint: 'Đường dọc đậm rõ, ít bị cắt, chạy một mạch từ dưới lên phía ngón giữa.',
      luan: 'Định Mệnh đạo rõ thẳng chủ đường nghiệp có định hướng sớm và đi một mạch: chọn nghề, bám nghề, lên dần theo thâm niên — kiểu người "một nghề cho chín". Thường hợp môi trường có lộ trình: cơ quan, tập đoàn, nghề chuyên môn sâu. Vận nghiệp ổn định là điểm mạnh lớn; chỉ cần cảnh giác một điều: ổn quá lâu dễ ngại thay đổi khi thời thế đổi.',
      effects: [
        { aspect: 'quan_loc', delta: 2, note: 'Đường nghiệp một mạch — định hướng sớm, lên dần theo thâm niên.' },
        { aspect: 'tai_bach', delta: 1, note: 'Thu nhập ổn định theo nghiệp vững — dễ hoạch định tích lũy dài hạn.' },
      ],
    },
    {
      id: 'mo_nhat',
      label: 'Mờ nhạt, thấy không rõ',
      hint: 'Có vệt dọc nhưng mảnh, mờ, phải nhìn kỹ mới thấy.',
      luan: 'Định Mệnh đạo mờ chủ đường nghiệp linh hoạt, ít bị một khuôn cố định: sự nghiệp do tự tay nhào nặn từng chặng thay vì theo một lộ trình vạch sẵn. Người đường mờ hợp nghề tự do, kinh doanh nhỏ, đa nghề — mỗi giai đoạn một vai. Điều cần chủ động bù là "sợi chỉ đỏ": tự đặt cho mình một chuyên môn lõi xuyên suốt để các chặng cộng dồn thành sự nghiệp, thay vì rời rạc.',
      effects: [
        { aspect: 'quan_loc', delta: -1, note: 'Nghiệp linh hoạt nhiều chặng — cần một chuyên môn lõi làm sợi chỉ đỏ xuyên suốt.' },
      ],
      advice: 'Chọn một kỹ năng lõi đầu tư 10 năm dù đổi bao nhiêu việc — các chặng sẽ cộng dồn thay vì làm lại từ đầu.',
    },
    {
      id: 'nhieu_doan',
      label: 'Nhiều đoạn, đổi hướng giữa chừng',
      hint: 'Đường dọc bị ngắt thành nhiều đoạn, hoặc đang chạy thì lệch hướng sang bên.',
      luan: 'Định Mệnh đạo nhiều đoạn chủ đường nghiệp có những lần rẽ lớn: đổi nghề, đổi thành phố, làm lại từ đầu — thường 1–3 lần trong đời. Cổ pháp không coi đây là xấu: mỗi đoạn ngắt là một lần "thay ray", người khéo chuẩn bị thì mỗi lần rẽ là một lần lên. Điều tối kỵ là rẽ theo cảm hứng lúc chán việc — rẽ phải có tích lũy (tiền dự phòng, kỹ năng mới học xong) rồi mới nhảy.',
      effects: [
        { aspect: 'quan_loc', delta: -1, note: 'Có những lần rẽ nghiệp lớn — rẽ khi đã chuẩn bị, đừng rẽ lúc chán.' },
        { aspect: 'tai_bach', delta: -1, note: 'Mỗi lần thay ray dễ hụt thu nhập — cần quỹ dự phòng trước khi nhảy.' },
      ],
      advice: 'Luật "chuẩn bị 6 tháng": muốn đổi hướng, dành 6 tháng vừa làm việc cũ vừa học nghề mới + để dành đủ 6 tháng chi tiêu rồi hãy nhảy.',
    },
    {
      id: 'khong_co',
      label: 'Không thấy đường Định Mệnh',
      hint: 'Lòng bàn tay không có vệt dọc nào rõ rệt chạy lên phía ngón giữa.',
      luan: 'Không có Định Mệnh đạo — nhiều người giật mình, nhưng thủ tướng học luận rất nhẹ nhàng: chủ cuộc đời KHÔNG bị đóng khung theo một kịch bản, tự do tự viết lấy. Rất nhiều người kinh doanh tự thân, nghệ sĩ, người sống phóng khoáng không có đường này. Ưu là không bị ràng buộc; khuyết là thiếu "đường ray" nên dễ trôi nếu không tự đặt mục tiêu. Người không có Định Mệnh đạo mà ngón cái cứng, Trí đạo rõ thì tự vạch đường còn vững hơn người có sẵn đường.',
      effects: [
        { aspect: 'quan_loc', delta: -1, note: 'Không có đường ray sẵn — phải tự đặt mục tiêu từng 3–5 năm kẻo trôi.' },
        { aspect: 'phuc_duc', delta: 1, note: 'Đời không bị đóng khung — tự do chọn lối là một dạng phúc.' },
      ],
      advice: 'Mỗi năm một lần viết lại mục tiêu 3 năm tới ra giấy — người không có đường sẵn thì tờ giấy đó chính là Định Mệnh đạo.',
    },
  ],
};

const HON_NHAN: ChiTuongFeatureDef = {
  id: 'honNhan',
  title: 'Đường Hôn Nhân',
  viTri: 'Các vạch ngang nhỏ ở mé bàn tay, giữa gốc ngón út và đường Tâm đạo',
  intro:
    'Hôn Nhân đạo là các vạch ngang ngắn ở mé bàn tay dưới ngón út. Số vạch KHÔNG đếm thành "mấy đời chồng vợ" như lời đồn — nó nói về những mối gắn bó sâu và chất lượng của sự gắn bó.',
  options: [
    {
      id: 'mot_sau_ro',
      label: 'Một đường sâu, rõ, thẳng',
      hint: 'Chỉ một vạch nổi bật, đậm rõ, chạy ngang thẳng thớm.',
      luan: 'Một Hôn Nhân đạo sâu rõ là cách chuyên nhất: cả đời thường chỉ một mối gắn bó lớn, yêu chậm mà chắc, đã chọn là toàn tâm. Hôn nhân kiểu này bền theo năm tháng, tuổi càng cao nghĩa càng nặng. Người cách này kén và chậm mở lòng — đừng sốt ruột khi duyên đến muộn hơn bạn bè: muộn mà chín.',
      effects: [
        { aspect: 'tinh_duyen', delta: 2, note: 'Cách chuyên nhất — một mối gắn bó lớn, bền theo năm tháng.' },
        { aspect: 'phuc_duc', delta: 1, note: 'Toàn tâm với một người — gia đạo là hậu phương vững của mọi vận khác.' },
      ],
    },
    {
      id: 'hai_ba_ro',
      label: 'Hai – ba đường khá rõ',
      hint: 'Có 2–3 vạch thấy rõ, độ đậm gần nhau.',
      luan: 'Hai ba Hôn Nhân đạo chủ đường tình có vài mối duyên sâu trước khi (hoặc trong khi) định bến — những rung động thật lòng chứ không phải qua đường. Cổ pháp nhắc người cách này một chữ: DỨT KHOÁT. Khi đã chọn thì đóng hẳn các cửa cũ — người hai ba đường mà rõ ràng minh bạch thì hôn nhân vẫn bền như ai; lằng nhằng mới sinh chuyện.',
      effects: [
        { aspect: 'tinh_duyen', delta: -1, note: 'Vài mối duyên sâu — đã chọn bến thì phải đóng hẳn cửa cũ.' },
      ],
      advice: 'Với duyên cũ, tử tế nhưng có ranh giới rõ: minh bạch với người hiện tại là cách giữ cả phúc lẫn tình.',
    },
    {
      id: 'nhieu_mo',
      label: 'Nhiều vạch mờ, lăn tăn',
      hint: 'Nhiều vạch nhỏ mờ nằm sát nhau, không vạch nào nổi hẳn.',
      luan: 'Nhiều vạch mờ chủ người có duyên lai rai: được để ý, nhiều mối quen biết cảm tình, nhưng khó đọng thành mối sâu — một phần vì chính mình cũng chưa toàn tâm với ai. Tình duyên kiểu "nhiều nước nhưng chưa thành dòng". Muốn thành dòng phải tự đào lòng sông: bớt dàn trải, chọn một người xứng đáng rồi đầu tư thời gian thật sự — duyên sâu là duyên được nuôi, không phải duyên tự đến.',
      effects: [
        { aspect: 'tinh_duyen', delta: -1, note: 'Duyên nhiều mà nông — cần chủ động nuôi một mối cho sâu.' },
      ],
      advice: 'Bớt trò chuyện dàn trải mười người, dồn thời gian tìm hiểu kỹ một người — chất lượng thắng số lượng.',
    },
    {
      id: 'che_nhanh',
      label: 'Đường chẻ nhánh hoặc cong trễ xuống',
      hint: 'Vạch chính bị tách đôi ở cuối, hoặc đầu vạch cong quặp xuống phía Tâm đạo.',
      luan: 'Hôn Nhân đạo chẻ nhánh / trễ xuống theo cổ pháp chủ hôn nhân có giai đoạn xa cách hoặc nguội lạnh cần chủ động vun: hai người hai nhịp sống, ít giờ chung, chuyện nhỏ tích thành khoảng cách. Đây là bộ vị "sửa bằng hành động" rõ nhất trong xem tay: đường chỉ nói nguy cơ, còn vợ chồng có giờ ăn cơm chung, có chuyện để cùng cười thì nhánh chẻ nào cũng liền lại được. Nhắc thêm: giai đoạn xa nhau vì công việc (đi làm xa, tăng ca triền miên) chính là lúc cần gọi về nhà nhiều nhất.',
      effects: [
        { aspect: 'tinh_duyen', delta: -2, note: 'Có giai đoạn xa cách nguội lạnh — vun bằng giờ chung mỗi ngày, đừng để chuyện nhỏ tích thành khoảng cách.' },
      ],
      advice: 'Giữ ba nếp: một bữa cơm chung mỗi ngày (hoặc một cuộc gọi khi xa), một buổi hẹn riêng mỗi tuần, một chuyến đi chung mỗi năm.',
    },
  ],
};

// ---------------------------------------------------------------------------
// 5. Gò nổi bật
// ---------------------------------------------------------------------------

const GO_NOI_BAT: ChiTuongFeatureDef = {
  id: 'goNoiBat',
  title: 'Gò nổi bật nhất trên lòng bàn tay',
  viTri: 'Ngửa lòng tay, khum nhẹ — nhìn nghiêng xem vùng thịt nào nhô đầy nhất',
  intro:
    'Lòng bàn tay có các gò (mounts) mang tên sao: mỗi gò là một "kho vốn trời cho". Gò nào nở đầy nhất cho biết nguồn năng lực trội của cả bàn tay. Nếu các gò đều nhau, chọn "bằng phẳng cân đối".',
  options: [
    {
      id: 'kim_tinh',
      label: 'Gò Kim Tinh — gốc ngón cái',
      hint: 'Vùng thịt lớn ôm chân ngón cái nở đầy, hồng hào, đàn hồi tốt.',
      luan: 'Gò Kim Tinh nở là kho sinh lực và tình cảm: người ấm áp, nồng hậu, yêu đời sống — ăn ngon, ở đẹp, nghệ thuật, con người đều khiến họ rung động. Sức khỏe nền tốt, mau hồi phục. Trong gia đình là "bếp lửa": có họ thì nhà ấm. Cần giữ: nồng hậu quá dễ thành nuông chiều — với con cái và với chính mình.',
      effects: [
        { aspect: 'suc_khoe', delta: 1, note: 'Kim Tinh nở — sinh lực nền tốt, mau hồi phục.' },
        { aspect: 'tinh_duyen', delta: 1, note: 'Ấm áp nồng hậu — là bếp lửa giữ nhà.' },
      ],
    },
    {
      id: 'moc_tinh',
      label: 'Gò Mộc Tinh — dưới ngón trỏ',
      hint: 'Vùng dưới gốc ngón trỏ nhô đầy hơn các vùng khác.',
      luan: 'Gò Mộc Tinh nở là kho chí tiến thủ: muốn dẫn dắt, muốn được công nhận, có danh dự và lòng tự trọng cao. Đây là gò của người lãnh đạo — dám đứng ra nhận trách nhiệm, nói được người nghe. Quan lộc là mặt mạnh nhất. Cần giữ: tự trọng cao quá hóa sĩ diện, ham vị trí quá hóa mất bạn — quyền cao mà tâm khiêm mới bền.',
      effects: [
        { aspect: 'quan_loc', delta: 2, note: 'Mộc Tinh nở — chí lãnh đạo, dám nhận trách nhiệm, nói được người nghe.' },
      ],
      advice: 'Mỗi lần được khen, chia công cho ít nhất một người cùng làm — Mộc Tinh được nuôi bằng sự nể phục, không phải sự ganh tị.',
    },
    {
      id: 'tho_tinh',
      label: 'Gò Thổ Tinh — dưới ngón giữa',
      hint: 'Vùng dưới gốc ngón giữa nhô rõ.',
      luan: 'Gò Thổ Tinh nở là kho của sự nghiêm cẩn: trầm tĩnh, kỷ luật, ưa suy ngẫm, chịu được cô độc — làm nghiên cứu, kế hoạch, các nghề cần độ chín một mình rất hợp. Người Thổ Tinh trội nhìn đời thấu mà không vội nói, được việc lớn nhờ sự chắc chắn. Cần giữ: thiên trầm mặc quá dễ thành khép kín u uất — phải chủ động giữ vài mối thân tình và niềm vui đời thường.',
      effects: [
        { aspect: 'quan_loc', delta: 1, note: 'Nghiêm cẩn chắc chắn — hợp việc cần độ chín, được tin cậy lâu dài.' },
        { aspect: 'tinh_duyen', delta: -1, note: 'Thiên trầm mặc — người thân dễ thấy xa, cần chủ động gần gũi.' },
      ],
    },
    {
      id: 'thai_duong',
      label: 'Gò Thái Dương — dưới ngón áp út',
      hint: 'Vùng dưới gốc ngón áp út nhô đầy.',
      luan: 'Gò Thái Dương nở là kho của ánh sáng: thẩm mỹ, tài hoa, sức hút và cả may mắn về danh tiếng — làm gì cũng dễ được chú ý, khen ngợi. Hợp nghệ thuật, trình diễn, thương hiệu cá nhân, các nghề "đứng dưới đèn". Tiền tài thường theo danh mà đến. Cần giữ: ưa được khen là con dao hai lưỡi — nghe lời thật mất lòng mới giữ được tài năng đi đường dài.',
      effects: [
        { aspect: 'phuc_duc', delta: 1, note: 'Thái Dương nở — có sức hút, quý nhân và may mắn về danh tiếng.' },
        { aspect: 'tai_bach', delta: 1, note: 'Danh kéo lợi — tiền tài theo tên tuổi mà về.' },
      ],
    },
    {
      id: 'thuy_tinh',
      label: 'Gò Thủy Tinh — dưới ngón út',
      hint: 'Vùng dưới gốc ngón út nhô đầy.',
      luan: 'Gò Thủy Tinh nở là kho của tài kinh doanh và ăn nói: nhạy với cơ hội, tính nhanh, thương thuyết giỏi, buôn bán có duyên — tiền như biết đường tìm đến người Thủy Tinh trội. Cũng là gò của khoa học ứng dụng và y — nghề nào cần nhanh trí và khéo giao tiếp đều hợp. Cần giữ: nhanh quá dễ thành khôn lỏi trong mắt người khác — chữ tín phải đặt trước cái lợi thì lộc Thủy Tinh mới dài.',
      effects: [
        { aspect: 'tai_bach', delta: 2, note: 'Thủy Tinh nở — nhạy cơ hội, giỏi thương thuyết, tiền tìm đến tay.' },
      ],
      advice: 'Mỗi thương vụ tự hỏi: "10 năm nữa người này còn muốn làm ăn với mình không?" — đó là la bàn của người Thủy Tinh trội.',
    },
    {
      id: 'thai_am',
      label: 'Gò Thái Âm — mé ngoài, phía dưới',
      hint: 'Vùng mé bàn tay đối diện ngón cái, phía gần cổ tay, nhô đầy.',
      luan: 'Gò Thái Âm nở là kho của tưởng tượng và trực giác: mơ mộng, nhạy cảm với cái đẹp, linh cảm thường đúng, ưa xê dịch — hợp sáng tác, du lịch, tâm lý, các nghề cần "cảm" được người và không gian. Người Thái Âm trội sống nội tâm phong phú, một mình không chán. Cần giữ: mơ nhiều phải có neo — công việc ổn định hoặc người đồng hành thực tế; và đừng để nhạy cảm thành lo âu.',
      effects: [
        { aspect: 'phuc_duc', delta: 1, note: 'Trực giác và nội tâm phong phú — linh cảm thường mách đúng đường.' },
        { aspect: 'suc_khoe', delta: -1, note: 'Nhạy cảm dễ thành lo nghĩ — cần vận động ngoài trời cho thoát khí.' },
      ],
    },
    {
      id: 'bang_phang',
      label: 'Các gò đều nhau, không gò nào trội',
      hint: 'Lòng bàn tay tương đối phẳng đều, không vùng nào nhô hẳn.',
      luan: 'Các gò cân đều chủ người ôn hòa, không thái quá ở mặt nào: làm được nhiều vai, thích nghi tốt, ít cực đoan — kiểu người "nước nào cũng chèo được thuyền". Không có kho vốn trội đồng nghĩa thành tựu đến từ tổng hòa và sự bền bỉ thay vì một tài lẻ xuất chúng. Cách này hợp quản lý tổng hợp, vận hành, các vai trò cần cân bằng nhiều bên.',
      effects: [
        { aspect: 'phuc_duc', delta: 1, note: 'Ôn hòa cân bằng — ít cực đoan, đi với ai cũng thuận.' },
      ],
    },
  ],
};

export const CHI_TUONG_FEATURES: ChiTuongFeatureDef[] = [
  BAN_TAY,
  NGON_CAI,
  TAM_DAO,
  TRI_DAO,
  SINH_DAO,
  DINH_MENH,
  HON_NHAN,
  GO_NOI_BAT,
];

export function getChiTuongFeatureDef(id: ChiTuongFeatureId): ChiTuongFeatureDef {
  const def = CHI_TUONG_FEATURES.find((f) => f.id === id);
  if (!def) throw new Error(`Unknown feature: ${id}`);
  return def;
}

export function getChiTuongOption(
  featureId: ChiTuongFeatureId,
  optionId: string,
): ChiTuongOption | undefined {
  return getChiTuongFeatureDef(featureId).options.find((o) => o.id === optionId);
}

// ---------------------------------------------------------------------------
// 6. Tư liệu tham khảo — các đường phụ & dấu hiệu thường hỏi
// ---------------------------------------------------------------------------

export interface DuongPhuInfo {
  name: string;
  position: string;
  meaning: string;
}

export const DUONG_PHU: DuongPhuInfo[] = [
  {
    name: 'Đường Thái Dương (đường May Mắn)',
    position: 'Đường dọc ngắn chạy lên gò Thái Dương, dưới ngón áp út',
    meaning: 'Có đường này rõ chủ danh tiếng, được quý nhân nâng và thành quả được công nhận — bổ trợ mạnh cho Định Mệnh đạo.',
  },
  {
    name: 'Đường Thủy Tinh (đường Sức Khỏe)',
    position: 'Đường chéo từ phía cổ tay chạy lên gò Thủy Tinh (dưới ngón út)',
    meaning: 'Nghịch lý dễ nhớ: KHÔNG có đường này lại là quý — sức khỏe êm không có gì để "vẽ". Đường hiện rõ, gãy khúc nhắc chú ý tiêu hóa, gan mật.',
  },
  {
    name: 'Vòng Kim Tinh',
    position: 'Vòng cung nhỏ ôm dưới kẽ ngón giữa và áp út',
    meaning: 'Chủ đa cảm, rung động mạnh với nghệ thuật và cái đẹp; có vòng này nên học cách điều tiết cảm xúc kẻo dễ quá nhạy.',
  },
  {
    name: 'Đường Trực Giác',
    position: 'Vòng cung mờ ở mé Thái Âm, cong về phía gò Thủy Tinh',
    meaning: 'Hiếm gặp — chủ trực giác bén nhạy khác thường, hợp nghề tâm lý, chẩn đoán, sáng tác.',
  },
  {
    name: 'Chữ M trên lòng tay',
    position: 'Tâm đạo, Trí đạo, Sinh đạo và Định Mệnh đạo giao thành hình chữ M',
    meaning: 'Dân gian coi là dấu may mắn về tài lộc và trực giác nhìn người; thực chất chỉ báo bốn đường chính đều rõ — tự nó đã là cách tốt.',
  },
  {
    name: 'Vân xoáy (hoa tay)',
    position: 'Xoáy tròn trên đầu ngón tay',
    meaning: 'Dân gian đếm hoa tay luận khéo léo. Thủ tướng học chỉ ghi nhận: vân xoáy chủ cá tính rõ, vân dòng (loop) chủ hòa đồng — không định số phận.',
  },
  {
    name: 'Xem tay trái hay tay phải?',
    position: 'Cổ truyền: nam tả nữ hữu · Hiện đại: tay thuận là chính',
    meaning: 'Lối xem nay: tay KHÔNG thuận là tiên thiên (vốn trời cho), tay THUẬN là hậu thiên (mình tự gây dựng, đổi theo nếp sống). Xem tay thuận làm chính, đối chiếu tay kia để thấy mình đã đi xa vốn ban đầu bao nhiêu.',
  },
  {
    name: 'Đường chỉ tay có đổi không?',
    position: 'Toàn bàn tay',
    meaning: 'Có — các đường phụ và độ đậm nhạt đổi theo nếp sống, sức khỏe, tâm trạng qua năm tháng. Vì vậy xem tay là soi hiện trạng để tu sửa, không phải án chung thân.',
  },
];

// ---------------------------------------------------------------------------
// 7. Phân tích
// ---------------------------------------------------------------------------

export interface ChiTuongInput {
  gender: ChiTuongGender;
  banTay: string;
  ngonCai: string;
  tamDao: string;
  triDao: string;
  sinhDao: string;
  dinhMenh: string;
  honNhan: string;
  goNoiBat: string;
}

export interface ChiTuongAspectScore {
  aspect: ChiTuongAspectId;
  label: string;
  score: number;
  band: 'rat_tot' | 'tot' | 'kha' | 'can_boi_dap';
  bandLabel: string;
  notes: string[];
}

export interface ChiTuongFeatureReading {
  featureId: ChiTuongFeatureId;
  title: string;
  viTri?: string;
  option: ChiTuongOption;
}

export interface ChiTuongResult {
  input: ChiTuongInput;
  /** Ngũ hành thủ hình. */
  handElement: { id: string; label: string; element: string; boTro: string };
  /** Ba đường chính — trục cách cục. */
  baDuongChinh: ChiTuongFeatureReading[];
  baDuongNote: string;
  /** Các bộ vị còn lại. */
  boViKhac: ChiTuongFeatureReading[];
  aspects: ChiTuongAspectScore[];
  overallScore: number;
  overallLabel: string;
  overallNote: string;
  genderNotes: string[];
  advices: string[];
}

const HAND_ELEMENT_INFO: Record<string, { element: string; boTro: string }> = {
  kim: {
    element: 'Kim',
    boTro: 'Kim được Thổ sinh: cộng sự hợp là người trầm ổn thực tế; màu hợp vàng thổ, trắng bạc.',
  },
  moc: {
    element: 'Mộc',
    boTro: 'Mộc được Thủy sinh: cộng sự hợp là người linh hoạt giỏi giao thiệp; màu hợp xanh, đen thẫm.',
  },
  thuy: {
    element: 'Thủy',
    boTro: 'Thủy được Kim sinh: cộng sự hợp là người nguyên tắc quyết đoán; màu hợp trắng, xanh dương.',
  },
  hoa: {
    element: 'Hỏa',
    boTro: 'Hỏa được Mộc sinh: cộng sự hợp là người học rộng nhân hậu; màu hợp xanh lục, đỏ trầm.',
  },
  tho: {
    element: 'Thổ',
    boTro: 'Thổ được Hỏa sinh: cộng sự hợp là người nhiệt thành có tiếng nói; màu hợp đỏ, vàng nâu.',
  },
};

function bandOf(score: number): ChiTuongAspectScore['band'] {
  if (score >= 78) return 'rat_tot';
  if (score >= 62) return 'tot';
  if (score >= 46) return 'kha';
  return 'can_boi_dap';
}

const BAND_LABELS: Record<ChiTuongAspectScore['band'], string> = {
  rat_tot: 'Rất tốt — đắc cách',
  tot: 'Tốt',
  kha: 'Khá · trung bình',
  can_boi_dap: 'Cần bồi đắp',
};

function clamp(n: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, n));
}

export function isValidChiTuongInput(input: ChiTuongInput): boolean {
  if (input.gender !== 'nam' && input.gender !== 'nu') return false;
  return CHI_TUONG_FEATURES.every((f) =>
    f.options.some((o) => o.id === input[f.id]),
  );
}

export function analyzeChiTuong(input: ChiTuongInput): ChiTuongResult {
  const pick = (f: ChiTuongFeatureDef): ChiTuongOption => {
    const opt = f.options.find((o) => o.id === input[f.id]);
    if (!opt) throw new Error(`Invalid option for ${f.id}: ${input[f.id]}`);
    return opt;
  };

  const handOpt = pick(BAN_TAY);
  const elementInfo = HAND_ELEMENT_INFO[handOpt.id];

  const reading = (def: ChiTuongFeatureDef): ChiTuongFeatureReading => ({
    featureId: def.id,
    title: def.title,
    viTri: def.viTri,
    option: pick(def),
  });

  const baDuongChinh = [TAM_DAO, TRI_DAO, SINH_DAO].map(reading);
  const boViKhac = [reading(NGON_CAI), reading(DINH_MENH), reading(HON_NHAN), reading(GO_NOI_BAT)];

  // Nhận định trục ba đường chính
  const goodMain = baDuongChinh.filter((d) =>
    ['dai_cong_len', 'ro_dai_hoi_cong', 'vong_rong_sau'].includes(d.option.id),
  ).length;
  const weakMain = baDuongChinh.filter((d) =>
    ['chuoi_xich', 'nhanh_xuong', 'dut_dao', 'dut_mo'].includes(d.option.id),
  ).length;
  let baDuongNote: string;
  if (goodMain === 3) {
    baDuongNote =
      'Cả ba đường chính đều đắc cách — cổ pháp gọi là "tam tài minh hiển": tình cảm, trí tuệ, sinh lực cùng vượng, các đường phụ chỉ thêm hoa cho gấm.';
  } else if (goodMain >= 2 && weakMain === 0) {
    baDuongNote =
      'Trục ba đường chính vững, không đường nào phá cách — nền tảng tốt; đường nào chưa nổi bật sẽ được hai đường kia nâng đỡ.';
  } else if (weakMain >= 2) {
    baDuongNote =
      'Hai trong ba đường chính đang báo cần chăm sóc — thân, tâm, trí đều nhắc cùng lúc thì ưu tiên số một là chỉnh nếp sống; đường chỉ tay sẽ đậm dần lại theo sức khỏe và tinh thần.';
  } else {
    baDuongNote =
      'Ba đường chính có mạnh có yếu đan xen — cách phổ biến của phần đông: mặt mạnh dùng để gánh mặt yếu, các lời khuyên bồi đắp bên dưới chỉ rõ chỗ cần vun.';
  }

  const allReadings: ChiTuongFeatureReading[] = [
    { featureId: BAN_TAY.id, title: BAN_TAY.title, option: handOpt },
    ...baDuongChinh,
    ...boViKhac,
  ];

  const aspects: ChiTuongAspectScore[] = ASPECT_ORDER.map((aspect) => {
    let sum = 0;
    const notes: string[] = [];
    for (const r of allReadings) {
      for (const e of r.option.effects) {
        if (e.aspect !== aspect) continue;
        sum += e.delta;
        notes.push(e.note);
      }
    }
    const score = clamp(52 + sum * 7, 5, 98);
    const band = bandOf(score);
    return {
      aspect,
      label: ASPECT_LABELS[aspect],
      score,
      band,
      bandLabel: BAND_LABELS[band],
      notes,
    };
  });

  const overallScore = Math.round(
    aspects.reduce((s, a) => s + a.score, 0) / aspects.length,
  );
  const overallBand = bandOf(overallScore);
  const overallLabel = BAND_LABELS[overallBand];

  let overallNote: string;
  if (overallBand === 'rat_tot') {
    overallNote =
      'Cách cục bàn tay đắc cách hiếm gặp: thủ hình, ba đường chính và các bộ vị phụ tương hỗ nhau. Bàn tay tốt là bàn tay để LÀM — càng dùng vào việc lành, việc có ích thì cách cục càng phát.';
  } else if (overallBand === 'tot') {
    overallNote =
      'Cách cục bàn tay thuộc hàng tốt: điểm mạnh rõ rệt, vài chỗ chưa đắc cách đều thuộc loại bồi đắp được bằng nếp sống. Dồn sức vào phương diện cao điểm nhất là thuận thế.';
  } else if (overallBand === 'kha') {
    overallNote =
      'Cách cục trung bình khá — không có đại cách nhưng không phá cách: thành bại nằm ở việc dùng đúng mặt mạnh và phòng bị mặt yếu. Đường chỉ tay đổi theo nếp sống, vài năm nhìn lại sẽ khác.';
  } else {
    overallNote =
      'Nhiều bộ vị đang báo cần chăm sóc — nhưng xin nhớ nguyên lý của thủ tướng học: đường chỉ tay ĐỔI theo sức khỏe, tâm trạng và nếp sống. Đây là tấm ảnh hiện trạng để tu sửa, không phải bản án; các lời khuyên bên dưới là lộ trình.';
  }

  const genderNotes: string[] = [];
  if (input.gender === 'nu') {
    if (input.goNoiBat === 'thuy_tinh') {
      genderNotes.push(
        'Nữ giới gò Thủy Tinh nở, cổ nhân khen là tướng "tay hòm chìa khóa" — quản tài chính gia đình đâu ra đấy, buôn bán có duyên.',
      );
    }
    if (input.tamDao === 'dai_cong_len') {
      genderNotes.push(
        'Nữ giới Tâm đạo đắc cách là quý tướng về gia đạo — giữ được hòa khí trong nhà, con cái hưởng nếp ấm ấy mà nên người.',
      );
    }
  } else {
    if (input.ngonCai === 'dai_cung') {
      genderNotes.push(
        'Nam giới ngón cái dài cứng, cổ nhân xếp vào tướng "tự thủ thành gia" — tự tay gây dựng và giữ vững được cơ nghiệp.',
      );
    }
    if (input.goNoiBat === 'moc_tinh') {
      genderNotes.push(
        'Nam giới Mộc Tinh trội là cách thủ lĩnh — nhưng cổ pháp dặn kèm: quyền cao nhờ người theo, giữ người bằng đức chứ không bằng thế.',
      );
    }
  }

  const advices: string[] = [];
  for (const r of allReadings) {
    if (r.option.advice) advices.push(r.option.advice);
  }
  advices.push(
    'Thủ tướng học xem bàn tay là tấm gương của thân và tâm: đường chỉ đậm nhạt đổi theo nếp sống từng năm. Giữ thân khỏe, tâm ngay, tay làm việc lành — đó là phép "sửa chỉ tay" căn bản nhất.',
  );

  return {
    input,
    handElement: {
      id: handOpt.id,
      label: handOpt.label,
      element: elementInfo.element,
      boTro: elementInfo.boTro,
    },
    baDuongChinh,
    baDuongNote,
    boViKhac,
    aspects,
    overallScore,
    overallLabel,
    overallNote,
    genderNotes,
    advices,
  };
}
