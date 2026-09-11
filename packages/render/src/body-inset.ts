/**
 * **What is inside a body stays inside it, clear of the edge.**
 *
 * An interior is laid out against the contour's half-extents (`Interior.rx`,
 * `ry`) and nothing else, and that was enough while every body was the slick
 * or the bulb its interior was drawn for. It stopped being enough the day a
 * rind put on BURR (`rind-burr.ts`): the bloom is still the slick's, placed
 * for a long two-sac body, and the knobbed body under it is nearly round, so
 * between two knobs the veins stood out past the rim. The owner's rule, 11
 * September 2026: *it must always stay inside and not touch or go further
 * than the borders.*
 *
 * So the interior is clipped, and not to the contour but to the contour drawn
 * a sixth smaller about its own centre — inside the neon edge, whose line is
 * a tenth of the radius wide and sits astride the path, with a clear gap.
 * A shrink about the centre rather than a true offset, because the path is
 * already about the origin in contour units and a scale is one call; on a
 * body this size the two are the same picture. Done for every living body
 * and not for the one that showed it, so the next borrowed interior on the
 * next borrowed body cannot open the question again.
 */
const INSET = 0.84;

/** Opens the clip; the caller's `restore` closes it. */
export function clipInside(
  ctx: CanvasRenderingContext2D,
  path: Path2D,
  rule: CanvasFillRule,
): void {
  ctx.scale(INSET, INSET);
  ctx.clip(path, rule);
  ctx.scale(1 / INSET, 1 / INSET);
}
