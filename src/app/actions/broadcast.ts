'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { assertTempleAccess } from '@/lib/auth';
import {
  getNotifyProviderStatus,
  resolveChannel,
  sendDevoteeNotification,
  type NotifyChannel,
} from '@/lib/notifications';
import type { BroadcastChannel, BroadcastCampaign } from '@/types/database';
import {
  BROADCAST_BATCH_SIZE,
  BROADCAST_MAX_RECIPIENTS,
} from '@/lib/broadcast-constants';

function mapPreferredToNotify(
  channel: BroadcastChannel,
  devoteePreferred: string | null,
): NotifyChannel {
  if (channel === 'log') return 'log';
  if (channel === 'zalo' || channel === 'sms' || channel === 'email') {
    return channel;
  }
  // auto: theo sở thích Phật tử, fallback provider mặc định
  if (
    devoteePreferred === 'zalo' ||
    devoteePreferred === 'sms' ||
    devoteePreferred === 'email' ||
    devoteePreferred === 'phone'
  ) {
    // phone → sms (gọi/SMS cùng số)
    return devoteePreferred === 'phone' ? 'sms' : devoteePreferred;
  }
  return resolveChannel(null);
}

export async function getBroadcastAudienceCount(input: {
  templeId: string;
  consentOnly?: boolean;
}): Promise<{ ok: boolean; count?: number; withPhone?: number; error?: string }> {
  try {
    await assertTempleAccess(input.templeId);
  } catch {
    return { ok: false, error: 'Không có quyền.' };
  }

  const supabase = await createClient();
  let q = supabase
    .from('devotees')
    .select('id, phone, consent_contact')
    .eq('temple_id', input.templeId)
    .not('phone', 'is', null);

  if (input.consentOnly !== false) {
    q = q.eq('consent_contact', true);
  }

  const { data, error } = await q;
  if (error) return { ok: false, error: error.message };

  const rows = data ?? [];
  const withPhone = rows.filter((r) => Boolean(r.phone?.trim())).length;
  return {
    ok: true,
    count: Math.min(withPhone, BROADCAST_MAX_RECIPIENTS),
    withPhone,
  };
}

export async function createBroadcastCampaign(input: {
  templeId: string;
  title: string;
  body: string;
  channel?: BroadcastChannel;
  eventId?: string;
  consentOnly?: boolean;
  dryRun?: boolean;
}): Promise<{
  ok: boolean;
  error?: string;
  campaignId?: string;
  total?: number;
  providers?: ReturnType<typeof getNotifyProviderStatus>;
}> {
  try {
    await assertTempleAccess(input.templeId);
  } catch {
    return { ok: false, error: 'Không có quyền.' };
  }

  const title = input.title.trim();
  const body = input.body.trim();
  if (title.length < 2) return { ok: false, error: 'Thiếu tiêu đề chiến dịch.' };
  if (body.length < 10) {
    return { ok: false, error: 'Nội dung tin nhắn quá ngắn (tối thiểu 10 ký tự).' };
  }
  if (body.length > 500) {
    return {
      ok: false,
      error: 'Nội dung tối đa 500 ký tự (SMS/ZNS thường giới hạn độ dài).',
    };
  }

  const channel: BroadcastChannel = input.dryRun
    ? 'log'
    : (input.channel ?? 'auto');

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Lấy tên chùa + (tuỳ chọn) sự kiện
  const { data: temple } = await supabase
    .from('temples')
    .select('id, name')
    .eq('id', input.templeId)
    .maybeSingle();
  if (!temple) return { ok: false, error: 'Không tìm thấy chùa.' };

  let eventTitle: string | null = null;
  let eventTime: string | null = null;
  let eventLocation: string | null = null;
  if (input.eventId) {
    const { data: ev } = await supabase
      .from('temple_events')
      .select('id, title, starts_at, location')
      .eq('id', input.eventId)
      .eq('temple_id', input.templeId)
      .maybeSingle();
    if (ev) {
      eventTitle = ev.title;
      eventTime = new Intl.DateTimeFormat('vi-VN', {
        dateStyle: 'full',
        timeStyle: 'short',
      }).format(new Date(ev.starts_at));
      eventLocation = ev.location;
    }
  }

  let devoteeQuery = supabase
    .from('devotees')
    .select('id, full_name, phone, preferred_channel, consent_contact')
    .eq('temple_id', input.templeId)
    .not('phone', 'is', null)
    .order('created_at', { ascending: true })
    .limit(BROADCAST_MAX_RECIPIENTS);

  if (input.consentOnly !== false) {
    devoteeQuery = devoteeQuery.eq('consent_contact', true);
  }

  const { data: devotees, error: dErr } = await devoteeQuery;
  if (dErr) return { ok: false, error: dErr.message };

  const recipients = (devotees ?? []).filter((d) => Boolean(d.phone?.trim()));
  if (recipients.length === 0) {
    return {
      ok: false,
      error:
        'Chưa có Phật tử nào đủ điều kiện (có SĐT' +
        (input.consentOnly !== false ? ' và đã đồng ý nhận tin' : '') +
        ').',
    };
  }

  const admin = getSupabaseAdmin();

  const { data: campaign, error: cErr } = await admin
    .from('broadcast_campaigns')
    .insert({
      temple_id: input.templeId,
      title,
      body,
      channel,
      event_id: input.eventId || null,
      status: 'queued',
      audience_filter: {
        consent_only: input.consentOnly !== false,
        dry_run: Boolean(input.dryRun),
      },
      total_recipients: recipients.length,
      sent_count: 0,
      failed_count: 0,
      skipped_count: 0,
      created_by: user?.id ?? null,
      started_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select('id')
    .maybeSingle();

  if (cErr || !campaign) {
    return { ok: false, error: cErr?.message ?? 'Không tạo được chiến dịch.' };
  }

  const logRows = recipients.map((d) => {
    const preferred = mapPreferredToNotify(channel, d.preferred_channel);
    return {
      temple_id: input.templeId,
      channel: preferred,
      recipient: d.phone!.trim(),
      template_key: input.eventId ? 'event_reminder' : 'broadcast_custom',
      payload: {
        customerName: d.full_name,
        templeName: temple.name,
        body,
        title,
        eventTitle,
        eventTime,
        eventLocation,
        devoteeId: d.id,
      },
      status: 'queued' as const,
      campaign_id: campaign.id,
    };
  });

  // Insert theo chunk để tránh payload quá lớn
  const CHUNK = 200;
  for (let i = 0; i < logRows.length; i += CHUNK) {
    const slice = logRows.slice(i, i + CHUNK);
    const { error: iErr } = await admin.from('notification_logs').insert(slice);
    if (iErr) {
      await admin
        .from('broadcast_campaigns')
        .update({
          status: 'failed',
          updated_at: new Date().toISOString(),
        })
        .eq('id', campaign.id);
      return { ok: false, error: iErr.message };
    }
  }

  revalidatePath('/quan-tri/gui-tin');
  return {
    ok: true,
    campaignId: campaign.id,
    total: recipients.length,
    providers: getNotifyProviderStatus(),
  };
}

export async function processBroadcastBatch(input: {
  templeId: string;
  campaignId: string;
  batchSize?: number;
}): Promise<{
  ok: boolean;
  error?: string;
  done?: boolean;
  processed?: number;
  sent?: number;
  failed?: number;
  remaining?: number;
  campaign?: BroadcastCampaign;
}> {
  try {
    await assertTempleAccess(input.templeId);
  } catch {
    return { ok: false, error: 'Không có quyền.' };
  }

  const admin = getSupabaseAdmin();
  const batchSize = Math.min(
    Math.max(input.batchSize ?? BROADCAST_BATCH_SIZE, 1),
    100,
  );

  const { data: campaign, error: cErr } = await admin
    .from('broadcast_campaigns')
    .select('*')
    .eq('id', input.campaignId)
    .eq('temple_id', input.templeId)
    .maybeSingle();

  if (cErr || !campaign) {
    return { ok: false, error: cErr?.message ?? 'Không tìm thấy chiến dịch.' };
  }

  if (campaign.status === 'cancelled') {
    return { ok: false, error: 'Chiến dịch đã hủy.', done: true };
  }
  if (campaign.status === 'completed') {
    return {
      ok: true,
      done: true,
      processed: 0,
      remaining: 0,
      campaign: campaign as BroadcastCampaign,
    };
  }

  await admin
    .from('broadcast_campaigns')
    .update({
      status: 'sending',
      updated_at: new Date().toISOString(),
    })
    .eq('id', campaign.id);

  const { data: queue } = await admin
    .from('notification_logs')
    .select('id, recipient, template_key, payload, channel')
    .eq('campaign_id', campaign.id)
    .eq('status', 'queued')
    .order('created_at', { ascending: true })
    .limit(batchSize);

  const items = queue ?? [];
  let sent = 0;
  let failed = 0;

  for (const item of items) {
    const preferred = (item.channel as NotifyChannel) || 'log';
    const result = await sendDevoteeNotification({
      templeId: input.templeId,
      recipient: item.recipient,
      templateKey: item.template_key,
      payload: (item.payload as Record<string, unknown>) ?? {},
      campaignId: campaign.id,
      preferredChannel: preferred,
      logId: item.id,
    });
    if (result.ok) sent += 1;
    else failed += 1;
  }

  // Đếm lại trạng thái
  const { count: remaining } = await admin
    .from('notification_logs')
    .select('id', { count: 'exact', head: true })
    .eq('campaign_id', campaign.id)
    .eq('status', 'queued');

  const { count: sentTotal } = await admin
    .from('notification_logs')
    .select('id', { count: 'exact', head: true })
    .eq('campaign_id', campaign.id)
    .eq('status', 'sent');

  const { count: failedTotal } = await admin
    .from('notification_logs')
    .select('id', { count: 'exact', head: true })
    .eq('campaign_id', campaign.id)
    .eq('status', 'failed');

  const left = remaining ?? 0;
  const done = left === 0;
  const nextStatus = done ? 'completed' : 'sending';

  const { data: updated } = await admin
    .from('broadcast_campaigns')
    .update({
      status: nextStatus,
      sent_count: sentTotal ?? 0,
      failed_count: failedTotal ?? 0,
      completed_at: done ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', campaign.id)
    .select('*')
    .maybeSingle();

  if (done) revalidatePath('/quan-tri/gui-tin');

  return {
    ok: true,
    done,
    processed: items.length,
    sent,
    failed,
    remaining: left,
    campaign: (updated ?? campaign) as BroadcastCampaign,
  };
}

export async function cancelBroadcastCampaign(input: {
  templeId: string;
  campaignId: string;
}): Promise<{ ok: boolean; error?: string }> {
  try {
    await assertTempleAccess(input.templeId);
  } catch {
    return { ok: false, error: 'Không có quyền.' };
  }

  const admin = getSupabaseAdmin();
  const { error } = await admin
    .from('broadcast_campaigns')
    .update({
      status: 'cancelled',
      completed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', input.campaignId)
    .eq('temple_id', input.templeId);

  if (error) return { ok: false, error: error.message };

  // Bỏ qua các tin còn trong hàng đợi
  await admin
    .from('notification_logs')
    .update({ status: 'skipped', error_message: 'Campaign cancelled' })
    .eq('campaign_id', input.campaignId)
    .eq('status', 'queued');

  revalidatePath('/quan-tri/gui-tin');
  return { ok: true };
}

export async function getNotifyProvidersAction(): Promise<
  ReturnType<typeof getNotifyProviderStatus>
> {
  return getNotifyProviderStatus();
}
