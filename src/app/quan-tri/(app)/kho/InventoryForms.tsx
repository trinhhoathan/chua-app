'use client';

import { useEffect, useState, useTransition } from 'react';
import {
  upsertInventoryItem,
  adjustInventory,
  deleteInventoryItem,
} from '@/app/actions/admin';
import type { InventoryCategory, InventoryItem } from '@/types/database';

const CAT: Record<string, string> = {
  water: 'Nước',
  incense: 'Hương',
  flower: 'Hoa',
  book: 'Ấn phẩm',
  other: 'Khác',
};

const CATEGORIES: { value: InventoryCategory; label: string }[] = [
  { value: 'water', label: 'Nước' },
  { value: 'incense', label: 'Hương' },
  { value: 'flower', label: 'Hoa' },
  { value: 'book', label: 'Ấn phẩm' },
  { value: 'other', label: 'Khác' },
];

export function InventoryForms({
  templeId,
  items,
}: {
  templeId: string;
  items: InventoryItem[];
}) {
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);
  const [editing, setEditing] = useState<InventoryItem | null>(null);

  const [name, setName] = useState('');
  const [category, setCategory] = useState<InventoryCategory>('water');
  const [unit, setUnit] = useState('thùng');
  const [qty, setQty] = useState(0);
  const [reorder, setReorder] = useState(10);
  const [sku, setSku] = useState('');

  useEffect(() => {
    if (!editing) {
      setName('');
      setCategory('water');
      setUnit('thùng');
      setQty(0);
      setReorder(10);
      setSku('');
      return;
    }
    setName(editing.name);
    setCategory(editing.category);
    setUnit(editing.unit);
    setQty(editing.quantity_on_hand);
    setReorder(editing.reorder_level);
    setSku(editing.sku ?? '');
  }, [editing]);

  function cancelEdit() {
    setEditing(null);
    setMsg(null);
  }

  function remove(item: InventoryItem) {
    if (
      typeof window !== 'undefined' &&
      !window.confirm(`Xóa vật phẩm «${item.name}» khỏi kho?`)
    ) {
      return;
    }
    setMsg(null);
    start(async () => {
      const res = await deleteInventoryItem({
        templeId,
        id: item.id,
      });
      if (!res.ok) {
        setMsg(res.error ?? 'Không xóa được.');
        return;
      }
      if (editing?.id === item.id) setEditing(null);
      window.location.reload();
    });
  }

  return (
    <div className="grid lg:grid-cols-[1fr_1.4fr] gap-8 items-start">
      <div className="space-y-6">
        <form
          className="border border-fog bg-paper p-5 space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            setMsg(null);
            start(async () => {
              const res = await upsertInventoryItem({
                templeId,
                id: editing?.id,
                name,
                category,
                unit,
                quantityOnHand: qty,
                reorderLevel: reorder,
                sku,
              });
              if (!res.ok) setMsg(res.error ?? 'Lỗi');
              else {
                setMsg(editing ? 'Đã cập nhật vật phẩm.' : 'Đã thêm vật phẩm.');
                setEditing(null);
                window.location.reload();
              }
            });
          }}
        >
          <div className="flex items-baseline justify-between gap-3">
            <h2 className="font-display text-xl text-ink">
              {editing ? 'Sửa vật phẩm' : 'Thêm vật phẩm'}
            </h2>
            {editing ? (
              <button
                type="button"
                onClick={cancelEdit}
                className="text-xs text-muted underline"
              >
                Hủy sửa
              </button>
            ) : null}
          </div>
          <label className="block text-xs text-muted">
            Tên *
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="mt-1 w-full border border-fog px-3 py-2"
            />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="block text-xs text-muted">
              Loại
              <select
                value={category}
                onChange={(e) =>
                  setCategory(e.target.value as InventoryCategory)
                }
                className="mt-1 w-full border border-fog px-3 py-2"
              >
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-xs text-muted">
              Đơn vị
              <input
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="mt-1 w-full border border-fog px-3 py-2"
              />
            </label>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <label className="block text-xs text-muted">
              {editing ? 'Tồn hiện tại' : 'Tồn đầu'}
              <input
                type="number"
                value={qty}
                onChange={(e) => setQty(Number(e.target.value || 0))}
                className="mt-1 w-full border border-fog px-3 py-2"
              />
            </label>
            <label className="block text-xs text-muted">
              Mức báo hết
              <input
                type="number"
                value={reorder}
                onChange={(e) => setReorder(Number(e.target.value || 0))}
                className="mt-1 w-full border border-fog px-3 py-2"
              />
            </label>
          </div>
          <label className="block text-xs text-muted">
            SKU
            <input
              value={sku}
              onChange={(e) => setSku(e.target.value)}
              className="mt-1 w-full border border-fog px-3 py-2"
            />
          </label>
          <button
            type="submit"
            disabled={pending}
            className="w-full py-2.5 text-sm text-white bg-ink disabled:opacity-60"
          >
            {pending ? 'Đang lưu…' : editing ? 'Lưu thay đổi' : 'Thêm'}
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
                  movementType: String(fd.get('type') ?? 'in') as
                    | 'in'
                    | 'out'
                    | 'adjust',
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
              <select
                name="itemId"
                required
                className="mt-1 w-full border border-fog px-3 py-2"
              >
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
                <select
                  name="type"
                  className="mt-1 w-full border border-fog px-3 py-2"
                >
                  <option value="in">Nhập</option>
                  <option value="out">Xuất</option>
                  <option value="adjust">Đặt tồn =</option>
                </select>
              </label>
              <label className="block text-xs text-muted">
                Số lượng
                <input
                  name="quantity"
                  type="number"
                  required
                  className="mt-1 w-full border border-fog px-3 py-2"
                />
              </label>
            </div>
            <label className="block text-xs text-muted">
              Ghi chú
              <input
                name="note"
                className="mt-1 w-full border border-fog px-3 py-2"
              />
            </label>
            <button
              type="submit"
              disabled={pending}
              className="w-full py-2.5 text-sm text-white bg-jade disabled:opacity-60"
            >
              Cập nhật tồn
            </button>
          </form>
        ) : null}

        {msg ? <p className="text-xs text-muted">{msg}</p> : null}
      </div>

      <div className="overflow-x-auto border border-fog bg-paper">
        <table className="w-full text-sm">
          <thead className="text-left text-muted bg-mist">
            <tr>
              <th className="p-3">Tên</th>
              <th className="p-3">Loại</th>
              <th className="p-3 text-right">Tồn</th>
              <th className="p-3 text-right">Mức báo</th>
              <th className="p-3">Đơn vị</th>
              <th className="p-3 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-6 text-center text-muted">
                  Kho trống — hãy thêm vật phẩm.
                </td>
              </tr>
            ) : (
              items.map((i) => (
                <tr
                  key={i.id}
                  className={`border-t border-fog ${
                    i.quantity_on_hand <= i.reorder_level
                      ? 'bg-lacquer/5'
                      : ''
                  } ${editing?.id === i.id ? 'bg-mist' : ''}`}
                >
                  <td className="p-3">{i.name}</td>
                  <td className="p-3">{CAT[i.category] ?? i.category}</td>
                  <td className="p-3 text-right font-medium">
                    {i.quantity_on_hand}
                  </td>
                  <td className="p-3 text-right text-muted">{i.reorder_level}</td>
                  <td className="p-3">{i.unit}</td>
                  <td className="p-3 text-right whitespace-nowrap">
                    <button
                      type="button"
                      disabled={pending}
                      onClick={() => {
                        setEditing(i);
                        setMsg(null);
                      }}
                      className="text-xs px-2 py-1 border border-ink/20 hover:bg-mist mr-1"
                    >
                      Sửa
                    </button>
                    <button
                      type="button"
                      disabled={pending}
                      onClick={() => remove(i)}
                      className="text-xs px-2 py-1 border border-lacquer/40 text-lacquer hover:bg-lacquer/5"
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
