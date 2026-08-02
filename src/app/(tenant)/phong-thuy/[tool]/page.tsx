import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { getCurrentTemple } from '@/lib/tenant';
import { isLyGiaPhucAnSite } from '@/lib/ly-gia-phuc-an';
import { getSitePersona } from '@/lib/site-persona';
import { SitePersonaProvider } from '@/components/SitePersonaContext';
import { getFeaturedSims } from '@/lib/sim/catalog';
import { SimCard } from '@/components/sim/sim-ui';
import { getUpcomingTempleEvents } from '@/lib/temple-events';
import {
  getToolMeta,
  toolsWithOwnPage,
} from '@/lib/fengshui/tools';
import { ToolShell } from '@/components/fengshui/ToolShell';
import { ComingSoonPanel } from '@/components/fengshui/ComingSoonPanel';
import { DongTho } from '@/components/fengshui/tools/DongTho';
import { MuonTuoiLamNha } from '@/components/fengshui/tools/MuonTuoiLamNha';
import { ChonNgayTool } from '@/components/fengshui/tools/ChonNgayTool';
import { HuongNha } from '@/components/fengshui/tools/HuongNha';
import { CuoiHoi } from '@/components/fengshui/tools/CuoiHoi';
import { MaChay } from '@/components/fengshui/tools/MaChay';
import { TrungTang } from '@/components/fengshui/tools/TrungTang';
import { CaiTang } from '@/components/fengshui/tools/CaiTang';
import { SaoChieuMenh } from '@/components/fengshui/tools/SaoChieuMenh';
import { ThanSoHoc } from '@/components/fengshui/tools/ThanSoHoc';
import { DanhGiaTinhDanh } from '@/components/fengshui/tools/DanhGiaTinhDanh';
import { NhanTuong } from '@/components/fengshui/tools/NhanTuong';
import { ChiTuong } from '@/components/fengshui/tools/ChiTuong';
import { BoiSim } from '@/components/fengshui/tools/BoiSim';
import { BatCucTool } from '@/components/fengshui/tools/BatCucTool';
import { MaiHoaDichSo } from '@/components/fengshui/tools/MaiHoaDichSo';
import { KhongMinhThanToan } from '@/components/fengshui/tools/KhongMinhThanToan';
import { LucHao } from '@/components/fengshui/tools/LucHao';
import { KinhDich64 } from '@/components/fengshui/tools/KinhDich64';
import { SinhCon } from '@/components/fengshui/tools/SinhCon';
import { LapLaSoTuVi } from '@/components/fengshui/tools/LapLaSoTuVi';
import { LuanGiaiTuVi } from '@/components/fengshui/tools/LuanGiaiTuVi';
import { XemHanNam } from '@/components/fengshui/tools/XemHanNam';
import { DaiVanHan } from '@/components/fengshui/tools/DaiVanHan';
import { NapAmNguHanh } from '@/components/fengshui/tools/NapAmNguHanh';
import { HopTuoiMenh } from '@/components/fengshui/tools/HopTuoiMenh';
import { BatTuHaLac } from '@/components/fengshui/tools/BatTuHaLac';
import { LapBatTu } from '@/components/fengshui/tools/LapBatTu';
import { TimDungThan } from '@/components/fengshui/tools/TimDungThan';
import { DoiAmDuong } from '@/components/fengshui/tools/DoiAmDuong';
import { GioHoangDao } from '@/components/fengshui/tools/GioHoangDao';
import { XuatHanh } from '@/components/fengshui/tools/XuatHanh';
import { LichDungSu } from '@/components/fengshui/tools/LichDungSu';
import { LichVanNien } from '@/components/fengshui/tools/LichVanNien';
import { NgayViaPhat } from '@/components/fengshui/tools/NgayViaPhat';
import { XinXamQuanAm } from '@/components/fengshui/tools/XinXamQuanAm';
import { XinXamTranTrieu } from '@/components/fengshui/tools/XinXamTranTrieu';
import { KinhTungThuongDung } from '@/components/fengshui/tools/KinhTungThuongDung';
import { KhoaTuAnCu } from '@/components/fengshui/tools/KhoaTuAnCu';
import { TraCuuKinh } from '@/components/fengshui/tools/TraCuuKinh';
import { VanKhanNghiLe } from '@/components/fengshui/tools/VanKhanNghiLe';
import { GiaoLyCanBan } from '@/components/fengshui/tools/GiaoLyCanBan';
import { PhapThoai } from '@/components/fengshui/tools/PhapThoai';
import { HoiDapPhatHoc } from '@/components/fengshui/tools/HoiDapPhatHoc';
import { HePhaiTongMon } from '@/components/fengshui/tools/HePhaiTongMon';
import { DanhTangCaoTang } from '@/components/fengshui/tools/DanhTangCaoTang';
import { isPhapThoaiRelatedEvent } from '@/lib/fengshui/phap-thoai';
import type { TempleEvent, TempleVideo } from '@/types/database';

interface Props {
  params: Promise<{ tool: string }>;
}

export function generateStaticParams() {
  return toolsWithOwnPage().map((t) => ({ tool: t.slug }));
}

export default async function ToolPage({ params }: Props) {
  const { tool } = await params;
  const meta = getToolMeta(tool);
  if (!meta) notFound();
  if (meta.href) redirect(meta.href);

  const temple = await getCurrentTemple();
  if (!temple) return null;

  const primary = temple.primary_color || '#7A1F1F';

  let khoaTuEvents: TempleEvent[] = [];
  let phapThoaiEvents: TempleEvent[] = [];
  if (
    meta.status === 'ready' &&
    (tool === 'khoa-tu-an-cu' || tool === 'phap-thoai')
  ) {
    const upcoming = await getUpcomingTempleEvents(temple.id);
    if (tool === 'khoa-tu-an-cu') {
      khoaTuEvents = upcoming.filter((ev) => ev.event_type === 'khoa_tu');
    }
    if (tool === 'phap-thoai') {
      phapThoaiEvents = upcoming.filter((ev) =>
        isPhapThoaiRelatedEvent(ev.event_type, ev.title),
      );
    }
  }

  // Kho sim chỉ mở trên site Lý Gia Phúc An
  const isLyGia = isLyGiaPhucAnSite(temple);
  const suggestedSims =
    isLyGia && tool === 'boi-sim' ? await getFeaturedSims(temple.id, 6) : [];

  const persona = getSitePersona(temple);

  return (
    <ToolShell tool={meta} primaryColor={primary}>
      <SitePersonaProvider persona={persona}>
        {meta.status === 'coming_soon' ? (
          <ComingSoonPanel
            tool={meta}
            primaryColor={primary}
            advisorTitle={
              persona.upsell === 'sim' ? persona.displayName : 'Trụ trì'
            }
          />
        ) : (
          renderTool(tool, primary, temple, khoaTuEvents, phapThoaiEvents)
        )}
      </SitePersonaProvider>

      {suggestedSims.length > 0 ? (
        <section className="mt-10 border border-fog bg-paper p-5 md:p-6">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <div>
              <p className="text-[0.68rem] uppercase tracking-[0.25em]" style={{ color: primary }}>
                Kho sim thầy tuyển
              </p>
              <p className="mt-1 font-display text-xl text-ink">
                Xem xong luận giải — chọn luôn số điểm cao trong kho
              </p>
              <p className="mt-1 text-xs text-muted">
                Các số dưới đây đã được chấm điểm bằng đúng thuật toán Bát Cực của công
                cụ này. Đặt mua online, thanh toán QR, thầy chọn ngày kích sim.
              </p>
            </div>
            <Link
              href="/sim"
              className="shrink-0 px-4 py-2 text-xs font-semibold text-white"
              style={{ backgroundColor: primary }}
            >
              Vào kho sim →
            </Link>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3">
            {suggestedSims.map((sim) => (
              <SimCard key={sim.id} sim={sim} />
            ))}
          </div>
        </section>
      ) : null}

      {isLyGia && tool !== 'boi-sim' ? (
        <Link
          href="/sim"
          className="mt-10 flex flex-wrap items-center justify-between gap-2 border px-4 py-3 text-sm transition-colors hover:bg-mist"
          style={{ borderColor: `${primary}55` }}
        >
          <span className="text-ink">
            <span className="font-semibold" style={{ color: primary }}>
              Sim phong thủy:
            </span>{' '}
            nhập ngày giờ sinh, hệ thống chấm % hợp mệnh từng số trong kho.
          </span>
          <span className="text-xs font-semibold" style={{ color: primary }}>
            Tìm số hợp mệnh →
          </span>
        </Link>
      ) : null}
    </ToolShell>
  );
}

function renderTool(
  slug: string,
  primary: string,
  temple: {
    id: string;
    name: string;
    address: string | null;
    hotline: string | null;
    videos?: TempleVideo[];
    abbott_name?: string | null;
    abbott_title?: string | null;
    abbott_bio?: string | null;
    abbott_image_url?: string | null;
    contact_links: {
      phone: string | null;
      zalo: string | null;
      facebook: string | null;
      youtube: string | null;
    };
  },
  khoaTuEvents: TempleEvent[] = [],
  phapThoaiEvents: TempleEvent[] = [],
) {
  const templeName = temple.name;
  const templeId = temple.id;
  switch (slug) {
    case 'lich-van-nien':
      return <LichVanNien primaryColor={primary} />;
    case 'doi-am-duong':
      return <DoiAmDuong primaryColor={primary} />;
    case 'gio-hoang-dao':
      return <GioHoangDao primaryColor={primary} />;
    case 'xuat-hanh':
      return <XuatHanh primaryColor={primary} />;
    case 'lich-dung-su':
      return <LichDungSu primaryColor={primary} />;
    case 'ngay-via-phat':
      return <NgayViaPhat primaryColor={primary} />;
    case 'kinh-tung-thuong-dung':
      return <KinhTungThuongDung primaryColor={primary} />;
    case 'khoa-tu-an-cu':
      return (
        <KhoaTuAnCu
          primaryColor={primary}
          templeName={templeName}
          events={khoaTuEvents}
        />
      );
    case 'tra-cuu-kinh':
      return <TraCuuKinh primaryColor={primary} />;
    case 'van-khan-nghi-le':
      return (
        <VanKhanNghiLe primaryColor={primary} templeName={templeName} />
      );
    case 'giao-ly-can-ban':
      return <GiaoLyCanBan primaryColor={primary} />;
    case 'phap-thoai':
      return (
        <PhapThoai
          primaryColor={primary}
          templeName={templeName}
          events={phapThoaiEvents}
          videos={temple.videos ?? []}
          youtubeUrl={temple.contact_links.youtube}
          facebookUrl={temple.contact_links.facebook}
        />
      );
    case 'hoi-dap-phat-hoc':
      return (
        <HoiDapPhatHoc
          primaryColor={primary}
          templeName={templeName}
          hotline={temple.hotline}
          zaloUrl={temple.contact_links.zalo}
        />
      );
    case 'he-phai-tong-mon':
      return <HePhaiTongMon primaryColor={primary} />;
    case 'danh-tang-cao-tang':
      return (
        <DanhTangCaoTang
          primaryColor={primary}
          templeName={templeName}
          abbottName={temple.abbott_name}
          abbottTitle={temple.abbott_title}
          abbottBio={temple.abbott_bio}
          abbottImageUrl={temple.abbott_image_url}
        />
      );
    case 'gieo-que-xin-xam':
      return (
        <XinXamQuanAm
          primaryColor={primary}
          templeName={templeName}
          templeId={templeId}
        />
      );
    case 'tran-trieu-than-ung':
      return <XinXamTranTrieu primaryColor={primary} />;
    case 'dong-tho':
      return <DongTho primaryColor={primary} />;
    case 'muon-tuoi-lam-nha':
      return <MuonTuoiLamNha primaryColor={primary} />;
    case 'khoi-cong':
      return (
        <ChonNgayTool
          primaryColor={primary}
          activityId="khoi_cong"
          yearRuleset="full"
          persons={[{ key: 'gia_chu', label: 'Gia chủ', defaultYear: 1985 }]}
          intro="Xét luật năm của gia chủ (Kim Lâu, Hoang Ốc, Tam Tai, xung năm) rồi quét lịch tìm ngày động thổ tốt theo nhật lịch, bách kỵ dân gian và xung tuổi, kèm giờ hoàng đạo."
        />
      );
    case 'nhap-trach':
      return (
        <ChonNgayTool
          primaryColor={primary}
          activityId="nhap_trach"
          yearRuleset="full"
          persons={[
            { key: 'gia_chu', label: 'Gia chủ', defaultYear: 1985 },
            { key: 'vo_chong', label: 'Vợ / chồng gia chủ', optional: true },
          ]}
          intro="Tìm ngày về nhà mới: nhật lịch nên Nhập trạch / Di chuyển nhà, tránh Dương công kỵ nhật và ngày xung tuổi cả hai vợ chồng, kèm giờ tốt để dọn vào."
        />
      );
    case 'khai-truong':
      return (
        <ChonNgayTool
          primaryColor={primary}
          activityId="khai_truong"
          yearRuleset="basic"
          persons={[
            { key: 'chu_su', label: 'Người đứng đầu công ty', defaultYear: 1985 },
          ]}
          intro="Tìm ngày khai trương công ty: nhật lịch nên Khai trương / Giao dịch / Lập khế, kết hợp Hoàng đạo, tránh Tam nương, Sát chủ và ngày xung tuổi người đứng đầu."
        />
      );
    case 'mo-cua-hang':
      return (
        <ChonNgayTool
          primaryColor={primary}
          activityId="mo_cua_hang"
          yearRuleset="basic"
          persons={[
            { key: 'chu_cua_hang', label: 'Chủ cửa hàng', defaultYear: 1985 },
          ]}
          intro="Tìm ngày mở cửa hàng, mở hàng đầu năm: nhật lịch nên Khai trương / Giao dịch / Nạp tài, ưu tiên ngày Hoàng đạo, tránh Nguyệt kỵ, Tam nương và ngày xung tuổi chủ cửa hàng."
        />
      );
    case 'huong-nha':
      return <HuongNha primaryColor={primary} />;
    case 'cuoi-hoi':
      return <CuoiHoi primaryColor={primary} />;
    case 'ma-chay':
      return <MaChay primaryColor={primary} />;
    case 'trung-tang':
      return <TrungTang primaryColor={primary} />;
    case 'cai-tang':
      return <CaiTang primaryColor={primary} />;
    case 'sao-chieu-menh':
      return <SaoChieuMenh primaryColor={primary} />;
    case 'than-so-hoc':
      return <ThanSoHoc primaryColor={primary} />;
    case 'danh-gia-tinh-danh':
      return <DanhGiaTinhDanh primaryColor={primary} />;
    case 'nhan-tuong':
      return <NhanTuong primaryColor={primary} />;
    case 'chi-tuong':
      return <ChiTuong primaryColor={primary} />;
    case 'boi-sim':
      return (
        <BoiSim
          primaryColor={primary}
          templeId={templeId}
          templeName={templeName}
          templeHotline={temple.hotline}
          templePhone={temple.contact_links.phone}
        />
      );
    case 'so-tai-khoan':
    case 'so-nha':
    case 'bien-so-xe':
    case 'so-can-cuoc':
    case 'so-the-atm':
    case 'ma-so-thue':
    case 'ma-nhan-vien':
    case 'so-phong-lam-viec':
    case 'gia-niem-yet':
    case 'ngay-sinh-linh-so':
    case 'ngay-gio-su-kien':
    case 'mat-khau-ma-pin':
    case 'so-thu-tu-ghe': {
      const topicBySlug = {
        'so-tai-khoan': 'tai_khoan',
        'so-nha': 'so_nha',
        'bien-so-xe': 'bien_so',
        'so-can-cuoc': 'can_cuoc',
        'so-the-atm': 'the_atm',
        'ma-so-thue': 'ma_so_thue',
        'ma-nhan-vien': 'ma_nhan_vien',
        'so-phong-lam-viec': 'so_phong',
        'gia-niem-yet': 'gia_ban',
        'ngay-sinh-linh-so': 'ngay_sinh',
        'ngay-gio-su-kien': 'su_kien',
        'mat-khau-ma-pin': 'mat_khau',
        'so-thu-tu-ghe': 'so_ghe',
      } as const;
      return (
        <BatCucTool
          topic={topicBySlug[slug]}
          primaryColor={primary}
          templeId={templeId}
          templeName={templeName}
          templeHotline={temple.hotline}
          templePhone={temple.contact_links.phone}
        />
      );
    }
    case 'mai-hoa-dich-so':
      return <MaiHoaDichSo primaryColor={primary} />;
    case 'khong-minh-than-toan':
      return <KhongMinhThanToan primaryColor={primary} />;
    case 'luc-hao':
      return <LucHao primaryColor={primary} />;
    case '64-que-kinh-dich':
      return (
        <KinhDich64
          primaryColor={primary}
          templeName={templeName}
          templeId={templeId}
        />
      );
    case 'sinh-con':
      return <SinhCon primaryColor={primary} />;
    case 'lap-la-so-tu-vi':
      return (
        <LapLaSoTuVi
          primaryColor={primary}
          templeId={templeId}
          templeName={templeName}
          templeAddress={temple.address}
          templeHotline={temple.hotline}
          templePhone={temple.contact_links.phone}
          templeAbbottName={temple.abbott_name}
        />
      );
    case 'luan-giai-tu-vi':
      return (
        <LuanGiaiTuVi
          primaryColor={primary}
          templeId={templeId}
          templeName={templeName}
          templeAddress={temple.address}
          templeHotline={temple.hotline}
          templePhone={temple.contact_links.phone}
          templeZalo={temple.contact_links.zalo}
          templeFacebook={temple.contact_links.facebook}
        />
      );
    case 'xem-han-nam':
      return (
        <XemHanNam
          primaryColor={primary}
          templeId={templeId}
          templeName={templeName}
          templeHotline={temple.hotline}
          templePhone={temple.contact_links.phone}
        />
      );
    case 'dai-van-han':
      return (
        <DaiVanHan
          primaryColor={primary}
          templeId={templeId}
          templeName={templeName}
          templeHotline={temple.hotline}
          templePhone={temple.contact_links.phone}
        />
      );
    case 'nap-am-ngu-hanh':
      return (
        <NapAmNguHanh
          primaryColor={primary}
          templeId={templeId}
          templeName={templeName}
          templeHotline={temple.hotline}
          templePhone={temple.contact_links.phone}
        />
      );
    case 'hop-tuoi-menh':
      return (
        <HopTuoiMenh
          primaryColor={primary}
          templeId={templeId}
          templeName={templeName}
          templeHotline={temple.hotline}
          templePhone={temple.contact_links.phone}
        />
      );
    case 'lap-bat-tu':
      return (
        <LapBatTu
          primaryColor={primary}
          templeId={templeId}
          templeName={templeName}
          templeHotline={temple.hotline}
          templePhone={temple.contact_links.phone}
        />
      );
    case 'bat-tu-ha-lac':
      return (
        <BatTuHaLac
          primaryColor={primary}
          templeId={templeId}
          templeName={templeName}
          templeHotline={temple.hotline}
          templePhone={temple.contact_links.phone}
        />
      );
    case 'tim-dung-than':
      return (
        <TimDungThan
          primaryColor={primary}
          templeId={templeId}
          templeName={templeName}
          templeHotline={temple.hotline}
          templePhone={temple.contact_links.phone}
        />
      );
    default:
      return null;
  }
}
