import { requireAdmin } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import type { Devotee } from '@/types/database';
import { DevoteeForm } from './DevoteeForm';

export default async function PhatTuPage() {
  const ctx = await requireAdmin();
  const templeId = ctx.temples[0]?.id;
  if (!templeId) return null;

  const supabase = await createClient();
  const { data } = await supabase
    .from('devotees')
    .select('*')
    .eq('temple_id', templeId)
    .order('full_name');

  const rows = (data ?? []) as Devotee[];

  return (
    <div>
      <h1 className="font-display text-3xl text-ink">Danh sách Phật tử</h1>
      <p className="mt-2 text-sm text-muted">
        Quản lý Pháp danh, ngày quy y của {ctx.temples[0]?.name}
      </p>

      <div className="mt-8 grid lg:grid-cols-[1fr_1.2fr] gap-8">
        <DevoteeForm templeId={templeId} />
        <div className="overflow-x-auto border border-fog bg-paper">
          <table className="w-full text-sm">
            <thead className="text-left text-muted bg-mist">
              <tr>
                <th className="p-3">Họ tên</th>
                <th className="p-3">Pháp danh</th>
                <th className="p-3">Năm sinh</th>
                <th className="p-3">SĐT</th>
                <th className="p-3">Quy y</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-6 text-center text-muted">
                    Chưa có Phật tử.
                  </td>
                </tr>
              ) : (
                rows.map((d) => (
                  <tr key={d.id} className="border-t border-fog">
                    <td className="p-3">{d.full_name}</td>
                    <td className="p-3">{d.dharma_name ?? '—'}</td>
                    <td className="p-3">{d.birth_year ?? '—'}</td>
                    <td className="p-3">{d.phone ?? '—'}</td>
                    <td className="p-3 text-xs">
                      {d.quy_y_date
                        ? new Date(d.quy_y_date).toLocaleDateString('vi-VN')
                        : '—'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
