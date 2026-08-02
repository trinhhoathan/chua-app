/**
 * 64 quẻ Kinh Dịch — dữ liệu Việt hóa + logic gieo hào (3 đồng xu).
 * Hào 1→6 từ dưới lên. Số quẻ theo thứ tự Văn Vương.
 */

export type TrigramId =
  | 'can'
  | 'doai'
  | 'ly'
  | 'chan'
  | 'ton'
  | 'kham'
  | 'gen'
  | 'khon';

/** 6=lão âm (động), 7=thiếu dương, 8=thiếu âm, 9=lão dương (động) */
export type LineValue = 6 | 7 | 8 | 9;

export interface Trigram {
  id: TrigramId;
  nameVi: string;
  nameHan: string;
  /** Thiên · Trạch · Hỏa · Lôi · Phong · Thủy · Sơn · Địa — dùng đặt tên quẻ */
  element: string;
  /** 3 bit từ dưới lên: 1=dương, 0=âm */
  bits: [number, number, number];
  nature: string;
}

export interface Hexagram {
  number: number;
  nameVi: string;
  nameHan: string;
  /** VD: Thuần Càn · Địa Thiên Thái · Thủy Lôi Truân */
  nameFull: string;
  /** Ký hiệu Unicode ䷀–䷿ */
  unicode: string;
  /** Ý nghĩa ngắn (thẻ tra cứu) */
  meaning: string;
  upper: TrigramId;
  lower: TrigramId;
  /** 6 bit từ dưới lên */
  binary: string;
  judgment: string;
  image: string;
  /** Giải hào 1→6 */
  lines: [string, string, string, string, string, string];
  keywords: string[];
  summary: string;
}

export interface CastLineResult {
  value: LineValue;
  coins: [boolean, boolean, boolean]; // true=dương/ngửa=3
  isYang: boolean;
  isChanging: boolean;
  label: string;
}

export interface CastResult {
  lines: CastLineResult[];
  primary: Hexagram;
  secondary: Hexagram | null;
  changingIndexes: number[]; // 0-based, bottom-up
}

export const TRIGRAMS: Record<TrigramId, Trigram> = {
  can: {
    id: 'can',
    nameVi: 'Càn',
    nameHan: '乾',
    element: 'Thiên',
    bits: [1, 1, 1],
    nature: 'Trời · kiện',
  },
  doai: {
    id: 'doai',
    nameVi: 'Đoài',
    nameHan: '兌',
    element: 'Trạch',
    bits: [1, 1, 0],
    nature: 'Đầm · duyệt',
  },
  ly: {
    id: 'ly',
    nameVi: 'Ly',
    nameHan: '離',
    element: 'Hỏa',
    bits: [1, 0, 1],
    nature: 'Lửa · sáng',
  },
  chan: {
    id: 'chan',
    nameVi: 'Chấn',
    nameHan: '震',
    element: 'Lôi',
    bits: [1, 0, 0],
    nature: 'Sấm · động',
  },
  ton: {
    id: 'ton',
    nameVi: 'Tốn',
    nameHan: '巽',
    element: 'Phong',
    bits: [0, 1, 1],
    nature: 'Gió · nhập',
  },
  kham: {
    id: 'kham',
    nameVi: 'Khảm',
    nameHan: '坎',
    element: 'Thủy',
    bits: [0, 1, 0],
    nature: 'Nước · hiểm',
  },
  gen: {
    id: 'gen',
    nameVi: 'Cấn',
    nameHan: '艮',
    element: 'Sơn',
    bits: [0, 0, 1],
    nature: 'Núi · chỉ',
  },
  khon: {
    id: 'khon',
    nameVi: 'Khôn',
    nameHan: '坤',
    element: 'Địa',
    bits: [0, 0, 0],
    nature: 'Đất · thuận',
  },
};

const TRIGRAM_ORDER: TrigramId[] = [
  'can',
  'doai',
  'ly',
  'chan',
  'ton',
  'kham',
  'gen',
  'khon',
];

function bitsToKey(bits: number[]): string {
  return bits.join('');
}

const TRIGRAM_BY_BITS = new Map<string, TrigramId>();
for (const id of TRIGRAM_ORDER) {
  TRIGRAM_BY_BITS.set(bitsToKey(TRIGRAMS[id].bits), id);
}

/**
 * Bảng chuẩn: binary 6 bit (dưới→trên) → số Văn Vương.
 * bit 1 = dương, 0 = âm.
 */
const BINARY_TO_NUMBER: Record<string, number> = {
  '111111': 1,
  '000000': 2,
  '100010': 3,
  '010001': 4,
  '111010': 5,
  '010111': 6,
  '010000': 7,
  '000010': 8,
  '111011': 9,
  '110111': 10,
  '111000': 11,
  '000111': 12,
  '101111': 13,
  '111101': 14,
  '001000': 15,
  '000100': 16,
  '100110': 17,
  '011001': 18,
  '110000': 19,
  '000011': 20,
  '100101': 21,
  '101001': 22,
  '000001': 23,
  '100000': 24,
  '100111': 25,
  '111001': 26,
  '100001': 27,
  '011110': 28,
  '010010': 29,
  '101101': 30,
  '001110': 31,
  '011100': 32,
  '001111': 33,
  '111100': 34,
  '000101': 35,
  '101000': 36,
  '101011': 37,
  '110101': 38,
  '001010': 39,
  '010100': 40,
  '110001': 41,
  '100011': 42,
  '111110': 43,
  '011111': 44,
  '000110': 45,
  '011000': 46,
  '010110': 47,
  '011010': 48,
  '101110': 49,
  '011101': 50,
  '100100': 51,
  '001001': 52,
  '001011': 53,
  '110100': 54,
  '101100': 55,
  '001101': 56,
  '011011': 57,
  '110110': 58,
  '010011': 59,
  '110010': 60,
  '110011': 61,
  '001100': 62,
  '101010': 63,
  '010101': 64,
};

type HexMeta = Omit<
  Hexagram,
  'upper' | 'lower' | 'binary' | 'nameFull' | 'unicode' | 'meaning'
>;

/** Ý nghĩa ngắn chuẩn — dùng thẻ tra cứu & luận nhanh */
const HEX_MEANING: Record<number, string> = {
  1: 'Trời — sáng tạo, sức mạnh, tự cường',
  2: 'Đất — tiếp nhận, nuôi dưỡng, hậu đức',
  3: 'Khởi đầu gian nan — lập nghiệp cần kiên nhẫn',
  4: 'Khai sáng — học đạo, cầu thầy, bỏ ngã mạn',
  5: 'Chờ đợi — nuôi đức, đợi đúng thời',
  6: 'Tranh tụng — thận trọng khẩu lưỡi, cầu công bằng',
  7: 'Sư đoàn — kỷ luật, lãnh đạo có chính nghĩa',
  8: 'Tỷ hợp — đoàn kết, chọn người đồng chí hướng',
  9: 'Tiểu súc — tích tiểu thành đại, chưa phải lúc lớn',
  10: 'Lý — bước đi trên đuôi hổ; giữ lễ, cẩn trọng',
  11: 'Thái — thông suốt, nhỏ đi lớn đến, hòa hợp',
  12: 'Bĩ — bế tắc; quân tử giữ tiết, đợi vận mở',
  13: 'Đồng nhân — đồng tâm nơi đồng nội; công bằng với người',
  14: 'Đại hữu — thịnh lớn; khiêm để giữ phúc',
  15: 'Khiêm — hạ mình thì hanh; đức khiêm sáng tỏ',
  16: 'Dự — vui có chuẩn bị; đừng đam mê vô độ',
  17: 'Tùy — theo thời, theo người sáng; linh hoạt',
  18: 'Cổ — sửa chữa việc cũ; chấn hưng từ gốc',
  19: 'Lâm — giám sát gần; đức lớn sắp thịnh',
  20: 'Quan — quan sát, soi mình; thành tín cảm hóa',
  21: 'Phệ hạp — phân minh phải trái; hình phạt đúng mức',
  22: 'Bí — văn sức có mức; đẹp ngoài phải có chất',
  23: 'Bác — suy tàn; thuận thế thu mình, đừng cưỡng',
  24: 'Phục — trở lại; một dương sinh, phục thiện',
  25: 'Vô vọng — chân thật vô tư; đừng vọng cầu',
  26: 'Đại súc — tích đức tài lớn; dừng để nuôi chí',
  27: 'Di — nuôi thân nuôi đức; chọn miệng lưỡi',
  28: 'Đại quá — gánh nặng quá mức; cần chỗ dựa vững',
  29: 'Khảm — hiểm trùng điệp; giữ thành tín mà vượt',
  30: 'Ly — sáng và bám; sáng suốt mà gắn với chính',
  31: 'Hàm — cảm ứng; lòng thành thì người ứng',
  32: 'Hằng — bền lâu; giữ đạo không đổi vì phong ba',
  33: 'Độn — rút đúng lúc; ẩn để bảo toàn',
  34: 'Đại tráng — mạnh lớn; dùng sức phải đúng lễ',
  35: 'Tấn — tiến lên như mặt trời; gắn với minh quân',
  36: 'Minh di — sáng bị tổn; giấu sáng, giữ chính trong nạn',
  37: 'Gia nhân — trị nhà bằng chính; nội hòa ngoại thuận',
  38: 'Khuê — dị biệt; tiểu sự còn hợp, đại sự khó đồng',
  39: 'Kiển — gian nan; thấy hiểm thì quay về tu đức',
  40: 'Giải — cởi nút; tha thứ, giải quyết rồi thôi',
  41: 'Tổn — giảm dưới nuôi trên; thành tâm thì được',
  42: 'Ích — trên giảm dưới được lợi; làm lợi người',
  43: 'Quải — quyết tuyệt âm; công bố rõ, đừng tư lợi',
  44: 'Cấu — âm đột ngột gặp; phòng kẻ nhỏ xen vào',
  45: 'Tụy — hội tụ; sửa soạn nơi thờ, thành tín',
  46: 'Thăng — leo dần; tích tiểu thành cao',
  47: 'Khốn — cùng quẫn; giữ miệng, giữ chí',
  48: 'Tỉnh — giếng nuôi dân; sửa giếng hơn là dời thành',
  49: 'Cách — đổi mới đúng thời; trước sau tin tưởng',
  50: 'Đỉnh — nuôi hiền bằng chính; đổi cũ lấy mới',
  51: 'Chấn — sấm động; kinh rồi bình, sửa trong sợ',
  52: 'Cấn — dừng đúng chỗ; lưng không bắt thân',
  53: 'Tiệm — tiến tuần tự như hồng; nữ về nhà chồng theo lễ',
  54: 'Quy muội — vị thế chưa chính; biết phận mà giữ',
  55: 'Phong — thịnh lớn giữa ngày; nhớ suy sẽ đến',
  56: 'Lữ — khách đường xa; mềm mỏng, giữ tiểu trinh',
  57: 'Tốn — vào bằng nhu; liên tiếp dặn dò mới thấm',
  58: 'Đoài — vui hòa; bạn lành cùng tập học',
  59: 'Hoán — tan băng cục bộ; tế lễ để tụ lòng người',
  60: 'Tiết — có mức độ; khổ tiết không nên',
  61: 'Trung phu — thành trong lòng; cảm lợn cá cũng tin',
  62: 'Tiểu quá — vượt nhỏ; việc nhỏ nên khiêm, việc lớn đừng quá',
  63: 'Ký tế — đã xong; đầu xuôi phải phòng cuối rối',
  64: 'Vị tế — chưa xong; thận trọng phân biệt rồi tiến',
};

export function hexagramUnicode(number: number): string {
  if (number < 1 || number > 64) return '';
  return String.fromCodePoint(0x4dc0 + number - 1);
}

/** Tên đầy đủ chuẩn: Thuần Càn · Địa Thiên Thái · … */
export function composeNameFull(
  nameVi: string,
  upper: TrigramId,
  lower: TrigramId,
): string {
  if (upper === lower) return `Thuần ${nameVi}`;
  return `${TRIGRAMS[upper].element} ${TRIGRAMS[lower].element} ${nameVi}`;
}

const HEX_META: HexMeta[] = [
  {
    number: 1,
    nameVi: 'Càn',
    nameHan: '乾',
    judgment:
      'Nguyên hanh lợi trinh. Khởi đầu lớn, hanh thông, lợi giữ chính bền.',
    image:
      'Thiên hành kiện — quân tử dĩ tự cường bất tức (trời vận kiện; quân tử không ngừng tự cường).',
    lines: [
      'Sơ cửu: Tiềm long vật dụng — rồng ẩn, chưa dùng; chờ thời.',
      'Cửu nhị: Kiến long tại điền — lợi kiến đại nhân.',
      'Cửu tam: Quân tử chung nhật càn càn, tịch dịch nhược lệ, vô cữu — siêng cả ngày, đêm vẫn cảnh giác, không lỗi.',
      'Cửu tứ: Hoặc dược tại uyên, vô cữu — tiến thoái linh hoạt, không lỗi.',
      'Cửu ngũ: Phi long tại thiên — lợi kiến đại nhân.',
      'Thượng cửu: Kháng long hữu hối — cao cực thì có hối.',
    ],
    keywords: ['kiện', 'trời', 'sáng tạo', 'lãnh đạo'],
    summary:
      'Thuần dương — mạnh mẽ, khởi đầu lớn. Giữ trung chính và khiêm; tránh kiêu căng khi đã bay cao.',
  },
  {
    number: 2,
    nameVi: 'Khôn',
    nameHan: '坤',
    judgment:
      'Nguyên hanh lợi tẫn mã chi trinh. Quân tử hữu du vãng, tiên mê hậu đắc chủ — thuận như ngựa cái, đi trước dễ lạc, theo sau thì được chủ.',
    image:
      'Địa thế khôn — quân tử dĩ hậu đức tải vật (đức dày chở muôn vật).',
    lines: [
      'Sơ lục: Lý sương kiên băng chí — dấu hiệu nhỏ báo việc lớn.',
      'Lục nhị: Trực phương đại — ngay thẳng, bao dung.',
      'Lục tam: Hàm chương khả trinh — giữ đức ẩn, theo việc vua.',
      'Lục tứ: Quát nang vô cữu — thận trọng, thu mình.',
      'Lục ngũ: Hoàng thường nguyên cát — trung cung tốt lành.',
      'Thượng lục: Long chiến ư dã — âm cực hóa dương, tranh chấp.',
    ],
    keywords: ['thuận', 'đất', 'chứa đựng', 'nhẫn'],
    summary: 'Thuần âm — nuôi dưỡng, chịu đựng; lấy nhu thắng cương.',
  },
  {
    number: 3,
    nameVi: 'Truân',
    nameHan: '屯',
    judgment:
      'Nguyên hanh lợi trinh, vật dụng hữu du vãng, lợi kiến hầu. Gian nan lúc mới lập; lợi giữ chính, đừng tự tiện đi xa.',
    image:
      'Vân lôi truân — quân tử dĩ kinh luân (lấy kinh tế–trật tự mà lập nghiệp).',
    lines: [
      'Sơ cửu: Bàn hoàn — tiến khó, giữ chính.',
      'Lục nhị: Truân như thản như — khốn rồi thông, mười năm mới phối.',
      'Lục tam: Tức lộc vô ngu — đuổi hươu không hướng dẫn thì lạc.',
      'Lục tứ: Thừa mã ban như — cầu hôn, đi thì tốt.',
      'Cửu ngũ: Truân kỳ cao — ban ơn nhỏ khó, giữ chính lớn thì tốt.',
      'Thượng lục: Thừa mã ban như — khóc máu, cùng cực.',
    ],
    keywords: ['khởi đầu', 'gian nan', 'lập nghiệp'],
    summary: 'Gieo mầm trong khó — kiên nhẫn, cầu người dẫn dắt.',
  },
  {
    number: 4,
    nameVi: 'Mông',
    nameHan: '蒙',
    judgment:
      'Hanh. Phỉ ngã cầu đồng mông, đồng mông cầu ngã. Sơ phệ cáo, tái tam độc, tắc bất cáo — kẻ mông cầu thầy, không phải thầy cầu kẻ mông.',
    image:
      'Sơn hạ xuất tuyền, mông — quân tử dĩ quả dục dục đức (bớt dục để nuôi đức).',
    lines: [
      'Sơ lục: Phát mông — dùng hình phạt để khai trí, cởi bỏ gông cùm.',
      'Cửu nhị: Bao mông cát — bao dung kẻ mông, lấy vợ tốt.',
      'Lục tam: Vật dụng thủ nữ — đừng lấy người không chính.',
      'Lục tứ: Khốn mông lận — bịt tối thì tiếc.',
      'Lục ngũ: Đồng mông cát — trẻ thơ thành thật thì tốt.',
      'Thượng cửu: Kích mông — đánh phá ngu tối, chống đạo tặc.',
    ],
    keywords: ['học', 'khai mở', 'thầy trò'],
    summary: 'Khai môn học đạo — thành tâm cầu thầy, bỏ ngã mạn.',
  },
  {
    number: 5,
    nameVi: 'Nhu',
    nameHan: '需',
    judgment:
      'Hữu phu, quang hanh, trinh cát. Lợi thiệp đại xuyên — có thành tín thì sáng và hanh; lợi vượt sông lớn khi đã chuẩn bị.',
    image:
      'Vân thượng ư thiên, nhu — quân tử dĩ ẩm thực yến lạc (nuôi thân–tâm trong lúc chờ).',
    lines: [
      'Sơ cửu: Nhu ư giao — chờ ở ngoại ô, giữ thường.',
      'Cửu nhị: Nhu ư sa — chờ trên cát, hơi bị dị nghị.',
      'Cửu tam: Nhu ư nê — chờ trong bùn, rước tặc.',
      'Lục tứ: Nhu ư huyết — chờ trong huyết, thoát hang.',
      'Cửu ngũ: Nhu ư tửu thực — chờ nơi ăn uống, chính thì tốt.',
      'Thượng lục: Nhập ư huyệt — ba khách bất ngờ đến, kính thì tốt.',
    ],
    keywords: ['chờ đợi', 'tin', 'thời cơ'],
    summary: 'Chờ đúng lúc — nuôi đức, đừng hấp tấp.',
  },
  {
    number: 6,
    nameVi: 'Tụng',
    nameHan: '訟',
    judgment: 'Hữu phu窒 triết — tranh chấp, giữa chừng dừng tốt.',
    image: 'Thiên dữ thủy vi hành — quân tử tác sự mưu thủy.',
    lines: [
      'Sơ lục: Bất vĩnh sở sự — đừng kéo dài kiện tụng.',
      'Cửu nhị: Bất khắc讼 — lui về ấp nhỏ, khỏi nạn.',
      'Lục tam: Thực cựu đức — ăn theo đức cũ, nguy nếu theo việc vua.',
      'Cửu tứ: Bất khắc tụng — phục mệnh đổi hướng, an.',
      'Cửu ngũ: Tụng nguyên cát — tranh trước bậc lớn thì tốt.',
      'Thượng cửu: Hoặc tích chi bàn đái — được đai rồi bị cướp trong ngày.',
    ],
    keywords: ['tranh chấp', 'kiện tụng', 'hòa giải'],
    summary: 'Tránh kéo dài xung đột — biết dừng là khôn.',
  },
  {
    number: 7,
    nameVi: 'Sư',
    nameHan: '師',
    judgment: 'Trinh trượng nhân cát — cầm quân cần người chính trực.',
    image: 'Địa trung hữu thủy — quân tử dung dân súc chúng.',
    lines: [
      'Sơ lục: Sư xuất dĩ luật — ra quân phải có kỷ luật.',
      'Cửu nhị: Tại sư trung — ở giữa quân, tốt, được vua ba lần ban mệnh.',
      'Lục tam: Sư hoặc dư thi — quân chở xác, xấu.',
      'Lục tứ: Sư tả thứ — lui đóng trại, không lỗi.',
      'Lục ngũ: Điền hữu cầm — săn bắt, lợi chấp ngôn; con trưởng cầm quân.',
      'Thượng lục: Đại quân hữu mệnh — mở nước phong hầu, đừng dùng tiểu nhân.',
    ],
    keywords: ['quân đội', 'kỷ luật', 'lãnh đạo'],
    summary: 'Dùng sức tập thể — kỷ luật và người đứng đầu phải chính.',
  },
  {
    number: 8,
    nameVi: 'Tỷ',
    nameHan: '比',
    judgment: 'Cát. Nguyên thệ — thân cận, lần đầu hỏi ý tốt.',
    image: 'Địa thượng hữu thủy — tiên vương kiến vạn quốc.',
    lines: [
      'Sơ lục: Hữu phu tỷ chi — thành tín mà gần gũi, không lỗi.',
      'Lục nhị: Tỷ chi tự nội — thân từ bên trong, chính thì tốt.',
      'Lục tam: Tỷ chi phỉ nhân — gần kẻ không phải người lành.',
      'Lục tứ: Ngoại tỷ chi — thân bên ngoài, chính thì tốt.',
      'Cửu ngũ: Hiển tỷ — hiện rõ sự thân, vua săn ba mặt, bỏ người phía trước.',
      'Thượng lục: Tỷ chi vô thủ — thân không có đầu, xấu.',
    ],
    keywords: ['liên kết', 'thân cận', 'hợp quần'],
    summary: 'Gắn bó chân thành — chọn đúng người để gần.',
  },
  {
    number: 9,
    nameVi: 'Tiểu Súc',
    nameHan: '小畜',
    judgment: 'Hanh. Mật vân bất vũ — chứa nhỏ, mây dày chưa mưa.',
    image: 'Phong hành thiên thượng — quân tử ý văn đức.',
    lines: [
      'Sơ cửu: Phục tự đạo — trở về đúng đạo, sao lại lỗi?',
      'Cửu nhị: Khiên phục — bị kéo mà về, tốt.',
      'Cửu tam: Dư thuyết phúc — xe trật bánh, vợ chống chồng.',
      'Lục tứ: Hữu phu — thành tín, huyết đi xa, hết lo, không lỗi.',
      'Cửu ngũ: Hữu phu loan như — thành tín gắn bó, lấy của cải láng giềng.',
      'Thượng cửu: Ký vũ ký xử — đã mưa đã chỗ, đức đầy; nguy với phụ nữ.',
    ],
    keywords: ['tích lũy nhỏ', 'kiềm chế', 'chờ'],
    summary: 'Chứa ít từng bước — chưa phải lúc bung hết sức.',
  },
  {
    number: 10,
    nameVi: 'Lý',
    nameHan: '履',
    judgment: 'Lý hổ vĩ bất địch nhân — đạp đuôi hổ mà không bị cắn thì hanh.',
    image: 'Thượng thiên hạ trạch — quân tử biện thượng hạ.',
    lines: [
      'Sơ cửu: Tố lý vãng — đi chân chất, không lỗi.',
      'Cửu nhị: Lý đạo thản thản — đường bằng phẳng, người ẩn dật chính thì tốt.',
      'Lục tam: Diệt năng thị — chột mắt vẫn thấy, què vẫn đi — đạp đuôi hổ bị cắn.',
      'Cửu tứ: Lý hổ vĩ — thận trọng đạp đuôi hổ, cuối cùng tốt.',
      'Cửu ngũ: Quải lý — quyết đoán mà đi, chính nguy.',
      'Thượng cửu: Thị lý khảo tường — nhìn xét đường đi, đại tốt.',
    ],
    keywords: ['lễ', 'thận trọng', 'ứng xử'],
    summary: 'Đi đúng lễ — mềm mỏng trước hiểm nguy.',
  },
  {
    number: 11,
    nameVi: 'Thái',
    nameHan: '泰',
    judgment:
      'Tiểu vãng đại lai, cát hanh — cái nhỏ đi, cái lớn đến; thông suốt tốt lành.',
    image:
      'Thiên địa giao, thái — hậu vương tài thành thiên địa chi đạo, phụ tướng thiên địa chi nghi, dĩ tả hữu dân (vua nối đạo trời đất mà giúp dân).',
    lines: [
      'Sơ cửu: Bạt mao như — nhổ cỏ rễ liền, chinh phạt tốt.',
      'Cửu nhị: Bao hoang — bao dung hoang vu, dùng sông không đò, không bỏ bạn xa.',
      'Cửu tam: Vô bình bất pha — không bằng mãi, không đi mãi không trở lại.',
      'Lục tứ: Phiên phiên — bay lượn không giàu nhờ láng giềng, thành tín không cảnh báo.',
      'Lục ngũ: Đế Ất quy muội — vua gả em, dùng phúc lớn thì tốt.',
      'Thượng lục: Thành phục ư hoàng — thành sụp xuống hào, đừng dùng quân.',
    ],
    keywords: ['thông', 'hòa hợp', 'thịnh'],
    summary: 'Thời thái bình — giao thông trời đất, vẫn đề phòng cực thịnh.',
  },
  {
    number: 12,
    nameVi: 'Bĩ',
    nameHan: '否',
    judgment: 'Phỉ chi phỉ nhân — bế tắc, bất lợi quân tử trinh.',
    image: 'Thiên địa bất giao — quân tử kiệm đức tịch nạn.',
    lines: [
      'Sơ lục: Bạt mao như — nhổ cỏ, chính thì hanh, tốt.',
      'Lục nhị: Bao thừa — bao dung kẻ hầu, tiểu nhân tốt; đại nhân bĩ thì hanh.',
      'Lục tam: Bao tu — chứa điều xấu hổ.',
      'Cửu tứ: Hữu mệnh vô cữu — có mệnh lệnh, không lỗi, bạn lìa phúc.',
      'Cửu ngũ: Hưu bĩ — nghỉ bĩ, đại nhân tốt; kỳ mất kỳ mất, buộc vào dâu tằm.',
      'Thượng cửu: Khuynh bĩ — đổ bĩ trước, sau vui.',
    ],
    keywords: ['bế tắc', 'ẩn nhẫn', 'chờ thông'],
    summary: 'Thời bế — thu đức, đừng cưỡng cầu.',
  },
  {
    number: 13,
    nameVi: 'Đồng Nhân',
    nameHan: '同人',
    judgment: 'Đồng nhân ư dã — cùng người ngoài đồng nội thì hanh.',
    image: 'Thiên dữ hỏa — quân tử loại tộc biện vật.',
    lines: [
      'Sơ cửu: Đồng nhân ư môn — cùng ở cửa, không lỗi.',
      'Lục nhị: Đồng nhân ư tông — cùng trong họ, tiếc.',
      'Cửu tam: Phục nhưng ư mang — phục binh trong cỏ, lên cao không dậy ba năm.',
      'Cửu tứ: Thừa kỳ dung — leo tường, không tấn công, tốt.',
      'Cửu ngũ: Đồng nhân tiên hào đào — trước khóc sau cười, đại quân gặp nhau.',
      'Thượng cửu: Đồng nhân ư giao — cùng ở ngoại ô, không hối.',
    ],
    keywords: ['đoàn kết', 'công bằng', 'hợp tác'],
    summary: 'Đồng tâm vượt ngoài tư lợi — rộng mở với mọi người.',
  },
  {
    number: 14,
    nameVi: 'Đại Hữu',
    nameHan: '大有',
    judgment: 'Nguyên hanh — sở hữu lớn, rất hanh thông.',
    image: 'Hỏa tại thiên thượng — quân tử ức ác dương thiện.',
    lines: [
      'Sơ cửu: Vô giao hại — không giao với hại, khó mà không lỗi.',
      'Cửu nhị: Đại xa dĩ tải — xe lớn chở, có chỗ đi, không lỗi.',
      'Cửu tam: Công dụng享 ư thiên tử — công hầu cúng thiên tử, tiểu nhân không được.',
      'Cửu tứ: Phỉ kỳ bành — không kiêu căng, không lỗi.',
      'Lục ngũ: Quyết phu giao như — thành tín giao kết, oai như, tốt.',
      'Thượng cửu: Tự thiên hữu chi — trời phù hộ, tốt không gì bằng.',
    ],
    keywords: ['sung túc', 'ban phát', 'khiêm'],
    summary: 'Giàu có đức — chia sẻ, đừng kiêu.',
  },
  {
    number: 15,
    nameVi: 'Khiêm',
    nameHan: '謙',
    judgment: '亨. Quân tử hữu chung — khiêm tốn thì hanh.',
    image: 'Địa trung hữu sơn — quân tử ai đa ích quả.',
    lines: [
      'Sơ lục: Khiêm khiêm quân tử — khiêm thêm khiêm, dùng vượt sông lớn.',
      'Lục nhị: Minh khiêm — khiêm được nêu danh, chính thì tốt.',
      'Cửu tam: Lao khiêm — khó nhọc mà khiêm, quân tử có kết cục, tốt.',
      'Lục tứ: Vô bất lợi huy khiêm — không gì bất lợi khi phát huy khiêm.',
      'Lục ngũ: Bất phú dĩ kỳ lân — không giàu nhờ láng giềng, lợi dùng xâm phạt.',
      'Thượng lục: Minh khiêm — khiêm được nêu, lợi dụng hành sư chinh ấp quốc.',
    ],
    keywords: ['khiêm tốn', 'giảm dư', 'bù thiếu'],
    summary: 'Đức khiêm — hạ mình mà được tôn.',
  },
  {
    number: 16,
    nameVi: 'Dự',
    nameHan: '豫',
    judgment: 'Lợi kiến hầu hành sư — vui thuận, lợi phong hầu xuất quân.',
    image: 'Lôi xuất địa phần — tiên vương tác nhạc sùng đức.',
    lines: [
      'Sơ lục: Minh dự — khoe vui, xấu.',
      'Lục nhị: Giới ư thạch — vững như đá, không chờ hết ngày, chính tốt.',
      'Lục tam: H盱 dự — nhìn lên mà vui, hối chậm thì hối.',
      'Cửu tứ: Do dự — nguồn vui lớn, được bạn lớn tụ họp.',
      'Lục ngũ: Trinh tật — chính mà bệnh, lâu không chết.',
      'Thượng lục: Minh dự — tối tăm mà vui, thành rồi biến thì không lỗi.',
    ],
    keywords: ['vui', 'đúng lúc', 'hòa nhạc'],
    summary: 'Vui đúng đạo — không phóng túng.',
  },
  {
    number: 17,
    nameVi: 'Tùy',
    nameHan: '隨',
    judgment: 'Nguyên hanh lợi trinh — theo đúng thì thông.',
    image: 'Trạch trung hữu lôi — quân tử hướng hôn nhập yến tức.',
    lines: [
      'Sơ cửu: Quan hữu du — cửa có thay đổi, chính tốt; ra cửa giao có công.',
      'Lục nhị: Hệ tiểu tử — buộc lấy trẻ nhỏ, mất bậc trượng phu.',
      'Lục tam: Hệ trượng phu — buộc bậc trượng phu, mất trẻ nhỏ; theo có cầu được.',
      'Cửu tứ: Tùy hữu hoạch — theo mà được, chính thì xấu; có đức tin sáng tỏ, sao lỗi?',
      'Cửu ngũ: Phu ư gia — thành tín nơi điều tốt, tốt.',
      'Thượng lục: Câu hệ chi — bị trói buộc, vua dùng hướng Tây Sơn.',
    ],
    keywords: ['thuận theo', 'linh hoạt', 'thời'],
    summary: 'Biết theo thời — theo điều thiện, bỏ điều ác.',
  },
  {
    number: 18,
    nameVi: 'Cổ',
    nameHan: '蠱',
    judgment: 'Nguyên hanh — sửa chữa hư hỏng thì lớn thông.',
    image: 'Sơn hạ hữu phong — quân tử chấn dân dục đức.',
    lines: [
      'Sơ lục: Cán phụ chi cổ — sửa lỗi cha, có con thì không lỗi, nguy rồi tốt.',
      'Cửu nhị: Cán mẫu chi cổ — sửa lỗi mẹ, không thể chính cứng.',
      'Cửu tam: Cán phụ chi cổ — sửa lỗi cha, nhỏ có hối, không lỗi lớn.',
      'Lục tứ: Dụ phụ chi cổ — dung túng lỗi cha, đi thấy xấu hổ.',
      'Lục ngũ: Cán phụ chi cổ — sửa lỗi cha, được tiếng khen.',
      'Thượng cửu: Bất sự vương hầu — không thờ vương hầu, cao thượng sự chí.',
    ],
    keywords: ['sửa chữa', 'trị loạn', 'đổi mới'],
    summary: 'Trị cái hư — can đảm chỉnh đốn từ gốc.',
  },
  {
    number: 19,
    nameVi: 'Lâm',
    nameHan: '臨',
    judgment: 'Nguyên hanh lợi trinh — đến gần, tháng 8 có hung.',
    image: 'Trạch thượng hữu địa — quân tử giáo tư vô cùng.',
    lines: [
      'Sơ cửu: Hàm lâm — cảm mà đến, chính tốt.',
      'Cửu nhị: Hàm lâm — cảm mà đến, tốt không gì lợi bằng.',
      'Lục tam: Cam lâm — ngọt mà đến, vô lợi; đã lo thì không lỗi.',
      'Lục tứ: Chí lâm — đến chỗ cùng, không lỗi.',
      'Lục ngũ: Trí lâm — trí mà đến, đại quân tử, tốt.',
      'Thượng lục: Đôn lâm — dày dặn mà đến, tốt không lỗi.',
    ],
    keywords: ['giám sát', 'đến gần', 'dạy bảo'],
    summary: 'Đến gần dân/việc — dạy bảo khoan dung, đề phòng tháng sau.',
  },
  {
    number: 20,
    nameVi: 'Quan',
    nameHan: '觀',
    judgment: 'Quán nhi bất kiến khuyến — xem xét, thành tín trang nghiêm.',
    image: 'Phong hành địa thượng — tiên vương tỉnh phương quan dân.',
    lines: [
      'Sơ lục: Đồng quan — trẻ xem, tiểu nhân không lỗi, quân tử tiếc.',
      'Lục nhị: Khuy quan — xem qua khe cửa, lợi nữ chính.',
      'Lục tam: Quan ngã sinh — xem đời sống ta, tiến hay lui.',
      'Lục tứ: Quan quốc chi quang — xem ánh sáng nước, lợi làm khách vua.',
      'Cửu ngũ: Quan ngã sinh — xem đời sống ta, quân tử không lỗi.',
      'Thượng cửu: Quan kỳ sinh — xem đời sống họ, quân tử không lỗi.',
    ],
    keywords: ['quan sát', 'mẫu mực', 'tự xét'],
    summary: 'Nhìn để hiểu — tự soi rồi mới dạy người.',
  },
  {
    number: 21,
    nameVi: 'Phệ Hạp',
    nameHan: '噬嗑',
    judgment: '亨. Lợi dụng ngục — cắn hợp, lợi dùng hình ngục.',
    image: 'Lôi điện phệ hạp — tiên vương minh phạt sắc pháp.',
    lines: [
      'Sơ cửu: Lũ hiệu diệt chỉ — chân mang gông mất ngón, không lỗi.',
      'Lục nhị: Phệ phu diệt tỷ — cắn thịt mềm mất mũi, không lỗi.',
      'Lục tam: Phệ tích nhục — cắn thịt khô có độc, nhỏ tiếc không lỗi.',
      'Cửu tứ: Phệ can chỉ — cắn xương khô được mũi tên vàng, lợi khó chính.',
      'Lục ngũ: Phệ can nhục — cắn thịt khô được vàng, chính nguy không lỗi.',
      'Thượng lục: Hà hiệu diệt nhĩ — mang gông mất tai, xấu.',
    ],
    keywords: ['phán quyết', 'hình phạt', 'làm rõ'],
    summary: 'Cắn đứt trở ngại — xử lý minh bạch, đúng mức.',
  },
  {
    number: 22,
    nameVi: 'Bí',
    nameHan: '賁',
    judgment: '亨. Tiểu lợi hữu du vãng — trang sức, nhỏ lợi đi.',
    image: 'Sơn hạ hữu hỏa — quân tử minh thứ chính.',
    lines: [
      'Sơ cửu: Bí kỳ chỉ — trang chân, bỏ xe đi bộ.',
      'Lục nhị: Bí kỳ tu — trang râu.',
      'Cửu tam: Bí như nhu như — trang mà ướt át, chính tốt.',
      'Lục tứ: Bí như bào như — trang trắng như, ngựa trắng bay, không cướp mà hôn.',
      'Lục ngũ: Bí ư khâu viên — trang ở đồi vườn, bó lụa nhỏ nhỏ, tiếc cuối tốt.',
      'Thượng cửu: Bạch bí — trang trắng, không lỗi.',
    ],
    keywords: ['văn vẻ', 'trang sức', 'chất phác'],
    summary: 'Làm đẹp vừa phải — chất hơn hình.',
  },
  {
    number: 23,
    nameVi: 'Bác',
    nameHan: '剝',
    judgment: 'Bất lợi hữu du vãng — bị lột, bất lợi đi.',
    image: 'Sơn phụ ư địa — thượng dĩ hậu hạ an trạch.',
    lines: [
      'Sơ lục: Bác sàng dĩ túc — lột giường đến chân, xấu.',
      'Lục nhị: Bác sàng dĩ biện — lột giường đến khung, xấu.',
      'Lục tam: Bác chi vô cữu — lột mà không lỗi.',
      'Lục tứ: Bác sàng dĩ phu — lột giường đến da, xấu.',
      'Lục ngũ: Quán ngư — xâu cá, nhờ cung nhân, không gì bất lợi.',
      'Thượng cửu: Chiết quả bất thực — quả lớn không ăn, quân tử được xe, tiểu nhân lột nhà.',
    ],
    keywords: ['suy', 'lột bỏ', 'thu mình'],
    summary: 'Thời suy — giữ gốc, đừng hành động lớn.',
  },
  {
    number: 24,
    nameVi: 'Phục',
    nameHan: '復',
    judgment:
      'Hanh. Xuất nhập vô tật, bằng lai vô cữu. Phản phục kỳ đạo, thất nhật lai phục, lợi hữu du vãng — trở lại đạo; bảy ngày thì phục, lợi có chỗ đi.',
    image:
      'Lôi tại địa trung, phục — tiên vương chí nhật bế quan, thương lữ bất hành, hậu bất tỉnh phương (ngày đông chí đóng cửa quan, nghỉ ngơi dưỡng dương).',
    lines: [
      'Sơ cửu: Bất viễn phục — không xa đã phục, không tiếc lớn, tốt.',
      'Lục nhị: Hưu phục — nghỉ rồi phục, tốt.',
      'Lục tam: Tần phục — thường xuyên phục, nguy không lỗi.',
      'Lục tứ: Trung hành độc phục — đi giữa một mình phục.',
      'Lục ngũ: Đôn phục — dày dặn phục, không hối.',
      'Thượng lục: Mê phục — mê phục, xấu; có tai binh, đến mười năm không chinh.',
    ],
    keywords: ['trở về', 'phục thiện', 'chu kỳ'],
    summary: 'Quay về đạo — sửa sớm thì nhẹ.',
  },
  {
    number: 25,
    nameVi: 'Vô Vọng',
    nameHan: '無妄',
    judgment: 'Nguyên hanh lợi trinh — không vọng tưởng thì thông.',
    image: 'Thiên hạ lôi hành — tiên vương dĩ mậu đối thời dục vạn vật.',
    lines: [
      'Sơ cửu: Vô vọng — không vọng, đi thì tốt.',
      'Lục nhị: Bất canh hoạch — không cày mà gặt, thì lợi có chỗ đi.',
      'Lục tam: Vô vọng chi tai — tai họa vô vọng, trâu buộc bị lấy, dân họa.',
      'Cửu tứ: Khả trinh vô cữu — có thể chính, không lỗi.',
      'Cửu ngũ: Vô vọng chi tật — bệnh vô vọng, đừng thuốc có vui.',
      'Thượng cửu: Vô vọng hành — hành vô vọng, có tai, vô lợi.',
    ],
    keywords: ['chân thành', 'không vọng', 'thuận thiên'],
    summary: 'Đừng cưỡng cầu — thuận lẽ tự nhiên.',
  },
  {
    number: 26,
    nameVi: 'Đại Súc',
    nameHan: '大畜',
    judgment: 'Lợi trinh — chứa lớn, lợi chính; không ăn ở nhà tốt.',
    image: 'Thiên tại sơn trung — quân tử đa thức tiền ngôn vãng hành.',
    lines: [
      'Sơ cửu: Hữu lệ lợi dĩ — có nguy, lợi dừng.',
      'Cửu nhị: Dư thuyết phục — xe tháo bánh.',
      'Cửu tam: Lương mã trục — ngựa tốt đuổi, lợi khó chính; nói mục tiêu xe vệ, lợi có chỗ đi.',
      'Lục tứ: Đồng ngưu chi cáo — then cửa chuồng bò non, đại tốt.',
      'Lục ngũ: Phần thỉ chi nha — lợn bị thiến cái nanh, tốt.',
      'Thượng cửu: Hà thiên chi cù — đường trời thông, hanh.',
    ],
    keywords: ['tích lũy lớn', 'kiềm chế', 'nuôi tài'],
    summary: 'Chứa đức lớn — học lời xưa, nuôi sức trước khi dùng.',
  },
  {
    number: 27,
    nameVi: 'Di',
    nameHan: '頤',
    judgment: 'Trinh cát — nuôi dưỡng, chính thì tốt.',
    image: 'Sơn hạ hữu lôi — quân tử thận ngôn ngữ tiết ẩm thực.',
    lines: [
      'Sơ cửu: Xả nhĩ linh quy — bỏ đồi linh thiêng, xem ta nuôi, xấu.',
      'Lục nhị: Điên di — nuôi lệch, vượt khỏi丘, chinh xấu.',
      'Lục tam: Phất di — nuôi trái, chính xấu; mười năm đừng dùng, vô lợi.',
      'Lục tứ: Điên di cát — nuôi lệch mà tốt; hổ nhìn đằng đằng, không lỗi.',
      'Lục ngũ: Phất kinh — trái thường, ở chính tốt, không vượt sông lớn.',
      'Thượng cửu: Do di — nguồn nuôi, nguy tốt, lợi vượt sông lớn.',
    ],
    keywords: ['nuôi dưỡng', 'ăn nói', 'tiết chế'],
    summary: 'Nuôi thân và đức — cẩn ngôn, tiết thực.',
  },
  {
    number: 28,
    nameVi: 'Đại Quá',
    nameHan: '大過',
    judgment: 'Đống nhiêu — xà nhà võng, lợi có chỗ đi, hanh.',
    image: 'Trạch diệt mộc — quân tử độc lập bất cụ.',
    lines: [
      'Sơ lục: Tá dụng bạch mao — lót bằng cỏ trắng, không lỗi.',
      'Cửu nhị: Khô dương sinh đễ — dương khô nảy chồi, ông lấy vợ trẻ, không gì bất lợi.',
      'Cửu tam: Đống nhiêu — xà võng, xấu.',
      'Cửu tứ: Đống long — xà cong lên, tốt; có riêng thì tiếc.',
      'Cửu ngũ: Khô dương sinh hoa — dương khô ra hoa, bà lấy chồng trẻ, không lỗi không khen.',
      'Thượng lục: Quá thiệp diệt đỉnh — lội quá chìm đỉnh đầu, xấu không lỗi.',
    ],
    keywords: ['quá mức', 'gánh nặng', 'độc lập'],
    summary: 'Gánh quá sức — cần chỗ dựa vững, đừng cố chấp.',
  },
  {
    number: 29,
    nameVi: 'Khảm',
    nameHan: '坎',
    judgment: 'Hữu phu duy tâm hanh — hiểm chồng chất, giữ lòng thành.',
    image: 'Thủy hãn chí — quân tử thường đức hành tập giáo sự.',
    lines: [
      'Sơ lục: Tập khảm — hãm lần hai, vào hang khảm, xấu.',
      'Cửu nhị: Khảm hữu hiểm — khảm có hiểm, cầu nhỏ được.',
      'Lục tam: Lai chi khảm — đến đi khảm khảm, vào hang, đừng dùng.',
      'Lục tứ: Tôn tửu quỹ — chén rượu chén cơm, dùng bình đất từ cửa sổ, cuối không lỗi.',
      'Cửu ngũ: Khảm bất doanh — hố không đầy, chỉ bằng, không lỗi.',
      'Thượng lục: Hệ dụng huy mặc — trói bằng thừng mây, bỏ gai tù ba năm, xấu.',
    ],
    keywords: ['hiểm', 'thành tín', 'luyện tâm'],
    summary: 'Trong hiểm nguy — giữ lòng thành và tập luyện.',
  },
  {
    number: 30,
    nameVi: 'Ly',
    nameHan: '離',
    judgment: 'Lợi trinh hanh — gắn bó sáng suốt thì thông.',
    image: 'Minh lưỡng tác — đại nhân dĩ kế minh chiếu ư tứ phương.',
    lines: [
      'Sơ cửu: Lý thác nhiên — bước rối, kính thì không lỗi.',
      'Lục nhị: Hoàng ly — vàng ly, đại tốt.',
      'Cửu tam: Nhật tịch chi ly — mặt trời lặn, không đánh trống mà hát thì tiếng già than, xấu.',
      'Cửu tứ: Đột như kỳ lai như — đột nhiên đến như, cháy như, chết như, bỏ như.',
      'Lục ngũ: Xuất thế thác nhược — chảy nước mắt thảm thiết, tốt.',
      'Thượng cửu: Vương dụng xuất chinh — vua xuất chinh, có danh chém thủ lĩnh, bắt không phải kẻ thù, không lỗi.',
    ],
    keywords: ['sáng', 'văn minh', 'gắn bó'],
    summary: 'Sáng và trung — soi đường cho mình và người.',
  },
  {
    number: 31,
    nameVi: 'Hàm',
    nameHan: '咸',
    judgment: 'Hanh lợi trinh — cảm ứng, lấy vợ tốt.',
    image: 'Sơn thượng hữu trạch — quân tử dĩ hư thụ nhân.',
    lines: [
      'Sơ lục: Hàm kỳ mẫu chỉ — cảm ngón chân cái.',
      'Lục nhị: Hàm kỳ phì — cảm bắp chân, xấu; ở thì tốt.',
      'Cửu tam: Hàm kỳ cổ — cảm đùi, chấp theo đi, đi thì tiếc.',
      'Cửu tứ: Trinh cát hối vong — chính tốt hết hối; hết hết tới tới, bạn theo ý bạn.',
      'Cửu ngũ: Hàm kỳ mai — cảm lưng trên, không hối.',
      'Thượng lục: Hàm kỳ phụ giáp thiệt — cảm hàm má lưỡi.',
    ],
    keywords: ['cảm ứng', 'lòng trống', 'hôn nhân'],
    summary: 'Cảm bằng chân thành — mở lòng tiếp người.',
  },
  {
    number: 32,
    nameVi: 'Hằng',
    nameHan: '恆',
    judgment: '亨. Vô cữu lợi trinh — bền lâu thì thông.',
    image: 'Lôi phong hằng — quân tử lập bất dị phương.',
    lines: [
      'Sơ lục: Tuân hằng — đào sâu bền, chính xấu, vô lợi.',
      'Cửu nhị: Hối vong — hết hối.',
      'Cửu tam: Bất hằng kỳ đức — không bền đức, hoặc thừa chi xấu; chính tiếc.',
      'Cửu tứ: Điền vô cầm — đồng không chim.',
      'Lục ngũ: Hằng kỳ đức — bền đức, chính; phụ nhân tốt, phu tử xấu.',
      'Thượng lục: Chấn hằng — chấn động bền, xấu.',
    ],
    keywords: ['bền vững', 'kiên trì', 'ổn định'],
    summary: 'Giữ đạo lâu dài — đừng nóng vội đổi hướng.',
  },
  {
    number: 33,
    nameVi: 'Độn',
    nameHan: '遯',
    judgment: '亨. Tiểu lợi trinh — ẩn退避 thì thông.',
    image: 'Thiên hạ hữu sơn — quân tử viễn tiểu nhân bất ác nhi nghiêm.',
    lines: [
      'Sơ lục: Độn vĩ — đuôi độn, nguy; đừng dùng có chỗ đi.',
      'Lục nhị: Chấp chi dụng hoàng ngưu chi cách — giữ bằng da bò vàng, không tháo được.',
      'Cửu tam: Hệ độn — buộc độn, có bệnh nguy; nuôi tôi tớ tốt.',
      'Cửu tứ: Hảo độn — thích độn, quân tử tốt, tiểu nhân phủ định.',
      'Cửu ngũ: Gia độn — đẹp độn, chính tốt.',
      'Thượng cửu: Phì độn — độn mập, không gì bất lợi.',
    ],
    keywords: ['ẩn', 'thoái lui', 'giữ mình'],
    summary: 'Biết lùi đúng lúc — xa tiểu nhân mà không ác.',
  },
  {
    number: 34,
    nameVi: 'Đại Tráng',
    nameHan: '大壯',
    judgment: 'Lợi trinh — mạnh lớn, lợi giữ chính.',
    image: 'Lôi tại thiên thượng — quân tử phi lễ phất lý.',
    lines: [
      'Sơ cửu: Tráng ư chỉ — mạnh ở chân, chinh xấu có đức tin.',
      'Cửu nhị: Trinh cát — chính tốt.',
      'Cửu tam: Tiểu nhân dụng tráng — tiểu nhân dùng mạnh, quân tử dùng lưới; chính nguy.',
      'Cửu tứ: Trinh cát hối vong — chính tốt hết hối; bức không thắng, mạnh bánh xe.',
      'Lục ngũ: Tang dương ư dịch — dê mất dễ dàng, không hối.',
      'Thượng lục: Dương xúc phiên — dê húc rào, không lui không tiến, vô lợi; khó thì tốt.',
    ],
    keywords: ['mạnh', 'lễ', 'kiềm chế sức'],
    summary: 'Mạnh mà đúng lễ — sức không thay đức.',
  },
  {
    number: 35,
    nameVi: 'Tấn',
    nameHan: '晉',
    judgment: 'Khang hầu dụng tích mã — tiến lên được ban ngựa.',
    image: 'Minh xuất địa thượng — quân tử tự chiêu minh đức.',
    lines: [
      'Sơ lục: Tấn như tủy như — tiến mà bị chặn, chính tốt; không tin rộng không lỗi.',
      'Lục nhị: Tấn như sầu như — tiến mà buồn, chính tốt; nhận phúc lớn từ vương mẫu.',
      'Lục tam: Chúng duẫn hối vong — chúng cho phép, hết hối.',
      'Cửu tứ: Tấn như thạch thử — tiến như chuột đồng, chính nguy.',
      'Lục ngũ: Hối vong — hết hối, mất được đừng lo, đi tốt không gì lợi bằng.',
      'Thượng cửu: Tấn kỳ giác — tiến bằng sừng, chỉ用 để phạt ấp, nguy tốt không lỗi, chính tiếc.',
    ],
    keywords: ['tiến thủ', 'sáng tỏ', 'thăng'],
    summary: 'Tiến như mặt trời mọc — soi đức mình ra.',
  },
  {
    number: 36,
    nameVi: 'Minh Di',
    nameHan: '明夷',
    judgment: 'Lợi gian trinh — sáng bị tổn, lợi giữ chính trong khó.',
    image: 'Minh nhập địa trung — quân tử lợi chúng dụng ám nhi minh.',
    lines: [
      'Sơ cửu: Minh di ư phi — sáng tổn lúc bay, rũ cánh; quân tử đi ba ngày không ăn.',
      'Lục nhị: Minh di di ư tả cổ — sáng tổn đùi trái, cứu bằng ngựa mạnh, tốt.',
      'Cửu tam: Minh di ư nam thú — sáng tổn săn phương Nam, được thủ lĩnh lớn; không nên vội chính.',
      'Lục tứ: Nhập ư tả phúc — vào bụng trái, được lòng minh di, ra khỏi cửa sân.',
      'Lục ngũ: Cơ Tử chi minh di — sáng tổn như Cơ Tử, lợi chính.',
      'Thượng lục: Bất minh hối — không sáng mà tối, trước lên trời sau vào đất.',
    ],
    keywords: ['ẩn sáng', 'gian nạn', 'giữ chí'],
    summary: 'Sáng phải ẩn — giữ chính trong thời tối.',
  },
  {
    number: 37,
    nameVi: 'Gia Nhân',
    nameHan: '家人',
    judgment: 'Lợi nữ trinh — gia đạo, lợi nữ chính.',
    image: 'Phong tự hỏa xuất — quân tử ngôn hữu vật hành hữu hằng.',
    lines: [
      'Sơ cửu: Nhàn hữu gia — ngăn ngừa có nhà, hối mất.',
      'Lục nhị: Vô du toại — không tùy tiện, ở trong nấu nướng, chính tốt.',
      'Cửu tam: Gia nhân háo háo — nhà nghiêm nghị, hối nguy tốt; phụ tử hí hí cuối xấu.',
      'Lục tứ: Phú gia — giàu nhà, đại tốt.',
      'Cửu ngũ: Vương cách hữu gia — vua đến có nhà, đừng lo, tốt.',
      'Thượng cửu: Hữu phu uy như — có đức tin oai như, cuối tốt.',
    ],
    keywords: ['gia đình', 'nữ chính', 'nề nếp'],
    summary: 'Chỉnh đốn từ nhà — lời có vật, việc có thường.',
  },
  {
    number: 38,
    nameVi: 'Khuê',
    nameHan: '睽',
    judgment: 'Tiểu sự cát — chia lìa, việc nhỏ tốt.',
    image: 'Hỏa thượng trạch hạ — quân tử đồng nhi dị.',
    lines: [
      'Sơ cửu: Hối vong — hết hối; mất ngựa đừng đuổi tự về; thấy ác nhân không lỗi.',
      'Cửu nhị: Ngộ chủ ư巷 — gặp chủ trong hẻm, không lỗi.',
      'Lục tam: Kiến dư duệt — thấy xe kéo, trâu kéo, người bị cắt trán cắt mũi; không có khởi đầu có kết thúc.',
      'Cửu tứ: Khuê cô — chia đơn độc, gặp nguyên phu; giao cảm tin, nguy không lỗi.',
      'Lục ngũ: Hối vong — hết hối; tông nhân cắn da, đi đâu lỗi?',
      'Thượng cửu: Khuê cô — thấy heo bôi bùn, xe đầy quỷ; trước giương cung sau buông; không phải cướp mà hôn nhân; đi gặp mưa thì tốt.',
    ],
    keywords: ['bất đồng', 'hòa dị', 'việc nhỏ'],
    summary: 'Khác mà cùng — xử việc nhỏ trước, đừng cưỡng đồng.',
  },
  {
    number: 39,
    nameVi: 'Kiển',
    nameHan: '蹇',
    judgment: 'Lợi Tây Nam — khó khăn, lợi Tây Nam, bất lợi Đông Bắc.',
    image: 'Sơn thượng hữu thủy — quân tử phản thân tu đức.',
    lines: [
      'Sơ lục: Vãng kiển lai dự — đi khó về khen.',
      'Lục nhị: Vương thần kiển kiển — bề tôi vua khó khăn, không phải vì thân.',
      'Cửu tam: Vãng kiển lai phản — đi khó về trở lại.',
      'Lục tứ: Vãng kiển lai liên — đi khó về nối.',
      'Cửu ngũ: Đại kiển bằng lai — khó lớn bạn đến.',
      'Thượng lục: Vãng kiển lai thạc — đi khó về lớn; tốt lợi thấy đại nhân.',
    ],
    keywords: ['gian nan', 'tự xét', 'cầu hiền'],
    summary: 'Khó thì về xét mình — cầu bậc đại nhân.',
  },
  {
    number: 40,
    nameVi: 'Giải',
    nameHan: '解',
    judgment: 'Lợi Tây Nam — giải nạn, không chỗ đi thì trở về tốt.',
    image: 'Lôi vũ tác — quân tử xá quá宥 tội.',
    lines: [
      'Sơ lục: Vô cữu — không lỗi.',
      'Cửu nhị: Điền hoạch tam hồ — săn được ba cáo, được mũi tên vàng, chính tốt.',
      'Lục tam: Phụ thả thừa — mang đồ lại ngồi xe, rước tặc, chính tiếc.',
      'Cửu tứ: Giải nhi mẫu — giải cái ngón chân cái, bạn đến tin tưởng.',
      'Lục ngũ: Quân tử duy hữu giải — quân tử có giải, tốt; có đức tin với tiểu nhân.',
      'Thượng lục: Công dụng Xạ chuẩn ư cao dung chi thượng — bắn diều trên tường cao, được nó, không gì bất lợi.',
    ],
    keywords: ['giải thoát', 'tha thứ', 'xả'],
    summary: 'Tan hiểm — tha lỗi, đừng níu chuyện cũ.',
  },
  {
    number: 41,
    nameVi: 'Tổn',
    nameHan: '損',
    judgment: 'Hữu phu nguyên cát — giảm bớt, thành tín thì rất tốt.',
    image: 'Sơn hạ hữu trạch — quân tử trừng忿窒 dục.',
    lines: [
      'Sơ cửu: Dĩ sự tốc vãng — làm việc đi mau, không lỗi; bàn giảm bao nhiêu.',
      'Cửu nhị: Lợi trinh — lợi chính, chinh xấu; không giảm mà tăng.',
      'Lục tam: Tam nhân hành — ba người đi thì giảm một; một người đi thì được bạn.',
      'Lục tứ: Tổn kỳ tật — giảm bệnh, khiến vui mau có, không lỗi.',
      'Lục ngũ: Hoặc ích chi thập bằng chi quy — ai đó tăng bằng mười đôi rùa, không chống được, rất tốt.',
      'Thượng cửu: Phất tổn ích chi — không giảm mà tăng, không lỗi chính tốt, lợi có chỗ đi, được tôi không nhà.',
    ],
    keywords: ['giảm dục', 'hy sinh', 'ích người'],
    summary: 'Bớt dục lợi người — thành tín thì được phúc.',
  },
  {
    number: 42,
    nameVi: 'Ích',
    nameHan: '益',
    judgment: 'Lợi hữu du vãng — tăng ích, lợi vượt sông lớn.',
    image: 'Phong lôi ích — quân tử kiến thiện tắc thiên.',
    lines: [
      'Sơ cửu: Lợi dụng vi đại tác — lợi làm việc lớn, nguyên tốt không lỗi.',
      'Lục nhị: Hoặc ích chi — ai đó tăng mười đôi rùa, vua dùng hưởng đế, tốt.',
      'Lục tam: Ích chi dụng hung sự — tăng dùng việc hung, không lỗi; có đức tin trung hành báo công bằng quy.',
      'Lục tứ: Trung hành cáo công — đi giữa báo công công, lợi dùng làm chỗ dựa dời nước.',
      'Cửu ngũ: Hữu phu huệ tâm — thành tín lòng huệ, đừng hỏi rất tốt; thành tín huệ đức ta.',
      'Thượng cửu: Mạc ích chi — không ai tăng, hoặc đánh nó, lập tâm đừng bền, xấu.',
    ],
    keywords: ['tăng ích', 'làm thiện', 'cải thiện'],
    summary: 'Thấy thiện thì đổi theo — lợi người cũng lợi mình.',
  },
  {
    number: 43,
    nameVi: 'Quải',
    nameHan: '夬',
    judgment: 'Dương ư vương đình — quyết đoán, cáo ở sân vua.',
    image: 'Trạch thượng ư thiên — quân tử thi lộc cập hạ.',
    lines: [
      'Sơ cửu: Tráng ư tiền chỉ — mạnh ở ngón chân trước, đi không thắng làm lỗi.',
      'Cửu nhị: Tịch hào — đêm có khí giới, đừng lo.',
      'Cửu tam: Tráng ư䯋 — mạnh ở gò má, có xấu; quân tử quyết quyết đi một mình gặp mưa ướt như có oán, không lỗi.',
      'Cửu tứ: Điển vô phu — mông không da, đi khó khăn; kéo dê hối mất, nghe lời không tin.',
      'Cửu ngũ: Tuấn lục quyết quyết — rau amaranth quyết đoán, đi giữa không lỗi.',
      'Thượng lục: Vô hào — không khí giới, cuối có xấu.',
    ],
    keywords: ['quyết đoán', 'loại trừ', 'công khai'],
    summary: 'Quyết điều ác công khai — đừng dùng thủ đoạn tiểu nhân.',
  },
  {
    number: 44,
    nameVi: 'Cấu',
    nameHan: '姤',
    judgment: 'Nữ tráng — gặp gỡ, đừng lấy nữ mạnh.',
    image: 'Thiên hạ hữu phong — hậu dĩ thi mệnh cáo tứ phương.',
    lines: [
      'Sơ lục: Hệ ư kim nịch — buộc vào thắng xe đồng, chính tốt; có chỗ đi thấy xấu; gầy heo nhảy đuôi.',
      'Cửu nhị: Bao hữu ngư — bọc có cá, không lỗi, bất lợi khách.',
      'Cửu tam: Điển vô phu — mông không da, đi khó; nguy không lỗi lớn.',
      'Cửu tứ: Bao vô ngư — bọc không cá, dậy hung.',
      'Cửu ngũ: Dĩ kỷ bao qua — dùng liễu bọc dưa, chứa chương, có du自 thiên.',
      'Thượng cửu: Cấu kỳ giác — gặp sừng, tiếc không lỗi.',
    ],
    keywords: ['gặp gỡ', 'phòng bị', 'âm đột nhập'],
    summary: 'Gặp bất ngờ — thận trọng giao kết.',
  },
  {
    number: 45,
    nameVi: 'Tụy',
    nameHan: '萃',
    judgment: '亨. Vương giả hữu miếu — tụ họp, lợi thấy đại nhân.',
    image: 'Trạch thượng ư địa — quân tử trừ nhung khí giới.',
    lines: [
      'Sơ lục: Hữu phu bất chung — có tin không trọn, bèn loạn bèn tụ; như kêu một nắm thì cười, đừng lo đi không lỗi.',
      'Lục nhị: Dẫn cát — kéo thì tốt không lỗi; thành tín mới dùng岳, nhỏ dùng cũng được.',
      'Lục tam: Tụy như ta như — tụ mà than, vô lợi; đi không lỗi nhỏ tiếc.',
      'Cửu tứ: Đại cát vô cữu — đại tốt không lỗi.',
      'Cửu ngũ: Tụy hữu vị — tụ có ngôi, không lỗi; không tin nguyên vĩnh chính hối mất.',
      'Thượng lục: Tế tư thán tức — khóc than nước mắt, không lỗi.',
    ],
    keywords: ['tụ họp', 'tế tự', 'đoàn kết'],
    summary: 'Tụ vì chính nghĩa — sửa soạn đề phòng.',
  },
  {
    number: 46,
    nameVi: 'Thăng',
    nameHan: '升',
    judgment: 'Nguyên hanh — lên cao, lợi thấy đại nhân đừng lo.',
    image: 'Địa trung sinh mộc — quân tử dĩ thuận đức tích tiểu cao đại.',
    lines: [
      'Sơ lục: Doẫn thăng đại cát — cho phép lên, đại tốt.',
      'Cửu nhị: Phu nãi lợi dụng nhạc — thành tín lợi dùng lễ岳, không lỗi.',
      'Cửu tam: Thăng hư ấp — lên ấp trống.',
      'Lục tứ: Vương dụng hanh ư Kỳ Sơn — vua dùng hanh ở Kỳ Sơn, tốt không lỗi.',
      'Lục ngũ: Trinh cát thăng giai — chính tốt, lên bậc.',
      'Thượng lục: Minh thăng — tối mà lên, lợi không ngừng chính.',
    ],
    keywords: ['thăng tiến', 'tích tiểu', 'thuận đức'],
    summary: 'Lên dần bằng đức — gặp đại nhân thì thông.',
  },
  {
    number: 47,
    nameVi: 'Khốn',
    nameHan: '困',
    judgment: '亨. Trinh đại nhân cát — khốn cùng, lớn người chính thì tốt.',
    image: 'Trạch vô thủy — quân tử trí mệnh toại chí.',
    lines: [
      'Sơ lục: Đồn khốn ư chu mộc — mông khốn gốc cây, vào thung lũng tối, ba năm không gặp.',
      'Cửu nhị: Khốn ư tửu thực — khốn rượu thịt, chuồng đỏ vừa đến, lợi dùng tế享, chinh xấu.',
      'Lục tam: Khốn ư thạch — khốn đá, níu gai; vào nhà không thấy vợ, xấu.',
      'Cửu tứ: Lai từ từ — đến chậm, khốn xe vàng, tiếc có kết thúc.',
      'Cửu ngũ: 劓 hình — cắt mũi cắt chân, khốn kẻ chuồng đỏ; bèn chậm có vui, lợi dùng tế tự.',
      'Thượng lục: Khốn ư cát lũy — khốn dây leo, nói động hối; có hối đi tốt.',
    ],
    keywords: ['khốn khó', 'giữ chí', 'đại nhân'],
    summary: 'Khốn mà không mất chí — lời thành rồi mới thông.',
  },
  {
    number: 48,
    nameVi: 'Tỉnh',
    nameHan: '井',
    judgment: 'Cải ấp bất cải tỉnh — giếng không đổi theo ấp.',
    image: 'Mộc thượng hữu thủy — quân tử lao dân khuyến tương.',
    lines: [
      'Sơ lục: Tỉnh nê bất thực — giếng bùn không uống, cũ không có cầm.',
      'Cửu nhị: Tỉnh cốc xạ phụ — giếng hang bắn cá, vò hỏng lủng.',
      'Cửu tam: Tỉnh tiết bất thực — giếng sạch không uống, thương ta; có thể dùng sáng nhận.',
      'Lục tứ: Tỉnh du vô cữu — giếng xây lại, không lỗi.',
      'Cửu ngũ: Tỉnh liệt hàn tuyền — giếng trong suối lạnh, uống.',
      'Thượng lục: Tỉnh thu vật mạc — giếng thu đừng che, có đức tin rất tốt.',
    ],
    keywords: ['nuôi dân', 'ổn định', 'công ích'],
    summary: 'Giếng đức không cạn — chăm người, giữ nguồn.',
  },
  {
    number: 49,
    nameVi: 'Cách',
    nameHan: '革',
    judgment: 'Kỷ nhật nãi phu — đổi mới, ngày đã định mới tin.',
    image: 'Trạch trung hữu hỏa — quân tử trị lịch minh thời.',
    lines: [
      'Sơ cửu: Củng dụng hoàng ngưu chi cách — buộc bằng da bò vàng.',
      'Lục nhị: Kỷ nhật nãi cách — đến ngày đã định mới đổi, chinh tốt không lỗi.',
      'Cửu tam: Chinh xấu trinh lệ — chinh xấu chính nguy; cách ngôn ba lần có đức tin.',
      'Cửu tứ: Hối vong hữu phu — hết hối có tin, đổi mệnh tốt.',
      'Cửu ngũ: Đại nhân hổ biến — đại nhân đổi như hổ, chưa bói có tin.',
      'Thượng lục: Quân tử báo biến — quân tử đổi như báo, tiểu nhân đổi mặt; chinh xấu ở chính tốt.',
    ],
    keywords: ['cải cách', 'đúng thời', 'lấy tin'],
    summary: 'Đổi phải đúng lúc và được tin — minh thời trị lịch.',
  },
  {
    number: 50,
    nameVi: 'Đỉnh',
    nameHan: '鼎',
    judgment: 'Nguyên cát hanh — đỉnh lễ, rất tốt thông.',
    image: 'Mộc thượng hữu hỏa — quân tử chính vị ngưng mệnh.',
    lines: [
      'Sơ lục: Đỉnh điên chỉ — đỉnh lật chân, lợi đổ đồ xấu; được thiếp nhờ con, không lỗi.',
      'Cửu nhị: Đỉnh hữu thực — đỉnh có thức ăn, bạn ta có bệnh không thể đến, tốt.',
      'Cửu tam: Đỉnh nhĩ cách — đỉnh vành đổi, đi tắc; mỡ pheasant không ăn; mưa thì hết hối cuối tốt.',
      'Cửu tứ: Đỉnh chiết túc — đỉnh gãy chân, đổ công của công, hình ướt như, xấu.',
      'Lục ngũ: Đỉnh hoàng nhĩ kim huyền — đỉnh vành vàng tai vàng, lợi chính.',
      'Thượng cửu: Đỉnh ngọc huyền — đỉnh tai ngọc, đại tốt không gì lợi bằng.',
    ],
    keywords: ['nuôi hiền', 'an vị', 'lễ'],
    summary: 'Đỉnh nuôi người hiền — chính vị thì mệnh vững.',
  },
  {
    number: 51,
    nameVi: 'Chấn',
    nameHan: '震',
    judgment: '亨. Chấn lai h號號 — sấm dậy, sợ rồi cười nói.',
    image: 'Giản lôi — quân tử dĩ khủng cụ tu tỉnh.',
    lines: [
      'Sơ cửu: Chấn lai h號號 — sợ rồi cười ha ha, tốt.',
      'Lục nhị: Chấn lai lệ — sấm đến nguy, mất của báu leo chín gò; đừng đuổi bảy ngày được.',
      'Lục tam: Chấn tô tô — sấm truyền truyền, chấn hành không lỗi.',
      'Cửu tứ: Chấn toại nê — sấm rồi bùn.',
      'Lục ngũ: Chấn vãng lai lệ — sấm qua lại nguy, không mất có việc.',
      'Thượng lục: Chấn sách sách — sấm nhìn nhìn, chinh xấu; sấm không với thân với xóm, không lỗi; hôn nhân có lời.',
    ],
    keywords: ['chấn động', 'tự tỉnh', 'sợ để sửa'],
    summary: 'Sợ đúng chỗ để sửa mình — giữ bình khi biến.',
  },
  {
    number: 52,
    nameVi: 'Cấn',
    nameHan: '艮',
    judgment: 'Cấn kỳ bối — dừng ở lưng, không thấy thân mình.',
    image: 'Kiêm sơn — quân tử tư bất xuất kỳ vị.',
    lines: [
      'Sơ lục: Cấn kỳ chỉ — dừng ngón chân, không lỗi, lợi vĩnh chính.',
      'Lục nhị: Cấn kỳ phì — dừng bắp chân, không cứu người theo, tâm không vui.',
      'Cửu tam: Cấn kỳ hạn — dừng eo, làm nát tâm, nguy hun đốt tâm.',
      'Lục tứ: Cấn kỳ thân — dừng thân, không lỗi.',
      'Lục ngũ: Cấn kỳ phụ — dừng hàm, lời có trật tự, hối mất.',
      'Thượng cửu: Đôn cấn — dày dừng, tốt.',
    ],
    keywords: ['biết dừng', 'tĩnh', 'đúng vị'],
    summary: 'Dừng đúng chỗ — nghĩ không vượt vị.',
  },
  {
    number: 53,
    nameVi: 'Tiệm',
    nameHan: '漸',
    judgment: 'Nữ quy cát — tiến dần, gả con gái tốt.',
    image: 'Sơn thượng hữu mộc — quân tử cư hiền đức thiện tục.',
    lines: [
      'Sơ lục: Hồng tiệm ư can — hồng tiến vào bờ, tiểu tử nguy có lời, không lỗi.',
      'Lục nhị: Hồng tiệm ư bàn — hồng tiến vào đá, ăn uống thỏa thích, tốt.',
      'Cửu tam: Hồng tiệm ư lục — hồng tiến vào đất, phu chinh không về, phụ mang không nuôi, xấu; lợi chống tặc.',
      'Lục tứ: Hồng tiệm ư mộc — hồng tiến vào cây, hoặc được chỗ bằng, không lỗi.',
      'Cửu ngũ: Hồng tiệm ư lăng — hồng tiến vào đồi, phụ ba năm không mang; cuối không thắng tốt.',
      'Thượng cửu: Hồng tiệm ư lục — hồng tiến vào đất trời, lông dùng nghi lễ, tốt.',
    ],
    keywords: ['tiến dần', 'trật tự', 'hôn nhân'],
    summary: 'Tiến từng bậc — không nhảy cóc.',
  },
  {
    number: 54,
    nameVi: 'Quy Muội',
    nameHan: '歸妹',
    judgment: 'Chinh xấu vô du lợi — gả em, chinh xấu.',
    image: 'Trạch thượng hữu lôi — quân tử vĩnh chung tri tệ.',
    lines: [
      'Sơ cửu: Quy muội dĩ đệ — gả em làm thiếp, què vẫn đi, chinh tốt.',
      'Cửu nhị: Diệt năng thị — chột vẫn xem, lợi u chính.',
      'Lục tam: Quy muội dĩ tu — gả em chờ, về gả làm thiếp.',
      'Cửu tứ: Quy muội khiến kỳ — gả em trễ kỳ, chậm có lúc.',
      'Lục ngũ: Đế Ất quy muội — vua gả em, quân áo không bằng thiếp áo; mặt trăng gần đầy tốt.',
      'Thượng lục: Nữ thừa匡 vô thực — nữ nâng giỏ không thực, sĩ tế dê không máu, vô lợi.',
    ],
    keywords: ['sai vị', 'thận trọng kết', 'biết cuối'],
    summary: 'Kết không đúng vị — thận trọng duyên phận.',
  },
  {
    number: 55,
    nameVi: 'Phong',
    nameHan: '豐',
    judgment: '亨. Vương giả chi — phong thịnh, vua đến không lo.',
    image: 'Lôi điện giai chí — quân tử chi狱 minh phạt.',
    lines: [
      'Sơ cửu: Ngộ kỳ phối chủ — gặp chủ phối, dù tuần không lỗi, đi có thưởng.',
      'Lục nhị: Phong kỳ bộ — phong che, giữa ngày thấy sao; đi được nghi ngờ bệnh, có tin phát ra tốt.',
      'Cửu tam: Phong kỳ bái — phong tàn, giữa ngày thấy bọt; gãy cánh tay phải, không lỗi.',
      'Cửu tứ: Phong kỳ bộ — phong che, trung ngày thấy sao; gặp chủ ẩn bằng, tốt.',
      'Lục ngũ: Lai chương — đến có chương, có khánh dự tốt.',
      'Thượng lục: Phong kỳ ốc — phong nhà, che nhà, dòm cửa tịch không người, ba năm không gặp, xấu.',
    ],
    keywords: ['thịnh vượng', 'minh xét', 'đừng kiêu'],
    summary: 'Thịnh phải sáng suốt — giữ công bằng, đề phòng cô lập.',
  },
  {
    number: 56,
    nameVi: 'Lữ',
    nameHan: '旅',
    judgment: 'Tiểu hanh — lữ khách, nhỏ thông, chính tốt.',
    image: 'Sơn thượng hữu hỏa — quân tử minh thận dụng hình.',
    lines: [
      'Sơ lục: Lữ tỏa tỏa — lữ vụn vặt, lấy nạn.',
      'Lục nhị: Lữ tức thứ — lữ nghỉ quán, giữ tiền của, được đồng bộc trinh.',
      'Cửu tam: Lữ phần thứ — lữ đốt quán, mất đồng bộc trinh, nguy.',
      'Cửu tứ: Lữ ư xứ — lữ chỗ, được của mình rìu; tâm không vui.',
      'Lục ngũ: Xạ trĩ nhất thi — bắn trĩ một mũi, cuối khen mệnh.',
      'Thượng lục: Điểu phần kỳ sào — chim đốt tổ, lữ trước cười sau khóc; mất bò nơi dịch, xấu.',
    ],
    keywords: ['xa nhà', 'thận trọng', 'khách'],
    summary: 'Ở đất khách — khiêm nhường, giữ lễ.',
  },
  {
    number: 57,
    nameVi: 'Tốn',
    nameHan: '巽',
    judgment: 'Tiểu hanh — mềm thuận, lợi có chỗ đi, lợi thấy đại nhân.',
    image: 'Tùy phong — quân tử thân mệnh hành sự.',
    lines: [
      'Sơ lục: Tiến thoái — tiến lui, lợi võ nhân chính.',
      'Cửu nhị: Tốn tại sàng hạ — tốn dưới giường, dùng sử nhiều như, tốt không lỗi.',
      'Cửu tam: Tần tốn — thường tốn, tiếc.',
      'Lục tứ: Hối vong — hết hối, điền được ba phẩm.',
      'Cửu ngũ: Trinh cát hối vong — chính tốt hết hối, không gì bất lợi; không đầu có cuối, trước canh ba sau canh ba tốt.',
      'Thượng cửu: Tốn tại sàng hạ — mất rìu của mình, chính xấu.',
    ],
    keywords: ['mềm mỏng', 'thâm nhập', 'mệnh lệnh'],
    summary: 'Thuận mà thấu — truyền mệnh rõ, đừng do dự mãi.',
  },
  {
    number: 58,
    nameVi: 'Đoài',
    nameHan: '兌',
    judgment: '亨. Lợi trinh — vui vẻ thông, lợi chính.',
    image: 'Lệ trạch — quân tử bằng hữu giảng tập.',
    lines: [
      'Sơ cửu: Hòa đoài — hòa vui, tốt.',
      'Cửu nhị: Phu đoài — tin vui, tốt hối mất.',
      'Lục tam: Lai đoài — đến vui, xấu.',
      'Cửu tứ: Thương đoài vị ninh — bàn vui chưa yên, trừ bịnh có vui.',
      'Cửu ngũ: Phu ư bác — tin nơi đổ nát, có nguy.',
      'Thượng lục: Dẫn đoài — kéo vui.',
    ],
    keywords: ['vui hòa', 'bạn hữu', 'chính'],
    summary: 'Vui bằng đức tin — học cùng bạn hiền.',
  },
  {
    number: 59,
    nameVi: 'Hoán',
    nameHan: '渙',
    judgment: '亨. Vương giả hữu miếu — tan chảy, lợi vượt sông lớn.',
    image: 'Phong hành thủy thượng — tiên vương dĩ hưởng ư đế lập miếu.',
    lines: [
      'Sơ lục: Dụng chửng mã tráng — dùng ngựa cứu mạnh, tốt.',
      'Cửu nhị: Hoán bôn kỳ cơ — tan chạy tới chỗ dựa, hối mất.',
      'Lục tam: Hoán kỳ thân — tan thân mình, không hối.',
      'Lục tứ: Hoán kỳ quần — tan đám, rất tốt; hoán có丘, không phải điều thường nghĩ.',
      'Cửu ngũ: Hoán hãn kỳ đại hiệu — tan mồ hôi lời lớn, hoán vương cư không lỗi.',
      'Thượng lục: Hoán kỳ huyết — tan máu đi xa, ra không lỗi.',
    ],
    keywords: ['giải tán', 'hòa giải', 'vượt hiểm'],
    summary: 'Tan băng lòng người — tế tự và vượt sông lớn.',
  },
  {
    number: 60,
    nameVi: 'Tiết',
    nameHan: '節',
    judgment: '亨. Khổ tiết bất khả trinh — tiết chế thông; tiết khổ không nên cố.',
    image: 'Trạch thượng hữu thủy — quân tử chế số độ nghị đức hành.',
    lines: [
      'Sơ cửu: Bất xuất hộ đình — không ra cửa sân, không lỗi.',
      'Cửu nhị: Bất xuất môn đình — không ra cửa nhà, xấu.',
      'Lục tam: Bất tiết nhược tắc — không tiết thì than, không lỗi.',
      'Lục tứ: An tiết hanh — yên tiết thì thông.',
      'Cửu ngũ: Cam tiết cát — ngọt tiết tốt, đi có thưởng.',
      'Thượng lục: Khổ tiết — tiết khổ, chính xấu; hối mất.',
    ],
    keywords: ['tiết độ', 'pháp độ', 'trung dung'],
    summary: 'Biết đủ — tiết mà đừng khổ hạnh cực đoan.',
  },
  {
    number: 61,
    nameVi: 'Trung Phù',
    nameHan: '中孚',
    judgment: 'Trợn ngư cát — thành tín trong, lợi vượt sông lớn.',
    image: 'Trạch thượng hữu phong — quân tử nghị ngục hoãn tử.',
    lines: [
      'Sơ cửu: Ngu cát — yên tốt, có khác thì không yên.',
      'Cửu nhị: Minh hạc tại âm — hạc kêu trong bóng, con hòa; ta có rượu ngon, ta sẽ cùng uống.',
      'Lục tam: Đắc địch — được địch, hoặc trống hoặc thôi, hoặc khóc hoặc hát.',
      'Lục tứ: Nguyệt kỷ vọng — trăng gần đầy, ngựa đội mất, không lỗi.',
      'Cửu ngũ: Hữu phu loan như — thành tín gắn như, không lỗi.',
      'Thượng lục: Hàn âm đăng ư thiên — tiếng gà lên trời, chính xấu.',
    ],
    keywords: ['thành tín', 'cảm hóa', 'trung'],
    summary: 'Lòng thành cảm được cả vật nhỏ — xử án khoan.',
  },
  {
    number: 62,
    nameVi: 'Tiểu Quá',
    nameHan: '小過',
    judgment: '亨. Lợi trinh — hơi quá, lợi chính; nên nhỏ không nên lớn.',
    image: 'Sơn thượng hữu lôi — quân tử dĩ hành quá hồ cung.',
    lines: [
      'Sơ lục: Phi điểu dĩ hung — chim bay lấy hung.',
      'Lục nhị: Quá kỳ tổ — quá ông gặp bà; không đến vua gặp thần, không lỗi.',
      'Cửu tam: Phất quá phòng chi — đừng quá phòng nó, theo chọc nó, xấu.',
      'Cửu tứ: Vô cữu — không lỗi, đừng quá gặp nó; đi nguy phải thận trọng, đừng dùng vĩnh viễn.',
      'Lục ngũ: Mật vân bất vũ — mây dày không mưa từ ta Tây郊; công bắn lấy cái ở hang.',
      'Thượng lục: Phất ngộ quá chi — không gặp mà quá nó; chim bay hung, ấy tai họa.',
    ],
    keywords: ['khiêm hạnh', 'việc nhỏ', 'thận trọng'],
    summary: 'Hơi quá về phía khiêm — làm việc nhỏ cho chắc.',
  },
  {
    number: 63,
    nameVi: 'Ký Tế',
    nameHan: '既濟',
    judgment: '亨 tiểu lợi trinh — đã qua sông, nhỏ thông; đầu tốt cuối loạn.',
    image: 'Thủy tại hỏa thượng — quân tử tư hoạn nhi dự phòng.',
    lines: [
      'Sơ cửu: Duệ kỳ luân — kéo bánh xe, ướt đuôi, không lỗi.',
      'Lục nhị: Phụ táng kỳ phất — vợ mất mành, đừng đuổi bảy ngày được.',
      'Cửu tam: Cao Tông phạt Quỷ Phương — ba năm thắng, đừng dùng tiểu nhân.',
      'Lục tứ: Du hữu y — có áo rách, cả ngày cảnh giác.',
      'Cửu ngũ: Đông lân sát ngưu — láng giềng đông giết bò không bằng Tây tế nhỏ, thật nhận phúc.',
      'Thượng lục: Nhu kỳ thủ — ướt đầu, nguy.',
    ],
    keywords: ['hoàn thành', 'phòng bị', 'đừng chủ quan'],
    summary: 'Đã thành vẫn đề phòng — đầu xuôi chưa chắc cuối thuận.',
  },
  {
    number: 64,
    nameVi: 'Vị Tế',
    nameHan: '未濟',
    judgment: '亨. Tiểu hồ nhu vĩ — chưa qua sông; cáo nhỏ ướt đuôi, không lợi.',
    image: 'Hỏa tại thủy thượng — quân tử thận biện vật cư phương.',
    lines: [
      'Sơ lục: Nhu kỳ vĩ — ướt đuôi, tiếc.',
      'Cửu nhị: Duệ kỳ luân — kéo bánh, chính tốt.',
      'Lục tam: Vị tế chinh xấu — chưa tế chinh xấu, lợi vượt sông lớn.',
      'Cửu tứ: Trinh cát hối vong — chính tốt hết hối; chấn dùng phạt Quỷ Phương, ba năm có thưởng lớn nước.',
      'Lục ngũ: Trinh cát vô hối — chính tốt không hối; quân tử chi quang có đức tin tốt.',
      'Thượng cửu: Hữu phu ư ẩm tửu — có tin nơi uống rượu, không lỗi; ướt đầu có tin mất đúng.',
    ],
    keywords: ['chưa xong', 'thận trọng', 'hy vọng'],
    summary: 'Chưa hoàn tất — thận trọng phân biệt rồi mới tiến.',
  },
];


function trigramsFromBinary(binary: string): { lower: TrigramId; upper: TrigramId } {
  const bits = binary.split('').map((c) => Number(c));
  const lower = TRIGRAM_BY_BITS.get(bits.slice(0, 3).join('')) ?? 'khon';
  const upper = TRIGRAM_BY_BITS.get(bits.slice(3, 6).join('')) ?? 'khon';
  return { lower, upper };
}

function buildAllHexagrams(): Hexagram[] {
  const byNumber = new Map<number, Hexagram>();
  for (const [binary, number] of Object.entries(BINARY_TO_NUMBER)) {
    const meta = HEX_META.find((h) => h.number === number);
    if (!meta) continue;
    const { lower, upper } = trigramsFromBinary(binary);
    byNumber.set(number, {
      ...meta,
      upper,
      lower,
      binary,
      nameFull: composeNameFull(meta.nameVi, upper, lower),
      unicode: hexagramUnicode(number),
      meaning: HEX_MEANING[number] ?? meta.summary,
    });
  }
  return Array.from(byNumber.values()).sort((a, b) => a.number - b.number);
}

export const HEXAGRAMS: Hexagram[] = buildAllHexagrams();

const BY_NUMBER = new Map(HEXAGRAMS.map((h) => [h.number, h]));
const BY_BINARY = new Map(HEXAGRAMS.map((h) => [h.binary, h]));

export function getHexagram(n: number): Hexagram | undefined {
  return BY_NUMBER.get(n);
}

export function getHexagramByBinary(binary: string): Hexagram | undefined {
  return BY_BINARY.get(binary);
}

export function allHexagrams(): Hexagram[] {
  return HEXAGRAMS;
}

export function lineLabel(value: LineValue): string {
  if (value === 6) return 'Lão âm (động)';
  if (value === 7) return 'Thiếu dương';
  if (value === 8) return 'Thiếu âm';
  return 'Lão dương (động)';
}

export function isYangLine(value: LineValue): boolean {
  return value === 7 || value === 9;
}

export function isChangingLine(value: LineValue): boolean {
  return value === 6 || value === 9;
}

/** Gieo 1 hào bằng 3 đồng xu (ngửa=3, sấp=2). */
export function castLine(random = Math.random): CastLineResult {
  const coins: [boolean, boolean, boolean] = [
    random() >= 0.5,
    random() >= 0.5,
    random() >= 0.5,
  ];
  let sum = 0;
  for (const heads of coins) sum += heads ? 3 : 2;
  const value = sum as LineValue;
  return {
    value,
    coins,
    isYang: isYangLine(value),
    isChanging: isChangingLine(value),
    label: lineLabel(value),
  };
}

export function linesToBinary(lines: LineValue[]): string {
  return lines.map((v) => (isYangLine(v) ? '1' : '0')).join('');
}

export function changeLines(lines: LineValue[]): LineValue[] {
  return lines.map((v) => {
    if (v === 6) return 7; // lão âm → thiếu dương
    if (v === 9) return 8; // lão dương → thiếu âm
    return v;
  });
}

export function buildFromLines(lines: LineValue[]): CastResult {
  if (lines.length !== 6) {
    throw new Error('Cần đúng 6 hào.');
  }
  const castLines: CastLineResult[] = lines.map((value) => ({
    value,
    coins: [false, false, false],
    isYang: isYangLine(value),
    isChanging: isChangingLine(value),
    label: lineLabel(value),
  }));
  const primaryBin = linesToBinary(lines);
  const primary = BY_BINARY.get(primaryBin);
  if (!primary) {
    throw new Error(`Không tìm thấy quẻ cho ${primaryBin}`);
  }
  const changingIndexes = lines
    .map((v, i) => (isChangingLine(v) ? i : -1))
    .filter((i) => i >= 0);
  let secondary: Hexagram | null = null;
  if (changingIndexes.length > 0) {
    const secBin = linesToBinary(changeLines(lines) as LineValue[]);
    secondary = BY_BINARY.get(secBin) ?? null;
  }
  return {
    lines: castLines,
    primary,
    secondary,
    changingIndexes,
  };
}

export function castHexagram(random = Math.random): CastResult {
  const lines: LineValue[] = [];
  for (let i = 0; i < 6; i++) {
    lines.push(castLine(random).value);
  }
  return buildFromLines(lines);
}

export function buildQueContext(
  result: CastResult,
  intent?: { question?: string; dongTamAt?: string },
): string {
  const { primary, secondary, changingIndexes, lines } = result;
  const lineTexts = lines
    .map((l, i) => {
      const moving = l.isChanging ? ' [HÀO ĐỘNG]' : '';
      return `Hào ${i + 1} (${l.label})${moving}: ${primary.lines[i]}`;
    })
    .join('\n');

  const parts = [
    intent?.dongTamAt
      ? `Giờ động tâm (lúc khởi nghĩ / gieo): ${intent.dongTamAt}`
      : '',
    intent?.question?.trim()
      ? `Câu hỏi của Phật tử: ${intent.question.trim()}
(Luận quẻ phải bám sát câu hỏi này.)`
      : '',
    `Quẻ gốc: số ${primary.number} — ${primary.nameFull} (${primary.nameHan} ${primary.unicode})`,
    `Ý nghĩa: ${primary.meaning}`,
    `Thượng quái: ${TRIGRAMS[primary.upper].nameVi} (${TRIGRAMS[primary.upper].element} · ${TRIGRAMS[primary.upper].nature}) · Hạ quái: ${TRIGRAMS[primary.lower].nameVi} (${TRIGRAMS[primary.lower].element} · ${TRIGRAMS[primary.lower].nature})`,
    `Thoán từ: ${primary.judgment}`,
    `Đại tượng: ${primary.image}`,
    `Tóm tắt: ${primary.summary}`,
    `Từ khóa: ${primary.keywords.join(', ')}`,
    `Các hào (từ dưới lên):`,
    lineTexts,
  ].filter(Boolean);
  if (changingIndexes.length) {
    parts.push(
      `Hào động (từ dưới lên, số thứ tự 1–6): ${changingIndexes.map((i) => i + 1).join(', ')}`,
    );
  }
  if (secondary) {
    parts.push(
      `Quẻ biến: số ${secondary.number} — ${secondary.nameFull} (${secondary.nameHan} ${secondary.unicode})`,
      `Ý nghĩa biến: ${secondary.meaning}`,
      `Thoán biến: ${secondary.judgment}`,
      `Đại tượng biến: ${secondary.image}`,
      `Tóm tắt biến: ${secondary.summary}`,
    );
  } else {
    parts.push('Không có hào động — chỉ luận quẻ gốc.');
  }
  return parts.join('\n');
}
