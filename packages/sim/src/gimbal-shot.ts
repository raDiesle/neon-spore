import type { CoreVerdict } from "./core-verdict.js";
import { gimbalBoss, gimbalLeaking, NO_SEAM } from "./gimbal.js";
import type { Bullet, Color } from "./types.js";
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
 *
 * What it says of a bolt is `gimbalVerdict`, which the picture asks too
 * (`render/gimbal-stop.ts`).
 */
export function gimbalStruck(world: World, bullet: Bullet): boolean {
  const s = gimbalBoss(world);
  if (s === null || gimbalVerdict(world, bullet.col, bullet.color) === null) return false;
  s.seamCol = NO_SEAM;
  world.events.push({ type: "gimbalSeamOut", col: bullet.col });
  return true;
}

/**
 * What a bolt in `col` meets of the leak (`core-verdict.ts`'s words): the
 * spark in the seam's column while it leaks, in either colour, and nothing
 * anywhere else — the rings and the drum are never judged.
 */
export function gimbalVerdict(world: World, col: number, _color: Color): CoreVerdict {
  const s = gimbalBoss(world);
  return s !== null && gimbalLeaking(s) && col === s.seamCol ? "target" : null;
}
