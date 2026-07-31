'use client';

/** Render markdown luận giải (tiêu đề màu, đậm, danh sách). */
export function TuViMarkdown({
  text,
  primaryColor,
  className = '',
}: {
  text: string;
  primaryColor: string;
  className?: string;
}) {
  const lines = (text || '').replace(/\r\n/g, '\n').split('\n');

  return (
    <div className={className}>
      {lines.map((line, i) => {
        const trimmed = line.trim();
        if (!trimmed) return <div key={i} className="h-2" />;

        const inline = formatInline(escapeHtml(line));

        if (/^#{1,3}\s+/.test(trimmed)) {
          const level = (trimmed.match(/^#+/)?.[0].length ?? 3) as 1 | 2 | 3;
          const body = trimmed.replace(/^#{1,6}\s+/, '').replace(/^#{1,6}\s+/, '');
          const size =
            level <= 1
              ? 'mt-3 mb-1 text-base font-semibold leading-snug'
              : level === 2
                ? 'mt-3 mb-1 text-[0.95rem] font-semibold leading-snug'
                : 'mt-2.5 mb-1 text-sm font-semibold leading-snug';
          return (
            <p
              key={i}
              className={size}
              style={{ color: primaryColor }}
              dangerouslySetInnerHTML={{
                __html: formatInline(escapeHtml(body)),
              }}
            />
          );
        }
        if (/^---+$/.test(trimmed)) {
          return <hr key={i} className="my-2 border-fog" />;
        }
        if (/^[-*•]\s+/.test(trimmed)) {
          return (
            <p
              key={i}
              className="pl-3 text-sm leading-relaxed text-ink"
              dangerouslySetInnerHTML={{
                __html: `• ${formatInline(
                  escapeHtml(trimmed.replace(/^[-*•]\s+/, '')),
                )}`,
              }}
            />
          );
        }

        return (
          <p
            key={i}
            className="text-sm leading-relaxed text-ink"
            dangerouslySetInnerHTML={{ __html: inline }}
          />
        );
      })}
    </div>
  );
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function formatInline(escaped: string): string {
  return escaped
    .replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold text-ink">$1</strong>')
    .replace(/__(.+?)__/g, '<strong class="font-semibold text-ink">$1</strong>')
    .replace(/`(.+?)`/g, '<code class="text-[0.85em] bg-mist px-0.5">$1</code>');
}
