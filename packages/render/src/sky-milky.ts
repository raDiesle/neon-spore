import { hash01, withAlpha } from "./backdrop.js";
import type { BackdropDraw } from "./backdrop-look.js";
import { mixHex } from "./hex.js";
import { drawDeepSky } from "./sky-depth.js";
import { actTint, baked, lighter, skyGlow } from "./sky-kit.js";

/**
 * MILKY — the galaxy's own band crosses the sky corner to corner.
 *
 * A river of stars from the bottom left to the top right: thousands of
 * points packed toward its spine, a glow of the act's colour under them, and
 * dark lanes of dust breaking it up the way the real one is broken. Outside
 * the band the sky is black and sparse. Its heart bulges, a warm glow
 * where the band is thickest, with knots of rose gas strung along it.
 *
 * It moves only as a sky does: the whole band turns a hair either way about
 * the middle of the picture, very slowly, and the bulge breathes. It never
 * slides, because a band that slides reads as the ship flying and the ship
 * does not fly. A dozen bright stars breathe on their own clocks.
 *
 * Baked once per size and tint; a frame is the deep sky, the band turned,
 * the bulge and twelve stars.
 */

/** The band's spine runs from (0, 1) to (1, 0) of the sky, shifted by this. */
const SPINE_SHIFT = 0.04;
/** Half its width, as a share of the sky's diagonal. */
const HALF = 0.17;
const BRIGHT = 12;
/** How far the band turns either way, in radians, and its period in seconds. */
const ROCK = 0.012;
const ROCK_PERIOD = 90;
/** The band drawn this much larger than the sky, so a turn shows no corner. */
const OVER = 1.06;
const KNOT = "#F0A0D0";

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

    // Knots of rose gas, where new stars are, strung along the spine.
    for (let i = 0; i < 30; i++) {
      const u = 0.1 + hash01(81_000 + i) * 0.8;
      const off = (hash01(81_100 + i) - 0.5) * spread * 0.7;
      const x = u * pw * (1 - SPINE_SHIFT) + (n.x / len) * off;
      const y = (1 - u) * ph * (1 - SPINE_SHIFT) + (n.y / len) * off;
      const r = spread * (0.012 + hash01(81_200 + i) * 0.022);
      const knot = g.createRadialGradient(x, y, 0, x, y, r);
      knot.addColorStop(0, withAlpha(KNOT, 0.3));
      knot.addColorStop(1, withAlpha(KNOT, 0));
      g.fillStyle = knot;
      g.fillRect(x - r, y - r, r * 2, r * 2);
    }
  });
}

export function skyMilky(d: BackdropDraw): void {
  const { ctx, l, time } = d;
  const height = l.bandTop;
  if (height <= 0 || l.width <= 0) return;
  drawDeepSky(d, { seed: 90_500, far: 120 });
  const tint = actTint(d, 0.4);
  const w = l.width * OVER;
  const h = height * OVER;
  ctx.save();
  ctx.translate(l.width / 2, height / 2);
  ctx.rotate(ROCK * Math.sin((time / ROCK_PERIOD) * Math.PI * 2));
  ctx.globalAlpha = 0.9;
  ctx.drawImage(bandSheet(tint, l.width, height), -w / 2, -h / 2, w, h);
  ctx.restore();
  lighter(ctx, () => {
    // The bulge: a warm glow on the band's spine, a little below the middle.
    const bulge = l.width * (0.95 + 0.05 * Math.sin(time * 0.25));
    ctx.globalAlpha = 0.22;
    ctx.drawImage(
      skyGlow(mixHex(tint, "#FFE0C0", 0.55), 256, [0, 0.3, 1]),
      l.width * 0.46 - bulge / 2,
      height * 0.52 - bulge / 2,
      bulge,
      bulge,
    );
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
