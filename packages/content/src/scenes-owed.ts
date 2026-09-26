import type { GuideScene } from "./scene-types.js";
import { THE_COUNT } from "./scenes/the-count.js";
import { THE_HUSK } from "./scenes/the-husk.js";
import { THE_REPRISE } from "./scenes/the-reprise.js";
import { THE_STARE } from "./scenes/the-stare.js";

/**
 * The rehearsals that were owed: the films `docs/spec/briefings.md` §3.2
 * listed as *a film nobody has written*, each written by the lane that took
 * its wave off that list, one after another on 18 September 2026.
 *
 * Cut out of `scenes.ts` on the day THE HUSK's took that list past its 250th
 * line, along the seam `scenes-choreographed.ts` and `scenes-faults.ts` cut
 * before it: the list of ids is one file, and a family of films with a page
 * of their own is another. This family's page is that section — the waves
 * whose picture landed before their film did, and whose film each found a
 * gap in the rehearsal's stage (a body the phone hides, a screen the phone
 * folds, a mark drawn on one seat's screen and not the other's). A film for
 * one of the guides still on that list is added here; `scenes.ts` spreads
 * this table into `SCENES` and widens `SceneId` by the id.
 */
export type OwedSceneId = "theReprise" | "theStare" | "theHusk" | "theCount";

export const SCENES_OWED: Record<OwedSceneId, GuideScene> = {
  theReprise: THE_REPRISE,
  theStare: THE_STARE,
  theHusk: THE_HUSK,
  theCount: THE_COUNT,
};
