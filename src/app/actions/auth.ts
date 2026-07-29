'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import {
  isNumericPin,
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
  if (!isNumericPin(password)) {
    redirect(
      `/quan-tri/dang-nhap?error=${encodeURIComponent('Mật khẩu phải đúng 6 chữ số.')}&next=${encodeURIComponent(next)}`,
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
