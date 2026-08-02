/**
 * Luận giải AI cho công cụ Chỉ tướng (tướng bàn tay).
 *
 * Nguyên tắc như nhóm "Hệ trọng" và Nhân tướng: client CHỈ gửi input thô
 * (các lựa chọn quan sát + giới tính). Server tự chạy engine chi-tuong rồi
 * đổ kết quả tất định thành khối context — AI chỉ diễn giải sâu thêm,
 * không tự tính, không bịa bộ vị.
 *
 * Input tất định → context tất định → bài luận cache được theo hash input.
 */

import {
  CHI_TUONG_FEATURES,
  analyzeChiTuong,
  isValidChiTuongInput,
  type ChiTuongGender,
  type ChiTuongInput,
} from './chi-tuong';

/** Tăng khi đổi cấu trúc prompt/context → cache cũ tự vô hiệu. */
export const CHI_TUONG_PROMPT_VERSION = 1;

export interface ChiTuongPayload extends ChiTuongInput {
  topic: 'chi_tuong';
}

/** Parse + validate body thô từ client. Trả null nếu không hợp lệ. */
export function parseChiTuongPayload(raw: unknown): ChiTuongPayload | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;
  if (r.topic !== 'chi_tuong') return null;
  if (r.gender !== 'nam' && r.gender !== 'nu') return null;

  const input: Partial<ChiTuongInput> = {
    gender: r.gender as ChiTuongGender,
  };
  for (const f of CHI_TUONG_FEATURES) {
    const v = r[f.id];
    if (typeof v !== 'string') return null;
    input[f.id] = v;
  }
  const full = input as ChiTuongInput;
  if (!isValidChiTuongInput(full)) return null;
  return { topic: 'chi_tuong', ...full };
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

export interface ChiTuongContext {
  title: string;
  /** Khối dữ liệu tất định — nguồn duy nhất cho AI. */
  context: string;
}

export function buildChiTuongContext(p: ChiTuongPayload): ChiTuongContext {
  const r = analyzeChiTuong(p);
  const gioiTinh = p.gender === 'nam' ? 'nam' : 'nữ';

  const lines: string[] = [
    `# Luận chỉ tướng (tướng bàn tay) — người xem giới tính ${gioiTinh}`,
    '',
    `## Thủ hình ngũ hành: ${r.handElement.label} (hành ${r.handElement.element})`,
    `Điểm tổng cách cục: ${r.overallScore}/100 — ${r.overallLabel}`,
    r.overallNote,
    r.handElement.boTro,
    '',
    '## Ba đường chính (trục cách cục)',
    r.baDuongNote,
    ...r.baDuongChinh.map((d) =>
      [
        `### ${d.title}${d.viTri ? ` (${d.viTri})` : ''} — ${d.option.label}`,
        d.option.luan,
      ].join('\n'),
    ),
    '',
    '## Các bộ vị khác',
    ...r.boViKhac.map((d) =>
      [
        `### ${d.title}${d.viTri ? ` (${d.viTri})` : ''} — ${d.option.label}`,
        d.option.luan,
      ].join('\n'),
    ),
    '',
    '## Năm phương diện (điểm tất định của engine)',
    ...r.aspects.map((a) =>
      [
        `### ${a.label}: ${a.score}/100 — ${a.bandLabel}`,
        ...a.notes.map((n) => `- ${n}`),
      ].join('\n'),
    ),
  ];

  if (r.genderNotes.length) {
    lines.push('', '## Ghi chú theo giới tính', ...r.genderNotes.map((n) => `- ${n}`));
  }

  lines.push('', '## Lời khuyên bồi đắp (engine đã tổng hợp)', ...r.advices.map((a) => `- ${a}`));

  return {
    title: `Luận chỉ tướng (${r.handElement.label}, ${r.overallScore}/100)`,
    context: lines.join('\n'),
  };
}

// ---------------------------------------------------------------------------
// System prompt + user block
// ---------------------------------------------------------------------------

export interface ChiTuongPersona {
  /** VD "Thầy Phong Thủy Phúc An" — chỉ truyền cho site không phải chùa. */
  displayName: string;
  aiOutro?: string;
}

export function buildChiTuongSystemPrompt(
  templeName: string,
  persona?: ChiTuongPersona | null,
): string {
  const chua = templeName.trim() || 'chùa';
  const shared = `NGUYÊN TẮC:
- Luận dựa CHỈ trên khối dữ liệu được cung cấp (kết quả engine thủ tướng: thủ hình ngũ hành, ba đường chính, Định Mệnh, Hôn Nhân, gò, ngón cái, điểm 5 phương diện). TUYỆT ĐỐI không tự thêm đường chỉ, nốt ruồi, vân tay hay chi tiết ngoài dữ liệu.
- Nếu dữ liệu chấm một phương diện Tốt / Khá / Cần bồi đắp, bài luận phải nhất quán — chỉ diễn giải sâu hơn, kết nối các bộ vị với nhau, không đảo ngược kết luận.
- Luận theo hướng chánh tín: đường chỉ tay ĐỔI theo nếp sống và tâm địa — là tấm gương soi để tu sửa, không phải án định. TUYỆT ĐỐI không phán tuổi thọ, sinh tử, bệnh nan y (Sinh đạo ngắn/đứt KHÔNG phải đoản mệnh); KHÔNG hù dọa, KHÔNG hứa chắc kết quả.
- Thuật ngữ thủ tướng (Tâm đạo, Trí đạo, Sinh đạo, gò Kim Tinh, gò Thái Âm, thủ hình…) phải kèm giải nghĩa ngắn, dễ hiểu cho người thường.
- Không nhắc AI, chatbot, DeepSeek, mô hình ngôn ngữ.

BỐ CỤC BÀI LUẬN (dùng tiêu đề ###, độ dài 400–650 chữ):
### 1. Thủ hình và cách cục chung
Nhận định tổng quan ấm áp: bàn tay hành gì, ba đường chính vững hay cần chăm, cách cục mạnh ở đâu.
### 2. Ba đường chính
Luận Tâm đạo – Trí đạo – Sinh đạo: tình cảm, lối tư duy, sinh lực — kết nối chúng với nhau thành chân dung con người.
### 3. Điểm sáng và điểm cần bồi
Chọn 2–3 bộ vị đắt giá nhất và 1–2 bộ vị cần bồi đắp trong dữ liệu, kết nối với 5 phương diện (sự nghiệp, tiền tài, tình duyên, sức khỏe, phúc đức).
### 4. Lời dặn
Khuyên cụ thể theo lời khuyên trong dữ liệu: nếp sống, cách dùng mặt mạnh — nhắc "đường chỉ tay đổi theo nếp sống", đây là cổ học tham khảo.

KHÔNG thêm khối <<<goi-y>>> hay câu hỏi gợi ý.`;

  if (persona) {
    return `Bạn là ${persona.displayName}, thầy tướng pháp – phong thủy trực tiếp xem chỉ tay cho khách với giọng trang nghiêm, ấm áp, tinh tường.

${shared}

Xưng hô: gọi người xem là "quý vị"; tự xưng "thầy". TUYỆT ĐỐI không nhắc "thỉnh nước", "công đức", "nhà chùa", "bần tăng", "Phật tử".
${persona.aiOutro ? `Kết bài: ${persona.aiOutro}` : ''}`;
  }

  return `Bạn là trụ trì ${chua}, am tường thủ tướng cổ truyền, xem chỉ tay cho Phật tử với giọng trang nghiêm, từ bi, khai thị hướng thiện.

${shared}

Xưng hô: "quý vị" / "Phật tử"; có thể tự xưng "bần tăng" hoặc nói trực tiếp. Có thể mở đầu bằng "A Di Đà Phật".
Khi luận nên khéo lồng tinh thần nhà Phật: tay là tay tạo nghiệp cũng là tay tích phúc — tướng tay đổi theo việc tay làm.
Kết bài có thể nhắc nhẹ: muốn được xem kỹ hơn nên thỉnh ý trực tiếp trụ trì ${chua}; muốn luận sâu thêm có thể thỉnh nước ủng hộ chùa.`;
}

export function buildChiTuongUserBlock(
  ctx: ChiTuongContext,
  advisor = 'trụ trì',
): string {
  return `Dưới đây là kết quả luận tướng tất định của engine cho "${ctx.title}" cần ${advisor} diễn giải sâu (nguồn duy nhất, không bịa thêm bộ vị):

${ctx.context}

Hãy luận giải theo đúng bố cục 4 phần đã dặn.`;
}
