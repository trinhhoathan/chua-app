import Link from 'next/link';
import type { FengShuiToolMeta } from '@/lib/fengshui/tools';

interface Props {
  tool: FengShuiToolMeta;
  primaryColor: string;
  children: React.ReactNode;
}

export function ToolShell({ tool, primaryColor, children }: Props) {
  return (
    <main className="pt-24 pb-16 px-6 md:px-12">
      <div className="mx-auto max-w-2xl">
        <Link
          href="/phong-thuy"
          className="text-xs text-muted hover:text-ink"
        >
          ← Tất cả công cụ
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
        <p className="mt-3 text-muted leading-relaxed">{tool.description}</p>

        <div className="mt-8">{children}</div>

        <p className="mt-10 text-[11px] text-muted italic">
          Lưu ý: Kết quả mang tính tham khảo theo phong tục dân gian (Kim Lâu,
          Hoang Ốc, Tam Tai, Hoàng đạo, Bát trạch…). Với đại sự, quý Phật tử
          nên tham vấn trực tiếp sư trụ trì.
        </p>
      </div>
    </main>
  );
}
