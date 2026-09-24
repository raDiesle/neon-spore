import { aim, ramp } from "./slow-intake-aim.js";
import { drawStreams } from "./slow-intake-streams.js";
import type { SlowLook } from "./slow-look.js";

/**
 * **The owner's answer for THE SLOW's window: light run in round the boss.**
 *
 * The owner settled the slot on 22 September 2026: the light *around the full
 * boss*, much more visible, stopping before its body. So this is not a fourth
 * argument about the window — it is the one that won, with the streams built
 * on the boss's own radius.
 *
 * **No measure is drawn.** A notched bar under the body counted the window
 * down from 22 September 2026 until the owner took it out on the 24th — *it
 * was a stupid idea to introduce it*. How long is left is the ring closing on
 * each mark (`instar-marks.ts`), where the thumb already is.
 *
 * **It ends.** Four tenths of a second of fade at each end, spent inside the
 * window, so the light arrives from nothing and is gone on the beat the game
 * comes back up to speed rather than being at its loudest then
 * (`slow-intake-aim.ts`).
 */
export const intakeWindow: SlowLook["paint"] = (ctx, l, world, view, win) => {
  const at = aim(world, l, world.beat, view.beatPhase);
  const up = ramp(win, world.cfg);
  if (up > 0) drawStreams(ctx, l, at, up, win.through);
};
