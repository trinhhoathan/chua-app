import { notFound } from 'next/navigation';
import { requireAdmin } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import type { PrayerRequest } from '@/types/database';
import { PrintButton } from './PrintButton';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function InSoPage({ params }: Props) {
  const { id } = await params;
  const ctx = await requireAdmin();
  const supabase = await createClient();
  const { data } = await supabase
    .from('prayer_requests')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (!data) notFound();
  const prayer = data as PrayerRequest;
  if (
    !ctx.isSuperAdmin &&
    !ctx.memberships.some((m) => m.temple_id === prayer.temple_id)
  ) {
    notFound();
  }

  const temple = ctx.temples.find((t) => t.id === prayer.temple_id);
  const isSieu = prayer.request_type === 'cau_sieu';

  return (
    <main className="bg-white text-black min-h-screen p-10 print:p-6 -mx-4 md:-mx-6 -my-8">
      <style>{`
        @media print {
          header, nav, .no-print { display: none !important; }
          body { background: white !important; }
        }
      `}</style>
      <PrintButton />

      <article className="max-w-2xl mx-auto border-2 border-black p-10 text-center">
        <p className="text-sm tracking-[0.4em] uppercase">
          {temple?.name ?? 'Chùa'}
        </p>
        <h1 className="mt-4 text-3xl font-serif font-bold">
          {isSieu ? 'SỚ CẦU SIÊU' : 'SỚ CẦU AN'}
        </h1>
        <p className="mt-6 text-left leading-relaxed">
          Nam mô A Di Đà Phật.
          <br />
          <br />
          Đệ tử {prayer.requester_name}
          {prayer.address ? `, trú tại ${prayer.address}` : ''}, thành tâm đảnh
          lễ chư Phật, chư Bồ Tát, xin {isSieu ? 'cầu siêu cho' : 'cầu an cho'}:
        </p>
        <p className="mt-6 text-2xl font-serif font-semibold whitespace-pre-line">
          {prayer.devotee_names}
        </p>
        {prayer.birth_years ? (
          <p className="mt-3 text-sm">Năm sinh: {prayer.birth_years}</p>
        ) : null}
        {prayer.note ? (
          <p className="mt-4 text-left text-sm italic">Ghi chú: {prayer.note}</p>
        ) : null}
        <p className="mt-10 text-left text-sm">
          Nguyện cầu{' '}
          {isSieu
            ? 'hương linh được siêu thoát, vãng sanh Tịnh Độ'
            : 'gia đình bình an, tai qua nạn khỏi, thân tâm an lạc'}
          .
        </p>
        <p className="mt-10 text-right text-sm">
          Ngày{' '}
          {prayer.ceremony_date
            ? new Date(prayer.ceremony_date).toLocaleDateString('vi-VN')
            : new Date(prayer.created_at).toLocaleDateString('vi-VN')}
        </p>
      </article>
    </main>
  );
}
