'use server';

import { revalidatePath, revalidateTag } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { assertTempleAccess } from '@/lib/auth';
import { getCurrentTemple } from '@/lib/tenant';
import { supabase } from '@/lib/supabase';
import { sendDevoteeNotification } from '@/lib/notifications';
import type { PrayerRequestType, TempleEventType } from '@/types/database';
import { normalizeVnTime, parseVnDate } from '@/lib/vn-date';

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
  /** dd/mm/yyyy */
  birthDate?: string;
  /** HH:mm */
  birthTime?: string;
  birthYear?: number;
  phone?: string;
  address?: string;
  note?: string;
  /** dd/mm/yyyy */
  quyYDate?: string;
}): Promise<{ ok: boolean; error?: string }> {
  try {
    await assertTempleAccess(input.templeId);
  } catch {
    return { ok: false, error: 'Không có quyền.' };
  }

  let birth_date: string | null = null;
  let birth_year: number | null = null;
  if (input.birthDate?.trim()) {
    const parsed = parseVnDate(input.birthDate);
    if (!parsed) {
      return {
        ok: false,
        error: 'Ngày sinh không hợp lệ. Dùng định dạng dd/mm/yyyy.',
      };
    }
    birth_date = parsed.isoDate;
    birth_year = parsed.year;
  } else if (input.birthYear) {
    birth_year = input.birthYear;
  }

  let birth_time: string | null = null;
  if (input.birthTime?.trim()) {
    birth_time = normalizeVnTime(input.birthTime);
    if (!birth_time) {
      return { ok: false, error: 'Giờ sinh không hợp lệ.' };
    }
  }

  let quy_y_date: string | null = null;
  if (input.quyYDate?.trim()) {
    // Cho phép cả dd/mm/yyyy và YYYY-MM-DD (cũ)
    const raw = input.quyYDate.trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
      quy_y_date = raw;
    } else {
      const parsed = parseVnDate(raw);
      if (!parsed) {
        return {
          ok: false,
          error: 'Ngày quy y không hợp lệ. Dùng định dạng dd/mm/yyyy.',
        };
      }
      quy_y_date = parsed.isoDate;
    }
  }

  const supabase = await createClient();
  const row = {
    temple_id: input.templeId,
    full_name: input.fullName.trim(),
    dharma_name: input.dharmaName?.trim() || null,
    birth_year,
    birth_date,
    birth_time,
    phone: input.phone?.trim() || null,
    address: input.address?.trim() || null,
    note: input.note?.trim() || null,
    quy_y_date,
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
  dharmaName?: string;
  /** dd/mm/yyyy */
  birthDate?: string;
  /** HH:mm */
  birthTime?: string;
  address?: string;
  note?: string;
  /** dd/mm/yyyy */
  quyYDate?: string;
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

  let birth_date: string | null = null;
  let birth_year: number | null = null;
  if (input.birthDate?.trim()) {
    const parsed = parseVnDate(input.birthDate);
    if (!parsed) {
      return {
        ok: false,
        error: 'Ngày sinh không hợp lệ. Chọn đủ ngày / tháng / năm.',
      };
    }
    birth_date = parsed.isoDate;
    birth_year = parsed.year;
  }

  let birth_time: string | null = null;
  if (input.birthTime?.trim()) {
    birth_time = normalizeVnTime(input.birthTime);
    if (!birth_time) {
      return { ok: false, error: 'Giờ sinh không hợp lệ.' };
    }
  }

  let quy_y_date: string | null = null;
  if (input.quyYDate?.trim()) {
    const parsed = parseVnDate(input.quyYDate);
    if (!parsed) {
      return {
        ok: false,
        error: 'Ngày quy y không hợp lệ. Chọn đủ ngày / tháng / năm.',
      };
    }
    quy_y_date = parsed.isoDate;
  }

  const phone = normalizePhoneKey(phoneRaw);
  const supabase = await createClient();
  const { data, error } = await supabase.rpc('register_devotee_web', {
    p_temple_id: temple.id,
    p_full_name: fullName,
    p_phone: phone,
    p_dharma_name: input.dharmaName?.trim() || null,
    p_birth_date: birth_date,
    p_birth_time: birth_time,
    p_birth_year: birth_year,
    p_address: input.address?.trim() || null,
    p_note: input.note?.trim() || null,
    p_quy_y_date: quy_y_date,
  });

  if (error) return { ok: false, error: error.message };

  const existing = Boolean(
    data && typeof data === 'object' && (data as { existing?: boolean }).existing,
  );

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
  return { ok: true, existing };
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

const TEMPLE_IMAGE_MAX_BYTES = 2 * 1024 * 1024;
const TEMPLE_IMAGE_MIME = new Set(['image/jpeg', 'image/png', 'image/webp']);
type TempleMediaKind = 'events' | 'abbott' | 'gallery' | 'hero';
const TEMPLE_MEDIA_KINDS: TempleMediaKind[] = [
  'events',
  'abbott',
  'gallery',
  'hero',
];

/** Upload ảnh lên Storage (bucket temple-media). kind: events | abbott | gallery | hero */
export async function uploadTempleMedia(
  formData: FormData,
): Promise<{ ok: boolean; url?: string; error?: string }> {
  const templeId = String(formData.get('templeId') ?? '').trim();
  const kindRaw = String(formData.get('kind') ?? 'events').trim();
  const file = formData.get('file');
  const kind = TEMPLE_MEDIA_KINDS.includes(kindRaw as TempleMediaKind)
    ? (kindRaw as TempleMediaKind)
    : null;

  if (!templeId) return { ok: false, error: 'Thiếu chùa.' };
  if (!kind) {
    return { ok: false, error: 'Loại ảnh không hợp lệ.' };
  }
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, error: 'Chưa chọn ảnh.' };
  }

  try {
    await assertTempleAccess(templeId);
  } catch {
    return { ok: false, error: 'Không có quyền tải ảnh.' };
  }

  if (!TEMPLE_IMAGE_MIME.has(file.type)) {
    return { ok: false, error: 'Chỉ nhận ảnh JPG, PNG hoặc WebP.' };
  }
  if (file.size > TEMPLE_IMAGE_MAX_BYTES) {
    return { ok: false, error: 'Ảnh tối đa 2MB. Hãy chọn ảnh nhỏ hơn.' };
  }

  const ext =
    file.type === 'image/png' ? 'png' : file.type === 'image/webp' ? 'webp' : 'jpg';
  const path = `${kind}/${templeId}/${crypto.randomUUID()}.${ext}`;

  const supabase = await createClient();
  const buffer = Buffer.from(await file.arrayBuffer());
  const { error } = await supabase.storage.from('temple-media').upload(path, buffer, {
    contentType: file.type,
    upsert: false,
    cacheControl: '31536000',
  });

  if (error) return { ok: false, error: error.message };

  const { data } = supabase.storage.from('temple-media').getPublicUrl(path);
  return { ok: true, url: data.publicUrl };
}

/** @deprecated Dùng uploadTempleMedia với kind=events */
export async function uploadEventImage(
  formData: FormData,
): Promise<{ ok: boolean; url?: string; error?: string }> {
  if (!formData.get('kind')) formData.set('kind', 'events');
  return uploadTempleMedia(formData);
}

export async function updateAbbottPortrait(input: {
  templeId: string;
  imageUrl: string | null;
}): Promise<{ ok: boolean; error?: string }> {
  try {
    await assertTempleAccess(input.templeId);
  } catch {
    return { ok: false, error: 'Không có quyền.' };
  }

  const url = input.imageUrl?.trim() || null;
  const supabase = await createClient();
  const { error } = await supabase
    .from('temples')
    .update({
      abbott_image_url: url,
      updated_at: new Date().toISOString(),
    })
    .eq('id', input.templeId);

  if (error) return { ok: false, error: error.message };

  revalidateTag('temples', 'max');
  revalidatePath('/quan-tri/hinh-anh');
  revalidatePath('/');
  return { ok: true };
}

export async function updateTempleHero(input: {
  templeId: string;
  imageUrl: string | null;
}): Promise<{ ok: boolean; error?: string }> {
  try {
    await assertTempleAccess(input.templeId);
  } catch {
    return { ok: false, error: 'Không có quyền.' };
  }

  const url = input.imageUrl?.trim() || null;
  const supabase = await createClient();
  const { error } = await supabase
    .from('temples')
    .update({
      hero_image_url: url,
      updated_at: new Date().toISOString(),
    })
    .eq('id', input.templeId);

  if (error) return { ok: false, error: error.message };

  revalidateTag('temples', 'max');
  revalidatePath('/quan-tri/hinh-anh');
  revalidatePath('/');
  return { ok: true };
}

export async function updateTempleGallery(input: {
  templeId: string;
  gallery: Array<{ url: string; alt?: string }>;
}): Promise<{ ok: boolean; error?: string }> {
  try {
    await assertTempleAccess(input.templeId);
  } catch {
    return { ok: false, error: 'Không có quyền.' };
  }

  const gallery = (input.gallery ?? [])
    .map((g) => ({
      url: String(g.url ?? '').trim(),
      alt: g.alt?.trim() || undefined,
    }))
    .filter((g) => Boolean(g.url));

  if (gallery.length > 60) {
    return { ok: false, error: 'Thư viện tối đa 60 ảnh.' };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from('temples')
    .update({
      gallery,
      updated_at: new Date().toISOString(),
    })
    .eq('id', input.templeId);

  if (error) return { ok: false, error: error.message };

  revalidateTag('temples', 'max');
  revalidatePath('/quan-tri/hinh-anh');
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

export async function deleteInventoryItem(input: {
  templeId: string;
  id: string;
}): Promise<{ ok: boolean; error?: string }> {
  try {
    await assertTempleAccess(input.templeId);
  } catch {
    return { ok: false, error: 'Không có quyền.' };
  }
  if (!input.id) return { ok: false, error: 'Thiếu mã vật phẩm.' };

  const supabase = await createClient();
  const { error } = await supabase
    .from('inventory_items')
    .update({
      is_active: false,
      updated_at: new Date().toISOString(),
    })
    .eq('id', input.id)
    .eq('temple_id', input.templeId);

  if (error) return { ok: false, error: error.message };
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
    const ctx = await assertTempleAccess(input.templeId);
    if (!ctx.isSuperAdmin) {
      return {
        ok: false,
        error: 'Chỉ siêu quản trị viên được chỉnh đơn giá nước.',
      };
    }
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
