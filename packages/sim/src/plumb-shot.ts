import { metColor, missedColor } from "./balance.js";
import { midCol } from "./config.js";
import { plumbBoss, plumbLitStep } from "./plumb.js";
import { plumbAnswered } from "./plumb-step.js";
import type { Bullet } from "./types.js";
import type { World } from "./world.js";

/**
 * **THE PLUMB's shot**: the lit core, where a bolt leaves the top of the
 * field in the middle column.
 *
 * Only a lit fire step takes one, with the core lit. **A step with a colour
 * wants that colour**, THE SEAM's rule (`seam-shot.ts`): the other is a
 * colour missed on the balance sheet and the step stays lit. The last step is
 * authored `"either"`, the white core, and takes both.
 */
export function plumbStruck(world: World, bullet: Bullet): void {
  const s = plumbBoss(world);
  if (s === null || !s.coreLit) return;
  const step = plumbLitStep(s);
  if (step === null || step.ask !== "fire" || bullet.col !== midCol(world.cfg)) return;
  if (step.color !== "either") {
    if (bullet.color !== step.color) {
      missedColor(world);
      return;
    }
    metColor(world);
  }
  s.hits += 1;
  world.events.push({ type: "plumbHit", hits: s.hits, col: bullet.col });
  plumbAnswered(world, s);
}
