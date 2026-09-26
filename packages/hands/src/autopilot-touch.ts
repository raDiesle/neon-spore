import {
  beatboxHitsMade,
  beatboxIsBox,
  beatboxWanted,
  beatPhaseTicks,
  type Creature,
  gripsCreature,
  gumIsFlung,
  midCol,
  mineSeenBy,
  type TimedCommand,
  type World,
} from "@neon-spore/sim";

/**
 * **THE WEIGHT, THE MINE, THE BEATBOX and THE GUM, on AUTO**: four bodies
 * answered by a finger on the body rather than by the cannon or the shield.
 *
 * A weight is crushed by a hand from each seat on it at once, held for
 * `weightCrushMs` (`weight.ts`). So both seats grip the weight nearest the
 * hull, and each keeps its grip until the body gives. A mine is answered by
 * the seat that cannot see it, with a finger on its exact tile (`mine.ts`).
 * AUTO has both screens, so that seat presses it the moment it stands. A box
 * is silenced by player 2 tapping it once a beat, on the beat, as many times
 * as it asks for, and then stopping (`beatbox.ts`). Each tap is on the beat
 * itself, the middle of the window a tap counts in. A gum is swiped out of the
 * air by either seat (`gum.ts`): player 2 grips the lowest one still falling,
 * which leaves player 1's hands on the cannon, and carries it a swipe's worth
 * toward the nearer wall.
 */

type Press = Omit<TimedCommand, "tick">;

/** The body of `kind` nearest the hull that `take` allows, if any. */
function lowestOf(
  w: World,
  kind: Creature["kind"],
  take: (c: Creature) => boolean = () => true,
): Creature | undefined {
  let best: Creature | undefined;
  for (const c of w.creatures) {
    if (c.kind === kind && take(c) && (best === undefined || c.row > best.row)) best = c;
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

/** Player 2's grip on the lowest gum still falling, then the swipe. */
function swipeGum(w: World): Press[] {
  const body = lowestOf(w, "gum", (c) => !gumIsFlung(c));
  if (body === undefined) return [];
  if (!gripsCreature(w, 2, body.id)) return [{ player: 2, command: { kind: "grip", id: body.id } }];
  const dir = body.col < midCol(w.cfg) ? -1 : 1;
  const command = {
    kind: "drag",
    target: "gripBody",
    on: true,
    id: body.id,
    fromMilli: dir * w.cfg.gumSwipeMilli,
  } as const;
  return [{ player: 2, command }];
}

/** Both seats' fingers on the bodies they answer by touch. */
export function touchBodies(w: World): Press[] {
  return [...crushWeight(w), ...pressMine(w), ...countBoxes(w), ...swipeGum(w)];
}
