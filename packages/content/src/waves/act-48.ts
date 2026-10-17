import type { Wave } from "../wave-types.js";

/**
 * Waves 607 to 610 of the game, in the order they are played: the filler before
 * THE OCULUS and the boss THE OCULUS.
 *
 * Cut by `bun run waves:order --write` (`waves-recut.ts`), which cuts every act
 * after the tutorial arc again in play order. A save that fills it cuts a page
 * after it (`acts.ts`).
 */
export const WAVES_ACT_48: Wave[] = [
  {
    id: "fillerOculusBreathe",
    name: "WISP DREAM",
    entries: [
      { beat: 0, col: 0, color: "red" },
      { beat: 7, col: 5, kind: "wisp", color: null },
      { beat: 14, col: 7, color: "red" },
      { beat: 20, col: 10, kind: "veil", color: null },
      { beat: 27, col: 0, color: "red" },
      { beat: 34, col: 10, kind: "gyre", color: null },
      { beat: 40, col: 5, color: "red" },
    ],
  },
  {
    id: "fillerOculusRecall",
    name: "WISP LEGEND",
    variant: true,
    entries: [
      { beat: 0, col: 9, color: "cyan" },
      { beat: 6, col: 2, kind: "wisp", color: null },
      { beat: 12, col: 0, color: "cyan" },
      { beat: 12, col: 10, color: "cyan" },
      { beat: 18, col: 9, kind: "magnet", color: "cyan" },
      { beat: 24, col: 4, kind: "wisp", color: null },
      { beat: 29, col: 5, color: "red" },
      { beat: 29, col: 8, color: "red" },
      { beat: 35, col: 10, kind: "magnet", color: "red" },
      { beat: 40, col: 3, kind: "wisp", color: null },
    ],
  },
  {
    id: "fillerOculusBend",
    name: "TWISTED WISP",
    variant: true,
    entries: [
      { beat: 0, col: 0, color: "cyan" },
      { beat: 0, col: 10, color: "cyan" },
      { beat: 5, col: 4, kind: "wisp", color: null },
      { beat: 11, col: 2, kind: "veil", color: null },
      { beat: 17, col: 1, color: "red" },
      { beat: 17, col: 9, color: "red" },
      { beat: 22, col: 0, kind: "wisp", color: null },
      { beat: 27, col: 7, kind: "veil", color: null },
      { beat: 32, col: 0, color: "red" },
      { beat: 32, col: 10, color: "red" },
      { beat: 37, col: 4, kind: "wisp", color: null },
      { beat: 43, col: 8, kind: "veil", color: null },
      { beat: 48, col: 1, color: "red" },
      { beat: 48, col: 9, color: "red" },
    ],
  },
  {
    id: "theOculus",
    name: "THE OCULUS",
    guide: {
      both: "Shut the eye's leaves together, three times: hold, then tap, then turn. After each, shoot the eye in its colour. Shoot what falls in between.",
      p1: "1. Hold the left half with the other one.\n2. Then tap it. Then turn it round.\n3. When the eye shows a colour, fire it.",
      p2: "1. Hold the right half with the other one.\n2. Then tap it. Then turn it round.\n3. White takes either colour.",
    },
    entries: [
      { beat: 6, col: 0, color: "red" },
      { beat: 11, col: 10, color: "cyan" },
      { beat: 16, col: 2, color: "red" },
      { beat: 21, col: 8, color: "cyan" },
      { beat: 26, col: 0, color: "red" },
      { beat: 31, col: 10, color: "cyan" },
      { beat: 36, col: 2, color: "red" },
      { beat: 41, col: 8, color: "cyan" },
      { beat: 46, col: 0, color: "red" },
      { beat: 51, col: 10, color: "cyan" },
      { beat: 56, col: 2, color: "red" },
      { beat: 61, col: 8, color: "cyan" },
      { beat: 66, col: 0, color: "red" },
      { beat: 71, col: 10, color: "cyan" },
      { beat: 76, col: 2, color: "red" },
      { beat: 81, col: 8, color: "cyan" },
      { beat: 86, col: 0, color: "red" },
    ],
    boss: {
      kind: "oculus",
      steps: [
        { ask: "shut", color: "either", beats: 6, fuse: 32 },
        { ask: "break", color: "either", beats: 2 },
        { ask: "fire", color: "red", beats: 0 },
        { ask: "tap", color: "either", beats: 32, need: 12 },
        { ask: "fire", color: "cyan", beats: 0 },
        { ask: "turn", color: "either", beats: 32, need: 8 },
        { ask: "fire", color: "either", beats: 0 },
      ],
    },
    bossType: "normal",
  },
];
