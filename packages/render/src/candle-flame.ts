import { rgba } from "./hex.js";
import { PALETTE } from "./palette.js";

/**
 * **What THE CANDLE's flame is made of**: a flame, the shape a candle's is —
 * a drop standing on its round end, drawn up to a tip that wanders, an ember
 * envelope round an amber body, the hot white low in it over the wick, and
 * the wick's own dark stub standing in the root. Before it, the flame was a
 * disc of cream in its halo, which read as a lamp or a star rather than as
 * fire (`new-boss-more` §6.3).
 *
 * Split off `candle-glow.ts`, which decides *where* the light is and how much
 * of it is left, so that file stays about the fight and this one about fire.
 *
 * **It is not a body**: nothing here is outlined, the halo round it is still
 * `candle-glow.ts`' and still the health bar, and the flame shrinks with the
 * glow the same way the halo does. The hot core is the plain `podRim` the
 * tests look for (`candle-frame.test.ts`), and nothing here is `emberRim`,
 * which the tests keep for the wick's ring and the ember after the flame.
 */

/** The flame's height and half-width in tiles, at nothing and at full glow. */
const TALL_OUT = 0.36;
const TALL_FULL = 0.7;
const WIDE_OUT = 0.09;
const WIDE_FULL = 0.16;
/** How far the tip wanders, in half-widths, and how fast — two rates that
 * never line up, so the flicker has no period the eye can find. */
const SWAY = 0.7;
const SWAY_HZ = [1.3, 2.9] as const;

/**
 * One flame, standing on (`x`, `y`) — the light's point, which sits a third
 * of the way up it, where a candle's is. `share` is how much glow is left.
 */
export function paintFlame(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  tile: number,
  share: number,
  time: number,
): void {
  const flick =
    0.6 * Math.sin(time * SWAY_HZ[0] * 2 * Math.PI) +
    0.4 * Math.sin(time * SWAY_HZ[1] * 2 * Math.PI + 1.7);
  const h = tile * (TALL_OUT + (TALL_FULL - TALL_OUT) * share) * (1 + 0.05 * flick);
  const w = tile * (WIDE_OUT + (WIDE_FULL - WIDE_OUT) * share);
  const s = flick * w * SWAY;
  const base = y + h * 0.3;
  const body = new Path2D();
  body.moveTo(x + s, base - h);
  body.bezierCurveTo(
    x + s * 0.5 + w * 0.3,
    base - h * 0.72,
    x + w * 1.05,
    base - h * 0.45,
    x + w,
    base - h * 0.2,
  );
  body.bezierCurveTo(
    x + w * 0.95,
    base + w * 0.6,
    x - w * 0.95,
    base + w * 0.6,
    x - w,
    base - h * 0.2,
  );
  body.bezierCurveTo(
    x - w * 1.05,
    base - h * 0.45,
    x + s * 0.5 - w * 0.3,
    base - h * 0.72,
    x + s,
    base - h,
  );
  body.closePath();

  ctx.save();
  // Amber through, reddening to ember up towards the tip and in at the edge —
  // it sits in its own amber halo, so the ember is what draws it out of the
  // light, from the inside.
  ctx.fillStyle = PALETTE.pod;
  ctx.fill(body);
  ctx.clip(body);
  const up = ctx.createLinearGradient(0, base - h, 0, base);
  up.addColorStop(0, rgba(PALETTE.ember, 0.95));
  up.addColorStop(0.5, rgba(PALETTE.ember, 0));
  ctx.fillStyle = up;
  ctx.fill(body);
  ctx.lineJoin = "round";
  ctx.lineWidth = tile * 0.07;
  ctx.strokeStyle = PALETTE.ember;
  ctx.globalAlpha = 0.55;
  ctx.stroke(body);
  ctx.globalAlpha = 1;
  // The hot white, low and narrow, over the wick.
  const cy = base - h * 0.24;
  ctx.fillStyle = PALETTE.podRim;
  ctx.beginPath();
  ctx.ellipse(x + s * 0.1, cy, w * 0.42, h * 0.2, 0, 0, Math.PI * 2);
  ctx.fill();
  // The root: the dark round the wick where nothing burns yet.
  ctx.fillStyle = rgba(PALETTE.podDark, 0.55);
  ctx.beginPath();
  ctx.ellipse(x, base + w * 0.05, w * 0.32, w * 0.42, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // The wick's stub standing in it, charred, its tip lit by the flame.
  ctx.save();
  ctx.lineCap = "round";
  ctx.lineWidth = Math.max(1, tile * 0.025);
  ctx.strokeStyle = PALETTE.rockDark;
  ctx.beginPath();
  ctx.moveTo(x, base + tile * 0.06);
  ctx.quadraticCurveTo(x + w * 0.1, base - h * 0.05, x + w * 0.2, base - h * 0.12);
  ctx.stroke();
  ctx.restore();
}
