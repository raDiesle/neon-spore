import type { SimEvent } from "@neon-spore/sim";
import { type Cue, panForCol } from "./bind.js";

/**
 * THE LIMPET's and THE LEECH's three, in a file of their own on `bind-gum.ts`'s
 * pattern.
 *
 * Everything the ear gets from these is about a **control**: something taking
 * hold of it, the grip letting go — and the blast, which the breach it causes
 * has already sounded (`bind-breach.ts`), so what is added here is the crack of
 * the body itself. The pan is the control's column throughout.
 *
 * **There were four.** `clingShake` sounded the rail's detent climbing a move
 * at a time, and it went with the shake on 15 September 2026 when these two
 * stopped being creatures a wave spawns. Nothing took its place and nothing
 * should: under a fault a move is not progress toward getting the body off, it
 * is the whole of what the pair has to keep doing, and a sound on every one of
 * them would be a sound on every beat of the wave.
 */
export function clingCue(
  e: Extract<SimEvent, { type: "clingGrip" | "clingFreed" | "clingBlast" }>,
  cols: number,
): Cue | null {
  switch (e.type) {
    case "clingGrip":
      // The barb going in — the dock, a little lower for the plate than for the
      // cannon, so the two grips are two sounds.
      return {
        id: "creature.chokeDock",
        pan: panForCol(e.col, cols),
        pitch: e.kind === "limpet" ? 0.85 : 1.1,
      };
    // Reeled home: the line going taut and the body coming off with it.
    case "clingFreed":
      return { id: "impact.deflect", pan: panForCol(e.col, cols) };
    case "clingBlast":
      return { id: "hull.crack", pan: panForCol(e.col, cols) };
  }
}
