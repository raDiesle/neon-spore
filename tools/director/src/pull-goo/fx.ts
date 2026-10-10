import type { Point } from "@neon-spore/content";
import { hash } from "./noise.js";
import type { GooStyle } from "./style.js";

/**
 * What two of the GOO looks do that the others do not: HONEY's drops that
 * hang and fall under their own weight, and ACID's bubbles that boil off it
 * and pop. Both are on a loop of their own per spot, so no two move together.
 */

/** A drop hanging below `at`, growing on its thread and letting go, every `period` seconds. */
export function drip(
  ctx: CanvasRenderingContext2D,
  at: Point,
  r: number,
  time: number,
  seed: number,
  style: GooStyle,
  alpha: number,
): void {
  const period = 1.4 + hash(seed) * 0.9;
  const u = ((time + hash(seed + 1) * period) % period) / period;
  ctx.save();
  ctx.fillStyle = style.body;
  ctx.strokeStyle = style.neon;
  ctx.lineWidth = r * 0.04;
  if (u < 0.75) {
    // Growing: a bead on a thread that lengthens.
    const k = u / 0.75;
    const len = r * 0.9 * k * k;
    const bead = r * (0.08 + 0.12 * k);
    ctx.globalAlpha = alpha * 0.9;
    ctx.beginPath();
    ctx.moveTo(at.x - bead * 0.5, at.y);
    ctx.quadraticCurveTo(at.x, at.y + len * 0.6, at.x - bead * 0.6, at.y + len);
    ctx.arc(at.x, at.y + len, bead, Math.PI, 0, true);
    ctx.quadraticCurveTo(at.x, at.y + len * 0.6, at.x + bead * 0.5, at.y);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  } else {
    // Let go: the bead falls and fades.
    const k = (u - 0.75) / 0.25;
    const y = at.y + r * 0.9 + r * 3.2 * k * k;
    ctx.globalAlpha = alpha * (1 - k);
    ctx.beginPath();
    ctx.ellipse(at.x, y, r * 0.17, r * 0.24, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

/** Bubbles boiling up off `at` within `spread` of it: they rise, swell and pop as a ring. */
export function fizz(
  ctx: CanvasRenderingContext2D,
  at: Point,
  r: number,
  time: number,
  o: { seed: number; n: number; spread: number; style: GooStyle; alpha: number },
): void {
  ctx.save();
  ctx.lineWidth = r * 0.05;
  for (let i = 0; i < o.n; i++) {
    const period = 0.7 + hash(o.seed + i * 2.1) * 0.8;
    const u = ((time + hash(o.seed + i) * period) % period) / period;
    const x = at.x + (hash(o.seed + i * 4.3) - 0.5) * 2 * o.spread;
    const y = at.y + (hash(o.seed + i * 6.1) - 0.5) * o.spread - u * r * 1.3;
    const s = r * (0.05 + 0.1 * u) * (0.6 + hash(o.seed + i * 8.9));
    ctx.strokeStyle = o.style.neon;
    if (u < 0.85) {
      ctx.globalAlpha = o.alpha * 0.75;
      ctx.beginPath();
      ctx.arc(x, y, s, 0, Math.PI * 2);
      ctx.stroke();
    } else {
      // The pop: a ring thrown wider and gone.
      const k = (u - 0.85) / 0.15;
      ctx.globalAlpha = o.alpha * (1 - k);
      ctx.beginPath();
      ctx.arc(x, y, s * (1 + 1.6 * k), 0, Math.PI * 2);
      ctx.stroke();
    }
  }
  ctx.restore();
}
