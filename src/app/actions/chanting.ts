'use server';

import { revalidatePath, unstable_cache } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { supabase } from '@/lib/supabase';
import { assertTempleAccess } from '@/lib/auth';
import {
  youtubeChannelId,
  youtubeChannelHandle,
  youtubeVideoId,
} from '@/lib/youtube';
import type {
  ChantingDisplayScope,
  ChantingRecurrence,
  ChantingSchedule,
} from '@/types/database';

const SCOPES: ChantingDisplayScope[] = ['both', 'home', 'go_mo', 'hidden'];
const RECURRENCES: ChantingRecurrence[] = ['daily', 'weekly', 'once'];

function normalizeTime(raw: string): string | null {
  const m = raw.trim().match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/);
  if (!m) return null;
  const h = Number(m[1]);
  const min = Number(m[2]);
  if (h > 23 || min > 59) return null;
  return `${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}:00`;
}

function parseDays(raw: unknown): number[] {
  if (!Array.isArray(raw)) return [];
  return [
    ...new Set(
      raw
        .map((n) => Number(n))
        .filter((n) => Number.isInteger(n) && n >= 0 && n <= 6),
    ),
  ].sort((a, b) => a - b);
}

export async function upsertChantingSchedule(input: {
  templeId: string;
  id?: string;
  title: string;
  description?: string;
  youtubeChannelIdOrUrl?: string;
  youtubeChannelUrl?: string;
  recurrence: ChantingRecurrence;
  daysOfWeek?: number[];
  startDate?: string;
  startTime: string;
  durationMinutes?: number;
  displayScope?: ChantingDisplayScope;
  isActive?: boolean;
  sortOrder?: number;
}): Promise<{ ok: boolean; error?: string }> {
  try {
    await assertTempleAccess(input.templeId);
  } catch {
    return { ok: false, error: 'Không có quyền.' };
  }

  const title = input.title.trim();
  if (title.length < 2) return { ok: false, error: 'Thiếu tiêu đề.' };

  if (!RECURRENCES.includes(input.recurrence)) {
    return { ok: false, error: 'Kiểu lặp không hợp lệ.' };
  }

  const startTime = normalizeTime(input.startTime);
  if (!startTime) return { ok: false, error: 'Giờ bắt đầu không hợp lệ.' };

  const duration = Math.floor(input.durationMinutes ?? 60);
  if (duration < 1 || duration > 24 * 60) {
    return { ok: false, error: 'Thời lượng không hợp lệ.' };
  }

  const scope = input.displayScope ?? 'both';
  if (!SCOPES.includes(scope)) {
    return { ok: false, error: 'Phạm vi hiển thị không hợp lệ.' };
  }

  const days = parseDays(input.daysOfWeek ?? []);
  if (input.recurrence === 'weekly' && days.length === 0) {
    return { ok: false, error: 'Chọn ít nhất một thứ trong tuần.' };
  }

  let startDate: string | null = null;
  if (input.recurrence === 'once') {
    const d = (input.startDate ?? '').trim();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(d)) {
      return { ok: false, error: 'Ngày diễn ra không hợp lệ.' };
    }
    startDate = d;
  }

  const channelRaw = (input.youtubeChannelIdOrUrl ?? '').trim();
  const channelId = channelRaw ? youtubeChannelId(channelRaw) : null;
  const handle = channelRaw ? youtubeChannelHandle(channelRaw) : null;
  let channelUrl =
    (input.youtubeChannelUrl ?? '').trim() ||
    (channelId
      ? `https://www.youtube.com/channel/${channelId}`
      : handle
        ? `https://www.youtube.com/${handle}`
        : channelRaw || null);

  if (channelUrl && !/^https?:\/\//i.test(channelUrl)) {
    channelUrl = `https://${channelUrl}`;
  }

  if (!channelId && !channelUrl) {
    return {
      ok: false,
      error:
        'Cần Channel ID YouTube (UC…) hoặc link kênh. Embed live theo kênh cần Channel ID.',
    };
  }

  const client = await createClient();
  const row = {
    temple_id: input.templeId,
    title,
    description: input.description?.trim() || null,
    youtube_channel_id: channelId,
    youtube_channel_url: channelUrl,
    recurrence: input.recurrence,
    days_of_week: input.recurrence === 'weekly' ? days : [],
    start_date: startDate,
    start_time: startTime,
    duration_minutes: duration,
    display_scope: scope,
    is_active: input.isActive ?? true,
    sort_order: input.sortOrder ?? 0,
    updated_at: new Date().toISOString(),
  };

  if (input.id) {
    const { error } = await client
      .from('chanting_schedules')
      .update(row)
      .eq('id', input.id)
      .eq('temple_id', input.templeId);
    if (error) return { ok: false, error: error.message };
  } else {
    const { error } = await client.from('chanting_schedules').insert(row);
    if (error) return { ok: false, error: error.message };
  }

  revalidatePath('/quan-tri/tung-kinh');
  revalidatePath('/');
  revalidatePath('/go-mo');
  return { ok: true };
}

export async function deleteChantingSchedule(input: {
  id: string;
  templeId: string;
}): Promise<{ ok: boolean; error?: string }> {
  try {
    await assertTempleAccess(input.templeId);
  } catch {
    return { ok: false, error: 'Không có quyền.' };
  }
  const client = await createClient();
  const { error } = await client
    .from('chanting_schedules')
    .delete()
    .eq('id', input.id)
    .eq('temple_id', input.templeId);
  if (error) return { ok: false, error: error.message };
  revalidatePath('/quan-tri/tung-kinh');
  revalidatePath('/');
  revalidatePath('/go-mo');
  return { ok: true };
}

export async function toggleChantingLive(input: {
  id: string;
  templeId: string;
  isLive: boolean;
  liveVideoUrl?: string;
}): Promise<{ ok: boolean; error?: string }> {
  try {
    await assertTempleAccess(input.templeId);
  } catch {
    return { ok: false, error: 'Không có quyền.' };
  }

  let liveVideoUrl: string | null = null;
  if (input.isLive) {
    const raw = (input.liveVideoUrl ?? '').trim();
    if (raw) {
      if (!youtubeVideoId(raw) && !raw.includes('youtube.com') && !raw.includes('youtu.be')) {
        return { ok: false, error: 'Link video live YouTube không hợp lệ.' };
      }
      liveVideoUrl = raw;
    }
  }

  const client = await createClient();
  const { error } = await client
    .from('chanting_schedules')
    .update({
      is_live: input.isLive,
      live_video_url: input.isLive ? liveVideoUrl : null,
      live_started_at: input.isLive ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', input.id)
    .eq('temple_id', input.templeId);
  if (error) return { ok: false, error: error.message };

  revalidatePath('/quan-tri/tung-kinh');
  revalidatePath('/');
  revalidatePath('/go-mo');
  return { ok: true };
}

export type PublicChantingScope = 'home' | 'go_mo';

async function loadPublicChantingSchedules(
  templeId: string,
  scope: PublicChantingScope,
): Promise<ChantingSchedule[]> {
  const { data } = await supabase
    .from('chanting_schedules')
    .select('*')
    .eq('temple_id', templeId)
    .eq('is_active', true)
    .neq('display_scope', 'hidden')
    .order('sort_order', { ascending: false })
    .order('start_time', { ascending: true });

  const rows = (data ?? []) as ChantingSchedule[];
  return rows.filter((r) => {
    if (r.display_scope === 'both') return true;
    return r.display_scope === scope;
  });
}

export async function getPublicChantingSchedules(
  templeId: string,
  scope: PublicChantingScope,
): Promise<ChantingSchedule[]> {
  return unstable_cache(
    () => loadPublicChantingSchedules(templeId, scope),
    ['chanting-public', templeId, scope],
    { revalidate: 30, tags: [`chanting-${templeId}`] },
  )();
}
