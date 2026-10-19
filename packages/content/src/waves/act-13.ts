import type { Wave } from "../wave-types.js";

/**
 * Waves 237 to 248 of the game, in the order they are played: THE CHOIR's
 * block, the filler before THE VISE, the boss THE VISE and THE CLAW's block.
 *
 * Cut by `bun run waves:order --write` (`waves-recut.ts`), which cuts every act
 * after the tutorial arc again in play order. A save that fills it cuts a page
 * after it (`acts.ts`).
 */
export const WAVES_ACT_13: Wave[] = [
  {
    id: "theChoir",
    name: "THE CHOIR",
    guide: {
      scene: "theChoir",
    },
    entries: [
      { beat: 0, col: 3, kind: "choir", color: "red" },
      { beat: 10, col: 0, kind: "choir", color: "cyan" },
      { beat: 22, col: 7, kind: "choir", color: "cyan" },
      { beat: 34, col: 2, kind: "choir", color: "red" },
    ],
  },
  {
    id: "theChoirPair",
    name: "CHOIR AND FENCE",
    variant: true,
    entries: [
      { beat: 0, col: 4, color: "red" },
      { beat: 6, col: 10, kind: "choir", color: "red" },
      { beat: 10, col: 9, color: "red" },
      { beat: 16, col: 10, kind: "fence", color: null },
      { beat: 20, col: 9, color: "red" },
      { beat: 26, col: 2, kind: "choir", color: "red" },
      { beat: 30, col: 0, color: "red" },
      { beat: 35, col: 5, kind: "blister", color: null, row: 2, gesture: "swipe" },
    ],
  },
  {
    id: "theChoirRecall",
    name: "ANCIENT CHOIR",
    variant: true,
    entries: [
      { beat: 0, col: 0, color: "red" },
      { beat: 5, col: 1, kind: "choir", color: "red" },
      { beat: 12, col: 10, color: "red" },
      { beat: 19, col: 1, kind: "lure", color: "cyan" },
      { beat: 24, col: 7, color: "red" },
      { beat: 29, col: 5, kind: "choir", color: "cyan" },
      { beat: 34, col: 9, color: "red" },
      { beat: 39, col: 7, kind: "meteorMedium", color: null },
    ],
  },
  {
    id: "theChoirPeak",
    name: "CHOIR RAPTURE",
    variant: true,
    entries: [
      { beat: 0, col: 8, color: "red" },
      { beat: 4, col: 5, kind: "choir", color: "red" },
      { beat: 7, col: 1, color: "red" },
      { beat: 15, col: 9, kind: "fence", color: null },
      { beat: 18, col: 2, color: "red" },
      { beat: 18, col: 8, color: "red" },
      { beat: 23, col: 3, kind: "choir", color: "red" },
      { beat: 27, col: 0, kind: "dart", color: "red" },
      { beat: 32, col: 3, color: "cyan" },
      { beat: 32, col: 6, color: "cyan" },
      { beat: 36, col: 2, kind: "choir", color: "red" },
      { beat: 42, col: 9, kind: "fence", color: null },
    ],
  },
  {
    id: "fillerViseBreathe",
    name: "VISE DREAM",
    entries: [
      { beat: 0, col: 6, color: "red" },
      { beat: 7, col: 2, kind: "rind", color: "red" },
      { beat: 15, col: 1, color: "red" },
      { beat: 21, col: 9, kind: "seeder", color: "red" },
      { beat: 28, col: 8, color: "red" },
      { beat: 35, col: 3, kind: "torch", color: null },
    ],
  },
  {
    id: "fillerViseRecall",
    name: "VISE SAGA",
    variant: true,
    entries: [
      { beat: 0, col: 6, color: "cyan" },
      { beat: 5, col: 10, kind: "morsel", color: "red" },
      { beat: 11, col: 8, color: "cyan" },
      { beat: 17, col: 3, kind: "echo", color: "cyan" },
      { beat: 23, col: 0, color: "red" },
      { beat: 28, col: 3, kind: "torch", color: null },
      { beat: 33, col: 9, color: "red" },
      { beat: 39, col: 1, kind: "morsel", color: "cyan" },
    ],
  },
  {
    id: "fillerViseBend",
    name: "CROOKED VISE",
    variant: true,
    entries: [
      { beat: 0, col: 10, color: "cyan" },
      { beat: 6, col: 8, kind: "torch", color: null },
      { beat: 12, col: 3, color: "red" },
      { beat: 17, col: 4, kind: "dart", color: "cyan" },
      { beat: 23, col: 2, color: "red" },
      { beat: 23, col: 8, color: "red" },
      { beat: 28, col: 10, kind: "lure", color: "cyan" },
      { beat: 33, col: 0, kind: "torch", color: null },
      { beat: 41, col: 1, color: "cyan" },
      { beat: 41, col: 9, color: "cyan" },
      { beat: 47, col: 9, kind: "dart", color: "cyan" },
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
  {
    id: "theClaw",
    name: "THE CLAW",
    guide: {
      scene: "theClaw",
    },
    entries: [],
    pods: [
      { beat: 2, col: 0, row: 4, kind: "pod", cross: 1 },
      { beat: 18, col: 10, row: 6, kind: "pod", cross: -1 },
      { beat: 34, col: 0, row: 3, kind: "pod", cross: 1, speed: 3 },
      { beat: 50, col: 10, row: 5, kind: "pod", cross: -1 },
    ],
    controls: "claw",
  },
  {
    id: "theClawPair",
    name: "CLAW DUET",
    variant: true,
    entries: [],
    pods: [
      { beat: 0, col: 10, row: 4, kind: "pod", cross: -1 },
      { beat: 8, col: 10, row: 3, kind: "pod", cross: -1 },
      { beat: 17, col: 10, row: 3, kind: "pod", cross: -1 },
      { beat: 26, col: 10, row: 6, kind: "pod", cross: -1 },
      { beat: 35, col: 10, row: 4, kind: "pod", cross: -1 },
    ],
    controls: "claw",
  },
  {
    id: "theClawRecall",
    name: "CLAW HOMECOMING",
    variant: true,
    entries: [],
    pods: [
      { beat: 0, col: 0, row: 3, kind: "pod", cross: 1 },
      { beat: 9, col: 10, row: 5, kind: "pod", cross: -1, speed: 3 },
      { beat: 18, col: 10, row: 3, kind: "pod", cross: -1 },
      { beat: 27, col: 0, row: 3, kind: "pod", cross: 1, speed: 3 },
    ],
    controls: "claw",
  },
  {
    id: "theClawPeak",
    name: "CLAW THUNDER",
    variant: true,
    entries: [],
    pods: [
      { beat: 0, col: 0, row: 5, kind: "pod", cross: 1, speed: 3 },
      { beat: 7, col: 10, row: 4, kind: "pod", cross: -1 },
      { beat: 15, col: 10, row: 3, kind: "pod", cross: -1 },
      { beat: 23, col: 10, row: 6, kind: "pod", cross: -1, speed: 3 },
      { beat: 31, col: 10, row: 3, kind: "pod", cross: -1 },
    ],
    controls: "claw",
  },
];
