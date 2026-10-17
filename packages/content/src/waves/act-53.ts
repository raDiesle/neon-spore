import type { Wave } from "../wave-types.js";

/**
 * Waves 562 to 567 of the game, in the order they are played: THE GYRE's review
 * and the boss THE HYDRA.
 *
 * Cut by `bun run waves:order --write` (`waves-recut.ts`), which cuts every act
 * after the tutorial arc again in play order. A save that fills it cuts a page
 * after it (`acts.ts`).
 */
export const WAVES_ACT_53: Wave[] = [
  {
    id: "reviewGyreAgain",
    name: "GYRE DAWN",
    entries: [
      { beat: 0, col: 8, kind: "gyre", color: null },
      { beat: 7, col: 0, kind: "echo", color: "red" },
      { beat: 13, col: 8, kind: "glutton", color: "red" },
      { beat: 20, col: 7, kind: "gyre", color: null },
      { beat: 27, col: 1, kind: "echo", color: "cyan" },
    ],
  },
  {
    id: "reviewGyreReach",
    name: "OUTER GYRE",
    variant: true,
    entries: [
      { beat: 0, col: 10, kind: "gyre", color: null },
      { beat: 5, col: 0, kind: "echo", color: "cyan" },
      { beat: 11, col: 10, kind: "rind", color: "cyan" },
      { beat: 17, col: 1, kind: "gyre", color: null },
      { beat: 22, col: 5, kind: "echo", color: "red" },
      { beat: 28, col: 1, kind: "rind", color: "red" },
    ],
  },
  {
    id: "reviewGyrePair",
    name: "GYRE MEETS ECHO",
    variant: true,
    entries: [
      { beat: 0, col: 0, color: "cyan" },
      { beat: 4, col: 10, kind: "gyre", color: null },
      { beat: 10, col: 2, color: "red" },
      { beat: 10, col: 8, color: "red" },
      { beat: 16, col: 7, kind: "echo", color: "cyan" },
      { beat: 20, col: 10, kind: "morsel", color: "red" },
      { beat: 26, col: 1, color: "cyan" },
      { beat: 26, col: 9, color: "cyan" },
      { beat: 31, col: 3, kind: "gyre", color: null },
      { beat: 35, col: 10, kind: "echo", color: "cyan" },
    ],
  },
  {
    id: "reviewGyreRecall",
    name: "GYRE LEGEND",
    variant: true,
    entries: [
      { beat: 0, col: 0, color: "cyan" },
      { beat: 5, col: 10, kind: "gyre", color: null },
      { beat: 10, col: 1, color: "cyan" },
      { beat: 10, col: 9, color: "cyan" },
      { beat: 15, col: 6, kind: "clasp", color: "red" },
      { beat: 21, col: 10, kind: "gyre", color: null },
      { beat: 26, col: 3, color: "cyan" },
      { beat: 26, col: 7, color: "cyan" },
      { beat: 31, col: 0, kind: "clasp", color: "cyan" },
      { beat: 36, col: 2, kind: "gyre", color: null },
    ],
  },
  {
    id: "reviewGyrePeak",
    name: "GYRE APOCALYPSE",
    variant: true,
    entries: [
      { beat: 0, col: 3, color: "red" },
      { beat: 0, col: 7, color: "red" },
      { beat: 4, col: 6, kind: "gyre", color: null },
      { beat: 8, col: 1, kind: "echo", color: "cyan" },
      { beat: 12, col: 2, color: "red" },
      { beat: 12, col: 8, color: "red" },
      { beat: 16, col: 8, kind: "clasp", color: "red" },
      { beat: 19, col: 6, kind: "gyre", color: null },
      { beat: 23, col: 0, color: "cyan" },
      { beat: 23, col: 10, color: "cyan" },
      { beat: 27, col: 9, kind: "echo", color: "red" },
      { beat: 30, col: 10, kind: "clasp", color: "red" },
      { beat: 33, col: 2, color: "cyan" },
      { beat: 33, col: 8, color: "cyan" },
      { beat: 37, col: 6, kind: "gyre", color: null },
      { beat: 40, col: 2, kind: "echo", color: "red" },
      { beat: 43, col: 0, color: "red" },
      { beat: 43, col: 10, color: "red" },
      { beat: 46, col: 4, kind: "clasp", color: "cyan" },
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
