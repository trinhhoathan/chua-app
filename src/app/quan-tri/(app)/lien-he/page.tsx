import { requireAdmin, searchTemples } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { normalizeContactLinks } from '@/lib/contact-links';
import { resolveTempleScope } from '@/lib/temple-scope';
import { TempleRequiredNotice } from '@/components/admin/TempleRequiredNotice';
import { ContactLinksForm } from './ContactLinksForm';

interface Props {
  searchParams: Promise<{ temple?: string }>;
}

export default async function LienHePage({ searchParams }: Props) {
  const ctx = await requireAdmin();
  const sp = await searchParams;
  const scope = await resolveTempleScope(ctx, sp.temple);
  const supabase = await createClient();

  let templeIds: string[] = [];
  if (scope.templeId) {
    templeIds = [scope.templeId];
  } else if (!ctx.isSuperAdmin) {
    templeIds = ctx.temples.map((t) => t.id);
  } else {
    const found = await searchTemples('', 30);
    templeIds = found.map((t) => t.id);
  }

  if (templeIds.length === 0) {
    return <TempleRequiredNotice feature="Liên hệ" />;
  }

  const { data } = await supabase
    .from('temples')
    .select('id, name, hotline, contact_links')
    .in('id', templeIds)
    .eq('is_active', true)
    .order('name');

  const temples = (data ?? []).map((t) => ({
    id: String(t.id),
    name: String(t.name),
    hotline: (t.hotline as string) ?? null,
    contact_links: normalizeContactLinks(
      t.contact_links,
      t.hotline as string | null,
    ),
  }));

  return (
    <div>
      <h1 className="font-display text-3xl text-ink">Liên hệ & MXH</h1>
      <p className="mt-2 text-sm text-muted max-w-2xl leading-relaxed">
        Trụ trì tự chọn kênh liên hệ muốn hiện trên website. Chỉ bật những nút
        cần dùng — tắt để ẩn. Số điện thoại hiện trên menu Hotline và icon gọi
        bên phải.
      </p>
      <div className="mt-8">
        <ContactLinksForm temples={temples} />
      </div>
    </div>
  );
}
