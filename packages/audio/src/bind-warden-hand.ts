import type { SimEvent } from "@neon-spore/sim";
import { type Cue, panForCol } from "./bind.js";

/**
 * THE WARDEN's second and third hands, in a file of their own because
 * `bind-warden.ts` holds the rope's four and is
 * `bind.ts`'s, which is full — and all three panned to the pupil's column,
 * because each is a hand on a thing in a lane the other seat cannot feel.
 *
 * The hold is the thumb landing: short, over by the next tick, because it is
 * player 1's cue that the lids are open and the pull is worth holding. The
 * throw is the hatch swinging to its stop: the moment player 2's three beats
 * start, and the one they cannot see the hand for. The slam is the window
 * gone — heavier than the throw and with nothing rising in it, so a late
 * shot is heard as late from the first beat (`sim/warden-hand.ts`).
 */
export function wardenHandCue(
  e: Extract<SimEvent, { type: "wardenHold" | "wardenThrow" | "wardenSlam" }>,
  cols: number,
): Cue {
  switch (e.type) {
    case "wardenHold":
      return { id: "boss.wardenHold", pan: panForCol(e.col, cols) };
    case "wardenThrow":
      return { id: "boss.wardenThrow", pan: panForCol(e.col, cols) };
    case "wardenSlam":
      return { id: "boss.wardenSlam", pan: panForCol(e.col, cols) };
  }
}
