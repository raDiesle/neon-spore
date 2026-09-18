import type { SimEvent } from "@neon-spore/sim";
import { type Cue, panForCol } from "./bind.js";

/**
 * PINBALL's two hands on the table, in a file of their own for
 * `bind-snake-body.ts`' reason — `bind.ts` is full — and the first cues in the
 * game with **no column at all**: the table is drawn whole on both screens and
 * a plunger is at the bottom of it, so a pan taken off a column would be a pan
 * about the field this round has thrown away.
 *
 * The wind is the spring coming back under player 1's thumb: a ratchet, and
 * player 2's cue that the bar is about to run again and her launch is live.
 * The nudge is the table shoved, panned the way she shoved it, because which
 * way is the only thing about it he cannot read off the ball in the second it
 * takes to happen. The tilt is that refused — heavier, and falling, so a hand
 * that has been killed is heard as different from one that worked
 * (`sim/pinball-hand.ts`).
 */
export function pinballHandCue(
  e: Extract<SimEvent, { type: "pinWind" | "pinNudge" | "pinTilt" }>,
  cols: number,
): Cue {
  if (e.type === "pinWind") return { id: "boss.pinWind", pan: 0 };
  if (e.type === "pinTilt") return { id: "boss.pinTilt", pan: 0 };
  // The shove's own direction, said as a pan: the middle column, one step the
  // way she carried it, through the same reading every other cue uses.
  const mid = (cols - 1) / 2;
  return { id: "boss.pinNudge", pan: panForCol(mid + e.way, cols) };
}
