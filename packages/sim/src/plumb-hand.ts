import { midCol } from "./config.js";
import { levelling, plumbBoss, plumbTrue } from "./plumb.js";
import { plumbStirred } from "./plumb-bleed.js";
import type { Command } from "./types.js";
import type { World } from "./world.js";

/**
 * Two pulls on THE PLUMB, one stone each.
 *
 * **Geometry says whose stone is whose**, THE MANTLE's rule
 * (`mantle-hand.ts`): `plumbLevelLeft` answers only Player 1 and
 * `plumbLevelRight` only Player 2, and the wrong seat's pull does nothing,
 * silently.
 *
 * **One drag is one pull**: `fromMilli` is how far across the thumb has
 * carried since it took the stone, thousandths of a tile, right above nought
 * — a handle's carry (`render/touch-drag.ts`), kept inside
 * `plumbPullReachMilli` either way, so one seat alone can never bring a
 * skewed bob true. A lift (`on: false`) lets the stone go back to its own
 * weight, a pull of nought. Recorded whenever the bob is present, so a pull
 * already on when a step lights is counted from its first beat.
 *
 * What the pulls are worth is counted on the beat (`plumb-step.ts`); what is
 * heard here is the one instant the beat cannot see — **the bob drifting off
 * true** while the lit level step was counting, which starts its count again
 * from nought; and **a pull while the spent core bleeds**, which draws its
 * light back up (`plumb-bleed.ts`). It was each phone's lean until 27
 * September 2026.
 */
export function plumbHeard(world: World, player: 1 | 2, command: Command): void {
  if (command.kind !== "drag") return;
  if (command.target !== "plumbLevelLeft" && command.target !== "plumbLevelRight") return;
  const s = plumbBoss(world);
  if (s === null) return;
  const side: 0 | 1 = command.target === "plumbLevelLeft" ? 0 : 1;
  const wants: 1 | 2 = side === 0 ? 1 : 2;
  if (player !== wants) return;
  const pull = command.fromMilli;
  if (!Number.isInteger(pull)) return;
  const reach = world.cfg.plumbPullReachMilli;
  const was = plumbTrue(s);
  s.pullMilli[side] = command.on ? Math.max(-reach, Math.min(reach, pull)) : 0;
  if (s.pullMilli[side] !== 0) plumbStirred(world, s, side);
  if (!was || plumbTrue(s) || !levelling(s)) return;
  s.heldBeats = 0;
  world.events.push({ type: "plumbDrift", side, col: midCol(world.cfg) });
}
