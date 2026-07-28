import { supabase } from './supabase';
import type { TempleEvent } from '@/types/database';

/**
 * Danh sách hoạt động / sự kiện đang còn hiệu lực của một chùa.
 * RLS đã lọc `is_published = true` và `ends_at > now()`.
 * Sắp xếp theo `sort_order` giảm dần rồi `starts_at` tăng dần.
 */
export async function getUpcomingTempleEvents(
  templeId: string,
): Promise<TempleEvent[]> {
  const { data } = await supabase
    .from('temple_events')
    .select('*')
    .eq('temple_id', templeId)
    .order('sort_order', { ascending: false })
    .order('starts_at', { ascending: true });

  return (data ?? []) as TempleEvent[];
}
