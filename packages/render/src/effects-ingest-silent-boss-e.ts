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
  // THE MIRROR's two, the same: a step on one of its lobes judged, and a press
  // on a lobe the round asks of the other seat. Each is a ring round the lobe,
  // `effects.boss.mirror.grip`'s (`mirror-grip.ts`).
  "mirrorTouch",
  "mirrorRefuse",
  // THE VANE's press from the wrong seat, the same: a ring round the arm or
  // the housing, `effects.boss.vane`'s (`vane-marks.ts`).
  "vaneRefuse",
  // And THE MAZE's, on the heart or the string: a ring round the part,
  // `effects.boss.maze`'s (`maze-grip-fx.ts`, `maze-marks.ts`).
  "mazeRefuse",
  // And THE GAUGE's thumb landing on its needle or band: a green ring round
  // the part, `effects.boss.gauge`'s (`gauge-marks.ts`).
  "gaugeHold",
  // And THE FLEET's thumb landing on its wound: a green ring round that seat's
  // own ring, `effects.boss.fleetGrip.marks`' (`fleet-grip-marks.ts`).
  "fleetHold",
  // And SNAKE's refused press on the jaws or the tail: a red ring round the
  // part, `effects.boss.snake`'s (`snake-marks.ts`).
  "snakeRefuse",
  // And PINBALL's, on the plunger or the table: a red ring round the part,
  // `effects.boss.pinball`'s (`pinball-marks.ts`).
  "pinRefuse",
  // And THE SCOUT's, on the line or the prime: a red ring round the part,
  // `effects.boss.scout`'s (`scout-marks.ts`).
  "scoutRefuse",
] as const satisfies readonly SimEvent["type"][];
