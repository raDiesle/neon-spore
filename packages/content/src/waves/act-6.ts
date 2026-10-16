import { MAZE_ROUNDS } from "../maze-rounds.js";
import type { Wave } from "../wave-types.js";

/**
 * Waves 68 to 77 of the game, in the order they are played: THE WEIGHT's block
 * and the boss THE MAZE.
 *
 * Cut by `bun run waves:order --write` (`waves-recut.ts`), which cuts every act
 * after the tutorial arc again in play order. A save that fills it cuts a page
 * after it (`acts.ts`).
 */
export const WAVES_ACT_6: Wave[] = [
  {
    id: "theWeight",
    name: "THE WEIGHT",
    guide: {
      scene: "theWeight",
    },
    entries: [
      { beat: 0, col: 5, kind: "weight", color: null },
      { beat: 14, col: 8, kind: "weight", color: null },
      { beat: 18, col: 3, color: "red" },
      { beat: 30, col: 2, kind: "weight", color: null },
      { beat: 32, col: 10, kind: "weight", color: null },
    ],
  },
  {
    id: "theWeightAgain",
    name: "WEIGHT DAWN",
    variant: true,
    entries: [
      { beat: 0, col: 4, kind: "weight", color: null },
      { beat: 8, col: 6, kind: "weight", color: null },
      { beat: 16, col: 5, kind: "weight", color: null },
      { beat: 23, col: 4, kind: "weight", color: null },
      { beat: 30, col: 6, kind: "weight", color: null },
    ],
  },
  {
    id: "theWeightSpread",
    name: "WEIGHT SEEDS",
    variant: true,
    entries: [
      { beat: 0, col: 3, kind: "weight", color: null },
      { beat: 6, col: 4, kind: "weight", color: null },
      { beat: 11, col: 6, kind: "weight", color: null },
      { beat: 18, col: 7, kind: "weight", color: null },
      { beat: 24, col: 4, kind: "weight", color: null },
      { beat: 29, col: 8, kind: "weight", color: null },
    ],
  },
  {
    id: "theWeightReach",
    name: "OUTER WEIGHT",
    variant: true,
    entries: [
      { beat: 0, col: 0, kind: "weight", color: null },
      { beat: 5, col: 4, kind: "weight", color: null },
      { beat: 11, col: 9, kind: "weight", color: null },
      { beat: 17, col: 3, kind: "weight", color: null },
      { beat: 22, col: 8, kind: "weight", color: null },
      { beat: 28, col: 4, kind: "weight", color: null },
    ],
  },
  {
    id: "theWeightPair",
    name: "WEIGHT MEETS BEATBOX",
    variant: true,
    entries: [
      { beat: 0, col: 2, color: "red" },
      { beat: 5, col: 7, kind: "weight", color: null },
      { beat: 11, col: 10, color: "red" },
      { beat: 17, col: 8, kind: "beatbox", color: null, beats: 3 },
      { beat: 22, col: 2, color: "cyan" },
      { beat: 26, col: 1, kind: "weight", color: null },
      { beat: 30, col: 4, color: "red" },
      { beat: 35, col: 10, kind: "beatbox", color: null, beats: 4 },
    ],
  },
  {
    id: "theWeightBreathe",
    name: "WEIGHT DREAM",
    variant: true,
    entries: [
      { beat: 0, col: 3, color: "cyan" },
      { beat: 7, col: 2, kind: "weight", color: null },
      { beat: 13, col: 5, color: "red" },
      { beat: 20, col: 3, kind: "meteor", color: null },
      { beat: 27, col: 5, color: "cyan" },
      { beat: 33, col: 4, kind: "weight", color: null },
      { beat: 39, col: 6, color: "red" },
    ],
  },
  {
    id: "theWeightRecall",
    name: "WEIGHT LEGEND",
    variant: true,
    entries: [
      { beat: 0, col: 4, color: "red" },
      { beat: 6, col: 7, kind: "weight", color: null },
      { beat: 12, col: 2, color: "cyan" },
      { beat: 23, col: 0, color: "cyan" },
      { beat: 29, col: 6, kind: "weight", color: null },
      { beat: 34, col: 5, color: "cyan" },
    ],
    pods: [{ beat: 18, col: 7, row: 3, kind: "pod" }],
  },
  {
    id: "theWeightBend",
    name: "TWISTED WEIGHT",
    variant: true,
    entries: [
      { beat: 0, col: 6, color: "red" },
      { beat: 6, col: 5, kind: "weight", color: null },
      { beat: 12, col: 1, color: "cyan" },
      { beat: 17, col: 2, kind: "beatbox", color: null, beats: 2 },
      { beat: 23, col: 3, color: "red" },
      { beat: 23, col: 7, color: "red" },
      { beat: 29, col: 9, kind: "weight", color: null },
      { beat: 34, col: 6, kind: "beatbox", color: null, beats: 2 },
      { beat: 40, col: 5, color: "cyan" },
      { beat: 40, col: 8, color: "cyan" },
      { beat: 45, col: 9, kind: "weight", color: null },
    ],
  },
  {
    id: "theWeightPeak",
    name: "WEIGHT APOCALYPSE",
    variant: true,
    entries: [
      { beat: 0, col: 3, color: "red" },
      { beat: 4, col: 1, kind: "weight", color: null },
      { beat: 8, col: 10, color: "red" },
      { beat: 12, col: 5, kind: "beatbox", color: null, beats: 3 },
      { beat: 16, col: 3, color: "red" },
      { beat: 16, col: 7, color: "red" },
      { beat: 20, col: 5, kind: "weight", color: null },
      { beat: 24, col: 8, kind: "beatbox", color: null, beats: 2 },
      { beat: 28, col: 4, color: "red" },
      { beat: 28, col: 7, color: "red" },
      { beat: 32, col: 8, kind: "weight", color: null },
      { beat: 36, col: 6, kind: "beatbox", color: null, beats: 3 },
      { beat: 40, col: 4, color: "red" },
      { beat: 40, col: 7, color: "red" },
      { beat: 44, col: 8, kind: "weight", color: null },
      { beat: 48, col: 4, kind: "beatbox", color: null, beats: 3 },
    ],
  },
  {
    id: "theMaze",
    name: "THE MAZE",
    guide: {
      scene: "theMaze",
    },
    entries: [],
    boss: { kind: "maze", rounds: MAZE_ROUNDS },
    bossType: "special",
    controls: "standard5",
  },
];
