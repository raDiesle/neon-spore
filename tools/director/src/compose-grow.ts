import type { Step, StepMix } from "./compose-steps.js";

/**
 * **The steps grow with the game** — the owner, 14 October 2026: each block's
 * gentlest wave starts a little above the block before's (`START_RISE`), and
 * what lets it is the steps getting **wider, then mixed**. Gaps and counts
 * stay as the table says. Without this the first step is the new thing alone
 * in columns 4–6, which cannot score above 4.2 in any block, and a start that
 * climbed would stop climbing three blocks in.
 *
 * Every `BLOCKS_PER_NOTCH` blocks past the tutorial arc is one notch. A notch
 * widens a step by a column each side until it spans the field; after that,
 * each notch brings an older thing in, up the mix ladder — the basics, then
 * the block before's thing, then one from further back. R6 and R7, whose mix
 * is their lever, are not on the ladder and only widen.
 *
 * That carries the first steps to about 7 by block 26, and no further: R4 and
 * R8 are already as wide and as mixed as they go, and cannot score above
 * about 10 and 11.5. So from `TWINS_FROM` on — the owner again, the same day —
 * every `TWINS_EVERY` notches R4, R6, R7 and R8 land one more arrival in three
 * with a twin across the field, the way R7 always has. Gaps stay; the twins
 * are arrivals of their own, so the count a step allows grows by them.
 */

/** Blocks between one notch and the next. */
export const BLOCKS_PER_NOTCH = 4;

const LAST_COL = 10;

/** The mixes a growing step climbs, in order. */
const MIX_LADDER: readonly StepMix[] = ["x", "xb", "xy", "xyz"];

/** The notch the twins start at — block 24 past the tutorial, where the
 * first steps stop climbing — and the notches between one more and the
 * next. */
export const TWINS_FROM = 6;
export const TWINS_EVERY = 4;

/** The steps that take twins as the game grows: the harder half. */
const TWINNED: readonly Step["id"][] = ["R4", "R6", "R7", "R8"];

/** How many notches a block stands at: none in the tutorial arc. */
export function notchOf(sinceTutorial: number): number {
  return sinceTutorial < 0 ? 0 : Math.floor(sinceTutorial / BLOCKS_PER_NOTCH);
}

/** A step as it stands `notch` notches in. */
export function grownStep(step: Step, notch: number): Step {
  let [lo, hi] = step.cols;
  let left = notch;
  while (left > 0 && (lo > 0 || hi < LAST_COL)) {
    lo = Math.max(0, lo - 1);
    hi = Math.min(LAST_COL, hi + 1);
    left--;
  }
  const rung = MIX_LADDER.indexOf(step.mix);
  const mix =
    rung === -1 ? step.mix : (MIX_LADDER[Math.min(MIX_LADDER.length - 1, rung + left)] ?? step.mix);
  const more =
    TWINNED.includes(step.id) && notch >= TWINS_FROM
      ? 1 + Math.floor((notch - TWINS_FROM) / TWINS_EVERY)
      : 0;
  const twins = Math.min(3, (step.twins ?? 0) + more);
  if (twins === (step.twins ?? 0)) return { ...step, cols: [lo, hi], mix };
  // Each arrival that brings a twin is two: the count grows by a third a twin.
  const [few, many] = step.arrivals;
  const added = twins - (step.twins ?? 0);
  const arrivals = [
    few + Math.floor((few * added) / 3),
    many + Math.ceil((many * added) / 3),
  ] as const;
  return { ...step, cols: [lo, hi], mix, twins, arrivals };
}

/** Beats a mixed step's gaps widen by in the tutorial arc. */
const ARC_EASE = 2;

/**
 * A mixed step as the tutorial arc plays it: two beats more between
 * arrivals, two fewer arrivals allowed, and no twin. Mixing from the first
 * regular wave on (`MIXED_STEPS`) costs a switch on nearly every arrival, and
 * at the table's gaps SHELL's first wave stood at 7.5 straight after CYAN's
 * 4.6 — too steep a tooth for a pair still learning the cannon.
 */
export function arcStep(step: Step): Step {
  const [lo, hi] = step.arrivals;
  const { twins: _t, ...rest } = step;
  return {
    ...rest,
    gaps: [step.gaps[0] + ARC_EASE, step.gaps[1] + ARC_EASE],
    arrivals: [Math.max(4, lo - ARC_EASE), hi],
  };
}
