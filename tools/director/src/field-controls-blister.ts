import type { FieldControlDef } from "./field-control-def.js";

/**
 * THE BLISTER's SWIPE, in a file of its own — `field-controls-page.ts` grows
 * only by the line that spreads it. A creature's rows, so they sit after the
 * grip's rather than among the bosses':
 * its TAP and HOLD are the tap and the grip every body already answers, and
 * the stroke, the turn and the rub are the gestures of its own that need a
 * target, COMBO is a tap and then the stroke, and LEVER a knob held in a band.
 */
export const BLISTER_CONTROLS: readonly FieldControlDef[] = [
  {
    name: "THE BLISTER'S SWIPE",
    where: "across a SWIPE blister while it is up, on the seat its BY names",
    seat: "the seat the blister's BY names — either, on a BOTH blister",
    gesture: "grab and drag",
    does:
      "A blister comes up out of a pore for blisterUpBeatsLong beats, and " +
      "still up when they run out it breaks the hull. A SWIPE one wears the knob every pull wears, with its " +
      "way in it — left, right, up or down — and a channel a stroke long out " +
      "that way. Press on it and carry the finger " +
      "blisterSwipeMilli that way, more along than across, and lift: the " +
      "one blow that knocks it out. A short stroke, a sideways one and one " +
      "the wrong way count nothing and cost nothing (sim/blister-swipe.ts).",
    source: "blister-tap.ts — blisterTapAt() under touchDown(), judged on touchUp()",
    holdKind: "drag",
    dragTarget: "blisterSwipe",
    sends: ["drag"],
    pose: "BLISTER · A STROKE HALF CARRIED",
  },
  {
    name: "THE BLISTER'S TURN",
    where: "round a TURN blister while it is up, on the seat its BY names",
    seat: "the seat the blister's BY names — either, on a BOTH blister",
    gesture: "grab and drag",
    does:
      "A TURN blister wears THE MAZE's turn round it: a channel, a lever " +
      "and a knob at the top with its arrow clockwise, or anticlockwise " +
      "where the wave says so. Press on it and take the thumb round the " +
      "body the way the arrow points: the channel fills green behind the " +
      "knob, and a whole turn is the one blow that knocks it out. The wrong " +
      "way round counts nothing (sim/blister-turn.ts).",
    source: "blister-tap.ts — blisterUnder() under touchDown(); turnAbout() on every move",
    holdKind: "drag",
    dragTarget: "blisterTurn",
    sends: ["drag"],
    pose: "BLISTER · A TURN HALF ROUND",
  },
  {
    name: "THE BLISTER'S RUB",
    where: "on a RUB blister while it is up, on the seat its BY names",
    seat: "the seat the blister's BY names — either, on a BOTH blister",
    gesture: "grab and drag",
    does:
      "A RUB blister wears THE RUB LAB's drop, one zigzag stroke on it for " +
      "its one blow, as every rub in the game does. Press on it and " +
      "scrub back and forth: the first time the thumb turns back knocks " +
      "it out (sim/blister-rub.ts; the reversals counted by render/rub-turns.ts).",
    source: "blister-tap.ts — blisterUnder() under touchDown(); fingers.ts counts the turns",
    holdKind: "drag",
    dragTarget: "blisterRub",
    sends: ["drag"],
    pose: "BLISTER · BEING RUBBED",
  },
  {
    name: "THE BLISTER'S COMBO",
    where: "on a COMBO blister while it is up, on the seat its BY names",
    seat: "the seat the blister's BY names — either, on a BOTH blister",
    gesture: "grab and drag",
    does:
      "THE COMBO LAB's PRESS, THEN PULL on the body. A COMBO blister wears " +
      "the tap's halo and dots first: press it once, and the press is " +
      "counted and gone, and the knob every pull wears comes in where it " +
      "was, its channel a stroke long out to the right. Carry it the whole " +
      "way and lift: the one blow that knocks it out. A pull with no press " +
      "counts nothing (sim/blister.ts, sim/blister-swipe.ts).",
    source: "blister-tap.ts — blisterUnder() under touchDown(): a tap, then a blisterSwipe drag",
    holdKind: "drag",
    dragTarget: "blisterSwipe",
    sends: ["tap", "drag"],
    pose: "BLISTER · PRESSED, THE PULL HALF CARRIED",
  },
  {
    name: "THE BLISTER'S LEVER",
    where: "the knob on a LEVER blister while it is up, on the seat its BY names",
    seat: "the seat the blister's BY names — either, on a BOTH blister",
    gesture: "grab and drag",
    does:
      "THE LEVER LAB's lever on the body: a graduated groove straight down " +
      "from it, a band on the groove, and the knob every pull wears on the " +
      "body. Press the knob and carry it down: it stands where the thumb " +
      "puts it. In the band the band goes green and the dial sweeps round " +
      "the knob; held there blisterLeverBeats, the one blow that knocks it " +
      "out. Out of the band the hold starts again; let go before it is " +
      "done, refused out loud (sim/blister-lever.ts).",
    source: "blister-tap.ts — blisterUnder() under touchDown(); touchMove() carries the knob",
    holdKind: "drag",
    dragTarget: "blisterLever",
    sends: ["drag"],
    pose: "BLISTER · THE LEVER HELD IN ITS BAND",
  },
];
