/**
 * Engine luận số theo nguyên lý Âm Dương Ngũ Hành, Kinh dịch diệu luận dùng chung cho mọi loại dãy số:
 * SIM, tài khoản ngân hàng, số nhà, biển số xe, CCCD, thẻ, mã số thuế,
 * giá bán, ngày sinh, mật khẩu, số ghế…
 *
 * Nguồn phương pháp: bộ sách "nguyên lý Âm Dương Ngũ Hành, Kinh dịch diệu luận"
 * (Thẩm Lập Minh) và "nguyên lý Âm Dương Ngũ Hành, Kinh dịch diệu luận — Luận Giải Số Điện Thoại":
 * 8 từ trường (4 cát · 4 hung) từ Du Niên Hậu Thiên Bát Quái,
 * số 0 · 5 là "biến số" (0 ẩn tàng — khóa/biến chất năng lượng,
 * 5 hiển lộ — khuếch đại), tổ hợp chế hóa giữa các sao và
 * nguyên tắc trọng phần đuôi dãy số.
 *
 * Bảng cặp số chuẩn (quái số Hậu Thiên: 1 Khảm · 2 Khôn · 3 Chấn ·
 * 4 Tốn · 6 Càn · 7 Đoài · 8 Cấn · 9 Ly):
 *   Sinh Khí  14 · 67 · 39 · 28      Họa Hại    17 · 89 · 46 · 23
 *   Thiên Y   13 · 68 · 49 · 27      Lục Sát    16 · 47 · 38 · 29
 *   Diên Niên 19 · 78 · 34 · 26      Ngũ Quỷ    18 · 79 · 36 · 24
 *   Phục Vị   11 · 22 … 99           Tuyệt Mệnh 12 · 69 · 48 · 37
 */

export type StarId =
  | 'sinh_khi'
  | 'thien_y'
  | 'dien_nien'
  | 'phuc_vi'
  | 'hoa_hai'
  | 'luc_sat'
  | 'ngu_quy'
  | 'tuyet_menh';

export type StarKind = 'cat' | 'hung';

export type AspectId =
  | 'tai_loc'
  | 'su_nghiep'
  | 'tinh_cam'
  | 'suc_khoe'
  | 'quy_nhan';

export const ASPECT_LABELS: Record<AspectId, string> = {
  tai_loc: 'Tài lộc',
  su_nghiep: 'Sự nghiệp',
  tinh_cam: 'Tình cảm',
  suc_khoe: 'Sức khỏe',
  quy_nhan: 'Quý nhân · quan hệ',
};

export const ASPECT_ORDER: AspectId[] = [
  'tai_loc',
  'su_nghiep',
  'tinh_cam',
  'suc_khoe',
  'quy_nhan',
];

export interface StarInfo {
  id: StarId;
  nameVi: string;
  nameHan: string;
  kind: StarKind;
  rank: 'dai_cat' | 'cat' | 'hung' | 'dai_hung';
  /** đóng góp 0–100 khi là 1 cặp */
  score: number;
  /** tóm tắt một dòng */
  tagline: string;
  /** sao chủ về điều gì */
  chuVe: string;
  /** luận nghĩa đầy đủ theo sách */
  meaning: string;
  taiLoc: string;
  suNghiep: string;
  tinhCam: string;
  sucKhoe: string;
  uuDiem: string[];
  nhuocDiem: string[];
  /** điểm 0–100 theo từng phương diện */
  aspects: Record<AspectId, number>;
}

export interface PairAnalysis {
  a: number;
  b: number;
  /** cặp quái số, vd "68" */
  label: string;
  /** đoạn số gốc trên dãy gồm cả 0/5 xen giữa, vd "608" */
  raw: string;
  star: StarInfo;
  /** cường độ trong nội bộ sao: 4 mạnh nhất … 1 nhẹ nhất */
  level: 1 | 2 | 3 | 4;
  levelLabel: string;
  /** động (năng lượng mạnh) hay tĩnh (nhẹ) theo sách */
  dongTinh: 'động' | 'tĩnh';
  /** số 0 xen giữa cặp */
  zeros: number;
  /** số 5 xen giữa cặp */
  fives: number;
  modifierNote?: string;
  /** điểm cặp sau điều chỉnh 0/5 */
  effectiveScore: number;
  isTail: boolean;
}

export interface ComboNote {
  kind: 'cat' | 'che_hoa' | 'hung';
  title: string;
  detail: string;
  /** các cặp liên quan, vd "68 → 82" */
  pairs: string;
}

export interface TailAnalysis {
  last3: string;
  last2: string;
  /** sao của cặp cuối cùng */
  star?: StarInfo;
  notes: string[];
  /** cảnh báo đuôi 0 / 05 (đại kỵ theo sách) */
  warning?: string;
}

export type Element = 'kim' | 'moc' | 'thuy' | 'hoa' | 'tho';

export interface BatCucOptions {
  /**
   * Áp dụng đại kỵ đuôi 0/05 (sách: "Tứ đại giai không").
   * Tắt cho dãy không đổi được (CCCD, ngày sinh) — chỉ ghi chú nhẹ.
   */
  applyTailTaboo?: boolean;
  /** Trọng số nhấn phần đuôi (mặc định 2 cho cặp cuối, 1.5 cặp kề cuối). */
  tailEmphasis?: number;
  /** Năm sinh để xem hợp mệnh Nạp Âm (tùy trang). */
  birthYear?: number;
}

export interface BatCucAnalysis {
  digits: number[];
  pairs: PairAnalysis[];
  starCounts: Record<StarId, number>;
  catPairs: number;
  hungPairs: number;
  /** điểm Du Niên (đã gồm 0/5, tổ hợp, đuôi) */
  duNienScore: number;
  /** điểm tổng generic (Du Niên + âm dương + nút) — topic có thể tự trộn lại */
  overallScore: number;
  verdict: 'tot' | 'kha' | 'trung_binh' | 'yeu';
  combos: ComboNote[];
  tail: TailAnalysis;
  aspects: { id: AspectId; label: string; score: number }[];
  patterns: string[];
  amCount: number;
  duongCount: number;
  amDuongScore: number;
  tongSo: number;
  tongNut: number;
  birthYear?: number;
  napAm?: { name: string; element: Element };
  elementRelation?: {
    sim: Element;
    menh: Element;
    relation: string;
    score: number;
  };
}

export const STARS: Record<StarId, StarInfo> = {
  sinh_khi: {
    id: 'sinh_khi',
    nameVi: 'Sinh Khí',
    nameHan: '生氣',
    kind: 'cat',
    rank: 'dai_cat',
    score: 92,
    tagline: 'Đại cát — quý nhân, lạc quan, vượng khí.',
    chuVe: 'Quý nhân phù trợ · cơ hội mới · tinh thần vui vẻ',
    meaning:
      'Sinh Khí là sao tốt nhất về mặt tinh thần trong nguyên lý Âm Dương Ngũ Hành, Kinh dịch diệu luận. Người mang nhiều từ trường Sinh Khí lạc quan, bao dung, gặp khó không nản, thường xuyên có quý nhân xuất hiện giúp đỡ đúng lúc — gặp dữ hóa lành.',
    taiLoc:
      'Chiêu tài nhờ quý nhân và cơ hội mới; tiền đến tự nhiên nhưng do tính dễ hài lòng nên cần chủ động nắm bắt, tránh bỏ lỡ vận may.',
    suNghiep:
      'Được cấp trên và bạn bè nâng đỡ, môi trường làm việc thuận hòa; rất hợp các nghề cần giao tiếp, bán hàng, đối ngoại.',
    tinhCam: 'Cởi mở, dễ gần, quan hệ rộng; tình cảm êm ả, ít sóng gió.',
    sucKhoe:
      'Nhìn chung tốt; nhưng nhiều Sinh Khí dễ chủ quan với sức khỏe, sách lưu ý riêng các vấn đề về dạ dày.',
    uuDiem: ['Lạc quan, cởi mở', 'Quý nhân phù trợ', 'Bao dung, dễ gần', 'Gặp dữ hóa lành'],
    nhuocDiem: ['Thiếu tham vọng', 'Dễ hài lòng, thiếu quyết đoán', 'Lười thay đổi'],
    aspects: { tai_loc: 82, su_nghiep: 85, tinh_cam: 80, suc_khoe: 78, quy_nhan: 95 },
  },
  thien_y: {
    id: 'thien_y',
    nameVi: 'Thiên Y',
    nameHan: '天醫',
    kind: 'cat',
    rank: 'dai_cat',
    score: 95,
    tagline: 'Đại cát — chính tài, trí tuệ, hôn nhân viên mãn.',
    chuVe: 'Tài lộc (chính tài) · thông minh thiện lương · hôn nhân hạnh phúc',
    meaning:
      'Thiên Y là sao tài lộc mạnh nhất, chủ về "chính tài" và "chính đào hoa". Người mang từ trường Thiên Y thông minh, đa tài, thiện lương, có khả năng kiếm tiền từ tám phương; trong hôn nhân đây là sao của sự viên mãn.',
    taiLoc:
      'Chính tài vượng — kiếm tiền bằng thực lực và may mắn tài chính; còn mang lại sự sung túc cho người thân xung quanh. Nhược điểm: tiêu tiền thoáng, thiếu khái niệm giữ tiền.',
    suNghiep:
      'Dễ trở thành trợ thủ đắc lực, được tin tưởng giao việc lớn; hợp kinh doanh, tài chính, y dược.',
    tinhCam:
      'Sao của hôn nhân viên mãn; tình cảm chân thành nhưng cả tin, dễ bị lợi dụng.',
    sucKhoe: 'Cần chú ý huyết áp và các bệnh liên quan hệ tuần hoàn máu.',
    uuDiem: ['Thông minh, đa tài', 'Vận may tài chính', 'Nhân hậu, không mưu mô', 'Hôn nhân tốt đẹp'],
    nhuocDiem: ['Cả tin, dễ bị lừa', 'Không có khái niệm tiền bạc', 'Dễ xúc động'],
    aspects: { tai_loc: 95, su_nghiep: 82, tinh_cam: 90, suc_khoe: 82, quy_nhan: 82 },
  },
  dien_nien: {
    id: 'dien_nien',
    nameVi: 'Diên Niên',
    nameHan: '延年',
    kind: 'cat',
    rank: 'cat',
    score: 86,
    tagline: 'Cát — năng lực chuyên môn, uy quyền, giữ tiền.',
    chuVe: 'Sự nghiệp · lãnh đạo · thủ tài (giữ tiền)',
    meaning:
      'Diên Niên đại diện cho năng lực chuyên môn, uy quyền và khả năng giữ tiền. Đây là bộ số của người lãnh đạo: phong cách mạnh mẽ, ý chí kiên định, tinh thần trách nhiệm và ý thức công lý cao. Sách nhấn mạnh: dãy số chỉ có Thiên Y (biết kiếm) mà thiếu Diên Niên (biết giữ) thì tiền cũng tan biến.',
    taiLoc:
      'Thủ tài — biết quản lý tiền bạc, tích lũy bền vững; kiếm tiền bằng năng lực chuyên môn thượng thừa.',
    suNghiep:
      'Sao mạnh nhất về sự nghiệp: khả năng lãnh đạo, tự chủ cao, được nể trọng; hợp vị trí quản lý, điều hành.',
    tinhCam:
      'Chung thủy, trách nhiệm; nhưng phong cách áp đặt, khó thuyết phục nên cần mềm mỏng trong gia đạo.',
    sucKhoe:
      'Tham công tiếc việc nên dễ mất ngủ, rụng tóc, đau vai gáy, xương khớp.',
    uuDiem: ['Bản lĩnh lãnh đạo', 'Trách nhiệm, chính trực', 'Biết quản lý tiền', 'Tự chủ cao'],
    nhuocDiem: ['Áp đặt, khó thuyết phục', 'Bận rộn, áp lực cao', 'Bồn chồn, mệt mỏi'],
    aspects: { tai_loc: 86, su_nghiep: 95, tinh_cam: 74, suc_khoe: 64, quy_nhan: 76 },
  },
  phuc_vi: {
    id: 'phuc_vi',
    nameVi: 'Phục Vị',
    nameHan: '伏位',
    kind: 'cat',
    rank: 'cat',
    score: 68,
    tagline: 'Cát — an định, kiên trì, tích lũy.',
    chuVe: 'Ổn định · kiên trì · kéo dài năng lượng sao đứng trước',
    meaning:
      'Phục Vị (các cặp số lặp 11 · 22 … 99) mang tính chờ đợi, tích lũy và duy trì. Đặc biệt: Phục Vị kéo dài và củng cố năng lượng của sao đứng ngay trước nó — đứng sau cát tinh thì cát bền, đứng sau hung tinh thì hung dai dẳng.',
    taiLoc: 'Giữ được thành quả, tích lũy chậm mà chắc; ít đột phá về tiền bạc.',
    suNghiep:
      'Bền bỉ, cẩn thận, hợp công việc chuyên môn ổn định; vì bảo thủ nên sự nghiệp tiến chậm, ngại đầu tư mạo hiểm.',
    tinhCam:
      'Chung thủy nhưng rụt rè, thụ động trong quan hệ; dễ thiếu cảm giác an toàn.',
    sucKhoe:
      'Chú ý năng lượng tim mạch và trạng thái tâm lý (hay lo nghĩ, dồn nén).',
    uuDiem: ['Kiên nhẫn, cẩn thận', 'Bền bỉ giữ thành quả', 'Định tâm tốt'],
    nhuocDiem: ['Bảo thủ, thụ động', 'Sợ mạo hiểm', 'Dễ trì trệ nếu dùng sai chỗ'],
    aspects: { tai_loc: 66, su_nghiep: 62, tinh_cam: 66, suc_khoe: 70, quy_nhan: 60 },
  },
  hoa_hai: {
    id: 'hoa_hai',
    nameVi: 'Họa Hại',
    nameHan: '禍害',
    kind: 'hung',
    rank: 'hung',
    score: 34,
    tagline: 'Hung — khẩu thiệt thị phi, họa từ miệng mà ra.',
    chuVe: 'Thị phi cãi vã · tiểu nhân · nhưng có "khẩu tài" hùng biện',
    meaning:
      'Người mang từ trường Họa Hại có năng khiếu ngôn ngữ, hùng biện giỏi — sách gọi là "khẩu tài". Mặt trái là "họa từ miệng mà ra": hiếu thắng, yêu thể diện, lời nói sắc bén nên dễ gây tranh cãi, chuốc thị phi và bị tiểu nhân hãm hại.',
    taiLoc:
      'Dễ mất lộc vì thị phi, kiện cáo vặt; tiền hao vào những rắc rối ngoài ý muốn.',
    suNghiep:
      'Nếu làm nghề dùng lời nói (sale, MC, luật sư, giảng dạy) thì khẩu tài lại thành lợi thế; nghề khác dễ vướng va chạm đồng nghiệp.',
    tinhCam: 'Nóng nảy, hay cãi vã, khắc khẩu với người thân.',
    sucKhoe: 'Sức đề kháng yếu, hay mắc bệnh đường hô hấp.',
    uuDiem: ['Hùng biện, thuyết phục', 'Phản biện sắc bén'],
    nhuocDiem: ['Nóng tính, hay cãi vã', 'Thị phi, tiểu nhân', 'Hiếu thắng, sĩ diện', 'Đề kháng kém'],
    aspects: { tai_loc: 36, su_nghiep: 46, tinh_cam: 34, suc_khoe: 30, quy_nhan: 35 },
  },
  luc_sat: {
    id: 'luc_sat',
    nameVi: 'Lục Sát',
    nameHan: '六煞',
    kind: 'hung',
    rank: 'hung',
    score: 38,
    tagline: 'Hung — phiền muộn, do dự, đào hoa xấu.',
    chuVe: 'Rắc rối tình cảm · do dự · nhưng giỏi giao tế, thẩm mỹ cao',
    meaning:
      'Lục Sát chủ về cảm xúc và giao tế. Người mang sao này tinh tế, để ý chi tiết, thẩm mỹ cao, giỏi ngoại giao và rất có duyên với người khác giới — nhưng thường là "đào hoa xấu". Đa sầu đa cảm, hay do dự, chịu áp lực kém, dễ phiền muộn.',
    taiLoc:
      'Quan hệ cá nhân có thể mang lại tiền bạc, nhưng cũng dễ hao tài vì tình cảm, hưởng thụ, ăn diện.',
    suNghiep:
      'Hợp nghề dịch vụ, giao tế, làm đẹp; hiệu quả công việc giảm vì thiếu quyết đoán.',
    tinhCam:
      'Đào hoa vượng nhưng phức tạp, dễ vướng quan hệ ngoài luồng, tình cảm bất ổn.',
    sucKhoe: 'Dễ trầm uất, mất cân bằng cảm xúc; cần giữ tâm ổn định.',
    uuDiem: ['Giỏi giao tiếp, ngoại giao', 'Tinh tế, thẩm mỹ cao', 'Thích nghi nhanh'],
    nhuocDiem: ['Do dự, thiếu quyết đoán', 'Đa sầu đa cảm, dễ trầm uất', 'Đào hoa xấu, rắc rối tình cảm'],
    aspects: { tai_loc: 42, su_nghiep: 42, tinh_cam: 26, suc_khoe: 40, quy_nhan: 52 },
  },
  ngu_quy: {
    id: 'ngu_quy',
    nameVi: 'Ngũ Quỷ',
    nameHan: '五鬼',
    kind: 'hung',
    rank: 'hung',
    score: 30,
    tagline: 'Hung — biến động ngầm, đa nghi; bù lại rất tài hoa.',
    chuVe: 'Thay đổi đột ngột · hao tài ngầm · đa nghi · tài hoa sáng tạo',
    meaning:
      'Ngũ Quỷ là sao của trí tuệ và biến động: người mang từ trường này cực kỳ thông minh, tư duy linh hoạt, tài hoa xuất chúng — đặc biệt trong nghệ thuật, sáng tạo và huyền học. Mặt trái: tâm bất định, hay nghi ngờ, khó tin người, tiền bạc và sự việc hay thay đổi đột ngột khó lường.',
    taiLoc:
      'Hao tài ngầm, tiền vào rồi ra không rõ lý do; kỵ hùn hạp thiếu minh bạch.',
    suNghiep:
      'Hợp nghề sáng tạo, nghệ thuật, nghiên cứu, công nghệ, huyền học — nơi "nhiều ý tưởng" là tài sản.',
    tinhCam: 'Thiếu tin tưởng lẫn nhau, hôn nhân dễ lục đục vì nghi ngờ.',
    sucKhoe:
      'Tâm bất an, ngủ kém; sách còn cảnh báo tai họa huyết quang khi Ngũ Quỷ quá vượng.',
    uuDiem: ['Thông minh xuất chúng', 'Sáng tạo, nhiều ý tưởng', 'Phản ứng nhanh, ham học'],
    nhuocDiem: ['Đa nghi, khó tin người', 'Thất thường, bất ổn', 'Hao tài ngầm'],
    aspects: { tai_loc: 30, su_nghiep: 46, tinh_cam: 26, suc_khoe: 34, quy_nhan: 32 },
  },
  tuyet_menh: {
    id: 'tuyet_menh',
    nameVi: 'Tuyệt Mệnh',
    nameHan: '絕命',
    kind: 'hung',
    rank: 'dai_hung',
    score: 16,
    tagline: 'Đại hung — phá tài, cực đoan, biến động lớn.',
    chuVe: 'Phá tài · kiện tụng · tai nạn · tính cách cực đoan',
    meaning:
      'Tuyệt Mệnh là hung tinh nặng nhất: cuộc sống biến động lớn và phân cực. Người mang từ trường này dám làm dám chịu, phản ứng cực nhanh, tâm địa thiện lương thẳng thắn — nhưng bốc đồng, nóng nảy, quản lý cảm xúc kém, dễ mạo hiểm quá đà dẫn tới phá tài, tranh chấp pháp lý, tai nạn, thậm chí nghiện cờ bạc.',
    taiLoc:
      'Không giữ được tiền — đầu tư thua lỗ, phá tài; chỉ khi được Thiên Y chế hóa mới chuyển thành "mạo hiểm sinh lời".',
    suNghiep:
      'Quyết đoán liều lĩnh, hợp môi trường cạnh tranh khốc liệt (đầu tư, thể thao) nhưng rủi ro thất bại lớn.',
    tinhCam: 'Cực đoan, dễ tổn thương nhau; quan hệ căng thẳng.',
    sucKhoe:
      'Dễ gặp tai nạn bất ngờ, sức khỏe suy giảm khi sao này đóng ở đuôi dãy số.',
    uuDiem: ['Quyết đoán, dám làm dám chịu', 'Phản ứng cực nhanh', 'Thẳng thắn, trọng bạn bè'],
    nhuocDiem: ['Phá tài, đầu tư thua lỗ', 'Bốc đồng, cực đoan', 'Kiện tụng, tai nạn', 'Dễ sa cờ bạc'],
    aspects: { tai_loc: 15, su_nghiep: 30, tinh_cam: 24, suc_khoe: 20, quy_nhan: 26 },
  },
};

export const STAR_ORDER: StarId[] = [
  'sinh_khi',
  'thien_y',
  'dien_nien',
  'phuc_vi',
  'hoa_hai',
  'luc_sat',
  'ngu_quy',
  'tuyet_menh',
];

/**
 * Tổ hợp (không thứ tự) → sao + cường độ nội bộ (4 mạnh nhất … 1 nhẹ).
 * Thứ tự cường độ theo sách: hai tổ hợp đầu là "động" (năng lượng mạnh),
 * hai tổ hợp sau là "tĩnh" (năng lượng nhẹ hơn).
 */
const STAR_COMBOS: Record<StarId, string[]> = {
  sinh_khi: ['14', '67', '39', '28'],
  thien_y: ['13', '68', '49', '27'],
  dien_nien: ['19', '78', '34', '26'],
  phuc_vi: [],
  hoa_hai: ['17', '89', '46', '23'],
  luc_sat: ['16', '47', '38', '29'],
  ngu_quy: ['18', '79', '36', '24'],
  tuyet_menh: ['12', '69', '48', '37'],
};

const PAIR_LOOKUP: Record<string, { star: StarId; level: 1 | 2 | 3 | 4 }> = {};
for (const [starId, combos] of Object.entries(STAR_COMBOS) as [
  StarId,
  string[],
][]) {
  combos.forEach((combo, i) => {
    const level = (4 - i) as 1 | 2 | 3 | 4;
    PAIR_LOOKUP[combo] = { star: starId, level };
    PAIR_LOOKUP[combo[1] + combo[0]] = { star: starId, level };
  });
}
// Phục Vị: cặp số lặp (0 và 5 không thuộc quái — xử lý riêng ở phần biến số)
for (let d = 1; d <= 9; d++) {
  if (d === 5) continue;
  PAIR_LOOKUP[`${d}${d}`] = { star: 'phuc_vi', level: 2 };
}

const LEVEL_LABELS: Record<number, string> = {
  4: 'Rất mạnh',
  3: 'Mạnh',
  2: 'Vừa',
  1: 'Nhẹ',
};

/** Ý nghĩa từng chữ số theo Hậu Thiên Bát Quái — dùng cho dãy ngắn (số nhà, tầng, ghế). */
export interface DigitMeaning {
  digit: number;
  quai: string;
  element: Element | null;
  elementLabel: string;
  nature: string;
  folk: string;
}

export const DIGIT_MEANINGS: Record<number, DigitMeaning> = {
  0: {
    digit: 0,
    quai: 'Không thuộc quái',
    element: null,
    elementLabel: '—',
    nature:
      'Biến số ẩn tàng: trạng thái chưa hiển lộ, khóa hoặc làm chậm năng lượng của số đi kèm; nhiều số 0 chủ vất vả mà kết quả ẩn.',
    folk: 'Tròn đầy nhưng trống — dân gian coi là "không", cần số cát đi kèm.',
  },
  1: {
    digit: 1,
    quai: 'Khảm ☵',
    element: 'thuy',
    elementLabel: 'Thủy',
    nature: 'Khởi đầu, trí tuệ, hướng nội; linh hoạt như nước, thích nghi giỏi.',
    folk: 'Số khởi sự, độc lập, nhất quán.',
  },
  2: {
    digit: 2,
    quai: 'Khôn ☷',
    element: 'tho',
    elementLabel: 'Thổ',
    nature: 'Nhu hòa, bao dung, bền bỉ; chủ về đất đai, người mẹ, sự nâng đỡ.',
    folk: 'Số song hỷ, có đôi có cặp.',
  },
  3: {
    digit: 3,
    quai: 'Chấn ☳',
    element: 'moc',
    elementLabel: 'Mộc',
    nature: 'Sấm động — hành động, bộc phát, tiến thủ, dám khởi xướng.',
    folk: 'Số "tài" (dân gian đọc chệch), vững như kiềng ba chân.',
  },
  4: {
    digit: 4,
    quai: 'Tốn ☴',
    element: 'moc',
    elementLabel: 'Mộc',
    nature: 'Gió — mềm dẻo, thấm sâu, giỏi giao thiệp, buôn bán.',
    folk: 'Dân gian kiêng đọc chệch "tứ = tử"; trong Âm Dương Ngũ Hành, 4 (Tốn) vẫn là quái số bình thường, đi với 1 thành Sinh Khí rất tốt.',
  },
  5: {
    digit: 5,
    quai: 'Trung cung',
    element: 'tho',
    elementLabel: 'Thổ',
    nature:
      'Biến số hiển lộ: khuếch đại, làm bộc phát năng lượng của số đi kèm — cát càng cát, hung càng hung.',
    folk: 'Số ngũ hành trung tâm, quyền uy; dân gian "sinh" (năm sinh).',
  },
  6: {
    digit: 6,
    quai: 'Càn ☰',
    element: 'kim',
    elementLabel: 'Kim',
    nature: 'Trời — quyền quý, người cha, lãnh đạo, quyết đoán.',
    folk: 'Số "lộc" — dân gian rất chuộng.',
  },
  7: {
    digit: 7,
    quai: 'Đoài ☱',
    element: 'kim',
    elementLabel: 'Kim',
    nature: 'Đầm — vui vẻ, khẩu thuyết, giao lưu, đổi mới.',
    folk: 'Dân gian đọc "thất" (mất) nhưng trong Âm Dương Ngũ Hành, 7 (Đoài) đi với 6 thành Sinh Khí.',
  },
  8: {
    digit: 8,
    quai: 'Cấn ☶',
    element: 'tho',
    elementLabel: 'Thổ',
    nature: 'Núi — tích lũy, dừng nghỉ đúng lúc, bền vững, thật thà.',
    folk: 'Số "phát" — dân gian rất chuộng.',
  },
  9: {
    digit: 9,
    quai: 'Ly ☲',
    element: 'hoa',
    elementLabel: 'Hỏa',
    nature: 'Lửa — sáng rực, danh tiếng, lễ nghĩa, nhìn xa.',
    folk: 'Số "cửu" — trường cửu, vĩnh viễn.',
  },
};

const ELEMENT_LABEL: Record<Element, string> = {
  kim: 'Kim',
  moc: 'Mộc',
  thuy: 'Thủy',
  hoa: 'Hỏa',
  tho: 'Thổ',
};

/** Nạp Âm theo (year-4)%60 — mỗi 2 năm một mệnh */
const NAP_AM: { name: string; element: Element }[] = [
  { name: 'Hải Trung Kim', element: 'kim' },
  { name: 'Lư Trung Hỏa', element: 'hoa' },
  { name: 'Đại Lâm Mộc', element: 'moc' },
  { name: 'Lộ Bàng Thổ', element: 'tho' },
  { name: 'Kiếm Phong Kim', element: 'kim' },
  { name: 'Sơn Đầu Hỏa', element: 'hoa' },
  { name: 'Giản Hạ Thủy', element: 'thuy' },
  { name: 'Thành Đầu Thổ', element: 'tho' },
  { name: 'Bạch Lạp Kim', element: 'kim' },
  { name: 'Dương Liễu Mộc', element: 'moc' },
  { name: 'Tuyền Trung Thủy', element: 'thuy' },
  { name: 'Ốc Thượng Thổ', element: 'tho' },
  { name: 'Lôi Hỏa Hỏa', element: 'hoa' },
  { name: 'Tùng Bách Mộc', element: 'moc' },
  { name: 'Trường Lưu Thủy', element: 'thuy' },
  { name: 'Sa Trung Kim', element: 'kim' },
  { name: 'Sơn Hạ Hỏa', element: 'hoa' },
  { name: 'Bình Địa Mộc', element: 'moc' },
  { name: 'Bích Thượng Thổ', element: 'tho' },
  { name: 'Kim Bạc Kim', element: 'kim' },
  { name: 'Phú Đăng Hỏa', element: 'hoa' },
  { name: 'Thiên Hà Thủy', element: 'thuy' },
  { name: 'Đại Trạch Thổ', element: 'tho' },
  { name: 'Thoa Xuyến Kim', element: 'kim' },
  { name: 'Tang Đố Mộc', element: 'moc' },
  { name: 'Đại Khê Thủy', element: 'thuy' },
  { name: 'Sa Trung Thổ', element: 'tho' },
  { name: 'Thiên Thượng Hỏa', element: 'hoa' },
  { name: 'Thạch Lựu Mộc', element: 'moc' },
  { name: 'Đại Hải Thủy', element: 'thuy' },
];

export function getNapAm(year: number): { name: string; element: Element } {
  const idx = Math.floor(((((year - 4) % 60) + 60) % 60) / 2);
  return NAP_AM[idx] ?? NAP_AM[0];
}

export function elementLabel(e: Element): string {
  return ELEMENT_LABEL[e];
}

export function elementRelation(
  sim: Element,
  menh: Element,
): { relation: string; score: number } {
  const sinh: Record<Element, Element> = {
    moc: 'hoa',
    hoa: 'tho',
    tho: 'kim',
    kim: 'thuy',
    thuy: 'moc',
  };
  const khac: Record<Element, Element> = {
    moc: 'tho',
    tho: 'thuy',
    thuy: 'hoa',
    hoa: 'kim',
    kim: 'moc',
  };
  if (sim === menh) return { relation: 'Đồng hành — hòa', score: 80 };
  if (sinh[sim] === menh)
    return { relation: 'Số sinh Mệnh — rất tốt', score: 95 };
  if (sinh[menh] === sim)
    return { relation: 'Mệnh sinh Số — tiết khí, chấp nhận', score: 65 };
  if (khac[sim] === menh)
    return { relation: 'Số khắc Mệnh — bất lợi', score: 30 };
  if (khac[menh] === sim)
    return { relation: 'Mệnh khắc Số — tiêu hao', score: 45 };
  return { relation: 'Trung tính', score: 55 };
}

/** Hành đại diện của dãy số — theo chữ số cuối của tổng (dùng cho hợp mệnh). */
export function digitsElement(digits: number[]): Element {
  const tong = digits.reduce((a, b) => a + b, 0);
  const d = tong % 10;
  if (d === 1 || d === 2) return 'moc';
  if (d === 3 || d === 4) return 'hoa';
  if (d === 5 || d === 6) return 'tho';
  if (d === 7 || d === 8) return 'kim';
  return 'thuy';
}

export function detectPatterns(digits: number[]): string[] {
  const s = digits.join('');
  const patterns: string[] = [];
  if (/(\d)\1{3}/.test(s)) patterns.push('Tứ quý (4 số giống liên tiếp)');
  else if (/(\d)\1{2}/.test(s)) patterns.push('Tam hoa (3 số giống liên tiếp)');
  if (/(\d{2})\1/.test(s)) patterns.push('Lặp cặp (dạng ABAB)');
  for (let i = 0; i < digits.length - 2; i++) {
    if (
      digits[i + 1] === (digits[i] + 1) % 10 &&
      digits[i + 2] === (digits[i] + 2) % 10
    ) {
      patterns.push('Tiến số (chuỗi tăng dần)');
      break;
    }
  }
  for (let i = 0; i < digits.length - 2; i++) {
    if (digits[i] === digits[i + 2] && digits[i] !== digits[i + 1]) {
      patterns.push('Số gánh (dạng A·x·A)');
      break;
    }
  }
  if (patterns.length === 0)
    patterns.push('Không có dạng hình thức đặc biệt nổi bật');
  return patterns;
}

/**
 * Tách cặp theo nguyên lý Âm Dương Ngũ Hành, Kinh dịch diệu luận: 0 và 5 không thuộc quái nào,
 * chúng là "biến số" xen giữa hai quái số — 5 khuếch đại (hiển lộ),
 * 0 khóa/biến chất năng lượng (ẩn tàng).
 */
export function buildPairs(digits: number[]): PairAnalysis[] {
  const anchors: number[] = [];
  for (let i = 0; i < digits.length; i++) {
    if (digits[i] !== 0 && digits[i] !== 5) anchors.push(i);
  }
  const pairs: PairAnalysis[] = [];
  for (let k = 0; k < anchors.length - 1; k++) {
    const i = anchors[k];
    const j = anchors[k + 1];
    const a = digits[i];
    const b = digits[j];
    const between = digits.slice(i + 1, j);
    const zeros = between.filter((d) => d === 0).length;
    const fives = between.filter((d) => d === 5).length;
    const hit = PAIR_LOOKUP[`${a}${b}`];
    if (!hit) continue; // không xảy ra: mọi cặp 1–9 (trừ 5) đều có trong bảng
    const star = STARS[hit.star];

    // Điểm cặp sau biến số 0/5:
    // 5 khuếch đại bản chất (cát càng cát, hung càng hung);
    // 0 khóa cát tinh (biến chất thành xấu ngầm) và làm hung tinh nặng thêm.
    let eff = star.score;
    if (fives > 0) {
      const boost = 1 + 0.3 * Math.min(fives, 2);
      eff = 50 + (eff - 50) * boost;
    }
    if (zeros > 0) {
      const z = Math.min(zeros, 2);
      if (star.kind === 'cat') eff = Math.min(eff, 46 - 6 * (z - 1));
      else eff -= 8 * z;
    }
    eff = Math.max(0, Math.min(100, Math.round(eff)));

    let modifierNote: string | undefined;
    if (zeros && fives) {
      modifierNote =
        'Vừa có 0 vừa có 5 xen giữa — năng lượng bộc phát nhưng khó lường, thiên về bất lợi.';
    } else if (zeros) {
      modifierNote =
        star.kind === 'cat'
          ? `Số 0 xen giữa khóa năng lượng ${star.nameVi} — cát tinh biến chất: có lộc nhưng bị kẹt, dễ "quý nhân hóa tiểu nhân" (theo sách, 68 rất tốt nhưng 608 lại chủ hao hụt, đổ nợ).`
          : `Số 0 xen giữa khiến hung tinh ${star.nameVi} chuyển sang trạng thái ngầm — rắc rối âm ỉ, khó nhận biết và nặng hơn.`;
    } else if (fives) {
      modifierNote =
        star.kind === 'cat'
          ? `Số 5 xen giữa khuếch đại ${star.nameVi} — cát khí hiển lộ, đến nhanh và rõ hơn.`
          : `Số 5 xen giữa khuếch đại ${star.nameVi} — hung khí bùng phát mạnh, cần đặc biệt lưu ý.`;
    }

    pairs.push({
      a,
      b,
      label: `${a}${b}`,
      raw: digits.slice(i, j + 1).join(''),
      star,
      level: hit.level,
      levelLabel: LEVEL_LABELS[hit.level],
      dongTinh: hit.level >= 3 ? 'động' : 'tĩnh',
      zeros,
      fives,
      modifierNote,
      effectiveScore: eff,
      isTail: k >= anchors.length - 3,
    });
  }
  return pairs;
}

/** Tổ hợp chế hóa / cộng hưởng giữa hai sao liền kề (theo sách). */
const COMBO_RULES: {
  stars: [StarId, StarId];
  kind: ComboNote['kind'];
  title: string;
  detail: string;
}[] = [
  {
    stars: ['sinh_khi', 'thien_y'],
    kind: 'cat',
    title: 'Sinh Khí + Thiên Y — quý nhân mang tài lộc',
    detail:
      'Tổ hợp "mật mã tài phú": quý nhân dẫn đường cho tài lộc lớn, kinh doanh thuận lợi (dạng 413, 678).',
  },
  {
    stars: ['dien_nien', 'thien_y'],
    kind: 'cat',
    title: 'Diên Niên + Thiên Y — kiếm được và giữ được',
    detail:
      'Kiếm tiền bằng năng lực chuyên môn và giữ tiền bền vững — tổ hợp lý tưởng nhất cho tài chính (dạng 913, 876).',
  },
  {
    stars: ['ngu_quy', 'thien_y'],
    kind: 'che_hoa',
    title: 'Ngũ Quỷ + Thiên Y — tài hoa sinh tài',
    detail:
      'Trí tuệ, ý tưởng đột phá của Ngũ Quỷ được Thiên Y dẫn thành tiền — hợp nghề sáng tạo, ngành đặc thù (dạng 813, 794).',
  },
  {
    stars: ['thien_y', 'tuyet_menh'],
    kind: 'che_hoa',
    title: 'Thiên Y chế Tuyệt Mệnh',
    detail:
      'Sự thiện lương, trí tuệ của Thiên Y hóa giải tính nóng nảy mạo hiểm — năng lượng phá tài chuyển thành "đầu tư ra tiền" (dạng 213).',
  },
  {
    stars: ['sinh_khi', 'hoa_hai'],
    kind: 'che_hoa',
    title: 'Sinh Khí chế Họa Hại',
    detail:
      'Sự vui vẻ và quý nhân của Sinh Khí dập tắt thị phi khẩu thiệt của Họa Hại.',
  },
  {
    stars: ['dien_nien', 'luc_sat'],
    kind: 'che_hoa',
    title: 'Diên Niên chế Lục Sát',
    detail:
      'Bản lĩnh, sự kiên định của Diên Niên át chế tính do dự và đào hoa xấu của Lục Sát.',
  },
  {
    stars: ['phuc_vi', 'ngu_quy'],
    kind: 'che_hoa',
    title: 'Phục Vị chế Ngũ Quỷ',
    detail:
      'Sự định tâm của Phục Vị hóa giải tính biến động, bất an của Ngũ Quỷ.',
  },
  {
    stars: ['dien_nien', 'ngu_quy'],
    kind: 'hung',
    title: 'Diên Niên + Ngũ Quỷ — cộng hưởng cố chấp',
    detail:
      'Tính bảo thủ của Diên Niên gặp tính đa nghi của Ngũ Quỷ dễ cộng hưởng thành cực kỳ cố chấp, khó nghe góp ý.',
  },
];

export function detectCombos(pairs: PairAnalysis[]): ComboNote[] {
  const combos: ComboNote[] = [];
  const seen = new Set<string>();
  for (let i = 0; i < pairs.length - 1; i++) {
    const s1 = pairs[i].star.id;
    const s2 = pairs[i + 1].star.id;
    for (const rule of COMBO_RULES) {
      const match =
        (rule.stars[0] === s1 && rule.stars[1] === s2) ||
        (rule.stars[0] === s2 && rule.stars[1] === s1);
      if (!match) continue;
      const key = `${rule.title}-${pairs[i].label}-${pairs[i + 1].label}`;
      if (seen.has(key)) continue;
      seen.add(key);
      combos.push({
        kind: rule.kind,
        title: rule.title,
        detail: rule.detail,
        pairs: `${pairs[i].label} → ${pairs[i + 1].label}`,
      });
    }
    // Cộng hưởng hung: hai hung tinh cùng loại đứng cạnh nhau
    if (
      s1 === s2 &&
      pairs[i].star.kind === 'hung' &&
      !seen.has(`resonance-${s1}-${i}`)
    ) {
      seen.add(`resonance-${s1}-${i}`);
      combos.push({
        kind: 'hung',
        title: `${pairs[i].star.nameVi} lặp liền — hung khí cộng hưởng`,
        detail: `Hai cặp ${pairs[i].star.nameVi} đứng cạnh nhau khiến khí lực quá tập trung, ${pairs[i].star.chuVe.toLowerCase()} thể hiện rõ và nặng hơn.`,
        pairs: `${pairs[i].label} → ${pairs[i + 1].label}`,
      });
    }
  }
  // Gộp các tổ hợp trùng tiêu đề (dãy lặp dạng ABAB tạo nhiều bản sao)
  const merged = new Map<string, ComboNote>();
  for (const c of combos) {
    const existing = merged.get(c.title);
    if (existing) {
      if (!existing.pairs.includes(c.pairs)) existing.pairs += ` · ${c.pairs}`;
    } else {
      merged.set(c.title, { ...c });
    }
  }
  return [...merged.values()];
}

export function analyzeTail(
  digits: number[],
  pairs: PairAnalysis[],
  applyTaboo = true,
): TailAnalysis {
  const s = digits.join('');
  const last3 = s.slice(-3);
  const last2 = s.slice(-2);
  const lastDigit = digits[digits.length - 1];
  const tailPair = pairs.length ? pairs[pairs.length - 1] : undefined;
  const notes: string[] = [];
  let warning: string | undefined;

  if (lastDigit === 0) {
    const msg =
      last2 === '50'
        ? 'Đuôi 50 — sách xếp vào đại kỵ: năng lượng bộc phát rồi rơi vào ẩn tàng, chủ về "Tứ đại giai không" (tài phú, sự nghiệp, tình cảm, sức khỏe đều hao).'
        : 'Đuôi 0 — sách xếp vào đại kỵ: dù đang thành công, về lâu dài dễ dẫn đến "Tứ đại giai không" (tài phú không, sự nghiệp không, tình cảm không, sức khỏe không).';
    if (applyTaboo) warning = `${msg} Nên tránh dùng lâu dài.`;
    else
      notes.push(
        `${msg} Dãy số này không đổi được nên chỉ ghi nhận để hiểu, không cần lo lắng — bù đắp bằng các dãy số hậu thiên (SIM, tài khoản) mang cát khí.`,
      );
  } else if (last2 === '05') {
    const msg =
      'Đuôi 05 — sách xếp vào đại kỵ cùng với đuôi 0: số 0 khóa năng lượng rồi số 5 làm bộc phát sự trống rỗng, về lâu dài chủ về "Tứ đại giai không".';
    if (applyTaboo) warning = `${msg} Nên tránh dùng lâu dài.`;
    else notes.push(`${msg} Dãy không đổi được — ghi nhận để hiểu là chính.`);
  } else if (lastDigit === 5 && tailPair) {
    notes.push(
      tailPair.star.kind === 'cat'
        ? `Đuôi 5 khuếch đại cát khí của ${tailPair.star.nameVi} ở cuối dãy — năng lượng hiển lộ mạnh.`
        : `Đuôi 5 khuếch đại hung khí của ${tailPair.star.nameVi} ở cuối dãy — bất lợi, nên lưu ý.`,
    );
  }

  if (tailPair) {
    if (tailPair.star.id === 'thien_y') {
      notes.push(
        'Cặp cuối là Thiên Y — đúng nguyên tắc "cát tinh ở cuối": tài lộc chốt dãy, rất quý.',
      );
    } else if (tailPair.star.id === 'dien_nien') {
      notes.push(
        'Cặp cuối là Diên Niên — biết giữ tiền, sự nghiệp vững ở phần kết dãy số.',
      );
    } else if (tailPair.star.kind === 'cat') {
      notes.push(`Cặp cuối là cát tinh ${tailPair.star.nameVi} — thuận lợi.`);
    } else if (tailPair.star.id === 'tuyet_menh') {
      notes.push(
        'Cặp cuối là Tuyệt Mệnh — hung tinh nặng nhất đóng ở đuôi, ảnh hưởng mạnh nhất tới tài lộc và an toàn; nên cân nhắc.',
      );
    } else {
      notes.push(
        `Cặp cuối là hung tinh ${tailPair.star.nameVi} — đuôi dãy là vị trí ảnh hưởng mạnh nhất, nên lưu ý ${tailPair.star.chuVe.toLowerCase()}.`,
      );
    }
  }

  // Nguyên tắc sắp xếp: năng lượng đi từ nhỏ đến lớn
  const scores = pairs.map((p) => p.effectiveScore);
  if (scores.length >= 3) {
    let ascending = true;
    for (let i = 1; i < scores.length; i++) {
      if (scores[i] < scores[i - 1] - 12) {
        ascending = false;
        break;
      }
    }
    if (ascending && scores[scores.length - 1] >= scores[0]) {
      notes.push(
        'Năng lượng dãy số đi từ thấp lên cao — đúng nguyên tắc sắp xếp "yếu trước, mạnh sau", vận trình càng về sau càng thuận.',
      );
    }
  }

  return { last3, last2, star: tailPair?.star, notes, warning };
}

export function computeAspects(
  pairs: PairAnalysis[],
): { id: AspectId; label: string; score: number }[] {
  return ASPECT_ORDER.map((id) => {
    let sum = 0;
    let weight = 0;
    pairs.forEach((p, i) => {
      const w = (1 + i / Math.max(1, pairs.length - 1)) * (p.isTail ? 1.5 : 1);
      // dịch điểm phương diện theo chênh lệch giữa điểm hiệu dụng và điểm gốc (ảnh hưởng 0/5)
      const shift = p.effectiveScore - p.star.score;
      sum += Math.max(0, Math.min(100, p.star.aspects[id] + shift * 0.6)) * w;
      weight += w;
    });
    return {
      id,
      label: ASPECT_LABELS[id],
      score: weight ? Math.round(sum / weight) : 50,
    };
  });
}

/** Phân tích Âm Dương Ngũ Hành đầy đủ trên một dãy chữ số bất kỳ (>= 2 cặp quái). */
export function analyzeBatCuc(
  digits: number[],
  opts: BatCucOptions = {},
): BatCucAnalysis | { error: string } {
  const applyTaboo = opts.applyTailTaboo !== false;
  const pairs = buildPairs(digits);
  if (pairs.length < 1) {
    return {
      error:
        'Dãy số quá ngắn hoặc toàn 0/5 — không đủ cặp quái số để luận theo nguyên lý Âm Dương Ngũ Hành, Kinh dịch diệu luận.',
    };
  }

  const starCounts = Object.fromEntries(
    (Object.keys(STARS) as StarId[]).map((id) => [id, 0]),
  ) as Record<StarId, number>;
  for (const p of pairs) starCounts[p.star.id] += 1;

  const catPairs = pairs.filter((p) => p.star.kind === 'cat').length;
  const hungPairs = pairs.length - catPairs;

  const combos = detectCombos(pairs);
  const tail = analyzeTail(digits, pairs, applyTaboo);

  // Điểm Du Niên: bình quân gia quyền — vị trí càng về sau càng nặng,
  // các cặp cuối nhân thêm trọng số theo nguyên tắc "phần đuôi quyết định".
  const tailW1 = opts.tailEmphasis ?? 2;
  const tailW2 = 1 + (tailW1 - 1) / 2;
  let duSum = 0;
  let duWeight = 0;
  pairs.forEach((p, i) => {
    const posW = 1 + (i / Math.max(1, pairs.length - 1)) * 0.6;
    const tailW =
      i === pairs.length - 1 ? tailW1 : i === pairs.length - 2 ? tailW2 : 1;
    const w = posW * tailW;
    duSum += p.effectiveScore * w;
    duWeight += w;
  });
  let duNienScore = duSum / duWeight;

  for (const c of combos) {
    if (c.kind === 'cat') duNienScore += 4;
    else if (c.kind === 'che_hoa') duNienScore += 3;
    else duNienScore -= 4;
  }
  if (tail.warning)
    duNienScore -= tail.last2 === '05' || tail.last2 === '50' ? 20 : 16;
  const tailStar = tail.star;
  if (tailStar) {
    if (tailStar.id === 'thien_y' || tailStar.id === 'dien_nien')
      duNienScore += 6;
    else if (tailStar.kind === 'cat') duNienScore += 3;
    else if (tailStar.id === 'tuyet_menh') duNienScore -= 7;
    else duNienScore -= 4;
  }
  duNienScore = Math.max(0, Math.min(100, Math.round(duNienScore)));

  const amCount = digits.filter((d) => d % 2 === 0).length;
  const duongCount = digits.length - amCount;
  const balance = Math.abs(amCount - duongCount);
  const amDuongScore = Math.max(20, 100 - balance * 18);

  const tongSo = digits.reduce((a, b) => a + b, 0);
  const tongNut = tongSo % 10;
  const nutScore = tongNut === 1 || tongNut === 6 || tongNut === 8 ? 75 : 55;

  const patterns = detectPatterns(digits);

  let elementRelationResult: BatCucAnalysis['elementRelation'];
  let napAm: BatCucAnalysis['napAm'];
  if (opts.birthYear && opts.birthYear >= 1900 && opts.birthYear <= 2100) {
    napAm = getNapAm(opts.birthYear);
    const simEl = digitsElement(digits);
    const rel = elementRelation(simEl, napAm.element);
    elementRelationResult = {
      sim: simEl,
      menh: napAm.element,
      relation: rel.relation,
      score: rel.score,
    };
  }

  const overallScore = Math.round(
    duNienScore * 0.78 + amDuongScore * 0.12 + nutScore * 0.1,
  );
  let verdict: BatCucAnalysis['verdict'] = 'trung_binh';
  if (overallScore >= 80) verdict = 'tot';
  else if (overallScore >= 65) verdict = 'kha';
  else if (overallScore >= 45) verdict = 'trung_binh';
  else verdict = 'yeu';

  return {
    digits,
    pairs,
    starCounts,
    catPairs,
    hungPairs,
    duNienScore,
    overallScore,
    verdict,
    combos,
    tail,
    aspects: computeAspects(pairs),
    patterns,
    amCount,
    duongCount,
    amDuongScore,
    tongSo,
    tongNut,
    birthYear: opts.birthYear,
    napAm,
    elementRelation: elementRelationResult,
  };
}

/** Kết quả chế độ số ngắn (số nhà, tầng, ghế, phòng…). */
export interface ShortAnalysis {
  digits: number[];
  digitMeanings: DigitMeaning[];
  /** cặp quái nếu vẫn tách được (vd số nhà 68) */
  pairs: PairAnalysis[];
  combos: ComboNote[];
  tongSo: number;
  tongNut: number;
  amCount: number;
  duongCount: number;
  overallScore: number;
  verdict: 'tot' | 'kha' | 'trung_binh' | 'yeu';
  notes: string[];
  birthYear?: number;
  napAm?: { name: string; element: Element };
  elementRelation?: BatCucAnalysis['elementRelation'];
}

/** Luận dãy ngắn: từng chữ số theo quái + cặp (nếu có) + tổng nút + hợp mệnh. */
export function analyzeShortNumber(
  digits: number[],
  birthYear?: number,
): ShortAnalysis {
  const digitMeanings = digits.map((d) => DIGIT_MEANINGS[d]);
  const pairs = buildPairs(digits);
  const combos = detectCombos(pairs);
  const tongSo = digits.reduce((a, b) => a + b, 0);
  const tongNut = tongSo % 10;
  const amCount = digits.filter((d) => d % 2 === 0).length;
  const duongCount = digits.length - amCount;
  const notes: string[] = [];

  let score = 55;
  if (pairs.length > 0) {
    const pairAvg =
      pairs.reduce((s, p) => s + p.effectiveScore, 0) / pairs.length;
    score = pairAvg * 0.7 + 55 * 0.3;
    const last = pairs[pairs.length - 1];
    notes.push(
      `Cặp quái chính ${last.label} thuộc ${last.star.nameVi} (${last.star.kind === 'cat' ? 'cát' : 'hung'}) — ${last.star.tagline}`,
    );
  } else {
    // 1 chữ số hoặc toàn 0/5: luận theo quái từng số
    const d = digits[digits.length - 1];
    const m = DIGIT_MEANINGS[d];
    if (d === 0) {
      score = 35;
      notes.push('Số 0 đơn độc — khí ẩn tàng, thiếu chủ khí rõ ràng.');
    } else if (d === 5) {
      score = 60;
      notes.push(
        'Số 5 trung cung — khí hiển lộ, mạnh nhưng cần số quái đi kèm để định hướng.',
      );
    } else {
      score = 62;
      notes.push(`Chủ khí là ${m.quai} (${m.elementLabel}) — ${m.nature}`);
    }
  }
  if (tongNut === 6 || tongNut === 8) {
    score += 6;
    notes.push(`Tổng nút ${tongNut} — dân gian coi là số lộc/phát.`);
  } else if (tongNut === 4 || tongNut === 7) {
    notes.push(
      `Tổng nút ${tongNut} — dân gian hay kiêng, nhưng theo quái số vẫn là ${DIGIT_MEANINGS[tongNut].quai}, không xấu tự thân.`,
    );
  }

  let elementRelationResult: BatCucAnalysis['elementRelation'];
  let napAm: ShortAnalysis['napAm'];
  if (birthYear && birthYear >= 1900 && birthYear <= 2100) {
    napAm = getNapAm(birthYear);
    const el = digitsElement(digits);
    const rel = elementRelation(el, napAm.element);
    score = score * 0.8 + rel.score * 0.2;
    elementRelationResult = {
      sim: el,
      menh: napAm.element,
      relation: rel.relation,
      score: rel.score,
    };
  }

  const overallScore = Math.max(0, Math.min(100, Math.round(score)));
  let verdict: ShortAnalysis['verdict'] = 'trung_binh';
  if (overallScore >= 80) verdict = 'tot';
  else if (overallScore >= 65) verdict = 'kha';
  else if (overallScore >= 45) verdict = 'trung_binh';
  else verdict = 'yeu';

  return {
    digits,
    digitMeanings,
    pairs,
    combos,
    tongSo,
    tongNut,
    amCount,
    duongCount,
    overallScore,
    verdict,
    notes,
    birthYear,
    napAm,
    elementRelation: elementRelationResult,
  };
}

export function digitQuaiNote(d: number): string {
  const m = DIGIT_MEANINGS[d];
  return m ? `${m.quai} — ${m.elementLabel}` : '';
}
