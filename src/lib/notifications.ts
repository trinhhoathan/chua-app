import 'server-only';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

export type NotifyChannel = 'zalo' | 'sms' | 'email' | 'log';

export interface NotifyInput {
  templeId: string;
  recipient: string;
  templateKey: string;
  payload: Record<string, unknown>;
  relatedOrderId?: string;
  campaignId?: string;
  preferredChannel?: NotifyChannel;
  /** Bỏ qua ghi log (dùng khi đã có row queued sẵn). */
  skipLogInsert?: boolean;
  /** Cập nhật log đã tồn tại thay vì insert. */
  logId?: string;
}

export interface NotifyResult {
  ok: boolean;
  channel: NotifyChannel;
  status: 'sent' | 'failed' | 'skipped' | 'queued';
  error?: string;
}

/**
 * Gửi thông báo 1 người.
 * Ưu tiên kênh:
 * 1. preferredChannel nếu truyền vào
 * 2. Zalo ZNS (phone) nếu có ZALO_ZNS_ACCESS_TOKEN + ZALO_ZNS_TEMPLATE_ID
 * 3. Zalo OA CS (cần user_id follower) nếu ZALO_OA_ACCESS_TOKEN
 * 4. SMS nếu SMS_API_URL
 * 5. log (dry-run an toàn)
 */
export async function sendDevoteeNotification(
  input: NotifyInput,
): Promise<NotifyResult> {
  const channel = resolveChannel(input.preferredChannel);

  let status: NotifyResult['status'] = 'queued';
  let errorMessage: string | null = null;

  try {
    if (channel === 'zalo') {
      const result = await sendZalo(input.recipient, input.templateKey, input.payload);
      status = result.ok ? 'sent' : 'failed';
      errorMessage = result.error ?? null;
    } else if (channel === 'sms') {
      const result = await sendSms(input.recipient, input.templateKey, input.payload);
      status = result.ok ? 'sent' : 'failed';
      errorMessage = result.error ?? null;
    } else if (channel === 'email') {
      const result = await sendEmail(input.recipient, input.templateKey, input.payload);
      status = result.ok ? 'sent' : 'failed';
      errorMessage = result.error ?? null;
    } else {
      // Dry-run / chưa cấu hình provider — coi như gửi thành công vào log.
      status = 'sent';
    }
  } catch (e) {
    status = 'failed';
    errorMessage = e instanceof Error ? e.message : 'Unknown error';
  }

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return {
      ok: status === 'sent',
      channel,
      status,
      error: errorMessage ?? undefined,
    };
  }

  const admin = getSupabaseAdmin();

  if (input.logId) {
    await admin
      .from('notification_logs')
      .update({
        channel,
        status,
        error_message: errorMessage,
        payload: input.payload,
      })
      .eq('id', input.logId);
  } else if (!input.skipLogInsert) {
    await admin.from('notification_logs').insert({
      temple_id: input.templeId,
      channel,
      recipient: input.recipient,
      template_key: input.templateKey,
      payload: input.payload,
      status,
      error_message: errorMessage,
      related_order_id: input.relatedOrderId ?? null,
      campaign_id: input.campaignId ?? null,
    });
  }

  return {
    ok: status === 'sent',
    channel,
    status,
    error: errorMessage ?? undefined,
  };
}

export function resolveChannel(
  preferred?: NotifyChannel | null,
): NotifyChannel {
  if (preferred && preferred !== 'log') {
    if (preferred === 'zalo' && hasZaloProvider()) return 'zalo';
    if (preferred === 'sms' && process.env.SMS_API_URL) return 'sms';
    if (preferred === 'email' && process.env.EMAIL_API_URL) return 'email';
    // Kênh yêu cầu chưa cấu hình → fallback log (không fail cứng).
    if (preferred === 'zalo' || preferred === 'sms' || preferred === 'email') {
      return process.env.SMS_API_URL
        ? 'sms'
        : hasZaloProvider()
          ? 'zalo'
          : 'log';
    }
  }

  if (hasZaloProvider()) return 'zalo';
  if (process.env.SMS_API_URL) return 'sms';
  if (process.env.EMAIL_API_URL) return 'email';
  return 'log';
}

function hasZaloProvider(): boolean {
  return Boolean(
    process.env.ZALO_ZNS_ACCESS_TOKEN || process.env.ZALO_OA_ACCESS_TOKEN,
  );
}

async function sendZalo(
  recipient: string,
  templateKey: string,
  payload: Record<string, unknown>,
): Promise<{ ok: boolean; error?: string }> {
  const message = buildMessage(templateKey, payload);
  const phone = normalizePhoneVn(recipient);

  // ZNS — gửi theo SĐT (phù hợp sổ Phật tử).
  const znsToken = process.env.ZALO_ZNS_ACCESS_TOKEN;
  const znsTemplateId = process.env.ZALO_ZNS_TEMPLATE_ID;
  if (znsToken && znsTemplateId && phone) {
    const res = await fetch('https://business.openapi.zalo.me/message/template', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        access_token: znsToken,
      },
      body: JSON.stringify({
        phone,
        template_id: znsTemplateId,
        template_data: {
          customer_name: String(payload.customerName ?? 'Phật tử'),
          temple_name: String(payload.templeName ?? ''),
          event_title: String(payload.eventTitle ?? payload.title ?? ''),
          event_time: String(payload.eventTime ?? ''),
          event_location: String(payload.eventLocation ?? ''),
          body: message.slice(0, 400),
        },
      }),
    });
    const json = (await res.json().catch(() => ({}))) as {
      error?: number;
      message?: string;
    };
    if (!res.ok || (json.error != null && json.error !== 0)) {
      return {
        ok: false,
        error: `ZNS ${res.status}: ${json.message ?? 'failed'}`,
      };
    }
    return { ok: true };
  }

  // OA CS message — cần Zalo user_id (follower), không phải SĐT.
  const oaToken = process.env.ZALO_OA_ACCESS_TOKEN;
  if (oaToken) {
    const res = await fetch('https://openapi.zalo.me/v3.0/oa/message/cs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        access_token: oaToken,
      },
      body: JSON.stringify({
        recipient: { user_id: recipient },
        message: { text: message },
      }),
    });
    if (!res.ok) {
      return { ok: false, error: `Zalo OA HTTP ${res.status}` };
    }
    return { ok: true };
  }

  return { ok: false, error: 'Chưa cấu hình ZALO_ZNS_ACCESS_TOKEN hoặc ZALO_OA_ACCESS_TOKEN.' };
}

async function sendSms(
  recipient: string,
  templateKey: string,
  payload: Record<string, unknown>,
): Promise<{ ok: boolean; error?: string }> {
  const url = process.env.SMS_API_URL;
  if (!url) return { ok: false, error: 'Chưa cấu hình SMS_API_URL.' };

  const key = process.env.SMS_API_KEY ?? '';
  const message = buildMessage(templateKey, payload);
  const phone = normalizePhoneVn(recipient) || recipient;

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({ to: phone, text: message }),
  });
  if (!res.ok) {
    return { ok: false, error: `SMS HTTP ${res.status}` };
  }
  return { ok: true };
}

async function sendEmail(
  recipient: string,
  templateKey: string,
  payload: Record<string, unknown>,
): Promise<{ ok: boolean; error?: string }> {
  const url = process.env.EMAIL_API_URL;
  if (!url) return { ok: false, error: 'Chưa cấu hình EMAIL_API_URL.' };

  const key = process.env.EMAIL_API_KEY ?? '';
  const message = buildMessage(templateKey, payload);
  const subject = String(
    payload.emailSubject ??
      `Thông báo từ ${payload.templeName ?? 'nhà chùa'}`,
  );

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      to: recipient,
      subject,
      text: message,
    }),
  });
  if (!res.ok) {
    return { ok: false, error: `Email HTTP ${res.status}` };
  }
  return { ok: true };
}

/** Chuẩn hoá SĐT VN → 84xxxxxxxxx (ZNS thường yêu cầu dạng này). */
export function normalizePhoneVn(raw: string): string | null {
  const digits = raw.replace(/[^\d]/g, '');
  if (!digits) return null;
  if (digits.startsWith('84') && digits.length >= 11) return digits;
  if (digits.startsWith('0') && digits.length >= 9) return `84${digits.slice(1)}`;
  if (digits.length === 9 || digits.length === 10) return `84${digits}`;
  return digits;
}

export function buildMessage(
  templateKey: string,
  payload: Record<string, unknown>,
): string {
  const name = String(payload.customerName ?? 'Phật tử');
  const temple = String(payload.templeName ?? 'chùa');
  const code = String(payload.orderCode ?? '');
  const qty = String(payload.quantity ?? '');
  const total = String(payload.totalAmount ?? '');
  const customBody = String(payload.body ?? '').trim();

  switch (templateKey) {
    case 'water_order_created':
      return `Nam mô A Di Đà Phật. ${temple} đã ghi nhận phát tâm thỉnh nước của ${name}. Mã: ${code}. Số thùng: ${qty}. Mức phát tâm: ${total}đ. Xin cảm niệm.`;
    case 'water_order_paid':
      return `Nam mô A Di Đà Phật. ${temple} đã xác nhận công đức nước tinh khiết của ${name} (mã ${code}). Xin hồi hướng công đức.`;
    case 'prayer_received':
      return `Nam mô A Di Đà Phật. ${temple} đã nhận sớ ${payload.requestType === 'cau_sieu' ? 'cầu siêu' : 'cầu an'} của ${name}. Chúng con sẽ chuẩn bị cho đại lễ.`;
    case 'devotee_registered':
      return `Nam mô A Di Đà Phật. ${temple} đã ghi nhận ${name} kết duyên cùng nhà chùa. Xin cảm niệm.`;
    case 'event_reminder':
    case 'broadcast_custom': {
      if (customBody) {
        return customBody.replaceAll('{ten}', name).replaceAll('{chua}', temple);
      }
      const title = String(payload.eventTitle ?? payload.title ?? 'hoạt động');
      const time = String(payload.eventTime ?? '');
      const location = String(payload.eventLocation ?? '');
      return [
        `Nam mô A Di Đà Phật.`,
        `${temple} kính mời ${name} tham dự: ${title}.`,
        time ? `Thời gian: ${time}.` : '',
        location ? `Địa điểm: ${location}.` : '',
        `Trân trọng.`,
      ]
        .filter(Boolean)
        .join(' ');
    }
    default:
      return customBody || `Thông báo từ ${temple}.`;
  }
}

/** Mô tả provider đang sẵn sàng (cho UI admin). */
export function getNotifyProviderStatus(): {
  zalo: boolean;
  sms: boolean;
  email: boolean;
  defaultChannel: NotifyChannel;
} {
  return {
    zalo: hasZaloProvider(),
    sms: Boolean(process.env.SMS_API_URL),
    email: Boolean(process.env.EMAIL_API_URL),
    defaultChannel: resolveChannel(null),
  };
}
