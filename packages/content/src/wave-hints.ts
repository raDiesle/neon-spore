import type { HintLine } from "./hint-types.js";
import { FIRST_STEP_HINTS } from "./hints/first-step.js";
import {
  CROSSING_HINTS,
  HAND_HINTS,
  LIMPET_HINTS,
  ONE_LAST_CHANCE_HINTS,
  ROCK_HINTS,
  TORCH_HINTS,
  VEER_HINTS,
  WARD_HINTS,
} from "./hints/shield.js";
import {
  CAROM_HINTS,
  CLASP_HINTS,
  CRAWLER_HINTS,
  CRYSTAL_HINTS,
  CUT_HINTS,
  FENCE_HINTS,
  GAP_HINTS,
  VOLLEY_HINTS,
} from "./hints/shield-walls.js";
import {
  CYAN_HINTS,
  ECHO_HINTS,
  HOLD_AND_AIM_HINTS,
  MAGNET_HINTS,
  STRAND_HINTS,
  THIRD_SHOT_HINTS,
  VEIL_HINTS,
} from "./hints/standard-2.js";
import {
  COUNT_HINTS,
  DART_HINTS,
  GHOST_HINTS,
  GYRE_HINTS,
  LURE_HINTS,
  RECOIL_HINTS,
  RIND_HINTS,
  THROB_HINTS,
  WISP_HINTS,
} from "./hints/standard-2-tricks.js";
import type { Wave } from "./wave-types.js";

/**
 * **A wave that teaches on its own field** rather than in front of it.
 *
 * The owner, 19 October 2026: *replace tutorial mode before wave starts in a
 * way that it is giving hints during gameplay of the related wave but players
 * can interact already (so it is not a separate step) — right now it is
 * unclear for players that it is tutorial.* A wave naming one of these opens
 * on its introduction and is played at once, and the field writes the next
 * thing to do on the screen of the seat that does it, until the pair has shown
 * it can (`render/src/wave-hint.ts`). A name rather than the readings
 * themselves, for `FilmedGuide.scene`'s reason: one line for the director to
 * write back out; each table is a family's file under `hints/`, and its lines
 * are `HintLine`s (`hint-types.ts`). FIRST STEP was the first, the example
 * the owner judged before the rest were moved over (`docs/spec/briefings.md`).
 */
export const WAVE_HINTS = {
  firstStep: FIRST_STEP_HINTS,
  cyan: CYAN_HINTS,
  theEcho: ECHO_HINTS,
  theStrand: STRAND_HINTS,
  theVeil: VEIL_HINTS,
  theThirdShot: THIRD_SHOT_HINTS,
  holdAndAim: HOLD_AND_AIM_HINTS,
  theMagnet: MAGNET_HINTS,
  theThrob: THROB_HINTS,
  theRecoil: RECOIL_HINTS,
  theGyre: GYRE_HINTS,
  theLure: LURE_HINTS,
  theRind: RIND_HINTS,
  theDart: DART_HINTS,
  theCount: COUNT_HINTS,
  theGhost: GHOST_HINTS,
  theWisp: WISP_HINTS,
  theRock: ROCK_HINTS,
  theHand: HAND_HINTS,
  oneLastChance: ONE_LAST_CHANCE_HINTS,
  torch: TORCH_HINTS,
  theCrossing: CROSSING_HINTS,
  theLimpet: LIMPET_HINTS,
  theWard: WARD_HINTS,
  theVeer: VEER_HINTS,
  theFence: FENCE_HINTS,
  theGap: GAP_HINTS,
  theCut: CUT_HINTS,
  theClasp: CLASP_HINTS,
  theCrystal: CRYSTAL_HINTS,
  theVolley: VOLLEY_HINTS,
  theCarom: CAROM_HINTS,
  theCrawler: CRAWLER_HINTS,
} satisfies Record<string, readonly HintLine[]>;

/** The waves whose help is given on the field while they are played (`Wave.hints`). */
export type WaveHintsId = keyof typeof WAVE_HINTS;

/**
 * **Whether a wave teaches anything**: a guide in front of it, or hints on its
 * field while it is played (`Wave.hints`). Not `waveHasGuide`, which is the
 * question of whether there is a guide to *play* — a wave with hints has none,
 * and opens on its introduction. This is the question the rules about what is
 * taught where ask (`wave-keys.ts`, `wave-regular.ts`).
 */
export function waveTeaches(wave: Pick<Wave, "guide" | "hints">): boolean {
  return wave.guide !== undefined || wave.hints !== undefined;
}
