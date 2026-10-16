import { hash01, withAlpha } from "./backdrop.js";
import type { BackdropDraw } from "./backdrop-look.js";
import { mixHex } from "./hex.js";
import { drawDeepSky } from "./sky-depth.js";
import { actTint, baked, lighter } from "./sky-kit.js";

/**
 * MOONS — three moons over the field, one of them huge.
 *
 * A great cratered moon low on the right, a crescent lit from the upper
 * left with the rest of its face in earthshine, and two small ones higher on
 * the left at other phases. A thin halo of air hangs round the big one and
 * breathes; the two small ones bob a little, far off; and a pebble of a moon
 * goes round the big one, in front of its face for half the orbit and behind
 * it for the other.
 *
 * Each moon is baked once per size, tint and phase; a frame is the deep sky,
 * the halo and five blits.
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

/** Thin air round the big moon: nothing over its face, a glow just past
 * the limb, gone by a quarter of a radius out. Drawn 2.5 radii across. */
function haloSheet(tint: string): HTMLCanvasElement {
  return baked(`moon-halo${tint}`, 256, 256, (g, w) => {
    const c = w / 2;
    const limb = c / 1.25;
    const grad = g.createRadialGradient(c, c, limb * 0.96, c, c, c);
    grad.addColorStop(0, withAlpha(tint, 0));
    grad.addColorStop(0.08, withAlpha(mixHex(tint, "#E8E0F8", 0.5), 1));
    grad.addColorStop(1, withAlpha(tint, 0));
    g.fillStyle = grad;
    g.fillRect(0, 0, w, w);
  });
}

/** The pebble going round the big moon: its orbit's radius and lean, in big
 * moon radii, its period in seconds and its own radius. */
const PEBBLE = { orbit: 1.35, lean: 0.25, period: 110, r: 0.07 } as const;

export function skyMoons(d: BackdropDraw): void {
  const { ctx, l, time } = d;
  const height = l.bandTop;
  if (height <= 0 || l.width <= 0) return;
  drawDeepSky(d, { seed: 163_000, far: 170 });
  const tint = actTint(d, 0.3);
  const big = MOONS[0]!;
  const br = l.width * big.r;
  const bx = l.width * big.x;
  const by = height * big.y;
  const orbit = (time / PEBBLE.period) * Math.PI * 2 + 2.4;
  const front = Math.sin(orbit) > 0;
  const pr = br * PEBBLE.r * (1 + 0.1 * Math.sin(orbit));
  const px = bx + Math.cos(orbit) * br * PEBBLE.orbit;
  const py = by + Math.sin(orbit) * br * PEBBLE.orbit * PEBBLE.lean - Math.cos(orbit) * br * 0.3;
  const pebble = moonSheet(MOONS[2]!, tint, 64);

  lighter(ctx, () => {
    const halo = br * 2.5;
    ctx.globalAlpha = 0.16 + 0.05 * Math.sin(time * 0.4);
    ctx.drawImage(haloSheet(tint), bx - halo / 2, by - halo / 2, halo, halo);
  });
  ctx.globalAlpha = front ? 0 : 0.7;
  ctx.drawImage(pebble, px - pr, py - pr, pr * 2, pr * 2);
  for (const [i, m] of MOONS.entries()) {
    const r = l.width * m.r;
    const bob = i === 0 ? 0 : Math.sin(time * 0.11 + i * 2) * l.width * 0.006;
    ctx.globalAlpha = i === 0 ? 0.62 + 0.06 * Math.sin(time * 0.4) : 0.75;
    ctx.drawImage(
      moonSheet(m, tint, r * 2),
      l.width * m.x - r + bob,
      height * m.y - r + bob * 0.6,
      r * 2,
      r * 2,
    );
  }
  ctx.globalAlpha = front ? 0.85 : 0;
  ctx.drawImage(pebble, px - pr, py - pr, pr * 2, pr * 2);
  ctx.globalAlpha = 1;
}
