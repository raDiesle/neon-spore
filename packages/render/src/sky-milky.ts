import { hash01, withAlpha } from "./backdrop.js";
import type { BackdropDraw } from "./backdrop-look.js";
import { mixHex } from "./hex.js";
import { actTint, baked, lighter, paintSpace } from "./sky-kit.js";

/**
 * MILKY — the galaxy's own band crosses the sky corner to corner.
 *
 * A river of stars from the bottom left to the top right: thousands of
 * points packed toward its spine, a glow of the act's colour under them, and
 * dark lanes of dust breaking it up the way the real one is broken. Outside
 * the band the sky is black and sparse. A dozen bright stars across the whole
 * sky breathe on their own clocks; nothing else moves, because a band that
 * slides reads as the ship flying and the ship does not fly.
 *
 * Baked once per size and tint; a frame is one blit and twelve stars.
 */

/** The band's spine runs from (0, 1) to (1, 0) of the sky, shifted by this. */
const SPINE_SHIFT = 0.04;
/** Half its width, as a share of the sky's diagonal. */
const HALF = 0.17;
const BRIGHT = 12;

/** How far (signed, in diagonals) a point is from the spine. */
function across(x: number, y: number, w: number, h: number): number {
  const diag = Math.hypot(w, h);
  // The line through (0, h) and (w, 0): h·x + w·y − w·h = 0.
  return (h * x + w * y - w * h * (1 - SPINE_SHIFT)) / diag / diag;
}

function bandSheet(tint: string, w: number, h: number): HTMLCanvasElement {
  return baked(`milky${tint}`, w, h, (g, pw, ph) => {
    const glowColour = mixHex(tint, "#D8C8F0", 0.35);
    // The glow: a gradient across the spine.
    const n = { x: ph, y: pw };
    const len = Math.hypot(n.x, n.y);
    const mx = (pw * (1 - SPINE_SHIFT)) / 2;
    const my = (ph * (1 - SPINE_SHIFT)) / 2;
    const spread = HALF * Math.hypot(pw, ph);
    const grad = g.createLinearGradient(
      mx - (n.x / len) * spread * 1.4,
      my - (n.y / len) * spread * 1.4,
      mx + (n.x / len) * spread * 1.4,
      my + (n.y / len) * spread * 1.4,
    );
    grad.addColorStop(0, withAlpha(glowColour, 0));
    grad.addColorStop(0.5, withAlpha(glowColour, 0.32));
    grad.addColorStop(1, withAlpha(glowColour, 0));
    g.fillStyle = grad;
    g.fillRect(0, 0, pw, ph);

    // Stars, packed toward the spine.
    for (let i = 0; i < 9000; i++) {
      const s = 70_000 + i * 4;
      const x = hash01(s + 1) * pw;
      const y = hash01(s + 2) * ph;
      const k = Math.abs(across(x, y, pw, ph)) / HALF;
      const p = k < 1 ? Math.exp(-k * k * 2.6) : 0.035;
      if (hash01(s + 3) > p) continue;
      const a = 0.15 + hash01(s + 4) * 0.55;
      const tone = hash01(s + 5);
      g.fillStyle = withAlpha(tone < 0.2 ? "#FFD9B0" : tone > 0.8 ? "#B8D8FF" : "#ECE8FF", a);
      const dot = tone > 0.97 ? 1.8 : 0.9;
      g.fillRect(x, y, dot, dot);
    }

    // Dust: dark lanes along the spine, a chain of soft blotches.
    for (let i = 0; i < 46; i++) {
      const u = hash01(80_000 + i);
      const off = (hash01(80_100 + i) - 0.45) * spread * 0.5;
      const x = u * pw * (1 - SPINE_SHIFT) + (n.x / len) * off;
      const y = (1 - u) * ph * (1 - SPINE_SHIFT) + (n.y / len) * off;
      const r = spread * (0.12 + hash01(80_200 + i) * 0.22);
      const dust = g.createRadialGradient(x, y, 0, x, y, r);
      dust.addColorStop(0, "rgba(3,2,8,0.6)");
      dust.addColorStop(1, "rgba(3,2,8,0)");
      g.fillStyle = dust;
      g.fillRect(x - r, y - r, r * 2, r * 2);
    }
  });
}

export function skyMilky(d: BackdropDraw): void {
  const { ctx, l, time } = d;
  const height = l.bandTop;
  if (height <= 0 || l.width <= 0) return;
  paintSpace(d);
  const tint = actTint(d, 0.4);
  ctx.globalAlpha = 0.9;
  ctx.drawImage(bandSheet(tint, l.width, height), 0, 0, l.width, height);
  lighter(ctx, () => {
    ctx.fillStyle = "#F4F0FF";
    for (let i = 0; i < BRIGHT; i++) {
      const s = 90_000 + i * 4;
      const x = hash01(s + 1) * l.width;
      const y = hash01(s + 2) * height;
      ctx.globalAlpha = 0.35 + 0.3 * Math.sin(time * (0.6 + hash01(s + 3)) + i * 1.3);
      ctx.fillRect(x - 1, y - 1, 2, 2);
      ctx.globalAlpha *= 0.35;
      ctx.fillRect(x - 3, y - 0.5, 6, 1);
      ctx.fillRect(x - 0.5, y - 3, 1, 6);
    }
  });
}
