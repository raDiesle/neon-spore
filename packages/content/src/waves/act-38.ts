import type { Wave } from "../wave-types.js";

/**
 * Waves 446 to 455 of the game, in the order they are played: THE VOLLEY's
 * block, the filler before THE SPOOL and the boss THE SPOOL.
 *
 * Cut by `bun run waves:order --write` (`waves-recut.ts`), which cuts every act
 * after the tutorial arc again in play order. A save that fills it cuts a page
 * after it (`acts.ts`).
 */
export const WAVES_ACT_38: Wave[] = [
  {
    id: "theVolley",
    name: "THE VOLLEY",
    guide: {
      scene: "theVolley",
    },
    entries: [
      { beat: 0, col: 2, kind: "volley", color: "red" },
      { beat: 26, col: 8, kind: "volley", color: "cyan" },
    ],
  },
  {
    id: "theVolleyAgain",
    name: "HELLO VOLLEY",
    variant: true,
    entries: [
      { beat: 0, col: 4, kind: "volley", color: "cyan" },
      { beat: 8, col: 7, kind: "crystal", color: "cyan" },
      { beat: 15, col: 1, kind: "moult", color: null },
      { beat: 21, col: 7, kind: "volley", color: "cyan" },
      { beat: 29, col: 0, kind: "crystal", color: "cyan" },
    ],
  },
  {
    id: "theVolleyReach",
    name: "VOLLEY HORIZON",
    variant: true,
    entries: [
      { beat: 0, col: 10, kind: "volley", color: "red" },
      { beat: 7, col: 0, kind: "crystal", color: "cyan" },
      { beat: 12, col: 8, kind: "veer", color: null },
      { beat: 20, col: 2, kind: "volley", color: "cyan" },
      { beat: 26, col: 8, kind: "crystal", color: "red" },
      { beat: 32, col: 1, kind: "veer", color: null },
    ],
  },
  {
    id: "theVolleyPair",
    name: "VOLLEY PARTY",
    variant: true,
    entries: [
      { beat: 0, col: 0, color: "red" },
      { beat: 6, col: 2, kind: "volley", color: "cyan" },
      { beat: 12, col: 7, color: "red" },
      { beat: 18, col: 0, kind: "crystal", color: "cyan" },
      { beat: 22, col: 4, color: "cyan" },
      { beat: 22, col: 7, color: "cyan" },
      { beat: 28, col: 2, kind: "meteorMedium", color: null },
      { beat: 34, col: 10, kind: "volley", color: "cyan" },
      { beat: 40, col: 1, color: "cyan" },
      { beat: 40, col: 9, color: "cyan" },
    ],
  },
  {
    id: "theVolleyRecall",
    name: "VOLLEY LEGEND",
    variant: true,
    entries: [
      { beat: 0, col: 8, color: "cyan" },
      { beat: 6, col: 5, kind: "volley", color: "cyan" },
      { beat: 12, col: 9, color: "cyan" },
      { beat: 18, col: 7, kind: "lure", color: "cyan" },
      { beat: 24, col: 0, color: "cyan" },
      { beat: 24, col: 10, color: "cyan" },
      { beat: 31, col: 0, kind: "volley", color: "red" },
      { beat: 36, col: 2, kind: "lure", color: "cyan" },
    ],
  },
  {
    id: "theVolleyPeak",
    name: "VOLLEY APOCALYPSE",
    variant: true,
    entries: [
      { beat: 0, col: 6, color: "cyan" },
      { beat: 4, col: 7, kind: "volley", color: "cyan" },
      { beat: 9, col: 1, color: "red" },
      { beat: 9, col: 9, color: "red" },
      { beat: 12, col: 2, kind: "crystal", color: "red" },
      { beat: 16, col: 4, kind: "strand", color: "red", beads: 5 },
      { beat: 20, col: 0, color: "red" },
      { beat: 20, col: 10, color: "red" },
      { beat: 26, col: 7, kind: "volley", color: "cyan" },
      { beat: 30, col: 3, kind: "crystal", color: "cyan" },
      { beat: 34, col: 5, color: "cyan" },
      { beat: 34, col: 8, color: "cyan" },
      { beat: 38, col: 0, kind: "strand", color: "red", beads: 2 },
      { beat: 46, col: 3, kind: "volley", color: "red" },
    ],
  },
  {
    id: "fillerSpoolBreathe",
    name: "VOLLEY PICNIC",
    entries: [
      { beat: 0, col: 8, color: "red" },
      { beat: 7, col: 4, kind: "volley", color: "red" },
      { beat: 14, col: 7, color: "cyan" },
      { beat: 21, col: 0, kind: "crystal", color: "red" },
      { beat: 29, col: 10, color: "red" },
      { beat: 36, col: 1, kind: "gyre", color: null },
    ],
  },
  {
    id: "fillerSpoolRecall",
    name: "VOLLEY RELIC",
    variant: true,
    entries: [
      { beat: 0, col: 3, color: "cyan" },
      { beat: 6, col: 7, kind: "volley", color: "cyan" },
      { beat: 11, col: 5, color: "red" },
      { beat: 16, col: 4, kind: "choir", color: "red" },
      { beat: 21, col: 3, color: "cyan" },
      { beat: 21, col: 6, color: "cyan" },
      { beat: 26, col: 4, kind: "volley", color: "red" },
      { beat: 31, col: 8, kind: "choir", color: "red" },
      { beat: 36, col: 1, color: "cyan" },
      { beat: 36, col: 9, color: "cyan" },
    ],
  },
  {
    id: "fillerSpoolBend",
    name: "VOLLEY RIDDLE",
    variant: true,
    entries: [
      { beat: 0, col: 3, color: "cyan" },
      { beat: 5, col: 1, kind: "volley", color: "red" },
      { beat: 11, col: 1, color: "red" },
      { beat: 11, col: 9, color: "red" },
      { beat: 17, col: 1, kind: "crystal", color: "cyan" },
      { beat: 22, col: 7, kind: "volley", color: "red" },
      { beat: 27, col: 0, color: "red" },
      { beat: 27, col: 10, color: "red" },
      { beat: 32, col: 6, kind: "crystal", color: "cyan" },
      { beat: 38, col: 9, kind: "volley", color: "red" },
      { beat: 43, col: 5, color: "cyan" },
      { beat: 43, col: 8, color: "cyan" },
      { beat: 48, col: 7, kind: "crystal", color: "cyan" },
    ],
  },
  {
    id: "theSpool",
    name: "THE SPOOL",
    guide: {
      scene: "theSpool",
    },
    entries: [],
    boss: { kind: "spool" },
    bossType: "normal",
  },
];
