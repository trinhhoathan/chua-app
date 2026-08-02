/**
 * Nhận diện khuôn mặt từ ảnh — gợi ý tự động cho form Nhân tướng.
 *
 * Chạy HOÀN TOÀN trên trình duyệt bằng MediaPipe Face Landmarker (478 điểm):
 * ảnh không rời khỏi thiết bị người dùng, server không nhận bất kỳ dữ liệu
 * sinh trắc học nào. Module này chỉ được import động từ client component.
 *
 * Nguyên tắc: máy chỉ GỢI Ý những bộ vị đo được bằng hình học (tỷ lệ Tam
 * đình, hình mặt, mắt, miệng, dáng lông mày) — người dùng luôn xem lại và
 * tự xác nhận. Các bộ vị không đo được từ landmark (độ dày tai, độ rậm
 * lông mày, thần thái…) được trả về trong danh sách "cần tự kiểm".
 */

import type { NhanTuongFeatureId } from './nhan-tuong';

export type VisionConfidence = 'cao' | 'vua' | 'thap';

export const VISION_CONFIDENCE_LABELS: Record<VisionConfidence, string> = {
  cao: 'độ tin cậy cao',
  vua: 'độ tin cậy vừa',
  thap: 'gợi ý sơ bộ',
};

export interface VisionSuggestion {
  featureId: NhanTuongFeatureId;
  optionId: string;
  confidence: VisionConfidence;
  /** Giải thích số đo — hiển thị để người dùng đối chiếu. */
  reason: string;
}

export interface VisionAnalysis {
  suggestions: VisionSuggestion[];
  /** Bộ vị máy không đo được từ ảnh — người dùng cần tự quan sát. */
  manualFeatures: NhanTuongFeatureId[];
}

/** Lỗi có thông điệp thân thiện hiển thị thẳng cho người dùng. */
export class VisionError extends Error {}

// ---------------------------------------------------------------------------
// Face Landmarker (singleton, tải lười khi người dùng bấm phân tích)
// ---------------------------------------------------------------------------

const WASM_CDN =
  'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@1.0.1/wasm';
const MODEL_URL =
  'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task';

type Landmarker = import('@mediapipe/tasks-vision').FaceLandmarker;

let landmarkerPromise: Promise<Landmarker> | null = null;

async function getLandmarker(): Promise<Landmarker> {
  if (!landmarkerPromise) {
    landmarkerPromise = (async () => {
      const { FaceLandmarker, FilesetResolver } = await import(
        '@mediapipe/tasks-vision'
      );
      const fileset = await FilesetResolver.forVisionTasks(WASM_CDN);
      return FaceLandmarker.createFromOptions(fileset, {
        baseOptions: { modelAssetPath: MODEL_URL },
        runningMode: 'IMAGE',
        numFaces: 1,
      });
    })().catch((e) => {
      landmarkerPromise = null;
      throw e;
    });
  }
  return landmarkerPromise;
}

// ---------------------------------------------------------------------------
// Hình học
// ---------------------------------------------------------------------------

interface Pt {
  x: number;
  y: number;
}

function dist(a: Pt, b: Pt): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function pct(n: number): string {
  return `${Math.round(n * 100)}%`;
}

// ---------------------------------------------------------------------------
// Phân tích
// ---------------------------------------------------------------------------

export async function analyzeFacePhoto(
  image: HTMLImageElement,
): Promise<VisionAnalysis> {
  let landmarker: Landmarker;
  try {
    landmarker = await getLandmarker();
  } catch {
    throw new VisionError(
      'Không tải được bộ nhận diện (cần kết nối mạng lần đầu). Quý vị thử lại giúp.',
    );
  }

  const result = landmarker.detect(image);
  const lm = result.faceLandmarks?.[0];
  if (!lm || lm.length < 468) {
    throw new VisionError(
      'Chưa nhận ra khuôn mặt trong ảnh. Quý vị dùng ảnh chụp thẳng mặt, đủ sáng, không che khuất giúp.',
    );
  }

  // Đổi tọa độ chuẩn hóa → pixel để tỷ lệ dọc/ngang không bị méo
  const W = image.naturalWidth || image.width;
  const H = image.naturalHeight || image.height;
  const p = (i: number): Pt => ({ x: lm[i].x * W, y: lm[i].y * H });

  const suggestions: VisionSuggestion[] = [];
  const manual = new Set<NhanTuongFeatureId>([
    'tai',
    'thanThai',
    'mui', // sống mũi cao/thấp cần nhìn nghiêng — ảnh thẳng không đo được
  ]);

  // ---- Số đo nền -----------------------------------------------------------
  const top = p(10); // mép trên vùng trán (dưới chân tóc)
  const glabella = p(9); // giữa hai đầu mày
  const noseBase = p(2); // chân mũi
  const chin = p(152); // đáy cằm
  const cheekW = Math.abs(p(454).x - p(234).x); // rộng nhất tầm gò má
  const jawW = Math.abs(p(288).x - p(58).x); // rộng hàm (gần góc hàm)
  const foreheadW = Math.abs(p(284).x - p(54).x); // rộng trán
  const faceH = Math.abs(chin.y - top.y);

  if (cheekW < 40 || faceH < 60) {
    throw new VisionError(
      'Khuôn mặt trong ảnh quá nhỏ để đo. Quý vị dùng ảnh chân dung gần hơn giúp.',
    );
  }

  // ---- 1. Hình tướng ngũ hành ----------------------------------------------
  const lenRatio = faceH / cheekW;
  const jawRatio = jawW / cheekW;
  const fhRatio = foreheadW / cheekW;

  let faceShape: string;
  if (lenRatio >= 1.45) faceShape = 'moc';
  else if (fhRatio < 0.84 && jawRatio >= 0.88) faceShape = 'hoa';
  else if (jawRatio >= 0.93) faceShape = 'kim';
  else if (lenRatio <= 1.32 && jawRatio <= 0.86) faceShape = 'thuy';
  else faceShape = 'tho';

  suggestions.push({
    featureId: 'faceShape',
    optionId: faceShape,
    confidence: 'vua',
    reason: `Dài mặt / rộng gò má ≈ ${lenRatio.toFixed(2)}; rộng hàm ≈ ${pct(jawRatio)} và rộng trán ≈ ${pct(fhRatio)} so với gò má.`,
  });

  // ---- 2. Tam đình ----------------------------------------------------------
  const h1 = Math.max(1, glabella.y - top.y);
  const h2 = Math.max(1, noseBase.y - glabella.y);
  const h3 = Math.max(1, chin.y - noseBase.y);
  const mean = (h1 + h2 + h3) / 3;

  const dinhOption = (
    ratio: number,
    long: string,
    short: string,
  ): string => {
    if (ratio >= 1.12) return long;
    if (ratio <= 0.88) return short;
    return 'can_doi';
  };

  const r1 = h1 / mean;
  const r2 = h2 / mean;
  const r3 = h3 / mean;

  suggestions.push({
    featureId: 'thuongDinh',
    optionId: dinhOption(r1, 'cao_rong', 'thap_hep'),
    confidence: 'vua',
    reason: `Thượng đình chiếm ≈ ${pct(h1 / (h1 + h2 + h3))} chiều cao mặt (đo từ mép da trán thấy được — nếu tóc che trán, quý vị tự cân chỉnh lại).`,
  });
  suggestions.push({
    featureId: 'trungDinh',
    optionId: dinhOption(r2, 'no_nang', 'hut_lep'),
    confidence: 'cao',
    reason: `Trung đình chiếm ≈ ${pct(h2 / (h1 + h2 + h3))} chiều cao mặt.`,
  });
  suggestions.push({
    featureId: 'haDinh',
    optionId: dinhOption(r3, 'day_no', 'nhon_lem'),
    confidence: 'cao',
    reason: `Hạ đình chiếm ≈ ${pct(h3 / (h1 + h2 + h3))} chiều cao mặt.`,
  });

  // ---- 3. Mắt ---------------------------------------------------------------
  const eyeWr = dist(p(33), p(133));
  const eyeWl = dist(p(362), p(263));
  const eyeHr = dist(p(159), p(145));
  const eyeHl = dist(p(386), p(374));
  const eyeW = (eyeWr + eyeWl) / 2;
  const eyeH = (eyeHr + eyeHl) / 2;
  const openness = eyeH / eyeW;
  const eyeSpan = eyeW / cheekW;

  if (openness >= 0.42 && eyeSpan >= 0.23) {
    suggestions.push({
      featureId: 'mat',
      optionId: 'to_sang',
      confidence: 'vua',
      reason: `Mắt mở ≈ ${pct(openness)} bề ngang mắt, khe mắt rộng ≈ ${pct(eyeSpan)} bề mặt — thiên về mắt to tròn.`,
    });
  } else if (openness <= 0.3) {
    suggestions.push({
      featureId: 'mat',
      optionId: 'dai_nho',
      confidence: 'vua',
      reason: `Mắt mở ≈ ${pct(openness)} bề ngang mắt — khe mắt dài hẹp, thiên về mắt dài nhỏ.`,
    });
  } else {
    manual.add('mat'); // trung gian: thần / độ lộ tròng máy không kết luận được
  }

  // ---- 4. Miệng -------------------------------------------------------------
  const mouthW = dist(p(61), p(291));
  const lipUpper = dist(p(0), p(13));
  const lipLower = dist(p(14), p(17));
  const mouthSpan = mouthW / cheekW;
  const lipThick = (lipUpper + lipLower) / mouthW;

  if (mouthSpan >= 0.42) {
    suggestions.push({
      featureId: 'mieng',
      optionId: 'rong_lon',
      confidence: 'vua',
      reason: `Miệng rộng ≈ ${pct(mouthSpan)} bề rộng gò má — thuộc dạng miệng rộng.`,
    });
  } else if (mouthSpan <= 0.3) {
    suggestions.push({
      featureId: 'mieng',
      optionId: 'nho_chum',
      confidence: 'vua',
      reason: `Miệng rộng ≈ ${pct(mouthSpan)} bề rộng gò má — thuộc dạng miệng nhỏ kín đáo.`,
    });
  } else if (lipThick <= 0.26) {
    suggestions.push({
      featureId: 'mieng',
      optionId: 'mong',
      confidence: 'thap',
      reason: `Độ dày hai môi ≈ ${pct(lipThick)} bề rộng miệng — thiên về môi mỏng.`,
    });
  } else {
    suggestions.push({
      featureId: 'mieng',
      optionId: 'vuong_day',
      confidence: 'thap',
      reason: `Bề rộng miệng cân đối (≈ ${pct(mouthSpan)} gò má), môi dày vừa (≈ ${pct(lipThick)}) — tạm xếp miệng vuông vắn; quý vị đối chiếu thêm khóe miệng và sắc môi.`,
    });
  }

  // ---- 5. Dáng lông mày (chỉ đo được độ chếch / độ cong) ---------------------
  const browTiltR = (p(107).y - p(70).y) / eyeW; // dương = đuôi cao hơn đầu
  const browTiltL = (p(336).y - p(300).y) / eyeW;
  const browTilt = (browTiltR + browTiltL) / 2;

  const chordMidR = { x: (p(107).x + p(70).x) / 2, y: (p(107).y + p(70).y) / 2 };
  const chordMidL = { x: (p(336).x + p(300).x) / 2, y: (p(336).y + p(300).y) / 2 };
  const browArch =
    ((chordMidR.y - p(105).y) + (chordMidL.y - p(334).y)) / 2 / eyeW;

  if (browTilt >= 0.18) {
    suggestions.push({
      featureId: 'longMay',
      optionId: 'xech_dung',
      confidence: 'thap',
      reason: 'Đuôi mày chếch lên rõ so với đầu mày — dáng mày xếch. Độ rậm/thưa máy không đo được, quý vị đối chiếu thêm.',
    });
  } else if (browArch >= 0.14) {
    suggestions.push({
      featureId: 'longMay',
      optionId: 'cong_nhu',
      confidence: 'thap',
      reason: 'Thân mày cong rõ so với đường nối đầu–đuôi mày — dáng mày cong mềm. Độ rậm/thưa máy không đo được, quý vị đối chiếu thêm.',
    });
  } else {
    manual.add('longMay'); // thanh/rậm/thưa cần nhìn mật độ sợi
  }

  return {
    suggestions,
    manualFeatures: [...manual],
  };
}
