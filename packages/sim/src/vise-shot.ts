import { metColor, missedColor } from "./balance.js";
import { midCol } from "./config.js";
import type { Bullet } from "./types.js";
import { viseBoss, viseLitStep } from "./vise.js";
import { viseAnswered } from "./vise-step.js";
import type { World } from "./world.js";

/**
 * **THE VISE's shot**: the bared kernel, where a bolt leaves the top of the
 * field in the middle column.
 *
 * Only a lit fire step takes one, with the kernel bare. **A step with a
 * colour wants that colour**, THE SEAM's rule (`seam-shot.ts`): the other is
 * a colour missed on the balance sheet and the step stays lit. The last step
 * is authored `"either"`, the white kernel, and takes both.
 */
export function viseStruck(world: World, bullet: Bullet): void {
  const s = viseBoss(world);
  if (s === null || !s.bared) return;
  const step = viseLitStep(s);
  if (step === null || step.ask !== "fire" || bullet.col !== midCol(world.cfg)) return;
  if (step.color !== "either") {
    if (bullet.color !== step.color) {
      missedColor(world);
      return;
    }
    metColor(world);
  }
  s.hits += 1;
  world.events.push({ type: "viseHit", hits: s.hits, col: bullet.col });
  viseAnswered(world, s);
}
