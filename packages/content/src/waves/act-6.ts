import { MAZE_ROUNDS } from "../maze-rounds.js";
import type { Wave } from "../wave-types.js";

/**
 * Waves 77 to 91 of the game, in the order they are played: THE LANCE's block,
 * the filler before THE MAZE and the boss THE MAZE.
 *
 * Cut by `bun run waves:order --write` (`waves-recut.ts`), which cuts every act
 * after the tutorial arc again in play order. A save that fills it cuts a page
 * after it (`acts.ts`).
 */
export const WAVES_ACT_6: Wave[] = [
  {
    id: "theLance",
    name: "THE LANCE",
    guide: {
      scene: "theLance",
    },
    entries: [
      { beat: 0, col: 3, color: "cyan" },
      { beat: 8, col: 3, color: "cyan" },
      { beat: 16, col: 3, color: "cyan" },
      { beat: 24, col: 8, color: "red" },
      { beat: 32, col: 8, color: "red" },
      { beat: 40, col: 8, color: "red" },
    ],
  },
  {
    id: "theLanceAgain",
    name: "FIRST LANCE",
    variant: true,
    entries: [
      { beat: 0, col: 6, kind: "seeder", color: "cyan" },
      { beat: 7, col: 5, kind: "seeder", color: "red" },
      { beat: 15, col: 4, kind: "seeder", color: "red" },
      { beat: 22, col: 6, kind: "seeder", color: "red" },
      { beat: 28, col: 4, kind: "seeder", color: "cyan" },
    ],
  },
  {
    id: "theLanceReach",
    name: "LANCE WANDERER",
    variant: true,
    entries: [
      { beat: 0, col: 9, kind: "seeder", color: "red" },
      { beat: 5, col: 4, kind: "seeder", color: "red" },
      { beat: 10, col: 0, kind: "seeder", color: "red" },
      { beat: 16, col: 6, kind: "seeder", color: "cyan" },
      { beat: 22, col: 2, kind: "seeder", color: "red" },
      { beat: 28, col: 9, kind: "seeder", color: "red" },
    ],
  },
  {
    id: "theLancePair",
    name: "LANCE TANGO",
    variant: true,
    entries: [
      { beat: 0, col: 0, color: "red" },
      { beat: 5, col: 4, kind: "seeder", color: "red" },
      { beat: 11, col: 0, color: "cyan" },
      { beat: 17, col: 5, kind: "morsel", color: "cyan" },
      { beat: 21, col: 9, color: "red" },
      { beat: 27, col: 4, kind: "seeder", color: "cyan" },
      { beat: 33, col: 6, color: "red" },
      { beat: 38, col: 0, kind: "morsel", color: "cyan" },
    ],
  },
  {
    id: "theLanceRecall",
    name: "ANCIENT LANCE",
    variant: true,
    entries: [
      { beat: 0, col: 2, color: "cyan" },
      { beat: 5, col: 0, kind: "seeder", color: "red" },
      { beat: 11, col: 10, color: "cyan" },
      { beat: 19, col: 8, kind: "seeder", color: "cyan" },
      { beat: 25, col: 0, color: "cyan" },
      { beat: 32, col: 9, kind: "seeder", color: "red" },
      { beat: 37, col: 4, color: "cyan" },
    ],
  },
  {
    id: "theLancePeak",
    name: "LANCE THUNDER",
    variant: true,
    entries: [
      { beat: 0, col: 4, color: "cyan" },
      { beat: 4, col: 3, kind: "seeder", color: "red" },
      { beat: 8, col: 7, color: "cyan" },
      { beat: 12, col: 10, kind: "morsel", color: "red" },
      { beat: 16, col: 1, color: "cyan" },
      { beat: 16, col: 9, color: "cyan" },
      { beat: 24, col: 2, kind: "meteor", color: null },
      { beat: 29, col: 8, kind: "seeder", color: "red" },
      { beat: 33, col: 1, color: "cyan" },
      { beat: 33, col: 9, color: "cyan" },
      { beat: 38, col: 3, kind: "morsel", color: "cyan" },
      { beat: 42, col: 2, kind: "meteor", color: null },
      { beat: 48, col: 1, color: "red" },
      { beat: 48, col: 9, color: "red" },
    ],
  },
  {
    id: "theCage",
    name: "THE CAGE",
    variant: true,
    entries: [
      { beat: 0, col: 8, color: "red" },
      { beat: 10, col: 2, color: "cyan" },
      { beat: 22, col: 6, color: "red" },
    ],
    pods: [
      { beat: 2, col: 3, row: 3, kind: "pod", due: 24, tint: "cyan" },
      { beat: 14, col: 7, row: 4, kind: "pod", due: 24, tint: "red" },
    ],
  },
  {
    id: "theAnchor",
    name: "THE ANCHOR",
    variant: true,
    entries: [
      { beat: 0, col: 2, color: "cyan" },
      { beat: 12, col: 8, color: "red" },
      { beat: 24, col: 4, color: "cyan" },
    ],
    pods: [
      { beat: 2, col: 5, row: 3, kind: "pod", due: 24, heavy: true },
      { beat: 18, col: 8, row: 4, kind: "pod", due: 24, heavy: true },
    ],
  },
  {
    id: "thePendulum",
    name: "THE PENDULUM",
    variant: true,
    entries: [
      { beat: 0, col: 5, color: "red" },
      { beat: 12, col: 1, color: "cyan" },
      { beat: 24, col: 9, color: "red" },
    ],
    pods: [
      { beat: 2, col: 3, row: 3, kind: "pod", due: 24, swing: true },
      { beat: 16, col: 7, row: 3, kind: "pod", due: 24, swing: true },
    ],
  },
  {
    id: "theTwins",
    name: "THE TWINS",
    variant: true,
    entries: [
      { beat: 0, col: 9, color: "cyan" },
      { beat: 10, col: 1, color: "red" },
      { beat: 22, col: 8, color: "red" },
    ],
    pods: [
      { beat: 2, col: 2, row: 3, kind: "pod", due: 20 },
      { beat: 2, col: 5, row: 4, kind: "pod", due: 20 },
      { beat: 16, col: 6, row: 3, kind: "pod", due: 20 },
      { beat: 16, col: 9, row: 4, kind: "pod", due: 20 },
    ],
  },
  {
    id: "theLastRock",
    name: "THE LAST ROCK",
    variant: true,
    entries: [
      { beat: 4, col: 3, kind: "meteor", color: null },
      { beat: 10, col: 7, kind: "meteor", color: null },
      { beat: 16, col: 5, kind: "meteor", color: null },
      { beat: 20, col: 2, kind: "meteor", color: null },
      { beat: 24, col: 6, kind: "meteor", color: null },
    ],
    pods: [{ beat: 12, col: 5, row: 2, kind: "pod", due: 20 }],
  },
  {
    id: "fillerMazeBreathe",
    name: "SOFT LANCE",
    entries: [
      { beat: 0, col: 9, color: "red" },
      { beat: 6, col: 8, kind: "seeder", color: "red" },
      { beat: 12, col: 2, color: "cyan" },
      { beat: 20, col: 7, kind: "meteor", color: null },
      { beat: 26, col: 8, color: "cyan" },
      { beat: 34, col: 6, kind: "seeder", color: "red" },
      { beat: 40, col: 7, color: "cyan" },
    ],
  },
  {
    id: "fillerMazeRecall",
    name: "LANCE SAGA",
    variant: true,
    entries: [
      { beat: 0, col: 3, color: "red" },
      { beat: 5, col: 1, kind: "seeder", color: "red" },
      { beat: 10, col: 6, color: "red" },
      { beat: 16, col: 2, kind: "blister", color: null, row: 3, by: 2 },
      { beat: 22, col: 8, color: "cyan" },
      { beat: 27, col: 5, kind: "seeder", color: "red" },
      { beat: 33, col: 4, color: "red" },
      { beat: 38, col: 3, kind: "blister", color: null, row: 3, by: 2 },
    ],
  },
  {
    id: "fillerMazeBend",
    name: "CROOKED LANCE",
    variant: true,
    entries: [
      { beat: 0, col: 8, color: "red" },
      { beat: 5, col: 7, kind: "seeder", color: "cyan" },
      { beat: 10, col: 6, color: "red" },
      { beat: 16, col: 3, kind: "morsel", color: "cyan" },
      { beat: 21, col: 5, color: "cyan" },
      { beat: 21, col: 8, color: "cyan" },
      { beat: 27, col: 7, kind: "seeder", color: "red" },
      { beat: 33, col: 8, kind: "morsel", color: "red" },
      { beat: 39, col: 5, color: "red" },
      { beat: 39, col: 8, color: "red" },
      { beat: 45, col: 6, kind: "seeder", color: "red" },
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
