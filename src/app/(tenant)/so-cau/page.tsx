import { getCurrentTemple } from '@/lib/tenant';
import { PrayerRequestForm } from '@/components/prayer/PrayerRequestForm';

export default async function SoCauPublicPage() {
  const temple = await getCurrentTemple();
  if (!temple) return null;
  const primary = temple.primary_color || '#7A1F1F';

  return (
    <main className="pt-24 pb-16 px-6 md:px-12">
      <div className="mx-auto max-w-xl">
        <p
          className="text-[0.72rem] tracking-[0.3em] uppercase mb-2"
          style={{ color: primary }}
        >
          Sổ cầu an · cầu siêu
        </p>
        <h1 className="font-display text-3xl md:text-4xl text-ink">
          Đăng ký sớ tại {temple.name}
        </h1>
        <p className="mt-3 text-muted leading-relaxed">
          Điền thông tin bên dưới. Ban hộ niệm sẽ kiểm tra và xuất sớ theo định
          dạng chuẩn cho các đại lễ (Vu Lan, Dâng sao, Đầu năm…).
        </p>
        <div className="mt-8">
          <PrayerRequestForm
            primaryColor={primary}
            templeName={temple.name}
          />
        </div>
      </div>
    </main>
  );
}
