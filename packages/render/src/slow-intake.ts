import { aim, ramp } from "./slow-intake-aim.js";
import { drawBar } from "./slow-intake-bar.js";
import { drawStreams } from "./slow-intake-streams.js";
import type { SlowLook } from "./slow-look.js";

/**
 * **Both halves of the owner's answer, in the order an eye reads them.**
 *
 * The owner settled the slot on 22 September 2026: keep the bar, and put
 * the light *around the full boss*, much more visible, stopping before
 * its body. So this is not a fourth argument about the window — it is the two
 * that won, drawn together, with the streams rebuilt on the boss's own radius.
 *
 * **The streams first, the bar over them.** The bar is the one thing here a
 * pair may have to read under pressure, and light added over a measure is a
 * measure that got harder to count. Since the bar came in under the body (22
 * September 2026, the owner: *more near the boss*) the two are drawn in the
 * same region rather than a field apart, so the order stopped being a
 * formality and became the guarantee.
 *
 * **It ends.** Four tenths of a second of fade at each end, spent inside the
 * window, so the light arrives from nothing and is gone on the beat the game
 * comes back up to speed rather than being at its loudest then (`slow-intake-aim.ts`). The
 * bar does not fade: it is a measure, and a measure that dims as it empties is
 * a measure that lies about its last beat.
 */
export const intakeWindow: SlowLook["paint"] = (ctx, l, world, view, win) => {
  // Asked once and handed to both: the streams stop at the body's skin and the
  // bar hangs under it, and two readings of where the body is would be two
  // answers on a frame mid-morph.
  const at = aim(world, l, world.beat, view.beatPhase);
  const up = ramp(win, world.cfg);
  if (up > 0) drawStreams(ctx, l, at, up, win.through);
  drawBar(ctx, l, win, at);
};
