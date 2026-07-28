import { redirect } from 'next/navigation';
import { getCurrentTemple } from '@/lib/tenant';
import { DevoteeJoinForm } from '@/components/temple/DevoteeJoinForm';

export default async function DangKyPhatTuPage() {
  const temple = await getCurrentTemple();
  if (!temple) redirect('/');
  const primary = temple.primary_color || '#7A1F1F';

  return (
    <main className="min-h-screen bg-mist pt-24 pb-16">
      <div className="mx-auto max-w-xl px-6">
        <p
          className="text-[0.72rem] tracking-[0.3em] uppercase"
          style={{ color: primary }}
        >
          Kết duyên cùng nhà chùa
        </p>
        <h1 className="mt-3 font-display text-3xl md:text-4xl text-ink leading-tight">
          Ghi danh phật tử · {temple.name}
        </h1>
        <p className="mt-4 text-muted leading-relaxed">
          Nhà chùa sẽ gửi tin lễ, khóa tu, hoạt động thiện nguyện qua kênh quý
          vị chọn.
        </p>

        <div className="mt-8 bg-white p-6 md:p-8 border border-fog">
          <DevoteeJoinForm
            templeName={temple.name}
            primaryColor={primary}
            variant="page"
          />
        </div>
      </div>
    </main>
  );
}
