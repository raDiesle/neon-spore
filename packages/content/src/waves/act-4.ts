import type { Wave } from "../wave-types.js";

/**
 * Waves 43 to 52 of the game, in the order they are played: THE CROSSING's
 * block and the boss THE MIRROR.
 *
 * Cut by `bun run waves:order --write` (`waves-recut.ts`), which cuts every act
 * after the tutorial arc again in play order. A save that fills it cuts a page
 * after it (`acts.ts`).
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
    name: "CROSSINGS AGAIN",
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
    name: "CROSSINGS SPREAD",
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
    name: "CROSSINGS FAR APART",
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
    name: "CROSSING AND SHIELD",
    variant: true,
    entries: [
      { beat: 0, col: 7, color: "cyan" },
      { beat: 5, col: 1, kind: "meteor", color: null, cross: -1, row: 6 },
      { beat: 11, col: 0, color: "cyan" },
      { beat: 22, col: 1, color: "cyan" },
      { beat: 28, col: 6, kind: "meteor", color: null, cross: 1, row: 5 },
      { beat: 33, col: 4, color: "cyan" },
    ],
    pods: [{ beat: 16, col: 6, row: 3, kind: "ward" }],
  },
  {
    id: "theCrossingBreathe",
    name: "EASY CROSSINGS",
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
    name: "CROSSING RECALL",
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
    name: "CROSSINGS AND TWINS",
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
    pods: [{ beat: 23, col: 0, row: 3, kind: "ward" }],
  },
  {
    id: "theCrossingPeak",
    name: "CROSSING PEAK",
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
      { beat: 16, col: 10, row: 3, kind: "ward" },
      { beat: 32, col: 6, row: 3, kind: "ward" },
    ],
  },
  {
    id: "theMirror",
    name: "THE MIRROR",
    guide: {
      scene: "theMirror",
    },
    entries: [],
    boss: {
      kind: "mirror",
      rounds: [
        ["fireRed", "guard"],
        ["cannonLeft", "cannonRight", "cannonRight"],
        ["intake", "fireRed", "intake", "fireCyan", "intake", "fireRed"],
      ],
    },
    bossType: "special",
    controls: "standard5",
  },
];
