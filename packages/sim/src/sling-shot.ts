import { metColor, missedColor } from "./balance.js";
import { midCol } from "./config.js";
import { slingBoss, slingLitStep } from "./sling.js";
import { slingAnswered } from "./sling-step.js";
import type { Bullet } from "./types.js";
import type { World } from "./world.js";

/**
 * **THE SLING's shot**: the lit yoke, where a bolt leaves the top of the
 * field in the middle column.
 *
 * Only a lit fire step takes one, with the yoke lit. **A step with a colour
 * wants that colour**, THE SEAM's rule (`seam-shot.ts`): the other is a
 * colour missed on the balance sheet and the step stays lit. The last step is
 * authored `"either"`, the white yoke, and takes both.
 */
export function slingStruck(world: World, bullet: Bullet): void {
  const s = slingBoss(world);
  if (s === null || !s.yokeLit) return;
  const step = slingLitStep(s);
  if (step === null || step.ask !== "fire" || bullet.col !== midCol(world.cfg)) return;
  if (step.color !== "either") {
    if (bullet.color !== step.color) {
      missedColor(world);
      return;
    }
    metColor(world);
  }
  s.hits += 1;
  world.events.push({ type: "slingHit", hits: s.hits, col: bullet.col });
  slingAnswered(world, s);
}
