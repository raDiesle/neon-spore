/**
 * THE CANOPY'S GEOMETRY: the one shape a chute hangs under, and the two
 * lengths that put it where it is.
 *
 * A file of its own rather than the bottom of `chute.ts`, and the reason is a
 * cycle rather than a line count. Three files want this shape — `chute-look.ts`
 * paints it, `chute.ts` draws through that record, and `chute-cut.ts` cuts it
 * loose and flies it away empty — and with the geometry sitting beside the call
 * site the record and the call site would have to import each other. Geometry
 * with no `ctx` in it has no reason to be on either side of that.
 *
 * The pair must recognise a cut canopy as the one they have been watching, and
 * one shape drawn in three places is the only way that stays true.
 */

/** How far the canopy's crown stands above the body, in body radii. Exported
 * for the moment it is cut off one (`chute-cut.ts`): a canopy that let go from
 * anywhere but where it was hanging is a second canopy. */
export const CANOPY_LIFT = 1.9;
/** How wide the canopy is, in body radii. Wider than the body it carries by
 * half again: narrower and it reads as a hat, wider and it reaches into the
 * lane next door and argues with the column the pair have just agreed on. */
export const CANOPY_HALF = 1.5;
/**
 * The dome itself, as a path about the body it hangs from — the crown
 * `CANOPY_LIFT` above the origin and the hem `CANOPY_HALF` either side of it.
 *
 * A path rather than a run of `ctx` calls because it is drawn away from here:
 * in `chute-look.ts`, over a body still coming down, and in `chute-cut.ts`,
 * climbing away from one that has been shot out from under it. The pair must
 * recognise the second as the first with nothing underneath it, and one shape
 * drawn twice is the only way that stays true.
 *
 * `belly` is how far the crown is bellied up on this frame: 1 at rest, and the
 * canopy's own slow breath either side of it.
 */
export function canopyPath(r: number, belly: number): Path2D {
  const lift = -r * CANOPY_LIFT;
  const half = r * CANOPY_HALF;
  const p = new Path2D();
  // A single curve from one lip to the other, bellied upward. Not a
  // semicircle — a canopy under load is flatter at the crown than at the
  // edges, and the difference is what stops it reading as a ball sitting on
  // top of the body.
  p.moveTo(-half, lift);
  p.bezierCurveTo(
    -half * 0.9,
    lift - r * 1.5 * belly,
    half * 0.9,
    lift - r * 1.5 * belly,
    half,
    lift,
  );
  // Back along the underside, so the shape closes as a shell rather than as a
  // lens: the hem hangs a little below the lips it is stretched between.
  p.quadraticCurveTo(0, lift + r * 0.42, -half, lift);
  p.closePath();
  return p;
}
