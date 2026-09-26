import { metColor, missedColor } from "./balance.js";
import { midCol } from "./config.js";
import { davitBoss, davitLitStep } from "./davit.js";
import { davitAnswered } from "./davit-step.js";
import type { Bullet } from "./types.js";
import type { World } from "./world.js";

/**
 * **THE DAVIT's shot**: the lit pivot, where a bolt leaves the top of the
 * field in the middle column.
 *
 * Only a lit fire step takes one, with the pivot lit. **A step with a colour
 * wants that colour**, THE SEAM's rule (`seam-shot.ts`): the other is a
 * colour missed on the balance sheet and the step stays lit. The last step is
 * authored `"either"`, the white pivot, and takes both.
 */
export function davitStruck(world: World, bullet: Bullet): void {
  const s = davitBoss(world);
  if (s === null || !s.pivotLit) return;
  const step = davitLitStep(s);
  if (step === null || step.ask !== "fire" || bullet.col !== midCol(world.cfg)) return;
  if (step.color !== "either") {
    if (bullet.color !== step.color) {
      missedColor(world);
      return;
    }
    metColor(world);
  }
  s.hits += 1;
  world.events.push({ type: "davitHit", hits: s.hits, col: bullet.col });
  davitAnswered(world, s);
}
