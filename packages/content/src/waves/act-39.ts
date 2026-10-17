import { NETTLE_SCRIPT } from "../nettle-script.js";
import type { Wave } from "../wave-types.js";

/**
 * Waves 422 to 431 of the game, in the order they are played: THE VOLLEY's
 * block, the filler before THE NETTLE and the boss THE NETTLE.
 *
 * Cut by `bun run waves:order --write` (`waves-recut.ts`), which cuts every act
 * after the tutorial arc again in play order. A save that fills it cuts a page
 * after it (`acts.ts`).
 */
export const WAVES_ACT_39: Wave[] = [
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
      { beat: 0, col: 10, kind: "volley", color: "cyan" },
      { beat: 8, col: 2, kind: "crystal", color: "red" },
      { beat: 14, col: 6, kind: "strand", color: "cyan", beads: 3 },
      { beat: 21, col: 10, kind: "volley", color: "red" },
      { beat: 29, col: 5, kind: "crystal", color: "cyan" },
    ],
  },
  {
    id: "theVolleyReach",
    name: "VOLLEY AT WORLD END",
    variant: true,
    entries: [
      { beat: 0, col: 9, kind: "volley", color: "red" },
      { beat: 5, col: 1, kind: "crystal", color: "cyan" },
      { beat: 11, col: 6, kind: "throb", color: "red" },
      { beat: 17, col: 1, kind: "volley", color: "cyan" },
      { beat: 22, col: 6, kind: "crystal", color: "red" },
      { beat: 28, col: 2, kind: "throb", color: "red" },
    ],
  },
  {
    id: "theVolleyPair",
    name: "VOLLEY ALLIANCE",
    variant: true,
    entries: [
      { beat: 0, col: 2, color: "red" },
      { beat: 4, col: 8, kind: "volley", color: "cyan" },
      { beat: 10, col: 9, color: "red" },
      { beat: 16, col: 6, kind: "crystal", color: "cyan" },
      { beat: 20, col: 0, color: "red" },
      { beat: 20, col: 10, color: "red" },
      { beat: 24, col: 8, kind: "beatbox", color: null, beats: 4 },
      { beat: 30, col: 3, kind: "volley", color: "cyan" },
      { beat: 36, col: 3, color: "cyan" },
      { beat: 36, col: 7, color: "cyan" },
    ],
  },
  {
    id: "theVolleyRecall",
    name: "OLD VOLLEY SONG",
    variant: true,
    entries: [
      { beat: 0, col: 2, color: "red" },
      { beat: 6, col: 8, kind: "volley", color: "cyan" },
      { beat: 12, col: 3, color: "cyan" },
      { beat: 17, col: 10, kind: "clasp", color: "red" },
      { beat: 23, col: 1, color: "red" },
      { beat: 23, col: 9, color: "red" },
      { beat: 29, col: 0, kind: "volley", color: "cyan" },
      { beat: 35, col: 8, kind: "clasp", color: "cyan" },
      { beat: 40, col: 0, color: "cyan" },
      { beat: 40, col: 10, color: "cyan" },
    ],
  },
  {
    id: "theVolleyPeak",
    name: "VOLLEY RAPTURE",
    variant: true,
    entries: [
      { beat: 0, col: 3, color: "cyan" },
      { beat: 3, col: 1, kind: "volley", color: "red" },
      { beat: 7, col: 2, color: "cyan" },
      { beat: 7, col: 8, color: "cyan" },
      { beat: 11, col: 4, kind: "crystal", color: "cyan" },
      { beat: 15, col: 0, kind: "lid", color: "red" },
      { beat: 18, col: 4, color: "red" },
      { beat: 18, col: 7, color: "red" },
      { beat: 22, col: 10, kind: "volley", color: "red" },
      { beat: 26, col: 9, kind: "crystal", color: "red" },
      { beat: 29, col: 4, color: "red" },
      { beat: 29, col: 7, color: "red" },
      { beat: 33, col: 7, kind: "lid", color: "red" },
      { beat: 37, col: 5, kind: "volley", color: "cyan" },
      { beat: 41, col: 1, color: "red" },
      { beat: 41, col: 9, color: "red" },
      { beat: 44, col: 9, kind: "crystal", color: "cyan" },
      { beat: 48, col: 0, kind: "lid", color: "red" },
    ],
  },
  {
    id: "fillerNettleBreathe",
    name: "VOLLEY PICNIC",
    entries: [
      { beat: 0, col: 1, color: "cyan" },
      { beat: 6, col: 10, kind: "volley", color: "cyan" },
      { beat: 12, col: 0, color: "cyan" },
      { beat: 19, col: 5, kind: "crystal", color: "cyan" },
      { beat: 25, col: 2, color: "red" },
      { beat: 33, col: 0, kind: "throb", color: "red" },
      { beat: 39, col: 6, color: "cyan" },
    ],
  },
  {
    id: "fillerNettleRecall",
    name: "VOLLEY MEMORY",
    variant: true,
    entries: [
      { beat: 0, col: 7, color: "cyan" },
      { beat: 6, col: 3, kind: "volley", color: "red" },
      { beat: 11, col: 9, color: "cyan" },
      { beat: 17, col: 5, kind: "meteor", color: null, cross: 1, row: 9 },
      { beat: 23, col: 2, color: "red" },
      { beat: 23, col: 8, color: "red" },
      { beat: 29, col: 0, kind: "volley", color: "cyan" },
      { beat: 35, col: 9, kind: "meteor", color: null, cross: -1, row: 7 },
    ],
  },
  {
    id: "fillerNettleBend",
    name: "VOLLEY TRICK",
    variant: true,
    entries: [
      { beat: 0, col: 0, color: "cyan" },
      { beat: 5, col: 8, kind: "volley", color: "cyan" },
      { beat: 11, col: 2, color: "cyan" },
      { beat: 11, col: 8, color: "cyan" },
      { beat: 17, col: 8, kind: "crystal", color: "cyan" },
      { beat: 22, col: 7, kind: "volley", color: "cyan" },
      { beat: 27, col: 0, color: "red" },
      { beat: 27, col: 10, color: "red" },
      { beat: 33, col: 4, kind: "crystal", color: "red" },
      { beat: 38, col: 2, kind: "volley", color: "cyan" },
      { beat: 43, col: 4, color: "cyan" },
      { beat: 43, col: 7, color: "cyan" },
    ],
  },
  {
    id: "theNettle",
    name: "THE NETTLE",
    guide: {
      both: "A jellyfish over the ship. Its rings say what to do. A hand is your thumb on it. SHOOT, SHIELD or SUCK is the panel, under the ring.",
      p1: "1. Pull, tap, turn or hold the rings on the left, and the shared ones.\n2. Move the cannon under SHOOT or SUCK. Hold SUCK yourself.\n3. When the shield is under SHIELD, press your shield button.",
      p2: "1. Pull, tap, turn or hold the rings on the right, and the shared ones.\n2. Fire when the cannon is under SHOOT.\n3. Move the shield under SHIELD, and say when.",
    },
    entries: [],
    boss: { kind: "nettle", steps: NETTLE_SCRIPT },
    bossType: "normal",
    controls: "standard5",
  },
];
