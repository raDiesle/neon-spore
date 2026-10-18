import type { Wave } from "../wave-types.js";

/**
 * Waves 365 to 374 of the game, in the order they are played: THE DART's block,
 * the filler before THE ANTIPHON and the boss THE ANTIPHON.
 *
 * Cut by `bun run waves:order --write` (`waves-recut.ts`), which cuts every act
 * after the tutorial arc again in play order. A save that fills it cuts a page
 * after it (`acts.ts`).
 */
export const WAVES_ACT_29: Wave[] = [
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
      { beat: 0, col: 6, kind: "dart", color: "red" },
      { beat: 7, col: 7, color: "red" },
      { beat: 15, col: 4, kind: "dart", color: "cyan" },
      { beat: 23, col: 5, color: "red" },
      { beat: 30, col: 0, kind: "dart", color: "red" },
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
    pods: [{ beat: 11, col: 0, row: 3, kind: "pod" }],
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
      { beat: 0, col: 8, color: "red" },
      { beat: 6, col: 9, kind: "dart", color: "cyan" },
      { beat: 13, col: 0, color: "cyan" },
      { beat: 20, col: 10, kind: "moult", color: null },
      { beat: 26, col: 7, color: "red" },
      { beat: 31, col: 3, kind: "dart", color: "cyan" },
      { beat: 36, col: 4, color: "cyan" },
    ],
  },
  {
    id: "theDartPeak",
    name: "DART THUNDER",
    variant: true,
    entries: [
      { beat: 0, col: 8, color: "red" },
      { beat: 3, col: 1, kind: "dart", color: "red" },
      { beat: 11, col: 6, color: "cyan" },
      { beat: 16, col: 1, kind: "clasp", color: "cyan" },
      { beat: 19, col: 0, color: "cyan" },
      { beat: 19, col: 10, color: "cyan" },
      { beat: 26, col: 10, kind: "balloon", color: null },
      { beat: 31, col: 4, kind: "dart", color: "cyan" },
      { beat: 35, col: 1, color: "red" },
      { beat: 35, col: 9, color: "red" },
      { beat: 39, col: 4, kind: "clasp", color: "cyan" },
      { beat: 44, col: 9, kind: "balloon", color: null },
      { beat: 48, col: 0, color: "cyan" },
      { beat: 48, col: 10, color: "cyan" },
    ],
  },
  {
    id: "fillerAntiphonBreathe",
    name: "DART DREAM",
    entries: [
      { beat: 0, col: 9, color: "cyan" },
      { beat: 6, col: 2, kind: "dart", color: "red" },
      { beat: 14, col: 4, color: "cyan" },
      { beat: 22, col: 0, kind: "clasp", color: "cyan" },
      { beat: 30, col: 4, color: "red" },
      { beat: 38, col: 7, kind: "moult", color: null },
    ],
  },
  {
    id: "fillerAntiphonRecall",
    name: "DART LEGEND",
    variant: true,
    entries: [
      { beat: 0, col: 1, color: "red" },
      { beat: 6, col: 5, kind: "dart", color: "cyan" },
      { beat: 12, col: 4, color: "red" },
      { beat: 23, col: 3, color: "red" },
      { beat: 23, col: 6, color: "red" },
      { beat: 28, col: 1, kind: "dart", color: "cyan" },
      { beat: 40, col: 1, color: "cyan" },
      { beat: 40, col: 9, color: "cyan" },
    ],
    pods: [
      { beat: 17, col: 1, row: 4, kind: "husk" },
      { beat: 34, col: 3, row: 4, kind: "husk" },
    ],
  },
  {
    id: "fillerAntiphonBend",
    name: "DART PARADOX",
    variant: true,
    entries: [
      { beat: 0, col: 3, color: "red" },
      { beat: 5, col: 4, kind: "dart", color: "cyan" },
      { beat: 10, col: 5, color: "red" },
      { beat: 10, col: 8, color: "red" },
      { beat: 16, col: 9, kind: "clasp", color: "red" },
      { beat: 22, col: 5, kind: "dart", color: "cyan" },
      { beat: 28, col: 4, color: "red" },
      { beat: 28, col: 7, color: "red" },
      { beat: 34, col: 3, kind: "clasp", color: "cyan" },
      { beat: 40, col: 0, kind: "dart", color: "cyan" },
      { beat: 46, col: 3, color: "cyan" },
      { beat: 46, col: 7, color: "cyan" },
    ],
  },
  {
    id: "theAntiphon",
    name: "THE ANTIPHON",
    guide: {
      scene: "theAntiphon",
    },
    entries: [],
    boss: { kind: "antiphon" },
    bossType: "normal",
  },
];
