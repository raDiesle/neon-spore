import { isRegularWave, type Wave, waveIntroduces, wavePressure } from "@neon-spore/content";
import { placeable } from "./compose-block.js";
import { TUTORIAL_LAST_ID } from "./compose-steps.js";

/**
 * **Where blocks start**, of the three kinds there are: an intro that brings
 * a body or a pod (`placeable`), a lesson that brings a panel or a fault
 * (`compose-lesson.ts`), and a review head (`compose-review.ts`). Boss
 * placement and the composers read blocks off the list through these.
 */

/** Whether a wave starts a review block: a regular wave, not a variant,
 * with a regular variant after it. No hand-written wave is one. */
export function isReviewHead(waves: readonly Wave[], index: number): boolean {
  const next = waves[index + 1];
  return (
    waves[index]?.variant !== true &&
    isRegularWave(waves, index) &&
    next?.variant === true &&
    isRegularWave(waves, index + 1)
  );
}

/** Whether a wave is a lesson: it brings something new — a panel, a fault —
 * that a wave cannot place as an arrival. THE LANCE, THE JAM, THE CLAW. */
export function isLesson(waves: readonly Wave[], index: number): boolean {
  const wave = waves[index];
  if (!wave || wave.boss || placeable(waves, index) !== undefined) return false;
  return waveIntroduces(waves, index).length > 0;
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
 * to `at` — which the next block's first wave aims a little above. */
export function gentlestBefore(waves: readonly Wave[], at: number): number | undefined {
  let start = at - 1;
  while (start > 0 && !startsBlock(waves, start)) start--;
  let floor: number | undefined;
  for (let i = start; i < at; i++) {
    const p = isRegularWave(waves, i) ? wavePressure(waves[i] as Wave) : undefined;
    if (p !== undefined && (floor === undefined || p < floor)) floor = p;
  }
  return floor;
}
