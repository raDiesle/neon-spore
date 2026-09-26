import { markMoment } from "./balance.js";
import { midCol } from "./config.js";
import { guardArmed } from "./hull-guard.js";
import { trivetBoss, trivetLitStep, trivetStepCol } from "./trivet.js";
import { trivetAnswered } from "./trivet-step.js";
import type { World } from "./world.js";

/**
 * **THE TRIVET's needle, turned**, asked once a tick after the commands are
 * heard, so a guard pressed this tick counts this tick.
 *
 * THE RIME's icicle over again (`rime-guard.ts`): the shield standing under
 * the column the needle falls down while it is armed, the guard pressed after
 * the step lit. A shield under the middle turns nothing, because that is not
 * where the needle is.
 *
 * The sheet is billed as THE SEAM bills it, for its reason: there is no body
 * here for `wardTurns` to take.
 */
export function trivetGuarded(world: World): void {
  const s = trivetBoss(world);
  const step = s === null ? null : trivetLitStep(s);
  if (s === null || step === null || step.ask !== "needle") return;
  const col = trivetStepCol(midCol(world.cfg), step);
  if (world.shieldCol !== col || !guardArmed(world) || world.guardTick < s.litTick) return;
  world.guard.tries += 1;
  world.guard.deflected += 1;
  markMoment(world, true);
  world.events.push({ type: "trivetTurn", col });
  trivetAnswered(world, s);
}
