import { smoothstep } from "./ease.js";
import type { Layout } from "./layout.js";

/**
 * **How a rock leaves the ship it broke** — the press into its hole, the
 * waiting and the rolling, and the arithmetic of all three. Split out of `rock-impact.ts` when that file hit
 * its line ceiling, and this is the seam: everything here is a pure function
 * of *how long ago the rock landed*, with no canvas and no impact state
 * beyond the two numbers `Drifting` names. What is left next door is the
 * replayed fall and the drawing.
 */

/** What the drift needs to know about one landed rock. */
export interface Drifting {
  /** Seconds since the impact — `Impact.t`. */
  t: number;
  /** How long the replayed last step of the fall took. */
  fallLife: number;
  /** Whether it sank in (a miss) or bounced (a deflect, gone on arrival). */
  embed: boolean;
  /** Screen x at impact — the drift is computed fresh from it every frame,
   * never accumulated, so there is no running velocity to jump when the
   * acceleration curve changes phase. */
  x0: number;
  /** Which way off the field it rolls. */
  dir: -1 | 1;
}

/** How long a rock takes to drive itself half its radius into the skin, from
 * the frame it touches it. The hit is that frame — the hole, the sparks, the
 * crack and the hull's flash — so this is the rock following through, and it
 * is short: a slow press would be the rock resting on the ship again. */
const SINK_TIME = 0.08;
/** How long a missed rock is held in the hull, counted from the hit and the
 * press included, before it starts to roll off. It was 0.8 s, then 0.2 on 25
 * September 2026, and the same day the owner asked again for it to start
 * *just some moment after hitting*. */
const STICK_LIFE = 0.12;
/**
 * How long the rock takes to climb out of its own hole onto the skin. It is
 * sunk half its radius (`rock-impact.ts`) and rolls on the skin once out, so
 * this is the only vertical motion there is: a ball rolling does not hover or
 * bob.
 */
const RISE_TIME = 0.3;
/** Sideways speed the instant it lets go, in px/s: none. A ball tipping out
 * of a dent starts from rest and gathers. It was 110, which read as the rock
 * being slid sideways, then 12 with a 260 px/s² push, which the owner still
 * found too quick off the mark (25 September 2026: *the speed of rolling must
 * start much slower*). */
const DRIFT_SPEED = 0;
/** Sideways acceleration the instant it lets go, in px/s² — a sixth of what it
 * was, so a third of a second in it has gone a third as far. */
const DRIFT_ACCEL = 40;
/**
 * How fast the acceleration itself grows, in px/s³ — the "faster the more the
 * distance" half of the ask. With acceleration alone the rock gathers speed
 * at one rate and the far half of the roll looks like the near half; with
 * this it visibly runs away off the edge. The three together clear a rock
 * from mid-field on a phone about 1.2 s after it lets go (at 1 s it has gone
 * about 200 px); the slow start costs less than a fifth of a second of that.
 */
const DRIFT_JERK = 1100;

/** When the stuck hold ends and drift-off begins, in `im.t` — meaningless for
 * a non-embedding impact, which is gone the moment it lands. */
export function stickStart(im: Drifting): number {
  return im.fallLife + (im.embed ? STICK_LIFE : 0);
}

/** How far it has rolled from where it landed, in px — 0 until it lets go.
 * A pure function of elapsed time, not accumulated state. */
export function travelled(im: Drifting): number {
  const t = floatSeconds(im);
  return t * (DRIFT_SPEED + t * (DRIFT_ACCEL / 2 + (t * DRIFT_JERK) / 6));
}

/** Screen x right now. */
export function currentX(im: Drifting): number {
  return im.x0 + im.dir * travelled(im);
}

/** 0 the frame it touches the skin, 1 once it is half its radius into it —
 * fast out and settling, so the blow is in the first frames. */
export function sunkIn(im: Drifting): number {
  if (!im.embed) return 0;
  const u = Math.min(1, Math.max(0, im.t - im.fallLife) / SINK_TIME);
  return 1 - (1 - u) * (1 - u);
}

/** Seconds since it let go of the hull — 0 while it is still stuck. */
export function floatSeconds(im: Drifting): number {
  return Math.max(0, im.t - stickStart(im));
}

/** 0 the instant it lets go, 1 once it has climbed out of its hole onto the
 * skin. The height eases in against this, so there is no frame where it
 * visibly jumps. */
export function liftoffRise(im: Drifting): number {
  return smoothstep(floatSeconds(im) / RISE_TIME);
}

/** How far a rock has to roll past the field's edge before there is nothing
 * left of it to draw — the same margin on both sides. */
export function driftedOffscreen(l: Layout, x: number): boolean {
  const margin = l.gridWidth * 0.3;
  return x < l.gridLeft - margin || x > l.gridLeft + l.gridWidth + margin;
}
