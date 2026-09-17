import type { SimEvent } from "@neon-spore/sim";
import { type Cue, panForCol } from "./bind.js";

/**
 * THE LEDGER's eleven, in a file of their own for `bind-taster.ts`' reason.
 *
 * **Every one of them is panned**, which is unusual and is the boss: this is
 * the one fight whose whole subject is *which column*, so an ear that could
 * not hear where the socket had walked to would be missing the sentence the
 * navigator has to say. Two of them are the body's own — the seam taking a hit
 * and a bolt refused — and they pan to the column they happened in; the other
 * nine are the cord's, and they pan to the socket, which is the same cue
 * moving along the hull as the fight goes on.
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
        | "ledgerTear";
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
    default:
      return { id: "boss.ledgerTear", pan: panForCol(e.col, cols) };
  }
}
