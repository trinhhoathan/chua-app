'use client';

import { useState, useTransition } from 'react';
import { updateContactLinks } from '@/app/actions/admin';
import { CONTACT_LINK_FIELDS } from '@/lib/contact-links';
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

export function ContactLinksForm({ temples }: { temples: TempleRow[] }) {
  const [templeId, setTempleId] = useState(temples[0]?.id ?? '');
  const current = temples.find((t) => t.id === templeId) ?? temples[0];
  const [phone, setPhone] = useState(displayPhone(current));
  const [values, setValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(
      CONTACT_LINK_FIELDS.map((f) => [
        f.key,
        current?.contact_links?.[f.key] ?? '',
      ]),
    ),
  );
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [pending, start] = useTransition();

  function onSelectTemple(id: string) {
    const t = temples.find((x) => x.id === id);
    setTempleId(id);
    setPhone(displayPhone(t));
    setValues(
      Object.fromEntries(
        CONTACT_LINK_FIELDS.map((f) => [f.key, t?.contact_links?.[f.key] ?? '']),
      ),
    );
    setMsg(null);
    setErr(null);
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!templeId) return;
    setMsg(null);
    setErr(null);
    start(async () => {
      const res = await updateContactLinks({
        templeId,
        hotline: phone,
        links: {
          youtube: values.youtube,
          tiktok: values.tiktok,
          facebook: values.facebook,
          messenger: values.messenger,
          zalo: values.zalo,
          zalo_community: values.zalo_community,
          phone,
        },
      });
      if (!res.ok) {
        setErr(res.error ?? 'Không lưu được.');
        return;
      }
      setMsg(
        'Đã lưu. Số điện thoại cập nhật trên menu Hotline và icon gọi bên phải website.',
      );
    });
  }

  if (!current) {
    return <p className="text-sm text-muted">Chưa có chùa để cấu hình.</p>;
  }

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
            công cụ bên phải. Trụ trì có thể đổi bất cứ lúc nào.
          </p>
          <label className="block text-xs text-muted">
            Số điện thoại *
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
          <h2 className="font-display text-xl text-ink">Kênh mạng xã hội</h2>
          <p className="text-sm text-muted leading-relaxed">
            Để trống kênh nào không dùng — icon sẽ ẩn trên website. Nút «Lên đầu
            trang» luôn có trên thanh công cụ phải.
          </p>

          <div className="grid gap-3">
            {CONTACT_LINK_FIELDS.map((f) => (
              <label key={f.key} className="block text-xs text-muted">
                {f.label}
                <input
                  value={values[f.key] ?? ''}
                  onChange={(e) =>
                    setValues((prev) => ({ ...prev, [f.key]: e.target.value }))
                  }
                  className="mt-1 w-full border border-fog px-3 py-2 bg-white text-ink text-sm"
                  placeholder={f.placeholder}
                />
              </label>
            ))}
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
