import type { FieldControlDef } from "./field-control-def.js";

/**
 * THE BLISTER's SWIPE, in a file of its own on `field-controls-gum.ts`'s
 * pattern — `field-controls-page.ts` grows only by the line that spreads it.
 * A creature's rows, so they sit after THE GUM rather than among the bosses':
 * its TAP and HOLD are the tap and the grip every body already answers, and
 * the stroke and the turn are the gestures of its own that need a target.
 */
export const BLISTER_CONTROLS: readonly FieldControlDef[] = [
  {
    name: "THE BLISTER'S SWIPE",
    where: "across a SWIPE blister while it is up, on the seat its BY names",
    seat: "the seat the blister's BY names — either, on a BOTH blister",
    gesture: "grab and drag",
    does:
      "A blister comes up out of a pore in the hull for two beats and goes " +
      "back under. A SWIPE one wears a bar across it with chevrons pointing " +
      "its way — left, right, up or down. Press on it and carry the finger " +
      "blisterSwipeMilli that way, more along than across, and lift: one " +
      "blow. A short stroke, a sideways one and one the wrong way count " +
      "nothing and cost nothing. A stroke still open when it sinks counts " +
      "nothing either (sim/blister-swipe.ts).",
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
      "knob, and a whole turn is one blow. The wrong way round counts " +
      "nothing; a turn short of whole when it sinks is lost, and a thumb " +
      "left on it counts nothing more until it lifts (sim/blister-turn.ts).",
    source: "blister-tap.ts — blisterUnder() under touchDown(); turnAbout() on every move",
    holdKind: "drag",
    dragTarget: "blisterTurn",
    sends: ["drag"],
    pose: "BLISTER · A TURN HALF ROUND",
  },
];
