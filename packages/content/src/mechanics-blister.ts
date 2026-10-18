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

/**
 * A blister set to BOTH, and the thing HOLD TOGETHER teaches: each seat
 * finishes the gesture before it goes, and a HOLD counts only while both
 * thumbs are on it (`sim/blister.ts`, `blisterDealt`). It took THE WEIGHT's
 * place on 18 October 2026, the owner's — *configure for all controls
 * enemies which player needs to succeed it*.
 */
export const BLISTER_BOTH_MECHANIC = {
  what: "A blister marked for both of you. Each of you does the gesture. A HOLD counts only while both thumbs are on it at once.",
  reach: "spawn",
} as const satisfies Mechanic;
