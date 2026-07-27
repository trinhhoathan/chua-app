'use client';

import { useState, useTransition } from 'react';
import { upsertInventoryItem, adjustInventory } from '@/app/actions/admin';
import type { InventoryItem } from '@/types/database';

export function InventoryForms({
  templeId,
  items,
}: {
  templeId: string;
  items: InventoryItem[];
}) {
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <form
        className="border border-fog bg-paper p-5 space-y-3"
        onSubmit={(e) => {
          e.preventDefault();
          const fd = new FormData(e.currentTarget);
          setMsg(null);
          start(async () => {
            const res = await upsertInventoryItem({
              templeId,
              name: String(fd.get('name') ?? ''),
              category: String(fd.get('category') ?? 'other'),
              unit: String(fd.get('unit') ?? 'cái'),
              quantityOnHand: Number(fd.get('qty') || 0),
              reorderLevel: Number(fd.get('reorder') || 0),
              sku: String(fd.get('sku') ?? ''),
            });
            if (!res.ok) setMsg(res.error ?? 'Lỗi');
            else {
              setMsg('Đã thêm vật phẩm.');
              e.currentTarget.reset();
              window.location.reload();
            }
          });
        }}
      >
        <h2 className="font-display text-xl text-ink">Thêm vật phẩm</h2>
        <label className="block text-xs text-muted">
          Tên *
          <input name="name" required className="mt-1 w-full border border-fog px-3 py-2" />
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className="block text-xs text-muted">
            Loại
            <select name="category" className="mt-1 w-full border border-fog px-3 py-2">
              <option value="water">Nước</option>
              <option value="incense">Hương</option>
              <option value="flower">Hoa</option>
              <option value="book">Ấn phẩm</option>
              <option value="other">Khác</option>
            </select>
          </label>
          <label className="block text-xs text-muted">
            Đơn vị
            <input name="unit" defaultValue="thùng" className="mt-1 w-full border border-fog px-3 py-2" />
          </label>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <label className="block text-xs text-muted">
            Tồn đầu
            <input name="qty" type="number" defaultValue={0} className="mt-1 w-full border border-fog px-3 py-2" />
          </label>
          <label className="block text-xs text-muted">
            Mức báo hết
            <input name="reorder" type="number" defaultValue={10} className="mt-1 w-full border border-fog px-3 py-2" />
          </label>
        </div>
        <label className="block text-xs text-muted">
          SKU
          <input name="sku" className="mt-1 w-full border border-fog px-3 py-2" />
        </label>
        <button type="submit" disabled={pending} className="w-full py-2.5 text-sm text-white bg-ink">
          Thêm
        </button>
      </form>

      {items.length > 0 ? (
        <form
          className="border border-fog bg-paper p-5 space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            setMsg(null);
            start(async () => {
              const res = await adjustInventory({
                templeId,
                itemId: String(fd.get('itemId') ?? ''),
                movementType: String(fd.get('type') ?? 'in') as 'in' | 'out' | 'adjust',
                quantity: Number(fd.get('quantity') || 0),
                note: String(fd.get('note') ?? ''),
              });
              if (!res.ok) setMsg(res.error ?? 'Lỗi');
              else {
                setMsg('Đã cập nhật tồn kho.');
                window.location.reload();
              }
            });
          }}
        >
          <h2 className="font-display text-xl text-ink">Nhập / xuất kho</h2>
          <label className="block text-xs text-muted">
            Vật phẩm
            <select name="itemId" required className="mt-1 w-full border border-fog px-3 py-2">
              {items.map((i) => (
                <option key={i.id} value={i.id}>
                  {i.name} (tồn {i.quantity_on_hand})
                </option>
              ))}
            </select>
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="block text-xs text-muted">
              Loại
              <select name="type" className="mt-1 w-full border border-fog px-3 py-2">
                <option value="in">Nhập</option>
                <option value="out">Xuất</option>
                <option value="adjust">Đặt tồn =</option>
              </select>
            </label>
            <label className="block text-xs text-muted">
              Số lượng
              <input name="quantity" type="number" required className="mt-1 w-full border border-fog px-3 py-2" />
            </label>
          </div>
          <label className="block text-xs text-muted">
            Ghi chú
            <input name="note" className="mt-1 w-full border border-fog px-3 py-2" />
          </label>
          <button type="submit" disabled={pending} className="w-full py-2.5 text-sm text-white bg-jade">
            Cập nhật tồn
          </button>
        </form>
      ) : null}

      {msg ? <p className="text-xs text-muted">{msg}</p> : null}
    </div>
  );
}
