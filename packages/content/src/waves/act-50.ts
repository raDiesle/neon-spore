import type { Wave } from "../wave-types.js";

/**
 * Waves 553 to 558 of the game, in the order they are played: THE RECOIL's
 * review and the boss THE GOVERNOR.
 *
 * Cut by `bun run waves:order --write` (`waves-recut.ts`), which cuts every act
 * after the tutorial arc again in play order. A save that fills it cuts a page
 * after it (`acts.ts`).
 */
export const WAVES_ACT_50: Wave[] = [
  {
    id: "reviewRecoilAgain",
    name: "FIRST RECOIL",
    entries: [
      { beat: 0, col: 6, kind: "recoil", color: "cyan" },
      { beat: 8, col: 2, kind: "lid", color: "red" },
      { beat: 15, col: 10, kind: "veer", color: null },
      { beat: 22, col: 0, kind: "recoil", color: "red" },
      { beat: 30, col: 8, kind: "lid", color: "red" },
    ],
  },
  {
    id: "reviewRecoilReach",
    name: "RECOIL WANDERER",
    variant: true,
    entries: [
      { beat: 0, col: 10, kind: "recoil", color: "red" },
      { beat: 7, col: 0, kind: "lid", color: "red" },
      { beat: 12, col: 10, kind: "magnet", color: "red" },
      { beat: 20, col: 4, kind: "recoil", color: "cyan" },
      { beat: 26, col: 0, kind: "lid", color: "red" },
    ],
  },
  {
    id: "reviewRecoilPair",
    name: "RECOIL TANGO",
    variant: true,
    entries: [
      { beat: 0, col: 2, color: "cyan" },
      { beat: 5, col: 7, kind: "recoil", color: "red" },
      { beat: 11, col: 0, color: "red" },
      { beat: 11, col: 10, color: "red" },
      { beat: 17, col: 2, kind: "lid", color: "red" },
      { beat: 22, col: 1, kind: "morsel", color: "red" },
      { beat: 28, col: 3, color: "cyan" },
      { beat: 28, col: 7, color: "cyan" },
      { beat: 34, col: 0, kind: "recoil", color: "cyan" },
      { beat: 39, col: 4, kind: "lid", color: "cyan" },
    ],
  },
  {
    id: "reviewRecoilRecall",
    name: "ANCIENT RECOIL",
    variant: true,
    entries: [
      { beat: 0, col: 0, color: "cyan" },
      { beat: 5, col: 5, kind: "recoil", color: "cyan" },
      { beat: 11, col: 4, color: "cyan" },
      { beat: 11, col: 7, color: "cyan" },
      { beat: 17, col: 1, kind: "clasp", color: "cyan" },
      { beat: 23, col: 9, kind: "recoil", color: "red" },
      { beat: 28, col: 0, color: "red" },
      { beat: 28, col: 10, color: "red" },
      { beat: 34, col: 7, kind: "clasp", color: "cyan" },
      { beat: 40, col: 9, kind: "recoil", color: "cyan" },
    ],
  },
  {
    id: "reviewRecoilPeak",
    name: "RECOIL THUNDER",
    variant: true,
    entries: [
      { beat: 0, col: 3, color: "cyan" },
      { beat: 0, col: 7, color: "cyan" },
      { beat: 4, col: 9, kind: "recoil", color: "red" },
      { beat: 10, col: 2, kind: "lid", color: "red" },
      { beat: 14, col: 3, color: "cyan" },
      { beat: 14, col: 7, color: "cyan" },
      { beat: 17, col: 3, kind: "meteor", color: null },
      { beat: 17, col: 7, kind: "meteor", color: null },
      { beat: 25, col: 4, color: "cyan" },
      { beat: 25, col: 7, color: "cyan" },
      { beat: 30, col: 10, kind: "recoil", color: "red" },
      { beat: 37, col: 1, kind: "lid", color: "cyan" },
      { beat: 41, col: 5, color: "cyan" },
      { beat: 41, col: 8, color: "cyan" },
      { beat: 45, col: 1, kind: "meteor", color: null },
      { beat: 45, col: 9, kind: "meteor", color: null },
    ],
  },
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
];
