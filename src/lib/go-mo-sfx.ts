/**
 * Âm thanh gõ mõ / chuông / khánh — Web Audio + SpeechSynthesis niệm danh hiệu.
 */

let sharedCtx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  const AC =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext;
  if (!AC) return null;
  if (!sharedCtx) sharedCtx = new AC();
  return sharedCtx;
}

async function resume(ctx: AudioContext) {
  if (ctx.state === 'suspended') {
    try {
      await ctx.resume();
    } catch {
      /* ignore */
    }
  }
}

/** Một tiếng mõ gỗ trầm, ngắn. */
export async function playMoStrike(volume = 0.55) {
  const ctx = getCtx();
  if (!ctx) return;
  await resume(ctx);
  const t0 = ctx.currentTime;

  const osc = ctx.createOscillator();
  const oscG = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(185 + Math.random() * 25, t0);
  osc.frequency.exponentialRampToValueAtTime(95, t0 + 0.18);
  oscG.gain.setValueAtTime(0.0001, t0);
  oscG.gain.exponentialRampToValueAtTime(volume * 0.55, t0 + 0.008);
  oscG.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.28);
  osc.connect(oscG);
  oscG.connect(ctx.destination);
  osc.start(t0);
  osc.stop(t0 + 0.3);

  const click = ctx.createOscillator();
  const clickG = ctx.createGain();
  const bp = ctx.createBiquadFilter();
  click.type = 'triangle';
  click.frequency.setValueAtTime(420 + Math.random() * 80, t0);
  click.frequency.exponentialRampToValueAtTime(160, t0 + 0.06);
  bp.type = 'bandpass';
  bp.frequency.value = 700;
  bp.Q.value = 1.8;
  clickG.gain.setValueAtTime(0.0001, t0);
  clickG.gain.exponentialRampToValueAtTime(volume * 0.35, t0 + 0.004);
  clickG.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.09);
  click.connect(bp);
  bp.connect(clickG);
  clickG.connect(ctx.destination);
  click.start(t0);
  click.stop(t0 + 0.1);

  const partial = ctx.createOscillator();
  const pG = ctx.createGain();
  partial.type = 'sine';
  partial.frequency.setValueAtTime(520, t0);
  partial.frequency.exponentialRampToValueAtTime(280, t0 + 0.12);
  pG.gain.setValueAtTime(0.0001, t0);
  pG.gain.exponentialRampToValueAtTime(volume * 0.12, t0 + 0.01);
  pG.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.2);
  partial.connect(pG);
  pG.connect(ctx.destination);
  partial.start(t0);
  partial.stop(t0 + 0.22);
}

/** Tiếng chuông ngân. */
export async function playChuongStrike(volume = 0.4) {
  const ctx = getCtx();
  if (!ctx) return;
  await resume(ctx);
  const t0 = ctx.currentTime;

  const freqs = [660, 990, 1320];
  for (const f of freqs) {
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = 'sine';
    o.frequency.setValueAtTime(f, t0);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(
      volume * (f === 660 ? 0.35 : 0.12),
      t0 + 0.02,
    );
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + 1.6);
    o.connect(g);
    g.connect(ctx.destination);
    o.start(t0);
    o.stop(t0 + 1.7);
  }
}

/** Tiếng khánh — cao, trong, ngắn hơn chuông. */
export async function playKhanhStrike(volume = 0.42) {
  const ctx = getCtx();
  if (!ctx) return;
  await resume(ctx);
  const t0 = ctx.currentTime;

  const freqs = [880, 1760, 2640];
  for (const f of freqs) {
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = f > 2000 ? 'triangle' : 'sine';
    o.frequency.setValueAtTime(f, t0);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(
      volume * (f === 880 ? 0.4 : 0.1),
      t0 + 0.01,
    );
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.9);
    o.connect(g);
    g.connect(ctx.destination);
    o.start(t0);
    o.stop(t0 + 0.95);
  }
}

/** Đọc danh hiệu bằng SpeechSynthesis — resolve khi đọc xong (đồng bộ nhịp gõ). */
export function speakNiemDanhHieu(
  text: string,
  opts?: { rate?: number; enabled?: boolean },
): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve();
  if (opts?.enabled === false) return Promise.resolve();
  if (!text.trim()) return Promise.resolve();
  if (!('speechSynthesis' in window)) return Promise.resolve();

  return new Promise((resolve) => {
    try {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = 'vi-VN';
      // SpeechSynthesis: 0.1–10; map tốc độ gõ → tốc độ đọc rõ hơn
      const rate = opts?.rate ?? 1;
      u.rate = Math.min(10, Math.max(0.1, rate));
      u.pitch = 1;
      u.volume = 0.9;
      const voices = window.speechSynthesis.getVoices();
      const vi =
        voices.find((v) => v.lang.toLowerCase().startsWith('vi')) ??
        voices.find((v) => /vietnam|vietnamese/i.test(v.name));
      if (vi) u.voice = vi;

      let settled = false;
      let safetyTimer: number | null = null;
      const done = () => {
        if (settled) return;
        settled = true;
        if (safetyTimer !== null) window.clearTimeout(safetyTimer);
        resolve();
      };
      u.onend = done;
      u.onerror = done;
      // Fallback dài — chỉ khi trình duyệt không fire onend
      safetyTimer = window.setTimeout(done, 20_000);

      window.speechSynthesis.speak(u);
    } catch {
      resolve();
    }
  });
}

export function stopNiemSpeech() {
  if (typeof window === 'undefined') return;
  try {
    window.speechSynthesis?.cancel();
  } catch {
    /* ignore */
  }
}
