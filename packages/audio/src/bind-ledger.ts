import type { SimEvent } from "@neon-spore/sim";
import { type Cue, panForCol } from "./bind.js";

/**
 * THE LEDGER's sixteen — eleven of the cord's own and five its four hands
 * added — in a file of their own for `bind-taster.ts`' reason.
 *
 * **Every one of them is panned**, which is unusual and is the boss: this is
 * the one fight whose whole subject is *which column*, so an ear that could
 * not hear where the socket had walked to would be missing the sentence the
 * navigator has to say. Two of them are the body's own — the seam taking a hit
 * and a bolt refused — and they pan to the column they happened in; the other
 * fourteen are the cord's and the hands', and they pan to the socket, which is
 * the same cue moving along the hull as the fight goes on.
 *
 * **Four of the five hands borrow a sound rather than bring one**, which is
 * this boss and not thrift: each of them is a thing that has already happened
 * in this fight happening again by hand — the root walking, the last return
 * refused, a bead on a shorter count, the cord going taut — and a new note for
 * each would teach the ear four things the pair already knows. Only the plug
 * is new, because a hole being stoppered is the one thing the cord has never
 * done (`sounds/boss-ledger.ts`).
 *
 * `ledgerBead` is pitched by how few beats the return has left to run, so the
 * cadence tightening is audible without counting: four beats is the pitch the
 * pair learned in the first movement, two is a step and a half above it.
 */
export function ledgerCue(
  e: Extract<
    SimEvent,
    {
      type:
        | "ledgerRoot"
        | "ledgerSeam"
        | "ledgerRefused"
        | "ledgerBead"
        | "ledgerWard"
        | "ledgerWhip"
        | "ledgerBill"
        | "ledgerSocket"
        | "ledgerLast"
        | "ledgerHeld"
        | "ledgerTear"
        | "ledgerFoot"
        | "ledgerPlug"
        | "ledgerRoll"
        | "ledgerPull"
        | "ledgerHaul";
    }
  >,
  cols: number,
): Cue {
  switch (e.type) {
    case "ledgerRoot":
      return { id: "boss.ledgerRoot", pan: panForCol(e.col, cols) };
    case "ledgerSeam":
      return { id: "boss.ledgerSeam", pan: panForCol(e.col, cols) };
    case "ledgerRefused":
      return { id: "boss.ledgerRefused", pan: panForCol(e.col, cols) };
    case "ledgerBead":
      // A step up as the cadence shortens: the same bill with less time in it.
      return {
        id: "boss.ledgerBead",
        pan: panForCol(e.col, cols),
        pitch: 1.3 - e.beats * 0.08,
      };
    case "ledgerWard":
      return { id: "boss.ledgerWard", pan: panForCol(e.col, cols) };
    case "ledgerWhip":
      return { id: "boss.ledgerWhip", pan: panForCol(e.col, cols) };
    case "ledgerBill":
      return { id: "boss.ledgerBill", pan: panForCol(e.col, cols) };
    case "ledgerSocket":
      return { id: "boss.ledgerSocket", pan: panForCol(e.col, cols) };
    case "ledgerLast":
      return { id: "boss.ledgerLast", pan: panForCol(e.col, cols) };
    case "ledgerHeld":
      return { id: "boss.ledgerHeld", pan: panForCol(e.col, cols) };
    // The foot walked along the plating is the socket's own scrape, a fourth
    // lower: it is the same drag over the same metal, made by a thumb before
    // the cord is in rather than by the cord after it.
    case "ledgerFoot":
      return { id: "boss.ledgerSocket", pan: panForCol(e.col, cols), pitch: 0.75 };
    case "ledgerPlug":
      return { id: "boss.ledgerPlug", pan: panForCol(e.col, cols) };
    // A rolled bill is the last return's refusal happening to an ordinary one,
    // so it is that sound a fifth up — near enough to say *this went back* and
    // far enough that the one return nobody may refuse still has its own note.
    case "ledgerRoll":
      return { id: "boss.ledgerHeld", pan: panForCol(e.col, cols), pitch: 1.5 };
    // A hauled return is the bead's own pluck on its new count, pitched by the
    // same arithmetic: what his thumb changed is exactly the number that
    // pitches it.
    case "ledgerPull":
      return {
        id: "boss.ledgerBead",
        pan: panForCol(e.col, cols),
        pitch: 1.3 - e.beats * 0.08,
      };
    // And the haul is the cord going taut under his hand — the ward's snap,
    // lower and quieter, a beat of tension before `ledgerTear` on the same
    // tick rather than a second sound competing with it.
    case "ledgerHaul":
      return { id: "boss.ledgerWard", pan: panForCol(e.col, cols), pitch: 0.7, gain: 0.7 };
    default:
      return { id: "boss.ledgerTear", pan: panForCol(e.col, cols) };
  }
}
