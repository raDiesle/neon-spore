import type { Wave } from "../wave-types.js";

/**
 * Waves 475 to 484 of the game, in the order they are played: THE WISP's block,
 * the filler before THE RATCHET and the boss THE RATCHET.
 *
 * Cut by `bun run waves:order --write` (`waves-recut.ts`), which cuts every act
 * after the tutorial arc again in play order. A save that fills it cuts a page
 * after it (`acts.ts`).
 */
export const WAVES_ACT_43: Wave[] = [
  {
    id: "theWisp",
    name: "THE WISP",
    guide: {
      scene: "theWisp",
    },
    entries: [
      { beat: 0, col: 5, kind: "wisp", color: null },
      { beat: 14, col: 2, kind: "wisp", color: null },
      { beat: 28, col: 7, kind: "wisp", color: null },
    ],
  },
  {
    id: "theWispAgain",
    name: "FIRST WISP",
    variant: true,
    entries: [
      { beat: 0, col: 10, kind: "wisp", color: null },
      { beat: 8, col: 0, kind: "veil", color: null },
      { beat: 15, col: 9, kind: "dart", color: "red" },
      { beat: 21, col: 7, kind: "wisp", color: null },
      { beat: 29, col: 2, kind: "veil", color: null },
    ],
  },
  {
    id: "theWispReach",
    name: "WISP WANDERER",
    variant: true,
    entries: [
      { beat: 0, col: 10, kind: "wisp", color: null },
      { beat: 6, col: 0, kind: "veil", color: null },
      { beat: 14, col: 10, kind: "rind", color: "red" },
      { beat: 21, col: 0, kind: "wisp", color: null },
      { beat: 27, col: 8, kind: "veil", color: null },
    ],
  },
  {
    id: "theWispPair",
    name: "WISP TANGO",
    variant: true,
    entries: [
      { beat: 0, col: 10, color: "red" },
      { beat: 7, col: 1, kind: "wisp", color: null },
      { beat: 12, col: 5, color: "cyan" },
      { beat: 18, col: 1, kind: "veil", color: null },
      { beat: 23, col: 3, color: "cyan" },
      { beat: 23, col: 7, color: "cyan" },
      { beat: 27, col: 1, kind: "volley", color: "cyan" },
      { beat: 33, col: 9, kind: "wisp", color: null },
      { beat: 40, col: 0, color: "red" },
      { beat: 40, col: 10, color: "red" },
    ],
  },
  {
    id: "theWispRecall",
    name: "ANCIENT WISP",
    variant: true,
    entries: [
      { beat: 0, col: 10, color: "red" },
      { beat: 6, col: 3, kind: "wisp", color: null },
      { beat: 11, col: 5, color: "cyan" },
      { beat: 17, col: 10, kind: "glutton", color: "red" },
      { beat: 24, col: 0, color: "red" },
      { beat: 24, col: 10, color: "red" },
      { beat: 29, col: 1, kind: "wisp", color: null },
      { beat: 35, col: 0, kind: "glutton", color: "cyan" },
    ],
  },
  {
    id: "theWispPeak",
    name: "WISP THUNDER",
    variant: true,
    entries: [
      { beat: 0, col: 10, color: "red" },
      { beat: 6, col: 3, kind: "wisp", color: null },
      { beat: 10, col: 3, color: "cyan" },
      { beat: 10, col: 7, color: "cyan" },
      { beat: 14, col: 5, kind: "veil", color: null },
      { beat: 19, col: 0, kind: "beatbox", color: null, beats: 4 },
      { beat: 23, col: 3, color: "cyan" },
      { beat: 23, col: 7, color: "cyan" },
      { beat: 27, col: 10, kind: "wisp", color: null },
      { beat: 35, col: 2, kind: "veil", color: null },
      { beat: 38, col: 1, color: "red" },
      { beat: 38, col: 9, color: "red" },
      { beat: 41, col: 3, kind: "beatbox", color: null, beats: 2 },
      { beat: 44, col: 5, kind: "wisp", color: null },
      { beat: 48, col: 2, color: "red" },
      { beat: 48, col: 8, color: "red" },
    ],
  },
  {
    id: "fillerRatchetBreathe",
    name: "WISP DREAM",
    entries: [
      { beat: 0, col: 7, color: "cyan" },
      { beat: 8, col: 0, kind: "wisp", color: null },
      { beat: 15, col: 10, color: "red" },
      { beat: 22, col: 0, kind: "veil", color: null },
      { beat: 30, col: 1, color: "red" },
      { beat: 36, col: 2, kind: "glutton", color: "red" },
    ],
  },
  {
    id: "fillerRatchetRecall",
    name: "WISP RELIC",
    variant: true,
    entries: [
      { beat: 0, col: 8, color: "cyan" },
      { beat: 6, col: 2, kind: "wisp", color: null },
      { beat: 11, col: 2, color: "cyan" },
      { beat: 11, col: 8, color: "cyan" },
      { beat: 16, col: 10, kind: "recoil", color: "red" },
      { beat: 22, col: 6, kind: "wisp", color: null },
      { beat: 27, col: 0, color: "cyan" },
      { beat: 27, col: 10, color: "cyan" },
      { beat: 33, col: 6, kind: "recoil", color: "cyan" },
      { beat: 38, col: 9, kind: "wisp", color: null },
    ],
  },
  {
    id: "fillerRatchetBend",
    name: "WISP PARADOX",
    variant: true,
    entries: [
      { beat: 0, col: 3, color: "red" },
      { beat: 0, col: 7, color: "red" },
      { beat: 5, col: 7, kind: "wisp", color: null },
      { beat: 10, col: 9, kind: "veil", color: null },
      { beat: 15, col: 3, color: "red" },
      { beat: 15, col: 6, color: "red" },
      { beat: 20, col: 8, kind: "wisp", color: null },
      { beat: 26, col: 4, kind: "veil", color: null },
      { beat: 31, col: 5, color: "cyan" },
      { beat: 31, col: 8, color: "cyan" },
      { beat: 37, col: 0, kind: "wisp", color: null },
      { beat: 43, col: 7, kind: "veil", color: null },
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
