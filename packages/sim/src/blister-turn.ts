import { MAX_BEARING_STEP, NO_BEARING, TURN } from "./bearing.js";
import {
  BLISTER_HAND_DEAD,
  blisterBlow,
  blisterGestureOf,
  blisterIsUp,
  blisterMayTap,
} from "./blister.js";
import type { BlisterTurnWay } from "./creature-state-blister.js";
import type { Command, Creature } from "./types.js";
import type { World } from "./world.js";

/**
 * **THE BLISTER's TURN** (`docs/spec/blister.md`, *The gestures*): the
 * owner's circle round the body, a full turn the way its channel runs for
 * every blow.
 *
 * The hand is a `drag` on `blisterTurn` with `id` the body, read the crank's
 * way (`crank.ts`, `bearing.ts`): the press says only that a hand is on
 * (`NO_BEARING`), every move says where round the body's centre the thumb is,
 * in thousandths of a turn clockwise from the top, and the step between two
 * bearings — up to half a turn — is progress. A step the wrong way round is
 * nothing, and nothing is taken back for it; THE INSTAR's turn mark reads its
 * thumb the same way (`instar-hand.ts`).
 *
 * **A turn belongs to the surfacing it began on**, as a SWIPE's stroke does:
 * a sink loses the turn short of whole and leaves every hand on it dead
 * (`blister.ts`), so a thumb still down when it comes up under another pore
 * counts nothing until it lifts. Two hands on a BOTH blister wind the one
 * turn between them, as two tapping hands share the one count.
 */
export function blisterTurnHeard(world: World, player: 1 | 2, command: Command): void {
  if (command.kind !== "drag" || command.target !== "blisterTurn") return;
  const c = world.creatures.find((x) => x.id === command.id);
  if (c === undefined || blisterGestureOf(c) !== "turn") return;
  const was = turnAt(c, player);
  if (!command.on) {
    setTurnAt(c, player, undefined);
    return;
  }
  if (was === BLISTER_HAND_DEAD || !blisterIsUp(c) || !blisterMayTap(c, player)) return;
  if (command.fromMilli < 0) {
    setTurnAt(c, player, NO_BEARING);
    return;
  }
  const at = ((command.fromMilli % TURN) + TURN) % TURN;
  setTurnAt(c, player, at);
  if (was === undefined || was === NO_BEARING) return;
  const way = blisterTurnWayOf(c) === "cw" ? 1 : -1;
  const step = (way * (at - was) + TURN) % TURN;
  if (step === 0 || step > MAX_BEARING_STEP) return;
  const turned = (c.blisterTurnedMilli ?? 0) + step;
  c.blisterTurnedMilli = turned >= TURN ? turned - TURN : turned;
  if (c.blisterTurnedMilli === 0) c.blisterTurnedMilli = undefined;
  if (turned >= TURN) blisterBlow(world, c);
}

/** The way it counts, with the default spelled once. */
export function blisterTurnWayOf(c: Creature): BlisterTurnWay {
  return c.blisterWay === "ccw" ? "ccw" : "cw";
}

/** How far round the turn in progress has come, 0..1: what the channel fills to. */
export function blisterTurnShare(c: Creature): number {
  return (c.blisterTurnedMilli ?? 0) / TURN;
}

/** Whether a hand that still counts is on it now — one the sink did not deaden. */
export function blisterTurnHeld(c: Creature): boolean {
  return [c.blisterTurnAt1, c.blisterTurnAt2].some(
    (at) => at !== undefined && at !== BLISTER_HAND_DEAD,
  );
}

function turnAt(c: Creature, player: 1 | 2): number | undefined {
  return player === 1 ? c.blisterTurnAt1 : c.blisterTurnAt2;
}

function setTurnAt(c: Creature, player: 1 | 2, at: number | undefined): void {
  if (player === 1) c.blisterTurnAt1 = at;
  else c.blisterTurnAt2 = at;
}
