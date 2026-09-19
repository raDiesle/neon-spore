import type { SimEvent } from "@neon-spore/sim";
import { type Cue, panForCol } from "./bind.js";

/**
 * THE ANTIPHON's eleven, in a file of their own for `bind-scuttle.ts`' reason.
 *
 * Every one of them is panned, and here the pan is the answer: an organ
 * grows over a column and is named by a bolt up that column, so the push of
 * it coming out and the shrivel of it going are the same place, which is
 * the column one seat has to find in the other's words. The pit is the one
 * sound from the pair's side of the bargain — a thing described well enough
 * to be named — and the harden is its failure, dull, from the decoy's column
 * rather than the organ's, so the ear hears where the wrong answer was.
 *
 * **The pull is seated, and it is the one cue here that is.** She crosses a
 * candidate off her rail and it makes a small dry sound on her phone; a pan
 * on his would hand him a column she had eliminated without either of them
 * saying it, which is the whole of what this boss is for. `Mixer` drops a
 * seated cue unless the device has been told which seat it is, so a phone
 * that was never told stays silent rather than leaking (`bind-cue.ts`). The
 * harden beside it is panned to both on purpose: it is a punishment they
 * have already paid for, and both are owed the column it happened in.
 */
export function antiphonCue(
  e: Extract<
    SimEvent,
    {
      type:
        | "antiphonEnter"
        | "antiphonGrow"
        | "antiphonPit"
        | "antiphonHarden"
        | "antiphonPull"
        | "antiphonSink"
        | "antiphonSpill"
        | "antiphonStill"
        | "antiphonShip"
        | "antiphonBurst"
        | "antiphonOut";
    }
  >,
  cols: number,
): Cue {
  const pan = panForCol(e.col, cols);
  switch (e.type) {
    case "antiphonEnter":
      return { id: "boss.antiphonEnter", pan };
    case "antiphonGrow":
      // The second of a pair a shade lower, so twins are heard as two.
      return { id: "boss.antiphonGrow", pan, pitch: e.organs > 1 ? 0.9 : 1 };
    case "antiphonPit":
      // A step up per pit, so the health going can be counted by ear.
      return { id: "boss.antiphonPit", pan, pitch: 0.9 + Math.min(8, e.pits) * 0.04 };
    case "antiphonHarden":
      return { id: "boss.antiphonHarden", pan };
    case "antiphonPull":
      return { id: "boss.antiphonPull", pan, seat: 2 };
    case "antiphonSink":
      return { id: "boss.antiphonSink", pan, pitch: e.fired ? 0.8 : 1 };
    case "antiphonSpill":
      return { id: "boss.antiphonSpill", pan };
    case "antiphonStill":
      return { id: "boss.antiphonStill", pan };
    case "antiphonShip":
      return { id: "boss.antiphonShip", pan };
    case "antiphonBurst":
      return { id: "boss.antiphonBurst", pan };
    case "antiphonOut":
      return { id: "boss.antiphonOut", pan };
  }
}
