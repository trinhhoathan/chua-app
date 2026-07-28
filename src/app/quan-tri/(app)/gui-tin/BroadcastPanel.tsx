'use client';

import { useMemo, useState, useTransition } from 'react';
import type { BroadcastCampaign, BroadcastChannel, TempleEvent } from '@/types/database';
import {
  cancelBroadcastCampaign,
  createBroadcastCampaign,
  processBroadcastBatch,
} from '@/app/actions/broadcast';
import { BROADCAST_MAX_RECIPIENTS } from '@/lib/broadcast-constants';

interface Providers {
  zalo: boolean;
  sms: boolean;
  email: boolean;
  defaultChannel: string;
}

interface Props {
  templeId: string;
  templeName: string;
  audienceCount: number;
  providers: Providers;
  events: Pick<
    TempleEvent,
    | 'id'
    | 'title'
    | 'starts_at'
    | 'ends_at'
    | 'location'
    | 'event_type'
    | 'is_published'
  >[];
  campaigns: BroadcastCampaign[];
}

const CHANNEL_OPTIONS: {
  value: BroadcastChannel;
  label: string;
  hint: string;
}[] = [
  {
    value: 'auto',
    label: 'Tự động',
    hint: 'Theo kênh Phật tử chọn (Zalo → SMS → log)',
  },
  { value: 'zalo', label: 'Zalo ZNS', hint: 'Cần ZALO_ZNS_ACCESS_TOKEN' },
  { value: 'sms', label: 'SMS', hint: 'Cần SMS_API_URL + SMS_API_KEY' },
  { value: 'email', label: 'Email', hint: 'Cần EMAIL_API_URL (ít dùng)' },
  {
    value: 'log',
    label: 'Chỉ ghi log (thử)',
    hint: 'Không gửi thật — kiểm tra nội dung & số lượng',
  },
];

function formatTime(iso: string) {
  return new Intl.DateTimeFormat('vi-VN', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(iso));
}

function statusLabel(s: BroadcastCampaign['status']) {
  switch (s) {
    case 'queued':
      return 'Chờ gửi';
    case 'sending':
      return 'Đang gửi';
    case 'completed':
      return 'Hoàn tất';
    case 'failed':
      return 'Lỗi';
    case 'cancelled':
      return 'Đã hủy';
    default:
      return s;
  }
}

export function BroadcastPanel({
  templeId,
  templeName,
  audienceCount,
  providers,
  events,
  campaigns: initialCampaigns,
}: Props) {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState(
    `Nam mô A Di Đà Phật. {chua} kính mời {ten} tham dự lễ sắp tới. Trân trọng thông báo.`,
  );
  const [channel, setChannel] = useState<BroadcastChannel>('auto');
  const [eventId, setEventId] = useState('');
  const [consentOnly, setConsentOnly] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [progress, setProgress] = useState<{
    campaignId: string;
    total: number;
    remaining: number;
    sent: number;
    failed: number;
    done: boolean;
  } | null>(null);
  const [campaigns, setCampaigns] = useState(initialCampaigns);
  const [pending, start] = useTransition();

  const estimated = Math.min(audienceCount, BROADCAST_MAX_RECIPIENTS);

  const preview = useMemo(() => {
    return body
      .replaceAll('{ten}', 'Nguyễn Văn A')
      .replaceAll('{chua}', templeName);
  }, [body, templeName]);

  const providerReady =
    channel === 'log' ||
    channel === 'auto' ||
    (channel === 'zalo' && providers.zalo) ||
    (channel === 'sms' && providers.sms) ||
    (channel === 'email' && providers.email);

  async function runBatches(campaignId: string, total: number) {
    let remaining = total;
    let sentAcc = 0;
    let failedAcc = 0;

    while (remaining > 0) {
      const res = await processBroadcastBatch({
        templeId,
        campaignId,
        batchSize: 40,
      });
      if (!res.ok) {
        setErr(res.error ?? 'Lỗi khi gửi đợt.');
        break;
      }
      sentAcc += res.sent ?? 0;
      failedAcc += res.failed ?? 0;
      remaining = res.remaining ?? 0;
      setProgress({
        campaignId,
        total,
        remaining,
        sent: sentAcc,
        failed: failedAcc,
        done: Boolean(res.done),
      });
      if (res.campaign) {
        setCampaigns((prev) => {
          const others = prev.filter((c) => c.id !== res.campaign!.id);
          return [res.campaign!, ...others];
        });
      }
      if (res.done) break;
      // Nhịp nhỏ giữa các đợt để tránh rate-limit provider
      await new Promise((r) => setTimeout(r, 200));
    }
  }

  function submit(dryRun: boolean) {
    setErr(null);
    setMsg(null);
    setProgress(null);
    start(async () => {
      const res = await createBroadcastCampaign({
        templeId,
        title:
          title.trim() ||
          (eventId
            ? `Nhắc lễ: ${events.find((e) => e.id === eventId)?.title ?? ''}`
            : 'Thông báo nhà chùa'),
        body,
        channel: dryRun ? 'log' : channel,
        eventId: eventId || undefined,
        consentOnly,
        dryRun,
      });
      if (!res.ok || !res.campaignId) {
        setErr(res.error ?? 'Không tạo được chiến dịch.');
        return;
      }
      setMsg(
        dryRun
          ? `Đã tạo chiến dịch thử (log) — ${res.total} người. Đang xử lý…`
          : `Đã xếp hàng ${res.total} tin. Đang gửi…`,
      );
      await runBatches(res.campaignId, res.total ?? 0);
      setMsg(
        dryRun
          ? 'Hoàn tất chạy thử (không gửi tin thật).'
          : 'Đã gửi xong chiến dịch.',
      );
      if (typeof window !== 'undefined') {
        // Refresh list from server after short delay
        setTimeout(() => window.location.reload(), 800);
      }
    });
  }

  function resume(c: BroadcastCampaign) {
    setErr(null);
    setMsg(`Tiếp tục gửi chiến dịch «${c.title}»…`);
    start(async () => {
      await runBatches(c.id, c.total_recipients);
      setMsg('Đã gửi xong.');
      if (typeof window !== 'undefined') {
        setTimeout(() => window.location.reload(), 800);
      }
    });
  }

  function cancel(c: BroadcastCampaign) {
    if (typeof window !== 'undefined') {
      const ok = window.confirm(`Hủy chiến dịch «${c.title}»?`);
      if (!ok) return;
    }
    start(async () => {
      const res = await cancelBroadcastCampaign({
        templeId,
        campaignId: c.id,
      });
      if (!res.ok) setErr(res.error ?? 'Không hủy được.');
      else if (typeof window !== 'undefined') window.location.reload();
    });
  }

  return (
    <div className="grid lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] gap-8">
      <form
        className="border border-fog bg-paper p-5 md:p-6 space-y-4 self-start"
        onSubmit={(e) => {
          e.preventDefault();
          submit(false);
        }}
      >
        <h2 className="font-display text-xl text-ink">Soạn tin gửi</h2>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="border border-fog bg-white px-3 py-2">
            <p className="text-[0.7rem] uppercase tracking-wide text-muted">
              Đối tượng
            </p>
            <p className="font-display text-2xl tabular-nums text-ink">
              {estimated.toLocaleString('vi-VN')}
            </p>
            <p className="text-xs text-muted">
              / tối đa {BROADCAST_MAX_RECIPIENTS.toLocaleString('vi-VN')}
            </p>
          </div>
          <div className="border border-fog bg-white px-3 py-2">
            <p className="text-[0.7rem] uppercase tracking-wide text-muted">
              Provider
            </p>
            <p className="text-xs mt-1 leading-relaxed">
              Zalo: {providers.zalo ? 'sẵn sàng' : 'chưa cấu hình'}
              <br />
              SMS: {providers.sms ? 'sẵn sàng' : 'chưa cấu hình'}
              <br />
              Mặc định: <strong>{providers.defaultChannel}</strong>
            </p>
          </div>
        </div>

        {!providers.zalo && !providers.sms && channel !== 'log' ? (
          <p className="text-xs text-lacquer leading-relaxed border border-lacquer/30 bg-lacquer/5 px-3 py-2">
            Chưa cấu hình Zalo ZNS / SMS trên Vercel. Có thể bấm «Chạy thử (log)»
            để kiểm tra, hoặc thêm biến môi trường rồi deploy lại.
          </p>
        ) : null}

        <label className="block text-xs text-muted">
          Gắn sự kiện (tuỳ chọn)
          <select
            value={eventId}
            onChange={(e) => {
              setEventId(e.target.value);
              const ev = events.find((x) => x.id === e.target.value);
              if (ev && !title.trim()) {
                setTitle(`Nhắc lễ: ${ev.title}`);
              }
              if (ev) {
                setBody(
                  `Nam mô A Di Đà Phật. {chua} kính mời {ten} tham dự «${ev.title}» vào ${formatTime(ev.starts_at)}${ev.location ? ` tại ${ev.location}` : ''}. Trân trọng.`,
                );
              }
            }}
            className="mt-1 w-full border border-fog px-3 py-2 bg-white text-ink text-sm"
          >
            <option value="">— Không gắn sự kiện —</option>
            {events.map((ev) => (
              <option key={ev.id} value={ev.id}>
                {ev.title} · {formatTime(ev.starts_at)}
              </option>
            ))}
          </select>
        </label>

        <label className="block text-xs text-muted">
          Tiêu đề chiến dịch
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Nhắc lễ Vu Lan 2026"
            className="mt-1 w-full border border-fog px-3 py-2 bg-white text-ink text-sm"
          />
        </label>

        <label className="block text-xs text-muted">
          Nội dung tin nhắn *
          <textarea
            required
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={5}
            maxLength={500}
            className="mt-1 w-full border border-fog px-3 py-2 bg-white text-ink text-sm resize-none"
          />
          <span className="mt-1 flex justify-between text-[0.7rem]">
            <span>Dùng {'{ten}'} và {'{chua}'} để cá nhân hoá</span>
            <span>{body.length}/500</span>
          </span>
        </label>

        <div className="border border-fog bg-mist/40 px-3 py-2">
          <p className="text-[0.7rem] uppercase tracking-wide text-muted">
            Xem trước
          </p>
          <p className="mt-1 text-sm text-ink leading-relaxed">{preview}</p>
        </div>

        <fieldset>
          <legend className="text-xs text-muted mb-2">Kênh gửi</legend>
          <div className="grid gap-2">
            {CHANNEL_OPTIONS.map((opt) => (
              <label
                key={opt.value}
                className={`flex items-start gap-2.5 border px-3 py-2 cursor-pointer ${
                  channel === opt.value
                    ? 'border-ink bg-white'
                    : 'border-fog bg-white/60'
                }`}
              >
                <input
                  type="radio"
                  name="channel"
                  checked={channel === opt.value}
                  onChange={() => setChannel(opt.value)}
                  className="mt-1"
                />
                <span>
                  <span className="text-sm font-medium text-ink">
                    {opt.label}
                  </span>
                  <span className="block text-xs text-muted">{opt.hint}</span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        <label className="flex items-center gap-2 text-sm text-ink">
          <input
            type="checkbox"
            checked={consentOnly}
            onChange={(e) => setConsentOnly(e.target.checked)}
            className="size-4 accent-ink"
          />
          Chỉ gửi người đã đồng ý nhận tin
        </label>

        {err ? <p className="text-sm text-lacquer">{err}</p> : null}
        {msg ? <p className="text-sm text-ink">{msg}</p> : null}

        {progress ? (
          <div className="border border-fog bg-white px-3 py-3 space-y-2">
            <div className="flex justify-between text-xs text-muted">
              <span>
                Đã gửi {progress.sent} · lỗi {progress.failed}
              </span>
              <span>Còn {progress.remaining}</span>
            </div>
            <div className="h-2 bg-mist overflow-hidden">
              <div
                className="h-full bg-ink transition-all"
                style={{
                  width: `${
                    progress.total
                      ? Math.min(
                          100,
                          ((progress.total - progress.remaining) /
                            progress.total) *
                            100,
                        )
                      : 0
                  }%`,
                }}
              />
            </div>
          </div>
        ) : null}

        <div className="flex flex-wrap gap-2 pt-1">
          <button
            type="button"
            disabled={pending || estimated === 0}
            onClick={() => submit(true)}
            className="px-4 py-2.5 border border-fog text-sm disabled:opacity-50"
          >
            Chạy thử (log)
          </button>
          <button
            type="submit"
            disabled={pending || estimated === 0 || !providerReady}
            className="px-5 py-2.5 bg-ink text-white text-sm disabled:opacity-50"
          >
            {pending ? 'Đang xử lý…' : `Gửi tới ~${estimated.toLocaleString('vi-VN')} người`}
          </button>
        </div>
      </form>

      <section className="space-y-3">
        <h2 className="font-display text-xl text-ink">Chiến dịch gần đây</h2>
        {campaigns.length === 0 ? (
          <p className="text-sm text-muted">Chưa có chiến dịch nào.</p>
        ) : (
          <ul className="space-y-3">
            {campaigns.map((c) => (
              <li key={c.id} className="border border-fog bg-white p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-medium text-ink truncate">{c.title}</p>
                    <p className="mt-0.5 text-xs text-muted">
                      {formatTime(c.created_at)} · {statusLabel(c.status)} · kênh{' '}
                      {c.channel}
                    </p>
                    <p className="mt-2 text-xs tabular-nums text-muted">
                      Tổng {c.total_recipients} · gửi {c.sent_count} · lỗi{' '}
                      {c.failed_count}
                    </p>
                  </div>
                  <div className="flex flex-col gap-1.5 shrink-0">
                    {(c.status === 'queued' || c.status === 'sending') &&
                    c.sent_count + c.failed_count < c.total_recipients ? (
                      <button
                        type="button"
                        disabled={pending}
                        onClick={() => resume(c)}
                        className="text-xs px-2 py-1 border border-fog hover:bg-mist"
                      >
                        Tiếp tục
                      </button>
                    ) : null}
                    {c.status === 'queued' || c.status === 'sending' ? (
                      <button
                        type="button"
                        disabled={pending}
                        onClick={() => cancel(c)}
                        className="text-xs px-2 py-1 border border-lacquer text-lacquer"
                      >
                        Hủy
                      </button>
                    ) : null}
                  </div>
                </div>
                <p className="mt-2 text-xs text-muted line-clamp-2">{c.body}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
