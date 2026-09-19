import type { SimEvent } from "@neon-spore/sim";
import { type Cue, panForCol } from "./bind.js";

/**
 * THE LEAD's seventeen, in a file of their own for `bind-gorge.ts`' reason.
 *
 * Every one of them is panned, and here the pan is the fight: the body is
 * never where the pair last heard it, so a footfall a column to the right
 * of the last is the one fact both seats share without looking up. The
 * flight is the other half of the sum — a shot leaving the top is a rise
 * from its column, and the hit or the miss a beat later comes from the
 * column the body is in *then*, which is the pan the pair was betting on.
 */
export function leadCue(
  e: Extract<
    SimEvent,
    {
      type:
        | "leadEnter"
        | "leadPace"
        | "leadTurn"
        | "leadFlight"
        | "leadHit"
        | "leadMiss"
        | "leadReverse"
        | "leadTorch"
        | "leadRock"
        | "leadStill"
        | "leadGrip"
        | "leadRelease"
        | "leadTear"
        | "leadPass"
        | "leadWall"
        | "leadDown"
        | "leadOut";
    }
  >,
  cols: number,
): Cue {
  const pan = panForCol(e.col, cols);
  switch (e.type) {
    case "leadEnter":
      return { id: "boss.leadEnter", pan };
    case "leadPace":
      return { id: "boss.leadPace", pan };
    case "leadTurn":
      return { id: "boss.leadTurn", pan };
    case "leadFlight":
      return { id: "boss.leadFlight", pan };
    case "leadHit":
      // A step up per segment gone, so the stalk shortening can be counted by ear.
      return { id: "boss.leadHit", pan, pitch: 1.2 - e.segments * 0.05 };
    case "leadMiss":
      return { id: "boss.leadMiss", pan };
    case "leadReverse":
      return { id: "boss.leadReverse", pan };
    case "leadTorch":
      return { id: "boss.leadTorch", pan };
    case "leadRock":
      return { id: "boss.leadRock", pan };
    case "leadStill":
      return { id: "boss.leadStill", pan };
    case "leadGrip":
      return { id: "boss.leadGrip", pan };
    case "leadRelease":
      return { id: "boss.leadRelease", pan };
    case "leadTear":
      return { id: "boss.leadTear", pan };
    case "leadPass":
      return { id: "boss.leadPass", pan };
    case "leadWall":
      return { id: "boss.leadWall", pan };
    case "leadDown":
      return { id: "boss.leadDown", pan };
    case "leadOut":
      return { id: "boss.leadOut", pan };
  }
}
