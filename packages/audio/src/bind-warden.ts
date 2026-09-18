import type { SimEvent } from "@neon-spore/sim";
import { type Cue, panForCol, pitchForRow } from "./bind.js";

/**
 * THE WARDEN's four, cut out of `bind.ts` when THE BATON took that file past
 * its 250-line limit — along the seam the boss already has: a rope, a door, a
 * plate, and the last plate. Moved whole; every comment is the one that stood
 * beside its case before. THE BULB QUEEN's two joined them when her flinch
 * took `bind.ts` past the limit again: the two bosses already share a sound.
 */
export function wardenCue(
  e: Extract<
    SimEvent,
    { type: "tether" | "eyeOpen" | "plate" | "wardenDown" | "queenDown" | "queenFlinch" }
  >,
  cols: number,
  rows: number,
): Cue {
  switch (e.type) {
    case "tether":
      // A rope coming down out of the rim. Both screens hear it, and only one
      // of them has a hand free to answer it.
      return { id: "boss.wardenTether", pan: panForCol(e.col, cols) };
    case "eyeOpen":
      // The one cue written for this boss: a door in something enormous. It
      // fires when the rope comes fully taut, which is the moment player 2 has
      // been waiting on and cannot feel.
      return { id: "boss.warden", pan: panForCol(e.col, cols) };
    case "plate":
      return {
        id: "boss.wardenPlate",
        pan: panForCol(e.col, cols),
        pitch: pitchForRow(e.row, rows),
      };
    case "wardenDown":
    case "queenDown":
      return { id: "boss.queenDown", pan: panForCol(e.col, cols) };
    case "queenFlinch":
      // Her flinch is her shut, a beat early and on the wrong mark: the same
      // sound the mixer plays when a bloom closes (`mixer-boss.ts`), because
      // what happened is that it closed.
      return { id: "boss.queenShut", pan: panForCol(e.col, cols) };
  }
}
