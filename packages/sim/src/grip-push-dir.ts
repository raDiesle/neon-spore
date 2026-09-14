import type { SimConfig } from "./config.js";
import { gripsCreature } from "./grip.js";
import { gripPushOf } from "./grip-push.js";
import type { Creature } from "./types.js";
import type { World } from "./world.js";

/**
 * **Which way a carried body has been earned a column**, out of how far each
 * hand has come and how much of it that hand has already spent — the
 * arithmetic under `carryGrips` (`grip-push.ts`), in its own file so that one
 * stays about what the column *buys* and this one about whether it has been
 * paid for. Everything here is a reading of `GripPush`; nothing here moves a
 * body.
 */

/** Which way the hands on this body are pulling: one column, or none.
 *
 * Two hands pulling opposite ways cancel, and the body holds — the one place
 * in the game where the two seats can work against each other, and it resolves
 * the only way it honestly can. Neither spends a column for it, so whoever
 * lets go first sends it. */
export function carryDir(world: World, c: Creature): -1 | 0 | 1 {
  return Math.sign(handDir(world, 1, c) + handDir(world, 2, c)) as -1 | 0 | 1;
}

/** Which way one seat's hand has earned a column, out of how far it has come
 * and how much of that it has already spent. */
function handDir(world: World, player: 1 | 2, c: Creature): -1 | 0 | 1 {
  if (!gripsCreature(world, player, c.id)) return 0;
  const push = gripPushOf(world, player);
  if (push === null) return 0;
  // `Math.trunc` and not a floor: a hand is as far from where it grabbed in
  // one direction as in the other, and a floor would earn a column half a tile
  // sooner going left than going right.
  const earned = Math.trunc(push.milli / carryMilli(world.cfg, c));
  return Math.sign(earned - push.cols) as -1 | 0 | 1;
}

/** How far a hand has to come to earn a column of this body. One number for
 * everything a hand carries, and the gum's own for the gum: a swipe is a
 * flick rather than a walk, and the two are tuned apart (`config-gum.ts`). */
function carryMilli(cfg: SimConfig, c: Creature): number {
  return c.kind === "gum" ? cfg.gumSwipeMilli : cfg.gripPushMilli;
}

/** The column is spent by every hand that asked for it, and by no hand that
 * asked for the other one or for nothing. Says who paid. */
export function spend(world: World, c: Creature, dir: -1 | 1): (1 | 2)[] {
  const paid: (1 | 2)[] = [];
  for (const player of [1, 2] as const) {
    if (handDir(world, player, c) !== dir) continue;
    const push = gripPushOf(world, player);
    if (push === null) continue;
    push.cols += dir;
    paid.push(player);
  }
  return paid;
}
