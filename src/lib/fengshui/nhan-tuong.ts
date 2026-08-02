/**
 * Nhân tướng học — engine luận giải tất định.
 *
 * Khung tướng pháp cổ truyền (theo mạch Ma Y thần tướng · Thủy Kính tướng pháp
 * lưu truyền tại Việt Nam):
 * - Ngũ hành hình tướng: xếp khuôn mặt vào 5 hình Kim · Mộc · Thủy · Hỏa · Thổ.
 * - Tam đình: Thượng đình (tiền vận 15–30) · Trung đình (trung vận 31–50)
 *   · Hạ đình (hậu vận 51 trở đi).
 * - Ngũ quan: lông mày (Bảo Thọ Quan) · mắt (Giám Sát Quan) · mũi (Thẩm Biện
 *   Quan) · miệng (Xuất Nạp Quan) · tai (Thái Thính Quan).
 * - Thần thái: "nhất tướng bất như nhất thần" — thần khí quyết định cách cục.
 *
 * Người xem tự quan sát và chọn mô tả gần nhất; engine tổng hợp thành điểm
 * 5 phương diện (quan lộc · tài bạch · tình duyên · sức khỏe · phúc đức)
 * và bài luận từng bộ vị. Mọi tính toán chạy trên máy, không cần AI.
 */

export type NhanTuongGender = 'nam' | 'nu';

export type NhanTuongAspectId =
  | 'quan_loc'
  | 'tai_bach'
  | 'tinh_duyen'
  | 'suc_khoe'
  | 'phuc_duc';

export const ASPECT_LABELS: Record<NhanTuongAspectId, string> = {
  quan_loc: 'Quan lộc · sự nghiệp',
  tai_bach: 'Tài bạch · tiền tài',
  tinh_duyen: 'Tình duyên · gia đạo',
  suc_khoe: 'Sức khỏe · tật ách',
  phuc_duc: 'Phúc đức · nhân duyên',
};

export const ASPECT_ORDER: NhanTuongAspectId[] = [
  'quan_loc',
  'tai_bach',
  'tinh_duyen',
  'suc_khoe',
  'phuc_duc',
];

/** Ảnh hưởng của một lựa chọn lên một phương diện. */
export interface AspectEffect {
  aspect: NhanTuongAspectId;
  /** -2 (rất bất lợi) … +2 (rất đắc cách) */
  delta: -2 | -1 | 1 | 2;
  /** Câu giải thích ngắn, tự đứng được — hiện trong phần "vì sao". */
  note: string;
}

export interface NhanTuongOption {
  id: string;
  /** Tên gọi ngắn theo tướng pháp. */
  label: string;
  /** Mô tả nhận biết — giúp người xem tự đối chiếu trước gương. */
  hint: string;
  /** Bài luận chi tiết của bộ vị theo lựa chọn này. */
  luan: string;
  effects: AspectEffect[];
  /** Lời khuyên bồi đắp khi lựa chọn kém đắc cách. */
  advice?: string;
}

export type NhanTuongFeatureId =
  | 'faceShape'
  | 'thuongDinh'
  | 'trungDinh'
  | 'haDinh'
  | 'longMay'
  | 'mat'
  | 'mui'
  | 'mieng'
  | 'tai'
  | 'thanThai';

export interface NhanTuongFeatureDef {
  id: NhanTuongFeatureId;
  title: string;
  /** Tên "quan" cổ truyền nếu thuộc Ngũ quan. */
  quan?: string;
  /** Giới thiệu bộ vị — vì sao tướng pháp coi trọng. */
  intro: string;
  options: NhanTuongOption[];
}

// ---------------------------------------------------------------------------
// 1. Ngũ hành hình tướng
// ---------------------------------------------------------------------------

const FACE_SHAPE: NhanTuongFeatureDef = {
  id: 'faceShape',
  title: 'Hình tướng khuôn mặt (Ngũ hành hình)',
  intro:
    'Tướng pháp xếp khuôn mặt vào năm hình Kim · Mộc · Thủy · Hỏa · Thổ. Hình nào "đắc cách" (đúng chất của hành đó, cân xứng, khí sắc sáng nhuận) thì cả đời có nền vận vững; hình pha tạp thì luận theo hành trội nhất.',
  options: [
    {
      id: 'kim',
      label: 'Kim hình — mặt vuông chữ điền',
      hint: 'Mặt vuông, trán vuông, xương hàm góc cạnh rõ, da thiên trắng sáng, thần khí cứng cáp.',
      luan: 'Kim hình đắc cách là tướng của người quyết đoán, trọng nguyên tắc, nói được làm được. Chủ về uy quyền và kỷ luật: hợp con đường công quyền, quân đội – công an, pháp luật, kỹ thuật, quản trị vận hành. Kim chủ nghĩa khí — trọng lời hứa, ghét vòng vo, nên được cấp trên tin dùng, dễ nắm vị trí điều hành. Nhược điểm là cứng quá dễ gãy: khắt khe với người thân, ít lời ngọt, việc tình cảm phải chủ động mềm xuống mới bền.',
      effects: [
        { aspect: 'quan_loc', delta: 2, note: 'Kim hình chủ uy nghi kỷ luật — đường quan lộc, chức vụ có thế đi lên.' },
        { aspect: 'tai_bach', delta: 1, note: 'Giữ của tốt nhờ nguyên tắc chi tiêu, tài sản tích lũy bền.' },
        { aspect: 'tinh_duyen', delta: -1, note: 'Tính cương, ít mềm mỏng — gia đạo cần chủ động nhường nhịn.' },
        { aspect: 'suc_khoe', delta: 1, note: 'Thể chất rắn rỏi; theo y lý Kim ứng phế — chú ý đường hô hấp là đủ.' },
      ],
      advice: 'Kim quý ở "cương trung hữu nhu": tập nói lời ôn hòa, cương chuyện việc — nhu chuyện người, vận trình sẽ tròn hơn.',
    },
    {
      id: 'moc',
      label: 'Mộc hình — mặt dài thanh tú',
      hint: 'Mặt dài, người dong dỏng, xương thẳng, lông mày mắt thanh, khí chất nho nhã như cây vươn thẳng.',
      luan: 'Mộc hình đắc cách là tướng văn quý: ưa học hỏi, giàu lòng nhân, có óc thẩm mỹ và sáng tạo. Hợp nghề giáo dục, nghiên cứu, y dược, viết lách, nghệ thuật, kiến trúc. Tài lộc kiểu Mộc là "cây lớn dần" — không bạo phát nhưng càng về sau càng vững, quý nhân thường là thầy, bạn học, người trong giới chuyên môn. Điểm cần bù: hay nghĩ nhiều, cầu toàn, quyết định chậm; gặp thời cơ phải dứt khoát hơn.',
      effects: [
        { aspect: 'quan_loc', delta: 1, note: 'Mộc hình văn quý — tiến thân bằng chuyên môn, học vấn, danh đến trước lợi.' },
        { aspect: 'tai_bach', delta: 1, note: 'Tài lộc tích lũy từ từ như cây lớn, ít bạo phát nhưng chắc rễ.' },
        { aspect: 'tinh_duyen', delta: 1, note: 'Tính nhân hậu, biết lắng nghe — tình duyên thiên về bền và tình nghĩa.' },
        { aspect: 'suc_khoe', delta: -1, note: 'Nghĩ nhiều hao can khí (Mộc ứng gan) — cần ngủ đủ, bớt lo xa.' },
      ],
      advice: 'Mộc kỵ uất: đừng ôm việc một mình, chia sẻ ra thì khí thông, gan mật nhẹ mà cơ hội cũng đến nhanh hơn.',
    },
    {
      id: 'thuy',
      label: 'Thủy hình — mặt tròn đầy đặn',
      hint: 'Mặt tròn, má đầy, da mịn ẩm, mắt linh hoạt, dáng người có nét đầy đặn mềm mại.',
      luan: 'Thủy hình đắc cách là tướng của người thông minh ứng biến, khéo ăn nói, đi đâu cũng dễ được lòng người. Hợp kinh doanh buôn bán, ngoại giao, dịch vụ, truyền thông — nghề nào cần giao tiếp là như cá gặp nước. Tài khí kiểu Thủy là "nước chảy": vào nhanh, nhiều nguồn, nhưng cũng dễ trôi đi nếu không có "hồ chứa" (kỷ luật tích lũy). Tình cảm phong phú, có duyên, song cũng vì thế phải giữ chừng mực để gia đạo yên.',
      effects: [
        { aspect: 'tai_bach', delta: 2, note: 'Thủy chủ tài khí lưu thông — nguồn thu đa dạng, kiếm tiền nhanh nhạy.' },
        { aspect: 'quan_loc', delta: 1, note: 'Khéo giao tiếp, được lòng trên dưới — thăng tiến nhờ quan hệ rộng.' },
        { aspect: 'tinh_duyen', delta: -1, note: 'Đào hoa có thừa — cần giữ chừng mực kẻo tình duyên nhiều sóng.' },
        { aspect: 'suc_khoe', delta: -1, note: 'Thủy ứng thận – bài tiết; kiêng rượu bia khuya khoắt, giữ ấm phần dưới.' },
      ],
      advice: 'Thủy quý ở có đê điều: đặt kỷ luật tích lũy (trích quỹ trước, tiêu sau) thì tài vận Thủy hình mới thành của để dành.',
    },
    {
      id: 'hoa',
      label: 'Hỏa hình — trên nhọn dưới nở',
      hint: 'Trán hẹp hoặc nhọn, phần hàm – cằm nở hơn, da thiên hồng, tóc thưa cứng, mắt sáng gắt, cử chỉ nhanh.',
      luan: 'Hỏa hình là tướng của người nhiệt huyết, dám nghĩ dám làm, có sức thu hút đám đông. Hợp nghề cần lửa: khởi nghiệp, kinh doanh mạo hiểm, truyền thông – sân khấu, quảng cáo, ẩm thực. Vận trình kiểu Hỏa bốc nhanh — có những giai đoạn thăng rất gấp, nhưng lửa cháy nhanh cũng tàn nhanh: kỵ nhất là nóng vội, nghe khen là xông lên. Biết ghìm nhịp, có người đồng hành trầm tĩnh (mệnh Thổ, Kim) thì hoả khí thành ánh sáng bền.',
      effects: [
        { aspect: 'quan_loc', delta: 1, note: 'Dám xông pha, có khí thế thủ lĩnh — dễ bật lên trong môi trường cạnh tranh.' },
        { aspect: 'tai_bach', delta: -1, note: 'Tiền vào nhanh ra nhanh — kỵ đầu tư theo cảm hứng, cần người giữ két.' },
        { aspect: 'tinh_duyen', delta: -1, note: 'Nóng tính, yêu ghét rõ — gia đạo cần học chữ nhẫn trước tiên.' },
        { aspect: 'suc_khoe', delta: -1, note: 'Hỏa ứng tâm — chú ý tim mạch, huyết áp, tránh thức khuya căng thẳng.' },
      ],
      advice: 'Hỏa quý ở có bấc có dầu: rèn thói quen "đếm đến mười" trước khi quyết, giữ giấc ngủ — lửa được che gió mới cháy lâu.',
    },
    {
      id: 'tho',
      label: 'Thổ hình — mặt đầy dày, trầm ổn',
      hint: 'Mặt nở đầy, xương thịt dày dặn, mũi to, da thiên vàng sậm, dáng chắc, đi đứng khoan thai.',
      luan: 'Thổ hình đắc cách là tướng "đất dày chở vật": trầm ổn, chữ tín nặng như núi, nhẫn nại hơn người. Hợp bất động sản, nông nghiệp, xây dựng, kho vận, quản lý tài sản — những nghề cần bền gan và được người ta gửi gắm. Tài vận Thổ đến chậm mà chắc, trung – hậu vận thường vượng hơn tiền vận; của cải hay gắn với đất đai, nhà cửa. Điểm cần bù: chậm thích nghi cái mới, dễ bảo thủ — nên có bạn đồng hành nhanh nhạy.',
      effects: [
        { aspect: 'tai_bach', delta: 2, note: 'Thổ chủ tích tụ — của cải bền, có duyên với đất đai, nhà cửa.' },
        { aspect: 'phuc_duc', delta: 1, note: 'Chữ tín dày, người người gửi gắm — phúc khí tụ dần theo năm tháng.' },
        { aspect: 'quan_loc', delta: 1, note: 'Được tin cậy giao việc lớn, thăng tiến chậm mà vững.' },
        { aspect: 'tinh_duyen', delta: 1, note: 'Chung thủy, thực tâm — gia đạo êm, hôn nhân bền.' },
      ],
      advice: 'Thổ kỵ trệ: mỗi năm chủ động học một điều mới, đi một vùng đất mới — đất được cày xới thì mùa màng mới tốt.',
    },
  ],
};

/** Thông tin hành của từng hình tướng — dùng cho khối kết quả. */
export const FACE_ELEMENT_INFO: Record<
  string,
  { element: string; boTro: string }
> = {
  kim: {
    element: 'Kim',
    boTro: 'Kim được Thổ sinh: hợp màu vàng thổ, trắng bạc; quý nhân thường là người trầm ổn, thực tế.',
  },
  moc: {
    element: 'Mộc',
    boTro: 'Mộc được Thủy sinh: hợp màu xanh, đen thẫm; quý nhân thường là người linh hoạt, giỏi giao thiệp.',
  },
  thuy: {
    element: 'Thủy',
    boTro: 'Thủy được Kim sinh: hợp màu trắng, xanh dương; quý nhân thường là người nguyên tắc, quyết đoán.',
  },
  hoa: {
    element: 'Hỏa',
    boTro: 'Hỏa được Mộc sinh: hợp màu xanh lục, đỏ trầm; quý nhân thường là người học rộng, nhân hậu.',
  },
  tho: {
    element: 'Thổ',
    boTro: 'Thổ được Hỏa sinh: hợp màu đỏ, vàng nâu; quý nhân thường là người nhiệt thành, có tiếng nói.',
  },
};

// ---------------------------------------------------------------------------
// 2. Tam đình
// ---------------------------------------------------------------------------

const THUONG_DINH: NhanTuongFeatureDef = {
  id: 'thuongDinh',
  title: 'Thượng đình — vầng trán',
  intro:
    'Từ chân tóc xuống đến đầu lông mày. Chủ về trí tuệ, học vấn, phúc ấm cha mẹ và tiền vận (khoảng 15–30 tuổi). Trán như "bầu trời" của khuôn mặt — cao rộng sáng nhuận là trời quang.',
  options: [
    {
      id: 'cao_rong',
      label: 'Cao rộng, đầy đặn, sáng nhuận',
      hint: 'Trán cao, nở cả bề ngang, không hõm lệch, da trán căng sáng, ít nếp nhăn xấu cắt ngang dọc.',
      luan: 'Trán cao rộng đầy đặn là cách "thiên đình bảo mãn" — thông minh sáng láng, học một biết hai, thời trẻ được cha mẹ, thầy tổ nâng đỡ. Tiền vận hanh thông: học hành, thi cử, khởi đầu sự nghiệp đều có đà. Người trán đẹp thường nhìn xa, có tư duy hệ thống — nên chọn con đường cần đầu óc hơn là tay chân.',
      effects: [
        { aspect: 'quan_loc', delta: 2, note: 'Thiên đình bảo mãn — nền học vấn và khởi đầu sự nghiệp vững, có quý nhân dẫn đường.' },
        { aspect: 'phuc_duc', delta: 1, note: 'Phúc ấm cha mẹ dày, thời trẻ ít phải tự bươn chải đơn độc.' },
      ],
    },
    {
      id: 'can_doi',
      label: 'Cân đối, vừa phải',
      hint: 'Trán không quá cao cũng không thấp hẹp, cân xứng với hai phần mặt còn lại.',
      luan: 'Thượng đình cân đối là cách trung hòa: tiền vận không quá rực rỡ nhưng cũng ít sóng gió lớn, học hành sự nghiệp tiến đều theo công sức bỏ ra. Với tướng pháp, "đình nào cân đối thì vận đoạn ấy an" — điểm bật lên sẽ trông vào các bộ vị khác như mắt, mũi.',
      effects: [
        { aspect: 'quan_loc', delta: 1, note: 'Tiền vận bình ổn, học hành công việc tiến đều theo nỗ lực.' },
      ],
    },
    {
      id: 'thap_hep',
      label: 'Thấp hẹp hoặc khuyết hãm',
      hint: 'Trán thấp, hẹp bề ngang, hõm lệch, chân tóc mọc lấn xuống, hoặc nhiều nếp nhăn loạn cắt phá.',
      luan: 'Trán thấp hẹp theo cổ nhân là tiền vận phải tự lập sớm: thời trẻ vất vả hơn bạn bè, phúc ấm gia đình mỏng, học hành dễ dở dang phải vừa làm vừa học. Nhưng tướng pháp cũng dạy: trán xấu mà mắt mũi có thế thì trung vận bật lên rất mạnh — cái khổ trước 30 chính là vốn liếng. Điều cần tránh là tự ti, nóng ruột đốt cháy giai đoạn.',
      effects: [
        { aspect: 'quan_loc', delta: -1, note: 'Tiền vận tự lập, khởi đầu chậm hơn người — bù lại rèn được sức bền.' },
        { aspect: 'phuc_duc', delta: -1, note: 'Phúc ấm sớm mỏng, mọi thứ phải tự tay gây dựng.' },
      ],
      advice: 'Tiền vận chậm không phải là kém: đầu tư học nghề thật chắc trước 30, sau 30 các bộ vị trung đình sẽ "gánh" vận lên.',
    },
  ],
};

const TRUNG_DINH: NhanTuongFeatureDef = {
  id: 'trungDinh',
  title: 'Trung đình — mày đến chóp mũi',
  intro:
    'Từ đầu lông mày xuống đến chuẩn đầu (chóp mũi). Chủ về ý chí, sự nghiệp, tài vận và trung vận (khoảng 31–50 tuổi) — giai đoạn gánh vác nặng nhất đời người.',
  options: [
    {
      id: 'no_nang',
      label: 'Nở nang, mũi gò má có thế',
      hint: 'Phần giữa mặt đầy đặn, mũi có sống có thịt, gò má nở hài hòa (không lép, không đâm ngang quá gắt).',
      luan: 'Trung đình nở nang, mũi và gò má "hộ vệ" lẫn nhau là cách trung vận đắc lực: 31–50 tuổi là đoạn gặt hái — sự nghiệp lên nấc, tiền tài tụ, tiếng nói trong nhà ngoài ngõ đều có trọng lượng. Gò má có thế đi với mũi tốt là "quyền – tài tương phối": vừa có quyền quyết vừa giữ được lợi. Đây là đoạn vận nên mạnh dạn nhận việc lớn.',
      effects: [
        { aspect: 'quan_loc', delta: 2, note: 'Trung vận đắc thế — giai đoạn 31–50 là lúc bứt phá sự nghiệp mạnh nhất.' },
        { aspect: 'tai_bach', delta: 1, note: 'Quyền – tài tương phối, tay làm ra tiền và giữ được tiếng nói về tiền.' },
      ],
    },
    {
      id: 'can_doi',
      label: 'Cân đối, vừa phải',
      hint: 'Phần giữa mặt hài hòa với trán và cằm, không nổi trội cũng không hụt.',
      luan: 'Trung đình cân đối cho trung vận êm: công việc, thu nhập giai đoạn 31–50 ổn định, thăng trầm nhỏ đều vượt qua được. Muốn bật hẳn lên cần nhìn thêm thế mũi (Thẩm Biện Quan) và thần của mắt — hai bộ vị này tốt thì trung đình cân đối vẫn thành cách "tiệm tiến trường cửu", đi chậm mà xa.',
      effects: [
        { aspect: 'quan_loc', delta: 1, note: 'Trung vận bình ổn, tiến đều — ít đột biến nhưng cũng ít đổ vỡ.' },
      ],
    },
    {
      id: 'hut_lep',
      label: 'Ngắn hụt, mũi yếu gò má lép',
      hint: 'Phần giữa mặt ngắn so với trán và cằm, mũi thấp nhỏ, gò má phẳng lép thiếu thế.',
      luan: 'Trung đình hụt là trung vận phải cày sâu cuốc bẫm: giai đoạn 31–50 công danh tài lộc lên chậm, dễ gặp cảnh làm nhiều hưởng ít, hoặc quyền hành không tương xứng công sức. Cổ nhân khuyên người trung đình yếu nên đi đường "kỹ năng tích lũy" — lấy chuyên môn sâu, chữ tín và quan hệ lâu năm làm vốn, tránh đánh lớn vay đậm trong đoạn vận này.',
      effects: [
        { aspect: 'quan_loc', delta: -1, note: 'Trung vận lên chậm — nên tiến bằng chuyên môn sâu, tránh đốt cháy giai đoạn.' },
        { aspect: 'tai_bach', delta: -1, note: 'Đoạn 31–50 kỵ vay đậm đánh lớn, hợp tích tiểu thành đại.' },
      ],
      advice: 'Bồi trung vận bằng "thế mượn": hợp tác với người có thế mạnh mình thiếu, giữ sức khỏe đoạn 40 tuổi — qua đó hậu vận sẽ nhẹ.',
    },
  ],
};

const HA_DINH: NhanTuongFeatureDef = {
  id: 'haDinh',
  title: 'Hạ đình — nhân trung đến cằm',
  intro:
    'Từ nhân trung xuống hết địa các (cằm). Chủ về hậu vận (51 tuổi trở đi), điền trạch nhà cửa, con cháu và người dưới quyền. Cằm là "đất" của khuôn mặt — đất dày thì về già có chỗ tựa.',
  options: [
    {
      id: 'day_no',
      label: 'Đầy đặn nở nang, cằm tròn có thịt',
      hint: 'Cằm đầy, hơi bạnh, có thịt bọc xương, nhìn nghiêng không lẹm; hai bên quai hàm cân.',
      luan: 'Hạ đình đầy nở là cách "địa các phương viên" — hậu vận an nhàn, về già có nhà có đất, con cháu người dưới quây quần đỡ đần. Người cằm đầy thường bao dung, biết thu phục nhân tâm nên càng lớn tuổi tiếng nói càng nặng, làm quản lý được cấp dưới trung thành. Đây cũng là tướng của người "có hậu" — ăn ở trước sau trọn vẹn.',
      effects: [
        { aspect: 'phuc_duc', delta: 2, note: 'Địa các phương viên — hậu vận an nhàn, con cháu người dưới có tình.' },
        { aspect: 'tai_bach', delta: 1, note: 'Về sau có điền trạch, của chìm của nổi tụ ở nửa cuối đời.' },
      ],
    },
    {
      id: 'can_doi',
      label: 'Cân đối, vừa phải',
      hint: 'Cằm hài hòa với tổng thể, không bạnh to cũng không nhọn lẹm.',
      luan: 'Hạ đình cân đối cho hậu vận bình ổn: về già đời sống đủ đầy theo nền nếp đã gây dựng ở trung vận, quan hệ con cháu người dưới thuận hòa. Với cách này, hậu vận tốt hay rất tốt tùy ở phúc đức tích lũy — đúng tinh thần "tướng bất cập đức".',
      effects: [
        { aspect: 'phuc_duc', delta: 1, note: 'Hậu vận bình ổn, hưởng theo nền nếp và phúc đã tích ở nửa đời trước.' },
      ],
    },
    {
      id: 'nhon_lem',
      label: 'Ngắn nhọn hoặc lẹm',
      hint: 'Cằm nhọn, ngắn, nhìn nghiêng thấy lẹm vào trong; phần hàm mỏng thiếu thịt.',
      luan: 'Hạ đình nhọn lẹm theo cổ nhân là hậu vận cần chuẩn bị sớm: về già dễ cảnh ở không yên chỗ, hay dời đổi, người dưới ít đỡ đần, nên tự lo liệu chỗ ở và tích lũy từ trung vận. Người cằm nhọn thường nhanh trí, sống thiên về lý trí cảm hứng, nhưng thiếu bền — cần rèn thói quen giữ nếp, giữ người. Tướng pháp nhấn: hạ đình mỏng mà miệng và nhân trung tốt thì hậu vận vẫn ấm.',
      effects: [
        { aspect: 'phuc_duc', delta: -1, note: 'Hậu vận phải tự lo sớm — nên an cư và tích lũy ngay trong trung vận.' },
        { aspect: 'tinh_duyen', delta: -1, note: 'Về sau dễ cảnh sớm tối một mình nếu không vun đắp người thân từ bây giờ.' },
      ],
      advice: 'Bồi hạ đình bằng cách "trồng người": đối đãi tử tế với con cháu, học trò, người giúp việc — đó chính là địa các vô hình của mình.',
    },
  ],
};

// ---------------------------------------------------------------------------
// 3. Ngũ quan
// ---------------------------------------------------------------------------

const LONG_MAY: NhanTuongFeatureDef = {
  id: 'longMay',
  title: 'Lông mày',
  quan: 'Bảo Thọ Quan',
  intro:
    'Lông mày là Bảo Thọ Quan, cũng là cung Huynh Đệ — chủ về tình anh em bạn hữu, tính khí và tuổi thọ. Mày quý ở thanh (sợi rõ), tú (mượt xuôi), dài quá mắt và cao hơn mắt.',
  options: [
    {
      id: 'thanh_tu',
      label: 'Thanh tú, dài quá mắt, xuôi mượt',
      hint: 'Sợi mày rõ ràng có gốc có ngọn, mọc xuôi chiều, đuôi mày dài hơn đuôi mắt, dáng mày thanh thoát.',
      luan: 'Mày thanh tú dài quá mắt là cách "mi tú nhi trường" — người trọng tình trọng nghĩa, anh em bạn hữu đông và đắc lực, tính khí ôn hòa biết tiến biết lùi. Đường đời nhờ đó nhiều người nâng đỡ, ít kẻ ngầm phá. Mày đẹp đi với mắt có thần là văn cách rõ ràng, chủ danh tiếng thanh sạch.',
      effects: [
        { aspect: 'phuc_duc', delta: 2, note: 'Mi tú nhi trường — anh em bằng hữu đắc lực, đi đâu cũng có người thương.' },
        { aspect: 'tinh_duyen', delta: 1, note: 'Tính ôn hòa trọng nghĩa — tình cảm bền, ít khẩu thiệt thị phi.' },
      ],
    },
    {
      id: 'dam_rap',
      label: 'Rậm đậm, sợi thô',
      hint: 'Mày rậm dày, sợi to đậm, có thể hơi dựng; nét mặt nhìn cương nghị.',
      luan: 'Mày rậm đậm chủ người trọng tình, nhiệt huyết, đã nhận ai là anh em thì hết lòng. Hành động lực mạnh, dám đứng mũi chịu sào nên hợp việc cần xông pha. Nhược ở chỗ tình cảm đặt trên lý trí: dễ vì bạn bè mà thiệt thân, dễ nóng theo đám đông. Mày rậm mà sợi vẫn xuôi có gốc ngọn thì vẫn là cách tốt; chỉ khi rậm rối như cỏ mới kém.',
      effects: [
        { aspect: 'quan_loc', delta: 1, note: 'Hành động lực mạnh, dám gánh việc — hợp môi trường cần xông pha.' },
        { aspect: 'tinh_duyen', delta: -1, note: 'Cả nể vì tình, dễ hao tâm hao của cho chuyện người ngoài.' },
      ],
      advice: 'Trước khi đứng ra bảo lãnh, cho vay vì nghĩa khí — hãy hỏi ý người nhà một câu, đó là cách tự hộ mệnh của người mày rậm.',
    },
    {
      id: 'thua_nhat',
      label: 'Thưa nhạt, ngắn không kín mắt',
      hint: 'Sợi mày thưa, màu nhạt, đuôi mày hụt chưa hết đuôi mắt, dáng mày mờ nhòa.',
      luan: 'Mày thưa nhạt chủ duyên anh em bạn hữu mỏng: không hẳn không có, mà là ít người thật lòng sát cánh, việc lớn thường phải tự thân. Người mày nhạt tính toán độc lập, ít bị tình cảm chi phối — làm việc lý trí, nhưng cũng vì thế dễ mang tiếng lạnh. Tướng pháp khuyên chủ động "kết mày": gây dựng vài mối thâm giao chất lượng thay vì quen rộng hời hợt.',
      effects: [
        { aspect: 'phuc_duc', delta: -1, note: 'Duyên bằng hữu mỏng, việc lớn thường phải tự thân gánh vác.' },
      ],
      advice: 'Chăm vun vài mối thâm giao thật chất lượng; giúp người trong lặng lẽ — mày nhạt mà tâm đậm thì quý nhân vẫn tự đến.',
    },
    {
      id: 'xech_dung',
      label: 'Xếch dựng lên (mày kiếm)',
      hint: 'Đuôi mày chếch hẳn lên phía thái dương, sợi có thể hơi dựng, nhìn có sát khí cương mãnh.',
      luan: 'Mày xếch như lưỡi kiếm là tướng cương dũng: chí tiến thủ cao, không chịu thua kém, gặp việc khó càng hăng. Đắc cách (sợi vẫn thanh, mắt có thần chính) thì là cách võ quý — hợp cạnh tranh thương trường, thể thao, lực lượng vũ trang. Thất cách thì thành hiếu thắng, dễ va chạm khẩu thiệt. Người mày xếch nên có "phanh": việc lớn nghỉ một đêm rồi quyết.',
      effects: [
        { aspect: 'quan_loc', delta: 1, note: 'Chí tiến thủ cao, càng cạnh tranh càng hăng — dễ lập công trong thế khó.' },
        { aspect: 'tinh_duyen', delta: -1, note: 'Khí thắng người, trong nhà dễ thành cãi vã — lùi một bước là đẹp đôi đường.' },
      ],
      advice: 'Rèn "thắng mình trước thắng người": mỗi lần nhịn được một câu là một lần thêm phúc cho chính cung Huynh Đệ.',
    },
    {
      id: 'cong_nhu',
      label: 'Cong mềm như trăng non (mày liễu)',
      hint: 'Dáng mày cong thanh, mềm mại ôm lấy mắt, sợi mảnh mượt.',
      luan: 'Mày cong như trăng non là cách "nga mi" — người tình cảm tinh tế, thẩm mỹ tốt, khéo chiều lòng người, đặc biệt có duyên trong giao tiếp. Tình duyên là mặt mạnh: dễ được yêu mến, hôn nhân thiên về êm ấm. Cần lưu ý ranh giới: mềm quá dễ bị người lấn, chuyện tiền bạc nên rạch ròi để cái duyên không thành cái nợ.',
      effects: [
        { aspect: 'tinh_duyen', delta: 2, note: 'Nga mi thanh cong — có duyên, tình cảm tinh tế, hôn nhân thiên êm ấm.' },
        { aspect: 'quan_loc', delta: -1, note: 'Nể tình khó từ chối — làm quản lý cần tập rạch ròi thưởng phạt.' },
      ],
    },
    {
      id: 'giao_lien',
      label: 'Giao nhau, liền mày (ấn đường bị phạm)',
      hint: 'Hai đầu mày mọc lấn vào nhau, che khoảng ấn đường giữa hai mày.',
      luan: 'Hai mày giao nhau phạm vào ấn đường — cung Mệnh của khuôn mặt. Chủ người hay nghĩ ngợi dồn nén, dễ tự tạo áp lực, vận trình vì thế hay có cảm giác "tắc" dù điều kiện không tệ. Tình cảm dễ ghen tuông, để bụng. Đây là điểm hoàn toàn sửa được: tỉa thoáng ấn đường, tập buông bớt suy nghĩ trùng lặp — cổ nhân gọi là "khai ấn", mở cửa cho vận khí thông.',
      effects: [
        { aspect: 'phuc_duc', delta: -1, note: 'Ấn đường bị phạm — khí vận hay tắc do chính mình nghĩ nhiều, dồn nén.' },
        { aspect: 'suc_khoe', delta: -1, note: 'Lo nghĩ dồn nén hại giấc ngủ và tiêu hóa — cần xả van đều đặn.' },
      ],
      advice: 'Tỉa thoáng vùng ấn đường, giữ trán sáng sủa; tập thiền hoặc vận động cho thoát mồ hôi — "khai ấn" thì vận thông.',
    },
  ],
};

const MAT: NhanTuongFeatureDef = {
  id: 'mat',
  title: 'Đôi mắt',
  quan: 'Giám Sát Quan',
  intro:
    'Mắt là Giám Sát Quan — bộ vị hệ trọng bậc nhất, chiếm quá nửa cách cục khuôn mặt. Tướng pháp trọng "tàng thần": tròng đen trắng phân minh, ánh nhìn ổn định có thần mà không lộ gắt.',
  options: [
    {
      id: 'den_trang_ro',
      label: 'Đen trắng phân minh, có thần ổn định',
      hint: 'Tròng đen đậm rõ, lòng trắng sạch, ánh nhìn thẳng, sáng mà điềm — nhìn lâu không láo liên.',
      luan: 'Mắt đen trắng phân minh, thần quang thu tàng là quý cách hàng đầu của khuôn mặt: tâm địa ngay thẳng, trí sáng, nhìn người nhìn việc chuẩn. Chủ công danh có bậc, được người trên tin giao trọng trách, người dưới kính phục. Mắt như vậy dù các bộ vị khác có kém đôi phần, cách cục chung vẫn được "cứu" — cổ nhân nói: trăm bộ vị không bằng một đôi mắt có thần.',
      effects: [
        { aspect: 'quan_loc', delta: 2, note: 'Thần quang thu tàng — nhìn việc chuẩn, được tin giao trọng trách.' },
        { aspect: 'phuc_duc', delta: 1, note: 'Tâm chính hiện ra mắt chính — đi đường dài được người kính nể.' },
        { aspect: 'suc_khoe', delta: 1, note: 'Mắt có thần là tinh – khí – thần sung mãn, nền sức khỏe tốt.' },
      ],
    },
    {
      id: 'to_sang',
      label: 'To tròn, sáng linh hoạt',
      hint: 'Mắt to, tròng đen lớn, ánh nhìn sáng lanh lợi, biểu cảm phong phú.',
      luan: 'Mắt to sáng chủ người cởi mở, giàu cảm xúc, phản ứng nhanh và có sức hút — dễ được cảm tình ngay lần đầu gặp. Hợp nghề giao tiếp trước đám đông: bán hàng, giảng dạy, nghệ thuật, truyền thông. Mặt cần giữ: cảm xúc lên xuống nhanh, cả tin, dễ bị lời ngọt dẫn đi — chuyện hùn hạp giấy trắng mực đen là tự bảo vệ tốt nhất.',
      effects: [
        { aspect: 'tinh_duyen', delta: 1, note: 'Mắt to có sức hút — đào hoa thuận, dễ được cảm tình.' },
        { aspect: 'quan_loc', delta: 1, note: 'Lanh lợi biểu cảm tốt — hợp nghề đứng trước đám đông.' },
        { aspect: 'tai_bach', delta: -1, note: 'Cả tin dễ xiêu lòng — hùn hạp cho vay phải giấy trắng mực đen.' },
      ],
    },
    {
      id: 'dai_nho',
      label: 'Dài nhỏ, đuôi mắt sắc (mắt phượng)',
      hint: 'Khe mắt dài, tròng đen sâu, đuôi mắt hơi chếch thanh tú — nhìn kín đáo, sắc sảo.',
      luan: 'Mắt dài nhỏ có thần là cách mắt phượng — quý tướng về mưu lược: nghĩ sâu, giữ kín việc, nhìn xa trông rộng, càng ở vị trí cao càng phát huy. Chủ công danh có tầng bậc, hợp làm tham mưu, quản trị, đầu tư dài hạn. Người mắt phượng ít bộc lộ nên đôi khi bị hiểu là lạnh — trong nhà nên chủ động nói lời ấm để người thân không đoán mò.',
      effects: [
        { aspect: 'quan_loc', delta: 2, note: 'Mắt phượng chủ mưu lược — càng lên cao càng phát huy, hợp vai trò cầm trịch.' },
        { aspect: 'tai_bach', delta: 1, note: 'Nhìn xa, nhịn được cái lợi nhỏ — hợp tích sản và đầu tư dài hạn.' },
        { aspect: 'tinh_duyen', delta: -1, note: 'Kín tiếng ít bộc lộ — người thân dễ thấy xa cách, cần chủ động sẻ chia.' },
      ],
    },
    {
      id: 'loi_lo',
      label: 'Lồi, lộ nhiều tròng',
      hint: 'Nhãn cầu lồi ra phía trước, mắt mở lớn thường trực, ánh nhìn phát thẳng ra ngoài.',
      luan: 'Mắt lồi chủ người bộc trực, nghĩ gì nói nấy, phản ứng tức thì — sống thật, không thảo mai, nhưng khẩu thiệt cũng từ đó mà ra. Vận trình dễ thăng trầm theo lời nói: một câu đúng lúc thành quý nhân, một câu lỡ miệng thành thị phi. Về sức khỏe, mắt lồi kèm hay hồi hộp nóng nảy nên lưu tâm tuyến giáp, huyết áp. Rèn được "uốn lưỡi bảy lần" thì cách này chuyển tốt rõ rệt.',
      effects: [
        { aspect: 'tinh_duyen', delta: -1, note: 'Nói thẳng quá đà — trong ngoài dễ mất lòng vì một câu vô ý.' },
        { aspect: 'suc_khoe', delta: -1, note: 'Lưu tâm tuyến giáp, huyết áp; tránh căng thẳng kéo dài.' },
        { aspect: 'quan_loc', delta: 1, note: 'Bộc trực dám nói — ở môi trường trọng người thật việc thật lại thành điểm cộng.' },
      ],
      advice: 'Trước khi nói việc hệ trọng, viết ra giấy một lần — người mắt lộ mà lời kín thì thị phi tự lui.',
    },
    {
      id: 'sau_trung',
      label: 'Sâu trũng, hõm',
      hint: 'Hốc mắt sâu, mắt như thụt vào trong, quầng dễ tối.',
      luan: 'Mắt sâu chủ người nội tâm, quan sát kỹ, suy xét chín chắn — làm việc cần độ sâu (nghiên cứu, phân tích, kỹ thuật tinh vi) rất hợp. Tình cảm nặng lòng, đã thương là thương lâu, nhưng cũng hay tự khép, để nỗi niềm đọng lại. Mắt sâu kèm quầng tối là dấu hao tâm huyết — cần ngủ đủ, phơi nắng sớm, đừng để "cửa sổ tâm hồn" thiếu sáng.',
      effects: [
        { aspect: 'quan_loc', delta: 1, note: 'Quan sát sâu, suy xét kỹ — hợp việc cần độ chín và chiều sâu.' },
        { aspect: 'suc_khoe', delta: -1, note: 'Dễ hao tâm huyết, mất ngủ — cần dưỡng thần, phơi nắng sớm.' },
        { aspect: 'tinh_duyen', delta: -1, note: 'Nặng lòng mà ít nói ra — người thương khó biết lòng, nên tập bày tỏ.' },
      ],
    },
    {
      id: 'tam_bach',
      label: 'Lộ nhiều lòng trắng (tam bạch)',
      hint: 'Nhìn thẳng vẫn thấy lòng trắng lộ rõ phía trên hoặc dưới tròng đen (tam bạch nhãn).',
      luan: 'Mắt tam bạch theo tướng pháp là cách cần thận trọng: chủ người ý chí mạnh, ham muốn lớn, dám được dám mất — làm nên chuyện trong thế cạnh tranh, nhưng cũng dễ cực đoan, nóng lạnh thất thường, và dễ vướng tiểu nhân thị phi. Cổ nhân dặn người tam bạch ba điều: không đi đêm về hôm ẩu, không tranh hơn thua miệng, không quyết việc lớn lúc giận. Tâm được tu sửa thì chính cách này lại thành nghị lực phi thường.',
      effects: [
        { aspect: 'phuc_duc', delta: -1, note: 'Dễ vướng thị phi tiểu nhân — kết giao nên chọn lọc, tránh hơn thua.' },
        { aspect: 'suc_khoe', delta: -1, note: 'Thần khí phát lộ, nóng lạnh thất thường — cần giữ nhịp sinh hoạt điều độ.' },
        { aspect: 'quan_loc', delta: 1, note: 'Ý chí và ham muốn thành tựu lớn — vào khuôn khổ tốt sẽ bứt phá mạnh.' },
      ],
      advice: 'Lấy tĩnh chế động: thiền, đọc kinh sách, thể thao đều đặn — thần quang thu lại được thì vận dữ hóa lành.',
    },
  ],
};

const MUI: NhanTuongFeatureDef = {
  id: 'mui',
  title: 'Mũi',
  quan: 'Thẩm Biện Quan',
  intro:
    'Mũi là Thẩm Biện Quan, cung Tài Bạch — chủ tiền tài, ý chí tự chủ và trung vận. Mũi quý ở sống thẳng đầy, chuẩn đầu (chóp mũi) có thịt, hai cánh (kim giáp) nở kín, lỗ mũi không lộ.',
  options: [
    {
      id: 'cao_thang_no',
      label: 'Sống cao thẳng, chuẩn đầu đầy, cánh nở',
      hint: 'Sống mũi thẳng có thế, chóp mũi tròn có thịt, hai cánh mũi nở cân, lỗ mũi kín đáo.',
      luan: 'Đây là chính cách của cung Tài Bạch — "chuẩn đầu phong long, kim giáp tương ứng": tiền tài có nguồn có đọng, kiếm được và quan trọng hơn là giữ được. Sống mũi thẳng chủ tự chủ cao, có chính kiến, không dễ bị lung lạc; trung vận (đặc biệt 41–50) là đoạn tài khí vượng nhất. Nữ giới được mũi này cổ nhân khen là tướng vượng phu: về nhà ai thì kinh tế nhà đó đi lên.',
      effects: [
        { aspect: 'tai_bach', delta: 2, note: 'Chuẩn đầu phong long — tài khí tụ, kiếm được và giữ được của.' },
        { aspect: 'quan_loc', delta: 1, note: 'Sống mũi thẳng chủ tự chủ, có chính kiến — làm chủ việc, chủ người được.' },
        { aspect: 'tinh_duyen', delta: 1, note: 'Cung Phu Thê được mũi tốt trợ lực — hôn nhân có nền kinh tế vững.' },
      ],
    },
    {
      id: 'su_tu',
      label: 'Mũi sư tử — chuẩn đầu to, cánh rất nở',
      hint: 'Chóp mũi to tròn, hai cánh mũi bành rộng, sống mũi có thể không cao nhưng cả khối mũi dày đầy.',
      luan: 'Mũi sư tử là tướng tài phú theo lối "hậu tích": không hẳn thanh quý nhưng cực kỳ biết gom và giữ. Chủ người thực tế, chịu khó, càng trung niên của cải càng dày — nhiều thương nhân tay trắng làm nên mang cách mũi này. Lưu ý sống mũi thấp thì tai và trán phải có thế nâng, nếu không dễ thành "có của mà nhọc thân": tiền về nhưng việc gì cũng đến tay.',
      effects: [
        { aspect: 'tai_bach', delta: 2, note: 'Cách hậu tích — gom giữ giỏi, trung niên về sau của cải dày lên.' },
        { aspect: 'suc_khoe', delta: -1, note: 'Ham việc quên mình — của nhiều mà nhọc thân, cần biết thuê người san việc.' },
      ],
    },
    {
      id: 'thap_nho',
      label: 'Thấp nhỏ, ít thịt',
      hint: 'Sống mũi thấp, mũi nhỏ so với khuôn mặt, chóp mũi ít thịt.',
      luan: 'Mũi thấp nhỏ chủ cung Tài Bạch mỏng: kiếm tiền phải cần cù hơn người, khó phất nhanh, và tính tự chủ dễ lung lay — hay theo ý người khác rồi thiệt về mình. Nhưng tướng pháp cũng chỉ lối: mũi nhỏ mà kín (lỗ mũi không lộ) vẫn giữ được của theo lối "kiến tha lâu đầy tổ"; người mũi nhỏ hợp làm việc trong hệ thống ổn định, lương thưởng rõ ràng, hơn là tự đứng mũi kinh doanh.',
      effects: [
        { aspect: 'tai_bach', delta: -1, note: 'Tài khí mỏng — hợp thu nhập ổn định, tích tiểu thành đại, kỵ đánh lớn.' },
        { aspect: 'quan_loc', delta: -1, note: 'Dễ theo ý người, thiếu quyết — nên rèn chính kiến trước khi nhận vai đầu tàu.' },
      ],
      advice: 'Chọn "thế tựa": vào tổ chức vững, có người dẫn dắt; kỷ luật trích tiết kiệm tự động — mũi nhỏ mà nếp giữ tiền lớn thì vẫn dư dả.',
    },
    {
      id: 'go_gay',
      label: 'Gồ, gãy khúc giữa sống',
      hint: 'Giữa sống mũi nổi gồ lên hoặc gãy khúc, nhìn nghiêng thấy rõ đốt.',
      luan: 'Mũi có đốt gồ chủ người cá tính mạnh, không phục tùng, thích làm theo cách riêng — làm nghề tự do, sáng tạo, kỹ thuật riêng biệt thì hay; vào khuôn khổ dễ va cấp trên. Đường tài lộc và hôn nhân trung vận (quãng 41–45, khi vận đi qua đốt mũi) thường có một đợt biến động phải vượt — cổ nhân dặn đoạn này giữ hòa khí, tránh thay đổi lớn dồn dập cùng lúc.',
      effects: [
        { aspect: 'tai_bach', delta: -1, note: 'Quãng giữa trung vận dễ một đợt hao biến — tránh dồn hết vốn vào một cửa.' },
        { aspect: 'tinh_duyen', delta: -1, note: 'Cá tính mạnh khó nhún — hôn nhân trung vận cần nhường nhau qua đoạn gập ghềnh.' },
        { aspect: 'quan_loc', delta: 1, note: 'Dám khác biệt, có lối đi riêng — tự do sáng tạo lại là thế mạnh.' },
      ],
      advice: 'Quãng 41–45 tuổi nên "dĩ tĩnh chế động": không nhảy việc, đổi nhà, đầu tư lớn cùng một lúc; qua đoạn đó vận lại thuận.',
    },
    {
      id: 'nhon_moc',
      label: 'Chuẩn đầu nhọn, mỏng',
      hint: 'Chóp mũi nhọn, thiếu thịt, có thể hơi cong quặp xuống.',
      luan: 'Chuẩn đầu nhọn mỏng chủ người tinh tế, nhạy bén tính toán, nhưng cung Tài Bạch thiên về "sắc mà bạc": tiền đến rồi đi, khó đọng, và trong giao dịch hay bị đánh giá là chi li. Nếu chóp mũi quặp xuống, cổ nhân dặn giữ chữ tín làm đầu — đừng vì lợi nhỏ trước mắt mà hao phúc lâu dài. Cách hóa giải nằm ở tâm: rộng rãi đúng chỗ, tiền tài sẽ tự nhuận lại.',
      effects: [
        { aspect: 'tai_bach', delta: -1, note: 'Tài tinh mà bạc — tiền qua tay nhanh, cần tạo "hồ chứa" tích lũy cố định.' },
        { aspect: 'phuc_duc', delta: -1, note: 'Hay bị nhìn là chi li — nên rộng rãi đúng chỗ để giữ nhân duyên.' },
      ],
      advice: 'Mỗi tháng trích một khoản bố thí, giúp người cố định — "tài bố thí" chính là cách bồi chuẩn đầu hữu hiệu nhất theo nhà Phật.',
    },
    {
      id: 'hech_lo',
      label: 'Hếch, lộ lỗ mũi',
      hint: 'Đầu mũi hơi hất lên, nhìn thẳng thấy rõ lỗ mũi.',
      luan: 'Mũi hếch lộ khổng chủ người thật thà cởi mở, có sao nói vậy, sống phóng khoáng không toan tính sâu — dễ mến, bạn bè quý. Về tiền bạc là cách "tán tài": hào phóng, khó từ chối, tiền vào cửa trước ra cửa sau. Được cái tâm không tham nên của đi thường có phúc quay lại đường khác. Việc cần làm chỉ một: dựng hàng rào chi tiêu — có quỹ khóa kín, người khác giữ càng tốt.',
      effects: [
        { aspect: 'tai_bach', delta: -2, note: 'Lỗ mũi lộ — của khó đọng, cần quỹ tích lũy khóa kín, nhờ người tin cẩn giữ.' },
        { aspect: 'phuc_duc', delta: 1, note: 'Tâm thật phóng khoáng — nhân duyên rộng, của đi có phúc trở lại.' },
      ],
      advice: 'Lập quỹ "không được đụng" trích tự động ngay khi có thu nhập; hào phóng bằng công sức thay vì luôn bằng tiền.',
    },
  ],
};

const MIENG: NhanTuongFeatureDef = {
  id: 'mieng',
  title: 'Miệng',
  quan: 'Xuất Nạp Quan',
  intro:
    'Miệng là Xuất Nạp Quan — cửa ra của lời nói, cửa vào của lộc ăn. Chủ tín nghĩa, lộc thực, tình cảm và hậu vận. Miệng quý ở vuông vắn có góc, môi dày cân, khóe hướng lên, sắc nhuận hồng.',
  options: [
    {
      id: 'vuong_day',
      label: 'Vuông vắn, môi dày cân, khóe hướng lên',
      hint: 'Miệng có góc cạnh rõ, hai môi dày dặn cân nhau, khóe miệng tự nhiên nhếch nhẹ lên, sắc môi hồng nhuận.',
      luan: 'Miệng vuông môi dày khóe hướng lên là cách "khẩu như tứ tự" — người tín nghĩa, nói lời giữ lời, lộc ăn lộc mặc không thiếu. Đây là bộ vị nâng hậu vận rất mạnh: về già có người quý người thương, con cháu hiếu thuận. Tình cảm chân thành đằm thắm, nói lời dễ nghe mà không xu nịnh — làm nghề gắn với chữ tín (buôn bán lâu năm, dịch vụ, giáo dục) càng phát.',
      effects: [
        { aspect: 'phuc_duc', delta: 2, note: 'Khẩu như tứ tự — tín nghĩa dày, hậu vận có người thương kẻ giúp.' },
        { aspect: 'tinh_duyen', delta: 1, note: 'Lời nói ấm giữ lửa gia đạo — tình cảm đằm thắm bền lâu.' },
        { aspect: 'tai_bach', delta: 1, note: 'Lộc thực đầy — làm ăn giữ tín nên mối cũ nuôi mối mới.' },
      ],
    },
    {
      id: 'rong_lon',
      label: 'Rộng lớn, cười hào sảng',
      hint: 'Miệng rộng so với khuôn mặt, cười tươi hết cỡ, giọng vang.',
      luan: 'Miệng rộng chủ khí phách hào sảng, dám ăn dám nói dám làm — cổ nhân ví "miệng rộng nuốt được thiên hạ", là tướng làm ăn lớn, quan hệ rộng, đãi khách không tiếc. Nam giới được cách này thêm điểm quý về sự nghiệp; nữ giới miệng rộng thời nay là lợi thế giao thiệp, chỉ cần giữ ý tứ lời hứa — hứa nhiều mà quên là hao tín. Chung cho cả hai: lộc theo miệng vào thì thị phi cũng có thể theo miệng ra, nói ít lại một phần thì phúc dày thêm một phần.',
      effects: [
        { aspect: 'quan_loc', delta: 1, note: 'Khí phách hào sảng, quan hệ rộng — làm việc lớn có người hưởng ứng.' },
        { aspect: 'tai_bach', delta: 1, note: 'Miệng rộng ăn lộc bốn phương — nguồn thu theo quan hệ mà về.' },
        { aspect: 'tinh_duyen', delta: -1, note: 'Vui miệng dễ hứa, dễ sa đà tiệc tùng — người nhà cần được ưu tiên hơn bạn nhậu.' },
      ],
    },
    {
      id: 'mong',
      label: 'Môi mỏng, sắc lời',
      hint: 'Hai môi mỏng, đường miệng thanh, nói năng lưu loát sắc bén.',
      luan: 'Môi mỏng chủ người lý trí, ăn nói lưu loát, biện luận giỏi — hợp nghề dùng lời: luật, đàm phán, giảng dạy, bán hàng. Nhược của môi mỏng là tình cảm biểu đạt kiểu "lý trước tình sau": người thân dễ thấy thiếu ấm, và lời sắc quá thành lời bạc. Tướng pháp dặn: môi mỏng mà nói lời hậu là quý cách tự tu được — mỗi ngày một câu khen thật lòng cho người bên cạnh.',
      effects: [
        { aspect: 'quan_loc', delta: 1, note: 'Khẩu tài sắc bén — đàm phán, biện luận là sở trường kiếm cơm.' },
        { aspect: 'tinh_duyen', delta: -1, note: 'Lý trước tình sau, lời dễ sắc — người thân cần nghe lời ấm nhiều hơn.' },
      ],
      advice: 'Dùng lưỡi dao khẩu tài cho việc, đừng cho người nhà: mỗi ngày một lời ái ngữ là bồi cung Phu Thê tốt nhất.',
    },
    {
      id: 'nho_chum',
      label: 'Nhỏ, chúm kín đáo',
      hint: 'Miệng nhỏ so với khuôn mặt, môi hay khép, nói năng nhỏ nhẹ giữ ý.',
      luan: 'Miệng nhỏ chủ người kín đáo cẩn trọng, không nói lời thừa, giữ được bí mật — bạn tri kỷ tin tưởng, làm việc cần bảo mật rất hợp. Về lộc, miệng nhỏ "nạp" chậm: cơ hội thường không tự tìm đến qua giao tiếp mà phải nhờ thực lực tích lũy. Người miệng nhỏ nên chủ động mở lời trước trong các dịp quan trọng — một lần dám nói đúng lúc bằng mười lần chờ được hỏi.',
      effects: [
        { aspect: 'tai_bach', delta: -1, note: 'Lộc nạp chậm — cơ hội cần chủ động mở lời, đừng chờ được mời.' },
        { aspect: 'tinh_duyen', delta: 1, note: 'Kín đáo chung thủy, không buôn chuyện — người bạn đời tin tưởng.' },
      ],
    },
    {
      id: 'lech_tre',
      label: 'Lệch, khóe trễ xuống',
      hint: 'Miệng hơi lệch một bên khi nói cười, hoặc hai khóe miệng trễ xuống tạo nét buồn.',
      luan: 'Khóe miệng trễ xuống tạo "nét khổ" — chưa nói đã như phiền muộn, lâu dần người xung quanh ngại lại gần, lộc giao tiếp vì thế hao đi. Chủ người hay nhìn mặt tối của vấn đề, lời ra hay than — mà tướng pháp tin: than nhiều thì vận nghe theo lời than. Đây là bộ vị "tướng tùy tâm sửa" rõ nhất: tập cười khóe hướng lên mỗi sáng, đổi lời than thành lời biết ơn, sáu tháng sau nét mặt và vận khí đều đổi.',
      effects: [
        { aspect: 'phuc_duc', delta: -1, note: 'Nét khổ khiến người ngại gần — lộc nhân duyên hao dần theo lời than.' },
        { aspect: 'tinh_duyen', delta: -1, note: 'Không khí gia đạo nặng theo nét mặt — cười lên một nét, nhà ấm mười phần.' },
      ],
      advice: 'Mỗi sáng trước gương tập nâng khóe miệng và nói một điều biết ơn — "tướng tùy tâm sinh", miệng là nơi sửa nhanh thấy rõ nhất.',
    },
  ],
};

const TAI: NhanTuongFeatureDef = {
  id: 'tai',
  title: 'Đôi tai',
  quan: 'Thái Thính Quan',
  intro:
    'Tai là Thái Thính Quan — chủ căn cơ bẩm sinh, phúc thọ, trí tuệ nền và vận ấu thơ (1–14 tuổi). Tai quý ở dày, cứng, luân quách (vành trong ngoài) rõ ràng, thùy châu (dái tai) đầy, sắc sáng hơn mặt.',
  options: [
    {
      id: 'day_to_chau',
      label: 'Dày to, thùy châu đầy đặn',
      hint: 'Tai dày có thịt, vành rõ, dái tai đầy như giọt nước — cổ nhân gọi là tai Phật.',
      luan: 'Tai dày thùy châu đầy là tướng phúc thọ — căn cơ bẩm sinh vững, thời thơ ấu được nuôi dưỡng tử tế, lớn lên tính tình nhân hậu biết lắng nghe. Người tai dày làm việc bền gan, ít bốc đồng, tuổi thọ và sức đề kháng thuộc hàng tốt. Cách này còn chủ "có lộc trời để dành": lúc khốn khó thường có đường gỡ bất ngờ, âu cũng là phúc tích từ tính biết nghe điều phải.',
      effects: [
        { aspect: 'phuc_duc', delta: 2, note: 'Tai Phật thùy châu đầy — phúc thọ dày, lúc khó có đường gỡ.' },
        { aspect: 'suc_khoe', delta: 1, note: 'Căn cơ bẩm sinh vững, sức bền và đề kháng tốt.' },
      ],
    },
    {
      id: 'cao_qua_may',
      label: 'Mọc cao hơn ngang mày',
      hint: 'Đỉnh vành tai cao hơn đường lông mày kéo ngang.',
      luan: 'Tai mọc cao hơn mày là cách "thiên nhĩ cao huyền" — chủ thông minh sớm phát, học nhanh nhớ lâu, danh tiếng thường đến trước tuổi. Trẻ có tai cao đi học hay được thầy chú ý; người lớn tai cao tiếp thu cái mới lẹ, vào ngành nào cũng bắt nhịp nhanh. Đi cùng trán tốt thì công danh có thể thành sớm — chỉ dặn một điều: thành sớm chớ kiêu, giữ được khiêm cung thì lộc mới dài.',
      effects: [
        { aspect: 'quan_loc', delta: 2, note: 'Thiên nhĩ cao huyền — học nhanh, danh đến sớm, dễ thành tựu trước tuổi.' },
        { aspect: 'phuc_duc', delta: 1, note: 'Được thầy quý bạn mến từ nhỏ — nền nhân duyên học vấn tốt.' },
      ],
    },
    {
      id: 'mong_nho',
      label: 'Mỏng nhỏ, mềm',
      hint: 'Tai nhỏ so với khuôn mặt, bấm thấy mỏng mềm, dái tai ít thịt.',
      luan: 'Tai mỏng nhỏ chủ căn cơ bẩm sinh mảnh: thời nhỏ hay đau vặt hoặc thiếu người kề cận chăm chút, lớn lên sức bền và độ "lì đòn" phải tự rèn thêm. Người tai mỏng thường nhạy cảm, dễ dao động theo lời bàn ra tán vào — nên chọn lọc tai nghe: bớt nghe chuyện thị phi, chọn một hai người trí để hỏi. Bù đắp bằng dưỡng sinh đều đặn thì trung – hậu vận vẫn đầy đặn như thường.',
      effects: [
        { aspect: 'suc_khoe', delta: -1, note: 'Căn cơ mảnh — cần dưỡng sinh đều: ngủ đủ, vận động, khám định kỳ.' },
        { aspect: 'phuc_duc', delta: -1, note: 'Dễ dao động theo lời người — nên chọn lọc điều nghe, người hỏi.' },
      ],
      advice: 'Tai mỏng thì tự dựng "vành tai" bằng nguyên tắc: việc lớn chỉ nghe từ nguồn đáng tin, và cho mình 24 giờ trước khi đổi ý.',
    },
    {
      id: 'luan_quach_dao',
      label: 'Vành ngửa, luân quách lộn ngược',
      hint: 'Vành trong (quách) nhô lộ hơn vành ngoài (luân), tai như bẻ ngửa ra trước.',
      luan: 'Luân quách phản chủ người cá tính ngược dòng: không thích bị sắp đặt, hay hoài nghi lối cũ, thích tự thử tự sai. Thời trước cách này bị chê "phản cốt", thời nay lại là chất của người đổi mới — làm sáng tạo, công nghệ, khởi nghiệp có màu riêng. Cái phải trả là đường đi ít bằng phẳng: hay va với gia đình, thầy, sếp ở tuổi trẻ. Biết chọn trận mà "ngược" — ngược trong chuyên môn, thuận trong lễ nghĩa — thì cách này thành quý.',
      effects: [
        { aspect: 'quan_loc', delta: 1, note: 'Dám nghĩ ngược, có màu riêng — hợp đổi mới sáng tạo, mở lối chưa ai đi.' },
        { aspect: 'phuc_duc', delta: -1, note: 'Tuổi trẻ hay va với bề trên — giữ lễ trong lời, ngược trong việc thì êm.' },
      ],
    },
    {
      id: 'thap_duoi_mat',
      label: 'Mọc thấp, dưới ngang mắt',
      hint: 'Đỉnh vành tai thấp hơn đường ngang đuôi mắt.',
      luan: 'Tai mọc thấp chủ người chín muộn: thời trẻ nhận thức về đường dài đến chậm hơn bạn bè, hay đổi hướng, ngoài 30 mới thật sự biết mình muốn gì. Đây không phải cách xấu — cổ nhân gọi là "đại khí vãn thành", chuông lớn đúc lâu. Người tai thấp cần nhất là đừng so nhịp với người khác: cứ tích từng viên gạch, trung vận trở đi thường vững hơn chính những người phát sớm.',
      effects: [
        { aspect: 'quan_loc', delta: -1, note: 'Chín muộn, hay đổi hướng thời trẻ — ngoài 30 vận nghiệp mới vào nếp.' },
      ],
      advice: 'Đừng sốt ruột với nhịp của người khác — chọn một nghề đào sâu 10 năm, "đại khí vãn thành" là cách của mình.',
    },
  ],
};

// ---------------------------------------------------------------------------
// 4. Thần thái
// ---------------------------------------------------------------------------

const THAN_THAI: NhanTuongFeatureDef = {
  id: 'thanThai',
  title: 'Thần thái tổng quan',
  intro:
    '"Nhất tướng bất như nhất thần" — trăm bộ vị đẹp không bằng thần khí tốt. Thần hiện chủ yếu ở ánh mắt, sắc mặt và phong thái: đây là phần động của tướng, đổi theo nếp sống và tâm địa từng ngày.',
  options: [
    {
      id: 'an_dinh',
      label: 'Sáng mà điềm, thu tàng ổn định',
      hint: 'Ánh mắt sáng nhưng không gắt, nhìn thẳng vững vàng; sắc mặt nhuận, cử chỉ khoan thai, ngồi yên không bồn chồn.',
      luan: 'Thần khí thu tàng an định là thượng cách: tinh – khí – thần sung túc, tâm có chủ, gặp biến không loạn. Người thần định làm việc gì cũng ra việc ấy, người khác nhìn vào tự nhiên tin — đây chính là "uy tín không lời". Thần tốt có thể nâng toàn bộ cách cục: các bộ vị dù có khuyết, vận trình vẫn được thần khí kéo lên. Giữ nếp sống điều độ và tâm hướng thiện là giữ được thần.',
      effects: [
        { aspect: 'quan_loc', delta: 2, note: 'Thần định sinh uy — không nói to vẫn được nghe, cầm việc lớn được.' },
        { aspect: 'suc_khoe', delta: 2, note: 'Tinh khí thần sung túc — nền thể chất và tinh thần đều vững.' },
        { aspect: 'phuc_duc', delta: 1, note: 'Tâm có chủ, gặp biến không loạn — phúc khí theo sự bình ổn mà tụ.' },
      ],
    },
    {
      id: 'lo_quang',
      label: 'Sáng gắt, lộ ra ngoài, hay láo liên',
      hint: 'Mắt sáng nhưng đảo nhanh, khó nhìn thẳng lâu; người nhấp nhổm, nói nhanh, khó ngồi yên.',
      luan: 'Thần lộ là khí phát hết ra ngoài: người nhanh nhạy, bắt sóng cực lẹ, chớp cơ hội giỏi — nhưng như đèn vặn hết cỡ, sáng đấy mà hao dầu. Chủ vận trình lên xuống gấp, tiền vào ra nhanh, quan hệ rộng mà nông. Việc cần làm là "hồi quang": mỗi ngày dành khoảng lặng không màn hình, tập nhìn thẳng ổn định khi trò chuyện, làm ít việc hơn nhưng trọn từng việc — thần thu lại được thì mọi cung khác đều hưởng lợi.',
      effects: [
        { aspect: 'tai_bach', delta: -1, note: 'Khí phát tán — tiền vào ra gấp, cần điểm neo tích lũy cố định.' },
        { aspect: 'suc_khoe', delta: -1, note: 'Đèn vặn hết cỡ hao dầu — dễ suy nhược nếu không có khoảng lặng mỗi ngày.' },
        { aspect: 'quan_loc', delta: 1, note: 'Bắt sóng nhanh, chớp cơ hội giỏi — hợp môi trường biến động.' },
      ],
      advice: 'Tập "hồi quang phản chiếu": 15 phút tĩnh mỗi ngày, nhìn thẳng ổn định khi nói chuyện — thần thu về thì vận cũng thu về.',
    },
    {
      id: 'me_moi',
      label: 'Lờ đờ, mệt mỏi, thiếu sức sống',
      hint: 'Ánh mắt thiếu tiêu điểm, hay nhìn xuống; sắc mặt xạm tối, giọng yếu, dáng ngồi xẹp.',
      luan: 'Thần suy là dấu hiệu tinh – khí – thần đang cạn: thường do ngủ thiếu, lo nghĩ kéo dài hoặc sức khỏe hao hụt. Ở trạng thái này mọi cung vận đều tạm thời bị kéo xuống — nhìn việc thiếu sáng, nói thiếu lực, người khác cũng ngại gửi gắm. Điều quan trọng nhất cần hiểu: đây là trạng thái, không phải số phận. Ưu tiên duy nhất lúc này là dưỡng: ngủ đủ trước 23h, ăn ấm, vận động nhẹ có nắng, tạm gác quyết định lớn — thần hồi thì tướng hồi, vận hồi.',
      effects: [
        { aspect: 'suc_khoe', delta: -2, note: 'Tinh khí thần đang cạn — ưu tiên số một là ngủ, ăn, vận động điều độ.' },
        { aspect: 'quan_loc', delta: -1, note: 'Giai đoạn này tạm gác quyết định lớn, dưỡng sức trước rồi tính.' },
        { aspect: 'tai_bach', delta: -1, note: 'Thần suy nhìn việc thiếu sáng — chưa nên đầu tư, ký kết việc hệ trọng.' },
      ],
      advice: 'Ba tháng dưỡng thần: ngủ trước 23h, sáng phơi nắng vận động, bớt màn hình sau 21h — thần hồi rồi hãy xem lại tướng, sẽ khác.',
    },
  ],
};

export const NHAN_TUONG_FEATURES: NhanTuongFeatureDef[] = [
  FACE_SHAPE,
  THUONG_DINH,
  TRUNG_DINH,
  HA_DINH,
  LONG_MAY,
  MAT,
  MUI,
  MIENG,
  TAI,
  THAN_THAI,
];

export function getFeatureDef(id: NhanTuongFeatureId): NhanTuongFeatureDef {
  const def = NHAN_TUONG_FEATURES.find((f) => f.id === id);
  if (!def) throw new Error(`Unknown feature: ${id}`);
  return def;
}

export function getOption(
  featureId: NhanTuongFeatureId,
  optionId: string,
): NhanTuongOption | undefined {
  return getFeatureDef(featureId).options.find((o) => o.id === optionId);
}

// ---------------------------------------------------------------------------
// 5. Thập nhị cung — tư liệu tham khảo
// ---------------------------------------------------------------------------

export interface CungInfo {
  name: string;
  position: string;
  meaning: string;
}

export const THAP_NHI_CUNG: CungInfo[] = [
  { name: 'Cung Mệnh', position: 'Ấn đường — khoảng giữa hai đầu lông mày', meaning: 'Tổng cách cả đời. Ấn đường rộng sáng nhuận là mệnh cung quang minh; hẹp tối, nếp cắt phá là khí vận hay tắc.' },
  { name: 'Cung Quan Lộc', position: 'Chính giữa trán, dưới chân tóc', meaning: 'Công danh chức nghiệp. Vùng này đầy sáng không sẹo vết chủ đường quan lộc hanh thông, được bề trên nâng đỡ.' },
  { name: 'Cung Tài Bạch', position: 'Toàn bộ mũi, trọng ở chuẩn đầu và hai cánh', meaning: 'Tiền tài kho lộc. Chuẩn đầu đầy, cánh mũi nở kín là tài khố vững; mũi lộ khổng là của khó đọng.' },
  { name: 'Cung Huynh Đệ', position: 'Hai lông mày', meaning: 'Anh em bạn hữu. Mày thanh dài quá mắt chủ anh em hòa thuận đắc lực; thưa đứt chủ duyên bằng hữu mỏng.' },
  { name: 'Cung Điền Trạch', position: 'Mí mắt trên — khoảng từ mày đến mắt', meaning: 'Nhà đất sản nghiệp. Khoảng này rộng đầy sáng chủ có điền sản, thừa hưởng; hẹp tối chủ tự gây dựng.' },
  { name: 'Cung Tử Tức', position: 'Lệ đường — vùng nằm dưới mắt', meaning: 'Con cái. Lệ đường đầy nhuận chủ đường con cái vui vẻ; khô hãm tối chủ hao tâm vì con, cần bồi phúc.' },
  { name: 'Cung Phu Thê', position: 'Gian môn — đuôi mắt kéo về thái dương', meaning: 'Hôn nhân vợ chồng. Gian môn đầy sáng chủ hôn nhân êm; hõm tối, nếp loạn chủ tình duyên nhiều đoạn khúc.' },
  { name: 'Cung Tật Ách', position: 'Sơn căn — gốc mũi giữa hai mắt', meaning: 'Sức khỏe bệnh tật. Sơn căn cao đầy liền lạc chủ nền sức khỏe tốt; gãy hãm, nếp ngang chủ thể chất phải giữ gìn.' },
  { name: 'Cung Thiên Di', position: 'Hai góc trán sát mé tóc (thiên thương)', meaning: 'Đi xa, dời đổi, xuất ngoại. Vùng này đầy sáng chủ ra ngoài gặp quý nhân, đi xa có lộc.' },
  { name: 'Cung Nô Bộc', position: 'Hai bên mép cằm (địa các tả hữu)', meaning: 'Người dưới, cộng sự. Đầy đặn chủ người dưới trung thành đỡ đần; lép hãm chủ khó giữ người, việc phải tự tay.' },
  { name: 'Cung Phúc Đức', position: 'Trên đuôi lông mày (thiên thương – phúc đường)', meaning: 'Phúc khí tổ tiên và tự thân. Sáng nhuận chủ đời được che chở, gặp dữ hóa lành.' },
  { name: 'Cung Phụ Mẫu', position: 'Nhật giác – Nguyệt giác, hai bên trán trên', meaning: 'Cha mẹ. Hai góc cân sáng chủ song thân khang kiện, phúc ấm dày; lệch hãm chủ sớm xa cách hoặc phúc ấm mỏng.' },
];

// ---------------------------------------------------------------------------
// 6. Phân tích
// ---------------------------------------------------------------------------

export interface NhanTuongInput {
  gender: NhanTuongGender;
  faceShape: string;
  thuongDinh: string;
  trungDinh: string;
  haDinh: string;
  longMay: string;
  mat: string;
  mui: string;
  mieng: string;
  tai: string;
  thanThai: string;
}

export interface NhanTuongAspectScore {
  aspect: NhanTuongAspectId;
  label: string;
  /** 5–98 */
  score: number;
  band: 'rat_tot' | 'tot' | 'kha' | 'can_boi_dap';
  bandLabel: string;
  /** Các câu "vì sao" lấy từ effects của từng bộ vị. */
  notes: string[];
}

export interface NhanTuongFeatureReading {
  featureId: NhanTuongFeatureId;
  title: string;
  quan?: string;
  option: NhanTuongOption;
}

export interface NhanTuongResult {
  input: NhanTuongInput;
  /** Ngũ hành hình tướng của khuôn mặt. */
  faceElement: { id: string; label: string; element: string; boTro: string };
  /** Tam đình gắn với 3 đoạn vận đời. */
  tamDinh: {
    featureId: NhanTuongFeatureId;
    vanLabel: string;
    title: string;
    option: NhanTuongOption;
  }[];
  tamDinhBalance: string;
  /** Ngũ quan + thần thái. */
  nguQuan: NhanTuongFeatureReading[];
  aspects: NhanTuongAspectScore[];
  overallScore: number;
  overallLabel: string;
  overallNote: string;
  /** Ghi chú riêng theo giới tính (nếu có). */
  genderNotes: string[];
  /** Lời khuyên bồi đắp gom từ các bộ vị kém đắc cách. */
  advices: string[];
}

function bandOf(score: number): NhanTuongAspectScore['band'] {
  if (score >= 78) return 'rat_tot';
  if (score >= 62) return 'tot';
  if (score >= 46) return 'kha';
  return 'can_boi_dap';
}

const BAND_LABELS: Record<NhanTuongAspectScore['band'], string> = {
  rat_tot: 'Rất tốt — đắc cách',
  tot: 'Tốt',
  kha: 'Khá · trung bình',
  can_boi_dap: 'Cần bồi đắp',
};

function clamp(n: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, n));
}

/** Kiểm tra input có hợp lệ (mọi option id tồn tại) không. */
export function isValidNhanTuongInput(input: NhanTuongInput): boolean {
  if (input.gender !== 'nam' && input.gender !== 'nu') return false;
  return NHAN_TUONG_FEATURES.every((f) =>
    f.options.some((o) => o.id === input[f.id]),
  );
}

export function analyzeNhanTuong(input: NhanTuongInput): NhanTuongResult {
  const pick = (f: NhanTuongFeatureDef): NhanTuongOption => {
    const opt = f.options.find((o) => o.id === input[f.id]);
    if (!opt) throw new Error(`Invalid option for ${f.id}: ${input[f.id]}`);
    return opt;
  };

  const faceOpt = pick(FACE_SHAPE);
  const elementInfo = FACE_ELEMENT_INFO[faceOpt.id];

  const tamDinhDefs: { def: NhanTuongFeatureDef; vanLabel: string }[] = [
    { def: THUONG_DINH, vanLabel: 'Tiền vận · 15–30 tuổi' },
    { def: TRUNG_DINH, vanLabel: 'Trung vận · 31–50 tuổi' },
    { def: HA_DINH, vanLabel: 'Hậu vận · 51 tuổi trở đi' },
  ];
  const tamDinh = tamDinhDefs.map(({ def, vanLabel }) => ({
    featureId: def.id,
    vanLabel,
    title: def.title,
    option: pick(def),
  }));

  const balancedCount = tamDinh.filter(
    (d) => d.option.id === 'can_doi',
  ).length;
  const goodCount = tamDinh.filter((d) =>
    ['cao_rong', 'no_nang', 'day_no'].includes(d.option.id),
  ).length;
  let tamDinhBalance: string;
  if (goodCount === 3) {
    tamDinhBalance =
      'Tam đình đều nở đầy — cách "tam đình bình ổn, nhất sinh y lộc vô khuy": ba đoạn vận đời nối nhau nâng đỡ, thuộc hàng tướng cách hiếm gặp.';
  } else if (goodCount + balancedCount === 3) {
    tamDinhBalance =
      'Tam đình cân xứng, không đoạn nào khuyết hãm — vận trình ba giai đoạn nối nhau êm thuận, đoạn nào có bộ vị tốt trợ lực thì đoạn ấy bật lên.';
  } else if (goodCount >= 1) {
    tamDinhBalance =
      'Tam đình có đoạn nở đoạn hụt — đời người theo đó có giai đoạn thuận nổi bật và giai đoạn phải gắng sức; biết trước nhịp để liệu sức, dồn lực vào đoạn vận nở là khôn ngoan.';
  } else {
    tamDinhBalance =
      'Tam đình thiên về thanh gọn, không có đoạn nào quá nở — vận trình bền ở sự cần cù đều đặn; phúc đức và thần thái sẽ là hai điểm quyết định cách cục.';
  }

  const nguQuanDefs = [LONG_MAY, MAT, MUI, MIENG, TAI, THAN_THAI];
  const nguQuan: NhanTuongFeatureReading[] = nguQuanDefs.map((def) => ({
    featureId: def.id,
    title: def.title,
    quan: def.quan,
    option: pick(def),
  }));

  // Gom hiệu ứng từ tất cả bộ vị đã chọn
  const allReadings: NhanTuongFeatureReading[] = [
    { featureId: FACE_SHAPE.id, title: FACE_SHAPE.title, option: faceOpt },
    ...tamDinh.map((d) => ({
      featureId: d.featureId,
      title: d.title,
      option: d.option,
    })),
    ...nguQuan,
  ];

  const aspects: NhanTuongAspectScore[] = ASPECT_ORDER.map((aspect) => {
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
      'Cách cục tổng thể đắc cách hiếm gặp: các bộ vị trọng yếu tương hỗ lẫn nhau, nền vận vững cả ba đoạn đời. Càng nên giữ tâm khiêm hạ và tích thiện — tướng quý mà đức mỏng thì lộc khó bền.';
  } else if (overallBand === 'tot') {
    overallNote =
      'Cách cục tổng thể thuộc hàng tốt: điểm mạnh rõ rệt đủ nâng vận trình, vài chỗ chưa đắc cách đều có đường bồi đắp bằng nếp sống và tâm địa. Dồn lực vào phương diện cao điểm nhất là thuận thiên thời.';
  } else if (overallBand === 'kha') {
    overallNote =
      'Cách cục tổng thể trung bình khá: không có đại cách nhưng cũng không phá cách — thành bại phần lớn nằm ở nỗ lực và chọn đúng sở trường. Xem kỹ phương diện điểm cao nhất để phát huy, phương diện thấp nhất để phòng bị.';
  } else {
    overallNote =
      'Cách cục hiện tại nhiều bộ vị chưa đắc cách — nhưng tướng pháp luôn dạy "hữu tâm vô tướng, tướng tự tâm sinh": tâm địa và nếp sống đổi thì thần sắc đổi, thần sắc đổi thì vận đổi. Các lời khuyên bồi đắp bên dưới chính là lộ trình.';
  }

  // Ghi chú theo giới tính — vài luật riêng cổ truyền
  const genderNotes: string[] = [];
  if (input.gender === 'nu') {
    if (input.mui === 'cao_thang_no' || input.mui === 'su_tu') {
      genderNotes.push(
        'Nữ giới mũi đầy có thế, cổ nhân gọi là tướng "vượng phu ích tử" — về nhà chồng thì kinh tế gia đình có nền đi lên, tiếng nói trong nhà được nể.',
      );
    }
    if (input.mat === 'den_trang_ro' || input.thanThai === 'an_dinh') {
      genderNotes.push(
        'Nữ giới quý nhất ở thần thanh khí tĩnh — mắt sáng mà điềm là "quý khí", hơn mọi nét đẹp hình thức theo quan điểm tướng pháp.',
      );
    }
  } else {
    if (input.haDinh === 'day_no') {
      genderNotes.push(
        'Nam giới địa các nở đầy là tướng có hậu — càng trung niên về sau càng có người theo về, làm quản lý giữ được người.',
      );
    }
    if (input.thuongDinh === 'cao_rong') {
      genderNotes.push(
        'Nam giới trán cao rộng, cổ nhân xếp vào cách "thiếu niên đắc chí" — nên tận dụng đoạn vận trẻ để lập nền học vấn, sự nghiệp.',
      );
    }
  }

  const advices: string[] = [];
  for (const r of allReadings) {
    if (r.option.advice) advices.push(r.option.advice);
  }
  advices.push(
    'Tướng pháp chỉ là tấm gương soi thiên hướng — "tướng tùy tâm sinh, tướng tùy tâm diệt". Giữ tâm ngay, làm lành, nói lời ái ngữ, ngủ nghỉ điều độ: đó là phép "sửa tướng" căn bản nhất mà cổ nhân và nhà Phật cùng dạy.',
  );

  return {
    input,
    faceElement: {
      id: faceOpt.id,
      label: faceOpt.label,
      element: elementInfo.element,
      boTro: elementInfo.boTro,
    },
    tamDinh,
    tamDinhBalance,
    nguQuan,
    aspects,
    overallScore,
    overallLabel,
    overallNote,
    genderNotes,
    advices,
  };
}
