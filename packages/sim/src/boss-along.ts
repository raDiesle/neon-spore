import { gorgeAlong, gorgeStruck } from "./gorge-step.js";
import type { Bullet } from "./types.js";
import { vaneMouthAlong, vaneMouthStruck } from "./vane.js";
import type { World } from "./world.js";

/**
 * **The bosses a shot meets in mid-field** rather than past the top: THE
 * VANE's open bearing on the arm's row, THE GORGE's bubble on its own. One
 * question for `bullets.ts` and `lance-burn.ts` to ask beside the bodies and
 * pods in the same sweep, so whichever stands lowest is met first and a body
 * on the same row is in front of it.
 *
 * Where it stands in thousandths of a row, or -1 when there is nothing.
 * Only one boss is up at a time, so at most one of these answers.
 */
export function bossAlong(world: World, bullet: Bullet, from: number, to: number): number {
  const mouth = vaneMouthAlong(world, bullet, from, to);
  return mouth >= 0 ? mouth : gorgeAlong(world, bullet, from, to);
}

/** The shot met what `bossAlong` found. */
export function bossAlongStruck(world: World, bullet: Bullet): void {
  if (world.boss?.kind === "gorge") gorgeStruck(world, bullet);
  else vaneMouthStruck(world, bullet);
}
