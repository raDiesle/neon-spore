import { catmullRomToBezierPath, openSmoothPath, type Point } from "@neon-spore/content";
import { strokeGlow } from "./glow.js";
import { PALETTE, STROKE } from "./palette.js";
import { drawWardenCilia } from "./warden-cilia.js";
import { drawPlates, type WardenPlatesDraw } from "./warden-plates.js";
import { drawWardenEyelets } from "./warden-skin.js";
import { drawWardenUnderskin } from "./warden-veins.js";

/**
 * THE WARDEN's surface, as one thing: everything drawn on the body between
 * the fill of its material and the door over its eye.
 *
 * Four files draw it — the veins and the wet film under the skin
 * (`warden-veins.ts`), the eyelets set into it (`warden-skin.ts`), the fringe
 * outside the edge (`warden-cilia.ts`) and the armour round the rim
 * (`warden-plates.ts`) — and `warden.ts` called them one after another. That
 * order is the surface's own construction, in the order a solid is built, and
 * it is what a second answer to this body has to be free to rebuild: a look
 * that carried its eyelets round on a turning tube, or grew the material in
 * folds, could not be reached one part at a time. So the whole of it is one
 * field on `warden-look.ts`, this function is what that field ships, and a
 * candidate replaces it whole while keeping whichever of the four parts it
 * has no quarrel with.
 *
 * The two glows along the edge are in here too, between the fringe and the
 * armour, because that is where they have always been drawn: the rock's own
 * outline stands over the roots of the hairs and under the plates, and moving
 * it either side of the surface would change a pixel on the field.
 */

/**
 * Everything the surface is drawn from, on top of what the armour already
 * reads. `shape` is the body's one closed path, for a mark that must stay
 * inside the material; `outer` is the sampled contour it was drawn from, for
 * anything rooted on the edge — sampled once in `warden.ts` and handed over,
 * so a fringe never breathes a frame out of step with the skin it grows from.
 */
export interface WardenSurfaceDraw extends WardenPlatesDraw {
  readonly shape: Path2D;
  readonly outer: readonly Point[];
  /** The hole, this instant: its centre's x (its y is `cy`) and its radius. */
  readonly pupilX: number;
  readonly pupilR: number;
  /** The sampled contour of the hole, for the fallback where it could not be cut. */
  readonly pupil: readonly Point[];
  /** How far the door is open, 0..1. */
  readonly openness: number;
  /** The colour the lip of the hole says: the cycle's own, or its rim once the door moves. */
  readonly lip: string;
}

/**
 * The body's two edges: the rock's own outline, and the lip of the hole in
 * the cycle's colour. The lip is the only part of the body that carries that
 * colour — it says which ammunition the one shot needs, a whole cycle before
 * there is anything to shoot at — and it stops where the material does: there
 * is no lip across the opening, because there is nothing there for a lip to
 * be the edge of.
 */
export function drawWardenEdges(d: WardenSurfaceDraw): void {
  const { ctx, cut, outer, pupil, openness } = d;
  strokeGlow(
    ctx,
    new Path2D(cut ? openSmoothPath(cut.edge) : catmullRomToBezierPath(outer)),
    PALETTE.rock,
    STROKE.outline,
    0.7,
  );
  strokeGlow(
    ctx,
    new Path2D(cut ? openSmoothPath(cut.lip) : catmullRomToBezierPath(pupil)),
    d.lip,
    STROKE.outline,
    0.6 + openness * 0.8,
  );
}

/**
 * The shipped surface, in the order a solid is built: what is under the skin,
 * what is set into it, what stands off its edge, the edge itself, and the
 * armour over all of it. CILIATE off the shapes page — cilia most of the way
 * round and veins under the skin — with the eyelets and the film as what
 * makes it a thing looking at you rather than a specimen (`warden-skin.ts`).
 */
export function drawWardenSurface(d: WardenSurfaceDraw): void {
  const { ctx, cx, cy, r, time, openness, cut } = d;
  drawWardenUnderskin(ctx, d.shape, cx, cy, r, time, openness, cut);
  drawWardenEyelets(ctx, cx, cy, r, d.pupilX, d.pupilR, time, openness, cut);
  drawWardenCilia(ctx, d.outer, cx, cy, r, time, openness, cut);
  drawWardenEdges(d);
  drawPlates(d);
}
