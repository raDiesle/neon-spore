import type { Wave } from "../wave-types.js";

/**
 * Waves 216 to 225 of the game, in the order they are played: THE STRAND's
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
      { beat: 6, col: 6, kind: "strand", color: "cyan", beads: 3 },
      { beat: 14, col: 5, kind: "strand", color: "red", beads: 2 },
      { beat: 21, col: 2, kind: "strand", color: "cyan", beads: 3 },
      { beat: 27, col: 8, kind: "strand", color: "red", beads: 5 },
    ],
  },
  {
    id: "theStrandSpread",
    name: "STRAND SEEDS",
    variant: true,
    entries: [
      { beat: 0, col: 3, kind: "strand", color: "red", beads: 5 },
      { beat: 5, col: 7, kind: "strand", color: "cyan", beads: 3 },
      { beat: 10, col: 6, kind: "strand", color: "cyan", beads: 3 },
      { beat: 16, col: 0, kind: "strand", color: "red", beads: 2 },
      { beat: 21, col: 8, kind: "strand", color: "cyan", beads: 3 },
      { beat: 28, col: 1, kind: "strand", color: "cyan", beads: 3 },
    ],
  },
  {
    id: "theStrandReach",
    name: "OUTER STRAND",
    variant: true,
    entries: [
      { beat: 0, col: 0, kind: "strand", color: "red", beads: 5 },
      { beat: 5, col: 5, kind: "veer", color: null },
      { beat: 11, col: 1, kind: "strand", color: "red", beads: 2 },
      { beat: 16, col: 6, kind: "veer", color: null },
      { beat: 22, col: 2, kind: "strand", color: "red", beads: 2 },
      { beat: 27, col: 6, kind: "veer", color: null },
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
      { beat: 0, col: 7, color: "red" },
      { beat: 8, col: 0, kind: "strand", color: "cyan", beads: 3 },
      { beat: 16, col: 10, color: "cyan" },
      { beat: 22, col: 1, kind: "meteor", color: null },
      { beat: 29, col: 2, color: "red" },
      { beat: 37, col: 0, kind: "strand", color: "red", beads: 2 },
    ],
  },
  {
    id: "theStrandRecall",
    name: "STRAND LEGEND",
    variant: true,
    entries: [
      { beat: 0, col: 8, color: "red" },
      { beat: 5, col: 10, kind: "strand", color: "red", beads: 5 },
      { beat: 11, col: 5, color: "red" },
      { beat: 16, col: 10, kind: "meteor", color: null },
      { beat: 21, col: 0, color: "cyan" },
      { beat: 27, col: 6, kind: "strand", color: "cyan", beads: 3 },
      { beat: 33, col: 9, color: "cyan" },
      { beat: 38, col: 8, kind: "meteor", color: null },
    ],
  },
  {
    id: "theStrandBend",
    name: "TWISTED STRAND",
    variant: true,
    entries: [
      { beat: 0, col: 1, color: "cyan" },
      { beat: 5, col: 3, kind: "strand", color: "red", beads: 2 },
      { beat: 10, col: 5, color: "cyan" },
      { beat: 15, col: 4, kind: "veer", color: null },
      { beat: 20, col: 5, color: "cyan" },
      { beat: 20, col: 8, color: "cyan" },
      { beat: 25, col: 8, kind: "strand", color: "red", beads: 2 },
      { beat: 30, col: 1, kind: "veer", color: null },
      { beat: 36, col: 3, color: "cyan" },
      { beat: 36, col: 7, color: "cyan" },
      { beat: 41, col: 6, kind: "strand", color: "red", beads: 5 },
      { beat: 46, col: 0, kind: "veer", color: null },
    ],
  },
  {
    id: "theStrandPeak",
    name: "STRAND APOCALYPSE",
    variant: true,
    entries: [
      { beat: 0, col: 0, color: "red" },
      { beat: 4, col: 8, kind: "strand", color: "red", beads: 5 },
      { beat: 8, col: 0, color: "cyan" },
      { beat: 12, col: 7, kind: "veer", color: null },
      { beat: 16, col: 2, color: "red" },
      { beat: 16, col: 8, color: "red" },
      { beat: 20, col: 10, kind: "meteor", color: null, cross: 1, row: 5 },
      { beat: 24, col: 8, kind: "strand", color: "cyan", beads: 3 },
      { beat: 28, col: 1, color: "red" },
      { beat: 28, col: 9, color: "red" },
      { beat: 32, col: 7, kind: "veer", color: null },
      { beat: 36, col: 10, kind: "meteor", color: null, cross: 1, row: 4 },
      { beat: 40, col: 1, color: "cyan" },
      { beat: 40, col: 9, color: "cyan" },
      { beat: 44, col: 10, kind: "strand", color: "cyan", beads: 3 },
      { beat: 48, col: 1, kind: "veer", color: null },
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
