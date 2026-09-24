import { type GorgeState, gorgeFull, gorgePried } from "./gorge.js";
import { closeSlow, openSlow } from "./slow.js";
import type { World } from "./world.js";

/**
 * **THE SLOW on THE GORGE spans its asks exactly** (`docs/decisions.md` #33):
 * a full intake waiting for its shots, and the mouth pried for its beams.
 * Each is a window that closes on its own clock — the vent, the clench — and
 * the slow is up for as long as any of them is, to the beat the latest one
 * runs out on.
 *
 * Read off the state rather than opened at each moment, because the sack can
 * hold two asks at once and the moments are many — a full, a rupture, a vent,
 * a pinch lifted, a pry taken, thrown off or answered. Whichever one changed,
 * this is called after it and puts the window where the asks still standing
 * say: out to the last of them, or shut this tick when none is (`closeSlow`).
 * A pinched intake's count is moved along every beat (`vent()`), so the slow
 * holds under the pilot's thumb and runs its whole window from the lift.
 */
export function gorgeSlow(world: World, g: GorgeState): void {
  const cfg = world.cfg;
  let left = 0;
  if (g.outBeat < 0) {
    for (let i = 0; i < g.intakes.length; i++) {
      const k = g.intakes[i];
      if (k === undefined || i === g.mouth || !gorgeFull(k, cfg)) continue;
      left = Math.max(left, k.fullBeat + cfg.gorgeVentBeats - world.beat);
    }
    if (gorgePried(g)) left = Math.max(left, g.pryBeat + cfg.gorgePryBeats - world.beat);
  }
  if (left > 0) openSlow(world, left);
  else closeSlow(world);
}
