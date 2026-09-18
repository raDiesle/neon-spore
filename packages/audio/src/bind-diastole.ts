import type { SimEvent } from "@neon-spore/sim";
import { type Cue, panForCol } from "./bind.js";

/**
 * THE DIASTOLE's two, in a file of their own for `bind-gorge.ts`' reason,
 * and both panned to the right chamber's column: the clamp is a thumb on a
 * thing in a lane, and the seat that cannot see the chamber beat hears
 * where the other seat's hand landed.
 *
 * The clamp is the sound of a beat *caught* — a short grip, and the beat is
 * player 2's cue to fire, so it has to arrive on the tick and be over by the
 * next. The spasm is the chamber refusing: longer, lower, and unmistakably
 * not a hit, because eight beats of nothing landing follow it and the pair
 * has to know from the first of them that the count is to blame
 * (`sim/diastole-hand.ts`).
 */
export function diastoleCue(
  e: Extract<SimEvent, { type: "diastoleClamp" | "diastoleSpasm" }>,
  cols: number,
): Cue {
  switch (e.type) {
    case "diastoleClamp":
      return { id: "boss.diastoleClamp", pan: panForCol(e.col, cols) };
    case "diastoleSpasm":
      return { id: "boss.diastoleSpasm", pan: panForCol(e.col, cols) };
  }
}
