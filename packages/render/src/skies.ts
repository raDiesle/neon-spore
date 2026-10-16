import type { BackdropDraw } from "./backdrop-look.js";
import { skyAurora } from "./sky-aurora.js";
import { skyBinary } from "./sky-binary.js";
import { skyCells } from "./sky-cells.js";
import { skyComet } from "./sky-comet.js";
import { skyEclipse } from "./sky-eclipse.js";
import { skyGalaxy } from "./sky-galaxy.js";
import { skyGiant } from "./sky-giant.js";
import { skyHole } from "./sky-hole.js";
import { skyMilky } from "./sky-milky.js";
import { skyMoons } from "./sky-moons.js";
import { skyPillars } from "./sky-pillars.js";
import { skyRemnant } from "./sky-remnant.js";

/**
 * Every sky the field can sit in, and which one a wave gets.
 *
 * The owner called the sea the field used to sit in *boring and empty* on
 * 16 October 2026, liked all six skies VERSUS offered in its place, and asked
 * for more and for the game to go round them. So the back is one of twelve
 * pictures, each with one large thing in it, and **the wave picks it**: wave
 * `n` gets `SKIES[n % SKIES.length]`. The wave is world state, already the
 * same on both screens, so the two players always look at the same sky, and
 * each new wave opens under a new one. The order alternates a sky with a big
 * bright thing in it and a quieter one, so two loud ones never follow.
 *
 * Every sky still takes its colour from the act (`tintFor`), and the
 * director's SKIES room draws all twelve side by side.
 */

export interface Sky {
  /** What the director calls it, in capitals. */
  readonly name: string;
  /** One line on what it is, for the director. */
  readonly sentence: string;
  readonly draw: (d: BackdropDraw) => void;
}

export const SKIES: readonly Sky[] = [
  {
    name: "GIANT",
    sentence: "a ringed gas giant off the left edge, its bands turning slowly",
    draw: skyGiant,
  },
  {
    name: "MILKY",
    sentence: "the galaxy's band of stars and dust from corner to corner",
    draw: skyMilky,
  },
  {
    name: "ECLIPSE",
    sentence: "a black world in front of a star, its corona turning",
    draw: skyEclipse,
  },
  {
    name: "AURORA",
    sentence: "two curtains of light folding across the upper sky",
    draw: skyAurora,
  },
  {
    name: "HOLE",
    sentence: "a black hole on the left, its burning disc turning",
    draw: skyHole,
  },
  {
    name: "MOONS",
    sentence: "a great cratered moon low on the right and two small ones",
    draw: skyMoons,
  },
  {
    name: "GALAXY",
    sentence: "a tilted spiral galaxy turning high on the right",
    draw: skyGalaxy,
  },
  {
    name: "PILLARS",
    sentence: "towers of dark dust rising out of the bottom, lit from behind",
    draw: skyPillars,
  },
  {
    name: "BINARY",
    sentence: "two suns circling each other, one pulling gas off the other",
    draw: skyBinary,
  },
  {
    name: "CELLS",
    sentence: "a breathing wall of huge living cells",
    draw: skyCells,
  },
  {
    name: "COMET",
    sentence: "a great comet with a curved dust tail and a straight blue one",
    draw: skyComet,
  },
  {
    name: "REMNANT",
    sentence: "the torn glowing shell of a dead star, its core flashing",
    draw: skyRemnant,
  },
];

/** The sky wave `wave` is fought under. */
export function skyFor(wave: number): Sky {
  const n = SKIES.length;
  return SKIES[((wave % n) + n) % n]!;
}
