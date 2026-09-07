import type { SimEvent } from "@neon-spore/sim";
import { type Cue, panForCol, pitchForRow } from "./bind.js";

/**
 * THE CHOIR's three, in a file of its own — `bind-carom.ts` and `bind-coil.ts`
 * are the pattern and this is the third: one arrival taken apart, cut out
 * because `bind-creatures.ts` next door is at its length limit and because
 * every one of these is about a **gesture** rather than about a shot.
 *
 * That is what makes the group worth keeping together. Everything in
 * `bind-creatures.ts` is the ear's account of something that met a body — a
 * covering coming off, a bolt turned away, a cloud shutting. These three are
 * the ear's account of the pilot's hands: one arrow out, both out, or the
 * window gone. The pair are being told how far through one motion they are,
 * and that is a different sentence from *what just happened to that thing*.
 */
export function choirCue(
  e: Extract<SimEvent, { type: "choirMerge" | "choirArm" | "choirSing" }>,
  cols: number,
  rows: number,
): Cue | null {
  switch (e.type) {
    case "choirArm":
      // The first arrow, and the cue that was written for an announcement
      // leaving one device and never spent — a short rising call. It is
      // exactly what this moment is: the pilot has started something the
      // navigator cannot see the beginning of and has two beats to finish.
      //
      // **Panned to the side the hand is on** and nothing else. There is no
      // row to pitch off — an arrow stands against a wall of the field, not on
      // a tile — and the side *is* the information: which one is left to
      // carry. `-1` is the left wall, so the pan is the side itself read as a
      // column at either end of the field.
      return {
        id: "signal.announce",
        pan: panForCol(e.side === -1 ? 0 : cols - 1, cols),
      };
    case "choirMerge":
      // The same cue THE CLASP's break gets, and for its reason word for word:
      // a covering coming off a body that goes on falling. A membrane and a
      // shield are the same event to the ear — the thing that was stopping
      // every shot has stopped — and two sounds for one moment would teach the
      // pair a difference that is not there.
      return {
        id: "creature.moult",
        pan: panForCol(e.col, cols),
        pitch: pitchForRow(e.row, rows),
      };
    case "choirSing":
      // And the chord itself: many voices on one note with one of them wrong,
      // which is the sound this creature was named for and which has been in
      // the catalogue as a spare since before the creature existed
      // (`sounds/boss-planned.ts`).
      //
      // Deliberately **not** a hull cue, for all that the hull pays for it on
      // the same tick. The `breach` beside it already plays the damage; this
      // is the thing that did it, and a pair who could not tell the chord from
      // a body landing would not know they had fumbled a gesture rather than
      // missed a column.
      return {
        id: "boss.choir",
        pan: panForCol(e.col, cols),
        pitch: pitchForRow(e.row, rows),
      };
  }
}
