import { circleSubpath } from "@neon-spore/content";
import { strokeGlow } from "./glow.js";
import { PALETTE, STROKE } from "./palette.js";

/**
 * **The lens, and the shape of it.** The other half of `eye.ts` — that file
 * holds the wet parts, the film standing outside the socket and the fringe
 * standing outside that, and this one holds the aperture between them and the
 * pupil behind it. One eye still, drawn once for THE WARDEN and THE LID both;
 * the seam is only that the shape of an opening eye grew its own argument and
 * `eye.ts` had run past the length a file in this repository is allowed.
 */

/** The two colours an eye is drawn in: its own, and the brighter rim of it. */
export interface EyeInk {
  hex: string;
  rim: string;
}

/** The lens's half-width, as a share of the socket's own. */
const LENS_W = 0.95;

/**
 * How far the upper lid stands above the corners when the eye is wide — the
 * socket's own half-height, **capped against the width**, and the cap is the
 * whole of what makes this an eye rather than a bulb.
 *
 * THE LID's socket is already an almond and the first number binds there. THE
 * WARDEN's is a circle, and a lens taking nine tenths of a circle in both
 * directions is a disc with two corners stuck on it — which is what the owner
 * was looking at when he said it was too round. Capped at seven tenths of the
 * half-width, the same call inside a round hole comes out about half as tall as
 * it is wide, which is roughly what an eye is. Neither body carries a figure of
 * its own: one eye, one shape, and the socket decides which way the cap falls.
 */
const RISE_MUL = 0.9;
const RISE_CAP = 0.7;

/**
 * The lower lid's dip below the corners, as a share of the upper lid's rise.
 * Under a half, because that is the proportion on a real eye and it is what
 * says which way up the thing is before a single line is drawn inside it —
 * `lid-shape.ts` spends its own `droop` on exactly the same argument.
 */
const DIP_SHARE = 0.46;

/**
 * How far the gap's own middle rides down as the eye shuts, as a share of the
 * upper lid's rise.
 *
 * **An eye closes downwards.** The lower lid barely moves and the upper one
 * comes down to meet it, so a nearly shut eye is a low crescent rather than a
 * thin lens hanging where the wide one was centred. It is the *middle* that
 * travels, not the corner line, which is what lets a wide eye sit square in the
 * socket while a shut one sits at the foot of it — with the corners still
 * standing above the floor and below the crown, where an eye's are.
 *
 * The *height* of the gap is untouched by any of this and stays exactly linear
 * in `openness`, so the number the other seat reads off it is the same number.
 */
const DESCENT = 0.45;

/**
 * The corners' tilt off level, as a share of the upper lid's rise: the outer
 * one a little higher than the inner. Small, and it scales with the opening, so
 * a shut eye is a level line and an open one is never quite square to the
 * world. A perfectly symmetric pair of corners is the other half of why the old
 * lens read as a machined slot.
 */
const CANTHAL_TILT = 0.12;

/** The pupil's radius as a share of the lens's half-width. Big enough that the
 * lids cut it at anything under about two thirds open, which is the point of
 * it. */
const PUPIL_MUL = 0.3;

/**
 * The lens, the iris and the pupil.
 *
 * Two lids opening on one number: an aperture whose height grows from a shut
 * line to a wide almond, an iris in the eye's colour filling it, and a pupil
 * the lids cut. There are not two things to keep in step, which is what stops
 * the picture drifting from the rule.
 *
 * **Four asymmetries, and every one of them is the difference between an eye
 * and a lens.** It was two mirrored quadratics — the same curve top and bottom,
 * the same corner left and right, a crown dead centre, and the whole thing
 * hung about the middle of the socket however far shut it was. That is a shape
 * a machine cuts. What is here instead: a lower lid under half the depth of the
 * upper one; a crown standing inboard of the middle against a trough standing
 * outboard; corners tilted off level; and a corner line that **rides down as
 * the eye closes**, because an eye closes downwards. None of them costs a
 * canvas call — they are all in the four control points of two cubics.
 *
 * **The readout is untouched.** The height of the gap is `(rise + dip) *
 * openness` exactly, at every openness and whatever the corner line is doing,
 * so the seat that is not holding the cord reads the same number off it as
 * before. That is the constraint everything above had to be built inside.
 *
 * `rx` and `ry` are the socket's own half-extents rather than one radius: THE
 * WARDEN's hole is round and passes the same number twice, and THE LID's is an
 * almond half as tall as it is wide. One radius would have made the lid's lens
 * taller than the body it sits in — and the *round* one is why the rise is
 * capped against the width (`RISE_CAP`).
 *
 * `t` is the **beat clock**, not the wall clock, so the breath below is the
 * same on both phones (`content/own-motion.ts` on why a pose is sampled on
 * beats).
 */
export function drawEyeLens(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  ink: EyeInk,
  openness: number,
  t: number,
): void {
  const w = rx * LENS_W;
  const rise = Math.min(ry * RISE_MUL, w * RISE_CAP);
  const dip = rise * DIP_SHARE;
  // Where the gap's middle stands this instant, how far the two lids are off
  // the corners, and where those corners are. `up + low` is exactly
  // `(rise + dip) * openness` however far the middle has dropped, so the height
  // of the gap is still the tension and nothing else — the descent moves the
  // aperture without resizing it.
  const mid = cy + rise * DESCENT * (1 - openness);
  const up = rise * openness;
  const low = dip * openness;
  const my = mid + (up - low) / 2;
  const tilt = up * CANTHAL_TILT;
  const lens = new Path2D(
    // The upper lid, corner to corner, with its controls weighted toward the
    // left one so the crown of the arc stands inboard of the middle. Their `y`
    // offsets sum to eight thirds of the rise, which is what puts a cubic's
    // own midpoint exactly there; their `x` sit well out toward the corners,
    // which is what keeps each corner a short taper rather than a spike.
    `M ${cx - w} ${my + tilt}` +
      ` C ${cx - w * 0.62} ${my - up * 1.55} ${cx + w * 0.48} ${my - up * 1.117} ${cx + w} ${my - tilt}` +
      // And the lower lid back, weighted the other way, so its trough sits
      // outboard. The two offsets are opposite and unequal, and that pair of
      // facts is the whole of what stops this reading as a leaf on its side.
      ` C ${cx + w * 0.64} ${my + low * 1.45} ${cx - w * 0.5} ${my + low * 1.217} ${cx - w} ${my + tilt} Z`,
  );
  ctx.save();
  ctx.fillStyle = ink.hex;
  ctx.globalAlpha = 0.35 + 0.5 * openness;
  ctx.fill(lens);
  ctx.restore();

  // The pupil: **cut by the lids rather than sized to miss them**. A disc that
  // shrank to fit the gap was a disc the whole way down, and an eye half open
  // does not show a small round pupil — it shows a big one with its top and
  // bottom taken off. So it is a fixed disc under the lens's own clip, riding
  // the middle of the gap, and the slit-to-disc reading falls out of the
  // geometry instead of being a second copy of it. It breathes, so a fully
  // open eye is never a still picture.
  const pulse = 0.85 + 0.15 * Math.sin(t * Math.PI * 2);
  const pr = w * PUPIL_MUL * pulse;
  if (pr > 0 && openness > 0) {
    const pupil = new Path2D(circleSubpath(cx, mid, pr));
    ctx.save();
    ctx.clip(lens);
    ctx.globalAlpha = openness;
    ctx.fillStyle = PALETTE.background;
    ctx.fill(pupil);
    strokeGlow(ctx, pupil, ink.rim, STROKE.inner, 1.2 * openness);
    ctx.restore();
  }
  // The margins last, over the pupil they cut: the line a player reads the
  // tension off is never half-covered by what stands behind it.
  strokeGlow(ctx, lens, ink.rim, STROKE.inner, 0.8 + openness * 0.6);
}
