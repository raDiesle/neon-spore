import {
  type Color,
  type Creature,
  gripsCreature,
  magnetPoleColor,
  midCol,
  type TimedCommand,
  type World,
} from "@neon-spore/sim";

/**
 * **THE MAGNET, on AUTO**: a body whose plate refuses a shot from underneath,
 * answered by a shot that comes in from the side (`magnet.ts`).
 *
 * Only a locked shot turns, and the lock is player 1's hand on the body
 * (`lock.ts`). So the cannon stands a column beside the magnet, toward the
 * middle of the field where there is one, and then player 1's hand goes on the
 * body. Player 2 fires the colour of the pole on the side the cannon stands
 * on: the magnet's own colour from the left, the other one from the right.
 */

type Press = Omit<TimedCommand, "tick">;

/** The column the cannon stands in to reach this magnet from the side. */
export function magnetSide(w: World, c: Creature): number {
  return c.col < midCol(w.cfg) ? c.col + 1 : c.col - 1;
}

/** Player 1's hand on `body` once the cannon is beside it, if it is a magnet. */
export function lockMagnet(w: World, body: Creature | undefined): Press[] {
  if (body?.kind !== "magnet" || w.cannonCol === body.col) return [];
  if (gripsCreature(w, 1, body.id)) return [];
  return [{ player: 1, command: { kind: "grip", id: body.id } }];
}

/** The colour a shot at `body` is fired in, from where the cannon stands. */
export function shotColor(w: World, body: Creature | undefined): Color {
  if (body?.kind === "magnet") return magnetPoleColor(body, w.cannonCol < body.col) ?? "red";
  return body?.color ?? "red";
}
