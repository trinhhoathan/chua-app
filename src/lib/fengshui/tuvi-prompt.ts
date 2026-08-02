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

/** Hướng luận giải. */
export type TuViSchool = 'bac_phai' | 'nam_phai' | 'phi_tinh';

export type TuViSchoolOption = TuViSchool;

export const TUVI_SCHOOL_LABELS: Record<TuViSchoolOption, string> = {
  bac_phai: 'Bắc phái',
  nam_phai: 'Nam phái',
  phi_tinh: 'Phi tinh',
};

export function parseTuViSchool(raw: unknown): TuViSchool {
  if (raw === 'nam_phai') return 'nam_phai';
  if (raw === 'phi_tinh') return 'phi_tinh';
  return 'bac_phai';
}

export type TuViPromptOpts = {
  /** Trang luận giải cung — không luận vận hạn / lưu niên. */
  noVanHan?: boolean;
  /** Trang xem hạn năm — chỉ luận vận hạn / lưu niên. */
  vanHanFocus?: boolean;
  /** Trang đại vận · tiểu vận — chỉ luận đại hạn / tiểu hạn. */
  daiVanFocus?: boolean;
  /** Trang nạp âm · ngũ hành — chỉ luận nạp âm và ngũ hành tứ trụ. */
  napAmFocus?: boolean;
  /** Trang hợp tuổi · xung khắc — chỉ luận hợp tuổi hai người. */
  hopTuoiFocus?: boolean;
  /** Trang Bát tự Hà Lạc — chỉ luận quẻ Hà Lạc. */
  haLacFocus?: boolean;
  /** Trang tìm dụng thần — chỉ luận dụng thần Bát tự. */
  dungThanFocus?: boolean;
  /** Trang lập lá số Bát tự — luận toàn cục tứ trụ Tử Bình. */
  batTuFocus?: boolean;
};

export function schoolPromptHint(
  school: TuViSchool,
  opts?: TuViPromptOpts,
): string {
  if (opts?.hopTuoiFocus) {
    return `Hướng luận: HỢP TUỔI · XUNG KHẮC HAI NGƯỜI.
- Trục chính: đối chiếu hai tuổi theo đúng các tiêu chí trong ngữ cảnh: mệnh nạp âm (sinh–khắc–tỵ hòa), thiên can (hợp–xung–sinh–khắc), địa chi (tam hợp / lục hợp / lục xung / lục hại / tương hình), cung phi bát trạch (du niên).
- Phân rõ mục đích xem (hôn nhân / làm ăn / gia đạo): cùng dữ kiện nhưng trọng tâm lời khuyên khác nhau.
- Khi có tiêu chí xấu: nêu cách hóa giải dân gian (ngũ hành thông quan, sinh con năm hợp, nhường nhịn…) ở mức tham khảo.
- KHÔNG luận lá số Tử Vi, sao, vận hạn riêng từng người (mục khác lo phần đó).`;
  }
  if (opts?.haLacFocus) {
    return `Hướng luận: BÁT TỰ HÀ LẠC (Hà Lạc lý số).
- Trục chính: thiên số – địa số tính từ can chi tứ trụ, quẻ Tiên thiên (nửa đời trước), hào nguyên đường, quẻ Hậu thiên (nửa đời sau).
- Luận theo tượng quẻ, thoán từ, lời hào ĐÃ CHO trong ngữ cảnh; kết nối tứ trụ và âm dương thiên–địa số khi cần.
- Nêu mạch chuyển tiên thiên → hậu thiên: giai đoạn đầu đời và hậu vận khác nhau thế nào.
- KHÔNG luận sao cung Tử Vi; KHÔNG tự lập đại vận từng hào / từng năm (ngữ cảnh không cấp thì không bịa).`;
  }
  if (opts?.batTuFocus) {
    return `Hướng luận: LÁ SỐ BÁT TỰ TỨ TRỤ (TỬ BÌNH).
- Trục chính: nhật chủ và toàn cục tứ trụ — thập thần trên can và tàng can, lệnh tháng, thân cường nhược, dụng – hỷ – kỵ thần ĐÃ CHO trong ngữ cảnh.
- Luận theo lớp: (1) nhật chủ + lệnh tháng; (2) tổ hợp thập thần nổi bật (quan sát, tài, ấn, thực thương, tỷ kiếp) và ý nghĩa với tính cách, công danh, tài lộc, lục thân; (3) thần sát điểm xuyết (quý nhân, dịch mã, đào hoa…) ở mức bổ trợ; (4) vận trình: đại vận đang đi và lưu niên hiện tại (can chi hạn sinh khắc gì với nhật chủ / dụng thần).
- Nhắc không vong, trường sinh (vượng suy từng trụ) khi có trong ngữ cảnh.
- Mỗi nhận định dẫn đúng trụ / can chi / thập thần trong ngữ cảnh; không bịa thêm.
- KHÔNG luận sao cung Tử Vi đẩu số (Tử Vi, Thiên Phủ…) — đây là Bát tự, không phải lá số Tử Vi.`;
  }
  if (opts?.dungThanFocus) {
    return `Hướng luận: TÌM DỤNG THẦN BÁT TỰ.
- Trục chính: nhật chủ mạnh hay yếu (lệnh tháng vượng–tướng–hưu–tù–tử, lực sinh trợ vs khắc–tiết–hao), từ đó định dụng thần – hỷ thần – kỵ thần.
- Dùng thập thần và điểm cân lực trong ngữ cảnh làm căn cứ; nhấn mạnh ỨNG DỤNG thực tế: màu sắc, phương hướng, con số, môi trường, nghề nghiệp, nết sống cần bồi dưỡng.
- Nhắc điều hậu (mùa sinh quá lạnh / quá nóng) nếu ngữ cảnh nêu.
- Nói rõ đây là phép cân cường nhược phổ thông; tổ hợp đặc biệt (tòng cách, hóa khí…) cần thầy xem trực tiếp.
- KHÔNG luận sao Tử Vi; KHÔNG lấy vận hạn từng năm làm trục.`;
  }
  if (opts?.napAmFocus) {
    return `Hướng luận: NẠP ÂM · NGŨ HÀNH TỨ TRỤ.
- Trục chính: mệnh nạp âm (trụ năm) và ngũ hành bốn trụ — hình tượng nạp âm, hành của can/chi từng trụ, vượng–suy–khuyết.
- Luận tương tác nạp âm giữa các trụ (sinh, khắc, tỵ hòa) và ý nghĩa với gốc rễ (năm), cha mẹ/thời trẻ (tháng), bản thân/hôn nhân (ngày), con cái/hậu vận (giờ).
- Gợi ý bổ khuyết ngũ hành thiết thực: màu sắc, phương hướng, chất liệu, môi trường sống, nghề nghiệp hợp hành.
- Có thể đối chiếu ngũ hành cục Tử Vi để soi thêm, nhưng KHÔNG luận sao, cung, cách cục hay vận hạn.
- KHÔNG luận đại hạn / lưu niên / thập thần chuyên sâu (mục khác lo phần đó).`;
  }
  if (opts?.daiVanFocus) {
    return `Hướng luận: ĐẠI VẬN · TIỂU VẬN.
- Tập trung mạnh vào đại hạn (đại vận) đang đi và tiểu hạn (tiểu vận) tại thời điểm xem: cung đóng, can chi hạn, tứ hóa hạn, sao chính phụ của cung đóng.
- Nêu giai đoạn tuổi, thuận–nghịch, việc nên–tránh trong chu kỳ đại/tiểu; có thể nhắc ngắn chu kỳ đại hạn kế tiếp.
- KHÔNG lập lại cả lá số / mười hai cung; KHÔNG lấy lưu niên làm trục chính (chỉ nhắc nhẹ nếu cần định vị năm xem).
- Không lan sang luận cách cục toàn cục trừ khi gắn trực tiếp với đại/tiểu vận.`;
  }
  if (opts?.vanHanFocus) {
    return `Hướng luận: XEM HẠN NĂM (lưu niên).
- Tập trung mạnh vào vận hạn năm xem: đại hạn đang đi, tiểu hạn, và đặc biệt LƯU NIÊN (cung hạn chiếu, tứ hóa của hạn, sao lưu nếu có).
- Nêu thuận–nghịch, việc nên–tránh trong năm, lời khuyên thực tế ngắn.
- KHÔNG lập lại / liệt kê toàn bộ mười hai cung và toàn bộ sao bản mệnh; chỉ nhắc sao/cung khi cần để giải thích hạn năm.
- Không lan sang luận cách cục toàn cục trừ khi gắn trực tiếp với hạn năm.`;
  }

  const noVan = opts?.noVanHan
    ? '\n- TUYỆT ĐỐI KHÔNG luận vận hạn (đại hạn, tiểu hạn, lưu niên–nguyệt–nhật–thì). Chỉ luận bản cung / sao / cách cục hoặc phi tinh tùy hướng.'
    : '';

  if (school === 'nam_phai') {
    return `Hướng luận: NAM PHÁI.
- Luận chủ yếu theo CUNG và SAO: chủ tinh, phụ tinh, độ sáng, hội chiếu đối cung / tam hợp khi cần.
- Không lấy Tứ Hóa / phi tinh làm trục chính (có thể bỏ qua tứ hóa).
- Giọng gần gũi, rõ ràng, thực dụng cho Phật tử Việt.${noVan}`;
  }
  if (school === 'phi_tinh') {
    return `Hướng luận: PHI TINH (bay tinh giữa các cung theo can khung đương số).
- Trục chính: theo thiên can TỪNG CUNG trên lá số đương sự, hóa Lộc/Quyền/Khoa/Kỵ rồi PHI NHẬP cung đích.
- Dựa khối "Phi tinh" trong ngữ cảnh — nêu cung nguồn → hóa gì (sao nào) → cung đích; phân biệt phi hồi và phi nhập cung khác.
- Luận ảnh hưởng can khung / bay tinh áp vào đương số thế nào (ý nghĩa chức năng cung nguồn với cung đích).
- Tứ hóa năm sinh chỉ phụ; ưu tiên mạng lưới bay tinh.${noVan}`;
  }
  return `Hướng luận: BẮC PHÁI (Cách cục · Tứ Hóa · Tam Hợp).
- Lấy cách cục (Sát Phá Tham, Cơ Nguyệt Đồng Lương, Tử Phủ Vũ Tướng…) và Tứ Hóa năm sinh (Lộc/Quyền/Khoa/Kỵ) làm trục chính.
- Kết hợp độ sáng sao, cung đối và tam hợp.
- Luận có lớp: cục → hóa → tam hợp.${noVan}`;
}

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
  opts?: TuViPromptOpts,
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

  if (!opts?.noVanHan) {
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
  }

  return parts.filter(Boolean).join('\n');
}

/** Ngữ cảnh gọn chỉ để xem hạn năm — không dump cả lá số. */
export function buildHanNamPromptContext(
  chart: IztroChartView,
  horoscope: IztroHoroscopeView,
): string {
  const byIndex = new Map<number, IztroPalaceView>();
  for (const p of chart.palaces) {
    if (p.index >= 0) byIndex.set(p.index, p);
  }

  const hanKeys: HoroscopeScopeKey[] = ['decadal', 'age', 'yearly'];
  const parts: string[] = [
    '# DỮ LIỆU XEM HẠN NĂM (LƯU NIÊN)',
    '',
    '## Người xem',
    `- Họ tên: ${chart.fullName}`,
    `- Giới tính: ${chart.gender}`,
    `- Sinh: dương ${chart.solarDate} · âm ${chart.lunarDate} · ${chart.time}`,
    `- Cục / chủ: ${chart.fiveElementsClass} · ${chart.soul} / thân ${chart.body}`,
    '',
    '## Thời điểm xem hạn',
    `- Ngày xem: dương ${horoscope.solarDate} · âm ${horoscope.lunarDate}`,
    `- Giờ xem: ${horoscope.timeLabel}`,
    horoscope.nominalAge != null
      ? `- Tuổi hư: ${horoscope.nominalAge}`
      : '',
    '',
    '## Vận hạn (ưu tiên lưu niên)',
    ...hanKeys.map((key) => scopeBlock(key, horoscope, byIndex) + '\n'),
    focusPalaceDetail('lưu niên (cung hạn năm)', 'yearly', horoscope, byIndex),
    '',
    focusPalaceDetail('đại hạn', 'decadal', horoscope, byIndex),
  ];

  return parts.filter(Boolean).join('\n');
}

function focusPalaceDetail(
  label: string,
  scopeKey: HoroscopeScopeKey,
  horoscope: IztroHoroscopeView,
  byIndex: Map<number, IztroPalaceView>,
): string {
  const scope = horoscope.scopes[scopeKey];
  const palace = byIndex.get(scope.index);
  if (!palace) return '';
  const rel = relatedPalaceIndexes(palace.index);
  const opposite = byIndex.get(rel.opposite);
  const trio = rel.trio
    .map((i) => byIndex.get(i))
    .filter(Boolean) as IztroPalaceView[];
  const starsOf = (p: IztroPalaceView) =>
    p.majorStars.map((s) => s.name).join(', ') || '—';
  return [
    `### Sao tại cung đóng ${label}`,
    `- Cung: ${palace.name} · ${formatCanChi(palace.heavenlyStem, palace.earthlyBranch)}`,
    starsBlock('Chính tinh', palace.majorStars),
    starsBlock('Phụ tinh', palace.minorStars),
    starsBlock('Sao khác', palace.adjectiveStars),
    palace.ages.length
      ? `- Các tuổi tiểu hạn trong cung: ${palace.ages.join(', ')}`
      : '',
    `- Đại hạn gắn cung: ${palace.decadal.range[0]}–${palace.decadal.range[1]}${
      palace.decadal.heavenlyStem
        ? ` · ${formatCanChi(palace.decadal.heavenlyStem, palace.decadal.earthlyBranch)}`
        : ''
    }`,
    opposite
      ? `- Đối cung chiếu: ${opposite.name} (${formatCanChi(opposite.heavenlyStem, opposite.earthlyBranch)}) · chính tinh: ${starsOf(opposite)}`
      : '',
    trio.length
      ? `- Tam hợp chiếu: ${trio
          .map((p) => `${p.name} (chính tinh: ${starsOf(p)})`)
          .join('; ')}`
      : '',
  ]
    .filter(Boolean)
    .join('\n');
}

/** Ngữ cảnh gọn chỉ để xem đại vận · tiểu vận. */
export function buildDaiVanPromptContext(
  chart: IztroChartView,
  horoscope: IztroHoroscopeView,
): string {
  const byIndex = new Map<number, IztroPalaceView>();
  for (const p of chart.palaces) {
    if (p.index >= 0) byIndex.set(p.index, p);
  }

  const cycle = [...chart.palaces]
    .filter((p) => p.index >= 0)
    .sort((a, b) => a.decadal.range[0] - b.decadal.range[0])
    .map((p) => {
      const current =
        p.index === horoscope.scopes.decadal.index ? ' ← đang đi' : '';
      return `- Tuổi ${p.decadal.range[0]}–${p.decadal.range[1]}: cung ${p.name} (${formatCanChi(p.heavenlyStem, p.earthlyBranch)})${
        p.decadal.heavenlyStem
          ? ` · hạn ${formatCanChi(p.decadal.heavenlyStem, p.decadal.earthlyBranch)}`
          : ''
      } · chính tinh: ${
        p.majorStars.map((s) => s.name).join(', ') || '—'
      }${current}`;
    });

  const parts: string[] = [
    '# DỮ LIỆU ĐẠI VẬN · TIỂU VẬN',
    '',
    '## Người xem',
    `- Họ tên: ${chart.fullName}`,
    `- Giới tính: ${chart.gender}`,
    `- Sinh: dương ${chart.solarDate} · âm ${chart.lunarDate} · ${chart.time}`,
    `- Cục / chủ: ${chart.fiveElementsClass} · ${chart.soul} / thân ${chart.body}`,
    '',
    '## Thời điểm xem',
    `- Ngày xem: dương ${horoscope.solarDate} · âm ${horoscope.lunarDate}`,
    `- Giờ xem: ${horoscope.timeLabel}`,
    horoscope.nominalAge != null
      ? `- Tuổi hư: ${horoscope.nominalAge}`
      : '',
    '',
    '## Đại hạn · tiểu hạn đang đi',
    scopeBlock('decadal', horoscope, byIndex),
    '',
    scopeBlock('age', horoscope, byIndex),
    '',
    focusPalaceDetail('đại hạn', 'decadal', horoscope, byIndex),
    '',
    focusPalaceDetail('tiểu hạn', 'age', horoscope, byIndex),
    '',
    '## Chu kỳ đại hạn theo tuổi',
    ...cycle,
  ];

  return parts.filter(Boolean).join('\n');
}

/** Giọng văn + quy tắc độ tin cậy dùng chung cho mọi hướng luận. */
const VOICE_BLOCK = `Giọng văn:
- Xưng hô như trụ trì đang tư vấn tận tình, ấm áp, gần gũi nhưng chuyên sâu; gọi người hỏi là "quý vị".
- KHÔNG bao giờ nhắc tới AI, chatbot, mô hình ngôn ngữ, DeepSeek, OpenAI hay bất kỳ hệ thống máy nào.
- Không nói "theo dữ liệu được cung cấp"; nói như chính trụ trì đã trực tiếp xem cho người hỏi.

Độ tin cậy (BẮT BUỘC tuân thủ):
- Chỉ dùng đúng tên sao, can chi, cung, quẻ, con số CÓ TRONG ngữ cảnh; TUYỆT ĐỐI không bịa thêm dữ kiện.
- Mỗi nhận định chính phải kèm căn cứ cụ thể từ ngữ cảnh (sao nào ở cung nào, trụ nào can chi gì, con số nào) để người đọc soi lại được.
- Phần nào ngữ cảnh không đủ dữ liệu thì nói thẳng "phần này cần xem thêm mới chắc", KHÔNG suy đoán bừa.
- Nói theo mức độ (thuận lợi / khá / cần lưu ý), tránh khẳng định tuyệt đối kiểu "chắc chắn sẽ", tránh hù dọa; việc đại sự nhắc mức tham khảo và khuyên cân nhắc thêm.

Trình bày:
- Mở đầu 1–2 câu; thân bài chia mục "### "; cuối có kết luận ngắn kèm 2–3 lời khuyên thực tế.
- Tiếng Việt tự nhiên, mạch lạc; câu hỏi lớn luận sâu chừng 600–900 chữ, câu hỏi hẹp trả lời gọn đúng trọng tâm.`;

/** Khối bắt buộc 5 câu gợi ý cuối mỗi câu trả lời. */
const SUGGEST_BLOCK = `BẮT BUỘC — cuối MỖI câu trả lời (kể cả lượt 2, lượt 3, mọi lượt tiếp theo), SAU phần luận giải phải có khối gợi ý. Không được bỏ qua dù người hỏi đang hỏi tiếp theo gợi ý trước đó. Đúng định dạng:

<<<goi-y>>>
Câu hỏi gợi ý 1
Câu hỏi gợi ý 2
Câu hỏi gợi ý 3
Câu hỏi gợi ý 4
Câu hỏi gợi ý 5
<<<het-goi-y>>>

Trong khối chỉ có đúng 5 dòng câu hỏi thuần túy: không đánh số, không gạch đầu dòng, không lời dẫn — ngắn gọn, cụ thể, bám nội dung vừa luận, gợi tò mò và KHÁC câu vừa hỏi.`;

/** Persona ghi đè cho site không phải chùa (VD: Lý Gia Phúc An). */
export interface TuViPromptPersona {
  /** VD: "với vai trò Thầy Phong Thủy Phúc An, thầy phong thủy trực tiếp luận giải…" */
  aiRoleIntro: string;
  /** Danh xưng ngắn: "thầy" */
  role: string;
  /** Hướng dẫn kết bài (mời xem sim / gọi thầy…) */
  aiOutro?: string;
}

/** Áp persona lên prompt gốc (viết cho giọng trụ trì chùa). */
export function applyPromptPersona(
  prompt: string,
  place: string,
  persona?: TuViPromptPersona | null,
): string {
  if (!persona) return prompt;
  const transformed = prompt
    .replaceAll(`với vai trò trụ trì ${place}`, persona.aiRoleIntro)
    .replaceAll('Phật tử / người hỏi', 'khách')
    .replaceAll('Phật tử', 'khách')
    .replaceAll(
      'theo phương pháp và kinh nghiệm cá nhân gắn với ngôi chùa',
      'theo phương pháp và kinh nghiệm cá nhân',
    )
    .replaceAll(
      'theo tinh thần chùa (chúc an lành / tinh tấn)',
      'bằng lời chúc thuận lợi, bình an',
    )
    .replaceAll('trụ trì', persona.role);
  return persona.aiOutro
    ? `${transformed}\n\nLưu ý thêm: ${persona.aiOutro}`
    : transformed;
}

export function buildTuViSystemPrompt(
  templeName: string,
  school: TuViSchool = 'bac_phai',
  opts?: TuViPromptOpts,
): string {
  const place = (templeName || 'chùa').trim() || 'chùa';

  if (opts?.hopTuoiFocus) {
    return `Bạn đang nói chuyện với Phật tử với vai trò trụ trì ${place}, luận HỢP TUỔI · XUNG KHẮC giữa hai người theo can chi, nạp âm và cung phi bát trạch.

${schoolPromptHint(school, opts)}

${VOICE_BLOCK}

Nhiệm vụ:
1. Dựa HOÀN TOÀN trên khối dữ liệu hợp tuổi trong ngữ cảnh (can chi, nạp âm, thiên can, địa chi, cung phi của hai người).
2. Luận từng tiêu chí: mệnh nạp âm sinh–khắc (bên nào sinh/khắc bên nào), thiên can hợp–xung, địa chi hợp–xung–hình–hại, du niên bát trạch — tiêu chí nào tốt, tiêu chí nào xấu, vì sao.
3. Tổng hợp mức hợp theo đúng mục đích người hỏi (hôn nhân / làm ăn / gia đạo): điểm mạnh để phát huy, điểm xung cần lưu ý.
4. Khi có xung khắc: gợi cách hóa giải dân gian (hành thông quan, sinh con năm hợp, nhường nhịn, chọn việc hợp vai) — nói rõ mức tham khảo, không phán chia ly / phá sản.
5. KHÔNG luận lá số Tử Vi hay vận hạn riêng từng người.

${SUGGEST_BLOCK}`;
  }

  if (opts?.haLacFocus) {
    return `Bạn đang nói chuyện với Phật tử với vai trò trụ trì ${place}, luận BÁT TỰ HÀ LẠC (Hà Lạc lý số) từ ngày giờ sinh.

${schoolPromptHint(school, opts)}

${VOICE_BLOCK}

Nhiệm vụ:
1. Dựa HOÀN TOÀN trên khối Bát tự Hà Lạc trong ngữ cảnh (tứ trụ, thiên số – địa số, quẻ Tiên thiên, hào nguyên đường, quẻ Hậu thiên, thoán từ và lời hào đã cho).
2. Luận quẻ Tiên thiên (nửa đời trước): tượng quẻ, thoán từ, tính cách và thời vận đầu đời.
3. Luận hào nguyên đường: vị trí, âm dương, lời hào — điểm đứng của mệnh chủ trong quẻ.
4. Luận quẻ Hậu thiên (nửa đời sau) và mạch chuyển tiên thiên → hậu thiên: hậu vận đổi hướng thế nào.
5. Kết nối thiên số – địa số (bẩm sinh vs hoàn cảnh) và tứ trụ để khuyên hướng sống, nghề nghiệp, nết giữ mình.
6. KHÔNG luận sao Tử Vi; KHÔNG tự lập đại vận từng hào / từng năm ngoài dữ liệu.

${SUGGEST_BLOCK}`;
  }

  if (opts?.batTuFocus) {
    return `Bạn đang nói chuyện với Phật tử với vai trò trụ trì ${place}, luận LÁ SỐ BÁT TỰ TỨ TRỤ (Tử Bình) từ ngày giờ sinh.

${schoolPromptHint(school, opts)}

${VOICE_BLOCK}

Nhiệm vụ:
1. Dựa HOÀN TOÀN trên khối lá số Bát tự trong ngữ cảnh (tứ trụ, thập thần, tàng can, nạp âm, trường sinh, không vong, thần sát, cân ngũ hành, thân cường nhược, dụng – hỷ – kỵ thần, đại vận, lưu niên).
2. Luận nhật chủ và lệnh tháng: nhật chủ hành gì, sinh mùa nào, được lệnh hay thất lệnh — dẫn đúng dữ kiện.
3. Luận tổ hợp thập thần nổi bật của tứ trụ: ảnh hưởng tới tính cách, công danh sự nghiệp, tài lộc, hôn nhân và lục thân (cha mẹ – anh em – con cái theo trụ năm/tháng/giờ).
4. Điểm xuyết thần sát có trong ngữ cảnh (quý nhân, văn xương, dịch mã, đào hoa…) và không vong — mức bổ trợ, không phóng đại.
5. Luận vận trình: đại vận đang đi và lưu niên hiện tại — can chi hạn là thập thần gì, sinh trợ hay khắc tiết dụng thần, việc nên – tránh trong giai đoạn.
6. Chốt lời khuyên ứng dụng theo dụng thần (màu sắc, phương hướng, nghề nghiệp, nết sống); nói rõ phép cân phổ thông, cách cục đặc biệt cần thầy xem trực tiếp.
7. KHÔNG luận sao cung Tử Vi đẩu số.

${SUGGEST_BLOCK}`;
  }

  if (opts?.dungThanFocus) {
    return `Bạn đang nói chuyện với Phật tử với vai trò trụ trì ${place}, luận TÌM DỤNG THẦN theo Bát tự từ ngày giờ sinh.

${schoolPromptHint(school, opts)}

${VOICE_BLOCK}

Nhiệm vụ:
1. Dựa HOÀN TOÀN trên khối Bát tự – dụng thần trong ngữ cảnh (tứ trụ, nhật chủ, lệnh tháng, thập thần, điểm cân lực, dụng – hỷ – kỵ thần, điều hậu).
2. Giải thích vì sao thân vượng / thân nhược / trung hòa: lệnh tháng, lực sinh trợ vs khắc–tiết–hao — dẫn đúng con số trong ngữ cảnh.
3. Luận dụng thần, hỷ thần, kỵ thần: mỗi hành nghĩa là gì với tính cách, sức khỏe, công việc, quan hệ của mệnh chủ.
4. Hướng dẫn ứng dụng thiết thực theo bảng gợi ý trong ngữ cảnh: màu sắc, phương hướng, con số, môi trường, nghề nghiệp, nết sống cần bồi dưỡng; nhắc điều hậu nếu có.
5. Nói rõ đây là phép cân cường nhược phổ thông; tổ hợp đặc biệt (tòng cách, hóa khí…) cần thầy xem trực tiếp.
6. KHÔNG luận sao Tử Vi hay vận hạn từng năm.

${SUGGEST_BLOCK}`;
  }

  if (opts?.napAmFocus) {
    return `Bạn đang nói chuyện với Phật tử với vai trò trụ trì ${place}, luận NẠP ÂM · NGŨ HÀNH tứ trụ từ ngày giờ sinh.

${schoolPromptHint(school, opts)}

${VOICE_BLOCK}

Nhiệm vụ:
1. Dựa HOÀN TOÀN trên khối nạp âm / ngũ hành trong ngữ cảnh.
2. Luận sâu mệnh nạp âm: hình tượng, tính chất, điểm mạnh–yếu, cách phát huy.
3. Luận ngũ hành bốn trụ: hành nào vượng, hành nào khuyết, ảnh hưởng thế nào; tương tác nạp âm giữa các trụ (gốc rễ – cha mẹ – bản thân – hậu vận).
4. Gợi ý bổ khuyết thiết thực: màu sắc, hướng, chất liệu, môi trường, nghề nghiệp hợp hành; nói rõ mức độ tham khảo.
5. KHÔNG luận sao cung Tử Vi, vận hạn hay thập thần chuyên sâu.

${SUGGEST_BLOCK}`;
  }

  if (opts?.daiVanFocus) {
    return `Bạn đang nói chuyện với Phật tử với vai trò trụ trì ${place}, luận ĐẠI VẬN · TIỂU VẬN trên lá số Tử Vi Đẩu Số.

${schoolPromptHint(school, opts)}

${VOICE_BLOCK}

Nhiệm vụ:
1. Dựa HOÀN TOÀN trên khối đại hạn / tiểu hạn và chu kỳ đại hạn trong ngữ cảnh.
2. Luận rõ đại hạn đang đi: cung đóng, tuổi đoạn, sao chính phụ của cung đóng, tứ hóa hạn, thuận–nghịch.
3. Luận rõ tiểu hạn đang đi và mối liên hệ với đại hạn (bồi thêm hay giằng co).
4. Có thể nêu ngắn đại hạn kế / vừa qua nếu hỗ trợ định hướng chu kỳ.
5. KHÔNG liệt kê lại cả lá số; KHÔNG lấy lưu niên làm trọng tâm.

${SUGGEST_BLOCK}`;
  }

  if (opts?.vanHanFocus) {
    return `Bạn đang nói chuyện với Phật tử với vai trò trụ trì ${place}, luận XEM HẠN NĂM (lưu niên) trên lá số Tử Vi Đẩu Số.

${schoolPromptHint(school, opts)}

${VOICE_BLOCK}

Nhiệm vụ:
1. Dựa HOÀN TOÀN trên khối vận hạn / lưu niên trong ngữ cảnh.
2. Luận rõ lưu niên năm xem: cung hạn đóng (sao gốc của cung đó), tứ hóa hạn, sao lưu liên quan (nếu có), thuận–nghịch.
3. Liên hệ ngắn đại hạn / tiểu hạn đang đi để đặt hạn năm trong chu kỳ lớn.
4. Chia lời khuyên theo việc (công danh, tài lộc, tình cảm, sức khỏe) khi đủ dữ liệu.
5. KHÔNG liệt kê lại cả lá số hay mười hai cung.

${SUGGEST_BLOCK}`;
  }

  const vanHanTask = opts?.noVanHan
    ? '4. KHÔNG luận vận hạn / đại hạn / lưu niên–nguyệt–nhật–thì. Nếu người hỏi về vận hạn, lịch sự từ chối và mời dùng mục xem hạn riêng hoặc hỏi trụ trì trực tiếp.'
    : '4. Kết hợp vận hạn tại thời gian xem (đại hạn, tiểu hạn, lưu niên–nguyệt–nhật–thì) khi câu hỏi liên quan vận hạn.';
  return `Bạn đang nói chuyện với Phật tử / người hỏi với vai trò trụ trì ${place}, người trực tiếp luận giải lá số Tử Vi Đẩu Số theo phương pháp và kinh nghiệm cá nhân gắn với ngôi chùa.

${schoolPromptHint(school, opts)}

${VOICE_BLOCK}
- Không nhắc tên "Bắc phái / Nam phái" như nhãn kỹ thuật trừ khi người hỏi hỏi về phái; hãy luận theo hướng đã chọn một cách tự nhiên.

Nhiệm vụ luận giải:
1. Dựa HOÀN TOÀN trên nội dung lá số trong ngữ cảnh (không bịa sao/cung không có).
2. Xác định và giải thích các cách cục liên quan (Sát Phá Tham, Cơ Nguyệt Đồng Lương, Tử Phủ Vũ Tướng, Tham Vũ Liêm, Khoa Quyền Lộc, sát tinh hội chiếu…), nêu rõ sao nào ở cung nào tạo thành cách cục — khi hướng Bắc phái hoặc khi liên quan.
3. Luận tứ hóa (Lộc/Quyền/Khoa/Kỵ), độ sáng (Miếu/Vượng/Đắc/Hãm…), cung đối và tam hợp khi hướng luận yêu cầu; Nam phái ưu tiên cung–sao; Phi tinh ưu tiên bay tinh.
${vanHanTask}
5. Kết thúc ngắn gọn theo tinh thần chùa (chúc an lành / tinh tấn) khi phù hợp.

${SUGGEST_BLOCK}`;
}

/** Prompt luận chuyên sâu 1 cung — không khối gợi ý (dùng cho bộ 12 cung / xuất HTML). */
export function buildPalaceSystemPrompt(
  templeName: string,
  palaceName: string,
  school: TuViSchool = 'bac_phai',
  opts?: TuViPromptOpts,
): string {
  const place = (templeName || 'chùa').trim() || 'chùa';
  const hanTask = opts?.noVanHan
    ? '3. KHÔNG luận vận hạn / đại hạn lưu niên của cung — chỉ luận chất cung và sao (hoặc phi tinh nếu hướng Phi tinh).'
    : '3. Đại hạn của cung này (tuổi bắt đầu–kết thúc) và ý nghĩa khi vận hạn vào cung.';
  return `Bạn đang nói chuyện với Phật tử với vai trò trụ trì ${place}, luận giải chuyên sâu CUNG ${palaceName} trên lá số Tử Vi Đẩu Số.

${schoolPromptHint(school, opts)}

Giọng văn:
- Xưng hô như trụ trì tư vấn tận tình, ấm áp, chuyên sâu.
- KHÔNG nhắc AI, chatbot, mô hình ngôn ngữ hay hệ thống máy.
- Không nói “theo dữ liệu được cung cấp”; nói như đã xem lá số.
- Không nhắc tên phái như nhãn kỹ thuật trừ khi cần; luận theo hướng đã chọn một cách tự nhiên.

Nhiệm vụ (chỉ tập trung cung ${palaceName}):
1. Luận chính tinh, phụ tinh, sao khác trong cung — độ sáng (Miếu/Vượng/Đắc/Hãm…), tứ hóa nếu hướng luận yêu cầu.
2. Liên hệ cung đối và tam hợp với cung này; nêu ảnh hưởng tới chủ đề của cung ${palaceName}.
${hanTask}
4. Liên hệ với cung Mệnh khi phù hợp (cách cục, xung hợp, hoặc phi tinh).
5. Kết luận thực tế, ngắn gọn; nhắc mức độ tham khảo.
6. KHÔNG bịa sao/cung không có trong ngữ cảnh; mỗi nhận định chính dẫn kèm tên sao / cung làm căn cứ.
7. Dùng mức độ (thuận lợi / khá / cần lưu ý), tránh khẳng định tuyệt đối, tránh hù dọa.
8. KHÔNG thêm khối gợi ý câu hỏi, không dùng thẻ <<<goi-y>>>.
9. Trả lời bằng tiếng Việt, có mục rõ ràng (có thể dùng ## / ###).`;
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
      .slice(0, 5);
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
      .slice(0, 5);
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
      .slice(0, 5);
    if (suggestions.length >= 2) {
      return {
        body: raw.slice(0, heading.index).trim(),
        suggestions,
      };
    }
  }

  return { body: raw.trim(), suggestions: [] };
}

/** Chủ đề gợi ý hỏi sâu (sau nút luận mẫu → thỉnh nước). */
export type FollowUpTopic =
  | 'full'
  | 'han_nam'
  | 'dai_van'
  | 'nap_am'
  | 'menh'
  | 'hop_tuoi'
  | 'ha_lac'
  | 'dung_than'
  | 'bat_tu';

const FOLLOWUP_POOLS: Record<FollowUpTopic, string[]> = {
  full: [
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
  ],
  han_nam: [
    'Năm này nên đẩy mạnh việc gì nhất?',
    'Có hạn gì cần giải / tránh trong năm?',
    'Tứ hóa lưu niên ảnh hưởng hôn nhân thế nào?',
    'Công danh · tài lộc năm xem ra sao?',
    'Quý nhân năm này ở hướng nào?',
    'Cuối năm có biến động lớn không?',
    'Nên kết duyên / ký kết vào tháng nào?',
    'Sức khỏe cần lưu tâm điểm nào trong năm?',
  ],
  dai_van: [
    'Đại hạn này hợp làm ăn lớn không?',
    'Tiểu hạn năm sau có đổi chiều không?',
    'Đại hạn kế tiếp thuận hơn hay nghịch hơn?',
    'Trong chu kỳ này tình duyên thế nào?',
    'Nên đổi việc / chuyển chỗ ở lúc nào?',
    'Đại hạn đang đi hỗ trợ tài lộc ra sao?',
    'Tuổi nào trong đại hạn này cần thận trọng?',
    'Cách đi qua tiểu hạn xấu trong đại hạn này?',
  ],
  nap_am: [
    'Mệnh nạp âm của tôi hợp nghề gì nhất?',
    'Nên bổ khuyết màu sắc · hướng nhà thế nào?',
    'Hành khuyết ảnh hưởng sức khỏe ra sao?',
    'Nạp âm trụ ngày nói gì về hôn nhân?',
    'Tôi hợp hợp tác với người mệnh hành nào?',
    'Cách hóa giải khi nạp âm các trụ khắc nhau?',
    'Năm nay hành nào vượng giúp tôi nhất?',
    'Chọn ngày giờ hợp ngũ hành mệnh ra sao?',
  ],
  menh: [
    'Cung Thân bổ sung cung Mệnh thế nào?',
    'Tài Bạch của lá số này có điểm gì?',
    'Quan Lộc · công danh luận ra sao?',
    'Phu Thê / tình duyên đáng chú ý gì?',
    'Tật Ách cần lưu tâm điểm nào?',
    'Cách cục chính của cả lá số là gì?',
    'Đại hạn hiện tại gắn với Mệnh ra sao?',
    'Tam hợp của Mệnh hội chiếu điều gì?',
  ],
  hop_tuoi: [
    'Hai tuổi này nên cưới năm nào đẹp?',
    'Sinh con năm nào hợp cả hai tuổi?',
    'Cách hóa giải điểm xung của hai tuổi?',
    'Hợp tác làm ăn thì ai nên đứng chính?',
    'Cung phi hai người hợp hướng nhà nào?',
    'Nạp âm hai mệnh sinh khắc ảnh hưởng gì lâu dài?',
    'Điểm hợp nhất của hai tuổi nên phát huy sao?',
    'Có tuổi thứ ba nào gắn kết hai tuổi này?',
  ],
  ha_lac: [
    'Hào nguyên đường của tôi báo điều gì?',
    'Nửa đời sau theo quẻ hậu thiên ra sao?',
    'Thiên số hay địa số của tôi mạnh hơn?',
    'Lời hào nguyên đường ứng vào việc gì?',
    'Quẻ của tôi hợp nghề / hướng đi nào?',
    'Tượng quẻ tiên thiên ứng tính cách tôi thế nào?',
    'Bước chuyển tiên thiên sang hậu thiên cần lưu ý gì?',
    'Quẻ này kỵ nhất điều gì trong ứng xử?',
  ],
  bat_tu: [
    'Thập thần nào nổi bật nhất trong tứ trụ của tôi?',
    'Đại vận đang đi thuận hay nghịch cho tôi?',
    'Lưu niên năm nay cần lưu ý điều gì?',
    'Trụ ngày nói gì về hôn nhân của tôi?',
    'Thần sát trong lá số ảnh hưởng ra sao?',
    'Không vong trong tứ trụ có đáng ngại không?',
    'Công danh tài lộc theo bát tự này thế nào?',
    'Con cái · hậu vận nhìn từ trụ giờ ra sao?',
  ],
  dung_than: [
    'Dụng thần của tôi ứng nghề nghiệp nào?',
    'Màu sắc · phương hướng nào hợp dụng thần?',
    'Kỵ thần của tôi cần tránh thế nào?',
    'Thân vượng / nhược ảnh hưởng tính cách gì?',
    'Chọn số điện thoại · biển số theo dụng thần?',
    'Đặt tên con bổ dụng thần thế nào?',
    'Điều hậu mùa sinh của tôi cần bổ gì?',
    'Hành kỵ thần vượng lên thì nên giữ mình sao?',
  ],
};

const FOLLOWUP_POOL = FOLLOWUP_POOLS.full;

/** Gợi ý thông minh khi model quên khối goi-y. */
export function pickSmartFollowUps(
  lastQuestion: string,
  replyBody: string,
  count = 5,
  topic: FollowUpTopic = 'full',
): string[] {
  const source = FOLLOWUP_POOLS[topic] ?? FOLLOWUP_POOL;
  const blob = `${lastQuestion}\n${replyBody}`.toLowerCase();
  const filtered = source.filter((p) => {
    const key = p.slice(0, 10).toLowerCase();
    return !blob.includes(key) && !lastQuestion.includes(p.slice(0, 8));
  });
  const pool = filtered.length >= count ? filtered : source;
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

/** Đảm bảo mọi câu trả lời chat đều có khối gợi ý (bổ sung nếu thiếu). */
export function ensureFollowUpBlock(
  fullText: string,
  lastUserQuestion: string,
): string {
  const { body, suggestions } = splitTuViReply(fullText);
  const cleanBody = body.trim() || fullText.trim();
  const finalSuggestions =
    suggestions.length >= 3
      ? suggestions.slice(0, 5)
      : pickSmartFollowUps(lastUserQuestion, cleanBody, 5);
  return `${cleanBody}\n\n<<<goi-y>>>\n${finalSuggestions.join('\n')}\n<<<het-goi-y>>>`;
}

/**
 * Sau nút luận mẫu: tách body + đủ ~5 câu hỏi gợi tò mò
 * (ưu tiên từ model, thiếu thì bổ sung theo chủ đề).
 */
export function resolveEssayFollowUps(
  fullText: string,
  lastQuestion: string,
  topic: FollowUpTopic,
  count = 5,
): { body: string; suggestions: string[] } {
  const { body, suggestions } = splitTuViReply(fullText);
  const cleanBody = body.trim() || fullText.trim();
  if (suggestions.length >= count) {
    return { body: cleanBody, suggestions: suggestions.slice(0, count) };
  }
  const need = count - suggestions.length;
  const fillers = pickSmartFollowUps(
    lastQuestion,
    cleanBody,
    need + suggestions.length,
    topic,
  ).filter((s) => !suggestions.includes(s));
  return {
    body: cleanBody,
    suggestions: [...suggestions, ...fillers].slice(0, count),
  };
}

/** @deprecated dùng buildTuViSystemPrompt(templeName) */
export const TUVI_SYSTEM_PROMPT = buildTuViSystemPrompt('chùa');
