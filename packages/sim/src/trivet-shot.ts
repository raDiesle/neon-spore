import { metColor, missedColor } from "./balance.js";
import { midCol } from "./config.js";
import {
  trivetBoss,
  trivetChordHeld,
  trivetLitStep,
  trivetStepCol,
  trivetTipSide,
} from "./trivet.js";
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
 *
 * **A lurch** takes its shot where the hub has swung to, and only while the
 * foot it leans on is held down by its own seat's chord: a hub shot off a
 * stand going over is a bolt into the dark.
 */
export function trivetStruck(world: World, bullet: Bullet): void {
  const s = trivetBoss(world);
  if (s === null || !s.hubLit) return;
  const step = trivetLitStep(s);
  if (step === null || (step.ask !== "fire" && step.ask !== "tip")) return;
  if (bullet.col !== trivetStepCol(midCol(world.cfg), step)) return;
  if (step.ask === "tip" && !trivetChordHeld(s, trivetTipSide(step), step.pads)) return;
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
