import type { Wave } from "../wave-types.js";

/**
 * Waves 242 to 253 of the game, in the order they are played: THE FENCE's
 * block, the filler before THE CURTAIN and the boss THE CURTAIN.
 *
 * Cut by `bun run waves:order --write` (`waves-recut.ts`), which cuts every act
 * after the tutorial arc again in play order. A save that fills it cuts a page
 * after it (`acts.ts`).
 */
export const WAVES_ACT_22: Wave[] = [
  {
    id: "theFence",
    name: "THE FENCE",
    guide: {
      scene: "theFence",
    },
    entries: [
      { beat: 0, col: 5, kind: "fence", color: null },
      { beat: 12, col: 5, kind: "fence", color: null },
      { beat: 24, col: 5, kind: "fence", color: null },
    ],
  },
  {
    id: "theGap",
    name: "THE GAP",
    variant: true,
    guide: {
      scene: "theGap",
    },
    entries: [
      { beat: 0, col: 8, kind: "fence", color: null },
      { beat: 12, col: 2, kind: "fence", color: null },
      { beat: 26, col: 10, kind: "fence", color: null },
      { beat: 40, col: 0, kind: "fence", color: null },
      { beat: 56, col: 5, kind: "fence", color: null },
    ],
  },
  {
    id: "theCut",
    name: "THE CUT",
    variant: true,
    guide: {
      scene: "theCut",
    },
    entries: [
      { beat: 0, col: 5, kind: "fence", color: null, gaps: [], cracksRed: [5] },
      { beat: 16, col: 5, kind: "fence", color: null, gaps: [], cracksCyan: [8] },
      { beat: 32, col: 5, kind: "fence", color: null, gaps: [], cracksRed: [2] },
      { beat: 48, col: 5, kind: "fence", color: null, gaps: [], cracksCyan: [7] },
    ],
  },
  {
    id: "theFenceAgain",
    name: "NEW FENCE MOON",
    variant: true,
    entries: [
      { beat: 0, col: 1, kind: "fence", color: null },
      { beat: 6, col: 9, kind: "fence", color: null },
      { beat: 12, col: 2, kind: "fence", color: null },
      { beat: 20, col: 4, kind: "fence", color: null },
      { beat: 27, col: 2, kind: "fence", color: null },
    ],
  },
  {
    id: "theFenceReach",
    name: "FAR FENCE",
    variant: true,
    entries: [
      { beat: 0, col: 1, kind: "fence", color: null },
      { beat: 5, col: 6, kind: "strand", color: "red", beads: 2 },
      { beat: 11, col: 0, kind: "meteor", color: null },
      { beat: 16, col: 4, kind: "fence", color: null },
      { beat: 21, col: 8, kind: "strand", color: "red", beads: 5 },
      { beat: 26, col: 3, kind: "meteor", color: null },
    ],
  },
  {
    id: "theFencePair",
    name: "FENCE AND STRAND",
    variant: true,
    entries: [
      { beat: 0, col: 4, color: "red" },
      { beat: 4, col: 0, kind: "fence", color: null },
      { beat: 10, col: 9, color: "red" },
      { beat: 15, col: 1, kind: "strand", color: "red", beads: 2 },
      { beat: 19, col: 3, color: "red" },
      { beat: 24, col: 9, kind: "beatbox", color: null, beats: 2 },
      { beat: 29, col: 4, color: "cyan" },
      { beat: 35, col: 10, kind: "fence", color: null },
    ],
  },
  {
    id: "theFenceRecall",
    name: "FENCE MEMORY",
    variant: true,
    entries: [
      { beat: 0, col: 1, color: "cyan" },
      { beat: 6, col: 7, kind: "fence", color: null },
      { beat: 11, col: 10, color: "red" },
      { beat: 17, col: 0, kind: "throb", color: "red" },
      { beat: 22, col: 10, color: "red" },
      { beat: 28, col: 4, kind: "fence", color: null },
      { beat: 33, col: 8, color: "red" },
      { beat: 38, col: 5, kind: "throb", color: "red" },
    ],
  },
  {
    id: "theFencePeak",
    name: "FENCE ECLIPSE",
    variant: true,
    entries: [
      { beat: 0, col: 1, color: "red" },
      { beat: 3, col: 0, kind: "fence", color: null },
      { beat: 6, col: 6, color: "cyan" },
      { beat: 10, col: 2, kind: "strand", color: "red", beads: 2 },
      { beat: 13, col: 2, color: "cyan" },
      { beat: 13, col: 8, color: "cyan" },
      { beat: 20, col: 5, kind: "fence", color: null },
      { beat: 24, col: 1, color: "cyan" },
      { beat: 24, col: 9, color: "cyan" },
      { beat: 28, col: 4, kind: "strand", color: "red", beads: 5 },
      { beat: 34, col: 4, color: "red" },
      { beat: 34, col: 7, color: "red" },
      { beat: 38, col: 8, kind: "fence", color: null },
      { beat: 42, col: 4, kind: "strand", color: "red", beads: 5 },
      { beat: 45, col: 7, color: "cyan" },
    ],
    pods: [
      { beat: 17, col: 4, row: 4, kind: "husk" },
      { beat: 31, col: 0, row: 4, kind: "husk" },
    ],
  },
  {
    id: "fillerCurtainBreathe",
    name: "FENCE LULLABY",
    entries: [
      { beat: 0, col: 2, color: "red" },
      { beat: 6, col: 3, kind: "fence", color: null },
      { beat: 13, col: 2, color: "cyan" },
      { beat: 19, col: 1, kind: "strand", color: "red", beads: 2 },
      { beat: 27, col: 2, color: "red" },
      { beat: 34, col: 10, kind: "shell", color: "red" },
    ],
  },
  {
    id: "fillerCurtainRecall",
    name: "ANCIENT FENCE",
    variant: true,
    entries: [
      { beat: 0, col: 9, color: "red" },
      { beat: 5, col: 6, kind: "fence", color: null },
      { beat: 11, col: 1, color: "red" },
      { beat: 17, col: 9, kind: "fence", color: null },
      { beat: 23, col: 3, color: "red" },
      { beat: 28, col: 6, kind: "fence", color: null },
      { beat: 33, col: 1, color: "red" },
      { beat: 38, col: 2, kind: "fence", color: null },
    ],
  },
  {
    id: "fillerCurtainBend",
    name: "FENCE MIRAGE",
    variant: true,
    entries: [
      { beat: 0, col: 10, color: "cyan" },
      { beat: 6, col: 2, kind: "fence", color: null },
      { beat: 12, col: 3, color: "red" },
      { beat: 17, col: 4, kind: "strand", color: "cyan", beads: 3 },
      { beat: 23, col: 3, color: "red" },
      { beat: 23, col: 7, color: "red" },
      { beat: 29, col: 0, kind: "fence", color: null },
      { beat: 34, col: 3, kind: "strand", color: "red", beads: 2 },
      { beat: 39, col: 2, color: "red" },
      { beat: 39, col: 8, color: "red" },
      { beat: 44, col: 5, kind: "fence", color: null },
    ],
  },
  {
    id: "theCurtain",
    name: "THE CURTAIN",
    guide: {
      scene: "theCurtain",
    },
    entries: [],
    boss: { kind: "curtain" },
    bossType: "normal",
  },
];
