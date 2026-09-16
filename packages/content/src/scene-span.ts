import type { GuideScene, SceneStep } from "./scene-types.js";

/**
 * **Where a page of a film begins and ends**, and which one is showing.
 *
 * Cut out of `scenes.ts` when THE MOULT's film took that file over its 250-line
 * limit, and along the seam that file's own header already names: what is left
 * next door is the **list** — every rehearsal a guide can show, and the lookup
 * from a wave's named id to one — and these two functions never touch it. They
 * take a `GuideScene` and answer a question about its pages, which is why they
 * are the half that can go and the list is the half that cannot.
 *
 * The list grows by two lines with every film written. This file does not.
 *
 * Both are re-exported from `scenes.ts`, so nothing that already reached for
 * `stepSpan` or `stepAt` through it had to move.
 */

/**
 * A page's span: the tick it opens on and the tick it ends on. This is what a
 * page plays through and stands at the end of, while the seat reading it takes
 * as long as it likes.
 *
 * **The last page ends one tick short of the loop.** `SceneRun.advance` wraps
 * the moment its tick reaches `ticks` — it rebuilds the world and starts at 0
 * again — so a span that ended *at* `ticks` was a span whose end the clock
 * could never observe: the page ran on into the next turn of the loop, past its
 * own words, and the caption vanished because the tick it was written against
 * was in the future again. `guide-play.ts` stops the film at `to`, so `to` has
 * to be a tick the run can actually stand on.
 */
export function stepSpan(scene: GuideScene, index: number): { from: number; to: number } {
  const step = scene.steps[Math.max(0, Math.min(scene.steps.length - 1, index))]!;
  const next = scene.steps[scene.steps.indexOf(step) + 1];
  return { from: step.tick, to: next ? next.tick : scene.ticks - 1 };
}

/** The step showing at this tick of the loop. Never undefined: a scene's first
 * step starts at tick 0, and `test/scenes.test.ts` is what holds that. */
export function stepAt(scene: GuideScene, tick: number): SceneStep {
  let found = scene.steps[0]!;
  for (const step of scene.steps) {
    if (step.tick > tick) break;
    found = step;
  }
  return found;
}
