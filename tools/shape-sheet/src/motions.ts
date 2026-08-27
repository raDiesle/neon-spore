import type { OwnMotion } from "@neon-spore/content";

/**
 * The spare motions: ways a body can move that nothing in the game moves yet.
 *
 * `content/own-motion.ts` holds the two the game draws — the bulb's sway and
 * the slick's tilt. These are the other side of the same pair the shape
 * catalogue is built around: a motion nothing carries is not content, in
 * exactly the way a contour nothing carries is not content, and it becomes
 * content on the day something claims it.
 *
 * They are written to be *told apart at 26 px*, which is the only test that
 * matters. Two of these that differ by a frequency and nothing else are one
 * motion written twice, so each carries a different signature — a pause, a
 * lurch, a drift that never comes back to the same place, a rotation that goes
 * all the way round rather than rocking.
 *
 * Offsets are in tiles, and every one of them stays well inside a lane: spec
 * 5.8 does not soften for a draft.
 */

function pose(
  dx: number,
  dy: number,
  rot: number,
  sx = 1,
  sy = 1,
): ReturnType<OwnMotion["poseAt"]> {
  return { dx, dy, rot, sx, sy };
}

/** Barely there: a fast, tight shiver with no travel. Nervous, cheap, alive. */
export const SHIVER: OwnMotion = {
  name: "SHIVER",
  note: "fast, tight, going nowhere — nervous rather than moving",
  poseAt: (t) =>
    pose(Math.sin(t * 11.3) * 0.02, Math.cos(t * 9.7) * 0.02, Math.sin(t * 13.1) * 0.04),
};

/**
 * Held still, then a sudden flick and a slow settle. The pause is the whole
 * signature: a creature that is *waiting* reads differently from one that is
 * idling, and a countdown needs a body that visibly waits.
 */
export const TWITCH: OwnMotion = {
  name: "TWITCH",
  note: "long stillness, one flick, a slow settle — a body that waits",
  poseAt(t) {
    const period = 2.4;
    const p = (t % period) / period;
    // Nothing at all for two thirds of the cycle, then a decaying kick.
    const k = p < 0.66 ? 0 : Math.exp(-(p - 0.66) * 14) * Math.sin((p - 0.66) * 46);
    return pose(k * 0.14, 0, k * 0.5, 1 + k * 0.12, 1 - k * 0.08);
  },
};

/**
 * A slow, complete rotation. The one motion here that does not rock: rocking
 * has a rest pose and this has none, which is why a thing that turns reads as
 * machinery or as something with no up.
 */
export const TURN: OwnMotion = {
  name: "TURN",
  note: "all the way round, slowly — no rest pose, so no up",
  poseAt: (t) => pose(0, 0, t * 0.55),
};

/**
 * Two slow frequencies that do not divide into each other, so the body wanders
 * and never quite repeats. Reads as drifting rather than as being rocked.
 */
export const DRIFT: OwnMotion = {
  name: "DRIFT",
  note: "two frequencies that never line up — it wanders instead of rocking",
  poseAt: (t) =>
    pose(
      Math.sin(t * 0.61) * 0.12 + Math.sin(t * 0.23) * 0.06,
      Math.sin(t * 0.41) * 0.07,
      Math.sin(t * 0.29) * 0.1,
    ),
};

/**
 * A pendulum: rotation about a point above the body, which is what makes an
 * arm swing rather than a body spin. The offset is derived from the angle, so
 * the far end travels and the pivot does not.
 */
export const TOLL: OwnMotion = {
  name: "TOLL",
  note: "swung from a pivot above it — the far end travels, the top does not",
  poseAt(t) {
    const a = Math.sin(t * 0.8) * 0.42;
    return pose(Math.sin(a) * 0.2, (1 - Math.cos(a)) * 0.2, a);
  },
};

/**
 * Swelling and shrinking as a whole, without changing shape. The plainest
 * motion in the set on purpose: something whose *size* is the tell — a charge,
 * a countdown, a thing about to burst — should not also be waving about.
 */
export const SWELL: OwnMotion = {
  name: "SWELL",
  note: "size alone, shape untouched — for a body whose tell is how big it is",
  poseAt(t) {
    const s = 1 + Math.sin(t * 1.15) * 0.16;
    return pose(0, 0, 0, s, s);
  },
};

/**
 * Sideways travel with a hard stop at each end and a long glide between —
 * a body that goes somewhere and arrives, rather than one oscillating. The
 * eased ramp is what separates "it moved" from "it is moving".
 */
export const LURCH: OwnMotion = {
  name: "LURCH",
  note: "travels, arrives, waits, travels back — motion with a destination",
  poseAt(t) {
    const period = 3.2;
    const p = (t % period) / period;
    // A trapezoid in time: ramp, hold, ramp back, hold.
    const ramp = (x: number): number =>
      Math.min(1, Math.max(0, x)) ** 2 * (3 - 2 * Math.min(1, Math.max(0, x)));
    const go = ramp((p - 0.05) / 0.25) - ramp((p - 0.55) / 0.25);
    return pose((go - 0.5) * 0.3, 0, (go - 0.5) * 0.24);
  },
};

/**
 * Vertical, quick, asymmetric: up fast and down slow, the beat of something
 * fighting its own weight. The only motion here whose main axis is `dy`.
 */
export const HEAVE: OwnMotion = {
  name: "HEAVE",
  note: "up fast, down slow — a body working against its own weight",
  poseAt(t) {
    const p = (t % 1.6) / 1.6;
    const lift =
      p < 0.3 ? Math.sin((p / 0.3) * Math.PI * 0.5) : Math.cos(((p - 0.3) / 0.7) * Math.PI * 0.5);
    return pose(0, -lift * 0.13 + 0.06, 0, 1 + lift * 0.05, 1 - lift * 0.07);
  },
};

/**
 * A ripple that runs along the body rather than around it: scale on one axis
 * only, twice as fast as the rotation, with the tilt trailing. Close cousin of
 * the slick's motion, and deliberately so — this is what the slick's family
 * looks like when it is longer than it is wide.
 */
export const SLITHER: OwnMotion = {
  name: "SLITHER",
  note: "a wave running the length of it, tilt trailing behind",
  poseAt: (t) =>
    pose(
      Math.sin(t * 1.7) * 0.08,
      0,
      Math.sin(t * 1.7 - 0.9) * 0.3,
      1,
      1 + Math.sin(t * 3.4) * 0.12,
    ),
};

/** Everything the drafts may be animated with, in one list for the panel. */
export const MOTIONS: OwnMotion[] = [
  SHIVER,
  TWITCH,
  TURN,
  DRIFT,
  TOLL,
  SWELL,
  LURCH,
  HEAVE,
  SLITHER,
];
