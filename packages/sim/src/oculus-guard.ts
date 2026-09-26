import { markMoment } from "./balance.js";
import { midCol } from "./config.js";
import { guardArmed } from "./hull-guard.js";
import { oculusBoss, oculusGlaring } from "./oculus.js";
import { oculusAnswered } from "./oculus-step.js";
import type { World } from "./world.js";

/**
 * **THE OCULUS's shield**, asked once a tick after the commands are heard —
 * THE SEAM's grit, word for word (`seam-guard.ts`), for the eye's glare.
 *
 * The glare is answered by the shield standing under the eye while it is
 * armed, pressed after the step lit: a press made for something else a moment
 * before would otherwise answer a glare nobody had seen yet. The sheet is
 * billed as THE SEAM bills it.
 */
export function oculusGuarded(world: World): void {
  const s = oculusBoss(world);
  if (s === null || !oculusGlaring(s)) return;
  // The eye hangs over the middle, so the glare is always answered under it.
  const col = midCol(world.cfg);
  if (world.shieldCol !== col || !guardArmed(world) || world.guardTick < s.litTick) return;
  world.guard.tries += 1;
  world.guard.deflected += 1;
  markMoment(world, true);
  world.events.push({ type: "oculusBlock", col });
  oculusAnswered(world, s);
}
