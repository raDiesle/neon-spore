import type { SimEvent } from "@neon-spore/sim";

/**
 * **The bosses' half of the silent list, the fifth page** — THE HASP's story, THE SPOOL's, THE GOVERNOR's
 * fourteen, and the bosses after it.
 *
 * Opened on 27 September 2026 because page four stood at 235 lines and
 * THE GOVERNOR arrived with fourteen. Cut on the seam every page of this list
 * is cut on, the order the bosses were built in; `INGEST_SILENT` spreads it in
 * place, so every row still means *this event leaves nothing behind for the
 * next frame*.
 *
 * THE HASP's story came over on 29 September 2026, when THE SLING's cool
 * and THE GRINDSTONE's fade took page four within a line of the wall: the
 * last rows on the page go, never the boss being worked on. THE PLUMB's
 * twelve came from page three on 30 September 2026 by the same rule, when
 * THE GAUGE's tooth left that page at 250.
 */
export const INGEST_SILENT_BOSS_E = [
  // THE HASP's story between the hasps (`packages/audio/src/bind-hasp.ts`):
  // what the door does is read off its phase (`hasp-story.ts`), never off these.
  "haspRattle",
  "haspHush",
  "haspSlam",
  "haspBackspin",
  "haspCatch",
  "haspSpoke",
  "haspRust",
  "haspCrack",
  "haspBurst",
  "haspSway",
  "haspSteady",
  "haspRough",
  // THE SPOOL's story between the ribs (`sim/spool-story.ts`), here because
  // page three, where its twelve are, is full: silent until its look lane
  // draws the snag, the whip and the fray off the phase.
  "spoolSnag",
  "spoolFree",
  "spoolSnap",
  "spoolWhip",
  "spoolDamp",
  "spoolLash",
  "spoolFray",
  "spoolFeather",
  "spoolStrand",
  // THE PLUMB's twelve, from page three when THE GAUGE's tooth took it to the
  // wall: what outlives a frame is `plumb-fx.ts`, read above the loop.
  "plumbEnter",
  "plumbLight",
  "plumbDrift",
  "plumbSettle",
  "plumbSwing",
  "plumbCore",
  "plumbHit",
  "plumbSteady",
  "plumbDim",
  "plumbMiss",
  "plumbFree",
  "plumbOut",
  // THE GOVERNOR's fourteen: what outlives a frame is `governor-fx.ts`',
  // read above the loop.
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
  // THE GAUGE's tooth pulled, right or wrong: the rim redraws the gap
  // (`sim/gauge-tooth.ts`).
  "gaugePull",
  "gaugeWrongPull",
  // And the tongue wrung by both hands: its twist is drawn off the state
  // (`sim/gauge-tongue.ts`), and the round going on is the rest of it.
  "gaugeTwist",
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
  // And THE THROAT's, on the ring or the tube: a red ring round the part,
  // `effects.boss.blows.throatMarks`' (`throat-marks.ts`).
  "throatRefuse",
  // And THE UNDERTOW's, the pilot on her free: a red ring round it,
  // `effects.boss.undertow.marks`' (`undertow-marks.ts`).
  "undertowRefuse",
] as const satisfies readonly SimEvent["type"][];
