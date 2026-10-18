import type { Wave } from "../wave-types.js";

/**
 * Waves 335 to 344 of the game, in the order they are played: THE LURE's block,
 * the filler before THE SURGE and the boss THE SURGE.
 *
 * Cut by `bun run waves:order --write` (`waves-recut.ts`), which cuts every act
 * after the tutorial arc again in play order. A save that fills it cuts a page
 * after it (`acts.ts`).
 */
export const WAVES_ACT_26: Wave[] = [
  {
    id: "theLure",
    name: "THE LURE",
    guide: {
      scene: "theLure",
    },
    entries: [
      { beat: 0, col: 4, kind: "lure", color: "cyan" },
      { beat: 8, col: 7, color: "red" },
      { beat: 16, col: 5, kind: "lure", color: "red" },
      { beat: 24, col: 7, color: "red" },
      { beat: 32, col: 4, kind: "lure", color: "cyan" },
      { beat: 40, col: 7, color: "cyan" },
    ],
  },
  {
    id: "theLureAgain",
    name: "LURE RISING",
    variant: true,
    entries: [
      { beat: 0, col: 10, kind: "lure", color: "red" },
      { beat: 6, col: 4, kind: "lure", color: "red" },
      { beat: 12, col: 7, kind: "lure", color: "cyan" },
      { beat: 19, col: 5, kind: "lure", color: "cyan" },
      { beat: 27, col: 3, kind: "lure", color: "red" },
    ],
  },
  {
    id: "theLureReach",
    name: "OUTER LURE",
    variant: true,
    entries: [
      { beat: 0, col: 10, kind: "lure", color: "red" },
      { beat: 6, col: 4, kind: "coil", color: null },
      { beat: 12, col: 9, kind: "meteor", color: null },
      { beat: 17, col: 2, kind: "lure", color: "cyan" },
      { beat: 25, col: 7, kind: "coil", color: null },
      { beat: 30, col: 3, kind: "meteor", color: null },
    ],
  },
  {
    id: "theLurePair",
    name: "LURE AND COIL",
    variant: true,
    entries: [
      { beat: 0, col: 6, color: "red" },
      { beat: 6, col: 3, kind: "lure", color: "red" },
      { beat: 10, col: 8, color: "cyan" },
      { beat: 18, col: 9, kind: "coil", color: null },
      { beat: 24, col: 1, color: "cyan" },
      { beat: 30, col: 9, kind: "countdown", color: "cyan" },
      { beat: 35, col: 4, color: "red" },
    ],
  },
  {
    id: "theLureRecall",
    name: "LURE REUNION",
    variant: true,
    entries: [
      { beat: 0, col: 0, color: "red" },
      { beat: 6, col: 6, kind: "lure", color: "red" },
      { beat: 11, col: 0, color: "cyan" },
      { beat: 16, col: 10, kind: "lure", color: "cyan" },
      { beat: 24, col: 0, color: "cyan" },
      { beat: 31, col: 10, kind: "lure", color: "red" },
      { beat: 36, col: 7, color: "cyan" },
    ],
  },
  {
    id: "theLurePeak",
    name: "LURE INFERNO",
    variant: true,
    entries: [
      { beat: 0, col: 9, color: "red" },
      { beat: 4, col: 4, kind: "lure", color: "cyan" },
      { beat: 12, col: 2, color: "red" },
      { beat: 16, col: 4, kind: "coil", color: null },
      { beat: 20, col: 2, color: "cyan" },
      { beat: 20, col: 8, color: "cyan" },
      { beat: 24, col: 1, kind: "seeder", color: "red" },
      { beat: 31, col: 10, kind: "lure", color: "cyan" },
      { beat: 37, col: 2, color: "red" },
      { beat: 37, col: 8, color: "red" },
      { beat: 41, col: 6, kind: "coil", color: null },
      { beat: 45, col: 10, kind: "seeder", color: "red" },
    ],
  },
  {
    id: "fillerSurgeBreathe",
    name: "LURE HUSH",
    entries: [
      { beat: 0, col: 1, color: "red" },
      { beat: 7, col: 6, kind: "lure", color: "cyan" },
      { beat: 14, col: 7, color: "cyan" },
      { beat: 22, col: 10, kind: "coil", color: null },
      { beat: 28, col: 5, color: "cyan" },
      { beat: 36, col: 8, kind: "seeder", color: "cyan" },
    ],
  },
  {
    id: "fillerSurgeRecall",
    name: "OLD LURE SONG",
    variant: true,
    entries: [
      { beat: 0, col: 6, color: "cyan" },
      { beat: 5, col: 3, kind: "lure", color: "cyan" },
      { beat: 11, col: 1, color: "cyan" },
      { beat: 23, col: 3, color: "red" },
      { beat: 23, col: 6, color: "red" },
      { beat: 28, col: 5, kind: "lure", color: "red" },
      { beat: 40, col: 3, color: "cyan" },
      { beat: 40, col: 6, color: "cyan" },
    ],
    pods: [
      { beat: 18, col: 10, row: 3, kind: "pod" },
      { beat: 34, col: 10, row: 3, kind: "pod" },
    ],
  },
  {
    id: "fillerSurgeBend",
    name: "LURE PARADOX",
    variant: true,
    entries: [
      { beat: 0, col: 0, color: "red" },
      { beat: 5, col: 5, kind: "lure", color: "cyan" },
      { beat: 11, col: 4, color: "cyan" },
      { beat: 11, col: 7, color: "cyan" },
      { beat: 16, col: 10, kind: "coil", color: null },
      { beat: 21, col: 5, kind: "lure", color: "red" },
      { beat: 26, col: 4, color: "red" },
      { beat: 26, col: 7, color: "red" },
      { beat: 31, col: 6, kind: "coil", color: null },
      { beat: 37, col: 4, kind: "lure", color: "red" },
      { beat: 43, col: 3, color: "cyan" },
      { beat: 43, col: 7, color: "cyan" },
      { beat: 48, col: 10, kind: "coil", color: null },
    ],
  },
  {
    id: "theSurge",
    name: "THE SURGE",
    guide: {
      scene: "theSurge",
    },
    entries: [
      { beat: 14, col: 2, kind: "meteor", color: null },
      { beat: 22, col: 8, color: "red" },
      { beat: 30, col: 5, kind: "meteor", color: null },
      { beat: 40, col: 0, color: "cyan" },
      { beat: 48, col: 7, kind: "meteor", color: null },
      { beat: 58, col: 10, color: "red" },
      { beat: 66, col: 3, color: "cyan" },
      { beat: 76, col: 5, kind: "meteor", color: null },
    ],
    boss: { kind: "surge" },
    bossType: "normal",
  },
];
