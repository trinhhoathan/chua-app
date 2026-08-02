/**
 * Hợp tuổi · xung khắc giữa hai người theo năm sinh âm lịch:
 * mệnh nạp âm, thiên can, địa chi (hợp/xung/hình/hại), cung phi bát trạch.
 */

import { LunarUtil } from 'lunar-typescript';
import { viTerm } from './lunar-zh-vi';
import {
  KHAC,
  SINH,
  nguHanhRelation,
  type NguHanh,
} from './nap-am-ngu-hanh';

export type HopTuoiPurpose = 'hon_nhan' | 'lam_an' | 'gia_dao';

export const HOP_TUOI_PURPOSES: {
  id: HopTuoiPurpose;
  label: string;
  hint: string;
}[] = [
  { id: 'hon_nhan', label: 'Hôn nhân', hint: 'Vợ chồng, kết duyên lâu dài' },
  { id: 'lam_an', label: 'Làm ăn', hint: 'Hợp tác, chung vốn, mở việc' },
  { id: 'gia_dao', label: 'Gia đạo', hint: 'Cha mẹ – con cái, người thân' },
];

const CAN_VI = [
  'Giáp', 'Ất', 'Bính', 'Đinh', 'Mậu', 'Kỷ', 'Canh', 'Tân', 'Nhâm', 'Quý',
] as const;
const CHI_VI = [
  'Tý', 'Sửu', 'Dần', 'Mão', 'Thìn', 'Tỵ', 'Ngọ', 'Mùi', 'Thân', 'Dậu',
  'Tuất', 'Hợi',
] as const;
const GAN_ZH = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
const ZHI_ZH = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

const CAN_HANH_VI: Record<string, NguHanh> = {
  Giáp: 'Mộc', Ất: 'Mộc', Bính: 'Hỏa', Đinh: 'Hỏa', Mậu: 'Thổ',
  Kỷ: 'Thổ', Canh: 'Kim', Tân: 'Kim', Nhâm: 'Thủy', Quý: 'Thủy',
};

/** Cung phi bát trạch. */
export type CungPhi =
  | 'Khảm' | 'Khôn' | 'Chấn' | 'Tốn' | 'Càn' | 'Đoài' | 'Cấn' | 'Ly';

const CUNG_BY_SO: Record<number, CungPhi> = {
  1: 'Khảm', 2: 'Khôn', 3: 'Chấn', 4: 'Tốn', 6: 'Càn', 7: 'Đoài', 8: 'Cấn', 9: 'Ly',
};

const CUNG_HANH: Record<CungPhi, NguHanh> = {
  Khảm: 'Thủy', Khôn: 'Thổ', Chấn: 'Mộc', Tốn: 'Mộc',
  Càn: 'Kim', Đoài: 'Kim', Cấn: 'Thổ', Ly: 'Hỏa',
};

const DONG_TU: CungPhi[] = ['Khảm', 'Ly', 'Chấn', 'Tốn'];

export type DuNien =
  | 'Sinh khí' | 'Thiên y' | 'Diên niên' | 'Phục vị'
  | 'Họa hại' | 'Lục sát' | 'Ngũ quỷ' | 'Tuyệt mệnh';

/** Đại du niên ca (乾六天五祸绝延生…) — quan hệ đối xứng giữa hai cung. */
export const BAT_TRACH: Record<CungPhi, Record<CungPhi, DuNien>> = {
  Càn: {
    Càn: 'Phục vị', Khảm: 'Lục sát', Cấn: 'Thiên y', Chấn: 'Ngũ quỷ',
    Tốn: 'Họa hại', Ly: 'Tuyệt mệnh', Khôn: 'Diên niên', Đoài: 'Sinh khí',
  },
  Khảm: {
    Càn: 'Lục sát', Khảm: 'Phục vị', Cấn: 'Ngũ quỷ', Chấn: 'Thiên y',
    Tốn: 'Sinh khí', Ly: 'Diên niên', Khôn: 'Tuyệt mệnh', Đoài: 'Họa hại',
  },
  Cấn: {
    Càn: 'Thiên y', Khảm: 'Ngũ quỷ', Cấn: 'Phục vị', Chấn: 'Lục sát',
    Tốn: 'Tuyệt mệnh', Ly: 'Họa hại', Khôn: 'Sinh khí', Đoài: 'Diên niên',
  },
  Chấn: {
    Càn: 'Ngũ quỷ', Khảm: 'Thiên y', Cấn: 'Lục sát', Chấn: 'Phục vị',
    Tốn: 'Diên niên', Ly: 'Sinh khí', Khôn: 'Họa hại', Đoài: 'Tuyệt mệnh',
  },
  Tốn: {
    Càn: 'Họa hại', Khảm: 'Sinh khí', Cấn: 'Tuyệt mệnh', Chấn: 'Diên niên',
    Tốn: 'Phục vị', Ly: 'Thiên y', Khôn: 'Ngũ quỷ', Đoài: 'Lục sát',
  },
  Ly: {
    Càn: 'Tuyệt mệnh', Khảm: 'Diên niên', Cấn: 'Họa hại', Chấn: 'Sinh khí',
    Tốn: 'Thiên y', Ly: 'Phục vị', Khôn: 'Lục sát', Đoài: 'Ngũ quỷ',
  },
  Khôn: {
    Càn: 'Diên niên', Khảm: 'Tuyệt mệnh', Cấn: 'Sinh khí', Chấn: 'Họa hại',
    Tốn: 'Ngũ quỷ', Ly: 'Lục sát', Khôn: 'Phục vị', Đoài: 'Thiên y',
  },
  Đoài: {
    Càn: 'Sinh khí', Khảm: 'Họa hại', Cấn: 'Diên niên', Chấn: 'Tuyệt mệnh',
    Tốn: 'Lục sát', Ly: 'Ngũ quỷ', Khôn: 'Thiên y', Đoài: 'Phục vị',
  },
};

export const DU_NIEN_MEANING: Record<
  DuNien,
  { level: 'tot' | 'binh' | 'xau'; text: string }
> = {
  'Sinh khí': {
    level: 'tot',
    text: 'Đại cát — tiếp thêm sinh lực, cùng nhau phát triển, lợi tài lộc con cái.',
  },
  'Thiên y': {
    level: 'tot',
    text: 'Cát — che chở sức khỏe, đỡ đần nhau lúc khó, êm ấm bền lâu.',
  },
  'Diên niên': {
    level: 'tot',
    text: 'Cát — bền duyên, biết nhường nhịn, hòa thuận dài lâu.',
  },
  'Phục vị': {
    level: 'tot',
    text: 'Tiểu cát — cùng nếp nghĩ, êm đềm, tình cảm ổn định.',
  },
  'Họa hại': {
    level: 'xau',
    text: 'Hung nhẹ — dễ khắc khẩu, hao tán lặt vặt, cần nhịn nhau.',
  },
  'Lục sát': {
    level: 'xau',
    text: 'Hung — dễ hiểu lầm, thị phi, mỏi mệt tình cảm.',
  },
  'Ngũ quỷ': {
    level: 'xau',
    text: 'Hung — dễ nóng nảy tranh cãi, thất thoát tiền của.',
  },
  'Tuyệt mệnh': {
    level: 'xau',
    text: 'Đại hung — xung nhau mạnh, muốn bền phải hóa giải và nhường nhịn nhiều.',
  },
};

// —— Quan hệ địa chi ——
const LUC_HOP: [string, string][] = [
  ['Tý', 'Sửu'], ['Dần', 'Hợi'], ['Mão', 'Tuất'],
  ['Thìn', 'Dậu'], ['Tỵ', 'Thân'], ['Ngọ', 'Mùi'],
];
const TAM_HOP: string[][] = [
  ['Thân', 'Tý', 'Thìn'], ['Dần', 'Ngọ', 'Tuất'],
  ['Tỵ', 'Dậu', 'Sửu'], ['Hợi', 'Mão', 'Mùi'],
];
const LUC_XUNG: [string, string][] = [
  ['Tý', 'Ngọ'], ['Sửu', 'Mùi'], ['Dần', 'Thân'],
  ['Mão', 'Dậu'], ['Thìn', 'Tuất'], ['Tỵ', 'Hợi'],
];
const LUC_HAI: [string, string][] = [
  ['Tý', 'Mùi'], ['Sửu', 'Ngọ'], ['Dần', 'Tỵ'],
  ['Mão', 'Thìn'], ['Thân', 'Hợi'], ['Dậu', 'Tuất'],
];
const TUONG_HINH: [string, string][] = [
  ['Tý', 'Mão'],
  ['Dần', 'Tỵ'], ['Tỵ', 'Thân'], ['Dần', 'Thân'],
  ['Sửu', 'Tuất'], ['Tuất', 'Mùi'], ['Sửu', 'Mùi'],
];
const TU_HINH = ['Thìn', 'Ngọ', 'Dậu', 'Hợi'];

const CAN_NGU_HOP: [string, string][] = [
  ['Giáp', 'Kỷ'], ['Ất', 'Canh'], ['Bính', 'Tân'],
  ['Đinh', 'Nhâm'], ['Mậu', 'Quý'],
];
const CAN_XUNG: [string, string][] = [
  ['Giáp', 'Canh'], ['Ất', 'Tân'], ['Bính', 'Nhâm'], ['Đinh', 'Quý'],
];

function inPairs(pairs: [string, string][], a: string, b: string): boolean {
  return pairs.some(
    ([x, y]) => (x === a && y === b) || (x === b && y === a),
  );
}

export type HopTuoiPersonInput = {
  name?: string;
  /** Năm sinh ÂM LỊCH (sinh trước Tết tính năm trước). */
  year: number;
  gender: 'nam' | 'nu';
};

export type HopTuoiPersonView = {
  name: string;
  year: number;
  gender: 'nam' | 'nu';
  can: string;
  chi: string;
  canChi: string;
  napAm: string;
  napAmHanh: NguHanh;
  cungPhi: CungPhi;
  cungPhiHanh: NguHanh;
  /** Đông tứ mệnh / Tây tứ mệnh. */
  nhomTrach: string;
};

export type TieuChi = {
  key: 'menh' | 'can' | 'chi' | 'cung_phi';
  label: string;
  /** VD: "Tỵ – Thân: lục hợp (và tương hình)". */
  detail: string;
  verdict: string;
  level: 'tot' | 'binh' | 'xau';
  score: number; // 0–2
};

export type HopTuoiView = {
  a: HopTuoiPersonView;
  b: HopTuoiPersonView;
  purpose: HopTuoiPurpose;
  purposeLabel: string;
  tieuChi: TieuChi[];
  totalScore: number; // 0–8
  maxScore: number;
  band: 'rat_hop' | 'kha_hop' | 'trung_binh' | 'it_hop';
  bandLabel: string;
};

function napAmHanhOf(name: string): NguHanh {
  const last = name.trim().split(/\s+/).pop() || '';
  return (['Kim', 'Mộc', 'Thủy', 'Hỏa', 'Thổ'] as NguHanh[]).includes(
    last as NguHanh,
  )
    ? (last as NguHanh)
    : 'Thổ';
}

function digitSum9(n: number): number {
  let s = Math.abs(n);
  while (s > 9) {
    s = String(s)
      .split('')
      .reduce((acc, c) => acc + Number(c), 0);
  }
  return s;
}

/** Cung phi bát trạch theo năm sinh âm lịch. */
export function cungPhiOfYear(year: number, gender: 'nam' | 'nu'): CungPhi {
  const r = digitSum9(
    String(year)
      .split('')
      .reduce((acc, c) => acc + Number(c), 0),
  );
  let k = digitSum9(gender === 'nam' ? 11 - r : 4 + r);
  if (k === 5) k = gender === 'nam' ? 2 : 8;
  return CUNG_BY_SO[k];
}

/** Nạp âm (tên + hành) của một năm âm lịch. */
export function napAmOfYear(year: number): { name: string; hanh: NguHanh } {
  const canIdx = ((year - 4) % 10 + 10) % 10;
  const chiIdx = ((year - 4) % 12 + 12) % 12;
  const zh = GAN_ZH[canIdx] + ZHI_ZH[chiIdx];
  const name = viTerm((LunarUtil.NAYIN as Record<string, string>)[zh] ?? '');
  return { name, hanh: napAmHanhOf(name) };
}

export function buildHopTuoiPerson(
  input: HopTuoiPersonInput,
  fallbackName: string,
): HopTuoiPersonView {
  const canIdx = ((input.year - 4) % 10 + 10) % 10;
  const chiIdx = ((input.year - 4) % 12 + 12) % 12;
  const can = CAN_VI[canIdx];
  const chi = CHI_VI[chiIdx];
  const zh = GAN_ZH[canIdx] + ZHI_ZH[chiIdx];
  const napAm = viTerm((LunarUtil.NAYIN as Record<string, string>)[zh] ?? '');
  const cungPhi = cungPhiOfYear(input.year, input.gender);
  return {
    name: (input.name || '').trim() || fallbackName,
    year: input.year,
    gender: input.gender,
    can,
    chi,
    canChi: `${can} ${chi}`,
    napAm,
    napAmHanh: napAmHanhOf(napAm),
    cungPhi,
    cungPhiHanh: CUNG_HANH[cungPhi],
    nhomTrach: DONG_TU.includes(cungPhi) ? 'Đông tứ mệnh' : 'Tây tứ mệnh',
  };
}

function menhTieuChi(a: HopTuoiPersonView, b: HopTuoiPersonView): TieuChi {
  const ha = a.napAmHanh;
  const hb = b.napAmHanh;
  let verdict: string;
  let level: TieuChi['level'];
  let score: number;
  if (ha === hb) {
    verdict = 'Tỵ hòa — hai mệnh cùng hành, bình hòa, dễ đồng cảm.';
    level = 'binh';
    score = 1;
  } else if (SINH[ha] === hb) {
    verdict = `${a.name} (${ha}) sinh ${b.name} (${hb}) — tương sinh, ${b.name} được trợ lực.`;
    level = 'tot';
    score = 2;
  } else if (SINH[hb] === ha) {
    verdict = `${b.name} (${hb}) sinh ${a.name} (${ha}) — tương sinh, ${a.name} được trợ lực.`;
    level = 'tot';
    score = 2;
  } else if (KHAC[ha] === hb) {
    verdict = `${a.name} (${ha}) khắc ${b.name} (${hb}) — tương khắc, cần hành thông quan hóa giải.`;
    level = 'xau';
    score = 0;
  } else {
    verdict = `${b.name} (${hb}) khắc ${a.name} (${ha}) — tương khắc, cần hành thông quan hóa giải.`;
    level = 'xau';
    score = 0;
  }
  return {
    key: 'menh',
    label: 'Mệnh nạp âm',
    detail: `${a.napAm} (${ha}) ↔ ${b.napAm} (${hb})`,
    verdict,
    level,
    score,
  };
}

function canTieuChi(a: HopTuoiPersonView, b: HopTuoiPersonView): TieuChi {
  const detail = `${a.can} ↔ ${b.can}`;
  if (inPairs(CAN_NGU_HOP, a.can, b.can)) {
    return {
      key: 'can', label: 'Thiên can', detail,
      verdict: `${a.can} hợp ${b.can} (thiên can ngũ hợp) — quý mến, dễ đồng lòng.`,
      level: 'tot', score: 2,
    };
  }
  if (inPairs(CAN_XUNG, a.can, b.can)) {
    return {
      key: 'can', label: 'Thiên can', detail,
      verdict: `${a.can} xung ${b.can} (thiên can tương xung) — dễ trái ý, cần nhường nhịn.`,
      level: 'xau', score: 0,
    };
  }
  const ha = CAN_HANH_VI[a.can];
  const hb = CAN_HANH_VI[b.can];
  if (ha === hb) {
    return {
      key: 'can', label: 'Thiên can', detail,
      verdict: `Hai can cùng hành ${ha} — tỵ hòa, bình ổn.`,
      level: 'binh', score: 1,
    };
  }
  if (SINH[ha] === hb || SINH[hb] === ha) {
    return {
      key: 'can', label: 'Thiên can', detail,
      verdict: `Hành hai can tương sinh (${nguHanhRelation(ha, hb)}) — thuận.`,
      level: 'tot', score: 2,
    };
  }
  return {
    key: 'can', label: 'Thiên can', detail,
    verdict: `Hành hai can tương khắc (${nguHanhRelation(ha, hb)}) — kém thuận, mức nhẹ.`,
    level: 'xau', score: 0,
  };
}

function chiTieuChi(a: HopTuoiPersonView, b: HopTuoiPersonView): TieuChi {
  const detail = `${a.chi} ↔ ${b.chi}`;
  const goods: string[] = [];
  const bads: string[] = [];
  if (inPairs(LUC_HOP, a.chi, b.chi)) goods.push('lục hợp (nhị hợp)');
  if (TAM_HOP.some((g) => g.includes(a.chi) && g.includes(b.chi) && a.chi !== b.chi)) {
    goods.push('tam hợp');
  }
  if (inPairs(LUC_XUNG, a.chi, b.chi)) bads.push('lục xung');
  if (inPairs(LUC_HAI, a.chi, b.chi)) bads.push('lục hại');
  if (inPairs(TUONG_HINH, a.chi, b.chi)) bads.push('tương hình');
  if (a.chi === b.chi && TU_HINH.includes(a.chi)) bads.push('tự hình');

  let verdict: string;
  let level: TieuChi['level'];
  let score: number;
  if (goods.length && bads.length) {
    verdict = `Vừa ${goods.join(', ')} vừa ${bads.join(', ')} — hợp xung đan xen, tốt xấu tùy cách ăn ở.`;
    level = 'binh';
    score = 1;
  } else if (goods.length) {
    verdict = `${a.chi} – ${b.chi} ${goods.join(', ')} — địa chi quấn quýt, thuận duyên.`;
    level = 'tot';
    score = 2;
  } else if (bads.length) {
    verdict = `${a.chi} – ${b.chi} ${bads.join(', ')} — địa chi trái nhau, cần hóa giải.`;
    level = 'xau';
    score = 0;
  } else if (a.chi === b.chi) {
    verdict = `Hai tuổi cùng chi ${a.chi} — bình hòa, hiểu tính nhau.`;
    level = 'binh';
    score = 1;
  } else {
    verdict = 'Không hợp không xung — bình hòa.';
    level = 'binh';
    score = 1;
  }
  return { key: 'chi', label: 'Địa chi', detail, verdict, level, score };
}

function cungPhiTieuChi(a: HopTuoiPersonView, b: HopTuoiPersonView): TieuChi {
  const duNien = BAT_TRACH[a.cungPhi][b.cungPhi];
  const meaning = DU_NIEN_MEANING[duNien];
  return {
    key: 'cung_phi',
    label: 'Cung phi bát trạch',
    detail: `${a.cungPhi} (${a.nhomTrach}) ↔ ${b.cungPhi} (${b.nhomTrach})`,
    verdict: `Du niên ${duNien}: ${meaning.text}`,
    level: meaning.level === 'tot' ? 'tot' : 'xau',
    score: meaning.level === 'tot' ? 2 : 0,
  };
}

export function buildHopTuoi(
  aIn: HopTuoiPersonInput,
  bIn: HopTuoiPersonInput,
  purpose: HopTuoiPurpose,
): HopTuoiView {
  const a = buildHopTuoiPerson(aIn, 'Người thứ nhất');
  const b = buildHopTuoiPerson(bIn, 'Người thứ hai');
  const tieuChi = [
    menhTieuChi(a, b),
    canTieuChi(a, b),
    chiTieuChi(a, b),
    cungPhiTieuChi(a, b),
  ];
  const totalScore = tieuChi.reduce((s, t) => s + t.score, 0);
  const band =
    totalScore >= 6
      ? 'rat_hop'
      : totalScore >= 4
        ? 'kha_hop'
        : totalScore >= 2
          ? 'trung_binh'
          : 'it_hop';
  const bandLabel =
    band === 'rat_hop'
      ? 'Rất hợp'
      : band === 'kha_hop'
        ? 'Khá hợp'
        : band === 'trung_binh'
          ? 'Trung bình — có điểm cần hóa giải'
          : 'Ít hợp — nên xem cách hóa giải';
  return {
    a,
    b,
    purpose,
    purposeLabel:
      HOP_TUOI_PURPOSES.find((p) => p.id === purpose)?.label ?? 'Hôn nhân',
    tieuChi,
    totalScore,
    maxScore: 8,
    band,
    bandLabel,
  };
}

/** Ngữ cảnh gọn cho AI luận hợp tuổi. */
export function buildHopTuoiPromptContext(v: HopTuoiView): string {
  const person = (p: HopTuoiPersonView, label: string) => [
    `## ${label}`,
    `- Tên gọi: ${p.name}`,
    `- Giới tính: ${p.gender === 'nam' ? 'Nam' : 'Nữ'}`,
    `- Năm sinh (âm lịch): ${p.year} — tuổi ${p.canChi}`,
    `- Mệnh nạp âm: ${p.napAm} (hành ${p.napAmHanh})`,
    `- Cung phi bát trạch: ${p.cungPhi} (hành ${p.cungPhiHanh}, ${p.nhomTrach})`,
  ];

  const parts: string[] = [
    '# DỮ LIỆU HỢP TUỔI · XUNG KHẮC HAI NGƯỜI',
    '',
    `- Mục đích xem: ${v.purposeLabel}`,
    '- Lưu ý phương pháp: năm sinh tính theo âm lịch (sinh trước Tết thuộc năm trước); cung phi tính theo năm sinh âm lịch, kua số 5 ký cung nam Khôn – nữ Cấn.',
    '',
    ...person(v.a, 'Người thứ nhất'),
    '',
    ...person(v.b, 'Người thứ hai'),
    '',
    '## Bốn tiêu chí đối chiếu',
    ...v.tieuChi.map(
      (t) =>
        `- ${t.label} (${t.detail}): ${t.verdict} [${
          t.level === 'tot' ? 'TỐT' : t.level === 'binh' ? 'BÌNH' : 'XẤU'
        } · ${t.score}/2 điểm]`,
    ),
    '',
    '## Tổng hợp',
    `- Tổng điểm: ${v.totalScore}/${v.maxScore} — ${v.bandLabel}.`,
    '- Đây là phép xem dân gian phổ thông (nạp âm, can chi năm, cung phi); muốn tinh cần so cả tứ trụ ngày giờ hai người.',
  ];

  return parts.filter(Boolean).join('\n');
}
