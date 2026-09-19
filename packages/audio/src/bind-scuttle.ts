import type { SimEvent } from "@neon-spore/sim";
import { type Cue, panForCol } from "./bind.js";

/**
 * THE SCUTTLE's eleven, in a file of their own for `bind-gorge.ts`' reason.
 *
 * Every one of them is panned, and here the pan is the count: a part
 * comes loose over a column and is thrown from that column, so the creak
 * of it slipping and the whip of it going are the same place a cadence
 * apart, which is the window one seat has to say and the other has to
 * shoot into. The strike is the one sound that comes from the pair's side of
 * the bargain — a part taken off the frame without a throw — and the rebuff
 * is its failure, dull, from the same column. The swing is the pair's side
 * again and the only sound here a hand makes: it pans where the part is
 * *going*, not where it hung, so the ear follows the column the throw will
 * land in rather than the one it left (`scuttle-hand.ts`).
 */
export function scuttleCue(
  e: Extract<
    SimEvent,
    {
      type:
        | "scuttleEnter"
        | "scuttleLoose"
        | "scuttleThrow"
        | "scuttleStruck"
        | "scuttleSwing"
        | "scuttleRebuff"
        | "scuttleSlack"
        | "scuttleWind"
        | "scuttleLast"
        | "scuttleDown"
        | "scuttleOut";
    }
  >,
  cols: number,
): Cue {
  const pan = panForCol(e.col, cols);
  switch (e.type) {
    case "scuttleEnter":
      return { id: "boss.scuttleEnter", pan };
    case "scuttleLoose":
      // The live part is the one to shoot; the other of a pair is a shade lower.
      return { id: "boss.scuttleLoose", pan, pitch: e.live ? 1 : 0.85 };
    case "scuttleThrow":
      return { id: "boss.scuttleThrow", pan };
    case "scuttleStruck":
      // A step up per part gone, so the frame emptying can be counted by ear.
      return { id: "boss.scuttleStruck", pan, pitch: 1.3 - Math.min(20, e.left) * 0.015 };
    case "scuttleSwing":
      return { id: "boss.scuttleSwing", pan };
    case "scuttleRebuff":
      return { id: "boss.scuttleRebuff", pan };
    case "scuttleSlack":
      return { id: "boss.scuttleSlack", pan };
    case "scuttleWind":
      return { id: "boss.scuttleWind", pan };
    case "scuttleLast":
      return { id: "boss.scuttleLast", pan };
    case "scuttleDown":
      return { id: "boss.scuttleDown", pan };
    case "scuttleOut":
      return { id: "boss.scuttleOut", pan };
  }
}
