import type { SimEvent } from "@neon-spore/sim";
import { type Cue, panForCol } from "./bind.js";

type MimicSimEvent = Extract<SimEvent, { type: `mimic${string}` }>;

/** Whether an event is THE MIMIC's, so a page of the chain can hand it over whole. */
export function isMimicEvent(e: SimEvent): e is MimicSimEvent {
  return e.type.startsWith("mimic");
}

/**
 * THE MIMIC's thirteen, in a file of their own for `bind-gorge.ts`' reason.
 *
 * **Every one is in the middle**: the mantle hangs over the middle column and
 * its sign is on both halves of the field at once. **A peel rises as the
 * signs come off**, a hit as the core takes them, and **a reach deepens** as
 * the arms come down toward the hull, so the drawer hears how near it is
 * without looking up from the pad.
 */
export function mimicCue(e: MimicSimEvent, cols: number): Cue {
  const pan = panForCol(e.col, cols);
  switch (e.type) {
    case "mimicEnter":
      return { id: "boss.mimicEnter", pan };
    case "mimicSign":
      return { id: "boss.mimicSign", pan };
    case "mimicChange":
      return { id: "boss.mimicChange", pan };
    case "mimicPeel":
      return { id: "boss.mimicPeel", pan, pitch: 1 + Math.max(0, e.peels - 1) * 0.04 };
    case "mimicWrong":
      return { id: "boss.mimicWrong", pan };
    case "mimicLapse":
      return { id: "boss.mimicLapse", pan };
    case "mimicReach":
      return { id: "boss.mimicReach", pan, pitch: 1 - Math.max(0, e.reaches - 1) * 0.08 };
    case "mimicRoll":
      return { id: "boss.mimicRoll", pan };
    case "mimicCore":
      return { id: "boss.mimicCore", pan };
    case "mimicHit":
      return { id: "boss.mimicHit", pan, pitch: 1 + Math.max(0, e.hits - 1) * 0.08 };
    case "mimicClose":
      return { id: "boss.mimicClose", pan };
    case "mimicSpent":
      return { id: "boss.mimicSpent", pan };
    case "mimicOut":
      return { id: "boss.mimicOut", pan };
  }
}
