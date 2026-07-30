'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/auth';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import {
  isValidLoginPassword,
  normalizeLoginPhone,
  phoneToLoginEmail,
} from '@/lib/admin-phone-auth';

export async function loginAction(formData: FormData): Promise<void> {
  const phoneRaw = String(formData.get('phone') ?? '').trim();
  const password = String(formData.get('password') ?? '');
  const next = String(formData.get('next') ?? '/quan-tri');

  const phone = normalizeLoginPhone(phoneRaw);
  if (!phone) {
    redirect(
      `/quan-tri/dang-nhap?error=${encodeURIComponent('Số điện thoại không hợp lệ (cần 10 số, bắt đầu bằng 0).')}&next=${encodeURIComponent(next)}`,
    );
  }
  if (!isValidLoginPassword(password)) {
    redirect(
      `/quan-tri/dang-nhap?error=${encodeURIComponent('Mật khẩu không hợp lệ (PIN 6 số hoặc mật khẩu từ 8 ký tự).')}&next=${encodeURIComponent(next)}`,
    );
  }

  const email = phoneToLoginEmail(phone);
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    redirect(
      `/quan-tri/dang-nhap?error=${encodeURIComponent('Sai số điện thoại hoặc mật khẩu.')}&next=${encodeURIComponent(next)}`,
    );
  }
  revalidatePath('/quan-tri');
  redirect(next.startsWith('/quan-tri') ? next : '/quan-tri');
}

export async function logoutAction(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath('/quan-tri');
  redirect('/quan-tri/dang-nhap');
}

export async function changeOwnPasswordAction(input: {
  currentPassword: string;
  newPassword: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  let ctx;
  try {
    ctx = await requireAdmin();
  } catch {
    return { ok: false, error: 'Bạn cần đăng nhập lại.' };
  }

  const currentPassword = String(input.currentPassword ?? '');
  const newPassword = String(input.newPassword ?? '');

  if (!isValidLoginPassword(currentPassword)) {
    return {
      ok: false,
      error: 'Mật khẩu hiện tại không hợp lệ (PIN 6 số hoặc ≥ 8 ký tự).',
    };
  }
  if (!isValidLoginPassword(newPassword)) {
    return {
      ok: false,
      error: 'Mật khẩu mới không hợp lệ (PIN 6 số hoặc ≥ 8 ký tự).',
    };
  }
  if (currentPassword === newPassword) {
    return { ok: false, error: 'Mật khẩu mới phải khác mật khẩu hiện tại.' };
  }

  const email =
    ctx.email?.trim() ||
    (ctx.phone ? phoneToLoginEmail(ctx.phone) : null);
  if (!email) {
    return { ok: false, error: 'Không xác định được tài khoản đăng nhập.' };
  }

  const supabase = await createClient();
  const { error: verifyError } = await supabase.auth.signInWithPassword({
    email,
    password: currentPassword,
  });
  if (verifyError) {
    return { ok: false, error: 'Mật khẩu hiện tại không đúng.' };
  }

  const admin = getSupabaseAdmin();
  const { error: updateError } = await admin.auth.admin.updateUserById(
    ctx.userId,
    { password: newPassword },
  );
  if (updateError) {
    return { ok: false, error: updateError.message };
  }

  return { ok: true };
}
