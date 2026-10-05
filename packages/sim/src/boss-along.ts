import { flueAlong, flueStruckEmber } from "./flue-shot.js";
import { gimbalBeadAlong } from "./gimbal-bead.js";
import { gimbalStruck, gimbalVerdict } from "./gimbal-shot.js";
import { gorgeAlong, gorgeStruck } from "./gorge-step.js";
import { hiveWallStruck } from "./hive-shot.js";
import { hiveWallAlong } from "./hive-wall.js";
import type { Bullet } from "./types.js";
import { vaneMouthAlong, vaneMouthStruck } from "./vane.js";
import type { World } from "./world.js";

/**
 * **The bosses a shot meets in mid-field** rather than past the top: THE
 * VANE's open bearing on the arm's row, THE GORGE's bubble on its own, THE
 * HIVE's cocoons down its two walls (`hive-wall.ts`), THE GIMBAL's leaking
 * bead on its way down its column (`gimbal-bead.ts`), THE FLUE's row, which
 * stops every shot to judge it against the ember (`flue-shot.ts`). One
 * question for `bullets.ts` and `lance-burn.ts` to ask beside the bodies and
 * pods in the same sweep, so whichever stands lowest is met first and a body
 * on the same row is in front of it.
 *
 * Where it stands in thousandths of a row, or -1 when there is nothing.
 * Only one boss is up at a time, so at most one of these answers.
 */
export function bossAlong(world: World, bullet: Bullet, from: number, to: number): number {
  const mouth = vaneMouthAlong(world, bullet, from, to);
  if (mouth >= 0) return mouth;
  const wall = hiveWallAlong(world, bullet, from, to);
  if (wall >= 0) return wall;
  const ember = flueAlong(world, bullet, from, to);
  if (ember >= 0) return ember;
  const leak = gimbalVerdict(world, bullet.col, bullet.color) !== null;
  const bead = leak ? gimbalBeadAlong(world, from, to) : -1;
  return bead >= 0 ? bead : gorgeAlong(world, bullet, from, to);
}

/** The shot met what `bossAlong` found. */
export function bossAlongStruck(world: World, bullet: Bullet): void {
  if (world.boss?.kind === "gorge") gorgeStruck(world, bullet);
  else if (world.boss?.kind === "hive") hiveWallStruck(world, bullet);
  else if (world.boss?.kind === "gimbal") gimbalStruck(world, bullet);
  else if (world.boss?.kind === "flue") flueStruckEmber(world, bullet);
  else vaneMouthStruck(world, bullet);
}
