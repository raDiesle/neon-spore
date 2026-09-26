import { markMoment } from "./balance.js";
import { midCol } from "./config.js";
import { cystBoss, cystLitStep, cystStepCol } from "./cyst.js";
import { cystAnswered } from "./cyst-step.js";
import { guardArmed } from "./hull-guard.js";
import type { World } from "./world.js";

/**
 * **THE CYST's spore, turned**, asked once a tick after the commands are
 * heard, so a guard pressed this tick counts this tick.
 *
 * THE TRIVET's needle over again (`trivet-guard.ts`): the shield standing
 * under the column the spore falls down while it is armed, the guard pressed
 * after the step lit. A shield under the middle turns nothing, because that
 * is not where the spore is.
 */
export function cystGuarded(world: World): void {
  const s = cystBoss(world);
  const step = s === null ? null : cystLitStep(s);
  if (s === null || step === null || step.ask !== "spit") return;
  const col = cystStepCol(midCol(world.cfg), step);
  if (world.shieldCol !== col || !guardArmed(world) || world.guardTick < s.litTick) return;
  world.guard.tries += 1;
  world.guard.deflected += 1;
  markMoment(world, true);
  world.events.push({ type: "cystTurn", col });
  cystAnswered(world, s);
}
