/**
 * The three cells the deep-water pieces added, and nothing else.
 *
 * `cells.ts` holds the ten the six existing themes are played on, and none of
 * them is touched — decision 24, a candidate is added beside what is there
 * rather than on top of it. These three are here because `deep.ts` needs
 * something the ten cannot do: a body that will not hold a note.
 *
 * The same rule applies as next door. Every one is built from `grain.ts`, so a
 * theme sounds like this game rather than like music laid over it, and every
 * one is placed **outside the speech band on purpose** — bodies under 300 Hz,
 * sparkle over 3 kHz, the hole in the middle left alone. `test/deep.test.ts`
 * checks that hole directly rather than through a seconds budget: for these
 * three, no voice puts its energy in 300–3000 Hz at any moment of its life, at
 * any pitch the arrangements ask for.
 */

import { burst, soft, tick } from "../grain.js";
import type { Layer, SoundDef } from "../types.js";

const cell = (id: string, blurb: string, use: string, level: number, layers: Layer[]) =>
  ({ id: `music.${id}`, family: "music", blurb, status: "spare", use, level, layers }) as SoundDef;

/** A low sine that arrives, bends, and leaves without settling. */
const glideSine = (
  from: number,
  to: number,
  seconds: number,
  gain: number,
  cents: number,
): Layer => ({
  source: "sine",
  freq: from,
  toFreq: to,
  glide: "exp",
  gain,
  attack: seconds * 0.42,
  hold: seconds * 0.12,
  release: seconds * 0.46,
  wobble: { rate: 0.23, cents },
});

/**
 * The body of a piece with no beat in it. The two halves move in opposite
 * directions — the root rises a whole tone while the fifth above it sinks a
 * semitone — so the interval between them opens across the note and the pair
 * never lands on a chord. That contrary motion is the drift written inside one
 * cell, before any arrangement gets to it.
 *
 * Six seconds long, which is not a mood: `deep.ts` hides TIDE's loop point by
 * letting the last swell's tail run past it, and the tail is this number.
 */
export const SURGE = cell(
  "surge",
  "A low tone rising a whole tone over six seconds while the fifth above it sinks.",
  "The body of a piece with no beat in it — water, rather than a bass line.",
  0.3,
  [glideSine(55, 61.7, 6, 0.5, 16), soft(0.45, glideSine(82.5, 77.8, 6, 0.5, 11))],
);

/** A bell that bends as it fades, the way a light does through moving water. */
export const GLIMMER = cell(
  "glimmer",
  "A high bell that bends upward a little as it fades, never quite where it started.",
  "The sparkle over a piece that is not on a grid.",
  0.26,
  [
    {
      source: "sine",
      freq: 3520,
      toFreq: 3760,
      glide: "exp",
      gain: 0.5,
      attack: 0.004,
      release: 1.6,
    },
  ],
);

/** A handful of dry grains, thrown and settling. Rhythm with no body under it. */
export const SPECK = cell(
  "speck",
  "Six dry grains thrown at once and settling over a fifth of a second.",
  "Fluid made of grain rather than tone — movement without a pulse in it.",
  0.3,
  [burst(tick(0.5, 0, 7400), 6, 0.033, 0.76)],
);

/** Every cell these three pieces add. The ten beside them are untouched. */
export const DEEP_CELLS: readonly SoundDef[] = [SURGE, GLIMMER, SPECK];
