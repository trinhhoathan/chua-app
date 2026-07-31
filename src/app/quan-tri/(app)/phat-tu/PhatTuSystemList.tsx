import Link from 'next/link';
import type { Devotee } from '@/types/database';
import { setWorkingTempleAction } from '@/app/actions/temple-scope';
import { redirect } from 'next/navigation';

type Row = Devotee & { temples: { name: string } | null };

export function PhatTuSystemList({
  rows,
  q,
  page,
  total,
  pageSize,
}: {
  rows: Row[];
  q: string;
  page: number;
  total: number;
  pageSize: number;
}) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="mt-8">
      <form className="flex gap-2" action="/quan-tri/phat-tu" method="get">
        <input
          name="q"
          defaultValue={q}
          placeholder="Tìm tên, pháp danh, SĐT…"
          className="flex-1 max-w-md px-3 py-2 text-sm border border-fog bg-paper"
        />
        <button type="submit" className="px-4 py-2 bg-ink text-white text-sm">
          Tìm
        </button>
      </form>

      <p className="mt-3 text-xs text-muted">
        {total.toLocaleString('vi-VN')} Phật tử
        {totalPages > 1 ? ` · trang ${page}/${totalPages}` : ''}
      </p>

      <div className="mt-4 overflow-x-auto border border-fog bg-paper">
        <table className="w-full text-sm">
          <thead className="text-left text-muted bg-mist">
            <tr>
              <th className="p-3">Họ tên</th>
              <th className="p-3">Phật tự</th>
              <th className="p-3">SĐT</th>
              <th className="p-3">Nguồn</th>
              <th className="p-3" />
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-6 text-center text-muted">
                  Không có dữ liệu.
                </td>
              </tr>
            ) : (
              rows.map((d) => (
                <tr key={d.id} className="border-t border-fog">
                  <td className="p-3">
                    <span className="font-medium">{d.full_name}</span>
                    {d.dharma_name ? (
                      <span className="block text-xs text-muted">
                        {d.dharma_name}
                      </span>
                    ) : null}
                  </td>
                  <td className="p-3 text-muted">{d.temples?.name ?? '—'}</td>
                  <td className="p-3 tabular-nums">{d.phone ?? '—'}</td>
                  <td className="p-3 text-xs">{d.source}</td>
                  <td className="p-3 text-right">
                    <form action={openTemple.bind(null, d.temple_id)}>
                      <button
                        type="submit"
                        className="text-xs px-2 py-1 border border-ink/20 hover:bg-mist"
                      >
                        Mở chùa
                      </button>
                    </form>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 ? (
        <div className="mt-4 flex gap-2 text-sm">
          {page > 1 ? (
            <Link
              href={`/quan-tri/phat-tu?q=${encodeURIComponent(q)}&page=${page - 1}`}
              className="px-3 py-1.5 border border-fog bg-paper"
            >
              Trước
            </Link>
          ) : null}
          {page < totalPages ? (
            <Link
              href={`/quan-tri/phat-tu?q=${encodeURIComponent(q)}&page=${page + 1}`}
              className="px-3 py-1.5 border border-fog bg-paper"
            >
              Sau
            </Link>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

async function openTemple(templeId: string) {
  'use server';
  await setWorkingTempleAction(templeId);
  redirect('/quan-tri/phat-tu');
}
