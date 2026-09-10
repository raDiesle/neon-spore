import type { OwnMotion } from "./own-motion.js";

/**
 * The motions nothing in the game carries any more.
 *
 * Split out of `motions.ts` on 8 September 2026, when the slick's and the
 * bulb's own motions were retired together and that file went past its length
 * limit. The seam is the one that file's doc already implied: it holds the
 * motion each body is drawn with *now*, and this holds the ones a body used to
 * be drawn with. A retired motion is not dead code — it is a look the game
 * stopped drawing, and CLAUDE.md is clear that one of those is kept where it
 * can be seen rather than deleted.
 *
 * Where they are seen: `tools/shape-sheet/src/motions/index.ts` puts all four
 * on the SHAPES tab's motion axis with the spares, so the sway a bulb used to
 * have animates beside BLOOM, which replaced it, on one clock and one body.
 * That is the only comparison worth having and it is not one prose can make.
 *
 * Everything in here is still exported from `own-motion.ts` and from the
 * package index, because a retired motion that cannot be imported is a
 * retired motion nobody can put back.
 */

/**
 * Spare since 8 September 2026, when the bulb's contour went to six deep lobes
 * and it was given BLOOM instead. Kept, and kept *visible*: it is on the
 * SHAPES tab's motion axis (`tools/shape-sheet/src/motions/index.ts`) with the
 * other spares, so the look the game stopped drawing can still be looked at
 * beside the one that replaced it.
 *
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
 * Spare since 8 September 2026, when the slick's lobes were put on its long
 * axis and it was given SWALLOW instead. On the SHAPES tab's motion axis with
 * SWAY · PUMP, for the reason written there.
 *
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
 * Spare since 10 September 2026, when the owner took BANK for the slick
 * (`motion-bank.ts`) — a drift with a direction, over a transfer with a rest.
 * On the SHAPES tab's motion axis with the other two, for the reason written
 * there.
 *
 * The slick, as it was: mass passed from one sac to the other, and then a rest.
 *
 * A slick is two broad lobes on its long axis joined at a waist deep enough to
 * read as a join (`silhouettes.ts`), and what it carried was three sines
 * written for the bean that shape used to be. Three sines is a rocking; the
 * picture the new shape offers is a *transfer*, and no sine can be one,
 * because a sine has no rest for an event to stand against.
 *
 * So this is the first motion in the game with **a state, a move and a wait**
 * in it. One sac is full and the body leans that way; over 1.2 beats the mass
 * crosses on `1 − (1 − v)³`, poured rather than struck, and as it passes the
 * waist the body shortens and thickens — what a bounding box sees of two sacs
 * squeezing one lump between them. Then 1.8 beats of nothing, and the next
 * goes back: six beats to a cycle, so a row of them never falls onto one
 * clock. **`sx` and `sy` are reciprocal**, so the squeeze holds area exactly —
 * a body that grew as it crossed would be filling, and filling is a size tell
 * (`docs/alive.md`).
 */
const SWALLOW_PERIOD = 3;
const SWALLOW_CROSS = 1.2;
/** How far the full end pulls the body over, in tiles, and how far it leans. */
const SWALLOW_SHIFT = 0.1;
const SWALLOW_LEAN = 0.14;
/** How hard the waist squeezes at the crossing, as a fraction of the width. */
const SWALLOW_PINCH = 0.1;

export const SWALLOW: OwnMotion = {
  name: "SWALLOW",
  note: "one sac fills, the mass crosses the waist, the other holds it — a move and then a wait",
  poseAt(t) {
    const cycle = Math.floor(t / SWALLOW_PERIOD);
    const p = t - cycle * SWALLOW_PERIOD;
    const v = Math.min(1, p / SWALLOW_CROSS);
    // Poured, not struck: quick to leave and slow to arrive.
    const e = 1 - (1 - v) ** 3;
    // Which end is full at the start of this cycle, and which it ends on.
    const from = cycle % 2 === 0 ? -1 : 1;
    const at = from + -from * 2 * e;
    // Peaks halfway across and is zero at both ends, so the waist is only
    // squeezed while something is going through it.
    const squeeze = 4 * e * (1 - e);
    const w = 1 - squeeze * SWALLOW_PINCH;
    return {
      dx: at * SWALLOW_SHIFT,
      dy: 0,
      rot: at * SWALLOW_LEAN,
      sx: w,
      sy: 1 / w,
    };
  },
};
