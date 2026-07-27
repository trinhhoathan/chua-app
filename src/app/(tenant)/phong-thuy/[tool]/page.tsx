import { notFound } from 'next/navigation';
import { getCurrentTemple } from '@/lib/tenant';
import { FENGSHUI_TOOLS, getToolMeta } from '@/lib/fengshui/tools';
import { ToolShell } from '@/components/fengshui/ToolShell';
import { DongTho } from '@/components/fengshui/tools/DongTho';
import { DateVerdictTool } from '@/components/fengshui/tools/DateVerdictTool';
import { HuongNha } from '@/components/fengshui/tools/HuongNha';
import { CuoiHoi } from '@/components/fengshui/tools/CuoiHoi';
import { MaChay } from '@/components/fengshui/tools/MaChay';
import { TrungTang } from '@/components/fengshui/tools/TrungTang';
import { SinhCon } from '@/components/fengshui/tools/SinhCon';

interface Props {
  params: Promise<{ tool: string }>;
}

export function generateStaticParams() {
  return FENGSHUI_TOOLS.map((t) => ({ tool: t.slug }));
}

export default async function ToolPage({ params }: Props) {
  const { tool } = await params;
  const meta = getToolMeta(tool);
  if (!meta) notFound();
  const temple = await getCurrentTemple();
  if (!temple) return null;

  const primary = temple.primary_color || '#7A1F1F';

  return (
    <ToolShell tool={meta} primaryColor={primary}>
      {renderTool(tool, primary)}
    </ToolShell>
  );
}

function renderTool(slug: string, primary: string) {
  switch (slug) {
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
    default:
      return null;
  }
}
