import { yearCanChi, formatCanChi, tuoiMu } from '@/lib/fengshui/lunar';
import { getSaoChieuMenh } from '@/lib/fengshui/sao-chieu-menh';

export interface MemberAstro {
  namAm: string;
  tuoiAm: number;
  sao: string;
  han: string;
}

/**
 * Tra cứu năm âm / tuổi mụ / sao chiếu mệnh / hạn Thái Tuế cho thành viên.
 * Khi thiếu giới tính, mặc định `nam` để vẫn tính được sao.
 */
export function memberAstro(
  namSinh: number,
  gioiTinh: 'nam' | 'nu' | null,
  viewYear?: number,
): MemberAstro {
  const year = viewYear ?? new Date().getFullYear();
  const gender = gioiTinh ?? 'nam';
  const result = getSaoChieuMenh(namSinh, year, gender);

  return {
    namAm: formatCanChi(yearCanChi(namSinh)),
    tuoiAm: tuoiMu(namSinh, year),
    sao: result.star.name,
    han: result.taiSui.label || result.overallLabel,
  };
}
