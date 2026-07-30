'use server';

import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/auth';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import {
  DEFAULT_ADMIN_PIN,
  isNumericPin,
  normalizeLoginPhone,
  phoneToLoginEmail,
} from '@/lib/admin-phone-auth';

async function requireSuperAdmin() {
  const ctx = await requireAdmin();
  if (!ctx.isSuperAdmin) {
    throw new Error('FORBIDDEN');
  }
  return ctx;
}

export type MemberAdminResult = { ok: true } | { ok: false; error: string };

export async function listTempleMembersAction(): Promise<{
  ok: boolean;
  error?: string;
  members?: Array<{
    id: string;
    user_id: string;
    temple_id: string;
    temple_name: string;
    role: 'admin' | 'staff';
    display_name: string | null;
    phone: string | null;
    is_super_admin: boolean;
    is_active: boolean;
    created_at: string;
  }>;
}> {
  try {
    await requireSuperAdmin();
  } catch {
    return { ok: false, error: 'Chỉ quản trị viên nền tảng mới xem được.' };
  }

  const admin = getSupabaseAdmin();
  const { data, error } = await admin
    .from('temple_admins')
    .select(
      'id, user_id, temple_id, role, display_name, phone, is_super_admin, is_active, created_at, temples(name)',
    )
    .order('created_at', { ascending: false });

  if (error) return { ok: false, error: error.message };

  const members = (data ?? []).map((row) => {
    const templeRel = row.temples as { name?: string } | { name?: string }[] | null;
    const templeName = Array.isArray(templeRel)
      ? templeRel[0]?.name
      : templeRel?.name;
    return {
      id: String(row.id),
      user_id: String(row.user_id),
      temple_id: String(row.temple_id),
      temple_name: templeName ?? '—',
      role: row.role as 'admin' | 'staff',
      display_name: (row.display_name as string) ?? null,
      phone: (row.phone as string) ?? null,
      is_super_admin: Boolean(row.is_super_admin),
      is_active: Boolean(row.is_active),
      created_at: String(row.created_at),
    };
  });

  return { ok: true, members };
}

export async function createTempleMemberAction(input: {
  phone: string;
  password?: string;
  templeId: string;
  displayName: string;
  role: 'admin' | 'staff';
  isSuperAdmin?: boolean;
}): Promise<MemberAdminResult> {
  try {
    await requireSuperAdmin();
  } catch {
    return { ok: false, error: 'Chỉ quản trị viên nền tảng mới tạo được tài khoản.' };
  }

  const phone = normalizeLoginPhone(input.phone);
  if (!phone) {
    return { ok: false, error: 'Số điện thoại không hợp lệ (cần 10 số, bắt đầu bằng 0).' };
  }
  const password = String(input.password ?? '').trim() || DEFAULT_ADMIN_PIN;
  if (!isNumericPin(password)) {
    return { ok: false, error: 'Mật khẩu phải đúng 6 chữ số.' };
  }
  const displayName = input.displayName.trim();
  if (displayName.length < 2) {
    return { ok: false, error: 'Vui lòng nhập tên hiển thị.' };
  }
  if (input.role !== 'admin' && input.role !== 'staff') {
    return { ok: false, error: 'Vai trò không hợp lệ.' };
  }

  const admin = getSupabaseAdmin();

  const { data: temple } = await admin
    .from('temples')
    .select('id')
    .eq('id', input.templeId)
    .maybeSingle();
  if (!temple) return { ok: false, error: 'Không tìm thấy chùa.' };

  const { data: phoneTaken } = await admin
    .from('temple_admins')
    .select('id')
    .eq('phone', phone)
    .eq('is_active', true)
    .maybeSingle();
  if (phoneTaken) {
    return { ok: false, error: 'Số điện thoại này đã được gán cho tài khoản khác.' };
  }

  const email = phoneToLoginEmail(phone);
  const { data: created, error: createErr } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      phone,
      display_name: displayName,
    },
  });

  if (createErr || !created.user) {
    const msg = createErr?.message ?? 'Không tạo được tài khoản.';
    if (/already|registered|exists/i.test(msg)) {
      return {
        ok: false,
        error: 'Số điện thoại đã có tài khoản Auth. Hãy gắn lại từ danh sách hoặc đổi SĐT.',
      };
    }
    return { ok: false, error: msg };
  }

  const { error: linkErr } = await admin.from('temple_admins').insert({
    user_id: created.user.id,
    temple_id: input.templeId,
    role: input.role,
    display_name: displayName,
    phone,
    is_super_admin: Boolean(input.isSuperAdmin),
    is_active: true,
  });

  if (linkErr) {
    await admin.auth.admin.deleteUser(created.user.id);
    return { ok: false, error: linkErr.message };
  }

  revalidatePath('/quan-tri/thanh-vien');
  return { ok: true };
}

export async function updateTempleMemberAction(input: {
  id: string;
  displayName?: string;
  role?: 'admin' | 'staff';
  templeId?: string;
  isActive?: boolean;
  isSuperAdmin?: boolean;
}): Promise<MemberAdminResult> {
  try {
    await requireSuperAdmin();
  } catch {
    return { ok: false, error: 'Chỉ quản trị viên nền tảng mới sửa được.' };
  }

  const patch: Record<string, unknown> = {};
  if (typeof input.displayName === 'string') {
    const name = input.displayName.trim();
    if (name.length < 2) return { ok: false, error: 'Tên hiển thị quá ngắn.' };
    patch.display_name = name;
  }
  if (input.role === 'admin' || input.role === 'staff') {
    patch.role = input.role;
  }
  if (typeof input.templeId === 'string') {
    patch.temple_id = input.templeId;
  }
  if (typeof input.isActive === 'boolean') {
    patch.is_active = input.isActive;
  }
  if (typeof input.isSuperAdmin === 'boolean') {
    patch.is_super_admin = input.isSuperAdmin;
  }
  if (Object.keys(patch).length === 0) {
    return { ok: false, error: 'Không có thay đổi.' };
  }

  const admin = getSupabaseAdmin();
  const { error } = await admin
    .from('temple_admins')
    .update(patch)
    .eq('id', input.id);

  if (error) return { ok: false, error: error.message };
  revalidatePath('/quan-tri/thanh-vien');
  return { ok: true };
}

export async function resetTempleMemberPasswordAction(input: {
  id: string;
  password: string;
}): Promise<MemberAdminResult> {
  try {
    await requireSuperAdmin();
  } catch {
    return { ok: false, error: 'Chỉ quản trị viên nền tảng mới đổi mật khẩu.' };
  }
  if (!isNumericPin(input.password)) {
    return { ok: false, error: 'Mật khẩu phải đúng 6 chữ số.' };
  }

  const admin = getSupabaseAdmin();
  const { data: row, error } = await admin
    .from('temple_admins')
    .select('user_id')
    .eq('id', input.id)
    .maybeSingle();
  if (error || !row) return { ok: false, error: 'Không tìm thấy thành viên.' };

  const { error: updErr } = await admin.auth.admin.updateUserById(
    String(row.user_id),
    { password: input.password },
  );
  if (updErr) return { ok: false, error: updErr.message };

  revalidatePath('/quan-tri/thanh-vien');
  return { ok: true };
}
