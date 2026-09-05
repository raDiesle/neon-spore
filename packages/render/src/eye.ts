import type { EyeInk } from "./eye-lens.js";
import { rimBox, rimPoint } from "./eye-rim.js";
import { halo, strokeGlow } from "./glow.js";
import { PALETTE, STROKE } from "./palette.js";

/**
 * **An eye, drawn once.** THE WARDEN has had one behind its hatch since it was
 * built; THE LID is an eye all the way through. The owner asked for the two to
 * be the same picture — the warden's animating lens on the lid, and the fluid
 * around the warden's on both — so it is one file, and neither body carries a
 * second copy of what an eye looks like.
 *
 * Four parts, in the order they are drawn and in the order they read:
 *
 *  1. **the fluid** — a pool of neon green standing outside the socket and
 *     wobbling on its own clock, so the thing looks wet rather than machined
 *     (and deliberately not the eye's own colour — `PALETTE.eyeFluid`);
 *  2. **the lens** — an almond gap that grows from a shut line low in the
 *     socket to a wide eye, with an iris filling it and a pupil the lids cut
 *     from a slit into a disc;
 *  3. **the pupil's breath** — the one thing here on a clock rather than on the
 *     pull, so a fully open eye is never a still picture;
 *  4. **the fringe** — lashes standing off the top rim and cilia combing the
 *     bottom one, which is the pair of details that stop a lens reading as a
 *     porthole.
 *
 * **Everything but the breath is `openness`**, and `openness` arrives already
 * correct and is never eased. How far an eye stands open is the only thing the
 * seat that is *not* holding the cord has to go on, so a picture that lagged
 * the rule would lie at exactly the moment somebody is deciding to fire
 * (`sim/lid.ts`, `sim/warden.ts`).
 *
 * **What it costs, because the owner asked.** One eye is three `Path2D`s, one
 * cached sprite blit, one clip and four `strokeGlow`s — about twenty canvas
 * calls, flat, whatever the openness. Every loop below has a fixed point count, the fringe
 * is one path rather than one path per hair, and there is no gradient anywhere:
 * `createRadialGradient` is a canvas call with an allocation behind it and the
 * wash it was buying is a `halo` sprite that is cached by colour and radius
 * (`glow.ts`).
 */

/** The lens is next door, and both bodies still reach it through this file:
 * one import, one eye (`eye-lens.ts`). */
export { drawEyeLens, type EyeInk } from "./eye-lens.js";

/**
 * Points around the fluid's contour. Sixteen is where a wobbling rim stops
 * reading as a polygon at the couple of dozen pixels a body draws at, and every
 * one of them is a `lineTo` on a path built once a frame.
 *
 * **Even, so that two of them land on the corners.** The contour is an almond
 * and `s = 0` and `s = 0.5` are its two points; an odd count would walk past
 * both and round the shape off, which is exactly the thing this stopped being.
 */
const FLUID_POINTS = 16;

/**
 * How far outside the socket the fluid stands, as a multiple of it.
 * **1.45, and it was 1.18**: at 1.18 it read as a rim on the socket rather than
 * as something the eye sits in. The fringe is rooted just outside it
 * (`ROOT_MUL`) and moves out with it, so the lashes still begin where it ends.
 */
const FLUID_MUL = 1.45;

/**
 * Where a hair is rooted, as a multiple of the socket's radius — **outside the
 * film, not on the socket**, and that is the one number in this file that was
 * got wrong first time. Rooted at the rim, a lash starts under the wet edge and
 * crosses it on the way out, so at the couple of dozen pixels a body draws at
 * the fringe read as scratches *over* the lens rather than as hair growing off
 * it. Rooted just past the film, every hair begins where the eye ends and only
 * ever travels away from it.
 */
const ROOT_MUL = FLUID_MUL + 0.04;

/** Lashes on the upper rim. Seven: enough to read as a fringe, few enough that
 * they are still separate things when the body is small and far up the field. */
const LASHES = 7;

/** Cilia along the lower rim. More and finer than the lashes, because that is
 * what the two are on a real eye — the top lid carries a few long ones and the
 * bottom a comb of short ones, and it is the *difference* between them that
 * says which way up the thing is without a single other line. */
const CILIA = 13;

/**
 * The wet film around the eye: one closed contour outside the socket, filled
 * faintly in the eye's own colour and rimmed in the brighter one, with a soft
 * wash behind it.
 *
 * **It wobbles on the wall clock and on nothing else.** Everything that follows
 * from the pull is drawn from `openness`, and this is deliberately not — a film
 * that thickened as the eye opened would be a second, slower copy of the one
 * readout the other player is reading, and two copies of a quantity that
 * disagree by a frame is worse than one. What `openness` does buy it is
 * brightness, which nobody reads a number off.
 *
 * **It is an almond and not a ring**, and that is the second thing the owner
 * asked for. `rx`/`ry` are the socket's own half-extents and this used to sample
 * one radius round them, so THE WARDEN — whose hole is a circle — was a green
 * disc with an eye painted on it however pointed the lens inside had become.
 * `rimBox` puts the film on the same shape as the lens, capped against the
 * width the same way, so a round hole now pools an eye and THE LID's film still
 * hugs its two corners. It takes no `EyeInk`, and that absence is the decision:
 * this is the one part of an eye that is not the eye's colour.
 */
export function drawEyeFluid(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  openness: number,
  t: number,
): void {
  const box = rimBox(rx, ry, FLUID_MUL);
  const film = new Path2D();
  for (let i = 0; i <= FLUID_POINTS; i++) {
    const s = i / FLUID_POINTS;
    const a = s * Math.PI * 2;
    // Two frequencies that do not share a period, so the film never settles
    // into a shape somebody could learn — the same argument `TREMBLE` makes
    // about a body that must not read as mechanical. Whole multiples of the
    // way round, or the wobble would not close where it started.
    const m = 1 + 0.045 * Math.sin(a * 3 + t * 1.7) + 0.03 * Math.sin(a * 5 - t * 1.1);
    const p = rimPoint(box, s % 1);
    const x = cx + p.x * m;
    const y = cy + p.y * m;
    if (i === 0) film.moveTo(x, y);
    else film.lineTo(x, y);
  }
  film.closePath();

  ctx.save();
  // **Neon green, and not the eye's own colour**, which is what the owner asked
  // for and what `PALETTE.eyeFluid` argues at length: the lens, the iris and the
  // lit seam between the plates all still say which trigger to load, so this
  // surface is spent on saying *alive* instead of saying it a fourth time.
  ctx.fillStyle = PALETTE.eyeFluid;
  // Bright enough to be a *pool* rather than a tint: the area carries "bigger"
  // and the alpha carries "neon", so both went up. Keeping the old opacity on
  // the larger area produced a greenish smudge instead of a colour.
  ctx.globalAlpha = 0.18 + openness * 0.22;
  ctx.fill(film);
  ctx.restore();
  strokeGlow(ctx, film, PALETTE.eyeFluidRim, STROKE.inner * 1.3, 0.9 + openness * 0.9);
  // The wash behind it. A cached sprite rather than a gradient built per frame
  // — `halo` keys its cache on the colour and a rounded radius, and both are
  // drawn from a small fixed set here (`glow.ts`).
  halo(ctx, cx, cy, Math.max(rx, ry) * 2.3, PALETTE.eyeFluid, 0.14 + openness * 0.16);
}

/**
 * Lashes above, cilia below — and they are **two paths and two glows, not
 * twenty**. Every hair on the top rim goes into one `Path2D` and every hair on
 * the bottom into another, so the cost of the fringe is fixed no matter how
 * many hairs there are; the only reason it is two rather than one is that they
 * are stroked at different weights, which is the whole of what tells them
 * apart.
 *
 * The lashes are long, few, and sweep outward from the top; the cilia are
 * short, many, and comb down off the bottom. Both flick on the wall clock, at
 * frequencies that do not share a period with each other or with the beat — a
 * fringe that pulsed on the beat would be a second clock beside the one the
 * pair is already counting.
 */
export function drawEyeFringe(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  ink: EyeInk,
  openness: number,
  t: number,
): void {
  const box = rimBox(rx, ry, ROOT_MUL);
  const lashes = new Path2D();
  for (let i = 0; i < LASHES; i++) {
    // Along the **upper** half of the rim, corner to corner, and out along its
    // normal — so a lash always leaves the body rather than crossing it, and
    // the fringe follows the same almond the film pools in rather than a ring
    // that would put hairs where an eye has none.
    const p = rimPoint(box, ((i + 0.5) / LASHES) * 0.5);
    // Long, short, long: an even fringe reads as a gear, and this one has to
    // read as hair.
    const len = ry * (i % 2 === 0 ? 0.62 : 0.42) * (1 + openness * 0.25);
    const flick = Math.sin(t * 1.6 + i * 2.1) * 0.22;
    lashes.moveTo(cx + p.x, cy + p.y);
    lashes.lineTo(cx + p.x + p.nx * len + flick * len, cy + p.y + p.ny * len);
  }
  strokeGlow(ctx, lashes, ink.rim, STROKE.inner * 1.2, 0.5 + openness * 0.7);

  const cilia = new Path2D();
  for (let i = 0; i < CILIA; i++) {
    const p = rimPoint(box, 0.5 + ((i + 0.5) / CILIA) * 0.5);
    // A third of a lash, and every one the same length: a comb rather than a
    // fringe, which is what the lower lid of a real eye actually looks like.
    const len = ry * 0.2 * (1 + openness * 0.15);
    const flick = Math.sin(t * 2.3 + i * 1.3) * 0.12;
    cilia.moveTo(cx + p.x, cy + p.y);
    cilia.lineTo(cx + p.x + p.nx * len + flick * len, cy + p.y + p.ny * len);
  }
  strokeGlow(ctx, cilia, ink.hex, STROKE.inner * 0.6, 0.35 + openness * 0.4);
}
