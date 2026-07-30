-- Seed Quý Linh Tự
CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$
DECLARE
  v_temple_id uuid;
  v_user_id uuid;
  v_email text := '0929643333@phone.chua.app';
BEGIN
  SELECT id INTO v_temple_id FROM public.temples WHERE domain = 'quylinhtu.com';
  IF v_temple_id IS NULL THEN
    INSERT INTO public.temples (
      domain, name, temple_alt_name, slogan, tagline, primary_color,
      logo_url, hero_image_url, address, maps_url, maps_embed_url,
      google_rating, google_review_count, history_summary,
      abbott_name, abbott_title, abbott_bio, abbott_image_url, hotline,
      contact_links, gallery, timeline, features, extra_sections, videos, reviews,
      bank_name, bank_account_number, bank_account_holder, qr_donate,
      payment_code, water_price_vnd, water_profit_share_pct, is_active
    ) VALUES (
      'quylinhtu.com',
      'Quý Linh Tự',
      'Chùa Quý Linh',
      'Nơi an trú tâm — thắp sáng từ bi',
      'Ngôi chùa thanh tịnh giữa lòng phố thị',
      '#8B3A2A',
      '/images/logo-phat-giao.svg',
      '/images/hero-temple.jpg',
      'Số 88 đường Quý Linh, phường An Hòa, thành phố Thủ Đức, TP. Hồ Chí Minh',
      'https://www.google.com/maps/search/?api=1&query=Qu%C3%BD%20Linh%20T%E1%BB%B1%20Th%E1%BB%A7%20%C4%90%E1%BB%A9c',
      'https://www.google.com/maps?q=10.8505,106.7720&z=16&hl=vi&output=embed',
      4.8, 128,
      'Quý Linh Tự là ngôi chùa mang tinh thần Đại thừa Bắc tông, được kiến lập với nguyện vọng kiến tạo một không gian tu học thanh tịnh giữa nhịp sống đô thị hiện đại.

Tên chùa “Quý Linh” gợi nhắc sự quý kính đối với linh thiêng, khuyến khích mỗi người con Phật biết trân trọng thân người, gìn giữ giới hạnh và nuôi dưỡng tâm từ bi trong đời sống thường nhật. Trải qua các đợt trùng tu, chùa dần hình thành quần thể gồm chính điện, nhà tổ, giảng đường và khu thiền hành quanh hồ sen.

Hằng năm, Quý Linh Tự tổ chức các khóa tu một ngày, lễ vía Phật – Bồ tát, lễ cầu an đầu năm và cầu siêu cuối năm. Phật tử gần xa về chùa không chỉ để lễ bái mà còn để học pháp, làm công quả và kết nối cộng đồng đạo hữu trong tinh thần lục hòa.',
      'Thích Lê Thiện',
      'Trụ trì Quý Linh Tự',
      'Đại đức Thích Lê Thiện hiện trụ trì Quý Linh Tự, phụng sự Tăng đoàn và đồng hành cùng Phật tử trên bước đường tu học.

Thầy chú trọng giảng dạy Phật pháp ứng dụng vào đời sống, khuyến khích thiền tập, niệm Phật và phụng sự chúng sinh bằng những việc thiện nhỏ nhưng bền bỉ. Dưới sự dẫn dắt của Thầy, chùa thường xuyên tổ chức khóa tu, lễ cầu an — cầu siêu, chương trình khuyến học và các hoạt động từ thiện hướng về người khó khăn.

Với phương châm “an trú tâm, lợi lạc người”, Thầy luôn mở rộng cửa chùa đón tiếp đạo hữu gần xa đến lễ bái, học pháp và sẻ chia Phật sự.',
      NULL,
      '0929643333',
      '{"phone":"0929643333","zalo":"https://zalo.me/0929643333","facebook":null,"messenger":null,"youtube":null,"tiktok":null,"instagram":null,"threads":null,"x":null,"zalo_community":null}'::jsonb,
      '[{"url":"https://images.unsplash.com/photo-1545569341-9eb8b30979d9?auto=format&fit=crop&w=1600&q=80","alt":"Cổng chùa Quý Linh Tự buổi sớm"},{"url":"https://images.unsplash.com/photo-1508804185872-d7badad00f7d?auto=format&fit=crop&w=1600&q=80","alt":"Đại hồng chung và sân chùa"},{"url":"https://images.unsplash.com/photo-1528164344705-47542687000d?auto=format&fit=crop&w=1600&q=80","alt":"Mái ngói cong và hàng cây cổ thụ"},{"url":"https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=1600&q=80","alt":"Không gian thanh tịnh bên hồ sen"},{"url":"https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1600&q=80","alt":"Ánh sáng ban mai trên mái chùa"},{"url":"https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1600&q=80","alt":"Lối đi lát đá dẫn vào chính điện"},{"url":"https://images.unsplash.com/photo-1493246507139-91e8fad9978e?auto=format&fit=crop&w=1600&q=80","alt":"Hồ sen quanh khuôn viên chùa"},{"url":"https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1600&q=80","alt":"Núi và sương sớm gần Quý Linh Tự"},{"url":"https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=1600&q=80","alt":"Góc thiền hành yên ả"},{"url":"https://images.unsplash.com/photo-1439066615861-d1af74d74000?auto=format&fit=crop&w=1600&q=80","alt":"Mặt hồ phản chiếu bóng chùa"},{"url":"https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1600&q=80","alt":"Đường vào chùa giữa rừng thông"},{"url":"https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?auto=format&fit=crop&w=1600&q=80","alt":"Vườn cây xanh quanh nhà tổ"}]'::jsonb,
      '[{"year":"1998","title":"Khởi dựng am nhỏ","body":"Ban đầu chỉ là am thờ nhỏ với vài gian nhà gỗ, nơi bà con quanh vùng đến lễ Phật và nghe pháp thoại cuối tuần."},{"year":"2005","title":"Xây dựng chính điện","body":"Chính điện được tôn tạo theo lối kiến trúc truyền thống, mái cong, cột gỗ, tôn thờ Đức Phật Thích Ca và chư vị Bồ tát."},{"year":"2012","title":"Mở giảng đường & khóa tu","body":"Giảng đường được đưa vào sử dụng; chùa bắt đầu tổ chức khóa tu một ngày và lớp Phật pháp căn bản cho Phật tử."},{"year":"2016","title":"Tôn tạo hồ sen & lối thiền hành","body":"Khuôn viên được mở rộng với hồ sen, lối lát đá và hàng cây xanh, tạo không gian tĩnh lặng cho hành giả."},{"year":"2019","title":"Nhà tổ và tăng xá","body":"Nhà tổ năm gian và tăng xá được hoàn thiện, phục vụ sinh hoạt Tăng chúng và tiếp đón đạo hữu về công quả."},{"year":"2022","title":"Số hóa Phật sự","body":"Chùa triển khai đăng ký cầu an, đặt nước công đức và thông báo Phật sự qua website / Zalo để thuận tiện cho Phật tử."},{"year":"2024","title":"Khóa tu mùa hè cho giới trẻ","body":"Chương trình “Tuổi trẻ với đạo” thu hút hàng trăm bạn trẻ tham gia thiền tập, nghe pháp và làm thiện nguyện."},{"year":"2026","title":"Ra mắt website Quý Linh Tự","body":"Website quylinhtu.com chính thức đi vào hoạt động, đồng hành cùng Phật tử trong các Phật sự thường nhật."}]'::jsonb,
      '[{"title":"Chính điện trang nghiêm","body":"Không gian thờ tự thanh tịnh, tôn thờ Đức Phật Thích Ca cùng chư vị Bồ tát Quan Âm, Địa Tạng — nơi Phật tử lễ bái và tụng kinh hằng ngày."},{"title":"Khóa tu & học pháp","body":"Định kỳ tổ chức khóa tu một ngày, lớp Phật pháp căn bản và thiền tập hướng dẫn cho mọi lứa tuổi."},{"title":"Cầu an — cầu siêu","body":"Các lễ cầu an đầu năm, vía Phật và cầu siêu cuối năm được cử hành trang nghiêm, cầu nguyện bình an cho gia đình và hương linh."},{"title":"Công đức & từ thiện","body":"Chùa duy trì quỹ khuyến học, phát quà cho người khó khăn và tiếp nhận công đức nước tinh khiết phục vụ Phật sự."},{"title":"Không gian thiền hành","body":"Hồ sen, lối đá và vườn cây tạo môi trường an tĩnh để hành giả đi kinh hành, quán niệm hơi thở."},{"title":"Cộng đồng đạo hữu","body":"Phật tử được kết nối qua Zalo, đăng ký Phật tử và nhận thông báo lịch lễ, khóa tu kịp thời."}]'::jsonb,
      '[{"title":"Sinh hoạt Phật sự thường nhật","body":"Mỗi sáng, chư Tăng và Phật tử tụng kinh, niệm Phật tại chính điện. Chiều tối có thời khóa công phu và thời gian im lặng để hành giả tự quán chiếu.\n\nCuối tuần, chùa mở lớp Phật pháp ngắn — dễ hiểu, kết hợp chia sẻ về ứng dụng chánh niệm trong công việc, gia đình và nuôi dưỡng tâm từ bi.","image_url":"/images/incense-co-vien.jpg"},{"title":"Hướng dẫn về chùa","body":"Quý Phật tử có thể đến chùa vào khung giờ mở cửa 6:00–18:00 hằng ngày. Ngày vía và khóa tu nên đăng ký trước qua Zalo hoặc form trên website.\n\nKhi đến chùa, xin mặc trang phục lịch sự, giữ im lặng trong chính điện và tuân theo hướng dẫn của ban hộ tự."},{"title":"Công đức nước tinh khiết","body":"Cúng dâng nước tinh khiết mang nhãn Quý Linh Tự là một hình thức công đức giản dị, gắn với lời nguyện “uống nước nhớ nguồn” và hỗ trợ Phật sự thường xuyên của chùa.\n\nPhật tử có thể đặt nước trực tiếp trên website; sau khi chuyển khoản, ban hộ tự sẽ liên hệ giao nhận theo lịch."}]'::jsonb,
      '[]'::jsonb,
      '[{"author":"Nguyễn Thị Mai","rating":5,"text":"Chùa rất thanh tịnh, thầy trụ trì giảng pháp dễ hiểu. Mỗi lần về chùa lòng lại nhẹ nhàng hơn.","relative_time":"2 tháng trước"},{"author":"Trần Văn Hùng","rating":5,"text":"Khóa tu một ngày tổ chức chu đáo. Không gian hồ sen đẹp, phù hợp để tĩnh tâm.","relative_time":"3 tháng trước"},{"author":"Lê Thu Hà","rating":5,"text":"Ban hộ tự nhiệt tình, lịch lễ rõ ràng. Đặt nước công đức trên web rất tiện.","relative_time":"1 tháng trước"},{"author":"Phạm Quốc Bảo","rating":4,"text":"Chùa sạch sẽ, đường vào dễ tìm. Mong chùa giữ được sự yên tĩnh như hiện tại.","relative_time":"4 tháng trước"},{"author":"Đỗ Minh Châu","rating":5,"text":"Con được nghe pháp thoại của Thầy Lê Thiện rất ấm áp. Xin cảm ơn chư Tăng và đạo hữu.","relative_time":"5 tháng trước"},{"author":"Hoàng Anh Tú","rating":5,"text":"Lễ cầu an đầu năm trang nghiêm. Gia đình con cảm thấy bình an hơn sau buổi lễ.","relative_time":"6 tháng trước"},{"author":"Vũ Thanh Tâm","rating":5,"text":"Website đẹp, thông tin đầy đủ. Đăng ký Phật tử nhanh, nhận thông báo Zalo kịp thời.","relative_time":"3 tuần trước"},{"author":"Ngô Đức Long","rating":4,"text":"Khu thiền hành rất đáng trải nghiệm vào buổi sớm. Nên đến trước 7 giờ để tránh đông.","relative_time":"2 tháng trước"}]'::jsonb,
      'Vietcombank',
      '0123456789',
      'QUY LINH TU',
      NULL,
      'QL',
      80000, 50.00, TRUE
    ) RETURNING id INTO v_temple_id;
  ELSE
    UPDATE public.temples SET
      name = 'Quý Linh Tự',
      temple_alt_name = 'Chùa Quý Linh',
      slogan = 'Nơi an trú tâm — thắp sáng từ bi',
      tagline = 'Ngôi chùa thanh tịnh giữa lòng phố thị',
      primary_color = '#8B3A2A',
      logo_url = '/images/logo-phat-giao.svg',
      hero_image_url = '/images/hero-temple.jpg',
      address = 'Số 88 đường Quý Linh, phường An Hòa, thành phố Thủ Đức, TP. Hồ Chí Minh',
      maps_url = 'https://www.google.com/maps/search/?api=1&query=Qu%C3%BD%20Linh%20T%E1%BB%B1%20Th%E1%BB%A7%20%C4%90%E1%BB%A9c',
      maps_embed_url = 'https://www.google.com/maps?q=10.8505,106.7720&z=16&hl=vi&output=embed',
      google_rating = 4.8,
      google_review_count = 128,
      history_summary = 'Quý Linh Tự là ngôi chùa mang tinh thần Đại thừa Bắc tông, được kiến lập với nguyện vọng kiến tạo một không gian tu học thanh tịnh giữa nhịp sống đô thị hiện đại.

Tên chùa “Quý Linh” gợi nhắc sự quý kính đối với linh thiêng, khuyến khích mỗi người con Phật biết trân trọng thân người, gìn giữ giới hạnh và nuôi dưỡng tâm từ bi trong đời sống thường nhật. Trải qua các đợt trùng tu, chùa dần hình thành quần thể gồm chính điện, nhà tổ, giảng đường và khu thiền hành quanh hồ sen.

Hằng năm, Quý Linh Tự tổ chức các khóa tu một ngày, lễ vía Phật – Bồ tát, lễ cầu an đầu năm và cầu siêu cuối năm. Phật tử gần xa về chùa không chỉ để lễ bái mà còn để học pháp, làm công quả và kết nối cộng đồng đạo hữu trong tinh thần lục hòa.',
      abbott_name = 'Thích Lê Thiện',
      abbott_title = 'Trụ trì Quý Linh Tự',
      abbott_bio = 'Đại đức Thích Lê Thiện hiện trụ trì Quý Linh Tự, phụng sự Tăng đoàn và đồng hành cùng Phật tử trên bước đường tu học.

Thầy chú trọng giảng dạy Phật pháp ứng dụng vào đời sống, khuyến khích thiền tập, niệm Phật và phụng sự chúng sinh bằng những việc thiện nhỏ nhưng bền bỉ. Dưới sự dẫn dắt của Thầy, chùa thường xuyên tổ chức khóa tu, lễ cầu an — cầu siêu, chương trình khuyến học và các hoạt động từ thiện hướng về người khó khăn.

Với phương châm “an trú tâm, lợi lạc người”, Thầy luôn mở rộng cửa chùa đón tiếp đạo hữu gần xa đến lễ bái, học pháp và sẻ chia Phật sự.',
      hotline = '0929643333',
      contact_links = '{"phone":"0929643333","zalo":"https://zalo.me/0929643333","facebook":null,"messenger":null,"youtube":null,"tiktok":null,"instagram":null,"threads":null,"x":null,"zalo_community":null}'::jsonb,
      gallery = '[{"url":"https://images.unsplash.com/photo-1545569341-9eb8b30979d9?auto=format&fit=crop&w=1600&q=80","alt":"Cổng chùa Quý Linh Tự buổi sớm"},{"url":"https://images.unsplash.com/photo-1508804185872-d7badad00f7d?auto=format&fit=crop&w=1600&q=80","alt":"Đại hồng chung và sân chùa"},{"url":"https://images.unsplash.com/photo-1528164344705-47542687000d?auto=format&fit=crop&w=1600&q=80","alt":"Mái ngói cong và hàng cây cổ thụ"},{"url":"https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=1600&q=80","alt":"Không gian thanh tịnh bên hồ sen"},{"url":"https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1600&q=80","alt":"Ánh sáng ban mai trên mái chùa"},{"url":"https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1600&q=80","alt":"Lối đi lát đá dẫn vào chính điện"},{"url":"https://images.unsplash.com/photo-1493246507139-91e8fad9978e?auto=format&fit=crop&w=1600&q=80","alt":"Hồ sen quanh khuôn viên chùa"},{"url":"https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1600&q=80","alt":"Núi và sương sớm gần Quý Linh Tự"},{"url":"https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=1600&q=80","alt":"Góc thiền hành yên ả"},{"url":"https://images.unsplash.com/photo-1439066615861-d1af74d74000?auto=format&fit=crop&w=1600&q=80","alt":"Mặt hồ phản chiếu bóng chùa"},{"url":"https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1600&q=80","alt":"Đường vào chùa giữa rừng thông"},{"url":"https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?auto=format&fit=crop&w=1600&q=80","alt":"Vườn cây xanh quanh nhà tổ"}]'::jsonb,
      timeline = '[{"year":"1998","title":"Khởi dựng am nhỏ","body":"Ban đầu chỉ là am thờ nhỏ với vài gian nhà gỗ, nơi bà con quanh vùng đến lễ Phật và nghe pháp thoại cuối tuần."},{"year":"2005","title":"Xây dựng chính điện","body":"Chính điện được tôn tạo theo lối kiến trúc truyền thống, mái cong, cột gỗ, tôn thờ Đức Phật Thích Ca và chư vị Bồ tát."},{"year":"2012","title":"Mở giảng đường & khóa tu","body":"Giảng đường được đưa vào sử dụng; chùa bắt đầu tổ chức khóa tu một ngày và lớp Phật pháp căn bản cho Phật tử."},{"year":"2016","title":"Tôn tạo hồ sen & lối thiền hành","body":"Khuôn viên được mở rộng với hồ sen, lối lát đá và hàng cây xanh, tạo không gian tĩnh lặng cho hành giả."},{"year":"2019","title":"Nhà tổ và tăng xá","body":"Nhà tổ năm gian và tăng xá được hoàn thiện, phục vụ sinh hoạt Tăng chúng và tiếp đón đạo hữu về công quả."},{"year":"2022","title":"Số hóa Phật sự","body":"Chùa triển khai đăng ký cầu an, đặt nước công đức và thông báo Phật sự qua website / Zalo để thuận tiện cho Phật tử."},{"year":"2024","title":"Khóa tu mùa hè cho giới trẻ","body":"Chương trình “Tuổi trẻ với đạo” thu hút hàng trăm bạn trẻ tham gia thiền tập, nghe pháp và làm thiện nguyện."},{"year":"2026","title":"Ra mắt website Quý Linh Tự","body":"Website quylinhtu.com chính thức đi vào hoạt động, đồng hành cùng Phật tử trong các Phật sự thường nhật."}]'::jsonb,
      features = '[{"title":"Chính điện trang nghiêm","body":"Không gian thờ tự thanh tịnh, tôn thờ Đức Phật Thích Ca cùng chư vị Bồ tát Quan Âm, Địa Tạng — nơi Phật tử lễ bái và tụng kinh hằng ngày."},{"title":"Khóa tu & học pháp","body":"Định kỳ tổ chức khóa tu một ngày, lớp Phật pháp căn bản và thiền tập hướng dẫn cho mọi lứa tuổi."},{"title":"Cầu an — cầu siêu","body":"Các lễ cầu an đầu năm, vía Phật và cầu siêu cuối năm được cử hành trang nghiêm, cầu nguyện bình an cho gia đình và hương linh."},{"title":"Công đức & từ thiện","body":"Chùa duy trì quỹ khuyến học, phát quà cho người khó khăn và tiếp nhận công đức nước tinh khiết phục vụ Phật sự."},{"title":"Không gian thiền hành","body":"Hồ sen, lối đá và vườn cây tạo môi trường an tĩnh để hành giả đi kinh hành, quán niệm hơi thở."},{"title":"Cộng đồng đạo hữu","body":"Phật tử được kết nối qua Zalo, đăng ký Phật tử và nhận thông báo lịch lễ, khóa tu kịp thời."}]'::jsonb,
      extra_sections = '[{"title":"Sinh hoạt Phật sự thường nhật","body":"Mỗi sáng, chư Tăng và Phật tử tụng kinh, niệm Phật tại chính điện. Chiều tối có thời khóa công phu và thời gian im lặng để hành giả tự quán chiếu.\n\nCuối tuần, chùa mở lớp Phật pháp ngắn — dễ hiểu, kết hợp chia sẻ về ứng dụng chánh niệm trong công việc, gia đình và nuôi dưỡng tâm từ bi.","image_url":"/images/incense-co-vien.jpg"},{"title":"Hướng dẫn về chùa","body":"Quý Phật tử có thể đến chùa vào khung giờ mở cửa 6:00–18:00 hằng ngày. Ngày vía và khóa tu nên đăng ký trước qua Zalo hoặc form trên website.\n\nKhi đến chùa, xin mặc trang phục lịch sự, giữ im lặng trong chính điện và tuân theo hướng dẫn của ban hộ tự."},{"title":"Công đức nước tinh khiết","body":"Cúng dâng nước tinh khiết mang nhãn Quý Linh Tự là một hình thức công đức giản dị, gắn với lời nguyện “uống nước nhớ nguồn” và hỗ trợ Phật sự thường xuyên của chùa.\n\nPhật tử có thể đặt nước trực tiếp trên website; sau khi chuyển khoản, ban hộ tự sẽ liên hệ giao nhận theo lịch."}]'::jsonb,
      videos = '[]'::jsonb,
      reviews = '[{"author":"Nguyễn Thị Mai","rating":5,"text":"Chùa rất thanh tịnh, thầy trụ trì giảng pháp dễ hiểu. Mỗi lần về chùa lòng lại nhẹ nhàng hơn.","relative_time":"2 tháng trước"},{"author":"Trần Văn Hùng","rating":5,"text":"Khóa tu một ngày tổ chức chu đáo. Không gian hồ sen đẹp, phù hợp để tĩnh tâm.","relative_time":"3 tháng trước"},{"author":"Lê Thu Hà","rating":5,"text":"Ban hộ tự nhiệt tình, lịch lễ rõ ràng. Đặt nước công đức trên web rất tiện.","relative_time":"1 tháng trước"},{"author":"Phạm Quốc Bảo","rating":4,"text":"Chùa sạch sẽ, đường vào dễ tìm. Mong chùa giữ được sự yên tĩnh như hiện tại.","relative_time":"4 tháng trước"},{"author":"Đỗ Minh Châu","rating":5,"text":"Con được nghe pháp thoại của Thầy Lê Thiện rất ấm áp. Xin cảm ơn chư Tăng và đạo hữu.","relative_time":"5 tháng trước"},{"author":"Hoàng Anh Tú","rating":5,"text":"Lễ cầu an đầu năm trang nghiêm. Gia đình con cảm thấy bình an hơn sau buổi lễ.","relative_time":"6 tháng trước"},{"author":"Vũ Thanh Tâm","rating":5,"text":"Website đẹp, thông tin đầy đủ. Đăng ký Phật tử nhanh, nhận thông báo Zalo kịp thời.","relative_time":"3 tuần trước"},{"author":"Ngô Đức Long","rating":4,"text":"Khu thiền hành rất đáng trải nghiệm vào buổi sớm. Nên đến trước 7 giờ để tránh đông.","relative_time":"2 tháng trước"}]'::jsonb,
      bank_name = 'Vietcombank',
      bank_account_number = '0123456789',
      bank_account_holder = 'QUY LINH TU',
      payment_code = 'QL',
      water_price_vnd = 80000,
      water_profit_share_pct = 50.00,
      is_active = TRUE,
      updated_at = now()
    WHERE id = v_temple_id;
  END IF;

  INSERT INTO public.temple_domains (temple_id, domain, is_primary)
  VALUES
    (v_temple_id, 'quylinhtu.com', TRUE),
    (v_temple_id, 'www.quylinhtu.com', FALSE),
    (v_temple_id, 'quylinhtu.localhost', FALSE)
  ON CONFLICT (domain) DO UPDATE
    SET temple_id = EXCLUDED.temple_id, is_primary = EXCLUDED.is_primary;

  SELECT id INTO v_user_id FROM auth.users WHERE email = v_email;
  IF v_user_id IS NULL THEN
    v_user_id := gen_random_uuid();
    INSERT INTO auth.users (
      instance_id, id, aud, role, email, encrypted_password,
      email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
      created_at, updated_at, confirmation_token, recovery_token,
      email_change_token_new, email_change, is_sso_user, is_anonymous
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      v_user_id,
      'authenticated',
      'authenticated',
      v_email,
      crypt('123456', gen_salt('bf')),
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object('phone', '0929643333', 'display_name', 'Thích Lê Thiện'),
      now(), now(), '', '', '', '', false, false
    );
    INSERT INTO auth.identities (
      id, user_id, identity_data, provider, provider_id,
      last_sign_in_at, created_at, updated_at, email
    ) VALUES (
      gen_random_uuid(),
      v_user_id,
      jsonb_build_object(
        'sub', v_user_id::text,
        'email', v_email,
        'email_verified', true,
        'phone_verified', false
      ),
      'email',
      v_user_id::text,
      now(), now(), now(),
      v_email
    );
  ELSE
    UPDATE auth.users SET
      encrypted_password = crypt('123456', gen_salt('bf')),
      email_confirmed_at = COALESCE(email_confirmed_at, now()),
      raw_user_meta_data = COALESCE(raw_user_meta_data, '{}'::jsonb)
        || jsonb_build_object('phone', '0929643333', 'display_name', 'Thích Lê Thiện'),
      updated_at = now()
    WHERE id = v_user_id;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.temple_admins
    WHERE user_id = v_user_id AND temple_id = v_temple_id
  ) THEN
    INSERT INTO public.temple_admins (
      user_id, temple_id, role, display_name, phone, is_super_admin, is_active
    ) VALUES (
      v_user_id, v_temple_id, 'admin', 'Thích Lê Thiện', '0929643333', FALSE, TRUE
    );
  ELSE
    UPDATE public.temple_admins SET
      role = 'admin',
      display_name = 'Thích Lê Thiện',
      phone = '0929643333',
      is_active = TRUE,
      is_super_admin = FALSE
    WHERE user_id = v_user_id AND temple_id = v_temple_id;
  END IF;
END $$;
