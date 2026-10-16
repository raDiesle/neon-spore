import { sceneSteps } from "./scenes.js";
import type { Wave, WaveGuide } from "./wave-types.js";
import { WAVE_ACTS } from "./waves/acts.js";

export type {
  BossType,
  FilmedGuide,
  Wave,
  WaveEntry,
  WaveGuide,
  WordedGuide,
} from "./wave-types.js";

/**
 * Every wave in the game, in order. This file used to be the list itself, and
 * it grew a dozen lines a wave until it could not — `packages/sim/test/limits.test.ts`
 * carried the receipt. The list is now split into `waves/act-*.ts`: `act-1.ts`
 * to `act-2.ts` are the tutorial arc ending on `FINALE`, and every act after it
 * holds one block in the order it is played, cut again by each reorder
 * (`tools/director/src/waves-recut.ts`) — a file is cut when it reaches the
 * 250-line limit rather than when a chapter ends, which is why the order here
 * is the order of the game rather than the order of the names; this file only
 * concatenates them in order, so what stands here stays short no matter how
 * many waves the acts hold.
 *
 * `tools/director/src/serialize.ts` regenerates one act file at a time —
 * `serializeWaveArray` takes the export name (`WAVES_ACT_1`, `WAVES_ACT_2`,
 * …) along with the array, so a save never touches this barrel. **Which act
 * files there are, and in what order, is `waves/acts.ts`**, since 14 October
 * 2026: the game is heading for a thousand waves, and an act cut by hand was
 * one import and one spread here and five lines in the director's table every
 * time. The save writes that list itself now, and cuts a full act on its own.
 */
export const WAVES: Wave[] = WAVE_ACTS.flat();

/**
 * How many pages a guide made of prose is read in: the shared line, then the
 * split. Two rather than one because the split is the thing the guide exists to
 * teach — a page showing both halves at once would let a pair read the lot
 * without ever noticing that one of them is holding a sentence the other cannot
 * see.
 */
export const PROSE_PAGES = 2;

/**
 * How many pages a guide has in front of its gate.
 *
 * This is what `startWave` is handed beside `hasGuide`, and it is the whole of
 * what the simulation knows about a guide: which page is the last one, and
 * therefore where the ready gate is (`sim/guide-steps.ts`). A count rather than
 * a scene or a string, because `packages/sim` never reads `content`.
 *
 * **Every guide has pages.** One with a rehearsal has a page per step of the
 * film; one made of prose has `PROSE_PAGES`, and it used to have a card with a
 * border round it instead. The owner's instruction was flat — *I don't want to
 * show old cards any longer* — so the panel is gone and its words are read the
 * way a rehearsal's are: a page at a time, on the game's own screen, with the
 * same NEXT and the same gate.
 *
 * It takes the guide rather than a wave's number because the director edits a
 * wave that is not on disk yet, and a count read out of `WAVES` there would be
 * the count of whatever was last saved.
 */
export function guideSteps(guide: WaveGuide | undefined): number {
  if (!guide) return 0;
  return guide.scene === undefined ? PROSE_PAGES : sceneSteps(guide.scene);
}

/** The same, for a wave named by its number — what `apps/game` asks. */
export function waveGuideSteps(wave: number): number {
  return guideSteps(WAVES[wave]?.guide);
}

/**
 * Whether a wave carries a guide at all — asked by everything that offers to
 * play one.
 *
 * `waveGuideSteps` is not this question. A guide made of prose has
 * `PROSE_PAGES` and a guide with a rehearsal has a page per step, so a count
 * happens to answer it today; a guide of one page would make the count 1 and a
 * wave with no guide 0, and the two would be a `> 0` somebody has to remember.
 * The host asked it as `WAVES[wave]?.guide !== undefined` and the lost screen
 * was about to ask it again, which is the moment a re-derived rule becomes a
 * function (`CLAUDE.md`).
 */
export function waveHasGuide(wave: number): boolean {
  return WAVES[wave]?.guide !== undefined;
}
