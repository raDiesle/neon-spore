import type { Beats, OwnMotion, Pose } from "./own-motion.js";

/**
 * Which way a body is long, and what a motion written along it does about it.
 *
 * Split from `own-motion.ts` rather than added to it: that file is the poses
 * themselves and was already within a dozen lines of the ceiling. This is the
 * other question — not *what does a body do*, but *which way round is the body
 * it does it to* — and three separate callers were answering it privately
 * before it was written down here.
 *
 * **Why this is data and not a subject handed to `poseAt`.** `poseAt(t: Beats)`
 * being a pure function of one clock is the whole reason `MOTIONS` reads as a
 * table: a draft can be sampled blind, a card can be fitted before anything
 * knows which body will wear it, and seventeen of the eighteen spare motions
 * never have to mention a carrier at all. A `poseAt(t, subject)` would take
 * that from all of them to give it to one. So the motion declares its axis as
 * a *fact about how it was written* — `axis: "long"` — and the drawing site,
 * which already knows the body, does the turning. The cost is that a caller
 * can forget: `poseAt` still exists and still answers, and on a tall body it
 * answers the wrong way round. `own-motion.test.ts` covers the game's four,
 * which is the set where forgetting would ship.
 */

/**
 * Which way a body is longer, or `null` for one round enough that it has no
 * long axis and any direction is as good as another.
 */
export type LongAxis = "x" | "y" | null;

/**
 * How much longer than wide a body has to be before it is treated as having a
 * long axis at all.
 *
 * Not 1.0. BULB is 123 × 118 and RUNT is 41 × 42 — a body round to within a
 * few percent has no long direction, and a bare `w > h` hands it one on a 4%
 * margin. A quarter again as long is a claim; 4% is noise. Measured over the
 * sixty catalogue entries this splits them 24 wide, 28 round, 8 tall, and the
 * eight are the ones a swell written along x runs across.
 */
export const LONG_AXIS_RATIO = 1.25;

/** Which way a body of this extent is long. Call it; do not retype the ratio. */
export function longAxis(w: number, h: number): LongAxis {
  if (w > h * LONG_AXIS_RATIO) return "x";
  if (h > w * LONG_AXIS_RATIO) return "y";
  return null;
}

/**
 * The pose to draw a body in, once which way that body is long is known.
 *
 * For everything with the default `"screen"` axis this is `motion.poseAt(t)`
 * and nothing else, which is why it is safe to call everywhere. For a motion
 * written along the body, on a body whose long axis is vertical, it is that
 * pose turned a quarter turn — the whole gesture rotated, not `dx` and `dy`
 * swapped: a swap is a reflection, and it would quietly mirror any motion that
 * had a handedness to lose. Conjugating an affine pose by a quarter turn gives
 * `(dx, dy) → (−dy, dx)`, exchanges the two scales, and leaves the rotation
 * alone, so a gesture that travelled tail to head still does.
 *
 * A round body is left as written. By `LONG_AXIS_RATIO`'s own reasoning it has
 * no long axis, so there is nothing to turn towards.
 */
export function poseOn(motion: OwnMotion, t: Beats, long: LongAxis): Pose {
  const p = motion.poseAt(t);
  if (motion.axis !== "long" || long !== "y") return p;
  return { dx: -p.dy, dy: p.dx, rot: p.rot, sx: p.sy, sy: p.sx };
}
