import type { GuideScene } from "./scene-types.js";
import { THE_BATON } from "./scenes/the-baton.js";
import { THE_CANDLE } from "./scenes/the-candle.js";
import { THE_CURTAIN } from "./scenes/the-curtain.js";
import { THE_DIASTOLE } from "./scenes/the-diastole.js";
import { THE_GORGE } from "./scenes/the-gorge.js";
import { THE_LEDGER } from "./scenes/the-ledger.js";
import { THE_SINEW } from "./scenes/the-sinew.js";
import { THE_SURGE } from "./scenes/the-surge.js";
import { THE_TASTER } from "./scenes/the-taster.js";
import { THE_THROAT } from "./scenes/the-throat.js";
import { THE_UNDERTOW } from "./scenes/the-undertow.js";

/**
 * The rehearsals of the bosses designed on `docs/spec/bosses-choreographed.md`.
 *
 * Cut out of `scenes.ts` on the day THE GORGE's film took that list to its
 * 250th line (17 September 2026). The seam is the spec's own: those fifteen
 * designs are one page, built two lanes at a time and marked on one ledger,
 * and their films arrive one lane after another — every one of them written
 * after its look landed rather than with it (`briefings.md` §3.2). A film for
 * a boss on that page is added here; `scenes.ts` spreads this table into
 * `SCENES` and widens `SceneId` by the id, so nothing that asks the list for a
 * film has to know which file it came from.
 *
 * In the order the spec's ledger built them.
 */
export type ChoreographedSceneId =
  | "theDiastole"
  | "theBaton"
  | "theThroat"
  | "theUndertow"
  | "theCandle"
  | "theGorge"
  | "theCurtain"
  | "theTaster"
  | "theSinew"
  | "theLedger"
  | "theSurge";

export const SCENES_CHOREOGRAPHED: Record<ChoreographedSceneId, GuideScene> = {
  theDiastole: THE_DIASTOLE,
  theBaton: THE_BATON,
  theThroat: THE_THROAT,
  theUndertow: THE_UNDERTOW,
  theCandle: THE_CANDLE,
  theGorge: THE_GORGE,
  theCurtain: THE_CURTAIN,
  theTaster: THE_TASTER,
  theSinew: THE_SINEW,
  theLedger: THE_LEDGER,
  theSurge: THE_SURGE,
};
