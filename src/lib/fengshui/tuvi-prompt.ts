import {
  HOROSCOPE_SCOPE_LABELS,
  formatCanChi,
  formatStarLabel,
  relatedPalaceIndexes,
  type HoroscopeScopeKey,
  type IztroChartView,
  type IztroHoroscopeView,
  type IztroPalaceView,
  type IztroStarView,
} from '@/lib/fengshui/iztro-chart';

const SCOPE_ORDER: HoroscopeScopeKey[] = [
  'decadal',
  'age',
  'yearly',
  'monthly',
  'daily',
  'hourly',
];

function starLine(star: IztroStarView): string {
  return formatStarLabel(star);
}

function starsBlock(label: string, stars: IztroStarView[]): string {
  if (!stars.length) return '';
  return `  ${label}: ${stars.map(starLine).join(', ')}`;
}

function palaceBlock(
  palace: IztroPalaceView,
  byIndex: Map<number, IztroPalaceView>,
): string {
  const flags = [
    palace.isSoulPalace ? 'CUNG MỆNH' : '',
    palace.isBodyPalace ? 'CUNG THÂN' : '',
  ]
    .filter(Boolean)
    .join(', ');

  const rel = relatedPalaceIndexes(palace.index);
  const opposite = byIndex.get(rel.opposite);
  const trio = rel.trio
    .map((i) => byIndex.get(i))
    .filter(Boolean) as IztroPalaceView[];

  const lines = [
    `### Cung ${palace.name} (index ${palace.index})${flags ? ` [${flags}]` : ''}`,
    `- Can chi: ${formatCanChi(palace.heavenlyStem, palace.earthlyBranch)}`,
    starsBlock('Chính tinh', palace.majorStars),
    starsBlock('Phụ tinh', palace.minorStars),
    starsBlock('Sao khác', palace.adjectiveStars),
    [
      palace.changsheng12 && `TS:${palace.changsheng12}`,
      palace.boshi12 && `BS:${palace.boshi12}`,
      palace.jiangqian12 && `TQ:${palace.jiangqian12}`,
      palace.suiqian12 && `Tuế:${palace.suiqian12}`,
    ]
      .filter(Boolean)
      .join(' · ')
      ? `  Vòng 12: ${[
          palace.changsheng12 && `TS:${palace.changsheng12}`,
          palace.boshi12 && `BS:${palace.boshi12}`,
          palace.jiangqian12 && `TQ:${palace.jiangqian12}`,
          palace.suiqian12 && `Tuế:${palace.suiqian12}`,
        ]
          .filter(Boolean)
          .join(' · ')}`
      : '',
    `- Đại hạn: ${palace.decadal.range[0]}–${palace.decadal.range[1]}${
      palace.decadal.heavenlyStem
        ? ` · ${formatCanChi(palace.decadal.heavenlyStem, palace.decadal.earthlyBranch)}`
        : ''
    }`,
    palace.ages.length
      ? `- Các tuổi tiểu hạn trong cung: ${palace.ages.join(', ')}`
      : '',
    `- Cung đối: ${opposite ? `${opposite.name} (${formatCanChi(opposite.heavenlyStem, opposite.earthlyBranch)})` : '—'}`,
    `- Tam hợp: ${
      trio.length
        ? trio
            .map(
              (p) =>
                `${p.name} (${formatCanChi(p.heavenlyStem, p.earthlyBranch)})`,
            )
            .join('; ')
        : '—'
    }`,
  ];

  return lines.filter(Boolean).join('\n');
}

function scopeBlock(
  key: HoroscopeScopeKey,
  horoscope: IztroHoroscopeView,
  byIndex: Map<number, IztroPalaceView>,
): string {
  const scope = horoscope.scopes[key];
  const focus = byIndex.get(scope.index);
  const flowLines: string[] = [];
  for (let i = 0; i < 12; i++) {
    const stars = scope.starsByPalaceIndex[i] ?? [];
    if (!stars.length) continue;
    const palace = byIndex.get(i);
    flowLines.push(
      `  - ${palace?.name ?? `cung#${i}`}: ${stars.map(starLine).join(', ')}`,
    );
  }

  return [
    `### ${HOROSCOPE_SCOPE_LABELS[key]}`,
    `- Can chi hạn: ${formatCanChi(scope.heavenlyStem, scope.earthlyBranch)}`,
    `- Cung đóng (Mệnh của hạn): ${scope.focusPalaceName || focus?.name || '—'} (index ${scope.index})`,
    scope.mutagen?.length
      ? `- Tứ hóa của hạn: ${scope.mutagen.join(', ')}`
      : '',
    flowLines.length ? `- Sao lưu theo cung:\n${flowLines.join('\n')}` : '',
  ]
    .filter(Boolean)
    .join('\n');
}

/** Chuỗi ngữ cảnh chi tiết lá số để luận giải. */
export function buildTuViPromptContext(
  chart: IztroChartView,
  horoscope: IztroHoroscopeView | null,
): string {
  const byIndex = new Map<number, IztroPalaceView>();
  for (const p of chart.palaces) {
    if (p.index >= 0) byIndex.set(p.index, p);
  }

  const parts: string[] = [
    '# DỮ LIỆU LÁ SỐ TỬ VI ĐẨU SỐ',
    '',
    '## Thông tin gốc',
    `- Họ tên: ${chart.fullName}`,
    `- Giới tính: ${chart.gender}`,
    `- Loại lịch nhập: ${chart.calendarLabel}`,
    `- Phương pháp chia năm: ${chart.yearDivideLabel}`,
    `- Dương lịch: ${chart.solarDate}`,
    `- Âm lịch: ${chart.lunarDate}`,
    `- Tứ trụ: ${chart.chineseDate}`,
    `- Giờ sinh: ${chart.time} (${chart.timeRange})`,
    `- Ngũ hành cục: ${chart.fiveElementsClass}`,
    `- Chủ mệnh: ${chart.soul}`,
    `- Chủ thân: ${chart.body}`,
    `- Con giáp: ${chart.zodiac}`,
    `- Cung hoàng đạo: ${chart.sign}`,
    '',
    '## Mười hai cung (chi tiết sao, đại hạn, đối cung, tam hợp)',
    ...chart.palaces
      .filter((p) => p.index >= 0)
      .sort((a, b) => a.index - b.index)
      .map((p) => palaceBlock(p, byIndex) + '\n'),
  ];

  if (horoscope) {
    parts.push(
      '## Thời gian xem / vận hạn hiện tại',
      `- Ngày xem (dương lịch): ${horoscope.solarDate}`,
      `- Ngày xem (âm lịch): ${horoscope.lunarDate}`,
      `- Giờ xem: ${horoscope.timeLabel} (timeIndex ${horoscope.timeIndex})`,
      horoscope.nominalAge != null
        ? `- Tuổi hư tại thời điểm xem: ${horoscope.nominalAge}`
        : '',
      '',
      '## Chi tiết từng tầng hạn/lưu',
      ...SCOPE_ORDER.map(
        (key) => scopeBlock(key, horoscope, byIndex) + '\n',
      ),
    );
  } else {
    parts.push(
      '## Thời gian xem / vận hạn hiện tại',
      '- (Chưa có dữ liệu horoscope)',
    );
  }

  return parts.filter(Boolean).join('\n');
}

export function buildTuViSystemPrompt(templeName: string): string {
  const place = (templeName || 'chùa').trim() || 'chùa';
  return `Bạn đang nói chuyện với Phật tử / người hỏi với vai trò trụ trì ${place}, người trực tiếp luận giải lá số Tử Vi Đẩu Số theo phương pháp và kinh nghiệm cá nhân gắn với ngôi chùa.

Giọng văn:
- Xưng hô như trụ trì đang tư vấn tận tình, ấm áp, gần gũi nhưng chuyên sâu.
- KHÔNG bao giờ nhắc tới AI, chatbot, mô hình ngôn ngữ, DeepSeek, OpenAI, hay bất kỳ hệ thống máy nào.
- Không nói “theo dữ liệu được cung cấp”; hãy nói như đã xem lá số của người hỏi.

Nhiệm vụ luận giải:
1. Dựa HOÀN TOÀN trên nội dung lá số trong ngữ cảnh (không bịa sao/cung không có).
2. Xác định và giải thích các cách cục liên quan (Sát Phá Tham, Cơ Nguyệt Đồng Lương, Tử Phủ Vũ Tướng, Tham Vũ Liêm, Khoa Quyền Lộc, sát tinh hội chiếu…), nêu rõ sao nào ở cung nào tạo thành cách cục.
3. Luận tứ hóa (Lộc/Quyền/Khoa/Kỵ), độ sáng (Miếu/Vượng/Đắc/Hãm…), cung đối và tam hợp khi liên quan.
4. Kết hợp vận hạn tại thời gian xem (đại hạn, tiểu hạn, lưu niên–nguyệt–nhật–thì) khi câu hỏi liên quan vận hạn.
5. Trả lời có mở đầu ngắn, các mục rõ ràng, kết luận thực tế; nhắc mức độ tham khảo, khuyến khích thiện tâm / tham vấn thêm khi đại sự.
6. Nếu thiếu chi tiết để kết luận, nói thẳng thay vì suy đoán.
7. Kết thúc ngắn gọn theo tinh thần chùa (chúc an lành / tinh tấn) khi phù hợp.

BẮT BUỘC — cuối MỖI câu trả lời (kể cả câu trả lời lần 2, lần 3, mọi lượt tiếp theo), SAU phần luận giải phải có khối gợi ý. Không được bỏ qua dù người hỏi đang hỏi tiếp theo gợi ý trước đó. Đúng định dạng:

<<<goi-y>>>
Câu hỏi gợi ý 1 (ngắn, cụ thể, liên quan nội dung vừa luận, khác câu vừa hỏi)
Câu hỏi gợi ý 2
Câu hỏi gợi ý 3
<<<het-goi-y>>>

Trong khối chỉ có đúng 3 dòng câu hỏi thuần túy: không đánh số, không gạch đầu dòng, không lời dẫn.`;
}

/** Prompt luận chuyên sâu 1 cung — không khối gợi ý (dùng cho bộ 12 cung / xuất HTML). */
export function buildPalaceSystemPrompt(
  templeName: string,
  palaceName: string,
): string {
  const place = (templeName || 'chùa').trim() || 'chùa';
  return `Bạn đang nói chuyện với Phật tử với vai trò trụ trì ${place}, luận giải chuyên sâu CUNG ${palaceName} trên lá số Tử Vi Đẩu Số.

Giọng văn:
- Xưng hô như trụ trì tư vấn tận tình, ấm áp, chuyên sâu.
- KHÔNG nhắc AI, chatbot, mô hình ngôn ngữ hay hệ thống máy.
- Không nói “theo dữ liệu được cung cấp”; nói như đã xem lá số.

Nhiệm vụ (chỉ tập trung cung ${palaceName}):
1. Luận chính tinh, phụ tinh, sao khác trong cung — độ sáng (Miếu/Vượng/Đắc/Hãm…), tứ hóa nếu có.
2. Liên hệ cung đối và tam hợp với cung này; nêu ảnh hưởng tới chủ đề của cung ${palaceName}.
3. Đại hạn của cung này (tuổi bắt đầu–kết thúc) và ý nghĩa khi vận hạn vào cung.
4. Liên hệ với cung Mệnh khi phù hợp (cách cục, xung hợp).
5. Kết luận thực tế, ngắn gọn; nhắc mức độ tham khảo.
6. KHÔNG bịa sao/cung không có trong ngữ cảnh.
7. KHÔNG thêm khối gợi ý câu hỏi, không dùng thẻ <<<goi-y>>>.
8. Trả lời bằng tiếng Việt, có mục rõ ràng (có thể dùng ## / ###).`;
}

function cleanSuggestionLine(line: string): string {
  return line
    .replace(/^[-*•]\s*/, '')
    .replace(/^\d+[.)]\s*/, '')
    .replace(/^["「『]+|["」』]+$/g, '')
    .trim();
}

/** Tách phần luận giải và các câu hỏi gợi ý cuối câu trả lời. */
export function splitTuViReply(text: string): {
  body: string;
  suggestions: string[];
} {
  const raw = text || '';

  const closed = raw.match(/<<<goi-y>>>\s*([\s\S]*?)\s*<<<het-goi-y>>>/i);
  if (closed) {
    const suggestions = closed[1]
      .split('\n')
      .map(cleanSuggestionLine)
      .filter((line) => line.length > 2)
      .slice(0, 4);
    return {
      body: raw.replace(/<<<goi-y>>>\s*[\s\S]*?\s*<<<het-goi-y>>>/i, '').trim(),
      suggestions,
    };
  }

  // Model quên thẻ đóng
  const openOnly = raw.match(/<<<goi-y>>>\s*([\s\S]+)$/i);
  if (openOnly) {
    const suggestions = openOnly[1]
      .split('\n')
      .map(cleanSuggestionLine)
      .filter((line) => line.length > 2 && !/^<<<het/i.test(line))
      .slice(0, 4);
    return {
      body: raw.replace(/<<<goi-y>>>[\s\S]*$/i, '').trim(),
      suggestions,
    };
  }

  // Fallback: mục "Câu hỏi tiếp theo" / "Quý vị có thể hỏi"
  const heading = raw.match(
    /(?:#{1,3}\s*)?(?:câu hỏi tiếp|quý vị có thể hỏi|hỏi tiếp|gợi ý)[^\n]*\n([\s\S]+)$/i,
  );
  if (heading) {
    const suggestions = heading[1]
      .split('\n')
      .map(cleanSuggestionLine)
      .filter((line) => line.length > 2)
      .slice(0, 4);
    if (suggestions.length >= 2) {
      return {
        body: raw.slice(0, heading.index).trim(),
        suggestions,
      };
    }
  }

  return { body: raw.trim(), suggestions: [] };
}

const FOLLOWUP_POOL = [
  'Luận sâu hơn cung Mệnh',
  'Cung Tài Bạch năm nay thế nào?',
  'Quan Lộc và công danh ra sao?',
  'Phu Thê / tình duyên có điểm gì đáng chú ý?',
  'Tật Ách và sức khỏe cần lưu tâm gì?',
  'Đại hạn hiện tại thuận hay nghịch?',
  'Lưu niên năm xem nên kiêng gì?',
  'Tứ hóa trong lá số ảnh hưởng thế nào?',
  'Cách cục chính của lá số là gì?',
  'Cung đối của Mệnh nói lên điều gì?',
  'Cung Phúc Đức có điểm lành nào?',
  'Nô Bộc và quý nhân hỗ trợ thế nào?',
  'Điền Trạch / nhà cửa cần lưu ý gì?',
  'Tiểu hạn năm nay nên hướng tới việc gì?',
];

/** Gợi ý thông minh khi model quên khối goi-y — luôn đủ 3 câu, khác câu vừa hỏi. */
export function pickSmartFollowUps(
  lastQuestion: string,
  replyBody: string,
  count = 3,
): string[] {
  const blob = `${lastQuestion}\n${replyBody}`.toLowerCase();
  const filtered = FOLLOWUP_POOL.filter((p) => {
    const key = p.slice(0, 10).toLowerCase();
    return !blob.includes(key) && !lastQuestion.includes(p.slice(0, 8));
  });
  const pool = filtered.length >= count ? filtered : FOLLOWUP_POOL;
  let h = 0;
  for (let i = 0; i < lastQuestion.length; i++) {
    h = (h + lastQuestion.charCodeAt(i) * (i + 1)) % 997;
  }
  const start = pool.length ? h % pool.length : 0;
  const out: string[] = [];
  for (let i = 0; i < pool.length && out.length < count; i++) {
    const item = pool[(start + i) % pool.length];
    if (!out.includes(item)) out.push(item);
  }
  return out;
}

/** Đảm bảo mọi câu trả lời đều có khối gợi ý (bổ sung nếu thiếu). */
export function ensureFollowUpBlock(
  fullText: string,
  lastUserQuestion: string,
): string {
  const { body, suggestions } = splitTuViReply(fullText);
  const cleanBody = body.trim() || fullText.trim();
  const finalSuggestions =
    suggestions.length >= 2
      ? suggestions.slice(0, 3)
      : pickSmartFollowUps(lastUserQuestion, cleanBody, 3);
  return `${cleanBody}\n\n<<<goi-y>>>\n${finalSuggestions.join('\n')}\n<<<het-goi-y>>>`;
}

/** @deprecated dùng buildTuViSystemPrompt(templeName) */
export const TUVI_SYSTEM_PROMPT = buildTuViSystemPrompt('chùa');
