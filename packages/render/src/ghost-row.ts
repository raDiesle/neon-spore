import type { World } from "@neon-spore/sim";
import { drawnRow } from "./depth.js";
import { showsGhostBody } from "./ghost.js";
import type { Layout } from "./layout.js";
import { tileCX, tileCY } from "./layout.js";
import { PALETTE } from "./palette.js";
import { drawTargetLock } from "./target-lock.js";

/**
 * What player 1 gets instead of the body: a box running the length of the row
 * it is in, and nothing whatever about the column.
 *
 * **The whole file is about what it must not say.** Every other half-picture
 * in this game hides one *fact* about a body that is otherwise on both screens
 * — which side a dart takes, what is inside a cloud, whether a slick is real.
 * This one hides the body, so anything drawn here that varies across the width
 * of the field *with the body* is the column, given away. That rules out a
 * gradient, a hot spot, a marker at either end that is nearer one side than
 * the other, and any kind of parallax.
 *
 * **It was a stripe, and the owner asked for a scan instead.** A band identical
 * at every x was the safest thing that could be drawn and it read as a grid
 * line with a fault in it — a piece of the lattice rather than a machine
 * reporting. What crosses the row now is the pilot's own scanner
 * (`target-lock.ts`), left to right, fast enough that the row is swept several
 * times a second.
 *
 * **A sweep is as column-blind as a stripe, and for the same reason.** Where
 * the box is comes off the wall clock and the row it is on and nothing else:
 * there is no expression in this file that takes a column, so there is nothing
 * a pilot could time the box against. It passes over the body four times a
 * second and says the same thing there as it says over an empty square.
 *
 * **The row still says the row and nothing says the count.** One box per
 * occupied row, not one per ghost: two ghosts on a row would otherwise be two
 * boxes running out of step, and a count is a fact about columns the navigator
 * is supposed to be telling them. Two ghosts on two rows are two boxes, which
 * is honest — what player 1 is being told is which rows are dangerous.
 *
 * **It is colourless.** The body carries red or cyan and player 2 can see it,
 * so the colour is never anything the pair has to say — and a coloured mark
 * would be one more thing on the pilot's screen that looks like it means
 * something to do. Off-white, the HUD's own, which is also what keeps it apart
 * from the violet box hunting for a wisp on this same screen
 * (`wisp-search.ts`): one instrument, two states, told apart by colour the way
 * an instrument panel tells them apart.
 */

/** Seconds the box takes to cross the whole grid. Quick — the row is swept
 * about three times a second, which is too fast to be read as a thing walking
 * and just slow enough to be read as a direction. */
const CROSS_SECONDS = 0.35;

/** The share of a crossing spent fading in at the left and out at the right. A
 * box that reappeared at full strength on the frame it left would read as two
 * boxes going round, and the thing being drawn is one going across. */
const RAMP = 0.14;

/** How bright the frame is, empty at the top of the field and full on the
 * ship's own row. Under a real lock's at both ends: this instrument has the
 * row and not the body. */
const ALPHA_FAR = 0.3;
const ALPHA_NEAR = 0.62;

export function drawGhostRows(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  world: World,
  beatPhase: number,
  time: number,
): void {
  // One entry per row, keyed by the tile the body is going to — see the file's
  // own note, a second box on a row would be a count.
  const rows = new Map<number, number>();
  for (const c of world.creatures) {
    if (c.kind !== "ghost") continue;
    // Once it is drawn on this screen the box has nothing left to say — and a
    // second mark under a body player 1 can now see would read as a second
    // thing on the row. `showsGhostBody` is the one gate, asked rather than
    // re-derived, so the box can never be up on a screen that has the body.
    if (showsGhostBody(l, world.cfg, c)) continue;
    if (!rows.has(c.row)) rows.set(c.row, drawnRow(c, beatPhase));
  }
  for (const [row, drawn] of rows) drawScan(ctx, l, tileCY(l, drawn), time, urgency(l, row), row);
}

/**
 * How close to the hull it is, 0 at the top of the field and 1 on the ship's
 * own row. The box brightens with it — which is *time*, and time was never the
 * secret: the pilot is being told how long they have, which is the half of
 * this creature they are meant to hold.
 */
function urgency(l: Layout, row: number): number {
  return Math.max(0, Math.min(1, row / Math.max(1, l.rows - 1)));
}

function drawScan(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  y: number,
  time: number,
  near: number,
  row: number,
): void {
  // Rows are offset against each other so that two of them never run as one
  // object — and by the row, which player 1 already has, rather than by
  // anything belonging to a body.
  const laps = time / CROSS_SECONDS + row * 0.41;
  const phase = laps - Math.floor(laps);
  // End to end over the *tiles*, from the middle of the first column to the
  // middle of the last, so every square in the row is passed over and the
  // frame still never hangs off the grid.
  const left = tileCX(l, 0);
  const x = left + phase * (tileCX(l, Math.max(0, l.cols - 1)) - left);
  const half = l.tile * 0.42;
  const ends = Math.min(1, Math.min(phase, 1 - phase) / RAMP);
  const alpha = (ALPHA_FAR + (ALPHA_NEAR - ALPHA_FAR) * near) * ends;
  drawTargetLock(ctx, x, y, half, half, PALETTE.text, time, alpha, row + 1);
}
