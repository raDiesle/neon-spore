import type { Wave } from "../wave-types.js";

/**
 * Cut from `act-1-p4.ts` by the director's save when that file passed the
 * 250-line ceiling; it plays straight after it (`acts.ts`).
 */
export const WAVES_ACT_1_P5: Wave[] = [
  {
    id: "theGhostPair",
    name: "GHOST MEETS COUNT",
    variant: true,
    entries: [
      { beat: 0, col: 2, color: "red" },
      { beat: 6, col: 7, kind: "ghost", color: "cyan", path: "across" },
      { beat: 12, col: 3, color: "cyan" },
      { beat: 16, col: 2, kind: "countdown", color: "red" },
      { beat: 21, col: 7, color: "cyan" },
      { beat: 27, col: 8, kind: "ghost", color: "cyan" },
      { beat: 33, col: 10, color: "cyan" },
      { beat: 39, col: 7, kind: "countdown", color: "red" },
    ],
    controls: "standard2",
  },
  {
    id: "theWisp",
    name: "THE WISP",
    guide: {
      scene: "theWisp",
    },
    entries: [
      { beat: 0, col: 5, kind: "wisp", color: null },
      { beat: 14, col: 2, kind: "wisp", color: null },
      { beat: 28, col: 7, kind: "wisp", color: null },
    ],
    controls: "standard2",
  },
  {
    id: "theWispAgain",
    name: "FIRST WISP",
    variant: true,
    entries: [
      { beat: 0, col: 4, kind: "wisp", color: null },
      { beat: 8, col: 6, kind: "wisp", color: null },
      { beat: 14, col: 4, kind: "wisp", color: null },
      { beat: 21, col: 5, kind: "wisp", color: null },
      { beat: 28, col: 6, kind: "wisp", color: null },
    ],
    controls: "standard2",
  },
  {
    id: "theWispReach",
    name: "WISP VOYAGE",
    variant: true,
    entries: [
      { beat: 0, col: 10, kind: "wisp", color: null },
      { beat: 6, col: 4, kind: "wisp", color: null },
      { beat: 11, col: 8, kind: "wisp", color: null },
      { beat: 16, col: 3, kind: "wisp", color: null },
      { beat: 21, col: 8, kind: "wisp", color: null },
      { beat: 26, col: 2, kind: "wisp", color: null },
    ],
    controls: "standard2",
  },
  {
    id: "theWispPair",
    name: "WISP AND GHOST",
    variant: true,
    entries: [
      { beat: 0, col: 1, color: "red" },
      { beat: 6, col: 5, kind: "wisp", color: null },
      { beat: 11, col: 1, color: "cyan" },
      { beat: 16, col: 6, kind: "ghost", color: "cyan" },
      { beat: 22, col: 7, color: "cyan" },
      { beat: 26, col: 5, kind: "wisp", color: null },
      { beat: 31, col: 0, color: "red" },
      { beat: 36, col: 3, kind: "ghost", color: "red" },
    ],
    controls: "standard2",
  },
  {
    id: "theRock",
    name: "THE ROCK",
    guide: {
      scene: "theRock",
    },
    entries: [
      { beat: 0, col: 5, kind: "meteor", color: null },
      { beat: 10, col: 5, kind: "meteor", color: null },
      { beat: 20, col: 3, kind: "meteor", color: null },
    ],
    controls: "standard4",
  },
  {
    id: "theRockAgain",
    name: "NEW ROCK MOON",
    variant: true,
    entries: [
      { beat: 0, col: 5, kind: "meteor", color: null },
      { beat: 8, col: 5, kind: "meteor", color: null },
      { beat: 15, col: 4, kind: "meteor", color: null },
      { beat: 22, col: 6, kind: "meteor", color: null },
      { beat: 30, col: 5, kind: "meteor", color: null },
    ],
    controls: "standard4",
  },
  {
    id: "theRockReach",
    name: "FAR ROCK",
    variant: true,
    entries: [
      { beat: 0, col: 5, kind: "meteor", color: null },
      { beat: 7, col: 8, kind: "meteor", color: null },
      { beat: 13, col: 3, kind: "meteor", color: null },
      { beat: 21, col: 7, kind: "meteor", color: null },
      { beat: 28, col: 2, kind: "meteor", color: null },
      { beat: 35, col: 6, kind: "meteor", color: null },
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
    guide: {
      scene: "theHand",
    },
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
    guide: {
      scene: "oneLastChance",
    },
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
    guide: {
      scene: "torch",
    },
    entries: [
      { beat: 6, col: 2, kind: "torch", color: null },
      { beat: 14, col: 8, kind: "torch", color: null },
      { beat: 22, col: 5, kind: "torch", color: null },
    ],
    controls: "standard4",
  },
  {
    id: "torchAgain",
    name: "HELLO TORCH",
    variant: true,
    entries: [
      { beat: 0, col: 6, kind: "torch", color: null },
      { beat: 7, col: 5, kind: "torch", color: null },
      { beat: 13, col: 6, kind: "torch", color: null },
      { beat: 19, col: 5, kind: "torch", color: null },
      { beat: 25, col: 6, kind: "torch", color: null },
    ],
    controls: "standard4",
  },
  {
    id: "torchReach",
    name: "TORCH AT WORLD END",
    variant: true,
    entries: [
      { beat: 0, col: 9, kind: "torch", color: null },
      { beat: 6, col: 4, kind: "torch", color: null },
      { beat: 11, col: 0, kind: "torch", color: null },
      { beat: 17, col: 4, kind: "torch", color: null },
      { beat: 22, col: 8, kind: "torch", color: null },
      { beat: 28, col: 4, kind: "torch", color: null },
    ],
    controls: "standard4",
  },
  {
    id: "torchPair",
    name: "TORCH ALLIANCE",
    variant: true,
    entries: [
      { beat: 0, col: 1, color: "red" },
      { beat: 4, col: 3, kind: "torch", color: null },
      { beat: 9, col: 7, color: "cyan" },
      { beat: 14, col: 10, kind: "meteor", color: null },
      { beat: 20, col: 3, color: "cyan" },
      { beat: 26, col: 4, kind: "torch", color: null },
      { beat: 31, col: 8, color: "cyan" },
      { beat: 37, col: 1, kind: "meteor", color: null },
    ],
    controls: "standard4",
  },
  {
    id: "theBlister",
    name: "THE BLISTER",
    guide: {
      scene: "theBlister",
    },
    entries: [
      { beat: 0, col: 5, kind: "blister", color: null, row: 2, gesture: "swipe" },
      { beat: 12, col: 2, kind: "blister", color: null, row: 3 },
    ],
    controls: "standard4",
  },
];
