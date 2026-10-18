import type { Wave } from "../wave-types.js";

/**
 * Waves 583 to 588 of the game, in the order they are played: reviewCountdown's
 * review and the boss THE HYDRA.
 *
 * Cut by `bun run waves:order --write` (`waves-recut.ts`), which cuts every act
 * after the tutorial arc again in play order. A save that fills it cuts a page
 * after it (`acts.ts`).
 */
export const WAVES_ACT_45: Wave[] = [
  {
    id: "reviewCountdownAgain",
    name: "FIRST CAROM",
    entries: [
      { beat: 0, col: 9, kind: "countdown", color: "red" },
      { beat: 7, col: 4, kind: "dart", color: "cyan" },
      { beat: 13, col: 6, kind: "throb", color: "red" },
      { beat: 21, col: 5, kind: "countdown", color: "red" },
      { beat: 28, col: 0, kind: "dart", color: "red" },
    ],
  },
  {
    id: "reviewCountdownReach",
    name: "OUTER CAROM",
    variant: true,
    entries: [
      { beat: 0, col: 1, kind: "countdown", color: "cyan" },
      { beat: 5, col: 5, kind: "dart", color: "red" },
      { beat: 11, col: 10, kind: "lure", color: "cyan" },
      { beat: 17, col: 4, kind: "countdown", color: "cyan" },
      { beat: 23, col: 0, kind: "dart", color: "cyan" },
      { beat: 30, col: 10, kind: "lure", color: "cyan" },
    ],
  },
  {
    id: "reviewCountdownPair",
    name: "CAROM DREAM",
    variant: true,
    entries: [
      { beat: 0, col: 0, color: "red" },
      { beat: 5, col: 7, kind: "countdown", color: "cyan" },
      { beat: 13, col: 4, color: "red" },
      { beat: 13, col: 7, color: "red" },
      { beat: 18, col: 10, kind: "dart", color: "red" },
      { beat: 25, col: 0, kind: "shell", color: "red" },
      { beat: 30, col: 2, color: "cyan" },
      { beat: 30, col: 8, color: "cyan" },
      { beat: 35, col: 7, kind: "countdown", color: "cyan" },
      { beat: 40, col: 4, kind: "dart", color: "red" },
    ],
  },
  {
    id: "reviewCountdownRecall",
    name: "GOLDEN ANCIENT CAROM",
    variant: true,
    entries: [
      { beat: 0, col: 6, color: "red" },
      { beat: 5, col: 8, kind: "countdown", color: "red" },
      { beat: 11, col: 0, color: "red" },
      { beat: 11, col: 10, color: "red" },
      { beat: 18, col: 0, kind: "echo", color: "cyan" },
      { beat: 23, col: 6, kind: "countdown", color: "red" },
      { beat: 29, col: 2, color: "red" },
      { beat: 29, col: 8, color: "red" },
      { beat: 34, col: 7, kind: "echo", color: "cyan" },
      { beat: 40, col: 0, kind: "countdown", color: "red" },
    ],
  },
  {
    id: "reviewCountdownPeak",
    name: "CAROM STORM",
    variant: true,
    entries: [
      { beat: 0, col: 3, color: "cyan" },
      { beat: 0, col: 7, color: "cyan" },
      { beat: 4, col: 0, kind: "countdown", color: "red" },
      { beat: 9, col: 6, kind: "dart", color: "red" },
      { beat: 14, col: 1, color: "red" },
      { beat: 14, col: 9, color: "red" },
      { beat: 17, col: 3, kind: "throb", color: "red" },
      { beat: 21, col: 2, kind: "countdown", color: "red" },
      { beat: 25, col: 4, color: "red" },
      { beat: 25, col: 7, color: "red" },
      { beat: 29, col: 8, kind: "dart", color: "red" },
      { beat: 32, col: 10, kind: "throb", color: "red" },
      { beat: 35, col: 1, color: "red" },
      { beat: 35, col: 9, color: "red" },
      { beat: 38, col: 4, kind: "countdown", color: "cyan" },
      { beat: 46, col: 7, kind: "dart", color: "cyan" },
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
