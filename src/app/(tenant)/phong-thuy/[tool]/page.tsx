import { notFound, redirect } from 'next/navigation';
import { getCurrentTemple } from '@/lib/tenant';
import { getUpcomingTempleEvents } from '@/lib/temple-events';
import {
  getToolMeta,
  toolsWithOwnPage,
} from '@/lib/fengshui/tools';
import { ToolShell } from '@/components/fengshui/ToolShell';
import { ComingSoonPanel } from '@/components/fengshui/ComingSoonPanel';
import { DongTho } from '@/components/fengshui/tools/DongTho';
import { MuonTuoiLamNha } from '@/components/fengshui/tools/MuonTuoiLamNha';
import { DateVerdictTool } from '@/components/fengshui/tools/DateVerdictTool';
import { HuongNha } from '@/components/fengshui/tools/HuongNha';
import { CuoiHoi } from '@/components/fengshui/tools/CuoiHoi';
import { MaChay } from '@/components/fengshui/tools/MaChay';
import { TrungTang } from '@/components/fengshui/tools/TrungTang';
import { CaiTang } from '@/components/fengshui/tools/CaiTang';
import { SaoChieuMenh } from '@/components/fengshui/tools/SaoChieuMenh';
import { ThanSoHoc } from '@/components/fengshui/tools/ThanSoHoc';
import { DanhGiaTinhDanh } from '@/components/fengshui/tools/DanhGiaTinhDanh';
import { BoiSim } from '@/components/fengshui/tools/BoiSim';
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
import { KinhTungThuongDung } from '@/components/fengshui/tools/KinhTungThuongDung';
import { KhoaTuAnCu } from '@/components/fengshui/tools/KhoaTuAnCu';
import { TraCuuKinh } from '@/components/fengshui/tools/TraCuuKinh';
import { VanKhanNghiLe } from '@/components/fengshui/tools/VanKhanNghiLe';
import type { TempleEvent } from '@/types/database';

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
  if (tool === 'khoa-tu-an-cu' && meta.status === 'ready') {
    const upcoming = await getUpcomingTempleEvents(temple.id);
    khoaTuEvents = upcoming.filter((ev) => ev.event_type === 'khoa_tu');
  }

  return (
    <ToolShell tool={meta} primaryColor={primary}>
      {meta.status === 'coming_soon' ? (
        <ComingSoonPanel tool={meta} primaryColor={primary} />
      ) : (
        renderTool(tool, primary, temple, khoaTuEvents)
      )}
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
    contact_links: {
      phone: string | null;
      zalo: string | null;
      facebook: string | null;
    };
  },
  khoaTuEvents: TempleEvent[] = [],
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
    case 'gieo-que-xin-xam':
      return (
        <XinXamQuanAm
          primaryColor={primary}
          templeName={templeName}
          templeId={templeId}
        />
      );
    case 'dong-tho':
      return <DongTho primaryColor={primary} />;
    case 'muon-tuoi-lam-nha':
      return <MuonTuoiLamNha primaryColor={primary} />;
    case 'khoi-cong':
      return (
        <DateVerdictTool
          primaryColor={primary}
          actionLabel="Kiểm tra ngày khởi công"
          yearRuleset="full"
        />
      );
    case 'nhap-trach':
      return (
        <DateVerdictTool
          primaryColor={primary}
          actionLabel="Kiểm tra ngày nhập trạch"
          yearRuleset="full"
        />
      );
    case 'khai-truong':
      return (
        <DateVerdictTool
          primaryColor={primary}
          actionLabel="Kiểm tra ngày khai trương"
          yearRuleset="basic"
        />
      );
    case 'mo-cua-hang':
      return (
        <DateVerdictTool
          primaryColor={primary}
          actionLabel="Kiểm tra ngày mở cửa hàng"
          yearRuleset="basic"
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
    case 'boi-sim':
      return <BoiSim primaryColor={primary} />;
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
          templeZalo={temple.contact_links.zalo}
          templeFacebook={temple.contact_links.facebook}
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
