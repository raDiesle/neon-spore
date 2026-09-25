import { FLIP_TRUTH_TILES, tilesAboveHull } from "./field-flip.js";
import { signedHash, sinHash } from "./hash.js";
import type { Layout } from "./layout.js";
import { PALETTE } from "./palette.js";

/**
 * **THE FLIP's projection breaking up, two tiles above the ship.**
 *
 * The owner asked for this on 25 September 2026. On the turned screen, a body
 * is falling in a column it is not in. Near the hull, the picture of it should
 * glitch out like an interrupted projection, and the real body should then
 * appear in its true column and fall the last rows onto the ship.
 *
 * Where the body is shown is `bodyCol`'s job (`field-flip.ts`), and it is
 * a switch: mirrored above `FLIP_TRUTH_TILES`, true below. This file draws the
 * change, in three strokes over `TEAR_TILES` either side of that line:
 *
 * - **the projection tearing**: the body is cut into horizontal bands that
 *   jump sideways and drop out, more of them the nearer it gets;
 * - **its afterimage**: past the switch, the last torn frame stays behind in
 *   the mirror column and fades;
 * - **the real body arriving**: in the true column, torn at first and joined
 *   up by the time it is `TEAR_TILES` further down.
 *
 * It is the tear `malfunction-look.ts` gives a broken strip, in the same
 * blue every fault wears, so it reads as part of the fault and not as damage
 * to the body.
 *
 * `time` and not the beat drives the flicker, for the reason `codex.ts`
 * gives. Where the tear starts and stops is set by the row, so both seats see
 * the switch on the same beat.
 */

/** How far, in tiles, the tear reaches on each side of the switch. */
const TEAR_TILES = 0.6;
/** How many strips a torn body is cut into. */
const BANDS = 6;
/** How often, per second, the torn strips jump. */
const FLICKER_HZ = 18;
/** Half the height the bands cover, in tiles — a body's own footprint and a little over. */
const REACH_TILES = 1.1;

/**
 * Draw one body the way this screen should show it. `paint` draws the whole
 * body at (`x`, `y`). Off the tear, that is the only thing that happens.
 */
export function drawProjected(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  id: number,
  row: number,
  x: number,
  y: number,
  time: number,
  paint: () => void,
): void {
  const d = l.flip ? tilesAboveHull(l, row) - FLIP_TRUTH_TILES : TEAR_TILES;
  if (d >= TEAR_TILES || d <= -TEAR_TILES) {
    paint();
    return;
  }
  const frame = Math.floor(time * FLICKER_HZ);
  if (d > 0) {
    // Still the projection, and failing: whole at the top of the window, in
    // pieces at the switch.
    const s = 1 - d / TEAR_TILES;
    tear(ctx, l, id, x, y, frame, s, 1 - 0.45 * s, 0, paint);
    return;
  }
  const t = -d / TEAR_TILES;
  // The mirror of this body's pixel about the grid's middle, which is where
  // the projection was a moment ago.
  const ghost = 2 * l.gridLeft + l.gridWidth - x;
  tear(ctx, l, id + 0.5, x, y, frame, 1, 0.55 * (1 - t), ghost - x, paint);
  tear(ctx, l, id, x, y, frame, 1 - t, 0.35 + 0.65 * t, 0, paint);
}

/**
 * The body at `dx` from where it stands, cut into `BANDS` strips that jump
 * sideways by up to half a tile and drop out at a rate of `s`. At `s` 0, it is
 * one whole body at `alpha`.
 */
function tear(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  id: number,
  x: number,
  y: number,
  frame: number,
  s: number,
  alpha: number,
  dx: number,
  paint: () => void,
): void {
  if (alpha <= 0.01) return;
  const base = ctx.globalAlpha;
  if (s <= 0.02) {
    ctx.save();
    ctx.globalAlpha = base * alpha;
    ctx.translate(dx, 0);
    paint();
    ctx.restore();
    return;
  }
  const reach = l.tile * REACH_TILES;
  const band = (reach * 2) / BANDS;
  // As wide as the field, so a wide body or a strip thrown sideways is never
  // cut off at the side.
  const left = x + dx - l.gridWidth;
  for (let i = 0; i < BANDS; i++) {
    if (sinHash(id, i, frame) < s * 0.45) continue;
    const top = y - reach + i * band;
    ctx.save();
    ctx.beginPath();
    // A hair short of the band, so the dark gap between strips reads as a
    // scanline.
    ctx.rect(left, top, l.gridWidth * 2, band * (1 - 0.18 * s));
    ctx.clip();
    ctx.globalAlpha = base * alpha * (0.65 + 0.35 * sinHash(id, i, frame + 3));
    ctx.translate(dx + signedHash(id + 0.25, i, frame) * s * l.tile * 0.5, 0);
    paint();
    ctx.restore();
  }
  // The fault's blue along two of the cuts, jumping with them.
  ctx.save();
  ctx.globalAlpha = base * alpha * s * 0.8;
  ctx.strokeStyle = PALETTE.arcRim;
  ctx.lineWidth = Math.max(1, l.tile * 0.03);
  ctx.beginPath();
  for (let k = 0; k < 2; k++) {
    const at = y - reach + Math.floor(sinHash(id, k, frame + 9) * BANDS) * band;
    const w = l.tile * (0.4 + 0.5 * sinHash(id, k, frame + 5));
    const from = x + dx + signedHash(id, k, frame + 7) * l.tile * 0.3 - w / 2;
    ctx.moveTo(from, at);
    ctx.lineTo(from + w, at);
  }
  ctx.stroke();
  ctx.restore();
}
