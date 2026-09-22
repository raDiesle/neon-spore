import type { Wave } from "../wave-types.js";

/**
 * Act eleven, opened for THE SPOOL on 22 September 2026 — `act-10.ts` had
 * twenty-nine lines left under the 250-line ceiling, which is one wave with
 * its argument written above it and nothing after (`waves.ts`).
 *
 * **THE SPOOL is the first boss whose question is whether you can let it
 * run.** Every other boss in the game is answered by doing something: a shot,
 * a shove, a stroke, a turn. This one is answered by choosing how *fast* a
 * thing that is already happening should happen, and holding that choice
 * still while the other seat reads out whether it is right — so the whole
 * fight is a number nobody is shown whole (`sim/spool.ts`).
 *
 * **The split is the gauge.** The pilot holds the brake and is shown nothing
 * but the mark's own grip: no rate, no length, no zone, ever. The navigator
 * is shown how much line should be out by now against how much is, and has
 * no way to touch the brake. `SplitGauge`, a third time after THE SINEW's
 * strain band and THE SURGE's seam, and the first time the two halves are a
 * *speed* rather than an amount — which is why saying it is hard: a pair can
 * point at an amount and has to describe a rate.
 *
 * **Its health is four wooden ribs that ease open, and never crack.** The
 * fight has one hull cost in it, a rock thrown down the pilot's own column
 * when the line slips a second time, and its finish is the only calm one in
 * the game: the line goes slack and the spool drifts free.
 */
export const WAVES_ACT_11: Wave[] = [
  {
    id: "theSpool",
    name: "THE SPOOL",
    sentence: "The one where the line runs out at the speed one of you reads.",
    guide: {
      both: "A spool at the top pays a line down to the hull. One of you brakes it, the other reads how much should be out. Hold it right and a rib eases. Four ribs.",
      p1: "1. The brake is yours. Hold it at a depth.\n2. Shallow lets the line run. Deep slows it. No hand at all runs fastest.\n3. You are shown nothing but your own grip. Ask them.",
      p2: "1. You see how much line should be out, and how much is.\n2. Say faster or slower, and keep saying it.\n3. Drift out of the band and the leg starts again. Twice over, a rock comes down their column.",
    },
    entries: [],
    boss: { kind: "spool" },
    bossType: "normal",
  },
];
