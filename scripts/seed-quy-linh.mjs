/**
 * Seed Chùa Quý Linh Tự + domain aliases + tài khoản quản trị.
 *
 * Usage:
 *   node --env-file=.env.local scripts/seed-quy-linh.mjs
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
const PHONE = '0929643333';
const PIN = '123456';
const PRIMARY_DOMAIN = 'quylinhtu.com';

const GALLERY = [
  {
    url: 'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?auto=format&fit=crop&w=1600&q=80',
    alt: 'Cổng chùa Quý Linh Tự buổi sớm',
  },
  {
    url: 'https://images.unsplash.com/photo-1508804185872-d7badad00f7d?auto=format&fit=crop&w=1600&q=80',
    alt: 'Đại hồng chung và sân chùa',
  },
  {
    url: 'https://images.unsplash.com/photo-1528164344705-47542687000d?auto=format&fit=crop&w=1600&q=80',
    alt: 'Mái ngói cong và hàng cây cổ thụ',
  },
  {
    url: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=1600&q=80',
    alt: 'Không gian thanh tịnh bên hồ sen',
  },
  {
    url: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1600&q=80',
    alt: 'Ánh sáng ban mai trên mái chùa',
  },
  {
    url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1600&q=80',
    alt: 'Lối đi lát đá dẫn vào chính điện',
  },
  {
    url: 'https://images.unsplash.com/photo-1493246507139-91e8fad9978e?auto=format&fit=crop&w=1600&q=80',
    alt: 'Hồ sen quanh khuôn viên chùa',
  },
  {
    url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1600&q=80',
    alt: 'Núi và sương sớm gần Quý Linh Tự',
  },
  {
    url: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=1600&q=80',
    alt: 'Góc thiền hành yên ả',
  },
  {
    url: 'https://images.unsplash.com/photo-1439066615861-d1af74d74000?auto=format&fit=crop&w=1600&q=80',
    alt: 'Mặt hồ phản chiếu bóng chùa',
  },
  {
    url: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1600&q=80',
    alt: 'Đường vào chùa giữa rừng thông',
  },
  {
    url: 'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?auto=format&fit=crop&w=1600&q=80',
    alt: 'Vườn cây xanh quanh nhà tổ',
  },
];

const TEMPLE = {
  domain: PRIMARY_DOMAIN,
  name: 'Quý Linh Tự',
  temple_alt_name: 'Chùa Quý Linh',
  slogan: 'Nơi an trú tâm — thắp sáng từ bi',
  tagline: 'Ngôi chùa thanh tịnh giữa lòng phố thị',
  primary_color: '#8B3A2A',
  logo_url: '/images/logo-phat-giao.svg',
  hero_image_url: '/images/quy-linh-tu/quy-linh-tu.jpg',
  address: 'Số 88 đường Quý Linh, phường An Hòa, thành phố Thủ Đức, TP. Hồ Chí Minh',
  maps_url:
    'https://www.google.com/maps/search/?api=1&query=Qu%C3%BD%20Linh%20T%E1%BB%B1%20Th%E1%BB%A7%20%C4%90%E1%BB%A9c',
  maps_embed_url:
    'https://www.google.com/maps?q=10.8505,106.7720&z=16&hl=vi&output=embed',
  google_rating: 4.8,
  google_review_count: 128,
  history_summary: `Quý Linh Tự là ngôi chùa mang tinh thần Đại thừa Bắc tông, được kiến lập với nguyện vọng kiến tạo một không gian tu học thanh tịnh giữa nhịp sống đô thị hiện đại.

Tên chùa “Quý Linh” gợi nhắc sự quý kính đối với linh thiêng, khuyến khích mỗi người con Phật biết trân trọng thân người, gìn giữ giới hạnh và nuôi dưỡng tâm từ bi trong đời sống thường nhật. Trải qua các đợt trùng tu, chùa dần hình thành quần thể gồm chính điện, nhà tổ, giảng đường và khu thiền hành quanh hồ sen.

Hằng năm, Quý Linh Tự tổ chức các khóa tu một ngày, lễ vía Phật – Bồ tát, lễ cầu an đầu năm và cầu siêu cuối năm. Phật tử gần xa về chùa không chỉ để lễ bái mà còn để học pháp, làm công quả và kết nối cộng đồng đạo hữu trong tinh thần lục hòa.`,
  abbott_name: 'Đồng thầy Lê Thiện',
  abbott_title: 'Trụ trì Quý Linh Tự',
  abbott_bio: `Đồng thầy Lê Thiện hiện trụ trì Quý Linh Tự, phụng sự Tăng đoàn và đồng hành cùng Phật tử trên bước đường tu học.

Thầy chú trọng giảng dạy Phật pháp ứng dụng vào đời sống, khuyến khích thiền tập, niệm Phật và phụng sự chúng sinh bằng những việc thiện nhỏ nhưng bền bỉ. Dưới sự dẫn dắt của Thầy, chùa thường xuyên tổ chức khóa tu, lễ cầu an — cầu siêu, chương trình khuyến học và các hoạt động từ thiện hướng về người khó khăn.

Với phương châm “an trú tâm, lợi lạc người”, Thầy luôn mở rộng cửa chùa đón tiếp đạo hữu gần xa đến lễ bái, học pháp và sẻ chia Phật sự.`,
  abbott_image_url: null,
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
  timeline: [
    {
      year: '1998',
      title: 'Khởi dựng am nhỏ',
      body: 'Ban đầu chỉ là am thờ nhỏ với vài gian nhà gỗ, nơi bà con quanh vùng đến lễ Phật và nghe pháp thoại cuối tuần.',
    },
    {
      year: '2005',
      title: 'Xây dựng chính điện',
      body: 'Chính điện được tôn tạo theo lối kiến trúc truyền thống, mái cong, cột gỗ, tôn thờ Đức Phật Thích Ca và chư vị Bồ tát.',
    },
    {
      year: '2012',
      title: 'Mở giảng đường & khóa tu',
      body: 'Giảng đường được đưa vào sử dụng; chùa bắt đầu tổ chức khóa tu một ngày và lớp Phật pháp căn bản cho Phật tử.',
    },
    {
      year: '2016',
      title: 'Tôn tạo hồ sen & lối thiền hành',
      body: 'Khuôn viên được mở rộng với hồ sen, lối lát đá và hàng cây xanh, tạo không gian tĩnh lặng cho hành giả.',
    },
    {
      year: '2019',
      title: 'Nhà tổ và tăng xá',
      body: 'Nhà tổ năm gian và tăng xá được hoàn thiện, phục vụ sinh hoạt Tăng chúng và tiếp đón đạo hữu về công quả.',
    },
    {
      year: '2022',
      title: 'Số hóa Phật sự',
      body: 'Chùa triển khai đăng ký cầu an, đặt nước công đức và thông báo Phật sự qua website / Zalo để thuận tiện cho Phật tử.',
    },
    {
      year: '2024',
      title: 'Khóa tu mùa hè cho giới trẻ',
      body: 'Chương trình “Tuổi trẻ với đạo” thu hút hàng trăm bạn trẻ tham gia thiền tập, nghe pháp và làm thiện nguyện.',
    },
    {
      year: '2026',
      title: 'Ra mắt website Quý Linh Tự',
      body: 'Website quylinhtu.com chính thức đi vào hoạt động, đồng hành cùng Phật tử trong các Phật sự thường nhật.',
    },
  ],
  features: [
    {
      title: 'Chính điện trang nghiêm',
      body: 'Không gian thờ tự thanh tịnh, tôn thờ Đức Phật Thích Ca cùng chư vị Bồ tát Quan Âm, Địa Tạng — nơi Phật tử lễ bái và tụng kinh hằng ngày.',
    },
    {
      title: 'Khóa tu & học pháp',
      body: 'Định kỳ tổ chức khóa tu một ngày, lớp Phật pháp căn bản và thiền tập hướng dẫn cho mọi lứa tuổi.',
    },
    {
      title: 'Cầu an — cầu siêu',
      body: 'Các lễ cầu an đầu năm, vía Phật và cầu siêu cuối năm được cử hành trang nghiêm, cầu nguyện bình an cho gia đình và hương linh.',
    },
    {
      title: 'Công đức & từ thiện',
      body: 'Chùa duy trì quỹ khuyến học, phát quà cho người khó khăn và tiếp nhận công đức nước tinh khiết phục vụ Phật sự.',
    },
    {
      title: 'Không gian thiền hành',
      body: 'Hồ sen, lối đá và vườn cây tạo môi trường an tĩnh để hành giả đi kinh hành, quán niệm hơi thở.',
    },
    {
      title: 'Cộng đồng đạo hữu',
      body: 'Phật tử được kết nối qua Zalo, đăng ký Phật tử và nhận thông báo lịch lễ, khóa tu kịp thời.',
    },
  ],
  extra_sections: [
    {
      title: 'Truyền thuyết tên Quý Linh',
      body: `Theo lời lưu truyền của đạo hữu kỳ cựu, thuở còn là am nhỏ ven suối, một đêm trăng sáng có ánh lửa linh hiện trên mái lá — dân quanh vùng cho là điềm lành, gọi nơi ấy là đất “quý linh”: chỗ đất quý, có linh khí.

Khi am được mở rộng thành tự viện, tên Quý Linh Tự được giữ lại như lời nhắc: kính quý sự linh thiêng, trân trọng thân người và nuôi dưỡng tâm từ bi giữa đời sống thế tục. Mỗi lần dâng hương, Phật tử thường khấn nguyện gìn giữ giới hạnh và hồi hướng công đức cho gia đình, quê hương.`,
      image_url: '/images/quy-linh-tu/quy-linh-tu.jpg',
    },
    {
      title: 'Hồ sen — mạch nước thanh tịnh',
      body: `Giữa khuôn viên chùa có hồ sen được tôn tạo từ một vùng trũng cũ, nơi xưa kia mưa lũ thường tụ nước. Các bậc tiền bối kể rằng khi đào hồ, thợ đào gặp mạch nước trong mát, quanh năm không đục — dân quanh vùng coi đó là “mạch thanh” nuôi dưỡng đất thiền.

Hồ sen về sau trở thành không gian thiền hành: sáng sớm sương phủ mặt hồ, chiều tối bóng đèn dầu phản chiếu trên mặt nước. Phật tử đi kinh hành quanh hồ, quán niệm hơi thở, gửi lòng về với sự thanh tịnh vốn sẵn trong tâm.`,
      image_url:
        'https://images.unsplash.com/photo-1493246507139-91e8fad9978e?auto=format&fit=crop&w=1600&q=80',
    },
    {
      title: 'Chính điện và dấu ấn trùng tu',
      body: `Chính điện Quý Linh Tự được dựng theo lối kiến trúc Đại thừa Bắc tông: mái cong, cột gỗ, tôn thờ Đức Phật Thích Ca cùng chư vị Bồ tát Quan Âm, Địa Tạng. Trải qua các đợt trùng tu từ năm 2005, điện thờ dần khang trang mà vẫn giữ nét trang nghiêm, không phô trương.

Sau chính điện là nhà tổ năm gian — nơi thờ chư Tổ và tưởng nhớ công đức tiền nhân mở đất. Quần thể chùa, hồ sen và lối lát đá tạo nên một “đảo thanh tịnh” giữa đô thị Thủ Đức: vừa là di tích sống của cộng đồng đạo hữu, vừa là nơi gửi gắm ước nguyện an lạc mỗi mùa lễ hội.`,
    },
  ],
  videos: [],
  reviews: [
    {
      author: 'Nguyễn Thị Mai',
      rating: 5,
      text: 'Chùa rất thanh tịnh, thầy trụ trì giảng pháp dễ hiểu. Mỗi lần về chùa lòng lại nhẹ nhàng hơn.',
      relative_time: '2 tháng trước',
    },
    {
      author: 'Trần Văn Hùng',
      rating: 5,
      text: 'Khóa tu một ngày tổ chức chu đáo. Không gian hồ sen đẹp, phù hợp để tĩnh tâm.',
      relative_time: '3 tháng trước',
    },
    {
      author: 'Lê Thu Hà',
      rating: 5,
      text: 'Ban hộ tự nhiệt tình, lịch lễ rõ ràng. Đặt nước công đức trên web rất tiện.',
      relative_time: '1 tháng trước',
    },
    {
      author: 'Phạm Quốc Bảo',
      rating: 4,
      text: 'Chùa sạch sẽ, đường vào dễ tìm. Mong chùa giữ được sự yên tĩnh như hiện tại.',
      relative_time: '4 tháng trước',
    },
    {
      author: 'Đỗ Minh Châu',
      rating: 5,
      text: 'Con được nghe pháp thoại của Thầy Lê Thiện rất ấm áp. Xin cảm ơn chư Tăng và đạo hữu.',
      relative_time: '5 tháng trước',
    },
    {
      author: 'Hoàng Anh Tú',
      rating: 5,
      text: 'Lễ cầu an đầu năm trang nghiêm. Gia đình con cảm thấy bình an hơn sau buổi lễ.',
      relative_time: '6 tháng trước',
    },
    {
      author: 'Vũ Thanh Tâm',
      rating: 5,
      text: 'Website đẹp, thông tin đầy đủ. Đăng ký Phật tử nhanh, nhận thông báo Zalo kịp thời.',
      relative_time: '3 tuần trước',
    },
    {
      author: 'Ngô Đức Long',
      rating: 4,
      text: 'Khu thiền hành rất đáng trải nghiệm vào buổi sớm. Nên đến trước 7 giờ để tránh đông.',
      relative_time: '2 tháng trước',
    },
  ],
  bank_name: 'Vietcombank',
  bank_account_number: '0123456789',
  bank_account_holder: 'QUY LINH TU',
  qr_donate: null,
  payment_code: 'QL',
  water_price_vnd: 80000,
  water_profit_share_pct: 50,
  is_active: true,
};

function normalizePhone(raw) {
  const digits = String(raw).replace(/[^\d]/g, '');
  let local = digits;
  if (local.startsWith('84') && local.length >= 11) local = `0${local.slice(2)}`;
  if (local.length === 9) local = `0${local}`;
  if (!/^0\d{9}$/.test(local)) throw new Error(`SĐT không hợp lệ: ${raw}`);
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
    { domain: 'quylinhtu.localhost', is_primary: false },
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
  const displayName = 'Đồng thầy Lê Thiện';

  let user = await findUserByEmail(email);
  if (!user) {
    const { data, error } = await admin.auth.admin.createUser({
      email,
      password: PIN,
      email_confirm: true,
      user_metadata: { phone, display_name: displayName },
    });
    if (error) throw error;
    user = data.user;
    console.log(`✓ Tạo Auth user ${phone}`);
  } else {
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

  console.log('\n=== Quý Linh Tự đã sẵn sàng ===');
  console.log(`Temple ID: ${templeId}`);
  console.log(`Domain: https://${PRIMARY_DOMAIN}`);
  console.log(`Local:  http://quylinhtu.localhost:3000`);
  console.log(`Admin:  SĐT ${PHONE} / PIN ${PIN}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
