import type { Wave } from "../wave-types.js";

/**
 * Waves 89 to 98 of the game, in the order they are played: HEAVY ROCKS's block
 * and the boss THE WARDEN.
 *
 * Cut by `bun run waves:order --write` (`waves-recut.ts`), which cuts every act
 * after the tutorial arc again in play order. A save that fills it cuts a page
 * after it (`acts.ts`).
 */
export const WAVES_ACT_8: Wave[] = [
  {
    id: "theWard",
    name: "HEAVY ROCKS",
    guide: {
      scene: "theWard",
    },
    entries: [
      { beat: 0, col: 0, kind: "meteor", color: null },
      { beat: 2, col: 3, kind: "meteorMedium", color: null },
      { beat: 4, col: 8, kind: "meteorFast", color: null },
      { beat: 6, col: 2, kind: "meteorFaster", color: null },
      { beat: 8, col: 10, kind: "meteorFastest", color: null },
    ],
  },
  {
    id: "theWardAgain",
    name: "HEAVY ROCK RISING",
    variant: true,
    entries: [
      { beat: 0, col: 4, kind: "meteorMedium", color: null },
      { beat: 8, col: 3, kind: "meteorMedium", color: null },
      { beat: 16, col: 6, kind: "meteorMedium", color: null },
      { beat: 23, col: 3, kind: "meteorMedium", color: null },
      { beat: 31, col: 7, kind: "meteorMedium", color: null },
    ],
  },
  {
    id: "theWardSpread",
    name: "HEAVY ROCK CONFETTI",
    variant: true,
    entries: [
      { beat: 0, col: 6, kind: "meteorMedium", color: null },
      { beat: 5, col: 5, kind: "meteorMedium", color: null },
      { beat: 12, col: 1, kind: "meteorMedium", color: null },
      { beat: 18, col: 7, kind: "meteorMedium", color: null },
      { beat: 25, col: 6, kind: "meteorMedium", color: null },
      { beat: 31, col: 9, kind: "meteorMedium", color: null },
    ],
  },
  {
    id: "theWardReach",
    name: "LONG HEAVY ROCK ROAD",
    variant: true,
    entries: [
      { beat: 0, col: 1, kind: "meteorMedium", color: null },
      { beat: 5, col: 8, kind: "meteor", color: null },
      { beat: 11, col: 1, kind: "meteorMedium", color: null },
      { beat: 16, col: 10, kind: "meteor", color: null },
      { beat: 22, col: 2, kind: "meteorMedium", color: null },
      { beat: 28, col: 6, kind: "meteor", color: null },
    ],
  },
  {
    id: "theWardPair",
    name: "HEAVY ROCK PARTY",
    variant: true,
    entries: [
      { beat: 0, col: 8, color: "cyan" },
      { beat: 4, col: 10, kind: "meteorMedium", color: null },
      { beat: 10, col: 5, color: "red" },
      { beat: 16, col: 9, kind: "blister", color: null, row: 2, by: 2, gesture: "swipe" },
      { beat: 21, col: 5, color: "cyan" },
      { beat: 30, col: 7, color: "red" },
      { beat: 34, col: 4, kind: "meteorMedium", color: null },
    ],
    pods: [{ beat: 26, col: 10, row: 3, kind: "pod" }],
  },
  {
    id: "theWardBreathe",
    name: "LAZY HEAVY ROCK",
    variant: true,
    entries: [
      { beat: 0, col: 2, color: "red" },
      { beat: 8, col: 4, kind: "meteorMedium", color: null },
      { beat: 16, col: 7, color: "red" },
      { beat: 23, col: 5, kind: "meteorMedium", color: null },
      { beat: 30, col: 4, color: "red" },
      { beat: 37, col: 2, kind: "meteorMedium", color: null },
    ],
  },
  {
    id: "theWardRecall",
    name: "HEAVY ROCK REUNION",
    variant: true,
    entries: [
      { beat: 0, col: 6, color: "cyan" },
      { beat: 6, col: 8, kind: "meteorMedium", color: null },
      { beat: 12, col: 0, color: "red" },
      { beat: 23, col: 8, color: "cyan" },
      { beat: 28, col: 7, kind: "meteorMedium", color: null },
      { beat: 34, col: 1, color: "red" },
    ],
    pods: [{ beat: 18, col: 5, row: 3, kind: "pod" }],
  },
  {
    id: "theWardBend",
    name: "HEAVY ROCK RIDDLE",
    variant: true,
    entries: [
      { beat: 0, col: 6, color: "red" },
      { beat: 5, col: 5, kind: "meteorMedium", color: null },
      { beat: 5, col: 8, kind: "meteorMedium", color: null },
      { beat: 10, col: 7, color: "cyan" },
      { beat: 15, col: 3, color: "red" },
      { beat: 21, col: 5, kind: "blister", color: null, row: 3, by: 2 },
      { beat: 27, col: 7, color: "red" },
      { beat: 33, col: 6, kind: "meteorMedium", color: null },
      { beat: 39, col: 3, color: "red" },
      { beat: 39, col: 7, color: "red" },
      { beat: 44, col: 8, kind: "blister", color: null, row: 2, by: 2, gesture: "swipe" },
    ],
  },
  {
    id: "theWardPeak",
    name: "HEAVY ROCK OVERDRIVE",
    variant: true,
    entries: [
      { beat: 0, col: 1, color: "red" },
      { beat: 4, col: 2, kind: "meteorMedium", color: null },
      { beat: 4, col: 8, kind: "meteorMedium", color: null },
      { beat: 8, col: 4, color: "red" },
      { beat: 12, col: 6, color: "red" },
      { beat: 16, col: 7, kind: "blister", color: null, row: 2, by: 2, gesture: "swipe" },
      { beat: 20, col: 3, color: "cyan" },
      { beat: 24, col: 4, kind: "torch", color: null },
      { beat: 28, col: 3, color: "red" },
      { beat: 28, col: 7, color: "red" },
      { beat: 32, col: 9, kind: "meteorMedium", color: null },
      { beat: 36, col: 7, kind: "blister", color: null, row: 3, by: 2 },
      { beat: 40, col: 3, color: "red" },
      { beat: 40, col: 6, color: "red" },
      { beat: 44, col: 8, kind: "torch", color: null },
      { beat: 48, col: 2, kind: "meteorMedium", color: null },
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
