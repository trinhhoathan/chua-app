import type { Temple, TempleVideo } from '@/types/database';

interface Props {
  temple: Temple;
}

function youtubeEmbedId(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.hostname.includes('youtu.be')) {
      return u.pathname.replace(/^\//, '').split('/')[0] || null;
    }
    if (u.hostname.includes('youtube.com')) {
      const v = u.searchParams.get('v');
      if (v) return v;
      const parts = u.pathname.split('/').filter(Boolean);
      const embedIdx = parts.indexOf('embed');
      if (embedIdx >= 0 && parts[embedIdx + 1]) return parts[embedIdx + 1];
      const shortsIdx = parts.indexOf('shorts');
      if (shortsIdx >= 0 && parts[shortsIdx + 1]) return parts[shortsIdx + 1];
    }
  } catch {
    return null;
  }
  return null;
}

function VideoCard({ video, primary }: { video: TempleVideo; primary: string }) {
  const id = youtubeEmbedId(video.url);
  if (!id) return null;

  return (
    <article className="space-y-3">
      <div className="relative aspect-video overflow-hidden bg-ink/5 border border-fog">
        <iframe
          src={`https://www.youtube.com/embed/${id}`}
          title={video.title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          loading="lazy"
          className="absolute inset-0 h-full w-full"
        />
      </div>
      <div>
        <h3 className="font-display text-xl text-ink">{video.title}</h3>
        {video.description ? (
          <p className="mt-1.5 text-sm text-muted leading-relaxed">
            {video.description}
          </p>
        ) : null}
        <a
          href={video.url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 inline-block text-xs font-medium underline-offset-2 hover:underline"
          style={{ color: primary }}
        >
          Xem trên YouTube →
        </a>
      </div>
    </article>
  );
}

export function TempleVideosSection({ temple }: Props) {
  if (!temple.videos?.length) return null;
  const primary = temple.primary_color || '#7A1F1F';

  return (
    <section id="video" className="bg-paper scroll-mt-8">
      <div className="mx-auto max-w-6xl px-6 py-20 md:px-12 md:py-28">
        <div className="section-rule mb-6" />
        <h2 className="font-display text-3xl md:text-4xl text-ink leading-tight">
          Video về {temple.name}
        </h2>
        <p className="mt-4 text-muted max-w-2xl leading-relaxed">
          Hình ảnh và lời giới thiệu giúp Phật tử cảm nhận rõ hơn không gian chùa
          và hạnh nguyện của thầy trụ trì.
        </p>
        <div className="mt-10 grid md:grid-cols-2 gap-10 md:gap-12">
          {temple.videos.map((video) => (
            <VideoCard
              key={video.url}
              video={video}
              primary={primary}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
