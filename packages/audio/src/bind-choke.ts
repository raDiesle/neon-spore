import type { SimEvent } from "@neon-spore/sim";
import { type Cue, panForCol } from "./bind.js";

/**
 * THE CHOKE's three, in a file of their own on `bind-gum.ts`'s pattern.
 *
 * None of them is a shot landing either: everything the ear gets from this
 * creature is about the **cannon** — something taking hold of it, a thumb
 * working at the grip, and the grip letting go. The pan is the cannon's
 * column for all three, which is the number player 2 needs and player 1 has
 * stopped watching.
 */
export function chokeCue(
  e: Extract<SimEvent, { type: "chokeGrip" | "chokeTap" | "chokeFreed" }>,
  cols: number,
): Cue | null {
  switch (e.type) {
    case "chokeGrip":
      // "A clamp closing over a control, and the control going dead under
      // it" — written for this creature back when it was a name, and the
      // picture it describes is the one on the strip now.
      return { id: "creature.chokeDock", pan: panForCol(e.col, cols) };
    case "chokeTap":
      // The rail's own detent, because the thumb is on the rail — and a
      // little higher every tap, from a fifth below the step's pitch to a
      // fifth above it, so a pair counting out loud hears the count climb
      // and a pair that has stopped tapping hears that it has stopped.
      return {
        id: "ship.cannonStep",
        pan: panForCol(e.col, cols),
        pitch: 0.8 + (0.6 * e.taps) / Math.max(1, e.of),
      };
    case "chokeFreed":
      // Metal turning something aside and it going off: the gum's leaving,
      // reused for the other body that leaves the ship without dying.
      return { id: "impact.deflect", pan: panForCol(e.col, cols) };
  }
}
