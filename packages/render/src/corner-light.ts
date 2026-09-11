import { tintFor } from "./backdrop.js";
import type { BackdropDraw } from "./backdrop-look.js";
import { bakedCache } from "./baked.js";
import { mixHex } from "./hex.js";
import { PALETTE } from "./palette.js";

/**
 * One rounded light in the bottom-right corner of the sky — what the owner
 * kept of NEBULA when he decided `field:backdrop` on 11 September 2026.
 *
 * NEBULA argued that the field is in space and put two large clouds of the
 * act's tint behind everything. He kept the shipped back — the wash, the
 * shafts, the horizon, the dust — and asked for *some, but not so strong* of
 * that card: not two clouds turning across the whole sky, *maybe just one
 * rounded light in the bottom right corner*, so it still sits well with the
 * shafts' slow light. So: one soft disc of the act's tint, its heart lifted a
 * shade toward the dust's grey the way NEBULA's clouds were (a tint within a
 * shade of black is invisible over the ground at any alpha), sitting low and
 * to the right where the hull will cover its lower half, breathing on the
 * wash's own slow clock so the two never fight. It does not drift: a light in
 * a corner is a place, and a place that travels is a cloud again.
 *
 * Baked once per size and tint and blitted, additive — `light-shafts.ts`'s
 * pattern — so it costs one `drawImage` a frame.
 */

/** Where its centre sits: a share of the width from the left, a share of the
 * sky's height from the top. Past the right edge and nearly on the hull, so
 * what shows is a quarter of a disc — a corner lit, not a moon. */
const AT = { x: 0.94, y: 0.97 } as const;
/** Its radius as a share of the width — large enough to be a glow rather
 * than a spot, small enough to leave the middle of the field to the shafts. */
const RADIUS = 0.5;
/** How loud, at the bottom and top of its breath — added to the sky the way
 * the shafts are, not laid over it, which is what makes it a light. NEBULA's
 * clouds were 0.8 and 0.95 over black; this is the *not so strong*. */
const ALPHA: readonly [number, number] = [0.6, 0.8];
/** How far its heart is lifted toward the dust's grey. Further than NEBULA's
 * 0.3: over the shipped violet ground, rather than NEBULA's black, an act's
 * tint alone adds next to nothing. */
const HEART_LIFT = 0.55;

const cache = bakedCache<string, HTMLCanvasElement>();

/** A soft disc of one tint, baked once per quantised size and tint. */
function sprite(size: number, tint: string): HTMLCanvasElement {
  const px = Math.max(8, Math.round(size / 8) * 8);
  const key = `${px},${tint}`;
  const cached = cache.get(key);
  if (cached) return cached;
  const c = document.createElement("canvas");
  c.width = px;
  c.height = px;
  const g = c.getContext("2d");
  if (g) {
    const r = px / 2;
    const grad = g.createRadialGradient(r, r, 0, r, r, r);
    grad.addColorStop(0, mixHex(tint, PALETTE.sparkDim, HEART_LIFT));
    grad.addColorStop(0.3, tint);
    grad.addColorStop(0.62, `${tint}66`);
    grad.addColorStop(1, `${tint}00`);
    g.fillStyle = grad;
    g.fillRect(0, 0, px, px);
  }
  cache.set(key, c);
  return c;
}

export function drawCornerLight(d: BackdropDraw): void {
  const { ctx, l, wave, time } = d;
  const height = l.bandTop;
  if (height <= 0 || l.width <= 0) return;
  const size = l.width * RADIUS * 2;
  const img = sprite(size, tintFor(wave));
  // The wash's clock and phase (`backdrop.ts`), so the corner brightens as
  // the sky does and never against it.
  const breathe = 0.5 + 0.5 * Math.sin(time * 0.11 + wave * 1.7);
  const prev = ctx.globalCompositeOperation;
  ctx.globalCompositeOperation = "lighter";
  ctx.globalAlpha = ALPHA[0] + (ALPHA[1] - ALPHA[0]) * breathe;
  ctx.drawImage(img, l.width * AT.x - size / 2, height * AT.y - size / 2, size, size);
  ctx.globalCompositeOperation = prev;
  ctx.globalAlpha = 1;
}
