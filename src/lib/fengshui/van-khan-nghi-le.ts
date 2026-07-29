/**
 * Văn khấn · nghi lễ thường dùng tại chùa Việt (Bắc truyền phổ thông).
 * `{{chua}}` = tên chùa; `{{ho_ten}}` = chỗ điền tên Phật tử.
 * Nhà chùa có thể chỉnh theo hệ phái / nghi thức riêng.
 */

export type VanKhanCategory =
  | 'ram_mung1'
  | 'cau_an'
  | 'cau_sieu'
  | 'cung_duong'
  | 'le_phat'
  | 'gia_duong'
  | 'nghi_le';

export interface VanKhanSection {
  title?: string;
  lines: string[];
}

export interface VanKhanItem {
  id: string;
  title: string;
  shortTitle: string;
  category: VanKhanCategory;
  occasion: string;
  summary: string;
  /** Gợi ý nghi trước / sau khi khấn */
  ritualTips?: string[];
  sections: VanKhanSection[];
}

export const VAN_KHAN_CATEGORY_LABELS: Record<VanKhanCategory, string> = {
  ram_mung1: 'Rằm · mùng 1',
  cau_an: 'Cầu an',
  cau_sieu: 'Cầu siêu',
  cung_duong: 'Cúng dường',
  le_phat: 'Lễ Phật · vía',
  gia_duong: 'Gia đình',
  nghi_le: 'Nghi lễ',
};

export const VAN_KHAN_ITEMS: VanKhanItem[] = [
  {
    id: 'khan-ram-mung1-chua',
    title: 'Văn khấn ngày rằm · mùng một tại chùa',
    shortTitle: 'Khấn rằm · mùng 1',
    category: 'ram_mung1',
    occasion: 'Mùng 1 · rằm mỗi tháng ÂL · lễ sám hối / phóng sanh',
    summary:
      'Mẫu khấn phổ thông khi Phật tử đến chùa lễ Phật ngày sóc · vọng — thành tâm sám hối, cầu bình an.',
    ritualTips: [
      'Ăn mặc trang nghiêm, tắt điện thoại trong chính điện.',
      'Thắp hương (nếu nhà chùa cho phép), chấp tay trước Phật.',
      'Khấn xong có thể tụng Bát Nhã / chú Đại Bi theo thời khóa chùa.',
      'Hồi hướng công đức cho pháp giới chúng sanh.',
    ],
    sections: [
      {
        title: 'Xưng danh',
        lines: [
          'Nam mô Bổn Sư Thích-ca Mâu-ni Phật.',
          'Nam mô A Di Đà Phật.',
          'Nam mô Quán Thế Âm Bồ-tát.',
          'Nam mô Đại Thế Chí Bồ-tát.',
          'Nam mô Địa Tạng Vương Bồ-tát.',
        ],
      },
      {
        title: 'Văn khấn',
        lines: [
          'Hôm nay là ngày … tháng … năm … Âm lịch.',
          'Đệ tử chúng con tên {{ho_ten}}, hiện trú tại …, thành tâm đến {{chua}}, trước ngôi Tam Bảo, cúi đầu đảnh lễ.',
          'Kính bạch mười phương thường trụ Tam Bảo chứng minh.',
          'Nguyện đem chút lòng thành kính, hương hoa nước quả dâng lên cúng dường, sám hối mọi tội lỗi từ thân khẩu ý đã tạo trong nhiều đời.',
          'Cúi xin Phật·Pháp·Tăng từ bi gia hộ: thân tâm an lạc, gia đạo hòa thuận, trí tuệ tăng trưởng, ác nghiệp tiêu trừ, thiện căn tăng trưởng.',
          'Nguyện sống đúng Chánh pháp, giữ năm giới, làm việc lành, lợi mình lợi người.',
          'Phục nguyện quốc thái dân an, mưa thuận gió hòa, pháp giới chúng sanh đồng thành Phật đạo.',
        ],
      },
      {
        title: 'Hồi hướng',
        lines: [
          'Nguyện đem công đức này, hướng về khắp tất cả,',
          'Đệ tử và chúng sanh, đều trọn thành Phật đạo.',
          'Nam mô A Di Đà Phật. (3 lần)',
        ],
      },
    ],
  },
  {
    id: 'khan-cau-an',
    title: 'Văn khấn cầu an',
    shortTitle: 'Khấn cầu an',
    category: 'cau_an',
    occasion: 'Cầu bình an · khỏi bệnh · hộ trì gia đạo · trước việc lớn',
    summary:
      'Khấn cầu Quán Thế Âm và chư Phật gia hộ thân tâm an ổn, tai nạn tiêu trừ.',
    ritualTips: [
      'Ghi rõ họ tên người được cầu an (nếu cầu cho người khác).',
      'Có thể kết hợp đăng ký sổ cầu an tại nhà chùa nếu có.',
      'Nên giữ tâm thanh tịnh vài ngày, tránh sát hại.',
    ],
    sections: [
      {
        title: 'Xưng danh',
        lines: [
          'Nam mô Bổn Sư Thích-ca Mâu-ni Phật.',
          'Nam mô Tiêu Tai Diên Thọ Dược Sư Phật.',
          'Nam mô Đại Từ Đại Bi Quán Thế Âm Bồ-tát.',
        ],
      },
      {
        title: 'Văn khấn',
        lines: [
          'Đệ tử {{ho_ten}}, thành tâm đến {{chua}}, đảnh lễ ngôi Tam Bảo.',
          'Kính bạch Đức Quán Thế Âm Bồ-tát và chư Phật mười phương chứng minh.',
          'Nay vì … (bản thân / thân nhân tên …) gặp … (bệnh tật / ưu phiền / việc nguy), thành tâm cầu nguyện.',
          'Cúi xin từ bi gia hộ: tai qua nạn khỏi, bệnh tật tiêu trừ, thân tâm sáng suốt, gia đạo bình an, mọi việc hanh thông theo nhân quả lành.',
          'Đệ tử nguyện cải ác tùng thiện, trì giới, phóng sanh, bố thí, tụng kinh hồi hướng cho người được cầu an.',
          'Nguyện oan gia trái chủ được siêu thoát, không còn kết oan; nguyện tất cả chúng sanh lìa khổ được vui.',
        ],
      },
      {
        title: 'Hồi hướng',
        lines: [
          'Nguyện đem công đức này, trang nghiêm Phật Tịnh độ,',
          'Báo bốn ân nặng, dưới cứu khổ ba đường.',
          'Nếu có ai thấy nghe, đều phát Bồ-đề tâm,',
          'Hết một báo thân này, sanh qua cõi Cực Lạc.',
          'Nam mô Quán Thế Âm Bồ-tát. (3 lần)',
        ],
      },
    ],
  },
  {
    id: 'khan-cau-sieu',
    title: 'Văn khấn cầu siêu',
    shortTitle: 'Khấn cầu siêu',
    category: 'cau_sieu',
    occasion: 'Cầu siêu vong linh · thất tuần · giỗ · Trai đàn',
    summary:
      'Khấn Địa Tạng Vương và A Di Đà Phật, cầu nguyện vong linh được siêu sanh Tịnh độ.',
    ritualTips: [
      'Ghi rõ pháp danh / họ tên tục, ngày mất (ÂL nếu biết).',
      'Nên phối hợp thời khóa nhà chùa (cúng vong, Trai đàn).',
      'Tránh khóc lóc ồn ào trong chính điện; giữ lòng thành và bình an.',
    ],
    sections: [
      {
        title: 'Xưng danh',
        lines: [
          'Nam mô A Di Đà Phật.',
          'Nam mô Địa Tạng Vương Bồ-tát.',
          'Nam mô Đại Bi Quán Thế Âm Bồ-tát.',
        ],
      },
      {
        title: 'Văn khấn',
        lines: [
          'Đệ tử {{ho_ten}}, thành tâm đến {{chua}}, đảnh lễ ngôi Tam Bảo.',
          'Kính bạch Đức A Di Đà Phật, Địa Tạng Vương Bồ-tát chứng minh.',
          'Nay vì vong linh … (họ tên / pháp danh …), mất ngày … tháng … năm …, tại …',
          'Thành tâm dâng hương hoa, tụng kinh, trì chú, xin hồi hướng công đức.',
          'Cúi xin từ bi tiếp độ: nghiệp chướng tiêu trừ, oan khiên giải kết, lìa đường ác đạo, được sanh về miền an lành — hoặc Tịnh độ Tây phương, hoặc cõi lành tùy nguyện.',
          'Nguyện vong linh sớm thức tỉnh, phát tâm Bồ-đề, được gặp Phật pháp, không còn thăng trầm trong lục đạo.',
          'Đệ tử xin thay mặt cửu huyền thất tổ, thân bằng quyến thuộc đã khuất, đồng cầu siêu thoát.',
        ],
      },
      {
        title: 'Hồi hướng',
        lines: [
          'Nguyện sanh Tây phương Tịnh độ trung,',
          'Cửu phẩm liên hoa vi phụ mẫu,',
          'Hoa khai kiến Phật ngộ vô sanh,',
          'Bất thối Bồ-tát vi bạn lữ.',
          'Nam mô A Di Đà Phật. (nhiều lần, thành tâm)',
        ],
      },
    ],
  },
  {
    id: 'khan-cung-duong-nuoc',
    title: 'Văn khấn cúng dường nước / trai soạn',
    shortTitle: 'Khấn cúng dường',
    category: 'cung_duong',
    occasion: 'Cúng nước · cúng dường trai tăng · công đức hộ trì chùa',
    summary:
      'Mẫu khấn khi dâng nước, phẩm vật hoặc công đức hộ trì đạo tràng.',
    ritualTips: [
      'Đặt phẩm vật gọn gàng theo hướng dẫn nhà chùa.',
      'Không khoe khoang số tiền / vật cúng trước bàn thờ.',
    ],
    sections: [
      {
        title: 'Văn khấn',
        lines: [
          'Nam mô Bổn Sư Thích-ca Mâu-ni Phật.',
          'Đệ tử {{ho_ten}}, thành tâm đến {{chua}}.',
          'Nay đem nước trong / trai soạn / phẩm vật / công đức … dâng lên cúng dường ngôi Tam Bảo.',
          'Nguyện đức từ bi chứng giám, nguyện đạo tràng thường trụ, Phật pháp xương minh, chúng sanh được lợi lạc.',
          'Nguyện công đức này hồi hướng pháp giới: người còn được an, người mất được siêu, oan gia được giải.',
          'Nam mô A Di Đà Phật.',
        ],
      },
    ],
  },
  {
    id: 'khan-le-via-phat',
    title: 'Văn khấn ngày vía Phật · Bồ-tát',
    shortTitle: 'Khấn ngày vía',
    category: 'le_phat',
    occasion: 'Phật Đản · Thành đạo · vía Quán Âm · Địa Tạng · dịp đại lễ',
    summary:
      'Khấn chung cho ngày vía — điền tên Đức Phật / Bồ-tát theo lịch lễ.',
    ritualTips: [
      'Xem lịch «Ngày vía Phật» trên trang phong thủy / lịch nhà chùa.',
      'Tham dự đúng thời khóa nếu chùa tổ chức lễ.',
    ],
    sections: [
      {
        title: 'Văn khấn',
        lines: [
          'Nam mô Bổn Sư Thích-ca Mâu-ni Phật.',
          'Nam mô … (tên Đức Phật / Bồ-tát ngày vía).',
          'Hôm nay ngày vía …, đệ tử {{ho_ten}} thành tâm đến {{chua}}, đảnh lễ.',
          'Kính nhớ hồng ân giáo hóa, nguyện noi gương từ bi, trí tuệ, tinh tấn.',
          'Cúi xin gia hộ chúng sanh thoát khổ, quốc độ an hòa, đạo pháp trường tồn.',
          'Đệ tử nguyện giữ giới, làm lành, học Phật, lợi ích hữu tình.',
          'Nam mô A Di Đà Phật.',
        ],
      },
    ],
  },
  {
    id: 'khan-gia-to-tien',
    title: 'Văn khấn gia tiên tại nhà (tham khảo)',
    shortTitle: 'Khấn gia tiên',
    category: 'gia_duong',
    occasion: 'Giỗ · rằm nhà · mùng 1 bàn thờ gia tiên',
    summary:
      'Mẫu khấn dân gian–Phật giáo phổ biến tại gia; có thể rút gọn tùy nhà.',
    ritualTips: [
      'Sạch sẽ bàn thờ, không đặt đồ mặn nếu nhà theo chay.',
      'Khấn xong nên tụng vài biến A Di Đà / Quán Âm rồi hồi hướng.',
    ],
    sections: [
      {
        title: 'Văn khấn',
        lines: [
          'Nam mô A Di Đà Phật.',
          'Hôm nay ngày … tháng … năm … Âm lịch.',
          'Con cháu tên {{ho_ten}}, thành tâm trước bàn thờ gia tiên / cửu huyền thất tổ.',
          'Kính mời hương linh tổ tiên về chứng giám lòng thành, thụ hưởng hương hoa nước quả.',
          'Nguyện tổ tiên siêu thoát, phù hộ con cháu tu nhân tích đức, gia đạo yên vui, tránh xa tai nạn.',
          'Con cháu xin nhớ công ơn sinh thành dưỡng dục, sống hòa thuận, không phụ lòng tiền nhân.',
          'Nam mô A Di Đà Phật. (3 lần)',
        ],
      },
    ],
  },
  {
    id: 'khan-nhap-trach-phat',
    title: 'Văn khấn an vị Phật / nhập trạch có bàn thờ',
    shortTitle: 'An vị Phật',
    category: 'gia_duong',
    occasion: 'An vị tượng Phật · lập bàn thờ mới · dọn nhà',
    summary:
      'Khấn khi thỉnh tượng / lập bàn thờ tại gia — giữ tâm cung kính, giản dị.',
    ritualTips: [
      'Chọn chỗ trang nghiêm, sạch sẽ, cao ráo.',
      'Nên thỉnh ý thầy trụ trì nếu cần khai quang / chú nguyện.',
    ],
    sections: [
      {
        title: 'Văn khấn',
        lines: [
          'Nam mô Bổn Sư Thích-ca Mâu-ni Phật.',
          'Nam mô A Di Đà Phật.',
          'Đệ tử {{ho_ten}}, nay thành tâm an vị tôn tượng / lập bàn thờ Phật tại gia.',
          'Nguyện ngôi Tam Bảo thường trụ nơi đây, soi sáng thân tâm, nhiếp hóa quyến thuộc.',
          'Đệ tử nguyện mỗi ngày lễ Phật, trì niệm, giữ giới, lấy nhà làm chỗ tu học khiêm cung.',
          'Cúi xin từ bi chứng giám, gia hộ gia đình bình an, trí tuệ mở mang.',
          'Nam mô A Di Đà Phật.',
        ],
      },
    ],
  },
  {
    id: 'nghi-vao-chua',
    title: 'Nghi thức vào chùa · lễ Phật cơ bản',
    shortTitle: 'Vào chùa · lễ Phật',
    category: 'nghi_le',
    occasion: 'Lần đầu đến chùa · hướng dẫn Phật tử mới',
    summary:
      'Các bước cơ bản khi vào chùa: oai nghi, lễ lạy, chỗ đứng ngồi, việc nên tránh.',
    sections: [
      {
        title: 'Trước khi vào',
        lines: [
          'Ăn mặc kín đáo, sạch sẽ; bỏ mũ nón, hạ giọng nói.',
          'Không mang đồ ăn mặn / rượu bia vào khu vực thờ phụng.',
          'Tắt chuông điện thoại hoặc để im lặng.',
        ],
      },
      {
        title: 'Trong chính điện',
        lines: [
          'Đi nhẹ, không chỉ trỏ tượng Phật, không quay lưng ngồi lâu trước bàn thờ.',
          'Lễ Phật: chấp tay ngang ngực, cúi đầu hoặc lạy theo nghi nhà chùa (thường 3 lạy).',
          'Không chen lấn chỗ lạy; nhường người lớn tuổi và tăng ni.',
          'Không tự ý đụng pháp khí, mõ, chuông nếu chưa được phép.',
        ],
      },
      {
        title: 'Khi ra về',
        lines: [
          'Hồi hướng công đức trong lòng, giữ tâm vui vẻ, không phê bình ồn ào.',
          'Có thể ghi danh sổ Phật tử / công quả nếu phát tâm.',
        ],
      },
    ],
  },
  {
    id: 'nghi-thoi-khoa-tom-tat',
    title: 'Thứ tự thời khóa lễ tại chùa (tóm tắt)',
    shortTitle: 'Thứ tự thời khóa',
    category: 'nghi_le',
    occasion: 'Tham khảo khi theo khóa tụng · lễ rằm',
    summary:
      'Khung thời khóa phổ biến: xướng lễ → kinh chú → sám hối → hồi hướng. Tùy chùa có thể khác.',
    sections: [
      {
        title: 'Gợi ý thứ tự',
        lines: [
          '1. Tịnh khẩu · xướng danh Phật / Bồ-tát.',
          '2. Tán hương / cúng hương (theo thầy chủ lễ).',
          '3. Tụng kinh hoặc trì chú (Bát Nhã, Đại Bi, A Di Đà…).',
          '4. Sám hối (nếu có) — thành tâm nhận lỗi, phát nguyện sửa.',
          '5. Niệm Phật / tọa thiền ngắn (nếu thời khóa có).',
          '6. Hồi hướng công đức — cầu siêu / cầu an theo sổ nhà chùa.',
          '7. Tam tự quy / lời kết — lễ tạ, ra về nhẹ nhàng.',
        ],
      },
      {
        title: 'Lưu ý',
        lines: [
          'Làm theo hiệu lệnh của thầy chủ lễ; không tự ý thay đổi thứ tự.',
          'Phật tử tại gia có thể rút gọn: lễ Phật → một thời kinh ngắn → hồi hướng.',
        ],
      },
    ],
  },
  {
    id: 'nghi-phong-sanh',
    title: 'Nghi phóng sanh (tóm tắt)',
    shortTitle: 'Phóng sanh',
    category: 'nghi_le',
    occasion: 'Rằm · vía · ngày tốt do chùa tổ chức',
    summary:
      'Tinh thần phóng sanh: cứu mạng, nuôi lòng từ bi — làm đúng pháp, tránh hình thức.',
    sections: [
      {
        title: 'Tinh thần',
        lines: [
          'Phóng sanh là cứu chúng sanh khỏi chết oan, phát tâm từ bi, không phải mua bán lấy phước ồn ào.',
          'Nên theo chương trình nhà chùa hoặc tổ chức có trách nhiệm với môi trường.',
        ],
      },
      {
        title: 'Các bước gợi ý',
        lines: [
          '1. Thành tâm lễ Phật, xin chứng minh.',
          '2. Đọc văn khấn / chú nguyện ngắn cho chúng sanh được phóng.',
          '3. Thả đúng nơi thích hợp (nước sạch, rừng…), không thả loài xâm hại.',
          '4. Hồi hướng công đức cho pháp giới chúng sanh.',
        ],
      },
      {
        title: 'Văn nguyện ngắn',
        lines: [
          'Chúng sanh được phóng hôm nay, nguyện lìa khổ được vui, không còn bị hại,',
          'Nguyện sớm được thân người, gặp Phật pháp, đồng thành Phật đạo.',
          'Nam mô A Di Đà Phật.',
        ],
      },
    ],
  },
];

export function getVanKhan(id: string): VanKhanItem | undefined {
  return VAN_KHAN_ITEMS.find((x) => x.id === id);
}

export function fillVanKhanPlaceholders(
  text: string,
  opts: { templeName: string; devoteeName?: string },
): string {
  return text
    .replaceAll('{{chua}}', opts.templeName || 'chùa')
    .replaceAll(
      '{{ho_ten}}',
      opts.devoteeName?.trim() || '… (họ và tên)',
    );
}
