import Link from 'next/link';
import type { Temple } from '@/types/database';

interface Props {
  temple: Temple;
}

export function TopNav({ temple }: Props) {
  return (
    <nav className="fixed top-0 inset-x-0 z-40 bg-ink/25 backdrop-blur-md border-b border-white/10">
      <div className="mx-auto max-w-6xl px-6 md:px-8 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-white">
          <span className="font-display text-base tracking-tight">
            {temple.name}
          </span>
        </Link>
        <div className="hidden md:flex items-center gap-6 text-sm text-white/80">
          <Link href="/#tru-tri" className="hover:text-white transition-colors">
            Trụ trì
          </Link>
          <Link href="/#video" className="hover:text-white transition-colors">
            Video
          </Link>
          <Link href="/#lich-su" className="hover:text-white transition-colors">
            Lịch sử
          </Link>
          <Link href="/#minh-bach" className="hover:text-white transition-colors">
            Minh bạch
          </Link>
          <Link href="/so-cau" className="hover:text-white transition-colors">
            Đăng ký sớ
          </Link>
          <Link href="/phong-thuy" className="hover:text-white transition-colors">
            Phong thủy
          </Link>
          <Link href="/dat-nuoc" className="hover:text-white transition-colors">
            Đặt nước
          </Link>
        </div>
      </div>
    </nav>
  );
}
