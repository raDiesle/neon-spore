import { crystalPath, METEOR } from "@neon-spore/content";
import { type Crater, centreY, cutY, LID } from "./crater-geom.js";
import { spallRing } from "./crater-spall.js";
import type { HullSkin } from "./hull.js";

/**
 * The hole itself: the skin taken with it, the dark of what is gone, and the
 * seam still a little hot.
 *
 * A bound and three layers, in that order, each answering a different part of
 * *what a rock did here*:
 *
 * 0. **The lid** (`lid`). How far up its own hole a pit may paint, as a flat
 *    line at the skin directly above it. Not the same rule as the one below and
 *    not a substitute for it: this keeps the buckled ring *about its own hole*,
 *    and without it the plates climb whatever slope the membrane happens to
 *    rise on either side and a small hole wears a fan twice its own width.
 * 1. **The plates** (`spallRing`, `crater-spall.ts`). A hole in a skin takes
 *    the skin with it, so the membrane around the mouth is cut and pulled in.
 * 2. **The pit** (`hole`). Fill only — no outline. A stroke here would read as
 *    the rock's own material edge, the same light grey the ship's solid rock
 *    objects are rimmed in; a hole has no rim of its own material, only the
 *    dark of what is gone.
 * 3. **The seam** (`seam`). A hairline of the tail's old colour along the cut,
 *    running the mouth's own width. It is the *rock's* heat and not the ship's,
 *    which is why it is the one thing here that is the same on both seats.
 *
 * **All three are exported, because a candidate is a whole `pit` function.**
 * `CRATER_LOOK` holds one field and a look that wanted to add a layer used to
 * have to carry its own copy of the other three — which is three copies of the
 * hole's arithmetic waiting to drift apart. A candidate calls these in the
 * order below and puts its own layer between two of them.
 *
 * **Nothing here may be drawn above the ship's surface, and nothing here is
 * what stops it.** `hull.ts` clips every crater to the hull's own filled
 * contour before calling this, which is the only place that rule can live: the
 * membrane is a curve, this is handed one point on it (`Crater.top`, the skin
 * directly over the hole), and a look measuring its own lid off that single
 * point draws material in the sky wherever the surface falls away to one side.
 * That is what it did until the owner said so on 9 September 2026. `lid` is a
 * look's own taste about reach and the hull's clip is the ship's rule about
 * where it ends; the two intersect, and only the second is not negotiable.
 */
export function pit(ctx: CanvasRenderingContext2D, c: Crater, skin: HullSkin): void {
  ctx.save();
  lid(ctx, c);
  ctx.translate(c.x, centreY(c));
  spallRing(ctx, c, skin);
  hole(ctx, c, skin);
  ctx.restore();
  seam(ctx, c);
}

/**
 * How far up its own hole a pit may paint: a flat line at the skin directly
 * above it, `LID` proud of it so the taper at the very top of the shape does
 * not leave a bright sliver.
 *
 * Screen space, before anything is rotated, so the cut stays level whichever
 * way the rock that made the hole was facing. Call it inside the `save` and
 * before the translate — `pit` does, and so must a candidate composing its own
 * layers, or its layer is the one thing on the frame that climbs the slope.
 */
export function lid(ctx: CanvasRenderingContext2D, c: Crater): void {
  ctx.beginPath();
  ctx.rect(c.x - c.r * SPREAD, cutY(c), c.r * SPREAD * 2, c.r * SPREAD * 1.43 + LID);
  ctx.clip();
}

/** How far from its own centre a hole's material may reach, in radii. Wider
 * than the buckled ring itself (1.7) so the lid never cuts a plate off at the
 * side — it is a ceiling, not a frame. */
const SPREAD = 2.38;

/**
 * The dark of what is gone, over the plates — because the inner ring of that
 * cut *is* this hole.
 *
 * Expects the caller to have translated to the hole's own centre and left the
 * rotation alone; it turns to the rock's facing itself and does not turn back,
 * so it is the last thing drawn inside that `save`.
 */
export function hole(ctx: CanvasRenderingContext2D, c: Crater, skin: HullSkin): void {
  ctx.rotate(c.rotation);
  ctx.fillStyle = skin.muzzle;
  ctx.fill(
    new Path2D(
      crystalPath(0, 0, c.r, c.r, METEOR.sides, METEOR.depth, METEOR.wobble, 0, METEOR.seed),
    ),
  );
}

/** The seam where the rock ended and the skin resumes, still a little hot.
 * Screen space: the caller has restored its own transform. */
export function seam(ctx: CanvasRenderingContext2D, c: Crater): void {
  const rim = ctx.createLinearGradient(c.left, c.top.y, c.right, c.top.y);
  rim.addColorStop(0, "rgba(255,122,47,0)");
  rim.addColorStop(0.5, "rgba(255,122,47,0.4)");
  rim.addColorStop(1, "rgba(255,122,47,0)");
  ctx.strokeStyle = rim;
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.moveTo(c.left, c.top.y);
  ctx.lineTo(c.right, c.top.y);
  ctx.stroke();
}
