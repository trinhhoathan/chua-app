import Image from 'next/image';
import Link from 'next/link';
import type { SimListing, Temple } from '@/types/database';
import { LY_GIA } from '@/lib/ly-gia-phuc-an';
import { LY_GIA_PRODUCTS } from '@/lib/ly-gia-products';
import { LY_GIA_SERVICES } from '@/lib/ly-gia-services';
import { FengShuiNav } from '@/components/temple/FengShuiNav';
import { LyGiaReviews } from '@/components/ly-gia/LyGiaReviews';
import { LyGiaTeam } from '@/components/ly-gia/LyGiaTeam';
import { LY_GIA_TEAM } from '@/lib/ly-gia-team';
import { SimCard } from '@/components/sim/sim-ui';

const COURSES = [
  {
    title: 'Khóa Phong Thủy Nhập Môn',
    duration: '2 ngày',
    level: 'Cơ bản',
    points: [
      'Ngũ hành · âm dương · la bàn thực chiến',
      'Nhận biết khí tốt – khí xấu trong nhà',
      'Bài tập xem hướng cửa và bố trí phòng ngủ',
    ],
  },
  {
    title: 'Khóa Huyền Không Phi Tinh',
    duration: '5 buổi',
    level: 'Nâng cao',
    points: [
      'Phi tinh thời vận 2024–2043',
      'Luận tài vị – bệnh vị – quan vị',
      'Case study nhà phố & biệt thự thực tế',
    ],
  },
  {
    title: 'Khóa Bát Tự & Cải Vận',
    duration: '4 buổi',
    level: 'Chuyên sâu',
    points: [
      'Lập lá số, tìm dụng thần',
      'Ghép mệnh – nhà – nghề',
      'Chiến lược cải vận theo đại hạn',
    ],
  },
  {
    title: 'Khóa Dương Trạch Thực Hành',
    duration: '3 buổi',
    level: 'Thực chiến',
    points: [
      'Đo la bàn, lập đồ hình nhà',
      'Luận bếp – WC – phòng ngủ – bàn thờ',
      'Báo cáo cải tạo cho khách hàng thật',
    ],
  },
  {
    title: 'Khóa Phong Thủy Kinh Doanh',
    duration: '3 buổi',
    level: 'Doanh chủ',
    points: [
      'Tài lộ · nhân duyên · chỗ ngồi lãnh đạo',
      'Cửa hàng · showroom · nhà máy',
      'Kích hoạt vận kinh doanh theo năm',
    ],
  },
  {
    title: 'Khóa Âm Trạch · Mộ Phần',
    duration: '2 buổi',
    level: 'Chuyên đề',
    points: [
      'Hình thế long mạch cơ bản',
      'Hướng huyệt hợp hậu vận',
      'Khi nào nên cải tạo / dời táng',
    ],
  },
  {
    title: 'Khóa Đặt Tên & Sim Số',
    duration: '2 buổi',
    level: 'Ứng dụng',
    points: [
      'Âm số · ngũ hành · ý nghĩa chữ',
      'Chọn sim hợp mệnh – hợp ngành',
      'Case study tên thương hiệu thực tế',
    ],
  },
  {
    title: 'Khóa Nội Thất Ngũ Hành',
    duration: '2 buổi',
    level: 'Thẩm mỹ',
    points: [
      'Màu sắc · vật liệu · ánh sáng theo mệnh',
      'Đặt vật phẩm – cây xanh – đá quý',
      'Phối cảnh hiện đại vẫn đúng lý số',
    ],
  },
  {
    title: 'Masterclass Tư Vấn Chuyên Nghiệp',
    duration: '6 buổi',
    level: 'Nghề',
    points: [
      'Quy trình tiếp khách – khảo sát – báo cáo',
      'Đạo đức hành nghề & quản trị rủi ro',
      'Thực tập kèm thầy trên case thật',
    ],
  },
] as const;

const MORE_SERVICES = [
  'Xem hướng bàn làm việc · chỗ ngồi lãnh định',
  'Tư vấn màu sắc · vật phẩm · cây xanh theo mệnh',
  'Phong thủy nhà máy · kho xưởng · logistics',
  'Luận đại vận – tiểu hạn gắn với nhà ở',
] as const;

const REVIEWS = [
  {
    name: 'Nguyễn Minh Tuấn',
    role: 'Giám đốc doanh nghiệp — TP.HCM',
    text: 'Thầy Phúc An xem văn phòng giúp công ty tôi xoay chuyển dòng tiền chỉ sau một quý. Cách luận giải vừa sâu vừa thực tế, không mê tín.',
    avatar: '/images/ly-gia-phuc-an/reviews/review-01.png',
  },
  {
    name: 'Trần Thị Hạnh',
    role: 'Chủ biệt thự — Hà Nội',
    text: 'Gia đình từng phân vân mua căn nhà hướng Tây. Thầy chỉ rõ chỗ hợp – chỗ kỵ, khuyên cách hóa giải. Vào ở hơn một năm, nhà lúc nào cũng êm ấm.',
    avatar: '/images/ly-gia-phuc-an/reviews/review-02.png',
  },
  {
    name: 'Lê Quốc Bảo',
    role: 'Founder startup — TP.HCM',
    text: 'Sim Bát Tự thầy chọn giúp tôi như một điểm tựa năng lượng. Đối tác cũng bất ngờ khi nghe thầy luận số vừa sâu vừa dễ hiểu.',
    avatar: '/images/ly-gia-phuc-an/reviews/review-03.png',
  },
  {
    name: 'Phạm Thu Hà',
    role: 'Học viên khóa Huyền Không',
    text: 'Khóa học cô đọng, thầy cầm tay chỉ việc trên la bàn thật. Ra về áp dụng ngay được cho nhà mình — giá trị vượt xa học phí.',
    avatar: '/images/ly-gia-phuc-an/reviews/review-04.png',
  },
  {
    name: 'Đặng Hoàng Nam',
    role: 'Chủ chuỗi F&B — Đà Nẵng',
    text: 'Từ đặt tên thương hiệu đến bố trí bếp – quầy thu ngân, thầy chăm từng chi tiết. Ba chi nhánh mới đều khai trương thuận.',
    avatar: '/images/ly-gia-phuc-an/reviews/review-05.png',
  },
  {
    name: 'Võ Thanh Tâm',
    role: 'Kiến trúc sư — Hà Nội',
    text: 'Tôi hợp tác với thầy trên nhiều dự án thiết kế. Sự kết hợp giữa thẩm mỹ hiện đại và lý số cổ truyền tạo ra không gian “đắt giá” thật sự.',
    avatar: '/images/ly-gia-phuc-an/reviews/review-06.png',
  },
  {
    name: 'Hoàng Anh Khoa',
    role: 'Chủ đầu tư BĐS — Hà Nội',
    text: 'Trước mỗi đợt mở bán, tôi nhờ thầy khảo sát quỹ đất. Nhiều lô “đẹp trên giấy” bị thầy loại — sau này nhìn lại là may.',
    avatar: '/images/ly-gia-phuc-an/reviews/review-07.png',
  },
  {
    name: 'Ngô Diệu Linh',
    role: 'Bác sĩ — TP.HCM',
    text: 'Nhà cũ hay ốm đau dai dẳng. Sau khi thầy chỉnh lại hướng giường và bếp, cả nhà ngủ ngon hơn hẳn trong vài tuần.',
    avatar: '/images/ly-gia-phuc-an/reviews/review-08.png',
  },
  {
    name: 'Bùi Đức Thành',
    role: 'CEO logistics — Hải Phòng',
    text: 'Kho hàng được thầy bố trí lại lối xe ra vào và bàn điều hành. Doanh số quý sau tăng rõ — đội ngũ cũng làm việc suôn sẻ hơn.',
    avatar: '/images/ly-gia-phuc-an/reviews/review-09.png',
  },
  {
    name: 'Lý Mai Phương',
    role: 'Học viên khóa Dương Trạch',
    text: 'Ban đầu sợ lý thuyết khô. Thầy dạy bằng case thật, mình đo la bàn ngay tại lớp — tự tin đi xem nhà cho người thân.',
    avatar: '/images/ly-gia-phuc-an/reviews/review-10.png',
  },
  {
    name: 'Trịnh Văn Sơn',
    role: 'Việt kiều — California',
    text: 'Online với thầy vẫn chi tiết không kém gặp trực tiếp. Thầy gửi sơ đồ đánh dấu rõ từng điểm cần chỉnh trong nhà tại Mỹ.',
    avatar: '/images/ly-gia-phuc-an/reviews/review-11.png',
  },
  {
    name: 'Đỗ Ngọc Ánh',
    role: 'Chủ spa — Nha Trang',
    text: 'Tên thương hiệu và màu nhận diện do thầy chọn giúp spa nổi bật mà vẫn dịu. Khách khen “vào là thấy dễ chịu”.',
    avatar: '/images/ly-gia-phuc-an/reviews/review-12.png',
  },
  {
    name: 'Phan Quang Huy',
    role: 'Kỹ sư xây dựng — Đà Nẵng',
    text: 'Là người làm xây dựng, tôi khó thuyết phục. Nhưng thầy giải thích bằng hình thế và dòng khí — rất logic, áp dụng được ngay trên công trình.',
    avatar: '/images/ly-gia-phuc-an/reviews/review-13.png',
  },
  {
    name: 'Mai Thị Lan',
    role: 'Nội trợ — Bắc Ninh',
    text: 'Thầy khuyên không mua căn nhà mình thích vì phạm đường đâm. Sau đó căn đó liên tục đổi chủ — gia đình cảm ơn thầy rất nhiều.',
    avatar: '/images/ly-gia-phuc-an/reviews/review-14.png',
  },
  {
    name: 'Vũ Minh Đức',
    role: 'Trader — TP.HCM',
    text: 'Sim thầy chọn trùng dụng thần của tôi. Từ ngày kích hoạt, công việc đàm phán suôn sẻ hơn — có thể trùng hợp, nhưng tôi tin vào sự chỉn chu của thầy.',
    avatar: '/images/ly-gia-phuc-an/reviews/review-15.png',
  },
  {
    name: 'Chu Hồng Nhung',
    role: 'Học viên Masterclass',
    text: 'Khóa nghề giúp mình có quy trình tư vấn bài bản. Thầy sửa từng bản báo cáo — bước ra hành nghề tự tin và có đạo đức.',
    avatar: '/images/ly-gia-phuc-an/reviews/review-16.png',
  },
] as const;

const BIO_FALLBACK = `Với hơn 20 năm miệt mài nghiên cứu và hoạt động trong lĩnh vực Kiến trúc – Xây dựng, kết hợp nền tảng sâu sắc về Huyền học (Bát Tự, Tử vi, Phong thủy, Kinh dịch, Cảm xạ, Năng lượng lượng tử và năng lượng chữa lành...), thầy Lý Gia Phúc An mang đến góc nhìn đa chiều, toàn diện và khác biệt — gắn lý luận Đông phương với ứng dụng thực tế cho từng hoàn cảnh.

Bằng sự kết hợp nhuần nhuyễn giữa nguyên lý Âm Dương Ngũ Hành, Sinh Thần Bát Tự và Phong thủy khoa học, mỗi giải pháp không chỉ tối ưu hóa không gian sống mà còn kiến giải, định hướng chuẩn xác cho vận mệnh, sự nghiệp và mệnh cục của từng gia chủ.

Thầy đã đồng hành cùng nhiều gia chủ, doanh nghiệp tại Việt Nam và tham gia các dự án tư vấn ở Singapore, Hong Kong, London, Paris, California và Melbourne. Dịch vụ gồm kiến tạo vận mệnh & không gian, thiết kế chìa khóa trao tay, cải vận phong thủy, sim Bát Tự và đặt tên thương hiệu — hướng tới giải pháp rõ ràng, phù hợp mệnh chủ và mục tiêu sử dụng.`;

export function LyGiaHome({
  temple,
  featuredSims = [],
}: {
  temple: Temple;
  featuredSims?: SimListing[];
}) {
  const phone = temple.hotline || LY_GIA.phone;
  const hero = temple.hero_image_url || LY_GIA.hero;
  const master = LY_GIA.master;
  const primary = temple.primary_color || LY_GIA.primary;

  return (
    <main className="overflow-x-hidden bg-paper">
      {/* HERO — logo orb to + tên thương hiệu */}
      <section className="relative min-h-[100svh] flex items-end">
        <div className="absolute inset-0 overflow-hidden">
          <Image
            src={hero}
            alt=""
            fill
            priority
            className="object-cover object-center animate-drift"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1a1714]/92 via-[#1a1714]/45 to-[#1a1714]/20" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,rgba(26,23,20,0.35)_100%)]" />
        </div>

        <div className="relative z-10 w-full px-6 pb-24 pt-28 md:px-12 md:pb-28 lg:px-20">
          <div className="max-w-3xl text-left animate-rise">
            <Image
              src={LY_GIA.logoOrb}
              alt=""
              width={220}
              height={220}
              priority
              unoptimized
              className="size-[9.5rem] sm:size-[11rem] md:size-[13rem] scale-110 rounded-full object-cover object-center drop-shadow-[0_12px_40px_rgba(0,0,0,0.45)]"
            />
            <h1 className="mt-5 font-display text-[clamp(2.4rem,7vw,4.75rem)] leading-[0.95] text-white font-medium tracking-tight">
              {LY_GIA.name}
            </h1>
            <p className="mt-4 max-w-xl text-base md:text-lg text-white/80 font-light leading-relaxed animate-rise-delay">
              {temple.slogan || 'Kiến tạo vận mệnh & không gian'}
            </p>
            <div className="mt-8 flex flex-wrap justify-start gap-3 animate-rise-delay-2">
              <a
                href={LY_GIA.zaloUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center px-6 py-3 text-sm font-medium text-white transition-colors"
                style={{ backgroundColor: primary }}
              >
                Tư vấn Zalo ngay
              </a>
              <a
                href="#dich-vu"
                className="inline-flex items-center justify-center px-6 py-3 text-sm font-medium text-white/90 border border-white/35 hover:bg-white/10 transition-colors"
              >
                Xem dịch vụ
              </a>
              <a
                href="/phong-thuy"
                className="inline-flex items-center justify-center px-6 py-3 text-sm font-medium text-white/90 border border-white/35 hover:bg-white/10 transition-colors"
              >
                Công cụ phong thủy
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ABOUT */}
      <section id="gioi-thieu" className="scroll-mt-20 bg-paper py-16 md:py-24">
        <div className="mx-auto max-w-6xl px-6 md:px-12">
          <div className="grid items-center gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-14">
            <div className="relative mx-auto w-full max-w-md">
              <div className="relative aspect-[3/4] overflow-hidden border border-fog bg-mist">
                <Image
                  src={master}
                  alt={`Chân dung ${LY_GIA.name}`}
                  fill
                  className="object-cover object-[center_20%]"
                  sizes="(max-width:768px) 100vw, 40vw"
                  unoptimized
                  priority
                />
              </div>
              <div className="absolute -bottom-4 left-4 right-4 border border-fog bg-white px-4 py-3 shadow-sm">
                <p className="text-sm text-ink">
                  Thầy Phong Thủy Lý Gia Phúc An
                </p>
              </div>
            </div>

            <div>
              <div className="section-rule mb-6" />
              <p className="text-[0.72rem] tracking-[0.3em] uppercase text-lacquer mb-2">
                Giới thiệu
              </p>
              <h2 className="font-display text-3xl md:text-4xl text-ink leading-tight">
                {temple.abbott_title ||
                  'Chuyên gia phong thủy thực chứng'}
              </h2>
              <div className="mt-6 space-y-4 text-[0.95rem] leading-[1.85] text-muted">
                {(temple.abbott_bio || BIO_FALLBACK).split('\n\n').map((p) => (
                  <p key={p.slice(0, 48)}>{p}</p>
                ))}
              </div>
              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                {[
                  ['Kinh nghiệm', 'Hơn 20 năm nghiên cứu & hành nghề'],
                  ['Chuyên môn', 'Nhà ở · Văn phòng · Bát Tự'],
                  ['Phạm vi', 'Việt Nam và các dự án quốc tế'],
                  ['Phương châm', 'Thực chứng · Tận tâm · Rõ ràng'],
                ].map(([k, v]) => (
                  <div key={k} className="border border-fog bg-white px-4 py-3">
                    <p className="text-[0.68rem] uppercase tracking-[0.16em] text-lacquer">
                      {k}
                    </p>
                    <p className="mt-1 text-sm text-ink">{v}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SERVICES — 12 */}
      <section id="dich-vu" className="scroll-mt-20 bg-mist/50 py-16 md:py-24">
        <div className="mx-auto max-w-6xl px-6 md:px-12">
          <div className="section-rule mb-6" />
          <p className="text-[0.72rem] tracking-[0.3em] uppercase text-lacquer mb-2">
            Dịch vụ chuyên sâu
          </p>
          <h2 className="max-w-2xl font-display text-3xl md:text-4xl text-ink leading-tight">
            Trọn bộ giải pháp phong thủy cho nhà cửa, sự nghiệp & vận mệnh
          </h2>
          <p className="mt-4 max-w-2xl text-muted leading-relaxed">
            Từ khảo sát hiện trạng đến thiết kế trao chìa khóa — mỗi lời tư vấn của thầy
            đều gắn với mệnh cục cá nhân và thực tế cuộc sống.
          </p>

          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {LY_GIA_SERVICES.map((s) => (
              <article
                key={s.slug}
                id={`dich-vu-${s.slug}`}
                className="group scroll-mt-24 overflow-hidden border border-fog bg-white hover:border-ink/20 transition-colors"
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  <Image
                    src={s.image}
                    alt={s.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    sizes="(max-width:768px) 100vw, 33vw"
                  />
                </div>
                <div className="p-5">
                  <h3 className="font-display text-xl text-ink leading-snug">
                    {s.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{s.body}</p>
                </div>
              </article>
            ))}
          </div>

          <div className="mt-10 border border-fog bg-white p-6 md:p-8">
            <h3 className="font-display text-2xl text-ink">Thêm các dịch vụ liên quan</h3>
            <ul className="mt-5 grid gap-2.5 sm:grid-cols-2">
              {MORE_SERVICES.map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-sm text-muted">
                  <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-lacquer" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-14">
            <p className="text-[0.72rem] tracking-[0.3em] uppercase text-lacquer mb-2">
              Dịch vụ số · Trấn số
            </p>
            <h3 className="max-w-xl font-display text-2xl md:text-3xl text-ink leading-tight">
              Trấn biển xe · số nhà · TK thủ tài · Sim Linh Số
            </h3>
            <p className="mt-3 max-w-2xl text-sm text-muted leading-relaxed">
              Luận theo nguyên lý Âm Dương Ngũ Hành, Kinh dịch diệu luận và Bát Tự — chọn số đúng mệnh, đúng mục tiêu.
            </p>
            <ul className="mt-8 grid gap-4 sm:grid-cols-2">
              {LY_GIA_PRODUCTS.map((p) => (
                <li key={p.slug}>
                  <Link
                    href={`/san-pham/${p.slug}`}
                    className="group flex h-full flex-col overflow-hidden border border-fog bg-white transition-colors hover:border-ink/25"
                  >
                    <div className="relative aspect-[16/9] overflow-hidden">
                      <Image
                        src={p.image}
                        alt={p.title}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                        sizes="(max-width:768px) 100vw, 50vw"
                      />
                    </div>
                    <div className="flex flex-1 flex-col p-5">
                      <p className="text-[0.65rem] uppercase tracking-[0.2em] text-lacquer">
                        {p.shortTitle}
                      </p>
                      <h4 className="mt-1 font-display text-xl text-ink leading-snug">
                        {p.title}
                      </h4>
                      <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">
                        {p.tagline}
                      </p>
                      <span className="mt-4 text-xs font-semibold text-lacquer">
                        Xem chi tiết →
                      </span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* HOUSE */}
      <section id="xem-nha" className="scroll-mt-20 bg-paper py-16 md:py-20">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-6 md:grid-cols-2 md:px-12">
          <div className="relative aspect-[4/3] overflow-hidden border border-fog">
            <Image
              src="/images/ly-gia-phuc-an/section-xem-nha.png"
              alt="Tư vấn xem nhà phong thủy"
              fill
              className="object-cover"
              sizes="(max-width:768px) 100vw, 50vw"
            />
          </div>
          <div>
            <div className="section-rule mb-6" />
            <p className="text-[0.72rem] tracking-[0.3em] uppercase text-lacquer mb-2">
              Xem nhà cửa
            </p>
            <h2 className="font-display text-3xl md:text-4xl text-ink leading-tight">
              Hướng hợp hay không hợp — nên mua hay không nên mua
            </h2>
            <p className="mt-4 text-muted leading-relaxed">
              Trước khi đặt bút ký hợp đồng, một buổi khảo sát của thầy giúp bạn tránh
              mua nhầm nhà sát khí. Thầy chỉ rõ điểm mạnh – điểm yếu, phương án cải tạo
              tối thiểu mà hiệu quả tối đa, hoặc khuyên dừng lại đúng lúc.
            </p>
            <ol className="mt-6 space-y-3 text-sm text-ink/80">
              {[
                'Thu thập thông tin tuổi mệnh chủ & bản vẽ / ảnh hiện trạng',
                'Luận hướng, cung vị, dòng khí và các sao phi tinh',
                'Kết luận: nên mua / nên cải tạo / không nên mua + lộ trình hóa giải',
              ].map((step, i) => (
                <li key={step} className="flex gap-3">
                  <span
                    className="flex size-7 shrink-0 items-center justify-center text-[0.75rem] font-semibold text-white"
                    style={{ backgroundColor: primary }}
                  >
                    {i + 1}
                  </span>
                  <span className="pt-1">{step}</span>
                </li>
              ))}
            </ol>
            <a
              href={`tel:${phone}`}
              className="mt-8 inline-flex items-center px-6 py-3 text-sm font-medium text-white"
              style={{ backgroundColor: primary }}
            >
              Đặt lịch xem nhà · {LY_GIA.phoneDisplay}
            </a>
          </div>
        </div>
      </section>

      {/* SIM */}
      <section id="sim" className="scroll-mt-20 bg-mist/50 py-16 md:py-20">
        <div className="mx-auto max-w-6xl px-6 md:px-12">
          <div className="grid items-center gap-10 md:grid-cols-2">
            <div className="order-2 md:order-1">
              <div className="section-rule mb-6" />
              <p className="text-[0.72rem] tracking-[0.3em] uppercase text-lacquer mb-2">
                Sim phong thủy
              </p>
              <h2 className="font-display text-3xl md:text-4xl text-ink leading-tight">
                Sim Bát Tự — dãy số hợp mệnh, chiêu tài & định vị năng lượng
              </h2>
              <p className="mt-4 text-muted leading-relaxed">
                Thầy Lý Gia Phúc An tuyển chọn sim theo Bát Tự, ngũ hành dụng thần và ngành
                nghề — không chọn số đẹp đại trà, mà chọn số đúng người. Mỗi số trong kho
                đều được chấm điểm bằng engine Âm Dương Ngũ Hành.
              </p>
              <ul className="mt-6 space-y-2.5 text-sm text-ink/80">
                {[
                  'Nhập ngày giờ sinh — hệ thống lập Bát Tự, chấm % hợp mệnh từng số',
                  'Lọc sim theo ngành nghề: bất động sản, kinh doanh, tài chính…',
                  'Đặt mua online, thanh toán QR; thầy chọn ngày tốt kích sim',
                ].map((t) => (
                  <li key={t} className="flex gap-2.5">
                    <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-lacquer" />
                    {t}
                  </li>
                ))}
              </ul>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/sim"
                  className="inline-flex items-center px-6 py-3 text-sm font-medium text-white transition-opacity hover:opacity-90"
                  style={{ backgroundColor: primary }}
                >
                  Vào kho sim — tìm số hợp mệnh
                </Link>
                <a
                  href={LY_GIA.zaloUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center border border-lacquer px-6 py-3 text-sm font-medium text-lacquer hover:bg-lacquer hover:text-white transition-colors"
                >
                  Nhắn Zalo — thầy tư vấn
                </a>
              </div>
            </div>
            <div className="relative order-1 aspect-[4/3] overflow-hidden border border-fog md:order-2">
              <Image
                src="/images/ly-gia-phuc-an/sim.png"
                alt="Sim phong thủy Bát Tự"
                fill
                className="object-cover"
                sizes="(max-width:768px) 100vw, 50vw"
              />
            </div>
          </div>

          {featuredSims.length > 0 ? (
            <div className="mt-12">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="font-display text-xl text-ink">
                  Số thầy tuyển tuần này
                </p>
                <Link
                  href="/sim"
                  className="text-xs text-lacquer underline underline-offset-2 hover:text-ink"
                >
                  Xem toàn bộ kho sim →
                </Link>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {featuredSims.slice(0, 8).map((sim) => (
                  <SimCard key={sim.id} sim={sim} />
                ))}
              </div>
              <p className="mt-4 text-center text-[0.72rem] text-muted">
                Nhập ngày giờ sinh tại kho sim để xem % hợp mệnh của từng số với riêng bạn.
              </p>
            </div>
          ) : null}
        </div>
      </section>

      {/* COURSES — 9 */}
      <section id="khoa-hoc" className="scroll-mt-20 bg-paper py-16 md:py-24">
        <div className="mx-auto max-w-6xl px-6 md:px-12">
          <div className="grid gap-8 lg:grid-cols-[1fr_1.15fr] lg:items-end">
            <div>
              <div className="section-rule mb-6" />
              <p className="text-[0.72rem] tracking-[0.3em] uppercase text-lacquer mb-2">
                Chương trình khóa học
              </p>
              <h2 className="font-display text-3xl md:text-4xl text-ink leading-tight">
                Truyền đạo – mở lớp thực chiến
              </h2>
              <p className="mt-4 text-muted leading-relaxed">
                Học trực tiếp với thầy tại Hà Nội hoặc theo lịch online dành cho học viên
                trong nước và hải ngoại.
              </p>
            </div>
            <div className="relative aspect-[16/9] overflow-hidden border border-fog lg:aspect-[21/9]">
              <Image
                src="/images/ly-gia-phuc-an/khoa-hoc.png"
                alt="Không gian khóa học phong thủy"
                fill
                className="object-cover"
                sizes="100vw"
              />
            </div>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {COURSES.map((c) => (
              <article
                key={c.title}
                className="flex flex-col border border-fog bg-white p-6 hover:border-ink/20 transition-colors"
              >
                <div className="flex items-center justify-between gap-2 text-[0.68rem] uppercase tracking-[0.14em] text-lacquer">
                  <span>{c.level}</span>
                  <span className="text-muted">{c.duration}</span>
                </div>
                <h3 className="mt-3 font-display text-xl text-ink leading-snug">
                  {c.title}
                </h3>
                <ul className="mt-4 flex-1 space-y-2 text-sm text-muted">
                  {c.points.map((p) => (
                    <li key={p} className="flex gap-2">
                      <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-gilt" />
                      {p}
                    </li>
                  ))}
                </ul>
                <a
                  href={LY_GIA.zaloUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-6 inline-flex h-10 items-center justify-center text-sm font-medium text-white"
                  style={{ backgroundColor: primary }}
                >
                  Đăng ký khóa học
                </a>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* NHÂN SỰ — carousel đỏ đô / vàng */}
      <section id="nhan-su" className="scroll-mt-20">
        <LyGiaTeam members={[...LY_GIA_TEAM]} />
      </section>

      {/* REVIEWS carousel */}
      <section id="danh-gia" className="scroll-mt-20 bg-mist/40 py-16 md:py-24">
        <div className="mx-auto max-w-6xl px-6 md:px-12">
          <div className="section-rule mb-6" />
          <p className="text-[0.72rem] tracking-[0.3em] uppercase text-lacquer mb-2">
            Lời chứng từ học viên & thân chủ
          </p>
          <h2 className="max-w-2xl font-display text-3xl md:text-4xl text-ink leading-tight">
            Niềm tin từ những người đã đồng hành cùng thầy
          </h2>
          <div className="mt-10">
            <LyGiaReviews reviews={[...REVIEWS]} />
          </div>
        </div>
      </section>

      {/* MAP */}
      <section className="bg-paper py-16 md:py-20">
        <div className="mx-auto max-w-6xl px-6 md:px-12">
          <div className="section-rule mb-6" />
          <p className="text-[0.72rem] tracking-[0.3em] uppercase text-lacquer mb-2">
            Văn phòng
          </p>
          <h2 className="font-display text-3xl md:text-4xl text-ink leading-tight">
            {temple.address || LY_GIA.address}
          </h2>
          <p className="mt-3 text-sm text-muted">
            Mở Google Maps để chỉ đường tới văn phòng Lý Gia Phúc An.
          </p>
          <div className="mt-6 overflow-hidden border border-fog">
            <iframe
              title="Bản đồ văn phòng Lý Gia Phúc An"
              src={temple.maps_embed_url || LY_GIA.mapsEmbedUrl}
              className="h-[320px] w-full border-0 md:h-[420px]"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
          </div>
          <a
            href={temple.maps_url || LY_GIA.mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex text-sm text-lacquer hover:underline"
          >
            Mở trong Google Maps →
          </a>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-mist/50 py-14 md:py-16">
        <div className="mx-auto max-w-6xl px-6 md:px-12">
          <div
            className="px-6 py-12 text-center text-white md:px-12"
            style={{ backgroundColor: primary }}
          >
            <Image
              src={LY_GIA.logoFull}
              alt={LY_GIA.name}
              width={220}
              height={220}
              unoptimized
              className="mx-auto mb-6 size-[9.5rem] sm:size-[11rem] md:size-[12.5rem] object-contain drop-shadow-[0_8px_24px_rgba(0,0,0,0.35)]"
            />
            <p className="font-display text-3xl md:text-4xl text-gilt">
              Vạn tín thành tâm · Đạo đế vương thịnh
            </p>
            <p className="mx-auto mt-4 max-w-xl text-sm md:text-base text-white/80">
              Một cuộc gọi có thể đổi cả cục diện nhà cửa và sự nghiệp. Hãy để thầy
              Lý Gia Phúc An đồng hành cùng bạn trên hành trình cải vận.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <a
                href={`tel:${phone}`}
                className="inline-flex items-center bg-white px-6 py-3 text-sm font-medium text-ink"
              >
                Gọi {LY_GIA.phoneDisplay}
              </a>
              <a
                href={LY_GIA.zaloUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center border border-white/40 px-6 py-3 text-sm font-medium text-white hover:bg-white/10"
              >
                Chat Zalo
              </a>
            </div>
          </div>
        </div>
      </section>

      <FengShuiNav temple={temple} />
    </main>
  );
}
