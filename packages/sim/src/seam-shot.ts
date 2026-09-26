import { metColor, missedColor } from "./balance.js";
import { seamBoss, seamLitStep, seamStepCol, seamWantsShield, seamWantsShot } from "./seam.js";
import { seamAnswered } from "./seam-step.js";
import type { Bullet } from "./types.js";
import type { World } from "./world.js";

/**
 * **THE SEAM's shot**: a lit point on the ridge, or a rock spat from it, where
 * a bolt leaves the top of the field.
 *
 * Only the lit step takes one, and only in its own column — the middle for a
 * point, the rock's for a rock. **A step with a colour wants that colour**,
 * THE KEEL's socket's rule: the other one is a colour missed on the balance
 * sheet and nothing else, and the step stays lit. A step authored `"either"`
 * takes both, the white point and the last rock.
 *
 * **The glow** takes either colour and more than one shot: it is answered
 * once `seamGlowShots` have landed, each a `seamQuench` with what is left.
 */
export function seamStruck(world: World, bullet: Bullet): void {
  const s = seamBoss(world);
  if (s === null || !seamWantsShot(s)) return;
  const step = seamLitStep(s);
  if (step === null || bullet.col !== seamStepCol(world, step)) return;
  if (step.color !== "either") {
    if (bullet.color !== step.color) {
      missedColor(world);
      return;
    }
    metColor(world);
  }
  if (step.ask === "glow") {
    // The glow gathers until enough shots have landed on it; each one tells
    // the picture how much is left.
    s.quenched += 1;
    const left = Math.max(0, world.cfg.seamGlowShots - s.quenched);
    world.events.push({ type: "seamQuench", left, col: bullet.col });
    if (left > 0) return;
  }
  s.shot = true;
  if (step.ask === "point") {
    if (step.seals) {
      s.sealed += 1;
      world.events.push({ type: "seamSeal", sealed: s.sealed, col: bullet.col });
    } else {
      world.events.push({ type: "seamDim", col: bullet.col });
    }
  } else if (step.ask !== "glow") {
    world.events.push({ type: "seamRockOut", col: bullet.col });
  }
  if (!seamWantsShield(s)) seamAnswered(world, s);
}
