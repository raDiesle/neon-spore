import type { SimEvent } from "@neon-spore/sim";
import { type Cue, panForCol } from "./bind.js";

type SlingSimEvent = Extract<SimEvent, { type: `sling${string}` }>;

/** Whether an event is THE SLING's, so a page of the chain can hand it over whole. */
export function isSlingEvent(e: SimEvent): e is SlingSimEvent {
  return e.type.startsWith("sling");
}

/**
 * THE SLING's fourteen, in a file of their own for `bind-gorge.ts`' reason.
 *
 * **Heard where they happen**: the fork is bolted over `midCol`, so every one
 * of them is in the middle.
 *
 * **A loose and a hit are pitched up as they add up**, so how far the pair
 * are along can be heard without either of them counting.
 *
 * **The cool is silent by design** (§32, *Presentation*): the one quiet beat
 * on the whole fork, and what breaks it is a draw — the slack's twang,
 * pitched up, as the catch snaps loose.
 */
export function slingCue(e: SlingSimEvent, cols: number): Cue | null {
  const pan = panForCol(e.col, cols);
  switch (e.type) {
    case "slingEnter":
      return { id: "boss.slingEnter", pan };
    case "slingLight":
      return { id: "boss.slingLight", pan };
    case "slingSlack":
      return { id: "boss.slingSlack", pan };
    case "slingLoose":
      // Higher on an arm's second draw: the band pulled tighter reads as the note rising.
      return { id: "boss.slingLoose", pan, pitch: 1 + Math.max(0, e.draws - 1) * 0.06 };
    case "slingSpring":
      return { id: "boss.slingSpring", pan };
    case "slingYoke":
      return { id: "boss.slingYoke", pan };
    case "slingHit":
      return { id: "boss.slingHit", pan, pitch: 1 + Math.max(0, e.hits - 1) * 0.08 };
    case "slingSteady":
      return { id: "boss.slingSteady", pan };
    case "slingDim":
      return { id: "boss.slingDim", pan };
    case "slingMiss":
      return { id: "boss.slingMiss", pan };
    case "slingCool":
      return null;
    case "slingSnap":
      return { id: "boss.slingSlack", pan, pitch: 1.25 };
    case "slingFree":
      return { id: "boss.slingFree", pan };
    case "slingOut":
      return { id: "boss.slingOut", pan };
  }
}
