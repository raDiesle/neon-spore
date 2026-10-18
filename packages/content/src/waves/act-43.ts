import type { Wave } from "../wave-types.js";

/**
 * Waves 506 to 515 of the game, in the order they are played: THE CAROM's
 * block, the filler before THE RATCHET and the boss THE RATCHET.
 *
 * Cut by `bun run waves:order --write` (`waves-recut.ts`), which cuts every act
 * after the tutorial arc again in play order. A save that fills it cuts a page
 * after it (`acts.ts`).
 */
export const WAVES_ACT_43: Wave[] = [
  {
    id: "theCarom",
    name: "THE CAROM",
    guide: {
      scene: "theCarom",
    },
    entries: [
      { beat: 0, col: 0, kind: "carom", color: "red" },
      { beat: 12, col: 10, kind: "carom", color: "cyan" },
      { beat: 24, col: 2, kind: "carom", color: "cyan" },
      { beat: 28, col: 8, kind: "carom", color: "red" },
    ],
  },
  {
    id: "theCaromAgain",
    name: "CAROM RISING",
    variant: true,
    entries: [
      { beat: 0, col: 0, kind: "carom", color: "cyan" },
      { beat: 8, col: 8, kind: "ghost", color: "cyan", path: "across" },
      { beat: 15, col: 1, kind: "recoil", color: "cyan" },
      { beat: 22, col: 10, kind: "carom", color: "red" },
      { beat: 30, col: 6, kind: "ghost", color: "red" },
    ],
  },
  {
    id: "theCaromReach",
    name: "CAROM VOYAGE",
    variant: true,
    entries: [
      { beat: 0, col: 1, kind: "carom", color: "cyan" },
      { beat: 7, col: 10, kind: "ghost", color: "cyan", path: "across" },
      { beat: 12, col: 1, kind: "choir", color: "red" },
      { beat: 20, col: 6, kind: "carom", color: "cyan" },
      { beat: 25, col: 1, kind: "ghost", color: "red" },
      { beat: 30, col: 7, kind: "choir", color: "cyan" },
    ],
  },
  {
    id: "theCaromPair",
    name: "CAROM ALLIANCE",
    variant: true,
    entries: [
      { beat: 0, col: 7, color: "red" },
      { beat: 6, col: 0, kind: "carom", color: "cyan" },
      { beat: 10, col: 4, color: "red" },
      { beat: 15, col: 9, kind: "ghost", color: "cyan", path: "across" },
      { beat: 21, col: 0, color: "cyan" },
      { beat: 21, col: 10, color: "cyan" },
      { beat: 29, col: 8, kind: "crystal", color: "cyan" },
      { beat: 34, col: 2, kind: "carom", color: "cyan" },
      { beat: 39, col: 0, color: "cyan" },
      { beat: 39, col: 10, color: "cyan" },
    ],
  },
  {
    id: "theCaromRecall",
    name: "OLD CAROM SONG",
    variant: true,
    entries: [
      { beat: 0, col: 1, color: "red" },
      { beat: 6, col: 6, kind: "carom", color: "cyan" },
      { beat: 12, col: 0, color: "red" },
      { beat: 18, col: 8, kind: "dart", color: "cyan" },
      { beat: 23, col: 0, color: "cyan" },
      { beat: 23, col: 10, color: "cyan" },
      { beat: 28, col: 8, kind: "carom", color: "red" },
      { beat: 33, col: 5, kind: "dart", color: "cyan" },
      { beat: 38, col: 4, color: "red" },
      { beat: 38, col: 7, color: "red" },
    ],
  },
  {
    id: "theCaromPeak",
    name: "CAROM INFERNO",
    variant: true,
    entries: [
      { beat: 0, col: 10, color: "red" },
      { beat: 7, col: 0, kind: "carom", color: "red" },
      { beat: 10, col: 0, color: "red" },
      { beat: 10, col: 10, color: "red" },
      { beat: 18, col: 2, kind: "ghost", color: "red" },
      { beat: 22, col: 6, kind: "torch", color: null },
      { beat: 25, col: 3, color: "cyan" },
      { beat: 25, col: 7, color: "cyan" },
      { beat: 29, col: 6, kind: "carom", color: "cyan" },
      { beat: 33, col: 3, kind: "ghost", color: "red" },
      { beat: 37, col: 3, color: "cyan" },
      { beat: 37, col: 6, color: "cyan" },
      { beat: 42, col: 1, kind: "torch", color: null },
      { beat: 46, col: 0, kind: "carom", color: "cyan" },
    ],
  },
  {
    id: "fillerRatchetBreathe",
    name: "CAROM DREAM",
    entries: [
      { beat: 0, col: 7, color: "cyan" },
      { beat: 8, col: 0, kind: "carom", color: "red" },
      { beat: 15, col: 10, color: "red" },
      { beat: 22, col: 0, kind: "ghost", color: "cyan", path: "across" },
      { beat: 30, col: 1, color: "red" },
      { beat: 36, col: 2, kind: "meteor", color: null, cross: -1, row: 7 },
    ],
  },
  {
    id: "fillerRatchetRecall",
    name: "CAROM RELIC",
    variant: true,
    entries: [
      { beat: 0, col: 8, color: "cyan" },
      { beat: 6, col: 2, kind: "carom", color: "red" },
      { beat: 11, col: 2, color: "cyan" },
      { beat: 11, col: 8, color: "cyan" },
      { beat: 16, col: 10, kind: "volley", color: "cyan" },
      { beat: 22, col: 6, kind: "carom", color: "red" },
      { beat: 27, col: 0, color: "cyan" },
      { beat: 27, col: 10, color: "cyan" },
      { beat: 33, col: 6, kind: "volley", color: "red" },
      { beat: 38, col: 9, kind: "carom", color: "cyan" },
    ],
  },
  {
    id: "fillerRatchetBend",
    name: "CAROM PARADOX",
    variant: true,
    entries: [
      { beat: 0, col: 3, color: "red" },
      { beat: 0, col: 7, color: "red" },
      { beat: 5, col: 7, kind: "carom", color: "red" },
      { beat: 10, col: 9, kind: "ghost", color: "cyan", path: "across" },
      { beat: 15, col: 3, color: "red" },
      { beat: 15, col: 6, color: "red" },
      { beat: 20, col: 8, kind: "carom", color: "cyan" },
      { beat: 26, col: 4, kind: "ghost", color: "red" },
      { beat: 31, col: 5, color: "cyan" },
      { beat: 31, col: 8, color: "cyan" },
      { beat: 37, col: 0, kind: "carom", color: "red" },
      { beat: 43, col: 7, kind: "ghost", color: "cyan" },
      { beat: 48, col: 0, color: "cyan" },
      { beat: 48, col: 10, color: "cyan" },
    ],
  },
  {
    id: "theRatchet",
    name: "THE RATCHET",
    guide: {
      scene: "theRatchet",
    },
    entries: [],
    boss: { kind: "ratchet" },
    bossType: "normal",
  },
];
