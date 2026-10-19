import type { Wave } from "../wave-types.js";

/**
 * Waves 203 to 208 of the game, in the order they are played: reviewCountdown's
 * review, the boss THE GOVERNOR, THE DART's review, the boss THE LATCH, THE
 * RIND's review and the boss THE HYDRA.
 *
 * Cut by `bun run waves:order --write` (`waves-recut.ts`), which cuts every act
 * after the tutorial arc again in play order. A save that fills it cuts a page
 * after it (`acts.ts`).
 */
export const WAVES_ACT_14: Wave[] = [
  {
    id: "reviewCountdownRecall",
    name: "ANCIENT GOVERNOR",
    entries: [
      { beat: 0, col: 7, color: "red" },
      { beat: 6, col: 9, kind: "shell", color: "red" },
      { beat: 11, col: 2, color: "cyan" },
      { beat: 11, col: 8, color: "cyan" },
      { beat: 17, col: 9, kind: "countdown", color: "red" },
      { beat: 23, col: 6, kind: "dart", color: "red" },
      { beat: 28, col: 0, color: "red" },
      { beat: 28, col: 10, color: "red" },
      { beat: 35, col: 1, kind: "shell", color: "red" },
      { beat: 40, col: 3, kind: "countdown", color: "red" },
      { beat: 46, col: 4, color: "red" },
      { beat: 46, col: 7, color: "red" },
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
  {
    id: "reviewDartRecall",
    name: "ANCIENT LATCH",
    entries: [
      { beat: 0, col: 3, color: "cyan" },
      { beat: 6, col: 10, kind: "magnet", color: "red" },
      { beat: 11, col: 1, color: "red" },
      { beat: 11, col: 9, color: "red" },
      { beat: 17, col: 0, kind: "rind", color: "cyan" },
      { beat: 25, col: 8, kind: "echo", color: "red" },
      { beat: 30, col: 2, color: "cyan" },
      { beat: 30, col: 8, color: "cyan" },
      { beat: 35, col: 0, kind: "magnet", color: "cyan" },
      { beat: 40, col: 2, kind: "rind", color: "cyan" },
      { beat: 46, col: 1, color: "cyan" },
      { beat: 46, col: 9, color: "cyan" },
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
  {
    id: "reviewRindRecall",
    name: "HYDRA LEGEND",
    entries: [
      { beat: 0, col: 10, color: "red" },
      { beat: 5, col: 4, kind: "magnet", color: "red" },
      { beat: 10, col: 1, color: "cyan" },
      { beat: 10, col: 9, color: "cyan" },
      { beat: 16, col: 1, kind: "gyre", color: null },
      { beat: 22, col: 5, kind: "throb", color: "red" },
      { beat: 27, col: 4, color: "red" },
      { beat: 27, col: 7, color: "red" },
      { beat: 33, col: 1, kind: "magnet", color: "red" },
      { beat: 39, col: 9, kind: "gyre", color: null },
      { beat: 45, col: 0, color: "cyan" },
      { beat: 45, col: 10, color: "cyan" },
    ],
  },
  {
    id: "theHydra",
    name: "THE HYDRA",
    guide: {
      both: "A slime with many heads. Stop each head before it reaches the ship. Four kinds of head, each comes twice.",
      p1: "1. Swipe across your left necks to cut them.\n2. Turn your left coil off the ship.\n3. Tap your left eye while it is open.\n4. Only you see the fire's colour: say it. Slide the cannon where the other says.",
      p2: "1. Swipe across your right necks to cut them.\n2. Turn your right coil off the ship.\n3. Tap your right eye while it is open.\n4. Only you see which mouth opens: say where. Fire the colour the other says.",
    },
    entries: [],
    boss: {
      kind: "hydra",
      steps: [
        { head: "bite", count: 2, beats: 28 },
        { head: "bite", count: 3, ways: [-1, 1, -1], beats: 36 },
        { head: "coil", laps: 2, beats: 32 },
        { head: "coil", laps: 3, beats: 40 },
        { head: "eye", count: 4, beats: 36 },
        { head: "eye", count: 6, beats: 48 },
        { head: "maw", offsets: [-2, 1, 0], colors: ["red", "cyan", "red"], beats: 36 },
        { head: "maw", offsets: [2, -1, 1, -2], colors: ["cyan", "red", "cyan", "red"], beats: 44 },
      ],
    },
    bossType: "normal",
    controls: "standard5",
  },
];
