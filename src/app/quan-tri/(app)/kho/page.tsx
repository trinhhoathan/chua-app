import { requireAdmin } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import type { InventoryItem } from '@/types/database';
import { InventoryForms } from './InventoryForms';

const CAT: Record<string, string> = {
  water: 'Nước',
  incense: 'Hương',
  flower: 'Hoa',
  book: 'Ấn phẩm',
  other: 'Khác',
};

export default async function KhoPage() {
  const ctx = await requireAdmin();
  const templeId = ctx.temples[0]?.id;
  if (!templeId) return null;

  const supabase = await createClient();
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
        Nước đóng chai, hương hoa, ấn phẩm Phật giáo
      </p>

      <div className="mt-8 grid lg:grid-cols-[1fr_1.4fr] gap-8">
        <InventoryForms templeId={templeId} items={items} />
        <div className="overflow-x-auto border border-fog bg-paper">
          <table className="w-full text-sm">
            <thead className="text-left text-muted bg-mist">
              <tr>
                <th className="p-3">Tên</th>
                <th className="p-3">Loại</th>
                <th className="p-3 text-right">Tồn</th>
                <th className="p-3 text-right">Mức báo</th>
                <th className="p-3">Đơn vị</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-6 text-center text-muted">
                    Kho trống — hãy thêm vật phẩm.
                  </td>
                </tr>
              ) : (
                items.map((i) => (
                  <tr
                    key={i.id}
                    className={`border-t border-fog ${
                      i.quantity_on_hand <= i.reorder_level ? 'bg-lacquer/5' : ''
                    }`}
                  >
                    <td className="p-3">{i.name}</td>
                    <td className="p-3">{CAT[i.category] ?? i.category}</td>
                    <td className="p-3 text-right font-medium">
                      {i.quantity_on_hand}
                    </td>
                    <td className="p-3 text-right text-muted">
                      {i.reorder_level}
                    </td>
                    <td className="p-3">{i.unit}</td>
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
