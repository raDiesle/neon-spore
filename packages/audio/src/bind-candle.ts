import type { SimEvent } from "@neon-spore/sim";
import { type Cue, panForCol } from "./bind.js";

/**
 * THE CANDLE's seven, in a file of their own for `bind-undertow.ts`' reason.
 *
 * Panned wherever the event has a column, because in the dark a pan is the
 * only bearing the ear gets: where the glow is, where it went, where it is
 * facing. The dark arriving and the light going out are the whole field and
 * have no column — no pan, like `boss.undertowRise`.
 */
export function candleCue(
  e: Extract<
    SimEvent,
    {
      type:
        | "candleDark"
        | "candleDim"
        | "candleMove"
        | "candleTurn"
        | "candleFed"
        | "candleLast"
        | "candleOut";
    }
  >,
  cols: number,
): Cue {
  switch (e.type) {
    case "candleDark":
      return { id: "boss.candleDark" };
    case "candleDim":
      // Lower with every step left: the pair hears how much light there is.
      return { id: "boss.candleDim", pan: panForCol(e.col, cols), pitch: 0.8 + e.left * 0.06 };
    case "candleMove":
      return { id: "boss.candleMove", pan: panForCol(e.col, cols) };
    case "candleTurn":
      return { id: "boss.candleTurn", pan: panForCol(e.col, cols) };
    case "candleFed":
      return { id: "boss.candleFed", pan: panForCol(e.col, cols) };
    case "candleLast":
      return { id: "boss.candleLast", pan: panForCol(e.col, cols) };
    case "candleOut":
      return { id: "boss.candleOut" };
  }
}
