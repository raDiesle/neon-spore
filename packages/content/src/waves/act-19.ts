import { SCOUT_HAUL_ARENAS } from "../scout-haul-arenas.js";
import type { Wave } from "../wave-types.js";

/**
 * Waves 253 to 264 of the game, in the order they are played: THE FENCE's
 * block, the filler before THE HAUL and the boss THE HAUL.
 *
 * Cut by `bun run waves:order --write` (`waves-recut.ts`), which cuts every act
 * after the tutorial arc again in play order. A save that fills it cuts a page
 * after it (`acts.ts`).
 */
export const WAVES_ACT_19: Wave[] = [
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
      { beat: 8, col: 2, kind: "fence", color: null },
      { beat: 15, col: 1, kind: "fence", color: null },
      { beat: 21, col: 8, kind: "fence", color: null },
      { beat: 27, col: 1, kind: "fence", color: null },
    ],
  },
  {
    id: "theFenceReach",
    name: "OUTER FENCE",
    variant: true,
    entries: [
      { beat: 0, col: 0, kind: "fence", color: null },
      { beat: 5, col: 5, kind: "strand", color: "red", beads: 2 },
      { beat: 16, col: 9, kind: "fence", color: null },
      { beat: 24, col: 5, kind: "strand", color: "red", beads: 2 },
    ],
    pods: [{ beat: 11, col: 1, row: 3, kind: "pod" }],
  },
  {
    id: "theFencePair",
    name: "FENCE ALLIANCE",
    variant: true,
    entries: [
      { beat: 0, col: 2, color: "cyan" },
      { beat: 5, col: 10, kind: "fence", color: null },
      { beat: 13, col: 4, color: "cyan" },
      { beat: 17, col: 8, kind: "strand", color: "red", beads: 2 },
      { beat: 23, col: 1, color: "cyan" },
      { beat: 28, col: 6, kind: "morsel", color: "cyan" },
      { beat: 34, col: 10, color: "cyan" },
      { beat: 39, col: 9, kind: "fence", color: null },
    ],
  },
  {
    id: "theFenceRecall",
    name: "ANCIENT FENCE",
    variant: true,
    entries: [
      { beat: 0, col: 1, color: "red" },
      { beat: 5, col: 4, kind: "fence", color: null },
      { beat: 10, col: 7, color: "cyan" },
      { beat: 16, col: 2, kind: "meteor", color: null },
      { beat: 22, col: 1, color: "cyan" },
      { beat: 29, col: 10, kind: "fence", color: null },
      { beat: 34, col: 0, color: "red" },
    ],
  },
  {
    id: "theFencePeak",
    name: "FENCE INFERNO",
    variant: true,
    entries: [
      { beat: 0, col: 10, color: "red" },
      { beat: 4, col: 3, kind: "fence", color: null },
      { beat: 12, col: 9, color: "red" },
      { beat: 18, col: 1, kind: "strand", color: "red", beads: 2 },
      { beat: 23, col: 3, color: "cyan" },
      { beat: 23, col: 7, color: "cyan" },
      { beat: 29, col: 0, kind: "weight", color: null },
      { beat: 36, col: 10, kind: "fence", color: null },
      { beat: 42, col: 3, color: "red" },
      { beat: 42, col: 7, color: "red" },
      { beat: 46, col: 7, kind: "strand", color: "red", beads: 2 },
    ],
  },
  {
    id: "fillerHaulBreathe",
    name: "FENCE HUSH",
    entries: [
      { beat: 0, col: 2, color: "red" },
      { beat: 7, col: 9, kind: "fence", color: null },
      { beat: 15, col: 8, color: "red" },
      { beat: 22, col: 10, kind: "strand", color: "red", beads: 2 },
      { beat: 30, col: 3, color: "red" },
      { beat: 37, col: 0, kind: "fence", color: null },
    ],
  },
  {
    id: "fillerHaulRecall",
    name: "FENCE RELIC",
    variant: true,
    entries: [
      { beat: 0, col: 0, color: "red" },
      { beat: 5, col: 9, kind: "fence", color: null },
      { beat: 13, col: 0, color: "red" },
      { beat: 18, col: 4, kind: "morsel", color: "red" },
      { beat: 23, col: 6, color: "cyan" },
      { beat: 28, col: 10, kind: "fence", color: null },
      { beat: 35, col: 1, color: "cyan" },
      { beat: 40, col: 6, kind: "morsel", color: "red" },
    ],
  },
  {
    id: "fillerHaulBend",
    name: "FENCE TRICK",
    variant: true,
    entries: [
      { beat: 0, col: 3, color: "cyan" },
      { beat: 5, col: 10, kind: "fence", color: null },
      { beat: 13, col: 8, color: "red" },
      { beat: 18, col: 2, kind: "strand", color: "cyan", beads: 3 },
      { beat: 23, col: 3, color: "red" },
      { beat: 23, col: 7, color: "red" },
      { beat: 28, col: 5, kind: "fence", color: null },
      { beat: 33, col: 7, kind: "strand", color: "cyan", beads: 3 },
      { beat: 39, col: 4, color: "red" },
      { beat: 39, col: 7, color: "red" },
      { beat: 44, col: 2, kind: "fence", color: null },
    ],
  },
  {
    id: "theHaul",
    name: "THE HAUL",
    guide: {
      scene: "theHaul",
    },
    entries: [],
    boss: { kind: "scout", arenas: SCOUT_HAUL_ARENAS },
    bossType: "special",
    controls: "scout",
  },
];
