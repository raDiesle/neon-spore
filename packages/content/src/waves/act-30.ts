import type { Wave } from "../wave-types.js";

/**
 * Waves 365 to 374 of the game, in the order they are played: THE CLASP's
 * block, the filler before THE ANTIPHON and the boss THE ANTIPHON.
 *
 * Cut by `bun run waves:order --write` (`waves-recut.ts`), which cuts every act
 * after the tutorial arc again in play order. A save that fills it cuts a page
 * after it (`acts.ts`).
 */
export const WAVES_ACT_30: Wave[] = [
  {
    id: "theClasp",
    name: "THE CLASP",
    guide: {
      scene: "theClasp",
    },
    entries: [
      { beat: 0, col: 5, kind: "clasp", color: "cyan" },
      { beat: 6, col: 2, kind: "clasp", color: "red" },
      { beat: 12, col: 8, kind: "clasp", color: "red" },
      { beat: 20, col: 3, kind: "clasp", color: "cyan" },
      { beat: 28, col: 7, kind: "clasp", color: "cyan" },
    ],
  },
  {
    id: "theClaspAgain",
    name: "NEW CLASP MOON",
    variant: true,
    entries: [
      { beat: 0, col: 1, kind: "clasp", color: "cyan" },
      { beat: 8, col: 7, kind: "meteor", color: null },
      { beat: 14, col: 9, kind: "clasp", color: "red" },
      { beat: 20, col: 6, kind: "meteor", color: null },
      { beat: 26, col: 8, kind: "clasp", color: "cyan" },
    ],
  },
  {
    id: "theClaspReach",
    name: "CLASP AT WORLD END",
    variant: true,
    entries: [
      { beat: 0, col: 1, kind: "clasp", color: "cyan" },
      { beat: 6, col: 5, kind: "lure", color: "cyan" },
      { beat: 12, col: 1, color: "red" },
      { beat: 17, col: 6, kind: "clasp", color: "cyan" },
      { beat: 22, col: 10, kind: "lure", color: "cyan" },
      { beat: 28, col: 3, color: "red" },
    ],
  },
  {
    id: "theClaspPair",
    name: "CLASP WALTZ",
    variant: true,
    entries: [
      { beat: 0, col: 0, color: "cyan" },
      { beat: 4, col: 5, kind: "clasp", color: "cyan" },
      { beat: 12, col: 8, color: "red" },
      { beat: 18, col: 2, kind: "lure", color: "cyan" },
      { beat: 23, col: 1, color: "red" },
      { beat: 33, col: 9, color: "cyan" },
      { beat: 40, col: 0, kind: "clasp", color: "cyan" },
    ],
    pods: [{ beat: 28, col: 3, row: 3, kind: "pod" }],
  },
  {
    id: "theClaspRecall",
    name: "CLASP HOMECOMING",
    variant: true,
    entries: [
      { beat: 0, col: 8, color: "red" },
      { beat: 5, col: 10, kind: "clasp", color: "cyan" },
      { beat: 12, col: 0, color: "red" },
      { beat: 17, col: 10, kind: "shell", color: "red" },
      { beat: 25, col: 3, color: "red" },
      { beat: 31, col: 2, kind: "clasp", color: "red" },
      { beat: 37, col: 8, color: "red" },
    ],
  },
  {
    id: "theClaspPeak",
    name: "CLASP RAPTURE",
    variant: true,
    entries: [
      { beat: 0, col: 6, color: "cyan" },
      { beat: 3, col: 8, kind: "clasp", color: "red" },
      { beat: 7, col: 10, color: "cyan" },
      { beat: 14, col: 0, kind: "lure", color: "cyan" },
      { beat: 18, col: 4, color: "cyan" },
      { beat: 18, col: 7, color: "cyan" },
      { beat: 22, col: 3, kind: "throb", color: "red" },
      { beat: 26, col: 4, kind: "clasp", color: "red" },
      { beat: 31, col: 0, color: "cyan" },
      { beat: 31, col: 10, color: "cyan" },
      { beat: 34, col: 1, kind: "lure", color: "red" },
      { beat: 42, col: 0, kind: "throb", color: "red" },
      { beat: 48, col: 2, color: "cyan" },
      { beat: 48, col: 8, color: "cyan" },
    ],
  },
  {
    id: "fillerAntiphonBreathe",
    name: "CLASP DREAM",
    entries: [
      { beat: 0, col: 9, color: "cyan" },
      { beat: 8, col: 8, kind: "clasp", color: "cyan" },
      { beat: 14, col: 2, color: "cyan" },
      { beat: 22, col: 8, kind: "lure", color: "cyan" },
      { beat: 29, col: 7, color: "cyan" },
      { beat: 35, col: 2, kind: "clasp", color: "red" },
    ],
  },
  {
    id: "fillerAntiphonRecall",
    name: "CLASP LEGEND",
    variant: true,
    entries: [
      { beat: 0, col: 2, color: "red" },
      { beat: 6, col: 9, kind: "clasp", color: "cyan" },
      { beat: 11, col: 8, color: "cyan" },
      { beat: 16, col: 6, kind: "meteor", color: null, cross: 1, row: 5 },
      { beat: 21, col: 4, color: "red" },
      { beat: 21, col: 7, color: "red" },
      { beat: 26, col: 9, kind: "clasp", color: "red" },
      { beat: 31, col: 4, kind: "meteor", color: null, cross: 1, row: 5 },
      { beat: 37, col: 3, color: "red" },
      { beat: 37, col: 7, color: "red" },
    ],
  },
  {
    id: "fillerAntiphonBend",
    name: "CLASP PARADOX",
    variant: true,
    entries: [
      { beat: 0, col: 7, color: "cyan" },
      { beat: 6, col: 3, kind: "clasp", color: "red" },
      { beat: 11, col: 2, color: "cyan" },
      { beat: 11, col: 8, color: "cyan" },
      { beat: 16, col: 9, kind: "lure", color: "cyan" },
      { beat: 21, col: 1, kind: "clasp", color: "cyan" },
      { beat: 29, col: 3, color: "red" },
      { beat: 29, col: 6, color: "red" },
      { beat: 34, col: 2, kind: "lure", color: "cyan" },
      { beat: 40, col: 3, kind: "clasp", color: "cyan" },
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
