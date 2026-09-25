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

/** How long a missed rock sits sunk into the hull before it starts to roll
 * off. Long enough for the hit to register as a hit — the hole and the sparks
 * are seen with the rock in them — and no longer. It was 0.8 s until 25
 * September 2026, when the owner asked for the rock to start moving away much
 * sooner: at 0.8 it read as the rock resting on the ship. */
const STICK_LIFE = 0.2;
/**
 * How long the rock takes to climb out of its own hole onto the skin. It is
 * sunk half its radius (`rock-impact.ts`) and rolls on the skin once out, so
 * this is the only vertical motion there is: a ball rolling does not hover or
 * bob.
 */
const RISE_TIME = 0.3;
/** Sideways speed the instant it lets go, in px/s. Small on purpose: a ball
 * tipping out of a dent starts slowly and gathers, and the owner asked for
 * exactly that — slow at first, faster the further it has gone. It was 110,
 * which read as the rock being slid sideways at a constant pace. */
const DRIFT_SPEED = 12;
/** Sideways acceleration the instant it lets go, in px/s². */
const DRIFT_ACCEL = 260;
/**
 * How fast the acceleration itself grows, in px/s³ — the "faster the more the
 * distance" half of the ask. With acceleration alone the rock gathers speed
 * at one rate and the far half of the roll looks like the near half; with
 * this it visibly runs away off the edge. The three together clear a rock
 * from mid-field in about a second after it lets go (at 1 s it has gone
 * about 310 px), where the old pair took nearly one and a half.
 */
const DRIFT_JERK = 1000;

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
