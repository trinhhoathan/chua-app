'use server';

import { revalidatePath, revalidateTag } from 'next/cache';
import { getAdminDb, requireAdmin } from '@/lib/auth';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import {
  DEFAULT_ADMIN_PIN,
  isNumericPin,
  normalizeLoginPhone,
  phoneToLoginEmail,
} from '@/lib/admin-phone-auth';
import { normalizeContactLinks } from '@/lib/contact-links';
import {
  buildTempleCreateRow,
  buildTempleDomainAliases,
  normalizeTempleDomain,
  pickRandomTempleColor,
} from '@/lib/temple-defaults';
import { setWorkingTempleAction } from '@/app/actions/temple-scope';
import type { TempleContactLinks } from '@/types/database';

async function requireSuperAdmin() {
  const ctx = await requireAdmin();
  if (!ctx.isSuperAdmin) throw new Error('FORBIDDEN');
  return ctx;
}

export type TempleActionResult =
  | { ok: true; templeId: string; warning?: string }
  | { ok: false; error: string };

type DbClient = Awaited<ReturnType<typeof getAdminDb>>;

async function assertDomainFree(
  db: DbClient,
  domain: string,
  exceptTempleId?: string,
): Promise<string | null> {
  const { data: byTemple } = await db
    .from('temples')
    .select('id')
    .eq('domain', domain)
    .maybeSingle();
  if (byTemple && byTemple.id !== exceptTempleId) {
    return `Domain «${domain}» đã được dùng bởi Phật tự khác.`;
  }

  const { data: byAlias } = await db
    .from('temple_domains')
    .select('temple_id')
    .eq('domain', domain)
    .maybeSingle();
  if (byAlias && byAlias.temple_id !== exceptTempleId) {
    return `Domain «${domain}» đã gắn với Phật tự khác.`;
  }
  return null;
}

function tryGetServiceAdmin() {
  try {
    return getSupabaseAdmin();
  } catch {
    return null;
  }
}

export async function createTempleAction(input: {
  name: string;
  domain: string;
  templeAltName?: string;
  paymentCode?: string;
  address?: string;
  abbottName?: string;
  abbottTitle?: string;
  hotline?: string;
  slogan?: string;
  tagline?: string;
  primaryColor?: string;
  zalo?: string;
  facebook?: string;
  createAbbottAccount?: boolean;
  abbottLoginPhone?: string;
  abbottPassword?: string;
}): Promise<TempleActionResult> {
  try {
    await requireSuperAdmin();
  } catch {
    return { ok: false, error: 'Chỉ SuperAdmin được tạo Phật tự.' };
  }

  const name = input.name.trim();
  if (name.length < 2) {
    return { ok: false, error: 'Tên Phật tự quá ngắn.' };
  }

  const domain = normalizeTempleDomain(input.domain);
  if (!domain) {
    return {
      ok: false,
      error: 'Domain không hợp lệ. Ví dụ: hoixa.com hoặc hoixa.localhost',
    };
  }

  const db = await getAdminDb();
  const taken = await assertDomainFree(db, domain);
  if (taken) return { ok: false, error: taken };

  for (const alias of buildTempleDomainAliases(domain)) {
    if (alias === domain) continue;
    const aliasTaken = await assertDomainFree(db, alias);
    if (aliasTaken) return { ok: false, error: aliasTaken };
  }

  const createAbbott = Boolean(input.createAbbottAccount);
  let loginPhone: string | null = null;
  let password = DEFAULT_ADMIN_PIN;

  if (createAbbott) {
    loginPhone = normalizeLoginPhone(input.abbottLoginPhone ?? '');
    if (!loginPhone) {
      return {
        ok: false,
        error: 'SĐT đăng nhập trụ trì không hợp lệ (10 số, bắt đầu bằng 0).',
      };
    }
    password = String(input.abbottPassword ?? '').trim() || DEFAULT_ADMIN_PIN;
    if (!isNumericPin(password)) {
      return { ok: false, error: 'Mật khẩu trụ trì phải đúng 6 chữ số.' };
    }
    const displayName = (input.abbottName ?? '').trim();
    if (displayName.length < 2) {
      return {
        ok: false,
        error: 'Cần tên trụ trì khi tạo tài khoản đăng nhập.',
      };
    }
    const { data: phoneTaken } = await db
      .from('temple_admins')
      .select('id')
      .eq('phone', loginPhone)
      .eq('is_active', true)
      .maybeSingle();
    if (phoneTaken) {
      return {
        ok: false,
        error: 'SĐT đăng nhập đã được gán cho tài khoản khác.',
      };
    }
  }

  const row = buildTempleCreateRow({
    name,
    domain,
    templeAltName: input.templeAltName,
    paymentCode: input.paymentCode,
    address: input.address,
    abbottName: input.abbottName,
    abbottTitle: input.abbottTitle,
    hotline: input.hotline || loginPhone,
    slogan: input.slogan,
    tagline: input.tagline,
    primaryColor: input.primaryColor || pickRandomTempleColor(),
    contactLinks: {
      zalo: input.zalo?.trim() || null,
      facebook: input.facebook?.trim() || null,
      phone: (input.hotline || loginPhone)?.trim() || null,
    },
  });

  const { data: inserted, error: insertErr } = await db
    .from('temples')
    .insert(row)
    .select('id')
    .single();

  if (insertErr || !inserted) {
    return {
      ok: false,
      error: insertErr?.message ?? 'Không tạo được Phật tự.',
    };
  }

  const templeId = String(inserted.id);
  const aliases = buildTempleDomainAliases(domain);
  const domainRows = aliases.map((d) => ({
    temple_id: templeId,
    domain: d,
    is_primary: d === domain,
  }));

  const { error: domErr } = await db.from('temple_domains').insert(domainRows);
  if (domErr) {
    await db.from('temples').delete().eq('id', templeId);
    return { ok: false, error: `Domain alias: ${domErr.message}` };
  }

  let warning: string | undefined;
  if (createAbbott && loginPhone) {
    const service = tryGetServiceAdmin();
    if (!service) {
      warning =
        'Phật tự đã tạo. Chưa tạo được tài khoản trụ trì vì thiếu SUPABASE_SERVICE_ROLE_KEY — thêm key vào .env.local rồi tạo ở mục Thành viên.';
    } else {
      const displayName = (input.abbottName ?? '').trim();
      const email = phoneToLoginEmail(loginPhone);
      const { data: created, error: createErr } =
        await service.auth.admin.createUser({
          email,
          password,
          email_confirm: true,
          user_metadata: {
            phone: loginPhone,
            display_name: displayName,
          },
        });

      if (createErr || !created.user) {
        warning = `Phật tự đã tạo nhưng chưa tạo được tài khoản trụ trì: ${createErr?.message ?? 'lỗi Auth'}.`;
      } else {
        const { error: linkErr } = await db.from('temple_admins').insert({
          user_id: created.user.id,
          temple_id: templeId,
          role: 'admin',
          display_name: displayName,
          phone: loginPhone,
          is_super_admin: false,
          is_active: true,
        });
        if (linkErr) {
          await service.auth.admin.deleteUser(created.user.id);
          warning = `Phật tự đã tạo nhưng gắn quyền trụ trì lỗi: ${linkErr.message}`;
        }
      }
    }
  }

  await setWorkingTempleAction(templeId);
  revalidateTag('temples', 'max');
  revalidatePath('/quan-tri/chua');
  revalidatePath('/quan-tri');
  revalidatePath('/quan-tri/thanh-vien');

  return { ok: true, templeId, warning };
}

export async function getTempleBasicsAction(templeId: string): Promise<
  | {
      ok: true;
      temple: {
        id: string;
        name: string;
        domain: string;
        temple_alt_name: string | null;
        payment_code: string | null;
        address: string | null;
        abbott_name: string | null;
        abbott_title: string | null;
        hotline: string | null;
        slogan: string | null;
        tagline: string | null;
        primary_color: string | null;
        is_active: boolean;
        contact_links: TempleContactLinks;
        bank_name: string | null;
        bank_bin: string | null;
        bank_account_number: string | null;
        bank_account_holder: string | null;
      };
    }
  | { ok: false; error: string }
> {
  try {
    await requireSuperAdmin();
  } catch {
    return { ok: false, error: 'Không có quyền.' };
  }

  const db = await getAdminDb();
  const { data, error } = await db
    .from('temples')
    .select(
      'id, name, domain, temple_alt_name, payment_code, address, abbott_name, abbott_title, hotline, slogan, tagline, primary_color, is_active, contact_links, bank_name, bank_bin, bank_account_number, bank_account_holder',
    )
    .eq('id', templeId)
    .maybeSingle();

  if (error || !data) {
    return { ok: false, error: error?.message ?? 'Không tìm thấy Phật tự.' };
  }

  return {
    ok: true,
    temple: {
      id: String(data.id),
      name: String(data.name),
      domain: String(data.domain),
      temple_alt_name: (data.temple_alt_name as string) ?? null,
      payment_code: (data.payment_code as string) ?? null,
      address: (data.address as string) ?? null,
      abbott_name: (data.abbott_name as string) ?? null,
      abbott_title: (data.abbott_title as string) ?? null,
      hotline: (data.hotline as string) ?? null,
      slogan: (data.slogan as string) ?? null,
      tagline: (data.tagline as string) ?? null,
      primary_color: (data.primary_color as string) ?? null,
      is_active: Boolean(data.is_active),
      contact_links: normalizeContactLinks(
        data.contact_links,
        data.hotline as string | null,
      ),
      bank_name: (data.bank_name as string) ?? null,
      bank_bin: (data.bank_bin as string) ?? null,
      bank_account_number: (data.bank_account_number as string) ?? null,
      bank_account_holder: (data.bank_account_holder as string) ?? null,
    },
  };
}

export async function updateTempleBasicsAction(input: {
  id: string;
  name: string;
  domain: string;
  templeAltName?: string;
  paymentCode?: string;
  address?: string;
  abbottName?: string;
  abbottTitle?: string;
  hotline?: string;
  slogan?: string;
  tagline?: string;
  primaryColor?: string;
  zalo?: string;
  facebook?: string;
  isActive?: boolean;
  bankName?: string;
  bankBin?: string;
  bankAccountNumber?: string;
  bankAccountHolder?: string;
}): Promise<TempleActionResult> {
  try {
    await requireSuperAdmin();
  } catch {
    return { ok: false, error: 'Chỉ SuperAdmin được sửa Phật tự.' };
  }

  const name = input.name.trim();
  if (name.length < 2) return { ok: false, error: 'Tên Phật tự quá ngắn.' };

  const domain = normalizeTempleDomain(input.domain);
  if (!domain) {
    return { ok: false, error: 'Domain không hợp lệ.' };
  }

  const db = await getAdminDb();
  const taken = await assertDomainFree(db, domain, input.id);
  if (taken) return { ok: false, error: taken };

  const { data: existing } = await db
    .from('temples')
    .select('contact_links, hotline')
    .eq('id', input.id)
    .maybeSingle();

  const hotline = input.hotline?.trim() || null;
  const prev = normalizeContactLinks(
    existing?.contact_links,
    (existing?.hotline as string) ?? null,
  );
  const links = normalizeContactLinks(
    {
      ...prev,
      zalo: input.zalo?.trim() || null,
      facebook: input.facebook?.trim() || null,
      phone: hotline,
    },
    hotline,
  );

  const { error } = await db
    .from('temples')
    .update({
      name,
      domain,
      temple_alt_name: input.templeAltName?.trim() || null,
      payment_code:
        input.paymentCode?.trim().toUpperCase().slice(0, 4) || null,
      address: input.address?.trim() || null,
      abbott_name: input.abbottName?.trim() || null,
      abbott_title: input.abbottTitle?.trim() || null,
      hotline,
      slogan: input.slogan?.trim() || null,
      tagline: input.tagline?.trim() || null,
      primary_color: input.primaryColor?.trim() || pickRandomTempleColor(),
      contact_links: links,
      is_active: input.isActive !== false,
      bank_name: input.bankName?.trim() || null,
      bank_bin: input.bankBin?.replace(/\D/g, '') || null,
      bank_account_number:
        input.bankAccountNumber?.replace(/\s+/g, '') || null,
      bank_account_holder:
        input.bankAccountHolder?.trim().toUpperCase() || null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', input.id);

  if (error) return { ok: false, error: error.message };

  await db.from('temple_domains').upsert(
    {
      temple_id: input.id,
      domain,
      is_primary: true,
    },
    { onConflict: 'domain' },
  );

  revalidateTag('temples', 'max');
  revalidatePath('/quan-tri/chua');
  revalidatePath('/quan-tri');
  revalidatePath(`/quan-tri/chua/${input.id}/sua`);

  return { ok: true, templeId: input.id };
}
