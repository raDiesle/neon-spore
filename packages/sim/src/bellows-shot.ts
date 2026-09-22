import { bellowsBoss, bellowsLeaking, NO_SPARK } from "./bellows.js";
import type { Bullet } from "./types.js";
import type { World } from "./world.js";

/**
 * **THE BELLOWS's one target**: the spark leaking from the gap the second
 * seam left (§19, row 8).
 *
 * Its own file beside `bellows-step.ts` for `gimbal-shot.ts`' reason — next
 * door is the fight's clock, and this happens where a bolt leaves the top of
 * the field. The two housings are rock grey and neither is ever shot: the
 * cannon has one thing to do in this whole wave and the shield has one, which
 * is what makes both of them worth keeping on the band.
 *
 * **Either colour.** The design says *their own colour* and both of them
 * are: a spark is not a body with a colour the pair could have got wrong, so
 * nothing here is billed to the colour balance. What it costs to miss is the
 * column, and the column is the waist.
 */
export function bellowsStruck(world: World, bullet: Bullet): void {
  const s = bellowsBoss(world);
  if (s === null || !bellowsLeaking(s)) return;
  if (bullet.col !== s.sparkCol) return;
  s.sparkCol = NO_SPARK;
  world.events.push({ type: "bellowsSparkOut", col: bullet.col });
}
