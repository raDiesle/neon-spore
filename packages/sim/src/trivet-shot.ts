import { metColor, missedColor } from "./balance.js";
import { midCol } from "./config.js";
import { trivetBoss, trivetLitStep } from "./trivet.js";
import { trivetAnswered } from "./trivet-step.js";
import type { Bullet } from "./types.js";
import type { World } from "./world.js";

/**
 * **THE TRIVET's shot**: the lit hub, where a bolt leaves the top of the
 * field in the middle column.
 *
 * Only a lit fire step takes one, with the hub lit. **A step with a colour
 * wants that colour**, THE SEAM's rule (`seam-shot.ts`): the other is a
 * colour missed on the balance sheet and the step stays lit. The last step is
 * authored `"either"`, the white hub, and takes both.
 */
export function trivetStruck(world: World, bullet: Bullet): void {
  const s = trivetBoss(world);
  if (s === null || !s.hubLit) return;
  const step = trivetLitStep(s);
  if (step === null || step.ask !== "fire" || bullet.col !== midCol(world.cfg)) return;
  if (step.color !== "either") {
    if (bullet.color !== step.color) {
      missedColor(world);
      return;
    }
    metColor(world);
  }
  s.hits += 1;
  world.events.push({ type: "trivetHit", hits: s.hits, col: bullet.col });
  trivetAnswered(world, s);
}
