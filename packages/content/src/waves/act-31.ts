import type { Wave } from "../wave-types.js";

/**
 * Waves 375 to 384 of the game, in the order they are played: THE DART's block,
 * the filler before THE CAIRN and the boss THE CAIRN.
 *
 * Cut by `bun run waves:order --write` (`waves-recut.ts`), which cuts every act
 * after the tutorial arc again in play order. A save that fills it cuts a page
 * after it (`acts.ts`).
 */
export const WAVES_ACT_31: Wave[] = [
  {
    id: "theDart",
    name: "THE DART",
    guide: {
      scene: "theDart",
    },
    entries: [
      { beat: 0, col: 5, kind: "dart", color: "red" },
      { beat: 8, col: 10, kind: "dart", color: "cyan" },
      { beat: 16, col: 2, kind: "dart", color: "red" },
      { beat: 24, col: 8, kind: "dart", color: "cyan" },
      { beat: 33, col: 3, kind: "dart", color: "cyan" },
    ],
  },
  {
    id: "theDartAgain",
    name: "NEW DART MOON",
    variant: true,
    entries: [
      { beat: 0, col: 9, kind: "dart", color: "red" },
      { beat: 8, col: 1, color: "red" },
      { beat: 16, col: 4, kind: "dart", color: "cyan" },
      { beat: 24, col: 9, color: "red" },
      { beat: 30, col: 6, kind: "dart", color: "cyan" },
    ],
  },
  {
    id: "theDartReach",
    name: "DART AT WORLD END",
    variant: true,
    entries: [
      { beat: 0, col: 1, kind: "dart", color: "cyan" },
      { beat: 6, col: 6, kind: "clasp", color: "red" },
      { beat: 16, col: 8, kind: "dart", color: "red" },
      { beat: 24, col: 2, kind: "clasp", color: "cyan" },
    ],
    pods: [{ beat: 11, col: 0, row: 4, kind: "husk" }],
  },
  {
    id: "theDartPair",
    name: "DART PARTY",
    variant: true,
    entries: [
      { beat: 0, col: 3, color: "cyan" },
      { beat: 6, col: 8, kind: "dart", color: "red" },
      { beat: 12, col: 0, color: "cyan" },
      { beat: 18, col: 2, kind: "clasp", color: "red" },
      { beat: 22, col: 3, color: "red" },
      { beat: 27, col: 8, kind: "choir", color: "red" },
      { beat: 32, col: 3, color: "red" },
      { beat: 36, col: 1, kind: "dart", color: "cyan" },
    ],
  },
  {
    id: "theDartRecall",
    name: "DART HOMECOMING",
    variant: true,
    entries: [
      { beat: 0, col: 1, color: "cyan" },
      { beat: 6, col: 8, kind: "dart", color: "cyan" },
      { beat: 11, col: 7, color: "red" },
      { beat: 17, col: 1, kind: "beatbox", color: null, beats: 2 },
      { beat: 23, col: 0, color: "cyan" },
      { beat: 30, col: 10, kind: "dart", color: "cyan" },
      { beat: 35, col: 0, color: "red" },
    ],
  },
  {
    id: "theDartPeak",
    name: "DART THUNDER",
    variant: true,
    entries: [
      { beat: 0, col: 8, color: "cyan" },
      { beat: 4, col: 9, kind: "dart", color: "cyan" },
      { beat: 7, col: 3, color: "cyan" },
      { beat: 15, col: 10, kind: "clasp", color: "cyan" },
      { beat: 22, col: 1, color: "red" },
      { beat: 22, col: 9, color: "red" },
      { beat: 28, col: 8, kind: "meteor", color: null },
      { beat: 34, col: 0, kind: "dart", color: "red" },
      { beat: 40, col: 2, color: "cyan" },
      { beat: 40, col: 8, color: "cyan" },
      { beat: 43, col: 6, kind: "clasp", color: "red" },
      { beat: 48, col: 1, kind: "meteor", color: null },
    ],
  },
  {
    id: "fillerCairnBreathe",
    name: "DART PICNIC",
    entries: [
      { beat: 0, col: 1, color: "red" },
      { beat: 6, col: 5, kind: "dart", color: "cyan" },
      { beat: 13, col: 9, color: "cyan" },
      { beat: 20, col: 5, kind: "clasp", color: "cyan" },
      { beat: 27, col: 3, color: "cyan" },
      { beat: 33, col: 4, kind: "meteorMedium", color: null },
      { beat: 40, col: 8, color: "red" },
    ],
  },
  {
    id: "fillerCairnRecall",
    name: "OLD DART SONG",
    variant: true,
    entries: [
      { beat: 0, col: 7, color: "cyan" },
      { beat: 6, col: 10, kind: "dart", color: "red" },
      { beat: 12, col: 9, color: "red" },
      { beat: 17, col: 5, kind: "meteor", color: null, cross: -1, row: 7 },
      { beat: 23, col: 3, color: "red" },
      { beat: 23, col: 7, color: "red" },
      { beat: 29, col: 6, kind: "dart", color: "cyan" },
      { beat: 35, col: 9, kind: "meteor", color: null, cross: 1, row: 4 },
    ],
  },
  {
    id: "fillerCairnBend",
    name: "DART ILLUSION",
    variant: true,
    entries: [
      { beat: 0, col: 3, color: "red" },
      { beat: 5, col: 5, kind: "dart", color: "red" },
      { beat: 10, col: 2, color: "cyan" },
      { beat: 10, col: 8, color: "cyan" },
      { beat: 15, col: 9, kind: "clasp", color: "red" },
      { beat: 20, col: 0, kind: "dart", color: "cyan" },
      { beat: 28, col: 4, color: "red" },
      { beat: 28, col: 7, color: "red" },
      { beat: 34, col: 5, kind: "clasp", color: "red" },
      { beat: 39, col: 6, kind: "dart", color: "cyan" },
      { beat: 44, col: 5, color: "cyan" },
      { beat: 44, col: 8, color: "cyan" },
    ],
  },
  {
    id: "theCairn",
    name: "THE CAIRN",
    guide: {
      scene: "theCairn",
    },
    entries: [],
    boss: { kind: "cairn" },
    bossType: "normal",
  },
];
