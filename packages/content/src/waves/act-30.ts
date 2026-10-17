import type { Wave } from "../wave-types.js";

/**
 * Waves 325 to 334 of the game, in the order they are played: THE LURE's block,
 * the filler before THE HIVE and the boss THE HIVE.
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
      { beat: 0, col: 4, kind: "lure", color: "cyan" },
      { beat: 3, col: 7, color: "red" },
      { beat: 8, col: 5, kind: "lure", color: "red" },
      { beat: 11, col: 7, color: "red" },
      { beat: 17, col: 4, kind: "lure", color: "cyan" },
      { beat: 20, col: 7, color: "cyan" },
    ],
  },
  {
    id: "theLureAgain",
    name: "LURE RISING",
    variant: true,
    entries: [
      { beat: 0, col: 7, kind: "lure", color: "cyan" },
      { beat: 6, col: 8, kind: "meteor", color: null },
      { beat: 13, col: 3, kind: "lure", color: "cyan" },
      { beat: 19, col: 2, kind: "meteor", color: null },
      { beat: 25, col: 4, kind: "lure", color: "red" },
      { beat: 32, col: 2, kind: "meteor", color: null },
    ],
  },
  {
    id: "theLureReach",
    name: "LONG LURE ROAD",
    variant: true,
    entries: [
      { beat: 0, col: 1, kind: "lure", color: "cyan" },
      { beat: 6, col: 7, kind: "coil", color: null },
      { beat: 11, col: 0, color: "cyan" },
      { beat: 17, col: 4, kind: "lure", color: "red" },
      { beat: 23, col: 0, kind: "coil", color: null },
      { beat: 29, col: 5, color: "cyan" },
    ],
  },
  {
    id: "theLurePair",
    name: "LURE PARTY",
    variant: true,
    entries: [
      { beat: 0, col: 8, color: "cyan" },
      { beat: 4, col: 1, kind: "lure", color: "cyan" },
      { beat: 9, col: 5, color: "cyan" },
      { beat: 14, col: 10, kind: "coil", color: null },
      { beat: 18, col: 0, color: "red" },
      { beat: 24, col: 7, kind: "veer", color: null },
      { beat: 30, col: 5, color: "red" },
      { beat: 34, col: 0, kind: "lure", color: "cyan" },
    ],
  },
  {
    id: "theLureRecall",
    name: "LURE REUNION",
    variant: true,
    entries: [
      { beat: 0, col: 3, color: "red" },
      { beat: 5, col: 10, kind: "lure", color: "cyan" },
      { beat: 11, col: 6, color: "cyan" },
      { beat: 17, col: 9, kind: "veer", color: null },
      { beat: 23, col: 0, color: "red" },
      { beat: 29, col: 10, kind: "lure", color: "cyan" },
      { beat: 34, col: 9, color: "cyan" },
      { beat: 40, col: 3, kind: "veer", color: null },
    ],
  },
  {
    id: "theLurePeak",
    name: "LURE OVERDRIVE",
    variant: true,
    entries: [
      { beat: 0, col: 1, color: "red" },
      { beat: 4, col: 2, kind: "lure", color: "cyan" },
      { beat: 7, col: 7, color: "cyan" },
      { beat: 10, col: 3, kind: "coil", color: null },
      { beat: 14, col: 5, color: "cyan" },
      { beat: 14, col: 8, color: "cyan" },
      { beat: 18, col: 4, kind: "meteor", color: null, cross: 1, row: 4 },
      { beat: 22, col: 3, kind: "lure", color: "cyan" },
      { beat: 25, col: 5, color: "red" },
      { beat: 25, col: 8, color: "red" },
      { beat: 28, col: 6, kind: "coil", color: null },
      { beat: 32, col: 0, kind: "meteor", color: null, cross: -1, row: 6 },
      { beat: 36, col: 3, color: "red" },
      { beat: 36, col: 7, color: "red" },
      { beat: 39, col: 6, kind: "lure", color: "red" },
      { beat: 42, col: 8, kind: "coil", color: null },
      { beat: 46, col: 10, color: "red" },
    ],
  },
  {
    id: "fillerHiveBreathe",
    name: "SLEEPY LURE",
    entries: [
      { beat: 0, col: 3, color: "red" },
      { beat: 6, col: 1, kind: "lure", color: "cyan" },
      { beat: 13, col: 4, color: "cyan" },
      { beat: 21, col: 10, kind: "coil", color: null },
      { beat: 29, col: 5, color: "cyan" },
      { beat: 35, col: 8, kind: "choir", color: "red" },
    ],
  },
  {
    id: "fillerHiveRecall",
    name: "OLD LURE SONG",
    variant: true,
    entries: [
      { beat: 0, col: 2, color: "red" },
      { beat: 6, col: 7, kind: "lure", color: "red" },
      { beat: 12, col: 2, color: "cyan" },
      { beat: 22, col: 1, color: "cyan" },
      { beat: 22, col: 9, color: "cyan" },
      { beat: 27, col: 7, kind: "lure", color: "cyan" },
      { beat: 38, col: 3, color: "cyan" },
      { beat: 38, col: 6, color: "cyan" },
    ],
    pods: [
      { beat: 17, col: 0, row: 3, kind: "pod" },
      { beat: 32, col: 1, row: 3, kind: "pod" },
    ],
  },
  {
    id: "fillerHiveBend",
    name: "LURE SPELL",
    variant: true,
    entries: [
      { beat: 0, col: 1, color: "cyan" },
      { beat: 6, col: 4, kind: "lure", color: "cyan" },
      { beat: 12, col: 3, color: "cyan" },
      { beat: 12, col: 7, color: "cyan" },
      { beat: 17, col: 9, kind: "coil", color: null },
      { beat: 22, col: 5, kind: "lure", color: "red" },
      { beat: 28, col: 3, color: "red" },
      { beat: 28, col: 7, color: "red" },
      { beat: 33, col: 5, kind: "coil", color: null },
      { beat: 38, col: 2, kind: "lure", color: "red" },
      { beat: 43, col: 5, color: "red" },
      { beat: 43, col: 8, color: "red" },
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
