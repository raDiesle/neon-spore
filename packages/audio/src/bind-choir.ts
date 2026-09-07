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
  e: Extract<SimEvent, { type: "choirMerge" | "choirOpen" | "choirArm" | "choirSing" }>,
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
      // Panned to the wall the hand is on, and dead centre for a shake, which
      // has no side at all: the phone is the whole device and pointing that at
      // one edge of the field would be inventing a place for it.
      return {
        id: "signal.announce",
        pan: e.side === 2 ? 0 : panForCol(e.side === -1 ? 0 : cols - 1, cols),
      };
    case "choirMerge":
      // The gesture landing, which is not yet the body opening: the two are
      // drawing together and there is still nothing to shoot. It is
      // deliberately **silent** — the screen is shaking on this beat and the
      // arrow that started it already announced itself, so a third sound here
      // would be the game saying the same thing three ways.
      return null;
    case "choirOpen":
      // And the closing finishing. The same cue THE CLASP's break gets, for
      // its reason word for word: a covering leaving a body that goes on
      // falling. A membrane and a shield are the same event to the ear — the
      // thing that was stopping every shot has stopped.
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
