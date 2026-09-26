import { batonLocks } from "./baton-press.js";
import { faultSwallows } from "./fault-swallow.js";
import { mirrorHoldsControls } from "./mirror.js";
import { stareBreaks } from "./stare-step.js";
import type { TimedCommand } from "./types.js";
import { undertowUnseats } from "./undertow-press.js";
import type { World } from "./world.js";

/**
 * **Every way a press is refused before it is read**, in one place.
 *
 * Cut out of `commands.ts` when THE UNDERTOW's unseat took that file over its
 * 250-line limit, and along the seam that was already drawn there in a row
 * of `if (...) return;` lines above the switch: next door is *what a press
 * does*, and this is *whether it is heard at all*. Every lock is checked here
 * and nowhere else, so every door into a command is closed at once — the
 * lobe, the swipe on the hull, a rehearsal's ghost thumb and the wire — and
 * a boss that takes a control away cannot leave one door open by forgetting
 * a call site.
 *
 * The rehearsal's `restart` is read before any of these, in `applyCommand`
 * itself: a run must be leavable however many things are holding it.
 */
export function pressRefused(world: World, timed: TimedCommand): boolean {
  // Nothing at all reaches the ship while THE MIRROR is presenting.
  if (mirrorHoldsControls(world)) return true;
  // A control this wave's fault has taken over answers nobody (`malfunction.ts`).
  if (faultSwallows(world, timed.command)) return true;
  // **THE STARE does not swallow a press, it charges for one.** A fault eats
  // the command because the button is broken and nothing happens; here the
  // button works, the pair was warned for four beats, and a watched seat that
  // pressed anyway breaks the hull — which is the wave lost (`stare-step.ts`).
  if (stareBreaks(world, timed)) return true;
  // **THE BATON swallows a press and says nothing**: the seat was told *not
  // yet*, and the grey panel is the whole of the telling (`baton-press.ts`).
  if (batonLocks(world, timed)) return true;
  // **THE UNDERTOW unseats one seat**: the floor came up under the cannon and
  // player 1 stayed on it, so his verbs are swallowed for the beats it takes
  // him to get back in the chair. Player 2 is untouched (`undertow-press.ts`).
  return undertowUnseats(world, timed);
}
