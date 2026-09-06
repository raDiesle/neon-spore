import type { SimEvent } from "@neon-spore/sim";
import { type Cue, panForCol, pitchForRow } from "./bind.js";

/**
 * **THE COIL's two, as sounds**: a dome coming off, and the charge it was
 * holding leaving for the next one.
 *
 * Its own file beside `bind-carom.ts` and on that file's terms exactly — cut
 * out of `bind-creatures.ts` when the second of them took it past its 250-line
 * limit, and along the seam `events-coil.ts` already cuts in the simulation.
 * Two events about one arrival, and unlike most of the list next door they are
 * a *sequence*: something fails, and a beat and a half later something else
 * fails because of it. Read together they are the chain, which is the creature.
 *
 * `cueFor` names both cases itself and delegates here rather than reaching
 * this file through a `default` — a default would take that switch's
 * exhaustiveness with it, and the exhaustiveness is what makes a new event a
 * compile error rather than a silence nobody hears.
 */
export function coilCue(
  e: Extract<SimEvent, { type: "coilBreak" | "coilJump" }>,
  cols: number,
  rows: number,
): Cue | null {
  switch (e.type) {
    case "coilBreak":
      // The same cue a clasp's shield gets, and for the same reason twice
      // over: a covering coming off a body that goes on travelling, and one
      // that has only ever had a single covering — so there is no "another
      // one" for the ear to have to tell this from. The ear is deliberately
      // not told *which* of the two opened it: what the pair does next is the
      // same either way, and the difference between them is a picture.
      return {
        id: "creature.moult",
        pan: panForCol(e.col, cols),
        pitch: pitchForRow(e.row, rows),
      };
    case "coilJump":
      // The charge leaving for the next dome, and the one cue in the catalogue
      // written for exactly this and never spent: one burst dragging others
      // behind it. Panned and pitched at the dome it **left**, which is a tile
      // both players just watched fail — a cue placed where it is *going*
      // would put the one fact player 1 has to say out loud straight through
      // the speaker of the phone in their partner's hand (`events-coil.ts`).
      return {
        id: "impact.chain",
        pan: panForCol(e.col, cols),
        pitch: pitchForRow(e.row, rows),
      };
  }
}
