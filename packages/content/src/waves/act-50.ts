import type { Wave } from "../wave-types.js";

/**
 * Waves 582 to 587 of the game, in the order they are played: THE ECHO's review
 * and the boss THE HYDRA.
 *
 * Cut by `bun run waves:order --write` (`waves-recut.ts`), which cuts every act
 * after the tutorial arc again in play order. A save that fills it cuts a page
 * after it (`acts.ts`).
 */
export const WAVES_ACT_50: Wave[] = [
  {
    id: "reviewEchoAgain",
    name: "ECHO MORNING",
    entries: [
      { beat: 0, col: 0, kind: "echo", color: "red" },
      { beat: 8, col: 3, kind: "dart", color: "cyan" },
      { beat: 15, col: 10, kind: "countdown", color: "cyan" },
      { beat: 22, col: 1, kind: "echo", color: "red" },
      { beat: 30, col: 4, kind: "dart", color: "cyan" },
    ],
  },
  {
    id: "reviewEchoReach",
    name: "FAR ECHO",
    variant: true,
    entries: [
      { beat: 0, col: 9, kind: "echo", color: "red" },
      { beat: 7, col: 0, kind: "dart", color: "cyan" },
      { beat: 14, col: 9, kind: "veer", color: null },
      { beat: 19, col: 2, kind: "echo", color: "red" },
      { beat: 27, col: 8, kind: "dart", color: "red" },
    ],
  },
  {
    id: "reviewEchoPair",
    name: "ECHO AND DART",
    variant: true,
    entries: [
      { beat: 0, col: 1, color: "cyan" },
      { beat: 4, col: 8, kind: "echo", color: "cyan" },
      { beat: 12, col: 3, color: "cyan" },
      { beat: 12, col: 7, color: "cyan" },
      { beat: 17, col: 1, kind: "dart", color: "red" },
      { beat: 23, col: 8, kind: "fence", color: null },
      { beat: 27, col: 0, color: "red" },
      { beat: 27, col: 10, color: "red" },
      { beat: 32, col: 4, kind: "echo", color: "cyan" },
      { beat: 38, col: 10, kind: "dart", color: "red" },
    ],
  },
  {
    id: "reviewEchoRecall",
    name: "OLD ECHO SONG",
    variant: true,
    entries: [
      { beat: 0, col: 6, color: "cyan" },
      { beat: 5, col: 0, kind: "echo", color: "red" },
      { beat: 11, col: 3, color: "red" },
      { beat: 11, col: 7, color: "red" },
      { beat: 17, col: 5, kind: "lure", color: "cyan" },
      { beat: 22, col: 8, kind: "echo", color: "red" },
      { beat: 27, col: 0, color: "cyan" },
      { beat: 27, col: 10, color: "cyan" },
      { beat: 33, col: 2, kind: "lure", color: "cyan" },
      { beat: 38, col: 4, kind: "echo", color: "cyan" },
    ],
  },
  {
    id: "reviewEchoPeak",
    name: "ECHO OVERDRIVE",
    variant: true,
    entries: [
      { beat: 0, col: 2, color: "cyan" },
      { beat: 0, col: 8, color: "cyan" },
      { beat: 5, col: 7, kind: "echo", color: "cyan" },
      { beat: 9, col: 3, kind: "dart", color: "cyan" },
      { beat: 13, col: 2, color: "cyan" },
      { beat: 13, col: 8, color: "cyan" },
      { beat: 17, col: 6, kind: "magnet", color: "cyan" },
      { beat: 20, col: 5, kind: "echo", color: "red" },
      { beat: 24, col: 1, color: "red" },
      { beat: 24, col: 9, color: "red" },
      { beat: 28, col: 3, kind: "dart", color: "red" },
      { beat: 32, col: 7, kind: "magnet", color: "cyan" },
      { beat: 35, col: 2, color: "red" },
      { beat: 35, col: 8, color: "red" },
      { beat: 43, col: 6, kind: "echo", color: "red" },
      { beat: 48, col: 0, kind: "dart", color: "cyan" },
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
