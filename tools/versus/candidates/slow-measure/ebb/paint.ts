import { aim, ramp } from "../../../../../packages/render/src/slow-intake-aim.js";
import { drawStreams } from "../../../../../packages/render/src/slow-intake-streams.js";
import type { SlowLook } from "../../../../../packages/render/src/slow-look.js";

/** The shortest window the light counts down, in beats — the shipped fuse's
 * figure, so both sides of the pair agree on which windows are asking. */
const MIN_BEATS = 5;

/**
 * **EBB — the light is the clock.** No new element: the streams round the
 * boss come in at full strength and thin as the window runs out, and are gone
 * on the beat the step fails. Nothing to find, because it is the thing the
 * pair are already looking at.
 *
 * How it can lose: a thinning is read as *less*, never as *how much less*.
 * The fuse can be read as a length; this can only be felt.
 */
export const ebbWindow: SlowLook["paint"] = (ctx, l, world, view, win) => {
  const at = aim(world, l, world.beat, view.beatPhase);
  const rest = win.beats >= MIN_BEATS && win.beats > 0 ? win.left / win.beats : 1;
  const up = ramp(win, world.cfg) * rest;
  if (up > 0) drawStreams(ctx, l, at, up, win.through);
};
