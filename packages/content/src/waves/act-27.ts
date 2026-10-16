import type { Wave } from "../wave-types.js";

/**
 * Waves 280 to 289 of the game, in the order they are played: THE LURE's block
 * and the boss THE SCUTTLE.
 *
 * Cut by `bun run waves:order --write` (`waves-recut.ts`), which cuts every act
 * after the tutorial arc again in play order. A save that fills it cuts a page
 * after it (`acts.ts`).
 */
export const WAVES_ACT_27: Wave[] = [
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
      { beat: 0, col: 0, kind: "lure", color: "cyan" },
      { beat: 6, col: 7, kind: "lure", color: "cyan" },
      { beat: 12, col: 9, kind: "lure", color: "red" },
      { beat: 19, col: 1, kind: "lure", color: "cyan" },
      { beat: 25, col: 3, kind: "lure", color: "red" },
    ],
  },
  {
    id: "theLureSpread",
    name: "LURE CONFETTI",
    variant: true,
    entries: [
      { beat: 0, col: 1, kind: "lure", color: "cyan" },
      { beat: 6, col: 4, kind: "coil", color: null },
      { beat: 12, col: 7, kind: "lure", color: "cyan" },
      { beat: 18, col: 5, kind: "coil", color: null },
      { beat: 25, col: 8, kind: "lure", color: "cyan" },
      { beat: 32, col: 5, kind: "coil", color: null },
    ],
  },
  {
    id: "theLureReach",
    name: "LONG LURE ROAD",
    variant: true,
    entries: [
      { beat: 0, col: 0, kind: "lure", color: "red" },
      { beat: 6, col: 6, kind: "coil", color: null },
      { beat: 12, col: 0, kind: "meteorMedium", color: null },
      { beat: 17, col: 4, kind: "lure", color: "cyan" },
      { beat: 23, col: 8, kind: "coil", color: null },
      { beat: 29, col: 3, kind: "meteorMedium", color: null },
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
      { beat: 38, col: 1, kind: "strand", color: "cyan", beads: 3 },
    ],
  },
  {
    id: "theLureRecall",
    name: "LURE REUNION",
    variant: true,
    entries: [
      { beat: 0, col: 10, color: "cyan" },
      { beat: 5, col: 8, kind: "lure", color: "red" },
      { beat: 10, col: 4, color: "cyan" },
      { beat: 15, col: 1, kind: "lure", color: "red" },
      { beat: 21, col: 4, color: "cyan" },
      { beat: 27, col: 10, kind: "lure", color: "cyan" },
      { beat: 32, col: 1, color: "cyan" },
      { beat: 37, col: 10, kind: "lure", color: "red" },
    ],
  },
  {
    id: "theLureBend",
    name: "LURE RIDDLE",
    variant: true,
    entries: [
      { beat: 0, col: 2, color: "red" },
      { beat: 6, col: 9, kind: "lure", color: "red" },
      { beat: 12, col: 8, color: "cyan" },
      { beat: 18, col: 0, kind: "coil", color: null },
      { beat: 23, col: 2, color: "cyan" },
      { beat: 23, col: 8, color: "cyan" },
      { beat: 29, col: 1, kind: "lure", color: "cyan" },
      { beat: 35, col: 3, kind: "coil", color: null },
      { beat: 41, col: 2, color: "red" },
      { beat: 41, col: 8, color: "red" },
      { beat: 46, col: 1, kind: "lure", color: "cyan" },
    ],
  },
  {
    id: "theLurePeak",
    name: "LURE OVERDRIVE",
    variant: true,
    entries: [
      { beat: 0, col: 2, color: "cyan" },
      { beat: 4, col: 1, kind: "lure", color: "cyan" },
      { beat: 7, col: 5, color: "red" },
      { beat: 11, col: 1, kind: "coil", color: null },
      { beat: 14, col: 3, color: "cyan" },
      { beat: 14, col: 6, color: "cyan" },
      { beat: 21, col: 4, kind: "lure", color: "cyan" },
      { beat: 25, col: 5, color: "red" },
      { beat: 25, col: 8, color: "red" },
      { beat: 28, col: 8, kind: "coil", color: null },
      { beat: 35, col: 1, color: "cyan" },
      { beat: 35, col: 9, color: "cyan" },
      { beat: 39, col: 8, kind: "lure", color: "cyan" },
      { beat: 43, col: 0, kind: "coil", color: null },
      { beat: 46, col: 4, color: "red" },
    ],
    pods: [
      { beat: 18, col: 1, row: 3, kind: "pod" },
      { beat: 32, col: 10, row: 3, kind: "pod" },
    ],
  },
  {
    id: "theScuttle",
    name: "THE SCUTTLE",
    guide: {
      scene: "theScuttle",
    },
    entries: [],
    boss: { kind: "scuttle" },
    bossType: "normal",
  },
];
