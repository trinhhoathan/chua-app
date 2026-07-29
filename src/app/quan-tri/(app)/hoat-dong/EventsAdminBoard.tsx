'use client';

import { useState, useTransition } from 'react';
import Image from 'next/image';
import type { TempleEvent, TempleEventType } from '@/types/database';
import {
  upsertTempleEvent,
  deleteTempleEvent,
  uploadEventImage,
} from '@/app/actions/admin';
import { compressImageForUpload } from '@/lib/compress-image';

interface Props {
  templeId: string;
  templeName: string;
  events: TempleEvent[];
  typeLabels: Record<TempleEventType, string>;
}

const EMPTY_FORM = {
  id: '',
  title: '',
  summary: '',
  imageUrl: '',
  eventType: 'khac' as TempleEventType,
  startsAt: '',
  endsAt: '',
  location: '',
  isPublished: true,
};

type FormState = typeof EMPTY_FORM;

function toLocalInput(value: string | null | undefined): string {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(
    d.getDate(),
  )}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function fromLocalInput(value: string): string {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  return d.toISOString();
}

function formatVNTime(iso: string): string {
  const d = new Date(iso);
  return new Intl.DateTimeFormat('vi-VN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(d);
}

export function EventsAdminBoard({
  templeId,
  events,
  typeLabels,
}: Props) {
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const [uploading, setUploading] = useState(false);

  async function onPickImage(file: File | null) {
    if (!file) return;
    setErr(null);
    setMsg(null);
    setUploading(true);
    try {
      const compressed = await compressImageForUpload(file);
      if (compressed.size > 2 * 1024 * 1024) {
        setErr('Ảnh vẫn quá lớn sau khi nén (tối đa 2MB). Hãy chọn ảnh nhỏ hơn.');
        return;
      }
      const fd = new FormData();
      fd.set('templeId', templeId);
      fd.set('file', compressed);
      const res = await uploadEventImage(fd);
      if (!res.ok || !res.url) {
        setErr(res.error ?? 'Không tải được ảnh.');
        return;
      }
      setForm((prev) => ({ ...prev, imageUrl: res.url! }));
      setMsg('Đã tải ảnh lên.');
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Không xử lý được ảnh.');
    } finally {
      setUploading(false);
    }
  }

  function edit(ev: TempleEvent) {
    setForm({
      id: ev.id,
      title: ev.title,
      summary: ev.summary ?? '',
      imageUrl: ev.image_url ?? '',
      eventType: ev.event_type,
      startsAt: toLocalInput(ev.starts_at),
      endsAt: toLocalInput(ev.ends_at),
      location: ev.location ?? '',
      isPublished: ev.is_published,
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

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    setErr(null);
    start(async () => {
      const res = await upsertTempleEvent({
        templeId,
        id: form.id || undefined,
        title: form.title,
        summary: form.summary,
        imageUrl: form.imageUrl,
        eventType: form.eventType,
        startsAt: fromLocalInput(form.startsAt),
        endsAt: form.endsAt ? fromLocalInput(form.endsAt) : undefined,
        location: form.location,
        isPublished: form.isPublished,
      });
      if (!res.ok) {
        setErr(res.error ?? 'Không lưu được.');
        return;
      }
      setMsg(form.id ? 'Đã cập nhật sự kiện.' : 'Đã đăng sự kiện.');
      resetForm();
      if (typeof window !== 'undefined') {
        window.location.reload();
      }
    });
  }

  function remove(ev: TempleEvent) {
    if (typeof window !== 'undefined') {
      const ok = window.confirm(`Xóa sự kiện "${ev.title}"?`);
      if (!ok) return;
    }
    start(async () => {
      const res = await deleteTempleEvent({ id: ev.id, templeId });
      if (!res.ok) {
        setErr(res.error ?? 'Không xóa được.');
        return;
      }
      if (typeof window !== 'undefined') {
        window.location.reload();
      }
    });
  }

  const now = Date.now();
  const upcoming = events.filter((e) => new Date(e.ends_at).getTime() > now);
  const past = events.filter((e) => new Date(e.ends_at).getTime() <= now);

  return (
    <div className="grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] gap-8">
      <form
        onSubmit={submit}
        className="border border-fog bg-paper p-5 md:p-6 space-y-4 self-start"
      >
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl text-ink">
            {form.id ? 'Chỉnh sửa sự kiện' : 'Đăng sự kiện mới'}
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
            placeholder="Lễ Dâng sao giải hạn đầu năm"
            className="mt-1 w-full border border-fog px-3 py-2 bg-white text-ink text-sm"
          />
        </label>

        <label className="block text-xs text-muted">
          Loại lễ / hoạt động
          <select
            value={form.eventType}
            onChange={(e) =>
              setForm({
                ...form,
                eventType: e.target.value as TempleEventType,
              })
            }
            className="mt-1 w-full border border-fog px-3 py-2 bg-white text-ink text-sm"
          >
            {(Object.keys(typeLabels) as TempleEventType[]).map((k) => (
              <option key={k} value={k}>
                {typeLabels[k]}
              </option>
            ))}
          </select>
        </label>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <label className="block text-xs text-muted">
            Bắt đầu *
            <input
              required
              type="datetime-local"
              value={form.startsAt}
              onChange={(e) => setForm({ ...form, startsAt: e.target.value })}
              className="mt-1 w-full border border-fog px-3 py-2 bg-white text-ink text-sm"
            />
          </label>
          <label className="block text-xs text-muted">
            Kết thúc
            <input
              type="datetime-local"
              value={form.endsAt}
              onChange={(e) => setForm({ ...form, endsAt: e.target.value })}
              className="mt-1 w-full border border-fog px-3 py-2 bg-white text-ink text-sm"
            />
            <span className="mt-1 block text-[0.7rem] text-muted">
              Bỏ trống nếu chỉ trong ngày — card sẽ tự ẩn sau giờ bắt đầu.
            </span>
          </label>
        </div>

        <label className="block text-xs text-muted">
          Địa điểm
          <input
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
            placeholder="Chánh điện · Sân chùa"
            className="mt-1 w-full border border-fog px-3 py-2 bg-white text-ink text-sm"
          />
        </label>

        <label className="block text-xs text-muted">
          Mô tả ngắn
          <textarea
            value={form.summary}
            onChange={(e) => setForm({ ...form, summary: e.target.value })}
            rows={3}
            placeholder="Vài dòng giới thiệu, ý nghĩa lễ hội, mời phật tử về dự…"
            className="mt-1 w-full border border-fog px-3 py-2 bg-white text-ink text-sm resize-none"
          />
        </label>

        <div className="space-y-2">
          <p className="text-xs text-muted">Ảnh sự kiện</p>
          <label className="flex flex-col items-start gap-2 border border-dashed border-fog bg-mist/40 px-4 py-3 cursor-pointer hover:bg-mist">
            <span className="text-sm text-ink">
              {uploading
                ? 'Đang tải & nén ảnh…'
                : 'Chọn ảnh từ điện thoại / máy tính'}
            </span>
            <span className="text-[11px] text-muted">
              JPG, PNG, WebP · tự nén nhỏ · tối đa ~2MB
            </span>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/*"
              disabled={uploading || pending}
              className="sr-only"
              onChange={(e) => {
                const f = e.target.files?.[0] ?? null;
                e.target.value = '';
                void onPickImage(f);
              }}
            />
          </label>

          {form.imageUrl ? (
            <div className="flex items-start gap-3">
              <div className="relative size-20 shrink-0 overflow-hidden bg-fog border border-fog">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={form.imageUrl}
                  alt="Xem trước ảnh sự kiện"
                  className="size-full object-cover"
                />
              </div>
              <div className="min-w-0 flex-1 space-y-1">
                <p className="text-[11px] text-muted break-all line-clamp-2">
                  {form.imageUrl}
                </p>
                <button
                  type="button"
                  onClick={() => setForm({ ...form, imageUrl: '' })}
                  className="text-xs text-lacquer underline"
                >
                  Gỡ ảnh
                </button>
              </div>
            </div>
          ) : null}

          <label className="block text-[11px] text-muted">
            Hoặc dán URL ảnh (tuỳ chọn)
            <input
              value={form.imageUrl}
              onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
              placeholder="https://…/le-hoi.jpg"
              className="mt-1 w-full border border-fog px-3 py-2 bg-white text-ink text-sm"
            />
          </label>
        </div>

        <label className="flex items-center gap-2 text-sm text-ink">
          <input
            type="checkbox"
            checked={form.isPublished}
            onChange={(e) =>
              setForm({ ...form, isPublished: e.target.checked })
            }
            className="size-4 accent-ink"
          />
          Hiện trên trang chủ
        </label>

        {err ? <p className="text-sm text-lacquer">{err}</p> : null}
        {msg ? <p className="text-sm text-ink">{msg}</p> : null}

        <button
          type="submit"
          disabled={pending || uploading}
          className="px-5 py-2.5 bg-ink text-white text-sm disabled:opacity-60"
        >
          {pending
            ? 'Đang lưu…'
            : form.id
              ? 'Cập nhật sự kiện'
              : 'Đăng sự kiện'}
        </button>
      </form>

      <div className="space-y-6">
        <EventListBlock
          title="Sắp diễn ra / đang diễn ra"
          events={upcoming}
          typeLabels={typeLabels}
          onEdit={edit}
          onDelete={remove}
          emptyText="Chưa có sự kiện sắp tới."
        />
        <EventListBlock
          title="Đã kết thúc (ẩn khỏi trang chủ)"
          events={past}
          typeLabels={typeLabels}
          onEdit={edit}
          onDelete={remove}
          emptyText="Chưa có sự kiện quá hạn."
          muted
        />
      </div>
    </div>
  );
}

function EventListBlock({
  title,
  events,
  typeLabels,
  onEdit,
  onDelete,
  emptyText,
  muted,
}: {
  title: string;
  events: TempleEvent[];
  typeLabels: Record<TempleEventType, string>;
  onEdit: (ev: TempleEvent) => void;
  onDelete: (ev: TempleEvent) => void;
  emptyText: string;
  muted?: boolean;
}) {
  return (
    <section>
      <h3 className="font-display text-lg text-ink">{title}</h3>
      {events.length === 0 ? (
        <p className="mt-2 text-sm text-muted">{emptyText}</p>
      ) : (
        <ul className="mt-3 space-y-3">
          {events.map((ev) => (
            <li
              key={ev.id}
              className={`border border-fog p-4 ${
                muted ? 'bg-mist/60 opacity-80' : 'bg-white'
              }`}
            >
              <div className="flex gap-3">
                {ev.image_url ? (
                  <div className="relative size-16 shrink-0 overflow-hidden bg-fog">
                    <Image
                      src={ev.image_url}
                      alt=""
                      fill
                      unoptimized
                      className="object-cover"
                      sizes="64px"
                    />
                  </div>
                ) : null}
                <div className="flex-1 min-w-0">
                  <p className="text-[0.7rem] uppercase tracking-wide text-lacquer">
                    {typeLabels[ev.event_type]}
                  </p>
                  <p className="font-medium text-ink truncate">{ev.title}</p>
                  <p className="mt-0.5 text-xs text-muted">
                    {formatVNTime(ev.starts_at)}
                    {ev.location ? ` · ${ev.location}` : ''}
                  </p>
                  {!ev.is_published ? (
                    <p className="mt-1 text-[0.7rem] uppercase tracking-wide text-lacquer">
                      Đang ẩn (nháp)
                    </p>
                  ) : null}
                </div>
                <div className="flex flex-col gap-2 text-xs shrink-0">
                  <button
                    type="button"
                    onClick={() => onEdit(ev)}
                    className="px-2 py-1 border border-fog hover:bg-mist"
                  >
                    Sửa
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(ev)}
                    className="px-2 py-1 border border-lacquer text-lacquer hover:bg-lacquer/5"
                  >
                    Xóa
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
