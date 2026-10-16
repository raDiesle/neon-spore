import type { Wave } from "../wave-types.js";

/**
 * Waves 382 to 391 of the game, in the order they are played: THE VOLLEY's
 * block and the boss THE RATCHET.
 *
 * Cut by `bun run waves:order --write` (`waves-recut.ts`), which cuts every act
 * after the tutorial arc again in play order. A save that fills it cuts a page
 * after it (`acts.ts`).
 */
export const WAVES_ACT_37: Wave[] = [
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
      { beat: 0, col: 4, kind: "volley", color: "red" },
      { beat: 8, col: 10, kind: "crystal", color: "red" },
      { beat: 16, col: 5, kind: "volley", color: "red" },
      { beat: 23, col: 1, kind: "crystal", color: "red" },
      { beat: 31, col: 10, kind: "volley", color: "cyan" },
    ],
  },
  {
    id: "theVolleySpread",
    name: "VOLLEY DRIFT",
    variant: true,
    entries: [
      { beat: 0, col: 10, kind: "volley", color: "cyan" },
      { beat: 6, col: 1, kind: "crystal", color: "red" },
      { beat: 19, col: 7, kind: "volley", color: "cyan" },
      { beat: 24, col: 1, kind: "crystal", color: "cyan" },
    ],
    pods: [{ beat: 12, col: 2, row: 3, kind: "pod" }],
  },
  {
    id: "theVolleyReach",
    name: "VOLLEY AT WORLD END",
    variant: true,
    entries: [
      { beat: 0, col: 1, kind: "volley", color: "red" },
      { beat: 6, col: 9, kind: "crystal", color: "cyan" },
      { beat: 11, col: 2, kind: "beatbox", color: null, beats: 3 },
      { beat: 17, col: 10, kind: "volley", color: "cyan" },
      { beat: 22, col: 5, kind: "crystal", color: "cyan" },
      { beat: 27, col: 9, kind: "beatbox", color: null, beats: 4 },
    ],
  },
  {
    id: "theVolleyPair",
    name: "VOLLEY ALLIANCE",
    variant: true,
    entries: [
      { beat: 0, col: 10, color: "red" },
      { beat: 5, col: 6, kind: "volley", color: "red" },
      { beat: 11, col: 1, color: "cyan" },
      { beat: 16, col: 9, kind: "crystal", color: "red" },
      { beat: 22, col: 2, color: "red" },
      { beat: 22, col: 8, color: "red" },
      { beat: 28, col: 3, kind: "echo", color: "cyan" },
      { beat: 33, col: 9, kind: "volley", color: "cyan" },
      { beat: 38, col: 3, color: "red" },
      { beat: 38, col: 7, color: "red" },
    ],
  },
  {
    id: "theVolleyBreathe",
    name: "SLEEPY VOLLEY",
    variant: true,
    entries: [
      { beat: 0, col: 8, color: "red" },
      { beat: 8, col: 9, kind: "volley", color: "cyan" },
      { beat: 15, col: 10, color: "cyan" },
      { beat: 23, col: 0, kind: "crystal", color: "red" },
      { beat: 29, col: 10, color: "red" },
      { beat: 36, col: 4, kind: "gyre", color: null },
    ],
  },
  {
    id: "theVolleyRecall",
    name: "OLD VOLLEY SONG",
    variant: true,
    entries: [
      { beat: 0, col: 4, color: "red" },
      { beat: 6, col: 9, kind: "volley", color: "cyan" },
      { beat: 11, col: 3, color: "cyan" },
      { beat: 17, col: 8, kind: "fence", color: null },
      { beat: 22, col: 1, color: "red" },
      { beat: 22, col: 9, color: "red" },
      { beat: 28, col: 10, kind: "volley", color: "cyan" },
      { beat: 34, col: 8, kind: "fence", color: null },
      { beat: 40, col: 3, color: "cyan" },
      { beat: 40, col: 6, color: "cyan" },
    ],
  },
  {
    id: "theVolleyBend",
    name: "VOLLEY SPELL",
    variant: true,
    entries: [
      { beat: 0, col: 6, color: "cyan" },
      { beat: 6, col: 10, kind: "volley", color: "red" },
      { beat: 11, col: 1, color: "red" },
      { beat: 11, col: 9, color: "red" },
      { beat: 17, col: 2, kind: "crystal", color: "cyan" },
      { beat: 23, col: 10, kind: "volley", color: "cyan" },
      { beat: 29, col: 5, color: "cyan" },
      { beat: 29, col: 8, color: "cyan" },
      { beat: 34, col: 7, kind: "crystal", color: "cyan" },
      { beat: 40, col: 8, kind: "volley", color: "red" },
      { beat: 46, col: 2, color: "cyan" },
      { beat: 46, col: 8, color: "cyan" },
    ],
  },
  {
    id: "theVolleyPeak",
    name: "VOLLEY RAPTURE",
    variant: true,
    entries: [
      { beat: 0, col: 8, color: "cyan" },
      { beat: 4, col: 6, kind: "volley", color: "cyan" },
      { beat: 7, col: 2, color: "red" },
      { beat: 7, col: 8, color: "red" },
      { beat: 11, col: 9, kind: "crystal", color: "red" },
      { beat: 18, col: 0, color: "cyan" },
      { beat: 18, col: 10, color: "cyan" },
      { beat: 22, col: 4, kind: "volley", color: "red" },
      { beat: 26, col: 3, kind: "crystal", color: "red" },
      { beat: 30, col: 5, color: "cyan" },
      { beat: 30, col: 8, color: "cyan" },
      { beat: 38, col: 1, kind: "volley", color: "cyan" },
      { beat: 41, col: 3, color: "cyan" },
      { beat: 41, col: 7, color: "cyan" },
      { beat: 45, col: 6, kind: "crystal", color: "cyan" },
    ],
    pods: [
      { beat: 0, col: 5, row: 3, kind: "pod" },
      { beat: 28, col: 3, row: 3, kind: "pod" },
    ],
  },
  {
    id: "theRatchet",
    name: "THE RATCHET",
    guide: {
      scene: "theRatchet",
    },
    entries: [],
    boss: { kind: "ratchet" },
    bossType: "normal",
  },
];
