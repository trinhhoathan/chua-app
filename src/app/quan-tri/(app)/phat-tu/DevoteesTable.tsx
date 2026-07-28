'use client';

import { useMemo, useState, useTransition } from 'react';
import type { Devotee, DevoteeSource } from '@/types/database';
import { deleteDevotee } from '@/app/actions/admin';

interface Props {
  templeId: string;
  devotees: Devotee[];
}

const SOURCE_LABEL: Record<DevoteeSource, string> = {
  admin: 'Nhập tay',
  web: 'Website',
  event: 'Sự kiện',
  import: 'Nhập file',
};

const SOURCE_STYLE: Record<DevoteeSource, string> = {
  admin: 'bg-mist text-ink',
  web: 'bg-emerald-50 text-emerald-800',
  event: 'bg-amber-50 text-amber-800',
  import: 'bg-slate-100 text-slate-700',
};

type Filter = 'all' | DevoteeSource;

function formatDate(iso: string) {
  return new Intl.DateTimeFormat('vi-VN', {
    dateStyle: 'short',
  }).format(new Date(iso));
}

export function DevoteesTable({ templeId, devotees }: Props) {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return devotees.filter((d) => {
      if (filter !== 'all' && d.source !== filter) return false;
      if (!q) return true;
      const hay = `${d.full_name} ${d.dharma_name ?? ''} ${d.phone ?? ''} ${
        d.address ?? ''
      }`.toLowerCase();
      return hay.includes(q);
    });
  }, [devotees, query, filter]);

  function remove(d: Devotee) {
    if (typeof window !== 'undefined') {
      const ok = window.confirm(`Xóa Phật tử "${d.full_name}"?`);
      if (!ok) return;
    }
    setMsg(null);
    start(async () => {
      const res = await deleteDevotee({ id: d.id, templeId });
      if (!res.ok) {
        setMsg(res.error ?? 'Không xóa được.');
        return;
      }
      if (typeof window !== 'undefined') window.location.reload();
    });
  }

  const filters: { value: Filter; label: string }[] = [
    { value: 'all', label: 'Tất cả' },
    { value: 'web', label: 'Website' },
    { value: 'admin', label: 'Nhập tay' },
    { value: 'event', label: 'Sự kiện' },
  ];

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2 items-center justify-between">
        <div className="flex gap-1 flex-wrap">
          {filters.map((f) => {
            const active = filter === f.value;
            return (
              <button
                key={f.value}
                type="button"
                onClick={() => setFilter(f.value)}
                className={`px-3 py-1.5 text-xs border ${
                  active
                    ? 'bg-ink text-white border-ink'
                    : 'bg-white text-ink border-fog hover:bg-mist'
                }`}
              >
                {f.label}
              </button>
            );
          })}
        </div>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Tìm theo tên, SĐT…"
          className="border border-fog bg-white px-3 py-1.5 text-sm w-full sm:w-64"
        />
      </div>

      {msg ? <p className="text-sm text-lacquer">{msg}</p> : null}

      <div className="overflow-x-auto border border-fog bg-paper">
        <table className="w-full text-sm">
          <thead className="text-left text-muted bg-mist">
            <tr>
              <th className="p-3">Họ tên</th>
              <th className="p-3">SĐT</th>
              <th className="p-3">Nguồn</th>
              <th className="p-3">Tin lễ</th>
              <th className="p-3">Ngày ĐK</th>
              <th className="p-3 text-right">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-6 text-center text-muted">
                  Không có Phật tử phù hợp.
                </td>
              </tr>
            ) : (
              rows.map((d) => (
                <tr key={d.id} className="border-t border-fog align-top">
                  <td className="p-3">
                    <p className="font-medium text-ink">{d.full_name}</p>
                    {d.dharma_name ? (
                      <p className="text-xs text-muted">
                        Pháp danh: {d.dharma_name}
                      </p>
                    ) : null}
                    {d.address ? (
                      <p className="text-xs text-muted">{d.address}</p>
                    ) : null}
                  </td>
                  <td className="p-3 tabular-nums">{d.phone ?? '—'}</td>
                  <td className="p-3">
                    <span
                      className={`inline-block px-2 py-0.5 text-[0.7rem] uppercase tracking-wide ${
                        SOURCE_STYLE[d.source]
                      }`}
                    >
                      {SOURCE_LABEL[d.source]}
                    </span>
                    {d.preferred_channel ? (
                      <p className="mt-1 text-[0.7rem] text-muted">
                        Kênh: {d.preferred_channel}
                      </p>
                    ) : null}
                  </td>
                  <td className="p-3 text-xs">
                    {d.consent_contact ? (
                      <span className="text-emerald-700">Đồng ý</span>
                    ) : (
                      <span className="text-muted">Chưa</span>
                    )}
                  </td>
                  <td className="p-3 text-xs">{formatDate(d.created_at)}</td>
                  <td className="p-3 text-right">
                    <button
                      type="button"
                      disabled={pending}
                      onClick={() => remove(d)}
                      className="text-xs px-2 py-1 border border-lacquer text-lacquer hover:bg-lacquer/5 disabled:opacity-50"
                    >
                      Xóa
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
