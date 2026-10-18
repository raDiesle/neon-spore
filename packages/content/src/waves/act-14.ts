import { STARE_LEVELS } from "../stare-levels.js";
import type { Wave } from "../wave-types.js";

/**
 * Waves 189 to 202 of the game, in the order they are played: the filler before
 * THE STARE, the boss THE STARE, THE SHELL's block, the filler before THE VISE
 * and the boss THE VISE.
 *
 * Cut by `bun run waves:order --write` (`waves-recut.ts`), which cuts every act
 * after the tutorial arc again in play order. A save that fills it cuts a page
 * after it (`acts.ts`).
 */
export const WAVES_ACT_14: Wave[] = [
  {
    id: "fillerStareBreathe",
    name: "SLEEPY COUNT",
    entries: [
      { beat: 0, col: 1, color: "red" },
      { beat: 6, col: 5, kind: "countdown", color: "red" },
      { beat: 12, col: 6, color: "cyan" },
      { beat: 19, col: 9, kind: "throb", color: "red" },
      { beat: 26, col: 4, color: "cyan" },
      { beat: 34, col: 2, kind: "countdown", color: "cyan" },
    ],
  },
  {
    id: "fillerStareRecall",
    name: "COUNT SAGA",
    variant: true,
    entries: [
      { beat: 0, col: 9, color: "red" },
      { beat: 6, col: 5, kind: "countdown", color: "cyan" },
      { beat: 12, col: 3, color: "cyan" },
      { beat: 17, col: 1, kind: "seeder", color: "red" },
      { beat: 22, col: 9, color: "red" },
      { beat: 30, col: 0, kind: "countdown", color: "red" },
      { beat: 36, col: 1, color: "cyan" },
    ],
  },
  {
    id: "fillerStareBend",
    name: "COUNT RIDDLE",
    variant: true,
    entries: [
      { beat: 0, col: 3, color: "red" },
      { beat: 5, col: 10, kind: "countdown", color: "cyan" },
      { beat: 13, col: 9, color: "cyan" },
      { beat: 19, col: 5, kind: "throb", color: "red" },
      { beat: 24, col: 3, color: "red" },
      { beat: 24, col: 7, color: "red" },
      { beat: 30, col: 6, kind: "countdown", color: "red" },
      { beat: 36, col: 3, kind: "throb", color: "red" },
      { beat: 42, col: 3, color: "cyan" },
      { beat: 42, col: 7, color: "cyan" },
      { beat: 47, col: 9, kind: "countdown", color: "cyan" },
    ],
  },
  {
    id: "theStare",
    name: "THE STARE",
    entries: [],
    boss: { kind: "stare", levels: STARE_LEVELS },
    bossType: "normal",
  },
  {
    id: "theThirdShot",
    name: "THE SHELL",
    guide: {
      scene: "theThirdShot",
    },
    entries: [
      { beat: 0, col: 2, kind: "shell", color: "cyan" },
      { beat: 10, col: 7, kind: "shell", color: "red" },
    ],
  },
  {
    id: "theThirdShotAgain",
    name: "NEW SHELL MOON",
    variant: true,
    entries: [
      { beat: 0, col: 2, kind: "shell", color: "red" },
      { beat: 7, col: 8, kind: "shell", color: "cyan" },
      { beat: 14, col: 2, kind: "shell", color: "red" },
      { beat: 22, col: 6, kind: "shell", color: "red" },
      { beat: 29, col: 8, kind: "shell", color: "red" },
    ],
  },
  {
    id: "theThirdShotReach",
    name: "LONG SHELL ROAD",
    variant: true,
    entries: [
      { beat: 0, col: 0, kind: "shell", color: "cyan" },
      { beat: 5, col: 4, kind: "countdown", color: "red" },
      { beat: 11, col: 8, kind: "shell", color: "red" },
      { beat: 16, col: 4, kind: "countdown", color: "cyan" },
      { beat: 21, col: 0, kind: "shell", color: "cyan" },
      { beat: 26, col: 4, kind: "countdown", color: "cyan" },
    ],
  },
  {
    id: "theThirdShotPair",
    name: "SHELL AND COUNT",
    variant: true,
    entries: [
      { beat: 0, col: 7, color: "red" },
      { beat: 5, col: 6, kind: "shell", color: "red" },
      { beat: 11, col: 4, color: "red" },
      { beat: 16, col: 10, kind: "countdown", color: "cyan" },
      { beat: 23, col: 0, color: "red" },
      { beat: 29, col: 1, kind: "torch", color: null },
      { beat: 33, col: 8, color: "red" },
    ],
  },
  {
    id: "theThirdShotRecall",
    name: "SHELL SAGA",
    variant: true,
    entries: [
      { beat: 0, col: 10, color: "red" },
      { beat: 7, col: 0, kind: "shell", color: "red" },
      { beat: 12, col: 10, color: "red" },
      { beat: 20, col: 2, kind: "shell", color: "cyan" },
      { beat: 26, col: 3, color: "red" },
      { beat: 32, col: 8, kind: "shell", color: "cyan" },
      { beat: 37, col: 5, color: "red" },
    ],
  },
  {
    id: "theThirdShotPeak",
    name: "SHELL THUNDER",
    variant: true,
    entries: [
      { beat: 0, col: 6, color: "red" },
      { beat: 4, col: 2, kind: "shell", color: "cyan" },
      { beat: 9, col: 8, color: "red" },
      { beat: 15, col: 1, kind: "countdown", color: "cyan" },
      { beat: 19, col: 3, color: "cyan" },
      { beat: 19, col: 6, color: "cyan" },
      { beat: 27, col: 1, kind: "seeder", color: "cyan" },
      { beat: 34, col: 10, kind: "shell", color: "red" },
      { beat: 38, col: 2, color: "cyan" },
      { beat: 38, col: 8, color: "cyan" },
      { beat: 42, col: 5, kind: "countdown", color: "red" },
      { beat: 47, col: 10, kind: "seeder", color: "red" },
    ],
  },
  {
    id: "fillerViseBreathe",
    name: "SHELL DREAM",
    entries: [
      { beat: 0, col: 0, color: "red" },
      { beat: 7, col: 3, kind: "shell", color: "red" },
      { beat: 14, col: 5, color: "cyan" },
      { beat: 21, col: 1, kind: "countdown", color: "red" },
      { beat: 28, col: 4, color: "red" },
      { beat: 34, col: 7, kind: "shell", color: "cyan" },
      { beat: 40, col: 4, color: "cyan" },
    ],
  },
  {
    id: "fillerViseRecall",
    name: "ANCIENT SHELL",
    variant: true,
    entries: [
      { beat: 0, col: 8, color: "red" },
      { beat: 5, col: 7, kind: "shell", color: "cyan" },
      { beat: 11, col: 9, color: "cyan" },
      { beat: 17, col: 0, kind: "meteor", color: null, cross: 1, row: 9 },
      { beat: 25, col: 6, color: "red" },
      { beat: 31, col: 2, kind: "shell", color: "red" },
      { beat: 37, col: 10, color: "red" },
    ],
  },
  {
    id: "fillerViseBend",
    name: "CROOKED SHELL",
    variant: true,
    entries: [
      { beat: 0, col: 3, color: "cyan" },
      { beat: 5, col: 5, kind: "shell", color: "red" },
      { beat: 10, col: 10, color: "red" },
      { beat: 16, col: 9, kind: "countdown", color: "cyan" },
      { beat: 21, col: 3, color: "red" },
      { beat: 21, col: 7, color: "red" },
      { beat: 26, col: 6, kind: "shell", color: "red" },
      { beat: 31, col: 5, kind: "countdown", color: "red" },
      { beat: 36, col: 3, color: "cyan" },
      { beat: 36, col: 6, color: "cyan" },
      { beat: 41, col: 5, kind: "shell", color: "cyan" },
      { beat: 46, col: 1, kind: "countdown", color: "red" },
    ],
  },
  {
    id: "theVise",
    name: "THE VISE",
    guide: {
      both: "Pull your lobe shut until its seam cracks. Two seams each bare the kernel. Shoot it in its colour. When both light, pull together. Shield the bite. Shoot the seed.",
      p1: "1. Pull the left lobe shut and say so.\n2. Keep it shut until the seam cracks.\n3. When the kernel shows a colour, fire it.",
      p2: "1. Pull the right lobe shut and say so.\n2. Keep it shut until the seam cracks.\n3. White takes either colour. Pull with the other one when both light.",
    },
    entries: [],
    boss: {
      kind: "vise",
      steps: [
        { ask: "left", color: "either", beats: 5 },
        { ask: "left", color: "either", beats: 4 },
        { ask: "right", color: "either", beats: 5 },
        { ask: "right", color: "either", beats: 4 },
        { ask: "fire", color: "red", beats: 6 },
        { ask: "both", color: "either", beats: 3 },
        { ask: "bite", color: "either", beats: 3 },
        { ask: "fire", color: "cyan", beats: 6 },
        { ask: "spit", color: "red", beats: 4, offset: 2 },
        { ask: "both", color: "either", beats: 3 },
        { ask: "fire", color: "either", beats: 6 },
      ],
    },
    bossType: "normal",
  },
];
