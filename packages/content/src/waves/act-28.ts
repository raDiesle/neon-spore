import type { Wave } from "../wave-types.js";

/**
 * Waves 301 to 310 of the game, in the order they are played: THE COIL's block
 * and the boss THE SCUTTLE.
 *
 * Cut by `bun run waves:order --write` (`waves-recut.ts`), which cuts every act
 * after the tutorial arc again in play order. A save that fills it cuts a page
 * after it (`acts.ts`).
 */
export const WAVES_ACT_28: Wave[] = [
  {
    id: "theCoil",
    name: "THE COIL",
    guide: {
      scene: "theCoil",
    },
    entries: [
      { beat: 7, col: 7, kind: "coil", color: null },
      { beat: 15, col: 9, kind: "coil", color: null },
      { beat: 23, col: 4, kind: "meteor", color: null },
      { beat: 37, col: 9, kind: "coil", color: null },
      { beat: 45, col: 9, kind: "coil", color: null },
      { beat: 61, col: 9, kind: "coil", color: null },
    ],
    faults: [{ kind: "shield" }],
  },
  {
    id: "theCoilAgain",
    name: "FIRST COIL",
    variant: true,
    entries: [
      { beat: 0, col: 10, kind: "coil", color: null },
      { beat: 6, col: 3, kind: "coil", color: null },
      { beat: 12, col: 9, kind: "coil", color: null },
      { beat: 19, col: 0, kind: "coil", color: null },
      { beat: 25, col: 9, kind: "coil", color: null },
      { beat: 31, col: 5, kind: "coil", color: null },
    ],
  },
  {
    id: "theCoilSpread",
    name: "COIL SCATTER",
    variant: true,
    entries: [
      { beat: 0, col: 6, kind: "coil", color: null },
      { beat: 5, col: 0, kind: "moult", color: null },
      { beat: 12, col: 3, kind: "coil", color: null },
      { beat: 18, col: 10, kind: "moult", color: null },
      { beat: 23, col: 7, kind: "coil", color: null },
      { beat: 30, col: 5, kind: "moult", color: null },
    ],
  },
  {
    id: "theCoilReach",
    name: "COIL WANDERER",
    variant: true,
    entries: [
      { beat: 0, col: 0, kind: "coil", color: null },
      { beat: 5, col: 9, kind: "moult", color: null },
      { beat: 10, col: 1, kind: "meteor", color: null },
      { beat: 15, col: 7, kind: "coil", color: null },
      { beat: 21, col: 3, kind: "moult", color: null },
      { beat: 27, col: 8, kind: "meteor", color: null },
    ],
  },
  {
    id: "theCoilPair",
    name: "COIL TANGO",
    variant: true,
    entries: [
      { beat: 0, col: 8, color: "red" },
      { beat: 4, col: 2, kind: "coil", color: null },
      { beat: 9, col: 3, color: "red" },
      { beat: 15, col: 5, kind: "moult", color: null },
      { beat: 21, col: 0, color: "red" },
      { beat: 27, col: 10, kind: "fence", color: null },
      { beat: 33, col: 1, color: "cyan" },
      { beat: 39, col: 10, kind: "coil", color: null },
    ],
  },
  {
    id: "theCoilBreathe",
    name: "COIL LULLABY",
    variant: true,
    entries: [
      { beat: 0, col: 8, color: "red" },
      { beat: 8, col: 3, kind: "coil", color: null },
      { beat: 16, col: 7, color: "cyan" },
      { beat: 24, col: 10, kind: "moult", color: null },
      { beat: 32, col: 5, color: "red" },
      { beat: 39, col: 2, kind: "weight", color: null },
    ],
  },
  {
    id: "theCoilRecall",
    name: "ANCIENT COIL",
    variant: true,
    entries: [
      { beat: 0, col: 6, color: "red" },
      { beat: 5, col: 2, kind: "coil", color: null },
      { beat: 11, col: 1, color: "red" },
      { beat: 16, col: 4, kind: "glutton", color: "cyan" },
      { beat: 21, col: 9, color: "cyan" },
      { beat: 27, col: 5, kind: "coil", color: null },
      { beat: 33, col: 6, color: "red" },
      { beat: 38, col: 7, kind: "glutton", color: "red" },
    ],
  },
  {
    id: "theCoilBend",
    name: "COIL MIRAGE",
    variant: true,
    entries: [
      { beat: 0, col: 4, color: "cyan" },
      { beat: 6, col: 7, kind: "coil", color: null },
      { beat: 12, col: 0, color: "red" },
      { beat: 18, col: 2, kind: "moult", color: null },
      { beat: 24, col: 3, color: "red" },
      { beat: 24, col: 6, color: "red" },
      { beat: 29, col: 5, kind: "coil", color: null },
      { beat: 34, col: 4, kind: "moult", color: null },
      { beat: 40, col: 5, color: "cyan" },
      { beat: 40, col: 8, color: "cyan" },
      { beat: 45, col: 8, kind: "coil", color: null },
    ],
  },
  {
    id: "theTwitch",
    name: "COIL INFERNO",
    variant: true,
    entries: [
      { beat: 0, col: 5, kind: "meteor", color: null },
      { beat: 10, col: 10, kind: "coil", color: null },
      { beat: 26, col: 10, kind: "coil", color: null },
      { beat: 28, col: 10, kind: "coil", color: null },
      { beat: 30, col: 10, kind: "coil", color: null },
      { beat: 48, col: 10, kind: "coil", color: null },
      { beat: 50, col: 10, kind: "coil", color: null },
      { beat: 52, col: 10, kind: "coil", color: null },
      { beat: 54, col: 10, kind: "coil", color: null },
      { beat: 62, col: 0, kind: "meteorMedium", color: null },
    ],
    faults: [{ kind: "shield" }],
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
