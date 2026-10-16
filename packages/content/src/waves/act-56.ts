import type { Wave } from "../wave-types.js";

/**
 * Waves 556 to 564 of the game, in the order they are played: THE GYRE's review
 * and the boss THE HYDRA.
 *
 * Cut by `bun run waves:order --write` (`waves-recut.ts`), which cuts every act
 * after the tutorial arc again in play order. A save that fills it cuts a page
 * after it (`acts.ts`).
 */
export const WAVES_ACT_56: Wave[] = [
  {
    id: "reviewGyreAgain",
    name: "GYRES RETURN",
    entries: [
      { beat: 0, col: 10, kind: "gyre", color: null },
      { beat: 8, col: 2, kind: "echo", color: "cyan" },
      { beat: 15, col: 8, kind: "blister", color: null, row: 2, by: 2, gesture: "swipe" },
      { beat: 23, col: 0, kind: "gyre", color: null },
      { beat: 31, col: 8, kind: "echo", color: "red" },
    ],
  },
  {
    id: "reviewGyreSpread",
    name: "GYRES WIDER",
    variant: true,
    entries: [
      { beat: 0, col: 8, kind: "gyre", color: null },
      { beat: 7, col: 0, kind: "echo", color: "red" },
      { beat: 12, col: 9, kind: "lure", color: "cyan" },
      { beat: 19, col: 3, kind: "gyre", color: null },
      { beat: 24, col: 7, kind: "echo", color: "red" },
      { beat: 30, col: 6, kind: "lure", color: "red" },
    ],
  },
  {
    id: "reviewGyreReach",
    name: "GYRES OUT WIDE",
    variant: true,
    entries: [
      { beat: 0, col: 10, kind: "gyre", color: null },
      { beat: 5, col: 0, kind: "echo", color: "cyan" },
      { beat: 11, col: 10, kind: "veer", color: null },
      { beat: 17, col: 1, kind: "gyre", color: null },
      { beat: 22, col: 5, kind: "echo", color: "red" },
      { beat: 28, col: 1, kind: "veer", color: null },
    ],
  },
  {
    id: "reviewGyrePair",
    name: "GYRES IN PAIRS",
    variant: true,
    entries: [
      { beat: 0, col: 2, color: "cyan" },
      { beat: 6, col: 9, kind: "gyre", color: null },
      { beat: 12, col: 0, color: "cyan" },
      { beat: 12, col: 10, color: "cyan" },
      { beat: 18, col: 3, kind: "echo", color: "red" },
      { beat: 22, col: 8, kind: "throb", color: "red" },
      { beat: 27, col: 3, color: "red" },
      { beat: 27, col: 7, color: "red" },
      { beat: 31, col: 8, kind: "gyre", color: null },
      { beat: 37, col: 3, kind: "echo", color: "cyan" },
    ],
  },
  {
    id: "reviewGyreBreathe",
    name: "GYRES AT REST",
    variant: true,
    entries: [
      { beat: 0, col: 8, color: "cyan" },
      { beat: 7, col: 1, kind: "gyre", color: null },
      { beat: 15, col: 10, color: "red" },
      { beat: 21, col: 0, kind: "echo", color: "cyan" },
      { beat: 28, col: 2, color: "cyan" },
      { beat: 36, col: 1, kind: "shell", color: "red" },
    ],
  },
  {
    id: "reviewGyreRecall",
    name: "GYRES RECALLED",
    variant: true,
    entries: [
      { beat: 0, col: 3, color: "cyan" },
      { beat: 5, col: 10, kind: "gyre", color: null },
      { beat: 11, col: 3, color: "red" },
      { beat: 11, col: 7, color: "red" },
      { beat: 21, col: 6, kind: "gyre", color: null },
      { beat: 27, col: 3, color: "cyan" },
      { beat: 27, col: 7, color: "cyan" },
      { beat: 38, col: 1, kind: "gyre", color: null },
    ],
    pods: [
      { beat: 16, col: 5, row: 3, kind: "pod" },
      { beat: 33, col: 8, row: 3, kind: "pod" },
    ],
  },
  {
    id: "reviewGyreBend",
    name: "GYRES DOUBLED",
    variant: true,
    entries: [
      { beat: 0, col: 3, color: "cyan" },
      { beat: 0, col: 6, color: "cyan" },
      { beat: 5, col: 1, kind: "gyre", color: null },
      { beat: 10, col: 6, kind: "echo", color: "cyan" },
      { beat: 16, col: 0, color: "cyan" },
      { beat: 16, col: 10, color: "cyan" },
      { beat: 21, col: 5, kind: "gyre", color: null },
      { beat: 27, col: 1, kind: "echo", color: "red" },
      { beat: 32, col: 0, color: "cyan" },
      { beat: 32, col: 10, color: "cyan" },
      { beat: 37, col: 4, kind: "gyre", color: null },
      { beat: 43, col: 9, kind: "echo", color: "red" },
      { beat: 48, col: 0, color: "cyan" },
      { beat: 48, col: 10, color: "cyan" },
    ],
  },
  {
    id: "reviewGyrePeak",
    name: "GYRES SUMMIT",
    variant: true,
    entries: [
      { beat: 0, col: 4, color: "red" },
      { beat: 0, col: 7, color: "red" },
      { beat: 4, col: 9, kind: "gyre", color: null },
      { beat: 8, col: 4, kind: "echo", color: "red" },
      { beat: 12, col: 2, color: "red" },
      { beat: 12, col: 8, color: "red" },
      { beat: 16, col: 9, kind: "shell", color: "red" },
      { beat: 20, col: 3, kind: "gyre", color: null },
      { beat: 24, col: 1, color: "cyan" },
      { beat: 24, col: 9, color: "cyan" },
      { beat: 28, col: 7, kind: "echo", color: "red" },
      { beat: 31, col: 5, kind: "shell", color: "cyan" },
      { beat: 35, col: 3, color: "cyan" },
      { beat: 35, col: 7, color: "cyan" },
      { beat: 39, col: 4, kind: "gyre", color: null },
      { beat: 43, col: 2, kind: "echo", color: "red" },
      { beat: 47, col: 0, color: "cyan" },
      { beat: 47, col: 10, color: "cyan" },
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
