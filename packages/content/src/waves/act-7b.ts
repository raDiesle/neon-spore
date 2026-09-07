import type { Wave } from "../wave-types.js";

/**
 * The second half of act seven, cut off `act-7.ts` when THE COIL was split
 * into two waves and that file reached the 250-line ceiling. Three waves now:
 * the fault at length, the panel that replaces the gun, and the rock that
 * takes THE COIL's flight with nothing on it.
 *
 * **`7b` and not `8`, because the order of the waves is the order of the
 * game** — the rule `act-3b.ts` already states, arrived at the same way. An
 * act file is a page rather than a chapter, so this one is spread after act
 * seven in `waves.ts`, and a name that sorted elsewhere would say the opposite
 * of where it stands.
 *
 * The seam is a real one for once rather than a page break. Everything in
 * `act-7.ts` is played on a panel the pair already knows, and neither of these
 * is.
 *
 * 1. **THE TWITCH** is THE COIL at length, and it carries **no guide**. The
 *    fault and the creature arrive together on THE COIL — the shield is stuck
 *    open there too, because a coil a pair can simply decline to ward is not a
 *    creature — so there is nothing here the wave before it has not already
 *    taught, and a second introduction of one idea is the defect the rule in
 *    `packages/content/test/waves.test.ts` exists to catch.
 *
 *    What it is instead is the same field with no beginner's room in it: four
 *    figures against THE COIL's four, more coils at once, and a chain long
 *    enough that the order player 1 calls is the whole wave. Player 1 is not a
 *    spectator for it: the bolt jumping from one failed dome to the next is
 *    drawn on his screen alone, so which column will be dangerous next is a
 *    thing only he can say.
 *
 *    1. Beat 0, a rock alone, so the first thing they meet is the fault being
 *       plainly *useful* — it wards for free, and nothing is standing over it.
 *    2. Beat 10, one coil on its own. Whenever the plate happens to be in its
 *       column the dome goes, on a beat nobody chose, and the rock it leaves
 *       is at the far wall. One body, one bolt with nowhere to go, and the
 *       whole wave in miniature.
 *    3. Beats 26–30, three coils at once, entering a wall apart. Now the bolt
 *       has somewhere to go: the first dome to fail throws the charge at one
 *       of the other two, and the pilot is the only one who can see which — so
 *       this is the first time the navigator has to be *told* a column rather
 *       than choosing one.
 *    4. Beats 48–54, four of them and a rock at the end. There is no route
 *       across the field that does not open one, so the order the plate
 *       crosses them in is the only thing left to choose — and the rock says
 *       whether the route was worth it.
 *
 * 2. **THE CLAW** is the end of the same line, and the only wave in the act
 *    that is a **panel** rather than a rule. The two faults take a control
 *    away from a seat and hand it to the wave; this takes the gun away from
 *    player 1 and gives him a hand, moves the mouth to player 2, and shows the
 *    power-ups to her alone. Its one-sentence test is the one where the gun is
 *    a hand and the hand cannot see what it is reaching for, and everything
 *    else follows: the arm is committed once it leaves, so a sentence has to
 *    be finished before it does, and the power-ups cross sideways, so the
 *    column she names is not the column it will be in
 *    (`docs/spec/controls.md`).
 *
 * 3. **THE CROSSING** is a rock on THE COIL's flight with nothing on it, and
 *    it is here rather than beside its relatives for one reason: it needs the
 *    coil to have been seen. A pair who has watched a dome cross the field and
 *    sink two rows at every wall already knows this movement — what they have
 *    never met is that movement on a body there is *nothing to open*, so the
 *    plate is the whole answer and it has to be somewhere before the rock is.
 *
 *    The rule the wave is built on is one line of arithmetic: it only sinks
 *    when it turns and it only turns at a wall, so **it always reaches the
 *    hull standing on an edge** — never anywhere between. Which of the two
 *    edges follows from the row it came in on and nothing else, and working
 *    that out is a whole crossing's worth of talking with nothing else to do.
 *
 *    1. Beat 0, one alone from the left at row 10: four crossings and it is
 *       down, which is short enough to be watched from start to finish.
 *    2. Beat 16, one from the right at row 8, and beat 24, one from the left
 *       at row 7 — overlapping on purpose. Two answers wanted at once and one
 *       plate to give them, so the order is the choice and the edges are far
 *       enough apart that it costs something.
 *
 *    It is played on the ordinary panel, so it reads as a wave of the act
 *    rather than as a sequel to THE CLAW standing in front of it.
 *
 * The prose about a wave lives **here, above the array**, and not beside the
 * entry it is about: `tools/director/src/serialize.ts` regenerates everything
 * from `export const WAVES_ACT_7B` down every time somebody saves a wave in
 * the editor, and a comment inside the array is gone the first time they do.
 */
export const WAVES_ACT_7B: Wave[] = [
  {
    id: "theTwitch",
    name: "THE TWITCH",
    sentence: "The one where opening one of them opens all of them, on a beat nobody chose.",
    entries: [
      { beat: 0, col: 3, kind: "meteor", color: null },
      { beat: 10, col: 6, kind: "coil", color: null },
      { beat: 26, col: 6, kind: "coil", color: null },
      { beat: 28, col: 6, kind: "coil", color: null },
      { beat: 30, col: 6, kind: "coil", color: null },
      { beat: 48, col: 6, kind: "coil", color: null },
      { beat: 50, col: 6, kind: "coil", color: null },
      { beat: 52, col: 6, kind: "coil", color: null },
      { beat: 54, col: 6, kind: "coil", color: null },
      { beat: 62, col: 0, kind: "meteorMedium", color: null },
    ],
    malfunction: { kind: "shield" },
  },
  {
    id: "theClaw",
    name: "THE CLAW",
    sentence: "The one where the gun is a hand, and the hand cannot see what it is reaching for.",
    guide: {
      both: "The cannon is an arm. It slides the way the cannon did and REACH sends it up its column — it closes on the first thing it meets, comes back, and nothing calls it home early, not even the strip. Power-ups cross the field sideways instead of hanging. A rock the arm closes on is not crushed: it is dropped, and it comes down like a torch.",
      p1: "The arm is all you have: no trigger, no plate. Slide ahead of a power-up, not at it, and REACH — and never into a lane with a rock in it, because a rock you touch comes down at you like a torch.",
      p2: "SUCK is the only thing you have, and nothing is caught without it: the arm brings a power-up down to the hull and it is yours only if your mouth is open when it lands. Count the arm down and open on it.",
      scene: "theClaw",
    },
    entries: [
      { beat: 4, col: 3, kind: "meteor", color: null },
      { beat: 14, col: 1, kind: "meteor", color: null },
      { beat: 24, col: 5, kind: "meteorMedium", color: null },
      { beat: 36, col: 2, kind: "meteor", color: null },
      { beat: 44, col: 4, kind: "meteor", color: null },
      { beat: 54, col: 6, kind: "meteorMedium", color: null },
    ],
    pods: [
      { beat: 2, col: 0, row: 4, kind: "mend", cross: 1 },
      { beat: 18, col: 6, row: 6, kind: "ward", cross: -1 },
      { beat: 34, col: 0, row: 3, kind: "purge", cross: 1, speed: 3 },
      { beat: 50, col: 6, row: 5, kind: "mend", cross: -1 },
    ],
    controls: "claw",
  },
  {
    id: "theCrossing",
    name: "THE CROSSING",
    sentence: "The one where it always lands on a wall, and the only question is which one.",
    guide: {
      both: "A rock that comes over a side wall instead of the top, and walks a row two lanes a beat. It only sinks when it turns and it only turns at a wall, so it reaches the hull on the left edge or the right one and nowhere between.",
      p1: "Your strip shows the arrow before it arrives: which wall it comes over. Count from there — a crossing is one edge to the other and two rows down — and name the edge it runs out of rows on. The trigger is still yours.",
      p2: "Never chase it: two lanes a beat is faster than the plate. Take the edge they name and be standing on it early — you have a whole crossing to get there.",
    },
    entries: [
      { beat: 0, col: 0, kind: "meteor", color: null, cross: 1, row: 10 },
      { beat: 16, col: 6, kind: "meteor", color: null, cross: -1, row: 8 },
      { beat: 24, col: 0, kind: "meteor", color: null, cross: 1, row: 7 },
    ],
  },
];
