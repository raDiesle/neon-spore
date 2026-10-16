import type { Wave } from "../wave-types.js";

/**
 * Waves 49 to 58 of the game, in the order they are played: THE CROSSING's
 * block and the boss THE GEODE.
 *
 * Cut by `bun run waves:order --write` (`waves-recut.ts`), which cuts every act
 * after the tutorial arc again in play order. A save that fills it cuts a page
 * after it (`acts.ts`).
 *
 * **THE GEODE is the lance's own boss** (the owner, 16 October 2026: *a boss
 * after THE LANCE's waves, the lance its weapon … breaking something into
 * bigger pieces*; `sim/geode.ts`), and it closes THE CROSSING's block:
 * THE INSTAR takes THE LANCE's, the first after the arc (the owner, the same
 * day). A stone as wide as the field sinks on the ship and a bolt only chips
 * it: every crack is burnt by a beam in its colour, and every piece cut breaks
 * in two. The boulder's one crack, off the middle; the halves', one of each
 * colour; the quarters', two stacked in the middle column for one beam to take
 * both; and the heart's two in one column, one of each colour, for the cannon
 * to stay still while the colour changes. Only the navigator sees where a
 * crack runs and only the pilot its colour. A level run out is the stone on
 * the hull, and the wave is lost.
 */
export const WAVES_ACT_4: Wave[] = [
  {
    id: "theCrossing",
    name: "THE CROSSING",
    guide: {
      scene: "theCrossing",
    },
    entries: [
      { beat: 0, col: 0, kind: "meteor", color: null, cross: 1, row: 5 },
      { beat: 8, col: 5, color: "red" },
      { beat: 10, col: 10, kind: "meteor", color: null, cross: -1, row: 7 },
      { beat: 18, col: 8, color: "cyan" },
      { beat: 20, col: 0, kind: "meteor", color: null, cross: 1, row: 4 },
      { beat: 28, col: 2, color: "red" },
      { beat: 31, col: 10, kind: "meteor", color: null, cross: -1, row: 6 },
      { beat: 34, col: 0, kind: "meteor", color: null, cross: 1, row: 9 },
    ],
  },
  {
    id: "theCrossingAgain",
    name: "CROSSING DAWN",
    variant: true,
    entries: [
      { beat: 0, col: 4, kind: "meteor", color: null, cross: 1, row: 4 },
      { beat: 6, col: 5, kind: "meteor", color: null, cross: 1, row: 9 },
      { beat: 13, col: 4, kind: "meteor", color: null, cross: -1, row: 7 },
      { beat: 20, col: 5, kind: "meteor", color: null, cross: 1, row: 4 },
      { beat: 28, col: 6, kind: "meteor", color: null, cross: -1, row: 6 },
    ],
  },
  {
    id: "theCrossingSpread",
    name: "CROSSING SEEDS",
    variant: true,
    entries: [
      { beat: 0, col: 3, kind: "meteor", color: null, cross: -1, row: 6 },
      { beat: 5, col: 4, kind: "meteor", color: null, cross: 1, row: 5 },
      { beat: 12, col: 5, kind: "meteor", color: null, cross: 1, row: 9 },
      { beat: 17, col: 8, kind: "meteor", color: null, cross: 1, row: 9 },
      { beat: 22, col: 4, kind: "meteor", color: null, cross: 1, row: 4 },
      { beat: 29, col: 2, kind: "meteor", color: null, cross: -1, row: 7 },
    ],
  },
  {
    id: "theCrossingReach",
    name: "OUTER CROSSING",
    variant: true,
    entries: [
      { beat: 0, col: 9, kind: "meteor", color: null, cross: -1, row: 7 },
      { beat: 5, col: 4, kind: "meteor", color: null, cross: -1, row: 6 },
      { beat: 11, col: 0, kind: "meteor", color: null, cross: -1, row: 6 },
      { beat: 17, col: 8, kind: "meteor", color: null, cross: 1, row: 5 },
      { beat: 22, col: 4, kind: "meteor", color: null, cross: 1, row: 9 },
      { beat: 27, col: 10, kind: "meteor", color: null, cross: -1, row: 6 },
    ],
  },
  {
    id: "theCrossingPair",
    name: "CROSSING AND SALVAGE",
    variant: true,
    entries: [
      { beat: 0, col: 7, color: "cyan" },
      { beat: 5, col: 1, kind: "meteor", color: null, cross: -1, row: 6 },
      { beat: 11, col: 0, color: "cyan" },
      { beat: 22, col: 1, color: "cyan" },
      { beat: 28, col: 6, kind: "meteor", color: null, cross: 1, row: 5 },
      { beat: 33, col: 4, color: "cyan" },
    ],
    pods: [{ beat: 16, col: 6, row: 3, kind: "pod" }],
  },
  {
    id: "theCrossingBreathe",
    name: "CROSSING DREAM",
    variant: true,
    entries: [
      { beat: 0, col: 2, color: "cyan" },
      { beat: 8, col: 4, kind: "meteor", color: null, cross: 1, row: 9 },
      { beat: 15, col: 5, color: "red" },
      { beat: 21, col: 6, kind: "meteor", color: null },
      { beat: 28, col: 5, color: "red" },
      { beat: 35, col: 6, kind: "meteor", color: null, cross: 1, row: 4 },
    ],
  },
  {
    id: "theCrossingRecall",
    name: "CROSSING LEGEND",
    variant: true,
    entries: [
      { beat: 0, col: 6, color: "cyan" },
      { beat: 6, col: 10, kind: "meteor", color: null, cross: 1, row: 9 },
      { beat: 12, col: 8, color: "cyan" },
      { beat: 18, col: 6, kind: "meteor", color: null, cross: -1, row: 7 },
      { beat: 23, col: 5, color: "cyan" },
      { beat: 28, col: 2, kind: "meteor", color: null, cross: 1, row: 5 },
      { beat: 33, col: 7, color: "cyan" },
      { beat: 38, col: 6, kind: "meteor", color: null, cross: -1, row: 7 },
    ],
  },
  {
    id: "theCrossingBend",
    name: "TWISTED CROSSING",
    variant: true,
    entries: [
      { beat: 0, col: 1, color: "red" },
      { beat: 5, col: 3, kind: "meteor", color: null, cross: -1, row: 7 },
      { beat: 5, col: 6, kind: "meteor", color: null, cross: -1, row: 7 },
      { beat: 11, col: 8, color: "red" },
      { beat: 17, col: 4, color: "red" },
      { beat: 29, col: 5, color: "cyan" },
      { beat: 34, col: 4, kind: "meteor", color: null, cross: 1, row: 4 },
      { beat: 40, col: 5, color: "red" },
      { beat: 40, col: 8, color: "red" },
    ],
    pods: [{ beat: 23, col: 0, row: 3, kind: "pod" }],
  },
  {
    id: "theCrossingPeak",
    name: "CROSSING APOCALYPSE",
    variant: true,
    entries: [
      { beat: 0, col: 10, color: "red" },
      { beat: 4, col: 5, kind: "meteor", color: null, cross: 1, row: 9 },
      { beat: 4, col: 8, kind: "meteor", color: null, cross: 1, row: 9 },
      { beat: 8, col: 4, color: "red" },
      { beat: 12, col: 8, color: "red" },
      { beat: 20, col: 1, color: "cyan" },
      { beat: 24, col: 3, kind: "meteor", color: null, cross: -1, row: 7 },
      { beat: 28, col: 1, color: "cyan" },
      { beat: 28, col: 9, color: "cyan" },
      { beat: 36, col: 8, color: "cyan" },
      { beat: 40, col: 4, kind: "meteor", color: null, cross: 1, row: 4 },
      { beat: 40, col: 7, kind: "meteor", color: null, cross: 1, row: 4 },
      { beat: 44, col: 10, color: "cyan" },
    ],
    pods: [
      { beat: 16, col: 10, row: 3, kind: "pod" },
      { beat: 32, col: 6, row: 3, kind: "pod" },
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
