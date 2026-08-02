/**
 * Xem tuổi cưới hỏi: hợp tuổi hai người (nạp âm, thiên can, địa chi
 * hình–hại–xung, cung phi bát trạch) + Kim Lâu cô dâu, Tam Tai hai người
 * theo năm cưới + tháng Đại lợi / Tiểu lợi theo chi tuổi cô dâu.
 */

import {
  buildHopTuoi,
  type HopTuoiView,
} from './hop-tuoi';
import { formatCanChi, tuoiMu, yearCanChi, type Chi } from './lunar';
import {
  checkKimLau,
  checkTamTai,
  checkXungNam,
  type RuleResult,
  type Verdict,
} from './rules';

/**
 * Tháng Đại lợi / Tiểu lợi (âm lịch) theo chi tuổi cô dâu — bảng
 * "Giá thú chu đường" cổ truyền.
 */
const LOI_THANG: Record<Chi, { daiLoi: number[]; tieuLoi: number[] }> = {
  Tý: { daiLoi: [6, 12], tieuLoi: [1, 7] },
  Ngọ: { daiLoi: [6, 12], tieuLoi: [1, 7] },
  Sửu: { daiLoi: [5, 11], tieuLoi: [4, 10] },
  Mùi: { daiLoi: [5, 11], tieuLoi: [4, 10] },
  Dần: { daiLoi: [2, 8], tieuLoi: [3, 9] },
  Thân: { daiLoi: [2, 8], tieuLoi: [3, 9] },
  Mão: { daiLoi: [1, 7], tieuLoi: [6, 12] },
  Dậu: { daiLoi: [1, 7], tieuLoi: [6, 12] },
  Thìn: { daiLoi: [4, 10], tieuLoi: [5, 11] },
  Tuất: { daiLoi: [4, 10], tieuLoi: [5, 11] },
  Tỵ: { daiLoi: [3, 9], tieuLoi: [2, 8] },
  Hợi: { daiLoi: [3, 9], tieuLoi: [2, 8] },
};

export interface CuoiHoiResult {
  brideYear: number;
  groomYear: number;
  targetYear: number;
  brideCanChi: string;
  groomCanChi: string;
  brideAgeMu: number;
  /** Đối chiếu hợp tuổi 4 tiêu chí (nạp âm, can, chi, cung phi) */
  hopTuoi: HopTuoiView;
  /** Luật năm cưới */
  yearRules: RuleResult[];
  /** Tháng âm lịch Đại lợi / Tiểu lợi theo tuổi cô dâu */
  daiLoiMonths: number[];
  tieuLoiMonths: number[];
  monthNote: string;
  overall: Verdict;
  overallLabel: string;
  overallDetail: string;
}

export function buildCuoiHoi(
  brideYear: number,
  groomYear: number,
  targetYear: number,
): CuoiHoiResult {
  const hopTuoi = buildHopTuoi(
    { year: brideYear, gender: 'nu', name: 'Cô dâu' },
    { year: groomYear, gender: 'nam', name: 'Chú rể' },
    'hon_nhan',
  );

  const brideChi = yearCanChi(brideYear).chi;
  const loi = LOI_THANG[brideChi];

  // "Lấy vợ xem tuổi đàn bà" — Kim Lâu xét cô dâu.
  const kimLauBride: RuleResult = {
    ...checkKimLau(brideYear, targetYear),
    key: 'kim_lau_co_dau',
    label: 'Kim Lâu — cô dâu',
  };
  const tamTaiBride: RuleResult = {
    ...checkTamTai(brideYear, targetYear),
    key: 'tam_tai_co_dau',
    label: 'Tam Tai — cô dâu',
  };
  const tamTaiGroom: RuleResult = {
    ...checkTamTai(groomYear, targetYear),
    key: 'tam_tai_chu_re',
    label: 'Tam Tai — chú rể',
  };
  const xungBride: RuleResult = {
    ...checkXungNam(brideYear, targetYear),
    key: 'xung_nam_co_dau',
    label: 'Xung năm cưới — cô dâu',
  };
  const xungGroom: RuleResult = {
    ...checkXungNam(groomYear, targetYear),
    key: 'xung_nam_chu_re',
    label: 'Xung năm cưới — chú rể',
  };
  const yearRules = [kimLauBride, tamTaiBride, tamTaiGroom, xungBride, xungGroom];

  // Tổng hợp: hợp tuổi là nền, Kim Lâu cô dâu là điều kiêng chính của năm.
  let overall: Verdict;
  let overallLabel: string;
  let overallDetail: string;

  const hopBad = hopTuoi.band === 'it_hop';
  const hasYearBad = kimLauBride.verdict === 'bad';
  const hasYearCaution = yearRules.some((r) => r.verdict === 'caution');

  if (hasYearBad && hopBad) {
    overall = 'bad';
    overallLabel = 'Nên cân nhắc kỹ';
    overallDetail = `Hai tuổi ${hopTuoi.bandLabel.toLowerCase()} (${hopTuoi.totalScore}/${hopTuoi.maxScore} điểm) và cô dâu phạm Kim Lâu năm ${targetYear}. Nên lùi sang năm cô dâu hết Kim Lâu, hoặc tham vấn thầy về cách hóa giải.`;
  } else if (hasYearBad) {
    overall = 'bad';
    overallLabel = `Năm ${targetYear} cô dâu phạm Kim Lâu`;
    overallDetail = `Hai tuổi ${hopTuoi.bandLabel.toLowerCase()} (${hopTuoi.totalScore}/${hopTuoi.maxScore} điểm) nhưng cô dâu phạm Kim Lâu năm ${targetYear} — dân gian kiêng cưới. Có thể chờ qua năm, hoặc cưới sau ngày sinh nhật âm (tục "qua Đông chí" tùy vùng) — nên hỏi thầy.`;
  } else if (hopBad) {
    overall = 'caution';
    overallLabel = 'Hai tuổi ít hợp';
    overallDetail = `Hai tuổi ${hopTuoi.bandLabel.toLowerCase()} (${hopTuoi.totalScore}/${hopTuoi.maxScore} điểm). Năm ${targetYear} không phạm Kim Lâu; nếu quyết định cưới nên xem cách hóa giải các tiêu chí xấu bên dưới.`;
  } else if (hasYearCaution) {
    overall = 'caution';
    overallLabel = 'Cưới được — có điểm cần lưu ý';
    overallDetail = `Hai tuổi ${hopTuoi.bandLabel.toLowerCase()} (${hopTuoi.totalScore}/${hopTuoi.maxScore} điểm), không phạm Kim Lâu; có Tam Tai hoặc xung năm nhẹ — chọn tháng Đại lợi và ngày lành để hóa giải.`;
  } else {
    overall = 'good';
    overallLabel = `Năm ${targetYear} thuận cưới hỏi`;
    overallDetail = `Hai tuổi ${hopTuoi.bandLabel.toLowerCase()} (${hopTuoi.totalScore}/${hopTuoi.maxScore} điểm), cô dâu không phạm Kim Lâu, không Tam Tai. Nên chọn tháng Đại lợi ${loi.daiLoi.join(' hoặc ')} âm lịch và ngày lành bên dưới.`;
  }

  return {
    brideYear,
    groomYear,
    targetYear,
    brideCanChi: formatCanChi(yearCanChi(brideYear)),
    groomCanChi: formatCanChi(yearCanChi(groomYear)),
    brideAgeMu: tuoiMu(brideYear, targetYear),
    hopTuoi,
    yearRules,
    daiLoiMonths: loi.daiLoi,
    tieuLoiMonths: loi.tieuLoi,
    monthNote: `Theo tuổi cô dâu (${brideChi}): tháng Đại lợi là tháng ${loi.daiLoi.join(', ')} âm lịch; tháng Tiểu lợi là tháng ${loi.tieuLoi.join(', ')} âm lịch. Ưu tiên cưới trong các tháng này.`,
    overall,
    overallLabel,
    overallDetail,
  };
}
