import type { Mechanic } from "./mechanics.js";

/**
 * THE BLISTER's row, beside `mechanics-beatbox.ts` and for its reason:
 * `mechanics-table.ts` is near its limit.
 */
export const BLISTER_MECHANIC = {
  what: "It comes up out of a pore, stays a beat or two, and sinks. One of you taps it while it is up. The other sees where next.",
  reach: "spawn",
  // A wave names the kind, the column and row of its first pore, whose hand
  // knocks it down and how many blows it takes (`WaveEntry.by`, `count`).
  // Where it comes up after that is the rng's, which is the point: the pair
  // cannot learn the wave, only the talking.
  waveNames: true,
} as const satisfies Mechanic;
