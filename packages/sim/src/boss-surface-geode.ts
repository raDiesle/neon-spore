/**
 * **THE GEODE's names, on a page of their own** — the stone, its cracks and
 * what a shot meets — for the picture, the cue, the sound and the director's
 * hand. Straight off `geode.ts`, THE HYDRA's way (`boss-surface-hydra.ts`).
 */

export type { GeodeConfig } from "./config-geode.js";
export type { GeodeEvent } from "./events-geode.js";
export {
  freshGeode,
  GEODE_PHASES,
  GEODE_SPAN,
  type GeodeCrack,
  type GeodeEntry,
  type GeodePhase,
  type GeodeState,
  type GeodeStep,
  geodeBoss,
  geodeCrackCol,
  geodeCracksIn,
  geodeCut,
  geodeDone,
  geodeLeft,
  geodeLitStep,
  geodeNext,
  geodePiecesAll,
} from "./geode.js";
export { geodeVerdict } from "./geode-shot.js";
