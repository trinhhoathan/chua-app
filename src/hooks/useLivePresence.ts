'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

/**
 * Đếm Phật tử đang tham dự livestream qua Supabase Realtime Presence.
 * track=true: tham gia phòng (Phật tử đang xem). track=false: chỉ quan sát (admin).
 */
export function useLivePresence(
  templeId: string | null | undefined,
  scheduleId: string | null | undefined,
  track = true,
): number {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!templeId || !scheduleId) {
      setCount(0);
      return;
    }

    const supabase = createClient();
    const channelName = `live:${templeId}:${scheduleId}`;
    const channel = supabase.channel(channelName, {
      config: { presence: { key: crypto.randomUUID() } },
    });

    const sync = () => {
      const state = channel.presenceState();
      let n = 0;
      for (const key of Object.keys(state)) {
        n += (state[key] as unknown[]).length;
      }
      setCount(n);
    };

    channel.on('presence', { event: 'sync' }, sync);
    channel.on('presence', { event: 'join' }, sync);
    channel.on('presence', { event: 'leave' }, sync);

    channel.subscribe(async (status) => {
      if (status === 'SUBSCRIBED' && track) {
        await channel.track({ joined_at: new Date().toISOString() });
      }
    });

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [templeId, scheduleId, track]);

  return count;
}
