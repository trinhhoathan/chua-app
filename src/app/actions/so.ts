'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { assertTempleAccess } from '@/lib/auth';
import type {
  SoAncestor,
  SoGender,
  SoHousehold,
  SoHouseholdMember,
  SoMemberRole,
} from '@/types/database';

const PATH = '/quan-tri/viet-so';
const ROLES: SoMemberRole[] = ['chu_ho', 'chinh_tien', 'gia_quyen'];
const GENDERS: SoGender[] = ['nam', 'nu'];

function revalidateSo() {
  revalidatePath(PATH);
  revalidatePath(`${PATH}/in`);
}

function emptyToNull(v: string | null | undefined): string | null {
  const t = (v ?? '').trim();
  return t ? t : null;
}

function toIntOrNull(v: number | string | null | undefined): number | null {
  if (v === null || v === undefined || v === '') return null;
  const n = typeof v === 'number' ? v : Number(String(v).trim());
  return Number.isFinite(n) ? Math.trunc(n) : null;
}

export async function upsertHousehold(input: {
  templeId: string;
  id?: string;
  chuHo: string;
  phone?: string;
  diaChiTinh?: string;
  diaChiHuyen?: string;
  diaChiXa?: string;
  diaChiChiTiet?: string;
  diaChiNho?: string;
  noiCung?: string;
  namCung?: number | null;
  thangCung?: number | null;
  ngayCung?: number | null;
  gioCung?: string;
  ngachSoRieng?: string;
  ghiChu?: string;
}): Promise<{ ok: boolean; error?: string; id?: string }> {
  try {
    await assertTempleAccess(input.templeId);
  } catch {
    return { ok: false, error: 'Không có quyền.' };
  }

  const chuHo = input.chuHo.trim();
  if (chuHo.length < 1) return { ok: false, error: 'Thiếu tên chủ hộ.' };

  const row = {
    temple_id: input.templeId,
    chu_ho: chuHo,
    phone: emptyToNull(input.phone),
    dia_chi_tinh: emptyToNull(input.diaChiTinh),
    dia_chi_huyen: emptyToNull(input.diaChiHuyen),
    dia_chi_xa: emptyToNull(input.diaChiXa),
    dia_chi_chi_tiet: emptyToNull(input.diaChiChiTiet),
    dia_chi_nho: emptyToNull(input.diaChiNho),
    noi_cung: emptyToNull(input.noiCung),
    nam_cung: toIntOrNull(input.namCung),
    thang_cung: toIntOrNull(input.thangCung),
    ngay_cung: toIntOrNull(input.ngayCung),
    gio_cung: emptyToNull(input.gioCung),
    ngach_so_rieng: emptyToNull(input.ngachSoRieng),
    ghi_chu: emptyToNull(input.ghiChu),
    updated_at: new Date().toISOString(),
  };

  const supabase = await createClient();

  if (input.id) {
    const { error } = await supabase
      .from('so_households')
      .update(row)
      .eq('id', input.id)
      .eq('temple_id', input.templeId)
      .is('deleted_at', null);
    if (error) return { ok: false, error: error.message };
    revalidateSo();
    return { ok: true, id: input.id };
  }

  const { data, error } = await supabase
    .from('so_households')
    .insert(row)
    .select('id')
    .maybeSingle();
  if (error) return { ok: false, error: error.message };
  revalidateSo();
  return { ok: true, id: data?.id };
}

export async function deleteHousehold(input: {
  templeId: string;
  id: string;
}): Promise<{ ok: boolean; error?: string }> {
  try {
    await assertTempleAccess(input.templeId);
  } catch {
    return { ok: false, error: 'Không có quyền.' };
  }
  const supabase = await createClient();
  const { error } = await supabase
    .from('so_households')
    .update({
      deleted_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', input.id)
    .eq('temple_id', input.templeId);
  if (error) return { ok: false, error: error.message };
  revalidateSo();
  return { ok: true };
}

export async function upsertMember(input: {
  templeId: string;
  householdId: string;
  id?: string;
  printSelected?: boolean;
  isChuHo?: boolean;
  xungHo?: string;
  hoTen: string;
  hoTenNho?: string;
  gioiTinh?: SoGender | '' | null;
  namSinh?: number | null;
  ngaySinh?: number | null;
  thangSinh?: number | null;
  vaiTro?: SoMemberRole;
  phapDanh?: string;
  phapDanhNho?: string;
  ngachSoRieng?: string;
  sortOrder?: number;
}): Promise<{ ok: boolean; error?: string; id?: string }> {
  try {
    await assertTempleAccess(input.templeId);
  } catch {
    return { ok: false, error: 'Không có quyền.' };
  }

  const hoTen = input.hoTen.trim();
  if (hoTen.length < 1) return { ok: false, error: 'Thiếu họ tên thành viên.' };

  const vaiTro = input.vaiTro ?? 'gia_quyen';
  if (!ROLES.includes(vaiTro)) return { ok: false, error: 'Vai trò không hợp lệ.' };

  let gioiTinh: SoGender | null = null;
  if (input.gioiTinh === 'nam' || input.gioiTinh === 'nu') {
    gioiTinh = input.gioiTinh;
  } else if (input.gioiTinh && !GENDERS.includes(input.gioiTinh as SoGender)) {
    return { ok: false, error: 'Giới tính không hợp lệ.' };
  }

  const row = {
    household_id: input.householdId,
    temple_id: input.templeId,
    print_selected: input.printSelected ?? true,
    is_chu_ho: input.isChuHo ?? false,
    xung_ho: emptyToNull(input.xungHo),
    ho_ten: hoTen,
    ho_ten_nho: emptyToNull(input.hoTenNho),
    gioi_tinh: gioiTinh,
    nam_sinh: toIntOrNull(input.namSinh),
    ngay_sinh: toIntOrNull(input.ngaySinh),
    thang_sinh: toIntOrNull(input.thangSinh),
    vai_tro: vaiTro,
    phap_danh: emptyToNull(input.phapDanh),
    phap_danh_nho: emptyToNull(input.phapDanhNho),
    ngach_so_rieng: emptyToNull(input.ngachSoRieng),
    sort_order: input.sortOrder ?? 0,
    updated_at: new Date().toISOString(),
  };

  const supabase = await createClient();

  if (input.id) {
    const { error } = await supabase
      .from('so_household_members')
      .update(row)
      .eq('id', input.id)
      .eq('temple_id', input.templeId);
    if (error) return { ok: false, error: error.message };
    revalidateSo();
    return { ok: true, id: input.id };
  }

  const { data, error } = await supabase
    .from('so_household_members')
    .insert(row)
    .select('id')
    .maybeSingle();
  if (error) return { ok: false, error: error.message };
  revalidateSo();
  return { ok: true, id: data?.id };
}

export async function deleteMember(input: {
  templeId: string;
  id: string;
}): Promise<{ ok: boolean; error?: string }> {
  try {
    await assertTempleAccess(input.templeId);
  } catch {
    return { ok: false, error: 'Không có quyền.' };
  }
  const supabase = await createClient();
  const { error } = await supabase
    .from('so_household_members')
    .delete()
    .eq('id', input.id)
    .eq('temple_id', input.templeId);
  if (error) return { ok: false, error: error.message };
  revalidateSo();
  return { ok: true };
}

export async function upsertAncestor(input: {
  templeId: string;
  householdId: string;
  id?: string;
  printSelected?: boolean;
  xungHo?: string;
  tenHieu: string;
  tenNho?: string;
  namMat?: number | null;
  thangMat?: number | null;
  ngayMat?: number | null;
  gioMat?: string;
  anTang?: string;
  anTangNho?: string;
  sortOrder?: number;
}): Promise<{ ok: boolean; error?: string; id?: string }> {
  try {
    await assertTempleAccess(input.templeId);
  } catch {
    return { ok: false, error: 'Không có quyền.' };
  }

  const tenHieu = input.tenHieu.trim();
  if (tenHieu.length < 1) return { ok: false, error: 'Thiếu tên hiệu gia tiên.' };

  const row = {
    household_id: input.householdId,
    temple_id: input.templeId,
    print_selected: input.printSelected ?? true,
    xung_ho: emptyToNull(input.xungHo),
    ten_hieu: tenHieu,
    ten_nho: emptyToNull(input.tenNho),
    nam_mat: toIntOrNull(input.namMat),
    thang_mat: toIntOrNull(input.thangMat),
    ngay_mat: toIntOrNull(input.ngayMat),
    gio_mat: emptyToNull(input.gioMat),
    an_tang: emptyToNull(input.anTang),
    an_tang_nho: emptyToNull(input.anTangNho),
    sort_order: input.sortOrder ?? 0,
    updated_at: new Date().toISOString(),
  };

  const supabase = await createClient();

  if (input.id) {
    const { error } = await supabase
      .from('so_ancestors')
      .update(row)
      .eq('id', input.id)
      .eq('temple_id', input.templeId);
    if (error) return { ok: false, error: error.message };
    revalidateSo();
    return { ok: true, id: input.id };
  }

  const { data, error } = await supabase
    .from('so_ancestors')
    .insert(row)
    .select('id')
    .maybeSingle();
  if (error) return { ok: false, error: error.message };
  revalidateSo();
  return { ok: true, id: data?.id };
}

export async function deleteAncestor(input: {
  templeId: string;
  id: string;
}): Promise<{ ok: boolean; error?: string }> {
  try {
    await assertTempleAccess(input.templeId);
  } catch {
    return { ok: false, error: 'Không có quyền.' };
  }
  const supabase = await createClient();
  const { error } = await supabase
    .from('so_ancestors')
    .delete()
    .eq('id', input.id)
    .eq('temple_id', input.templeId);
  if (error) return { ok: false, error: error.message };
  revalidateSo();
  return { ok: true };
}

export async function getHouseholdDetail(householdId: string): Promise<{
  ok: boolean;
  error?: string;
  household?: SoHousehold;
  members?: SoHouseholdMember[];
  ancestors?: SoAncestor[];
}> {
  const supabase = await createClient();
  const { data: household, error } = await supabase
    .from('so_households')
    .select('*')
    .eq('id', householdId)
    .is('deleted_at', null)
    .maybeSingle();

  if (error) return { ok: false, error: error.message };
  if (!household) return { ok: false, error: 'Không tìm thấy hộ.' };

  try {
    await assertTempleAccess(household.temple_id);
  } catch {
    return { ok: false, error: 'Không có quyền.' };
  }

  const [{ data: members }, { data: ancestors }] = await Promise.all([
    supabase
      .from('so_household_members')
      .select('*')
      .eq('household_id', householdId)
      .order('sort_order', { ascending: true }),
    supabase
      .from('so_ancestors')
      .select('*')
      .eq('household_id', householdId)
      .order('sort_order', { ascending: true }),
  ]);

  return {
    ok: true,
    household: household as SoHousehold,
    members: (members ?? []) as SoHouseholdMember[],
    ancestors: (ancestors ?? []) as SoAncestor[],
  };
}

export type SoImportMember = {
  hoTen: string;
  namSinh?: number | null;
  gioiTinh?: SoGender | null;
  xungHo?: string;
  vaiTro?: SoMemberRole;
};

export type SoImportAncestor = {
  tenHieu: string;
  xungHo?: string;
  namMat?: number | null;
  anTang?: string;
};

export type SoImportRow = {
  chuHo: string;
  phone?: string;
  diaChiTinh?: string;
  diaChiHuyen?: string;
  diaChiXa?: string;
  diaChiChiTiet?: string;
  noiCung?: string;
  namCung?: number | null;
  thangCung?: number | null;
  ngayCung?: number | null;
  gioCung?: string;
  ghiChu?: string;
  members?: SoImportMember[];
  ancestors?: SoImportAncestor[];
};

export async function importHouseholds(input: {
  templeId: string;
  rows: SoImportRow[];
}): Promise<{ ok: boolean; error?: string; imported?: number }> {
  try {
    await assertTempleAccess(input.templeId);
  } catch {
    return { ok: false, error: 'Không có quyền.' };
  }

  const rows = input.rows.filter((r) => r.chuHo?.trim());
  if (rows.length === 0) return { ok: false, error: 'Không có dòng hợp lệ.' };

  const supabase = await createClient();
  let imported = 0;

  for (const r of rows) {
    const chuHo = r.chuHo.trim();
    const { data: hh, error } = await supabase
      .from('so_households')
      .insert({
        temple_id: input.templeId,
        chu_ho: chuHo,
        phone: emptyToNull(r.phone),
        dia_chi_tinh: emptyToNull(r.diaChiTinh),
        dia_chi_huyen: emptyToNull(r.diaChiHuyen),
        dia_chi_xa: emptyToNull(r.diaChiXa),
        dia_chi_chi_tiet: emptyToNull(r.diaChiChiTiet),
        noi_cung: emptyToNull(r.noiCung),
        nam_cung: toIntOrNull(r.namCung),
        thang_cung: toIntOrNull(r.thangCung),
        ngay_cung: toIntOrNull(r.ngayCung),
        gio_cung: emptyToNull(r.gioCung),
        ghi_chu: emptyToNull(r.ghiChu),
      })
      .select('id')
      .maybeSingle();

    if (error || !hh) {
      return {
        ok: false,
        error: error?.message ?? `Lỗi khi tạo hộ «${chuHo}».`,
        imported,
      };
    }

    const members = (r.members ?? []).filter((m) => m.hoTen?.trim());
    if (members.length > 0) {
      const memberRows = members.map((m, i) => ({
        household_id: hh.id,
        temple_id: input.templeId,
        print_selected: true,
        is_chu_ho: i === 0 || m.vaiTro === 'chu_ho',
        xung_ho: emptyToNull(m.xungHo),
        ho_ten: m.hoTen.trim(),
        gioi_tinh:
          m.gioiTinh === 'nam' || m.gioiTinh === 'nu' ? m.gioiTinh : null,
        nam_sinh: toIntOrNull(m.namSinh),
        vai_tro: m.vaiTro && ROLES.includes(m.vaiTro) ? m.vaiTro : 'gia_quyen',
        sort_order: i,
      }));
      const { error: mErr } = await supabase
        .from('so_household_members')
        .insert(memberRows);
      if (mErr) {
        return { ok: false, error: mErr.message, imported };
      }
    }

    const ancestors = (r.ancestors ?? []).filter((a) => a.tenHieu?.trim());
    if (ancestors.length > 0) {
      const ancestorRows = ancestors.map((a, i) => ({
        household_id: hh.id,
        temple_id: input.templeId,
        print_selected: true,
        xung_ho: emptyToNull(a.xungHo),
        ten_hieu: a.tenHieu.trim(),
        nam_mat: toIntOrNull(a.namMat),
        an_tang: emptyToNull(a.anTang),
        sort_order: i,
      }));
      const { error: aErr } = await supabase
        .from('so_ancestors')
        .insert(ancestorRows);
      if (aErr) {
        return { ok: false, error: aErr.message, imported };
      }
    }

    imported += 1;
  }

  revalidateSo();
  return { ok: true, imported };
}
