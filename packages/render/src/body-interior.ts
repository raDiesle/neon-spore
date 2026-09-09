/**
 * What is *inside* a living body, as a record per kind rather than as two
 * branches in the middle of `drawDetails`.
 *
 * The slick and the bulb are on more waves than anything else in the game, and
 * until this file the whole of their interior was three dots: one for a bulb,
 * two for a slick, in the rim colour, at a fixed place. That is the least
 * detailed thing on any frame the pair spends the most time reading — and,
 * more to the point, there was nowhere a second answer to it could sit. This
 * is that seam, cut the way `meteor-look.ts`, `throb-look.ts` and
 * `living-skin.ts` were cut: a record the drawing code reaches through, so a
 * candidate may patch it and be drawn beside what ships at twenty-six pixels
 * and at tempo (`docs/versus.md`).
 *
 * **Three records rather than one**, and the third is the point. `SLICK_LOOK`
 * and `BODY_LOOK` hold the identical shipped paint, and they are separate
 * objects so that a candidate on the slick does not silently change a dart, an
 * echo, a rind and a lure along with it. `interiorFor` is the route the
 * drawing code takes, and it is what a candidate's `reached` must name.
 *
 * The material around these marks is `living-skin.ts` and is a different
 * question: that is what the body is *made of*, this is what it has *in* it.
 * Two open slots on one body are allowed to exist and are not allowed to claim
 * one field, which is why they are two files.
 */

/** Everything an interior is drawn from, in the body's own scaled frame. */
export interface Interior {
  /** The body's three colours, already hazed for its distance. */
  readonly hex: string;
  readonly rim: string;
  readonly dark: string;
  /** The contour's own half-extents. Marks are placed against these. */
  readonly rx: number;
  readonly ry: number;
  /**
   * The rotation the transform already carries. An interior with a light in
   * it undoes this, for `living-skin.ts`'s reason: `KEY` is a direction in the
   * field, and a highlight laid out in body space turns with the body, which
   * is a light glued to a spinning rock.
   */
  readonly rot: number;
  /**
   * The contour clock — the same seconds `livingPoints` wobbles on, distinct
   * per body id. Anything that moves inside a body moves on this, so two
   * screens shake the same creature the same way.
   */
  readonly t: number;
}

export interface BodyInterior {
  paint(ctx: CanvasRenderingContext2D, p: Interior): void;
}

/** Inner drawing is thinner than the outline (`docs/spec/graphics.md`). */
function twoCores(ctx: CanvasRenderingContext2D, p: Interior): void {
  ctx.fillStyle = p.rim;
  ctx.beginPath();
  ctx.arc(-p.rx * 0.12, p.ry * 0.2, p.ry * 0.07, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(p.rx * 0.12, p.ry * 0.2, p.ry * 0.07, 0, Math.PI * 2);
  ctx.fill();
}

function oneCore(ctx: CanvasRenderingContext2D, p: Interior): void {
  ctx.fillStyle = p.rim;
  ctx.beginPath();
  ctx.arc(0, p.ry * 0.3, p.ry * 0.09, 0, Math.PI * 2);
  ctx.fill();
}

/** THE SLICK's own interior — two cores, and the record a slick candidate patches. */
export const SLICK_LOOK: BodyInterior = { paint: twoCores };

/** THE BULB's own — one core. */
export const BULB_LOOK: BodyInterior = { paint: oneCore };

/**
 * Every other blob's, and identical to the slick's today.
 *
 * It exists so that it can stop being identical without anybody deciding that
 * it should: a dart, a throb, an echo, a rind and every lure wearing one of
 * them all draw two cores because nothing has ever said what else they might
 * draw, and a slot about the slick is not a place to answer that for them.
 */
export const BODY_LOOK: BodyInterior = { paint: twoCores };

/**
 * The route the drawing code takes, and the one a candidate's `reached` names.
 *
 * A lookup rather than a `Record` keyed by `CreatureKind`, because the two
 * callers that are not `living-draw.ts` have a body's *worn* shape rather than
 * its kind — a throb's far half is drawn as the blob it wears — and asking
 * this in one place is what keeps those three call sites answering alike.
 */
export function interiorFor(kind: string): BodyInterior {
  if (kind === "slick") return SLICK_LOOK;
  if (kind === "bulb") return BULB_LOOK;
  return BODY_LOOK;
}
