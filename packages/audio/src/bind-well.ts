import type { SimEvent } from "@neon-spore/sim";
import type { Cue } from "./bind-cue.js";

/**
 * THE WELL's four, in a file of their own for `bind-gauge.ts`'s reason —
 * `bind-choreographed-b.ts` is full — and, like that one, panned to the
 * middle rather than to a column. **Nothing this boss reports has a column in
 * it at all**, which is true of no other boss here: the seam is the one
 * sector of the face that holds none, and the roll is the whole face at once.
 * A pan would be a lie about where to look (`sim/events-well.ts`).
 *
 * Both seats hear all four, which is the rule and is also the point. She
 * cannot see the clock — she has the flat field — so the slip starting is the
 * only way she knows his columns have stopped meaning what they said, and the
 * held beat is a budget she can count down with him while he keeps his thumb
 * where it is.
 */
export function wellCue(
  e: Extract<SimEvent, { type: "wellRoll" | "wellHeld" | "wellWound" | "wellHome" }>,
): Cue {
  if (e.type === "wellRoll") return { id: "boss.wellRoll", pan: 0 };
  if (e.type === "wellHeld") return { id: "boss.wellHeld", pan: 0 };
  if (e.type === "wellWound") return { id: "boss.wellWound", pan: 0 };
  return { id: "boss.wellHome", pan: 0 };
}
