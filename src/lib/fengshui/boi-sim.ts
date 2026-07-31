/**
 * Bói SIM · số điện thoại — adapter trên engine Bát Cực Linh Số dùng chung
 * (src/lib/fengshui/bat-cuc.ts). Phần riêng của SIM: parse số điện thoại VN,
 * 81 Số Lý (4 số cuối), gợi ý nghề nghiệp và luận giải văn bản.
 */

import { getBieuLy, normalizeBieuLy } from '@/lib/fengshui/tinh-danh';
import {
  ASPECT_LABELS,
  ASPECT_ORDER,
  STARS,
  STAR_ORDER,
  analyzeBatCuc,
  elementLabel,
  elementRelation,
  getNapAm,
  type AspectId,
  type BatCucAnalysis,
  type ComboNote,
  type Element,
  type PairAnalysis,
  type StarId,
  type StarInfo,
  type StarKind,
  type TailAnalysis,
} from '@/lib/fengshui/bat-cuc';

export {
  ASPECT_LABELS,
  ASPECT_ORDER,
  STARS,
  STAR_ORDER,
  elementLabel,
  getNapAm,
};
export type {
  AspectId,
  ComboNote,
  Element,
  PairAnalysis,
  StarId,
  StarInfo,
  StarKind,
  TailAnalysis,
};

export interface BoiSimResult {
  digits: number[];
  display: string;
  pairs: PairAnalysis[];
  starCounts: Record<StarId, number>;
  catPairs: number;
  hungPairs: number;
  /** điểm Du Niên Bát Cực (đã gồm 0/5, tổ hợp, đuôi) */
  duNienScore: number;
  combos: ComboNote[];
  tail: TailAnalysis;
  aspects: { id: AspectId; label: string; score: number }[];
  /** ngành nghề hợp với cấu trúc sao của sim */
  careers: string[];
  /** luận giải tổng hợp theo đoạn */
  luanGiai: string[];
  soLy81: number;
  soLyMeta: ReturnType<typeof getBieuLy>;
  soLyElement: Element;
  amCount: number;
  duongCount: number;
  amDuongScore: number;
  tongNut: number;
  patterns: string[];
  overallScore: number;
  verdict: 'tot' | 'kha' | 'trung_binh' | 'yeu';
  advice: string;
  birthYear?: number;
  napAm?: { name: string; element: Element };
  elementRelation?: {
    sim: Element;
    menh: Element;
    relation: string;
    score: number;
  };
}

export function parsePhoneDigits(raw: string): number[] | null {
  const digits = raw.replace(/\D/g, '');
  let d = digits;
  if (d.startsWith('84') && d.length >= 11) d = '0' + d.slice(2);
  if (d.length < 9 || d.length > 11) return null;
  return d.split('').map((c) => Number(c));
}

export function formatPhone(digits: number[]): string {
  const s = digits.join('');
  if (s.length === 10) return `${s.slice(0, 4)} ${s.slice(4, 7)} ${s.slice(7)}`;
  if (s.length === 11) return `${s.slice(0, 4)} ${s.slice(4, 7)} ${s.slice(7)}`;
  return s.replace(/(\d{3,4})(?=\d)/g, '$1 ').trim();
}

function soLyElement(n: number): Element {
  const d = n % 10;
  if (d === 1 || d === 2) return 'moc';
  if (d === 3 || d === 4) return 'hoa';
  if (d === 5 || d === 6) return 'tho';
  if (d === 7 || d === 8) return 'kim';
  return 'thuy';
}

function suggestCareers(starCounts: Record<StarId, number>): string[] {
  const careers: string[] = [];
  if (starCounts.sinh_khi >= 2 || starCounts.sinh_khi + starCounts.hoa_hai >= 3)
    careers.push(
      'Kinh doanh, bán hàng, đối ngoại — Sinh Khí (quý nhân) và Họa Hại (khẩu tài) trợ lực cho nghề dùng lời nói.',
    );
  if (starCounts.dien_nien >= 2)
    careers.push(
      'Quản lý, điều hành, chuyên môn kỹ thuật cao — Diên Niên chủ năng lực lãnh đạo và thủ tài.',
    );
  if (starCounts.thien_y >= 2)
    careers.push(
      'Tài chính, thương mại, y dược — Thiên Y chủ chính tài và trí tuệ thiện lương.',
    );
  if (starCounts.ngu_quy >= 2)
    careers.push(
      'Sáng tạo, nghệ thuật, công nghệ, nghiên cứu — Ngũ Quỷ chủ tài hoa và ý tưởng đột phá.',
    );
  if (starCounts.luc_sat >= 2)
    careers.push(
      'Dịch vụ, giao tế, thẩm mỹ — Lục Sát giỏi ngoại giao và có gu thẩm mỹ cao.',
    );
  if (starCounts.tuyet_menh >= 2)
    careers.push(
      'Đầu tư, thể thao, môi trường cạnh tranh khốc liệt — Tuyệt Mệnh hợp người bản lĩnh dám làm dám chịu (rủi ro cao).',
    );
  if (careers.length === 0)
    careers.push(
      'Cấu trúc sao phân tán, không thiên lệch nghề nào rõ — hợp công việc ổn định, đa năng.',
    );
  return careers;
}

function buildLuanGiai(a: BatCucAnalysis): string[] {
  const { pairs, starCounts, catPairs, hungPairs, combos, tail, aspects } = a;
  const paras: string[] = [];

  const dominant = STAR_ORDER.filter((id) => starCounts[id] > 0).sort(
    (x, y) => starCounts[y] - starCounts[x],
  )[0];
  const domStar = dominant ? STARS[dominant] : undefined;
  let p1 = `Dãy số tách được ${pairs.length} cặp quái số: ${catPairs} cặp cát tinh và ${hungPairs} cặp hung tinh.`;
  if (domStar) {
    p1 += ` Từ trường chủ đạo là ${domStar.nameVi} (${domStar.nameHan}) — ${domStar.chuVe.toLowerCase()}. ${domStar.meaning}`;
  }
  paras.push(p1);

  const taiLoc = aspects.find((x) => x.id === 'tai_loc')!;
  const suNghiep = aspects.find((x) => x.id === 'su_nghiep')!;
  const hasThienY = starCounts.thien_y > 0;
  const hasDienNien = starCounts.dien_nien > 0;
  let p2 = `Về tài lộc (${taiLoc.score}/100) và sự nghiệp (${suNghiep.score}/100): `;
  if (hasThienY && hasDienNien) {
    p2 +=
      'dãy số hội đủ Thiên Y (biết kiếm tiền) và Diên Niên (biết giữ tiền) — theo sách đây là cấu trúc tài chính lý tưởng, kiếm được và tích lũy được.';
  } else if (hasThienY) {
    p2 +=
      'có Thiên Y chủ chính tài nên đường kiếm tiền thuận, nhưng thiếu Diên Niên giữ tiền — sách nhắc "chỉ biết kiếm mà không biết giữ thì tiền cũng tan", nên chú trọng tích lũy, tránh tiêu pha theo cảm hứng.';
  } else if (hasDienNien) {
    p2 +=
      'có Diên Niên chủ thủ tài và năng lực chuyên môn — tiền đến từ thực lực, tích lũy bền; nếu thêm nguồn thu mới cần chủ động tìm kiếm vì thiếu Thiên Y chiêu tài.';
  } else if (starCounts.sinh_khi > 0) {
    p2 +=
      'không có Thiên Y / Diên Niên nhưng có Sinh Khí — tài lộc đến qua quý nhân và cơ hội; nên giữ quan hệ tốt và nắm bắt thời cơ.';
  } else {
    p2 +=
      'dãy số thiếu vắng các sao tài (Thiên Y, Diên Niên, Sinh Khí) — đường tài lộc phụ thuộc nhiều vào nỗ lực tự thân, cần thận trọng trong đầu tư.';
  }
  if (starCounts.tuyet_menh > 0) {
    p2 += ` Lưu ý: có ${starCounts.tuyet_menh} cặp Tuyệt Mệnh — sao phá tài, kỵ đầu tư mạo hiểm và cờ bạc.`;
  }
  paras.push(p2);

  const tinhCam = aspects.find((x) => x.id === 'tinh_cam')!;
  const sucKhoe = aspects.find((x) => x.id === 'suc_khoe')!;
  let p3 = `Về tình cảm (${tinhCam.score}/100) và sức khỏe (${sucKhoe.score}/100): `;
  const loveNotes: string[] = [];
  if (starCounts.thien_y > 0)
    loveNotes.push('Thiên Y chủ hôn nhân viên mãn, tình cảm chân thành');
  if (starCounts.dien_nien > 0)
    loveNotes.push('Diên Niên mang sự chung thủy, trách nhiệm');
  if (starCounts.luc_sat > 0)
    loveNotes.push(
      'Lục Sát báo đào hoa xấu, tình cảm dễ vướng rắc rối, cần giữ ranh giới rõ ràng',
    );
  if (starCounts.ngu_quy > 0)
    loveNotes.push('Ngũ Quỷ dễ sinh nghi ngờ trong quan hệ');
  if (starCounts.hoa_hai > 0)
    loveNotes.push('Họa Hại dễ khắc khẩu, cãi vã với người thân');
  p3 +=
    (loveNotes.length ? loveNotes.join('; ') : 'không có sao chi phối rõ rệt') +
    '.';
  const healthStars = pairs
    .map((p) => p.star)
    .filter((s, i, arr) => arr.findIndex((x) => x.id === s.id) === i)
    .map((s) => s.sucKhoe);
  if (healthStars.length) p3 += ` Sức khỏe cần lưu ý: ${healthStars[0]}`;
  paras.push(p3);

  let p4 = '';
  const goodCombos = combos.filter((c) => c.kind !== 'hung');
  const badCombos = combos.filter((c) => c.kind === 'hung');
  if (goodCombos.length) {
    p4 += `Dãy số có ${goodCombos.length} tổ hợp chế hóa/cộng hưởng tốt (${goodCombos.map((c) => c.title.split('—')[0].trim()).join('; ')}) — các hung tinh nếu có đều được kiềm chế phần nào. `;
  }
  if (badCombos.length) {
    p4 += `Cần lưu ý ${badCombos.length} tổ hợp bất lợi: ${badCombos.map((c) => c.title).join('; ')}. `;
  }
  p4 += `Ba số cuối (${tail.last3}) là phần quyết định mạnh nhất của sim theo sách. `;
  if (tail.warning) p4 += tail.warning;
  else if (tail.notes.length) p4 += tail.notes[0];
  paras.push(p4.trim());

  return paras;
}

export function analyzeBoiSim(
  rawPhone: string,
  birthYear?: number,
): BoiSimResult | { error: string } {
  const digits = parsePhoneDigits(rawPhone);
  if (!digits) {
    return {
      error: 'Số điện thoại không hợp lệ. Nhập 9–11 chữ số (VD: 0912345678).',
    };
  }

  const core = analyzeBatCuc(digits, { applyTailTaboo: true });
  if ('error' in core) {
    return {
      error:
        'Dãy số có quá nhiều số 0/5 liên tiếp, không đủ cặp quái số để luận theo Bát Cực Linh Số.',
    };
  }
  if (core.pairs.length < 2) {
    return {
      error:
        'Dãy số có quá nhiều số 0/5 liên tiếp, không đủ cặp quái số để luận theo Bát Cực Linh Số.',
    };
  }

  // 81 Số Lý theo 4 số cuối + hợp mệnh theo hành của số lý (đặc thù SIM)
  const last4 = Number(digits.slice(-4).join(''));
  const soLy81 = normalizeBieuLy(last4 % 80 === 0 ? 80 : last4 % 80);
  const soLyMeta = getBieuLy(soLy81);
  const soLyEl = soLyElement(soLy81);

  let elementRelationResult: BoiSimResult['elementRelation'];
  let napAm: BoiSimResult['napAm'];
  let nguHanhScore = 70;
  if (birthYear && birthYear >= 1900 && birthYear <= 2100) {
    napAm = getNapAm(birthYear);
    const rel = elementRelation(soLyEl, napAm.element);
    nguHanhScore = rel.score;
    elementRelationResult = {
      sim: soLyEl,
      menh: napAm.element,
      relation: rel.relation.replace('Số ', 'Sim '),
      score: rel.score,
    };
  }

  const nutScore =
    core.tongNut === 1 || core.tongNut === 6 || core.tongNut === 8 ? 75 : 55;

  // Trọng số tổng: Bát Cực Linh Số là trục chính (70%),
  // các hệ tham khảo phụ chiếm phần còn lại.
  const soLyScore = soLyMeta.score * 10;
  const overallScore = Math.round(
    core.duNienScore * 0.7 +
      soLyScore * 0.1 +
      nguHanhScore * 0.08 +
      core.amDuongScore * 0.07 +
      nutScore * 0.05,
  );

  let verdict: BoiSimResult['verdict'] = 'trung_binh';
  if (overallScore >= 80) verdict = 'tot';
  else if (overallScore >= 65) verdict = 'kha';
  else if (overallScore >= 45) verdict = 'trung_binh';
  else verdict = 'yeu';

  const careers = suggestCareers(core.starCounts);
  const luanGiai = buildLuanGiai(core);

  const tailHung = core.pairs
    .filter((p) => p.isTail && p.star.kind === 'hung')
    .map((p) => p.star.nameVi);

  let advice =
    'Số điện thoại là vật mang theo hằng ngày — dùng để tham khảo trường khí, không thay cho nỗ lực và phúc đức.';
  if (verdict === 'tot') {
    advice =
      'Cấu trúc Bát Cực nghiêng cát rõ rệt — đây là sim đẹp, nên giữ dùng lâu dài. Vẫn cần hợp đạo làm ăn và giữ tâm an để cát khí phát huy.';
  } else if (verdict === 'kha') {
    advice =
      'Sim khá tốt, dùng ổn định được. Nếu có dịp đổi, ưu tiên dãy có Thiên Y hoặc Diên Niên đóng ở 3 số cuối để vừa kiếm vừa giữ được tiền.';
  } else if (verdict === 'trung_binh') {
    advice =
      'Sim ở mức trung bình — cát hung đan xen. Không cần vội đổi; nếu chọn sim mới, tránh đuôi 0/05 và tránh hung tinh (nhất là Tuyệt Mệnh) đóng ở cặp cuối.';
  } else {
    advice =
      'Hung khí chiếm ưu thế' +
      (tailHung.length ? ` (đuôi sim có ${tailHung.join(', ')})` : '') +
      '. Theo sách, nên cân nhắc đổi sang dãy có cát tinh (Thiên Y, Diên Niên, Sinh Khí) ở 3 số cuối; trước mắt giữ tâm thái vững, thận trọng chuyện tiền bạc, giấy tờ.';
  }

  return {
    digits,
    display: formatPhone(digits),
    pairs: core.pairs,
    starCounts: core.starCounts,
    catPairs: core.catPairs,
    hungPairs: core.hungPairs,
    duNienScore: core.duNienScore,
    combos: core.combos,
    tail: core.tail,
    aspects: core.aspects,
    careers,
    luanGiai,
    soLy81,
    soLyMeta,
    soLyElement: soLyEl,
    amCount: core.amCount,
    duongCount: core.duongCount,
    amDuongScore: core.amDuongScore,
    tongNut: core.tongNut,
    patterns: core.patterns,
    overallScore,
    verdict,
    advice,
    birthYear,
    napAm,
    elementRelation: elementRelationResult,
  };
}
