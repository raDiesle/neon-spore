import { MAZE_ROUNDS } from "../maze-rounds.js";
import type { Wave } from "../wave-types.js";

/**
 * Waves 170 to 179 of the game, in the order they are played: THE CROSSING's
 * block, the filler before THE MAZE and the boss THE MAZE.
 *
 * Cut by `bun run waves:order --write` (`waves-recut.ts`), which cuts every act
 * after the tutorial arc again in play order. A save that fills it cuts a page
 * after it (`acts.ts`).
 */
export const WAVES_ACT_7: Wave[] = [
  {
    id: "theCrossing",
    name: "THE CROSSING",
    guide: {
      scene: "theCrossing",
    },
    entries: [
      { beat: 0, col: 3, kind: "meteor", color: null, cross: 1, row: 5 },
      { beat: 8, col: 5, color: "red" },
      { beat: 16, col: 8, kind: "meteor", color: null, cross: -1, row: 7 },
      { beat: 24, col: 7, color: "cyan" },
      { beat: 32, col: 3, kind: "meteor", color: null, cross: 1, row: 4 },
      { beat: 40, col: 4, color: "red" },
      { beat: 48, col: 8, kind: "meteor", color: null, cross: -1, row: 6 },
      { beat: 56, col: 3, kind: "meteor", color: null, cross: 1, row: 9 },
    ],
  },
  {
    id: "theCrossingAgain",
    name: "CROSSING DAWN",
    variant: true,
    entries: [
      { beat: 0, col: 4, kind: "meteor", color: null, cross: 1, row: 9 },
      { beat: 7, col: 6, kind: "meteor", color: null, cross: 1, row: 4 },
      { beat: 13, col: 4, kind: "meteor", color: null, cross: 1, row: 9 },
      { beat: 19, col: 6, kind: "meteor", color: null, cross: 1, row: 4 },
      { beat: 27, col: 4, kind: "meteor", color: null, cross: -1, row: 7 },
    ],
  },
  {
    id: "theCrossingReach",
    name: "OUTER CROSSING",
    variant: true,
    entries: [
      { beat: 0, col: 10, kind: "meteor", color: null, cross: 1, row: 5 },
      { beat: 6, col: 2, kind: "meteor", color: null, cross: 1, row: 5 },
      { beat: 12, col: 8, kind: "meteor", color: null, cross: 1, row: 4 },
      { beat: 18, col: 1, kind: "meteor", color: null, cross: 1, row: 4 },
      { beat: 24, col: 6, kind: "meteor", color: null, cross: 1, row: 4 },
      { beat: 29, col: 2, kind: "meteor", color: null, cross: -1, row: 6 },
    ],
  },
  {
    id: "theCrossingPair",
    name: "CROSSING AND SEEDER",
    variant: true,
    entries: [
      { beat: 0, col: 0, color: "red" },
      { beat: 5, col: 5, kind: "meteor", color: null, cross: -1, row: 7 },
      { beat: 11, col: 4, color: "cyan" },
      { beat: 16, col: 5, kind: "seeder", color: "red" },
      { beat: 20, col: 2, color: "red" },
      { beat: 26, col: 8, kind: "meteor", color: null, cross: 1, row: 5 },
      { beat: 30, col: 6, color: "red" },
      { beat: 35, col: 5, kind: "seeder", color: "red" },
    ],
  },
  {
    id: "theCrossingRecall",
    name: "OLD CROSSING SONG",
    variant: true,
    entries: [
      { beat: 0, col: 7, color: "red" },
      { beat: 6, col: 1, kind: "meteor", color: null, cross: -1, row: 6 },
      { beat: 11, col: 3, color: "red" },
      { beat: 16, col: 6, kind: "rind", color: "cyan" },
      { beat: 22, col: 7, color: "cyan" },
      { beat: 27, col: 4, kind: "meteor", color: null, cross: -1, row: 7 },
      { beat: 32, col: 0, color: "red" },
      { beat: 38, col: 7, kind: "rind", color: "red" },
    ],
  },
  {
    id: "theCrossingPeak",
    name: "CROSSING ECLIPSE",
    variant: true,
    entries: [
      { beat: 0, col: 1, color: "red" },
      { beat: 4, col: 5, kind: "meteor", color: null, cross: -1, row: 7 },
      { beat: 4, col: 8, kind: "meteor", color: null, cross: -1, row: 7 },
      { beat: 7, col: 2, color: "cyan" },
      { beat: 15, col: 5, color: "cyan" },
      { beat: 18, col: 4, kind: "seeder", color: "cyan" },
      { beat: 21, col: 6, color: "cyan" },
      { beat: 24, col: 5, kind: "throb", color: "red" },
      { beat: 29, col: 0, color: "red" },
      { beat: 29, col: 10, color: "red" },
      { beat: 34, col: 6, kind: "meteor", color: null, cross: -1, row: 6 },
      { beat: 38, col: 9, kind: "seeder", color: "red" },
      { beat: 42, col: 5, color: "red" },
      { beat: 42, col: 8, color: "red" },
      { beat: 46, col: 2, kind: "throb", color: "red" },
    ],
  },
  {
    id: "fillerMazeBreathe",
    name: "SOFT CROSSING",
    entries: [
      { beat: 0, col: 7, color: "cyan" },
      { beat: 7, col: 8, kind: "meteor", color: null, cross: 1, row: 5 },
      { beat: 14, col: 3, color: "red" },
      { beat: 22, col: 4, kind: "meteor", color: null },
      { beat: 28, col: 5, color: "cyan" },
      { beat: 34, col: 8, kind: "meteor", color: null, cross: -1, row: 7 },
      { beat: 40, col: 7, color: "red" },
    ],
  },
  {
    id: "fillerMazeRecall",
    name: "CROSSING SAGA",
    variant: true,
    entries: [
      { beat: 0, col: 10, color: "red" },
      { beat: 5, col: 6, kind: "meteor", color: null, cross: 1, row: 9 },
      { beat: 10, col: 4, color: "cyan" },
      { beat: 15, col: 1, kind: "throb", color: "red" },
      { beat: 21, col: 2, color: "cyan" },
      { beat: 26, col: 0, kind: "meteor", color: null, cross: 1, row: 9 },
      { beat: 31, col: 3, color: "red" },
      { beat: 37, col: 2, kind: "throb", color: "red" },
    ],
  },
  {
    id: "fillerMazeBend",
    name: "CROSSING RIDDLE",
    variant: true,
    entries: [
      { beat: 0, col: 1, color: "cyan" },
      { beat: 6, col: 3, kind: "meteor", color: null, cross: -1, row: 6 },
      { beat: 6, col: 7, kind: "meteor", color: null, cross: -1, row: 6 },
      { beat: 12, col: 4, color: "cyan" },
      { beat: 17, col: 3, color: "cyan" },
      { beat: 23, col: 1, kind: "seeder", color: "red" },
      { beat: 29, col: 2, color: "red" },
      { beat: 34, col: 9, kind: "meteor", color: null, cross: -1, row: 6 },
      { beat: 42, col: 0, color: "cyan" },
      { beat: 42, col: 10, color: "cyan" },
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
