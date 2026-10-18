import type { Wave } from "../wave-types.js";

/**
 * Waves 576 to 582 of the game, in the order they are played: the boss THE
 * GOVERNOR, THE GHOST's review and the boss THE LATCH.
 *
 * Cut by `bun run waves:order --write` (`waves-recut.ts`), which cuts every act
 * after the tutorial arc again in play order. A save that fills it cuts a page
 * after it (`acts.ts`).
 */
export const WAVES_ACT_44: Wave[] = [
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
    id: "reviewGhostAgain",
    name: "GHOST DAWN",
    entries: [
      { beat: 0, col: 8, kind: "ghost", color: "red" },
      { beat: 8, col: 3, kind: "countdown", color: "red" },
      { beat: 15, col: 10, color: "cyan" },
      { beat: 22, col: 7, kind: "ghost", color: "cyan", path: "across" },
      { beat: 30, col: 3, kind: "countdown", color: "cyan" },
    ],
  },
  {
    id: "reviewGhostReach",
    name: "GHOST AT WORLD END",
    variant: true,
    entries: [
      { beat: 0, col: 10, kind: "ghost", color: "cyan" },
      { beat: 5, col: 2, kind: "countdown", color: "cyan" },
      { beat: 13, col: 7, kind: "shell", color: "red" },
      { beat: 18, col: 1, kind: "ghost", color: "red" },
      { beat: 24, col: 8, kind: "countdown", color: "cyan" },
      { beat: 30, col: 4, kind: "shell", color: "red" },
    ],
  },
  {
    id: "reviewGhostPair",
    name: "GHOST AND COUNT",
    variant: true,
    entries: [
      { beat: 0, col: 6, color: "cyan" },
      { beat: 4, col: 8, kind: "ghost", color: "cyan" },
      { beat: 9, col: 1, color: "red" },
      { beat: 9, col: 9, color: "red" },
      { beat: 17, col: 0, kind: "countdown", color: "cyan" },
      { beat: 23, col: 6, kind: "lure", color: "cyan" },
      { beat: 28, col: 1, color: "red" },
      { beat: 28, col: 9, color: "red" },
      { beat: 33, col: 3, kind: "ghost", color: "cyan" },
      { beat: 37, col: 5, kind: "countdown", color: "cyan" },
    ],
  },
  {
    id: "reviewGhostRecall",
    name: "ANCIENT GHOST",
    variant: true,
    entries: [
      { beat: 0, col: 2, color: "cyan" },
      { beat: 6, col: 10, kind: "ghost", color: "cyan" },
      { beat: 11, col: 1, color: "cyan" },
      { beat: 11, col: 9, color: "cyan" },
      { beat: 16, col: 8, kind: "recoil", color: "cyan" },
      { beat: 22, col: 10, kind: "ghost", color: "cyan" },
      { beat: 27, col: 4, color: "cyan" },
      { beat: 27, col: 7, color: "cyan" },
      { beat: 32, col: 1, kind: "recoil", color: "red" },
      { beat: 37, col: 9, kind: "ghost", color: "cyan", path: "across" },
    ],
  },
  {
    id: "reviewGhostPeak",
    name: "GHOST OVERDRIVE",
    variant: true,
    entries: [
      { beat: 0, col: 1, color: "cyan" },
      { beat: 0, col: 9, color: "cyan" },
      { beat: 6, col: 1, kind: "ghost", color: "red" },
      { beat: 10, col: 5, kind: "countdown", color: "cyan" },
      { beat: 13, col: 3, color: "cyan" },
      { beat: 13, col: 7, color: "cyan" },
      { beat: 17, col: 7, kind: "strand", color: "red", beads: 5 },
      { beat: 21, col: 10, kind: "ghost", color: "cyan", path: "across" },
      { beat: 25, col: 2, color: "cyan" },
      { beat: 25, col: 8, color: "cyan" },
      { beat: 30, col: 2, kind: "countdown", color: "cyan" },
      { beat: 35, col: 7, kind: "strand", color: "red", beads: 2 },
      { beat: 39, col: 1, color: "cyan" },
      { beat: 39, col: 9, color: "cyan" },
      { beat: 43, col: 5, kind: "ghost", color: "cyan", path: "across" },
      { beat: 47, col: 9, kind: "countdown", color: "cyan" },
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
