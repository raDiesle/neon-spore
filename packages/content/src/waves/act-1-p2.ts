import type { Wave } from "../wave-types.js";

/**
 * Cut from `act-1.ts` by the director's save when that file passed the
 * 250-line ceiling; it plays straight after it (`acts.ts`).
 */
export const WAVES_ACT_1_P2: Wave[] = [
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
      { beat: 12, col: 8, kind: "torch", color: null },
      { beat: 18, col: 5, kind: "torch", color: null },
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
      { beat: 19, col: 3, color: "cyan" },
      { beat: 25, col: 4, kind: "torch", color: null },
      { beat: 30, col: 8, color: "cyan" },
      { beat: 34, col: 1, kind: "meteor", color: null },
    ],
    controls: "standard4",
  },
];
