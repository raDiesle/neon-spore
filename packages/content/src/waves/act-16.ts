import type { Wave } from "../wave-types.js";

/**
 * Waves 163 to 172 of the game, in the order they are played: THE RIND's block
 * and the boss THE BATON.
 *
 * Cut by `bun run waves:order --write` (`waves-recut.ts`), which cuts every act
 * after the tutorial arc again in play order. A save that fills it cuts a page
 * after it (`acts.ts`).
 */
export const WAVES_ACT_16: Wave[] = [
  {
    id: "theRind",
    name: "THE RIND",
    guide: {
      scene: "theRind",
    },
    entries: [
      { beat: 0, col: 5, kind: "rind", color: "red" },
      { beat: 8, col: 2, kind: "rind", color: "cyan" },
      { beat: 18, col: 3, kind: "rind", color: "cyan" },
      { beat: 21, col: 8, kind: "rind", color: "red" },
    ],
  },
  {
    id: "theRindAgain",
    name: "RINDS AGAIN",
    variant: true,
    entries: [
      { beat: 0, col: 7, kind: "rind", color: "red" },
      { beat: 8, col: 2, kind: "rind", color: "red" },
      { beat: 16, col: 7, kind: "rind", color: "red" },
      { beat: 24, col: 2, kind: "rind", color: "red" },
      { beat: 32, col: 3, kind: "rind", color: "cyan" },
    ],
  },
  {
    id: "theRindSpread",
    name: "RINDS SPREAD",
    variant: true,
    entries: [
      { beat: 0, col: 6, kind: "rind", color: "red" },
      { beat: 5, col: 7, kind: "rind", color: "cyan" },
      { beat: 10, col: 9, kind: "rind", color: "red" },
      { beat: 17, col: 10, kind: "rind", color: "red" },
      { beat: 23, col: 9, kind: "rind", color: "red" },
      { beat: 29, col: 10, kind: "rind", color: "cyan" },
    ],
  },
  {
    id: "theRindReach",
    name: "RINDS FAR APART",
    variant: true,
    entries: [
      { beat: 0, col: 10, kind: "rind", color: "red" },
      { beat: 12, col: 0, kind: "rind", color: "red" },
      { beat: 24, col: 2, kind: "rind", color: "cyan" },
    ],
    pods: [
      { beat: 6, col: 5, row: 4, kind: "purge", husk: true },
      { beat: 18, col: 6, row: 4, kind: "purge", husk: true },
    ],
  },
  {
    id: "theRindPair",
    name: "RIND AND HUSK",
    variant: true,
    entries: [
      { beat: 0, col: 9, color: "cyan" },
      { beat: 4, col: 8, kind: "rind", color: "red" },
      { beat: 9, col: 10, color: "cyan" },
      { beat: 19, col: 3, color: "cyan" },
      { beat: 29, col: 6, color: "red" },
      { beat: 34, col: 5, kind: "rind", color: "cyan" },
    ],
    pods: [
      { beat: 14, col: 4, row: 4, kind: "purge", husk: true },
      { beat: 23, col: 5, row: 3, kind: "ward" },
    ],
  },
  {
    id: "theRindBreathe",
    name: "EASY RINDS",
    variant: true,
    entries: [
      { beat: 0, col: 0, color: "cyan" },
      { beat: 8, col: 5, kind: "rind", color: "cyan" },
      { beat: 16, col: 3, color: "cyan" },
      { beat: 24, col: 1, kind: "rind", color: "cyan" },
      { beat: 32, col: 9, color: "cyan" },
      { beat: 40, col: 3, kind: "rind", color: "red" },
    ],
  },
  {
    id: "theRindRecall",
    name: "RIND RECALL",
    variant: true,
    entries: [
      { beat: 0, col: 0, color: "cyan" },
      { beat: 6, col: 1, kind: "rind", color: "red" },
      { beat: 11, col: 5, color: "cyan" },
      { beat: 16, col: 4, kind: "weight", color: null },
      { beat: 22, col: 5, color: "red" },
      { beat: 27, col: 3, kind: "rind", color: "cyan" },
      { beat: 32, col: 4, color: "cyan" },
      { beat: 37, col: 1, kind: "weight", color: null },
    ],
  },
  {
    id: "theRindBend",
    name: "RINDS AND TWINS",
    variant: true,
    entries: [
      { beat: 0, col: 3, color: "cyan" },
      { beat: 6, col: 1, kind: "rind", color: "cyan" },
      { beat: 12, col: 2, color: "cyan" },
      { beat: 23, col: 4, color: "cyan" },
      { beat: 23, col: 7, color: "cyan" },
      { beat: 29, col: 5, kind: "rind", color: "red" },
      { beat: 40, col: 5, color: "red" },
      { beat: 40, col: 8, color: "red" },
      { beat: 46, col: 9, kind: "rind", color: "red" },
    ],
    pods: [
      { beat: 17, col: 10, row: 4, kind: "purge", husk: true },
      { beat: 34, col: 0, row: 4, kind: "purge", husk: true },
    ],
  },
  {
    id: "theRindPeak",
    name: "RIND PEAK",
    variant: true,
    entries: [
      { beat: 0, col: 0, color: "cyan" },
      { beat: 4, col: 1, kind: "rind", color: "red" },
      { beat: 8, col: 5, color: "red" },
      { beat: 16, col: 3, color: "red" },
      { beat: 16, col: 6, color: "red" },
      { beat: 20, col: 0, kind: "beatbox", color: null, beats: 2 },
      { beat: 24, col: 1, kind: "rind", color: "cyan" },
      { beat: 28, col: 3, color: "red" },
      { beat: 28, col: 7, color: "red" },
      { beat: 36, col: 6, kind: "beatbox", color: null, beats: 4 },
      { beat: 40, col: 5, color: "cyan" },
      { beat: 40, col: 8, color: "cyan" },
      { beat: 44, col: 9, kind: "rind", color: "cyan" },
    ],
    pods: [
      { beat: 12, col: 8, row: 4, kind: "purge", husk: true },
      { beat: 32, col: 3, row: 4, kind: "purge", husk: true },
    ],
  },
  {
    id: "theBaton",
    name: "THE BATON",
    guide: {
      scene: "theBaton",
    },
    entries: [],
    boss: { kind: "baton" },
    bossType: "normal",
  },
];
