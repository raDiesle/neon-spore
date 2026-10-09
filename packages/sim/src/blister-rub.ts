import {
  BLISTER_HAND_DEAD,
  blisterBlow,
  blisterGestureOf,
  blisterIsUp,
  blisterMayTap,
} from "./blister.js";
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
 * **A rub belongs to the surfacing it began on**, as a stroke and a turn do:
 * a sink leaves every hand on it dead (`blister.ts`), so a thumb still
 * scrubbing when it comes up under another pore counts nothing until it
 * lifts. Two hands on a BOTH blister each count their own reversals.
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
  if (was === BLISTER_HAND_DEAD || !blisterIsUp(c) || !blisterMayTap(c, player)) return;
  const count = Math.max(0, command.id ?? 0);
  setRubAt(c, player, count);
  const fresh = was === undefined ? 0 : count - was;
  for (let i = 0; i < fresh && world.creatures.includes(c); i++) blisterBlow(world, c);
}

/** Whether a hand that still counts is rubbing it now — one the sink did not deaden. */
export function blisterRubbing(c: Creature): boolean {
  return [c.blisterRubAt1, c.blisterRubAt2].some(
    (at) => at !== undefined && at !== BLISTER_HAND_DEAD,
  );
}

function rubAt(c: Creature, player: 1 | 2): number | undefined {
  return player === 1 ? c.blisterRubAt1 : c.blisterRubAt2;
}

function setRubAt(c: Creature, player: 1 | 2, at: number | undefined): void {
  if (player === 1) c.blisterRubAt1 = at;
  else c.blisterRubAt2 = at;
}
