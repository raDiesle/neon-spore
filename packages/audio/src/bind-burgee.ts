import type { SimEvent } from "@neon-spore/sim";
import { type Cue, panForCol } from "./bind.js";

type BurgeeSimEvent = Extract<SimEvent, { type: `burgee${string}` }>;

/** Whether an event is THE BURGEE's, so a page of the chain can hand it over whole. */
export function isBurgeeEvent(e: SimEvent): e is BurgeeSimEvent {
  return e.type.startsWith("burgee");
}

/**
 * THE BURGEE's fifteen, in a file of their own for `bind-gorge.ts`' reason.
 *
 * **Heard where they happen**: a tap, a freeze, a flutter and a catch are
 * panned to the lit column, so **the half a freeze lands on is heard** by
 * the seat that has to swipe toward it. The spindle and the flag as a whole
 * are in the middle.
 *
 * **A catch rises as they add up**, and so does a hit.
 */
export function burgeeCue(e: BurgeeSimEvent, cols: number): Cue {
  const pan = panForCol(e.col, cols);
  switch (e.type) {
    case "burgeeEnter":
      return { id: "boss.burgeeEnter", pan };
    case "burgeeLight":
      return { id: "boss.burgeeLight", pan };
    case "burgeeFreeze":
      return { id: "boss.burgeeFreeze", pan };
    case "burgeeFlap":
      return { id: "boss.burgeeFlap", pan };
    case "burgeeLapse":
      return { id: "boss.burgeeLapse", pan };
    case "burgeeFlutter":
      return { id: "boss.burgeeFlutter", pan };
    case "burgeeCatch":
      return { id: "boss.burgeeCatch", pan, pitch: 1 + Math.max(0, e.catches - 1) * 0.08 };
    case "burgeeSpindle":
      return { id: "boss.burgeeSpindle", pan };
    case "burgeeRecatch":
      return { id: "boss.burgeeRecatch", pan };
    case "burgeeSway":
      return { id: "boss.burgeeSway", pan };
    case "burgeeDim":
      return { id: "boss.burgeeDim", pan };
    case "burgeeHit":
      return { id: "boss.burgeeHit", pan, pitch: 1 + Math.max(0, e.hits - 1) * 0.08 };
    case "burgeeMiss":
      return { id: "boss.burgeeMiss", pan };
    case "burgeeSpent":
      return { id: "boss.burgeeSpent", pan };
    case "burgeeOut":
      return { id: "boss.burgeeOut", pan };
  }
}
