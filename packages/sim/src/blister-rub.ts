import { blisterDealt, blisterGestureOf, blisterIsUp, blisterMayTap } from "./blister.js";
import type { Command, Creature } from "./types.js";
import type { World } from "./world.js";

/**
 * **THE BLISTER's RUB** (`docs/spec/blister.md`, *The gestures*): a scrub
 * back and forth over the body, a blow for every reversal.
 *
 * The hand is a `RubCount` (`drag-targets-e.ts`) on `blisterRub`: `id` how
 * many times the thumb has turned back since it went down, counted by the
 * host that owns the pointers (`render/rub-turns.ts`), and — because `id` is
 * the count — **the body in `fromMilli`**. Each count higher than the last
 * this hand sent is that many fresh reversals, and every one is a blow, as
 * THE CAPSTAN reads its own (`capstan-hand.ts`); the lift starts it again.
 *
 * **A rub is one surfacing's**, as a stroke and a turn are: the first
 * reversal knocks the body out (`blister.ts`), so no hand on it outlives it.
 * Two hands on an EITHER blister each count their own reversals; on a BOTH
 * one a seat's reversal is its half (`blisterDealt`).
 */
export function blisterRubHeard(world: World, player: 1 | 2, command: Command): void {
  if (command.kind !== "drag" || command.target !== "blisterRub") return;
  const c = world.creatures.find((x) => x.id === command.fromMilli);
  if (c === undefined || blisterGestureOf(c) !== "rub") return;
  const was = rubAt(c, player);
  if (!command.on) {
    setRubAt(c, player, undefined);
    return;
  }
  if (!blisterIsUp(c) || !blisterMayTap(c, player)) return;
  const count = Math.max(0, command.id ?? 0);
  setRubAt(c, player, count);
  const fresh = was === undefined ? 0 : count - was;
  for (let i = 0; i < fresh && world.creatures.includes(c); i++) blisterDealt(world, c, player);
}

/** Whether a hand is rubbing it now. */
export function blisterRubbing(c: Creature): boolean {
  return c.blisterRubAt1 !== undefined || c.blisterRubAt2 !== undefined;
}

function rubAt(c: Creature, player: 1 | 2): number | undefined {
  return player === 1 ? c.blisterRubAt1 : c.blisterRubAt2;
}

function setRubAt(c: Creature, player: 1 | 2, at: number | undefined): void {
  if (player === 1) c.blisterRubAt1 = at;
  else c.blisterRubAt2 = at;
}
