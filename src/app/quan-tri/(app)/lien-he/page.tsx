import { requireAdmin } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { normalizeContactLinks } from '@/lib/contact-links';
import { ContactLinksForm } from './ContactLinksForm';

export default async function LienHePage() {
  const ctx = await requireAdmin();
  const templeIds = ctx.temples.map((t) => t.id);
  if (templeIds.length === 0) return null;

  const supabase = await createClient();
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
    contact_links: normalizeContactLinks(t.contact_links, t.hotline as string | null),
  }));

  return (
    <div>
      <h1 className="font-display text-3xl text-ink">Liên hệ & MXH</h1>
      <p className="mt-2 text-sm text-muted max-w-2xl leading-relaxed">
        Trụ trì tự cập nhật số điện thoại liên hệ và các kênh mạng xã hội. Số
        điện thoại hiện trên menu Hotline và icon gọi bên phải website.
      </p>
      <div className="mt-8">
        <ContactLinksForm temples={temples} />
      </div>
    </div>
  );
}
