import { SCOUT_ARENAS } from "../scout-arenas.js";
import type { Wave } from "../wave-types.js";

/**
 * Waves 229 to 242 of the game, in the order they are played: the filler before
 * THE SCOUT, the boss THE SCOUT, THE STRAND's block, the filler before THE
 * BATON and the boss THE BATON.
 *
 * Cut by `bun run waves:order --write` (`waves-recut.ts`), which cuts every act
 * after the tutorial arc again in play order. A save that fills it cuts a page
 * after it (`acts.ts`).
 */
export const WAVES_ACT_17: Wave[] = [
  {
    id: "fillerScoutBreathe",
    name: "VEER HUSH",
    entries: [
      { beat: 0, col: 9, color: "red" },
      { beat: 6, col: 4, kind: "veer", color: null },
      { beat: 13, col: 6, color: "red" },
      { beat: 19, col: 7, kind: "rind", color: "red" },
      { beat: 25, col: 8, color: "red" },
      { beat: 33, col: 4, kind: "veer", color: null },
      { beat: 40, col: 6, color: "cyan" },
    ],
  },
  {
    id: "fillerScoutRecall",
    name: "OLD VEER SONG",
    variant: true,
    entries: [
      { beat: 0, col: 0, color: "cyan" },
      { beat: 5, col: 3, kind: "veer", color: null },
      { beat: 10, col: 8, color: "red" },
      { beat: 21, col: 9, color: "cyan" },
      { beat: 27, col: 0, kind: "veer", color: null },
      { beat: 35, col: 7, color: "red" },
    ],
    pods: [{ beat: 15, col: 10, row: 4, kind: "husk" }],
  },
  {
    id: "fillerScoutBend",
    name: "VEER MIRAGE",
    variant: true,
    entries: [
      { beat: 0, col: 2, color: "red" },
      { beat: 5, col: 5, kind: "veer", color: null },
      { beat: 10, col: 8, color: "red" },
      { beat: 16, col: 7, kind: "rind", color: "red" },
      { beat: 21, col: 4, color: "cyan" },
      { beat: 21, col: 7, color: "cyan" },
      { beat: 26, col: 3, kind: "veer", color: null },
      { beat: 32, col: 2, kind: "rind", color: "cyan" },
      { beat: 38, col: 3, color: "cyan" },
      { beat: 38, col: 7, color: "cyan" },
      { beat: 44, col: 5, kind: "veer", color: null },
    ],
  },
  {
    id: "theScout",
    name: "THE SCOUT",
    guide: {
      scene: "theScout",
    },
    entries: [],
    boss: { kind: "scout", arenas: SCOUT_ARENAS },
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
      { beat: 0, col: 8, kind: "strand", color: "red", beads: 5 },
      { beat: 7, col: 2, kind: "strand", color: "red", beads: 2 },
      { beat: 15, col: 9, kind: "strand", color: "cyan", beads: 3 },
      { beat: 22, col: 3, kind: "strand", color: "red", beads: 2 },
      { beat: 30, col: 4, kind: "strand", color: "red", beads: 5 },
    ],
  },
  {
    id: "theStrandReach",
    name: "STRAND VOYAGE",
    variant: true,
    entries: [
      { beat: 0, col: 9, kind: "strand", color: "red", beads: 5 },
      { beat: 6, col: 4, kind: "veer", color: null },
      { beat: 17, col: 1, kind: "strand", color: "red", beads: 2 },
      { beat: 25, col: 9, kind: "veer", color: null },
    ],
    pods: [{ beat: 12, col: 10, row: 4, kind: "husk" }],
  },
  {
    id: "theStrandPair",
    name: "STRAND WALTZ",
    variant: true,
    entries: [
      { beat: 0, col: 4, color: "red" },
      { beat: 5, col: 0, kind: "strand", color: "red", beads: 5 },
      { beat: 9, col: 9, color: "red" },
      { beat: 17, col: 3, kind: "veer", color: null },
      { beat: 22, col: 4, color: "cyan" },
      { beat: 26, col: 0, kind: "meteorMedium", color: null },
      { beat: 30, col: 3, color: "cyan" },
      { beat: 36, col: 10, kind: "strand", color: "red", beads: 2 },
    ],
  },
  {
    id: "theStrandRecall",
    name: "ANCIENT STRAND",
    variant: true,
    entries: [
      { beat: 0, col: 0, color: "red" },
      { beat: 6, col: 10, kind: "strand", color: "red", beads: 5 },
      { beat: 14, col: 7, color: "cyan" },
      { beat: 19, col: 6, kind: "beatbox", color: null, beats: 2 },
      { beat: 24, col: 10, color: "cyan" },
      { beat: 31, col: 0, kind: "strand", color: "red", beads: 5 },
      { beat: 38, col: 10, color: "red" },
    ],
  },
  {
    id: "theStrandPeak",
    name: "STRAND INFERNO",
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
      { beat: 0, col: 9, color: "cyan" },
      { beat: 8, col: 7, kind: "strand", color: "red", beads: 2 },
      { beat: 14, col: 0, color: "cyan" },
      { beat: 20, col: 2, kind: "veer", color: null },
      { beat: 28, col: 6, color: "red" },
      { beat: 35, col: 8, kind: "blister", color: null, row: 3, by: 2 },
    ],
  },
  {
    id: "fillerBatonRecall",
    name: "STRAND LEGEND",
    variant: true,
    entries: [
      { beat: 0, col: 6, color: "red" },
      { beat: 5, col: 7, kind: "strand", color: "cyan", beads: 3 },
      { beat: 10, col: 6, color: "red" },
      { beat: 16, col: 1, kind: "morsel", color: "red" },
      { beat: 22, col: 6, color: "red" },
      { beat: 27, col: 0, kind: "strand", color: "cyan", beads: 3 },
      { beat: 33, col: 6, color: "cyan" },
      { beat: 39, col: 1, kind: "morsel", color: "cyan" },
    ],
  },
  {
    id: "fillerBatonBend",
    name: "CROOKED STRAND",
    variant: true,
    entries: [
      { beat: 0, col: 4, color: "cyan" },
      { beat: 6, col: 5, kind: "strand", color: "cyan", beads: 3 },
      { beat: 11, col: 3, color: "cyan" },
      { beat: 17, col: 0, kind: "veer", color: null },
      { beat: 23, col: 2, color: "red" },
      { beat: 23, col: 8, color: "red" },
      { beat: 29, col: 7, kind: "strand", color: "cyan", beads: 3 },
      { beat: 35, col: 2, kind: "veer", color: null },
      { beat: 40, col: 3, color: "red" },
      { beat: 40, col: 7, color: "red" },
      { beat: 45, col: 5, kind: "strand", color: "cyan", beads: 3 },
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
