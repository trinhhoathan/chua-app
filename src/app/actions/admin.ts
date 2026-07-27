'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { assertTempleAccess } from '@/lib/auth';
import { getCurrentTemple } from '@/lib/tenant';
import { supabase } from '@/lib/supabase';
import { sendDevoteeNotification } from '@/lib/notifications';
import type { PrayerRequestType } from '@/types/database';

export async function createPrayerRequest(input: {
  requestType: PrayerRequestType;
  requesterName: string;
  requesterPhone?: string;
  devoteeNames: string;
  birthYears?: string;
  address?: string;
  ceremonyDate?: string;
  note?: string;
}): Promise<{ ok: boolean; error?: string; id?: string }> {
  const temple = await getCurrentTemple();
  if (!temple) return { ok: false, error: 'Không tìm thấy chùa.' };

  const requesterName = input.requesterName.trim();
  const devoteeNames = input.devoteeNames.trim();
  if (requesterName.length < 2 || devoteeNames.length < 2) {
    return { ok: false, error: 'Vui lòng nhập đủ họ tên.' };
  }

  const { data, error } = await supabase
    .from('prayer_requests')
    .insert({
      temple_id: temple.id,
      request_type: input.requestType,
      requester_name: requesterName,
      requester_phone: input.requesterPhone?.trim() || null,
      devotee_names: devoteeNames,
      birth_years: input.birthYears?.trim() || null,
      address: input.address?.trim() || null,
      ceremony_date: input.ceremonyDate || null,
      note: input.note?.trim() || null,
      status: 'pending',
    })
    .select('id')
    .maybeSingle();

  if (error) return { ok: false, error: error.message };

  try {
    if (process.env.SUPABASE_SERVICE_ROLE_KEY && input.requesterPhone) {
      await sendDevoteeNotification({
        templeId: temple.id,
        recipient: input.requesterPhone,
        templateKey: 'prayer_received',
        payload: {
          customerName: requesterName,
          templeName: temple.name,
          requestType: input.requestType,
        },
      });
    }
  } catch {
    // ignore
  }

  revalidatePath('/quan-tri/so-cau');
  return { ok: true, id: data?.id };
}

export async function updatePrayerStatus(input: {
  id: string;
  templeId: string;
  status: string;
}): Promise<{ ok: boolean; error?: string }> {
  try {
    await assertTempleAccess(input.templeId);
  } catch {
    return { ok: false, error: 'Không có quyền.' };
  }
  const supabase = await createClient();
  const { error } = await supabase
    .from('prayer_requests')
    .update({ status: input.status, updated_at: new Date().toISOString() })
    .eq('id', input.id)
    .eq('temple_id', input.templeId);
  if (error) return { ok: false, error: error.message };
  revalidatePath('/quan-tri/so-cau');
  return { ok: true };
}

export async function upsertDevotee(input: {
  templeId: string;
  id?: string;
  fullName: string;
  dharmaName?: string;
  birthYear?: number;
  phone?: string;
  address?: string;
  note?: string;
  quyYDate?: string;
}): Promise<{ ok: boolean; error?: string }> {
  try {
    await assertTempleAccess(input.templeId);
  } catch {
    return { ok: false, error: 'Không có quyền.' };
  }
  const supabase = await createClient();
  const row = {
    temple_id: input.templeId,
    full_name: input.fullName.trim(),
    dharma_name: input.dharmaName?.trim() || null,
    birth_year: input.birthYear || null,
    phone: input.phone?.trim() || null,
    address: input.address?.trim() || null,
    note: input.note?.trim() || null,
    quy_y_date: input.quyYDate || null,
    updated_at: new Date().toISOString(),
  };
  if (!row.full_name) return { ok: false, error: 'Thiếu họ tên.' };

  if (input.id) {
    const { error } = await supabase
      .from('devotees')
      .update(row)
      .eq('id', input.id)
      .eq('temple_id', input.templeId);
    if (error) return { ok: false, error: error.message };
  } else {
    const { error } = await supabase.from('devotees').insert(row);
    if (error) return { ok: false, error: error.message };
  }
  revalidatePath('/quan-tri/phat-tu');
  return { ok: true };
}

export async function deleteDevotee(input: {
  id: string;
  templeId: string;
}): Promise<{ ok: boolean; error?: string }> {
  try {
    await assertTempleAccess(input.templeId);
  } catch {
    return { ok: false, error: 'Không có quyền.' };
  }
  const supabase = await createClient();
  const { error } = await supabase
    .from('devotees')
    .delete()
    .eq('id', input.id)
    .eq('temple_id', input.templeId);
  if (error) return { ok: false, error: error.message };
  revalidatePath('/quan-tri/phat-tu');
  return { ok: true };
}

export async function upsertInventoryItem(input: {
  templeId: string;
  id?: string;
  name: string;
  category: string;
  unit: string;
  quantityOnHand: number;
  reorderLevel: number;
  sku?: string;
  note?: string;
}): Promise<{ ok: boolean; error?: string }> {
  try {
    await assertTempleAccess(input.templeId);
  } catch {
    return { ok: false, error: 'Không có quyền.' };
  }
  const supabase = await createClient();
  const row = {
    temple_id: input.templeId,
    name: input.name.trim(),
    category: input.category,
    unit: input.unit.trim() || 'cái',
    quantity_on_hand: input.quantityOnHand,
    reorder_level: input.reorderLevel,
    sku: input.sku?.trim() || null,
    note: input.note?.trim() || null,
    updated_at: new Date().toISOString(),
  };
  if (!row.name) return { ok: false, error: 'Thiếu tên vật phẩm.' };

  if (input.id) {
    const { error } = await supabase
      .from('inventory_items')
      .update(row)
      .eq('id', input.id)
      .eq('temple_id', input.templeId);
    if (error) return { ok: false, error: error.message };
  } else {
    const { error } = await supabase.from('inventory_items').insert(row);
    if (error) return { ok: false, error: error.message };
  }
  revalidatePath('/quan-tri/kho');
  return { ok: true };
}

export async function adjustInventory(input: {
  templeId: string;
  itemId: string;
  movementType: 'in' | 'out' | 'adjust';
  quantity: number;
  note?: string;
}): Promise<{ ok: boolean; error?: string }> {
  try {
    await assertTempleAccess(input.templeId);
  } catch {
    return { ok: false, error: 'Không có quyền.' };
  }
  if (!input.quantity || input.quantity === 0) {
    return { ok: false, error: 'Số lượng không hợp lệ.' };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: item } = await supabase
    .from('inventory_items')
    .select('*')
    .eq('id', input.itemId)
    .eq('temple_id', input.templeId)
    .maybeSingle();
  if (!item) return { ok: false, error: 'Không tìm thấy vật phẩm.' };

  let nextQty = item.quantity_on_hand;
  if (input.movementType === 'in') nextQty += Math.abs(input.quantity);
  else if (input.movementType === 'out') nextQty -= Math.abs(input.quantity);
  else nextQty = input.quantity;

  if (nextQty < 0) return { ok: false, error: 'Tồn kho không đủ.' };

  const { error: movErr } = await supabase.from('inventory_movements').insert({
    item_id: input.itemId,
    temple_id: input.templeId,
    movement_type: input.movementType,
    quantity: input.quantity,
    note: input.note?.trim() || null,
    created_by: user?.id ?? null,
  });
  if (movErr) return { ok: false, error: movErr.message };

  const { error: updErr } = await supabase
    .from('inventory_items')
    .update({
      quantity_on_hand: nextQty,
      updated_at: new Date().toISOString(),
    })
    .eq('id', input.itemId);
  if (updErr) return { ok: false, error: updErr.message };

  revalidatePath('/quan-tri/kho');
  return { ok: true };
}
