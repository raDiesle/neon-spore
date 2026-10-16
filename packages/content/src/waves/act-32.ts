import type { Wave } from "../wave-types.js";

/**
 * Waves 341 to 350 of the game, in the order they are played: THE CLASP's block
 * and the boss THE WELL.
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
      { beat: 0, col: 6, kind: "clasp", color: "red" },
      { beat: 8, col: 1, kind: "meteor", color: null },
      { beat: 16, col: 4, kind: "clasp", color: "cyan" },
      { beat: 22, col: 10, kind: "meteor", color: null },
      { beat: 30, col: 6, kind: "clasp", color: "cyan" },
    ],
  },
  {
    id: "theClaspSpread",
    name: "CLASP SPRINKLE",
    variant: true,
    entries: [
      { beat: 0, col: 3, kind: "clasp", color: "red" },
      { beat: 7, col: 0, kind: "lure", color: "cyan" },
      { beat: 21, col: 3, kind: "clasp", color: "red" },
      { beat: 26, col: 7, kind: "lure", color: "cyan" },
    ],
    pods: [{ beat: 14, col: 7, row: 3, kind: "pod" }],
  },
  {
    id: "theClaspReach",
    name: "FAR CLASP",
    variant: true,
    entries: [
      { beat: 0, col: 10, kind: "clasp", color: "red" },
      { beat: 5, col: 5, kind: "lure", color: "cyan" },
      { beat: 11, col: 9, kind: "seeder", color: "red" },
      { beat: 17, col: 4, kind: "clasp", color: "cyan" },
      { beat: 23, col: 9, kind: "lure", color: "red" },
      { beat: 29, col: 4, kind: "seeder", color: "red" },
    ],
  },
  {
    id: "theClaspPair",
    name: "CLASP AND LURE",
    variant: true,
    entries: [
      { beat: 0, col: 2, color: "red" },
      { beat: 4, col: 6, kind: "clasp", color: "cyan" },
      { beat: 8, col: 7, color: "cyan" },
      { beat: 13, col: 2, kind: "lure", color: "cyan" },
      { beat: 18, col: 9, color: "red" },
      { beat: 23, col: 0, kind: "magnet", color: "cyan" },
      { beat: 29, col: 10, color: "cyan" },
      { beat: 33, col: 0, kind: "clasp", color: "red" },
    ],
  },
  {
    id: "theClaspBreathe",
    name: "CLASP PICNIC",
    variant: true,
    entries: [
      { beat: 0, col: 6, color: "red" },
      { beat: 7, col: 4, kind: "clasp", color: "cyan" },
      { beat: 13, col: 3, color: "red" },
      { beat: 21, col: 10, kind: "lure", color: "red" },
      { beat: 27, col: 3, color: "cyan" },
      { beat: 34, col: 1, kind: "strand", color: "red", beads: 2 },
    ],
  },
  {
    id: "theClaspRecall",
    name: "CLASP MEMORY",
    variant: true,
    entries: [
      { beat: 0, col: 2, color: "red" },
      { beat: 5, col: 5, kind: "clasp", color: "red" },
      { beat: 11, col: 0, color: "red" },
      { beat: 17, col: 4, kind: "countdown", color: "red" },
      { beat: 22, col: 6, color: "red" },
      { beat: 28, col: 1, kind: "clasp", color: "cyan" },
      { beat: 34, col: 10, color: "red" },
      { beat: 39, col: 1, kind: "countdown", color: "red" },
    ],
  },
  {
    id: "theClaspBend",
    name: "CLASP TRICK",
    variant: true,
    entries: [
      { beat: 0, col: 3, color: "cyan" },
      { beat: 5, col: 6, kind: "clasp", color: "red" },
      { beat: 11, col: 4, color: "cyan" },
      { beat: 17, col: 8, kind: "lure", color: "cyan" },
      { beat: 22, col: 1, color: "cyan" },
      { beat: 22, col: 9, color: "cyan" },
      { beat: 28, col: 9, kind: "clasp", color: "cyan" },
      { beat: 34, col: 7, kind: "lure", color: "cyan" },
      { beat: 40, col: 1, color: "cyan" },
      { beat: 40, col: 9, color: "cyan" },
      { beat: 46, col: 5, kind: "clasp", color: "red" },
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
