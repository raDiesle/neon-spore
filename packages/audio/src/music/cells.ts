/**
 * The instruments a theme is played on.
 *
 * They are `SoundDef`s, and deliberately not in `CATALOGUE`: the catalogue's
 * `spare` means "built, and something could claim it tomorrow", and a bass
 * note is not a thing the game will ever trigger. It is half a chord. Keeping
 * them out leaves the catalogue meaning what the SOUND tab says it means.
 *
 * Every one of them is built from `grain.ts` — the same bells and sub-sines
 * the rest of the game is made of, so a theme sounds like this game rather
 * than like music laid over it. And every one of them is placed **outside the
 * speech band on purpose**: bodies under 300 Hz, sparkle over 3 kHz, the hole
 * in the middle left alone. `test/music.test.ts` fails a cell that drifts in.
 *
 * The pitches are the low end of A minor — A1 at 55 Hz for the bass, A7 at
 * 3520 Hz for the bells — so the two halves of the palette are seven octaves
 * apart and the voice sits in the gap.
 */

import { air, chime, glint, metal, soft, spore, sub, swell, thud, tick } from "../grain.js";
import type { SoundDef } from "../types.js";

const cell = (id: string, blurb: string, use: string, level: number, layers: SoundDef["layers"]) =>
  ({ id: `music.${id}`, family: "music", blurb, status: "spare", use, level, layers }) as SoundDef;

/** A low sine that lands and goes. The pulse under a piece. */
export const HEART = cell(
  "heart",
  "One soft low sine, landing and gone in half a second.",
  "The beat of a piece, felt rather than heard.",
  0.5,
  [sub(55, 0.5, 0.55), soft(0.35, sub(110, 0.3, 0.4))],
);

/**
 * A bass note with a body: a saw with everything above 220 Hz taken off.
 *
 * The cutoff is low even for this palette because a bass line is the one cell
 * that gets *pitched up* — seven semitones takes the filter with it, and 120
 * put the top of the sweep at 396 Hz, in the voice, on the one theme meant to
 * run under a wave. This is what that costs: a duller pluck, and a piece that
 * reads 0.00 s per minute instead of 2.6.
 */
export const PLUCK = cell(
  "pluck",
  "A plucked low string, its top filtered away well under the voice.",
  "Bass lines and ostinatos.",
  0.44,
  [metal(110, 0.42, 0.5, 88), soft(0.45, sub(55, 0.4, 0.45))],
);

/** A pitch falling through the floor. The heavier relative of `heart`. */
export const STEP = cell(
  "step",
  "A note dropping an octave into the floor.",
  "The first beat of a bar, or a phrase turning over.",
  0.44,
  [thud(110, 55, 0.45, 0.6), soft(0.3, sub(82.5, 0.35, 0.35))],
);

/** The room, holding a note for three seconds. */
export const BREATH = cell(
  "breath",
  "A long low tone breathing in and out over three seconds.",
  "The pad a slow piece sits on.",
  0.3,
  [swell(55, 3, 0.5), soft(0.4, swell(82.5, 3, 0.3))],
);

/** A bare sine seven octaves up. Neon. */
export const BELL = cell(
  "bell",
  "A clean high bell, well above anything a voice does.",
  "The melody of a piece, when it has one.",
  0.3,
  [glint(3520, 1.3, 0.5)],
);

/** A bell with its harmonics knocked off centre — the swarm's metal, tuned. */
export const STAR = cell(
  "star",
  "A bell that is not quite in tune with itself.",
  "A melody that should not sound comfortable.",
  0.26,
  [chime(4400, 1.1, 0.5, 900)],
);

/** Six milliseconds of noise. The click track's own grain, used as a rhythm. */
export const DUST = cell(
  "dust",
  "A dry tick above the voice — the click track's grain, off the beat.",
  "Rhythm without a body.",
  0.3,
  [tick(0.5, 0, 7000)],
);

/** A slow band of noise, kept high enough that its skirt never reaches a voice. */
export const WASH = cell(
  "wash",
  "High noise drifting up and thinning out over two seconds.",
  "The top of the mix, so the piece is not two lines and a hole.",
  0.22,
  [air(5200, 11_000, 2.2, 0.45, 2.5)],
);

/** Hull and rock: the boss's bass, an octave under everything else. */
export const GRIND = cell(
  "grind",
  "A very low saw with all its harmonics filtered off. Weight, not pitch.",
  "A piece with something large in it.",
  0.4,
  [metal(41, 1.1, 0.5, 110), soft(0.4, sub(41, 1, 0.4))],
);

/** A triangle that cannot hold its pitch. The living half of the palette. */
export const ALIVE = cell(
  "alive",
  "A low voice that wavers — nothing alive holds a pitch.",
  "A counter-line under the bass, so a piece is not only machinery.",
  0.3,
  [spore(98, 0.8, 0.5, 22)],
);

/** Every cell, for the tests and for the director's key. */
export const CELLS: readonly SoundDef[] = [
  HEART,
  PLUCK,
  STEP,
  BREATH,
  BELL,
  STAR,
  DUST,
  WASH,
  GRIND,
  ALIVE,
];
