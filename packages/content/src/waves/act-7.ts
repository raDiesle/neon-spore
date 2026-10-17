import type { Wave } from "../wave-types.js";

/**
 * Waves 92 to 101 of the game, in the order they are played: THE GLUTTON's
 * block, the filler before THE GEODE and the boss THE GEODE.
 *
 * Cut by `bun run waves:order --write` (`waves-recut.ts`), which cuts every act
 * after the tutorial arc again in play order. A save that fills it cuts a page
 * after it (`acts.ts`).
 */
export const WAVES_ACT_7: Wave[] = [
  {
    id: "theGlutton",
    name: "THE GLUTTON",
    guide: {
      scene: "theGlutton",
    },
    entries: [
      { beat: 0, col: 6, color: "red" },
      { beat: 8, col: 2, kind: "glutton", color: "red" },
      { beat: 18, col: 9, kind: "glutton", color: "cyan" },
    ],
    pods: [
      { beat: 10, col: 4, row: 5, kind: "pod" },
      { beat: 20, col: 7, row: 6, kind: "pod" },
    ],
  },
  {
    id: "theGluttonAgain",
    name: "LITTLE GLUTTON",
    variant: true,
    entries: [
      { beat: 0, col: 6, kind: "glutton", color: "cyan" },
      { beat: 7, col: 4, kind: "glutton", color: "red" },
      { beat: 13, col: 5, kind: "glutton", color: "cyan" },
      { beat: 19, col: 6, kind: "glutton", color: "red" },
      { beat: 25, col: 4, kind: "glutton", color: "red" },
      { beat: 31, col: 6, kind: "glutton", color: "cyan" },
    ],
  },
  {
    id: "theGluttonReach",
    name: "GLUTTON PILGRIM",
    variant: true,
    entries: [
      { beat: 0, col: 9, kind: "glutton", color: "red" },
      { beat: 6, col: 4, kind: "glutton", color: "cyan" },
      { beat: 12, col: 10, kind: "glutton", color: "cyan" },
      { beat: 18, col: 5, kind: "glutton", color: "cyan" },
      { beat: 24, col: 9, kind: "glutton", color: "cyan" },
      { beat: 29, col: 4, kind: "glutton", color: "red" },
    ],
  },
  {
    id: "theGluttonPair",
    name: "GLUTTON TOGETHER",
    variant: true,
    entries: [
      { beat: 0, col: 3, color: "red" },
      { beat: 5, col: 10, kind: "glutton", color: "cyan" },
      { beat: 9, col: 9, color: "cyan" },
      { beat: 14, col: 8, kind: "seeder", color: "cyan" },
      { beat: 20, col: 5, color: "cyan" },
      { beat: 25, col: 7, kind: "glutton", color: "cyan" },
      { beat: 30, col: 10, color: "red" },
      { beat: 35, col: 8, kind: "seeder", color: "red" },
    ],
  },
  {
    id: "theGluttonRecall",
    name: "GLUTTON RELIC",
    variant: true,
    entries: [
      { beat: 0, col: 10, color: "cyan" },
      { beat: 6, col: 5, kind: "glutton", color: "red" },
      { beat: 11, col: 10, color: "cyan" },
      { beat: 17, col: 1, kind: "torch", color: null },
      { beat: 23, col: 9, color: "cyan" },
      { beat: 29, col: 7, kind: "glutton", color: "red" },
      { beat: 34, col: 5, color: "cyan" },
      { beat: 40, col: 4, kind: "torch", color: null },
    ],
  },
  {
    id: "theGluttonPeak",
    name: "GLUTTON STORM",
    variant: true,
    entries: [
      { beat: 0, col: 4, color: "cyan" },
      { beat: 4, col: 2, kind: "glutton", color: "red" },
      { beat: 8, col: 7, color: "red" },
      { beat: 12, col: 9, kind: "seeder", color: "cyan" },
      { beat: 16, col: 4, color: "red" },
      { beat: 16, col: 7, color: "red" },
      { beat: 20, col: 2, kind: "glutton", color: "cyan" },
      { beat: 24, col: 8, kind: "seeder", color: "red" },
      { beat: 28, col: 1, color: "red" },
      { beat: 28, col: 9, color: "red" },
      { beat: 32, col: 5, kind: "glutton", color: "cyan" },
      { beat: 36, col: 2, kind: "seeder", color: "cyan" },
      { beat: 40, col: 1, color: "red" },
      { beat: 40, col: 9, color: "red" },
      { beat: 44, col: 0, kind: "glutton", color: "cyan" },
      { beat: 48, col: 4, kind: "seeder", color: "red" },
    ],
  },
  {
    id: "fillerGeodeBreathe",
    name: "GLUTTON LULLABY",
    entries: [
      { beat: 0, col: 2, color: "cyan" },
      { beat: 8, col: 7, kind: "glutton", color: "cyan" },
      { beat: 16, col: 1, color: "red" },
      { beat: 22, col: 4, kind: "meteor", color: null },
      { beat: 30, col: 5, color: "cyan" },
      { beat: 37, col: 9, kind: "glutton", color: "red" },
    ],
  },
  {
    id: "fillerGeodeRecall",
    name: "ANCIENT GLUTTON",
    variant: true,
    entries: [
      { beat: 0, col: 2, color: "cyan" },
      { beat: 5, col: 3, kind: "glutton", color: "cyan" },
      { beat: 10, col: 5, color: "cyan" },
      { beat: 16, col: 9, kind: "torch", color: null },
      { beat: 22, col: 3, color: "cyan" },
      { beat: 27, col: 1, kind: "glutton", color: "red" },
      { beat: 33, col: 3, color: "cyan" },
      { beat: 39, col: 2, kind: "torch", color: null },
    ],
  },
  {
    id: "fillerGeodeBend",
    name: "GLUTTON MIRAGE",
    variant: true,
    entries: [
      { beat: 0, col: 10, color: "red" },
      { beat: 5, col: 9, kind: "glutton", color: "cyan" },
      { beat: 11, col: 10, color: "red" },
      { beat: 16, col: 7, kind: "seeder", color: "red" },
      { beat: 22, col: 5, color: "red" },
      { beat: 22, col: 8, color: "red" },
      { beat: 28, col: 8, kind: "glutton", color: "red" },
      { beat: 33, col: 6, kind: "seeder", color: "red" },
      { beat: 39, col: 3, color: "red" },
      { beat: 39, col: 7, color: "red" },
      { beat: 45, col: 5, kind: "glutton", color: "red" },
    ],
  },
  {
    id: "theGeode",
    name: "THE GEODE",
    guide: {
      both: "A stone falls on the ship, and only the lance cuts it. Burn each crack with a beam in its colour. Each cut breaks a piece in two.",
      p1: "Only you see each crack's colour: say it. Slide the cannon under the crack named, and keep still.",
      p2: "Only you see where each crack is: say where. Hold the colour you hear until the beam goes.",
    },
    entries: [],
    boss: {
      kind: "geode",
      steps: [
        { beats: 20, cracks: [{ at: 2, color: "red" }] },
        {
          beats: 24,
          cracks: [
            { at: -3, color: "cyan" },
            { at: 3, color: "red" },
          ],
        },
        {
          beats: 28,
          cracks: [
            { at: -4, color: "red" },
            { at: 0, color: "cyan" },
            { at: 0, color: "cyan" },
            { at: 4, color: "red" },
          ],
        },
        {
          beats: 22,
          cracks: [
            { at: -1, color: "red" },
            { at: -1, color: "cyan" },
          ],
        },
      ],
    },
    bossType: "normal",
  },
];
