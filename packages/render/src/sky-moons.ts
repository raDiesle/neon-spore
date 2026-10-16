import { hash01, withAlpha } from "./backdrop.js";
import type { BackdropDraw } from "./backdrop-look.js";
import { mixHex } from "./hex.js";
import { actTint, baked, drawStars, paintSpace, starSheet } from "./sky-kit.js";

/**
 * MOONS — three moons over the field, one of them huge.
 *
 * A great cratered moon low on the right, a crescent lit from the upper
 * left with the rest of its face in earthshine, and two small ones higher on
 * the left at other phases. They hang still; the lit edge of the big one
 * breathes a little, as a light through thin air does.
 *
 * Each moon is baked once per size, tint and phase; a frame is the stars
 * and three blits.
 */

interface Moon {
  readonly x: number;
  readonly y: number;
  /** Radius as a share of the width. */
  readonly r: number;
  /** Where its light comes from: the shadow disc's offset, in radii. */
  readonly lit: number;
  readonly craters: number;
  readonly seed: number;
}

const MOONS: readonly Moon[] = [
  { x: 0.86, y: 0.66, r: 0.42, lit: 0.55, craters: 26, seed: 160_000 },
  { x: 0.18, y: 0.18, r: 0.085, lit: 0.9, craters: 5, seed: 161_000 },
  { x: 0.4, y: 0.09, r: 0.045, lit: 1.3, craters: 3, seed: 162_000 },
];

function moonSheet(m: Moon, tint: string, size: number): HTMLCanvasElement {
  return baked(`moon${m.seed},${tint}`, size, size, (g, w) => {
    const r = w / 2;
    const face = mixHex(tint, "#D8D0E0", 0.55);
    const dark = mixHex(tint, "#000000", 0.4);
    g.save();
    g.beginPath();
    g.arc(r, r, r, 0, Math.PI * 2);
    g.clip();
    const body = g.createRadialGradient(r * 0.7, r * 0.7, 0, r, r, r);
    body.addColorStop(0, face);
    body.addColorStop(1, mixHex(face, dark, 0.5));
    g.fillStyle = body;
    g.fillRect(0, 0, w, w);
    for (let i = 0; i < m.craters; i++) {
      const s = m.seed + i * 5;
      const cr = r * (0.04 + hash01(s + 1) ** 2 * 0.2);
      const cx = r + (hash01(s + 2) - 0.5) * r * 1.8;
      const cy = r + (hash01(s + 3) - 0.5) * r * 1.8;
      g.fillStyle = withAlpha(dark, 0.35);
      g.beginPath();
      g.arc(cx, cy, cr, 0, Math.PI * 2);
      g.fill();
      g.strokeStyle = withAlpha(face, 0.35);
      g.lineWidth = Math.max(1, cr * 0.18);
      g.beginPath();
      g.arc(cx + cr * 0.12, cy + cr * 0.12, cr, Math.PI * 0.9, Math.PI * 1.9);
      g.stroke();
    }
    // Night: a soft disc offset from the light, leaving a crescent lit.
    const ox = r + r * m.lit * 0.75;
    const oy = r + r * m.lit * 0.6;
    const night = g.createRadialGradient(ox, oy, r * 0.6, ox, oy, r * 1.25);
    night.addColorStop(0, "rgba(4,3,10,0.9)");
    night.addColorStop(1, "rgba(4,3,10,0)");
    g.fillStyle = night;
    g.fillRect(0, 0, w, w);
    g.restore();
  });
}

export function skyMoons(d: BackdropDraw): void {
  const { ctx, l, time } = d;
  const height = l.bandTop;
  if (height <= 0 || l.width <= 0) return;
  paintSpace(d);
  drawStars(d, starSheet(l.width, height, 170, 163_000));
  const tint = actTint(d, 0.3);
  for (const [i, m] of MOONS.entries()) {
    const r = l.width * m.r;
    ctx.globalAlpha = i === 0 ? 0.62 + 0.06 * Math.sin(time * 0.4) : 0.75;
    ctx.drawImage(moonSheet(m, tint, r * 2), l.width * m.x - r, height * m.y - r, r * 2, r * 2);
  }
  ctx.globalAlpha = 1;
}
