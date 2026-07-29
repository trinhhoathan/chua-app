/**
 * Âm thanh gieo quẻ Kinh Dịch — Web Audio API (không cần mp3).
 * Chỉ phát sau tương tác người dùng (click).
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

function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/** Đồng xu xoay / va chạm kim loại — chuỗi dài khớp animation ~1.5s. */
export async function playCoinToss() {
  if (prefersReducedMotion()) return;
  const ctx = getCtx();
  if (!ctx) return;
  await resume(ctx);
  const t0 = ctx.currentTime;

  const hits = [
    0, 0.09, 0.18, 0.28, 0.4, 0.52, 0.66, 0.82, 0.98, 1.12, 1.28, 1.42,
  ];
  hits.forEach((offset, i) => {
    const when = t0 + offset;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    const f = ctx.createBiquadFilter();
    osc.type = 'triangle';
    const base = 720 + Math.random() * 480;
    osc.frequency.setValueAtTime(base, when);
    osc.frequency.exponentialRampToValueAtTime(
      200 + Math.random() * 100,
      when + 0.07,
    );
    f.type = 'bandpass';
    f.frequency.value = 1600 + Math.random() * 600;
    f.Q.value = 2.8;
    const gain = 0.05 + (i % 3 === 0 ? 0.06 : 0.02);
    g.gain.setValueAtTime(0.0001, when);
    g.gain.exponentialRampToValueAtTime(gain, when + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0001, when + 0.09);
    osc.connect(f);
    f.connect(g);
    g.connect(ctx.destination);
    osc.start(when);
    osc.stop(when + 0.11);
  });
}

/** Hào hiện — tiếng gỗ / đá nhẹ. */
export async function playLineLand(isYang: boolean) {
  if (prefersReducedMotion()) return;
  const ctx = getCtx();
  if (!ctx) return;
  await resume(ctx);
  const t0 = ctx.currentTime;
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(isYang ? 420 : 280, t0);
  osc.frequency.exponentialRampToValueAtTime(isYang ? 180 : 120, t0 + 0.18);
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(0.14, t0 + 0.015);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.22);
  osc.connect(g);
  g.connect(ctx.destination);
  osc.start(t0);
  osc.stop(t0 + 0.25);
}

/** Hiện đủ quẻ — chuông trang nghiêm. */
export async function playHexagramReveal() {
  if (prefersReducedMotion()) return;
  const ctx = getCtx();
  if (!ctx) return;
  await resume(ctx);
  const t0 = ctx.currentTime;

  const freqs = [523.25, 659.25, 783.99]; // C5 E5 G5
  freqs.forEach((freq, i) => {
    const when = t0 + i * 0.12;
    const osc = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = 'sine';
    osc2.type = 'triangle';
    osc.frequency.setValueAtTime(freq, when);
    osc2.frequency.setValueAtTime(freq * 2, when);
    g.gain.setValueAtTime(0.0001, when);
    g.gain.exponentialRampToValueAtTime(0.12 - i * 0.02, when + 0.04);
    g.gain.exponentialRampToValueAtTime(0.0001, when + 1.2);
    osc.connect(g);
    osc2.connect(g);
    g.connect(ctx.destination);
    osc.start(when);
    osc2.start(when);
    osc.stop(when + 1.25);
    osc2.stop(when + 1.25);
  });
}
