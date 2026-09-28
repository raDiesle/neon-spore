import { NO_SPARK } from "./mantle.js";
import type { Bullet } from "./types.js";
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
 */
export function valveStruck(world: World, bullet: Bullet): boolean {
  const s = valveBoss(world);
  if (s === null || !valveLeaking(s) || bullet.col !== s.sparkCol) return false;
  s.sparkCol = NO_SPARK;
  world.events.push({ type: "valveSparkOut", col: bullet.col });
  return true;
}
