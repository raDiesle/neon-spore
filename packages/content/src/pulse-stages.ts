import type { PulseStage } from "@neon-spore/sim";
import { pulseBarSteps, pulseBars } from "./pulse-steps.js";

/**
 * THE PULSE's stages — the charts, and so far there is one of them.
 *
 * **COLD START is the round's first stage and its whole teaching.** It is
 * thirty-two bars, eighty seconds, and it is built the way an arcade's first
 * stage is: the pattern arrives long before the speed does. Four bars of one
 * body a bar, eight of one every two beats, eight of one a beat, and only in
 * the last third a note every other step — which at three steps to a beat is
 * three against two, and is the first thing in it that sounds alien rather
 * than square.
 *
 * **The ramp is that long because the owner asked for a much slower start**,
 * and the tempo could not give it to him: the grid is three steps to the
 * game's own 96 BPM beat and that beat is shared with every wave, so the only
 * place a round can be made slower is its chart. The stage it replaced put one
 * body on every beat by its third bar and a cross-rhythm by its ninth; this one
 * spends its first four bars introducing the four bodies one at a time, with a
 * whole bar of silence around each, and does not put a note off the beat until
 * bar twenty-one. Everything the old chart taught is still taught and the
 * ending is as fast as it ever was — the climb is simply eight bars longer than
 * the whole of the old stage.
 *
 * **There are four veiled arrivals in the whole stage, and that is the number
 * the owner asked for.** An earlier draft had nineteen of them, including two
 * bars where one seat was blind from end to end, and it made the round about
 * being read to rather than about playing. Four is a spice: bars 10 and 24 hide
 * one from player 1, bars 16 and 28 hide one from player 2, and each of them
 * lands in a bar the pair have already played through once — so the call is
 * the only new thing in it. Bar 28's is the hard one, sitting inside a run of
 * four consecutive steps, which means it has to be named a bar early.
 *
 * **The two jumps are deliberate and there are only two.** Two lanes on one
 * step is two thumbs at once, which a phone can just about do and which stops
 * being a rhythm as soon as it is common — so bar 26 has one and bar 32 ends
 * on the other, and neither of them is veiled. A jump nobody can read would be
 * a call with two words in it under a window of a hundred and fifty
 * milliseconds.
 *
 * The notation is `pulse-steps.ts`. Read a line as a bar: `S B M P` are the
 * lanes, `.` is a rest, a trailing `1` or `2` is the seat that cannot see it.
 */

/** Thirty-two bars. Three steps to a beat, so a bar is twelve of them. */
const COLD_START_BARS = [
  // One body a bar, and each of the four alone, so the first thing the pair do
  // is find one button with a whole bar of quiet around it.
  "S  .  .   .  .  .   .  .  .   .  .  .",
  "P  .  .   .  .  .   .  .  .   .  .  .",
  "B  .  .   .  .  .   .  .  .   .  .  .",
  "M  .  .   .  .  .   .  .  .   .  .  .",
  // One every two beats. Still two beats of nothing between any two presses.
  "S  .  .   .  .  .   P  .  .   .  .  .",
  "B  .  .   .  .  .   M  .  .   .  .  .",
  "S  .  .   .  .  .   B  .  .   .  .  .",
  "M  .  .   .  .  .   P  .  .   .  .  .",
  // The first veiled arrival, and it is the sparsest bar in the stage: a
  // repeat of bar 5, one word, two beats of room to say it in.
  "S  .  .   .  .  .   P  .  .   .  .  .",
  "S  .  .   .  .  .   P1 .  .   .  .  .",
  "B  .  .   .  .  .   M  .  .   .  .  .",
  "B  .  .   .  .  .   M  .  .   .  .  .",
  // One a beat, and the four lanes have all been used by the end of it.
  "S  .  .   P  .  .   B  .  .   M  .  .",
  "S  .  .   P  .  .   B  .  .   M  .  .",
  "M  .  .   B  .  .   P  .  .   S  .  .",
  // The second veil, in the bar just played, and player 2's first.
  "M  .  .   B2 .  .   P  .  .   S  .  .",
  // Pairs, so a hand learns to stay where it is. Still one a beat.
  "S  .  .   S  .  .   B  .  .   B  .  .",
  "M  .  .   M  .  .   P  .  .   P  .  .",
  "S  .  .   S  .  .   P  .  .   P  .  .",
  "B  .  .   M  .  .   B  .  .   M  .  .",
  // Two thirds of the way in, the first note that is not on a beat. Every
  // other step: three notes against two beats.
  "S  .  B   .  M  .   P  .  M   .  B  .",
  "S  .  B   .  M  .   P  .  M   .  B  .",
  // Square again, and the third veil sits in the repeat of it.
  "S  .  .   B  .  .   M  .  .   P  .  .",
  "S  .  .   B1 .  .   M  .  .   P  .  .",
  // The cross-rhythm turned round, which is the bar above read backwards and
  // is meant to be heard as one with it.
  "P  .  M   .  B  .   S  .  M   .  B  .",
  // The first jump, and a whole beat either side of it to find two thumbs.
  "SP .  .   .  .  .   BM .  .   .  .  .",
  // Four consecutive steps, twice, and the second time round it carries the
  // last veil — the hard version of the call, because the naming has to happen
  // a bar early.
  "S  B  M   P  .  .   S  B  M   P  .  .",
  "S  B  M   P  .  .   S  B  M2  P  .  .",
  // The way out.
  "S  .  B   .  M  .   P  .  S   .  B  .",
  "B  .  .   M  .  .   B  .  .   M  .  .",
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
