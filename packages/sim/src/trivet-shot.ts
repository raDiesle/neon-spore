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
export function trivetStruck(world: World, bullet: Bullet): boolean {
  const s = trivetBoss(world);
  if (s === null) return false;
  // The hub is in the middle column, lit or not: a bolt there met it, and
  // while it is dark that is armour (`shot-out.ts`). So is a tipped leg's
  // column with the chord not held.
  const core = bullet.col === midCol(world.cfg);
  if (!s.hubLit) return core;
  const step = trivetLitStep(s);
  if (step === null || (step.ask !== "fire" && step.ask !== "tip")) return core;
  if (bullet.col !== trivetStepCol(midCol(world.cfg), step)) return core;
  if (step.ask === "tip" && !trivetChordHeld(s, trivetTipSide(step), step.pads)) return true;
  if (step.color !== "either") {
    if (bullet.color !== step.color) {
      missedColor(world);
      return true;
    }
    metColor(world);
  }
  s.hits += 1;
  world.events.push({ type: "trivetHit", hits: s.hits, col: bullet.col });
  trivetAnswered(world, s);
  return true;
}
