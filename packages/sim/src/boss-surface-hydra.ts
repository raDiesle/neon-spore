/**
 * **THE HYDRA's names, on a page of their own** — the body, its heads, the
 * cut, the coil, the eye and the maw — for the picture, the cue, the sound
 * and the director's hand. Straight off `hydra.ts`, THE CHRYSALIS's way
 * (`boss-surface-chrysalis.ts`).
 */

export type { HydraConfig } from "./config-hydra.js";
export type { HydraEvent } from "./events-hydra.js";
export {
  freshHydra,
  HYDRA_HEADS,
  HYDRA_PHASES,
  HYDRA_SPAN,
  type HydraEntry,
  type HydraHead,
  type HydraPhase,
  type HydraState,
  type HydraStep,
  hydraBoss,
  hydraDone,
  hydraEyeOpen,
  hydraGone,
  hydraHeadOf,
  hydraHeadOn,
  hydraLapsOf,
  hydraLeft,
  hydraLitStep,
  hydraMawCol,
  hydraNext,
  hydraPerSide,
  hydraPieceCount,
  hydraPiecesAll,
  hydraRank,
  hydraSideCol,
  hydraUnwindWay,
  hydraWayOf,
} from "./hydra.js";
export { hydraTarget, hydraVerdict } from "./hydra-shot.js";
