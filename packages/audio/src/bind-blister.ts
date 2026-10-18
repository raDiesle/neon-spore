import type { SimEvent } from "@neon-spore/sim";
import { type Cue, panForCol } from "./bind.js";

/**
 * THE BLISTER's one, in a file of its own on `bind-balloon.ts`' pattern: the
 * blow that knocked it out (`sim/blister.ts`).
 *
 * The sound is THE GORGE's tap, *a shut bubble pressed*, because that is what
 * a blister is — a bubble of skin, and a thumb pressing it back down. At the
 * pitch the last of a run of blows had while a blister took several (until
 * 15 October 2026), and followed by the ordinary kill. The pan is
 * the pore's column, which is the one thing the seat that did not tap needs
 * to hear.
 */
export function blisterCue(e: Extract<SimEvent, { type: "blisterBlow" }>, cols: number): Cue {
  // A BOTH blister's blow, both hands landed: the grab doubled and briefly in
  // tune, THE WEIGHT's sound, the one word either seat gets that the other's
  // thumb was down (`sounds/grip.ts`).
  if (e.both === true) return { id: "ship.gripBoth", pan: panForCol(e.col, cols) };
  return {
    id: "boss.gorgeTap",
    pan: panForCol(e.col, cols),
    pitch: 1.2,
  };
}
