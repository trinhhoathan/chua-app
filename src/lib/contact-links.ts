import type { TempleContactLinks } from '@/types/database';

export const CONTACT_LINK_FIELDS = [
  {
    key: 'zalo' as const,
    label: 'Zalo',
    placeholder: 'https://zalo.me/09xxxxxxxx',
  },
  {
    key: 'messenger' as const,
    label: 'Messenger',
    placeholder: 'https://m.me/trangchua',
  },
  {
    key: 'facebook' as const,
    label: 'Facebook',
    placeholder: 'https://www.facebook.com/trangchua',
  },
  {
    key: 'instagram' as const,
    label: 'Instagram',
    placeholder: 'https://www.instagram.com/tenchua',
  },
  {
    key: 'threads' as const,
    label: 'Threads',
    placeholder: 'https://www.threads.net/@tenchua',
  },
  {
    key: 'x' as const,
    label: 'X (Twitter)',
    placeholder: 'https://x.com/tenchua',
  },
  {
    key: 'youtube' as const,
    label: 'YouTube',
    placeholder: 'https://www.youtube.com/@tenkenh',
  },
  {
    key: 'tiktok' as const,
    label: 'TikTok',
    placeholder: 'https://www.tiktok.com/@tenkenh',
  },
  {
    key: 'zalo_community' as const,
    label: 'Cộng đồng Zalo',
    placeholder: 'https://zalo.me/g/nhomchua',
  },
] as const;

export type ContactLinkKey = (typeof CONTACT_LINK_FIELDS)[number]['key'];

export function normalizeContactLinks(
  raw: unknown,
  hotlineFallback?: string | null,
): TempleContactLinks {
  const obj =
    raw && typeof raw === 'object' && !Array.isArray(raw)
      ? (raw as Record<string, unknown>)
      : {};

  const pick = (key: string) => {
    const v = obj[key];
    if (typeof v !== 'string') return null;
    const t = v.trim();
    return t || null;
  };

  const phone = pick('phone') || hotlineFallback?.trim() || null;

  return {
    youtube: pick('youtube'),
    tiktok: pick('tiktok'),
    facebook: pick('facebook'),
    messenger: pick('messenger'),
    zalo: pick('zalo'),
    zalo_community: pick('zalo_community'),
    instagram: pick('instagram'),
    threads: pick('threads'),
    x: pick('x'),
    phone,
  };
}

export function phoneHref(phone: string): string {
  return `tel:${phone.replace(/[^\d+]/g, '')}`;
}

export function hasAnyContactLink(links: TempleContactLinks): boolean {
  return Object.values(links).some((v) => Boolean(v));
}
