import baseSyllables from '@/data/hanviet-syllables.json';

/**
 * Từ điển âm tiết Việt → chữ Hán/Nôm.
 * Nền: hanviet-syllables.json (~2100 âm từ wordlist HV).
 * CURATED ghi đè (họ/tên phổ biến chính xác hơn).
 * Âm không có trong bảng giữ nguyên Latin → gọi AI bổ sung.
 */
const CURATED: Record<string, string> = {
  // Họ
  nguyễn: '阮',
  nguyen: '阮',
  trần: '陳',
  tran: '陳',
  lê: '黎',
  le: '黎',
  phạm: '范',
  pham: '范',
  hoàng: '黃',
  hoang: '黃',
  huỳnh: '黃',
  huynh: '黃',
  phan: '潘',
  vũ: '武',
  vu: '武',
  võ: '武',
  vo: '武',
  đăng: '鄧',
  dang: '鄧',
  bùi: '裴',
  bui: '裴',
  đỗ: '杜',
  hồ: '胡',
  ho: '胡',
  ngô: '吳',
  ngo: '吳',
  dương: '楊',
  duong: '楊',
  lý: '李',
  ly: '李',
  đào: '陶',
  dao: '陶',
  đoạn: '段',
  doan: '段',
  trương: '張',
  truong: '張',
  lương: '梁',
  luong: '梁',
  tô: '蘇',
  to: '蘇',
  tạ: '謝',
  ta: '謝',
  cao: '高',
  châu: '周',
  chau: '周',
  chu: '朱',
  hà: '何',
  ha: '何',
  kiều: '喬',
  kieu: '喬',
  lâm: '林',
  lam: '林',
  liêu: '廖',
  lieu: '廖',
  lữ: '呂',
  vương: '王',
  vuong: '王',
  quách: '郭',
  quach: '郭',
  ung: '雍',
  mai: '梅',

  // Đệm / đạo đức
  văn: '文',
  van: '文',
  trịnh: '鄭',
  trinh: '鄭',
  cương: '剛',
  cuong: '剛',
  cường: '強',
  hội: '會',
  hoi: '會',
  xá: '舍',
  xa: '舍',
  ninh: '寧',
  thị: '氏',
  thi: '氏',
  đức: '德',
  duc: '德',
  đình: '廷',
  dinh: '廷',
  công: '公',
  cong: '公',
  quang: '光',
  quốc: '國',
  quoc: '國',
  thế: '世',
  the: '世',
  xuân: '春',
  xuan: '春',
  duy: '維',
  đạt: '達',
  dat: '達',
  đại: '大',
  dai: '大',
  đông: '東',
  dong: '東',
  gia: '家',
  hải: '海',
  hai: '海',
  hữu: '友',
  huu: '友',
  khánh: '慶',
  khanh: '慶',
  kim: '金',
  minh: '明',
  nhật: '日',
  nhat: '日',
  nhất: '一',
  phúc: '福',
  phuc: '福',
  sinh: '生',
  tâm: '心',
  thanh: '清',
  thành: '成',
  thiện: '善',
  thien: '善',
  thiên: '天',
  trời: '天',
  troi: '天',
  thịnh: '盛',
  thinh: '盛',
  thúy: '翠',
  thuy: '翠',
  thủy: '水',
  tiến: '進',
  tien: '進',
  tín: '信',
  tin: '信',
  toàn: '全',
  toan: '全',
  trọng: '重',
  trong: '重',
  trung: '忠',
  trường: '長',
  tú: '秀',
  tu: '秀',
  tuệ: '慧',
  tue: '慧',
  tường: '祥',
  tuong: '祥',
  vĩnh: '永',
  vinh: '永',
  xương: '昌',
  xuong: '昌',
  nguyên: '元',
  như: '如',
  nhu: '如',
  thủ: '守',
  thu: '秋',
  thúc: '叔',
  thuc: '叔',
  tôn: '尊',
  ton: '尊',
  uy: '威',

  // Tên thường gặp
  anh: '英',
  an: '安',
  bảo: '寶',
  bao: '寶',
  bình: '平',
  binh: '平',
  chi: '枝',
  chung: '鍾',
  cúc: '菊',
  cuc: '菊',
  dung: '容',
  dũng: '勇',
  giang: '江',
  hạnh: '幸',
  hanh: '幸',
  hiếu: '孝',
  hieu: '孝',
  hoa: '花',
  hoài: '懷',
  hoai: '懷',
  hoan: '歡',
  hồng: '紅',
  hong: '紅',
  hùng: '雄',
  hung: '雄',
  hương: '香',
  huong: '香',
  hưng: '興',
  huy: '輝',
  huyền: '玄',
  huyen: '玄',
  khang: '康',
  khoa: '科',
  khôi: '魁',
  khoi: '魁',
  lan: '蘭',
  liên: '蓮',
  lien: '蓮',
  linh: '玲',
  loan: '鸞',
  long: '龍',
  lộc: '祿',
  loc: '祿',
  mỹ: '美',
  my: '美',
  nam: '南',
  nga: '娥',
  ngân: '銀',
  ngan: '銀',
  nghi: '儀',
  nghĩa: '義',
  nghia: '義',
  ngọc: '玉',
  ngoc: '玉',
  nhân: '仁',
  nhan: '仁',
  nhi: '兒',
  nhung: '絨',
  oanh: '鶯',
  phú: '富',
  phu: '富',
  phương: '芳',
  phuong: '芳',
  quân: '軍',
  quan: '觀',
  quý: '貴',
  quy: '貴',
  quyết: '決',
  quyet: '決',
  sang: '創',
  sơn: '山',
  son: '山',
  tài: '財',
  tai: '財',
  tân: '新',
  tan: '新',
  tây: '西',
  tay: '西',
  thắng: '勝',
  thang: '勝',
  thảo: '草',
  thao: '草',
  thông: '通',
  thong: '通',
  thuận: '順',
  thuan: '順',
  thức: '識',
  thương: '商',
  thuong: '商',
  tiệp: '捷',
  tiep: '捷',
  tinh: '精',
  trà: '茶',
  tra: '茶',
  trang: '妝',
  trí: '智',
  tri: '智',
  triều: '朝',
  trieu: '朝',
  triết: '哲',
  triet: '哲',
  trúc: '竹',
  truc: '竹',
  tuyết: '雪',
  tuyet: '雪',
  tư: '思',
  uyên: '淵',
  uyen: '淵',
  vân: '雲',
  vi: '微',
  việt: '越',
  viet: '越',
  vy: '薇',
  yến: '燕',
  yen: '燕',
  yên: '安',

  // Số / lịch
  nhì: '二',
  tam: '三',
  tứ: '四',
  ngũ: '五',
  ngu: '五',
  lục: '六',
  luc: '六',
  thất: '七',
  that: '七',
  bát: '八',
  bat: '八',
  cửu: '九',
  cuu: '九',
  thập: '十',
  thap: '十',
  niên: '年',
  nien: '年',
  nguyệt: '月',
  nguyet: '月',
  tuổi: '歲',
  tuoi: '歲',

  // Phật giáo / sớ
  phật: '佛',
  phat: '佛',
  bồ: '菩',
  bo: '菩',
  tát: '薩',
  tat: '薩',
  âm: '音',
  am: '音',
  giới: '界',
  gioi: '界',
  chùa: '寺',
  chua: '寺',
  tăng: '僧',
  tang: '僧',
  ni: '尼',
  sư: '師',
  su: '師',
  thầy: '師',
  thay: '師',
  pháp: '法',
  phap: '法',
  danh: '名',
  kinh: '經',
  chú: '呪',
  sớ: '疏',
  so: '疏',
  lễ: '禮',
  cúng: '供',
  cung: '供',
  đàn: '壇',
  dan: '壇',
  cầu: '求',
  cau: '求',
  lạc: '樂',
  lac: '樂',
  thái: '泰',
  thai: '泰',
  hòa: '和',
  do: '陶',
  lu: '呂',
  // Địa danh / địa chỉ / xung hô hay gặp trên sớ
  nội: '內',
  noi: '內',
  cừ: '渠',
  đề: '提',
  de: '提',
  phi: '飛',
  chúc: '祝',
  chuc: '祝',
  // mừng (chúc mừng) ≠ mùng (mùng một âm lịch)
  mừng: '慶',
  mùng: '初',
  mung: '慶',
  một: '一',
  mot: '一',
  con: '子',
  phố: '街',
  pho: '街',
  đường: '路',
  ngõ: '巷',
  số: '數',
  phường: '坊',
  huyện: '縣',
  tỉnh: '省',
  xã: '社',
  thôn: '村',
};

const HAN_SYLLABLES: Record<string, string> = {
  ...(baseSyllables as Record<string, string>),
  ...CURATED,
};

const DIGIT_HAN = '〇一二三四五六七八九';

/** Số Ả Rập → chữ số Hán (1999 → 一九九九). */
export function arabicToHanDigits(input: string): string {
  return [...input]
    .map((ch) => {
      if (ch >= '0' && ch <= '9') return DIGIT_HAN[Number(ch)]!;
      return ch;
    })
    .join('');
}

/** Còn ký tự Latin / số Ả Rập chưa chuyển hết sang Hán-Nôm. */
export function hasLatinResidue(text: string): boolean {
  return /[A-Za-zÀ-ỹ]|[0-9]/.test(text);
}

/** Bỏ dấu thanh (giữ ơ/ư/ă/â/ê/ô) để tra cứu gần đúng khi gõ lệch dấu. */
function stripToneMarks(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'd');
}

/** Âm hay gõ lệch dấu → chữ ưu tiên (khi không khớp exact). */
const TONE_FALLBACK: Record<string, string> = {
  mung: '慶', // mừng / mùng (ngoài lịch) — mùng lịch đã có exact → 初
  chuc: '祝',
  phuc: '福',
  mot: '一',
  moi: '每',
  noi: '內',
  de: '提',
  cu: '渠',
  ha: '河',
  bo: '菩',
  tat: '薩',
  troi: '天',
  thien: '天',
};

let toneIndex: Map<string, string> | null = null;

function getToneIndex(): Map<string, string> {
  if (toneIndex) return toneIndex;
  toneIndex = new Map();
  for (const [syl, han] of Object.entries(HAN_SYLLABLES)) {
    const bare = stripToneMarks(syl);
    if (!toneIndex.has(bare)) toneIndex.set(bare, han);
  }
  for (const [bare, han] of Object.entries(TONE_FALLBACK)) {
    toneIndex.set(bare, han);
  }
  return toneIndex;
}

function lookupSyllable(syl: string): string | null {
  const key = syl.toLowerCase();
  const exact = HAN_SYLLABLES[key];
  if (exact) return exact;
  const bare = stripToneMarks(key);
  return getToneIndex().get(bare) ?? TONE_FALLBACK[bare] ?? null;
}

/**
 * Chuyển tên / địa chỉ Quốc ngữ → chuỗi Hán (không khoảng trắng).
 * Âm không có trong từ điển giữ nguyên Latin.
 */
export function toHanName(quocNgu: string): string {
  return toHanGlyphs(quocNgu).join('');
}

/**
 * Tách theo âm tiết → mỗi phần một glyph Hán (hoặc cả âm Latin nếu chưa có trong từ điển).
 * Dùng để xếp cột dọc: 1 ô = 1 âm/1 chữ Hán, không tách từng chữ cái Latin.
 */
export function toHanGlyphs(quocNgu: string): string[] {
  if (!quocNgu.trim()) return [];
  const parts: string[] = [];
  for (const raw of quocNgu.trim().split(/[\s、,;./\\-]+/)) {
    const syl = raw.trim();
    if (!syl) continue;

    if (/^\d+$/.test(syl)) {
      parts.push(...Array.from(arabicToHanDigits(syl)));
      continue;
    }

    // "12A" → 一二 + A
    if (/^\d+[A-Za-zÀ-ỹ]*$/.test(syl) || /^[A-Za-zÀ-ỹ]*\d+$/.test(syl)) {
      const digits = syl.replace(/[^\d]/g, '');
      const letters = syl.replace(/\d/g, '');
      if (digits) parts.push(...Array.from(arabicToHanDigits(digits)));
      if (letters) {
        const han = lookupSyllable(letters);
        if (han) parts.push(...Array.from(han));
        else parts.push(letters);
      }
      continue;
    }

    const han = lookupSyllable(syl);
    if (han) {
      parts.push(...Array.from(han));
    } else if (/^[\u4e00-\u9fff\u3400-\u4dbf]+$/.test(syl)) {
      parts.push(...Array.from(syl));
    } else {
      parts.push(syl);
    }
  }
  return parts;
}
