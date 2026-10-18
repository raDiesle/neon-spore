import type { Wave } from "../wave-types.js";

/**
 * Waves 240 to 249 of the game, in the order they are played: THE CHOKE's
 * block, the filler before THE WARDEN and the boss THE WARDEN.
 *
 * Cut by `bun run waves:order --write` (`waves-recut.ts`), which cuts every act
 * after the tutorial arc again in play order. A save that fills it cuts a page
 * after it (`acts.ts`).
 */
export const WAVES_ACT_14: Wave[] = [
  {
    id: "theChoke",
    name: "THE CHOKE",
    guide: {
      scene: "theChoke",
    },
    entries: [
      { beat: 0, col: 7, color: "red" },
      { beat: 8, col: 7, color: "cyan" },
      { beat: 16, col: 4, color: "red" },
      { beat: 24, col: 3, color: "cyan" },
      { beat: 32, col: 9, color: "red" },
      { beat: 40, col: 5, color: "cyan" },
      { beat: 48, col: 1, color: "red" },
      { beat: 60, col: 9, color: "red" },
      { beat: 68, col: 1, color: "cyan" },
      { beat: 76, col: 4, color: "cyan" },
    ],
    faults: [{ kind: "steer" }],
  },
  {
    id: "theChokeAgain",
    name: "CHOKE DAWN",
    variant: true,
    entries: [
      { beat: 0, col: 4, kind: "veer", color: null },
      { beat: 6, col: 2, kind: "veer", color: null },
      { beat: 13, col: 4, kind: "veer", color: null },
      { beat: 21, col: 7, kind: "veer", color: null },
      { beat: 28, col: 4, kind: "veer", color: null },
    ],
    faults: [{ kind: "steer" }],
  },
  {
    id: "theChokeReach",
    name: "CHOKE HORIZON",
    variant: true,
    entries: [
      { beat: 0, col: 10, kind: "veer", color: null },
      { beat: 5, col: 6, kind: "meteorMedium", color: null },
      { beat: 11, col: 2, kind: "veer", color: null },
      { beat: 17, col: 6, kind: "meteorMedium", color: null },
      { beat: 23, col: 2, kind: "veer", color: null },
      { beat: 28, col: 6, kind: "meteorMedium", color: null },
    ],
    faults: [{ kind: "steer" }],
  },
  {
    id: "theChokePair",
    name: "CHOKE ALLIANCE",
    variant: true,
    entries: [
      { beat: 0, col: 1, color: "cyan" },
      { beat: 6, col: 3, kind: "veer", color: null },
      { beat: 11, col: 7, color: "cyan" },
      { beat: 16, col: 10, kind: "meteorMedium", color: null },
      { beat: 22, col: 2, color: "cyan" },
      { beat: 27, col: 8, kind: "gyre", color: null },
      { beat: 31, col: 7, color: "red" },
      { beat: 37, col: 5, kind: "veer", color: null },
    ],
    faults: [{ kind: "steer" }],
  },
  {
    id: "theChokeRecall",
    name: "CHOKE REUNION",
    variant: true,
    entries: [
      { beat: 0, col: 6, color: "red" },
      { beat: 6, col: 10, kind: "veer", color: null },
      { beat: 12, col: 0, color: "red" },
      { beat: 20, col: 9, kind: "veil", color: null },
      { beat: 26, col: 2, color: "red" },
      { beat: 31, col: 6, kind: "veer", color: null },
      { beat: 36, col: 2, color: "red" },
    ],
    faults: [{ kind: "steer" }],
  },
  {
    id: "theChokePeak",
    name: "CHOKE THUNDER",
    variant: true,
    entries: [
      { beat: 0, col: 7, color: "red" },
      { beat: 3, col: 8, kind: "veer", color: null },
      { beat: 6, col: 9, color: "cyan" },
      { beat: 10, col: 2, kind: "meteorMedium", color: null },
      { beat: 18, col: 5, color: "red" },
      { beat: 18, col: 8, color: "red" },
      { beat: 22, col: 4, kind: "veil", color: null },
      { beat: 26, col: 8, kind: "veer", color: null },
      { beat: 30, col: 4, color: "red" },
      { beat: 30, col: 7, color: "red" },
      { beat: 35, col: 10, kind: "meteorMedium", color: null },
      { beat: 41, col: 3, kind: "veil", color: null },
      { beat: 45, col: 0, color: "red" },
      { beat: 45, col: 10, color: "red" },
    ],
    faults: [{ kind: "steer" }],
  },
  {
    id: "fillerWardenBreathe",
    name: "CHOKE HUSH",
    entries: [
      { beat: 0, col: 7, color: "red" },
      { beat: 6, col: 10, kind: "veer", color: null },
      { beat: 12, col: 6, color: "cyan" },
      { beat: 20, col: 5, kind: "meteorMedium", color: null },
      { beat: 26, col: 6, color: "cyan" },
      { beat: 33, col: 1, kind: "veer", color: null },
      { beat: 39, col: 3, color: "red" },
    ],
  },
  {
    id: "fillerWardenRecall",
    name: "CHOKE RELIC",
    variant: true,
    entries: [
      { beat: 0, col: 7, color: "red" },
      { beat: 5, col: 10, kind: "veer", color: null },
      { beat: 10, col: 0, color: "cyan" },
      { beat: 18, col: 8, kind: "morsel", color: "red" },
      { beat: 23, col: 6, color: "red" },
      { beat: 28, col: 10, kind: "veer", color: null },
      { beat: 33, col: 6, color: "cyan" },
      { beat: 38, col: 1, kind: "morsel", color: "red" },
    ],
  },
  {
    id: "fillerWardenBend",
    name: "CHOKE ILLUSION",
    variant: true,
    entries: [
      { beat: 0, col: 1, color: "cyan" },
      { beat: 6, col: 6, kind: "veer", color: null },
      { beat: 11, col: 7, color: "cyan" },
      { beat: 16, col: 1, kind: "meteorMedium", color: null },
      { beat: 22, col: 3, color: "red" },
      { beat: 22, col: 7, color: "red" },
      { beat: 27, col: 6, kind: "veer", color: null },
      { beat: 33, col: 7, kind: "meteorMedium", color: null },
      { beat: 38, col: 5, color: "cyan" },
      { beat: 38, col: 8, color: "cyan" },
      { beat: 44, col: 7, kind: "veer", color: null },
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
];
