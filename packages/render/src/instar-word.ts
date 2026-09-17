import type { Layout } from "./layout.js";
import { PALETTE, STROKE } from "./palette.js";

/**
 * **The word beside a mark, in a scanner box** — one or two words naming the
 * gesture the ring wants, bracketed at the four corners the way a scanner
 * frames what it has found, so it reads as *the body's* label on the part
 * rather than a caption the game wrote. Beside and not over, outside the
 * window ring, on the side away from the field's middle so it never sits
 * on the mouth or the other mark. Bright on the seat the mark wants, dim
 * on the other, where the word is the owner's name.
 *
 * It says nothing the ring and its glyph do not already show; it is there
 * for the first second of a step, when the pair has not yet read the glyph
 * and the window is already closing. The briefing for the wave says less
 * for the same reason: what the marks say during the wave is not said
 * before it (`content/src/waves/act-7e.ts`).
 *
 * Its own file because `instar-marks.ts` was at its limit with the rings.
 */

/** The word's size, in tiles — THE WARDEN's loud hint (`handle-draw.ts`). */
const FONT_TILES = 0.3;

export function drawInstarWord(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  word: string,
  x: number,
  y: number,
  side: -1 | 1,
  mine: boolean,
): void {
  ctx.save();
  ctx.font = `600 ${Math.round(l.tile * FONT_TILES)}px system-ui, sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const w = ctx.measureText(word).width;
  const h = l.tile * FONT_TILES;
  const pad = h * 0.45;
  // Kept on the glass, the way a handle's hint is; `x` is the box's near edge.
  const cx = Math.min(Math.max(x + side * (w / 2 + pad), w / 2 + pad), l.width - w / 2 - pad);
  const left = cx - w / 2 - pad;
  const right = cx + w / 2 + pad;
  const top = y - h / 2 - pad * 0.6;
  const bottom = y + h / 2 + pad * 0.6;
  const tick = h * 0.5;
  // A dark backing, so the word reads over the body's plates.
  ctx.fillStyle = PALETTE.background;
  ctx.globalAlpha = 0.55;
  ctx.fillRect(left, top, right - left, bottom - top);
  ctx.strokeStyle = mine ? PALETTE.redRim : PALETTE.dim;
  ctx.lineWidth = STROKE.inner;
  ctx.globalAlpha = mine ? 0.9 : 0.45;
  ctx.beginPath();
  for (const [sx, sy] of [
    [left, top],
    [right, top],
    [right, bottom],
    [left, bottom],
  ] as const) {
    const dx = sx === left ? tick : -tick;
    const dy = sy === top ? tick : -tick;
    ctx.moveTo(sx + dx, sy);
    ctx.lineTo(sx, sy);
    ctx.lineTo(sx, sy + dy);
  }
  ctx.stroke();
  ctx.fillStyle = mine ? PALETTE.text : PALETTE.dim;
  ctx.fillText(word, cx, y);
  ctx.restore();
}
