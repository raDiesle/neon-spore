import type { Point } from "./shapes.js";

/**
 * THE MAGNET's contour, as numbers rather than as drawing.
 *
 * It is here for `lid-shape.ts`'s reason exactly: a horseshoe is not a blob,
 * and `blobRadiusMul` samples one radius all the way round, so no entry in
 * `LIVING_LOOK` can describe a body with a hole through the middle of it and
 * two arms hanging off the bottom. What render does with these numbers is
 * `packages/render/src/magnet.ts`; what they *are* is here, in `content`,
 * beside every other shape the game is made of — so the shape sheet and the
 * director can draw one without importing the renderer.
 *
 * **Every length is in body radii** and every angle in turns, the way a part's
 * frame is (`docs/parts.md`): one unit is the radius `creatureRadius` hands
 * the draw, so the whole body scales with the row it is on and with the tile
 * the phone happens to have. Nothing here is a pixel.
 */
export interface MagnetShape {
  /** The outside of the arch. One radius, which is what makes it the unit. */
  outer: number;
  /** The inside — the hollow the staff hangs down through. */
  inner: number;
  /**
   * Half the opening at the bottom, in turns measured from straight down. The
   * poles stand at exactly this bearing either side, so it is the one number
   * that decides both how wide the horseshoe reads and where the two colours
   * are.
   */
  gapTurn: number;
  /**
   * How much of each arm, in turns, is the coloured pole rather than the
   * body's own dark. Short: a pole is a *tip*, and an arm coloured half way up
   * would read as two creatures of two colours joined at the top rather than
   * as one body with two ends.
   */
  poleTurn: number;
  /** Half-width of the plate slung underneath. Wider than the poles stand, or
   * a shot up the column would pass the edge of it and the picture would be
   * promising something the rule does not do (`sim/magnet.ts`). */
  plateHalf: number;
  /** Half the plate's thickness. */
  plateThick: number;
  /** Half-width of the staff it hangs on. Thick enough to read as part of the
   * body rather than as a wire drawn between two separate things. */
  staffHalf: number;
  /** How far below the centre the middle of the plate sits — past the poles,
   * which is what puts it in the way of anything climbing the column. */
  plateDrop: number;
}

/**
 * The shipped horseshoe.
 *
 * `gapTurn` 0.1 is 36° either side of straight down, which stands the poles
 * 0.59 of a radius apart and leaves an opening the plate can plainly be seen
 * *through* — the whole of what the pair has to read off this body is that
 * there is a way in from the side and none from below.
 *
 * `plateHalf` is wider than the poles stand and `plateDrop` puts it a fifth of
 * a radius below their tips, so the two are never confused for one shape. A
 * plate level with the poles read as a foot the body was standing on.
 */
export const MAGNET_SHAPE: MagnetShape = {
  outer: 1,
  inner: 0.46,
  gapTurn: 0.1,
  poleTurn: 0.085,
  plateHalf: 0.92,
  plateThick: 0.13,
  staffHalf: 0.14,
  plateDrop: 1.06,
};

/**
 * The whole body as one closed loop of points, walked from the right pole's
 * outer corner over the top and back down the inside.
 *
 * **One loop and not four**, because the sheet that judges silhouettes judges
 * one contour at a time (`tools/shape-sheet/src/subjects.ts`), and the thing
 * that has to read at twenty-six pixels is this body *including* its plate: an
 * arch on its own is a horseshoe, and the whole point of the creature is the
 * flat thing hanging under it. The pieces `render/magnet.ts` paints separately
 * — the arch, the two poles, the staff and plate — are separate there because
 * they carry different paint and because they come apart in different
 * directions when the body dies, not because the shape is.
 *
 * The staff hangs into the hollow between the arms and the plate sits below
 * their tips, so the walk never crosses itself. That is a constraint on the
 * figures rather than on this function: `plateDrop - plateThick` has to stay
 * below `outer * cos(gapTurn * 2π)`, and `MAGNET_SHAPE` keeps it there.
 */
export function magnetOutline(r: number, s: MagnetShape = MAGNET_SHAPE, steps = 30): Point[] {
  const turn = Math.PI * 2;
  const down = Math.PI / 2;
  const g = s.gapTurn * turn;
  const pts: Point[] = [];
  const at = (a: number, rad: number): void => {
    pts.push({ x: Math.cos(a) * r * rad, y: Math.sin(a) * r * rad });
  };
  // Where the staff's two edges meet the inside of the arch, as bearings.
  // `acos` answers in the lower half and the crown is in the upper one, so
  // both come back through a whole turn.
  const left = turn - Math.acos(-s.staffHalf / s.inner);
  const right = turn - Math.acos(s.staffHalf / s.inner);

  // Over the top on the outside, right pole to left pole.
  for (let i = 0; i <= steps; i++) at(down - g - ((turn - 2 * g) * i) / steps, s.outer);
  // Back up the inside of the left arm, as far as the staff.
  const half = Math.max(2, Math.round(steps / 2));
  for (let i = 0; i <= half; i++) at(down + g + ((left - down - g) * i) / half, s.inner);
  // Down the staff, round the plate, and back up the other side. The arc above
  // ended on the staff's own left edge, so the first point here is the drop.
  const hi = r * (s.plateDrop - s.plateThick);
  const lo = r * (s.plateDrop + s.plateThick);
  const wide = r * s.plateHalf;
  const stalk = r * s.staffHalf;
  pts.push({ x: -stalk, y: hi }, { x: -wide, y: hi }, { x: -wide, y: lo });
  pts.push({ x: wide, y: lo }, { x: wide, y: hi }, { x: stalk, y: hi });
  // And down the inside of the right arm to the pole it started at.
  for (let i = 0; i <= half; i++) at(right + ((down - g + turn - right) * i) / half, s.inner);
  return pts;
}
