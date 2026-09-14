import type { SimEvent } from "@neon-spore/sim";
import { type Cue, panForCol, pitchForRow } from "./bind.js";

/**
 * THE GUM's one, in a file of its own on `bind-balloon.ts`'s pattern, and
 * kept there for the three that left it.
 *
 * A gum cannot be shot, so nothing the ear gets from it is a shot landing:
 * what it reports is the **hand** — a swipe that sent it flying out of the
 * field along its row (`sim/gum.ts`). The pan is the gum's column, which is
 * the one thing the seat that did not swipe needs to hear, and the pitch is
 * the row it left from: high is early, low is a swipe that only just made it.
 *
 * The other end of the story is not here. A gum that reaches the ship is a
 * `breach` carrying the gum's own kind, and it is voiced with the breaches
 * (`bind-breach.ts`). It used to have four cues — taking hold of the ship, the
 * cannon refusing under it, the swipe off, and a wrong-way swipe spreading it
 * — and three went with the sticking on 14 September 2026.
 */
export function gumCue(
  e: Extract<SimEvent, { type: "gumFlung" }>,
  cols: number,
  rows: number,
): Cue | null {
  switch (e.type) {
    case "gumFlung":
      // Metal turning something aside, and it going off sideways: the shield's
      // deflection, reused for a body a hand sends out of the field the same way.
      return { id: "impact.deflect", pan: panForCol(e.col, cols), pitch: pitchForRow(e.row, rows) };
  }
}
