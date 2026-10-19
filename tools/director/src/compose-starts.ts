import { controlSet, setHas, type Wave, wavePressure } from "@neon-spore/content";
import { isFiller, placeable } from "./compose-block.js";
import { TUTORIAL_LAST_ID } from "./compose-steps.js";
import { introducesAt, regularAt } from "./list-reading.js";

/**
 * **Where blocks start**, of the three kinds there are: an intro that brings
 * a body or a pod (`placeable`), a lesson that brings a panel or a fault
 * (`compose-lesson.ts`), and a review head (`compose-review.ts`). Boss
 * placement and the composers read blocks off the list through these.
 *
 * A filler was not a block: three waves of known things between a block and
 * its boss, read as the end of the block it followed. The fillers went on
 * 19 October 2026, and a boss follows its block's one regular wave.
 */

export { isFiller };

/** Whether a wave starts a filler: its first wave, which is not a variant. */
export function isFillerHead(waves: readonly Wave[], index: number): boolean {
  const wave = waves[index];
  return wave?.variant !== true && isFiller(wave?.id);
}

/** Whether a wave starts a review block: a regular wave the review composer
 * wrote (`review…`), not a variant. A review is one wave since 19 October
 * 2026, so there is no variant after it to tell it by. */
export function isReviewHead(waves: readonly Wave[], index: number): boolean {
  return (
    waves[index]?.variant !== true &&
    /^review[A-Z]/.test(waves[index]?.id ?? "") &&
    regularAt(waves, index)
  );
}

/** Whether a wave is a lesson: it brings something new — a panel, a fault —
 * that a wave cannot place as an arrival. THE LANCE, THE JAM, THE CLAW. */
export function isLesson(waves: readonly Wave[], index: number): boolean {
  const wave = waves[index];
  if (!wave || wave.boss || placeable(waves, index) !== undefined) return false;
  return introducesAt(waves, index).length > 0;
}

/** Whether a wave starts a block of any kind. */
export function startsBlock(waves: readonly Wave[], index: number): boolean {
  return (
    placeable(waves, index) !== undefined || isLesson(waves, index) || isReviewHead(waves, index)
  );
}

/** Blocks of any kind that start after the tutorial arc and before `at`:
 * what a composed block's steps grow by (`compose-grow.ts`). */
export function blocksBefore(waves: readonly Wave[], at: number): number {
  const finale = waves.findIndex((w) => w.id === TUTORIAL_LAST_ID);
  let n = 0;
  for (let i = finale + 1; i < at; i++) if (startsBlock(waves, i)) n++;
  return n;
}

/** The gentlest regular wave of the block that `at` follows — from its start
 * to `at` — which the next block's first wave aims a little above: by
 * pressure, or by another score (`waveTalk`). A wave on
 * THE CLAW's panel is passed over: its pressure counts no pods, which are its
 * whole difficulty, and a block of them is read through to the one before. */
export function gentlestBefore(
  waves: readonly Wave[],
  at: number,
  score: (wave: Wave) => number | undefined = wavePressure,
): number | undefined {
  let start = at - 1;
  while (start > 0 && !startsBlock(waves, start)) start--;
  let floor: number | undefined;
  for (let i = start; i < at; i++) {
    const w = waves[i] as Wave;
    if (setHas(controlSet(w.controls), "reach")) continue;
    const p = regularAt(waves, i) ? score(w) : undefined;
    if (p !== undefined && (floor === undefined || p < floor)) floor = p;
  }
  const finale = waves.findIndex((w) => w.id === TUTORIAL_LAST_ID);
  return floor === undefined && start > finale + 1 ? gentlestBefore(waves, start, score) : floor;
}
