import type { Wave } from "../wave-types.js";

/**
 * Waves 354 to 363 of the game, in the order they are played: THE DART's block,
 * the filler before THE REPRISE and the boss THE REPRISE.
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
    name: "FAR DART",
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
    name: "DART AND CLASP",
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
    name: "DART MEMORY",
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
    name: "DART ECLIPSE",
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
    id: "fillerRepriseBreathe",
    name: "DART SIESTA",
    entries: [
      { beat: 0, col: 0, color: "red" },
      { beat: 8, col: 2, kind: "dart", color: "cyan" },
      { beat: 14, col: 9, color: "cyan" },
      { beat: 21, col: 7, kind: "clasp", color: "cyan" },
      { beat: 27, col: 0, color: "red" },
      { beat: 33, col: 2, kind: "seeder", color: "red" },
      { beat: 39, col: 0, color: "red" },
    ],
  },
  {
    id: "fillerRepriseRecall",
    name: "DART RELIC",
    variant: true,
    entries: [
      { beat: 0, col: 9, color: "cyan" },
      { beat: 6, col: 1, kind: "dart", color: "cyan" },
      { beat: 11, col: 4, color: "cyan" },
      { beat: 21, col: 3, color: "cyan" },
      { beat: 21, col: 7, color: "cyan" },
      { beat: 27, col: 2, kind: "dart", color: "cyan" },
      { beat: 39, col: 1, color: "cyan" },
      { beat: 39, col: 9, color: "cyan" },
    ],
    pods: [
      { beat: 16, col: 7, row: 4, kind: "husk" },
      { beat: 33, col: 10, row: 4, kind: "husk" },
    ],
  },
  {
    id: "fillerRepriseBend",
    name: "DART ILLUSION",
    variant: true,
    entries: [
      { beat: 0, col: 8, color: "cyan" },
      { beat: 5, col: 6, kind: "dart", color: "cyan" },
      { beat: 11, col: 3, color: "cyan" },
      { beat: 11, col: 7, color: "cyan" },
      { beat: 16, col: 8, kind: "clasp", color: "cyan" },
      { beat: 21, col: 1, kind: "dart", color: "cyan" },
      { beat: 29, col: 1, color: "red" },
      { beat: 29, col: 9, color: "red" },
      { beat: 34, col: 6, kind: "clasp", color: "cyan" },
      { beat: 39, col: 9, kind: "dart", color: "red" },
      { beat: 44, col: 5, color: "cyan" },
      { beat: 44, col: 8, color: "cyan" },
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
