import { yearCanChi } from '@/lib/fengshui/lunar';
import type {
  SoAncestor,
  SoHousehold,
  SoHouseholdMember,
} from '@/types/database';
import { arabicToHanDigits, hasLatinResidue, toHanName } from './han-names';
import type { SoFillData, SoLang } from './types';

/** Ghép địa chỉ bằng khoảng trắng để tách âm tiết khi xếp cột dọc QN. */
function joinDiaChi(h: SoHousehold): string {
  return [h.dia_chi_chi_tiet, h.dia_chi_xa, h.dia_chi_huyen, h.dia_chi_tinh]
    .map((s) => (s ?? '').trim())
    .filter(Boolean)
    .join(' ');
}

/** Ưu tiên chữ Nôm đã lưu; nếu còn Latin thì dịch lại từ điển. */
function nomOrDict(nho: string | null | undefined, quocNgu: string): string {
  const saved = (nho ?? '').trim();
  if (saved && !hasLatinResidue(saved)) return saved;
  const qn = quocNgu.trim() || saved;
  if (!qn) return '';
  const translated = toHanName(qn);
  if (translated && !hasLatinResidue(translated)) return translated;
  if (saved) {
    const fromSaved = toHanName(saved);
    if (fromSaved && !hasLatinResidue(fromSaved)) return fromSaved;
    return fromSaved || saved;
  }
  return translated || qn;
}

function formatMemberLineNom(m: SoHouseholdMember): string {
  const xung = m.xung_ho?.trim() ? nomOrDict(null, m.xung_ho) : null;
  const name = nomOrDict(m.ho_ten_nho, m.ho_ten);
  const year =
    m.nam_sinh != null ? arabicToHanDigits(String(m.nam_sinh)) : null;
  return [xung, name, year].filter(Boolean).join(' ');
}

/** Sớ Quốc ngữ: giữ Latin, không dịch Hán. */
function formatMemberLineQn(m: SoHouseholdMember): string {
  const parts = [
    m.xung_ho?.trim(),
    m.ho_ten.trim(),
    m.nam_sinh != null ? String(m.nam_sinh) : null,
  ].filter(Boolean);
  return parts.join(' ');
}

export function buildSoFillData(input: {
  household: SoHousehold;
  members: SoHouseholdMember[];
  ancestors: SoAncestor[];
  tenSo: string;
  /** qn/songngu = giữ Quốc ngữ (song ngữ dịch Hán khi xếp ô); nom = dịch Hán-Nôm sẵn */
  lang?: SoLang;
}): SoFillData {
  const lang = input.lang ?? 'songngu';
  /** Chỉ bản Nôm thuần mới điền sẵn Hán; song ngữ giữ QN để gắn cặp QN+Nôm */
  const asNom = lang === 'nom';
  const h = input.household;
  const year = h.nam_cung ?? new Date().getFullYear();
  const cc = yearCanChi(year);

  const printed = input.members
    .filter((m) => m.print_selected)
    .sort((a, b) => a.sort_order - b.sort_order);

  const formatMember = asNom ? formatMemberLineNom : formatMemberLineQn;

  const tinChu = printed
    .filter((m) => m.vai_tro !== 'chinh_tien')
    .map(formatMember)
    .join('\n');

  const chinhTien = printed
    .filter((m) => m.vai_tro === 'chinh_tien')
    .map(formatMember)
    .join('\n');

  const giaTien = input.ancestors
    .filter((a) => a.print_selected)
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((a) => {
      if (!asNom) {
        return [a.xung_ho?.trim(), a.ten_hieu.trim()].filter(Boolean).join(' ');
      }
      const xung = a.xung_ho?.trim() ? nomOrDict(null, a.xung_ho) : null;
      const ten = nomOrDict(a.ten_nho, a.ten_hieu);
      return [xung, ten].filter(Boolean).join(' ');
    })
    .join('\n');

  const diaChiQn = joinDiaChi(h);
  const chuHoQn = h.chu_ho;
  const chuHoNom = nomOrDict(
    printed.find((m) => m.is_chu_ho)?.ho_ten_nho,
    h.chu_ho,
  );

  if (!asNom) {
    return {
      tenSo: input.tenSo,
      chuHo: chuHoQn,
      diaChi: diaChiQn,
      noiCung: h.noi_cung ?? '',
      canNamCung: cc.can,
      chiNamCung: cc.chi,
      thangCung: h.thang_cung != null ? String(h.thang_cung) : '',
      ngayCung: h.ngay_cung != null ? String(h.ngay_cung) : '',
      ngachSo: h.ngach_so_rieng ?? '',
      danhSachTinChu: tinChu || chuHoQn,
      danhSachGiaTien: giaTien || undefined,
      danhSachChinhTien: chinhTien || undefined,
    };
  }

  return {
    tenSo: toHanName(input.tenSo) || input.tenSo,
    chuHo: chuHoNom || chuHoQn,
    diaChi: nomOrDict(h.dia_chi_nho, diaChiQn),
    noiCung: h.noi_cung ? toHanName(h.noi_cung) || h.noi_cung : '',
    canNamCung: cc.can,
    chiNamCung: cc.chi,
    thangCung:
      h.thang_cung != null ? arabicToHanDigits(String(h.thang_cung)) : '',
    ngayCung:
      h.ngay_cung != null ? arabicToHanDigits(String(h.ngay_cung)) : '',
    ngachSo: h.ngach_so_rieng
      ? arabicToHanDigits(h.ngach_so_rieng) || h.ngach_so_rieng
      : '',
    danhSachTinChu: tinChu || chuHoNom || chuHoQn,
    danhSachGiaTien: giaTien || undefined,
    danhSachChinhTien: chinhTien || undefined,
  };
}
