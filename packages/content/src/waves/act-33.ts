import type { Wave } from "../wave-types.js";

/**
 * Waves 355 to 364 of the game, in the order they are played: THE DART's block,
 * the filler before THE REPRISE and the boss THE REPRISE.
 *
 * Cut by `bun run waves:order --write` (`waves-recut.ts`), which cuts every act
 * after the tutorial arc again in play order. A save that fills it cuts a page
 * after it (`acts.ts`).
 */
export const WAVES_ACT_33: Wave[] = [
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
      { beat: 0, col: 10, kind: "dart", color: "cyan" },
      { beat: 6, col: 5, color: "cyan" },
      { beat: 13, col: 8, kind: "dart", color: "red" },
      { beat: 19, col: 4, color: "cyan" },
      { beat: 27, col: 2, kind: "dart", color: "cyan" },
    ],
  },
  {
    id: "theDartReach",
    name: "FAR DART",
    variant: true,
    entries: [
      { beat: 0, col: 9, kind: "dart", color: "red" },
      { beat: 6, col: 3, kind: "clasp", color: "cyan" },
      { beat: 12, col: 10, color: "cyan" },
      { beat: 18, col: 6, kind: "dart", color: "cyan" },
      { beat: 23, col: 1, kind: "clasp", color: "red" },
      { beat: 29, col: 5, color: "cyan" },
    ],
  },
  {
    id: "theDartPair",
    name: "DART AND CLASP",
    variant: true,
    entries: [
      { beat: 0, col: 10, color: "cyan" },
      { beat: 5, col: 1, kind: "dart", color: "cyan" },
      { beat: 11, col: 8, color: "red" },
      { beat: 17, col: 2, kind: "clasp", color: "cyan" },
      { beat: 21, col: 1, color: "cyan" },
      { beat: 25, col: 7, kind: "seeder", color: "cyan" },
      { beat: 30, col: 9, color: "cyan" },
      { beat: 35, col: 7, kind: "dart", color: "red" },
    ],
  },
  {
    id: "theDartRecall",
    name: "DART MEMORY",
    variant: true,
    entries: [
      { beat: 0, col: 0, color: "red" },
      { beat: 5, col: 7, kind: "dart", color: "cyan" },
      { beat: 10, col: 10, color: "red" },
      { beat: 16, col: 8, kind: "dart", color: "cyan" },
      { beat: 21, col: 5, color: "red" },
      { beat: 26, col: 10, kind: "dart", color: "red" },
      { beat: 31, col: 0, color: "red" },
      { beat: 37, col: 10, kind: "dart", color: "cyan" },
    ],
  },
  {
    id: "theDartPeak",
    name: "DART ECLIPSE",
    variant: true,
    entries: [
      { beat: 0, col: 4, color: "cyan" },
      { beat: 4, col: 6, kind: "dart", color: "cyan" },
      { beat: 7, col: 5, color: "cyan" },
      { beat: 10, col: 8, kind: "clasp", color: "red" },
      { beat: 14, col: 5, color: "red" },
      { beat: 14, col: 8, color: "red" },
      { beat: 18, col: 0, kind: "fence", color: null },
      { beat: 22, col: 10, kind: "dart", color: "cyan" },
      { beat: 26, col: 2, color: "cyan" },
      { beat: 26, col: 8, color: "cyan" },
      { beat: 30, col: 9, kind: "clasp", color: "red" },
      { beat: 34, col: 10, kind: "fence", color: null },
      { beat: 37, col: 5, color: "red" },
      { beat: 37, col: 8, color: "red" },
      { beat: 41, col: 6, kind: "dart", color: "red" },
      { beat: 45, col: 5, kind: "clasp", color: "cyan" },
      { beat: 48, col: 0, color: "red" },
    ],
  },
  {
    id: "fillerRepriseBreathe",
    name: "DART SIESTA",
    entries: [
      { beat: 0, col: 3, color: "cyan" },
      { beat: 6, col: 4, kind: "dart", color: "cyan" },
      { beat: 13, col: 8, color: "cyan" },
      { beat: 19, col: 10, kind: "clasp", color: "cyan" },
      { beat: 27, col: 2, color: "cyan" },
      { beat: 33, col: 5, kind: "meteorMedium", color: null },
      { beat: 40, col: 6, color: "red" },
    ],
  },
  {
    id: "fillerRepriseRecall",
    name: "DART RELIC",
    variant: true,
    entries: [
      { beat: 0, col: 3, color: "red" },
      { beat: 6, col: 8, kind: "dart", color: "cyan" },
      { beat: 12, col: 1, color: "cyan" },
      { beat: 23, col: 4, color: "cyan" },
      { beat: 23, col: 7, color: "cyan" },
      { beat: 28, col: 5, kind: "dart", color: "red" },
      { beat: 40, col: 3, color: "cyan" },
      { beat: 40, col: 7, color: "cyan" },
    ],
    pods: [
      { beat: 17, col: 6, row: 3, kind: "pod" },
      { beat: 34, col: 8, row: 3, kind: "pod" },
    ],
  },
  {
    id: "fillerRepriseBend",
    name: "DART ILLUSION",
    variant: true,
    entries: [
      { beat: 0, col: 4, color: "cyan" },
      { beat: 6, col: 5, kind: "dart", color: "red" },
      { beat: 12, col: 3, color: "red" },
      { beat: 12, col: 6, color: "red" },
      { beat: 17, col: 9, kind: "clasp", color: "cyan" },
      { beat: 23, col: 3, kind: "dart", color: "cyan" },
      { beat: 29, col: 3, color: "red" },
      { beat: 29, col: 6, color: "red" },
      { beat: 35, col: 3, kind: "clasp", color: "red" },
      { beat: 40, col: 1, kind: "dart", color: "cyan" },
      { beat: 46, col: 5, color: "cyan" },
      { beat: 46, col: 8, color: "cyan" },
    ],
  },
  {
    id: "theReprise",
    name: "THE REPRISE",
    guide: {
      scene: "theReprise",
    },
    entries: [
      { beat: 0, col: 0, color: "red" },
      { beat: 3, col: 5, color: "cyan" },
      { beat: 6, col: 10, color: "red" },
      { beat: 12, col: 3, color: "cyan" },
      { beat: 14, col: 7, color: "red" },
      { beat: 18, col: 0, color: "red" },
      { beat: 21, col: 10, color: "cyan" },
    ],
    boss: { kind: "reprise", beat: 12 },
    bossType: "normal",
  },
];
