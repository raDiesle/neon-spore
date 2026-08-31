import type { CreatureKind } from "@neon-spore/sim";
import type { Beats, OwnMotion } from "./own-motion.js";

/**
 * The motions themselves: one record per body that has one, and the pairing of
 * a kind to its own.
 *
 * Split out of `own-motion.ts` the day THE DART pushed that file past its
 * 250-line limit, along the seam that file's own doc already described. What
 * stayed there is the *machinery* — what a pose is, what a beat is, where a
 * body sits in the cycle — and it is a fixed set of ideas that has not changed
 * since it was written. This is the half that grows by a record every time a
 * creature gets a body, and it is the half nobody reads top to bottom. Every
 * name is re-exported from `own-motion.ts`, so nothing that already reaches
 * for one through that file had to move.
 *
 * The rules the records here are held to are all stated next door and none of
 * them changed with the address: a motion may touch nothing, it is measured in
 * tiles rather than pixels, and its clock is beats rather than seconds.
 */

/**
 * The bulb: a wide slow sway with a faster pump inside it. The pump is
 * volume-preserving — as wide as it gets, it gets that much flatter — so it
 * reads as something breathing rather than as a shape being resized.
 *
 * The frequencies are the seconds-era ones divided by 1.6, the beats per
 * second at the config's 96 BPM, so the body moves at exactly the rate it
 * moved at before the clock changed underneath it.
 */
export const SWAY_PUMP: OwnMotion = {
  name: "SWAY · PUMP",
  note: "slow sway, faster pump, volume held",
  poseAt(t) {
    const swing = Math.sin(t * 1.1875);
    const pump = Math.sin(t * 1.9375);
    return { dx: swing * 0.17, dy: 0, rot: swing * 0.18, sx: 1 + pump * 0.1, sy: 1 - pump * 0.1 };
  },
};

/**
 * The slick: a tilt whose rotation lags its own drift by half a radian, and a
 * ripple across the width. The lag is what makes it read as a flat thing being
 * dragged through something rather than a rigid body being rocked.
 *
 * The half-radian lag is an angle, not a duration, so it does not convert.
 */
export const TILT_RIPPLE: OwnMotion = {
  name: "TILT · RIPPLE",
  note: "drift, tilt lagging behind it, ripple across the width",
  poseAt(t) {
    return {
      dx: Math.sin(t * 0.84375) * 0.11,
      dy: Math.sin(t * 1.375) * 0.05,
      rot: Math.sin(t * 0.84375 + 0.5) * 0.22,
      sx: 1 + Math.sin(t * 1.375) * 0.09,
      sy: 1,
    };
  },
};

/**
 * Spare since the runt was retired for THE LURE, and kept: it is the one
 * motion here written for a body too small to glide, and the next creature
 * that is will want the argument below made again. A tight, arrhythmic tremor that never travels and never settles into a
 * rhythm. Three frequencies with no common period, so the body never completes
 * one clean rock the way the slick or the bulb does — that absence is the
 * whole point. A creature you must not shoot has to read as *helpless*, and a
 * glide or a lagging tilt both say "in control of where it is going." A
 * tremor says: too small to do more than shake.
 *
 * The three are the one set of numbers here that is not a straight unit
 * conversion: 5.3 rad/s sat within a few percent of the beat's own 5.03 rad/s
 * half-harmonic once the pose clock moved onto `world.beat`, so it went to
 * 5.9, with 8.7 and 13.1 nudged to 8.3 and 12.7 to keep the trio
 * incommensurable — debris caught in the wave, not part of it.
 */
export const TREMBLE: OwnMotion = {
  name: "TREMBLE",
  note: "tight, arrhythmic shiver, no drift and no lag — too small to glide",
  poseAt(t) {
    const jitter =
      Math.sin(t * 5.1875) * 0.035 + Math.sin(t * 7.9375) * 0.02 + Math.sin(t * 3.6875) * 0.02;
    return {
      dx: jitter,
      dy: Math.sin(t * 6.1875) * 0.02,
      rot: Math.sin(t * 7.0625) * 0.08,
      sx: 1,
      sy: 1,
    };
  },
};

/**
 * The throb: the smallest motion here, on purpose. `Creature.throbOpen`
 * already swells and shrinks it on the shared beat (`render/creatures.ts`),
 * and that pulse is nearly load-bearing — it is what tells the pair when to
 * fire. A tilt or a pump layered on top would read as a second signal
 * fighting the first: a body saying "now" cannot also be saying "and also
 * this." So no rotation and no scale — either would move the silhouette the
 * beat is already moving, and a player would have to separate the two to find
 * the one that matters. What is left is a drift too small and too slow to
 * compete, there only so the throb is not a dead thing between beats.
 */
export const HOLD: OwnMotion = {
  name: "HOLD",
  note: "a small, slow drift and nothing else — the beat's own swell is the whole of what it says",
  poseAt(t) {
    return { dx: Math.sin(t * 0.375) * 0.04, dy: 0, rot: 0, sx: 1, sy: 1 };
  },
};

/**
 * The dart: a body holding station under thrust. Two fast, shallow frequencies
 * and no sway at all — where the bulb swings a fifth of a lane and the slick
 * drifts, this one barely leaves the middle of its tile, because *its* sideways
 * movement is a real move of two whole columns and a sway would be a smaller
 * version of the same word. A creature whose one signal is "which way next"
 * must not idle in a way that could be mistaken for an answer.
 *
 * So what is left is vertical: a quick hunting bob and a scale that trades
 * height for width on the opposite phase, which reads as something correcting
 * itself against a thrust it is holding. The rotation is a twitch rather than
 * a rock — a tenth of the slick's tilt, and fast — so the *lean*
 * `render/src/dart.ts` adds toward `dartDir` is never lost inside it. That
 * separation is the whole reason this motion is as small as it is.
 */
export const POISE: OwnMotion = {
  name: "POISE",
  note: "a tight vertical hunt under held thrust — no sway, so the lean is the only sideways thing it says",
  poseAt(t) {
    const hunt = Math.sin(t * 2.4375);
    return {
      dx: 0,
      dy: hunt * 0.05,
      rot: Math.sin(t * 3.3125) * 0.025,
      sx: 1 - hunt * 0.04,
      sy: 1 + hunt * 0.06,
    };
  },
};

/**
 * The motion a living kind is drawn with. Call this rather than writing
 * `kind === "bulb" ? SWAY_PUMP : TILT_RIPPLE` by hand, for the same reason
 * `livingSilhouette` exists: the pairing of a kind to its picture is one fact,
 * and a second copy of it is how a creature ends up swaying like the other one.
 *
 * `lure` is never passed in, for `livingSilhouette`'s reason with more riding
 * on it: a lure sways as the body it wears, resolved by `wornKind` first, and
 * a motion of its own would be a tell on player 1's screen.
 */
export function livingMotion(kind: CreatureKind): OwnMotion {
  if (kind === "bulb") return SWAY_PUMP;
  if (kind === "throb") return HOLD;
  if (kind === "dart") return POISE;
  return TILT_RIPPLE;
}
