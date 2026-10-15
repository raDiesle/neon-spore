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
    id: "theLeech",
    name: "THE LEECH",
    guide: {
      scene: "theLeech",
    },
    entries: [
      { beat: 0, col: 5, color: "red" },
      { beat: 4, col: 2, color: "cyan" },
      { beat: 18, col: 0, color: "red" },
      { beat: 22, col: 10, color: "cyan" },
      { beat: 28, col: 3, color: "red" },
      { beat: 42, col: 8, color: "cyan" },
      { beat: 48, col: 2, color: "red" },
    ],
    faults: [
      { kind: "leech", at: 8, beats: 12 },
      { kind: "leech", at: 34, beats: 14 },
    ],
  },
  {
    id: "theLeechAgain",
    name: "LEECH AGAIN",
    variant: true,
    entries: [
      { beat: 0, col: 0, kind: "coil", color: null },
      { beat: 7, col: 3, kind: "magnet", color: "cyan" },
      { beat: 14, col: 9, kind: "gyre", color: null },
      { beat: 22, col: 6, kind: "coil", color: null },
      { beat: 29, col: 10, kind: "magnet", color: "red" },
    ],
    faults: [{ kind: "leech", at: 8, beats: 12 }],
  },
  {
    id: "theLeechSpread",
    name: "LEECH WIDE",
    variant: true,
    entries: [
      { beat: 0, col: 9, kind: "coil", color: null },
      { beat: 6, col: 4, kind: "magnet", color: "red" },
      { beat: 12, col: 2, kind: "clasp", color: "red" },
      { beat: 18, col: 7, kind: "coil", color: null },
      { beat: 24, col: 2, kind: "magnet", color: "cyan" },
      { beat: 30, col: 10, kind: "clasp", color: "red" },
    ],
    faults: [{ kind: "leech", at: 8, beats: 12 }],
  },
  {
    id: "theLeechReach",
    name: "LEECH AT THE EDGE",
    variant: true,
    entries: [
      { beat: 0, col: 0, kind: "coil", color: null },
      { beat: 5, col: 5, kind: "magnet", color: "red" },
      { beat: 11, col: 9, kind: "ghost", color: "cyan", path: "across" },
      { beat: 17, col: 0, kind: "coil", color: null },
      { beat: 22, col: 8, kind: "magnet", color: "red" },
      { beat: 27, col: 2, kind: "ghost", color: "cyan", path: "across" },
    ],
    faults: [{ kind: "leech", at: 8, beats: 12 }],
  },
  {
    id: "theLeechPair",
    name: "LEECH IN PAIRS",
    variant: true,
    entries: [
      { beat: 0, col: 1, color: "cyan" },
      { beat: 5, col: 6, kind: "coil", color: null },
      { beat: 9, col: 8, color: "red" },
      { beat: 14, col: 2, kind: "magnet", color: "red" },
      { beat: 19, col: 1, color: "red" },
      { beat: 19, col: 9, color: "red" },
      { beat: 24, col: 9, kind: "shell", color: "red" },
      { beat: 28, col: 2, kind: "coil", color: null },
      { beat: 33, col: 3, color: "red" },
      { beat: 33, col: 7, color: "red" },
      { beat: 39, col: 1, kind: "magnet", color: "red" },
    ],
    faults: [
      { kind: "leech", at: 8, beats: 12 },
      { kind: "leech", at: 34, beats: 14 },
    ],
  },
  {
    id: "theLeechBreathe",
    name: "LEECH AT EASE",
    variant: true,
    entries: [
      { beat: 0, col: 6, color: "red" },
      { beat: 8, col: 10, kind: "coil", color: null },
      { beat: 15, col: 9, color: "cyan" },
      { beat: 23, col: 1, kind: "magnet", color: "red" },
      { beat: 30, col: 7, color: "cyan" },
      { beat: 36, col: 2, kind: "echo", color: "red" },
    ],
    faults: [
      { kind: "leech", at: 8, beats: 12 },
      { kind: "leech", at: 34, beats: 14 },
    ],
  },
  {
    id: "theLeechRecall",
    name: "LEECH RECALLED",
    variant: true,
    entries: [
      { beat: 0, col: 4, color: "cyan" },
      { beat: 5, col: 5, kind: "coil", color: null },
      { beat: 11, col: 9, color: "cyan" },
      { beat: 16, col: 2, kind: "throb", color: "red" },
      { beat: 22, col: 4, color: "red" },
      { beat: 22, col: 7, color: "red" },
      { beat: 27, col: 5, kind: "coil", color: null },
      { beat: 33, col: 3, kind: "throb", color: "red" },
      { beat: 38, col: 5, color: "red" },
      { beat: 38, col: 8, color: "red" },
    ],
    faults: [
      { kind: "leech", at: 8, beats: 12 },
      { kind: "leech", at: 34, beats: 14 },
    ],
  },
  {
    id: "theLeechBend",
    name: "LEECH TWICE",
    variant: true,
    entries: [
      { beat: 0, col: 8, color: "red" },
      { beat: 6, col: 3, kind: "coil", color: null },
      { beat: 12, col: 0, color: "red" },
      { beat: 12, col: 10, color: "red" },
      { beat: 18, col: 7, kind: "magnet", color: "red" },
      { beat: 24, col: 8, kind: "coil", color: null },
      { beat: 30, col: 3, color: "cyan" },
      { beat: 30, col: 7, color: "cyan" },
      { beat: 35, col: 6, kind: "magnet", color: "red" },
      { beat: 40, col: 7, kind: "coil", color: null },
      { beat: 46, col: 0, color: "cyan" },
      { beat: 46, col: 10, color: "cyan" },
    ],
    faults: [
      { kind: "leech", at: 8, beats: 12 },
      { kind: "leech", at: 34, beats: 14 },
    ],
  },
  {
    id: "theLeechPeak",
    name: "LEECH PEAK",
    variant: true,
    entries: [
      { beat: 0, col: 0, color: "cyan" },
      { beat: 3, col: 5, kind: "coil", color: null },
      { beat: 7, col: 2, color: "cyan" },
      { beat: 7, col: 8, color: "cyan" },
      { beat: 11, col: 1, kind: "magnet", color: "red" },
      { beat: 15, col: 0, kind: "countdown", color: "cyan" },
      { beat: 19, col: 4, color: "red" },
      { beat: 19, col: 7, color: "red" },
      { beat: 23, col: 8, kind: "coil", color: null },
      { beat: 27, col: 7, kind: "magnet", color: "cyan" },
      { beat: 31, col: 4, color: "cyan" },
      { beat: 31, col: 7, color: "cyan" },
      { beat: 35, col: 1, kind: "countdown", color: "red" },
      { beat: 39, col: 3, kind: "coil", color: null },
      { beat: 43, col: 0, color: "red" },
      { beat: 43, col: 10, color: "red" },
      { beat: 47, col: 4, kind: "magnet", color: "cyan" },
    ],
    faults: [
      { kind: "leech", at: 8, beats: 12 },
      { kind: "leech", at: 34, beats: 14 },
    ],
  },
];
