import Link from 'next/link';
import type { Temple } from '@/types/database';
import { formatVnd } from '@/lib/tenant';
import { getWaterBottleBrand } from '@/lib/water-bottle-brand';
import { WaterBottleShowcase } from '@/components/water/WaterBottleShowcase';
import { OpenWaterDonateButton } from '@/components/water/OpenWaterDonateButton';

interface Props {
  temple: Temple;
  /** Compact mode for /dat-nuoc (skip some homepage chrome). */
  compact?: boolean;
}

const TIERS = [
  {
    qty: 10,
    title: 'Phát tâm thỉnh 10 thùng Nước Thanh Tịnh',
    wish: 'Cầu bình an cho Gia đình',
  },
  {
    qty: 50,
    title: 'Phát tâm thỉnh 50 thùng Nước Thanh Tịnh',
    wish: 'Gieo duyên Phước báu — Tiếp đón Phật tử về Lễ Chùa',
  },
  {
    qty: 100,
    title: 'Phát tâm thỉnh 100 thùng (hoặc tùy hỷ)',
    wish: 'Trợ duyên Đại lễ & Hỗ trợ Phật sự',
  },
] as const;

export function WaterMeritsStory({ temple, compact = false }: Props) {
  const primary = temple.primary_color || '#7A1F1F';
  const pad = compact ? 'py-12 md:py-16' : 'py-20 md:py-28';
  const bottleBrand = getWaterBottleBrand(temple);
  const contentMax = bottleBrand ? 'max-w-4xl' : 'max-w-3xl';

  return (
    <section id="dong-nuoc" className={`bg-paper scroll-mt-8 ${pad}`}>
      <div className={`mx-auto ${contentMax} px-6 md:px-12`}>
        <div className="section-rule mb-6" />
        <p className="text-[0.72rem] tracking-[0.3em] uppercase text-lacquer mb-3">
          Gieo duyên nước mát
        </p>
        <h2 className="font-display text-3xl md:text-4xl text-ink leading-tight">
          Công đức nước tinh khiết
        </h2>
        <p className="mt-4 text-muted leading-relaxed max-w-3xl">
          Câu chuyện về gáo nước sạch thời Đức Phật — và lời mời phát tâm thỉnh
          nước, cúng dường nước thanh tịnh cho {temple.name}.
        </p>

        {bottleBrand ? (
          <WaterBottleShowcase
            temple={temple}
            variant={compact ? 'purchase' : 'home'}
          />
        ) : null}

        <div className="mt-10 space-y-8 text-muted leading-relaxed text-[1.05rem] max-w-3xl">
          <div>
            <h3 className="font-display text-xl text-ink mb-3">
              Gáo nước sạch thời Đức Phật
            </h3>
            <p>
              Vào thời Đức Phật còn tại thế, trong một lần cùng giáo đoàn hành
              giả băng qua sa mạc nắng cháy, cổ họng khô rát, Ngài và các vị
              Tỳ-kheo dừng chân bên một làng quê nghèo. Khi ấy, có một người dân
              gia cảnh khốn khó, trong lu chỉ còn đúng một gáo nước sạch duy
              nhất. Bằng tất cả lòng thành kính, người ấy đã hoan hỷ dâng trọn
              gáo nước mát lành ấy lên Đức Phật và chư Tăng.
            </p>
            <p className="mt-4">
              Đức Phật nhận lấy gáo nước, an nhiên mỉm cười và dạy rằng:
            </p>
            <blockquote
              className="mt-5 border-l-2 pl-5 py-1 italic text-ink"
              style={{ borderColor: primary }}
            >
              « Cầy cấy trên ruộng phước của chư Tăng và chúng sinh, dù chỉ dâng
              một giọt nước tinh khiết với tâm rộng mở, phước báu tích tụ cũng
              sâu rộng tựa đại dương. »
            </blockquote>
            <p className="mt-5">
              Trải qua hàng ngàn năm, hình ảnh « Giọt nước thanh tịnh » vẫn luôn
              là cúng phẩm đơn sơ mà thiêng liêng nhất chốn Thiền môn. Nước không
              màu, không vị, đại diện cho sự tĩnh lặng, bình đẳng, không vướng
              bụi trần — chính là hình ảnh biểu trưng cho Tâm Phật.
            </p>
          </div>

          <div>
            <h3 className="font-display text-xl text-ink mb-3">
              Mỗi chai nước dâng lên — Một hành trình gieo duyên phước báu
            </h3>
            <p>
              Trở về chốn Già-lam thanh tịnh, những chai Nước Công Đức mang tâm
              nguyện tiếp nối dòng chảy phước báu ấy.
            </p>
            <p className="mt-4">
              Khi Quý Phật tử phát tâm thỉnh từng chai nước, từng thùng nước
              mang dấu ấn riêng của {temple.name}, Quý vị đang hoàn thành một
              hành trình gieo duyên tròn đầy:
            </p>
            <ul className="mt-5 space-y-4">
              <li>
                <span className="text-ink font-medium">
                  Trọn vẹn lòng Thành cúng dường Tam Bảo:{' '}
                </span>
                Chai nước tinh khiết được đặt trên bàn thờ Tổ, đại diện cho lời
                nguyện cầu cho gia đạo bình an, tâm trí thanh tĩnh, xả bỏ vướng
                bận.
              </li>
              <li>
                <span className="text-ink font-medium">
                  Tự tại Kết duyên với Chúng sinh:{' '}
                </span>
                Nước sau khi hạ lễ sẽ được Nhà chùa dùng để tiếp đón chư Tăng Ni
                tu học, hoặc phát hoàn toàn miễn phí cho hàng vạn Phật tử thập
                phương về hành hương, cho những cụ già đường xa đỡ mỏi, những em
                nhỏ theo cha mẹ về chùa đỡ khát. Quý vị phát tâm hôm nay, chính
                là đang âm thầm gieo duyên bố thí mát lành cho muôn người ngày
                mai.
              </li>
              <li>
                <span className="text-ink font-medium">
                  Trợ duyên Duy trì Chốn Tổ:{' '}
                </span>
                Sự phát tâm hoan hỷ của Quý vị còn góp phần giúp Nhà chùa trang
                trải kinh phí duy trì nguồn nước sạch, thắp ngọn đèn chánh pháp
                và thực hiện các hoạt động từ thiện, Phật sự tại địa phương.
              </li>
              {bottleBrand ? (
                <li>
                  <span className="text-ink font-medium">
                    Bùa chú · nguyện lành từ Sư phụ:{' '}
                  </span>
                  Nước mang nhãn {temple.name} được{' '}
                  {bottleBrand.abbottHonorific} trì chú, phát tâm nguyện thiện
                  lành — cầu bình an, cát tường cho gia đạo Quý Phật tử trước khi
                  dâng lên / phát cho thập phương.
                </li>
              ) : null}
            </ul>
          </div>

          <div>
            <h3 className="font-display text-xl text-ink mb-3">
              « Nước chảy về biển lớn — Tâm lành hướng về Phật »
            </h3>
            <p>
              Người đi lễ trước gieo hạt giống lành, người đến lễ sau hưởng
              giọt nước mát. Dòng nước cứ thế nối tiếp chảy đi, chuyên chở tình
              thương và sự gắn kết không ngừng nghỉ giữa chốn Không môn.
            </p>
            <p className="mt-4">
              Kính chúc Quý Phật tử và Gia quyến thân tâm an lạc, vạn sự cát
              tường!
            </p>
            <p className="mt-3 text-ink font-medium">A Di Đà Phật!</p>
          </div>
        </div>

        <div className="mt-14 max-w-3xl">
          <p className="text-[0.72rem] tracking-[0.3em] uppercase text-lacquer mb-3">
            Bảng phát tâm cúng dường
          </p>
          <h3 className="font-display text-2xl md:text-3xl text-ink">
            Hãy gieo một giọt nước lành
          </h3>
          <p className="mt-3 text-sm text-muted leading-relaxed">
            Mức phát tâm tùy hỷ:{' '}
            {formatVnd(temple.water_price_vnd)}/thùng · tối thiểu 1 thùng (24
            chai nước) mỗi lần thỉnh. Mỗi phát tâm được ghi nhận vào Sổ Vàng
            Công Đức; nước được sắp xếp trang nghiêm tại sân chùa / nhà bái
            đường.
          </p>

          <ul className="mt-8 space-y-3">
            {TIERS.map((t) => (
              <li key={t.qty}>
                <OpenWaterDonateButton
                  qty={t.qty}
                  note={t.wish}
                  className="block w-full text-left border border-fog bg-mist/50 px-5 py-4 hover:border-ink/20 transition-colors"
                >
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <p className="text-ink font-medium">{t.title}</p>
                    <p className="text-sm" style={{ color: primary }}>
                      Mức phát tâm {formatVnd(t.qty * temple.water_price_vnd)}
                    </p>
                  </div>
                  <p className="mt-1 text-sm text-muted">{t.wish}</p>
                </OpenWaterDonateButton>
              </li>
            ))}
          </ul>

          <div className="mt-8 flex flex-wrap gap-3">
            <OpenWaterDonateButton
              className="inline-flex items-center justify-center px-6 py-3 text-sm font-medium text-white"
              style={{ backgroundColor: primary }}
            >
              Chọn số thùng · phát tâm
            </OpenWaterDonateButton>
            {bottleBrand ? (
              <Link
                href="/thu-nhan-nuoc"
                className="inline-flex items-center justify-center px-6 py-3 text-sm font-medium border border-fog text-ink hover:bg-mist"
              >
                Xem chai nước mang nhãn chùa
              </Link>
            ) : null}
            <Link
              href={compact ? '/#minh-bach' : '#minh-bach'}
              className="inline-flex items-center justify-center px-6 py-3 text-sm font-medium border border-fog text-ink hover:bg-mist"
            >
              Xem sổ công đức
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
