import { rgba } from "../../../../../packages/render/src/hex.js";
import { PALETTE } from "../../../../../packages/render/src/palette.js";
import type { SlowLook } from "../../../../../packages/render/src/slow-look.js";
import { aim, ramp } from "./aim.js";

/**
 * **Nothing moves. The light simply changes.** The smallest thing that can be
 * drawn and still be an answer to this slot.
 *
 * Two gradients, and that is the whole file: the screen's corners sink a fifth
 * to a third, and one wide volumetric clearing stands over the thing the pair
 * are answering — a little brighter there, a little emptier everywhere else.
 * Both are borderless and neither has a moving part, so on a phone at arm's
 * length what a window looks like is the screen *taking a breath*, with no
 * object in it that was not there before.
 *
 * **It is `gather` with the motes taken out**, and that is its whole argument.
 * The owner's brief asks first for high readability and for the effect to be
 * understated and non-intrusive, and every particle on the field is one more
 * thing between the pair and a mark they have two beats to answer together. If
 * the corners sinking and the target lifting is enough on its own, then motes
 * are ink spent against the brief's first line, and this is the candidate that
 * says so. It also costs two gradients a frame against `gather`'s twenty.
 *
 * **The clearing is not a hole and not a spotlight.** It is a lift — light
 * added over the target and a veil laid everywhere else, both easing out over
 * several tile widths, so there is never an edge anywhere for the eye to catch
 * and call a shape. `focus` draws the loud version of this idea: seventy-two
 * per cent dark with a lit aperture ring round each anchor. This is the same
 * geometry at a fifth of the weight and with nothing drawn as a line.
 *
 * **It ends.** Four tenths of a second of fade at each end, spent inside the
 * window, so it arrives from nothing and leaves to nothing rather than being
 * at its loudest on the frame before the shut (`aim.ts`).
 *
 * **How it can lose.** It may simply not be seen. The game's answer today is
 * nothing at all, and a picture nobody notices is not a smaller version of the
 * answer — it is the question still open, which is exactly `wash`'s risk and
 * the reason `wash` needed shooting to settle. A fifth of a stop at the corners
 * of a field that is already near black is very little, and the lift over the
 * target has to compete with a boss whose own rim glows.
 */

/** The vignette at the corners on the beat the window opens and on the beat it
 * shuts — the owner's fifth to a third, 22 September 2026. */
const VIGNETTE_OPEN = 0.2;
const VIGNETTE_SHUT = 0.3;

/** Where the vignette starts to bite, as a share of the run to the far corner.
 * Well past the middle: a vignette that begins at the centre is a spotlight. */
const VIGNETTE_ONSET = 0.44;

/** How wide the clearing stands at the open and at the shut, in target radii.
 * It closes, but nowhere near as far as `focus` closes its apertures — this is
 * a breath being held, not an iris. */
const CLEAR_WIDE = 7;
const CLEAR_TIGHT = 5;

/** The light added at the middle of the clearing, at the open and at the shut. */
const LIFT_OPEN = 0.08;
const LIFT_SHUT = 0.17;

export const hushedField: SlowLook["paint"] = (ctx, l, world, view, win) => {
  const up = ramp(win, world.cfg);
  if (up <= 0) return;
  const t = win.through;
  const at = aim(world, l, view.beatPhase);
  const top = l.gridTop;
  // To the hull and no further: below it is the ship's own tissue, drawn over
  // this pass, and a vignette has nothing to say about a hand (`slow-look.ts`).
  const floor = l.hullY;
  if (floor <= top) return;

  ctx.save();
  ctx.beginPath();
  ctx.rect(0, top, l.width, floor - top);
  ctx.clip();

  // The corners sink. Centred on the play area rather than on the target, so
  // that a step of marks low on the field does not tip the whole screen.
  const cx = l.width / 2;
  const cy = (top + floor) / 2;
  const far = Math.hypot(l.width / 2, (floor - top) / 2);
  const dark = (VIGNETTE_OPEN + (VIGNETTE_SHUT - VIGNETTE_OPEN) * t) * up;
  const edge = ctx.createRadialGradient(cx, cy, far * VIGNETTE_ONSET, cx, cy, far);
  edge.addColorStop(0, rgba(PALETTE.background, 0));
  edge.addColorStop(1, rgba(PALETTE.background, dark));
  ctx.fillStyle = edge;
  ctx.fillRect(0, top, l.width, floor - top);

  // And the clearing over what is being answered. Light rather than a hole:
  // `focus` cut one and the first shot of it read as three dark discs on a
  // brightening field, because a hole in a veil over a boss's black mouth
  // looks like the mouth.
  ctx.globalCompositeOperation = "lighter";
  const clear = at.r * (CLEAR_WIDE + (CLEAR_TIGHT - CLEAR_WIDE) * t);
  const lift = (LIFT_OPEN + (LIFT_SHUT - LIFT_OPEN) * t) * up;
  const halo = ctx.createRadialGradient(at.x, at.y, 0, at.x, at.y, clear);
  halo.addColorStop(0, rgba(PALETTE.hullRim, lift));
  halo.addColorStop(0.3, rgba(PALETTE.hull, lift * 0.55));
  halo.addColorStop(1, rgba(PALETTE.hull, 0));
  ctx.fillStyle = halo;
  ctx.fillRect(at.x - clear, at.y - clear, clear * 2, clear * 2);
  ctx.restore();
};
