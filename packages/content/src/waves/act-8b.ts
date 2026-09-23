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
    sentence: "The one where the column beside it is the other end of the field.",
    guide: {
      both: "One field, a clock on one screen and rows on the other. Columns are hours, and the cannon is the hand. Only Player 2 sees the warning strip.",
      p1: "1. Your clock has no warning marks. Every arrival shows on your partner's strip alone.\n2. Near the rim, four beats cover a third of a tile. The last beat, as much again.\n3. Eleven and one are your rail's two ends.",
      p2: "1. Only you see the strip. Say what comes, and its column, early.\n2. Your partner hears a number as an hour.\n3. Your rows sit evenly. Theirs crowd at the rim, so say how soon.\n4. Your shield is dead this wave.",
      scene: "theWell",
    },
    entries: [
      { beat: 0, col: 3, color: "red" },
      { beat: 8, col: 4, color: "cyan" },
      { beat: 18, col: 0, color: "cyan" },
      { beat: 26, col: 6, color: "red" },
      { beat: 38, col: 6, color: "cyan" },
      { beat: 46, col: 0, color: "red" },
      { beat: 58, col: 3, color: "cyan" },
    ],
    boss: { kind: "well" },
    bossType: "special",
  },
  {
    id: "theHandover",
    name: "THE HANDOVER",
    sentence: "The one where your thumb lands on their button.",
    guide: {
      both: "Nine beats in, your panels swap screens. Every button works, but none is the one you know. The band counts down to it, then eight beats back.",
      p1: "1. Before the swap, the cannon and the trigger are yours.\n2. After it, you hold the shield and the two colours.\n3. Say where the cannon was going while the strip is still yours.",
      p2: "1. Before the swap, the shield and the two colours are yours.\n2. After it, you hold the cannon and the trigger.\n3. You have never fired the dome. Let your partner call the beat and the column.",
      scene: "theHandover",
    },
    entries: [
      { beat: 0, col: 3, color: "red" },
      { beat: 2, col: 5, kind: "meteor", color: null },
      { beat: 6, col: 1, color: "cyan" },
      { beat: 10, col: 4, color: "red" },
      { beat: 12, col: 2, color: "cyan" },
      { beat: 18, col: 6, color: "red" },
      { beat: 24, col: 0, color: "cyan" },
    ],
    faults: [{ kind: "handover", at: 9, beats: 8 }],
  },
];
