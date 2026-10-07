import type { SimEvent } from "@neon-spore/sim";
import { type Cue, panForCol } from "./bind.js";

type TrapezeSimEvent = Extract<SimEvent, { type: `trapeze${string}` }>;

/** Whether an event is THE TRAPEZE's, so a page of the chain can hand it over whole. */
export function isTrapezeEvent(e: SimEvent): e is TrapezeSimEvent {
  return e.type.startsWith("trapeze");
}

/**
 * THE TRAPEZE's fifteen, in a file of their own for `bind-gorge.ts`' reason.
 *
 * **Heard where they happen**: a tap, a freeze, a flutter and a catch are
 * panned to the lit column, so **the half a freeze lands on is heard** by
 * the seat that has to swipe toward it. The spindle and the flag as a whole
 * are in the middle.
 *
 * **A catch rises as they add up**, and so does a hit.
 */
export function trapezeCue(e: TrapezeSimEvent, cols: number): Cue {
  const pan = panForCol(e.col, cols);
  switch (e.type) {
    case "trapezeEnter":
      return { id: "boss.trapezeEnter", pan };
    case "trapezeLight":
      return { id: "boss.trapezeLight", pan };
    case "trapezeFreeze":
      return { id: "boss.trapezeFreeze", pan };
    case "trapezeFlap":
      return { id: "boss.trapezeFlap", pan };
    case "trapezeLapse":
      return { id: "boss.trapezeLapse", pan };
    case "trapezeFlutter":
      return { id: "boss.trapezeFlutter", pan };
    case "trapezeCatch":
      return { id: "boss.trapezeCatch", pan, pitch: 1 + Math.max(0, e.catches - 1) * 0.08 };
    case "trapezeSpindle":
      return { id: "boss.trapezeSpindle", pan };
    case "trapezeRecatch":
      return { id: "boss.trapezeRecatch", pan };
    case "trapezeSway":
      return { id: "boss.trapezeSway", pan };
    case "trapezeDim":
      return { id: "boss.trapezeDim", pan };
    case "trapezeHit":
      return { id: "boss.trapezeHit", pan, pitch: 1 + Math.max(0, e.hits - 1) * 0.08 };
    case "trapezeMiss":
      return { id: "boss.trapezeMiss", pan };
    case "trapezeSpent":
      return { id: "boss.trapezeSpent", pan };
    case "trapezeOut":
      return { id: "boss.trapezeOut", pan };
  }
}
