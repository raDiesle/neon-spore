/**
 * Own-motion: what a shape does while it is not going anywhere.
 *
 * The contour in `shapes.ts` breathes — that is the wobble, and it is a
 * property of the outline. This is the other half: the whole body swaying,
 * tilting, pumping, drifting. Two blobs with the same lobes read as different
 * creatures because one swings and the other shivers, and at 26 px that
 * difference is most of what a player has.
 *
 * It lives here, beside the silhouettes, for one reason: it used to be typed
 * out inside `render/creatures.ts`, where nothing outside the running game
 * could see it. A shape tool that wants to show a creature as it actually
 * moves would have had to re-type the sway, and a second copy of a motion is
 * exactly how the sheet ends up judging a sway the game does not have.
 *
 * Spec 5.8 is strict about what own-motion may touch: **nothing.** A creature
 * never leaves its column, so `dx` and `dy` are small and are measured in
 * tiles rather than pixels — a sway is a fraction of a lane at every screen
 * size, or it is a different sway on a tablet.
 *
 * **The clock is beats, not seconds, and that is a correctness rule.** These
 * poses used to be sampled at `view.time`, which `apps/game/src/main.ts` fills
 * from `performance.now()` — so two phones, which open the page at different
 * moments, drew the same creature at different points in its cycle. In a game
 * whose whole control scheme is two people describing shapes to each other
 * across a voice delay, the bodies were disagreeing about what they look like.
 * `world.beat + beatPhase` is lockstep state: both devices compute it from the
 * same tick counter, so both draw the same pose. The unit change is loud
 * rather than silent — `Beats` is branded, so a caller that still has seconds
 * fails to compile instead of animating at 1.6 times the wrong rate.
 */

declare const BEATS: unique symbol;

/**
 * A moment on the shared clock, counted in beats from the start of the wave.
 *
 * Branded on purpose. `poseAt` used to take seconds, and every one of its
 * fourteen-odd call sites in `tools/` would have gone on type-checking after
 * the meaning of the argument changed — which is the failure this file was
 * split out of `render/creatures.ts` to prevent, running backwards.
 */
export type Beats = number & { readonly [BEATS]: true };

/** A number that is already counted in beats. */
export function beats(n: number): Beats {
  return n as Beats;
}

/**
 * Seconds on the shape tools' own animation clock, in beats.
 *
 * The game never needs this: it has `world.beat` and hands it over directly.
 * A catalogue card has no world, and its contour wobble genuinely is measured
 * in seconds, so the conversion happens at the one boundary where a pose is
 * asked for — and the sheet then runs a sway at the tempo the field runs it.
 */
export function beatsFromSeconds(seconds: number, bpm: number): Beats {
  return beats((seconds * bpm) / 60);
}

/** Where a body sits this instant, relative to where the simulation put it. */
export interface Pose {
  /** Sideways offset, in tiles. Well under half a lane, always. */
  dx: number;
  /** Vertical offset, in tiles. */
  dy: number;
  /** Rotation, radians. */
  rot: number;
  /** Horizontal scale, 1 being the silhouette's own width. */
  sx: number;
  /** Vertical scale. */
  sy: number;
}

/**
 * Which axis a motion's pose is written along. `"screen"` — the default, and
 * what every motion in this file assumes — means `dx` is sideways and `sx` is
 * width whatever the body looks like. `"long"` means x runs *along the body*.
 * `long-axis.ts` holds the quarter turn that costs, and the argument for a
 * field rather than an argument to `poseAt`.
 */
export type MotionAxis = "screen" | "long";

/** A named motion: a pose as a pure function of beats. */
export interface OwnMotion {
  name: string;
  /** One line, the way a silhouette's note is one line. */
  note: string;
  /**
   * Which way the pose below is written. Absent means `"screen"`. A motion
   * that sets `"long"` **must** be drawn through `poseOn` — see
   * `long-axis.ts`, and `own-motion.test.ts`, which holds the game's own four
   * to `"screen"` because `render/creatures.ts` calls `poseAt` directly.
   */
  axis?: MotionAxis;
  poseAt(t: Beats): Pose;
}

/** A body doing nothing at all. The identity pose. */
export const REST: Pose = { dx: 0, dy: 0, rot: 0, sx: 1, sy: 1 };

/**
 * How far apart in the cycle two bodies are allowed to sit, in beats.
 *
 * Eight beats is two bars, and more than one whole sway for both bodies that
 * sway — so a field spread across it holds every phase of every motion at
 * once. The field is then *in time* without being *in step*, which is the
 * whole point: every creature moves one row on the same instant, and if their
 * idling agreed as well the wave would read as one object.
 */
const PHASE_SPREAD_BEATS = 8;

/**
 * A body's own place in the cycle, 0 to 1, from its id alone.
 *
 * This was `(c.id % 7) * 0.9` — seven phases on an eleven-column field, so a
 * row of neighbours moving in perfect step was routine rather than unlucky,
 * and the two ids most likely to sit side by side (n and n + 1) were the two
 * most likely to be exactly 0.9 apart every time. An integer avalanche hash
 * gives every id a different phase instead of one of seven, and it is still
 * pure arithmetic on a number both devices agree about.
 */
export function bodyPhase(id: number): number {
  let h = (id | 0) ^ 0x9e3779b9;
  h = Math.imul(h ^ (h >>> 16), 0x21f0aaad);
  h = Math.imul(h ^ (h >>> 15), 0x735a2d97);
  h ^= h >>> 15;
  return (h >>> 0) / 4294967296;
}

/**
 * The moment to pose body `id` at, given the field's shared beat.
 *
 * Call this rather than writing `beat + something(id)` at a draw site: the
 * offset is what keeps a wave from breathing as one object, and a second copy
 * of it is how one screen's field ends up in step while the other's is not.
 */
export function poseClock(id: number, beat: number): Beats {
  return beats(beat + bodyPhase(id) * PHASE_SPREAD_BEATS);
}

// `livingMotion` is not one of the motions but the pairing of a kind to one,
// and it now sits beside the contour pairing in `living-look.ts` — one row per
// kind answering both, so a body and its sway cannot be about two different
// creatures. Re-exported here for the same reason as the records above it:
// nothing that already reached for it through this file had to move.
export { livingMotion } from "./living-look.js";
// The motions themselves live next door — see `motions.ts` for the seam. Every
// one is re-exported here so that a reader who already says
// `livingMotion` from `own-motion.ts` still can.
export { FLICKER, HOLD, POISE, SWAY_PUMP, TILT_RIPPLE, TREMBLE } from "./motions.js";
