import type { SimEvent } from "@neon-spore/sim";
import { type Cue, panForCol } from "./bind.js";

/**
 * THE BLISTER's one, in a file of its own on `bind-gum.ts`' pattern: a blow
 * that counted (`sim/blister.ts`).
 *
 * The sound is THE GORGE's tap, *a shut bubble pressed*, because that is what
 * a blister is — a bubble of skin, and a thumb pressing it back down. Pitched
 * up a step for each blow struck, as the gorge's is, so the run is heard
 * closing on the last; the last is followed by the ordinary kill. The pan is
 * the pore's column, which is the one thing the seat that did not tap needs
 * to hear.
 */
export function blisterCue(e: Extract<SimEvent, { type: "blisterBlow" }>, cols: number): Cue {
  return {
    id: "boss.gorgeTap",
    pan: panForCol(e.col, cols),
    pitch: 1.2 - Math.min(e.left, 4) * 0.1,
  };
}
