import type { SimEvent } from "@neon-spore/sim";

/**
 * **The bosses' half of the silent list, the fourth page** — THE SLING's
 * twelve, and the bosses after it.
 *
 * Opened on 26 September 2026 because page three stood at 242 lines and
 * THE SLING arrived with thirteen. Nothing was handed across: the page is cut
 * along the seam every page of this list is cut on, the order the bosses were
 * built in, and the SLING is simply the first boss built after page three
 * filled.
 *
 * `INGEST_SILENT` spreads every page in place, so the guard and the type it
 * narrows by are unchanged, and every row still means what it means there —
 * *this event leaves nothing behind for the next frame*.
 */
export const INGEST_SILENT_BOSS_D = [
  // THE MANTLE's story beats, landed after page three filled: the buckle,
  // the vent, the crosswise crack and the turn are read off the state each
  // frame, and nothing of them outlives one (`sim/mantle-story.ts`).
  "mantleBuckle",
  "mantleFlat",
  "mantleVent",
  "mantleSeal",
  "mantleCross",
  "mantleTurn",
  "mantleSwing",
  "mantleTurned",
  // THE KEEL's story beats, landed after page three filled: the flip, the
  // marrow and the cooldown are read off the state each frame, and nothing of
  // them outlives one (`sim/keel-story.ts`).
  "keelFlip",
  "keelArrest",
  "keelSnap",
  "keelMarrow",
  "keelSeal",
  "keelBurn",
  "keelCool",
  "keelFlare",
  // THE SLING's twelve: nothing is drawn yet, so nothing outlives a frame
  // (`packages/audio/src/bind-sling.ts`).
  "slingEnter",
  "slingLight",
  "slingSlack",
  "slingLoose",
  "slingSpring",
  "slingYoke",
  "slingHit",
  "slingSteady",
  "slingDim",
  "slingMiss",
  "slingFree",
  "slingOut",
  // THE GRINDSTONE's thirteen, the same (`packages/audio/src/bind-grindstone.ts`).
  "grindstoneEnter",
  "grindstoneLight",
  "grindstoneShave",
  "grindstoneClear",
  "grindstoneRegrit",
  "grindstoneBite",
  "grindstoneSlip",
  "grindstoneClamp",
  "grindstoneLoose",
  "grindstoneHit",
  "grindstoneMiss",
  "grindstoneFree",
  "grindstoneOut",
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
