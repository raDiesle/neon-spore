import type { Wave } from "../wave-types.js";

/**
 * Cut from `act-1.ts` by the director's save when that file passed the
 * 250-line ceiling; it plays straight after it (`acts.ts`).
 */
export const WAVES_ACT_1_P2: Wave[] = [
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
    id: "oneLastChance",
    name: "ONE LAST CHANCE",
    variant: true,
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
    id: "shieldThenCannon",
    name: "TORCH AWAKENS",
    variant: true,
    entries: [
      { beat: 0, col: 5, kind: "meteor", color: null },
      { beat: 5, col: 5, color: "cyan" },
    ],
    controls: "standard4",
  },
  {
    id: "theWall",
    name: "FAR TORCH",
    variant: true,
    entries: [
      { beat: 0, col: 0, color: "cyan" },
      { beat: 1, col: 3, color: "red" },
      { beat: 2, col: 7, color: "cyan" },
      { beat: 3, col: 10, color: "red" },
    ],
    controls: "standard4",
  },
  {
    id: "shootAndShield",
    name: "TORCH SIESTA",
    variant: true,
    entries: [
      { beat: 0, col: 3, color: "cyan" },
      { beat: 3, col: 7, kind: "meteor", color: null },
      { beat: 6, col: 8, color: "red" },
      { beat: 9, col: 3, kind: "meteor", color: null },
    ],
    controls: "standard4",
  },
];
