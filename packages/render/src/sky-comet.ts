import { hash01, withAlpha } from "./backdrop.js";
import type { BackdropDraw } from "./backdrop-look.js";
import { mixHex } from "./hex.js";
import { drawDeepSky } from "./sky-depth.js";
import { actTint, baked, lighter, skyGlow } from "./sky-kit.js";

/**
 * COMET — a great comet hangs across the sky.
 *
 * Its head is just past the top edge, on the right, so the light comes into
 * the picture from outside it: only the edge of the coma shows. From there
 * two tails fall down and to the left — a broad curved fan of dust in warm
 * white and the act's colour, and a thin blue tail of gas beside it.
 *
 * It moves the way a comet does to an eye: the whole tail sways a little, as
 * the solar wind leans on it; grains of dust stream outward along the fan and
 * fade; the gas tail ripples, a slow wave running down it. Nothing travels —
 * the head stays where it is.
 *
 * The dust fan is baked once, in the tail's own frame with the head at the
 * origin, and turned at the blit; a frame is that blit, the grains, three
 * strokes of gas and the coma's glow.
 */

/** Where the head is: above the top edge, a share of the width and the height. */
const HEAD = { x: 0.86, y: -0.07 } as const;
/** Which way the tails run, in radians from +x: down and to the left. */
const AWAY = Math.PI * 0.69;
/** How far the tail sways either way, in radians, and how fast. */
const SWAY = 0.025;
const SWAY_RATE = 0.21;
const GRAINS = 44;
const GAS = 3;
const GAS_STEPS = 14;
/** The dust sheet around the head: how much of it lies behind the head, and
 * above the tail's axis, as shares of its own size. */
const BACK = 0.04;
const ABOVE = 0.22;

/** How far one dust stroke bends off the axis at `u` along it. */
function bend(k: number, u: number): number {
  return (0.06 + k * 0.32) * u * u;
}

function dustTail(tint: string, len: number): HTMLCanvasElement {
  return baked(`comet-dust${tint}`, len / (1 - BACK), len * 0.75, (g, pw, ph) => {
    const warm = mixHex(tint, "#FFE8D0", 0.6);
    const hx = pw * BACK;
    const hy = ph * ABOVE;
    const L = pw * (1 - BACK);
    // A fan of soft strokes, each bending a little more than the last.
    for (let i = 0; i < 64; i++) {
      const k = i / 63;
      const reach = L * (0.75 + hash01(190_000 + i * 3) * 0.25);
      const ey = hy + bend(k, 1) * reach;
      const my = hy + bend(k, 0.5) * reach * 0.5;
      const grad = g.createLinearGradient(hx, hy, hx + reach, ey);
      grad.addColorStop(0, withAlpha(warm, 0.15));
      grad.addColorStop(0.35, withAlpha(mixHex(warm, tint, 0.5), 0.08));
      grad.addColorStop(1, withAlpha(tint, 0));
      g.strokeStyle = grad;
      g.lineWidth = 4 + hash01(190_001 + i * 3) * 14 + k * 10;
      g.lineCap = "round";
      g.beginPath();
      g.moveTo(hx, hy);
      g.quadraticCurveTo(hx + reach * 0.5, my, hx + reach, ey);
      g.stroke();
    }
  });
}

export function skyComet(d: BackdropDraw): void {
  const { ctx, l, time } = d;
  const height = l.bandTop;
  if (height <= 0 || l.width <= 0) return;
  drawDeepSky(d, { seed: 191_000, far: 190 });
  const tint = actTint(d, 0.4);
  const hx = HEAD.x * l.width;
  const hy = HEAD.y * height;
  const len = Math.hypot(l.width, height) * 1.05;
  const sheet = dustTail(tint, len);
  const sw = len / (1 - BACK);
  const sh = len * 0.75;

  lighter(ctx, () => {
    ctx.save();
    ctx.translate(hx, hy);
    ctx.rotate(AWAY + SWAY * Math.sin(time * SWAY_RATE));
    ctx.globalAlpha = 0.85 + 0.15 * Math.sin(time * 0.5);
    ctx.drawImage(sheet, -sw * BACK, -sh * ABOVE, sw, sh);

    // Grains stream outward along the fan, bright near the head, gone by its end.
    ctx.fillStyle = mixHex(tint, "#FFF0DC", 0.7);
    for (let i = 0; i < GRAINS; i++) {
      const s = 192_000 + i * 4;
      const k = hash01(s + 1);
      const p = time * (0.012 + hash01(s + 2) * 0.02) + hash01(s + 3);
      const u = p - Math.floor(p);
      const x = u * len * 0.9;
      const y = bend(k, u) * len * 0.9 + (hash01(s + 4) - 0.5) * 6;
      const size = 1 + hash01(s + 5) * 1.6;
      ctx.globalAlpha = 0.7 * (1 - u) * Math.min(1, u * 12);
      ctx.fillRect(x - size / 2, y - size / 2, size, size);
    }

    // The gas tail: a few thin strokes with a wave running down them.
    for (let j = 0; j < GAS; j++) {
      const off = (j - 1) * 0.014 - 0.035;
      const grad = ctx.createLinearGradient(0, 0, len * 0.85, 0);
      grad.addColorStop(0, withAlpha("#C4D0FF", 0.45 - Math.abs(j - 1) * 0.15));
      grad.addColorStop(1, withAlpha("#C4D0FF", 0));
      ctx.strokeStyle = grad;
      ctx.lineWidth = j === 1 ? 2.5 : 1.4;
      ctx.globalAlpha = 0.8 + 0.2 * Math.sin(time * 0.9 + j);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      for (let n = 1; n <= GAS_STEPS; n++) {
        const u = n / GAS_STEPS;
        const x = u * len * 0.85;
        const wave = Math.sin(u * 9 - time * 0.8 + j * 0.7) * u * len * 0.012;
        ctx.lineTo(x, x * off + wave);
      }
      ctx.stroke();
    }
    ctx.restore();

    // The coma, its centre past the top edge: a wide soft light coming in,
    // and a brighter heart whose rim just shows, breathing.
    const halo = l.width * 1.1;
    ctx.globalAlpha = 0.55;
    ctx.drawImage(
      skyGlow(mixHex(tint, "#FFF6EC", 0.6), 256, [0, 0.2, 1]),
      hx - halo / 2,
      hy - halo / 2,
      halo,
      halo,
    );
    const coma = l.width * (0.42 + 0.03 * Math.sin(time * 0.7));
    ctx.globalAlpha = 0.9;
    ctx.drawImage(skyGlow("#FFF6EC", 256, [0, 0.12, 1]), hx - coma / 2, hy - coma / 2, coma, coma);
  });
}
