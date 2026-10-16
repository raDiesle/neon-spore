import type { Wave } from "../wave-types.js";

/**
 * Waves 239 to 250 of the game, in the order they are played: THE FENCE's block
 * and the boss THE CURTAIN.
 *
 * Cut by `bun run waves:order --write` (`waves-recut.ts`), which cuts every act
 * after the tutorial arc again in play order. A save that fills it cuts a page
 * after it (`acts.ts`).
 */
export const WAVES_ACT_22: Wave[] = [
  {
    id: "theFence",
    name: "THE FENCE",
    guide: {
      scene: "theFence",
    },
    entries: [
      { beat: 0, col: 5, kind: "fence", color: null },
      { beat: 12, col: 5, kind: "fence", color: null },
      { beat: 24, col: 5, kind: "fence", color: null },
    ],
  },
  {
    id: "theGap",
    name: "THE GAP",
    variant: true,
    guide: {
      scene: "theGap",
    },
    entries: [
      { beat: 0, col: 8, kind: "fence", color: null },
      { beat: 12, col: 2, kind: "fence", color: null },
      { beat: 26, col: 10, kind: "fence", color: null },
      { beat: 40, col: 0, kind: "fence", color: null },
      { beat: 56, col: 5, kind: "fence", color: null },
    ],
  },
  {
    id: "theCut",
    name: "THE CUT",
    variant: true,
    guide: {
      scene: "theCut",
    },
    entries: [
      { beat: 0, col: 5, kind: "fence", color: null, gaps: [], cracksRed: [5] },
      { beat: 16, col: 5, kind: "fence", color: null, gaps: [], cracksCyan: [8] },
      { beat: 32, col: 5, kind: "fence", color: null, gaps: [], cracksRed: [2] },
      { beat: 48, col: 5, kind: "fence", color: null, gaps: [], cracksCyan: [7] },
    ],
  },
  {
    id: "theFenceAgain",
    name: "NEW FENCE MOON",
    variant: true,
    entries: [
      { beat: 0, col: 9, kind: "fence", color: null },
      { beat: 8, col: 6, kind: "fence", color: null },
      { beat: 16, col: 1, kind: "fence", color: null },
      { beat: 24, col: 9, kind: "fence", color: null },
      { beat: 31, col: 4, kind: "fence", color: null },
    ],
  },
  {
    id: "theFenceSpread",
    name: "FENCE SPRINKLE",
    variant: true,
    entries: [
      { beat: 0, col: 2, kind: "fence", color: null },
      { beat: 7, col: 8, color: "cyan" },
      { beat: 12, col: 3, kind: "fence", color: null },
      { beat: 17, col: 0, color: "cyan" },
      { beat: 24, col: 3, kind: "fence", color: null },
      { beat: 31, col: 8, color: "cyan" },
    ],
  },
  {
    id: "theFenceReach",
    name: "FAR FENCE",
    variant: true,
    entries: [
      { beat: 0, col: 10, kind: "fence", color: null },
      { beat: 5, col: 5, kind: "strand", color: "red", beads: 2 },
      { beat: 11, col: 9, kind: "meteorMedium", color: null },
      { beat: 16, col: 5, kind: "fence", color: null },
      { beat: 21, col: 10, kind: "strand", color: "cyan", beads: 3 },
      { beat: 27, col: 6, kind: "meteorMedium", color: null },
    ],
  },
  {
    id: "theFencePair",
    name: "FENCE AND STRAND",
    variant: true,
    entries: [
      { beat: 0, col: 1, color: "cyan" },
      { beat: 6, col: 10, kind: "fence", color: null },
      { beat: 12, col: 0, color: "red" },
      { beat: 18, col: 9, kind: "strand", color: "red", beads: 2 },
      { beat: 22, col: 1, color: "red" },
      { beat: 28, col: 2, kind: "rind", color: "cyan" },
      { beat: 32, col: 0, color: "red" },
      { beat: 37, col: 10, kind: "fence", color: null },
    ],
  },
  {
    id: "theFenceBreathe",
    name: "FENCE PICNIC",
    variant: true,
    entries: [
      { beat: 0, col: 1, color: "red" },
      { beat: 6, col: 10, kind: "fence", color: null },
      { beat: 13, col: 8, color: "red" },
      { beat: 20, col: 0, kind: "strand", color: "red", beads: 2 },
      { beat: 26, col: 4, color: "red" },
      { beat: 32, col: 10, kind: "fence", color: null },
      { beat: 40, col: 0, color: "red" },
    ],
  },
  {
    id: "theFenceRecall",
    name: "FENCE MEMORY",
    variant: true,
    entries: [
      { beat: 0, col: 4, color: "red" },
      { beat: 5, col: 3, kind: "fence", color: null },
      { beat: 10, col: 0, color: "cyan" },
      { beat: 16, col: 10, kind: "seeder", color: "cyan" },
      { beat: 22, col: 4, color: "red" },
      { beat: 27, col: 5, kind: "fence", color: null },
      { beat: 33, col: 8, color: "red" },
      { beat: 38, col: 10, kind: "seeder", color: "red" },
    ],
  },
  {
    id: "theFenceBend",
    name: "FENCE TRICK",
    variant: true,
    entries: [
      { beat: 0, col: 10, color: "red" },
      { beat: 6, col: 2, kind: "fence", color: null },
      { beat: 11, col: 3, color: "cyan" },
      { beat: 17, col: 1, kind: "strand", color: "red", beads: 5 },
      { beat: 22, col: 4, color: "cyan" },
      { beat: 22, col: 7, color: "cyan" },
      { beat: 27, col: 0, kind: "fence", color: null },
      { beat: 33, col: 7, kind: "strand", color: "red", beads: 2 },
      { beat: 39, col: 3, color: "red" },
      { beat: 39, col: 7, color: "red" },
      { beat: 44, col: 8, kind: "fence", color: null },
    ],
  },
  {
    id: "theFencePeak",
    name: "FENCE ECLIPSE",
    variant: true,
    entries: [
      { beat: 0, col: 4, color: "red" },
      { beat: 4, col: 1, kind: "fence", color: null },
      { beat: 7, col: 2, color: "red" },
      { beat: 11, col: 3, kind: "strand", color: "red", beads: 2 },
      { beat: 15, col: 1, color: "red" },
      { beat: 15, col: 9, color: "red" },
      { beat: 22, col: 0, kind: "fence", color: null },
      { beat: 26, col: 4, color: "cyan" },
      { beat: 26, col: 7, color: "cyan" },
      { beat: 30, col: 2, kind: "strand", color: "red", beads: 2 },
      { beat: 37, col: 0, color: "cyan" },
      { beat: 37, col: 10, color: "cyan" },
      { beat: 41, col: 7, kind: "fence", color: null },
      { beat: 45, col: 9, kind: "strand", color: "red", beads: 2 },
    ],
    pods: [
      { beat: 19, col: 7, row: 4, kind: "husk" },
      { beat: 33, col: 1, row: 4, kind: "husk" },
    ],
  },
  {
    id: "theCurtain",
    name: "THE CURTAIN",
    guide: {
      scene: "theCurtain",
    },
    entries: [],
    boss: { kind: "curtain" },
    bossType: "normal",
  },
];
