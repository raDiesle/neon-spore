import { metColor, missedColor } from "./balance.js";
import { midCol } from "./config.js";
import { grindstoneBoss, grindstoneLitStep } from "./grindstone.js";
import { grindstoneAnswered } from "./grindstone-step.js";
import type { Bullet } from "./types.js";
import type { World } from "./world.js";

/**
 * **THE GRINDSTONE's shot**: the lit axle, where a bolt leaves the top of the
 * field in the middle column.
 *
 * Only a lit fire step takes one, with the caliper locked. **A step with a
 * colour wants that colour**, THE SEAM's rule (`seam-shot.ts`): the other is a
 * colour missed on the balance sheet and the step stays lit. The last step is
 * authored `"either"`, the white axle, and takes both.
 */
export function grindstoneStruck(world: World, bullet: Bullet): void {
  const s = grindstoneBoss(world);
  if (s === null || !s.locked) return;
  const step = grindstoneLitStep(s);
  if (step === null || step.ask !== "fire" || bullet.col !== midCol(world.cfg)) return;
  if (step.color !== "either") {
    if (bullet.color !== step.color) {
      missedColor(world);
      return;
    }
    metColor(world);
  }
  s.hits += 1;
  world.events.push({ type: "grindstoneHit", hits: s.hits, col: bullet.col });
  grindstoneAnswered(world, s);
}
