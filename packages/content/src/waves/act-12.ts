import { STARE_LEVELS } from "../stare-levels.js";
import type { Wave } from "../wave-types.js";

/**
 * Waves 223 to 236 of the game, in the order they are played: the filler before
 * THE WARDEN, the boss THE WARDEN, THE FENCE's block, the filler before THE
 * STARE and the boss THE STARE.
 *
 * Cut by `bun run waves:order --write` (`waves-recut.ts`), which cuts every act
 * after the tutorial arc again in play order. A save that fills it cuts a page
 * after it (`acts.ts`).
 */
export const WAVES_ACT_12: Wave[] = [
  {
    id: "fillerWardenBreathe",
    name: "WARDEN HUSH",
    entries: [
      { beat: 0, col: 0, color: "cyan" },
      { beat: 7, col: 10, kind: "gyre", color: null },
      { beat: 13, col: 3, color: "cyan" },
      { beat: 19, col: 4, kind: "seeder", color: "red" },
      { beat: 25, col: 0, color: "cyan" },
      { beat: 33, col: 4, kind: "rind", color: "red" },
    ],
  },
  {
    id: "fillerWardenRecall",
    name: "WARDEN RELIC",
    variant: true,
    entries: [
      { beat: 0, col: 8, color: "red" },
      { beat: 5, col: 10, kind: "meteorMedium", color: null },
      { beat: 12, col: 0, color: "cyan" },
      { beat: 17, col: 10, kind: "morsel", color: "cyan" },
      { beat: 25, col: 4, color: "red" },
      { beat: 31, col: 9, kind: "gyre", color: null },
      { beat: 37, col: 1, color: "red" },
    ],
  },
  {
    id: "fillerWardenBend",
    name: "WARDEN ILLUSION",
    variant: true,
    entries: [
      { beat: 0, col: 1, color: "red" },
      { beat: 6, col: 9, kind: "torch", color: null },
      { beat: 12, col: 2, color: "cyan" },
      { beat: 17, col: 0, kind: "meteor", color: null, cross: -1, row: 6 },
      { beat: 24, col: 1, color: "cyan" },
      { beat: 24, col: 9, color: "cyan" },
      { beat: 31, col: 0, kind: "recoil", color: "cyan" },
      { beat: 36, col: 3, kind: "torch", color: null },
      { beat: 42, col: 4, color: "red" },
      { beat: 42, col: 7, color: "red" },
      { beat: 48, col: 6, kind: "meteor", color: null, cross: -1, row: 7 },
    ],
  },
  {
    id: "theWarden",
    name: "THE WARDEN",
    guide: {
      scene: "theWarden",
    },
    entries: [],
    boss: { kind: "warden" },
    bossType: "normal",
    controls: "standard5",
  },
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
    id: "theFencePair",
    name: "FENCE ALLIANCE",
    variant: true,
    entries: [
      { beat: 0, col: 4, color: "red" },
      { beat: 6, col: 10, kind: "fence", color: null },
      { beat: 12, col: 7, color: "red" },
      { beat: 17, col: 6, kind: "veer", color: null },
      { beat: 22, col: 5, color: "cyan" },
      { beat: 27, col: 3, kind: "fence", color: null },
      { beat: 33, col: 6, color: "cyan" },
      { beat: 38, col: 5, kind: "morsel", color: "red" },
    ],
  },
  {
    id: "theFenceRecall",
    name: "ANCIENT FENCE",
    variant: true,
    entries: [
      { beat: 0, col: 8, color: "red" },
      { beat: 5, col: 2, kind: "fence", color: null },
      { beat: 10, col: 7, color: "red" },
      { beat: 15, col: 6, kind: "gyre", color: null },
      { beat: 20, col: 10, color: "red" },
      { beat: 27, col: 0, kind: "fence", color: null },
      { beat: 33, col: 7, color: "cyan" },
      { beat: 39, col: 9, kind: "meteor", color: null },
    ],
  },
  {
    id: "theFencePeak",
    name: "FENCE INFERNO",
    variant: true,
    entries: [
      { beat: 0, col: 4, color: "cyan" },
      { beat: 3, col: 3, kind: "fence", color: null },
      { beat: 7, col: 4, color: "cyan" },
      { beat: 11, col: 7, kind: "veer", color: null },
      { beat: 14, col: 3, color: "cyan" },
      { beat: 14, col: 7, color: "cyan" },
      { beat: 22, col: 9, kind: "fence", color: null },
      { beat: 31, col: 2, color: "cyan" },
      { beat: 31, col: 8, color: "cyan" },
      { beat: 35, col: 0, kind: "fence", color: null },
      { beat: 39, col: 3, kind: "veer", color: null },
      { beat: 43, col: 4, color: "red" },
      { beat: 43, col: 7, color: "red" },
      { beat: 47, col: 2, kind: "fence", color: null },
    ],
    pods: [{ beat: 26, col: 7, row: 4, kind: "husk" }],
  },
  {
    id: "fillerStareBreathe",
    name: "SLEEPY STARE",
    entries: [
      { beat: 0, col: 8, color: "cyan" },
      { beat: 7, col: 10, kind: "blister", color: null, row: 2, gesture: "swipe" },
      { beat: 14, col: 8, color: "red" },
      { beat: 22, col: 0, kind: "meteorMedium", color: null },
      { beat: 29, col: 4, color: "red" },
      { beat: 35, col: 6, kind: "shell", color: "cyan" },
    ],
  },
  {
    id: "fillerStareRecall",
    name: "STARE SAGA",
    variant: true,
    entries: [
      { beat: 0, col: 4, color: "red" },
      { beat: 6, col: 9, kind: "countdown", color: "cyan" },
      { beat: 11, col: 10, color: "cyan" },
      { beat: 18, col: 1, kind: "gyre", color: null },
      { beat: 23, col: 5, color: "cyan" },
      { beat: 29, col: 2, kind: "meteor", color: null },
      { beat: 34, col: 4, color: "red" },
      { beat: 39, col: 7, kind: "countdown", color: "cyan" },
    ],
  },
  {
    id: "fillerStareBend",
    name: "STARE RIDDLE",
    variant: true,
    entries: [
      { beat: 0, col: 3, color: "cyan" },
      { beat: 6, col: 0, kind: "meteor", color: null, cross: 1, row: 4 },
      { beat: 6, col: 10, kind: "meteor", color: null, cross: 1, row: 4 },
      { beat: 11, col: 9, color: "red" },
      { beat: 16, col: 8, color: "red" },
      { beat: 22, col: 9, kind: "shell", color: "cyan" },
      { beat: 28, col: 1, color: "red" },
      { beat: 33, col: 5, kind: "gyre", color: null },
      { beat: 39, col: 2, color: "cyan" },
      { beat: 39, col: 8, color: "cyan" },
      { beat: 45, col: 5, kind: "meteor", color: null, cross: -1, row: 7 },
    ],
  },
  {
    id: "theStare",
    name: "THE STARE",
    entries: [],
    boss: { kind: "stare", levels: STARE_LEVELS },
    bossType: "normal",
  },
];
