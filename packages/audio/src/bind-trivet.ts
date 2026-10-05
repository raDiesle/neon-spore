import type { SimEvent } from "@neon-spore/sim";
import { type Cue, panForCol } from "./bind.js";

type TrivetSimEvent = Extract<SimEvent, { type: `trivet${string}` }>;

/** Whether an event is THE TRIVET's, so a page of the chain can hand it over whole. */
export function isTrivetEvent(e: SimEvent): e is TrivetSimEvent {
  return e.type.startsWith("trivet");
}

/**
 * THE TRIVET's fifteen, in a file of their own for `bind-gorge.ts`' reason.
 *
 * **Heard where they happen**: the stand stands over `midCol`, so every one
 * of them is in the middle but a lurch's and a needle's.
 *
 * **A needle turned is the shield's own deflect**, THE GUM's and THE CLING's
 * choice: it is the shield doing what it always does.
 *
 * **A plant and a hit are pitched up as they add up**, so how far the pair
 * are along can be heard without either of them counting.
 *
 * **Row 11's ring is the spring's metallic ring** (§30, *Presentation*),
 * pitched down and quiet, dying across the window with no chord to answer
 * it; a reflex chord that jolts a foot loose rings it again, pitched up.
 */
export function trivetCue(e: TrivetSimEvent, cols: number): Cue {
  const pan = panForCol(e.col, cols);
  switch (e.type) {
    case "trivetEnter":
      return { id: "boss.trivetEnter", pan };
    case "trivetLight":
      return { id: "boss.trivetLight", pan };
    case "trivetSlip":
      return { id: "boss.trivetSlip", pan };
    case "trivetPlant":
      // Higher on a foot's second plant: the leg driven home reads as the thud rising.
      return { id: "boss.trivetPlant", pan, pitch: 1 + Math.max(0, e.level - 1) * 0.06 };
    case "trivetSpring":
      return { id: "boss.trivetSpring", pan };
    case "trivetHub":
      return { id: "boss.trivetHub", pan };
    case "trivetHit":
      return { id: "boss.trivetHit", pan, pitch: 1 + Math.max(0, e.hits - 1) * 0.08 };
    case "trivetBrace":
      return { id: "boss.trivetBrace", pan };
    case "trivetRock":
      return { id: "boss.trivetRock", pan };
    case "trivetMiss":
      return { id: "boss.trivetMiss", pan };
    case "trivetTurn":
      return { id: "impact.deflect", pan };
    case "trivetRing":
      return { id: "boss.trivetSpring", pan, pitch: 0.8, gain: 0.6 };
    case "trivetJolt":
      return { id: "boss.trivetSpring", pan, pitch: 1.25 };
    case "trivetCollapse":
      return { id: "boss.trivetCollapse", pan };
    case "trivetOut":
      return { id: "boss.trivetOut", pan };
  }
}
