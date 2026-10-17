import type { Wave } from "../wave-types.js";

/**
 * Waves 222 to 231 of the game, in the order they are played: THE STRAND's
 * block, the filler before THE THROAT and the boss THE THROAT.
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
      { beat: 0, col: 1, kind: "strand", color: "cyan", beads: 3 },
      { beat: 7, col: 9, kind: "strand", color: "red", beads: 5 },
      { beat: 13, col: 3, kind: "strand", color: "red", beads: 5 },
      { beat: 21, col: 4, kind: "strand", color: "red", beads: 2 },
      { beat: 27, col: 8, kind: "strand", color: "cyan", beads: 3 },
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
      { beat: 0, col: 4, color: "red" },
      { beat: 5, col: 0, kind: "strand", color: "red", beads: 5 },
      { beat: 9, col: 9, color: "red" },
      { beat: 14, col: 1, kind: "veer", color: null },
      { beat: 19, col: 10, color: "cyan" },
      { beat: 24, col: 2, kind: "weight", color: null },
      { beat: 28, col: 4, color: "red" },
      { beat: 33, col: 2, kind: "strand", color: "red", beads: 5 },
    ],
  },
  {
    id: "theStrandRecall",
    name: "STRAND LEGEND",
    variant: true,
    entries: [
      { beat: 0, col: 4, color: "red" },
      { beat: 5, col: 8, kind: "strand", color: "red", beads: 5 },
      { beat: 11, col: 10, color: "cyan" },
      { beat: 17, col: 8, kind: "shell", color: "cyan" },
      { beat: 23, col: 0, color: "red" },
      { beat: 29, col: 10, kind: "strand", color: "cyan", beads: 3 },
      { beat: 35, col: 0, color: "red" },
    ],
  },
  {
    id: "theStrandPeak",
    name: "STRAND APOCALYPSE",
    variant: true,
    entries: [
      { beat: 0, col: 8, color: "cyan" },
      { beat: 4, col: 6, kind: "strand", color: "red", beads: 5 },
      { beat: 8, col: 10, color: "cyan" },
      { beat: 12, col: 5, kind: "veer", color: null },
      { beat: 16, col: 3, color: "cyan" },
      { beat: 16, col: 6, color: "cyan" },
      { beat: 24, col: 7, kind: "strand", color: "red", beads: 5 },
      { beat: 28, col: 1, color: "red" },
      { beat: 28, col: 9, color: "red" },
      { beat: 32, col: 10, kind: "veer", color: null },
      { beat: 40, col: 0, color: "cyan" },
      { beat: 40, col: 10, color: "cyan" },
      { beat: 44, col: 5, kind: "strand", color: "red", beads: 5 },
      { beat: 48, col: 1, kind: "veer", color: null },
    ],
    pods: [
      { beat: 20, col: 2, row: 4, kind: "husk" },
      { beat: 36, col: 7, row: 4, kind: "husk" },
    ],
  },
  {
    id: "fillerThroatBreathe",
    name: "SLEEPY STRAND",
    entries: [
      { beat: 0, col: 1, color: "cyan" },
      { beat: 7, col: 3, kind: "strand", color: "red", beads: 2 },
      { beat: 14, col: 10, color: "cyan" },
      { beat: 20, col: 7, kind: "veer", color: null },
      { beat: 26, col: 5, color: "cyan" },
      { beat: 32, col: 3, kind: "glutton", color: "cyan" },
      { beat: 38, col: 0, color: "red" },
    ],
  },
  {
    id: "fillerThroatRecall",
    name: "OLD STRAND SONG",
    variant: true,
    entries: [
      { beat: 0, col: 4, color: "cyan" },
      { beat: 5, col: 3, kind: "strand", color: "red", beads: 5 },
      { beat: 10, col: 1, color: "red" },
      { beat: 15, col: 7, kind: "weight", color: null },
      { beat: 21, col: 1, color: "red" },
      { beat: 27, col: 3, kind: "strand", color: "red", beads: 5 },
      { beat: 33, col: 0, color: "red" },
      { beat: 39, col: 9, kind: "weight", color: null },
    ],
  },
  {
    id: "fillerThroatBend",
    name: "STRAND SPELL",
    variant: true,
    entries: [
      { beat: 0, col: 2, color: "cyan" },
      { beat: 5, col: 4, kind: "strand", color: "cyan", beads: 3 },
      { beat: 10, col: 7, color: "cyan" },
      { beat: 16, col: 4, kind: "veer", color: null },
      { beat: 22, col: 3, color: "cyan" },
      { beat: 22, col: 6, color: "cyan" },
      { beat: 28, col: 8, kind: "strand", color: "red", beads: 2 },
      { beat: 33, col: 4, kind: "veer", color: null },
      { beat: 38, col: 3, color: "red" },
      { beat: 38, col: 7, color: "red" },
      { beat: 44, col: 1, kind: "strand", color: "red", beads: 2 },
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
