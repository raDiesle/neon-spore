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
] as const satisfies readonly SimEvent["type"][];
