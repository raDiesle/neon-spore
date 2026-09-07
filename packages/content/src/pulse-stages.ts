import type { PulseStage } from "@neon-spore/sim";
import { pulseBarSteps, pulseBars } from "./pulse-steps.js";

/**
 * THE PULSE's stages — the charts, and so far there is one of them.
 *
 * **COLD START is the round's first stage and its whole teaching.** It is
 * twenty-four bars, one minute, and it is built the way an arcade's first
 * stage is: the pattern arrives before the speed does. Two bars of one body
 * every two beats, then one a beat, then pairs, and then a note every other
 * step — which at three steps to a beat is three against two, and is the first
 * thing in it that sounds alien rather than square.
 *
 * **There are four veiled arrivals in the whole minute, and that is the number
 * the owner asked for.** An earlier draft had nineteen of them, including two
 * bars where one seat was blind from end to end, and it made the round about
 * being read to rather than about playing. Four is a spice: bars 7 and 18 hide
 * one from player 1, bars 12 and 22 hide one from player 2, and each of them
 * lands in a bar the pair have already played through once — so the call is
 * the only new thing in it. Bar 12's is the hard one, sitting inside a run of
 * four consecutive steps, which means it has to be named a bar early.
 *
 * **The two jumps are deliberate and there are only two.** Two lanes on one
 * step is two thumbs at once, which a phone can just about do and which stops
 * being a rhythm as soon as it is common — so bar 16 has one and bar 24 ends
 * on the other, and neither of them is veiled. A jump nobody can read would be
 * a call with two words in it under a window of a hundred and fifty
 * milliseconds.
 *
 * The notation is `pulse-steps.ts`. Read a line as a bar: `L D U R` are the
 * lanes, `.` is a rest, a trailing `1` or `2` is the seat that cannot see it.
 */

/** Twenty-four bars. Three steps to a beat, so a bar is twelve of them. */
const COLD_START_BARS = [
  // One body every two beats. Nothing to do but find the buttons.
  "S  .  .   .  .  .   P  .  .   .  .  .",
  "S  .  .   .  .  .   P  .  .   .  .  .",
  // One a beat, and the four lanes have all been used by the end of it.
  "B  .  .   M  .  .   B  .  .   M  .  .",
  "S  .  .   P  .  .   B  .  .   M  .  .",
  // Pairs, so a hand learns to stay where it is.
  "S  .  .   S  .  .   B  .  .   B  .  .",
  "M  .  .   M  .  .   P  .  .   P  .  .",
  // The first veiled arrival, and everything around it is a bar the pair have
  // already played twice. One word, in a bar with room for it.
  "S  .  .   B1 .  .   M  .  .   P  .  .",
  "S  .  .   B  .  .   M  .  .   P  .  .",
  // Every other step: three notes against two beats, which is the first thing
  // in the stage that does not sit square on the click.
  "S  .  B   .  M  .   P  .  M   .  B  .",
  "S  .  B   .  M  .   P  .  M   .  B  .",
  "S  .  .   B  .  .   M  .  .   P  .  .",
  // Four consecutive steps, twice, and the second run has a veiled one in
  // the middle of it — the hard version of the call, because the naming has to
  // happen a bar early.
  "S  B  M   P  .  .   S  B  M2  P  .  .",
  // The cross-rhythm again and then turned round, which is the same bar
  // read backwards and is meant to be heard as one.
  "S  .  B   .  M  .   P  .  B   .  M  .",
  "P  .  M   .  B  .   S  .  M   .  B  .",
  "S  .  .   P  .  .   B  .  .   M  .  .",
  // The first jump, and a whole beat either side of it to find two thumbs.
  "SP .  .   .  .  .   BM .  .   .  .  .",
  "S  .  B   .  M  .   P  .  S   .  B  .",
  "M  .  P   .  S1 .   B  .  M   .  P  .",
  "S  B  .   M  P  .   S  B  .   M  P  .",
  "B  .  .   M  .  .   B  .  .   M  .  .",
  // The way out: square again, so the stage ends on something countable.
  "S  .  .   P  .  .   S  .  .   P  .  .",
  "B  .  .   M2 .  .   B  .  .   M  .  .",
  // Eight straight steps — the fastest thing in the stage, and readable by
  // both of them, because a run nobody can see is not a run, it is a guess.
  "S  B  M   P  S  B   M  P  .   .  .  .",
  "SP .  .   .  .  .   .  .  .   .  .  .",
];
export const COLD_START: PulseStage = {
  name: "COLD START",
  steps: pulseBarSteps(COLD_START_BARS),
  notes: pulseBars(COLD_START_BARS),
};

/**
 * What the wave authors. One stage today, and the shape is a list because the
 * second one is a line here rather than a change anywhere else — SNAKE's
 * arenas and PINBALL's boards are the same.
 */
export const PULSE_STAGES: PulseStage[] = [COLD_START];
