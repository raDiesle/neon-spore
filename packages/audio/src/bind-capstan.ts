import type { SimEvent } from "@neon-spore/sim";
import { type Cue, panForCol } from "./bind.js";

type CapstanSimEvent = Extract<SimEvent, { type: `capstan${string}` }>;

/** Whether an event is THE CAPSTAN's, so a page of the chain can hand it over whole. */
export function isCapstanEvent(e: SimEvent): e is CapstanSimEvent {
  return e.type.startsWith("capstan");
}

/**
 * THE CAPSTAN's fourteen, in a file of their own for `bind-gorge.ts`' reason.
 *
 * **Heard where they happen**: the drum hangs over `midCol`, so every one of
 * them is in the middle.
 *
 * **A hit rises as they add up**, and so does a band's wear, so how far the
 * pair are along can be heard without either of them looking.
 */
export function capstanCue(e: CapstanSimEvent, cols: number): Cue {
  const pan = panForCol(e.col, cols);
  switch (e.type) {
    case "capstanEnter":
      return { id: "boss.capstanEnter", pan };
    case "capstanLight":
      return { id: "boss.capstanLight", pan };
    case "capstanRock":
      return { id: "boss.capstanRock", pan };
    case "capstanDrift":
      return { id: "boss.capstanDrift", pan };
    case "capstanWear":
      return { id: "boss.capstanWear", pan, pitch: 1 + Math.max(0, e.wear - 1) * 0.03 };
    case "capstanBright":
      return { id: "boss.capstanBright", pan };
    case "capstanBare":
      return { id: "boss.capstanBare", pan };
    case "capstanKept":
      return { id: "boss.capstanKept", pan };
    case "capstanStall":
      return { id: "boss.capstanStall", pan };
    case "capstanCover":
      return { id: "boss.capstanCover", pan };
    case "capstanHit":
      return { id: "boss.capstanHit", pan, pitch: 1 + Math.max(0, e.hits - 1) * 0.08 };
    case "capstanMiss":
      return { id: "boss.capstanMiss", pan };
    case "capstanOpen":
      return { id: "boss.capstanOpen", pan };
    case "capstanOut":
      return { id: "boss.capstanOut", pan };
  }
}
