import { buildBoss, buildPods, buildQueue, WAVES, waveGuideSteps } from "@neon-spore/content";
import { createWorld, DEFAULT_CONFIG, startWave, type World } from "@neon-spore/sim";

/**
 * Which waves carry a guide, and a world posed at the moment one opens.
 *
 * This file used to be the interesting half of the guide sheets: it derived,
 * by replaying `openBriefings` over the whole campaign, which wave first
 * raised each card subject. There are no subjects any more — a wave carries
 * its own guide, written under its own `sentence` — so the derivation is gone
 * and what is left is a lookup. That is the point of the change rather than a
 * casualty of it: "which wave teaches this" is now a fact you can read off the
 * wave, and a computation nobody has to trust.
 *
 * The config matches `apps/game/src/main.ts`'s own — briefings on, hull held
 * so nothing here can end the run it is posing (`pose-kit.ts`'s own rule) —
 * and `buildQueue`/`buildPods`/`buildBoss` are called exactly as `main.ts`
 * calls them on a `needWave` event: the real translation from an authored wave
 * to what the sim is handed, not a re-derivation of it.
 */
const CARD_CFG = { ...DEFAULT_CONFIG, briefings: true, hullInvulnerable: true };

/** How many waves are authored — past this, `WAVES[i]` is undefined filler. */
export const AUTHORED_WAVE_COUNT = WAVES.length;

/** `WAVES[i]`'s own name, one-indexed the way the game names a wave out loud. */
export function waveLabel(i: number): string {
  const w = WAVES[i];
  return w ? `${i + 1} · ${w.name}` : `WAVE ${i + 1}`;
}

/**
 * A world at the moment a wave starts — its guide standing if it carries one,
 * and its introduction behind that. Built fresh each call, like every other
 * pose: nothing here is shared between two questions asked of it.
 */
export function waveOpeningWorld(waveIndex: number): World {
  const world = createWorld({ ...CARD_CFG }, waveIndex);
  startWave(
    world,
    waveIndex,
    buildQueue(waveIndex, CARD_CFG.cols),
    buildPods(waveIndex, CARD_CFG.cols),
    buildBoss(waveIndex, CARD_CFG.cols),
    WAVES[waveIndex]?.guide !== undefined,
    // And how many pages that guide has, or the director would pose the one
    // wave with a rehearsal as a guide made of prose (`sim/guide-steps.ts`).
    waveGuideSteps(waveIndex),
  );
  return world;
}

/** Wave indices that carry a guide — what `rail.ts` marks and the sheet lists. */
export function wavesWithGuides(): number[] {
  const out: number[] = [];
  for (let i = 0; i < WAVES.length; i++) if (WAVES[i]?.guide) out.push(i);
  return out;
}
