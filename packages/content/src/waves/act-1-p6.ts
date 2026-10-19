import type { Wave } from "../wave-types.js";

/**
 * Cut from `act-1-p5.ts` by the director's save when that file passed the
 * 250-line ceiling; it plays straight after it (`acts.ts`).
 */
export const WAVES_ACT_1_P6: Wave[] = [
  {
    id: "theGhostRecall",
    name: "GHOST LEGEND",
    variant: true,
    entries: [
      { beat: 0, col: 6, color: "cyan" },
      { beat: 8, col: 9, kind: "ghost", color: "cyan", path: "across" },
      { beat: 16, col: 1, color: "cyan" },
      { beat: 23, col: 10, kind: "strand", color: "cyan", beads: 3 },
      { beat: 30, col: 4, color: "red" },
      { beat: 38, col: 8, kind: "ghost", color: "cyan", path: "across" },
    ],
    controls: "standard2",
  },
  {
    id: "theWisp",
    name: "THE WISP",
    hints: "theWisp",
    entries: [
      { beat: 0, col: 5, kind: "wisp", color: null },
      { beat: 14, col: 2, kind: "wisp", color: null },
      { beat: 28, col: 7, kind: "wisp", color: null },
    ],
    controls: "standard2",
  },
  {
    id: "theWispRecall",
    name: "WISP LEGEND",
    variant: true,
    entries: [
      { beat: 0, col: 0, color: "red" },
      { beat: 7, col: 10, kind: "wisp", color: null },
      { beat: 14, col: 3, color: "cyan" },
      { beat: 22, col: 6, kind: "echo", color: "red" },
      { beat: 30, col: 5, color: "cyan" },
      { beat: 37, col: 2, kind: "wisp", color: null },
    ],
    controls: "standard2",
  },
  {
    id: "theRock",
    name: "THE ROCK",
    hints: "theRock",
    entries: [
      { beat: 0, col: 5, kind: "meteor", color: null },
      { beat: 10, col: 5, kind: "meteor", color: null },
      { beat: 20, col: 3, kind: "meteor", color: null },
    ],
    controls: "standard4",
  },
  {
    id: "theRockPair",
    name: "ROCK AND CYAN",
    variant: true,
    entries: [
      { beat: 0, col: 5, color: "red" },
      { beat: 6, col: 5, kind: "meteor", color: null },
      { beat: 12, col: 7, color: "cyan" },
      { beat: 18, col: 4, kind: "meteor", color: null },
      { beat: 24, col: 6, color: "red" },
      { beat: 30, col: 3, kind: "meteor", color: null },
      { beat: 36, col: 5, color: "cyan" },
    ],
    controls: "standard4",
  },
  {
    id: "theHand",
    name: "THE HAND",
    hints: "theHand",
    entries: [
      { beat: 0, col: 2, kind: "meteor", color: null },
      { beat: 0, col: 5, kind: "meteor", color: null },
      { beat: 0, col: 8, kind: "meteor", color: null },
    ],
    controls: "standard4",
  },
  {
    id: "oneLastChance",
    name: "ONE LAST CHANCE",
    hints: "oneLastChance",
    entries: [
      { beat: 0, col: 5, kind: "meteor", color: null },
      { beat: 3, col: 5, color: "red" },
      { beat: 6, col: 2, color: "cyan" },
      { beat: 9, col: 8, kind: "meteor", color: null },
      { beat: 10, col: 8, color: "cyan" },
      { beat: 13, col: 3, color: "red" },
    ],
    controls: "standard4",
  },
  {
    id: "torch",
    name: "TORCH",
    hints: "torch",
    entries: [
      { beat: 6, col: 2, kind: "torch", color: null },
      { beat: 14, col: 8, kind: "torch", color: null },
      { beat: 22, col: 5, kind: "torch", color: null },
    ],
    controls: "standard4",
  },
  {
    id: "torchRecall",
    name: "TORCH LEGEND",
    variant: true,
    entries: [
      { beat: 0, col: 2, color: "cyan" },
      { beat: 8, col: 7, kind: "torch", color: null },
      { beat: 16, col: 9, color: "cyan" },
      { beat: 24, col: 3, kind: "countdown", color: "cyan" },
      { beat: 31, col: 9, color: "cyan" },
      { beat: 38, col: 2, kind: "torch", color: null },
    ],
    controls: "standard4",
  },
];
