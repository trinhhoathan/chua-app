import { createClient } from '@/lib/supabase/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { loginEmailToPhone } from '@/lib/admin-phone-auth';
import type { Temple } from '@/types/database';

export type TempleBrief = Pick<
  Temple,
  'id' | 'name' | 'domain' | 'primary_color'
>;

export interface TempleAdminRow {
  id: string;
  user_id: string;
  temple_id: string;
  role: 'admin' | 'staff';
  display_name: string | null;
  phone: string | null;
  is_super_admin: boolean;
  is_active: boolean;
}

export interface AdminContext {
  userId: string;
  email: string | null;
  phone: string | null;
  displayName: string | null;
  isSuperAdmin: boolean;
  memberships: TempleAdminRow[];
  /** Chùa trong membership (trụ trì) — SuperAdmin không nhận full list 15k. */
  temples: TempleBrief[];
  /** Tổng số Phật tự active (chỉ meaningful khi isSuperAdmin). */
  templeCount: number;
}

export async function getSessionUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function requireAdmin(): Promise<AdminContext> {
  const user = await getSessionUser();
  if (!user) {
    throw new Error('UNAUTHENTICATED');
  }

  const supabase = await createClient();
  const { data: memberships, error } = await supabase
    .from('temple_admins')
    .select('*')
    .eq('user_id', user.id)
    .eq('is_active', true);

  if (error) {
    throw new Error(error.message);
  }

  const rows = (memberships ?? []) as TempleAdminRow[];
  if (rows.length === 0) {
    throw new Error('FORBIDDEN');
  }

  const isSuperAdmin = rows.some((r) => r.is_super_admin);
  const templeIds = [...new Set(rows.map((r) => r.temple_id))];

  let temples: TempleBrief[] = [];
  let templeCount = 0;

  if (isSuperAdmin) {
    const [{ count }, membershipTemples] = await Promise.all([
      supabase
        .from('temples')
        .select('id', { count: 'exact', head: true })
        .eq('is_active', true),
      templeIds.length
        ? supabase
            .from('temples')
            .select('id, name, domain, primary_color')
            .in('id', templeIds)
            .eq('is_active', true)
            .order('name')
        : Promise.resolve({ data: [] as TempleBrief[] }),
    ]);
    templeCount = count ?? 0;
    temples = (membershipTemples.data ?? []) as TempleBrief[];
  } else {
    const { data } = await supabase
      .from('temples')
      .select('id, name, domain, primary_color')
      .in('id', templeIds)
      .eq('is_active', true)
      .order('name');
    temples = (data ?? []) as TempleBrief[];
    templeCount = temples.length;
  }

  const phoneFromMeta =
    typeof user.user_metadata?.phone === 'string'
      ? user.user_metadata.phone
      : null;

  return {
    userId: user.id,
    email: user.email ?? null,
    phone:
      rows.find((r) => r.phone)?.phone ??
      phoneFromMeta ??
      loginEmailToPhone(user.email) ??
      null,
    displayName: rows.find((r) => r.display_name)?.display_name ?? null,
    isSuperAdmin,
    memberships: rows,
    temples,
    templeCount,
  };
}

export async function assertTempleAccess(
  templeId: string,
): Promise<AdminContext> {
  const ctx = await requireAdmin();
  if (ctx.isSuperAdmin) return ctx;
  if (!ctx.memberships.some((m) => m.temple_id === templeId)) {
    throw new Error('FORBIDDEN');
  }
  return ctx;
}

export async function getTempleById(
  id: string,
): Promise<TempleBrief | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('temples')
    .select('id, name, domain, primary_color')
    .eq('id', id)
    .eq('is_active', true)
    .maybeSingle();
  return (data as TempleBrief | null) ?? null;
}

export async function searchTemples(
  q: string,
  limit = 20,
): Promise<TempleBrief[]> {
  await requireAdmin();
  const supabase = await createClient();
  const trimmed = q.trim().replace(/[%_,]/g, ' ').slice(0, 80);
  let query = supabase
    .from('temples')
    .select('id, name, domain, primary_color')
    .eq('is_active', true)
    .order('name')
    .limit(limit);

  if (trimmed) {
    query = query.or(
      `name.ilike.%${trimmed}%,domain.ilike.%${trimmed}%`,
    );
  }

  const { data } = await query;
  return (data ?? []) as TempleBrief[];
}

/** Prefer service role when available; fall back to user session client. */
export async function getAdminDb() {
  if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return getSupabaseAdmin();
  }
  return createClient();
}
