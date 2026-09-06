import { fenceLineY, GAUGE } from "./fence-wire.js";
import { strokeGlow } from "./glow.js";
import { signedHash } from "./hash.js";
import type { SurfaceY } from "./hull-frame.js";
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
 * **A column the cannon cut is drawn as a break, not as a doorway.** Two
 * openings that look the same would be one picture for two different facts:
 * the wave *built* a way through here, and the pair *broke* one there. So an
 * authored gap keeps its posts and a burnt one gets torn ends — the two wires
 * stopping in stubs that curl back out of the opening, a scorch across the
 * tile and a few loose pieces still hanging in it. The owner asked for the
 * cut to read as destruction, and this is the half of it that stays; the
 * pieces thrown at the moment of the shot are `fence-shards.ts`.
 *
 * Its own file rather than the foot of `fence.ts` because the two answer
 * different questions: that one is the fence, and this is the half of it that
 * may be split. A reader asking *what is player 2 not being shown* opens one
 * short file and has the whole answer — and `fence-sweep.ts` beside it is what
 * that seat is given instead.
 */

/** How far the posts stand off the fence's own line, as a share of a tile —
 * the wire gauge in `fence-wire.ts` plus a little, so the opening is visibly
 * taller than the barrier it interrupts rather than flush with it. */
const LIP = 0.26;

/** How far the torn ends of a cut reach back into the wall it was made in, as
 * a share of a tile, and how far they curl off the line. A cut wire springs
 * away from itself: what says *this was broken* is that the two ends no longer
 * point at each other. */
const TEAR = 0.3;
const CURL = 0.34;

/** Loose pieces left hanging in a cut column, and how far they wander. */
const RAGS = 3;
const RAG_SPREAD = 0.3;

/** Turns a second the torn ends fizz at. The wire's own crackle is faster; a
 * broken end is a thing settling rather than a thing running. */
const FIZZ_HZ = 6;

/**
 * One way through a fence, at the left edge of column `col`. The row rather
 * than a screen y, because the wall is draped over the ship on its last beat
 * and an opening has to be cut out of the line where the line actually is.
 *
 * `burnt` picks which of the two openings this is — a cut, or something the
 * wave built. `fenceIsBurnt` is the one place that is decided and it lives in
 * the simulation, so this file is only ever told.
 */
export function drawFenceGate(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  col: number,
  row: number,
  time: number,
  surfaceY?: SurfaceY,
  burnt = false,
): void {
  if (burnt) {
    drawFenceBreak(ctx, l, col, row, time, surfaceY);
    return;
  }
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
    const y = fenceLineY(l, row, x, surfaceY);
    path.moveTo(x, y - lip);
    path.lineTo(x, y + lip);
  }
  ctx.stroke(path);
  ctx.restore();
}

/**
 * The other opening: a column the cannon cut. Torn ends curling out of the
 * wall on both sides, a scorch across what is left of the tile, and a rag or
 * two of wire still hanging in it.
 */
function drawFenceBreak(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  col: number,
  row: number,
  time: number,
  surfaceY?: SurfaceY,
): void {
  const left = tileCX(l, col) - l.tile / 2;
  const right = left + l.tile;
  const gauge = l.tile * GAUGE;
  const strike = Math.floor(time * FIZZ_HZ);

  ctx.save();
  // The scorch: what is left of the rail across the cut, dark and dying away
  // towards the middle where the wire is simply gone.
  ctx.globalAlpha = 0.5;
  ctx.fillStyle = "#150632";
  ctx.fillRect(left, fenceLineY(l, row, left, surfaceY) - gauge / 2, l.tile, gauge);
  ctx.globalAlpha = 1;

  // The two torn ends, one per side and one per wire: the line reaching a
  // little way back into the opening and then bending off it, so the four ends
  // no longer point at each other.
  for (const [side, x0] of [
    [-1, left],
    [1, right],
  ] as const) {
    for (const wire of [-1, 1]) {
      const y0 = fenceLineY(l, row, x0, surfaceY) + (wire * gauge) / 2;
      const reach = l.tile * TEAR * (0.6 + 0.4 * Math.abs(signedHash(col, wire * side, strike)));
      const curl = l.tile * CURL * signedHash(col + 3, wire * side, strike);
      const path = new Path2D();
      path.moveTo(x0 - side * reach, y0 + (wire * gauge) / 6);
      path.lineTo(x0 - side * reach * 0.35, y0);
      path.lineTo(x0 + side * reach * 0.55, y0 + curl);
      strokeGlow(ctx, path, PALETTE.arc, Math.max(2, l.tile * 0.055), 1.6);
      ctx.strokeStyle = PALETTE.arcRim;
      ctx.lineWidth = Math.max(STROKE.inner, l.tile * 0.025);
      ctx.stroke(path);
    }
  }

  // And the rags: short pieces of wire that neither end kept, hanging in the
  // opening and swinging on their own slow clock.
  ctx.globalAlpha = 0.55;
  for (let i = 0; i < RAGS; i++) {
    const x = left + l.tile * (0.3 + 0.4 * ((signedHash(col, i, 0) + 1) / 2));
    const y = fenceLineY(l, row, x, surfaceY) + signedHash(col, i + 5, 0) * gauge * 0.4;
    const swing = Math.sin(time * 2.2 + i * 1.7 + col) * l.tile * RAG_SPREAD * 0.3;
    const len = l.tile * 0.12;
    const path = new Path2D();
    path.moveTo(x - len, y - swing);
    path.lineTo(x + len, y + swing);
    strokeGlow(ctx, path, PALETTE.arc, Math.max(1.4, l.tile * 0.035), 1);
  }
  ctx.restore();
}
