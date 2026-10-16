import { GORGE_LEVELS } from "../gorge-levels.js";
import type { Wave } from "../wave-types.js";

/**
 * Waves 199 to 210 of the game, in the order they are played: THE FENCE's block
 * and the boss THE GORGE.
 *
 * Cut by `bun run waves:order --write` (`waves-recut.ts`), which cuts every act
 * after the tutorial arc again in play order. A save that fills it cuts a page
 * after it (`acts.ts`).
 */
export const WAVES_ACT_19: Wave[] = [
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
      { beat: 0, col: 2, kind: "fence", color: null },
      { beat: 7, col: 1, kind: "fence", color: null },
      { beat: 14, col: 7, kind: "fence", color: null },
      { beat: 20, col: 3, kind: "fence", color: null },
      { beat: 26, col: 8, kind: "fence", color: null },
      { beat: 32, col: 4, kind: "fence", color: null },
    ],
  },
  {
    id: "theFenceSpread",
    name: "FENCE SPRINKLE",
    variant: true,
    entries: [
      { beat: 0, col: 6, kind: "fence", color: null },
      { beat: 5, col: 3, color: "cyan" },
      { beat: 10, col: 6, kind: "fence", color: null },
      { beat: 17, col: 0, color: "cyan" },
      { beat: 23, col: 2, kind: "fence", color: null },
      { beat: 28, col: 0, color: "cyan" },
    ],
  },
  {
    id: "theFenceReach",
    name: "FAR FENCE",
    variant: true,
    entries: [
      { beat: 0, col: 1, kind: "fence", color: null },
      { beat: 6, col: 8, kind: "strand", color: "red", beads: 2 },
      { beat: 18, col: 7, kind: "fence", color: null },
      { beat: 24, col: 1, kind: "strand", color: "red", beads: 2 },
    ],
    pods: [{ beat: 12, col: 2, row: 3, kind: "pod" }],
  },
  {
    id: "theFencePair",
    name: "FENCE AND STRAND",
    variant: true,
    entries: [
      { beat: 0, col: 10, color: "red" },
      { beat: 6, col: 1, kind: "fence", color: null },
      { beat: 11, col: 8, color: "cyan" },
      { beat: 17, col: 5, kind: "strand", color: "red", beads: 5 },
      { beat: 21, col: 2, color: "red" },
      { beat: 26, col: 4, kind: "fence", color: null },
      { beat: 32, col: 2, color: "cyan" },
      { beat: 38, col: 6, kind: "strand", color: "red", beads: 2 },
    ],
  },
  {
    id: "theFenceBreathe",
    name: "FENCE PICNIC",
    variant: true,
    entries: [
      { beat: 0, col: 10, color: "cyan" },
      { beat: 7, col: 4, kind: "fence", color: null },
      { beat: 13, col: 0, color: "red" },
      { beat: 19, col: 1, kind: "strand", color: "red", beads: 5 },
      { beat: 25, col: 3, color: "red" },
      { beat: 31, col: 8, kind: "fence", color: null },
      { beat: 37, col: 3, color: "cyan" },
    ],
  },
  {
    id: "theFenceRecall",
    name: "FENCE MEMORY",
    variant: true,
    entries: [
      { beat: 0, col: 1, color: "cyan" },
      { beat: 6, col: 4, kind: "fence", color: null },
      { beat: 12, col: 5, color: "cyan" },
      { beat: 18, col: 0, kind: "meteor", color: null, cross: -1, row: 7 },
      { beat: 24, col: 9, color: "cyan" },
      { beat: 29, col: 3, kind: "fence", color: null },
      { beat: 34, col: 0, color: "cyan" },
      { beat: 40, col: 3, kind: "meteor", color: null, cross: 1, row: 4 },
    ],
  },
  {
    id: "theFenceBend",
    name: "FENCE TRICK",
    variant: true,
    entries: [
      { beat: 0, col: 6, color: "red" },
      { beat: 5, col: 9, kind: "fence", color: null },
      { beat: 10, col: 8, color: "cyan" },
      { beat: 15, col: 10, kind: "strand", color: "red", beads: 5 },
      { beat: 21, col: 3, color: "cyan" },
      { beat: 21, col: 6, color: "cyan" },
      { beat: 26, col: 5, kind: "fence", color: null },
      { beat: 31, col: 0, kind: "strand", color: "red", beads: 2 },
      { beat: 36, col: 2, color: "cyan" },
      { beat: 36, col: 8, color: "cyan" },
      { beat: 42, col: 9, kind: "fence", color: null },
      { beat: 48, col: 7, kind: "strand", color: "red", beads: 5 },
    ],
  },
  {
    id: "theFencePeak",
    name: "FENCE ECLIPSE",
    variant: true,
    entries: [
      { beat: 0, col: 2, color: "red" },
      { beat: 4, col: 10, kind: "fence", color: null },
      { beat: 8, col: 9, color: "red" },
      { beat: 12, col: 4, kind: "strand", color: "red", beads: 5 },
      { beat: 16, col: 2, color: "cyan" },
      { beat: 16, col: 8, color: "cyan" },
      { beat: 24, col: 1, kind: "fence", color: null },
      { beat: 28, col: 3, color: "red" },
      { beat: 28, col: 7, color: "red" },
      { beat: 32, col: 9, kind: "strand", color: "red", beads: 5 },
      { beat: 40, col: 2, color: "red" },
      { beat: 40, col: 8, color: "red" },
      { beat: 44, col: 3, kind: "fence", color: null },
      { beat: 48, col: 10, kind: "strand", color: "red", beads: 5 },
    ],
    pods: [
      { beat: 20, col: 0, row: 4, kind: "husk" },
      { beat: 36, col: 4, row: 4, kind: "husk" },
    ],
  },
  {
    id: "theGorge",
    name: "THE GORGE",
    guide: {
      scene: "theGorge",
    },
    entries: [
      { beat: 20, col: 2, kind: "meteor", color: null },
      { beat: 28, col: 8, kind: "meteor", color: null },
      { beat: 34, col: 5, color: "red" },
      { beat: 40, col: 0, color: "cyan" },
      { beat: 46, col: 10, kind: "meteor", color: null },
      { beat: 52, col: 5, color: "cyan" },
      { beat: 60, col: 3, kind: "meteor", color: null },
      { beat: 66, col: 7, color: "red" },
      { beat: 74, col: 5, kind: "meteor", color: null },
      { beat: 82, col: 2, color: "cyan" },
    ],
    boss: { kind: "gorge", levels: GORGE_LEVELS },
    bossType: "normal",
  },
];
