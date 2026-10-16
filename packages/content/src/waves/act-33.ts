import type { Wave } from "../wave-types.js";

/**
 * Waves 348 to 357 of the game, in the order they are played: THE DART's block
 * and the boss THE REPRISE.
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
      { beat: 17, col: 8, kind: "dart", color: "cyan" },
      { beat: 26, col: 3, kind: "dart", color: "cyan" },
    ],
  },
  {
    id: "theDartAgain",
    name: "NEW DART MOON",
    variant: true,
    entries: [
      { beat: 0, col: 4, kind: "dart", color: "cyan" },
      { beat: 6, col: 3, kind: "meteor", color: null },
      { beat: 13, col: 2, kind: "dart", color: "cyan" },
      { beat: 20, col: 6, kind: "meteor", color: null },
      { beat: 26, col: 2, kind: "dart", color: "cyan" },
    ],
  },
  {
    id: "theDartSpread",
    name: "DART SPRINKLE",
    variant: true,
    entries: [
      { beat: 0, col: 2, kind: "dart", color: "cyan" },
      { beat: 6, col: 5, kind: "clasp", color: "cyan" },
      { beat: 13, col: 6, kind: "throb", color: "red" },
      { beat: 18, col: 4, kind: "dart", color: "red" },
      { beat: 23, col: 2, kind: "clasp", color: "cyan" },
      { beat: 30, col: 7, kind: "throb", color: "red" },
    ],
  },
  {
    id: "theDartReach",
    name: "FAR DART",
    variant: true,
    entries: [
      { beat: 0, col: 9, kind: "dart", color: "cyan" },
      { beat: 6, col: 5, kind: "clasp", color: "cyan" },
      { beat: 11, col: 10, kind: "coil", color: null },
      { beat: 16, col: 5, kind: "dart", color: "cyan" },
      { beat: 21, col: 9, kind: "clasp", color: "cyan" },
      { beat: 27, col: 4, kind: "coil", color: null },
    ],
  },
  {
    id: "theDartPair",
    name: "DART AND CLASP",
    variant: true,
    entries: [
      { beat: 0, col: 3, color: "cyan" },
      { beat: 5, col: 5, kind: "dart", color: "cyan" },
      { beat: 9, col: 6, color: "cyan" },
      { beat: 14, col: 5, kind: "clasp", color: "red" },
      { beat: 18, col: 0, color: "cyan" },
      { beat: 24, col: 10, kind: "countdown", color: "cyan" },
      { beat: 30, col: 0, color: "cyan" },
      { beat: 34, col: 8, kind: "dart", color: "cyan" },
    ],
  },
  {
    id: "theDartBreathe",
    name: "DART PICNIC",
    variant: true,
    entries: [
      { beat: 0, col: 0, color: "cyan" },
      { beat: 8, col: 7, kind: "dart", color: "cyan" },
      { beat: 16, col: 9, color: "cyan" },
      { beat: 24, col: 4, kind: "clasp", color: "cyan" },
      { beat: 32, col: 0, color: "red" },
      { beat: 39, col: 9, kind: "balloon", color: null },
    ],
  },
  {
    id: "theDartRecall",
    name: "DART MEMORY",
    variant: true,
    entries: [
      { beat: 0, col: 0, color: "red" },
      { beat: 5, col: 9, kind: "dart", color: "red" },
      { beat: 10, col: 0, color: "red" },
      { beat: 16, col: 3, kind: "dart", color: "cyan" },
      { beat: 22, col: 7, color: "red" },
      { beat: 27, col: 4, kind: "dart", color: "red" },
      { beat: 33, col: 3, color: "red" },
      { beat: 38, col: 9, kind: "dart", color: "cyan" },
    ],
  },
  {
    id: "theDartBend",
    name: "DART TRICK",
    variant: true,
    entries: [
      { beat: 0, col: 3, color: "red" },
      { beat: 5, col: 7, kind: "dart", color: "cyan" },
      { beat: 10, col: 3, color: "red" },
      { beat: 15, col: 4, kind: "clasp", color: "red" },
      { beat: 20, col: 2, color: "red" },
      { beat: 20, col: 8, color: "red" },
      { beat: 25, col: 5, kind: "dart", color: "red" },
      { beat: 31, col: 6, kind: "clasp", color: "cyan" },
      { beat: 36, col: 3, color: "red" },
      { beat: 36, col: 7, color: "red" },
      { beat: 41, col: 1, kind: "dart", color: "cyan" },
      { beat: 47, col: 10, kind: "clasp", color: "cyan" },
    ],
  },
  {
    id: "theDartPeak",
    name: "DART ECLIPSE",
    variant: true,
    entries: [
      { beat: 0, col: 10, color: "cyan" },
      { beat: 4, col: 3, kind: "dart", color: "red" },
      { beat: 7, col: 4, color: "cyan" },
      { beat: 10, col: 3, kind: "clasp", color: "cyan" },
      { beat: 14, col: 4, color: "red" },
      { beat: 14, col: 7, color: "red" },
      { beat: 21, col: 7, kind: "dart", color: "red" },
      { beat: 25, col: 3, color: "red" },
      { beat: 25, col: 7, color: "red" },
      { beat: 29, col: 8, kind: "clasp", color: "cyan" },
      { beat: 36, col: 4, color: "red" },
      { beat: 36, col: 7, color: "red" },
      { beat: 39, col: 8, kind: "dart", color: "cyan" },
      { beat: 42, col: 7, kind: "clasp", color: "red" },
      { beat: 46, col: 9, color: "cyan" },
    ],
    pods: [
      { beat: 17, col: 10, row: 3, kind: "pod" },
      { beat: 33, col: 7, row: 3, kind: "pod" },
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
