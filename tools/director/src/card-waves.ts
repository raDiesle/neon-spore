import { buildBoss, buildPods, buildQueue, WAVES } from "@neon-spore/content";
import {
  BRIEFING_SUBJECTS,
  type BriefingId,
  createWorld,
  DEFAULT_CONFIG,
  startWave,
  type World,
} from "@neon-spore/sim";

/**
 * The card sheet's third question, and the only one that needs a real wave
 * rather than a subject on its own: which cards a wave actually raises, in
 * the order and the count it would raise them in.
 *
 * The config matches `apps/game/src/main.ts`'s own — briefings on, hull held
 * so nothing here can end the run it is posing (`pose-kit.ts`'s own rule) —
 * and `buildQueue`/`buildPods`/`buildBoss` are called exactly as `main.ts`
 * calls them on a `needWave` event: the real translation from an authored
 * wave to what the sim is handed, not a re-derivation of it.
 *
 * **A fresh pair, every time.** `startWave` calls `openBriefings` against
 * `world.brief.met`, and a world built here always starts at `met: 0` — there
 * is no earlier wave to have taught anything. That is exactly the pair
 * question 3 is about for wave 1, and it is the only pair this file can
 * answer for: asked about wave 9, it shows what wave 9 raises for a pair who
 * skipped straight to it, not for one who played waves 1 through 8 first.
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
 * A world at the moment a wave starts, carrying that wave's real due list —
 * `world.brief.due` — for a fresh pair. Built fresh each call, like every
 * other pose: nothing here is shared between two questions asked of it.
 */
export function waveBriefingWorld(waveIndex: number): World {
  const world = createWorld({ ...CARD_CFG }, waveIndex);
  startWave(
    world,
    waveIndex,
    buildQueue(waveIndex, CARD_CFG.cols),
    buildPods(waveIndex, CARD_CFG.cols),
    buildBoss(waveIndex, CARD_CFG.cols),
  );
  return world;
}

/** The subjects a fresh pair owes at the start of a wave, in reading order. */
export function waveBriefingOrder(waveIndex: number): BriefingId[] {
  return waveBriefingWorld(waveIndex).brief.due.map((i) => BRIEFING_SUBJECTS[i]!);
}
