import type { Wave } from "../wave-types.js";

/**
 * The second half of act seven, cut off `act-7.ts` when THE COIL was split
 * into two waves and that file reached the 250-line ceiling. Three waves now:
 * the fault at length, the panel that replaces the gun, and the rock that
 * crosses the field in front of the cannon and leaves.
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
 * 3. **THE CROSSING** is the one hazard in the game that cannot hurt anybody.
 *    A plain rock comes over a side wall instead of the top, holds one row,
 *    crosses two lanes a beat and leaves at the far side; nothing turns it
 *    away, and it never reaches the ship. What it takes is the **lane**: a
 *    rock stops a bolt, so for the seven beats of its crossing it is a moving
 *    wall in front of the cannon, and the price is paid by whatever else the
 *    wave is sending. That is the wave — a shot that has to go before the wall
 *    arrives, or after it has gone.
 *
 *    The split is sharper here than the movement suggests. Rocks are announced
 *    on **player 1's** strip and on nobody else's, so the arrow at the edge —
 *    the row it will hold, the side it comes over, the way it will fly — is
 *    his alone; and the trigger that fires a colour is **player 2's**. So the
 *    seat that can see the wall coming is the seat that cannot shoot, and the
 *    seat holding the trigger learns about it by being told.
 *
 *    1. Beat 0, one alone across the middle of the field with nothing else on
 *       it, so the shape is watched once before it costs anything.
 *    2. Beats 8–10 and 18–20, a body and then a crossing under it: the first
 *       two times the lane closes, one at a time, with room to be wrong in.
 *    3. Beats 28–34, two bodies and two crossings from opposite walls, so the
 *       order the shots go in is the whole of what is left to choose.
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
    sentence:
      "The one where the lane you are aiming up keeps being taken by something you cannot shoot.",
    guide: {
      both: "A rock that comes over a side wall instead of the top. It holds one row, crosses two lanes a beat and leaves at the far side — it never reaches the ship and nothing turns it away. What it does is stand in front of the cannon on its way past.",
      p1: "The arrow at the edge is yours alone: the row it will hold, the side it comes over, the way it will fly. Say the row and count it across — the lane you are aiming up is only yours until it arrives.",
      p2: "You see it once it is on the field and never before, and the trigger is still yours. Fire on their word: a bolt that meets a rock dies there, and the body above it goes on falling.",
    },
    entries: [
      { beat: 0, col: 0, kind: "meteor", color: null, cross: 1, row: 5 },
      { beat: 8, col: 3, color: "red" },
      { beat: 10, col: 6, kind: "meteor", color: null, cross: -1, row: 7 },
      { beat: 18, col: 5, color: "cyan" },
      { beat: 20, col: 0, kind: "meteor", color: null, cross: 1, row: 4 },
      { beat: 28, col: 1, color: "red" },
      { beat: 29, col: 5, color: "cyan" },
      { beat: 31, col: 6, kind: "meteor", color: null, cross: -1, row: 6 },
      { beat: 34, col: 0, kind: "meteor", color: null, cross: 1, row: 9 },
    ],
  },
  {
    id: "theChoir",
    name: "THE CHOIR",
    sentence: "The one where the half-made gesture is worse than none at all.",
    guide: {
      both: "Three dots in one grey membrane, across three lanes. Nothing you can fire reaches any of them. What opens it is not on either panel: shake the phone, or carry the two big arrows at the edges of the field outward — one, then the other, inside two beats. They draw together into a slick or a bulb, and only then is there anything to shoot.",
      p1: "Yours, and it is not a button. Shake the phone; if it will not, carry the left arrow off the left edge and the right one off the right, inside two beats. Stop halfway and it sings — the hull pays. Say when you start.",
      p2: "You cannot open it and a shot at a membrane is spent on nothing. Wait for the dots to come together, then fire the colour it turned, up the middle lane of the three — the only one it is in now.",
      scene: "theChoir",
    },
    entries: [
      { beat: 0, col: 2, kind: "choir", color: "red" },
      { beat: 10, col: 0, kind: "choir", color: "cyan" },
      { beat: 18, col: 6, color: "red" },
      { beat: 22, col: 4, kind: "choir", color: "cyan" },
      { beat: 30, col: 1, kind: "meteor", color: null },
      { beat: 34, col: 1, kind: "choir", color: "red" },
    ],
  },
];
