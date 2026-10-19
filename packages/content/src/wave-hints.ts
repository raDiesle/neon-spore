import type { CreatureKind } from "@neon-spore/sim";
import type { HintLine } from "./hint-types.js";
import { FIRST_STEP_HINTS } from "./hints/first-step.js";
import {
  CATCH_AND_AIM_HINTS,
  HUSK_HINTS,
  LANCE_HINTS,
  LEAK_HINTS,
  MORSEL_HINTS,
  SALVAGE_HINTS,
  SEEDER_HINTS,
} from "./hints/pods.js";
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
import {
  BALLOON_HINTS,
  BEATBOX_HINTS,
  BLISTER_HINTS,
  CHOIR_HINTS,
  COMBO_BLISTERS_HINTS,
  HOLD_BLISTERS_HINTS,
  HOLD_TOGETHER_HINTS,
  LEVER_BLISTERS_HINTS,
  LID_HINTS,
  MINE_HINTS,
  RUB_BLISTERS_HINTS,
  SWIPE_BLISTERS_HINTS,
  TAP_BLISTERS_HINTS,
  TURN_BLISTERS_HINTS,
} from "./hints/touch.js";
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
  theBlister: BLISTER_HINTS,
  tapBlisters: TAP_BLISTERS_HINTS,
  holdBlisters: HOLD_BLISTERS_HINTS,
  swipeBlisters: SWIPE_BLISTERS_HINTS,
  turnBlisters: TURN_BLISTERS_HINTS,
  rubBlisters: RUB_BLISTERS_HINTS,
  comboBlisters: COMBO_BLISTERS_HINTS,
  leverBlisters: LEVER_BLISTERS_HINTS,
  holdTogether: HOLD_TOGETHER_HINTS,
  theBeatbox: BEATBOX_HINTS,
  theMine: MINE_HINTS,
  theBalloon: BALLOON_HINTS,
  theLid: LID_HINTS,
  theChoir: CHOIR_HINTS,
  salvage: SALVAGE_HINTS,
  catchAndAim: CATCH_AND_AIM_HINTS,
  theHusk: HUSK_HINTS,
  theMorsel: MORSEL_HINTS,
  theSeeder: SEEDER_HINTS,
  theLance: LANCE_HINTS,
  theLeak: LEAK_HINTS,
} satisfies Record<string, readonly HintLine[]>;

/** The waves whose help is given on the field while they are played (`Wave.hints`). */
export type WaveHintsId = keyof typeof WAVE_HINTS;

/**
 * **The body a lesson is about, where the wave opens on another.** A hinted
 * wave stops teaching once one body has left the field (`HINTS_UNTIL`), and a
 * wave whose first body is a bulb it does not teach would stop before the one
 * it does had come: TAP's bulb, shot, would end TAP's lesson with no blister
 * yet up. Named here, only that kind counts — or, for a pod wave, a pod
 * swallowed or let go. Every other wave opens on the body it teaches, and any
 * body counts.
 */
export const HINTS_ABOUT: Partial<Record<WaveHintsId, CreatureKind | "pod">> = {
  tapBlisters: "blister",
  holdBlisters: "blister",
  swipeBlisters: "blister",
  turnBlisters: "blister",
  rubBlisters: "blister",
  comboBlisters: "blister",
  leverBlisters: "blister",
  salvage: "pod",
  catchAndAim: "pod",
  theHusk: "pod",
  theMorsel: "morsel",
  theSeeder: "seeder",
};

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
