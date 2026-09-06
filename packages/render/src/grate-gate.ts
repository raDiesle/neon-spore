import { type Layout, tileCX } from "./layout.js";
import { PALETTE, STROKE } from "./palette.js";

/**
 * The way through a wall, on the one screen that is shown it.
 *
 * **It is drawn as a doorway rather than as a highlight**, and the difference
 * is what the pilot has to do with it. A bright mark over the open column
 * would say *look here*; what the pilot actually has to do is read a number
 * off the bottom of the screen and say it out loud, so the mark is a pair of
 * uprights standing on the grid line the wall would have crossed — a gap in a
 * fence, with the field's own lattice showing through it. The eye lands on the
 * column rather than on the thing sitting in it.
 *
 * Its own file rather than the foot of `grate.ts` because the two answer
 * different questions: that one is the wall, which both seats see, and this is
 * the half of it that is split. A reader asking *what is player 2 not being
 * shown* opens one short file and has the whole answer.
 */

/** How far the uprights stand off the wall's own line, as a share of a tile.
 * They frame the opening, so they reach both ways from it. */
const LIP = 0.22;

/** One gap in the wall, at the left edge of column `col`. */
export function drawGrateGate(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  col: number,
  y: number,
  time: number,
): void {
  const left = tileCX(l, col) - l.tile / 2;
  const right = left + l.tile;
  const lip = l.tile * LIP;
  // The uprights, in the wall's own blue and dimmer than the filament: this is
  // the absence of the wall, so it must not out-shout the thing it is a hole
  // in. Breathing very slightly, so the opening reads as live rather than as
  // something painted onto the grid.
  const alpha = 0.5 + 0.12 * Math.sin(time * 3);
  ctx.save();
  ctx.strokeStyle = PALETTE.arc;
  ctx.globalAlpha = alpha;
  ctx.lineWidth = STROKE.inner;
  const path = new Path2D();
  for (const x of [left, right]) {
    path.moveTo(x, y - lip);
    path.lineTo(x, y + lip);
  }
  ctx.stroke(path);
  ctx.restore();
}
