import { buildBoss, buildPods, buildQueue, WAVES } from "@neon-spore/content";
import {
  BRIEFING_SUBJECTS,
  type BriefingId,
  createWorld,
  DEFAULT_CONFIG,
  openBriefings,
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
    WAVES[waveIndex]?.card,
  );
  return world;
}

/** The subjects a fresh pair owes at the start of a wave, in reading order. */
export function waveBriefingOrder(waveIndex: number): BriefingId[] {
  return waveBriefingWorld(waveIndex).brief.due.map((i) => BRIEFING_SUBJECTS[i]!);
}

/**
 * Which wave first raises each card, for a pair playing the whole queue in
 * order — a different question from `waveBriefingOrder`'s own, and the one
 * `docs/queue.md`'s card-assignment lane actually asks: not "what does wave i
 * send a pair who skipped straight to it", but "where does a pair who played
 * every wave before it first meet this".
 *
 * Derived by calling `openBriefings` — the same function `startWave` calls —
 * against one `World` carried across every wave in campaign order, marking
 * each wave's own due subjects met before moving to the next, and passing
 * each wave's own `card` through so an authored override is what this map
 * reflects, not the plain derivation underneath it. That is exactly what a
 * real run does one card at a time; nothing here re-summarizes a wave's
 * queue, pods or boss by hand; a hand-kept table is the thing this lane
 * exists to replace. Cached, since `WAVES` does not change at runtime and
 * this is asked from three different places (`rail.ts`, `card-page.ts`).
 */
let firstWaveCache: ReadonlyMap<BriefingId, number> | null = null;

export function cardFirstWave(): ReadonlyMap<BriefingId, number> {
  if (firstWaveCache) return firstWaveCache;
  const world = createWorld({ ...CARD_CFG }, 0);
  const map = new Map<BriefingId, number>();
  for (let i = 0; i < WAVES.length; i++) {
    openBriefings(
      world,
      buildQueue(i, CARD_CFG.cols),
      buildPods(i, CARD_CFG.cols),
      buildBoss(i, CARD_CFG.cols),
      WAVES[i]?.card,
    );
    for (const idx of world.brief.due) {
      const id = BRIEFING_SUBJECTS[idx]!;
      if (!map.has(id)) map.set(id, i);
      world.brief.met |= 1 << idx;
    }
  }
  firstWaveCache = map;
  return map;
}

/** Wave indices that introduce at least one card — what `rail.ts` marks. */
export function wavesWithCards(): ReadonlySet<number> {
  return new Set(cardFirstWave().values());
}

/**
 * The cards one wave first raises, for a pair playing the whole queue in
 * order — the same fact `cardFirstWave` carries, read the other way round so
 * `rail.ts` can name them on the row that already marks a wave has one,
 * rather than only saying that it does.
 */
export function cardsForWave(waveIndex: number): BriefingId[] {
  const ids: BriefingId[] = [];
  for (const [id, i] of cardFirstWave()) if (i === waveIndex) ids.push(id);
  return ids;
}

/**
 * Every card `BRIEFINGS` has that no wave ever raises. Not a row to invent —
 * see `docs/queue.md` — but a fact worth surfacing, since it is exactly what
 * stays a proposal once every reachable card has an assignment.
 */
export function subjectsWithNoWave(): BriefingId[] {
  const raised = cardFirstWave();
  return BRIEFING_SUBJECTS.filter((id) => !raised.has(id));
}
