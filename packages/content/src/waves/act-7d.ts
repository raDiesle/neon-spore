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
    id: "theGyre",
    name: "THE GYRE",
    guide: {
      scene: "theGyre",
    },
    entries: [{ beat: 0, col: 5, kind: "gyre", color: null }],
  },
  {
    id: "theGyreAgain",
    name: "GYRES AGAIN",
    variant: true,
    entries: [
      { beat: 0, col: 8, kind: "gyre", color: null },
      { beat: 6, col: 1, kind: "gyre", color: null },
      { beat: 12, col: 5, kind: "gyre", color: null },
      { beat: 20, col: 8, kind: "gyre", color: null },
      { beat: 28, col: 3, kind: "gyre", color: null },
    ],
  },
  {
    id: "theGyreSpread",
    name: "GYRES SPREAD",
    variant: true,
    entries: [
      { beat: 0, col: 0, kind: "gyre", color: null },
      { beat: 5, col: 3, color: "cyan" },
      { beat: 11, col: 0, kind: "gyre", color: null },
      { beat: 17, col: 7, color: "cyan" },
      { beat: 24, col: 9, kind: "gyre", color: null },
      { beat: 30, col: 5, color: "cyan" },
    ],
  },
  {
    id: "theGyreReach",
    name: "GYRES FAR APART",
    variant: true,
    entries: [
      { beat: 0, col: 10, kind: "gyre", color: null },
      { beat: 5, col: 5, kind: "rind", color: "red" },
      { beat: 11, col: 10, kind: "meteorMedium", color: null },
      { beat: 16, col: 6, kind: "gyre", color: null },
      { beat: 22, col: 2, kind: "rind", color: "cyan" },
      { beat: 28, col: 7, kind: "meteorMedium", color: null },
    ],
  },
  {
    id: "theGyrePair",
    name: "GYRE AND RIND",
    variant: true,
    entries: [
      { beat: 0, col: 7, color: "red" },
      { beat: 6, col: 4, kind: "gyre", color: null },
      { beat: 11, col: 0, color: "red" },
      { beat: 16, col: 10, kind: "rind", color: "red" },
      { beat: 20, col: 3, color: "cyan" },
      { beat: 26, col: 7, kind: "gyre", color: null },
      { beat: 31, col: 8, color: "red" },
      { beat: 36, col: 10, kind: "rind", color: "cyan" },
    ],
  },
  {
    id: "theGyreBreathe",
    name: "EASY GYRES",
    variant: true,
    entries: [
      { beat: 0, col: 2, color: "cyan" },
      { beat: 7, col: 7, kind: "gyre", color: null },
      { beat: 14, col: 4, color: "red" },
      { beat: 22, col: 1, kind: "rind", color: "red" },
      { beat: 29, col: 8, color: "red" },
      { beat: 35, col: 3, kind: "gyre", color: null },
    ],
  },
  {
    id: "theGyreRecall",
    name: "GYRE RECALL",
    variant: true,
    entries: [
      { beat: 0, col: 6, color: "red" },
      { beat: 5, col: 10, kind: "gyre", color: null },
      { beat: 10, col: 1, color: "cyan" },
      { beat: 15, col: 8, kind: "torch", color: null },
      { beat: 21, col: 3, color: "red" },
      { beat: 26, col: 8, kind: "gyre", color: null },
      { beat: 32, col: 7, color: "red" },
      { beat: 38, col: 1, kind: "torch", color: null },
    ],
  },
  {
    id: "theGyreBend",
    name: "GYRES AND TWINS",
    variant: true,
    entries: [
      { beat: 0, col: 9, color: "cyan" },
      { beat: 5, col: 0, kind: "gyre", color: null },
      { beat: 10, col: 6, color: "cyan" },
      { beat: 15, col: 2, kind: "rind", color: "red" },
      { beat: 21, col: 2, color: "red" },
      { beat: 21, col: 8, color: "red" },
      { beat: 27, col: 9, kind: "gyre", color: null },
      { beat: 33, col: 7, kind: "rind", color: "red" },
      { beat: 38, col: 1, color: "cyan" },
      { beat: 38, col: 9, color: "cyan" },
      { beat: 43, col: 8, kind: "gyre", color: null },
    ],
  },
  {
    id: "theGyrePeak",
    name: "GYRE PEAK",
    variant: true,
    entries: [
      { beat: 0, col: 1, color: "cyan" },
      { beat: 4, col: 9, kind: "gyre", color: null },
      { beat: 8, col: 2, color: "cyan" },
      { beat: 12, col: 6, kind: "rind", color: "red" },
      { beat: 16, col: 0, color: "red" },
      { beat: 16, col: 10, color: "red" },
      { beat: 20, col: 7, kind: "meteorMedium", color: null },
      { beat: 24, col: 4, kind: "gyre", color: null },
      { beat: 28, col: 3, color: "red" },
      { beat: 28, col: 7, color: "red" },
      { beat: 32, col: 4, kind: "rind", color: "cyan" },
      { beat: 36, col: 7, kind: "meteorMedium", color: null },
      { beat: 40, col: 0, color: "cyan" },
      { beat: 40, col: 10, color: "cyan" },
      { beat: 44, col: 9, kind: "gyre", color: null },
      { beat: 48, col: 2, kind: "rind", color: "cyan" },
    ],
  },
];
