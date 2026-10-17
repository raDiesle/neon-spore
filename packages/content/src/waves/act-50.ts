import type { Wave } from "../wave-types.js";

/**
 * Waves 537 to 542 of the game, in the order they are played: the boss THE
 * GOVERNOR and THE VOLLEY's review.
 *
 * Cut by `bun run waves:order --write` (`waves-recut.ts`), which cuts every act
 * after the tutorial arc again in play order. A save that fills it cuts a page
 * after it (`acts.ts`).
 */
export const WAVES_ACT_50: Wave[] = [
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
      { beat: 0, col: 10, kind: "volley", color: "red" },
      { beat: 8, col: 0, kind: "crystal", color: "cyan" },
      { beat: 15, col: 7, kind: "moult", color: null },
      { beat: 21, col: 9, kind: "volley", color: "cyan" },
      { beat: 27, col: 0, kind: "crystal", color: "red" },
    ],
  },
  {
    id: "reviewVolleyReach",
    name: "VOLLEY VOYAGE",
    variant: true,
    entries: [
      { beat: 0, col: 9, kind: "volley", color: "red" },
      { beat: 6, col: 0, kind: "crystal", color: "cyan" },
      { beat: 11, col: 9, kind: "shell", color: "red" },
      { beat: 16, col: 3, kind: "volley", color: "cyan" },
      { beat: 21, col: 7, kind: "crystal", color: "red" },
      { beat: 26, col: 3, kind: "shell", color: "cyan" },
    ],
  },
  {
    id: "reviewVolleyPair",
    name: "VOLLEY WALTZ",
    variant: true,
    entries: [
      { beat: 0, col: 8, color: "cyan" },
      { beat: 4, col: 9, kind: "volley", color: "cyan" },
      { beat: 8, col: 0, color: "red" },
      { beat: 8, col: 10, color: "red" },
      { beat: 14, col: 5, kind: "crystal", color: "red" },
      { beat: 18, col: 10, kind: "coil", color: null },
      { beat: 24, col: 1, color: "red" },
      { beat: 24, col: 9, color: "red" },
      { beat: 28, col: 3, kind: "volley", color: "cyan" },
      { beat: 32, col: 1, kind: "crystal", color: "red" },
      { beat: 36, col: 0, color: "cyan" },
      { beat: 36, col: 10, color: "cyan" },
    ],
  },
  {
    id: "reviewVolleyRecall",
    name: "VOLLEY SAGA",
    variant: true,
    entries: [
      { beat: 0, col: 10, color: "red" },
      { beat: 6, col: 3, kind: "volley", color: "red" },
      { beat: 11, col: 0, color: "cyan" },
      { beat: 11, col: 10, color: "cyan" },
      { beat: 16, col: 1, kind: "gyre", color: null },
      { beat: 22, col: 10, kind: "volley", color: "cyan" },
      { beat: 28, col: 0, color: "red" },
      { beat: 28, col: 10, color: "red" },
      { beat: 33, col: 8, kind: "gyre", color: null },
      { beat: 38, col: 3, kind: "volley", color: "cyan" },
    ],
  },
  {
    id: "reviewVolleyPeak",
    name: "VOLLEY INFERNO",
    variant: true,
    entries: [
      { beat: 0, col: 0, color: "cyan" },
      { beat: 0, col: 10, color: "cyan" },
      { beat: 4, col: 9, kind: "volley", color: "red" },
      { beat: 8, col: 5, kind: "crystal", color: "cyan" },
      { beat: 11, col: 0, color: "cyan" },
      { beat: 11, col: 10, color: "cyan" },
      { beat: 14, col: 5, kind: "blister", color: null, row: 2, by: 2, gesture: "swipe" },
      { beat: 17, col: 4, kind: "volley", color: "cyan" },
      { beat: 20, col: 3, color: "cyan" },
      { beat: 20, col: 6, color: "cyan" },
      { beat: 23, col: 4, kind: "crystal", color: "cyan" },
      { beat: 27, col: 8, kind: "blister", color: null, row: 3, by: 2 },
      { beat: 31, col: 3, color: "cyan" },
      { beat: 31, col: 7, color: "cyan" },
      { beat: 34, col: 2, kind: "volley", color: "red" },
      { beat: 38, col: 3, kind: "crystal", color: "red" },
      { beat: 41, col: 4, color: "red" },
      { beat: 41, col: 7, color: "red" },
      { beat: 45, col: 9, kind: "blister", color: null, row: 2, by: 2, gesture: "swipe" },
      { beat: 48, col: 5, kind: "volley", color: "red" },
    ],
  },
];
