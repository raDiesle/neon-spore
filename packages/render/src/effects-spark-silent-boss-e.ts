import type { SimEvent } from "@neon-spore/sim";

/**
 * **The bosses' half of the not-a-burst list, the fifth page**, opened on
 * 1 October 2026 for THE LAMPREY with page four at 234 lines — the seam every
 * page of this list is cut on (`effects-spark-silent-boss-d.ts`).
 *
 * `SILENT` spreads this in place after page four, so `isSilent` still
 * narrows and `burstFor`'s `assertNever` still catches an event named on
 * neither.
 */
export const SILENT_BOSS_E = [
  // THE LAMPREY's thirteen, no burst from this table: each is thrown above
  // the loop by its own fx file (`lamprey-fx.ts`).
  "lampreyEnter",
  "lampreyBite",
  "lampreyCrack",
  "lampreySnap",
  "lampreyCrawl",
  "lampreyGnaw",
  "lampreyFull",
  "lampreyLoose",
  "lampreyRear",
  "lampreyHit",
  "lampreyLunge",
  "lampreySpent",
  "lampreyOut",
  // THE MIMIC's thirteen, no burst from this table either: each is thrown
  // above the loop by its own fx file (`mimic-fx.ts`).
  "mimicEnter",
  "mimicSign",
  "mimicChange",
  "mimicPeel",
  "mimicWrong",
  "mimicLapse",
  "mimicReach",
  "mimicRoll",
  "mimicCore",
  "mimicHit",
  "mimicClose",
  "mimicSpent",
  "mimicOut",
] as const satisfies readonly SimEvent["type"][];
