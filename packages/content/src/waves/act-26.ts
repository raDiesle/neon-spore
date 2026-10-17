import type { Wave } from "../wave-types.js";

/**
 * Waves 325 to 334 of the game, in the order they are played: THE COIL's block,
 * the filler before THE LEDGER and the boss THE LEDGER.
 *
 * Cut by `bun run waves:order --write` (`waves-recut.ts`), which cuts every act
 * after the tutorial arc again in play order. A save that fills it cuts a page
 * after it (`acts.ts`).
 */
export const WAVES_ACT_26: Wave[] = [
  {
    id: "theCoil",
    name: "THE COIL",
    guide: {
      scene: "theCoil",
    },
    entries: [
      { beat: 7, col: 6, kind: "coil", color: null },
      { beat: 15, col: 7, kind: "coil", color: null },
      { beat: 23, col: 5, kind: "meteor", color: null },
      { beat: 37, col: 7, kind: "coil", color: null },
      { beat: 45, col: 7, kind: "coil", color: null },
      { beat: 61, col: 7, kind: "coil", color: null },
    ],
    faults: [{ kind: "shield" }],
  },
  {
    id: "theCoilAgain",
    name: "FIRST COIL",
    variant: true,
    entries: [
      { beat: 0, col: 1, kind: "coil", color: null },
      { beat: 7, col: 7, kind: "coil", color: null },
      { beat: 13, col: 9, kind: "coil", color: null },
      { beat: 21, col: 4, kind: "coil", color: null },
      { beat: 29, col: 5, kind: "coil", color: null },
    ],
  },
  {
    id: "theCoilReach",
    name: "OUTER COIL",
    variant: true,
    entries: [
      { beat: 0, col: 10, kind: "coil", color: null },
      { beat: 6, col: 6, kind: "moult", color: null },
      { beat: 18, col: 9, kind: "coil", color: null },
      { beat: 26, col: 1, kind: "moult", color: null },
    ],
    pods: [{ beat: 12, col: 0, row: 4, kind: "husk" }],
  },
  {
    id: "theCoilPair",
    name: "COIL TANGO",
    variant: true,
    entries: [
      { beat: 0, col: 8, color: "cyan" },
      { beat: 6, col: 2, kind: "coil", color: null },
      { beat: 12, col: 6, color: "cyan" },
      { beat: 18, col: 3, kind: "moult", color: null },
      { beat: 23, col: 9, color: "cyan" },
      { beat: 28, col: 4, kind: "choir", color: "cyan" },
      { beat: 34, col: 2, color: "cyan" },
      { beat: 39, col: 5, kind: "coil", color: null },
    ],
  },
  {
    id: "theCoilRecall",
    name: "COIL HOMECOMING",
    variant: true,
    entries: [
      { beat: 0, col: 9, color: "red" },
      { beat: 6, col: 3, kind: "coil", color: null },
      { beat: 12, col: 0, color: "red" },
      { beat: 18, col: 8, kind: "beatbox", color: null, beats: 4 },
      { beat: 24, col: 10, color: "red" },
      { beat: 30, col: 5, kind: "coil", color: null },
      { beat: 35, col: 9, color: "cyan" },
    ],
  },
  {
    id: "theTwitch",
    name: "COIL INFERNO",
    variant: true,
    entries: [
      { beat: 0, col: 5, kind: "meteor", color: null },
      { beat: 10, col: 10, kind: "coil", color: null },
      { beat: 26, col: 10, kind: "coil", color: null },
      { beat: 28, col: 10, kind: "coil", color: null },
      { beat: 30, col: 10, kind: "coil", color: null },
      { beat: 48, col: 10, kind: "coil", color: null },
      { beat: 50, col: 10, kind: "coil", color: null },
      { beat: 52, col: 10, kind: "coil", color: null },
      { beat: 54, col: 10, kind: "coil", color: null },
      { beat: 62, col: 0, kind: "meteorMedium", color: null },
    ],
    faults: [{ kind: "shield" }],
  },
  {
    id: "fillerLedgerBreathe",
    name: "COIL HUSH",
    entries: [
      { beat: 0, col: 9, color: "cyan" },
      { beat: 8, col: 4, kind: "coil", color: null },
      { beat: 14, col: 6, color: "cyan" },
      { beat: 22, col: 2, kind: "moult", color: null },
      { beat: 30, col: 3, color: "cyan" },
      { beat: 36, col: 8, kind: "fence", color: null },
    ],
  },
  {
    id: "fillerLedgerRecall",
    name: "COIL RELIC",
    variant: true,
    entries: [
      { beat: 0, col: 1, color: "red" },
      { beat: 5, col: 5, kind: "coil", color: null },
      { beat: 10, col: 2, color: "red" },
      { beat: 15, col: 4, kind: "coil", color: null },
      { beat: 21, col: 3, color: "red" },
      { beat: 21, col: 6, color: "red" },
      { beat: 26, col: 4, kind: "coil", color: null },
      { beat: 31, col: 5, color: "red" },
      { beat: 36, col: 2, kind: "coil", color: null },
    ],
  },
  {
    id: "fillerLedgerBend",
    name: "COIL SPELL",
    variant: true,
    entries: [
      { beat: 0, col: 6, color: "cyan" },
      { beat: 6, col: 5, kind: "coil", color: null },
      { beat: 11, col: 3, color: "red" },
      { beat: 11, col: 7, color: "red" },
      { beat: 17, col: 6, kind: "moult", color: null },
      { beat: 23, col: 8, kind: "coil", color: null },
      { beat: 28, col: 3, color: "red" },
      { beat: 28, col: 7, color: "red" },
      { beat: 34, col: 8, kind: "moult", color: null },
      { beat: 39, col: 3, kind: "coil", color: null },
      { beat: 44, col: 3, color: "cyan" },
      { beat: 44, col: 6, color: "cyan" },
    ],
  },
  {
    id: "theLedger",
    name: "THE LEDGER",
    guide: {
      scene: "theLedger",
    },
    entries: [
      { beat: 18, col: 2, kind: "meteor", color: null },
      { beat: 26, col: 8, color: "red" },
      { beat: 34, col: 5, color: "cyan" },
      { beat: 44, col: 0, kind: "meteor", color: null },
      { beat: 52, col: 10, color: "red" },
      { beat: 62, col: 3, color: "cyan" },
      { beat: 72, col: 7, kind: "meteor", color: null },
      { beat: 82, col: 8, color: "cyan" },
    ],
    boss: { kind: "ledger" },
    bossType: "normal",
  },
];
