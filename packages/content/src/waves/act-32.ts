import type { Wave } from "../wave-types.js";

/**
 * Waves 345 to 354 of the game, in the order they are played: THE CLASP's
 * block, the filler before THE WELL and the boss THE WELL.
 *
 * Cut by `bun run waves:order --write` (`waves-recut.ts`), which cuts every act
 * after the tutorial arc again in play order. A save that fills it cuts a page
 * after it (`acts.ts`).
 */
export const WAVES_ACT_32: Wave[] = [
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
      { beat: 0, col: 6, kind: "clasp", color: "cyan" },
      { beat: 7, col: 5, kind: "meteor", color: null },
      { beat: 13, col: 3, kind: "clasp", color: "cyan" },
      { beat: 20, col: 9, kind: "meteor", color: null },
      { beat: 26, col: 7, kind: "clasp", color: "red" },
    ],
  },
  {
    id: "theClaspReach",
    name: "FAR CLASP",
    variant: true,
    entries: [
      { beat: 0, col: 9, kind: "clasp", color: "cyan" },
      { beat: 5, col: 5, kind: "lure", color: "red" },
      { beat: 11, col: 0, color: "cyan" },
      { beat: 17, col: 4, kind: "clasp", color: "cyan" },
      { beat: 23, col: 8, kind: "lure", color: "cyan" },
      { beat: 29, col: 2, color: "cyan" },
    ],
  },
  {
    id: "theClaspPair",
    name: "CLASP AND LURE",
    variant: true,
    entries: [
      { beat: 0, col: 10, color: "cyan" },
      { beat: 5, col: 0, kind: "clasp", color: "cyan" },
      { beat: 10, col: 4, color: "red" },
      { beat: 16, col: 1, kind: "lure", color: "cyan" },
      { beat: 21, col: 4, color: "red" },
      { beat: 25, col: 3, kind: "morsel", color: "red" },
      { beat: 30, col: 8, color: "cyan" },
      { beat: 34, col: 5, kind: "clasp", color: "cyan" },
    ],
  },
  {
    id: "theClaspRecall",
    name: "CLASP MEMORY",
    variant: true,
    entries: [
      { beat: 0, col: 6, color: "cyan" },
      { beat: 6, col: 9, kind: "clasp", color: "cyan" },
      { beat: 11, col: 4, color: "red" },
      { beat: 16, col: 5, kind: "strand", color: "cyan", beads: 3 },
      { beat: 22, col: 10, color: "cyan" },
      { beat: 28, col: 0, kind: "clasp", color: "red" },
      { beat: 33, col: 10, color: "cyan" },
      { beat: 38, col: 0, kind: "strand", color: "red", beads: 2 },
    ],
  },
  {
    id: "theClaspPeak",
    name: "CLASP ECLIPSE",
    variant: true,
    entries: [
      { beat: 0, col: 4, color: "red" },
      { beat: 4, col: 6, kind: "clasp", color: "red" },
      { beat: 7, col: 5, color: "cyan" },
      { beat: 10, col: 10, kind: "lure", color: "cyan" },
      { beat: 14, col: 3, color: "red" },
      { beat: 14, col: 7, color: "red" },
      { beat: 22, col: 2, kind: "clasp", color: "red" },
      { beat: 26, col: 0, color: "cyan" },
      { beat: 26, col: 10, color: "cyan" },
      { beat: 30, col: 10, kind: "lure", color: "red" },
      { beat: 37, col: 3, color: "red" },
      { beat: 37, col: 7, color: "red" },
      { beat: 41, col: 9, kind: "clasp", color: "cyan" },
      { beat: 45, col: 3, kind: "lure", color: "cyan" },
      { beat: 48, col: 9, color: "cyan" },
    ],
    pods: [
      { beat: 18, col: 8, row: 4, kind: "husk" },
      { beat: 34, col: 7, row: 4, kind: "husk" },
    ],
  },
  {
    id: "fillerWellBreathe",
    name: "CLASP SIESTA",
    entries: [
      { beat: 0, col: 9, color: "cyan" },
      { beat: 6, col: 7, kind: "clasp", color: "red" },
      { beat: 14, col: 2, color: "red" },
      { beat: 22, col: 7, kind: "lure", color: "cyan" },
      { beat: 28, col: 5, color: "red" },
      { beat: 35, col: 1, kind: "glutton", color: "red" },
    ],
  },
  {
    id: "fillerWellRecall",
    name: "CLASP RELIC",
    variant: true,
    entries: [
      { beat: 0, col: 8, color: "cyan" },
      { beat: 6, col: 10, kind: "clasp", color: "cyan" },
      { beat: 12, col: 8, color: "red" },
      { beat: 18, col: 7, kind: "clasp", color: "cyan" },
      { beat: 24, col: 5, color: "red" },
      { beat: 24, col: 8, color: "red" },
      { beat: 30, col: 7, kind: "clasp", color: "red" },
      { beat: 35, col: 1, color: "red" },
    ],
  },
  {
    id: "fillerWellBend",
    name: "CLASP ILLUSION",
    variant: true,
    entries: [
      { beat: 0, col: 7, color: "red" },
      { beat: 5, col: 8, kind: "clasp", color: "red" },
      { beat: 10, col: 4, color: "red" },
      { beat: 10, col: 7, color: "red" },
      { beat: 16, col: 9, kind: "lure", color: "cyan" },
      { beat: 22, col: 4, kind: "clasp", color: "red" },
      { beat: 28, col: 3, color: "red" },
      { beat: 28, col: 6, color: "red" },
      { beat: 34, col: 1, kind: "lure", color: "cyan" },
      { beat: 40, col: 0, kind: "clasp", color: "cyan" },
      { beat: 45, col: 3, color: "cyan" },
      { beat: 45, col: 6, color: "cyan" },
    ],
  },
  {
    id: "theWell",
    name: "THE WELL",
    guide: {
      scene: "theWell",
    },
    entries: [
      { beat: 0, col: 5, color: "red" },
      { beat: 8, col: 7, color: "cyan" },
      { beat: 18, col: 0, color: "cyan" },
      { beat: 26, col: 10, color: "red" },
      { beat: 38, col: 10, color: "cyan" },
      { beat: 46, col: 0, color: "red" },
      { beat: 58, col: 5, color: "cyan" },
    ],
    boss: { kind: "well" },
    bossType: "special",
  },
];
