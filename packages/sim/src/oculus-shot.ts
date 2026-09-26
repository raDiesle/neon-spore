import { metColor, missedColor } from "./balance.js";
import { midCol } from "./config.js";
import { oculusBoss, oculusLitStep, oculusLookCol } from "./oculus.js";
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
 *
 * **A look step** is the same shot up another column: the eye has rolled in
 * its socket to look down `oculusLookCol`, and a bolt up that column answers
 * it. It is not a hit — the core was not struck, only met — so the three
 * hits stay the fight's health.
 */
export function oculusStruck(world: World, bullet: Bullet): void {
  const s = oculusBoss(world);
  if (s === null || !s.socketOpen) return;
  const step = oculusLitStep(s);
  if (step === null || (step.ask !== "fire" && step.ask !== "look")) return;
  const col = step.ask === "look" ? oculusLookCol(midCol(world.cfg), step) : midCol(world.cfg);
  if (bullet.col !== col) return;
  if (step.color !== "either") {
    if (bullet.color !== step.color) {
      missedColor(world);
      return;
    }
    metColor(world);
  }
  if (step.ask === "look") world.events.push({ type: "oculusGlance", col });
  else {
    s.hits += 1;
    world.events.push({ type: "oculusHit", hits: s.hits, col });
  }
  oculusAnswered(world, s);
}
