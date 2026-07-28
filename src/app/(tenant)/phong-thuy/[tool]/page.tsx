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
import { DateVerdictTool } from '@/components/fengshui/tools/DateVerdictTool';
import { HuongNha } from '@/components/fengshui/tools/HuongNha';
import { CuoiHoi } from '@/components/fengshui/tools/CuoiHoi';
import { MaChay } from '@/components/fengshui/tools/MaChay';
import { TrungTang } from '@/components/fengshui/tools/TrungTang';
import { SinhCon } from '@/components/fengshui/tools/SinhCon';
import { LapLaSoTuVi } from '@/components/fengshui/tools/LapLaSoTuVi';
import { DoiAmDuong } from '@/components/fengshui/tools/DoiAmDuong';
import { GioHoangDao } from '@/components/fengshui/tools/GioHoangDao';
import { LichVanNien } from '@/components/fengshui/tools/LichVanNien';
import { NgayViaPhat } from '@/components/fengshui/tools/NgayViaPhat';
import { XinXamQuanAm } from '@/components/fengshui/tools/XinXamQuanAm';
import { KinhTungThuongDung } from '@/components/fengshui/tools/KinhTungThuongDung';
import { KhoaTuAnCu } from '@/components/fengshui/tools/KhoaTuAnCu';
import { TraCuuKinh } from '@/components/fengshui/tools/TraCuuKinh';
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
    default:
      return null;
  }
}
