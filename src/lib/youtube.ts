/** Trích YouTube video ID từ URL thường / shorts / embed / youtu.be */
export function youtubeVideoId(url: string): string | null {
  try {
    const u = new URL(url.trim());
    if (u.hostname.includes('youtu.be')) {
      return u.pathname.replace(/^\//, '').split('/')[0] || null;
    }
    if (u.hostname.includes('youtube.com') || u.hostname.includes('youtube-nocookie.com')) {
      const v = u.searchParams.get('v');
      if (v) return v;
      const parts = u.pathname.split('/').filter(Boolean);
      for (const key of ['embed', 'shorts', 'live', 'v']) {
        const idx = parts.indexOf(key);
        if (idx >= 0 && parts[idx + 1] && parts[idx + 1] !== 'live_stream') {
          return parts[idx + 1];
        }
      }
    }
  } catch {
    return null;
  }
  return null;
}

/** UC… channel ID từ URL hoặc chuỗi thô */
export function youtubeChannelId(input: string): string | null {
  const raw = input.trim();
  if (/^UC[\w-]{20,}$/.test(raw)) return raw;
  try {
    const u = new URL(raw);
    if (!u.hostname.includes('youtube.com') && !u.hostname.includes('youtu.be')) {
      return null;
    }
    const channelParam = u.searchParams.get('channel');
    if (channelParam && /^UC[\w-]{20,}$/.test(channelParam)) return channelParam;
    const parts = u.pathname.split('/').filter(Boolean);
    const chIdx = parts.indexOf('channel');
    if (chIdx >= 0 && parts[chIdx + 1] && /^UC[\w-]{20,}$/.test(parts[chIdx + 1])) {
      return parts[chIdx + 1];
    }
  } catch {
    return null;
  }
  return null;
}

/** Handle @name nếu có trong URL (không dùng được cho embed live_stream) */
export function youtubeChannelHandle(input: string): string | null {
  const raw = input.trim();
  if (/^@[\w.-]+$/.test(raw)) return raw;
  try {
    const u = new URL(raw);
    const parts = u.pathname.split('/').filter(Boolean);
    const at = parts.find((p) => p.startsWith('@'));
    if (at) return at;
  } catch {
    return null;
  }
  return null;
}

export function youtubeEmbedSrc(opts: {
  liveVideoUrl?: string | null;
  channelId?: string | null;
}): string | null {
  if (opts.liveVideoUrl) {
    const id = youtubeVideoId(opts.liveVideoUrl);
    if (id) return `https://www.youtube.com/embed/${id}?autoplay=1&rel=0`;
  }
  if (opts.channelId) {
    return `https://www.youtube.com/embed/live_stream?channel=${encodeURIComponent(opts.channelId)}&autoplay=1`;
  }
  return null;
}

export function youtubeThumbnailUrl(videoUrl: string | null | undefined): string | null {
  if (!videoUrl) return null;
  const id = youtubeVideoId(videoUrl);
  if (!id) return null;
  return `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
}
