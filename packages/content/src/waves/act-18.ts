import { SCOUT_HAUL_ARENAS } from "../scout-haul-arenas.js";
import type { Wave } from "../wave-types.js";

/**
 * Waves 218 to 231 of the game, in the order they are played: the filler before
 * THE HAUL, the boss THE HAUL, THE STRAND's block, the filler before THE BATON
 * and the boss THE BATON.
 *
 * Cut by `bun run waves:order --write` (`waves-recut.ts`), which cuts every act
 * after the tutorial arc again in play order. A save that fills it cuts a page
 * after it (`acts.ts`).
 */
export const WAVES_ACT_18: Wave[] = [
  {
    id: "fillerHaulBreathe",
    name: "VEER HUSH",
    entries: [
      { beat: 0, col: 9, color: "red" },
      { beat: 8, col: 10, kind: "veer", color: null },
      { beat: 16, col: 3, color: "red" },
      { beat: 22, col: 5, kind: "rind", color: "red" },
      { beat: 28, col: 1, color: "cyan" },
      { beat: 35, col: 3, kind: "seeder", color: "cyan" },
    ],
  },
  {
    id: "fillerHaulRecall",
    name: "VEER RELIC",
    variant: true,
    entries: [
      { beat: 0, col: 6, color: "cyan" },
      { beat: 5, col: 8, kind: "veer", color: null },
      { beat: 10, col: 2, color: "cyan" },
      { beat: 15, col: 8, kind: "countdown", color: "red" },
      { beat: 20, col: 3, color: "cyan" },
      { beat: 25, col: 2, kind: "veer", color: null },
      { beat: 31, col: 7, color: "cyan" },
      { beat: 37, col: 4, kind: "countdown", color: "cyan" },
    ],
  },
  {
    id: "fillerHaulBend",
    name: "VEER TRICK",
    variant: true,
    entries: [
      { beat: 0, col: 3, color: "cyan" },
      { beat: 6, col: 1, kind: "veer", color: null },
      { beat: 12, col: 9, color: "red" },
      { beat: 17, col: 2, kind: "rind", color: "red" },
      { beat: 25, col: 1, color: "cyan" },
      { beat: 25, col: 9, color: "cyan" },
      { beat: 31, col: 9, kind: "veer", color: null },
      { beat: 36, col: 4, kind: "rind", color: "red" },
      { beat: 41, col: 3, color: "red" },
      { beat: 41, col: 7, color: "red" },
      { beat: 46, col: 9, kind: "veer", color: null },
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
  {
    id: "theStrand",
    name: "THE STRAND",
    guide: {
      scene: "theStrand",
    },
    entries: [
      { beat: 0, col: 5, kind: "strand", color: "red", beads: 2 },
      { beat: 18, col: 2, kind: "strand", color: "cyan", beads: 3 },
      { beat: 36, col: 2, kind: "strand", color: "red", beads: 5 },
    ],
  },
  {
    id: "theStrandAgain",
    name: "STRAND DAWN",
    variant: true,
    entries: [
      { beat: 0, col: 3, kind: "strand", color: "red", beads: 2 },
      { beat: 7, col: 6, kind: "strand", color: "red", beads: 5 },
      { beat: 14, col: 7, kind: "strand", color: "red", beads: 5 },
      { beat: 22, col: 1, kind: "strand", color: "cyan", beads: 3 },
      { beat: 29, col: 9, kind: "strand", color: "cyan", beads: 3 },
    ],
  },
  {
    id: "theStrandReach",
    name: "OUTER STRAND",
    variant: true,
    entries: [
      { beat: 0, col: 0, kind: "strand", color: "cyan", beads: 3 },
      { beat: 5, col: 5, kind: "veer", color: null },
      { beat: 17, col: 9, kind: "strand", color: "cyan", beads: 3 },
      { beat: 25, col: 1, kind: "veer", color: null },
    ],
    pods: [{ beat: 11, col: 0, row: 3, kind: "pod" }],
  },
  {
    id: "theStrandPair",
    name: "STRAND MEETS VEER",
    variant: true,
    entries: [
      { beat: 0, col: 4, color: "red" },
      { beat: 5, col: 0, kind: "strand", color: "red", beads: 5 },
      { beat: 9, col: 9, color: "red" },
      { beat: 17, col: 3, kind: "veer", color: null },
      { beat: 22, col: 4, color: "cyan" },
      { beat: 26, col: 0, kind: "weight", color: null },
      { beat: 30, col: 3, color: "cyan" },
      { beat: 36, col: 10, kind: "strand", color: "red", beads: 2 },
    ],
  },
  {
    id: "theStrandRecall",
    name: "STRAND LEGEND",
    variant: true,
    entries: [
      { beat: 0, col: 0, color: "red" },
      { beat: 6, col: 10, kind: "strand", color: "red", beads: 5 },
      { beat: 14, col: 7, color: "cyan" },
      { beat: 19, col: 6, kind: "meteor", color: null, cross: 1, row: 5 },
      { beat: 24, col: 10, color: "cyan" },
      { beat: 31, col: 0, kind: "strand", color: "red", beads: 5 },
      { beat: 38, col: 10, color: "red" },
    ],
  },
  {
    id: "theStrandPeak",
    name: "STRAND APOCALYPSE",
    variant: true,
    entries: [
      { beat: 0, col: 8, color: "red" },
      { beat: 5, col: 2, kind: "strand", color: "red", beads: 2 },
      { beat: 9, col: 3, color: "cyan" },
      { beat: 15, col: 10, kind: "veer", color: null },
      { beat: 19, col: 1, color: "red" },
      { beat: 19, col: 9, color: "red" },
      { beat: 27, col: 2, kind: "shell", color: "cyan" },
      { beat: 31, col: 0, kind: "strand", color: "cyan", beads: 3 },
      { beat: 35, col: 2, color: "red" },
      { beat: 35, col: 8, color: "red" },
      { beat: 39, col: 0, kind: "veer", color: null },
      { beat: 46, col: 9, kind: "shell", color: "cyan" },
    ],
  },
  {
    id: "fillerBatonBreathe",
    name: "STRAND DREAM",
    entries: [
      { beat: 0, col: 10, color: "cyan" },
      { beat: 7, col: 3, kind: "strand", color: "cyan", beads: 3 },
      { beat: 13, col: 2, color: "cyan" },
      { beat: 20, col: 3, kind: "veer", color: null },
      { beat: 26, col: 1, color: "red" },
      { beat: 32, col: 0, kind: "meteorMedium", color: null },
      { beat: 38, col: 1, color: "red" },
    ],
  },
  {
    id: "fillerBatonRecall",
    name: "STRAND RELIC",
    variant: true,
    entries: [
      { beat: 0, col: 1, color: "red" },
      { beat: 5, col: 3, kind: "strand", color: "cyan", beads: 3 },
      { beat: 11, col: 9, color: "red" },
      { beat: 17, col: 2, kind: "strand", color: "cyan", beads: 3 },
      { beat: 23, col: 0, color: "red" },
      { beat: 28, col: 5, kind: "strand", color: "red", beads: 5 },
      { beat: 33, col: 9, color: "red" },
      { beat: 38, col: 2, kind: "strand", color: "cyan", beads: 3 },
    ],
  },
  {
    id: "fillerBatonBend",
    name: "CROOKED STRAND",
    variant: true,
    entries: [
      { beat: 0, col: 1, color: "cyan" },
      { beat: 5, col: 4, kind: "strand", color: "cyan", beads: 3 },
      { beat: 10, col: 10, color: "red" },
      { beat: 15, col: 3, kind: "veer", color: null },
      { beat: 23, col: 5, color: "red" },
      { beat: 23, col: 8, color: "red" },
      { beat: 28, col: 7, kind: "strand", color: "red", beads: 5 },
      { beat: 33, col: 2, kind: "veer", color: null },
      { beat: 39, col: 4, color: "red" },
      { beat: 39, col: 7, color: "red" },
      { beat: 44, col: 1, kind: "strand", color: "cyan", beads: 3 },
    ],
  },
  {
    id: "theBaton",
    name: "THE BATON",
    guide: {
      scene: "theBaton",
    },
    entries: [],
    boss: { kind: "baton" },
    bossType: "normal",
  },
];
