import { metColor, missedColor } from "./balance.js";
import { midCol } from "./config.js";
import { gallBoss, gallLitStep } from "./gall.js";
import { gallAnswered } from "./gall-step.js";
import type { Bullet } from "./types.js";
import type { World } from "./world.js";

/**
 * **THE GALL's shot**: the bared root, where a bolt leaves the top of the
 * field in the middle column.
 *
 * Only a lit fire step takes one, with the root bare. **A step with a colour
 * wants that colour**, THE SEAM's rule (`seam-shot.ts`): the other is a colour
 * missed on the balance sheet and the step stays lit.
 */
export function gallStruck(world: World, bullet: Bullet): void {
  const s = gallBoss(world);
  if (s === null || !s.bared) return;
  const step = gallLitStep(s);
  if (step === null || step.ask !== "fire" || bullet.col !== midCol(world.cfg)) return;
  if (step.color !== "either") {
    if (bullet.color !== step.color) {
      missedColor(world);
      return;
    }
    metColor(world);
  }
  s.hits += 1;
  world.events.push({ type: "gallHit", hits: s.hits, col: bullet.col });
  gallAnswered(world, s);
}
