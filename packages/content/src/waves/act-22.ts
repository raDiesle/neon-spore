import type { Wave } from "../wave-types.js";

/**
 * Waves 264 to 273 of the game, in the order they are played: THE CHOIR's
 * block, the filler before THE TASTER and the boss THE TASTER.
 *
 * Cut by `bun run waves:order --write` (`waves-recut.ts`), which cuts every act
 * after the tutorial arc again in play order. A save that fills it cuts a page
 * after it (`acts.ts`).
 */
export const WAVES_ACT_22: Wave[] = [
  {
    id: "theChoir",
    name: "THE CHOIR",
    guide: {
      scene: "theChoir",
    },
    entries: [
      { beat: 0, col: 3, kind: "choir", color: "red" },
      { beat: 10, col: 0, kind: "choir", color: "cyan" },
      { beat: 22, col: 7, kind: "choir", color: "cyan" },
      { beat: 34, col: 2, kind: "choir", color: "red" },
    ],
  },
  {
    id: "theChoirAgain",
    name: "FIRST CHOIR",
    variant: true,
    entries: [
      { beat: 0, col: 2, kind: "choir", color: "red" },
      { beat: 7, col: 9, kind: "choir", color: "red" },
      { beat: 15, col: 0, kind: "choir", color: "red" },
      { beat: 22, col: 8, kind: "choir", color: "cyan" },
      { beat: 29, col: 10, kind: "choir", color: "red" },
    ],
  },
  {
    id: "theChoirReach",
    name: "CHOIR WANDERER",
    variant: true,
    entries: [
      { beat: 0, col: 9, kind: "choir", color: "cyan" },
      { beat: 5, col: 0, kind: "magnet", color: "red" },
      { beat: 13, col: 6, kind: "meteor", color: null, cross: 1, row: 4 },
      { beat: 18, col: 10, kind: "choir", color: "red" },
      { beat: 23, col: 6, kind: "magnet", color: "red" },
      { beat: 29, col: 0, kind: "meteor", color: null, cross: -1, row: 6 },
    ],
  },
  {
    id: "theChoirPair",
    name: "CHOIR TANGO",
    variant: true,
    entries: [
      { beat: 0, col: 7, color: "cyan" },
      { beat: 5, col: 2, kind: "choir", color: "cyan" },
      { beat: 10, col: 10, color: "cyan" },
      { beat: 18, col: 9, kind: "magnet", color: "red" },
      { beat: 24, col: 10, color: "red" },
      { beat: 30, col: 2, kind: "choir", color: "red" },
      { beat: 36, col: 9, color: "cyan" },
    ],
  },
  {
    id: "theChoirRecall",
    name: "ANCIENT CHOIR",
    variant: true,
    entries: [
      { beat: 0, col: 10, color: "cyan" },
      { beat: 6, col: 2, kind: "choir", color: "red" },
      { beat: 12, col: 9, color: "cyan" },
      { beat: 17, col: 0, kind: "choir", color: "cyan" },
      { beat: 25, col: 10, color: "cyan" },
      { beat: 32, col: 0, kind: "choir", color: "cyan" },
      { beat: 38, col: 2, color: "cyan" },
    ],
  },
  {
    id: "theChoirPeak",
    name: "CHOIR THUNDER",
    variant: true,
    entries: [
      { beat: 0, col: 3, color: "red" },
      { beat: 4, col: 0, kind: "choir", color: "red" },
      { beat: 10, col: 8, color: "cyan" },
      { beat: 13, col: 5, kind: "magnet", color: "red" },
      { beat: 21, col: 1, color: "cyan" },
      { beat: 21, col: 9, color: "cyan" },
      { beat: 27, col: 8, kind: "meteor", color: null, cross: 1, row: 5 },
      { beat: 30, col: 7, kind: "choir", color: "cyan" },
      { beat: 35, col: 1, color: "red" },
      { beat: 35, col: 9, color: "red" },
      { beat: 38, col: 0, kind: "magnet", color: "cyan" },
      { beat: 44, col: 8, kind: "meteor", color: null, cross: 1, row: 4 },
      { beat: 48, col: 1, color: "cyan" },
      { beat: 48, col: 9, color: "cyan" },
    ],
  },
  {
    id: "fillerTasterBreathe",
    name: "SOFT CHOIR",
    entries: [
      { beat: 0, col: 9, color: "red" },
      { beat: 8, col: 5, kind: "choir", color: "red" },
      { beat: 15, col: 1, color: "cyan" },
      { beat: 22, col: 9, kind: "magnet", color: "cyan" },
      { beat: 29, col: 7, color: "red" },
      { beat: 36, col: 5, kind: "countdown", color: "cyan" },
    ],
  },
  {
    id: "fillerTasterRecall",
    name: "CHOIR REUNION",
    variant: true,
    entries: [
      { beat: 0, col: 8, color: "cyan" },
      { beat: 6, col: 0, kind: "choir", color: "red" },
      { beat: 13, col: 9, color: "cyan" },
      { beat: 19, col: 6, kind: "countdown", color: "cyan" },
      { beat: 24, col: 5, color: "red" },
      { beat: 30, col: 8, kind: "choir", color: "red" },
      { beat: 35, col: 10, color: "cyan" },
      { beat: 40, col: 5, kind: "countdown", color: "cyan" },
    ],
  },
  {
    id: "fillerTasterBend",
    name: "CHOIR RIDDLE",
    variant: true,
    entries: [
      { beat: 0, col: 1, color: "red" },
      { beat: 6, col: 5, kind: "choir", color: "red" },
      { beat: 11, col: 1, color: "cyan" },
      { beat: 17, col: 8, kind: "magnet", color: "red" },
      { beat: 23, col: 3, color: "cyan" },
      { beat: 23, col: 6, color: "cyan" },
      { beat: 28, col: 2, kind: "choir", color: "cyan" },
      { beat: 33, col: 7, kind: "magnet", color: "red" },
      { beat: 39, col: 3, color: "cyan" },
      { beat: 39, col: 6, color: "cyan" },
      { beat: 45, col: 5, kind: "choir", color: "red" },
    ],
  },
  {
    id: "theTaster",
    name: "THE TASTER",
    guide: {
      scene: "theTaster",
    },
    entries: [
      { beat: 16, col: 2, kind: "meteor", color: null },
      { beat: 24, col: 8, kind: "meteor", color: null },
      { beat: 30, col: 5, color: "red" },
      { beat: 36, col: 0, color: "cyan" },
      { beat: 44, col: 10, kind: "meteor", color: null },
      { beat: 50, col: 3, color: "red" },
      { beat: 56, col: 7, color: "cyan" },
      { beat: 64, col: 5, kind: "meteor", color: null },
      { beat: 72, col: 2, color: "cyan" },
      { beat: 80, col: 8, color: "red" },
    ],
    boss: { kind: "taster" },
    bossType: "normal",
  },
];
