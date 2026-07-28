'use server';

import { revalidatePath } from 'next/cache';
import { getCurrentTemple } from '@/lib/tenant';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

export type GoMoDedication = {
  id: string;
  devotee_name: string;
  wish: string | null;
  session_count: number;
  day_count: number;
  created_at: string;
};

export type GoMoLeaderRow = {
  display_name: string | null;
  strike_count: number;
  client_key: string;
};

export async function submitGoMoDedication(input: {
  name: string;
  wish: string;
  sessionCount: number;
  dayCount: number;
  hp?: string;
}): Promise<{ ok: boolean; error?: string }> {
  if (input.hp && input.hp.trim() !== '') return { ok: true };

  const temple = await getCurrentTemple();
  if (!temple) return { ok: false, error: 'Không tìm thấy chùa.' };

  const name = input.name.trim() || 'Ẩn danh';
  if (name.length > 80) {
    return { ok: false, error: 'Danh xưng quá dài.' };
  }
  const wish = input.wish.trim().slice(0, 500) || null;
  const sessionCount = Math.max(0, Math.min(100_000, Math.floor(input.sessionCount)));
  const dayCount = Math.max(0, Math.min(100_000, Math.floor(input.dayCount)));

  try {
    const admin = getSupabaseAdmin();
    const { error } = await admin.from('go_mo_dedications').insert({
      temple_id: temple.id,
      devotee_name: name,
      wish,
      session_count: sessionCount,
      day_count: dayCount,
    });
    if (error) return { ok: false, error: error.message };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : 'Không ghi được hồi hướng.',
    };
  }

  revalidatePath('/go-mo');
  return { ok: true };
}

export async function listGoMoDedications(
  limit = 20,
): Promise<{ ok: boolean; rows: GoMoDedication[]; error?: string }> {
  const temple = await getCurrentTemple();
  if (!temple) return { ok: false, rows: [], error: 'Không tìm thấy chùa.' };

  try {
    const admin = getSupabaseAdmin();
    const { data, error } = await admin
      .from('go_mo_dedications')
      .select('id, devotee_name, wish, session_count, day_count, created_at')
      .eq('temple_id', temple.id)
      .order('created_at', { ascending: false })
      .limit(Math.min(50, Math.max(1, limit)));
    if (error) return { ok: false, rows: [], error: error.message };
    return { ok: true, rows: (data ?? []) as GoMoDedication[] };
  } catch (e) {
    return {
      ok: false,
      rows: [],
      error: e instanceof Error ? e.message : 'Lỗi tải bảng vàng.',
    };
  }
}

export async function syncGoMoDailyScore(input: {
  clientKey: string;
  displayName?: string;
  strikeCount: number;
  hp?: string;
}): Promise<{ ok: boolean; error?: string }> {
  if (input.hp && input.hp.trim() !== '') return { ok: true };

  const temple = await getCurrentTemple();
  if (!temple) return { ok: false, error: 'Không tìm thấy chùa.' };

  const clientKey = input.clientKey.trim().slice(0, 80);
  if (clientKey.length < 8) {
    return { ok: false, error: 'Thiếu mã thiết bị.' };
  }
  const strikeCount = Math.max(
    0,
    Math.min(1_000_000, Math.floor(input.strikeCount)),
  );
  const displayName = input.displayName?.trim().slice(0, 80) || null;

  const day = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Ho_Chi_Minh',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());

  try {
    const admin = getSupabaseAdmin();
    const { data: existing } = await admin
      .from('go_mo_daily_scores')
      .select('id, strike_count')
      .eq('temple_id', temple.id)
      .eq('client_key', clientKey)
      .eq('day', day)
      .maybeSingle();

    if (existing?.id) {
      const next = Math.max(existing.strike_count ?? 0, strikeCount);
      const { error } = await admin
        .from('go_mo_daily_scores')
        .update({
          strike_count: next,
          display_name: displayName ?? undefined,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existing.id);
      if (error) return { ok: false, error: error.message };
    } else {
      const { error } = await admin.from('go_mo_daily_scores').insert({
        temple_id: temple.id,
        client_key: clientKey,
        display_name: displayName,
        day,
        strike_count: strikeCount,
      });
      if (error) return { ok: false, error: error.message };
    }
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : 'Không đồng bộ điểm.',
    };
  }

  return { ok: true };
}

export async function listGoMoLeaderboard(
  limit = 15,
): Promise<{ ok: boolean; rows: GoMoLeaderRow[]; error?: string }> {
  const temple = await getCurrentTemple();
  if (!temple) return { ok: false, rows: [], error: 'Không tìm thấy chùa.' };

  const day = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Ho_Chi_Minh',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());

  try {
    const admin = getSupabaseAdmin();
    const { data, error } = await admin
      .from('go_mo_daily_scores')
      .select('display_name, strike_count, client_key')
      .eq('temple_id', temple.id)
      .eq('day', day)
      .order('strike_count', { ascending: false })
      .limit(Math.min(50, Math.max(1, limit)));
    if (error) return { ok: false, rows: [], error: error.message };
    return { ok: true, rows: (data ?? []) as GoMoLeaderRow[] };
  } catch (e) {
    return {
      ok: false,
      rows: [],
      error: e instanceof Error ? e.message : 'Lỗi bảng xếp hạng.',
    };
  }
}
