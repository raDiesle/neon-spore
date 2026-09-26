import { metColor, missedColor } from "./balance.js";
import { midCol } from "./config.js";
import { rimeBoss, rimeLitStep } from "./rime.js";
import { rimeAnswered } from "./rime-step.js";
import type { Bullet } from "./types.js";
import type { World } from "./world.js";

/**
 * **THE RIME's shot**: the bared core, where a bolt leaves the top of the
 * field in the middle column.
 *
 * Only a lit fire step takes one, with the core bare. **A step with a colour
 * wants that colour**, THE SEAM's rule (`seam-shot.ts`): the other is a colour
 * missed on the balance sheet and the step stays lit. The last step is
 * authored `"either"`, the white core, and takes both.
 */
export function rimeStruck(world: World, bullet: Bullet): void {
  const s = rimeBoss(world);
  if (s === null || !s.bared) return;
  const step = rimeLitStep(s);
  if (step === null || step.ask !== "fire" || bullet.col !== midCol(world.cfg)) return;
  if (step.color !== "either") {
    if (bullet.color !== step.color) {
      missedColor(world);
      return;
    }
    metColor(world);
  }
  s.hits += 1;
  world.events.push({ type: "rimeHit", hits: s.hits, col: bullet.col });
  rimeAnswered(world, s);
}
