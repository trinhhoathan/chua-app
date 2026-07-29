/**
 * Seed admin accounts (phone + 6-digit PIN) into Supabase Auth + temple_admins.
 *
 * Usage:
 *   node --env-file=.env.local scripts/seed-admin-users.mjs
 *
 * Env overrides (optional):
 *   SUPER_ADMIN_PHONE=09xxxxxxxx
 *   SUPER_ADMIN_PASSWORD=100001
 *   BAC_HONG_ADMIN_PASSWORD=926011
 */
import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error('Thiếu NEXT_PUBLIC_SUPABASE_URL hoặc SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const admin = createClient(url, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const PHONE_DOMAIN = 'phone.chua.app';
const BAC_HONG_ID = 'a146d06d-8a26-45e4-863d-c90cb26c9ecd';

const ACCOUNTS = [
  {
    key: 'super',
    phone: process.env.SUPER_ADMIN_PHONE || '0901000001',
    password: process.env.SUPER_ADMIN_PASSWORD || '100001',
    displayName: 'Quản trị viên nền tảng',
    templeId: BAC_HONG_ID,
    role: 'admin',
    isSuperAdmin: true,
  },
  {
    key: 'bac-hong',
    phone: '0981666568',
    password: process.env.BAC_HONG_ADMIN_PASSWORD || '926011',
    displayName: 'Thượng tọa Thích Quảng Trang',
    templeId: BAC_HONG_ID,
    role: 'admin',
    isSuperAdmin: false,
  },
];

function normalizePhone(raw) {
  const digits = String(raw).replace(/[^\d]/g, '');
  let local = digits;
  if (local.startsWith('84') && local.length >= 11) local = `0${local.slice(2)}`;
  if (local.length === 9) local = `0${local}`;
  if (!/^0\d{9}$/.test(local)) {
    throw new Error(`SĐT không hợp lệ: ${raw}`);
  }
  return local;
}

function phoneEmail(phone) {
  return `${phone}@${PHONE_DOMAIN}`;
}

async function findUserByEmail(email) {
  const perPage = 200;
  let page = 1;
  for (;;) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage });
    if (error) throw error;
    const found = data.users.find(
      (u) => (u.email || '').toLowerCase() === email.toLowerCase(),
    );
    if (found) return found;
    if (data.users.length < perPage) return null;
    page += 1;
  }
}

async function upsertAccount(acc) {
  const phone = normalizePhone(acc.phone);
  const email = phoneEmail(phone);

  let user = await findUserByEmail(email);
  if (!user) {
    const { data, error } = await admin.auth.admin.createUser({
      email,
      password: acc.password,
      email_confirm: true,
      user_metadata: {
        phone,
        display_name: acc.displayName,
      },
    });
    if (error) throw error;
    user = data.user;
    console.log(`✓ Tạo Auth user ${phone}`);
  } else {
    const { error } = await admin.auth.admin.updateUserById(user.id, {
      password: acc.password,
      email_confirm: true,
      user_metadata: {
        ...(user.user_metadata || {}),
        phone,
        display_name: acc.displayName,
      },
    });
    if (error) throw error;
    console.log(`✓ Cập nhật Auth user ${phone}`);
  }

  const { data: existing } = await admin
    .from('temple_admins')
    .select('id')
    .eq('user_id', user.id)
    .eq('temple_id', acc.templeId)
    .maybeSingle();

  const row = {
    user_id: user.id,
    temple_id: acc.templeId,
    role: acc.role,
    display_name: acc.displayName,
    phone,
    is_super_admin: acc.isSuperAdmin,
    is_active: true,
  };

  if (existing?.id) {
    const { error } = await admin
      .from('temple_admins')
      .update(row)
      .eq('id', existing.id);
    if (error) throw error;
    console.log(`✓ Cập nhật temple_admins ${acc.displayName}`);
  } else {
    const { error } = await admin.from('temple_admins').insert(row);
    if (error) throw error;
    console.log(`✓ Gắn temple_admins ${acc.displayName}`);
  }

  return { phone, password: acc.password, displayName: acc.displayName, isSuperAdmin: acc.isSuperAdmin };
}

async function updateBacHongTemple() {
  const { data: current, error: readErr } = await admin
    .from('temples')
    .select('contact_links')
    .eq('id', BAC_HONG_ID)
    .maybeSingle();
  if (readErr) throw readErr;

  const prev =
    current?.contact_links && typeof current.contact_links === 'object'
      ? current.contact_links
      : {};

  const contact_links = {
    ...prev,
    phone: '0981666568',
    zalo: 'https://zalo.me/0981666568',
    facebook: 'https://www.facebook.com/QuangTrangThich',
  };

  const { error } = await admin
    .from('temples')
    .update({
      abbott_name: 'Thượng tọa Thích Quảng Trang',
      abbott_title: 'Trụ trì Chùa Quan Âm Bắc Hồng',
      abbott_bio:
        'Thượng tọa Thích Quảng Trang hiện trụ trì Chùa Quan Âm Bắc Hồng, phụng sự Tăng đoàn và Phật tử làng Quan Âm. Thầy chăm lo đời sống tâm linh bà con, tổ chức khóa tu, lễ cầu an — cầu siêu và gắn kết Phật sự với truyền thống văn hóa làng quê Đông Anh.',
      hotline: '0981666568',
      contact_links,
      updated_at: new Date().toISOString(),
    })
    .eq('id', BAC_HONG_ID);

  if (error) throw error;
  console.log('✓ Cập nhật thông tin Chùa Quan Âm Bắc Hồng (trụ trì + liên hệ)');
}

async function main() {
  await updateBacHongTemple();
  const created = [];
  for (const acc of ACCOUNTS) {
    created.push(await upsertAccount(acc));
  }

  console.log('\n=== Tài khoản đăng nhập /quan-tri ===');
  for (const c of created) {
    console.log(
      `${c.isSuperAdmin ? '[SUPER]' : '[TRỤ TRÌ]'} ${c.displayName}\n  SĐT: ${c.phone}\n  PIN: ${c.password}\n`,
    );
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
