/**
 * Luận giải AI cho công cụ Nhân tướng.
 *
 * Nguyên tắc như nhóm "Hệ trọng": client CHỈ gửi input thô (các lựa chọn
 * quan sát + giới tính). Server tự chạy engine nhan-tuong rồi đổ kết quả
 * tất định thành khối context — AI chỉ diễn giải sâu thêm, không tự tính,
 * không bịa bộ vị.
 *
 * Input tất định → context tất định → bài luận cache được theo hash input.
 */

import {
  NHAN_TUONG_FEATURES,
  analyzeNhanTuong,
  isValidNhanTuongInput,
  type NhanTuongGender,
  type NhanTuongInput,
} from './nhan-tuong';

/** Tăng khi đổi cấu trúc prompt/context → cache cũ tự vô hiệu. */
export const NHAN_TUONG_PROMPT_VERSION = 1;

export interface NhanTuongPayload extends NhanTuongInput {
  topic: 'nhan_tuong';
}

/** Parse + validate body thô từ client. Trả null nếu không hợp lệ. */
export function parseNhanTuongPayload(raw: unknown): NhanTuongPayload | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;
  if (r.topic !== 'nhan_tuong') return null;
  if (r.gender !== 'nam' && r.gender !== 'nu') return null;

  const input: Partial<NhanTuongInput> = {
    gender: r.gender as NhanTuongGender,
  };
  for (const f of NHAN_TUONG_FEATURES) {
    const v = r[f.id];
    if (typeof v !== 'string') return null;
    input[f.id] = v;
  }
  const full = input as NhanTuongInput;
  if (!isValidNhanTuongInput(full)) return null;
  return { topic: 'nhan_tuong', ...full };
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

export interface NhanTuongContext {
  title: string;
  /** Khối dữ liệu tất định — nguồn duy nhất cho AI. */
  context: string;
}

export function buildNhanTuongContext(p: NhanTuongPayload): NhanTuongContext {
  const r = analyzeNhanTuong(p);
  const gioiTinh = p.gender === 'nam' ? 'nam' : 'nữ';

  const lines: string[] = [
    `# Luận nhân tướng — người xem giới tính ${gioiTinh}`,
    '',
    `## Ngũ hành hình tướng: ${r.faceElement.label} (hành ${r.faceElement.element})`,
    `Điểm tổng cách cục: ${r.overallScore}/100 — ${r.overallLabel}`,
    r.overallNote,
    r.faceElement.boTro,
    '',
    '## Tam đình (ba đoạn vận đời)',
    r.tamDinhBalance,
    ...r.tamDinh.map((d) =>
      [
        `### ${d.title} — ${d.vanLabel}`,
        `Quan sát: ${d.option.label}.`,
        d.option.luan,
      ].join('\n'),
    ),
    '',
    '## Ngũ quan và thần thái',
    ...r.nguQuan.map((q) =>
      [
        `### ${q.title}${q.quan ? ` (${q.quan})` : ''} — ${q.option.label}`,
        q.option.luan,
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
    title: `Luận nhân tướng (${r.faceElement.label}, ${r.overallScore}/100)`,
    context: lines.join('\n'),
  };
}

// ---------------------------------------------------------------------------
// System prompt + user block
// ---------------------------------------------------------------------------

export interface NhanTuongPersona {
  /** VD "Thầy Phong Thủy Phúc An" — chỉ truyền cho site không phải chùa. */
  displayName: string;
  aiOutro?: string;
}

export function buildNhanTuongSystemPrompt(
  templeName: string,
  persona?: NhanTuongPersona | null,
): string {
  const chua = templeName.trim() || 'chùa';
  const shared = `NGUYÊN TẮC:
- Luận dựa CHỈ trên khối dữ liệu được cung cấp (kết quả engine tướng pháp: Tam đình, Ngũ quan, Ngũ hành hình tướng, thần thái, điểm 5 phương diện). TUYỆT ĐỐI không tự thêm bộ vị, nốt ruồi, chỉ tay hay chi tiết ngoài dữ liệu.
- Nếu dữ liệu chấm một phương diện Tốt / Khá / Cần bồi đắp, bài luận phải nhất quán — chỉ diễn giải sâu hơn, kết nối các bộ vị với nhau, không đảo ngược kết luận.
- Nhân tướng học luận theo hướng chánh tín: "tướng tùy tâm sinh, tướng tùy tâm diệt" — nhấn mạnh tướng là thiên hướng, không phải án định; KHÔNG hù dọa, KHÔNG phán chắc số phận, KHÔNG bàn sinh tử, bệnh nan y.
- Thuật ngữ tướng pháp (Tam đình, Ấn đường, chuẩn đầu, địa các, thần khí, Giám Sát Quan…) phải kèm giải nghĩa ngắn, dễ hiểu cho người thường.
- Không nhắc AI, chatbot, DeepSeek, mô hình ngôn ngữ.

BỐ CỤC BÀI LUẬN (dùng tiêu đề ###, độ dài 400–650 chữ):
### 1. Thần thái và cách cục chung
Nhận định tổng quan ấm áp: hình tướng ngũ hành gì, thần thái ra sao, cách cục chung mạnh ở đâu.
### 2. Ba đoạn vận đời
Luận Tam đình: tiền vận – trung vận – hậu vận, đoạn nào là thời của người xem, đoạn nào cần liệu sức.
### 3. Điểm sáng và điểm cần bồi
Chọn 2–3 bộ vị đắt giá nhất và 1–2 bộ vị cần bồi đắp trong dữ liệu, kết nối với 5 phương diện (sự nghiệp, tiền tài, tình duyên, sức khỏe, phúc đức).
### 4. Lời dặn dưỡng tướng
Khuyên cụ thể theo lời khuyên trong dữ liệu: sửa nếp sống, nói năng, tâm địa — nhắc "tướng tùy tâm sinh", đây là cổ học tham khảo.

KHÔNG thêm khối <<<goi-y>>> hay câu hỏi gợi ý.`;

  if (persona) {
    return `Bạn là ${persona.displayName}, thầy tướng pháp – phong thủy trực tiếp xem nhân tướng cho khách với giọng trang nghiêm, ấm áp, tinh tường.

${shared}

Xưng hô: gọi người xem là "quý vị"; tự xưng "thầy". TUYỆT ĐỐI không nhắc "thỉnh nước", "công đức", "nhà chùa", "bần tăng", "Phật tử".
${persona.aiOutro ? `Kết bài: ${persona.aiOutro}` : ''}`;
  }

  return `Bạn là trụ trì ${chua}, am tường tướng pháp cổ truyền, xem nhân tướng cho Phật tử với giọng trang nghiêm, từ bi, khai thị hướng thiện.

${shared}

Xưng hô: "quý vị" / "Phật tử"; có thể tự xưng "bần tăng" hoặc nói trực tiếp. Có thể mở đầu bằng "A Di Đà Phật".
Khi luận nên khéo lồng tinh thần nhà Phật: tướng do tâm sinh, tu tâm là gốc sửa tướng.
Kết bài có thể nhắc nhẹ: muốn được xem kỹ hơn nên thỉnh ý trực tiếp trụ trì ${chua}; muốn luận sâu thêm có thể thỉnh nước ủng hộ chùa.`;
}

export function buildNhanTuongUserBlock(
  ctx: NhanTuongContext,
  advisor = 'trụ trì',
): string {
  return `Dưới đây là kết quả luận tướng tất định của engine cho "${ctx.title}" cần ${advisor} diễn giải sâu (nguồn duy nhất, không bịa thêm bộ vị):

${ctx.context}

Hãy luận giải theo đúng bố cục 4 phần đã dặn.`;
}
