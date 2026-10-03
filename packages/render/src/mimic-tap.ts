import { mimicDraws, mimicFiring, mimicRows } from "@neon-spore/sim";
import { fieldCol } from "./field-flip.js";
import { colFromX, type Layout, rowFromY } from "./layout.js";
import type { Field, Touch } from "./touch.js";
import { bossOf } from "./touch-field.js";

/**
 * **A finger on THE MIMIC's board**: the square it came down on, as THE
 * MINE's `tapTile` (`mine-tap.ts`) — a column and a row, through the fold.
 *
 * Asked by `touch.ts` before a hand on a body, since the board covers the
 * field and a press on it is never a press on anything behind it. **Only
 * while this seat has a picture to paint**, or while the core is bare, when
 * either seat may tap it; and only on the board's own rows, so the clock's
 * row and the ship below it keep their own answers. The simulation checks
 * all of it again (`sim/mimic-hand.ts`): this file keeps a press it would
 * drop off the wire, and lets the director's stage — which asks this same
 * function — paint exactly as a phone does.
 */
export function mimicUnder(l: Layout, field: Field, x: number, y: number): Touch | null {
  const s = bossOf(field, "mimic");
  if (s === null) return null;
  if (!mimicFiring(s) && !mimicDraws(s, field.seat)) return null;
  const row = rowFromY(l, y);
  if (row < 0 || row >= mimicRows(field.cfg)) return null;
  return {
    player: field.seat,
    command: { kind: "tapTile", col: fieldCol(l, colFromX(l, x)), row },
    hold: null,
  };
}
