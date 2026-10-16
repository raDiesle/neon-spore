import type { Wave } from "../wave-types.js";

/**
 * Waves 432 to 441 of the game, in the order they are played: THE VEIL's block
 * and the boss THE KEEL.
 *
 * Cut by `bun run waves:order --write` (`waves-recut.ts`), which cuts every act
 * after the tutorial arc again in play order. A save that fills it cuts a page
 * after it (`acts.ts`).
 */
export const WAVES_ACT_42: Wave[] = [
  {
    id: "theVeil",
    name: "THE VEIL",
    guide: {
      scene: "theVeil",
    },
    entries: [
      { beat: 0, col: 5, kind: "veil", color: null },
      { beat: 10, col: 2, kind: "veil", color: null },
      { beat: 11, col: 8, kind: "veil", color: null },
      { beat: 18, col: 3, kind: "veil", color: null },
      { beat: 24, col: 0, kind: "veil", color: null },
    ],
  },
  {
    id: "theVeilAgain",
    name: "VEIL DAWN",
    variant: true,
    entries: [
      { beat: 0, col: 7, kind: "veil", color: null },
      { beat: 8, col: 2, kind: "mine", color: "cyan", row: 11, sees: 1 },
      { beat: 16, col: 8, kind: "weight", color: null },
      { beat: 23, col: 1, kind: "veil", color: null },
      { beat: 31, col: 8, kind: "mine", color: "red", row: 3, sees: 2 },
    ],
  },
  {
    id: "theVeilSpread",
    name: "VEIL SEEDS",
    variant: true,
    entries: [
      { beat: 0, col: 6, kind: "veil", color: null },
      { beat: 7, col: 7, kind: "mine", color: "cyan", row: 11, sees: 1 },
      { beat: 12, col: 9, kind: "meteor", color: null },
      { beat: 17, col: 2, kind: "veil", color: null },
      { beat: 24, col: 10, kind: "mine", color: "cyan", row: 6, sees: 2 },
      { beat: 30, col: 3, kind: "meteor", color: null },
    ],
  },
  {
    id: "theVeilReach",
    name: "OUTER VEIL",
    variant: true,
    entries: [
      { beat: 0, col: 0, kind: "veil", color: null },
      { beat: 5, col: 10, kind: "mine", color: "red", row: 9, sees: 1 },
      { beat: 11, col: 3, kind: "weight", color: null },
      { beat: 17, col: 10, kind: "veil", color: null },
      { beat: 23, col: 4, kind: "mine", color: "cyan", row: 11, sees: 1 },
      { beat: 28, col: 8, kind: "weight", color: null },
    ],
  },
  {
    id: "theVeilPair",
    name: "VEIL MEETS MINE",
    variant: true,
    entries: [
      { beat: 0, col: 10, color: "red" },
      { beat: 4, col: 2, kind: "veil", color: null },
      { beat: 9, col: 7, color: "red" },
      { beat: 15, col: 2, kind: "mine", color: "red", row: 9, sees: 1 },
      { beat: 20, col: 5, color: "cyan" },
      { beat: 20, col: 8, color: "cyan" },
      { beat: 26, col: 2, kind: "gyre", color: null },
      { beat: 30, col: 7, kind: "veil", color: null },
      { beat: 34, col: 1, color: "red" },
      { beat: 34, col: 9, color: "red" },
      { beat: 39, col: 1, kind: "mine", color: "cyan", row: 11, sees: 1 },
    ],
  },
  {
    id: "theVeilBreathe",
    name: "VEIL DREAM",
    variant: true,
    entries: [
      { beat: 0, col: 0, color: "red" },
      { beat: 6, col: 10, kind: "veil", color: null },
      { beat: 12, col: 0, color: "red" },
      { beat: 19, col: 2, kind: "mine", color: "cyan", row: 6, sees: 2 },
      { beat: 27, col: 6, color: "red" },
      { beat: 35, col: 7, kind: "choir", color: "red" },
    ],
  },
  {
    id: "theVeilRecall",
    name: "VEIL LEGEND",
    variant: true,
    entries: [
      { beat: 0, col: 3, color: "red" },
      { beat: 5, col: 8, kind: "veil", color: null },
      { beat: 11, col: 5, color: "red" },
      { beat: 16, col: 8, kind: "weight", color: null },
      { beat: 22, col: 0, color: "red" },
      { beat: 22, col: 10, color: "red" },
      { beat: 27, col: 8, kind: "veil", color: null },
      { beat: 32, col: 3, kind: "weight", color: null },
      { beat: 37, col: 0, color: "red" },
      { beat: 37, col: 10, color: "red" },
    ],
  },
  {
    id: "theVeilBend",
    name: "TWISTED VEIL",
    variant: true,
    entries: [
      { beat: 0, col: 3, color: "red" },
      { beat: 6, col: 0, kind: "veil", color: null },
      { beat: 11, col: 0, color: "red" },
      { beat: 11, col: 10, color: "red" },
      { beat: 16, col: 0, kind: "mine", color: "cyan", row: 6, sees: 2 },
      { beat: 21, col: 7, kind: "veil", color: null },
      { beat: 26, col: 0, color: "cyan" },
      { beat: 26, col: 10, color: "cyan" },
      { beat: 31, col: 8, kind: "mine", color: "red", row: 3, sees: 2 },
      { beat: 37, col: 2, kind: "veil", color: null },
      { beat: 42, col: 3, color: "cyan" },
      { beat: 42, col: 7, color: "cyan" },
      { beat: 47, col: 9, kind: "mine", color: "cyan", row: 11, sees: 1 },
    ],
  },
  {
    id: "theVeilPeak",
    name: "VEIL APOCALYPSE",
    variant: true,
    entries: [
      { beat: 0, col: 0, color: "cyan" },
      { beat: 3, col: 5, kind: "veil", color: null },
      { beat: 7, col: 2, color: "cyan" },
      { beat: 7, col: 8, color: "cyan" },
      { beat: 11, col: 3, kind: "mine", color: "red", row: 9, sees: 1 },
      { beat: 18, col: 4, color: "cyan" },
      { beat: 18, col: 7, color: "cyan" },
      { beat: 22, col: 9, kind: "veil", color: null },
      { beat: 26, col: 2, kind: "mine", color: "cyan", row: 11, sees: 1 },
      { beat: 30, col: 4, color: "red" },
      { beat: 30, col: 7, color: "red" },
      { beat: 37, col: 6, kind: "veil", color: null },
      { beat: 41, col: 0, color: "cyan" },
      { beat: 41, col: 10, color: "cyan" },
      { beat: 44, col: 10, kind: "mine", color: "red", row: 3, sees: 2 },
    ],
    pods: [
      { beat: 14, col: 0, row: 3, kind: "pod" },
      { beat: 34, col: 1, row: 3, kind: "pod" },
    ],
  },
  {
    id: "theKeel",
    name: "THE KEEL",
    guide: {
      both: "Six joints. When one lights, tap it if it is on your half. The middle opens: shoot it in its colour. Then the joints light fast. Shoot the rock.",
      p1: "1. Tap a lit joint on the left half of the spine.\n2. Move the cannon under the open middle, then under the rock.\n3. The joints light fast at the end. Watch which half.",
      p2: "1. Tap a lit joint on the right half of the spine.\n2. Fire the open middle in the colour it shows.\n3. Fire the rock the tail throws before it lands.",
    },
    entries: [],
    boss: { kind: "keel", socket: "red", reprise: [4, 3, 0] },
    bossType: "normal",
  },
];
