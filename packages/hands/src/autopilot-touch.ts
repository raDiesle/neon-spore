import {
  beatboxHitsMade,
  beatboxIsBox,
  beatboxWanted,
  beatPhaseTicks,
  type Creature,
  gripsCreature,
  mineSeenBy,
  type TimedCommand,
  type World,
} from "@neon-spore/sim";
import { handBlisters } from "./autopilot-blister.js";

/**
 * **THE WEIGHT, THE MINE, THE BEATBOX and THE BLISTER, on AUTO**: four bodies
 * answered by a finger on the body rather than by the cannon or the shield.
 *
 * A weight is crushed by a hand from each seat on it at once, held for
 * `weightCrushMs` (`weight.ts`). So both seats grip the weight nearest the
 * hull, and each keeps its grip until the body gives. A mine is answered by
 * the seat that cannot see it, with a finger on its exact tile (`mine.ts`).
 * AUTO has both screens, so that seat presses it the moment it stands. A box
 * is silenced by player 2 tapping it once a beat, on the beat, as many times
 * as it asks for, and then stopping (`beatbox.ts`). Each tap is on the beat
 * itself, the middle of the window a tap counts in. A blister is answered by the seat its `by` names,
 * a blow a beat, with whichever of its five gestures it wants
 * (`autopilot-blister.ts`).
 */

type Press = Omit<TimedCommand, "tick">;

/** The body of `kind` nearest the hull, if any. */
function lowestOf(w: World, kind: Creature["kind"]): Creature | undefined {
  let best: Creature | undefined;
  for (const c of w.creatures) {
    if (c.kind === kind && (best === undefined || c.row > best.row)) best = c;
  }
  return best;
}

/** Each seat's grip on the lowest weight, for a seat not already holding it. */
function crushWeight(w: World): Press[] {
  const body = lowestOf(w, "weight");
  if (body === undefined) return [];
  const seats: (1 | 2)[] = [1, 2];
  return seats
    .filter((p) => !gripsCreature(w, p, body.id))
    .map((player) => ({ player, command: { kind: "grip", id: body.id } }));
}

/** A finger on the lowest mine's tile, from the seat it is hidden from. */
function pressMine(w: World): Press[] {
  const body = lowestOf(w, "mine");
  if (body === undefined) return [];
  const player = mineSeenBy(body) === 1 ? 2 : 1;
  return [{ player, command: { kind: "tapTile", col: body.col, row: body.row } }];
}

/** Player 2's tap on every box whose run is still short, on the beat. */
function countBoxes(w: World): Press[] {
  if (beatPhaseTicks(w.cfg, w.tick) !== 0) return [];
  return w.creatures
    .filter((c) => beatboxIsBox(c) && beatboxHitsMade(c) < beatboxWanted(c))
    .map((c) => ({ player: 2, command: { kind: "tap", id: c.id } }));
}

/** Both seats' fingers on the bodies they answer by touch. */
export function touchBodies(w: World): Press[] {
  return [...crushWeight(w), ...pressMine(w), ...countBoxes(w), ...handBlisters(w)];
}
