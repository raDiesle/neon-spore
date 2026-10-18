import type { Wave } from "../wave-types.js";

/**
 * Waves 476 to 485 of the game, in the order they are played: THE VEIL's block,
 * the filler before THE SPOOL and the boss THE SPOOL.
 *
 * Cut by `bun run waves:order --write` (`waves-recut.ts`), which cuts every act
 * after the tutorial arc again in play order. A save that fills it cuts a page
 * after it (`acts.ts`).
 */
export const WAVES_ACT_40: Wave[] = [
  {
    id: "theVeil",
    name: "THE VEIL",
    guide: {
      scene: "theVeil",
    },
    entries: [
      { beat: 0, col: 5, kind: "veil", color: null },
      { beat: 10, col: 2, kind: "veil", color: null },
      { beat: 11, col: 8, kind: "veil", color: null },
      { beat: 18, col: 3, kind: "veil", color: null },
      { beat: 24, col: 0, kind: "veil", color: null },
    ],
  },
  {
    id: "theVeilAgain",
    name: "VEIL DAWN",
    variant: true,
    entries: [
      { beat: 0, col: 3, kind: "veil", color: null },
      { beat: 8, col: 10, kind: "mine", color: "cyan", row: 6, sees: 2 },
      { beat: 15, col: 6, kind: "recoil", color: "red" },
      { beat: 23, col: 7, kind: "veil", color: null },
      { beat: 31, col: 5, kind: "mine", color: "cyan", row: 11, sees: 1 },
    ],
  },
  {
    id: "theVeilReach",
    name: "LONG VEIL ROAD",
    variant: true,
    entries: [
      { beat: 0, col: 1, kind: "veil", color: null },
      { beat: 6, col: 8, kind: "mine", color: "red", row: 3, sees: 2 },
      { beat: 12, col: 1, kind: "countdown", color: "red" },
      { beat: 17, col: 6, kind: "veil", color: null },
      { beat: 23, col: 0, kind: "mine", color: "red", row: 9, sees: 1 },
      { beat: 29, col: 7, kind: "countdown", color: "cyan" },
    ],
  },
  {
    id: "theVeilPair",
    name: "VEIL WALTZ",
    variant: true,
    entries: [
      { beat: 0, col: 9, color: "red" },
      { beat: 5, col: 10, kind: "veil", color: null },
      { beat: 11, col: 9, color: "red" },
      { beat: 17, col: 5, kind: "mine", color: "red", row: 9, sees: 1 },
      { beat: 21, col: 0, color: "red" },
      { beat: 21, col: 10, color: "red" },
      { beat: 29, col: 5, kind: "rind", color: "red" },
      { beat: 33, col: 7, kind: "veil", color: null },
      { beat: 39, col: 3, color: "red" },
      { beat: 39, col: 7, color: "red" },
    ],
  },
  {
    id: "theVeilRecall",
    name: "VEIL HOMECOMING",
    variant: true,
    entries: [
      { beat: 0, col: 1, color: "cyan" },
      { beat: 6, col: 8, kind: "veil", color: null },
      { beat: 12, col: 3, color: "cyan" },
      { beat: 18, col: 8, kind: "clasp", color: "cyan" },
      { beat: 24, col: 0, color: "cyan" },
      { beat: 24, col: 10, color: "cyan" },
      { beat: 30, col: 2, kind: "veil", color: null },
      { beat: 35, col: 9, kind: "clasp", color: "red" },
    ],
  },
  {
    id: "theVeilPeak",
    name: "VEIL RAPTURE",
    variant: true,
    entries: [
      { beat: 0, col: 3, color: "red" },
      { beat: 6, col: 10, kind: "veil", color: null },
      { beat: 9, col: 0, color: "red" },
      { beat: 9, col: 10, color: "red" },
      { beat: 17, col: 1, kind: "mine", color: "red", row: 9, sees: 1 },
      { beat: 21, col: 2, kind: "echo", color: "cyan" },
      { beat: 25, col: 3, color: "red" },
      { beat: 25, col: 6, color: "red" },
      { beat: 29, col: 2, kind: "veil", color: null },
      { beat: 35, col: 10, kind: "mine", color: "red", row: 9, sees: 1 },
      { beat: 39, col: 3, color: "cyan" },
      { beat: 39, col: 7, color: "cyan" },
      { beat: 42, col: 9, kind: "echo", color: "cyan" },
      { beat: 47, col: 4, kind: "veil", color: null },
    ],
  },
  {
    id: "fillerSpoolBreathe",
    name: "VEIL PICNIC",
    entries: [
      { beat: 0, col: 2, color: "red" },
      { beat: 6, col: 10, kind: "veil", color: null },
      { beat: 13, col: 0, color: "cyan" },
      { beat: 19, col: 3, kind: "mine", color: "red", row: 3, sees: 2 },
      { beat: 26, col: 8, color: "cyan" },
      { beat: 34, col: 6, kind: "volley", color: "cyan" },
    ],
  },
  {
    id: "fillerSpoolRecall",
    name: "VEIL LEGEND",
    variant: true,
    entries: [
      { beat: 0, col: 3, color: "cyan" },
      { beat: 6, col: 8, kind: "veil", color: null },
      { beat: 12, col: 2, color: "cyan" },
      { beat: 12, col: 8, color: "cyan" },
      { beat: 18, col: 9, kind: "beatbox", color: null, beats: 4 },
      { beat: 24, col: 1, kind: "veil", color: null },
      { beat: 29, col: 5, color: "cyan" },
      { beat: 29, col: 8, color: "cyan" },
      { beat: 34, col: 1, kind: "beatbox", color: null, beats: 3 },
      { beat: 39, col: 0, kind: "veil", color: null },
    ],
  },
  {
    id: "fillerSpoolBend",
    name: "VEIL RIDDLE",
    variant: true,
    entries: [
      { beat: 0, col: 2, color: "red" },
      { beat: 0, col: 8, color: "red" },
      { beat: 5, col: 8, kind: "veil", color: null },
      { beat: 10, col: 4, kind: "mine", color: "cyan", row: 11, sees: 1 },
      { beat: 15, col: 1, color: "cyan" },
      { beat: 15, col: 9, color: "cyan" },
      { beat: 20, col: 0, kind: "veil", color: null },
      { beat: 25, col: 2, kind: "mine", color: "red", row: 3, sees: 2 },
      { beat: 31, col: 2, color: "cyan" },
      { beat: 31, col: 8, color: "cyan" },
      { beat: 36, col: 5, kind: "veil", color: null },
      { beat: 41, col: 9, kind: "mine", color: "cyan", row: 6, sees: 2 },
      { beat: 47, col: 2, color: "red" },
      { beat: 47, col: 8, color: "red" },
    ],
  },
  {
    id: "theSpool",
    name: "THE SPOOL",
    guide: {
      scene: "theSpool",
    },
    entries: [],
    boss: { kind: "spool" },
    bossType: "normal",
  },
];
