import type { CatalogueEntry } from "./catalogue.js";
import { JET } from "./motions/index.js";
import { bodiesFrom, type Recipe } from "./recipe.js";

/**
 * Eight bodies that swim.
 *
 * They are here because the owner looked at the first fourteen grown bodies
 * and picked out the ones that read as jellyfish, which is a better piece of
 * information than anything a session could have worked out on its own: it
 * says the parts library's most useful direction is *a body with something
 * hanging under it*, not *a body with something stuck on it*.
 *
 * What makes them swim is split across two mechanisms on purpose, and the
 * split is the whole of this file's argument:
 *
 * - **The contour squeezes.** `parts/swim.ts` contracts the bell on the beat
 *   and hands every part the contraction *as it was some beats ago*, so a
 *   tentacle straightens after the bell has already let go. A pose cannot do
 *   that — it does one thing to everything at once, which is precisely the
 *   look of a jellyfish nobody watched.
 * - **The pose rises.** `JET` lifts the body on the squeeze and lets it sink
 *   through the glide, with no scale in it at all. An animal does not travel
 *   by changing shape; it travels because changing shape moved water.
 *
 * Both read the same four numbers in `motions/pulse.ts`, so they are halves of
 * one gesture rather than two that happen to agree. The rule that falls out:
 * a body that changes `period` must drop `JET`, and none of these does.
 *
 * **Names.** No species, here or anywhere: the marine names went with the
 * setting (`docs/decisions.md` #11, #13) and these are shapes rather than
 * creatures. What each is called is what it looks like to somebody who has
 * never seen the animal.
 */

const RECIPES: Recipe[] = [
  {
    name: "BELL",
    note: "a plain bell + a fringe and four streamers",
    owner:
      "nothing — the control: the least a body can carry and still read as swimming rather than falling",
    rx: 36,
    ry: 30,
    lobes: 2,
    depth: 0.07,
    bell: 0.34,
    pulse: {},
    motion: JET,
    parts: [
      { part: "fringe", at: 1.57, count: 2, spread: 1.5 },
      { part: "streamer", at: 1.57, count: 4, spread: 1.9, size: 0.9 },
    ],
  },
  {
    name: "PARASOL",
    note: "a wide shallow bell + a scalloped margin, four oral arms and the rings inside",
    owner:
      "nothing — the flattest of them, and the one whose interior is doing as much work as its outline",
    rx: 44,
    ry: 28,
    lobes: 2,
    depth: 0.05,
    bell: 0.4,
    pulse: { depth: 0.15 },
    motion: JET,
    parts: [
      { part: "lappet", at: 1.57, count: 7, spread: 2.7, size: 0.9 },
      { part: "oral-arm", at: 1.57, count: 4, spread: 1.7, size: 0.85 },
      { part: "rings", at: 1.57, size: 1.1 },
    ],
  },
  {
    name: "NETTLE",
    note: "a deep bell + long oral arms, six streamers and a fringe",
    owner: "nothing — the most cluttered underside here, and the one that reads as dangerous",
    rx: 32,
    ry: 34,
    lobes: 3,
    depth: 0.08,
    bell: 0.3,
    pulse: { depth: 0.2 },
    motion: JET,
    parts: [
      { part: "oral-arm", at: 1.57, count: 4, spread: 1.2, size: 1.3 },
      { part: "streamer", at: 1.57, count: 6, spread: 2.5, size: 1.05 },
      { part: "fringe", at: 1.57, count: 2, spread: 2.2, size: 0.8 },
    ],
  },
  {
    name: "THIMBLE",
    note: "a small tall bell + a short fringe, squeezing harder than the rest",
    owner:
      "nothing — a hard, deep squeeze on a small body: the same clock as the others and a different animal",
    rx: 22,
    ry: 30,
    lobes: 2,
    depth: 0.06,
    bell: 0.26,
    pulse: { depth: 0.26, attack: 0.1 },
    motion: JET,
    parts: [
      { part: "fringe", at: 1.57, count: 2, spread: 1.6, size: 0.9 },
      { part: "streamer", at: 1.57, count: 3, spread: 1.2, size: 0.7 },
    ],
  },
  {
    name: "SHROUD",
    note: "a bell + three veils and the rings, with almost nothing trailing",
    owner: "nothing — membrane instead of tentacles, so the whole silhouette moves as one sheet",
    rx: 36,
    ry: 32,
    lobes: 2,
    depth: 0.07,
    bell: 0.36,
    pulse: {},
    motion: JET,
    parts: [
      { part: "veil", at: 1.57, count: 3, spread: 1.7, size: 1.2 },
      { part: "rings", at: 1.57 },
      { part: "streamer", at: 1.57, count: 2, spread: 0.9, size: 0.85 },
    ],
  },
  {
    name: "COMB",
    note: "an ovoid + comb rows down both sides and one trail",
    owner:
      "nothing — the one that does not jet: the body barely squeezes and the rows do the swimming",
    rx: 26,
    ry: 38,
    lobes: 1,
    depth: 0.05,
    bell: 0.12,
    // A comb jelly beats cilia rather than ejecting water, so the squeeze is
    // almost nothing and JET is absent. The rows are the whole motion, and
    // they run on their own clock inside the part.
    pulse: { depth: 0.05 },
    parts: [
      { part: "comb-row", at: 0.4, size: 1.15 },
      { part: "comb-row", at: 2.74, size: 1.15, flip: true },
      { part: "trail", at: 1.57, size: 1.15 },
    ],
  },
  {
    name: "SCALLOP",
    note: "a wide bell whose whole margin is flaps",
    owner:
      "nothing — the margin is the animal: nine flaps that tuck under together, and nothing else",
    rx: 40,
    ry: 28,
    lobes: 2,
    depth: 0.06,
    bell: 0.42,
    pulse: { depth: 0.2 },
    motion: JET,
    parts: [
      { part: "lappet", at: 1.57, count: 9, spread: 3.2, size: 1.1 },
      { part: "fringe", at: 1.57, count: 2, spread: 1.4, size: 0.7 },
    ],
  },
  {
    name: "DRAGNET",
    note: "a small bell + a tangle of trails and streamers far longer than it is",
    owner:
      "nothing — almost all of it is what it drags, which is a different threat from a body with a reach",
    rx: 24,
    ry: 22,
    lobes: 2,
    depth: 0.08,
    bell: 0.3,
    pulse: { depth: 0.2 },
    motion: JET,
    parts: [
      { part: "trail", at: 1.57, count: 3, spread: 1.6, size: 1.4 },
      { part: "streamer", at: 1.57, count: 3, spread: 2.6, size: 1.3 },
      { part: "fringe", at: 1.57, size: 0.8 },
    ],
  },
];

/**
 * The recipes as well as the entries, because the swim sheet has to draw each
 * body's *own* contraction under it and a `CatalogueEntry` carries a contour
 * rather than the numbers that made it. Reading the recipe is the only way
 * that bar is the same value the bell is being sampled through; the first
 * draft compared body names instead, which is a second copy of this list
 * hidden in a conditional.
 */
export const JELLY_RECIPES = RECIPES;

export const JELLY_BODIES: CatalogueEntry[] = bodiesFrom(RECIPES);
