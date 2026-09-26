import { markMoment } from "./balance.js";
import { midCol } from "./config.js";
import { guardArmed } from "./hull-guard.js";
import { rimeBoss, rimeIcicleCol, rimeLitStep } from "./rime.js";
import { rimeAnswered } from "./rime-step.js";
import type { World } from "./world.js";

/**
 * **THE RIME's shield**, asked once a tick after the commands are heard, so a
 * guard pressed this tick counts this tick.
 *
 * A surge is answered exactly as THE SEAM's grit is (`seam-guard.ts`): the
 * shield standing under the lens while it is armed, the guard pressed after
 * the step lit. The lens stands over the middle column, so that is where the
 * surge is always turned. A surge turned leaves the core bare — or bares it
 * again, after one that ran out frosted it over.
 *
 * **An icicle** is the same shield under the column it falls down, and turns
 * nothing about the lens: the core stays as bare as it was.
 *
 * The sheet is billed as THE SEAM bills it, for its reason: there is no body
 * here for `wardTurns` to take.
 */
export function rimeGuarded(world: World): void {
  const s = rimeBoss(world);
  const step = s === null ? null : rimeLitStep(s);
  if (s === null || step === null || (step.ask !== "shield" && step.ask !== "icicle")) return;
  const mid = midCol(world.cfg);
  const col = step.ask === "icicle" ? rimeIcicleCol(mid, step) : mid;
  if (world.shieldCol !== col || !guardArmed(world) || world.guardTick < s.litTick) return;
  if (step.ask === "shield") {
    s.bared = true;
    s.rimeMilli = [0, 0];
  }
  world.guard.tries += 1;
  world.guard.deflected += 1;
  markMoment(world, true);
  world.events.push({ type: "rimeBlock", col });
  rimeAnswered(world, s);
}
