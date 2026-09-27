import { metColor, missedColor } from "./balance.js";
import { midCol } from "./config.js";
import { flueBoss, flueFiring, flueLitStep } from "./flue.js";
import { flueAnswered } from "./flue-step.js";
import type { Bullet } from "./types.js";
import type { World } from "./world.js";

/**
 * **THE FLUE's shot**: the bared core, where a bolt leaves the top of the
 * field in the middle column.
 *
 * Only a lit fire step takes one, with the core bared. **A step with a
 * colour wants that colour**, THE SEAM's rule (`seam-shot.ts`): the other is
 * a colour missed on the balance sheet and the step stays lit. The last step
 * is authored `"either"`, the white core, and takes both.
 */
export function flueStruck(world: World, bullet: Bullet): void {
  const s = flueBoss(world);
  if (s === null || !flueFiring(s) || bullet.col !== midCol(world.cfg)) return;
  const step = flueLitStep(s);
  if (step === null) return;
  if (step.color !== "either") {
    if (bullet.color !== step.color) {
      missedColor(world);
      return;
    }
    metColor(world);
  }
  s.hits += 1;
  world.events.push({ type: "flueHit", hits: s.hits, col: bullet.col });
  flueAnswered(world, s);
}
