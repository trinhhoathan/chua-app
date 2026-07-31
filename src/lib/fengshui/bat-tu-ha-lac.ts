/**
 * Bát tự Hà Lạc (Hà Lạc lý số): đổi can chi tứ trụ thành số,
 * cộng thiên số – địa số, hóa quẻ Tiên thiên / Hậu thiên và hào nguyên đường.
 *
 * Phép lấy số theo ca quyết cổ:
 * - Thiên can (số Lạc thư): Nhâm Giáp 6 · Ất Quý 2 · Bính 8 · Đinh 7 · Mậu 1 · Kỷ 9 · Canh 3 · Tân 4.
 * - Địa chi (số Hà Đồ, mỗi chi một cặp lẻ–chẵn): Hợi Tý 1·6, Dần Mão 3·8, Tỵ Ngọ 2·7, Thân Dậu 4·9, Thìn Tuất Sửu Mùi 5·10.
 * - Cộng mọi số lẻ thành thiên số, mọi số chẵn thành địa số; thiên số trừ 25, địa số trừ 30 (hoặc bội), lấy dư hóa quẻ theo Lạc thư
 *   (1 Khảm · 2 Khôn · 3 Chấn · 4 Tốn · 6 Càn · 7 Đoài · 8 Cấn · 9 Ly; số 5 ký cung: nam Cấn, nữ Khôn).
 * - Dương nam / âm nữ: quẻ thiên số đặt trên, quẻ địa số đặt dưới; âm nam / dương nữ thì ngược lại.
 */

import {
  YEAR_DIVIDE_OPTIONS,
  buildIztroChart,
  type IztroChartInput,
} from './iztro-chart';
import {
  baZiZhByDivide,
  lunarFromChartInput,
} from './nap-am-ngu-hanh';
import { viGanZhi } from './lunar-zh-vi';
import {
  TRIGRAMS,
  getHexagramByBinary,
  type Hexagram,
  type TrigramId,
} from './kinh-dich-64';

/** Số Lạc thư của thiên can. */
const CAN_SO: Record<string, number> = {
  Giáp: 6, Ất: 2, Bính: 8, Đinh: 7, Mậu: 1,
  Kỷ: 9, Canh: 3, Tân: 4, Nhâm: 6, Quý: 2,
};

/** Cặp số Hà Đồ của địa chi (một lẻ, một chẵn). */
const CHI_SO: Record<string, [number, number]> = {
  Tý: [1, 6], Sửu: [5, 10], Dần: [3, 8], Mão: [3, 8],
  Thìn: [5, 10], Tỵ: [2, 7], Ngọ: [2, 7], Mùi: [5, 10],
  Thân: [4, 9], Dậu: [4, 9], Tuất: [5, 10], Hợi: [1, 6],
};

const QUAI_BY_SO: Record<number, TrigramId> = {
  1: 'kham', 2: 'khon', 3: 'chan', 4: 'ton',
  6: 'can', 7: 'doai', 8: 'gen', 9: 'ly',
};

const CAN_DUONG = ['Giáp', 'Bính', 'Mậu', 'Canh', 'Nhâm'];

const CHI_VI = [
  'Tý', 'Sửu', 'Dần', 'Mão', 'Thìn', 'Tỵ', 'Ngọ', 'Mùi', 'Thân', 'Dậu',
  'Tuất', 'Hợi',
] as const;

export type HaLacTru = {
  tru: 'Năm' | 'Tháng' | 'Ngày' | 'Giờ';
  canChi: string;
  can: string;
  chi: string;
  canSo: number;
  chiSo: [number, number];
};

export type HaLacView = {
  fullName: string;
  gender: string;
  genderKey: 'nam' | 'nu';
  solarDate: string;
  lunarDate: string;
  timeLabel: string;
  yearDivideLabel: string;
  trus: HaLacTru[];
  thienSo: number;
  diaSo: number;
  thienQuaiSo: number;
  diaQuaiSo: number;
  kyCungNote: string | null;
  /** Dương nam / Âm nam / Dương nữ / Âm nữ (theo can năm). */
  amDuongLabel: string;
  /** Quẻ thiên số đặt trên hay dưới. */
  thienTrenLabel: string;
  tienThien: Hexagram;
  hauThien: Hexagram;
  nguyenDuong: {
    position: number; // 1–6 từ dưới lên
    isYang: boolean;
    lineText: string;
    gioLabel: string;
  };
};

function reduceQuaiSo(total: number, base: 25 | 30): number {
  let r = total % base;
  if (r === 0) r = base;
  if (r >= 10) {
    const units = r % 10;
    r = units === 0 ? Math.floor(r / 10) : units;
  }
  return r;
}

function trigramOfSo(so: number, gender: 'nam' | 'nu'): {
  id: TrigramId;
  kyCung: boolean;
} {
  if (so === 5) {
    return { id: gender === 'nam' ? 'gen' : 'khon', kyCung: true };
  }
  return { id: QUAI_BY_SO[so], kyCung: false };
}

function hexFromTrigrams(upper: TrigramId, lower: TrigramId): Hexagram {
  const binary = [...TRIGRAMS[lower].bits, ...TRIGRAMS[upper].bits].join('');
  const hex = getHexagramByBinary(binary);
  if (!hex) throw new Error(`Không tìm được quẻ ${lower}/${upper}`);
  return hex;
}

const TRU_NAMES: HaLacTru['tru'][] = ['Năm', 'Tháng', 'Ngày', 'Giờ'];

export function buildBatTuHaLac(input: IztroChartInput): HaLacView {
  const yearDivide = input.yearDivide ?? 'nong_lich';
  const divideOpt =
    YEAR_DIVIDE_OPTIONS.find((o) => o.id === yearDivide) ??
    YEAR_DIVIDE_OPTIONS[0];

  const lunar = lunarFromChartInput(input);
  const baZiZh = baZiZhByDivide(lunar, yearDivide);
  const baZi = baZiZh.map(viGanZhi);

  const trus: HaLacTru[] = TRU_NAMES.map((tru, i) => {
    const canChi = baZi[i] ?? '';
    const [can = '', chi = ''] = canChi.split(/\s+/);
    return {
      tru,
      canChi,
      can,
      chi,
      canSo: CAN_SO[can] ?? 0,
      chiSo: CHI_SO[chi] ?? [0, 0],
    };
  });

  const allNumbers = trus.flatMap((t) => [t.canSo, ...t.chiSo]);
  const thienSo = allNumbers
    .filter((n) => n % 2 === 1)
    .reduce((a, b) => a + b, 0);
  const diaSo = allNumbers
    .filter((n) => n % 2 === 0)
    .reduce((a, b) => a + b, 0);

  const thienQuaiSo = reduceQuaiSo(thienSo, 25);
  const diaQuaiSo = reduceQuaiSo(diaSo, 30);

  const thienTri = trigramOfSo(thienQuaiSo, input.gender);
  const diaTri = trigramOfSo(diaQuaiSo, input.gender);
  const kyCungNote =
    thienTri.kyCung || diaTri.kyCung
      ? 'Quái số 5 không có quẻ riêng, theo phép ký cung phổ thông: nam gửi Cấn, nữ gửi Khôn.'
      : null;

  const canNam = trus[0].can;
  const namDuong = CAN_DUONG.includes(canNam);
  const isNam = input.gender === 'nam';
  const amDuongLabel = `${namDuong ? 'Dương' : 'Âm'} ${isNam ? 'nam' : 'nữ'}`;
  // Dương nam / âm nữ: thiên trên địa dưới; âm nam / dương nữ: địa trên thiên dưới.
  const thienTren = namDuong === isNam;

  const tienThien = thienTren
    ? hexFromTrigrams(thienTri.id, diaTri.id)
    : hexFromTrigrams(diaTri.id, thienTri.id);

  // Nguyên đường theo giờ sinh: giờ dương (Tý–Tỵ) đếm hào dương trước,
  // giờ âm (Ngọ–Hợi) đếm hào âm trước; thiếu thì đếm tiếp loại kia (từ dưới lên).
  const chiIdx = input.timeIndex % 12;
  const gioDuong = chiIdx <= 5;
  const gioPos = gioDuong ? chiIdx + 1 : chiIdx - 5;
  const bits = tienThien.binary.split('').map(Number);
  const yangPos: number[] = [];
  const yinPos: number[] = [];
  bits.forEach((b, i) => (b === 1 ? yangPos : yinPos).push(i + 1));
  const sequence = gioDuong ? [...yangPos, ...yinPos] : [...yinPos, ...yangPos];
  const nguyenDuongPos = sequence[(gioPos - 1) % 6];

  // Hậu thiên: biến hào nguyên đường rồi đảo thượng – hạ quái.
  const flipped = bits.map((b, i) => (i + 1 === nguyenDuongPos ? 1 - b : b));
  const swapped = [...flipped.slice(3, 6), ...flipped.slice(0, 3)];
  const hauThien = getHexagramByBinary(swapped.join(''));
  if (!hauThien) throw new Error('Không lập được quẻ hậu thiên.');

  const chart = buildIztroChart(input);

  return {
    fullName: chart.fullName,
    gender: chart.gender,
    genderKey: input.gender,
    solarDate: chart.solarDate,
    lunarDate: chart.lunarDate,
    timeLabel: chart.time,
    yearDivideLabel: divideOpt.label,
    trus,
    thienSo,
    diaSo,
    thienQuaiSo,
    diaQuaiSo,
    kyCungNote,
    amDuongLabel,
    thienTrenLabel: thienTren
      ? 'quẻ thiên số đặt trên, quẻ địa số đặt dưới'
      : 'quẻ địa số đặt trên, quẻ thiên số đặt dưới',
    tienThien,
    hauThien,
    nguyenDuong: {
      position: nguyenDuongPos,
      isYang: bits[nguyenDuongPos - 1] === 1,
      lineText: tienThien.lines[nguyenDuongPos - 1] ?? '',
      gioLabel: `Giờ ${CHI_VI[chiIdx]} (giờ ${gioDuong ? 'dương' : 'âm'} thứ ${gioPos})`,
    },
  };
}

/** Ngữ cảnh gọn cho AI luận Bát tự Hà Lạc. */
export function buildHaLacPromptContext(v: HaLacView): string {
  const hexBlock = (label: string, h: Hexagram, detail: boolean) =>
    [
      `## ${label}`,
      `- Quẻ: ${h.unicode} ${h.nameFull} (quẻ số ${h.number}, ${h.nameHan})`,
      `- Ý nghĩa: ${h.meaning}`,
      `- Thoán từ: ${h.judgment}`,
      detail ? `- Đại tượng: ${h.image}` : '',
      detail ? `- Tóm lược: ${h.summary}` : '',
    ].filter(Boolean);

  const parts: string[] = [
    '# DỮ LIỆU BÁT TỰ HÀ LẠC',
    '',
    '## Người xem',
    `- Họ tên: ${v.fullName}`,
    `- Giới tính: ${v.gender} — ${v.amDuongLabel} (theo can năm)`,
    `- Sinh: dương ${v.solarDate} · âm ${v.lunarDate} · ${v.timeLabel}`,
    `- Cách chia năm: ${v.yearDivideLabel}`,
    '',
    '## Tứ trụ và số Hà Lạc (can theo Lạc thư, chi theo Hà Đồ)',
    ...v.trus.map(
      (t) =>
        `- Trụ ${t.tru}: ${t.canChi} — can ${t.can} số ${t.canSo}; chi ${t.chi} số ${t.chiSo[0]} · ${t.chiSo[1]}`,
    ),
    '',
    '## Thiên số · địa số',
    `- Thiên số (tổng số lẻ): ${v.thienSo} → trừ 25 (hoặc bội) còn quái số ${v.thienQuaiSo}`,
    `- Địa số (tổng số chẵn): ${v.diaSo} → trừ 30 (hoặc bội) còn quái số ${v.diaQuaiSo}`,
    `- ${v.amDuongLabel}: ${v.thienTrenLabel}.`,
    v.kyCungNote ? `- ${v.kyCungNote}` : '',
    '',
    ...hexBlock('Quẻ Tiên thiên (nửa đời trước)', v.tienThien, true),
    '',
    '## Hào nguyên đường (chỗ đứng của mệnh chủ trong quẻ tiên thiên)',
    `- ${v.nguyenDuong.gioLabel} → nguyên đường tại hào ${v.nguyenDuong.position} (${v.nguyenDuong.isYang ? 'hào dương' : 'hào âm'})`,
    `- Lời hào: ${v.nguyenDuong.lineText}`,
    '',
    ...hexBlock(
      'Quẻ Hậu thiên (nửa đời sau — biến hào nguyên đường, đảo thượng hạ quái)',
      v.hauThien,
      false,
    ),
    '',
    '## Ghi chú phương pháp',
    '- Lập theo phép Hà Lạc lý số phổ thông; đại vận từng hào (dương 9 năm, âm 6 năm) chưa lập ở đây — không tự bịa số năm khi luận.',
  ];

  return parts.filter(Boolean).join('\n');
}
