import type { SimEvent } from "@neon-spore/sim";
import { type Cue, panForCol, pitchForRow } from "./bind.js";

/**
 * THE BALLOON's three, in a file of its own — `bind-choir.ts` is the pattern
 * and this is the fourth of them, cut out because `bind-creatures.ts` next
 * door is at its length limit.
 *
 * What holds the group together is that all three are the **end** of one body,
 * and the pair reads them as a scoreline rather than as a report: *that one
 * came apart*, *that one is gone*, *that one got away*. THE CHOIR's three are
 * the stages of one gesture and everything in `bind-creatures.ts` is what met
 * a body; these are three different outcomes of the same creature, and the ear
 * has to be able to tell the good one from the expensive one across a room.
 */
export function balloonCue(
  e: Extract<SimEvent, { type: "balloonSplit" | "balloonPop" | "balloonBurst" }>,
  cols: number,
  rows: number,
): Cue | null {
  switch (e.type) {
    case "balloonSplit":
      // "One thing becoming several, each smaller and quicker than the last" —
      // the catalogue's own words for a sound that has been spare since before
      // this creature existed, and they are a description of the picture. It
      // is deliberately not `impact.split`, which is a *crack*: nothing broke
      // here, the skin gave and there are two of them now.
      return {
        id: "creature.colonySpread",
        pan: panForCol(e.col, cols),
        pitch: pitchForRow(e.row, rows),
      };
    case "balloonPop":
      // "Two shots landing in the same tile in the same beat: one burst,
      // doubled" — spare, and it is the only sound in the catalogue that is
      // *one event made by two things at once*, which is the whole of what
      // just happened. The ordinary `destroy` beside it on the same tick
      // carries the particles and their own cue; this is the skin letting go.
      return {
        id: "impact.overkill",
        pan: panForCol(e.col, cols),
        pitch: pitchForRow(e.row, rows),
      };
    case "balloonBurst":
      // "Everything docked being thrown off at once: a hard sheet of air
      // outward." Deliberately **not** a hull cue, `choirSing`'s argument word
      // for word: the `breach` beside it already plays the damage, and a pair
      // who could not tell this from a body landing would not know that what
      // beat them was at the far end of the field rather than on the ship.
      return {
        id: "hull.purge",
        pan: panForCol(e.col, cols),
        pitch: pitchForRow(e.row, rows),
      };
  }
}
