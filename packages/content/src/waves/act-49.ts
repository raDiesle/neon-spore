import type { Wave } from "../wave-types.js";

/**
 * Waves 575 to 581 of the game, in the order they are played: the boss THE
 * GOVERNOR, THE GYRE's review and the boss THE LATCH.
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
    id: "reviewGyreAgain",
    name: "GYRE DAWN",
    entries: [
      { beat: 0, col: 0, kind: "gyre", color: null },
      { beat: 8, col: 5, kind: "echo", color: "red" },
      { beat: 14, col: 4, kind: "meteor", color: null, cross: -1, row: 6 },
      { beat: 20, col: 10, kind: "gyre", color: null },
      { beat: 26, col: 3, kind: "echo", color: "cyan" },
    ],
  },
  {
    id: "reviewGyreReach",
    name: "GYRE AT WORLD END",
    variant: true,
    entries: [
      { beat: 0, col: 10, kind: "gyre", color: null },
      { beat: 7, col: 0, kind: "echo", color: "cyan" },
      { beat: 13, col: 6, kind: "veer", color: null },
      { beat: 19, col: 10, kind: "gyre", color: null },
      { beat: 24, col: 5, kind: "echo", color: "red" },
      { beat: 30, col: 1, kind: "veer", color: null },
    ],
  },
  {
    id: "reviewGyrePair",
    name: "GYRE TANGO",
    variant: true,
    entries: [
      { beat: 0, col: 7, color: "red" },
      { beat: 5, col: 1, kind: "gyre", color: null },
      { beat: 12, col: 0, color: "red" },
      { beat: 12, col: 10, color: "red" },
      { beat: 18, col: 3, kind: "echo", color: "cyan" },
      { beat: 23, col: 2, color: "cyan" },
      { beat: 23, col: 8, color: "cyan" },
      { beat: 27, col: 4, kind: "gyre", color: null },
      { beat: 33, col: 10, kind: "echo", color: "cyan" },
      { beat: 38, col: 1, color: "cyan" },
      { beat: 38, col: 9, color: "cyan" },
    ],
  },
  {
    id: "reviewGyreRecall",
    name: "GYRE SAGA",
    variant: true,
    entries: [
      { beat: 0, col: 6, color: "red" },
      { beat: 6, col: 8, kind: "gyre", color: null },
      { beat: 12, col: 0, color: "cyan" },
      { beat: 12, col: 10, color: "cyan" },
      { beat: 17, col: 1, kind: "throb", color: "red" },
      { beat: 22, col: 5, kind: "gyre", color: null },
      { beat: 28, col: 4, color: "cyan" },
      { beat: 28, col: 7, color: "cyan" },
      { beat: 33, col: 2, kind: "throb", color: "red" },
      { beat: 38, col: 8, kind: "gyre", color: null },
    ],
  },
  {
    id: "reviewGyrePeak",
    name: "GYRE ECLIPSE",
    variant: true,
    entries: [
      { beat: 0, col: 0, color: "cyan" },
      { beat: 0, col: 10, color: "cyan" },
      { beat: 4, col: 9, kind: "gyre", color: null },
      { beat: 12, col: 6, kind: "echo", color: "red" },
      { beat: 16, col: 1, color: "red" },
      { beat: 16, col: 9, color: "red" },
      { beat: 22, col: 1, kind: "meteorMedium", color: null },
      { beat: 22, col: 9, kind: "meteorMedium", color: null },
      { beat: 27, col: 3, color: "red" },
      { beat: 27, col: 7, color: "red" },
      { beat: 31, col: 4, kind: "gyre", color: null },
      { beat: 35, col: 5, kind: "echo", color: "red" },
      { beat: 39, col: 3, color: "red" },
      { beat: 39, col: 7, color: "red" },
      { beat: 43, col: 4, kind: "meteorMedium", color: null },
      { beat: 43, col: 7, kind: "meteorMedium", color: null },
      { beat: 48, col: 0, color: "cyan" },
      { beat: 48, col: 10, color: "cyan" },
    ],
  },
  {
    id: "theLatch",
    name: "THE LATCH",
    guide: {
      scene: "theLatch",
    },
    entries: [],
    boss: {
      kind: "latch",
      steps: [
        { ask: "haul", knots: 2, beats: 28 },
        { ask: "yank", knots: 2, beats: 32 },
        { ask: "cross", knots: 2, beats: 32 },
      ],
    },
    bossType: "normal",
    controls: "scene",
  },
];
