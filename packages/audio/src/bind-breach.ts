import type { SimEvent } from "@neon-spore/sim";
import { type Cue, panForCol } from "./bind.js";

/**
 * **What a hull breach sounds like**, split by what hit rather than by what
 * it cost — every hit costs the same since 12 September 2026, the wave
 * (`sim/wave-fail.ts`), and what the pair still needs to hear is whether a
 * rock went through the plate or a body brushed it.
 *
 * Its own file on `bind-volley.ts`'s terms — `bind.ts` is at its limit. The
 * split used to be on the hull points a breach carried, and for as long as
 * the cue read those as thousandths the heavy one — *the plate going, a long
 * low tear with the room shaking after it* — had never been heard in the
 * running game. The event carries the weight itself now
 * (`sim/hull-damage.ts`), and there is no unit to get wrong.
 */
export function breachCue(e: Extract<SimEvent, { type: "breach" }>, cols: number): Cue {
  return {
    id: e.weight === "heavy" ? "hull.breachHeavy" : "hull.breachLight",
    pan: panForCol(e.col, cols),
  };
}
