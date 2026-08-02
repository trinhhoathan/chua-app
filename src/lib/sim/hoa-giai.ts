/**
 * Mẹo Hóa Giải Hung Tinh & Ép Hung Phát Cát — sinh nội dung rule-based
 * từ kết quả Bói Sim (BoiSimResult), không cần AI.
 *
 * Triết lý trình bày: "Vô hung thì bất cát" — hung tinh được chế hóa đúng
 * cách chính là đòn bẩy. Với mỗi hung tinh trong dãy, mô tả bản chất,
 * cơ chế tự hóa giải (cát tinh đứng liền sau áp chế), rồi đưa tâm pháp
 * và cách thực hành cụ thể để khách "ép hung phát cát".
 */

import type { BoiSimResult, PairAnalysis, StarId } from '@/lib/fengshui/boi-sim';

export interface HoaGiaiTip {
  starId: StarId;
  /** vd "Họa Hại (98)" */
  title: string;
  /** vd "Biến “Thị Phi” thành “Khẩu Tài Chiêu Tài”" */
  subtitle: string;
  /** các cặp số mang sao này, vd ["98"] */
  pairLabels: string[];
  banChat: string;
  /** cơ chế tự hóa giải của chính dãy số (nếu có) */
  cheHoa?: string;
  /** true khi có cát tinh đứng liền sau áp chế trực tiếp */
  cheHoaStrong: boolean;
  tamPhap: string;
  thucHanh: string;
}

export interface UseCaseScenario {
  title: string;
  detail: string;
}

export interface HoaGiaiResult {
  /** mỗi hung tinh xuất hiện trong dãy → 1 khối mẹo */
  tips: HoaGiaiTip[];
  /** "Sim này phát huy tác dụng tốt nhất khi nào?" */
  scenarios: UseCaseScenario[];
  /** thông điệp khi dãy toàn cát tinh (không có hung để hóa giải) */
  allCatMessage?: string;
}

const HUNG_ORDER: StarId[] = ['hoa_hai', 'luc_sat', 'ngu_quy', 'tuyet_menh'];

interface HungMeta {
  subtitle: string;
  banChat: string;
  tamPhap: string;
  thucHanh: string;
  /** thế trận khi được cát tinh X đứng sau chế hóa */
  cheHoaBy: Partial<Record<StarId, { ten: string; giaiThich: string }>>;
  cheHoaGeneric: string;
}

const HUNG_META: Record<string, HungMeta> = {
  hoa_hai: {
    subtitle: 'Biến "Thị Phi" thành "Khẩu Tài Chiêu Tài"',
    banChat:
      'Họa Hại có trường khí chủ về lời ăn tiếng nói — người mang sao này nói chuyện sắc bén, nhưng nếu phát ngôn thiếu cẩn trọng dễ gây hiểu lầm, vướng thị phi hoặc bị tiểu nhân soi mói.',
    tamPhap:
      'Tập trung năng lượng lời nói vào công việc kinh doanh, tư vấn, đàm phán — tránh sa đà tranh luận chuyện cá nhân, chuyện thiên hạ.',
    thucHanh:
      'Dùng số này làm hotline tư vấn hoặc bán hàng: trường khí "khẩu tài" giúp lời nói có uy lực, cuốn hút, dễ thuyết phục khách và chốt hợp đồng.',
    cheHoaBy: {
      thien_y: {
        ten: 'Khẩu Tài Sinh Tài',
        giaiThich:
          'lời nói không còn tạo thị phi mà chuyển hóa thành năng lượng đàm phán, thuyết phục khách hàng và chốt hợp đồng — cực kỳ đắt giá cho người làm kinh doanh',
      },
      dien_nien: {
        ten: 'Ngôn Xuất Pháp Tùy',
        giaiThich:
          'sự chín chắn, nguyên tắc của Diên Niên giữ cho lời nói có trọng lượng — nói ít nhưng câu nào chắc câu đó, hợp vai trò quản lý, chuyên gia',
      },
      sinh_khi: {
        ten: 'Khẩu Thiệt Hóa Duyên',
        giaiThich:
          'quý nhân khí của Sinh Khí biến miệng lưỡi sắc bén thành duyên ăn nói — dễ tạo thiện cảm, mở rộng quan hệ',
      },
    },
    cheHoaGeneric:
      'Cát tinh đứng liền sau áp chế bớt tính thị phi, giữ lại điểm mạnh là tài ăn nói sắc bén.',
  },
  luc_sat: {
    subtitle: 'Biến "Đào Hoa Xấu" thành "Ngoại Giao Tinh Tế"',
    banChat:
      'Lục Sát đại diện cho sự nhạy cảm, tinh tế nhưng đôi lúc do dự, dễ vướng vào các mối quan hệ giao tế phức tạp hoặc đào hoa ngoài ý muốn.',
    tamPhap:
      'Giữ ranh giới minh bạch, rõ ràng trong các mối quan hệ công việc lẫn tình cảm — tinh tế nhưng không lụy.',
    thucHanh:
      'Tận dụng sự tinh tế của Lục Sát để chăm sóc khách hàng thân thiết, làm hình ảnh thương hiệu cá nhân bài bản; rất hợp các nghề dịch vụ, thẩm mỹ, ngoại giao.',
    cheHoaBy: {
      dien_nien: {
        ten: 'Diên Niên Chế Lục Sát',
        giaiThich:
          'cấu trúc kinh điển trong Du Niên: sự lý trí, nguyên tắc, kiên định của Diên Niên áp chế hoàn toàn tính do dự, chỉ giữ lại sự khéo léo, gu thẩm mỹ cao và khả năng thấu hiểu tâm lý người đối diện',
      },
      thien_y: {
        ten: 'Đào Hoa Hóa Tài',
        giaiThich:
          'chính tài khí của Thiên Y dẫn duyên giao tế vào đúng việc kiếm tiền — quan hệ rộng chuyển thành khách hàng, hợp đồng',
      },
      sinh_khi: {
        ten: 'Lục Sát Ngộ Quý Nhân',
        giaiThich:
          'quý nhân khí nâng đỡ giúp các mối giao tế phức tạp được người trên dẫn dắt, hóa rối thành thuận',
      },
    },
    cheHoaGeneric:
      'Cát tinh đứng liền sau kiềm tính do dự, giữ lại thế mạnh giao tế và gu thẩm mỹ.',
  },
  ngu_quy: {
    subtitle: 'Biến "Tâm Bất Định" thành "Sao Tài Hoa Sáng Tạo"',
    banChat:
      'Ngũ Quỷ chủ về biến động, suy nghĩ nhiều, đa mưu — người mang sao này đầu óc nhạy bén khác thường nhưng dễ nghi ngờ, tâm bất định nếu không có hướng xả năng lượng.',
    tamPhap:
      'Dồn năng lượng suy nghĩ vào sáng tạo và giải quyết vấn đề thay vì suy diễn chuyện quan hệ; việc gì đã quyết thì không lật lại.',
    thucHanh:
      'Dùng số này cho công việc cần ý tưởng đột phá: thiết kế, công nghệ, nội dung, nghiên cứu — Ngũ Quỷ được chế hóa chính là "sao tài hoa" của giới sáng tạo.',
    cheHoaBy: {
      dien_nien: {
        ten: 'Quỷ Tài Quy Chính',
        giaiThich:
          'kỷ luật của Diên Niên đóng khung dòng ý tưởng cuồn cuộn thành sản phẩm cụ thể — nghĩ lớn mà vẫn làm tới nơi',
      },
      thien_y: {
        ten: 'Ngũ Quỷ Vận Tài',
        giaiThich:
          'thế "Ngũ Quỷ vận tài" nổi tiếng: trí biến hóa gặp sao chính tài, tiền đến từ ý tưởng và nước đi khác người',
      },
      sinh_khi: {
        ten: 'Quỷ Ngộ Sinh Khí',
        giaiThich:
          'tinh thần lạc quan của Sinh Khí hóa giải tính đa nghi, giữ lại sự nhạy bén hiếm có',
      },
    },
    cheHoaGeneric:
      'Cát tinh đứng liền sau thu phục tính đa nghi, giữ lại trí sáng tạo nhạy bén.',
  },
  tuyet_menh: {
    subtitle: 'Biến "Liều Lĩnh" thành "Bản Lĩnh Dám Đánh Lớn"',
    banChat:
      'Tuyệt Mệnh là sao cực đoan nhất — chủ về quyết liệt, được ăn cả ngã về không; không chế hóa thì hao tài, nhưng chế hóa được thì đây là khí chất của người dám làm việc lớn.',
    tamPhap:
      'Chỉ "đánh lớn" ở lĩnh vực mình hiểu sâu; đặt sẵn giới hạn dừng lỗ trước khi vào việc, tuyệt đối tránh cờ bạc may rủi.',
    thucHanh:
      'Hợp môi trường cạnh tranh khốc liệt: đầu tư, thể thao, kinh doanh đối đầu — dùng sự quyết đoán làm lợi thế, lấy kỷ luật làm phanh hãm.',
    cheHoaBy: {
      thien_y: {
        ten: 'Tuyệt Xứ Phùng Sinh',
        giaiThich:
          'sao chính tài đứng ngay sau giữ cửa: dám đánh lớn nhưng vẫn có "két sắt" Thiên Y thu tiền về — cấu trúc của giới đầu tư bản lĩnh',
      },
      dien_nien: {
        ten: 'Cương Nhu Tương Tế',
        giaiThich:
          'sự bền bỉ, kỷ luật của Diên Niên ghìm cương tính liều, chuyển thành sức bật đường dài',
      },
      sinh_khi: {
        ten: 'Hiểm Trung Đắc Cứu',
        giaiThich:
          'quý nhân xuất hiện đúng lúc gay cấn — vào việc khó luôn có người chìa tay đỡ',
      },
    },
    cheHoaGeneric:
      'Cát tinh đứng liền sau ghìm bớt tính cực đoan, giữ lại sự quyết đoán hiếm có.',
  },
};

const CAT_STARS = new Set<StarId>(['sinh_khi', 'thien_y', 'dien_nien', 'phuc_vi']);

function pairName(p: PairAnalysis): string {
  return `${p.star.nameVi} (${p.label})`;
}

/** Tìm cặp cát tinh đứng liền sau một cặp hung (cơ chế "cát trấn hung"). */
function catAfter(pairs: PairAnalysis[], index: number): PairAnalysis | null {
  const next = pairs[index + 1];
  if (next && CAT_STARS.has(next.star.id)) return next;
  return null;
}

export function buildHoaGiai(r: BoiSimResult): HoaGiaiResult {
  const tips: HoaGiaiTip[] = [];

  for (const starId of HUNG_ORDER) {
    const meta = HUNG_META[starId];
    const hungPairs = r.pairs
      .map((p, i) => ({ p, i }))
      .filter(({ p }) => p.star.id === starId);
    if (hungPairs.length === 0 || !meta) continue;

    const labels = hungPairs.map(({ p }) => p.label);
    const star = hungPairs[0].p.star;

    // Cơ chế tự hóa giải: ưu tiên cặp có cát tinh đứng liền sau
    let cheHoa: string | undefined;
    let cheHoaStrong = false;
    for (const { p, i } of hungPairs) {
      const guard = catAfter(r.pairs, i);
      if (!guard) continue;
      const named = meta.cheHoaBy[guard.star.id];
      cheHoaStrong = true;
      cheHoa = named
        ? `Ngay liền sau cặp ${p.label} là ${pairName(guard)} — thế trận "${named.ten}": ${named.giaiThich}.`
        : `Ngay liền sau cặp ${p.label} là ${pairName(guard)} — ${meta.cheHoaGeneric}`;
      break;
    }
    if (!cheHoa) {
      // Không có cát tinh liền sau → xét tổ hợp chế hóa chung của dãy
      const combo = r.combos.find(
        (c) => c.kind === 'che_hoa' && c.pairs.includes(labels[0]),
      );
      if (combo) {
        cheHoa = `${combo.title} — ${combo.detail}`;
        cheHoaStrong = true;
      } else if (r.catPairs > r.hungPairs) {
        cheHoa = `Toàn dãy có ${r.catPairs} cặp cát tinh áp đảo ${r.hungPairs} cặp hung — hung khí của ${star.nameVi} bị pha loãng trong tổng thể nghiêng cát.`;
      }
    }

    tips.push({
      starId,
      title: `Hóa giải ${star.nameVi} (${labels.join(', ')})`,
      subtitle: meta.subtitle,
      pairLabels: labels,
      banChat: meta.banChat,
      cheHoa,
      cheHoaStrong,
      tamPhap: meta.tamPhap,
      thucHanh: meta.thucHanh,
    });
  }

  // ---- Kịch bản ứng dụng thực tế -----------------------------------------
  const s = r.starCounts;
  const tailStar = r.tail.star?.id;
  const scenarios: UseCaseScenario[] = [];

  if (s.dien_nien > 0 && s.thien_y > 0) {
    scenarios.push({
      title: 'Trong đàm phán kinh doanh',
      detail:
        'Thế Diên Niên + Thiên Y (vừa thủ tài vừa chiêu tài) giúp chủ nhân giữ thế chủ động trên bàn đàm phán: nói có trọng lượng, chốt hợp đồng mà vẫn giữ được điều khoản có lợi.',
    });
  }
  if (tailStar === 'thien_y' || tailStar === 'sinh_khi') {
    scenarios.push({
      title: 'Khi gọi giao dịch lớn, gọi đối tác quan trọng',
      detail: `Đuôi sim (${r.tail.last3}) đóng ${r.tail.star?.nameVi} — phần quyết định mạnh nhất của dãy số. Ưu tiên dùng số này cho các cuộc gọi hệ trọng: chốt đơn giá trị cao, gọi cấp trên, đối tác lớn để nhận trợ lực may mắn nhất.`,
    });
  }
  if (s.luc_sat > 0) {
    scenarios.push({
      title: 'Trong ngoại giao, chăm sóc khách hàng',
      detail:
        'Lục Sát (đã được chế hóa) mang lại sự khéo léo, tinh tế trong giao tiếp — cảm nhận nhanh tâm lý đối phương, hợp tiếp khách, xây quan hệ thân thiết.',
    });
  }
  if (s.hoa_hai > 0) {
    scenarios.push({
      title: 'Khi cần thuyết trình, tư vấn, bán hàng',
      detail:
        'Khẩu tài của Họa Hại phát huy đúng chỗ: nói chuyện có lửa, dễ cuốn người nghe — dùng làm số hotline, số chốt đơn rất hợp.',
    });
  }
  if (s.ngu_quy > 0 && scenarios.length < 4) {
    scenarios.push({
      title: 'Khi cần ý tưởng đột phá',
      detail:
        'Trí biến hóa của Ngũ Quỷ hợp lúc brainstorm, thiết kế sản phẩm, tìm nước đi khác biệt so với đối thủ.',
    });
  }
  if (s.sinh_khi > 0 && scenarios.length < 4) {
    scenarios.push({
      title: 'Khi khởi sự việc mới, cần quý nhân',
      detail:
        'Sinh Khí chủ quý nhân và cơ hội — giai đoạn mở dự án, tìm người đồng hành, xin giấy phép… dùng số này liên hệ sẽ thuận hơn.',
    });
  }
  if (scenarios.length === 0) {
    scenarios.push({
      title: 'Trong công việc thường nhật',
      detail:
        'Cấu trúc sao của dãy số thiên về ổn định — hợp dùng làm số liên lạc chính, duy trì quan hệ và công việc đều đặn.',
    });
  }

  const allCatMessage =
    tips.length === 0
      ? 'Dãy số này không có hung tinh nào cần hóa giải — toàn bộ các cặp quái số đều đóng cát tinh. Theo sách "vô hung thì bất cát", một dãy toàn cát hiếm gặp như vậy là của để dành: cát khí thuần, dùng ổn định lâu dài, chỉ cần giữ tâm thái vững và hợp đạo làm ăn để cát khí phát huy trọn vẹn.'
      : undefined;

  return { tips, scenarios: scenarios.slice(0, 4), allCatMessage };
}
