import type { GuideScene, SceneStep } from "./scene-types.js";
import { FIRST_STEP } from "./scenes/first-step.js";
import { THE_HAND } from "./scenes/the-hand.js";
import { THE_ROCK } from "./scenes/the-rock.js";
import { THE_TORCH } from "./scenes/the-torch.js";
import { TWO_COLOURS } from "./scenes/two-colours.js";

/**
 * Every rehearsal a guide can show, and where a page of one begins and ends.
 *
 * A guide names a scene by id — `WaveGuide.scene` — the way a wave names a
 * control set by id. That is not a shortcut around putting the data on the
 * wave: it is the same argument `control-sets.ts` makes at the top of itself.
 * A named thing is something a person can be shown, argued with and told to
 * change; an anonymous literal inside a wave file is a hundred lines of
 * choreography sitting in the middle of a list of arrivals, and the director
 * would have to learn to serialize every one of them to save the wave beside
 * it (`tools/director/src/serialize.ts` writes one line for a name).
 *
 * **One film per file, under `scenes/`.** They were all in here, which was fine
 * at one and would not have been at five: a film is fifty lines of choreography
 * and forty of argument about why it teaches what it teaches, and the argument
 * is the half worth reading. What is left here is the list, and the two
 * questions everything else asks it — *which film does this wave show* and
 * *where does page `n` start and stop*. The shapes a film is written in are
 * `scene-types.ts`; `.claude/skills/new-tutorial` is how to write one.
 */

export type SceneId = "firstStep" | "twoColours" | "theRock" | "theHand" | "torch";

export const SCENES: Record<SceneId, GuideScene> = {
  firstStep: FIRST_STEP,
  twoColours: TWO_COLOURS,
  theRock: THE_ROCK,
  theHand: THE_HAND,
  torch: THE_TORCH,
};

export type { GuideScene, SceneAct, SceneAnchor, SceneStep } from "./scene-types.js";

export function guideScene(id: SceneId): GuideScene {
  const found = SCENES[id];
  if (!found) throw new Error(`no scene named ${id}`);
  return found;
}

/**
 * How many pages of film a scene has. What the simulation is told about a wave's
 * guide, so it knows which page is the last one and therefore where the ready
 * gate is (`sim/guide-steps.ts`); it is a count and never a scene, because
 * `packages/sim` may not read this file.
 */
export function sceneSteps(id: SceneId): number {
  return guideScene(id).steps.length;
}

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
