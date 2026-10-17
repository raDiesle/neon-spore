import type { Wave } from "../wave-types.js";

/**
 * Waves 132 to 141 of the game, in the order they are played: THE WEIGHT's
 * block, the filler before THE VANE and the boss THE VANE.
 *
 * Cut by `bun run waves:order --write` (`waves-recut.ts`), which cuts every act
 * after the tutorial arc again in play order. A save that fills it cuts a page
 * after it (`acts.ts`).
 */
export const WAVES_ACT_11: Wave[] = [
  {
    id: "theWeight",
    name: "THE WEIGHT",
    guide: {
      scene: "theWeight",
    },
    entries: [
      { beat: 0, col: 5, kind: "weight", color: null },
      { beat: 14, col: 8, kind: "weight", color: null },
      { beat: 22, col: 3, color: "red" },
      { beat: 34, col: 2, kind: "weight", color: null },
      { beat: 42, col: 10, kind: "weight", color: null },
    ],
  },
  {
    id: "theWeightAgain",
    name: "WEIGHT DAWN",
    variant: true,
    entries: [
      { beat: 0, col: 7, kind: "weight", color: null },
      { beat: 7, col: 4, kind: "weight", color: null },
      { beat: 13, col: 6, kind: "weight", color: null },
      { beat: 20, col: 3, kind: "weight", color: null },
      { beat: 28, col: 6, kind: "weight", color: null },
    ],
  },
  {
    id: "theWeightReach",
    name: "OUTER WEIGHT",
    variant: true,
    entries: [
      { beat: 0, col: 1, kind: "weight", color: null },
      { beat: 6, col: 5, color: "red" },
      { beat: 12, col: 9, kind: "weight", color: null },
      { beat: 18, col: 5, color: "red" },
      { beat: 24, col: 9, kind: "weight", color: null },
      { beat: 30, col: 5, color: "red" },
    ],
  },
  {
    id: "theWeightPair",
    name: "WEIGHT MEETS BEATBOX",
    variant: true,
    entries: [
      { beat: 0, col: 9, color: "red" },
      { beat: 6, col: 3, kind: "weight", color: null },
      { beat: 10, col: 5, color: "cyan" },
      { beat: 16, col: 1, kind: "beatbox", color: null, beats: 2 },
      { beat: 21, col: 10, color: "red" },
      { beat: 27, col: 8, kind: "glutton", color: "cyan" },
      { beat: 33, col: 7, color: "cyan" },
      { beat: 38, col: 5, kind: "weight", color: null },
    ],
  },
  {
    id: "theWeightRecall",
    name: "WEIGHT LEGEND",
    variant: true,
    entries: [
      { beat: 0, col: 8, color: "cyan" },
      { beat: 6, col: 7, kind: "weight", color: null },
      { beat: 12, col: 10, color: "red" },
      { beat: 17, col: 0, kind: "weight", color: null },
      { beat: 23, col: 10, color: "red" },
      { beat: 29, col: 2, kind: "weight", color: null },
      { beat: 35, col: 4, color: "red" },
    ],
  },
  {
    id: "theWeightPeak",
    name: "WEIGHT APOCALYPSE",
    variant: true,
    entries: [
      { beat: 0, col: 7, color: "red" },
      { beat: 4, col: 3, kind: "weight", color: null },
      { beat: 8, col: 5, color: "cyan" },
      { beat: 12, col: 10, kind: "beatbox", color: null, beats: 3 },
      { beat: 16, col: 0, color: "cyan" },
      { beat: 16, col: 10, color: "cyan" },
      { beat: 20, col: 6, kind: "blister", color: null, row: 3, by: 2 },
      { beat: 24, col: 10, kind: "weight", color: null },
      { beat: 28, col: 2, color: "cyan" },
      { beat: 28, col: 8, color: "cyan" },
      { beat: 32, col: 7, kind: "beatbox", color: null, beats: 2 },
      { beat: 36, col: 8, kind: "blister", color: null, row: 3, by: 2 },
      { beat: 40, col: 4, color: "cyan" },
      { beat: 40, col: 7, color: "cyan" },
      { beat: 44, col: 0, kind: "weight", color: null },
      { beat: 48, col: 6, kind: "beatbox", color: null, beats: 4 },
    ],
  },
  {
    id: "fillerVaneBreathe",
    name: "WEIGHT SIESTA",
    entries: [
      { beat: 0, col: 2, color: "cyan" },
      { beat: 8, col: 1, kind: "weight", color: null },
      { beat: 14, col: 9, color: "cyan" },
      { beat: 22, col: 4, kind: "weight", color: null },
      { beat: 30, col: 1, color: "cyan" },
      { beat: 37, col: 4, kind: "weight", color: null },
    ],
  },
  {
    id: "fillerVaneRecall",
    name: "WEIGHT RELIC",
    variant: true,
    entries: [
      { beat: 0, col: 1, color: "red" },
      { beat: 5, col: 8, kind: "weight", color: null },
      { beat: 10, col: 6, color: "cyan" },
      { beat: 15, col: 1, kind: "torch", color: null },
      { beat: 21, col: 8, color: "red" },
      { beat: 26, col: 9, kind: "weight", color: null },
      { beat: 31, col: 2, color: "cyan" },
      { beat: 36, col: 3, kind: "torch", color: null },
    ],
  },
  {
    id: "fillerVaneBend",
    name: "WEIGHT ILLUSION",
    variant: true,
    entries: [
      { beat: 0, col: 10, color: "red" },
      { beat: 5, col: 6, kind: "weight", color: null },
      { beat: 10, col: 0, color: "red" },
      { beat: 16, col: 1, kind: "beatbox", color: null, beats: 3 },
      { beat: 21, col: 5, color: "cyan" },
      { beat: 21, col: 8, color: "cyan" },
      { beat: 26, col: 9, kind: "weight", color: null },
      { beat: 31, col: 3, kind: "beatbox", color: null, beats: 4 },
      { beat: 37, col: 3, color: "cyan" },
      { beat: 37, col: 6, color: "cyan" },
      { beat: 43, col: 4, kind: "weight", color: null },
      { beat: 48, col: 9, kind: "beatbox", color: null, beats: 3 },
    ],
  },
  {
    id: "theVane",
    name: "THE VANE",
    entries: [
      { beat: 0, col: 2, kind: "meteor", color: null },
      { beat: 3, col: 8, color: "red" },
    ],
    boss: { kind: "vane" },
    bossType: "normal",
    controls: "standard5",
  },
];
