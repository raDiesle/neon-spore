import type { SimEvent } from "@neon-spore/sim";
import { type Cue, panForCol } from "./bind.js";

type LampreySimEvent = Extract<SimEvent, { type: `lamprey${string}` }>;

/** Whether an event is THE LAMPREY's, so a page of the chain can hand it over whole. */
export function isLampreyEvent(e: SimEvent): e is LampreySimEvent {
  return e.type.startsWith("lamprey");
}

/**
 * THE LAMPREY's thirteen, in a file of their own for `bind-gorge.ts`' reason.
 *
 * **The pan follows the jaw**: every event carries the column the mouth is on,
 * so a crawl is heard moving along the hull and the pinner can follow it with
 * an ear. **A gnaw is the one the pinner has to hear**, and it deepens as the
 * bite does; a snap is the one the tapper has to hear.
 *
 * **A crack rises as the bite's teeth come out**, and so does a hit.
 */
export function lampreyCue(e: LampreySimEvent, cols: number): Cue {
  const pan = panForCol(e.col, cols);
  switch (e.type) {
    case "lampreyEnter":
      return { id: "boss.lampreyEnter", pan };
    case "lampreyBite":
      return { id: "boss.lampreyBite", pan };
    case "lampreyCrack":
      return { id: "boss.lampreyCrack", pan, pitch: 1 + e.tooth * 0.04 };
    case "lampreySnap":
      return { id: "boss.lampreySnap", pan };
    case "lampreyCrawl":
      return { id: "boss.lampreyCrawl", pan };
    case "lampreyGnaw":
      return { id: "boss.lampreyGnaw", pan, pitch: 1 - e.biteMilli / 4000 };
    case "lampreyFull":
      return { id: "boss.lampreyFull", pan };
    case "lampreyLoose":
      return { id: "boss.lampreyLoose", pan };
    case "lampreyRear":
      return { id: "boss.lampreyRear", pan };
    case "lampreyHit":
      return { id: "boss.lampreyHit", pan, pitch: 1 + Math.max(0, e.hits - 1) * 0.08 };
    case "lampreyLunge":
      return { id: "boss.lampreyLunge", pan };
    case "lampreySpent":
      return { id: "boss.lampreySpent", pan };
    case "lampreyOut":
      return { id: "boss.lampreyOut", pan };
  }
}
