import type { SimEvent } from "@neon-spore/sim";
import { type Cue, panForCol } from "./bind.js";

/**
 * SNAKE's hand on its own body, in a file of their own for
 * `bind-vane.ts`' reason — `bind.ts` is full — and panned by the arena's own
 * column, which is the only place in the game a pan is not a column of the
 * field (`snake.ts`: the field is gone).
 *
 * The prise is jaws that have stuck being hauled apart: wet, and over before
 * the next tile, because it is player 2's cue that the mouth is open and the
 * point she is driving at can be taken (`sim/snake-controls.ts`). The lift and
 * the drop of the tail went with its hold, 6 October 2026.
 */
export function snakeBodyCue(e: Extract<SimEvent, { type: "snakePrise" }>, cols: number): Cue {
  return { id: "boss.snakePrise", pan: panForCol(e.col, cols) };
}
