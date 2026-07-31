/**
 * Tìm dụng thần theo Bát tự (phép cân cường nhược phổ thông):
 * - Lệnh tháng: vượng – tướng – hưu – tù – tử của nhật chủ theo mùa sinh.
 * - Cân lực: sinh trợ (tỷ kiếp + ấn) vs khắc – tiết – hao (quan sát, thực thương, tài),
 *   tính trên thiên can + tàng can địa chi có trọng số (chi tháng nặng nhất).
 * - Thân nhược → dụng Ấn, hỷ Tỷ kiếp; thân vượng → dụng tiết (Thực thương) hoặc Tài;
 *   trung hòa → lấy bổ khuyết làm chính. Kèm điều hậu mùa quá lạnh / quá nóng.
 */

import {
  YEAR_DIVIDE_OPTIONS,
  buildIztroChart,
  type IztroChartInput,
} from './iztro-chart';
import {
  CAN_HANH,
  CHI_HANH,
  KHAC,
  NGU_HANH_ORDER,
  SINH,
  baZiZhByDivide,
  lunarFromChartInput,
  type NguHanh,
} from './nap-am-ngu-hanh';
import { viGanZhi } from './lunar-zh-vi';

export const CAN_DUONG = ['Giáp', 'Bính', 'Mậu', 'Canh', 'Nhâm'];

/** Tàng can (nhân nguyên) trong 12 địa chi — bản khí đứng đầu. */
export const TANG_CAN: Record<string, string[]> = {
  Tý: ['Quý'],
  Sửu: ['Kỷ', 'Quý', 'Tân'],
  Dần: ['Giáp', 'Bính', 'Mậu'],
  Mão: ['Ất'],
  Thìn: ['Mậu', 'Ất', 'Quý'],
  Tỵ: ['Bính', 'Canh', 'Mậu'],
  Ngọ: ['Đinh', 'Kỷ'],
  Mùi: ['Kỷ', 'Đinh', 'Ất'],
  Thân: ['Canh', 'Nhâm', 'Mậu'],
  Dậu: ['Tân'],
  Tuất: ['Mậu', 'Tân', 'Đinh'],
  Hợi: ['Nhâm', 'Giáp'],
};

type Mua = 'Xuân' | 'Hạ' | 'Thu' | 'Đông' | 'Tứ quý';

const MUA_BY_CHI: Record<string, Mua> = {
  Dần: 'Xuân', Mão: 'Xuân',
  Tỵ: 'Hạ', Ngọ: 'Hạ',
  Thân: 'Thu', Dậu: 'Thu',
  Hợi: 'Đông', Tý: 'Đông',
  Thìn: 'Tứ quý', Tuất: 'Tứ quý', Sửu: 'Tứ quý', Mùi: 'Tứ quý',
};

export type LenhThang = 'Vượng' | 'Tướng' | 'Hưu' | 'Tù' | 'Tử';

/** Vượng tướng hưu tù tử của từng hành theo mùa. */
const TRANG_THAI_MUA: Record<Mua, Record<NguHanh, LenhThang>> = {
  Xuân: { Mộc: 'Vượng', Hỏa: 'Tướng', Thủy: 'Hưu', Kim: 'Tù', Thổ: 'Tử' },
  Hạ: { Hỏa: 'Vượng', Thổ: 'Tướng', Mộc: 'Hưu', Thủy: 'Tù', Kim: 'Tử' },
  Thu: { Kim: 'Vượng', Thủy: 'Tướng', Thổ: 'Hưu', Hỏa: 'Tù', Mộc: 'Tử' },
  Đông: { Thủy: 'Vượng', Mộc: 'Tướng', Kim: 'Hưu', Thổ: 'Tù', Hỏa: 'Tử' },
  'Tứ quý': { Thổ: 'Vượng', Kim: 'Tướng', Hỏa: 'Hưu', Mộc: 'Tù', Thủy: 'Tử' },
};

export type ThapThan =
  | 'Tỷ kiên' | 'Kiếp tài'
  | 'Thực thần' | 'Thương quan'
  | 'Chính tài' | 'Thiên tài'
  | 'Chính quan' | 'Thất sát'
  | 'Chính ấn' | 'Thiên ấn';

const NHOM_THAP_THAN: Record<ThapThan, string> = {
  'Tỷ kiên': 'Tỷ kiếp', 'Kiếp tài': 'Tỷ kiếp',
  'Thực thần': 'Thực thương', 'Thương quan': 'Thực thương',
  'Chính tài': 'Tài', 'Thiên tài': 'Tài',
  'Chính quan': 'Quan sát', 'Thất sát': 'Quan sát',
  'Chính ấn': 'Ấn', 'Thiên ấn': 'Ấn',
};

/** Thập thần của can X so với nhật chủ. */
export function thapThanOf(nhatChu: string, other: string): ThapThan {
  const hn = CAN_HANH[nhatChu];
  const ho = CAN_HANH[other];
  const sameParity =
    CAN_DUONG.includes(nhatChu) === CAN_DUONG.includes(other);
  if (hn === ho) return sameParity ? 'Tỷ kiên' : 'Kiếp tài';
  if (SINH[hn] === ho) return sameParity ? 'Thực thần' : 'Thương quan';
  if (KHAC[hn] === ho) return sameParity ? 'Thiên tài' : 'Chính tài';
  if (KHAC[ho] === hn) return sameParity ? 'Thất sát' : 'Chính quan';
  return sameParity ? 'Thiên ấn' : 'Chính ấn';
}

function sinhInv(hanh: NguHanh): NguHanh {
  return NGU_HANH_ORDER.find((h) => SINH[h] === hanh) as NguHanh;
}

function khacInv(hanh: NguHanh): NguHanh {
  return NGU_HANH_ORDER.find((h) => KHAC[h] === hanh) as NguHanh;
}

export type DungThanTru = {
  tru: 'Năm' | 'Tháng' | 'Ngày' | 'Giờ';
  canChi: string;
  can: string;
  chi: string;
  canHanh: NguHanh;
  chiHanh: NguHanh;
  /** Trụ ngày = "Nhật chủ". */
  canThapThan: string;
  tangCan: { can: string; hanh: NguHanh; thapThan: ThapThan }[];
};

export type HanhUngDung = {
  hanh: NguHanh;
  mau: string;
  huong: string;
  so: string;
  nghe: string;
};

export const UNG_DUNG_HANH: Record<NguHanh, HanhUngDung> = {
  Kim: {
    hanh: 'Kim',
    mau: 'Trắng, xám, ánh kim',
    huong: 'Tây, Tây Bắc',
    so: '4 · 9 (Hà Đồ)',
    nghe: 'Kim khí, cơ khí, tài chính – ngân hàng, pháp lý, kim hoàn',
  },
  Mộc: {
    hanh: 'Mộc',
    mau: 'Xanh lục',
    huong: 'Đông, Đông Nam',
    so: '3 · 8 (Hà Đồ)',
    nghe: 'Giáo dục, xuất bản, gỗ – giấy, nông lâm, y dược cổ truyền',
  },
  Thủy: {
    hanh: 'Thủy',
    mau: 'Đen, xanh dương',
    huong: 'Bắc',
    so: '1 · 6 (Hà Đồ)',
    nghe: 'Vận tải, du lịch, thủy hải sản, truyền thông, ngoại giao',
  },
  Hỏa: {
    hanh: 'Hỏa',
    mau: 'Đỏ, hồng, tím',
    huong: 'Nam',
    so: '2 · 7 (Hà Đồ)',
    nghe: 'Năng lượng, ẩm thực, mỹ thuật, quảng cáo, công nghệ – điện',
  },
  Thổ: {
    hanh: 'Thổ',
    mau: 'Vàng, nâu đất',
    huong: 'Đông Bắc, Tây Nam',
    so: '5 · 10 (Hà Đồ)',
    nghe: 'Bất động sản, xây dựng, nông nghiệp, kho vận, gốm sứ',
  },
};

export type DungThanView = {
  fullName: string;
  gender: string;
  solarDate: string;
  lunarDate: string;
  timeLabel: string;
  yearDivideLabel: string;
  trus: DungThanTru[];
  nhatChu: string;
  nhatChuHanh: NguHanh;
  nhatChuAmDuong: 'dương' | 'âm';
  mua: Mua;
  chiThang: string;
  lenhThang: LenhThang;
  /** Đếm ngũ hành thô trên 8 chữ (4 can + 4 chi). */
  countsRaw: Record<NguHanh, number>;
  /** Đếm nhóm thập thần (can + tàng can, không tính nhật chủ). */
  thapThanCounts: Record<string, number>;
  scoreTro: number;
  scoreKhacTiet: number;
  thanVerdict: 'vuong' | 'nhuoc' | 'trung_hoa';
  verdictLabel: string;
  verdictReason: string;
  dungThan: NguHanh;
  dungThanNhom: string;
  hyThan: NguHanh[];
  kyThan: NguHanh[];
  dieuHau: string | null;
  ungDung: HanhUngDung;
};

const TRU_NAMES: DungThanTru['tru'][] = ['Năm', 'Tháng', 'Ngày', 'Giờ'];

export function buildDungThan(input: IztroChartInput): DungThanView {
  const yearDivide = input.yearDivide ?? 'nong_lich';
  const divideOpt =
    YEAR_DIVIDE_OPTIONS.find((o) => o.id === yearDivide) ??
    YEAR_DIVIDE_OPTIONS[0];

  const lunar = lunarFromChartInput(input);
  const baZi = baZiZhByDivide(lunar, yearDivide).map(viGanZhi);

  const nhatChu = (baZi[2] ?? '').split(/\s+/)[0] ?? '';
  const nhatChuHanh = CAN_HANH[nhatChu] ?? 'Thổ';

  const trus: DungThanTru[] = TRU_NAMES.map((tru, i) => {
    const canChi = baZi[i] ?? '';
    const [can = '', chi = ''] = canChi.split(/\s+/);
    return {
      tru,
      canChi,
      can,
      chi,
      canHanh: CAN_HANH[can] ?? 'Thổ',
      chiHanh: CHI_HANH[chi] ?? 'Thổ',
      canThapThan: tru === 'Ngày' ? 'Nhật chủ' : thapThanOf(nhatChu, can),
      tangCan: (TANG_CAN[chi] ?? []).map((tc) => ({
        can: tc,
        hanh: CAN_HANH[tc] ?? 'Thổ',
        thapThan: thapThanOf(nhatChu, tc),
      })),
    };
  });

  const chiThang = trus[1].chi;
  const mua = MUA_BY_CHI[chiThang] ?? 'Tứ quý';
  const lenhThang = TRANG_THAI_MUA[mua][nhatChuHanh];

  const countsRaw: Record<NguHanh, number> = {
    Kim: 0, Mộc: 0, Thủy: 0, Hỏa: 0, Thổ: 0,
  };
  for (const t of trus) {
    countsRaw[t.canHanh] += 1;
    countsRaw[t.chiHanh] += 1;
  }

  const thapThanCounts: Record<string, number> = {
    'Tỷ kiếp': 0, 'Thực thương': 0, Tài: 0, 'Quan sát': 0, Ấn: 0,
  };
  const isTro = (h: NguHanh) => h === nhatChuHanh || SINH[h] === nhatChuHanh;

  let scoreTro = 0;
  let scoreKhacTiet = 0;
  const addScore = (h: NguHanh, w: number) => {
    if (isTro(h)) scoreTro += w;
    else scoreKhacTiet += w;
  };

  for (const t of trus) {
    if (t.tru !== 'Ngày') {
      addScore(t.canHanh, 1);
      thapThanCounts[NHOM_THAP_THAN[t.canThapThan as ThapThan]] += 1;
    }
    t.tangCan.forEach((tc, idx) => {
      const w =
        idx === 0 ? (t.tru === 'Tháng' ? 2.5 : 1) : idx === 1 ? 0.5 : 0.3;
      addScore(tc.hanh, w);
      thapThanCounts[NHOM_THAP_THAN[tc.thapThan]] += 1;
    });
  }
  // Đắc lệnh: nhật chủ được mùa sinh nâng đỡ.
  if (lenhThang === 'Vượng') scoreTro += 1.5;
  else if (lenhThang === 'Tướng') scoreTro += 0.75;

  scoreTro = Math.round(scoreTro * 100) / 100;
  scoreKhacTiet = Math.round(scoreKhacTiet * 100) / 100;

  const diff = scoreTro - scoreKhacTiet;
  const thanVerdict: DungThanView['thanVerdict'] =
    diff >= 1 ? 'vuong' : diff <= -1 ? 'nhuoc' : 'trung_hoa';
  const verdictLabel =
    thanVerdict === 'vuong'
      ? 'Thân vượng'
      : thanVerdict === 'nhuoc'
        ? 'Thân nhược'
        : 'Trung hòa (xấp xỉ cân bằng)';
  const verdictReason = `Nhật chủ ${nhatChu} (${nhatChuHanh}) sinh tháng ${chiThang} (mùa ${mua}) — lệnh tháng ${lenhThang}. Lực sinh trợ ${scoreTro} điểm so với khắc–tiết–hao ${scoreKhacTiet} điểm.`;

  const anHanh = sinhInv(nhatChuHanh);
  const tietHanh = SINH[nhatChuHanh];
  const taiHanh = KHAC[nhatChuHanh];
  const quanHanh = khacInv(nhatChuHanh);

  let dungThan: NguHanh;
  let dungThanNhom: string;
  let hyThan: NguHanh[];
  let kyThan: NguHanh[];
  if (thanVerdict === 'nhuoc') {
    dungThan = anHanh;
    dungThanNhom = 'Ấn (hành sinh nhật chủ)';
    hyThan = [nhatChuHanh];
    kyThan = [quanHanh, tietHanh, taiHanh];
  } else if (thanVerdict === 'vuong') {
    if (countsRaw[tietHanh] > 0) {
      dungThan = tietHanh;
      dungThanNhom = 'Thực thương (hành tiết tú nhật chủ)';
      hyThan = [taiHanh, quanHanh];
    } else {
      dungThan = taiHanh;
      dungThanNhom = 'Tài (hành nhật chủ khắc)';
      hyThan = [tietHanh, quanHanh];
    }
    kyThan = [nhatChuHanh, anHanh];
  } else {
    const sorted = [...NGU_HANH_ORDER].sort(
      (x, y) => countsRaw[x] - countsRaw[y],
    );
    dungThan = sorted[0];
    dungThanNhom = 'Bổ khuyết (mệnh khá cân bằng, bù hành yếu nhất)';
    hyThan = [sinhInv(dungThan)];
    kyThan = [khacInv(dungThan)];
  }

  const dieuHau = ['Hợi', 'Tý', 'Sửu'].includes(chiThang)
    ? 'Sinh mùa Đông thiên hàn — cổ nhân trọng điều hậu: nên có Hỏa sưởi ấm (cân cùng dụng thần ở trên).'
    : ['Tỵ', 'Ngọ', 'Mùi'].includes(chiThang)
      ? 'Sinh mùa Hạ thiên nhiệt — cổ nhân trọng điều hậu: nên có Thủy nhuận mát (cân cùng dụng thần ở trên).'
      : null;

  const chart = buildIztroChart(input);

  return {
    fullName: chart.fullName,
    gender: chart.gender,
    solarDate: chart.solarDate,
    lunarDate: chart.lunarDate,
    timeLabel: chart.time,
    yearDivideLabel: divideOpt.label,
    trus,
    nhatChu,
    nhatChuHanh,
    nhatChuAmDuong: CAN_DUONG.includes(nhatChu) ? 'dương' : 'âm',
    mua,
    chiThang,
    lenhThang,
    countsRaw,
    thapThanCounts,
    scoreTro,
    scoreKhacTiet,
    thanVerdict,
    verdictLabel,
    verdictReason,
    dungThan,
    dungThanNhom,
    hyThan,
    kyThan,
    dieuHau,
    ungDung: UNG_DUNG_HANH[dungThan],
  };
}

/** Ngữ cảnh gọn cho AI luận dụng thần. */
export function buildDungThanPromptContext(v: DungThanView): string {
  const parts: string[] = [
    '# DỮ LIỆU BÁT TỰ · TÌM DỤNG THẦN',
    '',
    '## Người xem',
    `- Họ tên: ${v.fullName}`,
    `- Giới tính: ${v.gender}`,
    `- Sinh: dương ${v.solarDate} · âm ${v.lunarDate} · ${v.timeLabel}`,
    `- Cách chia năm: ${v.yearDivideLabel}`,
    '',
    '## Tứ trụ (can chi · thập thần của can · tàng can trong chi)',
    ...v.trus.map(
      (t) =>
        `- Trụ ${t.tru}: ${t.canChi} — can ${t.can} (${t.canHanh}, ${t.canThapThan}); chi ${t.chi} (${t.chiHanh}) tàng ${t.tangCan
          .map((tc) => `${tc.can} (${tc.hanh}, ${tc.thapThan})`)
          .join(' · ')}`,
    ),
    '',
    '## Nhật chủ và lệnh tháng',
    `- Nhật chủ: ${v.nhatChu} — ${v.nhatChuHanh} ${v.nhatChuAmDuong}`,
    `- Sinh tháng ${v.chiThang} (mùa ${v.mua}) → nhật chủ ở trạng thái ${v.lenhThang}`,
    '',
    '## Thống kê',
    `- Ngũ hành 8 chữ: ${NGU_HANH_ORDER.map((h) => `${h} ${v.countsRaw[h]}`).join(' · ')}`,
    `- Nhóm thập thần (can + tàng can): ${Object.entries(v.thapThanCounts)
      .map(([k, n]) => `${k} ${n}`)
      .join(' · ')}`,
    `- Cân lực: sinh trợ (tỷ kiếp + ấn) ${v.scoreTro} điểm vs khắc–tiết–hao (quan sát, thực thương, tài) ${v.scoreKhacTiet} điểm (tàng can chi tháng nặng nhất, có cộng điểm đắc lệnh)`,
    '',
    '## Kết luận cân cường nhược',
    `- ${v.verdictLabel}. ${v.verdictReason}`,
    '',
    '## Dụng thần · hỷ thần · kỵ thần',
    `- Dụng thần: ${v.dungThan} — nhóm ${v.dungThanNhom}`,
    `- Hỷ thần: ${v.hyThan.join(', ') || '—'}`,
    `- Kỵ thần: ${v.kyThan.join(', ') || '—'}`,
    v.dieuHau ? `- Điều hậu: ${v.dieuHau}` : '',
    '',
    '## Bảng ứng dụng dụng thần',
    `- Hành ${v.ungDung.hanh}: màu ${v.ungDung.mau}; hướng ${v.ungDung.huong}; số ${v.ungDung.so}; nghề gợi ý: ${v.ungDung.nghe}`,
    '',
    '## Ghi chú phương pháp',
    '- Cân cường nhược theo phép phổ thông (lệnh tháng + trọng số tàng can); các cách cục đặc biệt (tòng nhi, tòng tài, hóa khí…) chưa xét — nếu bát tự thiên lệch cực đoan cần thầy xem trực tiếp.',
  ];

  return parts.filter(Boolean).join('\n');
}
