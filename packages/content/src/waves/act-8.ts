import { MAZE_ROUNDS } from "../maze-rounds.js";
import type { Wave } from "../wave-types.js";

/**
 * Waves 101 to 113 of the game, in the order they are played: the filler before
 * THE MAZE, the boss THE MAZE and THE GLUTTON's block.
 *
 * Cut by `bun run waves:order --write` (`waves-recut.ts`), which cuts every act
 * after the tutorial arc again in play order. A save that fills it cuts a page
 * after it (`acts.ts`).
 */
export const WAVES_ACT_8: Wave[] = [
  {
    id: "fillerMazeBreathe",
    name: "SOFT LANCE",
    entries: [
      { beat: 0, col: 9, color: "red" },
      { beat: 7, col: 4, kind: "seeder", color: "red" },
      { beat: 15, col: 1, color: "red" },
      { beat: 22, col: 3, kind: "seeder", color: "red" },
      { beat: 28, col: 8, color: "red" },
      { beat: 34, col: 9, kind: "seeder", color: "cyan" },
      { beat: 40, col: 7, color: "red" },
    ],
  },
  {
    id: "fillerMazeRecall",
    name: "LANCE SAGA",
    variant: true,
    entries: [
      { beat: 0, col: 9, color: "cyan" },
      { beat: 5, col: 7, kind: "seeder", color: "red" },
      { beat: 10, col: 0, color: "cyan" },
      { beat: 16, col: 4, kind: "seeder", color: "red" },
      { beat: 21, col: 8, color: "cyan" },
      { beat: 27, col: 5, kind: "seeder", color: "red" },
      { beat: 33, col: 6, color: "cyan" },
      { beat: 39, col: 0, kind: "seeder", color: "red" },
    ],
  },
  {
    id: "fillerMazeBend",
    name: "CROOKED LANCE",
    variant: true,
    entries: [
      { beat: 0, col: 1, color: "cyan" },
      { beat: 6, col: 8, kind: "seeder", color: "cyan" },
      { beat: 12, col: 4, color: "red" },
      { beat: 17, col: 3, kind: "morsel", color: "cyan" },
      { beat: 23, col: 5, color: "red" },
      { beat: 23, col: 8, color: "red" },
      { beat: 28, col: 7, kind: "seeder", color: "red" },
      { beat: 34, col: 9, kind: "morsel", color: "red" },
      { beat: 40, col: 4, color: "cyan" },
      { beat: 40, col: 7, color: "cyan" },
      { beat: 46, col: 6, kind: "seeder", color: "cyan" },
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
  {
    id: "theGlutton",
    name: "THE GLUTTON",
    guide: {
      scene: "theGlutton",
    },
    entries: [
      { beat: 0, col: 6, color: "red" },
      { beat: 8, col: 2, kind: "glutton", color: "red" },
      { beat: 18, col: 9, kind: "glutton", color: "cyan" },
    ],
    pods: [
      { beat: 10, col: 4, row: 5, kind: "pod" },
      { beat: 20, col: 7, row: 6, kind: "pod" },
    ],
  },
  {
    id: "theGluttonAgain",
    name: "LITTLE GLUTTON",
    variant: true,
    entries: [
      { beat: 0, col: 6, kind: "glutton", color: "cyan" },
      { beat: 7, col: 4, kind: "glutton", color: "red" },
      { beat: 13, col: 5, kind: "glutton", color: "cyan" },
      { beat: 19, col: 6, kind: "glutton", color: "red" },
      { beat: 25, col: 4, kind: "glutton", color: "red" },
      { beat: 31, col: 6, kind: "glutton", color: "cyan" },
    ],
  },
  {
    id: "theGluttonSpread",
    name: "GLUTTON BLOOM",
    variant: true,
    entries: [
      { beat: 0, col: 8, kind: "glutton", color: "cyan" },
      { beat: 7, col: 3, kind: "glutton", color: "red" },
      { beat: 12, col: 4, kind: "glutton", color: "cyan" },
      { beat: 17, col: 8, kind: "glutton", color: "cyan" },
      { beat: 22, col: 7, kind: "glutton", color: "red" },
      { beat: 28, col: 6, kind: "glutton", color: "cyan" },
    ],
  },
  {
    id: "theGluttonReach",
    name: "GLUTTON PILGRIM",
    variant: true,
    entries: [
      { beat: 0, col: 0, kind: "glutton", color: "cyan" },
      { beat: 6, col: 4, kind: "glutton", color: "cyan" },
      { beat: 12, col: 0, kind: "glutton", color: "red" },
      { beat: 18, col: 5, kind: "glutton", color: "cyan" },
      { beat: 23, col: 1, kind: "glutton", color: "cyan" },
      { beat: 29, col: 9, kind: "glutton", color: "red" },
    ],
  },
  {
    id: "theGluttonPair",
    name: "GLUTTON TOGETHER",
    variant: true,
    entries: [
      { beat: 0, col: 6, color: "red" },
      { beat: 5, col: 2, kind: "glutton", color: "cyan" },
      { beat: 10, col: 4, color: "cyan" },
      { beat: 15, col: 6, kind: "seeder", color: "red" },
      { beat: 19, col: 3, color: "cyan" },
      { beat: 25, col: 7, kind: "glutton", color: "red" },
      { beat: 30, col: 8, color: "cyan" },
      { beat: 34, col: 0, kind: "seeder", color: "red" },
    ],
  },
  {
    id: "theGluttonBreathe",
    name: "GLUTTON SIESTA",
    variant: true,
    entries: [
      { beat: 0, col: 6, color: "cyan" },
      { beat: 6, col: 3, kind: "glutton", color: "red" },
      { beat: 12, col: 4, color: "red" },
      { beat: 20, col: 6, kind: "meteor", color: null },
      { beat: 28, col: 2, color: "cyan" },
      { beat: 35, col: 3, kind: "glutton", color: "red" },
    ],
  },
  {
    id: "theGluttonRecall",
    name: "GLUTTON RELIC",
    variant: true,
    entries: [
      { beat: 0, col: 4, color: "cyan" },
      { beat: 6, col: 9, kind: "glutton", color: "cyan" },
      { beat: 12, col: 6, color: "red" },
      { beat: 17, col: 8, kind: "glutton", color: "red" },
      { beat: 23, col: 9, color: "red" },
      { beat: 28, col: 6, kind: "glutton", color: "red" },
      { beat: 34, col: 9, color: "red" },
      { beat: 39, col: 10, kind: "glutton", color: "cyan" },
    ],
  },
  {
    id: "theGluttonBend",
    name: "GLUTTON ILLUSION",
    variant: true,
    entries: [
      { beat: 0, col: 6, color: "cyan" },
      { beat: 6, col: 8, kind: "glutton", color: "red" },
      { beat: 11, col: 3, color: "red" },
      { beat: 17, col: 1, kind: "seeder", color: "red" },
      { beat: 23, col: 3, color: "cyan" },
      { beat: 23, col: 6, color: "cyan" },
      { beat: 29, col: 5, kind: "glutton", color: "red" },
      { beat: 34, col: 6, kind: "seeder", color: "red" },
      { beat: 40, col: 4, color: "cyan" },
      { beat: 40, col: 7, color: "cyan" },
      { beat: 46, col: 6, kind: "glutton", color: "cyan" },
    ],
  },
  {
    id: "theGluttonPeak",
    name: "GLUTTON STORM",
    variant: true,
    entries: [
      { beat: 0, col: 2, color: "red" },
      { beat: 4, col: 8, kind: "glutton", color: "cyan" },
      { beat: 8, col: 9, color: "cyan" },
      { beat: 12, col: 3, kind: "seeder", color: "red" },
      { beat: 16, col: 3, color: "red" },
      { beat: 16, col: 7, color: "red" },
      { beat: 24, col: 2, kind: "glutton", color: "red" },
      { beat: 28, col: 3, color: "red" },
      { beat: 28, col: 6, color: "red" },
      { beat: 32, col: 0, kind: "seeder", color: "red" },
      { beat: 40, col: 3, color: "cyan" },
      { beat: 40, col: 7, color: "cyan" },
      { beat: 44, col: 9, kind: "glutton", color: "cyan" },
      { beat: 48, col: 2, kind: "seeder", color: "red" },
    ],
    pods: [
      { beat: 20, col: 4, row: 4, kind: "husk" },
      { beat: 36, col: 10, row: 4, kind: "husk" },
    ],
  },
];
