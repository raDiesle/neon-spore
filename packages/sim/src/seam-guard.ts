import { markMoment } from "./balance.js";
import { midCol } from "./config.js";
import { guardArmed } from "./hull-guard.js";
import { seamBoss, seamWantsShield, seamWantsShot } from "./seam.js";
import { seamAnswered } from "./seam-step.js";
import type { World } from "./world.js";

/**
 * **THE SEAM's shield**, asked once a tick after the commands are heard, so a
 * guard pressed this tick counts this tick.
 *
 * Grit is answered by the shield standing under the ridge while it is armed —
 * THE LEDGER's test (`ledger-step.ts`), with one more term: the guard must
 * have been pressed after the step lit. A press made for something else a
 * moment before would otherwise answer grit nobody had seen yet.
 *
 * The sheet is billed as THE LEDGER bills a ward, written out for its reason:
 * there is no body here for `wardTurns` to take.
 */
export function seamGuarded(world: World): void {
  const s = seamBoss(world);
  if (s === null || !seamWantsShield(s)) return;
  // Grit is thrown from the ridge, so it is always answered under it.
  const col = midCol(world.cfg);
  if (world.shieldCol !== col || !guardArmed(world) || world.guardTick < s.litTick) return;
  s.guarded = true;
  world.guard.tries += 1;
  world.guard.deflected += 1;
  markMoment(world, true);
  world.events.push({ type: "seamBlock", col });
  if (!seamWantsShot(s)) seamAnswered(world, s);
}
