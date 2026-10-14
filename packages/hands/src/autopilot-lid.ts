import {
  type Creature,
  lidIsOpen,
  lidWayNow,
  lidWayRoom,
  lidWayVec,
  type TimedCommand,
  type World,
} from "@neon-spore/sim";

/**
 * **THE LID, on AUTO**: an eye whose plates a hand has to hold open while the
 * other seat fires into it (`lid.ts`).
 *
 * Player 1 has both thumbs' worth of it here: the cannon stands under the lid
 * as under any body, and the same seat takes the cord and pulls it to full
 * tension. The field hand holds its fire until the lens is bare. The cord
 * runs one way, the one the field has room for (`lid-way.ts`), so the hand
 * pulls the whole cord along it — and does not reach for a lid whose every
 * way is shorter than the cord.
 */

type Press = Omit<TimedCommand, "tick">;

/** Player 1's hand on the cord of `body`, if it is a lid not yet open. */
export function holdLid(w: World, body: Creature | undefined): Press[] {
  if (body?.kind !== "lid" || lidIsOpen(w.cfg, body)) return [];
  const taut = w.cfg.lidTautMilli;
  const way = lidWayNow(w.cfg, body);
  if (lidWayRoom(w.cfg, body, way) < taut) return [];
  const v = lidWayVec(way);
  const command = {
    kind: "drag",
    target: "lidString",
    on: true,
    id: body.id,
    fromMilli: v.dx * taut,
    fromYMilli: v.dy * taut,
  } as const;
  return [{ player: 1, command }];
}

/** Whether the cannon holds its fire at `body`: a lid with its plates shut. */
export function lidShut(w: World, body: Creature | undefined): boolean {
  return body?.kind === "lid" && !lidIsOpen(w.cfg, body);
}
