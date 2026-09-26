import type { SimEvent } from "@neon-spore/sim";
import { type Cue, panForCol } from "./bind.js";

/**
 * THE VANE's two hands on its own mechanism, in a file of their own for
 * `bind-warden-hand.ts`' reason — `bind.ts` is full — and all three panned to
 * the column the arm is standing in, because each is a hand on a thing in a
 * lane the other seat cannot feel.
 *
 * The pin is the arm coming to a stop under a thumb: a short catch, because it
 * is the navigator's cue that the fold line has stopped moving and the column
 * she is about to say will still be true when it arrives. The slip is that
 * gone — heavier, with nothing rising in it, so a lift and a tear are heard as
 * the same loss whichever it was (`sim/vane-hand.ts`). The haul is the seized
 * housing coming off the bearing: the pilot's cue that the shot he is standing
 * under is now worth taking. The knock is a pin gone out of the bearing under
 * a shot: the one moment the pair beat the boss, and heard as that.
 */
export function vaneCue(
  e: Extract<SimEvent, { type: "vanePin" | "vaneSlip" | "vaneHaul" | "vaneKnock" }>,
  cols: number,
): Cue {
  switch (e.type) {
    case "vanePin":
      return { id: "boss.vanePin", pan: panForCol(e.col, cols) };
    case "vaneSlip":
      return { id: "boss.vaneSlip", pan: panForCol(e.col, cols) };
    case "vaneHaul":
      return { id: "boss.vaneHaul", pan: panForCol(e.col, cols) };
    case "vaneKnock":
      return { id: "boss.vaneKnock", pan: panForCol(e.col, cols) };
  }
}
