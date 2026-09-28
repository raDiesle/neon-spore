import type { SimEvent } from "@neon-spore/sim";

/**
 * **The bosses' half of the silent list, the fifth page** — THE GOVERNOR's
 * fourteen, and the bosses after it.
 *
 * Opened on 27 September 2026 because page four stood at 235 lines and
 * THE GOVERNOR arrived with fourteen. Cut on the seam every page of this list
 * is cut on, the order the bosses were built in; `INGEST_SILENT` spreads it in
 * place, so every row still means *this event leaves nothing behind for the
 * next frame*.
 */
export const INGEST_SILENT_BOSS_E = [
  // THE GOVERNOR's fourteen, silent until its look lane draws them: the
  // needle, the pads and the hub are read off the state every frame.
  "governorEnter",
  "governorLight",
  "governorPlant",
  "governorSlip",
  "governorTick",
  "governorSkid",
  "governorHub",
  "governorRetap",
  "governorSway",
  "governorDim",
  "governorHit",
  "governorMiss",
  "governorSpent",
  "governorOut",
  // THE BULB QUEEN's thumb's three verdicts: a pry landed, a thumb come down
  // under `hold`, a press from the wrong seat. Each is a ring round the mark
  // it was on, `effects.boss.queen`'s (`queen-fx.ts`); what the mark does
  // next is her colour, read off the boss every frame.
  "queenPry",
  "queenHold",
  "queenRefuse",
] as const satisfies readonly SimEvent["type"][];
