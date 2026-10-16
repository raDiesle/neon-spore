import type { Wave } from "../wave-types.js";

/**
 * Waves 288 to 297 of the game, in the order they are played: THE MOULT's block
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
      { beat: 0, col: 0, kind: "moult", color: null },
      { beat: 8, col: 8, kind: "moult", color: null },
      { beat: 14, col: 2, kind: "moult", color: null },
      { beat: 22, col: 9, kind: "moult", color: null },
      { beat: 29, col: 10, kind: "moult", color: null },
    ],
  },
  {
    id: "theMoultSpread",
    name: "MOULT SCATTER",
    variant: true,
    entries: [
      { beat: 0, col: 10, kind: "moult", color: null },
      { beat: 7, col: 9, kind: "balloon", color: null },
      { beat: 14, col: 6, kind: "moult", color: null },
      { beat: 19, col: 2, kind: "balloon", color: null },
      { beat: 24, col: 4, kind: "moult", color: null },
      { beat: 29, col: 7, kind: "balloon", color: null },
    ],
  },
  {
    id: "theMoultReach",
    name: "MOULT WANDERER",
    variant: true,
    entries: [
      { beat: 0, col: 9, kind: "moult", color: null },
      { beat: 5, col: 4, kind: "balloon", color: null },
      { beat: 10, col: 8, kind: "rind", color: "red" },
      { beat: 16, col: 4, kind: "moult", color: null },
      { beat: 22, col: 10, kind: "balloon", color: null },
      { beat: 28, col: 6, kind: "rind", color: "cyan" },
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
      { beat: 0, col: 7, color: "cyan" },
      { beat: 8, col: 8, kind: "moult", color: null },
      { beat: 14, col: 3, color: "red" },
      { beat: 22, col: 7, kind: "balloon", color: null },
      { beat: 29, col: 0, color: "cyan" },
      { beat: 36, col: 7, kind: "shell", color: "red" },
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
      { beat: 0, col: 6, color: "red" },
      { beat: 4, col: 0, kind: "moult", color: null },
      { beat: 7, col: 5, color: "cyan" },
      { beat: 10, col: 3, kind: "balloon", color: null },
      { beat: 14, col: 3, color: "red" },
      { beat: 14, col: 7, color: "red" },
      { beat: 22, col: 6, kind: "moult", color: null },
      { beat: 26, col: 1, color: "red" },
      { beat: 26, col: 9, color: "red" },
      { beat: 30, col: 2, kind: "balloon", color: null },
      { beat: 36, col: 4, color: "cyan" },
      { beat: 36, col: 7, color: "cyan" },
      { beat: 39, col: 5, kind: "moult", color: null },
      { beat: 42, col: 3, kind: "balloon", color: null },
      { beat: 45, col: 1, color: "cyan" },
    ],
    pods: [
      { beat: 12, col: 5, row: 4, kind: "pod" },
      { beat: 32, col: 0, row: 3, kind: "pod" },
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
