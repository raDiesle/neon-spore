import type { CoreVerdict } from "./core-verdict.js";
import { mantleBoss, mantleLeaking, NO_SPARK } from "./mantle.js";
import type { Bullet, Color } from "./types.js";
import type { World } from "./world.js";

/**
 * **THE MANTLE's one target**: the spark leaking from the bared core once the
 * shell is fully split (§23, between movements 2 and 3).
 *
 * **Either colour.** The design says *own colour*, and both of them are: a
 * spark is not a body with a colour the pair could have got wrong, the same
 * rule THE GIMBAL's seam already uses. What it costs to miss is the column,
 * and the column is the middle.
 *
 * What it says of a bolt is `mantleVerdict`, which the picture asks too
 * (`render/mantle-stop.ts`).
 */
export function mantleStruck(world: World, bullet: Bullet): boolean {
  const s = mantleBoss(world);
  if (s === null || mantleVerdict(world, bullet.col, bullet.color) === null) return false;
  s.sparkCol = NO_SPARK;
  world.events.push({ type: "mantleSparkOut", col: bullet.col });
  return true;
}

/**
 * What a bolt in `col` meets of the leak (`core-verdict.ts`'s words): the
 * spark in its column while it leaks, in either colour, and nothing anywhere
 * else — the shell and the core are never judged.
 */
export function mantleVerdict(world: World, col: number, _color: Color): CoreVerdict {
  const s = mantleBoss(world);
  return s !== null && mantleLeaking(s) && col === s.sparkCol ? "target" : null;
}
