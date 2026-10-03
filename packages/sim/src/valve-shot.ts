import type { CoreVerdict } from "./core-verdict.js";
import { NO_SPARK } from "./mantle.js";
import type { Bullet, Color } from "./types.js";
import { valveBoss, valveLeaking } from "./valve.js";
import type { World } from "./world.js";

/**
 * **THE VALVE's one target**: the spark the first two pins leak down the
 * drum's column, one at a time, where a bolt leaves the top of the field.
 *
 * **It wants either colour**, THE MANTLE's spark's and THE KEEL's rock's
 * argument: a spark is not a body with a colour the pair could have got
 * wrong, and what it costs to miss is the hull. The drum itself takes no
 * shot at all — every pin comes out by hand.
 *
 * What it says of a bolt is `valveVerdict`, which the picture asks too
 * (`render/valve-stop.ts`).
 */
export function valveStruck(world: World, bullet: Bullet): boolean {
  const s = valveBoss(world);
  if (s === null || valveVerdict(world, bullet.col, bullet.color) === null) return false;
  s.sparkCol = NO_SPARK;
  world.events.push({ type: "valveSparkOut", col: bullet.col });
  return true;
}

/**
 * What a bolt in `col` meets of the leak (`core-verdict.ts`'s words): the
 * spark in its column while it falls, in either colour, and nothing anywhere
 * else — the drum is never judged.
 */
export function valveVerdict(world: World, col: number, _color: Color): CoreVerdict {
  const s = valveBoss(world);
  return s !== null && valveLeaking(s) && col === s.sparkCol ? "target" : null;
}
