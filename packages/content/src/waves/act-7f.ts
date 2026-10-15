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
  {
    id: "theVolleySpread",
    name: "VOLLEYS SPREAD",
    variant: true,
    entries: [
      { beat: 0, col: 6, kind: "volley", color: "red" },
      { beat: 7, col: 8, kind: "crystal", color: "cyan" },
      { beat: 13, col: 4, kind: "volley", color: "cyan" },
      { beat: 18, col: 3, kind: "crystal", color: "red" },
      { beat: 25, col: 5, kind: "volley", color: "cyan" },
      { beat: 32, col: 6, kind: "crystal", color: "cyan" },
    ],
  },
  {
    id: "theVolleyReach",
    name: "VOLLEYS FAR APART",
    variant: true,
    entries: [
      { beat: 0, col: 9, kind: "volley", color: "red" },
      { beat: 5, col: 3, kind: "crystal", color: "cyan" },
      { beat: 11, col: 7, kind: "wisp", color: null },
      { beat: 16, col: 3, kind: "volley", color: "cyan" },
      { beat: 22, col: 8, kind: "crystal", color: "cyan" },
      { beat: 28, col: 3, kind: "wisp", color: null },
    ],
  },
  {
    id: "theVolleyPair",
    name: "VOLLEY AND CRYSTAL",
    variant: true,
    entries: [
      { beat: 0, col: 0, color: "red" },
      { beat: 6, col: 1, kind: "volley", color: "red" },
      { beat: 10, col: 5, color: "cyan" },
      { beat: 15, col: 0, kind: "crystal", color: "red" },
      { beat: 21, col: 10, color: "cyan" },
      { beat: 26, col: 0, kind: "veil", color: null },
      { beat: 30, col: 3, color: "cyan" },
      { beat: 34, col: 0, kind: "volley", color: "red" },
    ],
  },
  {
    id: "theVolleyBreathe",
    name: "EASY VOLLEYS",
    variant: true,
    entries: [
      { beat: 0, col: 2, color: "cyan" },
      { beat: 7, col: 0, kind: "volley", color: "red" },
      { beat: 14, col: 10, color: "red" },
      { beat: 21, col: 5, kind: "crystal", color: "red" },
      { beat: 29, col: 2, color: "red" },
      { beat: 35, col: 9, kind: "clasp", color: "cyan" },
    ],
  },
  {
    id: "theVolleyRecall",
    name: "VOLLEY RECALL",
    variant: true,
    entries: [
      { beat: 0, col: 0, color: "cyan" },
      { beat: 6, col: 4, kind: "volley", color: "red" },
      { beat: 12, col: 9, color: "red" },
      { beat: 17, col: 0, kind: "clasp", color: "red" },
      { beat: 23, col: 9, color: "red" },
      { beat: 29, col: 4, kind: "volley", color: "cyan" },
      { beat: 35, col: 3, color: "cyan" },
    ],
  },
  {
    id: "theVolleyBend",
    name: "VOLLEYS AND TWINS",
    variant: true,
    entries: [
      { beat: 0, col: 2, color: "red" },
      { beat: 6, col: 6, kind: "volley", color: "red" },
      { beat: 11, col: 3, color: "cyan" },
      { beat: 16, col: 1, kind: "crystal", color: "cyan" },
      { beat: 21, col: 3, color: "cyan" },
      { beat: 21, col: 6, color: "cyan" },
      { beat: 26, col: 8, kind: "volley", color: "cyan" },
      { beat: 32, col: 3, kind: "crystal", color: "cyan" },
      { beat: 38, col: 0, color: "cyan" },
      { beat: 38, col: 10, color: "cyan" },
      { beat: 43, col: 6, kind: "volley", color: "red" },
      { beat: 48, col: 7, kind: "crystal", color: "red" },
    ],
  },
  {
    id: "theVolleyPeak",
    name: "VOLLEY PEAK",
    variant: true,
    entries: [
      { beat: 0, col: 8, color: "cyan" },
      { beat: 3, col: 2, kind: "volley", color: "red" },
      { beat: 6, col: 1, color: "red" },
      { beat: 10, col: 2, kind: "crystal", color: "cyan" },
      { beat: 13, col: 3, color: "red" },
      { beat: 13, col: 7, color: "red" },
      { beat: 20, col: 2, kind: "volley", color: "cyan" },
      { beat: 24, col: 3, color: "red" },
      { beat: 24, col: 7, color: "red" },
      { beat: 28, col: 5, kind: "crystal", color: "cyan" },
      { beat: 35, col: 3, color: "red" },
      { beat: 35, col: 6, color: "red" },
      { beat: 38, col: 8, kind: "volley", color: "cyan" },
      { beat: 42, col: 5, kind: "crystal", color: "red" },
      { beat: 46, col: 3, color: "red" },
    ],
    pods: [
      { beat: 17, col: 5, row: 3, kind: "purge" },
      { beat: 32, col: 2, row: 3, kind: "purge" },
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
    id: "theVeer",
    name: "THE VEER",
    guide: {
      scene: "theVeer",
    },
    entries: [
      { beat: 0, col: 5, kind: "veer", color: null },
      { beat: 18, col: 8, kind: "veer", color: null },
      { beat: 34, col: 3, kind: "veer", color: null },
      { beat: 38, col: 10, kind: "veer", color: null },
    ],
  },
  {
    id: "theVeerAgain",
    name: "VEERS AGAIN",
    variant: true,
    entries: [
      { beat: 0, col: 10, kind: "veer", color: null },
      { beat: 6, col: 9, kind: "veer", color: null },
      { beat: 13, col: 2, kind: "veer", color: null },
      { beat: 19, col: 7, kind: "veer", color: null },
      { beat: 26, col: 10, kind: "veer", color: null },
      { beat: 32, col: 1, kind: "veer", color: null },
    ],
  },
];
