import { STARE_LEVELS } from "../stare-levels.js";
import type { Wave } from "../wave-types.js";

/**
 * Waves 222 to 235 of the game, in the order they are played: the filler before
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
      { beat: 0, col: 4, color: "red" },
      { beat: 7, col: 9, kind: "magnet", color: "red" },
      { beat: 15, col: 3, color: "red" },
      { beat: 21, col: 6, kind: "blister", color: null, row: 3, by: "both", gesture: "hold" },
      { beat: 27, col: 10, color: "red" },
      { beat: 34, col: 0, kind: "countdown", color: "cyan" },
      { beat: 40, col: 8, color: "cyan" },
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
      { beat: 31, col: 9, kind: "rind", color: "cyan" },
      { beat: 37, col: 1, color: "red" },
    ],
  },
  {
    id: "fillerWardenBend",
    name: "WARDEN ILLUSION",
    variant: true,
    entries: [
      { beat: 0, col: 8, color: "red" },
      { beat: 6, col: 2, kind: "beatbox", color: null, beats: 4 },
      { beat: 11, col: 4, color: "red" },
      { beat: 16, col: 0, kind: "meteor", color: null },
      { beat: 23, col: 1, color: "cyan" },
      { beat: 23, col: 9, color: "cyan" },
      { beat: 30, col: 0, kind: "countdown", color: "red" },
      { beat: 35, col: 4, kind: "beatbox", color: null, beats: 3 },
      { beat: 40, col: 1, color: "red" },
      { beat: 40, col: 9, color: "red" },
      { beat: 46, col: 3, kind: "meteor", color: null },
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
      { beat: 0, col: 0, color: "red" },
      { beat: 5, col: 6, kind: "fence", color: null },
      { beat: 10, col: 9, color: "red" },
      { beat: 15, col: 6, kind: "meteor", color: null, cross: 1, row: 5 },
      { beat: 20, col: 10, color: "cyan" },
      { beat: 27, col: 0, kind: "fence", color: null },
      { beat: 33, col: 7, color: "cyan" },
      { beat: 39, col: 10, kind: "recoil", color: "red" },
    ],
  },
  {
    id: "theFencePeak",
    name: "FENCE INFERNO",
    variant: true,
    entries: [
      { beat: 0, col: 9, color: "cyan" },
      { beat: 3, col: 8, kind: "fence", color: null },
      { beat: 6, col: 9, color: "cyan" },
      { beat: 11, col: 3, kind: "veer", color: null },
      { beat: 16, col: 1, color: "cyan" },
      { beat: 16, col: 9, color: "cyan" },
      { beat: 23, col: 0, kind: "fence", color: null },
      { beat: 27, col: 9, kind: "gyre", color: null },
      { beat: 35, col: 0, color: "red" },
      { beat: 35, col: 10, color: "red" },
      { beat: 38, col: 8, kind: "fence", color: null },
      { beat: 44, col: 0, kind: "veer", color: null },
    ],
  },
  {
    id: "fillerStareBreathe",
    name: "SLEEPY STARE",
    entries: [
      { beat: 0, col: 4, color: "red" },
      { beat: 8, col: 0, kind: "throb", color: "red" },
      { beat: 15, col: 2, color: "red" },
      { beat: 22, col: 9, kind: "countdown", color: "cyan" },
      { beat: 30, col: 3, color: "cyan" },
      { beat: 37, col: 4, kind: "meteor", color: null, cross: 1, row: 5 },
    ],
  },
  {
    id: "fillerStareRecall",
    name: "STARE SAGA",
    variant: true,
    entries: [
      { beat: 0, col: 6, color: "red" },
      { beat: 5, col: 1, kind: "dart", color: "cyan" },
      { beat: 10, col: 4, color: "red" },
      { beat: 15, col: 8, kind: "meteor", color: null, cross: 1, row: 9 },
      { beat: 21, col: 1, color: "cyan" },
      { beat: 27, col: 8, kind: "countdown", color: "red" },
      { beat: 32, col: 7, color: "cyan" },
      { beat: 38, col: 4, kind: "dart", color: "cyan" },
    ],
  },
  {
    id: "fillerStareBend",
    name: "STARE RIDDLE",
    variant: true,
    entries: [
      { beat: 0, col: 8, color: "red" },
      { beat: 6, col: 6, kind: "throb", color: "red" },
      { beat: 12, col: 3, color: "red" },
      { beat: 17, col: 4, kind: "meteor", color: null, cross: -1, row: 6 },
      { beat: 22, col: 3, color: "cyan" },
      { beat: 22, col: 7, color: "cyan" },
      { beat: 28, col: 5, kind: "recoil", color: "cyan" },
      { beat: 33, col: 4, kind: "throb", color: "red" },
      { beat: 38, col: 1, color: "red" },
      { beat: 38, col: 9, color: "red" },
      { beat: 44, col: 0, kind: "meteor", color: null, cross: 1, row: 5 },
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
