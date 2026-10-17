import type { Wave } from "../wave-types.js";

/**
 * Waves 345 to 354 of the game, in the order they are played: THE LURE's block,
 * the filler before THE LEAD and the boss THE LEAD.
 *
 * Cut by `bun run waves:order --write` (`waves-recut.ts`), which cuts every act
 * after the tutorial arc again in play order. A save that fills it cuts a page
 * after it (`acts.ts`).
 */
export const WAVES_ACT_28: Wave[] = [
  {
    id: "theLure",
    name: "THE LURE",
    guide: {
      scene: "theLure",
    },
    entries: [
      { beat: 0, col: 4, kind: "lure", color: "cyan" },
      { beat: 3, col: 7, color: "red" },
      { beat: 8, col: 5, kind: "lure", color: "red" },
      { beat: 11, col: 7, color: "red" },
      { beat: 17, col: 4, kind: "lure", color: "cyan" },
      { beat: 20, col: 7, color: "cyan" },
    ],
  },
  {
    id: "theLureAgain",
    name: "LURE RISING",
    variant: true,
    entries: [
      { beat: 0, col: 7, kind: "lure", color: "cyan" },
      { beat: 6, col: 8, kind: "meteor", color: null },
      { beat: 13, col: 3, kind: "lure", color: "cyan" },
      { beat: 19, col: 2, kind: "meteor", color: null },
      { beat: 25, col: 4, kind: "lure", color: "red" },
      { beat: 32, col: 2, kind: "meteor", color: null },
    ],
  },
  {
    id: "theLureReach",
    name: "OUTER LURE",
    variant: true,
    entries: [
      { beat: 0, col: 10, kind: "lure", color: "red" },
      { beat: 7, col: 1, kind: "coil", color: null },
      { beat: 20, col: 4, kind: "lure", color: "cyan" },
      { beat: 25, col: 10, kind: "coil", color: null },
    ],
    pods: [{ beat: 14, col: 10, row: 4, kind: "husk" }],
  },
  {
    id: "theLurePair",
    name: "LURE AND COIL",
    variant: true,
    entries: [
      { beat: 0, col: 6, color: "red" },
      { beat: 6, col: 3, kind: "lure", color: "red" },
      { beat: 10, col: 8, color: "cyan" },
      { beat: 18, col: 9, kind: "coil", color: null },
      { beat: 24, col: 1, color: "cyan" },
      { beat: 30, col: 9, kind: "countdown", color: "cyan" },
      { beat: 35, col: 4, color: "red" },
    ],
  },
  {
    id: "theLureRecall",
    name: "LURE REUNION",
    variant: true,
    entries: [
      { beat: 0, col: 7, color: "red" },
      { beat: 6, col: 8, kind: "lure", color: "red" },
      { beat: 12, col: 10, color: "cyan" },
      { beat: 19, col: 0, kind: "choir", color: "cyan" },
      { beat: 25, col: 10, color: "red" },
      { beat: 33, col: 2, kind: "lure", color: "cyan" },
      { beat: 39, col: 4, color: "cyan" },
    ],
  },
  {
    id: "theLurePeak",
    name: "LURE INFERNO",
    variant: true,
    entries: [
      { beat: 0, col: 9, color: "red" },
      { beat: 4, col: 4, kind: "lure", color: "cyan" },
      { beat: 12, col: 2, color: "red" },
      { beat: 16, col: 4, kind: "coil", color: null },
      { beat: 20, col: 2, color: "cyan" },
      { beat: 20, col: 8, color: "cyan" },
      { beat: 24, col: 1, kind: "seeder", color: "red" },
      { beat: 31, col: 10, kind: "lure", color: "cyan" },
      { beat: 37, col: 2, color: "red" },
      { beat: 37, col: 8, color: "red" },
      { beat: 41, col: 6, kind: "coil", color: null },
      { beat: 45, col: 10, kind: "seeder", color: "red" },
    ],
  },
  {
    id: "fillerLeadBreathe",
    name: "LAZY LURE",
    entries: [
      { beat: 0, col: 2, color: "red" },
      { beat: 6, col: 8, kind: "lure", color: "cyan" },
      { beat: 14, col: 2, color: "red" },
      { beat: 21, col: 4, kind: "coil", color: null },
      { beat: 27, col: 7, color: "red" },
      { beat: 35, col: 8, kind: "blister", color: null, row: 3, by: 2 },
    ],
  },
  {
    id: "fillerLeadRecall",
    name: "OLD LURE SONG",
    variant: true,
    entries: [
      { beat: 0, col: 3, color: "red" },
      { beat: 5, col: 10, kind: "lure", color: "cyan" },
      { beat: 13, col: 5, color: "cyan" },
      { beat: 19, col: 4, kind: "countdown", color: "red" },
      { beat: 24, col: 3, color: "cyan" },
      { beat: 24, col: 7, color: "cyan" },
      { beat: 30, col: 7, kind: "lure", color: "cyan" },
      { beat: 36, col: 9, kind: "countdown", color: "red" },
    ],
  },
  {
    id: "fillerLeadBend",
    name: "LURE ILLUSION",
    variant: true,
    entries: [
      { beat: 0, col: 3, color: "cyan" },
      { beat: 6, col: 2, kind: "lure", color: "red" },
      { beat: 11, col: 3, color: "red" },
      { beat: 11, col: 7, color: "red" },
      { beat: 16, col: 4, kind: "coil", color: null },
      { beat: 22, col: 2, kind: "lure", color: "red" },
      { beat: 28, col: 5, color: "cyan" },
      { beat: 28, col: 8, color: "cyan" },
      { beat: 34, col: 9, kind: "coil", color: null },
      { beat: 39, col: 4, kind: "lure", color: "cyan" },
      { beat: 45, col: 5, color: "cyan" },
      { beat: 45, col: 8, color: "cyan" },
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
