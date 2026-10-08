import type { SimEvent } from "@neon-spore/sim";
import { type Cue, panForCol } from "./bind.js";

type LatchSimEvent = Extract<SimEvent, { type: `latch${string}` }>;

/** Whether an event is THE LATCH's, so a page of the chain can hand it over whole. */
export function isLatchEvent(e: SimEvent): e is LatchSimEvent {
  return e.type.startsWith("latch");
}

/**
 * THE LATCH's twelve, in a file of their own for `bind-gorge.ts`' reason.
 *
 * **A grip is heard on its own side**, one column either side of the tendril,
 * so each seat hears its own hand take hold; everything else is the tendril's,
 * down the middle. **A knot rises as they add up**, and a slip falls further
 * the more of the knot it lost.
 */
export function latchCue(e: LatchSimEvent, cols: number): Cue {
  const pan = panForCol(e.col, cols);
  switch (e.type) {
    case "latchEnter":
      return { id: "boss.latchEnter", pan };
    case "latchLevel":
      return { id: "boss.latchLevel", pan };
    case "latchGrip":
      return { id: "boss.latchGrip", pan };
    case "latchTurn":
      return { id: "boss.latchTurn", pan };
    case "latchWrong":
      return { id: "boss.latchWrong", pan };
    case "latchSlip":
      return { id: "boss.latchSlip", pan, pitch: 1 - Math.min(0.3, e.lostMilli / 16000) };
    case "latchRear":
      return { id: "boss.latchRear", pan };
    case "latchBraced":
      return { id: "boss.latchBraced", pan };
    case "latchKnot":
      return { id: "boss.latchKnot", pan, pitch: 1 + Math.max(0, e.knots - 1) * 0.06 };
    case "latchMiss":
      return { id: "boss.latchMiss", pan };
    case "latchSpent":
      return { id: "boss.latchSpent", pan };
    case "latchOut":
      return { id: "boss.latchOut", pan };
  }
}
