import { fieldCol } from "./field-flip.js";
import { colFromX, type Layout, rowFromY } from "./layout.js";
import type { Field, Touch } from "./touch.js";
import type { Hold } from "./touch-hold.js";

/**
 * **A finger on THE DARK**: a press anywhere on the field lights the square
 * under it, and a drag lights every square it crosses (`sim/dark.ts`).
 *
 * Asked before `creatureAt` while the dark is down, so a press there is a
 * light and never a hand: a body nobody can see is not one anybody meant to
 * take hold of, and a thumb that found one instead of lighting the dark would
 * be a press that did nothing the player could see. Either seat, because the
 * light is shared — it goes through the simulation, and both screens show it.
 */
export function darkUnder(l: Layout, field: Field, x: number, y: number): Touch | null {
  if (!field.faults.some((f) => f.kind === "dark")) return null;
  const col = fieldCol(l, colFromX(l, x));
  const row = rowFromY(l, y);
  return {
    player: field.seat,
    command: { kind: "light", col, row },
    hold: { kind: "light", player: field.seat, col, row },
  };
}

/**
 * The same finger, dragged. **One command per square, not per sample**: a
 * move arrives every frame, and the square it names is the one it named last
 * time far more often than not. The hold is the one the press made and is
 * kept for the whole gesture, so the last square is written back onto it.
 */
export function lightMove(
  l: Layout,
  hold: Extract<Hold, { kind: "light" }>,
  x: number,
  y: number,
): Touch | null {
  const col = fieldCol(l, colFromX(l, x));
  const row = rowFromY(l, y);
  if (col === hold.col && row === hold.row) return null;
  hold.col = col;
  hold.row = row;
  return { player: hold.player, command: { kind: "light", col, row }, hold };
}
