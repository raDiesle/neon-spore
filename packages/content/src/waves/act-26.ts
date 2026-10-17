import type { Wave } from "../wave-types.js";

/**
 * Waves 304 to 313 of the game, in the order they are played: THE COIL's block,
 * the filler before THE SCUTTLE and the boss THE SCUTTLE.
 *
 * Cut by `bun run waves:order --write` (`waves-recut.ts`), which cuts every act
 * after the tutorial arc again in play order. A save that fills it cuts a page
 * after it (`acts.ts`).
 */
export const WAVES_ACT_26: Wave[] = [
  {
    id: "theCoil",
    name: "THE COIL",
    guide: {
      scene: "theCoil",
    },
    entries: [
      { beat: 7, col: 6, kind: "coil", color: null },
      { beat: 15, col: 7, kind: "coil", color: null },
      { beat: 23, col: 5, kind: "meteor", color: null },
      { beat: 37, col: 7, kind: "coil", color: null },
      { beat: 45, col: 7, kind: "coil", color: null },
      { beat: 61, col: 7, kind: "coil", color: null },
    ],
    faults: [{ kind: "shield" }],
  },
  {
    id: "theCoilAgain",
    name: "FIRST COIL",
    variant: true,
    entries: [
      { beat: 0, col: 1, kind: "coil", color: null },
      { beat: 7, col: 7, kind: "coil", color: null },
      { beat: 13, col: 9, kind: "coil", color: null },
      { beat: 21, col: 4, kind: "coil", color: null },
      { beat: 29, col: 5, kind: "coil", color: null },
    ],
  },
  {
    id: "theCoilReach",
    name: "COIL WANDERER",
    variant: true,
    entries: [
      { beat: 0, col: 10, kind: "coil", color: null },
      { beat: 6, col: 6, kind: "moult", color: null },
      { beat: 18, col: 9, kind: "coil", color: null },
      { beat: 26, col: 1, kind: "moult", color: null },
    ],
    pods: [{ beat: 12, col: 0, row: 4, kind: "husk" }],
  },
  {
    id: "theCoilPair",
    name: "COIL TANGO",
    variant: true,
    entries: [
      { beat: 0, col: 8, color: "cyan" },
      { beat: 6, col: 2, kind: "coil", color: null },
      { beat: 12, col: 6, color: "cyan" },
      { beat: 18, col: 3, kind: "moult", color: null },
      { beat: 23, col: 9, color: "cyan" },
      { beat: 28, col: 4, kind: "choir", color: "cyan" },
      { beat: 34, col: 2, color: "cyan" },
      { beat: 39, col: 5, kind: "coil", color: null },
    ],
  },
  {
    id: "theCoilRecall",
    name: "ANCIENT COIL",
    variant: true,
    entries: [
      { beat: 0, col: 9, color: "red" },
      { beat: 6, col: 3, kind: "coil", color: null },
      { beat: 12, col: 0, color: "red" },
      { beat: 18, col: 8, kind: "beatbox", color: null, beats: 4 },
      { beat: 24, col: 10, color: "red" },
      { beat: 30, col: 5, kind: "coil", color: null },
      { beat: 35, col: 9, color: "cyan" },
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
    id: "fillerScuttleBreathe",
    name: "COIL LULLABY",
    entries: [
      { beat: 0, col: 9, color: "red" },
      { beat: 8, col: 10, kind: "coil", color: null },
      { beat: 14, col: 2, color: "cyan" },
      { beat: 20, col: 1, kind: "moult", color: null },
      { beat: 28, col: 3, color: "red" },
      { beat: 35, col: 8, kind: "coil", color: null },
    ],
  },
  {
    id: "fillerScuttleRecall",
    name: "COIL HOMECOMING",
    variant: true,
    entries: [
      { beat: 0, col: 2, color: "cyan" },
      { beat: 6, col: 8, kind: "coil", color: null },
      { beat: 12, col: 2, color: "cyan" },
      { beat: 18, col: 1, kind: "meteorMedium", color: null },
      { beat: 23, col: 2, color: "cyan" },
      { beat: 23, col: 8, color: "cyan" },
      { beat: 31, col: 2, kind: "coil", color: null },
      { beat: 37, col: 3, kind: "meteorMedium", color: null },
    ],
  },
  {
    id: "fillerScuttleBend",
    name: "COIL MIRAGE",
    variant: true,
    entries: [
      { beat: 0, col: 7, color: "cyan" },
      { beat: 6, col: 8, kind: "coil", color: null },
      { beat: 12, col: 4, color: "red" },
      { beat: 12, col: 7, color: "red" },
      { beat: 17, col: 9, kind: "moult", color: null },
      { beat: 22, col: 1, kind: "coil", color: null },
      { beat: 30, col: 2, color: "red" },
      { beat: 30, col: 8, color: "red" },
      { beat: 35, col: 6, kind: "moult", color: null },
      { beat: 41, col: 7, kind: "coil", color: null },
      { beat: 47, col: 5, color: "cyan" },
      { beat: 47, col: 8, color: "cyan" },
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
