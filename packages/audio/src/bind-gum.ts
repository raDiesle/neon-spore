import type { SimEvent } from "@neon-spore/sim";
import { type Cue, panForCol, pitchForRow } from "./bind.js";

/**
 * THE GUM's four, in a file of their own on `bind-balloon.ts`'s pattern.
 *
 * What holds the group together is that none of them is a shot landing: a gum
 * cannot be shot, so everything the ear gets from it is about the **ship** —
 * something taking hold of it, the cannon refusing under it, and the hand that
 * gets it off or makes it worse. The pan is the gum's column for all four,
 * which is the one thing player 2 has to say to player 1 and the one thing
 * player 1 has to hear to park the cannon.
 */
export function gumCue(
  e: Extract<SimEvent, { type: "gumStick" | "gumBlock" | "gumFlung" | "gumSpread" }>,
  cols: number,
  rows: number,
): Cue | null {
  switch (e.type) {
    case "gumStick":
      // "Something adhesive taking hold and not letting go" — written for
      // this creature back when it was a name, and the picture it describes is
      // the one on the field now.
      return { id: "creature.gumStick", pan: panForCol(e.col, cols) };
    case "gumBlock":
      // "The snap without the bolt. A mechanism moving against a lock." Spare
      // until now because the sim never reported a refused fire; this is the
      // one refusal it does report, and it is the sound player 2 hears when
      // their own thumb does nothing — the cannon is under the gum.
      return { id: "ship.fireBlocked", pan: panForCol(e.col, cols) };
    case "gumFlung":
      // Metal turning something aside, and it going off sideways: the shield's
      // deflection, reused for a body that leaves the ship the same way.
      return { id: "impact.deflect", pan: panForCol(e.col, cols), pitch: pitchForRow(e.row, rows) };
    case "gumSpread":
      // The same hold as the landing, lower: more of it took hold, and the
      // pair should hear that a swipe made it worse rather than better.
      return { id: "creature.gumStick", pan: panForCol(e.col, cols), pitch: 0.8 };
  }
}
