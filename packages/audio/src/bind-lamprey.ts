import type { SimEvent } from "@neon-spore/sim";
import { type Cue, panForCol } from "./bind.js";

type LampreySimEvent = Extract<SimEvent, { type: `lamprey${string}` }>;

/** Whether an event is THE LAMPREY's, so a page of the chain can hand it over whole. */
export function isLampreyEvent(e: SimEvent): e is LampreySimEvent {
  return e.type.startsWith("lamprey");
}

/**
 * THE LAMPREY's eighteen, in a file of their own for `bind-gorge.ts`' reason.
 *
 * **The pan follows the eel**: every event carries the column of the tile it
 * is on, so a leap across the field is heard landing on the other side. **A
 * slip is the one the holder has to hear**, and a snap the one the tapper has
 * to hear.
 *
 * **A crack rises as the teeth come out**, and so does a hit.
 *
 * **The worm on the field has no new sound** (6 October 2026): a body eaten
 * is the bite's chomp, high; a tap that has not cracked the tooth yet is the
 * crack, low and rising with the taps; dung is the bite letting go, low. Food
 * falling and the crawl across are silent — the crawl is
 * seen, and the bodies falling have their own sounds.
 */
export function lampreyCue(e: LampreySimEvent, cols: number): Cue | null {
  const pan = panForCol(e.col, cols);
  switch (e.type) {
    case "lampreyEnter":
      return { id: "boss.lampreyEnter", pan };
    case "lampreyFeed":
    case "lampreyRoam":
      return null;
    case "lampreyEat":
      return { id: "boss.lampreyBite", pan, pitch: 1.3 };
    case "lampreyDung":
      return { id: "boss.lampreyLoose", pan, pitch: 0.7 };
    case "lampreyTap":
      return { id: "boss.lampreyCrack", pan, pitch: 0.6 + e.taps * 0.08 };
    case "lampreyBite":
      return { id: "boss.lampreyBite", pan };
    case "lampreyCrack":
      return { id: "boss.lampreyCrack", pan, pitch: 1 + e.tooth * 0.04 };
    case "lampreySnap":
      return { id: "boss.lampreySnap", pan };
    case "lampreyGrip":
      return { id: "boss.lampreyGrip", pan };
    case "lampreySlip":
      return { id: "boss.lampreySlip", pan };
    case "lampreyFull":
      return { id: "boss.lampreyFull", pan };
    case "lampreyLoose":
      return { id: "boss.lampreyLoose", pan };
    case "lampreyRear":
      return { id: "boss.lampreyRear", pan };
    case "lampreyHit":
      return { id: "boss.lampreyHit", pan, pitch: 1 + Math.max(0, e.hits - 1) * 0.08 };
    case "lampreySpent":
      return { id: "boss.lampreySpent", pan };
    case "lampreyOut":
      return { id: "boss.lampreyOut", pan };
  }
}
