import type { Wave } from "../wave-types.js";

/**
 * Waves 551 to 559 of the game, in the order they are played: THE GYRE's review
 * and the boss THE LATCH.
 *
 * Cut by `bun run waves:order --write` (`waves-recut.ts`), which cuts every act
 * after the tutorial arc again in play order. A save that fills it cuts a page
 * after it (`acts.ts`).
 */
export const WAVES_ACT_55: Wave[] = [
  {
    id: "reviewGyreAgain",
    name: "GYRE DAWN",
    entries: [
      { beat: 0, col: 10, kind: "gyre", color: null },
      { beat: 8, col: 2, kind: "echo", color: "cyan" },
      { beat: 15, col: 8, kind: "blister", color: null, row: 2, by: 2, gesture: "swipe" },
      { beat: 23, col: 0, kind: "gyre", color: null },
      { beat: 31, col: 8, kind: "echo", color: "red" },
    ],
  },
  {
    id: "reviewGyreSpread",
    name: "GYRE SEEDS",
    variant: true,
    entries: [
      { beat: 0, col: 8, kind: "gyre", color: null },
      { beat: 7, col: 0, kind: "echo", color: "red" },
      { beat: 12, col: 9, kind: "lure", color: "cyan" },
      { beat: 19, col: 3, kind: "gyre", color: null },
      { beat: 24, col: 7, kind: "echo", color: "red" },
      { beat: 30, col: 6, kind: "lure", color: "red" },
    ],
  },
  {
    id: "reviewGyreReach",
    name: "OUTER GYRE",
    variant: true,
    entries: [
      { beat: 0, col: 10, kind: "gyre", color: null },
      { beat: 5, col: 0, kind: "echo", color: "cyan" },
      { beat: 11, col: 10, kind: "veer", color: null },
      { beat: 17, col: 1, kind: "gyre", color: null },
      { beat: 22, col: 5, kind: "echo", color: "red" },
      { beat: 28, col: 1, kind: "veer", color: null },
    ],
  },
  {
    id: "reviewGyrePair",
    name: "GYRE MEETS ECHO",
    variant: true,
    entries: [
      { beat: 0, col: 2, color: "cyan" },
      { beat: 6, col: 9, kind: "gyre", color: null },
      { beat: 12, col: 0, color: "cyan" },
      { beat: 12, col: 10, color: "cyan" },
      { beat: 18, col: 3, kind: "echo", color: "red" },
      { beat: 22, col: 8, kind: "throb", color: "red" },
      { beat: 27, col: 3, color: "red" },
      { beat: 27, col: 7, color: "red" },
      { beat: 31, col: 8, kind: "gyre", color: null },
      { beat: 37, col: 3, kind: "echo", color: "cyan" },
    ],
  },
  {
    id: "reviewGyreBreathe",
    name: "GYRE DREAM",
    variant: true,
    entries: [
      { beat: 0, col: 8, color: "cyan" },
      { beat: 7, col: 1, kind: "gyre", color: null },
      { beat: 15, col: 10, color: "red" },
      { beat: 21, col: 0, kind: "echo", color: "cyan" },
      { beat: 28, col: 2, color: "cyan" },
      { beat: 36, col: 1, kind: "shell", color: "red" },
    ],
  },
  {
    id: "reviewGyreRecall",
    name: "GYRE LEGEND",
    variant: true,
    entries: [
      { beat: 0, col: 3, color: "cyan" },
      { beat: 5, col: 10, kind: "gyre", color: null },
      { beat: 11, col: 3, color: "red" },
      { beat: 11, col: 7, color: "red" },
      { beat: 21, col: 6, kind: "gyre", color: null },
      { beat: 27, col: 3, color: "cyan" },
      { beat: 27, col: 7, color: "cyan" },
      { beat: 38, col: 1, kind: "gyre", color: null },
    ],
    pods: [
      { beat: 16, col: 5, row: 3, kind: "pod" },
      { beat: 33, col: 8, row: 3, kind: "pod" },
    ],
  },
  {
    id: "reviewGyreBend",
    name: "TWISTED GYRE",
    variant: true,
    entries: [
      { beat: 0, col: 3, color: "cyan" },
      { beat: 0, col: 6, color: "cyan" },
      { beat: 5, col: 1, kind: "gyre", color: null },
      { beat: 10, col: 6, kind: "echo", color: "cyan" },
      { beat: 16, col: 0, color: "cyan" },
      { beat: 16, col: 10, color: "cyan" },
      { beat: 21, col: 5, kind: "gyre", color: null },
      { beat: 27, col: 1, kind: "echo", color: "red" },
      { beat: 32, col: 0, color: "cyan" },
      { beat: 32, col: 10, color: "cyan" },
      { beat: 37, col: 4, kind: "gyre", color: null },
      { beat: 43, col: 9, kind: "echo", color: "red" },
      { beat: 48, col: 0, color: "cyan" },
      { beat: 48, col: 10, color: "cyan" },
    ],
  },
  {
    id: "reviewGyrePeak",
    name: "GYRE APOCALYPSE",
    variant: true,
    entries: [
      { beat: 0, col: 4, color: "red" },
      { beat: 0, col: 7, color: "red" },
      { beat: 4, col: 9, kind: "gyre", color: null },
      { beat: 8, col: 4, kind: "echo", color: "red" },
      { beat: 12, col: 2, color: "red" },
      { beat: 12, col: 8, color: "red" },
      { beat: 16, col: 9, kind: "shell", color: "red" },
      { beat: 20, col: 3, kind: "gyre", color: null },
      { beat: 24, col: 1, color: "cyan" },
      { beat: 24, col: 9, color: "cyan" },
      { beat: 28, col: 7, kind: "echo", color: "red" },
      { beat: 31, col: 5, kind: "shell", color: "cyan" },
      { beat: 35, col: 3, color: "cyan" },
      { beat: 35, col: 7, color: "cyan" },
      { beat: 39, col: 4, kind: "gyre", color: null },
      { beat: 43, col: 2, kind: "echo", color: "red" },
      { beat: 47, col: 0, color: "cyan" },
      { beat: 47, col: 10, color: "cyan" },
    ],
  },
  {
    id: "theLatch",
    name: "THE LATCH",
    guide: {
      scene: "theLatch",
    },
    entries: [],
    boss: {
      kind: "latch",
      steps: [
        { ask: "haul", knots: 2, beats: 28 },
        { ask: "yank", knots: 2, beats: 32 },
        { ask: "cross", knots: 2, beats: 32 },
      ],
    },
    bossType: "normal",
    controls: "scene",
  },
];
