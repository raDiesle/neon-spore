import { type Layout, tileCX } from "./layout.js";
import { PALETTE, STROKE } from "./palette.js";

/**
 * The way through a fence, on the screen that is shown it.
 *
 * **It is drawn as a doorway rather than as a highlight**, and the difference
 * is what the pilot has to do with it. A bright mark over the open column
 * would say *look here*; what the pilot actually has to do is read a number
 * off the bottom of the screen and say it out loud, so the mark is a pair of
 * posts standing where the wire would have crossed — a gap in a fence, with
 * the field's own lattice showing through it. The eye lands on the column
 * rather than on the thing sitting in it.
 *
 * The posts reach the full height the fence itself is drawn at, so the opening
 * is the same size as the thing it is a hole in: a gap drawn shorter than the
 * fence reads as a mark laid over an unbroken line rather than as a way past
 * it, which is the one thing the pilot must not have to work out.
 *
 * Its own file rather than the foot of `fence.ts` because the two answer
 * different questions: that one is the fence, and this is the half of it that
 * may be split. A reader asking *what is player 2 not being shown* opens one
 * short file and has the whole answer.
 */

/** How far the posts stand off the fence's own line, as a share of a tile —
 * the wire gauge in `fence.ts` plus a little, so the opening is visibly taller
 * than the barrier it interrupts rather than flush with it. */
const LIP = 0.26;

/** One gap in a fence, at the left edge of column `col`. */
export function drawFenceGate(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  col: number,
  y: number,
  time: number,
): void {
  const left = tileCX(l, col) - l.tile / 2;
  const right = left + l.tile;
  const lip = l.tile * LIP;
  // The posts, in the fence's own blue and dimmer than the wire: this is the
  // absence of the fence, so it must not out-shout the thing it is a hole in.
  // Breathing very slightly, so the opening reads as live rather than as
  // something painted onto the grid.
  const alpha = 0.5 + 0.12 * Math.sin(time * 3);
  ctx.save();
  ctx.strokeStyle = PALETTE.arc;
  ctx.globalAlpha = alpha;
  ctx.lineWidth = Math.max(STROKE.inner, l.tile * 0.035);
  const path = new Path2D();
  for (const x of [left, right]) {
    path.moveTo(x, y - lip);
    path.lineTo(x, y + lip);
  }
  ctx.stroke(path);
  ctx.restore();
}
