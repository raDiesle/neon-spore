import type { SimEvent } from "@neon-spore/sim";
import { type Cue, panForCol } from "./bind.js";

/**
 * THE THROAT's two hands on the gullet itself, in a file of their own for
 * `bind-vane.ts`' reason — `bind.ts` is full — and all three panned to the
 * column the mouth is standing in, because the tube is a fixture and its
 * column is the one thing in the fight the pair says out loud.
 *
 * The cinch is the gullet held shut: a soft close with the breath stopping in
 * it, because what it buys is silence from a thing that was about to swallow.
 * The slip is that gone — the same close let go, with the draw coming back, so
 * a thumb lifted and a ring torn out are one loss whichever it was
 * (`sim/throat-hand.ts`). The haul is the tube dragged sideways: wet weight
 * moving, and the pilot's cue that the column she just named is no longer the
 * one under the mouth.
 */
export function throatCue(
  e: Extract<SimEvent, { type: "throatCinch" | "throatSlip" | "throatHaul" }>,
  cols: number,
): Cue {
  switch (e.type) {
    case "throatCinch":
      return { id: "boss.throatCinch", pan: panForCol(e.col, cols) };
    case "throatSlip":
      return { id: "boss.throatSlip", pan: panForCol(e.col, cols) };
    case "throatHaul":
      return { id: "boss.throatHaul", pan: panForCol(e.col, cols) };
  }
}
