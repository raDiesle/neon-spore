import { MAZE_ROUNDS } from "../maze-rounds.js";
import type { Wave } from "../wave-types.js";

/**
 * Waves 71 to 83 of the game, in the order they are played: THE LANCE's block
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
      { beat: 7, col: 5, kind: "meteor", color: null },
      { beat: 14, col: 6, kind: "meteor", color: null },
      { beat: 30, col: 5, kind: "meteor", color: null },
    ],
    pods: [
      { beat: 0, col: 4, row: 3, kind: "pod" },
      { beat: 22, col: 4, row: 3, kind: "pod" },
    ],
  },
  {
    id: "theLanceSpread",
    name: "LANCE SCATTER",
    variant: true,
    entries: [
      { beat: 7, col: 5, color: "red" },
      { beat: 14, col: 4, color: "red" },
      { beat: 25, col: 6, color: "red" },
      { beat: 32, col: 5, color: "red" },
    ],
    pods: [
      { beat: 0, col: 4, row: 4, kind: "pod" },
      { beat: 19, col: 3, row: 4, kind: "pod" },
    ],
  },
  {
    id: "theLanceReach",
    name: "LANCE WANDERER",
    variant: true,
    entries: [
      { beat: 6, col: 5, kind: "meteor", color: null },
      { beat: 11, col: 9, kind: "meteor", color: null },
      { beat: 22, col: 10, kind: "meteor", color: null },
      { beat: 27, col: 5, kind: "meteor", color: null },
    ],
    pods: [
      { beat: 0, col: 10, row: 4, kind: "pod" },
      { beat: 16, col: 3, row: 3, kind: "pod" },
    ],
  },
  {
    id: "theLancePair",
    name: "LANCE TANGO",
    variant: true,
    entries: [
      { beat: 0, col: 0, color: "cyan" },
      { beat: 10, col: 10, color: "red" },
      { beat: 21, col: 4, color: "cyan" },
      { beat: 32, col: 4, color: "red" },
    ],
    pods: [
      { beat: 4, col: 4, row: 4, kind: "pod" },
      { beat: 15, col: 2, row: 3, kind: "pod" },
      { beat: 26, col: 10, row: 3, kind: "pod" },
    ],
  },
  {
    id: "theLanceBreathe",
    name: "LANCE LULLABY",
    variant: true,
    entries: [
      { beat: 0, col: 6, color: "cyan" },
      { beat: 12, col: 4, color: "red" },
      { beat: 27, col: 8, color: "red" },
      { beat: 39, col: 6, color: "red" },
    ],
    pods: [
      { beat: 6, col: 7, row: 4, kind: "pod" },
      { beat: 20, col: 2, row: 4, kind: "pod" },
      { beat: 33, col: 7, row: 3, kind: "pod" },
    ],
  },
  {
    id: "theLanceRecall",
    name: "ANCIENT LANCE",
    variant: true,
    entries: [
      { beat: 0, col: 10, color: "red" },
      { beat: 11, col: 3, color: "cyan" },
      { beat: 22, col: 4, color: "cyan" },
      { beat: 33, col: 8, color: "cyan" },
    ],
    pods: [
      { beat: 6, col: 0, row: 4, kind: "pod" },
      { beat: 16, col: 2, row: 3, kind: "pod" },
      { beat: 28, col: 5, row: 4, kind: "pod" },
    ],
  },
  {
    id: "theLanceBend",
    name: "LANCE MIRAGE",
    variant: true,
    entries: [
      { beat: 0, col: 3, color: "cyan" },
      { beat: 12, col: 6, color: "red" },
      { beat: 24, col: 2, color: "red" },
      { beat: 24, col: 8, color: "red" },
      { beat: 40, col: 5, color: "red" },
      { beat: 40, col: 8, color: "red" },
    ],
    pods: [
      { beat: 6, col: 10, row: 4, kind: "pod" },
      { beat: 18, col: 7, row: 3, kind: "pod" },
      { beat: 29, col: 5, row: 3, kind: "pod" },
      { beat: 34, col: 10, row: 3, kind: "pod" },
    ],
  },
  {
    id: "theLancePeak",
    name: "LANCE THUNDER",
    variant: true,
    entries: [
      { beat: 0, col: 9, color: "cyan" },
      { beat: 8, col: 5, color: "cyan" },
      { beat: 16, col: 0, color: "cyan" },
      { beat: 16, col: 10, color: "cyan" },
      { beat: 28, col: 2, color: "cyan" },
      { beat: 28, col: 8, color: "cyan" },
      { beat: 40, col: 1, color: "cyan" },
      { beat: 40, col: 9, color: "cyan" },
    ],
    pods: [
      { beat: 4, col: 1, row: 4, kind: "pod" },
      { beat: 12, col: 10, row: 3, kind: "pod" },
      { beat: 20, col: 7, row: 3, kind: "pod" },
      { beat: 24, col: 0, row: 3, kind: "pod" },
      { beat: 32, col: 3, row: 4, kind: "pod" },
      { beat: 36, col: 2, row: 3, kind: "pod" },
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
