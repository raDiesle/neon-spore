import { metColor, missedColor } from "./balance.js";
import { midCol } from "./config.js";
import { oculusBoss, oculusLitStep } from "./oculus.js";
import { oculusAnswered } from "./oculus-step.js";
import type { Bullet } from "./types.js";
import type { World } from "./world.js";

/**
 * **THE OCULUS's shot**: the open socket, where a bolt leaves the top of the
 * field in the middle column.
 *
 * Only a lit fire step takes one, with the socket open. **A step with a
 * colour wants that colour**, THE SEAM's rule (`seam-shot.ts`): the other is
 * a colour missed on the balance sheet and the step stays lit. The last step
 * is authored `"either"`, the white core, and takes both.
 */
export function oculusStruck(world: World, bullet: Bullet): void {
  const s = oculusBoss(world);
  if (s === null || !s.socketOpen) return;
  const step = oculusLitStep(s);
  if (step === null || step.ask !== "fire" || bullet.col !== midCol(world.cfg)) return;
  if (step.color !== "either") {
    if (bullet.color !== step.color) {
      missedColor(world);
      return;
    }
    metColor(world);
  }
  s.hits += 1;
  world.events.push({ type: "oculusHit", hits: s.hits, col: bullet.col });
  oculusAnswered(world, s);
}
