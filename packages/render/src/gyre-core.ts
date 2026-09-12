import { blobPoints, surfaceDim, surfaceLit } from "@neon-spore/content";
import { rgba } from "./hex.js";
import { PALETTE } from "./palette.js";
import { splinePath } from "./spline.js";

/**
 * The surface in the middle of THE GYRE's wheel: the organelle the whole
 * mechanism is built around — here, the parts of it every answer shares. The
 * membrane's contour, the lit mass under it and the one stationary specular;
 * what is *suspended* in the mass is `gyre-orbit.ts` since 11 September 2026,
 * and the nine granules that were here before it are YOLK on the SHAPES
 * page's FILLING axis, with the two other answers the owner read beside it.
 *
 * **A wheel needs a middle.** Every other armature in this game hangs off
 * something with a body in it — the queen has a figure, the warden has an eye —
 * and a hub drawn as a ring on a stick is the one part of a wheel that looks
 * like scaffolding rather than like an animal. So the middle is a filled thing:
 * a lobed contour with fluid inside it, which is the same closed-contour-with-
 * lobes vocabulary as every creature on the field (CLAUDE.md) rather than a
 * second idiom.
 *
 * **Not a flower and not a turbine.** Both are shapes made of repeated blades,
 * and a blade points at something — six of them around a hub would be six more
 * spokes arguing with the six that are already there, and a turn would read as
 * the blades chopping rather than the wheel turning. What is here instead is one
 * skin with fluid under it: the contour breathes, the light inside swims round
 * at the rate the wheel is actually turning, and the only hard edge is the
 * nucleus at the very centre.
 *
 * **The skin turns; the light does not.** The mass inside is shaded in a frame
 * the turn has been taken out of, so the granules suspended in it cross a
 * specular that stays upper-left rather than carrying one round with them
 * (`docs/style-guide.md`, Depth).
 *
 * **It is the one part of the wheel that moves continuously.** The rim ratchets,
 * because six bodies stand on tiles (`gyre-place.ts`); nothing stands on the
 * core, so it is free to turn at the true rate — and that makes it the readout
 * for the maw. A pair who cannot tell whether the pull worked can look at the
 * middle of the wheel and see the swim slow to a crawl.
 */

/** Lobes on the skin. Four: three reads as a rounded triangle, which is a shape
 * with a direction in it, and this one must not point anywhere (see above). */
const LOBES = 4;

/** How deep those lobes cut, and how much the skin wanders on top of them. Both
 * from the living bodies' own range, so the middle of a wheel is the same kind
 * of surface as the things bolted round it. */
const LOBE_DEPTH = 0.11;
const SKIN_WOBBLE = 0.055;

/** Points on the contour. Fewer than a body's 40: it is drawn at a fraction of
 * the size and this is a per-frame path with no cache behind it. */
const SKIN_POINTS = 26;

/**
 * The organelle's own contour, about the origin and **not** turned — the caller
 * turns it, because the turn is what the surface is doing and a path carries no
 * transform.
 *
 * Exported so anything arguing about what is *inside* the membrane — the paint
 * below, and a candidate organelle in `tools/versus` — carries no second copy
 * of the four numbers that make the membrane: a lobe count re-typed elsewhere
 * is a second question smuggled into the first, and the sweep in
 * `packages/sim/test/purity.test.ts` says so.
 */
export function gyreSkinPath(r: number, time: number): Path2D {
  return splinePath(
    blobPoints(0, 0, r, r, LOBES, LOBE_DEPTH, SKIN_WOBBLE, time, 17, SKIN_POINTS),
    true,
  );
}

/** How much of the membrane the mass inside fills, as a fraction of the
 * organelle's radius, so the whole thing scales as one object. The **contour
 * is not here at all**: `gyreSkinPath` is called above. */
const YOLK = 0.9;

/** How many stops the membrane's rim is walked in. Nine, for
 * `docs/style-guide.md`'s reason: three make a ramp and a ramp reads as a
 * gradient. */
const STOPS = 9;

/**
 * The mass inside the membrane: a value ramp across the ball read off
 * `surfaceLit` at the longitude the surface is pointing in, rather than a
 * radial gradient with a bright spot in it. A cosine with a terminator is what
 * makes a ball read as a ball; a radial disc reads as a lamp seen head-on from
 * any angle.
 *
 * Drawn about the origin in a frame the turn has been taken out of, and
 * exported for the same reason `gyreSkinPath` is: a candidate organelle in
 * `tools/versus` that argues about what is *suspended* in the fluid should
 * not carry a second copy of how the fluid is lit.
 */
export function gyreMass(
  ctx: CanvasRenderingContext2D,
  r: number,
  tint: string,
  pull: number,
): void {
  const mass = ctx.createLinearGradient(-r, -r * 0.6, r, r * 0.6);
  for (let i = 0; i < STOPS; i++) {
    const u = i / (STOPS - 1);
    const lon = -1.2 + 2.4 * u;
    const k = surfaceDim(0.12, surfaceLit(1, 0, Math.sin(lon), Math.cos(lon)));
    mass.addColorStop(u, rgba(tint, (0.2 + 0.8 * k) * (0.9 + 0.1 * pull)));
  }
  ctx.fillStyle = mass;
  ctx.beginPath();
  ctx.arc(0, 0, r * YOLK, 0, Math.PI * 2);
  ctx.fill();
}

/** The one specular, upper left and stationary. It is the half of the pair
 * that no amount of turning supplies and the half without which all that
 * turning is a coin: `KEY` is a constant and never a parameter. Exported
 * beside `gyreMass`, and for its reason. */
export function gyreSpecular(ctx: CanvasRenderingContext2D, r: number): void {
  ctx.beginPath();
  ctx.ellipse(-r * 0.34, -r * 0.34, r * 0.24, r * 0.17, -0.79, 0, Math.PI * 2);
  ctx.fillStyle = rgba(PALETTE.text, 0.22);
  ctx.fill();
}
