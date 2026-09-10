import type { OwnMotion } from "./own-motion.js";

/**
 * The motion that is an event rather than an idle — and, until 10 September
 * 2026, the two.
 *
 * Every other motion in this game is sines: a drift, a lean, a swell, each
 * spending as long getting big as it spends getting small. A sine is a fine
 * thing for a body to do and it has one property that rules out a whole class
 * of picture — **it has no rest**, so there is no silence for anything to
 * happen against, and a body doing it is never *doing* something, it is only
 * moving.
 *
 * BLOOM is the other kind. It arrived on 8 September 2026 beside SWALLOW,
 * with the two contours that asked for them: a slick is two sacs holding on
 * to each other and a bulb is a spore, and what each of those shapes wants to
 * be seen doing is one gesture with a wait after it. The shape of the attack
 * is the whole design — how fast it leaves, how slowly it settles, and how
 * long the body is still afterwards. SWALLOW was retired on 10 September 2026
 * when the owner took BANK for the slick (`motion-bank.ts`), a drift with a
 * direction and no rest in it; it is kept in `motions-retired.ts`.
 *
 * A file of its own because `motions.ts` reached its limit holding all six,
 * and this is the seam the records themselves draw rather than one picked to
 * make the numbers work.
 */

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
