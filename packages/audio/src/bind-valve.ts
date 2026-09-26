import type { SimEvent } from "@neon-spore/sim";
import { type Cue, panForCol } from "./bind.js";

/**
 * THE VALVE's thirteen, in a file of their own for `bind-gorge.ts`' reason.
 *
 * **Everything is heard from the middle**, THE MANTLE's argument: the drum
 * stands over `midCol` and so does the spark it leaks, and nothing about the
 * question is which side.
 *
 * **The pull is pitched up per pin out**, so how far the pair are along can be
 * heard without either of them counting.
 */
export function valveCue(e: Extract<SimEvent, { type: `valve${string}` }>, cols: number): Cue {
  const pan = panForCol(e.col, cols);
  switch (e.type) {
    case "valveEnter":
      return { id: "boss.valveEnter", pan };
    case "valveLight":
      return { id: "boss.valveLight", pan };
    case "valveHold":
      return { id: "boss.valveHold", pan };
    case "valveSlip":
      return { id: "boss.valveSlip", pan };
    case "valveLapse":
      return { id: "boss.valveLapse", pan };
    case "valveFreeze":
      return { id: "boss.valveFreeze", pan };
    case "valveThaw":
      return { id: "boss.valveThaw", pan };
    case "valvePull":
      // Higher as the pins run out: the drum emptying reads as the pop rising.
      return { id: "boss.valvePull", pan, pitch: 1 + Math.max(0, 3 - e.pins) * 0.06 };
    case "valveSpark":
      return { id: "boss.valveSpark", pan };
    case "valveSparkOut":
      return { id: "boss.valveSparkOut", pan };
    case "valveSparkHit":
      return { id: "boss.valveSparkHit", pan };
    case "valveOpen":
      return { id: "boss.valveOpen", pan };
    case "valveOut":
      return { id: "boss.valveOut", pan };
  }
}
