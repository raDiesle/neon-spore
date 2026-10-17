import { NETTLE_SCRIPT } from "../nettle-script.js";
import type { Wave } from "../wave-types.js";

/**
 * Waves 425 to 434 of the game, in the order they are played: THE VOLLEY's
 * block, the filler before THE NETTLE and the boss THE NETTLE.
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
    name: "VOLLEY AT WORLD END",
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
    name: "VOLLEY ALLIANCE",
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
    name: "OLD VOLLEY SONG",
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
    name: "VOLLEY RAPTURE",
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
    id: "fillerNettleBreathe",
    name: "VOLLEY PICNIC",
    entries: [
      { beat: 0, col: 1, color: "red" },
      { beat: 7, col: 10, kind: "volley", color: "red" },
      { beat: 14, col: 0, color: "cyan" },
      { beat: 22, col: 10, kind: "crystal", color: "red" },
      { beat: 28, col: 7, color: "red" },
      { beat: 34, col: 5, kind: "throb", color: "red" },
    ],
  },
  {
    id: "fillerNettleRecall",
    name: "VOLLEY MEMORY",
    variant: true,
    entries: [
      { beat: 0, col: 7, color: "cyan" },
      { beat: 6, col: 5, kind: "volley", color: "red" },
      { beat: 11, col: 2, color: "red" },
      { beat: 17, col: 4, kind: "shell", color: "cyan" },
      { beat: 22, col: 2, color: "cyan" },
      { beat: 22, col: 8, color: "cyan" },
      { beat: 28, col: 8, kind: "volley", color: "cyan" },
      { beat: 33, col: 2, kind: "shell", color: "red" },
      { beat: 39, col: 0, color: "cyan" },
      { beat: 39, col: 10, color: "cyan" },
    ],
  },
  {
    id: "fillerNettleBend",
    name: "VOLLEY TRICK",
    variant: true,
    entries: [
      { beat: 0, col: 6, color: "cyan" },
      { beat: 5, col: 9, kind: "volley", color: "cyan" },
      { beat: 11, col: 3, color: "cyan" },
      { beat: 11, col: 7, color: "cyan" },
      { beat: 17, col: 4, kind: "crystal", color: "red" },
      { beat: 22, col: 7, kind: "volley", color: "cyan" },
      { beat: 28, col: 1, color: "cyan" },
      { beat: 28, col: 9, color: "cyan" },
      { beat: 34, col: 1, kind: "crystal", color: "red" },
      { beat: 39, col: 10, kind: "volley", color: "cyan" },
      { beat: 47, col: 2, color: "cyan" },
      { beat: 47, col: 8, color: "cyan" },
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
