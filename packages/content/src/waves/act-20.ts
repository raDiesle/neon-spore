import type { Wave } from "../wave-types.js";

/**
 * Waves 219 to 228 of the game, in the order they are played: THE STRAND's
 * block and the boss THE THROAT.
 *
 * Cut by `bun run waves:order --write` (`waves-recut.ts`), which cuts every act
 * after the tutorial arc again in play order. A save that fills it cuts a page
 * after it (`acts.ts`).
 */
export const WAVES_ACT_20: Wave[] = [
  {
    id: "theStrand",
    name: "THE STRAND",
    guide: {
      scene: "theStrand",
    },
    entries: [
      { beat: 0, col: 5, kind: "strand", color: "red", beads: 2 },
      { beat: 18, col: 2, kind: "strand", color: "cyan", beads: 3 },
      { beat: 36, col: 2, kind: "strand", color: "red", beads: 5 },
    ],
  },
  {
    id: "theStrandAgain",
    name: "STRAND DAWN",
    variant: true,
    entries: [
      { beat: 0, col: 4, kind: "strand", color: "cyan", beads: 3 },
      { beat: 6, col: 7, kind: "strand", color: "cyan", beads: 3 },
      { beat: 14, col: 5, kind: "strand", color: "red", beads: 2 },
      { beat: 21, col: 1, kind: "strand", color: "cyan", beads: 3 },
      { beat: 27, col: 9, kind: "strand", color: "red", beads: 5 },
    ],
  },
  {
    id: "theStrandSpread",
    name: "STRAND SEEDS",
    variant: true,
    entries: [
      { beat: 0, col: 10, kind: "strand", color: "red", beads: 5 },
      { beat: 6, col: 0, color: "red" },
      { beat: 13, col: 2, kind: "strand", color: "cyan", beads: 3 },
      { beat: 20, col: 0, color: "red" },
      { beat: 26, col: 3, kind: "strand", color: "red", beads: 5 },
    ],
  },
  {
    id: "theStrandReach",
    name: "OUTER STRAND",
    variant: true,
    entries: [
      { beat: 0, col: 0, kind: "strand", color: "red", beads: 5 },
      { beat: 5, col: 5, kind: "veer", color: null },
      { beat: 11, col: 1, kind: "beatbox", color: null, beats: 2 },
      { beat: 16, col: 6, kind: "strand", color: "red", beads: 5 },
      { beat: 22, col: 2, kind: "veer", color: null },
      { beat: 27, col: 6, kind: "beatbox", color: null, beats: 2 },
    ],
  },
  {
    id: "theStrandPair",
    name: "STRAND MEETS VEER",
    variant: true,
    entries: [
      { beat: 0, col: 10, color: "red" },
      { beat: 6, col: 2, kind: "strand", color: "cyan", beads: 3 },
      { beat: 12, col: 1, color: "cyan" },
      { beat: 16, col: 10, kind: "veer", color: null },
      { beat: 20, col: 0, color: "red" },
      { beat: 26, col: 8, kind: "meteor", color: null },
      { beat: 30, col: 1, color: "red" },
      { beat: 35, col: 5, kind: "strand", color: "cyan", beads: 3 },
    ],
  },
  {
    id: "theStrandBreathe",
    name: "STRAND DREAM",
    variant: true,
    entries: [
      { beat: 0, col: 0, color: "red" },
      { beat: 8, col: 4, kind: "strand", color: "red", beads: 2 },
      { beat: 16, col: 0, color: "red" },
      { beat: 24, col: 8, kind: "veer", color: null },
      { beat: 31, col: 4, color: "red" },
      { beat: 38, col: 1, kind: "strand", color: "red", beads: 5 },
    ],
  },
  {
    id: "theStrandRecall",
    name: "STRAND LEGEND",
    variant: true,
    entries: [
      { beat: 0, col: 7, color: "red" },
      { beat: 6, col: 4, kind: "strand", color: "cyan", beads: 3 },
      { beat: 11, col: 7, color: "cyan" },
      { beat: 17, col: 6, kind: "strand", color: "red", beads: 2 },
      { beat: 23, col: 0, color: "cyan" },
      { beat: 28, col: 10, kind: "strand", color: "cyan", beads: 3 },
      { beat: 33, col: 5, color: "cyan" },
      { beat: 38, col: 7, kind: "strand", color: "red", beads: 5 },
    ],
  },
  {
    id: "theStrandBend",
    name: "TWISTED STRAND",
    variant: true,
    entries: [
      { beat: 0, col: 10, color: "cyan" },
      { beat: 5, col: 9, kind: "strand", color: "red", beads: 2 },
      { beat: 10, col: 5, color: "red" },
      { beat: 16, col: 1, kind: "veer", color: null },
      { beat: 22, col: 3, color: "cyan" },
      { beat: 22, col: 6, color: "cyan" },
      { beat: 27, col: 3, kind: "strand", color: "red", beads: 2 },
      { beat: 33, col: 1, kind: "veer", color: null },
      { beat: 39, col: 0, color: "cyan" },
      { beat: 39, col: 10, color: "cyan" },
      { beat: 45, col: 5, kind: "strand", color: "cyan", beads: 3 },
    ],
  },
  {
    id: "theStrandPeak",
    name: "STRAND APOCALYPSE",
    variant: true,
    entries: [
      { beat: 0, col: 1, color: "cyan" },
      { beat: 4, col: 7, kind: "strand", color: "cyan", beads: 3 },
      { beat: 8, col: 9, color: "red" },
      { beat: 12, col: 2, kind: "veer", color: null },
      { beat: 16, col: 1, color: "red" },
      { beat: 16, col: 9, color: "red" },
      { beat: 20, col: 8, kind: "shell", color: "cyan" },
      { beat: 24, col: 3, kind: "strand", color: "red", beads: 2 },
      { beat: 28, col: 0, color: "cyan" },
      { beat: 28, col: 10, color: "cyan" },
      { beat: 32, col: 3, kind: "veer", color: null },
      { beat: 36, col: 6, kind: "shell", color: "red" },
      { beat: 40, col: 2, color: "red" },
      { beat: 40, col: 8, color: "red" },
      { beat: 44, col: 3, kind: "strand", color: "cyan", beads: 3 },
      { beat: 48, col: 7, kind: "veer", color: null },
    ],
  },
  {
    id: "theThroat",
    name: "THE THROAT",
    guide: {
      scene: "theThroat",
    },
    entries: [
      { beat: 4, col: 5, color: "red" },
      { beat: 12, col: 3, color: "red" },
      { beat: 20, col: 7, color: "cyan" },
      { beat: 28, col: 2, kind: "meteor", color: null },
      { beat: 36, col: 8, color: "cyan" },
      { beat: 44, col: 5, kind: "meteor", color: null },
      { beat: 50, col: 2, color: "red" },
      { beat: 54, col: 8, color: "cyan" },
      { beat: 62, col: 3, kind: "meteor", color: null },
      { beat: 66, col: 7, color: "red" },
      { beat: 74, col: 5, color: "cyan" },
      { beat: 78, col: 2, kind: "meteor", color: null },
    ],
    pods: [
      { beat: 32, col: 0, row: 4, kind: "pod", cross: 1 },
      { beat: 58, col: 10, row: 3, kind: "pod", cross: -1 },
      { beat: 70, col: 0, row: 5, kind: "pod", cross: 1 },
      { beat: 84, col: 10, row: 4, kind: "pod", cross: -1 },
    ],
    boss: { kind: "throat" },
    bossType: "normal",
    controls: "throat",
  },
];
