import type { SimEvent } from "@neon-spore/sim";
import { type Cue, panForCol } from "./bind.js";

type HalterSimEvent = Extract<SimEvent, { type: `halter${string}` }>;

/** Whether an event is THE HALTER's, so a page of the chain can hand it over whole. */
export function isHalterEvent(e: SimEvent): e is HalterSimEvent {
  return e.type.startsWith("halter");
}

/**
 * THE HALTER's fourteen, in a file of their own for `bind-gorge.ts`' reason.
 *
 * **Heard where they happen**: the seam hangs over `midCol`, so every one of
 * them is in the middle.
 *
 * **A hit rises as they add up**, so how far the pair are along can be heard
 * without either of them looking.
 */
export function halterCue(e: HalterSimEvent, cols: number): Cue {
  const pan = panForCol(e.col, cols);
  switch (e.type) {
    case "halterEnter":
      return { id: "boss.halterEnter", pan };
    case "halterLight":
      return { id: "boss.halterLight", pan };
    case "halterSettle":
      return { id: "boss.halterSettle", pan };
    case "halterStartle":
      return { id: "boss.halterStartle", pan };
    case "halterSlip":
      return { id: "boss.halterSlip", pan };
    case "halterCrack":
      return { id: "boss.halterCrack", pan };
    case "halterBare":
      return { id: "boss.halterBare", pan };
    case "halterGuard":
      return { id: "boss.halterGuard", pan };
    case "halterShut":
      return { id: "boss.halterShut", pan };
    case "halterSeal":
      return { id: "boss.halterSeal", pan };
    case "halterHit":
      return { id: "boss.halterHit", pan, pitch: 1 + Math.max(0, e.hits - 1) * 0.08 };
    case "halterMiss":
      return { id: "boss.halterMiss", pan };
    case "halterSplit":
      return { id: "boss.halterSplit", pan };
    case "halterOut":
      return { id: "boss.halterOut", pan };
  }
}
