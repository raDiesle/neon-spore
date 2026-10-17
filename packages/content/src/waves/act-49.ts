import type { Wave } from "../wave-types.js";

/**
 * Waves 540 to 545 of the game, in the order they are played: the boss THE
 * GOVERNOR and THE VOLLEY's review.
 *
 * Cut by `bun run waves:order --write` (`waves-recut.ts`), which cuts every act
 * after the tutorial arc again in play order. A save that fills it cuts a page
 * after it (`acts.ts`).
 */
export const WAVES_ACT_49: Wave[] = [
  {
    id: "theGovernor",
    name: "THE GOVERNOR",
    guide: {
      both: "Each of you has a mark on the dial. Tap as the needle crosses yours. Later, tap the numbered marks in order. Shoot the needle's tip in the gap.",
      p1: "1. Tap as the needle crosses your mark. Your partner has one too.\n2. Tap the numbered marks in order. Your partner has 1 first.\n3. Shoot the needle's tip as it passes the gap, in its colour.",
      p2: "1. Tap as the needle crosses your mark. Your partner has one too.\n2. Tap the numbered marks in order. You have 1 first.\n3. Shoot the needle's tip as it passes the gap, in its colour.",
    },
    entries: [],
    boss: {
      kind: "governor",
      steps: [
        {
          ask: "tap",
          marks: [
            { seat: 1, markMilli: 250 },
            { seat: 2, markMilli: 750 },
          ],
          ordered: false,
          paceMilli: 7,
          color: "either",
          beats: 7,
        },
        {
          ask: "tap",
          marks: [
            { seat: 1, markMilli: 625 },
            { seat: 2, markMilli: 125 },
          ],
          ordered: false,
          paceMilli: 7,
          color: "either",
          beats: 7,
        },
        {
          ask: "tap",
          marks: [
            { seat: 1, markMilli: 875 },
            { seat: 2, markMilli: 375 },
          ],
          ordered: false,
          paceMilli: 8,
          color: "either",
          beats: 7,
        },
        { ask: "fire", marks: [], ordered: false, paceMilli: 3, color: "red", beats: 10 },
        {
          ask: "retap",
          marks: [
            { seat: 2, markMilli: 250 },
            { seat: 1, markMilli: 500 },
            { seat: 2, markMilli: 750 },
          ],
          ordered: true,
          paceMilli: 8,
          color: "either",
          beats: 8,
        },
        { ask: "fire", marks: [], ordered: false, paceMilli: 3, color: "cyan", beats: 10 },
        {
          ask: "retap",
          marks: [
            { seat: 1, markMilli: 875 },
            { seat: 2, markMilli: 375 },
            { seat: 1, markMilli: 625 },
            { seat: 2, markMilli: 125 },
          ],
          ordered: true,
          paceMilli: 9,
          color: "either",
          beats: 8,
        },
        { ask: "fire", marks: [], ordered: false, paceMilli: 4, color: "either", beats: 10 },
      ],
    },
    bossType: "normal",
  },
  {
    id: "reviewVolleyAgain",
    name: "VOLLEY MORNING",
    entries: [
      { beat: 0, col: 9, kind: "volley", color: "cyan" },
      { beat: 7, col: 0, kind: "crystal", color: "red" },
      { beat: 14, col: 10, kind: "veer", color: null },
      { beat: 21, col: 1, kind: "volley", color: "cyan" },
      { beat: 29, col: 7, kind: "crystal", color: "cyan" },
    ],
  },
  {
    id: "reviewVolleyReach",
    name: "VOLLEY VOYAGE",
    variant: true,
    entries: [
      { beat: 0, col: 1, kind: "volley", color: "red" },
      { beat: 6, col: 8, kind: "crystal", color: "cyan" },
      { beat: 12, col: 3, kind: "morsel", color: "red" },
      { beat: 18, col: 10, kind: "volley", color: "red" },
      { beat: 25, col: 0, kind: "crystal", color: "red" },
      { beat: 30, col: 10, kind: "morsel", color: "cyan" },
    ],
  },
  {
    id: "reviewVolleyPair",
    name: "VOLLEY WALTZ",
    variant: true,
    entries: [
      { beat: 0, col: 6, color: "cyan" },
      { beat: 4, col: 4, kind: "volley", color: "cyan" },
      { beat: 9, col: 0, color: "red" },
      { beat: 9, col: 10, color: "red" },
      { beat: 16, col: 0, kind: "crystal", color: "cyan" },
      { beat: 21, col: 3, kind: "meteor", color: null, cross: 1, row: 9 },
      { beat: 21, col: 6, kind: "meteor", color: null, cross: 1, row: 9 },
      { beat: 27, col: 2, color: "red" },
      { beat: 27, col: 8, color: "red" },
      { beat: 32, col: 5, kind: "volley", color: "cyan" },
      { beat: 38, col: 2, color: "cyan" },
      { beat: 38, col: 8, color: "cyan" },
    ],
  },
  {
    id: "reviewVolleyRecall",
    name: "VOLLEY SAGA",
    variant: true,
    entries: [
      { beat: 0, col: 1, color: "cyan" },
      { beat: 6, col: 9, kind: "volley", color: "cyan" },
      { beat: 11, col: 0, color: "red" },
      { beat: 11, col: 10, color: "red" },
      { beat: 16, col: 9, kind: "volley", color: "cyan" },
      { beat: 23, col: 0, color: "red" },
      { beat: 23, col: 10, color: "red" },
      { beat: 28, col: 6, kind: "volley", color: "red" },
      { beat: 33, col: 7, color: "red" },
      { beat: 38, col: 1, kind: "volley", color: "red" },
    ],
  },
  {
    id: "reviewVolleyPeak",
    name: "VOLLEY INFERNO",
    variant: true,
    entries: [
      { beat: 0, col: 3, color: "red" },
      { beat: 0, col: 6, color: "red" },
      { beat: 3, col: 1, kind: "volley", color: "red" },
      { beat: 11, col: 9, kind: "crystal", color: "red" },
      { beat: 15, col: 0, color: "cyan" },
      { beat: 15, col: 10, color: "cyan" },
      { beat: 19, col: 3, kind: "meteorMedium", color: null },
      { beat: 19, col: 7, kind: "meteorMedium", color: null },
      { beat: 24, col: 1, color: "red" },
      { beat: 24, col: 9, color: "red" },
      { beat: 31, col: 10, kind: "volley", color: "red" },
      { beat: 35, col: 9, kind: "crystal", color: "cyan" },
      { beat: 39, col: 3, color: "cyan" },
      { beat: 39, col: 6, color: "cyan" },
      { beat: 43, col: 0, kind: "meteorMedium", color: null },
      { beat: 43, col: 10, kind: "meteorMedium", color: null },
      { beat: 47, col: 3, color: "red" },
      { beat: 47, col: 7, color: "red" },
    ],
  },
];
