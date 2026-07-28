import Link from 'next/link';
import type { FengShuiToolMeta } from '@/lib/fengshui/tools';
import { DOMAIN_LABELS } from '@/lib/fengshui/tools';

interface Props {
  tool: FengShuiToolMeta;
  primaryColor: string;
}

export function ComingSoonPanel({ tool, primaryColor }: Props) {
  return (
    <div className="border border-fog bg-paper p-6 md:p-8 space-y-4">
      <p
        className="inline-block text-[0.7rem] uppercase tracking-[0.25em] px-2.5 py-1"
        style={{ background: `${primaryColor}14`, color: primaryColor }}
      >
        Sắp ra mắt
      </p>
      <p className="text-ink leading-relaxed">
        Chức năng <strong className="font-medium">{tool.title}</strong> thuộc
        nhóm {DOMAIN_LABELS[tool.domain]} đang được dựng khung. Trụ trì sẽ dùng
        để hỗ trợ tư vấn Phật tử khi động cơ tính toán sẵn sàng.
      </p>
      <ul className="text-sm text-muted space-y-1.5 list-disc pl-5">
        <li>Giai đoạn này chỉ đăng ký mục lục và trang chức năng.</li>
        <li>Nội dung / thuật toán chi tiết sẽ bổ sung sau, theo từng nhóm.</li>
        <li>
          Với Phật học: nội dung do nhà chùa quản lý, không lấy tự động từ bên
          ngoài.
        </li>
      </ul>
      <div className="flex flex-wrap gap-3 pt-2">
        {tool.domain === 'phat_hoc' ? (
          <Link
            href="/phat-hoc"
            className="px-4 py-2.5 text-sm text-white"
            style={{ background: primaryColor }}
          >
            Về mục Phật học
          </Link>
        ) : (
          <Link
            href="/phong-thuy/lap-la-so-tu-vi"
            className="px-4 py-2.5 text-sm text-white"
            style={{ background: primaryColor }}
          >
            Thử Lập lá số tử vi
          </Link>
        )}
        <Link
          href={tool.domain === 'phat_hoc' ? '/phat-hoc' : '/phong-thuy'}
          className="px-4 py-2.5 text-sm border border-fog text-ink hover:bg-mist"
        >
          Về danh mục
        </Link>
      </div>
    </div>
  );
}
