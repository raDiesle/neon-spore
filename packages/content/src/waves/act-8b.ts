import type { Wave } from "../wave-types.js";

/**
 * The second page of act eight, cut off `act-8.ts` when that page stood four
 * lines under the 250-line ceiling — the seam act seven already uses: an act
 * file is a page and not a chapter, and the order of the waves is the order of
 * the game, so THE WELL and THE HANDOVER, act eight's last two, came over whole
 * with the paragraphs about them.
 *
 * **THE HANDOVER** is act eight's fifth wave and the fifth fault, and the
 * first of them that ends before the wave does (`sim/handover.ts`). Nine beats in, the two
 * panels change screens: the pilot's phone comes up as the navigator's and the
 * navigator's as the pilot's, in the other seat's colours, with the other seat's
 * hidden reads on it. Eight beats later they come home. Nothing is taken away and
 * nothing is added — what moves is whose screen each control is on, which is the
 * fault `ideas.md` called Handover and left unbuilt over one question: whether
 * the radar travels with the controls. It does. It is the same screen.
 *
 * The arrivals are authored around that window rather than through it. Two bodies
 * and a rock go in before the trade, so the pair has its own hands on something
 * first and something to lose; the rock is timed to *land* inside the window, and
 * a rock is the one answer in this game that needs both seats at once — the plate
 * in the column and the dome up on the beat — so it is asked of two people each
 * holding the other's half of it. Two more arrive inside the window with a colour
 * to get right, and the last two after it, because a pair whose hands have just
 * been given back has to find them again.
 *
 * **Its bodies are answered by the band and never by a hand on the glass**, and
 * that is the mechanic putting a constraint on the wave rather than a preference.
 * A grip, a balloon's two pulls and a tap on a box are attributed by the
 * simulation to the player who *sent* them, and the wire's two identities do not
 * trade — only the panel does (`render/handover.ts`). So this is slicks, bulbs
 * and a rock; a crawler or a cairn on it would be a hand the screen says is the
 * other seat's and the ship says is yours.
 *
 * The prose about a wave lives **here, above the array**, and not beside the
 * entry it is about: `tools/director/src/serialize.ts` regenerates everything
 * from `export const WAVES_ACT_8B` down every time somebody saves a wave in the
 * editor, and a comment inside the array is gone the first time they do.
 */
export const WAVES_ACT_8B: Wave[] = [
  {
    id: "theWell",
    name: "THE WELL",
    guide: {
      scene: "theWell",
    },
    entries: [
      { beat: 0, col: 5, color: "red" },
      { beat: 8, col: 7, color: "cyan" },
      { beat: 18, col: 0, color: "cyan" },
      { beat: 26, col: 10, color: "red" },
      { beat: 38, col: 10, color: "cyan" },
      { beat: 46, col: 0, color: "red" },
      { beat: 58, col: 5, color: "cyan" },
    ],
    boss: { kind: "well" },
    bossType: "special",
  },
  {
    id: "theWeight",
    name: "THE WEIGHT",
    guide: {
      scene: "theWeight",
    },
    entries: [
      { beat: 0, col: 5, kind: "weight", color: null },
      { beat: 14, col: 8, kind: "weight", color: null },
      { beat: 18, col: 3, color: "red" },
      { beat: 30, col: 2, kind: "weight", color: null },
      { beat: 32, col: 10, kind: "weight", color: null },
    ],
  },
  {
    id: "theWeightAgain",
    name: "WEIGHTS AGAIN",
    variant: true,
    entries: [
      { beat: 0, col: 10, kind: "weight", color: null },
      { beat: 8, col: 2, kind: "beatbox", color: null, beats: 2 },
      { beat: 14, col: 6, color: "red" },
      { beat: 20, col: 5, kind: "weight", color: null },
      { beat: 26, col: 6, kind: "beatbox", color: null, beats: 2 },
    ],
  },
  {
    id: "theWeightSpread",
    name: "WEIGHTS SPREAD",
    variant: true,
    entries: [
      { beat: 0, col: 8, kind: "weight", color: null },
      { beat: 5, col: 9, kind: "beatbox", color: null, beats: 2 },
      { beat: 11, col: 6, kind: "meteorMedium", color: null },
      { beat: 18, col: 9, kind: "weight", color: null },
      { beat: 25, col: 3, kind: "beatbox", color: null, beats: 2 },
      { beat: 32, col: 10, kind: "meteorMedium", color: null },
    ],
  },
  {
    id: "theWeightReach",
    name: "WEIGHTS FAR APART",
    variant: true,
    entries: [
      { beat: 0, col: 0, kind: "weight", color: null },
      { beat: 6, col: 8, kind: "beatbox", color: null, beats: 4 },
      { beat: 11, col: 3, color: "cyan" },
      { beat: 17, col: 9, kind: "weight", color: null },
      { beat: 23, col: 1, kind: "beatbox", color: null, beats: 3 },
      { beat: 28, col: 7, color: "cyan" },
    ],
  },
  {
    id: "theWeightPair",
    name: "WEIGHT AND BEATBOX",
    variant: true,
    entries: [
      { beat: 0, col: 4, color: "red" },
      { beat: 4, col: 2, kind: "weight", color: null },
      { beat: 9, col: 0, color: "red" },
      { beat: 14, col: 3, kind: "beatbox", color: null, beats: 2 },
      { beat: 19, col: 1, color: "cyan" },
      { beat: 19, col: 9, color: "cyan" },
      { beat: 24, col: 8, kind: "lure", color: "cyan" },
      { beat: 28, col: 3, kind: "weight", color: null },
      { beat: 34, col: 0, color: "red" },
      { beat: 34, col: 10, color: "red" },
      { beat: 38, col: 3, kind: "beatbox", color: null, beats: 3 },
    ],
  },
  {
    id: "theWeightBreathe",
    name: "EASY WEIGHTS",
    variant: true,
    entries: [
      { beat: 0, col: 1, color: "red" },
      { beat: 6, col: 10, kind: "weight", color: null },
      { beat: 13, col: 0, color: "red" },
      { beat: 21, col: 4, kind: "beatbox", color: null, beats: 4 },
      { beat: 27, col: 2, color: "cyan" },
      { beat: 33, col: 9, kind: "wisp", color: null },
    ],
  },
  {
    id: "theWeightRecall",
    name: "WEIGHT RECALL",
    variant: true,
    entries: [
      { beat: 0, col: 8, color: "red" },
      { beat: 5, col: 2, kind: "weight", color: null },
      { beat: 11, col: 0, color: "cyan" },
      { beat: 16, col: 8, kind: "weight", color: null },
      { beat: 21, col: 3, color: "cyan" },
      { beat: 21, col: 7, color: "cyan" },
      { beat: 27, col: 9, kind: "weight", color: null },
      { beat: 33, col: 8, color: "cyan" },
      { beat: 39, col: 7, kind: "weight", color: null },
    ],
  },
  {
    id: "theWeightBend",
    name: "WEIGHTS AND TWINS",
    variant: true,
    entries: [
      { beat: 0, col: 0, color: "red" },
      { beat: 5, col: 9, kind: "weight", color: null },
      { beat: 11, col: 5, color: "cyan" },
      { beat: 11, col: 8, color: "cyan" },
      { beat: 17, col: 7, kind: "beatbox", color: null, beats: 4 },
      { beat: 23, col: 1, kind: "weight", color: null },
      { beat: 28, col: 0, color: "red" },
      { beat: 28, col: 10, color: "red" },
      { beat: 33, col: 0, kind: "beatbox", color: null, beats: 4 },
      { beat: 38, col: 7, kind: "weight", color: null },
      { beat: 44, col: 2, color: "cyan" },
      { beat: 44, col: 8, color: "cyan" },
    ],
  },
  {
    id: "theWeightPeak",
    name: "WEIGHT PEAK",
    variant: true,
    entries: [
      { beat: 0, col: 1, color: "red" },
      { beat: 4, col: 5, kind: "weight", color: null },
      { beat: 7, col: 4, color: "cyan" },
      { beat: 7, col: 7, color: "cyan" },
      { beat: 11, col: 9, kind: "beatbox", color: null, beats: 4 },
      { beat: 19, col: 3, color: "cyan" },
      { beat: 19, col: 7, color: "cyan" },
      { beat: 23, col: 4, kind: "weight", color: null },
      { beat: 26, col: 3, kind: "beatbox", color: null, beats: 4 },
      { beat: 29, col: 5, color: "red" },
      { beat: 29, col: 8, color: "red" },
      { beat: 35, col: 9, kind: "weight", color: null },
      { beat: 38, col: 4, color: "cyan" },
      { beat: 38, col: 7, color: "cyan" },
      { beat: 41, col: 9, kind: "beatbox", color: null, beats: 4 },
      { beat: 48, col: 5, color: "cyan" },
      { beat: 48, col: 8, color: "cyan" },
    ],
    pods: [
      { beat: 15, col: 5, row: 4, kind: "ward" },
      { beat: 32, col: 10, row: 4, kind: "ward" },
      { beat: 44, col: 8, row: 3, kind: "ward" },
    ],
  },
];
