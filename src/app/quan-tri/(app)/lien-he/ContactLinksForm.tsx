'use client';

import { useState, useTransition } from 'react';
import { updateContactLinks } from '@/app/actions/admin';
import {
  CONTACT_LINK_FIELDS,
  type ContactLinkKey,
} from '@/lib/contact-links';
import type { TempleContactLinks } from '@/types/database';

interface TempleRow {
  id: string;
  name: string;
  hotline: string | null;
  contact_links: TempleContactLinks;
}

function displayPhone(t: TempleRow | undefined): string {
  if (!t) return '';
  return t.hotline || t.contact_links.phone || '';
}

function linksFromTemple(t: TempleRow | undefined) {
  return Object.fromEntries(
    CONTACT_LINK_FIELDS.map((f) => [
      f.key,
      t?.contact_links?.[f.key] ?? '',
    ]),
  ) as Record<ContactLinkKey, string>;
}

function enabledFromTemple(t: TempleRow | undefined) {
  return Object.fromEntries(
    CONTACT_LINK_FIELDS.map((f) => [
      f.key,
      Boolean(t?.contact_links?.[f.key]?.trim()),
    ]),
  ) as Record<ContactLinkKey, boolean>;
}

export function ContactLinksForm({ temples }: { temples: TempleRow[] }) {
  const [templeId, setTempleId] = useState(temples[0]?.id ?? '');
  const current = temples.find((t) => t.id === templeId) ?? temples[0];
  const [phone, setPhone] = useState(displayPhone(current));
  const [values, setValues] = useState(() => linksFromTemple(current));
  const [enabled, setEnabled] = useState(() => enabledFromTemple(current));
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [pending, start] = useTransition();

  function onSelectTemple(id: string) {
    const t = temples.find((x) => x.id === id);
    setTempleId(id);
    setPhone(displayPhone(t));
    setValues(linksFromTemple(t));
    setEnabled(enabledFromTemple(t));
    setMsg(null);
    setErr(null);
  }

  function toggleChannel(key: ContactLinkKey, on: boolean) {
    setEnabled((prev) => ({ ...prev, [key]: on }));
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!templeId) return;
    setMsg(null);
    setErr(null);
    start(async () => {
      const pick = (key: ContactLinkKey) =>
        enabled[key] ? values[key] : '';

      const res = await updateContactLinks({
        templeId,
        hotline: phone,
        links: {
          youtube: pick('youtube'),
          tiktok: pick('tiktok'),
          facebook: pick('facebook'),
          messenger: pick('messenger'),
          zalo: pick('zalo'),
          zalo_community: pick('zalo_community'),
          instagram: pick('instagram'),
          threads: pick('threads'),
          x: pick('x'),
          phone,
        },
      });
      if (!res.ok) {
        setErr(res.error ?? 'Không lưu được.');
        return;
      }
      setMsg(
        'Đã lưu. Chỉ các kênh đang bật mới hiện trên thanh công cụ bên phải website.',
      );
    });
  }

  if (!current) {
    return <p className="text-sm text-muted">Chưa có chùa để cấu hình.</p>;
  }

  const activeCount = CONTACT_LINK_FIELDS.filter((f) => enabled[f.key]).length;

  return (
    <div className="space-y-6 max-w-2xl">
      {temples.length > 1 ? (
        <label className="block text-xs text-muted">
          Chùa
          <select
            value={templeId}
            onChange={(e) => onSelectTemple(e.target.value)}
            className="mt-1 w-full border border-fog px-3 py-2 bg-white text-ink text-sm"
          >
            {temples.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </label>
      ) : (
        <p className="text-sm font-medium text-ink">{current.name}</p>
      )}

      <form onSubmit={submit} className="space-y-6">
        <section className="border border-fog bg-paper p-5 md:p-6 space-y-3">
          <p className="text-[0.72rem] tracking-[0.25em] uppercase text-lacquer">
            Điện thoại trụ trì
          </p>
          <h2 className="font-display text-xl text-ink">
            Số điện thoại liên hệ
          </h2>
          <p className="text-sm text-muted leading-relaxed">
            Số này hiện trên nút Hotline ở menu trên và icon điện thoại ở thanh
            công cụ bên phải. Để trống nếu không muốn hiện.
          </p>
          <label className="block text-xs text-muted">
            Số điện thoại
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="mt-1 w-full border border-fog px-3 py-2.5 bg-white text-ink text-lg font-medium tabular-nums tracking-wide"
              placeholder="09xxxxxxxx"
              inputMode="tel"
              autoComplete="tel"
            />
          </label>
          {phone.trim() ? (
            <p className="text-xs text-muted">
              Xem trước:{' '}
              <a
                href={`tel:${phone.replace(/[^\d+]/g, '')}`}
                className="text-ink underline"
              >
                {phone.trim()}
              </a>
            </p>
          ) : (
            <p className="text-xs text-lacquer">
              Để trống sẽ ẩn Hotline trên menu và icon gọi bên phải.
            </p>
          )}
        </section>

        <section className="border border-fog bg-paper p-5 md:p-6 space-y-4">
          <div className="flex flex-wrap items-end justify-between gap-2">
            <div>
              <h2 className="font-display text-xl text-ink">
                Nút liên hệ trên website
              </h2>
              <p className="mt-1 text-sm text-muted leading-relaxed">
                Bật kênh nào cần dùng, tắt những kênh không muốn hiện. Có thể
                chỉ giữ 1–2 nút nếu muốn giao diện gọn.
              </p>
            </div>
            <p className="text-xs text-muted tabular-nums">
              Đang bật: {activeCount}/{CONTACT_LINK_FIELDS.length}
            </p>
          </div>

          <div className="grid gap-3">
            {CONTACT_LINK_FIELDS.map((f) => {
              const on = enabled[f.key];
              return (
                <div
                  key={f.key}
                  className={`border border-fog px-3 py-3 transition-colors ${
                    on ? 'bg-white' : 'bg-fog/30'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <label className="flex items-center gap-2.5 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={on}
                        onChange={(e) => toggleChannel(f.key, e.target.checked)}
                        className="size-4 accent-ink"
                      />
                      <span className="text-sm font-medium text-ink">
                        {f.label}
                      </span>
                    </label>
                    <span className="text-[0.7rem] uppercase tracking-wide text-muted">
                      {on ? 'Hiện' : 'Ẩn'}
                    </span>
                  </div>
                  {on ? (
                    <input
                      value={values[f.key] ?? ''}
                      onChange={(e) =>
                        setValues((prev) => ({
                          ...prev,
                          [f.key]: e.target.value,
                        }))
                      }
                      className="mt-2.5 w-full border border-fog px-3 py-2 bg-white text-ink text-sm"
                      placeholder={f.placeholder}
                      required={on}
                    />
                  ) : null}
                </div>
              );
            })}
          </div>
        </section>

        {err ? <p className="text-sm text-lacquer">{err}</p> : null}
        {msg ? <p className="text-sm text-ink">{msg}</p> : null}

        <button
          type="submit"
          disabled={pending}
          className="px-5 py-2.5 bg-ink text-white text-sm disabled:opacity-60"
        >
          {pending ? 'Đang lưu…' : 'Lưu liên hệ'}
        </button>
      </form>
    </div>
  );
}
