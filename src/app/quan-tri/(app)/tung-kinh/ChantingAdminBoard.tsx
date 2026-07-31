'use client';

import { useState, useTransition } from 'react';
import type {
  ChantingDisplayScope,
  ChantingRecurrence,
  ChantingSchedule,
} from '@/types/database';
import {
  CHANTING_RECURRENCE_LABELS,
  CHANTING_SCOPE_LABELS,
  WEEKDAY_LABELS,
} from '@/types/database';
import {
  upsertChantingSchedule,
  deleteChantingSchedule,
  toggleChantingLive,
} from '@/app/actions/chanting';
import { formatStartTimeShort } from '@/lib/chanting';
import { useLivePresence } from '@/hooks/useLivePresence';

interface Props {
  templeId: string;
  schedules: ChantingSchedule[];
}

const EMPTY_FORM = {
  id: '',
  title: '',
  description: '',
  youtubeChannelIdOrUrl: '',
  recurrence: 'daily' as ChantingRecurrence,
  daysOfWeek: [] as number[],
  startDate: '',
  startTime: '05:00',
  durationMinutes: 60,
  displayScope: 'both' as ChantingDisplayScope,
  isActive: true,
};

type FormState = typeof EMPTY_FORM;

function timeInputValue(time: string): string {
  const m = time.match(/^(\d{1,2}):(\d{2})/);
  if (!m) return '05:00';
  return `${String(m[1]).padStart(2, '0')}:${m[2]}`;
}

function LiveViewerBadge({
  templeId,
  scheduleId,
  enabled,
}: {
  templeId: string;
  scheduleId: string;
  enabled: boolean;
}) {
  const count = useLivePresence(enabled ? templeId : null, enabled ? scheduleId : null, false);
  if (!enabled) return null;
  return (
    <span className="text-xs text-muted">
      {count} Phật tử đang tham dự
    </span>
  );
}

export function ChantingAdminBoard({ templeId, schedules }: Props) {
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [liveUrlById, setLiveUrlById] = useState<Record<string, string>>({});
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [pending, start] = useTransition();

  function edit(row: ChantingSchedule) {
    setForm({
      id: row.id,
      title: row.title,
      description: row.description ?? '',
      youtubeChannelIdOrUrl:
        row.youtube_channel_id || row.youtube_channel_url || '',
      recurrence: row.recurrence,
      daysOfWeek: row.days_of_week ?? [],
      startDate: row.start_date ?? '',
      startTime: timeInputValue(row.start_time),
      durationMinutes: row.duration_minutes,
      displayScope: row.display_scope,
      isActive: row.is_active,
    });
    setMsg(null);
    setErr(null);
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  function resetForm() {
    setForm(EMPTY_FORM);
    setMsg(null);
    setErr(null);
  }

  function toggleDay(day: number) {
    setForm((prev) => {
      const has = prev.daysOfWeek.includes(day);
      return {
        ...prev,
        daysOfWeek: has
          ? prev.daysOfWeek.filter((d) => d !== day)
          : [...prev.daysOfWeek, day].sort((a, b) => a - b),
      };
    });
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    setErr(null);
    start(async () => {
      const res = await upsertChantingSchedule({
        templeId,
        id: form.id || undefined,
        title: form.title,
        description: form.description,
        youtubeChannelIdOrUrl: form.youtubeChannelIdOrUrl,
        recurrence: form.recurrence,
        daysOfWeek: form.daysOfWeek,
        startDate: form.startDate || undefined,
        startTime: form.startTime,
        durationMinutes: form.durationMinutes,
        displayScope: form.displayScope,
        isActive: form.isActive,
      });
      if (!res.ok) {
        setErr(res.error ?? 'Không lưu được.');
        return;
      }
      setMsg(form.id ? 'Đã cập nhật lịch tụng kinh.' : 'Đã tạo lịch tụng kinh.');
      resetForm();
      if (typeof window !== 'undefined') window.location.reload();
    });
  }

  function remove(row: ChantingSchedule) {
    if (typeof window !== 'undefined') {
      const ok = window.confirm(`Xóa lịch "${row.title}"?`);
      if (!ok) return;
    }
    start(async () => {
      const res = await deleteChantingSchedule({ id: row.id, templeId });
      if (!res.ok) {
        setErr(res.error ?? 'Không xóa được.');
        return;
      }
      if (typeof window !== 'undefined') window.location.reload();
    });
  }

  function setLive(row: ChantingSchedule, isLive: boolean) {
    setMsg(null);
    setErr(null);
    start(async () => {
      const res = await toggleChantingLive({
        id: row.id,
        templeId,
        isLive,
        liveVideoUrl: isLive ? liveUrlById[row.id] : undefined,
      });
      if (!res.ok) {
        setErr(res.error ?? 'Không cập nhật được livestream.');
        return;
      }
      setMsg(isLive ? 'Đã bật livestream.' : 'Đã kết thúc livestream.');
      if (typeof window !== 'undefined') window.location.reload();
    });
  }

  return (
    <div className="grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] gap-8">
      <form
        onSubmit={submit}
        className="border border-fog bg-paper p-5 md:p-6 space-y-4 self-start"
      >
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl text-ink">
            {form.id ? 'Chỉnh sửa lịch tụng kinh' : 'Đặt lịch tụng kinh mới'}
          </h2>
          {form.id ? (
            <button
              type="button"
              onClick={resetForm}
              className="text-xs text-lacquer underline"
            >
              Hủy sửa
            </button>
          ) : null}
        </div>

        <label className="block text-xs text-muted">
          Tiêu đề *
          <input
            required
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="Tụng Kinh buổi sáng"
            className="mt-1 w-full px-3 py-2 text-sm border border-fog bg-paper text-ink"
          />
        </label>

        <label className="block text-xs text-muted">
          Mô tả ngắn
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={2}
            className="mt-1 w-full px-3 py-2 text-sm border border-fog bg-paper text-ink"
          />
        </label>

        <label className="block text-xs text-muted">
          YouTube Channel ID hoặc link kênh *
          <input
            required
            value={form.youtubeChannelIdOrUrl}
            onChange={(e) =>
              setForm({ ...form, youtubeChannelIdOrUrl: e.target.value })
            }
            placeholder="UCxxxxxxxx / https://www.youtube.com/channel/UC…"
            className="mt-1 w-full px-3 py-2 text-sm border border-fog bg-paper text-ink"
          />
          <span className="mt-1 block text-[0.7rem] leading-relaxed">
            Nên dùng Channel ID dạng UC… để web tự nhúng buổi live khi sư phụ bật
            Go Live. Lấy tại YouTube Studio → Cài đặt → Kênh.
          </span>
        </label>

        <div className="grid sm:grid-cols-2 gap-3">
          <label className="block text-xs text-muted">
            Lặp lại
            <select
              value={form.recurrence}
              onChange={(e) =>
                setForm({
                  ...form,
                  recurrence: e.target.value as ChantingRecurrence,
                })
              }
              className="mt-1 w-full px-3 py-2 text-sm border border-fog bg-paper text-ink"
            >
              {(Object.keys(CHANTING_RECURRENCE_LABELS) as ChantingRecurrence[]).map(
                (k) => (
                  <option key={k} value={k}>
                    {CHANTING_RECURRENCE_LABELS[k]}
                  </option>
                ),
              )}
            </select>
          </label>

          <label className="block text-xs text-muted">
            Giờ bắt đầu (VN) *
            <input
              required
              type="time"
              value={form.startTime}
              onChange={(e) => setForm({ ...form, startTime: e.target.value })}
              className="mt-1 w-full px-3 py-2 text-sm border border-fog bg-paper text-ink"
            />
          </label>
        </div>

        {form.recurrence === 'weekly' ? (
          <fieldset className="text-xs text-muted">
            <legend className="mb-2">Các thứ trong tuần</legend>
            <div className="flex flex-wrap gap-2">
              {[1, 2, 3, 4, 5, 6, 0].map((d) => {
                const on = form.daysOfWeek.includes(d);
                return (
                  <button
                    key={d}
                    type="button"
                    onClick={() => toggleDay(d)}
                    className={`px-2.5 py-1.5 border text-sm ${
                      on
                        ? 'bg-ink text-white border-ink'
                        : 'bg-paper text-ink border-fog'
                    }`}
                  >
                    {WEEKDAY_LABELS[d]}
                  </button>
                );
              })}
            </div>
          </fieldset>
        ) : null}

        {form.recurrence === 'once' ? (
          <label className="block text-xs text-muted">
            Ngày diễn ra *
            <input
              required
              type="date"
              value={form.startDate}
              onChange={(e) => setForm({ ...form, startDate: e.target.value })}
              className="mt-1 w-full px-3 py-2 text-sm border border-fog bg-paper text-ink"
            />
          </label>
        ) : null}

        <div className="grid sm:grid-cols-2 gap-3">
          <label className="block text-xs text-muted">
            Thời lượng (phút)
            <input
              type="number"
              min={15}
              max={1440}
              value={form.durationMinutes}
              onChange={(e) =>
                setForm({
                  ...form,
                  durationMinutes: Number(e.target.value) || 60,
                })
              }
              className="mt-1 w-full px-3 py-2 text-sm border border-fog bg-paper text-ink"
            />
          </label>

          <label className="block text-xs text-muted">
            Hiển thị ở
            <select
              value={form.displayScope}
              onChange={(e) =>
                setForm({
                  ...form,
                  displayScope: e.target.value as ChantingDisplayScope,
                })
              }
              className="mt-1 w-full px-3 py-2 text-sm border border-fog bg-paper text-ink"
            >
              {(Object.keys(CHANTING_SCOPE_LABELS) as ChantingDisplayScope[]).map(
                (k) => (
                  <option key={k} value={k}>
                    {CHANTING_SCOPE_LABELS[k]}
                  </option>
                ),
              )}
            </select>
          </label>
        </div>

        <label className="flex items-center gap-2 text-sm text-ink">
          <input
            type="checkbox"
            checked={form.isActive}
            onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
          />
          Đang kích hoạt
        </label>

        {msg ? <p className="text-sm text-green-800">{msg}</p> : null}
        {err ? <p className="text-sm text-lacquer">{err}</p> : null}

        <button
          type="submit"
          disabled={pending}
          className="w-full py-2.5 bg-ink text-white text-sm disabled:opacity-60"
        >
          {pending ? 'Đang lưu…' : form.id ? 'Cập nhật' : 'Tạo lịch'}
        </button>
      </form>

      <div className="space-y-4">
        <h2 className="font-display text-xl text-ink">
          Lịch đã đặt ({schedules.length})
        </h2>
        {schedules.length === 0 ? (
          <p className="text-sm text-muted border border-fog bg-paper p-6">
            Chưa có lịch tụng kinh. Tạo lịch bên trái để hiện trên trang gõ mõ /
            trang chủ.
          </p>
        ) : (
          <ul className="space-y-4">
            {schedules.map((row) => (
              <li
                key={row.id}
                className="border border-fog bg-paper p-4 md:p-5 space-y-3"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-display text-lg text-ink">
                        {row.title}
                      </h3>
                      {row.is_live ? (
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 text-[0.65rem] tracking-wide uppercase bg-red-700 text-white">
                          <span className="size-1.5 rounded-full bg-white animate-pulse" />
                          Đang live
                        </span>
                      ) : null}
                      {!row.is_active ? (
                        <span className="text-[0.65rem] uppercase tracking-wide text-muted border border-fog px-1.5 py-0.5">
                          Tắt
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-1 text-sm text-muted">
                      {CHANTING_RECURRENCE_LABELS[row.recurrence]} ·{' '}
                      {formatStartTimeShort(row.start_time)} ·{' '}
                      {row.duration_minutes} phút ·{' '}
                      {CHANTING_SCOPE_LABELS[row.display_scope]}
                      {row.recurrence === 'weekly' && row.days_of_week?.length
                        ? ` · ${row.days_of_week.map((d) => WEEKDAY_LABELS[d]).join(', ')}`
                        : ''}
                      {row.recurrence === 'once' && row.start_date
                        ? ` · ${row.start_date}`
                        : ''}
                    </p>
                    {row.youtube_channel_id || row.youtube_channel_url ? (
                      <p className="mt-1 text-xs text-muted break-all">
                        {row.youtube_channel_id
                          ? `Channel: ${row.youtube_channel_id}`
                          : row.youtube_channel_url}
                      </p>
                    ) : null}
                    <div className="mt-1">
                      <LiveViewerBadge
                        templeId={templeId}
                        scheduleId={row.id}
                        enabled={row.is_live}
                      />
                    </div>
                  </div>
                  <div className="flex gap-2 text-xs">
                    <button
                      type="button"
                      onClick={() => edit(row)}
                      className="underline text-ink"
                    >
                      Sửa
                    </button>
                    <button
                      type="button"
                      onClick={() => remove(row)}
                      className="underline text-lacquer"
                    >
                      Xóa
                    </button>
                  </div>
                </div>

                {row.is_live ? (
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() => setLive(row, false)}
                    className="w-full sm:w-auto px-4 py-2 text-sm border border-fog bg-mist text-ink disabled:opacity-60"
                  >
                    Kết thúc livestream
                  </button>
                ) : (
                  <div className="flex flex-col sm:flex-row gap-2 sm:items-end">
                    <label className="flex-1 block text-xs text-muted">
                      Link video live (tuỳ chọn)
                      <input
                        value={liveUrlById[row.id] ?? ''}
                        onChange={(e) =>
                          setLiveUrlById((prev) => ({
                            ...prev,
                            [row.id]: e.target.value,
                          }))
                        }
                        placeholder="Để trống = nhúng theo Channel ID"
                        className="mt-1 w-full px-3 py-2 text-sm border border-fog bg-paper text-ink"
                      />
                    </label>
                    <button
                      type="button"
                      disabled={pending}
                      onClick={() => setLive(row, true)}
                      className="px-4 py-2 text-sm bg-red-700 text-white disabled:opacity-60"
                    >
                      Bắt đầu Livestream
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
