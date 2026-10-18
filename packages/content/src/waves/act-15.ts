import { STARE_LEVELS } from "../stare-levels.js";
import type { Wave } from "../wave-types.js";

/**
 * Waves 250 to 261 of the game, in the order they are played: THE FENCE's
 * block, the filler before THE STARE and the boss THE STARE.
 *
 * Cut by `bun run waves:order --write` (`waves-recut.ts`), which cuts every act
 * after the tutorial arc again in play order. A save that fills it cuts a page
 * after it (`acts.ts`).
 */
export const WAVES_ACT_15: Wave[] = [
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
      { beat: 0, col: 6, kind: "fence", color: null },
      { beat: 8, col: 3, kind: "fence", color: null },
      { beat: 15, col: 8, kind: "fence", color: null },
      { beat: 21, col: 2, kind: "fence", color: null },
      { beat: 29, col: 7, kind: "fence", color: null },
    ],
  },
  {
    id: "theFenceReach",
    name: "OUTER FENCE",
    variant: true,
    entries: [
      { beat: 0, col: 0, kind: "fence", color: null },
      { beat: 6, col: 5, kind: "veer", color: null },
      { beat: 11, col: 9, kind: "fence", color: null },
      { beat: 17, col: 5, kind: "veer", color: null },
      { beat: 22, col: 1, kind: "fence", color: null },
      { beat: 28, col: 6, kind: "veer", color: null },
    ],
  },
  {
    id: "theFencePair",
    name: "FENCE ALLIANCE",
    variant: true,
    entries: [
      { beat: 0, col: 1, color: "red" },
      { beat: 6, col: 0, kind: "fence", color: null },
      { beat: 10, col: 4, color: "red" },
      { beat: 14, col: 10, kind: "veer", color: null },
      { beat: 22, col: 0, color: "cyan" },
      { beat: 28, col: 7, kind: "dart", color: "cyan" },
      { beat: 34, col: 3, color: "red" },
      { beat: 39, col: 9, kind: "fence", color: null },
    ],
  },
  {
    id: "theFenceRecall",
    name: "ANCIENT FENCE",
    variant: true,
    entries: [
      { beat: 0, col: 2, color: "red" },
      { beat: 5, col: 8, kind: "fence", color: null },
      { beat: 11, col: 0, color: "cyan" },
      { beat: 16, col: 10, kind: "ghost", color: "cyan", path: "across" },
      { beat: 24, col: 4, color: "red" },
      { beat: 30, col: 9, kind: "fence", color: null },
      { beat: 36, col: 4, color: "cyan" },
    ],
  },
  {
    id: "theFencePeak",
    name: "FENCE INFERNO",
    variant: true,
    entries: [
      { beat: 0, col: 1, color: "red" },
      { beat: 5, col: 6, kind: "fence", color: null },
      { beat: 9, col: 8, color: "cyan" },
      { beat: 13, col: 5, kind: "veer", color: null },
      { beat: 16, col: 2, color: "cyan" },
      { beat: 16, col: 8, color: "cyan" },
      { beat: 24, col: 2, kind: "veil", color: null },
      { beat: 28, col: 0, kind: "fence", color: null },
      { beat: 32, col: 2, color: "cyan" },
      { beat: 32, col: 8, color: "cyan" },
      { beat: 37, col: 8, kind: "veer", color: null },
      { beat: 41, col: 7, kind: "veil", color: null },
      { beat: 46, col: 2, color: "cyan" },
      { beat: 46, col: 8, color: "cyan" },
    ],
  },
  {
    id: "fillerStareBreathe",
    name: "SLEEPY FENCE",
    entries: [
      { beat: 0, col: 1, color: "red" },
      { beat: 6, col: 5, kind: "fence", color: null },
      { beat: 12, col: 6, color: "cyan" },
      { beat: 19, col: 9, kind: "veer", color: null },
      { beat: 26, col: 4, color: "cyan" },
      { beat: 34, col: 2, kind: "fence", color: null },
    ],
  },
  {
    id: "fillerStareRecall",
    name: "FENCE SAGA",
    variant: true,
    entries: [
      { beat: 0, col: 6, color: "cyan" },
      { beat: 5, col: 5, kind: "fence", color: null },
      { beat: 11, col: 9, color: "cyan" },
      { beat: 17, col: 4, kind: "fence", color: null },
      { beat: 22, col: 0, color: "cyan" },
      { beat: 28, col: 7, kind: "fence", color: null },
      { beat: 33, col: 3, color: "cyan" },
      { beat: 38, col: 9, kind: "fence", color: null },
    ],
  },
  {
    id: "fillerStareBend",
    name: "FENCE RIDDLE",
    variant: true,
    entries: [
      { beat: 0, col: 3, color: "red" },
      { beat: 5, col: 10, kind: "fence", color: null },
      { beat: 13, col: 9, color: "cyan" },
      { beat: 19, col: 5, kind: "veer", color: null },
      { beat: 24, col: 3, color: "red" },
      { beat: 24, col: 7, color: "red" },
      { beat: 30, col: 6, kind: "fence", color: null },
      { beat: 36, col: 3, kind: "veer", color: null },
      { beat: 42, col: 3, color: "cyan" },
      { beat: 42, col: 7, color: "cyan" },
      { beat: 47, col: 9, kind: "fence", color: null },
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
