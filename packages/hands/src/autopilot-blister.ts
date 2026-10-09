import {
  BEARING_TURN,
  BLISTER_HAND_DEAD,
  beatPhaseTicks,
  blisterByOf,
  blisterGestureOf,
  blisterIsUp,
  blisterTurnWayOf,
  blisterWayOf,
  type Creature,
  gripsCreature,
  NO_BEARING,
  type TimedCommand,
  ticksPerBeat,
  type World,
} from "@neon-spore/sim";

/**
 * **THE BLISTER on AUTO, all five gestures**, each the way a thumb does it
 * (`docs/spec/blister.md`, *The gestures*), from the seat its `by` names —
 * player 2 when both may, as the tap is.
 *
 * Every hand here reads where it is off the body rather than keeping a note of
 * its own, so AUTO stays a function of the world: a stroke open, a turn's last
 * bearing, a rub's last count are all on the creature. **A blow a beat**,
 * whichever gesture, which is the tap's pace and a HOLD's by definition — a
 * stroke and a rub's reversal land half a beat in, where the tap does, and a
 * turn is wound once round across the beat. A hand the sink left dead on the
 * body lifts, which is the only way it counts again.
 */

type Press = Omit<TimedCommand, "tick">;

/** The seat whose hand counts on it: its `by`, or player 2 on a BOTH. */
function seatOf(c: Creature): 1 | 2 {
  return blisterByOf(c) === 1 ? 1 : 2;
}

/** Whether this is the tick half a beat in, where a tap and a stroke land. */
function halfBeat(w: World): boolean {
  return beatPhaseTicks(w.cfg, w.tick) === Math.floor(ticksPerBeat(w.cfg) / 2);
}

/** Every blister's hand this tick, by the gesture it wants. */
export function handBlisters(w: World): Press[] {
  const out: Press[] = [];
  for (const c of w.creatures) {
    if (c.kind !== "blister") continue;
    const press = HAND[blisterGestureOf(c)](w, c, seatOf(c));
    if (press) out.push(press);
  }
  return out;
}

const HAND: Record<ReturnType<typeof blisterGestureOf>, Hand> = {
  tap: tap,
  hold: hold,
  swipe: swipe,
  turn: turn,
  rub: rub,
};

type Hand = (w: World, c: Creature, seat: 1 | 2) => Press | null;

function tap(w: World, c: Creature, player: 1 | 2): Press | null {
  if (!blisterIsUp(c) || !halfBeat(w)) return null;
  return { player, command: { kind: "tap", id: c.id } };
}

/** A grip kept on it while it is up; the sink lets go of it (`blister-hold.ts`). */
function hold(w: World, c: Creature, player: 1 | 2): Press | null {
  if (!blisterIsUp(c) || gripsCreature(w, player, c.id)) return null;
  return { player, command: { kind: "grip", id: c.id } };
}

/** Pressed half a beat in, and lifted the next tick a whole stroke its way. */
function swipe(w: World, c: Creature, player: 1 | 2): Press | null {
  const mine = (c.blisterStrokes ?? 0) & (player | (player << 2));
  const drag = { kind: "drag", target: "blisterSwipe", id: c.id } as const;
  if (mine !== 0) {
    const reach = w.cfg.blisterSwipeMilli;
    const way = blisterWayOf(c);
    const fromMilli = way === "right" ? reach : way === "left" ? -reach : 0;
    const fromYMilli = way === "down" ? reach : way === "up" ? -reach : 0;
    return { player, command: { ...drag, on: false, fromMilli, fromYMilli } };
  }
  if (!blisterIsUp(c) || !halfBeat(w)) return null;
  return { player, command: { ...drag, on: true, fromMilli: 0, fromYMilli: 0 } };
}

/** Round the body its way, a whole turn across a beat (`blister-turn.ts`). */
function turn(w: World, c: Creature, player: 1 | 2): Press | null {
  const at = player === 1 ? c.blisterTurnAt1 : c.blisterTurnAt2;
  const drag = { kind: "drag", target: "blisterTurn", id: c.id } as const;
  if (at === BLISTER_HAND_DEAD) return { player, command: { ...drag, on: false, fromMilli: 0 } };
  if (!blisterIsUp(c)) return null;
  if (at === undefined) return { player, command: { ...drag, on: true, fromMilli: NO_BEARING } };
  const step = Math.ceil(BEARING_TURN / (ticksPerBeat(w.cfg) - 1));
  const way = blisterTurnWayOf(c) === "cw" ? 1 : -1;
  const from = at === NO_BEARING ? 0 : at;
  const fromMilli = (from + way * step + BEARING_TURN) % BEARING_TURN;
  return { player, command: { ...drag, on: true, fromMilli } };
}

/** A hand down on it, and a reversal half a beat in (`blister-rub.ts`). */
function rub(w: World, c: Creature, player: 1 | 2): Press | null {
  const at = player === 1 ? c.blisterRubAt1 : c.blisterRubAt2;
  // A `RubCount`: `id` is the reversals, so the body rides `fromMilli`.
  const drag = { kind: "drag", target: "blisterRub", fromMilli: c.id } as const;
  if (at === BLISTER_HAND_DEAD) return { player, command: { ...drag, on: false, id: 0 } };
  if (!blisterIsUp(c)) return null;
  if (at === undefined) return { player, command: { ...drag, on: true, id: 0 } };
  if (!halfBeat(w)) return null;
  return { player, command: { ...drag, on: true, id: at + 1 } };
}
