import 'server-only';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

export type NotifyChannel = 'zalo' | 'sms' | 'email' | 'log';

export interface NotifyInput {
  templeId: string;
  recipient: string;
  templateKey: string;
  payload: Record<string, unknown>;
  relatedOrderId?: string;
  preferredChannel?: NotifyChannel;
}

/**
 * Phase 3 notification dispatcher.
 * - If ZALO_OA_ACCESS_TOKEN is set → attempt Zalo OA send (HTTP)
 * - Else if SMS_API_URL + SMS_API_KEY → attempt SMS
 * - Else → write a `log` channel row (safe local default)
 */
export async function sendDevoteeNotification(
  input: NotifyInput,
): Promise<{ ok: boolean; channel: NotifyChannel; error?: string }> {
  const admin = getSupabaseAdmin();
  const channel: NotifyChannel =
    input.preferredChannel ??
    (process.env.ZALO_OA_ACCESS_TOKEN
      ? 'zalo'
      : process.env.SMS_API_URL
        ? 'sms'
        : 'log');

  let status: 'sent' | 'failed' | 'skipped' | 'queued' = 'queued';
  let errorMessage: string | null = null;

  try {
    if (channel === 'zalo') {
      const token = process.env.ZALO_OA_ACCESS_TOKEN!;
      const message = buildMessage(input.templateKey, input.payload);
      const res = await fetch('https://openapi.zalo.me/v3.0/oa/message/cs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          access_token: token,
        },
        body: JSON.stringify({
          recipient: { user_id: input.recipient },
          message: { text: message },
        }),
      });
      if (!res.ok) {
        status = 'failed';
        errorMessage = `Zalo HTTP ${res.status}`;
      } else {
        status = 'sent';
      }
    } else if (channel === 'sms') {
      const url = process.env.SMS_API_URL!;
      const key = process.env.SMS_API_KEY ?? '';
      const message = buildMessage(input.templateKey, input.payload);
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${key}`,
        },
        body: JSON.stringify({ to: input.recipient, text: message }),
      });
      if (!res.ok) {
        status = 'failed';
        errorMessage = `SMS HTTP ${res.status}`;
      } else {
        status = 'sent';
      }
    } else {
      status = 'sent';
      // local log-only — no external provider configured
    }
  } catch (e) {
    status = 'failed';
    errorMessage = e instanceof Error ? e.message : 'Unknown error';
  }

  await admin.from('notification_logs').insert({
    temple_id: input.templeId,
    channel,
    recipient: input.recipient,
    template_key: input.templateKey,
    payload: input.payload,
    status,
    error_message: errorMessage,
    related_order_id: input.relatedOrderId ?? null,
  });

  return {
    ok: status === 'sent',
    channel,
    error: errorMessage ?? undefined,
  };
}

function buildMessage(
  templateKey: string,
  payload: Record<string, unknown>,
): string {
  const name = String(payload.customerName ?? 'Phật tử');
  const temple = String(payload.templeName ?? 'chùa');
  const code = String(payload.orderCode ?? '');
  const qty = String(payload.quantity ?? '');
  const total = String(payload.totalAmount ?? '');

  switch (templateKey) {
    case 'water_order_created':
      return `Nam mô A Di Đà Phật. ${temple} đã ghi nhận đơn công đức nước của ${name}. Mã đơn: ${code}. Số thùng: ${qty}. Tổng: ${total}đ. Xin cảm niệm.`;
    case 'water_order_paid':
      return `Nam mô A Di Đà Phật. ${temple} đã xác nhận công đức nước của ${name} (mã ${code}). Xin hồi hướng công đức.`;
    case 'prayer_received':
      return `Nam mô A Di Đà Phật. ${temple} đã nhận sớ ${payload.requestType === 'cau_sieu' ? 'cầu siêu' : 'cầu an'} của ${name}. Chúng con sẽ chuẩn bị cho đại lễ.`;
    default:
      return `Thông báo từ ${temple}: ${JSON.stringify(payload)}`;
  }
}
