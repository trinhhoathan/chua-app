'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import {
  assertTempleAccess,
  requireAdmin,
  searchTemples,
  type TempleBrief,
} from '@/lib/auth';
import { ADMIN_TEMPLE_COOKIE } from '@/lib/platform-hq';

export async function searchTemplesAction(
  q: string,
): Promise<TempleBrief[]> {
  const ctx = await requireAdmin();
  if (!ctx.isSuperAdmin && ctx.temples.length <= 20) {
    const trimmed = q.trim().toLowerCase();
    if (!trimmed) return ctx.temples;
    return ctx.temples.filter(
      (t) =>
        t.name.toLowerCase().includes(trimmed) ||
        t.domain.toLowerCase().includes(trimmed),
    );
  }
  return searchTemples(q, 20);
}

export async function setWorkingTempleAction(
  templeId: string | null,
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    await requireAdmin();
    const cookieStore = await cookies();
    if (!templeId) {
      cookieStore.delete(ADMIN_TEMPLE_COOKIE);
    } else {
      await assertTempleAccess(templeId);
      cookieStore.set(ADMIN_TEMPLE_COOKIE, templeId, {
        path: '/',
        maxAge: 60 * 60 * 24 * 30,
        sameSite: 'lax',
        httpOnly: true,
      });
    }
    revalidatePath('/quan-tri');
    return { ok: true };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : 'Không thể chọn chùa',
    };
  }
}
