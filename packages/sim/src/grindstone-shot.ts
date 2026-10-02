import { type CoreVerdict, coreTaken, coreVerdict } from "./core-verdict.js";
import { grindstoneBoss, grindstoneLitStep } from "./grindstone.js";
import { grindstoneAnswered } from "./grindstone-step.js";
import type { Bullet, Color } from "./types.js";
import type { World } from "./world.js";

/**
 * **THE GRINDSTONE's shot**: the lit axle, where a bolt leaves the top of the
 * field in the middle column.
 *
 * Only a lit fire step takes one, with the caliper locked. **A step with a
 * colour wants that colour**, THE SEAM's rule (`seam-shot.ts`): the other is a
 * colour missed on the balance sheet and the step stays lit. The last step is
 * authored `"either"`, the white axle, and takes both.
 *
 * What it says of a bolt is `grindstoneVerdict`, which the picture asks too
 * (`core-verdict.ts`).
 */
export function grindstoneStruck(world: World, bullet: Bullet): boolean {
  const s = grindstoneBoss(world);
  const verdict = grindstoneVerdict(world, bullet.col, bullet.color);
  if (s === null || !coreTaken(world, verdict, grindstoneLitStep(s))) return verdict !== null;
  s.hits += 1;
  world.events.push({ type: "grindstoneHit", hits: s.hits, col: bullet.col });
  grindstoneAnswered(world, s);
  return true;
}

/** What a bolt of `color` in `col` meets of the core (`core-verdict.ts`). */
export function grindstoneVerdict(world: World, col: number, color: Color): CoreVerdict {
  const s = grindstoneBoss(world);
  return s === null ? null : coreVerdict(world, col, color, s.locked, grindstoneLitStep(s));
}
