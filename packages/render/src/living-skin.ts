import { strokeGlow } from "./glow.js";

/**
 * What a living body is *made of*, as a record rather than as three lines in
 * the middle of `drawLiving`.
 *
 * Every blob in this game — slick, bulb, throb, dart, wisp, choir, and every
 * lure wearing one of them — is filled with its own deep and then given a
 * glowing rim in its own body colour. That is the material, it is the same
 * material for all of them, and until this file it was written inline: a
 * `fillStyle`, a `fill` and a `strokeGlow` between the contour and the
 * interior details, with nowhere for a second answer to sit.
 *
 * It is lifted for `WARD_LOOK`'s reason and `METEOR_LOOK`'s. The bodies the
 * pair spends the whole game looking at had exactly one skin and no way to
 * offer another beside it at twenty-six pixels and at tempo, which is what
 * `docs/versus.md` exists to fix. **Nothing here changes what the game
 * draws**: `neon` below is the three lines it replaces, in order, with the
 * same numbers.
 *
 * The rim is *not* passed to `neon`, and that is deliberate rather than an
 * oversight: the shipped skin lights its edge in `hex` and keeps `rim` for the
 * interior marks `creature-detail.ts` draws. A candidate skin may want it, so
 * it is on `BodyPaint`; the shipped one does not use it.
 */
export interface BodyPaint {
  /** The body's three colours, already hazed for its distance. */
  readonly hex: string;
  readonly rim: string;
  readonly dark: string;
  /** Body radius in screen pixels, before the contour transform. */
  readonly r: number;
  /** The scale that transform carries, so a line width can be undone by it. */
  readonly scale: number;
  /** The contour's own half-extents, for anything placed on the surface. */
  readonly rx: number;
  readonly ry: number;
  /**
   * The rotation the transform already carries — a throb's turn, a dart's
   * lean, an own-motion's roll.
   *
   * The shipped skin has no use for it and every candidate skin with a light
   * in it does: `KEY` is a direction in the *field*, and a gradient laid out
   * in body space turns with the body, which is a light glued to a spinning
   * rock. Undo it with this. It is on the record rather than left for a
   * candidate to guess, because guessing it is the defect.
   */
  readonly rot: number;
}

export interface LivingSkin {
  paint(ctx: CanvasRenderingContext2D, path: Path2D, rule: CanvasFillRule, p: BodyPaint): void;
}

/** The shipped skin: the deep, filled flat, and a rim that glows in the body's
 * own colour. The line weight is a tenth of the body radius with a one-pixel
 * floor, divided by the scale because the contour is drawn in the
 * silhouette's units and a stroke must not grow with the body. */
function neon(
  ctx: CanvasRenderingContext2D,
  path: Path2D,
  rule: CanvasFillRule,
  p: BodyPaint,
): void {
  ctx.fillStyle = p.dark;
  ctx.fill(path, rule);
  strokeGlow(ctx, path, p.hex, Math.max(1, p.r * 0.1) / p.scale, 1);
}

/** The one record a candidate skin patches. */
export const LIVING_SKIN: LivingSkin = { paint: neon };
