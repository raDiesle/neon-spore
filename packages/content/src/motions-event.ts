import type { OwnMotion } from "./own-motion.js";

/**
 * The two motions that are events rather than idles.
 *
 * Every other motion in this game is sines: a drift, a lean, a swell, each
 * spending as long getting big as it spends getting small. A sine is a fine
 * thing for a body to do and it has one property that rules out a whole class
 * of picture — **it has no rest**, so there is no silence for anything to
 * happen against, and a body doing it is never *doing* something, it is only
 * moving.
 *
 * These two are the other kind, and they arrived together on 8 September 2026
 * with the two contours that asked for them: a slick is two sacs holding on to
 * each other and a bulb is a spore, and what each of those shapes wants to be
 * seen doing is one gesture with a wait after it. The shape of the attack is
 * the whole design in both — how fast it leaves, how slowly it settles, and
 * how long the body is still afterwards.
 *
 * A file of their own because `motions.ts` reached its limit holding all six,
 * and this is the seam the records themselves draw rather than one picked to
 * make the numbers work.
 */

/**
 * THE SLICK: mass passed from one sac to the other, and then a rest.
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

/**
 * THE BULB: a long slow fill and a quick vent, on a clock the beat never meets.
 *
 * Six lobes deep enough to be counted is a *spore* (`silhouettes.ts`), and a
 * spore's one gesture is letting go of what is inside it. A sine swelling
 * under a sine swinging said neither half of that. Three quarters of the cycle
 * is the fill, on `v²`, and it is deliberately dull; the last quarter is the
 * vent, where the swell collapses on `(1 − w)²` and the body **rises**,
 * because a thing that has just pushed something out from under itself goes up.
 *
 * **It inflates rather than clenching, and the period is 2.95 beats.** Growing
 * in both axes says *filling*, where widening as it flattened would say
 * squeeze — the slick's word next door. And on a body carrying ammunition
 * colour at 26 px, a swell on the beat is a fire cue whether it was meant as
 * one or not (`docs/alive.md`); 2.95 is not a whole number of beats, so the
 * vent lands somewhere different in every bar.
 */
const BLOOM_PERIOD = 2.95;
/** Where in the cycle the fill stops and the vent starts. */
const BLOOM_VENT_AT = 0.76;
const BLOOM_SWELL = 0.08;
const BLOOM_RISE = 0.1;

export const BLOOM: OwnMotion = {
  name: "BLOOM",
  note: "a long dull fill and a quick vent it rises on — off the beat, so it is never a cue",
  poseAt(t) {
    const p = (t % BLOOM_PERIOD) / BLOOM_PERIOD;
    let full: number;
    let kick = 0;
    if (p < BLOOM_VENT_AT) {
      full = (p / BLOOM_VENT_AT) ** 2;
    } else {
      const w = (p - BLOOM_VENT_AT) / (1 - BLOOM_VENT_AT);
      full = (1 - w) ** 2;
      // The push, which is the fall of the swell read as an event of its own.
      kick = 1 - full;
    }
    const s = 1 + full * BLOOM_SWELL;
    return {
      dx: 0,
      dy: -kick * BLOOM_RISE,
      rot: Math.sin(t * 0.4375) * 0.09,
      sx: s,
      sy: s,
    };
  },
};
