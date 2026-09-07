import type { Mechanic } from "./mechanics.js";

/**
 * THE BEATBOX's row, cut out of `mechanics-table.ts` when it took that file
 * past its 250-line limit — on `creatures-beatbox.ts`'s own terms, the way
 * that file was cut out of `creatures-table.ts` for the identical reason.
 */
export const BEATBOX_MECHANIC = {
  what: "A rounded soundbox that swells on every beat and asks for a number of them. No shot touches it. Player 2 taps the body itself, once a beat, on the beat, as many times as it is asking for, and then takes the thumb off — a run is finished by stopping, so the first beat that goes by untapped is the beat the count is judged on. Only player 1 is shown the number. Get it and the box goes quiet; miss it, over or under, and it puts a wave of sound through the hull and keeps falling, which is another run for whatever height is left.",
  reach: "spawn",
  // A wave names this kind and no colour, the way a wisp and a wall do; what
  // it authors instead is the count (`WaveEntry.beats`).
  waveNames: true,
} as const satisfies Mechanic;
