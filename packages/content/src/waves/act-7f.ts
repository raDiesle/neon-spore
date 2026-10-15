import { GORGE_LEVELS } from "../gorge-levels.js";
import type { Wave } from "../wave-types.js";

/**
 * The sixth page of act seven, cut off `act-7e.ts` on 19 September 2026, when
 * that page sat eight lines under the ceiling with six §6.1/§6.2 guide-line
 * lanes still queued against it: a guide line is the one thing in a wave file
 * that gets longer when it gets truer, so the next of those lanes to land
 * would have paid for the seam rather than asked for it (`docs/queue.md`).
 *
 * **It took the letter `e` on 19 September 2026 and the page ahead of it
 * became `act-7f.ts`**, rather than appending after it, because THE TASTER
 * and THE SINEW were that page's own last two waves at the time and the order
 * of the waves is the order of the game: that page (THE LEDGER onward)
 * already came *after* them in that order, so a page appended past it would
 * have played them seven waves later than the game has always played them.
 *
 * **It moved again on 20 September 2026**, to `act-7f.ts`, when `act-7c.ts`
 * hit the same shape of overflow: `act-7c.ts`'s own last two waves, THE
 * BATON among them, needed a page of their own between it and this one,
 * so this page and every page after it shifted up a letter, the way
 * `docs/queue.md`'s *Act seven has no room* entry names as the standing
 * convention for exactly this shape of overflow.
 *
 * **THE TASTER's arrivals are the colours it is counting.** The fan reads what
 * the pair has fired over the last thirty beats, so every body under it costs
 * a shot in a colour the boss will then grow armour in — which makes this the
 * one wave where a body answered *without* firing is worth something. Rocks
 * for the shield, and three slicks and three bulbs, evenly split and
 * alternating, so the lean is a decision the pair makes rather than one the
 * wave makes for them. Nothing is placed against the fan's own count: which
 * beat a blade sets its edge on depends on when the pair sheared the last
 * one, a beat nobody can know at authoring time.
 *
 * **THE SINEW's wave authors nothing, for now** (the owner, 5 October 2026:
 * *for the time being remove other enemies from this wave*): the tendon
 * alone, and the rocks its own snap-backs shed.
 */
export const WAVES_ACT_7F: Wave[] = [
  {
    id: "theGorge",
    name: "THE GORGE",
    guide: {
      scene: "theGorge",
    },
    entries: [
      { beat: 20, col: 2, kind: "meteor", color: null },
      { beat: 28, col: 8, kind: "meteor", color: null },
      { beat: 34, col: 5, color: "red" },
      { beat: 40, col: 0, color: "cyan" },
      { beat: 46, col: 10, kind: "meteor", color: null },
      { beat: 52, col: 5, color: "cyan" },
      { beat: 60, col: 3, kind: "meteor", color: null },
      { beat: 66, col: 7, color: "red" },
      { beat: 74, col: 5, kind: "meteor", color: null },
      { beat: 82, col: 2, color: "cyan" },
    ],
    boss: { kind: "gorge", levels: GORGE_LEVELS },
    bossType: "normal",
  },
  {
    id: "theCrystal",
    name: "THE CRYSTAL",
    guide: {
      scene: "theCrystal",
    },
    entries: [
      { beat: 0, col: 0, kind: "crystal", color: "red" },
      { beat: 20, col: 10, kind: "crystal", color: "cyan" },
      { beat: 40, col: 2, kind: "crystal", color: "cyan" },
      { beat: 46, col: 8, kind: "crystal", color: "red" },
    ],
  },
  {
    id: "theCrystalAgain",
    name: "CRYSTALS AGAIN",
    variant: true,
    entries: [
      { beat: 0, col: 0, kind: "crystal", color: "cyan" },
      { beat: 6, col: 7, kind: "crystal", color: "red" },
      { beat: 14, col: 1, kind: "crystal", color: "cyan" },
      { beat: 20, col: 5, kind: "crystal", color: "cyan" },
      { beat: 28, col: 10, kind: "crystal", color: "red" },
    ],
  },
  {
    id: "theCrystalSpread",
    name: "CRYSTALS SPREAD",
    variant: true,
    entries: [
      { beat: 0, col: 8, kind: "crystal", color: "red" },
      { beat: 6, col: 7, kind: "carom", color: "cyan" },
      { beat: 13, col: 8, kind: "crystal", color: "cyan" },
      { beat: 19, col: 7, kind: "carom", color: "red" },
      { beat: 25, col: 8, kind: "crystal", color: "cyan" },
      { beat: 32, col: 3, kind: "carom", color: "cyan" },
    ],
  },
  {
    id: "theCrystalReach",
    name: "CRYSTALS FAR APART",
    variant: true,
    entries: [
      { beat: 0, col: 10, kind: "crystal", color: "red" },
      { beat: 5, col: 2, kind: "carom", color: "cyan" },
      { beat: 11, col: 9, color: "red" },
      { beat: 17, col: 5, kind: "crystal", color: "red" },
      { beat: 22, col: 1, kind: "carom", color: "red" },
      { beat: 27, col: 5, color: "red" },
    ],
  },
  {
    id: "theCrystalPair",
    name: "CRYSTAL AND CAROM",
    variant: true,
    entries: [
      { beat: 0, col: 6, color: "cyan" },
      { beat: 5, col: 4, kind: "crystal", color: "cyan" },
      { beat: 9, col: 0, color: "red" },
      { beat: 13, col: 10, kind: "carom", color: "cyan" },
      { beat: 19, col: 1, color: "red" },
      { beat: 25, col: 6, kind: "wisp", color: null },
      { beat: 31, col: 3, color: "cyan" },
      { beat: 37, col: 7, kind: "crystal", color: "cyan" },
    ],
  },
  {
    id: "theCrystalBreathe",
    name: "EASY CRYSTALS",
    variant: true,
    entries: [
      { beat: 0, col: 7, color: "red" },
      { beat: 8, col: 0, kind: "crystal", color: "cyan" },
      { beat: 15, col: 6, color: "red" },
      { beat: 22, col: 0, kind: "carom", color: "red" },
      { beat: 28, col: 4, color: "red" },
      { beat: 36, col: 1, kind: "echo", color: "cyan" },
    ],
  },
  {
    id: "theCrystalRecall",
    name: "CRYSTAL RECALL",
    variant: true,
    entries: [
      { beat: 0, col: 4, color: "cyan" },
      { beat: 5, col: 2, kind: "crystal", color: "red" },
      { beat: 11, col: 8, color: "red" },
      { beat: 17, col: 2, kind: "shell", color: "cyan" },
      { beat: 23, col: 10, color: "cyan" },
      { beat: 28, col: 1, kind: "crystal", color: "cyan" },
      { beat: 33, col: 5, color: "cyan" },
      { beat: 39, col: 6, kind: "shell", color: "cyan" },
    ],
  },
  {
    id: "theCrystalBend",
    name: "CRYSTALS AND TWINS",
    variant: true,
    entries: [
      { beat: 0, col: 4, color: "red" },
      { beat: 5, col: 5, kind: "crystal", color: "cyan" },
      { beat: 11, col: 0, color: "red" },
      { beat: 16, col: 1, kind: "carom", color: "cyan" },
      { beat: 22, col: 3, color: "red" },
      { beat: 22, col: 6, color: "red" },
      { beat: 27, col: 4, kind: "crystal", color: "red" },
      { beat: 32, col: 10, kind: "carom", color: "cyan" },
      { beat: 38, col: 3, color: "cyan" },
      { beat: 38, col: 6, color: "cyan" },
      { beat: 44, col: 3, kind: "crystal", color: "cyan" },
    ],
  },
  {
    id: "theCrystalPeak",
    name: "CRYSTAL PEAK",
    variant: true,
    entries: [
      { beat: 0, col: 8, color: "cyan" },
      { beat: 3, col: 0, kind: "crystal", color: "cyan" },
      { beat: 6, col: 5, color: "red" },
      { beat: 10, col: 4, kind: "carom", color: "cyan" },
      { beat: 14, col: 1, color: "red" },
      { beat: 14, col: 9, color: "red" },
      { beat: 21, col: 2, kind: "crystal", color: "red" },
      { beat: 25, col: 3, color: "cyan" },
      { beat: 25, col: 7, color: "cyan" },
      { beat: 29, col: 8, kind: "carom", color: "red" },
      { beat: 36, col: 4, color: "red" },
      { beat: 36, col: 7, color: "red" },
      { beat: 40, col: 2, kind: "crystal", color: "cyan" },
      { beat: 44, col: 4, kind: "carom", color: "cyan" },
      { beat: 48, col: 5, color: "cyan" },
    ],
    pods: [
      { beat: 18, col: 5, row: 3, kind: "purge" },
      { beat: 32, col: 0, row: 3, kind: "purge" },
    ],
  },
  {
    id: "theCurtain",
    name: "THE CURTAIN",
    guide: {
      scene: "theCurtain",
    },
    entries: [],
    boss: { kind: "curtain" },
    bossType: "normal",
  },
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
    name: "VOLLEYS AGAIN",
    variant: true,
    entries: [
      { beat: 0, col: 2, kind: "volley", color: "red" },
      { beat: 6, col: 6, kind: "volley", color: "red" },
      { beat: 14, col: 2, kind: "volley", color: "red" },
      { beat: 21, col: 10, kind: "volley", color: "red" },
      { beat: 28, col: 6, kind: "volley", color: "cyan" },
    ],
  },
];
