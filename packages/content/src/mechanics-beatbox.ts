import type { Mechanic } from "./mechanics.js";

/**
 * THE BEATBOX's row, cut out of `mechanics-table.ts` when it took that file
 * past its 250-line limit — on `creatures-beatbox.ts`'s own terms, the way
 * that file was cut out of `creatures-table.ts` for the identical reason.
 */
export const BEATBOX_MECHANIC = {
  what: "A small rounded soundbox that falls at half speed, swells on every beat and pushes rings of air out of itself. No shot touches it. Player 2 taps the body, once a beat, on the beat, as many times as it is asking for, and then takes the thumb off — every beat that lands grows an arm out of the rim, so the run is read off the body rather than off a number. It is finished by stopping: the moment a beat's window shuts with no tap in it the count is judged, and a tap that would take the run past the count is judged on the spot. Only player 1 is shown the number. Get it and the box goes quiet; miss it, over or under, and it goes red and puts a wave of sound down the field into the hull, and keeps falling, which is another run for whatever height is left.",
  reach: "spawn",
  // A wave names this kind and no colour, the way a wisp and a wall do; what
  // it authors instead is the count (`WaveEntry.beats`).
  waveNames: true,
} as const satisfies Mechanic;
