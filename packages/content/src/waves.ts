import { sceneSteps } from "./scenes.js";
import type { Wave, WaveGuide } from "./wave-types.js";
import { WAVES_ACT_1 } from "./waves/act-1.js";
import { WAVES_ACT_2 } from "./waves/act-2.js";
import { WAVES_ACT_3 } from "./waves/act-3.js";
import { WAVES_ACT_4 } from "./waves/act-4.js";
import { WAVES_ACT_5 } from "./waves/act-5.js";

export type { Wave, WaveEntry, WaveGuide } from "./wave-types.js";

/**
 * Every wave in the game, in order. This file used to be the list itself, and
 * it grew a dozen lines a wave until it could not — `packages/sim/test/limits.test.ts`
 * carried the receipt. The list is now split by act into `waves/act-*.ts`, one
 * file per chapter of the game (`act-1.ts` is the tutorial arc ending on
 * `FINALE`, `act-2.ts` is the first five bosses back to back, `act-3.ts` is
 * everything after them, and `act-5.ts` is where new waves land now — each act
 * file is cut when it reaches the 250-line limit, not when a chapter ends); this
 * file only concatenates them in order, so what stands here stays short no matter
 * how many waves the acts hold.
 *
 * `tools/director/src/serialize.ts` regenerates one act file at a time —
 * `serializeWaveArray` takes the export name (`WAVES_ACT_1`, `WAVES_ACT_2`,
 * …) along with the array, so a save never touches this barrel. A new act,
 * once the newest one fills up in its own turn, is one more import and one
 * more spread here — which is exactly what `act-4.ts` cost.
 */
export const WAVES: Wave[] = [
  ...WAVES_ACT_1,
  ...WAVES_ACT_2,
  ...WAVES_ACT_3,
  ...WAVES_ACT_4,
  ...WAVES_ACT_5,
];

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
