import type { SimEvent } from "@neon-spore/sim";

/**
 * **The bosses' half of the not-a-burst list, the fourth page** — THE CYST's
 * fourteen, THE DAVIT's thirteen, and THE KEEL's story beats.
 *
 * Cut off `effects-spark-silent-boss-c.ts` on 26 September 2026, when THE
 * KEEL's flip, marrow and cooldown arrived with eight and page three stood at
 * 246 lines. The seam is the one every page of this list is cut on: the
 * **last** bosses on the full page are handed across whole, with their own
 * comments, and the boss being worked on stays under the comment that argues
 * it — its story beats open this page only because its first sixteen stay
 * where they are.
 *
 * `SILENT` spreads this in place after page three, so `isSilent` still
 * narrows and `burstFor`'s `assertNever` still catches an event named on
 * neither.
 */
export const SILENT_BOSS_D = [
  // THE KEEL's story beats, no burst from this table: the flip, the marrow
  // and the cooldown are read off the state each frame (`sim/keel-story.ts`).
  "keelFlip",
  "keelArrest",
  "keelSnap",
  "keelMarrow",
  "keelSeal",
  "keelBurn",
  "keelCool",
  "keelFlare",
  // THE CYST's fourteen, the same (`packages/audio/src/bind-cyst.ts`).
  "cystEnter",
  "cystLight",
  "cystStill",
  "cystShudder",
  "cystSlip",
  "cystCrack",
  "cystSpring",
  "cystBare",
  "cystHit",
  "cystGuard",
  "cystSeal",
  "cystMiss",
  "cystSplit",
  "cystOut",
  // THE DAVIT's thirteen, the same (`packages/audio/src/bind-davit.ts`).
  "davitEnter",
  "davitLight",
  "davitDrift",
  "davitSlack",
  "davitLoose",
  "davitSway",
  "davitPivot",
  "davitHit",
  "davitReland",
  "davitDim",
  "davitMiss",
  "davitSpent",
  "davitOut",
] as const satisfies readonly SimEvent["type"][];
