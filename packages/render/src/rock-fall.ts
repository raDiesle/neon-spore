import { smoothstep } from "./ease.js";
import type { Layout } from "./layout.js";

/**
 * **A rock touches the skin on the tick the hull breaks, and not before.**
 *
 * The owner, 25 September 2026, and not for the first time: *in the exact
 * moment the meteor hits the ship's skin top, the damage is taken immediately
 * and related animations must be done immediately.* The grid could not give
 * him that. The row above the ship is drawn within a few pixels of the skin —
 * between five pixels into it and eleven clear of it on a phone, by column —
 * so a rock falling one tile a beat was touching the ship at the end of the
 * beat *before* its landing beat, and the sim breaks the hull at the end of
 * the landing beat (`sim/hull.ts`). The pair watched a rock sit on the plating
 * for up to three quarters of a second and then the ship answer it.
 *
 * So the last `BEND_ROWS` of a rock's fall are bent: it is drawn a little
 * higher than its row, by an amount that grows from nothing to exactly what
 * puts it **on the skin, touching, at the end of its landing beat**. The bend
 * is a smoothstep, which is flat at both ends — the rock falls at the grid's
 * own speed when the bend starts and again at the instant it hits, and loses
 * about a fifth of it through the middle, where one row is not compared with
 * the next. It never hovers and it never brakes into the ship.
 *
 * A rock and nothing else. A living body has its own answer to the same
 * complaint, the gather and the strike (`landing.ts`); a rock rearing back
 * would be a rock with muscles. Where the rock is *after* it touches — pressed
 * into the hole it made, then rolling off — is `rock-impact.ts`, which starts
 * from this same function so the hand-over is not a jump.
 */

/** How many rows above the ship the bend starts. Fewer and the slowing reads
 * as the rock braking; more and it reaches rows the pair read the fall by. */
const BEND_ROWS = 6;

/**
 * Where a rock's centre is drawn at fractional row `p`: `flatY` — the grid's
 * own answer for that row — lifted by the bend. `contactY` is the centre
 * height at which the rock touches the skin under it (`skin - rockRadius`).
 * The ship's row is the layout's last (`hullRow`, which it was built from).
 */
export function rockFallY(l: Layout, p: number, flatY: number, contactY: number): number {
  const hull = l.rows - 1;
  const start = hull - BEND_ROWS;
  if (p <= start) return flatY;
  // Where the grid would have it at the end of its landing beat — the hull
  // row's centre, under the membrane — and how far short of that it touches.
  const lift = flatY + (hull - p) * l.tile - contactY;
  if (lift <= 0) return flatY;
  return flatY - lift * smoothstep((Math.min(p, hull) - start) / BEND_ROWS);
}
