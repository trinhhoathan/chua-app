import Link from 'next/link';
import { requireAdmin } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import type { InventoryItem } from '@/types/database';
import { resolveTempleScope } from '@/lib/temple-scope';
import { TempleRequiredNotice } from '@/components/admin/TempleRequiredNotice';
import { InventoryForms } from './InventoryForms';
import { setWorkingTempleAction } from '@/app/actions/temple-scope';
import { redirect } from 'next/navigation';

const CAT: Record<string, string> = {
  water: 'Nước',
  incense: 'Hương',
  flower: 'Hoa',
  book: 'Ấn phẩm',
  other: 'Khác',
};

const PAGE_SIZE = 50;

interface Props {
  searchParams: Promise<{ temple?: string; q?: string; page?: string; low?: string }>;
}

export default async function KhoPage({ searchParams }: Props) {
  const ctx = await requireAdmin();
  const sp = await searchParams;
  const scope = await resolveTempleScope(ctx, sp.temple);
  const supabase = await createClient();

  if (ctx.isSuperAdmin && scope.mode === 'all') {
    const q = (sp.q ?? '').trim();
    const page = Math.max(1, Number(sp.page ?? '1') || 1);
    const from = (page - 1) * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;
    const lowOnly = sp.low === '1';

    let query = supabase
      .from('inventory_items')
      .select(
        'id, temple_id, name, category, unit, quantity_on_hand, reorder_level, is_active, temples(name)',
        { count: 'exact' },
      )
      .eq('is_active', true)
      .order('name')
      .range(from, to);

    if (q) query = query.ilike('name', `%${q}%`);

    const { data, count } = await query;
    let rows = data ?? [];
    if (lowOnly) {
      rows = rows.filter(
        (i) => Number(i.quantity_on_hand) <= Number(i.reorder_level),
      );
    }

    const totalPages = Math.max(1, Math.ceil((count ?? 0) / PAGE_SIZE));

    return (
      <div>
        <h1 className="font-display text-3xl text-ink">
          Giám sát kho vận toàn hệ
        </h1>
        <p className="mt-2 text-sm text-muted">
          Theo dõi tồn kho các Phật tự. Chọn một chùa để nhập / xuất kho.
        </p>

        <form className="mt-6 flex flex-wrap gap-2" action="/quan-tri/kho" method="get">
          <input
            name="q"
            defaultValue={q}
            placeholder="Tìm vật phẩm…"
            className="flex-1 max-w-md px-3 py-2 text-sm border border-fog bg-paper"
          />
          <label className="flex items-center gap-2 text-sm text-muted px-2">
            <input type="checkbox" name="low" value="1" defaultChecked={lowOnly} />
            Chỉ sắp hết (trang hiện tại)
          </label>
          <button type="submit" className="px-4 py-2 bg-ink text-white text-sm">
            Lọc
          </button>
        </form>

        <div className="mt-4 overflow-x-auto border border-fog bg-paper">
          <table className="w-full text-sm">
            <thead className="text-left text-muted bg-mist">
              <tr>
                <th className="p-3">Phật tự</th>
                <th className="p-3">Tên</th>
                <th className="p-3">Loại</th>
                <th className="p-3 text-right">Tồn</th>
                <th className="p-3 text-right">Mức báo</th>
                <th className="p-3" />
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-muted">
                    Không có dữ liệu.
                  </td>
                </tr>
              ) : (
                rows.map((i) => {
                  const templeName =
                    (i.temples as { name?: string } | null)?.name ?? '—';
                  const low =
                    Number(i.quantity_on_hand) <= Number(i.reorder_level);
                  return (
                    <tr
                      key={i.id}
                      className={`border-t border-fog ${low ? 'bg-lacquer/5' : ''}`}
                    >
                      <td className="p-3 text-muted">{templeName}</td>
                      <td className="p-3">{i.name}</td>
                      <td className="p-3">{CAT[i.category] ?? i.category}</td>
                      <td className="p-3 text-right font-medium">
                        {i.quantity_on_hand}
                      </td>
                      <td className="p-3 text-right text-muted">
                        {i.reorder_level}
                      </td>
                      <td className="p-3 text-right">
                        <form action={openTempleKho.bind(null, i.temple_id)}>
                          <button
                            type="submit"
                            className="text-xs px-2 py-1 border border-ink/20 hover:bg-mist"
                          >
                            Mở kho
                          </button>
                        </form>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 ? (
          <div className="mt-4 flex gap-2 text-sm">
            {page > 1 ? (
              <Link
                href={`/quan-tri/kho?q=${encodeURIComponent(q)}&page=${page - 1}${lowOnly ? '&low=1' : ''}`}
                className="px-3 py-1.5 border border-fog bg-paper"
              >
                Trước
              </Link>
            ) : null}
            {page < totalPages ? (
              <Link
                href={`/quan-tri/kho?q=${encodeURIComponent(q)}&page=${page + 1}${lowOnly ? '&low=1' : ''}`}
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

  const templeId = scope.templeId;
  if (!templeId) {
    return <TempleRequiredNotice feature="Kho vận" />;
  }

  const { data } = await supabase
    .from('inventory_items')
    .select('*')
    .eq('temple_id', templeId)
    .eq('is_active', true)
    .order('name');

  const items = (data ?? []) as InventoryItem[];

  return (
    <div>
      <h1 className="font-display text-3xl text-ink">Kho vận</h1>
      <p className="mt-2 text-sm text-muted">
        {scope.temple?.name} — nước đóng chai, hương hoa, ấn phẩm Phật giáo
      </p>

      <div className="mt-8">
        <InventoryForms templeId={templeId} items={items} />
      </div>
    </div>
  );
}

async function openTempleKho(templeId: string) {
  'use server';
  await setWorkingTempleAction(templeId);
  redirect('/quan-tri/kho');
}
