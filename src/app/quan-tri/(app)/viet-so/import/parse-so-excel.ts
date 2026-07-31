import type { SoGender, SoMemberRole } from '@/types/database';
import type { SoImportAncestor, SoImportMember, SoImportRow } from '@/app/actions/so';

function cellStr(v: unknown): string {
  if (v == null) return '';
  return String(v).trim();
}

function cellInt(v: unknown): number | null {
  const s = cellStr(v);
  if (!s) return null;
  const n = Number(s.replace(/[^\d-]/g, ''));
  return Number.isFinite(n) ? Math.trunc(n) : null;
}

function parseGender(v: unknown): SoGender | null {
  const s = cellStr(v).toLowerCase();
  if (!s) return null;
  if (s === 'nam' || s === 'm' || s === 'male' || s.includes('nam')) return 'nam';
  if (s === 'nu' || s === 'nữ' || s === 'f' || s === 'female' || s.includes('nữ') || s.includes('nu'))
    return 'nu';
  return null;
}

function normHeader(h: unknown): string {
  return cellStr(h)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ');
}

function findCol(headers: string[], ...needles: string[]): number {
  for (let i = 0; i < headers.length; i++) {
    const h = headers[i];
    if (needles.some((n) => h.includes(n))) return i;
  }
  return -1;
}

/**
 * Best-effort parse sheet AOA (array of arrays).
 * Hỗ trợ header tiếng Việt kiểu "Nhap du lieu.xlsx" hoặc cột đơn giản.
 */
export function parseSoExcelRows(aoa: unknown[][]): SoImportRow[] {
  if (!aoa || aoa.length < 2) return [];

  // Tìm hàng header: hàng có nhiều ô text nhất trong 8 hàng đầu
  let headerIdx = 0;
  let bestScore = -1;
  for (let r = 0; r < Math.min(8, aoa.length); r++) {
    const row = aoa[r] ?? [];
    const score = row.filter((c) => cellStr(c).length > 1).length;
    if (score > bestScore) {
      bestScore = score;
      headerIdx = r;
    }
  }

  const headers = (aoa[headerIdx] ?? []).map(normHeader);
  const colChuHo = findCol(
    headers,
    'chu ho',
    'ten chu',
    'tin chu',
    'ho ten chu',
    'nguoi so 1',
    'ten',
  );
  const colPhone = findCol(headers, 'dien thoai', 'sdt', 'phone', 'so dien');
  const colTinh = findCol(headers, 'tinh thanh', 'tinh/thanh', 'tinh');
  const colHuyen = findCol(headers, 'quan huyen', 'quan/huyen', 'huyen', 'quan');
  const colXa = findCol(headers, 'phuong xa', 'phuong/xa', 'xa', 'phuong');
  const colChiTiet = findCol(
    headers,
    'dia chi nho',
    'dia chi chi tiet',
    'dia chi nha',
    'dia chi',
  );
  const colNoiCung = findCol(headers, 'noi cung');
  const colNamCung = findCol(headers, 'nam cung');
  const colThangCung = findCol(headers, 'thang cung');
  const colNgayCung = findCol(headers, 'ngay cung');
  const colGioCung = findCol(headers, 'gio cung');
  const colGhiChu = findCol(headers, 'ghi chu', 'note');

  // Người số N: nhóm cột Tên / Năm sinh / Giới tính / Xưng hô
  const memberGroups: {
    ten: number;
    nam: number;
    gioi: number;
    xung: number;
  }[] = [];
  for (let i = 0; i < headers.length; i++) {
    const h = headers[i];
    if (
      h.includes('nguoi so') ||
      (h.includes('ten') && !h.includes('chu') && !h.includes('hieu'))
    ) {
      // Heuristic: cột tên + các cột kế
      const ten = i;
      let nam = -1;
      let gioi = -1;
      let xung = -1;
      for (let j = i; j < Math.min(i + 6, headers.length); j++) {
        const hj = headers[j];
        if (nam < 0 && (hj.includes('nam sinh') || hj === 'nam')) nam = j;
        if (gioi < 0 && hj.includes('gioi')) gioi = j;
        if (xung < 0 && hj.includes('xung')) xung = j;
      }
      if (ten >= 0) {
        memberGroups.push({ ten, nam, gioi, xung });
      }
    }
  }

  // Deduplicate overlapping groups (keep first of each cluster)
  const uniqueGroups: typeof memberGroups = [];
  for (const g of memberGroups) {
    if (uniqueGroups.some((u) => Math.abs(u.ten - g.ten) < 3)) continue;
    uniqueGroups.push(g);
  }

  // Fallback simplified: cột 0 = chủ hộ nếu không tìm thấy
  const chuHoIdx = colChuHo >= 0 ? colChuHo : 0;

  const out: SoImportRow[] = [];
  for (let r = headerIdx + 1; r < aoa.length; r++) {
    const row = aoa[r] ?? [];
    const chuHo = cellStr(row[chuHoIdx]);
    if (!chuHo) continue;

    const members: SoImportMember[] = [];
    if (uniqueGroups.length > 0) {
      for (let gi = 0; gi < uniqueGroups.length; gi++) {
        const g = uniqueGroups[gi];
        const hoTen = cellStr(row[g.ten]);
        if (!hoTen) continue;
        const vaiTro: SoMemberRole =
          gi === 0 ? 'chu_ho' : 'gia_quyen';
        members.push({
          hoTen,
          namSinh: g.nam >= 0 ? cellInt(row[g.nam]) : null,
          gioiTinh: g.gioi >= 0 ? parseGender(row[g.gioi]) : null,
          xungHo: g.xung >= 0 ? cellStr(row[g.xung]) : undefined,
          vaiTro,
        });
      }
    } else {
      // Simplified: chủ hộ + optional cột tên2, năm2…
      members.push({
        hoTen: chuHo,
        vaiTro: 'chu_ho',
        namSinh: cellInt(row[findCol(headers, 'nam sinh')]),
        gioiTinh: parseGender(row[findCol(headers, 'gioi tinh')]),
      });
    }

    const ancestors: SoImportAncestor[] = [];
    for (let i = 0; i < headers.length; i++) {
      const h = headers[i];
      if (
        h.includes('gia tien') ||
        h.includes('chinh tien') ||
        h.includes('ten hieu')
      ) {
        const ten = cellStr(row[i]);
        if (ten) {
          ancestors.push({
            tenHieu: ten,
            namMat: cellInt(row[i + 1]),
          });
        }
      }
    }

    out.push({
      chuHo,
      phone: colPhone >= 0 ? cellStr(row[colPhone]) : undefined,
      diaChiTinh: colTinh >= 0 ? cellStr(row[colTinh]) : undefined,
      diaChiHuyen: colHuyen >= 0 ? cellStr(row[colHuyen]) : undefined,
      diaChiXa: colXa >= 0 ? cellStr(row[colXa]) : undefined,
      diaChiChiTiet: colChiTiet >= 0 ? cellStr(row[colChiTiet]) : undefined,
      noiCung: colNoiCung >= 0 ? cellStr(row[colNoiCung]) : undefined,
      namCung: colNamCung >= 0 ? cellInt(row[colNamCung]) : null,
      thangCung: colThangCung >= 0 ? cellInt(row[colThangCung]) : null,
      ngayCung: colNgayCung >= 0 ? cellInt(row[colNgayCung]) : null,
      gioCung: colGioCung >= 0 ? cellStr(row[colGioCung]) : undefined,
      ghiChu: colGhiChu >= 0 ? cellStr(row[colGhiChu]) : undefined,
      members,
      ancestors,
    });
  }

  return out;
}
