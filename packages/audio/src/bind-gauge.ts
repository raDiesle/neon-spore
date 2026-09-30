import type { SimEvent } from "@neon-spore/sim";
import type { Cue } from "./bind-cue.js";

/**
 * THE GAUGE's seven, in a file of their own for `bind-pulse-hand.ts`'s reason —
 * `bind-choreographed-b.ts` was full — and, like that one, panned to the
 * middle rather than to a column: the needle and the band are both drawn
 * state on the plate, never a body standing over a lane, so there is no
 * column for either sound to stand in (`sim/events-gauge.ts`).
 *
 * The mark is a call landing: bright and short. The miss is it landing wrong:
 * the same call falling instead of settling, so the two read as opposites at
 * a glance even though neither seat can look away from the dial to check. The
 * jam is the valve seizing under a hand about to find out the hard way — a
 * catch with nothing behind it. The bind is the band winding tight: a slow
 * climb to a stop, hers to hear coming before her thumb has to answer it.
 * The pull is the loose tooth coming out of its socket, wet and final; a
 * wrong pull is the miss, because that is what it costs (`sim/gauge-tooth.ts`).
 */
export function gaugeCue(e: Extract<SimEvent, { type: `gauge${string}` }>): Cue | null {
  switch (e.type) {
    case "gaugeMark":
      return { id: "boss.gaugeMark", pan: 0 };
    case "gaugeMiss":
      return { id: "boss.gaugeMiss", pan: 0 };
    case "gaugeJam":
      return { id: "boss.gaugeJam", pan: 0 };
    case "gaugeBind":
      return { id: "boss.gaugeBind", pan: 0 };
    case "gaugePull":
      return { id: "boss.gaugePull", pan: 0 };
    case "gaugeWrongPull":
      return { id: "boss.gaugeMiss", pan: 0 };
    case "gaugeHold":
      // Silent by design: the ring filling says it on the one screen that shows
      // it, and a sound would tell the other seat what the round keeps from it.
      return null;
  }
}
