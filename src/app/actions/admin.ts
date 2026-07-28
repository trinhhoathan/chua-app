'use server';

import { revalidatePath, revalidateTag } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { assertTempleAccess } from '@/lib/auth';
import { getCurrentTemple } from '@/lib/tenant';
import { supabase } from '@/lib/supabase';
import { sendDevoteeNotification } from '@/lib/notifications';
import type { PrayerRequestType, TempleEventType } from '@/types/database';

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

const PHONE_REGEX = /^[0-9+()\-\s]{8,15}$/;

function normalizePhoneKey(raw: string): string {
  return raw.replace(/[^\d+]/g, '');
}

export async function registerDevoteePublic(input: {
  fullName: string;
  phone: string;
  consent: boolean;
  preferredChannel?: 'zalo' | 'sms' | 'phone';
  note?: string;
  hp?: string;
}): Promise<{ ok: boolean; error?: string; existing?: boolean }> {
  if (input.hp && input.hp.trim() !== '') return { ok: true };

  const temple = await getCurrentTemple();
  if (!temple) return { ok: false, error: 'Không tìm thấy chùa.' };

  const fullName = input.fullName.trim();
  const phoneRaw = input.phone.trim();
  if (fullName.length < 2) {
    return { ok: false, error: 'Vui lòng nhập đầy đủ họ và tên.' };
  }
  if (!PHONE_REGEX.test(phoneRaw)) {
    return { ok: false, error: 'Số điện thoại chưa hợp lệ.' };
  }
  if (!input.consent) {
    return {
      ok: false,
      error: 'Cần đồng ý nhận thông tin lễ hoạt động từ nhà chùa.',
    };
  }

  const phone = normalizePhoneKey(phoneRaw);
  const admin = getSupabaseAdmin();

  const { data: existing } = await admin
    .from('devotees')
    .select('id, full_name, consent_contact')
    .eq('temple_id', temple.id)
    .eq('phone', phone)
    .maybeSingle();

  if (existing?.id) {
    const { error } = await admin
      .from('devotees')
      .update({
        full_name: fullName,
        consent_contact: true,
        preferred_channel: input.preferredChannel ?? 'zalo',
        note: input.note?.trim() || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', existing.id);
    if (error) return { ok: false, error: error.message };
  } else {
    const { error } = await admin.from('devotees').insert({
      temple_id: temple.id,
      full_name: fullName,
      phone,
      consent_contact: true,
      preferred_channel: input.preferredChannel ?? 'zalo',
      source: 'web',
      note: input.note?.trim() || null,
    });
    if (error) return { ok: false, error: error.message };
  }

  try {
    if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
      await sendDevoteeNotification({
        templeId: temple.id,
        recipient: phone,
        templateKey: 'devotee_registered',
        payload: {
          customerName: fullName,
          templeName: temple.name,
        },
      });
    }
  } catch {
    // ignore
  }

  revalidatePath('/quan-tri/phat-tu');
  return { ok: true, existing: Boolean(existing) };
}

export async function upsertTempleEvent(input: {
  templeId: string;
  id?: string;
  title: string;
  summary?: string;
  imageUrl?: string;
  eventType: TempleEventType;
  startsAt: string;
  endsAt?: string;
  location?: string;
  isPublished?: boolean;
  sortOrder?: number;
}): Promise<{ ok: boolean; error?: string }> {
  try {
    await assertTempleAccess(input.templeId);
  } catch {
    return { ok: false, error: 'Không có quyền.' };
  }
  const title = input.title.trim();
  if (title.length < 2) return { ok: false, error: 'Thiếu tiêu đề sự kiện.' };
  if (!input.startsAt) return { ok: false, error: 'Thiếu ngày giờ bắt đầu.' };

  const starts = new Date(input.startsAt);
  if (Number.isNaN(starts.getTime())) {
    return { ok: false, error: 'Ngày giờ bắt đầu không hợp lệ.' };
  }
  const ends = input.endsAt
    ? new Date(input.endsAt)
    : new Date(starts.getTime() + 2 * 60 * 60 * 1000);
  if (Number.isNaN(ends.getTime())) {
    return { ok: false, error: 'Ngày giờ kết thúc không hợp lệ.' };
  }
  if (ends.getTime() < starts.getTime()) {
    return { ok: false, error: 'Ngày kết thúc phải sau ngày bắt đầu.' };
  }

  const supabase = await createClient();
  const row = {
    temple_id: input.templeId,
    title,
    summary: input.summary?.trim() || null,
    image_url: input.imageUrl?.trim() || null,
    event_type: input.eventType,
    starts_at: starts.toISOString(),
    ends_at: ends.toISOString(),
    location: input.location?.trim() || null,
    is_published: input.isPublished ?? true,
    sort_order: input.sortOrder ?? 0,
    updated_at: new Date().toISOString(),
  };

  if (input.id) {
    const { error } = await supabase
      .from('temple_events')
      .update(row)
      .eq('id', input.id)
      .eq('temple_id', input.templeId);
    if (error) return { ok: false, error: error.message };
  } else {
    const { error } = await supabase.from('temple_events').insert(row);
    if (error) return { ok: false, error: error.message };
  }

  revalidatePath('/quan-tri/hoat-dong');
  revalidatePath('/');
  return { ok: true };
}

export async function deleteTempleEvent(input: {
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
    .from('temple_events')
    .delete()
    .eq('id', input.id)
    .eq('temple_id', input.templeId);
  if (error) return { ok: false, error: error.message };
  revalidatePath('/quan-tri/hoat-dong');
  revalidatePath('/');
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

export async function updateWaterPrice(input: {
  templeId: string;
  waterPriceVnd: number;
}): Promise<{ ok: boolean; error?: string; price?: number }> {
  try {
    await assertTempleAccess(input.templeId);
  } catch {
    return { ok: false, error: 'Không có quyền.' };
  }

  const price = Math.round(Number(input.waterPriceVnd));
  if (!Number.isFinite(price) || price < 1000 || price > 10_000_000) {
    return {
      ok: false,
      error: 'Đơn giá phải từ 1.000đ đến 10.000.000đ / thùng.',
    };
  }
  if (price % 1000 !== 0) {
    return { ok: false, error: 'Đơn giá nên làm tròn đến hàng nghìn đồng.' };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from('temples')
    .update({
      water_price_vnd: price,
      updated_at: new Date().toISOString(),
    })
    .eq('id', input.templeId);

  if (error) return { ok: false, error: error.message };

  revalidateTag('temples', 'max');
  revalidatePath('/quan-tri/don-gia');
  revalidatePath('/quan-tri');
  revalidatePath('/');
  revalidatePath('/dat-nuoc');
  return { ok: true, price };
}

export async function updateContactLinks(input: {
  templeId: string;
  hotline?: string;
  links: {
    youtube?: string;
    tiktok?: string;
    facebook?: string;
    messenger?: string;
    zalo?: string;
    zalo_community?: string;
    instagram?: string;
    threads?: string;
    x?: string;
    phone?: string;
  };
}): Promise<{ ok: boolean; error?: string }> {
  try {
    await assertTempleAccess(input.templeId);
  } catch {
    return { ok: false, error: 'Không có quyền.' };
  }

  const clean = (v?: string) => {
    const t = (v ?? '').trim();
    return t || null;
  };

  const contact_links = {
    youtube: clean(input.links.youtube),
    tiktok: clean(input.links.tiktok),
    facebook: clean(input.links.facebook),
    messenger: clean(input.links.messenger),
    zalo: clean(input.links.zalo),
    zalo_community: clean(input.links.zalo_community),
    instagram: clean(input.links.instagram),
    threads: clean(input.links.threads),
    x: clean(input.links.x),
    phone: clean(input.links.phone),
  };

  const hotline = clean(input.hotline) ?? contact_links.phone;
  contact_links.phone = hotline;

  const supabase = await createClient();
  const { error } = await supabase
    .from('temples')
    .update({
      contact_links,
      hotline,
      updated_at: new Date().toISOString(),
    })
    .eq('id', input.templeId);

  if (error) return { ok: false, error: error.message };

  revalidateTag('temples', 'max');
  revalidatePath('/quan-tri/lien-he');
  revalidatePath('/quan-tri');
  revalidatePath('/');
  return { ok: true };
}
