import type { Mechanic } from "./mechanics.js";

/**
 * THE BEATBOX's row, cut out of `mechanics-table.ts` when it took that file
 * past its 250-line limit — on `creatures-beatbox.ts`'s own terms, the way
 * that file was cut out of `creatures-table.ts` for the identical reason.
 */
export const BEATBOX_MECHANIC = {
  what: "A soundbox falls. No shot touches it. Player 1 sees a number. Player 2 taps it that many times, one tap a beat, then stops.",
  reach: "spawn",
  // A wave names this kind and no colour, the way a wisp and a wall do; what
  // it authors instead is the count (`WaveEntry.beats`).
  waveNames: true,
} as const satisfies Mechanic;
