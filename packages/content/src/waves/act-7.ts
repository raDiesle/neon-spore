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
      { beat: 6, col: 5, kind: "glutton", color: "red" },
      { beat: 12, col: 6, kind: "glutton", color: "red" },
      { beat: 18, col: 4, kind: "glutton", color: "red" },
      { beat: 24, col: 6, kind: "glutton", color: "cyan" },
      { beat: 30, col: 4, kind: "glutton", color: "cyan" },
    ],
  },
  {
    id: "theGluttonReach",
    name: "GLUTTON PILGRIM",
    variant: true,
    entries: [
      { beat: 0, col: 9, kind: "glutton", color: "red" },
      { beat: 6, col: 4, kind: "glutton", color: "red" },
      { beat: 12, col: 9, kind: "glutton", color: "cyan" },
      { beat: 18, col: 4, kind: "glutton", color: "cyan" },
      { beat: 24, col: 10, kind: "glutton", color: "cyan" },
      { beat: 30, col: 5, kind: "glutton", color: "cyan" },
    ],
  },
  {
    id: "theGluttonPair",
    name: "GLUTTON TOGETHER",
    variant: true,
    entries: [
      { beat: 0, col: 6, color: "red" },
      { beat: 5, col: 2, kind: "glutton", color: "red" },
      { beat: 10, col: 4, color: "cyan" },
      { beat: 15, col: 7, kind: "seeder", color: "red" },
      { beat: 19, col: 9, color: "cyan" },
      { beat: 25, col: 10, kind: "glutton", color: "cyan" },
      { beat: 29, col: 0, color: "red" },
      { beat: 37, col: 3, kind: "seeder", color: "red" },
    ],
  },
  {
    id: "theGluttonRecall",
    name: "GLUTTON RELIC",
    variant: true,
    entries: [
      { beat: 0, col: 0, color: "red" },
      { beat: 7, col: 9, kind: "glutton", color: "red" },
      { beat: 13, col: 1, color: "red" },
      { beat: 18, col: 9, kind: "torch", color: null },
      { beat: 26, col: 0, color: "red" },
      { beat: 32, col: 7, kind: "glutton", color: "red" },
      { beat: 37, col: 10, color: "cyan" },
    ],
  },
  {
    id: "theGluttonPeak",
    name: "GLUTTON STORM",
    variant: true,
    entries: [
      { beat: 0, col: 8, color: "red" },
      { beat: 5, col: 3, kind: "glutton", color: "red" },
      { beat: 9, col: 6, color: "red" },
      { beat: 13, col: 9, kind: "seeder", color: "cyan" },
      { beat: 18, col: 3, color: "red" },
      { beat: 18, col: 7, color: "red" },
      { beat: 22, col: 4, kind: "blister", color: null, row: 2, by: 2, gesture: "swipe" },
      { beat: 26, col: 2, kind: "glutton", color: "cyan" },
      { beat: 30, col: 4, color: "red" },
      { beat: 30, col: 7, color: "red" },
      { beat: 34, col: 6, kind: "seeder", color: "red" },
      { beat: 38, col: 8, kind: "blister", color: null, row: 2, by: 2, gesture: "swipe" },
      { beat: 42, col: 0, color: "cyan" },
      { beat: 42, col: 10, color: "cyan" },
      { beat: 46, col: 6, kind: "glutton", color: "red" },
    ],
  },
  {
    id: "fillerGeodeBreathe",
    name: "GLUTTON LULLABY",
    entries: [
      { beat: 0, col: 8, color: "red" },
      { beat: 8, col: 7, kind: "glutton", color: "red" },
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
      { beat: 0, col: 0, color: "cyan" },
      { beat: 5, col: 8, kind: "glutton", color: "cyan" },
      { beat: 13, col: 4, color: "red" },
      { beat: 19, col: 7, kind: "meteor", color: null },
      { beat: 25, col: 2, color: "cyan" },
      { beat: 31, col: 1, kind: "glutton", color: "red" },
      { beat: 36, col: 3, color: "cyan" },
    ],
  },
  {
    id: "fillerGeodeBend",
    name: "GLUTTON MIRAGE",
    variant: true,
    entries: [
      { beat: 0, col: 7, color: "cyan" },
      { beat: 5, col: 6, kind: "glutton", color: "red" },
      { beat: 10, col: 8, color: "cyan" },
      { beat: 15, col: 1, kind: "seeder", color: "red" },
      { beat: 23, col: 3, color: "red" },
      { beat: 23, col: 6, color: "red" },
      { beat: 29, col: 3, kind: "glutton", color: "red" },
      { beat: 35, col: 5, kind: "seeder", color: "cyan" },
      { beat: 40, col: 3, color: "cyan" },
      { beat: 40, col: 7, color: "cyan" },
      { beat: 46, col: 7, kind: "glutton", color: "red" },
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
