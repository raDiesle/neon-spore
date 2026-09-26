import type { SimEvent } from "@neon-spore/sim";
import { type Cue, panForCol, pitchForRow } from "./bind.js";

/**
 * **The ship's own six**: a bolt leaving the cannon, a lance filling or
 * spilling, a shot flying on into the sky, and the grip's two gestures — the
 * hand taking hold and the hand carrying. Cut out of `bind.ts` when THE
 * SHIELD's push took it to its line limit (26 September 2026), along the seam
 * `bind-impact.ts` took before it: everything here is something the pair did
 * with the ship, never a body answering.
 */
const SHIP_EVENTS = ["fire", "lanceFull", "lanceSpilled", "shotOut", "grip", "carry"] as const;
type ShipEvent = Extract<SimEvent, { type: (typeof SHIP_EVENTS)[number] }>;

/** The family, so `cueFor` reads one guard rather than six cases. */
export function isShipEvent(e: SimEvent): e is ShipEvent {
  return (SHIP_EVENTS as readonly string[]).includes(e.type);
}

export function shipCue(e: ShipEvent, cols: number, rows: number): Cue | null {
  switch (e.type) {
    case "fire":
      // A lance is a different sound, not a louder one: the pair spent three
      // beats of held thumb and a silence on it, and it has to be audible that
      // what left the lobe was the thing they were waiting for.
      if (e.lance) return { id: "signal.markHit", pan: panForCol(e.col, cols) };
      return {
        id: e.color === "red" ? "ship.fireRed" : "ship.fireCyan",
        pan: panForCol(e.col, cols),
      };
    case "lanceFull":
      return { id: "signal.markSet", pan: panForCol(e.col, cols) };
    case "lanceSpilled":
      return { id: "signal.markMissed", pan: panForCol(e.col, cols) };
    case "shotOut":
      // The bolt was heard leaving; what it flies on into is sky, and a boss
      // that took it up there says so in its own event.
      return null;
    case "grip":
      return { id: "ship.gripTake", pan: panForCol(e.col, cols), pitch: pitchForRow(e.row, rows) };
    // THE PUSH, the same hand's second gesture. Deliberately not another
    // `ship.gripTake`: the pair has already heard the grab, and a carry that
    // sounded like one would say a hand had landed on something new. What the
    // seat without the thumb on it needs is the *column*, which the pan says —
    // and the direction, which lifts or drops it about a semitone on top of
    // the row's own pitch. Neither is visible to an eye on the other half of
    // the screen, and both are what the pair is about to say aloud.
    case "carry":
      return {
        id: "ship.gripCarry",
        pan: panForCol(e.col, cols),
        pitch: pitchForRow(e.row, rows) * (e.dir === 1 ? 1.06 : 0.94),
      };
  }
}
