import type { Wave } from "../wave-types.js";

/**
 * Cut from `act-14b-p43.ts` by the director's save when that file passed the
 * 250-line ceiling; it plays straight after it (`acts.ts`).
 */
export const WAVES_ACT_14B_P44: Wave[] = [
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
