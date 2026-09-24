import {
  type LeadState,
  leadAsk,
  leadBoss,
  leadGrippable,
  leadHolding,
  leadStill,
} from "./lead.js";
import type { Command } from "./types.js";
import type { World } from "./world.js";

/**
 * **The navigator's thumb on THE LEAD's stalk**, off the wire, on the tick.
 *
 * The boss shipped without a hand on it on purpose. `grippable.ts` refuses a
 * hand on a boss body, and here that refusal is the mechanic: a thumb on the
 * body would steer every shot into it, and steering a shot to where a body
 * *will be* is the question the whole fight is. What this hand takes hold of
 * is the one state where there is nothing to steer — the still, where
 * `leadShootable` is false and `lead-shot.ts` registers no flight at all.
 *
 * So the stalk gives **time** and nothing else. While her thumb is on it the
 * still does not run out (`lead-step.ts`), and it passes the beat she lets
 * go. Her beam needs `lancePrimeBeats` to fill and the still is
 * `leadStillBeats` wide, so a pair who spent the still saying the column have
 * missed their window; the hold is the window, opened by hand. Hold past
 * `leadHoldBeats` and it tears out of her and passes anyway, which is why
 * holding on is not an answer — the fight still ends on the pilot's cannon
 * standing where the pass comes through.
 *
 * On the tick for `surge-hand.ts`' reason: *up* is said on a tick, and a
 * release that waited for the beat would be a beat of pass she never asked
 * for. What it *does* is spent on the beat, where the still is counted.
 *
 * One seat: **the navigator's**, because her screen is the one that draws the
 * stalk over the body's column (`render/src/lead-shape.ts`). The pilot's
 * stalk stands in the middle of the field as a readout of the lean, so his
 * press is on a picture of a thing rather than the thing, and it is dropped
 * without a sound, exactly as `queenMark` drops the other seat's.
 */

/** Her thumb off the stalk: it passes on the next beat, and nothing takes hold of this still again. */
function leadLetGo(world: World, s: LeadState): void {
  s.heldBeat = -1;
  s.freeBeat = world.beat;
  world.events.push({ type: "leadRelease", col: s.col });
}

/** One seat's thumb on or off the stalk, off the wire. */
export function leadHeard(world: World, player: 1 | 2, command: Command): void {
  if (command.kind !== "drag" || command.target !== "leadStalk") return;
  if (player !== 2) return;
  const s = leadBoss(world);
  if (s === null || !leadStill(s)) return;
  if (!command.on) {
    if (leadHolding(s)) leadLetGo(world, s);
    return;
  }
  if (!leadGrippable(s)) return;
  s.heldBeat = world.beat;
  leadAsk(world, world.cfg.leadHoldBeats);
  world.events.push({ type: "leadGrip", col: s.col });
}
