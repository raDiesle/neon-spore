import { MAZE_ROUNDS } from "../maze-rounds.js";
import type { Wave } from "../wave-types.js";

/**
 * Waves 74 to 88 of the game, in the order they are played: THE LANCE's block
 * and the boss THE MAZE.
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
      { beat: 1, col: 3, color: "cyan" },
      { beat: 2, col: 3, color: "cyan" },
      { beat: 10, col: 8, color: "red" },
      { beat: 11, col: 8, color: "red" },
      { beat: 12, col: 8, color: "red" },
    ],
  },
  {
    id: "theLanceAgain",
    name: "FIRST LANCE",
    variant: true,
    entries: [
      { beat: 0, col: 4, kind: "seeder", color: "red" },
      { beat: 8, col: 6, kind: "seeder", color: "red" },
      { beat: 15, col: 4, kind: "seeder", color: "red" },
      { beat: 22, col: 5, kind: "seeder", color: "red" },
      { beat: 29, col: 4, kind: "seeder", color: "cyan" },
    ],
  },
  {
    id: "theLanceSpread",
    name: "LANCE SCATTER",
    variant: true,
    entries: [
      { beat: 0, col: 2, kind: "seeder", color: "cyan" },
      { beat: 6, col: 7, kind: "seeder", color: "red" },
      { beat: 12, col: 4, kind: "seeder", color: "red" },
      { beat: 17, col: 3, kind: "seeder", color: "red" },
      { beat: 22, col: 7, kind: "seeder", color: "cyan" },
      { beat: 29, col: 4, kind: "seeder", color: "cyan" },
    ],
  },
  {
    id: "theLanceReach",
    name: "LANCE WANDERER",
    variant: true,
    entries: [
      { beat: 0, col: 0, kind: "seeder", color: "cyan" },
      { beat: 6, col: 6, kind: "seeder", color: "red" },
      { beat: 12, col: 10, kind: "seeder", color: "red" },
      { beat: 17, col: 3, kind: "seeder", color: "red" },
      { beat: 22, col: 8, kind: "seeder", color: "red" },
      { beat: 27, col: 1, kind: "seeder", color: "red" },
    ],
  },
  {
    id: "theLancePair",
    name: "LANCE TANGO",
    variant: true,
    entries: [
      { beat: 0, col: 3, color: "red" },
      { beat: 4, col: 4, kind: "seeder", color: "red" },
      { beat: 9, col: 0, color: "cyan" },
      { beat: 13, col: 6, kind: "morsel", color: "cyan" },
      { beat: 19, col: 2, color: "red" },
      { beat: 25, col: 5, kind: "seeder", color: "red" },
      { beat: 29, col: 6, color: "cyan" },
      { beat: 34, col: 3, kind: "morsel", color: "red" },
    ],
  },
  {
    id: "theLanceBreathe",
    name: "LANCE LULLABY",
    variant: true,
    entries: [
      { beat: 0, col: 3, color: "cyan" },
      { beat: 6, col: 4, kind: "seeder", color: "red" },
      { beat: 13, col: 5, color: "cyan" },
      { beat: 19, col: 7, kind: "meteor", color: null },
      { beat: 25, col: 3, color: "cyan" },
      { beat: 32, col: 4, kind: "seeder", color: "red" },
      { beat: 39, col: 7, color: "cyan" },
    ],
  },
  {
    id: "theLanceRecall",
    name: "ANCIENT LANCE",
    variant: true,
    entries: [
      { beat: 0, col: 4, color: "cyan" },
      { beat: 5, col: 2, kind: "seeder", color: "red" },
      { beat: 11, col: 8, color: "red" },
      { beat: 17, col: 5, kind: "seeder", color: "red" },
      { beat: 22, col: 4, color: "red" },
      { beat: 27, col: 3, kind: "seeder", color: "cyan" },
      { beat: 32, col: 2, color: "red" },
      { beat: 37, col: 1, kind: "seeder", color: "red" },
    ],
  },
  {
    id: "theLanceBend",
    name: "LANCE MIRAGE",
    variant: true,
    entries: [
      { beat: 0, col: 7, color: "cyan" },
      { beat: 5, col: 5, kind: "seeder", color: "cyan" },
      { beat: 11, col: 8, color: "cyan" },
      { beat: 17, col: 5, kind: "morsel", color: "cyan" },
      { beat: 22, col: 4, color: "red" },
      { beat: 22, col: 7, color: "red" },
      { beat: 27, col: 5, kind: "seeder", color: "red" },
      { beat: 33, col: 3, kind: "morsel", color: "red" },
      { beat: 39, col: 4, color: "red" },
      { beat: 39, col: 7, color: "red" },
      { beat: 44, col: 6, kind: "seeder", color: "red" },
    ],
  },
  {
    id: "theLancePeak",
    name: "LANCE THUNDER",
    variant: true,
    entries: [
      { beat: 0, col: 1, color: "cyan" },
      { beat: 4, col: 9, kind: "seeder", color: "red" },
      { beat: 8, col: 0, color: "cyan" },
      { beat: 12, col: 1, kind: "morsel", color: "red" },
      { beat: 16, col: 5, color: "red" },
      { beat: 16, col: 8, color: "red" },
      { beat: 20, col: 10, kind: "seeder", color: "red" },
      { beat: 24, col: 3, kind: "morsel", color: "red" },
      { beat: 28, col: 3, color: "red" },
      { beat: 28, col: 6, color: "red" },
      { beat: 32, col: 0, kind: "seeder", color: "red" },
      { beat: 36, col: 3, kind: "morsel", color: "cyan" },
      { beat: 40, col: 2, color: "red" },
      { beat: 40, col: 8, color: "red" },
      { beat: 44, col: 5, kind: "seeder", color: "cyan" },
      { beat: 48, col: 2, kind: "morsel", color: "red" },
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
