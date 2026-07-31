/**
 * Lập lá số Bát tự Tứ trụ (Tử Bình) — lệnh bài đầy đủ:
 * - Tứ trụ: can chi, thập thần, tàng can (nhân nguyên), nạp âm,
 *   vòng trường sinh của nhật chủ, không vong (tuần không trụ ngày).
 * - Thai nguyên · mệnh cung · thân cung (theo lunar-typescript / 6tail).
 * - Khởi vận, 10 đại vận → lưu niên → lưu nguyệt (chuẩn tiết khí Tử Bình).
 * - Thần sát cổ điển tra theo can ngày / can năm / chi năm / chi ngày / chi tháng.
 * - Cân ngũ hành có trọng số tàng can + tóm tắt thân cường nhược, dụng thần.
 */

import { LunarUtil } from 'lunar-typescript';
import { viGanZhi, viTerm } from './lunar-zh-vi';
import {
  YEAR_DIVIDE_OPTIONS,
  buildIztroChart,
  type IztroChartInput,
  type YearDivideMethod,
} from './iztro-chart';
import {
  CAN_HANH,
  CHI_HANH,
  NAP_AM_MEANING,
  NGU_HANH_ORDER,
  baZiZhByDivide,
  lunarFromChartInput,
  type NguHanh,
} from './nap-am-ngu-hanh';
import {
  CAN_DUONG,
  TANG_CAN,
  buildDungThan,
  thapThanOf,
  type ThapThan,
} from './dung-than';

export type TruName = 'Năm' | 'Tháng' | 'Ngày' | 'Giờ';

const TRU_NAMES: TruName[] = ['Năm', 'Tháng', 'Ngày', 'Giờ'];

const CHI_ORDER = [
  'Tý', 'Sửu', 'Dần', 'Mão', 'Thìn', 'Tỵ',
  'Ngọ', 'Mùi', 'Thân', 'Dậu', 'Tuất', 'Hợi',
];

const GAN_ORDER = [
  'Giáp', 'Ất', 'Bính', 'Đinh', 'Mậu',
  'Kỷ', 'Canh', 'Tân', 'Nhâm', 'Quý',
];

/** 12 giai đoạn vòng trường sinh. */
const TRUONG_SINH_STAGES = [
  'Trường sinh', 'Mộc dục', 'Quan đới', 'Lâm quan', 'Đế vượng', 'Suy',
  'Bệnh', 'Tử', 'Mộ', 'Tuyệt', 'Thai', 'Dưỡng',
];

/** Chi khởi Trường sinh của từng can (dương thuận, âm nghịch). */
const TRUONG_SINH_START: Record<string, string> = {
  Giáp: 'Hợi', Ất: 'Ngọ',
  Bính: 'Dần', Đinh: 'Dậu',
  Mậu: 'Dần', Kỷ: 'Dậu',
  Canh: 'Tỵ', Tân: 'Tý',
  Nhâm: 'Thân', Quý: 'Mão',
};

/** Vòng trường sinh của can `gan` tại chi `chi`. */
export function truongSinhOf(gan: string, chi: string): string {
  const start = CHI_ORDER.indexOf(TRUONG_SINH_START[gan] ?? '');
  const target = CHI_ORDER.indexOf(chi);
  if (start < 0 || target < 0) return '';
  const forward = CAN_DUONG.includes(gan);
  const diff = forward
    ? (target - start + 12) % 12
    : (start - target + 12) % 12;
  return TRUONG_SINH_STAGES[diff];
}

/** Hai chi không vong (tuần không) của một can chi. */
export function khongVongOf(can: string, chi: string): [string, string] {
  const g = GAN_ORDER.indexOf(can);
  const z = CHI_ORDER.indexOf(chi);
  if (g < 0 || z < 0) return ['', ''];
  const base = (z - g + 12) % 12;
  return [CHI_ORDER[(base + 10) % 12], CHI_ORDER[(base + 11) % 12]];
}

// —— Thần sát cổ điển (bảng tra Uyên Hải Tử Bình phổ truyền) ——

const THIEN_AT_QUY_NHAN: Record<string, string[]> = {
  Giáp: ['Sửu', 'Mùi'], Mậu: ['Sửu', 'Mùi'], Canh: ['Sửu', 'Mùi'],
  Ất: ['Tý', 'Thân'], Kỷ: ['Tý', 'Thân'],
  Bính: ['Hợi', 'Dậu'], Đinh: ['Hợi', 'Dậu'],
  Tân: ['Ngọ', 'Dần'],
  Nhâm: ['Mão', 'Tỵ'], Quý: ['Mão', 'Tỵ'],
};

const LOC_THAN: Record<string, string> = {
  Giáp: 'Dần', Ất: 'Mão', Bính: 'Tỵ', Đinh: 'Ngọ', Mậu: 'Tỵ',
  Kỷ: 'Ngọ', Canh: 'Thân', Tân: 'Dậu', Nhâm: 'Hợi', Quý: 'Tý',
};

const DUONG_NHAN: Record<string, string> = {
  Giáp: 'Mão', Bính: 'Ngọ', Mậu: 'Ngọ', Canh: 'Dậu', Nhâm: 'Tý',
};

const VAN_XUONG: Record<string, string> = {
  Giáp: 'Tỵ', Ất: 'Ngọ', Bính: 'Thân', Đinh: 'Dậu', Mậu: 'Thân',
  Kỷ: 'Dậu', Canh: 'Hợi', Tân: 'Tý', Nhâm: 'Dần', Quý: 'Mão',
};

const KIM_DU: Record<string, string> = {
  Giáp: 'Thìn', Ất: 'Tỵ', Bính: 'Mùi', Đinh: 'Thân', Mậu: 'Mùi',
  Kỷ: 'Thân', Canh: 'Tuất', Tân: 'Hợi', Nhâm: 'Sửu', Quý: 'Dần',
};

/** Tra theo tam hợp cục của chi gốc (chi năm / chi ngày). */
function tamHopGroup(chi: string): 'than_ty_thin' | 'dan_ngo_tuat' | 'ty_dau_suu' | 'hoi_mao_mui' | null {
  if (['Thân', 'Tý', 'Thìn'].includes(chi)) return 'than_ty_thin';
  if (['Dần', 'Ngọ', 'Tuất'].includes(chi)) return 'dan_ngo_tuat';
  if (['Tỵ', 'Dậu', 'Sửu'].includes(chi)) return 'ty_dau_suu';
  if (['Hợi', 'Mão', 'Mùi'].includes(chi)) return 'hoi_mao_mui';
  return null;
}

const TAM_HOP_SAO: Record<string, Record<string, string>> = {
  'Đào Hoa': {
    than_ty_thin: 'Dậu', dan_ngo_tuat: 'Mão',
    ty_dau_suu: 'Ngọ', hoi_mao_mui: 'Tý',
  },
  'Dịch Mã': {
    than_ty_thin: 'Dần', dan_ngo_tuat: 'Thân',
    ty_dau_suu: 'Hợi', hoi_mao_mui: 'Tỵ',
  },
  'Hoa Cái': {
    than_ty_thin: 'Thìn', dan_ngo_tuat: 'Tuất',
    ty_dau_suu: 'Sửu', hoi_mao_mui: 'Mùi',
  },
  'Tướng Tinh': {
    than_ty_thin: 'Tý', dan_ngo_tuat: 'Ngọ',
    ty_dau_suu: 'Dậu', hoi_mao_mui: 'Mão',
  },
  'Kiếp Sát': {
    than_ty_thin: 'Tỵ', dan_ngo_tuat: 'Hợi',
    ty_dau_suu: 'Dần', hoi_mao_mui: 'Thân',
  },
};

/** Cô Thần / Quả Tú theo nhóm phương của chi năm. */
const CO_THAN_QUA_TU: Record<string, { coThan: string; quaTu: string }> = {
  Hợi: { coThan: 'Dần', quaTu: 'Tuất' },
  Tý: { coThan: 'Dần', quaTu: 'Tuất' },
  Sửu: { coThan: 'Dần', quaTu: 'Tuất' },
  Dần: { coThan: 'Tỵ', quaTu: 'Sửu' },
  Mão: { coThan: 'Tỵ', quaTu: 'Sửu' },
  Thìn: { coThan: 'Tỵ', quaTu: 'Sửu' },
  Tỵ: { coThan: 'Thân', quaTu: 'Thìn' },
  Ngọ: { coThan: 'Thân', quaTu: 'Thìn' },
  Mùi: { coThan: 'Thân', quaTu: 'Thìn' },
  Thân: { coThan: 'Hợi', quaTu: 'Mùi' },
  Dậu: { coThan: 'Hợi', quaTu: 'Mùi' },
  Tuất: { coThan: 'Hợi', quaTu: 'Mùi' },
};

/** Thiên Đức theo chi tháng → can hoặc chi. */
const THIEN_DUC: Record<string, string> = {
  Dần: 'Đinh', Mão: 'Thân', Thìn: 'Nhâm', Tỵ: 'Tân',
  Ngọ: 'Hợi', Mùi: 'Giáp', Thân: 'Quý', Dậu: 'Dần',
  Tuất: 'Bính', Hợi: 'Ất', Tý: 'Tỵ', Sửu: 'Canh',
};

/** Nguyệt Đức theo tam hợp chi tháng → can. */
const NGUYET_DUC: Record<string, string> = {
  dan_ngo_tuat: 'Bính', than_ty_thin: 'Nhâm',
  hoi_mao_mui: 'Giáp', ty_dau_suu: 'Canh',
};

export const THAN_SAT_MEANING: Record<string, string> = {
  'Thiên Ất Quý Nhân':
    'Sao quý nhân đứng đầu — đời gặp người nâng đỡ, hung hóa cát, nguy có cứu.',
  'Thiên Đức Quý Nhân':
    'Đức thần che chở, tâm lành phúc dày, hóa giải bớt hung tinh trong trụ.',
  'Nguyệt Đức Quý Nhân':
    'Phúc đức từ tổ ấm, tính tình nhân hậu, tai ách thường nhẹ đi.',
  'Lộc Thần':
    'Nơi nhật chủ đắc lộc — bổng lộc, ăn mặc, tự lực kiếm tài.',
  'Dương Nhẫn':
    'Khí vượng cực đoan, quyết liệt gan góc — tốt cho võ nghiệp, kỵ quá đà.',
  'Văn Xương':
    'Thông minh hiếu học, lợi văn chương, thi cử, giấy tờ.',
  'Đào Hoa':
    'Duyên dáng thu hút, lợi giao tế nghệ thuật — cần giữ nề nếp tình cảm.',
  'Dịch Mã':
    'Sao di chuyển — hay đi xa, thay đổi chỗ ở nghề nghiệp, hợp nghề xê dịch.',
  'Hoa Cái':
    'Cô cao thanh nhã, hợp học thuật, tôn giáo, huyền học; tính hướng nội.',
  'Tướng Tinh':
    'Khí lãnh đạo, cầm quyền giữ việc lớn, có uy với đám đông.',
  'Kiếp Sát':
    'Đề phòng hao tán, tranh đoạt, việc gấp gáp — nên tính kỹ trước khi làm.',
  'Cô Thần':
    'Thời trẻ dễ lẻ loi, hôn nhân nên chậm mà chắc (nam giới lưu ý hơn).',
  'Quả Tú':
    'Dễ cô quạnh, nên rộng giao thiệp, vun việc chung (nữ giới lưu ý hơn).',
  'Kim Dư':
    'Xe vàng — hưởng phú quý, được người phối ngẫu / khác giới trợ lực.',
};

export type BatTuThanSat = {
  name: string;
  /** Trụ có thần sát này. */
  viTri: TruName[];
  nghia: string;
};

export type BatTuTangCan = {
  can: string;
  hanh: NguHanh;
  thapThan: ThapThan;
};

export type BatTuPillar = {
  tru: TruName;
  canChi: string;
  can: string;
  chi: string;
  canHanh: NguHanh;
  chiHanh: NguHanh;
  /** Trụ ngày = "Nhật chủ". */
  thapThanCan: string;
  tangCan: BatTuTangCan[];
  napAm: string;
  napAmMeaning: string;
  /** Vòng trường sinh của nhật chủ tại chi trụ này. */
  truongSinh: string;
  /** Chi trụ rơi vào tuần không của trụ ngày. */
  isKhongVong: boolean;
};

export type BatTuLuuNguyet = {
  thang: number;
  label: string;
  canChi: string;
  can: string;
  chi: string;
  thapThan: string;
};

export type BatTuLuuNien = {
  year: number;
  /** Tuổi mụ. */
  age: number;
  canChi: string;
  can: string;
  chi: string;
  thapThanCan: string;
  napAm: string;
  luuNguyets: BatTuLuuNguyet[];
};

export type BatTuDaiVan = {
  index: number;
  startYear: number;
  endYear: number;
  startAge: number;
  endAge: number;
  /** Rỗng với giai đoạn trước khởi vận. */
  canChi: string;
  can: string;
  chi: string;
  thapThanCan: string;
  napAm: string;
  truongSinh: string;
  luuNiens: BatTuLuuNien[];
};

export type BatTuCuongNhuoc = {
  verdictLabel: string;
  verdictReason: string;
  lenhThang: string;
  mua: string;
  dungThan: NguHanh;
  dungThanNhom: string;
  hyThan: NguHanh[];
  kyThan: NguHanh[];
  dieuHau: string | null;
};

export type BatTuView = {
  fullName: string;
  gender: 'Nam' | 'Nữ' | string;
  solarDate: string;
  lunarDate: string;
  timeLabel: string;
  zodiac: string;
  yearDivideMethod: YearDivideMethod;
  yearDivideLabel: string;

  pillars: BatTuPillar[];
  nhatChu: string;
  nhatChuHanh: NguHanh;
  nhatChuAmDuong: 'dương' | 'âm';
  /** Hai chi tuần không của trụ ngày. */
  khongVong: [string, string];

  menhNapAm: string;
  thaiNguyen: string;
  thaiNguyenNapAm: string;
  menhCung: string;
  menhCungNapAm: string;
  thanCung: string;
  thanCungNapAm: string;

  /** Đếm thô ngũ hành trên 8 chữ. */
  counts: Record<NguHanh, number>;
  /** Phần trăm ngũ hành có trọng số tàng can. */
  percent: Record<NguHanh, number>;
  vuongNhat: NguHanh;
  khuyet: NguHanh[];

  thanSats: BatTuThanSat[];
  cuongNhuoc: BatTuCuongNhuoc;

  /** Khởi vận. */
  khoiVan: {
    years: number;
    months: number;
    days: number;
    solarDate: string;
    forward: boolean;
  };
  daiVans: BatTuDaiVan[];
  /** Index đại vận đang đi theo năm hiện tại (-1 nếu chưa vào vận). */
  currentDaiVanIndex: number;
  currentYear: number;
};

function napAmOfZh(zhGanZhi: string): string {
  const raw = (LunarUtil.NAYIN as Record<string, string>)[zhGanZhi] ?? '';
  return viTerm(raw);
}

function splitViGanZhi(canChi: string): [string, string] {
  const [can = '', chi = ''] = canChi.split(/\s+/);
  return [can, chi];
}

function pad2(n: number) {
  return String(n).padStart(2, '0');
}

/** Nhãn tháng âm 1–12: Giêng … Chạp. */
const THANG_LABELS = [
  'Giêng', 'Hai', 'Ba', 'Tư', 'Năm', 'Sáu',
  'Bảy', 'Tám', 'Chín', 'Mười', 'Một (11)', 'Chạp',
];

export function buildBatTu(input: IztroChartInput): BatTuView {
  const yearDivide = input.yearDivide ?? 'tiet_khi';
  const divideOpt =
    YEAR_DIVIDE_OPTIONS.find((o) => o.id === yearDivide) ??
    YEAR_DIVIDE_OPTIONS[1];

  const lunar = lunarFromChartInput(input);
  const baZiZh = baZiZhByDivide(lunar, yearDivide);
  const baZiVi = baZiZh.map(viGanZhi);

  const nhatChu = splitViGanZhi(baZiVi[2])[0];
  const nhatChuHanh = CAN_HANH[nhatChu] ?? 'Thổ';
  const [dayCan, dayChi] = splitViGanZhi(baZiVi[2]);
  const khongVong = khongVongOf(dayCan, dayChi);

  const pillars: BatTuPillar[] = TRU_NAMES.map((tru, i) => {
    const canChi = baZiVi[i] ?? '';
    const [can, chi] = splitViGanZhi(canChi);
    const napAm = napAmOfZh(baZiZh[i] ?? '');
    return {
      tru,
      canChi,
      can,
      chi,
      canHanh: CAN_HANH[can] ?? 'Thổ',
      chiHanh: CHI_HANH[chi] ?? 'Thổ',
      thapThanCan: tru === 'Ngày' ? 'Nhật chủ' : thapThanOf(nhatChu, can),
      tangCan: (TANG_CAN[chi] ?? []).map((tc) => ({
        can: tc,
        hanh: CAN_HANH[tc] ?? 'Thổ',
        thapThan: thapThanOf(nhatChu, tc),
      })),
      napAm,
      napAmMeaning: NAP_AM_MEANING[napAm] ?? '',
      truongSinh: truongSinhOf(nhatChu, chi),
      isKhongVong: khongVong.includes(chi),
    };
  });

  // —— Cân ngũ hành: can 1.0 · tàng can bản khí 0.7 / trung 0.4 / dư 0.2 ——
  const counts: Record<NguHanh, number> = {
    Kim: 0, Mộc: 0, Thủy: 0, Hỏa: 0, Thổ: 0,
  };
  const weighted: Record<NguHanh, number> = {
    Kim: 0, Mộc: 0, Thủy: 0, Hỏa: 0, Thổ: 0,
  };
  for (const p of pillars) {
    counts[p.canHanh] += 1;
    counts[p.chiHanh] += 1;
    weighted[p.canHanh] += 1;
    p.tangCan.forEach((tc, idx) => {
      weighted[tc.hanh] += idx === 0 ? 0.7 : idx === 1 ? 0.4 : 0.2;
    });
  }
  const totalWeight = NGU_HANH_ORDER.reduce((s, h) => s + weighted[h], 0) || 1;
  const percent = Object.fromEntries(
    NGU_HANH_ORDER.map((h) => [
      h,
      Math.round((weighted[h] / totalWeight) * 1000) / 10,
    ]),
  ) as Record<NguHanh, number>;
  const vuongNhat = [...NGU_HANH_ORDER].sort(
    (a, b) => weighted[b] - weighted[a],
  )[0];
  const khuyet = NGU_HANH_ORDER.filter((h) => counts[h] === 0);

  // —— Thần sát ——
  const yearGan = pillars[0].can;
  const yearChi = pillars[0].chi;
  const monthChi = pillars[1].chi;
  const thanSatMap = new Map<string, Set<TruName>>();
  const mark = (name: string, tru: TruName) => {
    if (!thanSatMap.has(name)) thanSatMap.set(name, new Set());
    thanSatMap.get(name)!.add(tru);
  };

  for (const p of pillars) {
    // Theo can ngày (và Thiên Ất xét thêm can năm)
    for (const gan of [dayCan, yearGan]) {
      if ((THIEN_AT_QUY_NHAN[gan] ?? []).includes(p.chi)) {
        mark('Thiên Ất Quý Nhân', p.tru);
      }
    }
    if (LOC_THAN[dayCan] === p.chi) mark('Lộc Thần', p.tru);
    if (DUONG_NHAN[dayCan] === p.chi) mark('Dương Nhẫn', p.tru);
    if (VAN_XUONG[dayCan] === p.chi) mark('Văn Xương', p.tru);
    if (KIM_DU[dayCan] === p.chi) mark('Kim Dư', p.tru);

    // Theo tam hợp chi năm và chi ngày
    for (const base of [yearChi, dayChi]) {
      const group = tamHopGroup(base);
      if (!group) continue;
      for (const [sao, table] of Object.entries(TAM_HOP_SAO)) {
        if (table[group] === p.chi) mark(sao, p.tru);
      }
    }

    // Cô Thần / Quả Tú theo chi năm
    const ctqt = CO_THAN_QUA_TU[yearChi];
    if (ctqt) {
      if (p.chi === ctqt.coThan) mark('Cô Thần', p.tru);
      if (p.chi === ctqt.quaTu) mark('Quả Tú', p.tru);
    }

    // Thiên Đức / Nguyệt Đức theo chi tháng (khớp can hoặc chi)
    const td = THIEN_DUC[monthChi];
    if (td && (p.can === td || p.chi === td)) {
      mark('Thiên Đức Quý Nhân', p.tru);
    }
    const mdGroup = tamHopGroup(monthChi);
    if (mdGroup && p.can === NGUYET_DUC[mdGroup]) {
      mark('Nguyệt Đức Quý Nhân', p.tru);
    }
  }

  const thanSats: BatTuThanSat[] = [...thanSatMap.entries()].map(
    ([name, set]) => ({
      name,
      viTri: TRU_NAMES.filter((t) => set.has(t)),
      nghia: THAN_SAT_MEANING[name] ?? '',
    }),
  );

  // —— Thai nguyên · mệnh cung · thân cung + vận trình (EightChar) ——
  const bazi = lunar.getEightChar();
  const thaiNguyen = viGanZhi(bazi.getTaiYuan());
  const thaiNguyenNapAm = viTerm(bazi.getTaiYuanNaYin());
  const menhCung = viGanZhi(bazi.getMingGong());
  const menhCungNapAm = viTerm(bazi.getMingGongNaYin());
  const thanCung = viGanZhi(bazi.getShenGong());
  const thanCungNapAm = viTerm(bazi.getShenGongNaYin());

  const yun = bazi.getYun(input.gender === 'nam' ? 1 : 0);
  const startSolar = yun.getStartSolar();
  const khoiVan = {
    years: yun.getStartYear(),
    months: yun.getStartMonth(),
    days: yun.getStartDay(),
    solarDate: `${pad2(startSolar.getDay())}/${pad2(startSolar.getMonth())}/${startSolar.getYear()}`,
    forward: yun.isForward(),
  };

  const currentYear = new Date().getFullYear();

  const daiVans: BatTuDaiVan[] = yun.getDaYun(10).map((dv) => {
    const zh = dv.getGanZhi();
    const canChi = zh ? viGanZhi(zh) : '';
    const [can, chi] = splitViGanZhi(canChi);
    const luuNiens: BatTuLuuNien[] = dv.getLiuNian(10).map((ln) => {
      const lnZh = ln.getGanZhi();
      const lnCanChi = viGanZhi(lnZh);
      const [lnCan, lnChi] = splitViGanZhi(lnCanChi);
      const luuNguyets: BatTuLuuNguyet[] = ln.getLiuYue().map((ly, mi) => {
        const lyCanChi = viGanZhi(ly.getGanZhi());
        const [lyCan, lyChi] = splitViGanZhi(lyCanChi);
        return {
          thang: mi + 1,
          label: THANG_LABELS[mi] ?? String(mi + 1),
          canChi: lyCanChi,
          can: lyCan,
          chi: lyChi,
          thapThan: lyCan ? thapThanOf(nhatChu, lyCan) : '',
        };
      });
      return {
        year: ln.getYear(),
        age: ln.getAge(),
        canChi: lnCanChi,
        can: lnCan,
        chi: lnChi,
        thapThanCan: lnCan ? thapThanOf(nhatChu, lnCan) : '',
        napAm: napAmOfZh(lnZh),
        luuNguyets,
      };
    });
    return {
      index: dv.getIndex(),
      startYear: dv.getStartYear(),
      endYear: dv.getEndYear(),
      startAge: dv.getStartAge(),
      endAge: dv.getEndAge(),
      canChi,
      can,
      chi,
      thapThanCan: can ? thapThanOf(nhatChu, can) : '',
      napAm: zh ? napAmOfZh(zh) : '',
      truongSinh: chi ? truongSinhOf(nhatChu, chi) : '',
      luuNiens,
    };
  });

  const currentDaiVanIndex = daiVans.findIndex(
    (dv) => currentYear >= dv.startYear && currentYear <= dv.endYear,
  );

  // —— Thân cường nhược + dụng thần (phép cân phổ thông đã có) ——
  const dt = buildDungThan(input);
  const cuongNhuoc: BatTuCuongNhuoc = {
    verdictLabel: dt.verdictLabel,
    verdictReason: dt.verdictReason,
    lenhThang: dt.lenhThang,
    mua: dt.mua,
    dungThan: dt.dungThan,
    dungThanNhom: dt.dungThanNhom,
    hyThan: dt.hyThan,
    kyThan: dt.kyThan,
    dieuHau: dt.dieuHau,
  };

  const chart = buildIztroChart(input);

  return {
    fullName: chart.fullName,
    gender: chart.gender,
    solarDate: chart.solarDate,
    lunarDate: chart.lunarDate,
    timeLabel: chart.time,
    zodiac: chart.zodiac,
    yearDivideMethod: divideOpt.id,
    yearDivideLabel: divideOpt.label,
    pillars,
    nhatChu,
    nhatChuHanh,
    nhatChuAmDuong: CAN_DUONG.includes(nhatChu) ? 'dương' : 'âm',
    khongVong,
    menhNapAm: pillars[0].napAm,
    thaiNguyen,
    thaiNguyenNapAm,
    menhCung,
    menhCungNapAm,
    thanCung,
    thanCungNapAm,
    counts,
    percent,
    vuongNhat,
    khuyet,
    thanSats,
    cuongNhuoc,
    khoiVan,
    daiVans,
    currentDaiVanIndex,
    currentYear,
  };
}

/** Ngữ cảnh gọn cho AI luận Bát tự (tứ trụ + vận trình + dụng thần). */
export function buildBatTuPromptContext(v: BatTuView): string {
  const currentDaiVan =
    v.currentDaiVanIndex >= 0 ? v.daiVans[v.currentDaiVanIndex] : null;
  const currentLuuNien = currentDaiVan?.luuNiens.find(
    (ln) => ln.year === v.currentYear,
  );

  const parts: string[] = [
    '# DỮ LIỆU LÁ SỐ BÁT TỰ TỨ TRỤ (TỬ BÌNH)',
    '',
    '## Người xem',
    `- Họ tên: ${v.fullName}`,
    `- Giới tính: ${v.gender}`,
    `- Sinh: dương ${v.solarDate} · âm ${v.lunarDate} · ${v.timeLabel} · tuổi ${v.zodiac}`,
    `- Cách chia năm: ${v.yearDivideLabel}`,
    '',
    '## Tứ trụ (can chi · thập thần · tàng can · nạp âm · trường sinh)',
    ...v.pillars.map(
      (p) =>
        `- Trụ ${p.tru}: ${p.canChi} — can ${p.can} (${p.canHanh}, ${p.thapThanCan}); chi ${p.chi} (${p.chiHanh}) tàng ${p.tangCan
          .map((tc) => `${tc.can} (${tc.hanh}, ${tc.thapThan})`)
          .join(' · ')}; nạp âm ${p.napAm}; trường sinh nhật chủ: ${p.truongSinh}${
          p.isKhongVong ? '; chi này rơi KHÔNG VONG' : ''
        }`,
    ),
    `- Không vong (tuần không trụ ngày): ${v.khongVong.join(', ')}`,
    '',
    '## Nhật chủ và cung mệnh phụ trợ',
    `- Nhật chủ: ${v.nhatChu} — ${v.nhatChuHanh} ${v.nhatChuAmDuong}`,
    `- Mệnh nạp âm (trụ năm): ${v.menhNapAm}`,
    `- Thai nguyên: ${v.thaiNguyen} (${v.thaiNguyenNapAm})`,
    `- Mệnh cung: ${v.menhCung} (${v.menhCungNapAm}) · Thân cung: ${v.thanCung} (${v.thanCungNapAm})`,
    '',
    '## Cân ngũ hành (trọng số: can 1 · tàng can 0.7/0.4/0.2)',
    ...NGU_HANH_ORDER.map(
      (h) => `- ${h}: ${v.counts[h]} chữ · ${v.percent[h]}%`,
    ),
    `- Vượng nhất: ${v.vuongNhat}${v.khuyet.length ? ` · Khuyết hẳn: ${v.khuyet.join(', ')}` : ' · Không khuyết hành nào'}`,
    '',
    '## Thân cường nhược · dụng thần (phép cân phổ thông)',
    `- ${v.cuongNhuoc.verdictLabel}. ${v.cuongNhuoc.verdictReason}`,
    `- Dụng thần: ${v.cuongNhuoc.dungThan} (${v.cuongNhuoc.dungThanNhom}) · Hỷ thần: ${v.cuongNhuoc.hyThan.join(', ') || '—'} · Kỵ thần: ${v.cuongNhuoc.kyThan.join(', ') || '—'}`,
    v.cuongNhuoc.dieuHau ? `- Điều hậu: ${v.cuongNhuoc.dieuHau}` : '',
    '',
    '## Thần sát',
    ...(v.thanSats.length
      ? v.thanSats.map(
          (ts) =>
            `- ${ts.name} (trụ ${ts.viTri.join(', ')}): ${ts.nghia}`,
        )
      : ['- Không nổi bật thần sát nào trong bảng tra.']),
    '',
    '## Khởi vận và đại vận',
    `- Khởi đại vận sau ${v.khoiVan.years} năm ${v.khoiVan.months} tháng ${v.khoiVan.days} ngày (khoảng ${v.khoiVan.solarDate}) · chiều ${v.khoiVan.forward ? 'thuận' : 'nghịch'}`,
    ...v.daiVans
      .filter((dv) => dv.canChi)
      .map(
        (dv) =>
          `- Đại vận ${dv.startYear}–${dv.endYear} (${dv.startAge}–${dv.endAge} tuổi): ${dv.canChi} — ${dv.thapThanCan} · nạp âm ${dv.napAm} · trường sinh ${dv.truongSinh}${
            dv.index === v.currentDaiVanIndex ? ' ← ĐANG ĐI' : ''
          }`,
      ),
  ];

  if (currentDaiVan && currentLuuNien) {
    parts.push(
      '',
      `## Lưu niên hiện tại (${v.currentYear})`,
      `- Năm ${currentLuuNien.year} (${currentLuuNien.age} tuổi mụ): ${currentLuuNien.canChi} — ${currentLuuNien.thapThanCan} · nạp âm ${currentLuuNien.napAm}`,
      `- Nằm trong đại vận ${currentDaiVan.canChi} (${currentDaiVan.startYear}–${currentDaiVan.endYear})`,
    );
  }

  parts.push(
    '',
    '## Ghi chú phương pháp',
    '- Tứ trụ theo lịch pháp can chi; tháng theo tiết khí; ngày đổi lúc giờ Tý. Đại vận – lưu niên – lưu nguyệt luôn tính theo tiết khí (chuẩn Tử Bình).',
    '- Thân cường nhược cân theo phép phổ thông (lệnh tháng + trọng số tàng can); cách cục đặc biệt (tòng, hóa khí…) cần thầy xem trực tiếp.',
  );

  return parts.filter(Boolean).join('\n');
}
