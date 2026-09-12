import type { SimEvent } from "@neon-spore/sim";
import { type Cue, panForCol } from "./bind.js";

/**
 * THE LIMPET's and THE LEECH's four, in a file of their own on
 * `bind-gum.ts`'s pattern.
 *
 * Everything the ear gets from these is about a **control**: something
 * taking hold of it, a move shaking the grip, the grip letting go — and the
 * blast, which the breach it causes has already sounded (`bind-breach.ts`),
 * so what is added here is the crack of the body itself. The pan is the
 * control's column throughout, which is the number the seat with the fuse
 * is about to say.
 */
export function clingCue(
  e: Extract<SimEvent, { type: "clingGrip" | "clingShake" | "clingFreed" | "clingBlast" }>,
  cols: number,
): Cue | null {
  switch (e.type) {
    case "clingGrip":
      // The clamp closing over a control — the dock, a little lower
      // for the plate than for the cannon, so the two grips are two sounds.
      return {
        id: "creature.chokeDock",
        pan: panForCol(e.col, cols),
        pitch: e.kind === "limpet" ? 0.85 : 1.1,
      };
    case "clingShake":
      // The rail's detent, climbing a move at a time: a
      // pair moving on every beat hears the count go up.
      return {
        id: "ship.cannonStep",
        pan: panForCol(e.col, cols),
        pitch: 0.8 + (0.6 * e.moves) / Math.max(1, e.of),
      };
    case "clingFreed":
      return { id: "impact.deflect", pan: panForCol(e.col, cols) };
    case "clingBlast":
      return { id: "hull.crack", pan: panForCol(e.col, cols) };
  }
}
