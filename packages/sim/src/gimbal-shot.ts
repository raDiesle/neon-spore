import { gimbalBoss, gimbalLeaking, NO_SEAM } from "./gimbal.js";
import type { Bullet } from "./types.js";
import type { World } from "./world.js";

/**
 * **THE GIMBAL's one target**: the spark leaking from the drum's seam once
 * two tooth pairs are off (§18, row 9).
 *
 * Its own file beside `gimbal-step.ts` for `ledger-shot.ts`' reason: next
 * door is the fight's clock, and this happens where a bolt leaves the top of
 * the field. Both rings are rock grey and neither is ever shot — the cannon
 * has nothing else to do in this wave, which is why the seam is the one
 * moment either seat can spend a shot on anything.
 *
 * **Either colour.** The design says *their own colour*, and both of them
 * are: a spark is not a body with a colour the pair could have got wrong, so
 * nothing here is billed to the colour balance. What it costs to miss is the
 * column, and the column is the middle.
 */
export function gimbalStruck(world: World, bullet: Bullet): void {
  const s = gimbalBoss(world);
  if (s === null || !gimbalLeaking(s)) return;
  if (bullet.col !== s.seamCol) return;
  s.seamCol = NO_SEAM;
  world.events.push({ type: "gimbalSeamOut", col: bullet.col });
}
