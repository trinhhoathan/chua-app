import Link from 'next/link';
import type { FengShuiToolMeta } from '@/lib/fengshui/tools';

interface Props {
  tool: FengShuiToolMeta;
  primaryColor: string;
  children: React.ReactNode;
}

export function ToolShell({ tool, primaryColor, children }: Props) {
  const backHref = tool.domain === 'phat_hoc' ? '/phat-hoc' : '/phong-thuy';
  const backLabel =
    tool.domain === 'phat_hoc'
      ? '← Tất cả mục Phật học'
      : '← Tất cả công cụ phong thủy';

  return (
    <main className="pt-24 pb-16 px-6 md:px-12">
      <div
        className={`mx-auto min-w-0 w-full ${
          tool.slug === 'lich-van-nien' ||
          tool.slug === 'kinh-tung-thuong-dung'
            ? 'max-w-3xl'
            : 'max-w-2xl'
        }`}
      >
        <Link href={backHref} className="text-xs text-muted hover:text-ink">
          {backLabel}
        </Link>
        <p
          className="mt-6 text-[0.7rem] tracking-[0.3em] uppercase mb-2"
          style={{ color: primaryColor }}
        >
          {tool.category}
        </p>
        <h1 className="font-display text-3xl md:text-4xl text-ink">
          {tool.title}
        </h1>
        {tool.description ? (
          <p className="mt-3 text-muted leading-relaxed">{tool.description}</p>
        ) : null}

        <div className="mt-8">{children}</div>
      </div>
    </main>
  );
}
