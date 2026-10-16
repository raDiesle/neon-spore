import type { Wave } from "../wave-types.js";

/**
 * Waves 273 to 282 of the game, in the order they are played: THE BALLOON's
 * block and the boss THE SURGE.
 *
 * Cut by `bun run waves:order --write` (`waves-recut.ts`), which cuts every act
 * after the tutorial arc again in play order. A save that fills it cuts a page
 * after it (`acts.ts`).
 */
export const WAVES_ACT_26: Wave[] = [
  {
    id: "theBalloon",
    name: "THE BALLOON",
    guide: {
      scene: "theBalloon",
    },
    entries: [
      { beat: 0, col: 3, kind: "balloon", color: null },
      { beat: 6, col: 8, kind: "balloon", color: null },
      { beat: 16, col: 7, kind: "balloon", color: null },
      { beat: 24, col: 0, kind: "balloon", color: null },
      { beat: 26, col: 10, kind: "balloon", color: null },
      { beat: 36, col: 3, kind: "balloon", color: null },
    ],
  },
  {
    id: "theBalloonAgain",
    name: "FIRST BALLOON",
    variant: true,
    entries: [
      { beat: 0, col: 2, kind: "balloon", color: null },
      { beat: 7, col: 9, kind: "balloon", color: null },
      { beat: 13, col: 3, kind: "balloon", color: null },
      { beat: 19, col: 9, kind: "balloon", color: null },
      { beat: 25, col: 7, kind: "balloon", color: null },
      { beat: 31, col: 3, kind: "balloon", color: null },
    ],
  },
  {
    id: "theBalloonSpread",
    name: "BALLOON SCATTER",
    variant: true,
    entries: [
      { beat: 0, col: 0, kind: "balloon", color: null },
      { beat: 6, col: 6, color: "cyan" },
      { beat: 12, col: 0, kind: "balloon", color: null },
      { beat: 18, col: 3, color: "cyan" },
      { beat: 24, col: 8, kind: "balloon", color: null },
      { beat: 31, col: 3, color: "cyan" },
    ],
  },
  {
    id: "theBalloonReach",
    name: "BALLOON WANDERER",
    variant: true,
    entries: [
      { beat: 0, col: 9, kind: "balloon", color: null },
      { beat: 5, col: 4, kind: "choir", color: "cyan" },
      { beat: 11, col: 9, kind: "throb", color: "red" },
      { beat: 17, col: 5, kind: "balloon", color: null },
      { beat: 23, col: 9, kind: "choir", color: "cyan" },
      { beat: 28, col: 4, kind: "throb", color: "red" },
    ],
  },
  {
    id: "theBalloonPair",
    name: "BALLOON TANGO",
    variant: true,
    entries: [
      { beat: 0, col: 1, color: "cyan" },
      { beat: 4, col: 0, kind: "balloon", color: null },
      { beat: 10, col: 10, color: "cyan" },
      { beat: 16, col: 0, kind: "choir", color: "cyan" },
      { beat: 20, col: 5, color: "cyan" },
      { beat: 26, col: 2, kind: "strand", color: "cyan", beads: 3 },
      { beat: 30, col: 10, color: "cyan" },
      { beat: 34, col: 2, kind: "balloon", color: null },
    ],
  },
  {
    id: "theBalloonBreathe",
    name: "BALLOON LULLABY",
    variant: true,
    entries: [
      { beat: 0, col: 2, color: "cyan" },
      { beat: 6, col: 0, kind: "balloon", color: null },
      { beat: 12, col: 8, color: "cyan" },
      { beat: 19, col: 6, kind: "choir", color: "red" },
      { beat: 25, col: 10, color: "cyan" },
      { beat: 32, col: 1, kind: "balloon", color: null },
      { beat: 39, col: 4, color: "cyan" },
    ],
  },
  {
    id: "theBalloonRecall",
    name: "ANCIENT BALLOON",
    variant: true,
    entries: [
      { beat: 0, col: 1, color: "cyan" },
      { beat: 5, col: 0, kind: "balloon", color: null },
      { beat: 11, col: 9, color: "cyan" },
      { beat: 16, col: 0, kind: "shell", color: "red" },
      { beat: 22, col: 6, color: "red" },
      { beat: 28, col: 5, kind: "balloon", color: null },
      { beat: 34, col: 3, color: "red" },
      { beat: 39, col: 5, kind: "shell", color: "red" },
    ],
  },
  {
    id: "theBalloonBend",
    name: "BALLOON MIRAGE",
    variant: true,
    entries: [
      { beat: 0, col: 2, color: "cyan" },
      { beat: 6, col: 8, kind: "balloon", color: null },
      { beat: 11, col: 9, color: "red" },
      { beat: 17, col: 6, kind: "choir", color: "red" },
      { beat: 23, col: 4, color: "red" },
      { beat: 23, col: 7, color: "red" },
      { beat: 28, col: 6, kind: "balloon", color: null },
      { beat: 34, col: 0, kind: "choir", color: "cyan" },
      { beat: 39, col: 2, color: "cyan" },
      { beat: 39, col: 8, color: "cyan" },
      { beat: 44, col: 0, kind: "balloon", color: null },
    ],
  },
  {
    id: "theBalloonPeak",
    name: "BALLOON THUNDER",
    variant: true,
    entries: [
      { beat: 0, col: 0, color: "cyan" },
      { beat: 3, col: 9, kind: "balloon", color: null },
      { beat: 7, col: 8, color: "red" },
      { beat: 10, col: 6, kind: "choir", color: "red" },
      { beat: 14, col: 5, color: "cyan" },
      { beat: 14, col: 8, color: "cyan" },
      { beat: 18, col: 10, kind: "rind", color: "cyan" },
      { beat: 22, col: 3, kind: "balloon", color: null },
      { beat: 26, col: 5, color: "cyan" },
      { beat: 26, col: 8, color: "cyan" },
      { beat: 30, col: 10, kind: "choir", color: "red" },
      { beat: 34, col: 1, kind: "rind", color: "cyan" },
      { beat: 38, col: 2, color: "red" },
      { beat: 38, col: 8, color: "red" },
      { beat: 42, col: 6, kind: "balloon", color: null },
      { beat: 46, col: 8, kind: "choir", color: "cyan" },
    ],
  },
  {
    id: "theSurge",
    name: "THE SURGE",
    guide: {
      scene: "theSurge",
    },
    entries: [
      { beat: 14, col: 2, kind: "meteor", color: null },
      { beat: 22, col: 8, color: "red" },
      { beat: 30, col: 5, kind: "meteor", color: null },
      { beat: 40, col: 0, color: "cyan" },
      { beat: 48, col: 7, kind: "meteor", color: null },
      { beat: 58, col: 10, color: "red" },
      { beat: 66, col: 3, color: "cyan" },
      { beat: 76, col: 5, kind: "meteor", color: null },
    ],
    boss: { kind: "surge" },
    bossType: "normal",
  },
];
