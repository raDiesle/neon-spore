import type { Wave } from "../wave-types.js";

/**
 * Waves 442 to 451 of the game, in the order they are played: THE GHOST's block
 * and the boss THE SEAM.
 *
 * Cut by `bun run waves:order --write` (`waves-recut.ts`), which cuts every act
 * after the tutorial arc again in play order. A save that fills it cuts a page
 * after it (`acts.ts`).
 */
export const WAVES_ACT_43: Wave[] = [
  {
    id: "theGhost",
    name: "THE GHOST",
    guide: {
      scene: "theGhost",
    },
    entries: [
      { beat: 0, col: 3, kind: "ghost", color: "cyan" },
      { beat: 10, col: 2, kind: "ghost", color: "red" },
      { beat: 18, col: 2, kind: "ghost", color: "cyan", path: "across" },
    ],
  },
  {
    id: "theGhostAgain",
    name: "FIRST GHOST",
    variant: true,
    entries: [
      { beat: 0, col: 6, kind: "ghost", color: "red" },
      { beat: 8, col: 10, kind: "wisp", color: null },
      { beat: 14, col: 0, kind: "beatbox", color: null, beats: 4 },
      { beat: 20, col: 1, kind: "ghost", color: "cyan" },
      { beat: 28, col: 4, kind: "wisp", color: null },
    ],
  },
  {
    id: "theGhostSpread",
    name: "GHOST SCATTER",
    variant: true,
    entries: [
      { beat: 0, col: 0, kind: "ghost", color: "red" },
      { beat: 7, col: 9, kind: "wisp", color: null },
      { beat: 14, col: 3, kind: "choir", color: "red" },
      { beat: 20, col: 8, kind: "ghost", color: "cyan", path: "across" },
      { beat: 26, col: 4, kind: "wisp", color: null },
      { beat: 32, col: 6, kind: "choir", color: "cyan" },
    ],
  },
  {
    id: "theGhostReach",
    name: "GHOST WANDERER",
    variant: true,
    entries: [
      { beat: 0, col: 10, kind: "ghost", color: "red" },
      { beat: 5, col: 0, kind: "wisp", color: null },
      { beat: 10, col: 7, kind: "strand", color: "red", beads: 2 },
      { beat: 15, col: 0, kind: "ghost", color: "cyan", path: "across" },
      { beat: 20, col: 4, kind: "wisp", color: null },
      { beat: 25, col: 9, kind: "strand", color: "red", beads: 2 },
    ],
  },
  {
    id: "theGhostPair",
    name: "GHOST TANGO",
    variant: true,
    entries: [
      { beat: 0, col: 1, color: "cyan" },
      { beat: 4, col: 2, kind: "ghost", color: "red" },
      { beat: 10, col: 4, color: "red" },
      { beat: 16, col: 0, kind: "wisp", color: null },
      { beat: 22, col: 2, color: "red" },
      { beat: 22, col: 8, color: "red" },
      { beat: 27, col: 0, kind: "ghost", color: "red" },
      { beat: 33, col: 10, kind: "wisp", color: null },
      { beat: 39, col: 3, color: "red" },
      { beat: 39, col: 7, color: "red" },
    ],
  },
  {
    id: "theGhostBreathe",
    name: "GHOST LULLABY",
    variant: true,
    entries: [
      { beat: 0, col: 0, color: "red" },
      { beat: 7, col: 5, kind: "ghost", color: "red" },
      { beat: 14, col: 6, color: "red" },
      { beat: 22, col: 10, kind: "wisp", color: null },
      { beat: 29, col: 0, color: "cyan" },
      { beat: 35, col: 10, kind: "countdown", color: "red" },
    ],
  },
  {
    id: "theGhostRecall",
    name: "ANCIENT GHOST",
    variant: true,
    entries: [
      { beat: 0, col: 2, color: "cyan" },
      { beat: 5, col: 0, kind: "ghost", color: "red" },
      { beat: 11, col: 6, color: "cyan" },
      { beat: 17, col: 2, kind: "choir", color: "cyan" },
      { beat: 23, col: 4, color: "cyan" },
      { beat: 23, col: 7, color: "cyan" },
      { beat: 28, col: 0, kind: "ghost", color: "cyan", path: "across" },
      { beat: 33, col: 5, kind: "choir", color: "cyan" },
      { beat: 39, col: 0, color: "cyan" },
      { beat: 39, col: 10, color: "cyan" },
    ],
  },
  {
    id: "theGhostBend",
    name: "GHOST MIRAGE",
    variant: true,
    entries: [
      { beat: 0, col: 10, color: "red" },
      { beat: 5, col: 5, kind: "ghost", color: "cyan", path: "across" },
      { beat: 11, col: 0, color: "cyan" },
      { beat: 11, col: 10, color: "cyan" },
      { beat: 16, col: 2, kind: "wisp", color: null },
      { beat: 22, col: 5, kind: "ghost", color: "cyan", path: "across" },
      { beat: 27, col: 2, color: "cyan" },
      { beat: 27, col: 8, color: "cyan" },
      { beat: 33, col: 2, kind: "wisp", color: null },
      { beat: 39, col: 6, kind: "ghost", color: "red" },
      { beat: 45, col: 2, color: "red" },
      { beat: 45, col: 8, color: "red" },
    ],
  },
  {
    id: "theGhostPeak",
    name: "GHOST THUNDER",
    variant: true,
    entries: [
      { beat: 0, col: 3, color: "cyan" },
      { beat: 4, col: 7, kind: "ghost", color: "cyan", path: "across" },
      { beat: 7, col: 5, color: "red" },
      { beat: 7, col: 8, color: "red" },
      { beat: 11, col: 4, kind: "wisp", color: null },
      { beat: 18, col: 2, color: "cyan" },
      { beat: 18, col: 8, color: "cyan" },
      { beat: 21, col: 4, kind: "ghost", color: "cyan" },
      { beat: 25, col: 3, kind: "wisp", color: null },
      { beat: 28, col: 3, color: "cyan" },
      { beat: 28, col: 6, color: "cyan" },
      { beat: 35, col: 6, kind: "ghost", color: "cyan", path: "across" },
      { beat: 39, col: 5, color: "cyan" },
      { beat: 39, col: 8, color: "cyan" },
      { beat: 42, col: 10, kind: "wisp", color: null },
    ],
    pods: [
      { beat: 14, col: 0, row: 4, kind: "husk" },
      { beat: 32, col: 9, row: 4, kind: "husk" },
    ],
  },
  {
    id: "theSeam",
    name: "THE SEAM",
    guide: {
      both: "A point on the crack lights in a colour. Shoot it in that colour. When grit flies, raise the shield under it. Three points close the crack. Never shoot grey.",
      p1: "1. Move the cannon under the lit point.\n2. When grit flies, press the shield.\n3. A rock falls to one side. Slide the cannon under it.",
      p2: "1. Fire the lit point in its colour. White takes either.\n2. Slide the shield under the ridge when grit flies.\n3. At the end one of you shields while the other fires.",
    },
    entries: [],
    boss: {
      kind: "seam",
      steps: [
        { ask: "point", color: "red", offset: 0, seals: false },
        { ask: "grit", color: "either", offset: 0, seals: false },
        { ask: "point", color: "cyan", offset: 0, seals: true },
        { ask: "blind", color: "either", offset: 0, seals: false },
        { ask: "point", color: "red", offset: 0, seals: false },
        { ask: "point", color: "cyan", offset: 0, seals: true },
        { ask: "grit", color: "either", offset: 0, seals: false },
        { ask: "decoy", color: "either", offset: 0, seals: false },
        { ask: "rock", color: "cyan", offset: 2, seals: false },
        { ask: "glow", color: "either", offset: 0, seals: false },
        { ask: "point", color: "either", offset: 0, seals: true },
        { ask: "both", color: "either", offset: -2, seals: false },
        { ask: "dark", color: "either", offset: 0, seals: false },
      ],
    },
    bossType: "normal",
  },
];
