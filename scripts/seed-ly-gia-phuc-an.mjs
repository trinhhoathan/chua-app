/**
 * Seed website Phong thủy Lý Gia Phúc An + domain aliases + tài khoản quản trị.
 *
 * Usage:
 *   node --env-file=.env.local scripts/seed-ly-gia-phuc-an.mjs
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
const PHONE = '0941391386';
const PIN = '123456';
const PRIMARY_DOMAIN = 'lygiaphucan.com';

const BIO = `Với hơn hai thập niên nghiên cứu và hành nghề, thầy Lý Gia Phúc An chuyên tư vấn phong thủy nhà ở, không gian làm việc và luận giải vận mệnh theo Bát Tự — kết hợp lý số Đông phương với ứng dụng thực tế cho từng hoàn cảnh.

Thầy đã đồng hành cùng nhiều gia chủ và doanh nghiệp tại Việt Nam, đồng thời tham gia các dự án tư vấn ở Singapore, Hong Kong, London, Paris, California và Melbourne. Phương châm xuyên suốt: phong thủy không phải mê tín, mà là khoa học của không gian và thời vận — phục vụ bằng sự tận tâm và chỉn chu.

Các dịch vụ gồm kiến tạo vận mệnh & không gian, thiết kế chìa khóa trao tay, cải vận qua phong thủy, sim Bát Tự và đặt tên thương hiệu. Mỗi hạng mục hướng tới giải pháp rõ ràng, phù hợp mệnh chủ và mục tiêu sử dụng.`;

const HISTORY = `Lý Gia Phúc An là không gian tư vấn phong thủy chuyên nghiệp tại Hà Nội, kết hợp lý số Đông phương với thực tiễn kiến trúc và không gian đương đại.

Văn phòng tại 52 Nguyễn Văn Cừ, Bồ Đề tiếp đón gia chủ, doanh nghiệp và học viên: xem nhà cửa, luận hướng hợp – không hợp, chọn sim Bát Tự, đặt tên thương hiệu, và các khóa học phong thủy thực chiến.`;

const FEATURES = [
  {
    title: 'Xem nhà · hướng hợp – không hợp',
    body: 'Khảo sát hiện trạng, luận nên mua / không nên mua, hóa giải sát khí và khai thông sinh khí.',
  },
  {
    title: 'Thiết kế chìa khóa trao tay',
    body: 'Đồng hành từ bản vẽ đến hoàn thiện theo mệnh chủ và ngũ hành nội thất.',
  },
  {
    title: 'Sim Bát Tự phong thủy',
    body: 'Tuyển chọn dãy số hợp mệnh, hợp cục, hợp ngành nghề — chiêu tài và định vị năng lượng.',
  },
  {
    title: 'Khóa học thực chiến',
    body: 'Phong thủy nhập môn, Huyền Không Phi Tinh, Bát Tự & cải vận — học trực tiếp với thầy.',
  },
  {
    title: 'Đặt tên thương hiệu',
    body: 'Đặt tên công ty, cửa hàng, sản phẩm theo âm số – ngũ hành – ý nghĩa chữ.',
  },
  {
    title: 'Đá phong thủy khai quang',
    body: 'Chọn đá – bố trí – đánh thức linh khí theo mệnh để hộ thân và trấn trạch.',
  },
];

const REVIEWS = [
  {
    author: 'Nguyễn Minh Tuấn',
    rating: 5,
    text: 'Thầy Phúc An xem văn phòng giúp công ty tôi xoay chuyển dòng tiền chỉ sau một quý.',
    relative_time: '1 tháng trước',
  },
  {
    author: 'Trần Thị Hạnh',
    rating: 5,
    text: 'Thầy chỉ rõ chỗ hợp – chỗ kỵ trước khi mua nhà. Vào ở hơn một năm, nhà lúc nào cũng êm ấm.',
    relative_time: '2 tháng trước',
  },
  {
    author: 'Lê Quốc Bảo',
    rating: 5,
    text: 'Sim Bát Tự thầy chọn giúp tôi như một điểm tựa năng lượng mỗi ngày.',
    relative_time: '3 tuần trước',
  },
];

const GALLERY = [
  {
    url: '/images/ly-gia-phuc-an/hero.png',
    alt: 'Không gian phong thủy Lý Gia Phúc An',
  },
  {
    url: '/images/ly-gia-phuc-an/xem-nha.png',
    alt: 'Tư vấn xem nhà cửa',
  },
  {
    url: '/images/ly-gia-phuc-an/sim.png',
    alt: 'Sim Bát Tự phong thủy',
  },
  {
    url: '/images/ly-gia-phuc-an/khoa-hoc.png',
    alt: 'Khóa học phong thủy',
  },
  {
    url: '/images/ly-gia-phuc-an/thiet-ke.png',
    alt: 'Thiết kế không gian hợp mệnh',
  },
  {
    url: '/images/ly-gia-phuc-an/da-phong-thuy.png',
    alt: 'Đá phong thủy khai quang',
  },
];

const TEMPLE = {
  domain: PRIMARY_DOMAIN,
  name: 'Lý Gia Phúc An',
  temple_alt_name: 'Thầy Phong Thủy Lý Gia Phúc An',
  slogan: 'Kiến tạo vận mệnh & không gian',
  tagline: 'Tư vấn phong thủy nhà ở, không gian làm việc và Bát Tự',
  primary_color: '#5C1618',
  logo_url: '/images/ly-gia-phuc-an/logo.png',
  hero_image_url: '/images/ly-gia-phuc-an/hero.png',
  address: '52 Nguyễn Văn Cừ, phường Bồ Đề, Hà Nội',
  maps_url:
    'https://www.google.com/maps/search/?api=1&query=52+Nguy%E1%BB%85n+V%C4%83n+C%E1%BB%AB%2C+B%E1%BB%93+%C4%90%E1%BB%81%2C+H%C3%A0+N%E1%BB%99i',
  maps_embed_url:
    'https://www.google.com/maps?q=52+Nguy%E1%BB%85n+V%C4%83n+C%E1%BB%AB,+B%E1%BB%93+%C4%90%E1%BB%81,+H%C3%A0+N%E1%BB%99i&z=16&hl=vi&output=embed',
  google_rating: null,
  google_review_count: null,
  history_summary: HISTORY,
  abbott_name: 'Lý Gia Phúc An',
  abbott_title: 'Chuyên gia phong thủy thực chứng',
  abbott_bio: BIO,
  abbott_image_url: '/images/ly-gia-phuc-an/master.png',
  hotline: PHONE,
  contact_links: {
    phone: PHONE,
    zalo: `https://zalo.me/${PHONE}`,
    facebook: null,
    messenger: null,
    youtube: null,
    tiktok: null,
    instagram: null,
    threads: null,
    x: null,
    zalo_community: null,
  },
  gallery: GALLERY,
  timeline: [],
  features: FEATURES,
  extra_sections: [
    {
      title: 'Phương pháp làm việc',
      body: 'Khảo sát hiện trạng, luận giải theo lý số và đề xuất giải pháp phù hợp từng không gian.\n\nƯu tiên giải pháp rõ ràng, dễ áp dụng, bám sát mục tiêu của gia chủ và doanh nghiệp.\n\nĐồng hành từ tư vấn đến triển khai khi khách hàng cần.',
      image_url: '/images/ly-gia-phuc-an/logo.png',
    },
  ],
  videos: [],
  reviews: REVIEWS,
  bank_name: null,
  bank_account_number: null,
  bank_account_holder: null,
  qr_donate: null,
  payment_code: 'LGPA',
  water_price_vnd: 0,
  water_profit_share_pct: 0,
  is_active: true,
};

function normalizePhone(phone) {
  return String(phone).replace(/\D/g, '');
}

function phoneEmail(phone) {
  return `${normalizePhone(phone)}@${PHONE_DOMAIN}`;
}

async function findUserByEmail(email) {
  const { data, error } = await admin.auth.admin.listUsers({ page: 1, perPage: 200 });
  if (error) throw error;
  return data.users.find((u) => u.email === email) ?? null;
}

async function upsertTemple() {
  const { data: existing, error: findErr } = await admin
    .from('temples')
    .select('id')
    .eq('domain', PRIMARY_DOMAIN)
    .maybeSingle();
  if (findErr) throw findErr;

  if (existing?.id) {
    const { data, error } = await admin
      .from('temples')
      .update({ ...TEMPLE, updated_at: new Date().toISOString() })
      .eq('id', existing.id)
      .select('id')
      .single();
    if (error) throw error;
    console.log(`✓ Cập nhật temples ${PRIMARY_DOMAIN} → ${data.id}`);
    return data.id;
  }

  const { data, error } = await admin
    .from('temples')
    .insert(TEMPLE)
    .select('id')
    .single();
  if (error) throw error;
  console.log(`✓ Tạo temples ${PRIMARY_DOMAIN} → ${data.id}`);
  return data.id;
}

async function upsertDomains(templeId) {
  const domains = [
    { domain: PRIMARY_DOMAIN, is_primary: true },
    { domain: `www.${PRIMARY_DOMAIN}`, is_primary: false },
    { domain: 'phong-thuy-ly-gia-phuc-an.localhost', is_primary: false },
    { domain: 'phong-thuy-ly-gia-phuc-an.localhost.com', is_primary: false },
  ];

  for (const d of domains) {
    const { data: row } = await admin
      .from('temple_domains')
      .select('id')
      .eq('domain', d.domain)
      .maybeSingle();

    if (row?.id) {
      const { error } = await admin
        .from('temple_domains')
        .update({ temple_id: templeId, is_primary: d.is_primary })
        .eq('id', row.id);
      if (error) throw error;
      console.log(`✓ Cập nhật domain ${d.domain}`);
    } else {
      const { error } = await admin.from('temple_domains').insert({
        temple_id: templeId,
        domain: d.domain,
        is_primary: d.is_primary,
      });
      if (error) throw error;
      console.log(`✓ Thêm domain ${d.domain}`);
    }
  }
}

async function upsertAdmin(templeId) {
  const phone = normalizePhone(PHONE);
  const email = phoneEmail(phone);
  const displayName = 'Lý Gia Phúc An';

  let user = await findUserByEmail(email);
  if (!user) {
    // listUsers may miss if many users — try create directly
    const { data, error } = await admin.auth.admin.createUser({
      email,
      password: PIN,
      email_confirm: true,
      user_metadata: { phone, display_name: displayName },
    });
    if (error) {
      if (String(error.message || '').includes('already')) {
        user = await findUserByEmail(email);
        if (!user) throw error;
      } else {
        throw error;
      }
    } else {
      user = data.user;
      console.log(`✓ Tạo Auth user ${phone}`);
    }
  }

  if (user) {
    const { error } = await admin.auth.admin.updateUserById(user.id, {
      password: PIN,
      email_confirm: true,
      user_metadata: {
        ...(user.user_metadata || {}),
        phone,
        display_name: displayName,
      },
    });
    if (error) throw error;
    console.log(`✓ Cập nhật Auth user ${phone}`);
  }

  const { data: existing } = await admin
    .from('temple_admins')
    .select('id')
    .eq('user_id', user.id)
    .eq('temple_id', templeId)
    .maybeSingle();

  const row = {
    user_id: user.id,
    temple_id: templeId,
    role: 'admin',
    display_name: displayName,
    phone,
    is_super_admin: false,
    is_active: true,
  };

  if (existing?.id) {
    const { error } = await admin.from('temple_admins').update(row).eq('id', existing.id);
    if (error) throw error;
    console.log('✓ Cập nhật temple_admins');
  } else {
    const { error } = await admin.from('temple_admins').insert(row);
    if (error) throw error;
    console.log('✓ Gắn temple_admins');
  }
}

async function main() {
  const templeId = await upsertTemple();
  await upsertDomains(templeId);
  await upsertAdmin(templeId);

  console.log('\n=== Lý Gia Phúc An đã sẵn sàng ===');
  console.log(`Temple ID: ${templeId}`);
  console.log(`Domain: https://${PRIMARY_DOMAIN}`);
  console.log(`Local:  http://phong-thuy-ly-gia-phuc-an.localhost:3000`);
  console.log(`Local:  http://phong-thuy-ly-gia-phuc-an.localhost.com:3000`);
  console.log(`Admin:  SĐT ${PHONE} / PIN ${PIN}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
