import type { SimEvent } from "@neon-spore/sim";
import { type Cue, panForCol } from "./bind.js";

type GovernorSimEvent = Extract<SimEvent, { type: `governor${string}` }>;

/** Whether an event is THE GOVERNOR's, so a page of the chain can hand it over whole. */
export function isGovernorEvent(e: SimEvent): e is GovernorSimEvent {
  return e.type.startsWith("governor");
}

/**
 * THE GOVERNOR's twelve, in a file of their own for `bind-gorge.ts`' reason.
 *
 * **All in the middle**: the dial and the hub stand in the middle column, and
 * the pan is the column (`bind.ts`).
 *
 * **A tap rises through the step's marks**, so an ordered step climbs as it
 * is landed in turn, and a hit rises as the shots add up.
 */
export function governorCue(e: GovernorSimEvent, cols: number): Cue {
  const pan = panForCol(e.col, cols);
  switch (e.type) {
    case "governorEnter":
      return { id: "boss.governorEnter", pan };
    case "governorLight":
      return { id: "boss.governorLight", pan };
    case "governorTick":
      return { id: "boss.governorTick", pan, pitch: 1 + e.mark * 0.08 };
    case "governorSkid":
      return { id: "boss.governorSkid", pan };
    case "governorHub":
      return { id: "boss.governorHub", pan };
    case "governorRetap":
      return { id: "boss.governorRetap", pan };
    case "governorSway":
      return { id: "boss.governorSway", pan };
    case "governorDim":
      return { id: "boss.governorDim", pan };
    case "governorHit":
      return { id: "boss.governorHit", pan, pitch: 1 + Math.max(0, e.hits - 1) * 0.08 };
    case "governorMiss":
      return { id: "boss.governorMiss", pan };
    case "governorSpent":
      return { id: "boss.governorSpent", pan };
    case "governorOut":
      return { id: "boss.governorOut", pan };
  }
}
