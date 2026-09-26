import type { GuideScene } from "./scene-types.js";
import { type ChoreographedSceneId, SCENES_CHOREOGRAPHED } from "./scenes-choreographed.js";
import { type FaultSceneId, SCENES_FAULTS } from "./scenes-faults.js";
import { type OwedSceneId, SCENES_OWED } from "./scenes-owed.js";
import { SCENES_WAVES, type WaveSceneId } from "./scenes-waves.js";

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
 * is the half worth reading. What is left here is the union of the four
 * tables next door, and the two questions everything else asks it — *which
 * film does this wave show* and *where does page `n` start and stop*. A film
 * of no family of its own goes in `scenes-waves.ts`. The shapes a film is written in are
 * `scene-types.ts`; `.claude/skills/new-tutorial` is how to write one.
 *
 * **The choreographed bosses' films are next door** (`scenes-choreographed.ts`),
 * one file for the one page of the spec they were designed on; a new film for
 * one of them goes there.
 */

export type SceneId = WaveSceneId | ChoreographedSceneId | FaultSceneId | OwedSceneId;

export const SCENES: Record<SceneId, GuideScene> = {
  // The films are listed next door, a table to a family: the waves' own
  // (`scenes-waves.ts`), the choreographed bosses', one file for the page they
  // were designed on (`scenes-choreographed.ts`), the faults' beside them
  // (`scenes-faults.ts`), and the films §3.2 listed as owed (`scenes-owed.ts`).
  ...SCENES_WAVES,
  ...SCENES_CHOREOGRAPHED,
  ...SCENES_FAULTS,
  ...SCENES_OWED,
};

export type { BossPart, GuideScene, SceneAct, SceneAnchor, SceneStep } from "./scene-types.js";

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

// **Where a page begins and ends** is `scene-span.ts` next door, cut out when
// THE MOULT's film took this file over its limit. The seam is the one the
// header above already draws: this is the list, and those two take a film and
// answer a question about its pages without ever asking the list anything.
// Re-exported, so nothing that already reached for either through this file
// had to move.
export { stepAt, stepSpan } from "./scene-span.js";
