'use server';

import { revalidatePath, revalidateTag } from 'next/cache';
import { assertTempleAccess, getAdminDb, type AdminContext } from '@/lib/auth';
import {
  buildSimScorePayload,
  generateDemoSims,
  suggestSimPrice,
} from '@/lib/sim/scoring';
import { normalizeSimPhone } from '@/lib/sim/catalog';
import { getHexagram } from '@/lib/fengshui/kinh-dich-64';
import type {
  SimListing,
  SimOrder,
  SimOrderStatus,
  SimSource,
  SimStatus,
} from '@/types/database';

export type SimAdminResult = { ok: true } | { ok: false; error: string };

function fail(e: unknown, fallback: string): { ok: false; error: string } {
  return { ok: false, error: e instanceof Error ? e.message : fallback };
}

async function requireSuperAdminForWarehouse(
  templeId: string,
): Promise<AdminContext | { ok: false; error: string }> {
  try {
    const ctx = await assertTempleAccess(templeId);
    if (!ctx.isSuperAdmin) {
      return {
        ok: false,
        error: 'Chỉ SuperAdmin được quản lý kho sim trung tâm.',
      };
    }
    return ctx;
  } catch {
    return { ok: false, error: 'Không có quyền truy cập.' };
  }
}

function revalidateSimPaths() {
  revalidatePath('/quan-tri/sim');
  revalidatePath('/quan-tri/sim/don-hang');
  revalidatePath('/sim');
  revalidatePath('/');
  revalidateTag('sims', 'max');
}

/* ------------------------------------------------------------------ */
/* Kho sim                                                             */
/* ------------------------------------------------------------------ */

export interface ListSimsAdminInput {
  templeId: string;
  q?: string;
  status?: string;
  /** Lọc theo nguồn kho sim; `__none__` = chưa gán nguồn */
  sourceId?: string;
  page?: number;
  pageSize?: number;
}

export async function listSimsAdminAction(input: ListSimsAdminInput): Promise<{
  ok: boolean;
  error?: string;
  sims?: SimListing[];
  total?: number;
}> {
  const gate = await requireSuperAdminForWarehouse(input.templeId);
  if ('ok' in gate && gate.ok === false) return gate;

  const db = await getAdminDb();
  const page = Math.max(1, input.page ?? 1);
  const pageSize = Math.min(100, Math.max(10, input.pageSize ?? 50));

  let query = db
    .from('sim_listings')
    .select('*', { count: 'exact' })
    .eq('temple_id', input.templeId);

  const digits = (input.q ?? '').replace(/[^\d*]/g, '');
  if (digits) {
    const pattern = digits.includes('*')
      ? digits.replace(/\*+/g, '%')
      : `%${digits}%`;
    query = query.like('phone', pattern);
  }
  if (input.status) query = query.eq('status', input.status);
  if (input.sourceId === '__none__') query = query.is('source_id', null);
  else if (input.sourceId) query = query.eq('source_id', input.sourceId);

  const from = (page - 1) * pageSize;
  const { data, count, error } = await query
    .order('created_at', { ascending: false })
    .range(from, from + pageSize - 1);

  if (error) return { ok: false, error: error.message };
  return { ok: true, sims: (data ?? []) as SimListing[], total: count ?? 0 };
}

/** Xuất toàn bộ kho sim ra CSV (mở được bằng Excel). */
export async function exportSimsCsvAction(input: {
  templeId: string;
  status?: string;
}): Promise<{ ok: boolean; error?: string; csv?: string; count?: number }> {
  {
    const gate = await requireSuperAdminForWarehouse(input.templeId);
    if ('ok' in gate && gate.ok === false) return gate;
  }

  const db = await getAdminDb();
  let query = db
    .from('sim_listings')
    .select(
      'phone, phone_display, network, price_vnd, original_price_vnd, status, featured, overall_score, du_nien_score, verdict, nut, element, so_ly_81, que_number, tags, careers, source_id, created_at, sim_sources(name, contact_phone, commission_percent)',
    )
    .eq('temple_id', input.templeId)
    .order('overall_score', { ascending: false })
    .limit(10000);
  if (input.status) query = query.eq('status', input.status);

  const { data, error } = await query;
  if (error) return { ok: false, error: error.message };

  const esc = (v: unknown): string => {
    const s = v == null ? '' : String(v);
    return /[",\n;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };

  const header = [
    'so_dien_thoai',
    'hien_thi',
    'nha_mang',
    'gia_vnd',
    'gia_goc_vnd',
    'trang_thai',
    'noi_bat',
    'diem_tong',
    'diem_du_nien',
    'ket_luan',
    'tong_nut',
    'ngu_hanh',
    'so_ly_81',
    'que_so',
    'que_kinh_dich',
    'tags',
    'nganh_nghe',
    'kho_sim',
    'lien_he_nguon',
    'hoa_hong_pct',
    'ngay_tao',
  ].join(',');

  const rows = (data ?? []).map((r) => {
    const src = (r as { sim_sources?: { name?: string; contact_phone?: string; commission_percent?: number } | null })
      .sim_sources;
    return [
      esc(r.phone),
      esc(r.phone_display),
      esc(r.network),
      esc(r.price_vnd),
      esc(r.original_price_vnd ?? ''),
      esc(r.status),
      esc(r.featured ? '1' : '0'),
      esc(r.overall_score),
      esc(r.du_nien_score),
      esc(r.verdict),
      esc(r.nut),
      esc(r.element),
      esc(r.so_ly_81),
      esc(r.que_number ?? ''),
      esc(r.que_number ? getHexagram(r.que_number)?.nameFull ?? '' : ''),
      esc(Array.isArray(r.tags) ? (r.tags as string[]).join('|') : ''),
      esc(Array.isArray(r.careers) ? (r.careers as string[]).join('|') : ''),
      esc(src?.name ?? ''),
      esc(src?.contact_phone ?? ''),
      esc(src?.commission_percent ?? ''),
      esc(r.created_at),
    ].join(',');
  });

  return {
    ok: true,
    csv: [header, ...rows].join('\r\n'),
    count: rows.length,
  };
}

export async function createSimAction(input: {
  templeId: string;
  phone: string;
  priceVnd?: number;
  originalPriceVnd?: number | null;
  featured?: boolean;
  description?: string;
  sourceId?: string | null;
}): Promise<SimAdminResult> {
  {
    const gate = await requireSuperAdminForWarehouse(input.templeId);
    if ('ok' in gate && gate.ok === false) return gate;
  }

  const payload = buildSimScorePayload(input.phone);
  if (!payload) {
    return {
      ok: false,
      error: 'Số không hợp lệ hoặc không luận được theo nguyên lý Âm Dương Ngũ Hành, Kinh dịch diệu luận (quá nhiều số 0/5).',
    };
  }

  const price =
    input.priceVnd && input.priceVnd > 0
      ? Math.round(input.priceVnd)
      : suggestSimPrice(payload);

  const db = await getAdminDb();
  const { error } = await db.from('sim_listings').insert({
    temple_id: input.templeId,
    ...payload,
    price_vnd: price,
    original_price_vnd:
      input.originalPriceVnd && input.originalPriceVnd > price
        ? Math.round(input.originalPriceVnd)
        : null,
    featured: Boolean(input.featured),
    description: (input.description ?? '').trim() || null,
    source_id: input.sourceId || null,
    status: 'available',
  });

  if (error) {
    if (/duplicate|unique/i.test(error.message)) {
      return { ok: false, error: `Số ${payload.phone} đã có trong kho.` };
    }
    return { ok: false, error: error.message };
  }
  revalidateSimPaths();
  return { ok: true };
}

export async function updateSimAction(input: {
  id: string;
  templeId: string;
  priceVnd?: number;
  originalPriceVnd?: number | null;
  status?: SimStatus;
  featured?: boolean;
  description?: string | null;
  sourceId?: string | null;
}): Promise<SimAdminResult> {
  {
    const gate = await requireSuperAdminForWarehouse(input.templeId);
    if ('ok' in gate && gate.ok === false) return gate;
  }

  const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (typeof input.priceVnd === 'number' && input.priceVnd >= 0) {
    patch.price_vnd = Math.round(input.priceVnd);
  }
  if (input.originalPriceVnd !== undefined) {
    patch.original_price_vnd =
      input.originalPriceVnd && input.originalPriceVnd > 0
        ? Math.round(input.originalPriceVnd)
        : null;
  }
  if (input.status) patch.status = input.status;
  if (typeof input.featured === 'boolean') patch.featured = input.featured;
  if (input.description !== undefined) {
    patch.description = (input.description ?? '').trim() || null;
  }
  if (input.sourceId !== undefined) {
    patch.source_id = input.sourceId || null;
  }

  const db = await getAdminDb();
  const { error } = await db
    .from('sim_listings')
    .update(patch)
    .eq('id', input.id)
    .eq('temple_id', input.templeId);

  if (error) return { ok: false, error: error.message };
  revalidateSimPaths();
  return { ok: true };
}

export async function deleteSimAction(input: {
  id: string;
  templeId: string;
}): Promise<SimAdminResult> {
  {
    const gate = await requireSuperAdminForWarehouse(input.templeId);
    if ('ok' in gate && gate.ok === false) return gate;
  }

  const db = await getAdminDb();
  const { error } = await db
    .from('sim_listings')
    .delete()
    .eq('id', input.id)
    .eq('temple_id', input.templeId);

  if (error) return { ok: false, error: error.message };
  revalidateSimPaths();
  return { ok: true };
}

export async function bulkUpdateSimPriceAction(input: {
  templeId: string;
  ids: string[];
  mode: 'percent' | 'amount' | 'set';
  value: number;
}): Promise<SimAdminResult & { updated?: number }> {
  {
    const gate = await requireSuperAdminForWarehouse(input.templeId);
    if ('ok' in gate && gate.ok === false) return gate;
  }
  if (input.ids.length === 0) {
    return { ok: false, error: 'Chưa chọn sim nào.' };
  }
  if (!Number.isFinite(input.value)) {
    return { ok: false, error: 'Giá trị không hợp lệ.' };
  }

  const db = await getAdminDb();
  const { data, error } = await db
    .from('sim_listings')
    .select('id, price_vnd')
    .eq('temple_id', input.templeId)
    .in('id', input.ids);

  if (error) return { ok: false, error: error.message };

  let updated = 0;
  for (const row of data ?? []) {
    const current = Number(row.price_vnd) || 0;
    let next = current;
    if (input.mode === 'percent') next = current * (1 + input.value / 100);
    else if (input.mode === 'amount') next = current + input.value;
    else next = input.value;
    next = Math.max(0, Math.round(next / 1000) * 1000);

    const { error: updErr } = await db
      .from('sim_listings')
      .update({ price_vnd: next, updated_at: new Date().toISOString() })
      .eq('id', row.id)
      .eq('temple_id', input.templeId);
    if (!updErr) updated++;
  }

  revalidateSimPaths();
  return { ok: true, updated };
}

/**
 * Bật flash sale cho các sim đã chọn: lưu giá gốc, giảm % và đặt giờ kết thúc.
 */
export async function startFlashSaleAction(input: {
  templeId: string;
  ids: string[];
  percentOff: number;
  hours: number;
}): Promise<SimAdminResult & { updated?: number }> {
  {
    const gate = await requireSuperAdminForWarehouse(input.templeId);
    if ('ok' in gate && gate.ok === false) return gate;
  }
  if (input.ids.length === 0) return { ok: false, error: 'Chưa chọn sim nào.' };
  const percent = Math.min(90, Math.max(1, Math.floor(input.percentOff)));
  const hours = Math.min(24 * 30, Math.max(1, Math.floor(input.hours)));
  const endsAt = new Date(Date.now() + hours * 3600_000).toISOString();

  const db = await getAdminDb();
  const { data, error } = await db
    .from('sim_listings')
    .select('id, price_vnd, original_price_vnd')
    .eq('temple_id', input.templeId)
    .in('id', input.ids);
  if (error) return { ok: false, error: error.message };

  let updated = 0;
  for (const row of data ?? []) {
    const current = Number(row.price_vnd) || 0;
    // Giá gốc = giá hiện tại nếu chưa có giá gạch cao hơn
    const original =
      row.original_price_vnd && Number(row.original_price_vnd) > current
        ? Number(row.original_price_vnd)
        : current;
    const next = Math.max(
      0,
      Math.round((original * (1 - percent / 100)) / 1000) * 1000,
    );

    const { error: updErr } = await db
      .from('sim_listings')
      .update({
        price_vnd: next,
        original_price_vnd: original,
        sale_ends_at: endsAt,
        updated_at: new Date().toISOString(),
      })
      .eq('id', row.id)
      .eq('temple_id', input.templeId);
    if (!updErr) updated++;
  }

  revalidateSimPaths();
  return { ok: true, updated };
}

/**
 * Kết thúc flash sale: khôi phục giá gốc, xóa giá gạch và giờ kết thúc.
 */
export async function endFlashSaleAction(input: {
  templeId: string;
  ids: string[];
}): Promise<SimAdminResult & { updated?: number }> {
  {
    const gate = await requireSuperAdminForWarehouse(input.templeId);
    if ('ok' in gate && gate.ok === false) return gate;
  }
  if (input.ids.length === 0) return { ok: false, error: 'Chưa chọn sim nào.' };

  const db = await getAdminDb();
  const { data, error } = await db
    .from('sim_listings')
    .select('id, price_vnd, original_price_vnd')
    .eq('temple_id', input.templeId)
    .in('id', input.ids);
  if (error) return { ok: false, error: error.message };

  let updated = 0;
  for (const row of data ?? []) {
    const original = Number(row.original_price_vnd) || Number(row.price_vnd) || 0;
    const { error: updErr } = await db
      .from('sim_listings')
      .update({
        price_vnd: original,
        original_price_vnd: null,
        sale_ends_at: null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', row.id)
      .eq('temple_id', input.templeId);
    if (!updErr) updated++;
  }

  revalidateSimPaths();
  return { ok: true, updated };
}

/* ------------------------------------------------------------------ */
/* Import + seed                                                       */
/* ------------------------------------------------------------------ */

export interface ImportSimRow {
  phone: string;
  priceVnd?: number;
  originalPriceVnd?: number;
}

export async function importSimsAction(input: {
  templeId: string;
  rows: ImportSimRow[];
  sourceId?: string | null;
}): Promise<{
  ok: boolean;
  error?: string;
  inserted?: number;
  skipped?: string[];
}> {
  {
    const gate = await requireSuperAdminForWarehouse(input.templeId);
    if ('ok' in gate && gate.ok === false) return gate;
  }
  if (input.rows.length === 0) {
    return { ok: false, error: 'Không có dòng nào để import.' };
  }
  if (input.rows.length > 1000) {
    return { ok: false, error: 'Tối đa 1000 số mỗi lần import.' };
  }

  const db = await getAdminDb();
  const { data: existing } = await db
    .from('sim_listings')
    .select('phone')
    .eq('temple_id', input.templeId);
  const existingPhones = new Set((existing ?? []).map((r) => String(r.phone)));

  const toInsert: Record<string, unknown>[] = [];
  const skipped: string[] = [];

  for (const row of input.rows) {
    const normalized = normalizeSimPhone(row.phone);
    if (!normalized) {
      skipped.push(`${row.phone} (sai định dạng)`);
      continue;
    }
    if (existingPhones.has(normalized)) {
      skipped.push(`${normalized} (đã có trong kho)`);
      continue;
    }
    const payload = buildSimScorePayload(normalized);
    if (!payload) {
      skipped.push(`${normalized} (không luận được theo nguyên lý Âm Dương Ngũ Hành)`);
      continue;
    }
    existingPhones.add(normalized);
    const price =
      row.priceVnd && row.priceVnd > 0
        ? Math.round(row.priceVnd)
        : suggestSimPrice(payload);
    toInsert.push({
      temple_id: input.templeId,
      ...payload,
      price_vnd: price,
      original_price_vnd:
        row.originalPriceVnd && row.originalPriceVnd > price
          ? Math.round(row.originalPriceVnd)
          : null,
      source_id: input.sourceId || null,
      status: 'available',
    });
  }

  if (toInsert.length === 0) {
    return { ok: false, error: 'Tất cả các dòng đều bị bỏ qua.', skipped };
  }

  // Chèn theo lô 100 dòng
  let inserted = 0;
  for (let i = 0; i < toInsert.length; i += 100) {
    const chunk = toInsert.slice(i, i + 100);
    const { error } = await db.from('sim_listings').insert(chunk);
    if (error) {
      return {
        ok: false,
        error: `Đã chèn ${inserted} số, lỗi ở lô tiếp theo: ${error.message}`,
        inserted,
        skipped,
      };
    }
    inserted += chunk.length;
  }

  revalidateSimPaths();
  return { ok: true, inserted, skipped };
}

export async function seedDemoSimsAction(input: {
  templeId: string;
  count?: number;
}): Promise<{ ok: boolean; error?: string; inserted?: number }> {
  {
    const gate = await requireSuperAdminForWarehouse(input.templeId);
    if ('ok' in gate && gate.ok === false) return gate;
  }

  const count = Math.min(300, Math.max(1, input.count ?? 100));
  const db = await getAdminDb();

  const { data: existing } = await db
    .from('sim_listings')
    .select('phone')
    .eq('temple_id', input.templeId);
  const existingPhones = new Set((existing ?? []).map((r) => String(r.phone)));

  const generated = generateDemoSims(count, existingPhones);
  if (generated.length === 0) {
    return { ok: false, error: 'Không sinh được sim mẫu nào.' };
  }

  const rows = generated.map((g) => ({
    temple_id: input.templeId,
    ...g.payload,
    price_vnd: g.price_vnd,
    original_price_vnd: g.original_price_vnd,
    featured: g.featured,
    status: 'available',
  }));

  let inserted = 0;
  for (let i = 0; i < rows.length; i += 100) {
    const chunk = rows.slice(i, i + 100);
    const { error } = await db.from('sim_listings').insert(chunk);
    if (error) {
      return {
        ok: false,
        error: `Đã chèn ${inserted}, lỗi: ${error.message}`,
        inserted,
      };
    }
    inserted += chunk.length;
  }

  revalidateSimPaths();
  return { ok: true, inserted };
}

/* ------------------------------------------------------------------ */
/* Nguồn / kho sim                                                     */
/* ------------------------------------------------------------------ */

export async function listSimSourcesAction(input: {
  templeId: string;
  includeInactive?: boolean;
}): Promise<{ ok: boolean; error?: string; sources?: SimSource[] }> {
  {
    const gate = await requireSuperAdminForWarehouse(input.templeId);
    if ('ok' in gate && gate.ok === false) return gate;
  }

  const db = await getAdminDb();
  let query = db
    .from('sim_sources')
    .select('*')
    .eq('temple_id', input.templeId)
    .order('name', { ascending: true });
  if (!input.includeInactive) query = query.eq('active', true);

  const { data, error } = await query;
  if (error) return { ok: false, error: error.message };
  return { ok: true, sources: (data ?? []) as SimSource[] };
}

export async function upsertSimSourceAction(input: {
  templeId: string;
  id?: string;
  name: string;
  contactName?: string;
  contactPhone?: string;
  contactNote?: string;
  commissionPercent?: number;
  active?: boolean;
}): Promise<SimAdminResult & { source?: SimSource }> {
  {
    const gate = await requireSuperAdminForWarehouse(input.templeId);
    if ('ok' in gate && gate.ok === false) return gate;
  }

  const name = input.name.trim();
  if (name.length < 2) {
    return { ok: false, error: 'Tên nguồn / kho sim tối thiểu 2 ký tự.' };
  }
  const commission = Math.min(
    100,
    Math.max(0, Number(input.commissionPercent ?? 30)),
  );

  const db = await getAdminDb();
  const row = {
    temple_id: input.templeId,
    name,
    contact_name: (input.contactName ?? '').trim() || null,
    contact_phone: (input.contactPhone ?? '').trim() || null,
    contact_note: (input.contactNote ?? '').trim() || null,
    commission_percent: commission,
    active: input.active !== false,
    updated_at: new Date().toISOString(),
  };

  if (input.id) {
    const { data, error } = await db
      .from('sim_sources')
      .update(row)
      .eq('id', input.id)
      .eq('temple_id', input.templeId)
      .select('*')
      .maybeSingle();
    if (error) return { ok: false, error: error.message };
    revalidateSimPaths();
    return { ok: true, source: data as SimSource };
  }

  const { data, error } = await db
    .from('sim_sources')
    .insert(row)
    .select('*')
    .maybeSingle();
  if (error) {
    if (/duplicate|unique/i.test(error.message)) {
      return { ok: false, error: `Nguồn “${name}” đã tồn tại.` };
    }
    return { ok: false, error: error.message };
  }
  revalidateSimPaths();
  return { ok: true, source: data as SimSource };
}

export async function bulkAssignSimSourceAction(input: {
  templeId: string;
  ids: string[];
  sourceId: string | null;
}): Promise<SimAdminResult & { updated?: number }> {
  {
    const gate = await requireSuperAdminForWarehouse(input.templeId);
    if ('ok' in gate && gate.ok === false) return gate;
  }
  if (input.ids.length === 0) {
    return { ok: false, error: 'Chưa chọn sim nào.' };
  }

  const db = await getAdminDb();
  const { data, error } = await db
    .from('sim_listings')
    .update({
      source_id: input.sourceId,
      updated_at: new Date().toISOString(),
    })
    .eq('temple_id', input.templeId)
    .in('id', input.ids)
    .select('id');

  if (error) return { ok: false, error: error.message };
  revalidateSimPaths();
  return { ok: true, updated: data?.length ?? 0 };
}

/* ------------------------------------------------------------------ */
/* Đơn sim                                                             */
/* ------------------------------------------------------------------ */

export async function listSimOrdersAdminAction(input: {
  templeId: string;
  status?: string;
}): Promise<{ ok: boolean; error?: string; orders?: SimOrder[] }> {
  try {
    await assertTempleAccess(input.templeId);
  } catch {
    return { ok: false, error: 'Không có quyền truy cập chùa này.' };
  }

  const db = await getAdminDb();
  let query = db
    .from('sim_orders')
    .select('*')
    .eq('temple_id', input.templeId)
    .order('created_at', { ascending: false })
    .limit(200);
  if (input.status) query = query.eq('status', input.status);

  const { data, error } = await query;
  if (error) return { ok: false, error: error.message };
  return { ok: true, orders: (data ?? []) as SimOrder[] };
}

/**
 * Đổi trạng thái đơn + đồng bộ trạng thái sim:
 * paid/delivering → sim reserved · completed → sim sold · cancelled → nhả sim.
 */
export async function updateSimOrderStatusAction(input: {
  orderId: string;
  templeId: string;
  status: SimOrderStatus;
}): Promise<SimAdminResult> {
  {
    const gate = await requireSuperAdminForWarehouse(input.templeId);
    if ('ok' in gate && gate.ok === false) return gate;
  }

  const db = await getAdminDb();
  const { data: orderRow, error: readErr } = await db
    .from('sim_orders')
    .select('*')
    .eq('id', input.orderId)
    .eq('temple_id', input.templeId)
    .maybeSingle();

  if (readErr || !orderRow) {
    return fail(readErr, 'Không tìm thấy đơn.');
  }
  const order = orderRow as SimOrder;

  const patch: Record<string, unknown> = {
    status: input.status,
    updated_at: new Date().toISOString(),
  };
  if (input.status === 'paid' && !order.paid_at) {
    patch.paid_at = new Date().toISOString();
  }

  const { error: updErr } = await db
    .from('sim_orders')
    .update(patch)
    .eq('id', input.orderId)
    .eq('temple_id', input.templeId);
  if (updErr) return { ok: false, error: updErr.message };

  // Đồng bộ trạng thái sim
  if (order.sim_id) {
    let simStatus: SimStatus | null = null;
    if (input.status === 'completed') simStatus = 'sold';
    else if (input.status === 'paid' || input.status === 'delivering') {
      simStatus = 'reserved';
    } else if (input.status === 'cancelled') simStatus = 'available';

    if (simStatus) {
      let simQuery = db
        .from('sim_listings')
        .update({ status: simStatus, updated_at: new Date().toISOString() })
        .eq('id', order.sim_id)
        .eq('temple_id', input.templeId);
      // Hủy đơn: chỉ nhả sim nếu chưa bán cho người khác
      if (simStatus === 'available') {
        simQuery = simQuery.neq('status', 'sold');
      }
      await simQuery;
    }
  }

  revalidateSimPaths();
  return { ok: true };
}
