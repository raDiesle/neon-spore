import type { SimEvent } from "@neon-spore/sim";
import type { Cue } from "./bind-cue.js";

/**
 * THE SCOUT's two hands on its picture, in a file of their own for
 * `bind-pinball-hand.ts`' reason — `bind.ts` is full — and, like that one,
 * with **no column at all**: the arena is the field's columns but the ship is
 * a point in it rather than a body standing in a lane, and a pan taken off
 * where it happens to be would move under a sound that is about a hand.
 *
 * The reel is the line going on: a low haul, and player 1's cue that his own
 * controls have just gone dead. The slip is it coming off, rising, because
 * what he has to hear is that the ship is his again. The prime is the
 * thruster catching — short, bright and over, and it is player 2's cue that
 * the burn she is about to ask for will take (`sim/scout-hand.ts`).
 */
export function scoutHandCue(
  e: Extract<SimEvent, { type: "scoutReel" | "scoutSlip" | "scoutPrime" }>,
): Cue {
  if (e.type === "scoutReel") return { id: "boss.scoutReel", pan: 0 };
  if (e.type === "scoutSlip") return { id: "boss.scoutSlip", pan: 0 };
  return { id: "boss.scoutPrime", pan: 0 };
}
