import { fenceLineY, GAUGE } from "./fence-wire.js";
import { halo } from "./glow.js";
import type { SurfaceY } from "./hull-frame.js";
import type { Layout } from "./layout.js";
import { PALETTE } from "./palette.js";

/**
 * **What the navigator gets instead of the doorways.**
 *
 * The pilot is shown where the wall is open and the navigator — the one seat
 * that can move the dome — is shown an unbroken wire (`fence.ts`). That is the
 * creature, and it left the navigator's screen with nothing on it: a line
 * coming down, no mark anywhere, and no reason written into the picture to
 * open their mouth about it. The owner asked for one, and asked for it in
 * exactly the shape that cannot break the split — *an animation from left to
 * right, to indicate that somewhere across the fence there is some hidden
 * unclear open gap, but you do not see it*.
 *
 * So a reading head runs the width of the field, over and over: a soft blaze
 * on the wire with a trail behind it and a caliper tick above and below, going
 * one way only. It says the wall is being searched and the search is not
 * finding anything on this screen.
 *
 * **Every term in it is the clock and the field, and none of them is the
 * creature.** It does not know where a gap is, whether there is one, or how
 * many — it is the same sweep over a solid wall and over one open in four
 * places, on the first beat and on the last. That is the property this file
 * exists to keep, and it is `fence-wire.ts`'s rule about the wobble stated
 * again about something far more tempting to make informative: a sweep that
 * hesitated, brightened or slowed anywhere would be the answer, given away to
 * the one seat that must not have it.
 *
 * It is drawn on the navigator's screen alone. The pilot has the doorways and
 * a second thing crossing them would only make them harder to count.
 */

/** Seconds for one crossing. Slow enough to read as a search rather than a
 * flicker, and quick enough that a wall crossing the field in six beats is
 * swept two or three times on the way down. */
const CROSS_S = 2.4;

/** How far past each edge the head starts and ends, in tiles, so it enters and
 * leaves rather than appearing in the field. */
const OVERRUN = 0.8;

/** How far the trail reaches back from the head, in tiles. */
const TRAIL = 2.2;
/** Samples along the trail. Enough for a smooth falloff at a tile's width. */
const STEPS = 14;

/** How far above and below the wire the caliper ticks stand, as a share of a
 * tile, and how long they are. */
const TICK_GAP = 0.34;
const TICK_LEN = 0.2;

/**
 * One sweep, on the fence's own line. `row` is the drawn row, so the head
 * follows the wall down and rides the drape over the ship on the last beat.
 */
export function drawFenceSweep(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  row: number,
  time: number,
  surfaceY?: SurfaceY,
): void {
  // Out of the way once the wall is on the ship: the arcs between the wire and
  // the dome are the whole of what either seat should be looking at by then,
  // and there is nothing left to search for (`fence-arc.ts`).
  const fade = Math.max(0, Math.min(1, (l.rows - 1.2 - row) / 1.4));
  if (fade <= 0) return;

  const span = l.gridWidth + 2 * OVERRUN * l.tile;
  const start = l.gridLeft - OVERRUN * l.tile;
  const phase = (((time / CROSS_S) % 1) + 1) % 1;
  const headX = start + span * phase;

  ctx.save();
  // The trail first and under the head: a run of the wire left glowing behind
  // whatever went along it, falling away over a couple of tiles.
  ctx.lineCap = "round";
  for (let i = 0; i < STEPS; i++) {
    const xA = headX - (i / STEPS) * TRAIL * l.tile;
    const xB = headX - ((i + 1) / STEPS) * TRAIL * l.tile;
    if (xB < start) break;
    const drop = 1 - i / STEPS;
    ctx.globalAlpha = 0.3 * drop * drop * fade;
    ctx.strokeStyle = PALETTE.arcRim;
    ctx.lineWidth = Math.max(1, l.tile * GAUGE * 0.5 * drop);
    ctx.beginPath();
    ctx.moveTo(xA, fenceLineY(l, row, xA, surfaceY));
    ctx.lineTo(xB, fenceLineY(l, row, xB, surfaceY));
    ctx.stroke();
  }
  ctx.globalAlpha = 1;

  const y = fenceLineY(l, row, headX, surfaceY);
  // The head. Two haloes rather than one, the smaller one white-hot inside the
  // wider blue, so it reads as a charge sitting on the wire rather than as a
  // lamp shining on it.
  halo(ctx, headX, y, l.tile * 0.9, PALETTE.arc, 0.45 * fade);
  halo(ctx, headX, y, l.tile * 0.34, PALETTE.arcRim, 0.7 * fade);

  // And the two ticks, clear of the wire above and below: a caliper reading
  // across, which is the one shape here that says *searching* rather than
  // *found*.
  ctx.globalAlpha = 0.75 * fade;
  ctx.strokeStyle = PALETTE.arcRim;
  ctx.lineWidth = Math.max(1, l.tile * 0.035);
  const tick = new Path2D();
  for (const side of [-1, 1]) {
    const from = y + side * l.tile * TICK_GAP;
    tick.moveTo(headX, from);
    tick.lineTo(headX, from + side * l.tile * TICK_LEN);
  }
  ctx.stroke(tick);
  ctx.restore();
}
