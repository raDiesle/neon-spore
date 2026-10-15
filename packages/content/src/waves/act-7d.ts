import { PULSE_STAGES } from "../pulse-stages.js";
import type { Wave } from "../wave-types.js";

/**
 * The fourth page of act seven, cut off `act-7c.ts` on 20 September 2026,
 * when that page held eight waves at 241 of 250 lines with no room for a
 * ninth and no letter of its own to give one: `act-7c.ts` is not the last
 * page of act seven, so the overflow could not simply take the next free
 * letter without playing every later wave out of order. Every page from `7d`
 * on shifted up one letter instead — the standing convention
 * `docs/queue.md`'s *Act seven has no room* entry settled, the same move
 * `act-7e.ts` (as `act-7d.ts`, the day before) made for THE TASTER and THE
 * SINEW.
 *
 * **`7d` and not `9`, for the reason `act-7c.ts` gives about `7c`**: an act
 * file is a page and not a chapter, and the order of the waves is the order
 * of the game.
 *
 * **THE BATON has no entries** (the owner, 6 October 2026: *remove every
 * other enemy from the wave*). The rocks and creatures that stood on it gave
 * the gunner something else to shoot while the bead sat; the arm is the whole
 * fight now, and its own shed shells are the only rocks.
 */
export const WAVES_ACT_7D: Wave[] = [
  {
    id: "pulse",
    name: "THE PULSE",
    guide: {
      scene: "thePulse",
    },
    entries: [],
    boss: { kind: "pulse", stages: PULSE_STAGES },
    bossType: "special",
    controls: "pulse",
  },
  {
    id: "theLid",
    name: "THE LID",
    guide: {
      scene: "theLid",
    },
    entries: [
      { beat: 0, col: 5, kind: "lid", color: "cyan" },
      { beat: 14, col: 2, kind: "lid", color: "red" },
      { beat: 24, col: 8, kind: "lid", color: "red" },
    ],
  },
  {
    id: "theLidAgain",
    name: "LIDS AGAIN",
    variant: true,
    entries: [
      { beat: 0, col: 2, kind: "lid", color: "red" },
      { beat: 6, col: 4, kind: "lid", color: "cyan" },
      { beat: 12, col: 5, kind: "lid", color: "red" },
      { beat: 20, col: 1, kind: "lid", color: "red" },
      { beat: 27, col: 8, kind: "lid", color: "cyan" },
    ],
  },
  {
    id: "theLidSpread",
    name: "LIDS SPREAD",
    variant: true,
    entries: [
      { beat: 0, col: 1, kind: "lid", color: "cyan" },
      { beat: 7, col: 3, color: "cyan" },
      { beat: 13, col: 1, kind: "lid", color: "red" },
      { beat: 18, col: 6, color: "cyan" },
      { beat: 24, col: 3, kind: "lid", color: "red" },
      { beat: 31, col: 10, color: "cyan" },
    ],
  },
  {
    id: "theLidReach",
    name: "LIDS FAR APART",
    variant: true,
    entries: [
      { beat: 0, col: 1, kind: "lid", color: "red" },
      { beat: 6, col: 5, kind: "gyre", color: null },
      { beat: 12, col: 1, color: "red" },
      { beat: 17, col: 5, kind: "lid", color: "red" },
      { beat: 22, col: 1, kind: "gyre", color: null },
      { beat: 27, col: 7, color: "red" },
    ],
  },
  {
    id: "theLidPair",
    name: "LID AND GYRE",
    variant: true,
    entries: [
      { beat: 0, col: 10, color: "red" },
      { beat: 5, col: 0, kind: "lid", color: "cyan" },
      { beat: 9, col: 7, color: "red" },
      { beat: 14, col: 8, kind: "gyre", color: null },
      { beat: 19, col: 9, color: "cyan" },
      { beat: 24, col: 4, kind: "clasp", color: "red" },
      { beat: 29, col: 7, color: "cyan" },
      { beat: 34, col: 1, kind: "lid", color: "cyan" },
    ],
  },
  {
    id: "theLidBreathe",
    name: "EASY LIDS",
    variant: true,
    entries: [
      { beat: 0, col: 6, color: "cyan" },
      { beat: 8, col: 2, kind: "lid", color: "cyan" },
      { beat: 14, col: 10, color: "red" },
      { beat: 22, col: 3, kind: "gyre", color: null },
      { beat: 28, col: 7, color: "red" },
      { beat: 34, col: 6, kind: "lid", color: "red" },
      { beat: 40, col: 7, color: "red" },
    ],
  },
  {
    id: "theLidRecall",
    name: "LID RECALL",
    variant: true,
    entries: [
      { beat: 0, col: 9, color: "cyan" },
      { beat: 6, col: 2, kind: "lid", color: "red" },
      { beat: 12, col: 9, color: "cyan" },
      { beat: 17, col: 1, kind: "meteor", color: null },
      { beat: 23, col: 10, color: "red" },
      { beat: 28, col: 3, kind: "lid", color: "red" },
      { beat: 33, col: 2, color: "red" },
      { beat: 39, col: 0, kind: "meteor", color: null },
    ],
  },
  {
    id: "theLidBend",
    name: "LIDS AND TWINS",
    variant: true,
    entries: [
      { beat: 0, col: 2, color: "cyan" },
      { beat: 6, col: 7, kind: "lid", color: "cyan" },
      { beat: 12, col: 2, color: "cyan" },
      { beat: 17, col: 4, kind: "gyre", color: null },
      { beat: 22, col: 1, color: "cyan" },
      { beat: 22, col: 9, color: "cyan" },
      { beat: 28, col: 5, kind: "lid", color: "red" },
      { beat: 33, col: 1, kind: "gyre", color: null },
      { beat: 38, col: 1, color: "red" },
      { beat: 38, col: 9, color: "red" },
      { beat: 44, col: 6, kind: "lid", color: "red" },
    ],
  },
  {
    id: "theLidPeak",
    name: "LID PEAK",
    variant: true,
    entries: [
      { beat: 0, col: 4, color: "cyan" },
      { beat: 4, col: 8, kind: "lid", color: "cyan" },
      { beat: 8, col: 5, color: "red" },
      { beat: 12, col: 1, kind: "gyre", color: null },
      { beat: 16, col: 0, color: "cyan" },
      { beat: 16, col: 10, color: "cyan" },
      { beat: 20, col: 7, kind: "meteor", color: null },
      { beat: 24, col: 6, kind: "lid", color: "red" },
      { beat: 28, col: 2, color: "cyan" },
      { beat: 28, col: 8, color: "cyan" },
      { beat: 32, col: 0, kind: "gyre", color: null },
      { beat: 36, col: 10, kind: "meteor", color: null },
      { beat: 40, col: 3, color: "red" },
      { beat: 40, col: 6, color: "red" },
      { beat: 44, col: 7, kind: "lid", color: "red" },
      { beat: 48, col: 5, kind: "gyre", color: null },
    ],
  },
];
