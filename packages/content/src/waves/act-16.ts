import type { Wave } from "../wave-types.js";

/**
 * Waves 262 to 271 of the game, in the order they are played: THE CHOIR's
 * block, the filler before THE VISE and the boss THE VISE.
 *
 * Cut by `bun run waves:order --write` (`waves-recut.ts`), which cuts every act
 * after the tutorial arc again in play order. A save that fills it cuts a page
 * after it (`acts.ts`).
 */
export const WAVES_ACT_16: Wave[] = [
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
    id: "theChoirAgain",
    name: "FIRST CHOIR",
    variant: true,
    entries: [
      { beat: 0, col: 7, kind: "choir", color: "red" },
      { beat: 7, col: 6, kind: "choir", color: "cyan" },
      { beat: 14, col: 2, kind: "choir", color: "cyan" },
      { beat: 21, col: 8, kind: "choir", color: "cyan" },
      { beat: 28, col: 2, kind: "choir", color: "red" },
    ],
  },
  {
    id: "theChoirReach",
    name: "CHOIR VOYAGE",
    variant: true,
    entries: [
      { beat: 0, col: 1, kind: "choir", color: "cyan" },
      { beat: 5, col: 9, kind: "fence", color: null },
      { beat: 13, col: 5, kind: "choir", color: "cyan" },
      { beat: 19, col: 9, kind: "fence", color: null },
      { beat: 24, col: 5, kind: "choir", color: "red" },
      { beat: 30, col: 1, kind: "fence", color: null },
    ],
  },
  {
    id: "theChoirPair",
    name: "CHOIR AND FENCE",
    variant: true,
    entries: [
      { beat: 0, col: 8, color: "red" },
      { beat: 4, col: 5, kind: "choir", color: "cyan" },
      { beat: 9, col: 6, color: "cyan" },
      { beat: 15, col: 10, kind: "fence", color: null },
      { beat: 22, col: 0, color: "red" },
      { beat: 26, col: 7, kind: "lure", color: "red" },
      { beat: 34, col: 10, color: "cyan" },
      { beat: 40, col: 3, kind: "choir", color: "red" },
    ],
  },
  {
    id: "theChoirRecall",
    name: "ANCIENT CHOIR",
    variant: true,
    entries: [
      { beat: 0, col: 4, color: "cyan" },
      { beat: 6, col: 0, kind: "choir", color: "red" },
      { beat: 11, col: 10, color: "cyan" },
      { beat: 19, col: 0, kind: "ghost", color: "red" },
      { beat: 26, col: 9, color: "cyan" },
      { beat: 31, col: 7, kind: "choir", color: "red" },
      { beat: 36, col: 10, color: "cyan" },
    ],
  },
  {
    id: "theChoirPeak",
    name: "CHOIR RAPTURE",
    variant: true,
    entries: [
      { beat: 0, col: 9, color: "red" },
      { beat: 3, col: 6, kind: "choir", color: "red" },
      { beat: 11, col: 0, color: "cyan" },
      { beat: 16, col: 6, kind: "fence", color: null },
      { beat: 19, col: 4, color: "cyan" },
      { beat: 19, col: 7, color: "cyan" },
      { beat: 24, col: 10, kind: "strand", color: "cyan", beads: 3 },
      { beat: 30, col: 2, kind: "choir", color: "cyan" },
      { beat: 34, col: 3, color: "red" },
      { beat: 34, col: 6, color: "red" },
      { beat: 38, col: 3, kind: "fence", color: null },
      { beat: 41, col: 1, kind: "strand", color: "red", beads: 2 },
      { beat: 46, col: 3, color: "red" },
      { beat: 46, col: 7, color: "red" },
    ],
  },
  {
    id: "fillerViseBreathe",
    name: "CHOIR DREAM",
    entries: [
      { beat: 0, col: 0, color: "red" },
      { beat: 7, col: 3, kind: "choir", color: "red" },
      { beat: 14, col: 5, color: "cyan" },
      { beat: 21, col: 1, kind: "fence", color: null },
      { beat: 28, col: 4, color: "red" },
      { beat: 34, col: 7, kind: "choir", color: "cyan" },
      { beat: 40, col: 4, color: "cyan" },
    ],
  },
  {
    id: "fillerViseRecall",
    name: "CHOIR SAGA",
    variant: true,
    entries: [
      { beat: 0, col: 2, color: "red" },
      { beat: 5, col: 6, kind: "choir", color: "red" },
      { beat: 10, col: 4, color: "cyan" },
      { beat: 15, col: 6, kind: "dart", color: "cyan" },
      { beat: 21, col: 4, color: "red" },
      { beat: 26, col: 3, kind: "choir", color: "red" },
      { beat: 31, col: 8, color: "cyan" },
      { beat: 37, col: 2, kind: "dart", color: "cyan" },
    ],
  },
  {
    id: "fillerViseBend",
    name: "CROOKED CHOIR",
    variant: true,
    entries: [
      { beat: 0, col: 3, color: "cyan" },
      { beat: 5, col: 5, kind: "choir", color: "red" },
      { beat: 10, col: 10, color: "red" },
      { beat: 16, col: 9, kind: "fence", color: null },
      { beat: 21, col: 3, color: "red" },
      { beat: 21, col: 7, color: "red" },
      { beat: 26, col: 6, kind: "choir", color: "red" },
      { beat: 31, col: 5, kind: "fence", color: null },
      { beat: 36, col: 3, color: "cyan" },
      { beat: 36, col: 6, color: "cyan" },
      { beat: 41, col: 5, kind: "choir", color: "red" },
      { beat: 46, col: 1, kind: "fence", color: null },
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
