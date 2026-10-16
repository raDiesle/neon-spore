import type { Wave } from "../wave-types.js";

/**
 * Waves 321 to 330 of the game, in the order they are played: THE LURE's block
 * and the boss THE HIVE.
 *
 * Cut by `bun run waves:order --write` (`waves-recut.ts`), which cuts every act
 * after the tutorial arc again in play order. A save that fills it cuts a page
 * after it (`acts.ts`).
 */
export const WAVES_ACT_30: Wave[] = [
  {
    id: "theLure",
    name: "THE LURE",
    guide: {
      scene: "theLure",
    },
    entries: [
      { beat: 0, col: 3, kind: "lure", color: "cyan" },
      { beat: 3, col: 8, color: "red" },
      { beat: 8, col: 5, kind: "lure", color: "red" },
      { beat: 9, col: 7, color: "red" },
      { beat: 15, col: 3, kind: "lure", color: "cyan" },
      { beat: 16, col: 7, color: "cyan" },
    ],
  },
  {
    id: "theLureAgain",
    name: "LURE RISING",
    variant: true,
    entries: [
      { beat: 0, col: 6, kind: "lure", color: "cyan" },
      { beat: 8, col: 10, color: "red" },
      { beat: 14, col: 6, kind: "lure", color: "cyan" },
      { beat: 22, col: 5, color: "red" },
      { beat: 28, col: 0, kind: "lure", color: "cyan" },
    ],
  },
  {
    id: "theLureSpread",
    name: "LURE CONFETTI",
    variant: true,
    entries: [
      { beat: 0, col: 3, kind: "lure", color: "red" },
      { beat: 6, col: 9, kind: "coil", color: null },
      { beat: 13, col: 3, color: "cyan" },
      { beat: 18, col: 7, kind: "lure", color: "cyan" },
      { beat: 23, col: 9, kind: "coil", color: null },
      { beat: 28, col: 8, color: "cyan" },
    ],
  },
  {
    id: "theLureReach",
    name: "LONG LURE ROAD",
    variant: true,
    entries: [
      { beat: 0, col: 9, kind: "lure", color: "cyan" },
      { beat: 6, col: 4, kind: "coil", color: null },
      { beat: 11, col: 0, kind: "beatbox", color: null, beats: 3 },
      { beat: 16, col: 4, kind: "lure", color: "cyan" },
      { beat: 21, col: 0, kind: "coil", color: null },
      { beat: 26, col: 6, kind: "beatbox", color: null, beats: 4 },
    ],
  },
  {
    id: "theLurePair",
    name: "LURE PARTY",
    variant: true,
    entries: [
      { beat: 0, col: 8, color: "cyan" },
      { beat: 4, col: 1, kind: "lure", color: "red" },
      { beat: 9, col: 10, color: "red" },
      { beat: 13, col: 0, kind: "coil", color: null },
      { beat: 18, col: 10, color: "red" },
      { beat: 23, col: 2, kind: "torch", color: null },
      { beat: 29, col: 1, color: "red" },
      { beat: 35, col: 9, kind: "lure", color: "cyan" },
    ],
  },
  {
    id: "theLureBreathe",
    name: "LAZY LURE",
    variant: true,
    entries: [
      { beat: 0, col: 7, color: "cyan" },
      { beat: 8, col: 10, kind: "lure", color: "red" },
      { beat: 16, col: 3, color: "cyan" },
      { beat: 23, col: 10, kind: "coil", color: null },
      { beat: 31, col: 7, color: "cyan" },
      { beat: 38, col: 1, kind: "veer", color: null },
    ],
  },
  {
    id: "theLureRecall",
    name: "LURE REUNION",
    variant: true,
    entries: [
      { beat: 0, col: 6, color: "cyan" },
      { beat: 6, col: 7, kind: "lure", color: "cyan" },
      { beat: 12, col: 9, color: "cyan" },
      { beat: 18, col: 0, kind: "balloon", color: null },
      { beat: 24, col: 10, color: "red" },
      { beat: 29, col: 2, kind: "lure", color: "cyan" },
      { beat: 34, col: 10, color: "red" },
      { beat: 39, col: 1, kind: "balloon", color: null },
    ],
  },
  {
    id: "theLureBend",
    name: "LURE RIDDLE",
    variant: true,
    entries: [
      { beat: 0, col: 8, color: "cyan" },
      { beat: 6, col: 9, kind: "lure", color: "cyan" },
      { beat: 12, col: 0, color: "red" },
      { beat: 18, col: 7, kind: "coil", color: null },
      { beat: 23, col: 3, color: "red" },
      { beat: 23, col: 6, color: "red" },
      { beat: 28, col: 1, kind: "lure", color: "red" },
      { beat: 34, col: 5, kind: "coil", color: null },
      { beat: 40, col: 0, color: "red" },
      { beat: 40, col: 10, color: "red" },
      { beat: 46, col: 10, kind: "lure", color: "cyan" },
    ],
  },
  {
    id: "theLurePeak",
    name: "LURE OVERDRIVE",
    variant: true,
    entries: [
      { beat: 0, col: 1, color: "cyan" },
      { beat: 4, col: 7, kind: "lure", color: "cyan" },
      { beat: 7, col: 4, color: "red" },
      { beat: 11, col: 0, kind: "coil", color: null },
      { beat: 15, col: 2, color: "red" },
      { beat: 15, col: 8, color: "red" },
      { beat: 18, col: 6, kind: "meteor", color: null },
      { beat: 21, col: 5, kind: "lure", color: "cyan" },
      { beat: 25, col: 4, color: "cyan" },
      { beat: 25, col: 7, color: "cyan" },
      { beat: 28, col: 7, kind: "coil", color: null },
      { beat: 32, col: 6, kind: "meteor", color: null },
      { beat: 35, col: 1, color: "red" },
      { beat: 35, col: 9, color: "red" },
      { beat: 39, col: 8, kind: "lure", color: "cyan" },
      { beat: 43, col: 5, kind: "coil", color: null },
      { beat: 47, col: 9, color: "cyan" },
    ],
  },
  {
    id: "theHive",
    name: "THE HIVE",
    guide: {
      scene: "theHive",
    },
    entries: [],
    boss: { kind: "hive" },
    bossType: "normal",
  },
];
