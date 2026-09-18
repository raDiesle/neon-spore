import type { SimEvent } from "@neon-spore/sim";
import { type Cue, panForCol } from "./bind.js";

/**
 * SNAKE's two hands on its own body, in a file of their own for
 * `bind-vane.ts`' reason — `bind.ts` is full — and panned by the arena's own
 * column, which is the only place in the game a pan is not a column of the
 * field (`snake.ts`: the field is gone).
 *
 * The prise is jaws that have stuck being hauled apart: wet, and over before
 * the next tile, because it is player 2's cue that the mouth is open and the
 * point she is driving at can be taken. The lift is the tail coming off the
 * arena under her thumb, and the drop is it coming back down — those two are
 * player 1's, and they are the same sound falling and rising, because what he
 * has to hear is which of the two just happened rather than that something
 * did (`sim/snake-controls.ts`).
 */
export function snakeBodyCue(
  e: Extract<SimEvent, { type: "snakePrise" | "snakeLift" | "snakeDrop" }>,
  cols: number,
): Cue {
  switch (e.type) {
    case "snakePrise":
      return { id: "boss.snakePrise", pan: panForCol(e.col, cols) };
    case "snakeLift":
      return { id: "boss.snakeLift", pan: panForCol(e.col, cols) };
    case "snakeDrop":
      return { id: "boss.snakeDrop", pan: panForCol(e.col, cols) };
  }
}
