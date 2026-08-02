import 'server-only';
import { headers } from 'next/headers';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import type { CredentialAuditAction } from '@/lib/admin-credential-labels';
import { credentialActionLabel } from '@/lib/admin-credential-labels';

export type { CredentialAuditAction };
export { credentialActionLabel };

export type CredentialAuditEvent = {
  action: CredentialAuditAction;
  actorUserId: string | null;
  actorPhone: string | null;
  actorDisplayName: string | null;
  targetUserId: string | null;
  targetAdminId: string | null;
  targetPhone: string | null;
  targetDisplayName: string | null;
  templeId: string | null;
  oldPhone?: string | null;
  newPhone?: string | null;
  ip?: string | null;
  userAgent?: string | null;
};

export type CredentialAuditRow = {
  id: string;
  action: CredentialAuditAction;
  actor_phone: string | null;
  actor_display_name: string | null;
  target_phone: string | null;
  target_display_name: string | null;
  temple_id: string | null;
  temple_name: string | null;
  old_phone: string | null;
  new_phone: string | null;
  ip: string | null;
  user_agent: string | null;
  created_at: string;
};

const TEMPLATE_PREFIX = 'admin.credential.';

export async function getRequestClientMeta(): Promise<{
  ip: string;
  userAgent: string | null;
}> {
  const h = await headers();
  const xf = h.get('x-forwarded-for');
  const ip =
    xf?.split(',')[0]?.trim() ||
    h.get('x-real-ip')?.trim() ||
    h.get('cf-connecting-ip')?.trim() ||
    'unknown';
  return {
    ip,
    userAgent: h.get('user-agent'),
  };
}

export async function logAdminCredentialEvent(
  event: CredentialAuditEvent,
): Promise<void> {
  const admin = getSupabaseAdmin();
  const dedicated = {
    action: event.action,
    actor_user_id: event.actorUserId,
    actor_phone: event.actorPhone,
    actor_display_name: event.actorDisplayName,
    target_user_id: event.targetUserId,
    target_admin_id: event.targetAdminId,
    target_phone: event.targetPhone,
    target_display_name: event.targetDisplayName,
    temple_id: event.templeId,
    old_phone: event.oldPhone ?? null,
    new_phone: event.newPhone ?? null,
    ip: event.ip ?? null,
    user_agent: event.userAgent ?? null,
  };

  const { error } = await admin.from('admin_credential_logs').insert(dedicated);
  if (!error) return;

  // Fallback khi chưa apply migration: dùng notification_logs (không lẫn broadcast).
  if (!event.templeId) {
    console.error(
      '[credential-audit] thiếu temple_id, bỏ qua fallback log',
      error.message,
    );
    return;
  }

  const { error: fallbackErr } = await admin.from('notification_logs').insert({
    temple_id: event.templeId,
    channel: 'log',
    recipient: event.targetPhone ?? event.targetUserId ?? 'unknown',
    template_key: `${TEMPLATE_PREFIX}${event.action}`,
    status: 'sent',
    payload: {
      kind: 'admin_credential',
      action: event.action,
      actor_user_id: event.actorUserId,
      actor_phone: event.actorPhone,
      actor_display_name: event.actorDisplayName,
      target_user_id: event.targetUserId,
      target_admin_id: event.targetAdminId,
      target_phone: event.targetPhone,
      target_display_name: event.targetDisplayName,
      old_phone: event.oldPhone ?? null,
      new_phone: event.newPhone ?? null,
      ip: event.ip ?? null,
      user_agent: event.userAgent ?? null,
    },
  });

  if (fallbackErr) {
    console.error('[credential-audit] ghi log thất bại', fallbackErr.message);
  }
}

function isCredentialAction(value: unknown): value is CredentialAuditAction {
  return (
    value === 'password_reset' ||
    value === 'password_change' ||
    value === 'phone_change'
  );
}

export async function listAdminCredentialLogs(
  limit = 50,
): Promise<CredentialAuditRow[]> {
  const admin = getSupabaseAdmin();
  const take = Math.min(Math.max(limit, 1), 200);

  const dedicated = await admin
    .from('admin_credential_logs')
    .select(
      'id, action, actor_phone, actor_display_name, target_phone, target_display_name, temple_id, old_phone, new_phone, ip, user_agent, created_at, temples(name)',
    )
    .order('created_at', { ascending: false })
    .limit(take);

  if (!dedicated.error && dedicated.data) {
    return dedicated.data.map((row) => {
      const templeRel = row.temples as
        | { name?: string }
        | { name?: string }[]
        | null;
      const templeName = Array.isArray(templeRel)
        ? templeRel[0]?.name
        : templeRel?.name;
      return {
        id: String(row.id),
        action: row.action as CredentialAuditAction,
        actor_phone: (row.actor_phone as string) ?? null,
        actor_display_name: (row.actor_display_name as string) ?? null,
        target_phone: (row.target_phone as string) ?? null,
        target_display_name: (row.target_display_name as string) ?? null,
        temple_id: (row.temple_id as string) ?? null,
        temple_name: templeName ?? null,
        old_phone: (row.old_phone as string) ?? null,
        new_phone: (row.new_phone as string) ?? null,
        ip: (row.ip as string) ?? null,
        user_agent: (row.user_agent as string) ?? null,
        created_at: String(row.created_at),
      };
    });
  }

  const { data, error } = await admin
    .from('notification_logs')
    .select('id, temple_id, template_key, payload, created_at, temples(name)')
    .like('template_key', `${TEMPLATE_PREFIX}%`)
    .order('created_at', { ascending: false })
    .limit(take);

  if (error || !data) return [];

  return data.flatMap((row) => {
    const payload =
      row.payload && typeof row.payload === 'object'
        ? (row.payload as Record<string, unknown>)
        : {};
    const fromKey = String(row.template_key ?? '').replace(TEMPLATE_PREFIX, '');
    const action = isCredentialAction(payload.action)
      ? payload.action
      : isCredentialAction(fromKey)
        ? fromKey
        : null;
    if (!action) return [];

    const templeRel = row.temples as
      | { name?: string }
      | { name?: string }[]
      | null;
    const templeName = Array.isArray(templeRel)
      ? templeRel[0]?.name
      : templeRel?.name;

    return [
      {
        id: String(row.id),
        action,
        actor_phone:
          typeof payload.actor_phone === 'string' ? payload.actor_phone : null,
        actor_display_name:
          typeof payload.actor_display_name === 'string'
            ? payload.actor_display_name
            : null,
        target_phone:
          typeof payload.target_phone === 'string'
            ? payload.target_phone
            : null,
        target_display_name:
          typeof payload.target_display_name === 'string'
            ? payload.target_display_name
            : null,
        temple_id: (row.temple_id as string) ?? null,
        temple_name: templeName ?? null,
        old_phone:
          typeof payload.old_phone === 'string' ? payload.old_phone : null,
        new_phone:
          typeof payload.new_phone === 'string' ? payload.new_phone : null,
        ip: typeof payload.ip === 'string' ? payload.ip : null,
        user_agent:
          typeof payload.user_agent === 'string' ? payload.user_agent : null,
        created_at: String(row.created_at),
      },
    ];
  });
}
