import { smoothstep } from "./ease.js";
import type { Layout } from "./layout.js";

/**
 * **How a rock leaves the ship it broke** — the waiting and the rolling, and
 * the arithmetic of both. Split out of `rock-impact.ts` when that file hit
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

/** How long a missed rock sits sunk into the hull before it starts to drift
 * off. Long enough to read as *lodged* and not merely brushed, short enough
 * that the wreck of a wave is not still lying on the ship two waves later —
 * the owner asked for a rock that has done its damage to get out of the way,
 * and this is the half of that which is waiting rather than moving. */
const STICK_LIFE = 0.8;
/**
 * How long the *start* of the drift takes to reach its cruising height and
 * speed — the thing that used to jump instantly to a new height and speed
 * the moment it stopped being stuck. Everything about letting go eases
 * against this, so the liftoff is a beat, not the whole drift, which never
 * eases back down again — it simply keeps accelerating off the edge of the
 * field (`update`'s `offscreen`).
 */
const RISE_TIME = 0.3;
/** How fast it is already moving sideways the instant it lets go, in px/s.
 * Not zero: a rock accelerating up from a standstill spends its first half
 * second barely moving and barely turning, which reads as the hull letting
 * go reluctantly. With real speed it rolls out of its hole from frame one. */
const DRIFT_SPEED = 110;
/** Sideways acceleration once it lets go, in px/s² — on top of `DRIFT_SPEED`,
 * so it leaves at a believable pace and keeps gathering.
 *
 * The pair of numbers used to take a rock about three and a half seconds to
 * clear the field, on top of two seconds stuck: a wave's worth of misses sat
 * on the ship through the wave after it, and the field the two players are
 * reading columns off was covered in old damage. They now clear in under a
 * second and a half. Nothing else changes — the roll is still the travel over
 * the radius, so a faster rock simply turns faster. */
const DRIFT_ACCEL = 150;

/** When the stuck hold ends and drift-off begins, in `im.t` — meaningless for
 * a non-embedding impact, which is gone the moment it lands. */
export function stickStart(im: Drifting): number {
  return im.fallLife + (im.embed ? STICK_LIFE : 0);
}

/** How far it has rolled from where it landed, in px — 0 until it lets go.
 * A pure function of elapsed time, not accumulated state. */
export function travelled(im: Drifting): number {
  const floatT = Math.max(0, im.t - stickStart(im));
  return DRIFT_SPEED * floatT + 0.5 * DRIFT_ACCEL * floatT * floatT;
}

/** Screen x right now. */
export function currentX(im: Drifting): number {
  return im.x0 + im.dir * travelled(im);
}

/** Seconds since it let go of the hull — 0 while it is still stuck. */
export function floatSeconds(im: Drifting): number {
  return Math.max(0, im.t - stickStart(im));
}

/** 0 the instant it lets go, 1 once the liftoff has run its course. Height,
 * bob and everything else about leaving ease in against this, so there is no
 * frame where a value visibly jumps. */
export function liftoffRise(im: Drifting): number {
  return smoothstep(floatSeconds(im) / RISE_TIME);
}

/** How far a rock has to roll past the field's edge before there is nothing
 * left of it to draw — the same margin on both sides. */
export function driftedOffscreen(l: Layout, x: number): boolean {
  const margin = l.gridWidth * 0.3;
  return x < l.gridLeft - margin || x > l.gridLeft + l.gridWidth + margin;
}
