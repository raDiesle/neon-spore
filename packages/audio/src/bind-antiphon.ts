import type { SimEvent } from "@neon-spore/sim";
import { type Cue, panForCol } from "./bind.js";

/**
 * THE ANTIPHON's nine, in a file of their own for `bind-scuttle.ts`' reason.
 *
 * Every one of them is panned. The organ stands in the middle column, so
 * its push, its pit and its sinking are heard from the middle; the pit is
 * the one sound from the pair's side of the bargain — a thing described well
 * enough to be found — and the harden is its failure, dull, from the wrong
 * candidate's column rather than the organ's, so the ear hears where the
 * wrong answer was. Nothing is seated: both seats watched the carry, and
 * both are owed its verdict.
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
        | "antiphonSink"
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
      return { id: "boss.antiphonGrow", pan };
    case "antiphonPit":
      // A step up per pit, so the health going can be counted by ear.
      return { id: "boss.antiphonPit", pan, pitch: 0.9 + Math.min(8, e.pits) * 0.04 };
    case "antiphonHarden":
      return { id: "boss.antiphonHarden", pan };
    case "antiphonSink":
      return { id: "boss.antiphonSink", pan };
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
