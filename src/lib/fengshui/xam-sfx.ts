/**
 * Âm thanh xin xăm — Web Audio API (không cần file mp3).
 * Chỉ phát sau tương tác người dùng (click).
 */

let sharedCtx: AudioContext | null = null;
let rattleTimer: number | null = null;

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

function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/** Tiếng thẻ tre va chạm ngắn. */
function woodClick(ctx: AudioContext, when: number, gain = 0.12) {
  const dur = 0.04 + Math.random() * 0.03;
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  const f = ctx.createBiquadFilter();
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(380 + Math.random() * 520, when);
  osc.frequency.exponentialRampToValueAtTime(120 + Math.random() * 80, when + dur);
  f.type = 'bandpass';
  f.frequency.value = 900 + Math.random() * 800;
  f.Q.value = 2.2;
  g.gain.setValueAtTime(0.0001, when);
  g.gain.exponentialRampToValueAtTime(gain, when + 0.008);
  g.gain.exponentialRampToValueAtTime(0.0001, when + dur);
  osc.connect(f);
  f.connect(g);
  g.connect(ctx.destination);
  osc.start(when);
  osc.stop(when + dur + 0.02);
}

/** Lắc ống — nhịp càng lúc càng dày trong durationMs. */
export async function playXamRattle(durationMs = 2400) {
  if (prefersReducedMotion()) return;
  const ctx = getCtx();
  if (!ctx) return;
  await resume(ctx);

  stopXamRattle();
  const start = ctx.currentTime;
  const end = start + durationMs / 1000;
  let t = start;
  let step = 0.16;

  while (t < end) {
    woodClick(ctx, t, 0.08 + Math.min(0.12, (t - start) * 0.05));
    if (Math.random() > 0.35) {
      woodClick(ctx, t + 0.018, 0.05);
    }
    // nhịp dày dần
    const progress = (t - start) / (durationMs / 1000);
    step = 0.15 - progress * 0.1;
    t += Math.max(0.035, step);
  }
}

export function stopXamRattle() {
  if (rattleTimer != null) {
    window.clearInterval(rattleTimer);
    rattleTimer = null;
  }
}

/** Bùm — quẻ rơi / xuất hiện. */
export async function playXamBoom() {
  if (prefersReducedMotion()) return;
  const ctx = getCtx();
  if (!ctx) return;
  await resume(ctx);
  const t0 = ctx.currentTime;

  // Thud thấp
  const thud = ctx.createOscillator();
  const thudG = ctx.createGain();
  thud.type = 'sine';
  thud.frequency.setValueAtTime(140, t0);
  thud.frequency.exponentialRampToValueAtTime(45, t0 + 0.35);
  thudG.gain.setValueAtTime(0.0001, t0);
  thudG.gain.exponentialRampToValueAtTime(0.35, t0 + 0.02);
  thudG.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.4);
  thud.connect(thudG);
  thudG.connect(ctx.destination);
  thud.start(t0);
  thud.stop(t0 + 0.45);

  // Chuông sáng
  const chime = ctx.createOscillator();
  const chime2 = ctx.createOscillator();
  const chG = ctx.createGain();
  chime.type = 'sine';
  chime2.type = 'triangle';
  chime.frequency.setValueAtTime(880, t0 + 0.04);
  chime2.frequency.setValueAtTime(1320, t0 + 0.04);
  chG.gain.setValueAtTime(0.0001, t0 + 0.04);
  chG.gain.exponentialRampToValueAtTime(0.18, t0 + 0.06);
  chG.gain.exponentialRampToValueAtTime(0.0001, t0 + 1.1);
  chime.connect(chG);
  chime2.connect(chG);
  chG.connect(ctx.destination);
  chime.start(t0 + 0.04);
  chime2.start(t0 + 0.04);
  chime.stop(t0 + 1.15);
  chime2.stop(t0 + 1.15);
}
