'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

export async function loginAction(formData: FormData): Promise<void> {
  const email = String(formData.get('email') ?? '').trim();
  const password = String(formData.get('password') ?? '');
  const next = String(formData.get('next') ?? '/quan-tri');

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    redirect(
      `/quan-tri/dang-nhap?error=${encodeURIComponent(error.message)}&next=${encodeURIComponent(next)}`,
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
