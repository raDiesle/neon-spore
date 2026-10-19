import type { Wave } from "../wave-types.js";

/**
 * Waves 142 to 154 of the game, in the order they are played: THE LANCE's
 * block, the filler before THE GEODE and the boss THE GEODE.
 *
 * Cut by `bun run waves:order --write` (`waves-recut.ts`), which cuts every act
 * after the tutorial arc again in play order. A save that fills it cuts a page
 * after it (`acts.ts`).
 */
export const WAVES_ACT_5: Wave[] = [
  {
    id: "theLance",
    name: "THE LANCE",
    guide: {
      scene: "theLance",
    },
    entries: [
      { beat: 0, col: 3, color: "cyan" },
      { beat: 8, col: 3, color: "cyan" },
      { beat: 16, col: 3, color: "cyan" },
      { beat: 24, col: 8, color: "red" },
      { beat: 32, col: 8, color: "red" },
      { beat: 40, col: 8, color: "red" },
    ],
  },
  {
    id: "theLancePair",
    name: "LANCE PARTY",
    variant: true,
    entries: [
      { beat: 0, col: 0, color: "red" },
      { beat: 5, col: 2, kind: "blister", color: null, row: 3 },
      { beat: 11, col: 9, color: "cyan" },
      { beat: 16, col: 6, kind: "rind", color: "red" },
      { beat: 22, col: 3, color: "red" },
      { beat: 31, col: 2, color: "red" },
      { beat: 35, col: 7, kind: "blister", color: null, row: 3 },
    ],
    pods: [{ beat: 26, col: 0, row: 4, kind: "husk" }],
  },
  {
    id: "theLanceRecall",
    name: "LANCE REUNION",
    variant: true,
    entries: [
      { beat: 0, col: 8, color: "cyan" },
      { beat: 6, col: 0, kind: "gyre", color: null },
      { beat: 13, col: 10, color: "red" },
      { beat: 18, col: 3, kind: "strand", color: "cyan", beads: 3 },
      { beat: 26, col: 1, color: "red" },
      { beat: 39, col: 0, color: "red" },
    ],
    pods: [{ beat: 32, col: 9, row: 3, kind: "pod" }],
  },
  {
    id: "theLancePeak",
    name: "LANCE INFERNO",
    variant: true,
    entries: [
      { beat: 0, col: 2, color: "red" },
      { beat: 3, col: 5, kind: "meteor", color: null },
      { beat: 3, col: 8, kind: "meteor", color: null },
      { beat: 11, col: 8, color: "cyan" },
      { beat: 15, col: 4, color: "red" },
      { beat: 19, col: 7, kind: "shell", color: "red" },
      { beat: 23, col: 3, color: "red" },
      { beat: 26, col: 1, kind: "torch", color: null },
      { beat: 30, col: 4, color: "cyan" },
      { beat: 30, col: 7, color: "cyan" },
      { beat: 33, col: 3, kind: "meteor", color: null },
      { beat: 37, col: 0, kind: "shell", color: "cyan" },
      { beat: 42, col: 5, color: "cyan" },
      { beat: 42, col: 8, color: "cyan" },
      { beat: 47, col: 10, kind: "torch", color: null },
    ],
  },
  {
    id: "theCage",
    name: "THE CAGE",
    variant: true,
    entries: [
      { beat: 0, col: 8, color: "red" },
      { beat: 10, col: 2, color: "cyan" },
      { beat: 22, col: 6, color: "red" },
    ],
    pods: [
      { beat: 2, col: 3, row: 3, kind: "pod", due: 24, tint: "cyan" },
      { beat: 14, col: 7, row: 4, kind: "pod", due: 24, tint: "red" },
    ],
  },
  {
    id: "theAnchor",
    name: "THE ANCHOR",
    variant: true,
    entries: [
      { beat: 0, col: 2, color: "cyan" },
      { beat: 12, col: 8, color: "red" },
      { beat: 24, col: 4, color: "cyan" },
    ],
    pods: [
      { beat: 2, col: 5, row: 3, kind: "pod", due: 24, heavy: true },
      { beat: 18, col: 8, row: 4, kind: "pod", due: 24, heavy: true },
    ],
  },
  {
    id: "thePendulum",
    name: "THE PENDULUM",
    variant: true,
    entries: [
      { beat: 0, col: 5, color: "red" },
      { beat: 12, col: 1, color: "cyan" },
      { beat: 24, col: 9, color: "red" },
    ],
    pods: [
      { beat: 2, col: 3, row: 3, kind: "pod", due: 24, swing: true },
      { beat: 16, col: 7, row: 3, kind: "pod", due: 24, swing: true },
    ],
  },
  {
    id: "theTwins",
    name: "THE TWINS",
    variant: true,
    entries: [
      { beat: 0, col: 9, color: "cyan" },
      { beat: 10, col: 1, color: "red" },
      { beat: 22, col: 8, color: "red" },
    ],
    pods: [
      { beat: 2, col: 2, row: 3, kind: "pod", due: 20 },
      { beat: 2, col: 5, row: 4, kind: "pod", due: 20 },
      { beat: 16, col: 6, row: 3, kind: "pod", due: 20 },
      { beat: 16, col: 9, row: 4, kind: "pod", due: 20 },
    ],
  },
  {
    id: "theLastRock",
    name: "THE LAST ROCK",
    variant: true,
    entries: [
      { beat: 4, col: 3, kind: "meteor", color: null },
      { beat: 10, col: 7, kind: "meteor", color: null },
      { beat: 16, col: 5, kind: "meteor", color: null },
      { beat: 20, col: 2, kind: "meteor", color: null },
      { beat: 24, col: 6, kind: "meteor", color: null },
    ],
    pods: [{ beat: 12, col: 5, row: 2, kind: "pod", due: 20 }],
  },
  {
    id: "fillerGeodeBreathe",
    name: "SLEEPY GEODE",
    entries: [
      { beat: 0, col: 2, color: "red" },
      { beat: 7, col: 7, kind: "torch", color: null },
      { beat: 15, col: 8, color: "cyan" },
      { beat: 27, col: 6, color: "red" },
      { beat: 40, col: 4, color: "cyan" },
    ],
    pods: [
      { beat: 21, col: 3, row: 4, kind: "husk" },
      { beat: 34, col: 5, row: 3, kind: "pod" },
    ],
  },
  {
    id: "fillerGeodeRecall",
    name: "GEODE RELIC",
    variant: true,
    entries: [
      { beat: 0, col: 3, color: "cyan" },
      { beat: 5, col: 2, kind: "strand", color: "red", beads: 2 },
      { beat: 11, col: 1, color: "cyan" },
      { beat: 17, col: 4, kind: "magnet", color: "red" },
      { beat: 22, col: 10, color: "cyan" },
      { beat: 28, col: 8, kind: "countdown", color: "red" },
      { beat: 34, col: 2, color: "cyan" },
      { beat: 40, col: 4, kind: "strand", color: "cyan", beads: 3 },
    ],
  },
  {
    id: "fillerGeodeBend",
    name: "GEODE ILLUSION",
    variant: true,
    entries: [
      { beat: 0, col: 1, color: "red" },
      { beat: 11, col: 8, color: "cyan" },
      { beat: 22, col: 3, color: "cyan" },
      { beat: 22, col: 6, color: "cyan" },
      { beat: 28, col: 9, kind: "throb", color: "red" },
      { beat: 40, col: 3, color: "cyan" },
      { beat: 40, col: 7, color: "cyan" },
    ],
    pods: [
      { beat: 5, col: 2, row: 4, kind: "husk" },
      { beat: 17, col: 9, row: 3, kind: "pod" },
      { beat: 34, col: 1, row: 4, kind: "husk" },
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
