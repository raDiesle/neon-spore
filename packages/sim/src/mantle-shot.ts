import { mantleBoss, mantleLeaking, NO_SPARK } from "./mantle.js";
import type { Bullet } from "./types.js";
import type { World } from "./world.js";

/**
 * **THE MANTLE's one target**: the spark leaking from the bared core once the
 * shell is fully split (§23, between movements 2 and 3).
 *
 * **Either colour.** The design says *own colour*, and both of them are: a
 * spark is not a body with a colour the pair could have got wrong, the same
 * rule THE GIMBAL's seam already uses. What it costs to miss is the column,
 * and the column is the middle.
 */
export function mantleStruck(world: World, bullet: Bullet): void {
  const s = mantleBoss(world);
  if (s === null || !mantleLeaking(s)) return;
  if (bullet.col !== s.sparkCol) return;
  s.sparkCol = NO_SPARK;
  world.events.push({ type: "mantleSparkOut", col: bullet.col });
}
