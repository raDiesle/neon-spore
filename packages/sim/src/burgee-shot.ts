import { metColor, missedColor } from "./balance.js";
import { burgeeBoss, burgeeLitStep } from "./burgee.js";
import { burgeeAnswered } from "./burgee-step.js";
import { midCol } from "./config.js";
import type { Bullet } from "./types.js";
import type { World } from "./world.js";

/**
 * **THE BURGEE's shot**: the lit spindle, where a bolt leaves the top of the
 * field in the middle column.
 *
 * Only a lit fire step takes one, with the spindle lit. **A step with a
 * colour wants that colour**, THE SEAM's rule (`seam-shot.ts`): the other is
 * a colour missed on the balance sheet and the step stays lit. The last step
 * is authored `"either"`, the white spindle, and takes both.
 */
export function burgeeStruck(world: World, bullet: Bullet): void {
  const s = burgeeBoss(world);
  if (s === null || !s.spindleLit) return;
  const step = burgeeLitStep(s);
  if (step === null || step.ask !== "fire" || bullet.col !== midCol(world.cfg)) return;
  if (step.color !== "either") {
    if (bullet.color !== step.color) {
      missedColor(world);
      return;
    }
    metColor(world);
  }
  s.hits += 1;
  world.events.push({ type: "burgeeHit", hits: s.hits, col: bullet.col });
  burgeeAnswered(world, s);
}
