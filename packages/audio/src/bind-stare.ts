import type { SimEvent } from "@neon-spore/sim";
import type { Cue } from "./bind.js";

/**
 * THE STARE's three, in a file of their own for `bind-gorge.ts`' reason,
 * and with one thing the others do not have: **no pan on any of them.** The
 * eye is in the sky rather than in a lane, and a sound placed in a column
 * would be telling the pair to look somewhere — the one thing that is never
 * what went wrong.
 *
 * The catch is the one sound in the game that means *that was you*. The lid's
 * two are the moments of it: the shut is the bottom reached, which is the
 * watched seat freed; the open is the lid starting back up, pitched down when
 * the eye forced it, so the ear can tell a thumb letting go from a thumb that
 * lost (`sim/stare-hand.ts`).
 */
export function stareCue(
  e: Extract<SimEvent, { type: "stareCaught" | "stareShut" | "stareOpen" }>,
): Cue {
  switch (e.type) {
    case "stareCaught":
      return { id: "boss.stareCaught" };
    case "stareShut":
      return { id: "boss.stareShut" };
    case "stareOpen":
      return { id: "boss.stareOpen", pitch: e.forced ? 0.85 : 1 };
  }
}
