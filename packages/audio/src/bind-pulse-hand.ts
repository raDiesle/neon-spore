import type { SimEvent } from "@neon-spore/sim";
import type { Cue } from "./bind-cue.js";

/**
 * THE PULSE's hand on the bar, in a file of their own for
 * `bind-scout-hand.ts`' reason — `bind.ts` is full — and with no column, for
 * its reason too: the meter is one object belonging to the pair and it is
 * drawn in the same place on both screens.
 *
 * The brace is a thumb landing on the bar: a low catch, panned to the seat
 * that made it, because the only thing the other one has to know is **which of
 * them** is out of the song. The slip is that coming off, rising, the same
 * pair of sounds THE SCOUT's line has. The arrest is both thumbs on at once —
 * the one moment in this round neither of them can reach alone — and it is
 * centred, because it belongs to both (`sim/pulse-hand.ts`).
 */
export function pulseHandCue(
  e: Extract<SimEvent, { type: "pulseBrace" | "pulseSlip" | "pulseArrest" }>,
): Cue {
  if (e.type === "pulseArrest") return { id: "boss.pulseArrest", pan: 0 };
  // The seat, as a pan: player 1 to the left of the bar and player 2 to the
  // right, which is where each of them is drawn on the other's screen.
  const pan = e.player === 1 ? -0.4 : 0.4;
  return { id: e.type === "pulseBrace" ? "boss.pulseBrace" : "boss.pulseSlip", pan };
}
