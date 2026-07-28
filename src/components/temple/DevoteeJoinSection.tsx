import Image from 'next/image';
import type { Temple } from '@/types/database';
import { DevoteeJoinForm } from './DevoteeJoinForm';

interface Props {
  temple: Temple;
}

function isRemote(url: string) {
  return /^https?:\/\//i.test(url);
}

export function DevoteeJoinSection({ temple }: Props) {
  const primary = temple.primary_color || '#7A1F1F';
  const hero = temple.hero_image_url || temple.abbott_image_url;

  return (
    <section id="dang-ky-phat-tu" className="scroll-mt-16 bg-mist">
      <div className="mx-auto max-w-6xl px-6 py-20 md:px-12 md:py-24 grid gap-12 md:grid-cols-[1.05fr_1fr] md:gap-16 items-center">
        <div>
          <p
            className="text-[0.72rem] tracking-[0.3em] uppercase"
            style={{ color: primary }}
          >
            Kết duyên cùng nhà chùa
          </p>
          <h2 className="mt-3 font-display text-3xl md:text-4xl text-ink leading-tight">
            Ghi danh trở thành phật tử của {temple.name}
          </h2>
          <p className="mt-5 text-muted leading-relaxed text-[1.05rem]">
            Quý vị để lại họ tên và số điện thoại, nhà chùa sẽ gửi thông tin
            các buổi lễ, khóa tu, hoạt động thiện nguyện và lời chúc bình an
            vào những ngày đại lễ.
          </p>

          {hero ? (
            <div className="mt-8 relative aspect-[16/10] overflow-hidden bg-fog max-w-md">
              <Image
                src={hero}
                alt=""
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 45vw"
                unoptimized={isRemote(hero)}
              />
            </div>
          ) : null}
        </div>

        <div className="bg-white p-6 md:p-8 border border-fog shadow-[0_20px_60px_-30px_rgba(0,0,0,0.35)]">
          <DevoteeJoinForm
            templeName={temple.name}
            primaryColor={primary}
          />
        </div>
      </div>
    </section>
  );
}
