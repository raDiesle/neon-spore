import { colNumber } from "./coord-grid.js";
import type { Layout } from "./layout.js";
import { PALETTE } from "./palette.js";
import {
  wellAngle,
  wellAt,
  wellCenter,
  wellHub,
  wellNumberRing,
  wellRadius,
  wellRim,
  wellSectorAngle,
} from "./well.js";
import { drawWellFlesh } from "./well-flesh.js";

/**
 * THE WELL's clock face: the bowl, the lanes, the rings and the seam — the
 * empty board, in the round.
 *
 * It is the flat field's own furniture bent into a circle and nothing more. The
 * rim is row nought, the rings are the rows, the spokes are the lines between
 * columns, and the numbers outside the rim are the numbers the pair has always
 * said (`colNumber`). Everything here is drawn in `PALETTE.grid` and
 * `PALETTE.dim` at the flat grid's own weights, because a face that competed
 * with the bodies standing on it would be the mistake the lattice already made
 * once (`coord-grid.ts`).
 *
 * **What is loud is the seam**, and it is the only thing here that is. The
 * sector straight above the ship holds no column: it is where the field's two
 * walls meet, and the lanes either side of it are ten columns apart. A pair
 * that cannot see it reads the picture as a circle a cannon can walk round, so
 * the two walls are drawn as walls — bright, closed, with the dead sector
 * between them left as backdrop rather than bowl.
 *
 * **Under the furniture is flesh** since 23 September 2026: the bowl deepens
 * toward the hub, the rim has a lip, the spokes lie in grooves and the ship
 * sits in a socket (`well-flesh.ts`). All of it is under the lines here, so
 * the board is still what an eye counts.
 */

/** The share of a sector the seam's walls stand at, either side of twelve. */
const SEAM = 0.5;
/**
 * How far apart two rings have to be before the second one is worth drawing,
 * in pixels. Out near the rim the rows crowd to a few pixels of each other
 * (`BEND` in `well.ts`), and every ring drawn there is one more bright circle
 * in the busiest part of the picture — so the face carries the rows a pair can
 * actually count and stops.
 */
const RING_GAP = 11;

/** The whole face, bottom to top: the bowl and its flesh, the rings, the spokes, the seam,
 * the numbers. `flash` is the beat, the same number every other beat-lit thing
 * in the frame reads; `time` breathes the lip. */
export function drawWellFace(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  flash: number,
  time: number,
): void {
  if (l.tile <= 0) return;
  ctx.save();
  drawWellFlesh(ctx, l, time);
  drawRings(ctx, l, flash);
  drawSpokes(ctx, l);
  drawSeam(ctx, l);
  drawNumbers(ctx, l);
  ctx.restore();
}

/**
 * The rings, one per row the pair can still tell apart, and the rim brightest
 * of them — an arrival crosses it, so it is the one circle on the face that is
 * an event rather than a measurement.
 */
function drawRings(ctx: CanvasRenderingContext2D, l: Layout, flash: number): void {
  const c = wellCenter(l);
  ctx.strokeStyle = PALETTE.grid;
  ctx.lineWidth = 1;
  ctx.globalAlpha = 0.5 + 0.12 * flash;
  let last = wellRadius(l, 0) + RING_GAP;
  // Every row there is. `wellRadius` holds anything past the hull at the hub,
  // and the gap test below drops the ones that would land on a ring already
  // drawn — so the loop needs no second copy of which row the hull is on.
  for (let row = 0; row < l.rows; row++) {
    const r = wellRadius(l, row);
    if (last - r < RING_GAP) continue;
    last = r;
    ctx.beginPath();
    ctx.arc(c.x, c.y, r, 0, Math.PI * 2);
    ctx.stroke();
  }
  // The rim, over whichever rings came near it.
  ctx.strokeStyle = PALETTE.gridBeat;
  ctx.globalAlpha = 0.55 + 0.3 * flash;
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.arc(c.x, c.y, wellRim(l), 0, Math.PI * 2);
  ctx.stroke();
  ctx.globalAlpha = 1;
}

/**
 * The line between two columns, from the hub to the rim — the flat field's
 * vertical grid lines, stood on end.
 *
 * **Brighter than the rings, which is the other way round from the flat
 * field.** There a lane is found by counting across a lattice whose two axes
 * are worth the same; here the lane *is* the name — a pair says an hour, never
 * a ring — so the radial line is the one an eye has to be able to follow from
 * the rim to the ship, and the rings are the thing behind it.
 */
function drawSpokes(ctx: CanvasRenderingContext2D, l: Layout): void {
  const hub = wellHub(l);
  const rim = wellRim(l);
  const half = wellSectorAngle(l) / 2;
  ctx.strokeStyle = PALETTE.gridBeat;
  ctx.lineWidth = 1;
  ctx.globalAlpha = 0.7;
  ctx.beginPath();
  for (let col = 0; col < l.cols; col++) {
    for (const side of [-1, 1]) {
      const a = wellAngle(l, col) + side * half;
      const from = wellAt(l, a, hub);
      const to = wellAt(l, a, rim);
      ctx.moveTo(from.x, from.y);
      ctx.lineTo(to.x, to.y);
    }
  }
  ctx.stroke();
  ctx.globalAlpha = 1;
}

/**
 * The seam: the field's two walls, standing a sector apart above the ship.
 *
 * They are the left wall and the right wall of the same field, which is the
 * whole of what this boss has to say — so they are drawn the way the flat
 * field's walls would be if it had any, as the brightest line on the face,
 * closed across the top by the rim they both end on. What is between them is
 * left as backdrop: no bowl, no ring, no number, nothing a body could stand in.
 *
 * **Where they stand is asked, not assumed.** Twelve is only where the seam
 * begins: it slips clockwise while this boss's face rolls, and the one sector
 * with no column is the one *before* column 0, so the middle of it is
 * `wellAngle(l, -1)` — nought on a face standing square, and the rolled angle
 * once it is not (`well-roll.ts`). A hardcoded twelve here would have left the
 * brightest line on the picture standing still while everything it separates
 * walked away from it.
 */
function drawSeam(ctx: CanvasRenderingContext2D, l: Layout): void {
  const hub = wellHub(l);
  const rim = wellRim(l);
  const mid = wellAngle(l, -1);
  const half = wellSectorAngle(l) * SEAM;
  ctx.strokeStyle = PALETTE.dim;
  ctx.lineWidth = 2;
  ctx.globalAlpha = 0.85;
  ctx.beginPath();
  for (const side of [-1, 1]) {
    const from = wellAt(l, mid + side * half, hub);
    const to = wellAt(l, mid + side * half, rim);
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(to.x, to.y);
  }
  ctx.stroke();
  ctx.globalAlpha = 1;
}

/**
 * The numbers, outside the rim, upright.
 *
 * **Upright and not turned with the lane.** A numeral rotated onto its own
 * spoke is a dial to be read round rather than a place to be named, and the
 * pair is saying these out loud under a voice delay — the only thing that
 * matters is that the right digit is found at a glance from wherever the phone
 * is being held.
 *
 * They are the columns' own numbers (`colNumber`), so on the field the game
 * ships they land exactly where a clock's hours are and the pair may say
 * either word. `drawAxes` next door is the same type at the same weight, for
 * the same reason: it is a label, read once, and never the thing being watched.
 */
function drawNumbers(ctx: CanvasRenderingContext2D, l: Layout): void {
  const size = Math.max(8, Math.min(13, l.tile * 0.34));
  ctx.font = `${Math.round(size)}px "Courier New",monospace`;
  ctx.fillStyle = PALETTE.dim;
  ctx.globalAlpha = 0.7;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const ring = wellNumberRing(l);
  for (let col = 0; col < l.cols; col++) {
    const at = wellAt(l, wellAngle(l, col), ring);
    ctx.fillText(colNumber(col), at.x, at.y);
  }
  ctx.textAlign = "start";
  ctx.textBaseline = "alphabetic";
  ctx.globalAlpha = 1;
}
