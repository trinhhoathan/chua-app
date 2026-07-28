import Link from 'next/link';
import { getCurrentTemple } from '@/lib/tenant';
import { GoMoPanel } from '@/components/temple/GoMoPanel';
import { solarToLunar } from '@/lib/fengshui/lunar';
import { BUDDHIST_OBSERVANCES } from '@/lib/fengshui/buddhist-calendar';
import {
  listGoMoDedications,
  listGoMoLeaderboard,
} from '@/app/actions/go-mo';

function buildThoiKhoaNote(): string | null {
  const n = new Date();
  const lunar = solarToLunar(n.getDate(), n.getMonth() + 1, n.getFullYear());
  const via = BUDDHIST_OBSERVANCES.find(
    (o) => o.lunarMonth === lunar.month && o.lunarDay === lunar.day,
  );
  if (via) {
    return `Hôm nay ${via.title}${via.note ? ` — ${via.note}` : ''}. Thích hợp tụng niệm.`;
  }
  if (lunar.day === 1) {
    return 'Mùng một — ngày trai giới, thích hợp tụng niệm và giữ giới.';
  }
  if (lunar.day === 15) {
    return 'Rằm — ngày trai giới, thích hợp tụng niệm và giữ giới.';
  }
  if (lunar.day === 14 || lunar.day === 29 || lunar.day === 30) {
    return 'Gần ngày sóc/vọng — có thể phát tâm tụng thêm.';
  }
  return `Âm lịch hôm nay: ${lunar.day}/${lunar.month}${lunar.leap ? ' nhuận' : ''}. Thành tâm gõ mõ, niệm Phật.`;
}

export default async function GoMoPage() {
  const temple = await getCurrentTemple();
  if (!temple) return null;
  const primary = temple.primary_color || '#7A1F1F';
  const note = buildThoiKhoaNote();

  const [dedications, leaderboard] = await Promise.all([
    listGoMoDedications(20),
    listGoMoLeaderboard(15),
  ]);

  return (
    <main className="pt-24 pb-20 px-6 md:px-12 bg-paper min-h-screen">
      <div className="mx-auto max-w-lg mb-4 flex flex-wrap gap-4 text-sm">
        <Link
          href="/"
          className="text-muted hover:text-ink underline underline-offset-4"
        >
          ← Về trang chùa
        </Link>
        <Link
          href="/phat-hoc"
          className="text-muted hover:text-ink underline underline-offset-4"
        >
          Phật học
        </Link>
      </div>
      <GoMoPanel
        primaryColor={primary}
        templeName={temple.name}
        templeId={temple.id}
        thoiKhoaNote={note}
        initialDedications={dedications.ok ? dedications.rows : []}
        initialLeaderboard={leaderboard.ok ? leaderboard.rows : []}
      />
    </main>
  );
}
