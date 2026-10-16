import type { Wave } from "../wave-types.js";

/**
 * Waves 291 to 300 of the game, in the order they are played: THE MOULT's block
 * and the boss THE LEAD.
 *
 * Cut by `bun run waves:order --write` (`waves-recut.ts`), which cuts every act
 * after the tutorial arc again in play order. A save that fills it cuts a page
 * after it (`acts.ts`).
 */
export const WAVES_ACT_27: Wave[] = [
  {
    id: "theMoult",
    name: "THE MOULT",
    guide: {
      scene: "theMoult",
    },
    entries: [
      { beat: 0, col: 0, kind: "meteor", color: null },
      { beat: 4, col: 5, kind: "moult", color: null },
      { beat: 9, col: 8, kind: "moult", color: null },
      { beat: 18, col: 3, kind: "moult", color: null },
      { beat: 19, col: 7, kind: "moult", color: null },
    ],
  },
  {
    id: "theMoultAgain",
    name: "FIRST MOULT",
    variant: true,
    entries: [
      { beat: 0, col: 2, kind: "moult", color: null },
      { beat: 7, col: 5, kind: "moult", color: null },
      { beat: 15, col: 8, kind: "moult", color: null },
      { beat: 21, col: 0, kind: "moult", color: null },
      { beat: 27, col: 9, kind: "moult", color: null },
    ],
  },
  {
    id: "theMoultSpread",
    name: "MOULT SCATTER",
    variant: true,
    entries: [
      { beat: 0, col: 8, kind: "moult", color: null },
      { beat: 5, col: 4, kind: "balloon", color: null },
      { beat: 12, col: 10, kind: "moult", color: null },
      { beat: 17, col: 9, kind: "balloon", color: null },
      { beat: 23, col: 3, kind: "moult", color: null },
      { beat: 30, col: 7, kind: "balloon", color: null },
    ],
  },
  {
    id: "theMoultReach",
    name: "MOULT WANDERER",
    variant: true,
    entries: [
      { beat: 0, col: 0, kind: "moult", color: null },
      { beat: 5, col: 4, kind: "balloon", color: null },
      { beat: 10, col: 10, kind: "fence", color: null },
      { beat: 16, col: 5, kind: "moult", color: null },
      { beat: 22, col: 1, kind: "balloon", color: null },
      { beat: 27, col: 8, kind: "fence", color: null },
    ],
  },
  {
    id: "theMoultPair",
    name: "MOULT TANGO",
    variant: true,
    entries: [
      { beat: 0, col: 9, color: "cyan" },
      { beat: 4, col: 8, kind: "moult", color: null },
      { beat: 10, col: 0, color: "red" },
      { beat: 16, col: 1, kind: "balloon", color: null },
      { beat: 20, col: 0, color: "red" },
      { beat: 24, col: 10, kind: "meteor", color: null },
      { beat: 29, col: 0, color: "cyan" },
      { beat: 35, col: 10, kind: "moult", color: null },
    ],
  },
  {
    id: "theMoultBreathe",
    name: "MOULT LULLABY",
    variant: true,
    entries: [
      { beat: 0, col: 4, color: "cyan" },
      { beat: 7, col: 7, kind: "moult", color: null },
      { beat: 14, col: 1, color: "cyan" },
      { beat: 20, col: 8, kind: "balloon", color: null },
      { beat: 27, col: 1, color: "red" },
      { beat: 34, col: 6, kind: "countdown", color: "cyan" },
    ],
  },
  {
    id: "theMoultRecall",
    name: "ANCIENT MOULT",
    variant: true,
    entries: [
      { beat: 0, col: 1, color: "red" },
      { beat: 6, col: 5, kind: "moult", color: null },
      { beat: 11, col: 1, color: "cyan" },
      { beat: 16, col: 10, kind: "moult", color: null },
      { beat: 22, col: 1, color: "cyan" },
      { beat: 28, col: 10, kind: "moult", color: null },
      { beat: 34, col: 8, color: "cyan" },
      { beat: 40, col: 5, kind: "moult", color: null },
    ],
  },
  {
    id: "theMoultBend",
    name: "MOULT MIRAGE",
    variant: true,
    entries: [
      { beat: 0, col: 4, color: "cyan" },
      { beat: 5, col: 1, kind: "moult", color: null },
      { beat: 11, col: 8, color: "red" },
      { beat: 17, col: 0, kind: "balloon", color: null },
      { beat: 22, col: 5, color: "red" },
      { beat: 22, col: 8, color: "red" },
      { beat: 27, col: 7, kind: "moult", color: null },
      { beat: 33, col: 10, kind: "balloon", color: null },
      { beat: 38, col: 2, color: "cyan" },
      { beat: 38, col: 8, color: "cyan" },
      { beat: 44, col: 8, kind: "moult", color: null },
    ],
  },
  {
    id: "theMoultPeak",
    name: "MOULT THUNDER",
    variant: true,
    entries: [
      { beat: 0, col: 0, color: "red" },
      { beat: 3, col: 3, kind: "moult", color: null },
      { beat: 7, col: 5, color: "red" },
      { beat: 10, col: 7, kind: "balloon", color: null },
      { beat: 14, col: 2, color: "red" },
      { beat: 14, col: 8, color: "red" },
      { beat: 18, col: 3, kind: "weight", color: null },
      { beat: 22, col: 8, kind: "moult", color: null },
      { beat: 26, col: 1, color: "cyan" },
      { beat: 26, col: 9, color: "cyan" },
      { beat: 30, col: 2, kind: "balloon", color: null },
      { beat: 34, col: 8, kind: "weight", color: null },
      { beat: 38, col: 1, color: "red" },
      { beat: 38, col: 9, color: "red" },
      { beat: 42, col: 5, kind: "moult", color: null },
      { beat: 46, col: 10, kind: "balloon", color: null },
    ],
  },
  {
    id: "theLead",
    name: "THE LEAD",
    guide: {
      scene: "theLead",
    },
    entries: [
      { beat: 10, col: 3, kind: "meteor", color: null },
      { beat: 18, col: 0, color: "red" },
      { beat: 26, col: 7, kind: "meteor", color: null },
      { beat: 36, col: 10, color: "cyan" },
      { beat: 46, col: 2, kind: "meteor", color: null },
      { beat: 58, col: 0, color: "cyan" },
      { beat: 70, col: 8, kind: "meteor", color: null },
      { beat: 84, col: 10, color: "red" },
    ],
    boss: { kind: "lead" },
    bossType: "normal",
  },
];
