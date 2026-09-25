import { strokeGlow } from "../../../../../packages/render/src/glow.js";
import { PALETTE, STROKE } from "../../../../../packages/render/src/palette.js";
import { aim, ramp } from "../../../../../packages/render/src/slow-intake-aim.js";
import { drawStreams } from "../../../../../packages/render/src/slow-intake-streams.js";
import type { SlowLook } from "../../../../../packages/render/src/slow-look.js";

/** The shortest window the ring is drawn on, in beats — the shipped fuse's. */
const MIN_BEATS = 5;

/** How far out the ring opens, and where it closes, in body radii. It closes
 * a little clear of the skin, where the streams stop. */
const FAR = 3.2;
const NEAR = 1.15;

/** Half the gap the ring leaves round the body's own axis, in radians, so it
 * never crosses the chain a hanging body is strung from. */
const GAP = 0.45;

/** Beats left at which it turns red — the shipped fuse's figure. */
const URGENT = 2;

/**
 * **HALO — one ring round the whole boss, closing onto its skin.** THE
 * INSTAR's mark rings close on each mark; this is the same promise made once,
 * boss-sized, so a pair reads *how long* off the body they are both already
 * watching. It opens a clear gap where the body hangs from, so it never lies
 * across the chain, and turns red for the last two beats.
 *
 * How it can lose: it is drawn round the thing both players are looking at,
 * and a ring round a boss that is already ringed with marks is one more
 * circle among circles.
 */
export const haloWindow: SlowLook["paint"] = (ctx, l, world, view, win) => {
  const at = aim(world, l, world.beat, view.beatPhase);
  const up = ramp(win, world.cfg);
  if (up > 0) drawStreams(ctx, l, at, up, win.through);
  if (win.beats < MIN_BEATS || win.left <= 0) return;

  const rest = win.left / win.beats;
  const r = at.r * (NEAR + (FAR - NEAR) * rest);
  // The axis runs from the body out to where it hangs from; the gap faces it.
  const axis = Math.atan2(at.ay - at.y, at.ax - at.x);
  const hangs = Math.hypot(at.ay - at.y, at.ax - at.x) > at.r * 0.05;
  const path = new Path2D();
  if (hangs) path.arc(at.x, at.y, r, axis + GAP, axis - GAP + Math.PI * 2);
  else path.arc(at.x, at.y, r, 0, Math.PI * 2);
  const urgent = win.left <= URGENT;
  ctx.save();
  strokeGlow(ctx, path, urgent ? PALETTE.red : PALETTE.hullRim, STROKE.outline * 1.4, 0.9);
  ctx.restore();
};
