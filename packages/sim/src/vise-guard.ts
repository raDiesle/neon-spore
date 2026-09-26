import { markMoment } from "./balance.js";
import { midCol } from "./config.js";
import { guardArmed } from "./hull-guard.js";
import { viseBiting, viseBoss } from "./vise.js";
import { viseAnswered } from "./vise-step.js";
import type { World } from "./world.js";

/**
 * **THE VISE's shield**, asked once a tick after the commands are heard —
 * THE OCULUS's glare, word for word (`oculus-guard.ts`), for the case's bite.
 *
 * The bite is answered by the shield standing under the case while it is
 * armed, pressed after the step lit: a press made for something else a moment
 * before would otherwise answer a bite nobody had seen yet. The sheet is
 * billed as THE SEAM bills it.
 */
export function viseGuarded(world: World): void {
  const s = viseBoss(world);
  if (s === null || !viseBiting(s)) return;
  // The case hangs over the middle, so the bite is always met under it.
  const col = midCol(world.cfg);
  if (world.shieldCol !== col || !guardArmed(world) || world.guardTick < s.litTick) return;
  world.guard.tries += 1;
  world.guard.deflected += 1;
  markMoment(world, true);
  world.events.push({ type: "viseBlock", col });
  viseAnswered(world, s);
}
