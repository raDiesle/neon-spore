import type { GuideScene } from "../scene-types.js";

/**
 * THE CRAWLER's rehearsal: nothing is falling, and standing still loses it.
 *
 * Every arrival before this one comes down a column and is answered before it
 * reaches the hull. A worm comes over a side wall and walks the ship
 * lengthways, costing nothing at all while it walks (`sim/crawler.ts`) — so the
 * first page is the fact, and it has no hand on it, because the mistake this
 * creature is built around is a pair who watch it and wait.
 *
 * Its rings are the rest of the film. A coloured one wants the matching cannon
 * under it — the pilot's column, the navigator's trigger — and an armoured one
 * wants the dome, which is the two of them the other way round. **Two segments
 * is one of each**, the shortest worm the simulation will build, and it is
 * enough: the lesson is that the answer changes ring by ring, and a pair who
 * have swapped once know they will swap again.
 */
export const THE_CRAWLER: GuideScene = {
  ticks: 1320,
  bpm: 120,
  seed: 1,
  entries: [{ beat: 1, col: 0, kind: "crawler", color: null, segments: 2, side: "left" }],
  acts: [
    { tick: 660, control: "cannon", col: 3 },
    { tick: 900, control: "fireRed" },
    { tick: 1080, control: "shield", col: 5, atBody: true },
    { tick: 1100, control: "guard" },
  ],
  steps: [
    { tick: 0, seat: 2, text: "IT WALKS · IT NEVER FALLS", anchor: { at: "body" } },
    {
      tick: 540,
      seat: 1,
      text: "CANNON UNDER A COLOUR RING",
      anchor: { at: "control", control: "cannon" },
    },
    {
      tick: 780,
      seat: 2,
      text: "FIRE THE COLOUR IT WEARS",
      anchor: { at: "control", control: "fireRed" },
    },
    {
      tick: 1000,
      seat: 1,
      text: "A PLATE RING WANTS GUARD",
      anchor: { at: "control", control: "guard" },
    },
  ],
};
